const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/v1/auth/register
router.post('/register', authController.registerStudent);

// POST /api/v1/auth/login
router.post('/login', authController.loginStudent);

module.exports = router;
