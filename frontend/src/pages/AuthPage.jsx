import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/student-auth.css';

const AuthPage = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [currentQuote, setCurrentQuote] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const quotes = [
        "\"Education is the passport to the future, for tomorrow belongs to those who prepare for it today.\" - Malcolm X",
        "\"You don't have to be great to start, but you have to start to be great.\" - Zig Ziglar",
        "\"The expert in anything was once a beginner.\" - Helen Hayes",
        "\"Strive for progress, not perfection.\" - Unknown"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuote((prev) => (prev + 1) % quotes.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [quotes.length]);

    const handleAuthSuccess = (data) => {
        if (data.success && data.data && data.data.token) {
            localStorage.setItem('studentToken', data.data.token);
            localStorage.setItem('studentUser', JSON.stringify(data.data.user));
            navigate('/student');
        } else {
            alert(data.message || 'Authentication failed');
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const payload = {
            emailOrPhone: e.target.loginEmail.value,
            password: e.target.loginPassword.value
        };

        try {
            const res = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            handleAuthSuccess(data);
        } catch (err) {
            console.error(err);
            alert('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const payload = {
            fullName: e.target.regFullName.value,
            grade: e.target.grade.value,
            phone: e.target.regPhone.value,
            email: e.target.regEmail.value,
            password: e.target.regPassword.value
        };

        try {
            const res = await fetch('/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            handleAuthSuccess(data);
        } catch (err) {
            console.error(err);
            alert('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-body">
            {/* Left Panel */}
            <div className="auth-left">
                <div className="auth-brand">
                    <i className="ph-fill ph-graduation-cap"></i>
                    <span>Base Learn</span>
                </div>
                
                <div className="auth-illustration">
                    <i className="ph-fill ph-student"></i>
                </div>

                <div className="quote-container">
                    <p className="quote-text" style={{ transition: 'opacity 0.5s' }} key={currentQuote}>
                        {quotes[currentQuote]}
                    </p>
                </div>
            </div>

            {/* Right Panel */}
            <div className="auth-right">
                <div className="auth-form-container">
                    <div className="auth-header">
                        <h2>Welcome aboard!</h2>
                        <p>Log in or create a new account to continue.</p>
                    </div>

                    {/* Tabs */}
                    <div className="auth-tabs">
                        <div className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}>Login</div>
                        <div className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>Register</div>
                    </div>

                    {/* Login Form */}
                    {activeTab === 'login' && (
                        <div className="tab-pane active" id="login-form-pane">
                            <form id="login-form" onSubmit={handleLoginSubmit}>
                                <div className="form-group">
                                    <label>Email or Phone</label>
                                    <div className="input-with-icon">
                                        <i className="ph ph-envelope-simple left-icon"></i>
                                        <input type="text" name="loginEmail" placeholder="Enter your email or phone" required />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Password</label>
                                    <div className="input-with-icon">
                                        <i className="ph ph-lock-key left-icon"></i>
                                        <input type={showLoginPassword ? 'text' : 'password'} name="loginPassword" placeholder="Enter your password" className="password-input" required />
                                        <button type="button" className="toggle-password" onClick={() => setShowLoginPassword(!showLoginPassword)}>
                                            <i className={`ph ${showLoginPassword ? 'ph-eye-closed' : 'ph-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="form-options">
                                    <label className="checkbox-label">
                                        <input type="checkbox" /> Remember me
                                    </label>
                                    <a href="#" className="text-link">Forgot Password?</a>
                                </div>

                                <button type="submit" className="btn-primary btn-block" disabled={isLoading}>
                                    {isLoading ? 'Logging in...' : 'Log In'}
                                </button>

                                <div className="divider">or continue with</div>

                                <button type="button" className="btn-outline btn-block btn-google">
                                    <i className="ph-fill ph-google-logo text-blue"></i>
                                    Sign in with Google
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Register Form */}
                    {activeTab === 'register' && (
                        <div className="tab-pane active" id="register-form-pane">
                            <form id="register-form" onSubmit={handleRegisterSubmit}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <div className="input-with-icon">
                                        <i className="ph ph-user left-icon"></i>
                                        <input type="text" name="regFullName" placeholder="Arjun Sharma" required />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Select Your Grade</label>
                                    <div className="grade-selector">
                                        <label className="grade-pill">
                                            <input type="radio" name="grade" value="8" defaultChecked />
                                            <span className="target-grade-label">Grade 8</span>
                                        </label>
                                        <label className="grade-pill">
                                            <input type="radio" name="grade" value="9" />
                                            <span className="target-grade-label">Grade 9</span>
                                        </label>
                                        <label className="grade-pill">
                                            <input type="radio" name="grade" value="10" />
                                            <span className="target-grade-label">Grade 10</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Phone Number (Optional)</label>
                                    <div className="input-with-icon">
                                        <i className="ph ph-phone left-icon"></i>
                                        <input type="tel" name="regPhone" placeholder="+91 **********" />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Email Address</label>
                                    <div className="input-with-icon">
                                        <i className="ph ph-envelope left-icon"></i>
                                        <input type="email" name="regEmail" placeholder="arjun@example.com" required />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Password</label>
                                    <div className="input-with-icon">
                                        <i className="ph ph-lock-key left-icon"></i>
                                        <input type={showRegPassword ? 'text' : 'password'} name="regPassword" placeholder="Create a password" className="password-input" required />
                                        <button type="button" className="toggle-password" onClick={() => setShowRegPassword(!showRegPassword)}>
                                            <i className={`ph ${showRegPassword ? 'ph-eye-closed' : 'ph-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="form-options">
                                    <label className="checkbox-label">
                                        <input type="checkbox" required /> I agree to the <a href="#" className="text-link" style={{ marginLeft: '0.25rem' }}>Terms & Conditions</a>
                                    </label>
                                </div>

                                <button type="submit" className="btn-primary btn-block" disabled={isLoading}>
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
