require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const mainRoutes = require('./routes/index');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1', mainRoutes);

// --- FRONTEND STATIC SERVING ---
const rootDir = path.join(__dirname, '../');

// Serve static assets natively
app.use('/assets', express.static(path.join(rootDir, 'assets')));
app.use('/apps', express.static(path.join(rootDir, 'apps')));
app.use('/docs', express.static(path.join(rootDir, 'docs')));

// Landing Page
app.get('/', (req, res) => {
    res.sendFile(path.join(rootDir, 'index.html'));
});

// Student Portal Routes
app.get('/student', (req, res) => {
    res.sendFile(path.join(rootDir, 'apps/student/student-portal.html'));
});
app.get('/student/login', (req, res) => {
    res.sendFile(path.join(rootDir, 'apps/student/auth.html'));
});
app.get('/student/register', (req, res) => {
    res.sendFile(path.join(rootDir, 'apps/student/auth.html'));
});

// Other Portal Entry Points
app.get('/instructor', (req, res) => {
    res.sendFile(path.join(rootDir, 'apps/instructor/instructor-portal.html'));
});
app.get('/faculty', (req, res) => {
    res.sendFile(path.join(rootDir, 'apps/faculty/faculty-portal.html'));
});
app.get('/admin', (req, res) => {
    res.sendFile(path.join(rootDir, 'apps/admin/admin-portal.html'));
});

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
