const Admin = require('../models/Admin');
const Instructor = require('../models/Instructor');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};

// @desc    Register a new student
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    try {
        const { name, email, password, studentClass, school, parentName, parentPhone, phone, countryCode, dob, district } = req.body;

        let userExists = await Student.findOne({ email });
        
        if (userExists) {
            if (userExists.isVerified) {
                return res.status(400).json({ message: 'User already exists and is fully verified' });
            }
            await Student.deleteOne({ email });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const user = await Student.create({
            name,
            email,
            password,
            studentClass: studentClass || null,
            school: school || null,
            parentName: parentName || null,
            parentPhone: parentPhone || null,
            phone: phone || null,
            countryCode: countryCode || '+91',
            dob: dob || null,
            district: district || null,
            role: 'student',
            otp,
            otpExpires,
            isVerified: false
        });

        if (user) {
            const message = `Your Base Learn verification code is: ${otp}.`;
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #0F2D6B; text-align: center;">Welcome to Base Learn!</h2>
                    <p>Hi ${name},</p>
                    <p>Thank you for starting your registration. Please use the following One-Time Password (OTP) to instantly verify your account. It expires in 10 minutes.</p>
                    <div style="background-color: #f4f7fb; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1E40AF;">${otp}</span>
                    </div>
                </div>
            `;

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Base Learn - Verify Your Account',
                    message,
                    html
                });
                
                res.status(201).json({
                    message: 'Registration stage completed! Please check your email for the OTP.',
                    email: user.email
                });
            } catch (err) {
                console.error('Email sending failed:', err);
                await Student.deleteOne({ _id: user._id });
                return res.status(500).json({ message: 'Email could not be sent. Please enter a valid email.', error: err.message });
            }
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error during registration' });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await Student.findOne({ email });
        
        if (!user) return res.status(404).json({ message: 'User not found. Please register again.' });
        if (user.isVerified) return res.status(400).json({ message: 'Account is already verified. Proceed to Login.' });
        if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP code' });
        if (user.otpExpires < Date.now()) return res.status(400).json({ message: 'OTP has expired. Please register again.' });
        
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        
        // --- Auto-Assign Student ---
        try {
            const StudyClass = require('../models/StudyClass');
            const Batch = require('../models/Batch');
            const matchingClasses = await StudyClass.find({ targetGrade: user.studentClass });
            for (const studyClass of matchingClasses) {
                const batches = await Batch.find({ studyClass: studyClass._id });
                let availableBatch = batches.find(b => (b.students ? b.students.length : 0) < (b.capacity || 30));
                if (availableBatch) {
                    availableBatch.students.push(user._id);
                    await availableBatch.save();
                } else {
                    const newBatch = new Batch({
                        name: `${studyClass.name} - Batch ${batches.length + 1}`,
                        studyClass: studyClass._id,
                        instructor: studyClass.instructor,
                        students: [user._id],
                        capacity: 30
                    });
                    await newBatch.save();
                }
            }
        } catch (autoAssignErr) { console.error(autoAssignErr); }
        
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error during OTP verification' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const roleModelMap = {
            admin: Admin,
            instructor: Instructor,
            faculty: Faculty,
            student: Student
        };

        let foundUser = null;

        if (role && roleModelMap[role]) {
            console.log(`[AUTH] Login attempt for role: ${role}, email: ${email}`);
            // Priority: Search the specifically requested role model
            const Model = roleModelMap[role];
            const user = await Model.findOne({ $or: [{ email: email }, { phone: email }] });
            if (!user) console.log(`[AUTH] User not found in ${role} model`);
            if (user && (await user.matchPassword(password))) {
                console.log(`[AUTH] Success ! User found and password matches.`);
                foundUser = user;
            } else if (user) {
                console.log(`[AUTH] User found but password match failed.`);
            }
        } else {
            // Fallback: search all (legacy behavior or unified login)
            const models = [Admin, Instructor, Faculty, Student];
            for (const Model of models) {
                const user = await Model.findOne({ $or: [{ email: email }, { phone: email }] });
                if (user && (await user.matchPassword(password))) {
                    foundUser = user;
                    break;
                }
            }
        }

        if (foundUser) {
            if (!foundUser.isActive) {
                return res.status(403).json({ message: 'Account deactivated. Contact Admin.' });
            }

            res.json({
                _id: foundUser._id,
                name: foundUser.name,
                email: foundUser.email,
                role: foundUser.role, // This should match the requested role if found above
                imageUrl: foundUser.profilePhoto,
                token: generateToken(foundUser._id, foundUser.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password for the selected role' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        // req.user is already populated by protect middleware
        let user = req.user.toObject ? req.user.toObject() : req.user;
        
        if (user.role === 'student') {
            try {
                const Batch = require('../models/Batch');
                const batch = await Batch.findOne({ students: user._id }).populate('studyClass').lean();
                if (batch) {
                    user.batchName = batch.name;
                    user.studyClassName = batch.studyClass ? batch.studyClass.name : 'Unknown Class';
                }
            } catch (err) { console.error(err); }
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            $and: [
                {
                    $or: [
                        { recipient: req.user.userId.toString() },
                        { recipient: 'all' },
                        ...(req.user.role === 'admin' ? [{ recipient: 'all_admins' }] : [])
                    ]
                },
                { dismissedBy: { $ne: req.user.userId } }
            ]
        }).sort({ createdAt: -1 }).limit(20);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

const dismissNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, {
            $addToSet: { dismissedBy: req.user.userId }
        });
        res.status(200).json({ message: 'Notification dismissed' });
    } catch (error) {
        res.status(500).json({ message: 'Error dismissing notification' });
    }
};

module.exports = { registerUser, loginUser, getMe, verifyOTP, getNotifications, dismissNotification };
