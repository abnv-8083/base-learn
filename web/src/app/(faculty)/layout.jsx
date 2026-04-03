"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { LayoutDashboard, Users, FileText, Video, PenTool, Bell } from 'lucide-react';

export default function FacultyLayout({ children }) {
  const router = useRouter();
  const { user, loadUser, loading } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadUser('faculty');
      setIsReady(true);
    };
    init();
  }, [loadUser]);

  useEffect(() => {
    if (isReady && !loading && (!user || (user.role !== 'faculty' && user.role !== 'admin'))) {
      router.push('/login');
    }
  }, [isReady, loading, user, router]);

  if (!isReady || loading) {
    return <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '30vh' }} />;
  }

  if (!user || (user.role !== 'faculty' && user.role !== 'admin')) return null;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/faculty/dashboard' },
    { icon: Users, label: 'My Students', path: '/faculty/students' },
    { icon: FileText, label: 'Assignments', path: '/faculty/assignments' },
    { icon: Video, label: 'Live Sessions', path: '/faculty/live-classes' },
    { icon: PenTool, label: 'Upload Content', path: '/faculty/content' },
    { icon: Bell, label: 'Notifications', path: '/faculty/notifications' }
  ];

  return (
    <div className="app-layout">
      <Sidebar role="faculty" menuItems={menuItems} />
      <div className="main-content">
        <Topbar />
        <div className="page-body" style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}