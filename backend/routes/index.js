const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');

// Health Check Route
router.get('/status', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running successfully',
        timestamp: new Date().toISOString()
    });
});

// Authentication Routes
router.use('/auth', authRoutes);

module.exports = router;
