import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';

// Portals & Layouts
import ProtectedRoute from './components/ProtectedRoute';
import StudentLayout from './components/StudentLayout';

// Student Pages
import DashboardHome from './pages/student/DashboardHome';
import OnboardingFlow from './pages/student/OnboardingFlow';
import MyCourses from './pages/student/MyCourses';
import CourseCatalog from './pages/student/CourseCatalog';
import CourseDetail from './pages/student/CourseDetail';

// Other Portals
import AdminDashboard from './pages/admin/AdminDashboard';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import FacultyDashboard from './pages/faculty/FacultyDashboard';

// We'll create these scaffold pages shortly:
const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center h-full p-8 text-center bg-white rounded-lg shadow-sm border">
    <div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-gray-500">This feature is currently under active development.</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth Routes */}
        <Route path="/student/login" element={<AuthPage />} />
        <Route path="/student/register" element={<AuthPage />} />

        {/* Protected Student Portal Routes */}
        <Route path="/student/onboarding" element={
          <ProtectedRoute>
            <OnboardingFlow />
          </ProtectedRoute>
        } />
        
        <Route path="/student" element={
          <ProtectedRoute>
            <StudentLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardHome />} />
          <Route path="courses" element={<MyCourses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="catalog" element={<CourseCatalog />} />
          <Route path="progress" element={<PlaceholderPage title="My Progress" />} />
          <Route path="schedule" element={<PlaceholderPage title="Schedule" />} />
          <Route path="messages" element={<PlaceholderPage title="Messages" />} />
          {/* Will add more nested routes here as we build them */}
        </Route>

        {/* Other Portals (Currently Unprotected for Demo Purposes) */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/instructor" element={<InstructorDashboard />} />
        <Route path="/faculty" element={<FacultyDashboard />} />
        
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
