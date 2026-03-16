// This is a minimal mock controller to stand in for authentication
// until database integration is complete.

exports.registerStudent = async (req, res, next) => {
    try {
        const { fullName, grade, email, password, phone } = req.body;

        // Basic validation
        if (!fullName || !grade || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide full name, grade, email, and password'
            });
        }

        // Mock saving to DB
        const mockNewUser = {
            id: 'mock-user-id-' + Date.now(),
            fullName,
            email,
            grade,
            phone: phone || null,
            role: 'student',
            createdAt: new Date()
        };

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: mockNewUser,
                token: 'mock-jwt-token-register'
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.loginStudent = async (req, res, next) => {
    try {
        const { emailOrPhone, password } = req.body;

        // Basic validation
        if (!emailOrPhone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email/phone and password'
            });
        }

        // Mock validation
        if (password !== 'password123' && password !== 'test') { // Accept dummy passwords
             return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const mockUser = {
            id: 'mock-user-id-101',
            fullName: 'Arjun Sharma',
            email: emailOrPhone.includes('@') ? emailOrPhone : 'arjun@example.com',
            grade: '10',
            role: 'student'
        };

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: mockUser,
                token: 'mock-jwt-token-login'
            }
        });

    } catch (error) {
        next(error);
    }
};
