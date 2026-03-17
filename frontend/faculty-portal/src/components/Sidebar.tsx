'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Users, UserCog, BookOpen, 
  BarChart3, CalendarDays, Megaphone, Bell, Settings,
  GraduationCap, Video
} from 'lucide-react';
import styles from './sidebar.module.css';

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/faculty/dashboard' },
  { icon: <Users size={20} />, label: 'Student Management', path: '/faculty/students' },
  { icon: <UserCog size={20} />, label: 'Instructor Management', path: '/faculty/instructors' },
  { icon: <BookOpen size={20} />, label: 'Course Oversight', path: '/faculty/courses' },
  { icon: <BarChart3 size={20} />, label: 'Reports & Analytics', path: '/faculty/reports' },
  { icon: <CalendarDays size={20} />, label: 'Curriculum Planner', path: '/faculty/curriculum' },
  { icon: <Megaphone size={20} />, label: 'Announcements', path: '/faculty/announcements' },
  { icon: <Video size={20} />, label: 'Live & Recorded', path: '/faculty/classes' },
];

const BOTTOM_ITEMS = [
  { icon: <Bell size={20} />, label: 'Notifications', path: '/faculty/notifications' },
  { icon: <Settings size={20} />, label: 'Settings', path: '/faculty/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logoSquare}>
          <GraduationCap size={24} color="white" />
        </div>
        <div className={styles.brandInfo}>
          <h2 className={styles.brandName}>Base Learn</h2>
          <span className={styles.portalTag}>Faculty Portal</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.footer}>
        {BOTTOM_ITEMS.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
        
        <div className={styles.userProfile}>
           <div className={styles.avatar}>SK</div>
           <div className={styles.userInfo}>
             <p className={styles.userName}>Sneha K.</p>
             <p className={styles.userRole}>Dept. Head</p>
           </div>
        </div>
      </div>
    </aside>
  );
}
