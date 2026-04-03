"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { LayoutDashboard, Users, BookOpen, Settings, Inbox } from 'lucide-react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { user, loadUser, loading } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadUser('admin');
      setIsReady(true);
    };
    init();
  }, [loadUser]);

  useEffect(() => {
    if (isReady && !loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [isReady, loading, user, router]);

  if (!isReady || loading) {
    return <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '30vh' }} />;
  }

  if (!user || user.role !== 'admin') return null;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: BookOpen, label: 'Curriculum', path: '/admin/curriculum' },
    { icon: Inbox, label: 'Enquiries', path: '/admin/enquiries' },
    { icon: Settings, label: 'System', path: '/admin/system' }
  ];

  return (
    <div className="app-layout">
      <Sidebar role="admin" menuItems={menuItems} />
      <div className="main-content">
        <Topbar />
        <div className="page-body" style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}