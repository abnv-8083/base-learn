const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Instructor = require('../models/Instructor');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access_fallback');

            // Use the role from token to pick correct model - highly efficient
            const roleModelMap = {
                admin: Admin,
                instructor: Instructor,
                faculty: Faculty,
                student: Student
            };

            const Model = roleModelMap[decoded.role];
            if (!Model) {
                return res.status(401).json({ message: 'Not authorized, invalid token role' });
            }

            const user = await Model.findById(decoded.id).select('-password');
            
            if (!user) {
                console.warn(`[AUTH] User not found in DB: ID ${decoded.id} Role ${decoded.role}`);
                return res.status(401).json({ message: 'Not authorized, user no longer exists' });
            }
            
            req.user = user;
            req.user.userId = user._id;

            next();
        } catch (error) {
            console.error('[AUTH] Token verification failed:', error.message, 'Token Prefix:', token ? token.substring(0, 10) : 'NONE');
            res.status(401).json({ message: 'Not authorized, token expired or invalid' });
        }
    } else {
        console.warn('[AUTH] No Bearer token provided in headers');
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Role: ${req.user?.role} is not authorized` });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };
