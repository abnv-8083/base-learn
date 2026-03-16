import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import '../assets/css/student-portal.css';

const StudentLayout = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const userStr = localStorage.getItem('studentUser');
        if (userStr) {
            try {
                setUser(JSON.parse(userStr));
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('studentToken');
        localStorage.removeItem('studentUser');
        navigate('/student/login');
    };

    if (!user) {
        return null; // The ProtectedRoute component will handle redirecting if needed
    }

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'Student')}&background=random`;

    return (
        <div className="app-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo" onClick={() => navigate('/student')} style={{ cursor: 'pointer' }}>
                        <i className="ph-fill ph-book-open"></i>
                        <span>Base Learn</span>
                    </div>
                </div>
                
                <div className="sidebar-section">
                    <div className="role-selector">
                        <p className="text-xs text-muted mb-2 font-semibold" style={{ margin: 0 }}>VIEWING AS</p>
                        <select style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                            <option>Student</option>
                            <option>Instructor</option>
                        </select>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <span className="section-title">Menu</span>
                    <ul>
                        <li className={location.pathname === '/student' ? 'active' : ''}>
                            <Link to="/student"><i className="ph ph-squares-four"></i> Dashboard</Link>
                        </li>
                        <li className={location.pathname === '/student/courses' ? 'active' : ''}>
                            <Link to="/student/courses"><i className="ph ph-graduation-cap"></i> My Courses</Link>
                        </li>
                        <li className={location.pathname === '/student/catalog' ? 'active' : ''}>
                            <Link to="/student/catalog"><i className="ph ph-books"></i> Course Catalog</Link>
                        </li>
                        <li className={location.pathname === '/student/progress' ? 'active' : ''}>
                            <Link to="/student/progress"><i className="ph ph-chart-line-up"></i> My Progress</Link>
                        </li>
                        <li className={location.pathname === '/student/schedule' ? 'active' : ''}>
                            <Link to="/student/schedule"><i className="ph ph-calendar"></i> Schedule</Link>
                        </li>
                        <li className={location.pathname === '/student/messages' ? 'active' : ''}>
                            <Link to="/student/messages"><i className="ph ph-chat-centered-text"></i> Messages</Link>
                        </li>
                    </ul>
                </nav>
                
                <div className="sidebar-footer">
                    <div className="user-profile">
                        <img src={avatarUrl} alt={user.fullName} className="avatar avatar-md" />
                        <div className="user-info">
                            <span className="user-name">{user.fullName}</span>
                            <span className="user-id">ID: {user.id ? user.id.slice(-5) : '----'}</span>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout} title="Logout">
                        <i className="ph ph-sign-out"></i>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="top-header">
                    <div className="search-bar">
                        <i className="ph ph-magnifying-glass"></i>
                        <input type="text" placeholder="Search courses, lessons..." />
                    </div>
                    
                    <div className="header-actions">
                        <div className="lang-selector">
                            <span>🇺🇸 EN</span>
                        </div>
                        <button className="icon-btn">
                            <i className="ph ph-bell"></i>
                            <span className="notification-dot">3</span>
                        </button>
                        <img src={avatarUrl} alt="Avatar" className="avatar avatar-sm" />
                    </div>
                </header>
                
                <div className="content-area">
                    <Outlet context={{ user }} />
                </div>
            </main>
        </div>
    );
};

export default StudentLayout;
