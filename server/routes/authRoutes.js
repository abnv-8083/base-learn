const express = require('express');
const router = express.Router();
const { 
    registerUser, loginUser, getMe, verifyOTP, 
    getNotifications, dismissNotification, dismissAllNotifications,
    submitAdmissionEnquiry, forgotPassword, resetPassword, 
    getStatusWhatsApp, resetWhatsApp,
    updateProfile, updatePassword,
    submitProfileRequest, getPendingProfileRequest
} = require('../controllers/authController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');

// ── Validation schemas ───────────────────────────────────────────────────────
const profileSchema = {
    name:           { rules: ['name', 'min:2', 'max:60'],  label: 'Name' },
    phone:          { rules: ['phone'],                    label: 'Phone' },
    district:       { rules: ['max:80'],                   label: 'District' },
    qualification:  { rules: ['max:80'],                   label: 'Qualification' },
    experience:     { rules: ['max:40'],                   label: 'Experience' },
    specialization: { rules: ['max:100'],                  label: 'Specialization' },
    school:         { rules: ['max:120'],                  label: 'School' },
    about:          { rules: ['max:500'],                  label: 'About' },
};

const passwordSchema = {
    currentPassword: { rules: ['required'],                          label: 'Current Password' },
    newPassword:     { rules: ['required', 'min:6', 'max:100'],      label: 'New Password' },
};

const profileRequestSchema = {
    type:     { rules: ['required'],  label: 'Request Type' },
    newValue: { rules: ['required'],  label: 'New Value' },
};


router.post('/register', protect, authorizeRoles('admin', 'instructor'), registerUser);
router.post('/admission-enquiry', submitAdmissionEnquiry);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/notifications', protect, getNotifications);
router.delete('/notifications', protect, dismissAllNotifications);
router.delete('/notifications/:id', protect, dismissNotification);
router.get('/whatsapp-status', protect, authorizeRoles('admin', 'instructor'), getStatusWhatsApp);
router.post('/reset-whatsapp', protect, authorizeRoles('admin'), resetWhatsApp);
router.post('/refresh', require('../controllers/authController').refreshToken);
router.post('/logout', require('../controllers/authController').logoutUser);

// Profile Management — with server-side validation
router.put('/profile', protect, validate(profileSchema), updateProfile);
router.put('/password', protect, validate(passwordSchema), updatePassword);
router.post('/profile-request', protect, validate(profileRequestSchema), submitProfileRequest);
router.get('/profile-request/pending', protect, getPendingProfileRequest);


module.exports = router;
