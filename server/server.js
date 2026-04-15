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
      "img-src": ["'self'", "data:", "res.cloudinary.com", "http://localhost:6000", "http://127.0.0.1:6000", process.env.BACKEND_URL],
      "media-src": ["'self'", "http://localhost:6000", "http://127.0.0.1:6000", "res.cloudinary.com", process.env.BACKEND_URL],
      "connect-src": ["'self'", "http://localhost:6000", "http://127.0.0.1:6000", "res.cloudinary.com", process.env.BACKEND_URL],
      "frame-src": ["'self'", "blob:", "data:", "res.cloudinary.com", "http://localhost:6000", "http://127.0.0.1:6000", process.env.BACKEND_URL],
      "object-src": ["'self'", "blob:", "data:", "res.cloudinary.com", "http://localhost:6000", "http://127.0.0.1:6000", process.env.BACKEND_URL]
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

// Serve uploaded videos
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

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

// ── Media Proxy: Stream E2E EOS files through backend ──────────────────────
// GET /api/media/stream?key=assignments/file.pdf
// Browsers cannot access E2E directly (503 SlowDown). The backend runs on
// E2E's network and can fetch files, then stream them to the client.
app.get('/api/media/stream', asyncHandler(async (req, res) => {
    const { key } = req.query;
    if (!key) return res.status(400).json({ success: false, message: 'Missing key parameter' });

    const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
    const s3 = new S3Client({
        region: process.env.AWS_REGION || 'ap-south-1',
        endpoint: process.env.R2_ENDPOINT,
        forcePathStyle: true,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
    });

    try {
        const cmd = new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key });
        const data = await s3.send(cmd);

        // Set content headers
        res.setHeader('Content-Type', data.ContentType || 'application/octet-stream');
        if (data.ContentLength) res.setHeader('Content-Length', data.ContentLength);
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache 1 day
        res.setHeader('Content-Disposition', `inline; filename="${path.basename(key)}"`);

        // Stream body to client
        data.Body.pipe(res);
    } catch (err) {
        console.error('[MediaProxy] Failed to stream from E2E:', err.message);
        res.status(404).json({ success: false, message: 'File not found or inaccessible' });
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
app.use(notFound);
// Global error handler — must be last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = (port) => {
    return new Promise((resolve) => {
        const s = app.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`);
            resolve(s);
        });
        s.on('error', (err) => {
            console.log(`Port ${port} in use or error:`, err.message);
            resolve(null); // Resolve to prevent the init promise from hanging
        });
    });
};

const init = async () => {
    await startServer(5000);
    await startServer(8080);
    if (PORT && PORT.toString() !== '5000' && PORT.toString() !== '6000' && PORT.toString() !== '8080') {
        await startServer(PORT);
    }
    await startServer(6000);
    
    // Start background jobs only once
    require('./jobs/liveSessionJob').startJob();
    require('./utils/urlRefreshJob').startUrlRefreshJob();
};

init();
