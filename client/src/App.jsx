import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StaffLogin from './pages/auth/StaffLogin';

// Layouts
import StudentLayout from './pages/student/StudentLayout';

// Student Pages
import Dashboard from './pages/student/Dashboard';
import RecordedClasses from './pages/student/RecordedClasses';
import LiveClasses from './pages/student/LiveClasses';
import StudentProfile from './pages/student/StudentProfile';
import Assignments from './pages/student/Assignments';
import Progression from './pages/student/Progression';
import MyCalendar from './pages/student/MyCalendar';
import Tests from './pages/student/Tests';
import Landing from './pages/Landing';

// Instructor Pages
import InstructorLayout from './pages/instructor/InstructorLayout';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import ContentManagement from './pages/instructor/ContentManagement';
import StudentManagement from './pages/instructor/StudentManagement';
import FacultyManagement from './pages/instructor/FacultyManagement';
import ClassManagement from './pages/instructor/ClassManagement';
import InstructorProfile from './pages/instructor/InstructorProfile';

// Faculty Pages
import FacultyLayout from './pages/faculty/FacultyLayout';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyContent from './pages/faculty/FacultyContent';
import FacultyLiveClasses from './pages/faculty/FacultyLiveClasses';
import FacultyStudents from './pages/faculty/FacultyStudents';
import FacultyProfile from './pages/faculty/FacultyProfile';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminBatchManagement from './pages/admin/AdminBatchManagement';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminClassManagement from './pages/admin/AdminClassManagement';
import AdminActivityLog from './pages/admin/AdminActivityLog';
import AdminFacultyDetails from './pages/admin/AdminFacultyDetails';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }}></div>;
  
  if (!user) {
    if (requiredRole && requiredRole !== 'student') {
        return <Navigate to={`/staff-login?role=${requiredRole}`} replace />;
    }
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to their respective dashboard if they try to access another role's route
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login/*" element={<Login />} />
        <Route path="/staff-login/*" element={<StaffLogin />} />
        
        <Route path="/register/*" element={<Register />} />

        <Route path="/" element={<Landing />} />

        {/* Protected Routes */}
        <Route path="/student/*" element={
          <ProtectedRoute requiredRole="student">
            <Routes>
              <Route element={<StudentLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="recorded-classes" element={<RecordedClasses />} />
                <Route path="live-classes" element={<LiveClasses />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="assignments" element={<Assignments />} />
                <Route path="progression" element={<Progression />} />
                <Route path="calendar" element={<MyCalendar />} />
                <Route path="tests" element={<Tests />} />
              </Route>
            </Routes>
          </ProtectedRoute>
        } />

        <Route path="/admin/*" element={
          <ProtectedRoute requiredRole="admin">
            <Routes>
              <Route element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="students" element={<AdminUserManagement role="student" />} />
                <Route path="faculty" element={<AdminUserManagement role="faculty" />} />
                <Route path="faculty/:id" element={<AdminFacultyDetails />} />
                <Route path="instructors" element={<AdminUserManagement role="instructor" />} />
                <Route path="classes" element={<AdminClassManagement />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="payments" element={<AdminAnalytics />} />
                <Route path="activity-log" element={<AdminActivityLog />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
            </Routes>
          </ProtectedRoute>
        } />

        <Route path="/faculty/*" element={
          <ProtectedRoute requiredRole="faculty">
            <Routes>
              <Route element={<FacultyLayout />}>
                <Route path="dashboard" element={<FacultyDashboard />} />
                <Route path="live-classes" element={<FacultyLiveClasses />} />
                <Route path="content" element={<FacultyContent />} />
                <Route path="students" element={<FacultyStudents />} />
                <Route path="profile" element={<FacultyProfile />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
            </Routes>
          </ProtectedRoute>
        } />

        <Route path="/instructor/*" element={
          <ProtectedRoute requiredRole="instructor">
            <Routes>
              <Route element={<InstructorLayout />}>
                <Route path="dashboard" element={<InstructorDashboard />} />
                <Route path="content-management" element={<ContentManagement />} />
                <Route path="student-management" element={<StudentManagement />} />
                <Route path="faculty" element={<FacultyManagement />} />
                <Route path="classes" element={<ClassManagement />} />
                <Route path="profile" element={<InstructorProfile />} />
              </Route>
            </Routes>
          </ProtectedRoute>
        } />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
