import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Library,
  BarChart2,
  CreditCard,
  Shield,
  ShieldAlert,
  ClipboardList
} from 'lucide-react';

const AdminSidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getLinkClass = (path) =>
    `nav-item ${location.pathname.includes(path) ? 'active' : ''}`;

  return (
    <aside className="sidebar">
      <Link to="/admin/dashboard" className="sidebar-logo">
        <div className="sidebar-logo-icon">🛡️</div>
        <span className="sidebar-logo-text">Base<span>Learn</span></span>
      </Link>

      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Control Center</span>

        <Link to="/admin/dashboard" className={getLinkClass('/dashboard')}>
          <LayoutDashboard className="nav-item-icon" />
          Overview
        </Link>

        <span className="sidebar-section-label" style={{ marginTop: 16 }}>User Management</span>

        <Link to="/admin/students" className={getLinkClass('/students')}>
          <GraduationCap className="nav-item-icon" />
          Students
        </Link>
        <Link to="/admin/faculty" className={getLinkClass('/faculty')}>
          <Users className="nav-item-icon" />
          Faculty
        </Link>
        <Link to="/admin/instructors" className={getLinkClass('/instructors')}>
          <Shield className="nav-item-icon" />
          Instructors
        </Link>

        <span className="sidebar-section-label" style={{ marginTop: 16 }}>Approvals</span>

        <Link to="/admin/requests" className={getLinkClass('/requests')}>
          <ShieldAlert className="nav-item-icon" />
          Profile Requests
        </Link>

        <span className="sidebar-section-label" style={{ marginTop: 16 }}>Platform</span>

        <Link to="/admin/classes" className={getLinkClass('/classes')}>
          <BookOpen className="nav-item-icon" />
          Classes
        </Link>
        <Link to="/admin/subjects" className={getLinkClass('/subjects')}>
          <Library className="nav-item-icon" />
          Subjects
        </Link>

        <span className="sidebar-section-label" style={{ marginTop: 16 }}>Analytics</span>

        <Link to="/admin/analytics" className={getLinkClass('/analytics')}>
          <BarChart2 className="nav-item-icon" />
          Platform Analytics
        </Link>
        <Link to="/admin/payments" className={getLinkClass('/payments')}>
          <CreditCard className="nav-item-icon" />
          Payments
        </Link>
        <Link to="/admin/activity-log" className={getLinkClass('/activity-log')}>
          <ClipboardList className="nav-item-icon" />
          Activity Log
        </Link>
      </nav>

      <Link to="/admin/dashboard" style={{ textDecoration: 'none' }} className="sidebar-user">
        <img
          src={user?.profilePhoto || `https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=6366f1&color=fff`}
          className="sidebar-avatar"
          alt="Admin"
        />
        <div className="sidebar-user-info">
          <div className="sidebar-user-name" style={{ color: 'var(--color-text-primary)' }}>{user?.name || 'Admin'}</div>
          <div className="sidebar-user-role" style={{ color: '#6366f1' }}>Super Admin</div>
        </div>
      </Link>
    </aside>
  );
};

export default AdminSidebar;
