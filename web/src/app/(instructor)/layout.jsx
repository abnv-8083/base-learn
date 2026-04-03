"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { LayoutDashboard, Users, FileCheck, Layers, Bell, ClipboardCheck, BookOpen } from 'lucide-react';

export default function InstructorLayout({ children }) {
  const router = useRouter();
  const { user, loadUser, loading } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadUser('instructor');
      setIsReady(true);
    };
    init();
  }, [loadUser]);

  useEffect(() => {
    if (isReady && !loading && (!user || (user.role !== 'instructor' && user.role !== 'admin'))) {
      router.push('/login');
    }
  }, [isReady, loading, user, router]);

  if (!isReady || loading) {
    return <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '30vh' }} />;
  }

  if (!user || (user.role !== 'instructor' && user.role !== 'admin')) return null;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/instructor/dashboard' },
    { icon: Layers, label: 'Batches', path: '/instructor/batches' },
    { icon: BookOpen, label: 'Curriculum', path: '/instructor/curriculum' },
    { icon: Users, label: 'Students', path: '/instructor/students' },
    { icon: FileCheck, label: 'Content Verification', path: '/instructor/content' },
    { icon: ClipboardCheck, label: 'Marking Center', path: '/instructor/marking-center' },
    { icon: Bell, label: 'Notifications', path: '/instructor/notifications' }
  ];

  return (
    <div className="app-layout">
      <Sidebar role="instructor" menuItems={menuItems} />
      <div className="main-content">
        <Topbar />
        <div className="page-body" style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  ); 
}