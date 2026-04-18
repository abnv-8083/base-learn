const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
// Load env vars
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB
connectDB();

const app = express();

// Trust reverse proxy (required for express-rate-limit behind a proxy/load balancer)
app.set('trust proxy', 1);

// Middleware
// 1. Security Headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin (port) video loading
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "res.cloudinary.com", "*.google.com", "*.gstatic.com", "http://localhost:6000", "http://127.0.0.1:6000", process.env.BACKEND_URL],
      "media-src": ["'self'", "http://localhost:6000", "http://127.0.0.1:6000", "res.cloudinary.com", process.env.BACKEND_URL],
      "connect-src": ["'self'", "http://localhost:6000", "http://127.0.0.1:6000", "res.cloudinary.com", "*.googleapis.com", process.env.BACKEND_URL],
      "frame-src": ["'self'", "blob:", "data:", "docs.google.com", "res.cloudinary.com", "http://localhost:6000", "http://127.0.0.1:6000", process.env.BACKEND_URL],
      "object-src": ["'self'", "blob:", "data:", "docs.google.com", "res.cloudinary.com", "http://localhost:6000", "http://127.0.0.1:6000", process.env.BACKEND_URL]
    },
  },
}));

// 2. Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 3. Rate Limiting (5000 requests per 15 minutes for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  limit: 5000, // Increased limit from 100 to stop 429 lockouts in dev
  message: 'Too many requests from this IP, please try again in 15 minutes'
});
app.use('/api', limiter);

// 4. CORS
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'https://baselearn.in',
    'https://baselearn.in',
    'https://api.baselearn.in',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true
}));

// 5. Body Parsing
app.use(express.json());

// 6. Data Sanitization against NoSQL query injection
// app.use(mongoSanitize()); // Incompatible with Express 5 req.query getter

// 7. Prevent HTTP Parameter Pollution
// app.use(hpp()); // Incompatible with Express 5 req.query getter

// 8. Cookie Parsing
app.use(cookieParser());

// Serve uploaded files - Unified and absolute path resolution
const uploadsPath = path.resolve(__dirname, 'public', 'uploads');
app.use('/uploads', express.static(uploadsPath, {
    maxAge: '1d',
    etag: true,
    index: false
}));
console.log(`[STORAGE] Serving uploads from: ${uploadsPath}`);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));

// ── Public routes (no auth) ──────────────────────────────────
const asyncHandler    = require('express-async-handler');
const AdmissionEnquiry = require('./models/AdmissionEnquiry');
const SystemSettings   = require('./models/SystemSettings');
const { sendWhatsAppMessage } = require('./utils/whatsappService');
const sendEmail = require('./utils/sendEmail');

// Landing page enquiry — MUST be registered before the student router
app.post('/api/student/public-enquiry', asyncHandler(async (req, res) => {
  const { name, phone, email, grade, message } = req.body;
  if (!name || !phone || !grade) return res.status(400).json({ success: false, message: 'Name, phone, and grade are required.' });

  await AdmissionEnquiry.create({
    name,
    phone,
    email: email || 'enquiry@landing.form',
    studentClass: grade,
    message: message || '',
  });

  // Best-effort notification (fire-and-forget)
  try {
    const settings = await SystemSettings.getSettings();
    const text = `*New Admission Enquiry*\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Email:* ${email || 'N/A'}\n*Grade:* ${grade}\n*Message:* ${message || 'N/A'}`;
    if (['whatsapp','both'].includes(settings.notificationPreference) && settings.admissionContactWhatsApp) {
      sendWhatsAppMessage(settings.admissionContactWhatsApp, text).catch(e => console.error('[WA]', e.message));
    }
    if (['email','both'].includes(settings.notificationPreference) && settings.admissionContactEmail) {
      sendEmail({ email: settings.admissionContactEmail, subject: `New Admission Enquiry from ${name}`, html: `<p><strong>Name:</strong> ${name}</p><p><strong>Phone:</strong> ${phone}</p><p><strong>Email:</strong> ${email||'N/A'}</p><p><strong>Grade:</strong> ${grade}</p><p><strong>Message:</strong> ${message||'N/A'}</p>` }).catch(e => console.error('[Email]', e.message));
    }
  } catch(e) { console.error('[Enquiry notify]', e.message); }

  res.status(201).json({ success: true, message: 'Enquiry submitted successfully!' });
}));

// Debug Route for Email Issues
app.get('/api/debug-smtp', asyncHandler(async (req, res) => {
    try {
        const testEmail = req.query.email || process.env.FROM_EMAIL || 'test@example.com';
        const result = await sendEmail({
            email: testEmail,
            subject: 'Render Deployment Email Test',
            html: '<p>If you see this, Resend is working correctly on your deployment.</p>'
        });
        res.json({ success: true, message: 'Email passed to Brevo successfully.', data: result, apiKeyPrefix: process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.substring(0, 5) + '...' : 'MISSING' });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, stack: e.stack });
    }
}));

// ── Media Proxy: Stream external files through backend ──────────────────────
// This bypasses "Tracking Prevention" in InPrivate modes and Cloudinary/S3 rate limits.
// GET /api/media/stream?key=... OR GET /api/media/stream?url=...
app.get('/api/media/stream', asyncHandler(async (req, res) => {
    try {
        let externalUrl = req.query.url;
        const key = req.query.key;

        // If a key is provided, construct the S3 URL
        if (key && !externalUrl) {
            const { getPresignedUrl } = require('./utils/s3');
            externalUrl = await getPresignedUrl(key);
        }

        if (!externalUrl) {
            return res.status(400).send('Missing URL or key');
        }

        // Security check: Only proxy allowed domains
        const allowedDomains = ['cloudinary.com', 'e2enetworks.net', 'googleusercontent.com', 'amazonaws.com', 'objectstore'];
        if (!allowedDomains.some(domain => externalUrl.includes(domain))) {
            return res.status(403).send('Domain not allowed for proxying');
        }

        const axios = require('axios');
        const response = await axios({
            method: 'get',
            url: externalUrl,
            responseType: 'stream',
            validateStatus: status => true // Do not throw on 4xx/5xx errors
        });

        // If the external source returns an error (like Cloudinary 404/401)
        if (response.status >= 400) {
            res.setHeader('Content-Type', 'text/html');
            return res.status(200).send(`
                <div style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f8fafc; color: #334155; text-align: center; padding: 20px;">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <h2 style="margin: 0 0 8px 0;">Document Not Found or Access Denied</h2>
                    <p style="margin: 0; max-width: 400px; font-size: 14px;">The requested file could not be loaded from the external storage provider (Status ${response.status}). It may have been deleted or moved.</p>
                </div>
            `);
        }

        // Set appropriate headers from external source
        res.status(200);
        res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
        if (response.headers['content-length']) res.setHeader('Content-Length', response.headers['content-length']);
        
        // Ensure PDF/Videos can be previewed/streamed
        res.setHeader('Content-Disposition', 'inline');

        response.data.pipe(res);

    } catch (error) {
        console.error('[MediaProxy] Critical Error proxying url:', req.query.url, '\nDetails:', error.message);
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`
            <div style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: #f1f5f9; text-align: center; padding: 20px;">
                <h3 style="margin: 0 0 8px 0; color: #f87171;">Proxy Media Stream Error</h3>
                <p style="margin: 0; font-size: 14px; color: #94a3b8;">${error.message}</p>
            </div>
        `);
    }
}));

// ── System: Manual URL Refresh Trigger (secret-key protected) ──
// POST /api/system/refresh-urls — uses x-admin-key header instead of JWT
app.post('/api/system/refresh-urls', asyncHandler(async (req, res) => {
    const secret = req.headers['x-admin-key'];
    const expected = process.env.ADMIN_SECRET_KEY || 'baselearn-admin-2026';
    if (secret !== expected) {
        return res.status(401).json({ success: false, message: 'Unauthorized — invalid admin key.' });
    }
    const { runUrlRefreshJob } = require('./utils/urlRefreshJob');
    runUrlRefreshJob().catch(e => console.error('[RefreshURLs Manual]', e.message));
    res.json({ success: true, message: 'URL refresh job started in background. Check server logs.' });
}));

// ── Protected routes (auth required via router-level middleware) ──
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));
app.use('/api/instructor', require('./routes/instructorRoutes'));


// Health check
app.get('/', (req, res) => res.json({ message: '🎓 Base Learn API is running' }));

const { notFound, errorHandler } = require('./middleware/errorMiddleware');
// 404 catch-all — must be after all routes
app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/uploads')) {
        console.error(`[404-UPLOAD] File not found: ${req.originalUrl} | Logical Path: ${path.join(uploadsPath, req.url)}`);
    }
    next();
});
app.use(notFound);
// Global error handler — must be last
app.use(errorHandler);

const http = require('http');
const { initSocket } = require('./utils/socket');

const PORT = process.env.PORT || 5000;

const startServer = (port) => {
    return new Promise((resolve) => {
        const server = http.createServer(app);
        
        // Initialize Socket.io only for the main port (or all if we want, but let's stick to one main instance)
        initSocket(server);

        server.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`);
            resolve(server);
        });

        server.on('error', (err) => {
            console.log(`Port ${port} in use or error:`, err.message);
            resolve(null);
        });
    });
};

const init = async () => {
    // Start main server first
    const mainServer = await startServer(6000);
    
    // Optional compatibility ports
    await startServer(5000);
    await startServer(8080);
    
    if (PORT && !['5000', '6000', '8080'].includes(PORT.toString())) {
        await startServer(PORT);
    }
    
    // Start background jobs
    require('./jobs/liveSessionJob').startJob();
    require('./utils/urlRefreshJob').startUrlRefreshJob();
};

init();
