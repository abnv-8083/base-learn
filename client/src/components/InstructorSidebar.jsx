import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  GitMerge, 
  Users, 
  Layers,
  UserCheck
} from 'lucide-react';

const InstructorSidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getLinkClass = (path) => {
    return `nav-item ${location.pathname.includes(path) ? 'active' : ''}`;
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <Link to="/instructor/dashboard" className="sidebar-logo">
        <div className="sidebar-logo-icon">🎓</div>
        <span className="sidebar-logo-text">Base<span>Learn</span></span>
      </Link>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Instructor Portal</span>

        <Link to="/instructor/dashboard" className={getLinkClass('/dashboard')}>
          <LayoutDashboard className="nav-item-icon" />
          Overview
        </Link>
        <Link to="/instructor/content-management" className={getLinkClass('/content-management')}>
          <GitMerge className="nav-item-icon" />
          Content Management
        </Link>
        <Link to="/instructor/student-management" className={getLinkClass('/student-management')}>
          <Users className="nav-item-icon" />
          Student Management
        </Link>
        <Link to="/instructor/faculty" className={getLinkClass('/faculty')}>
          <UserCheck className="nav-item-icon" />
          Faculty Management
        </Link>
        <Link to="/instructor/classes" className={getLinkClass('/classes')}>
          <Layers className="nav-item-icon" />
          Class Management
        </Link>
        <Link to="/instructor/profile" className={getLinkClass('/profile')}>
          <Users className="nav-item-icon" />
          My Profile
        </Link>
      </nav>

      {/* User info at bottom */}
      <Link to="/instructor/profile" className="sidebar-user" style={{ textDecoration: 'none' }}>
        <img 
          src={user?.profilePhoto || `https://ui-avatars.com/api/?name=${user?.name || "Instructor"}`} 
          className="sidebar-avatar" 
          alt="User Avatar" 
        />
        <div className="sidebar-user-info">
          <div className="sidebar-user-name" style={{ color: 'var(--color-text-primary)' }}>{user?.name || "Instructor"}</div>
          <div className="sidebar-user-role" style={{ color: 'var(--color-warning)' }}>Instructor</div>
        </div>
      </Link>
    </aside>
  );
};

export default InstructorSidebar;
