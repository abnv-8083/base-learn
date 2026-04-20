"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { Bell, User, Menu, X, Search, ChevronRight, Trash2 } from "lucide-react";
import { useLayoutStore } from "@/store/layoutStore";
import { useSocket } from "@/context/SocketContext";
import toast from "react-hot-toast";

const ROLE_COLORS = {
  admin:      '#ef4444',
  student:    '#6366f1',
  faculty:    '#10b981',
  instructor: '#f59e0b',
};

// ── Breadcrumb label resolution ───────────────────────────────────────────
const SEGMENT_LABELS = {
  // Role roots
  admin:              'Admin',
  student:            'Student',
  faculty:            'Faculty',
  instructor:         'Instructor',
  // Pages
  dashboard:          'Dashboard',
  profile:            'My Profile',
  users:              'Users',
  curriculum:         'Curriculum',
  system:             'System',
  enquiries:          'Enquiries',
  'recorded-classes': 'My Classes',
  'live-classes':     'Live Classes',
  'class':            'Class',
  calendar:           'Calendar',
  assignments:        'Assignments',
  tests:              'Tests & Exams',
  progression:        'Progression',
  content:            'Content',
  students:           'Students',
  notifications:      'Notifications',
  batches:            'Batches',
  'marking-center':   'Marking Center',
  subjects:           'Subjects',
  chapters:           'Chapters',
  videos:             'Videos',
  resources:          'Resources',
  settings:           'Settings',
  'profile-requests': 'Profile Requests',
  logs:               'Activity Logs',
  whatsapp:           'WhatsApp',
  'live':             'Live Session',
};

const ROLE_DASHBOARDS = {
  admin: '/admin/dashboard',
  student: '/student/dashboard',
  faculty: '/faculty/dashboard',
  instructor: '/instructor/dashboard',
};

// Detect MongoDB ObjectIDs or UUIDs → render as "Details"
const isId = (seg) => /^[a-f0-9]{24}$|^[0-9a-f-]{36}$/i.test(seg);

function buildBreadcrumbs(pathname, role) {
  const parts = pathname.split('/').filter(Boolean);
  const crumbs = [];

  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : parts[0];
  crumbs.push({ label: roleLabel, href: ROLE_DASHBOARDS[role] || `/${parts[0]}/dashboard` });

  let accumulated = '';
  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i];
    accumulated += `/${seg}`;
    if (i === 0) continue; 
    const label = isId(seg)
      ? (crumbs[crumbs.length - 1]?.label + ' Details')
      : (SEGMENT_LABELS[seg] || seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
    crumbs.push({ label, href: accumulated });
  }
  return crumbs;
}

export default function Topbar() {
  const { user } = useAuthStore();
  const socket = useSocket();
  const router = useRouter();
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar, setSidebarOpen } = useLayoutStore();

  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const roleColor = ROLE_COLORS[user?.role] || '#6366f1';
  const breadcrumbs = buildBreadcrumbs(pathname, user?.role);
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  useEffect(() => {
    setSidebarOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/auth/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleNewNotification = (notif) => {
      setNotifications(prev => {
        // avoid duplicates if both hook + manual emit fire
        if (prev.some(n => n._id === notif._id)) return prev;
        return [notif, ...prev];
      });
      toast('New notification received', { icon: '🔔', position: 'bottom-right' });
    };

    const handleBadgeRefresh = () => {
      // Re-fetch from API to ensure accuracy (catches any missed real-time events)
      fetchNotifications();
    };

    socket.on('new_notification', handleNewNotification);
    socket.on('badge_refresh', handleBadgeRefresh);
    socket.on('notifications_cleared', () => setNotifications([]));

    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('badge_refresh', handleBadgeRefresh);
      socket.off('notifications_cleared');
    };
  }, [socket, user]);


  const handleDismiss = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/auth/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success('Notification cleared');
    } catch (err) {
      toast.error('Failed to dismiss notification');
    }
  };

  const handleDismissAll = async (e) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/auth/notifications`);
      setNotifications([]);
      toast.success('All notifications cleared');
    } catch (err) {
      toast.error('Failed to dismiss notifications');
    }
  };

  useEffect(() => {
    if (!notifOpen) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest('#notif-dropdown') && !e.target.closest('#notif-bell-btn')) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!user) return null;

  return (
    <>
      <div
        id="sidebar-backdrop"
        className={`sidebar-backdrop ${isSidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden
      />

      <header style={{
        height: '64px',
        background: 'var(--color-surface)',
        borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(12px, 3vw, 28px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: scrolled ? '0 2px 16px rgba(15,45,107,0.07)' : 'none',
      }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="topbar-menu-btn"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <span key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {idx > 0 && <ChevronRight size={12} color="var(--color-border-strong)" />}
                  {isLast ? (
                    <span style={{
                      display: 'flex', alignItems: 'center',
                      fontSize: '13px', fontWeight: '700',
                      color: 'var(--color-text-primary)',
                      letterSpacing: '-0.01em',
                      maxWidth: '180px', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      lineHeight: 1
                    }}>
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      style={{
                        display: 'flex', alignItems: 'center',
                        fontSize: '13px', fontWeight: '500',
                        color: idx === 0 ? roleColor : 'var(--color-text-muted)',
                        textDecoration: 'none', transition: 'color 0.15s',
                        whiteSpace: 'nowrap',
                        lineHeight: 1
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
                      onMouseLeave={e => e.currentTarget.style.color = idx === 0 ? roleColor : 'var(--color-text-muted)'}
                    >
                      {crumb.label}
                    </Link>
                  )}
                </span>
              );
            })}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <button
              id="notif-bell-btn"
              onClick={() => setNotifOpen(n => !n)}
              style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: notifOpen ? 'var(--color-bg)' : 'transparent',
                border: `1.5px solid ${notifOpen ? 'var(--color-border)' : 'transparent'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--color-text-secondary)',
                transition: 'all 0.15s', position: 'relative'
              }}
              title="Notifications"
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span style={{
                  position: 'absolute', top: '7px', right: '7px',
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: '#ef4444', border: '2px solid var(--color-surface)',
                  boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)'
                }} />
              )}
            </button>

            {notifOpen && (
              <div id="notif-dropdown" style={{
                position: 'absolute', top: '46px', right: 0,
                width: '320px', background: 'var(--color-surface)',
                borderRadius: '16px', border: '1px solid var(--color-border)',
                boxShadow: '0 12px 48px rgba(15,45,107,0.18)',
                zIndex: 200, overflow: 'hidden'
              }} className="animate-in fade-in slide-in-from-top-2 duration-200">
                <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--color-text-primary)' }}>Broadcasts</div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {notifications.length > 0 && (
                      <button onClick={handleDismissAll} style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-primary)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}>
                        Mark all
                      </button>
                    )}
                    <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 8px', background: 'var(--color-bg)', color: 'var(--color-text-secondary)', borderRadius: '6px' }}>
                      {notifications.length} Alerts
                    </span>
                  </div>
                </div>
                
                <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div 
                        key={notif._id}
                        style={{ 
                          padding: '14px 18px', 
                          borderBottom: '1px solid var(--color-surface-raised)',
                          display: 'flex',
                          gap: '12px',
                          cursor: 'default',
                          transition: 'background 0.2s'
                        }}
                        className="hover:bg-slate-50 group"
                      >
                        <div style={{ 
                          width: '8px', height: '8px', borderRadius: '50%', 
                          background: notif.type === 'alert' ? '#ef4444' : notif.type === 'success' ? '#10b981' : notif.type === 'warning' ? '#f59e0b' : '#3b82f6',
                          marginTop: '6px'
                        }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: '500', lineHeight: 1.4 }}>{notif.message}</p>
                          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button 
                          onClick={(e) => handleDismiss(e, notif._id)}
                          style={{ opacity: 0, transition: 'opacity 0.2s', padding: '4px', cursor: 'pointer' }}
                          className="group-hover:opacity-100 text-slate-300 hover:text-rose-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                      <Bell size={32} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                      Everything's clear
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ width: '1px', height: '24px', background: 'var(--color-border)', margin: '0 4px' }} />

          <Link 
            href={`/${user.role}/profile`}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '6px 12px 6px 6px', borderRadius: '12px',
              background: 'var(--color-bg)',
              border: '1.5px solid var(--color-border)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            className="hover:border-indigo-200 hover:bg-indigo-50/30 group"
          >
            <div style={{
              width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg, ${roleColor}, #0F2D6B)`,
              fontSize: '11px', fontWeight: '700', color: 'white',
              transition: 'transform 0.2s'
            }} className="group-hover:scale-105">
              {user.imageUrl
                ? <img src={user.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '7px' }} />
                : initials}
            </div>
            <div style={{ minWidth: 0, display: 'none', maxWidth: '120px' }} className="topbar-user-info">
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'capitalize', fontWeight: '500' }}>
                {user.role}
              </div>
            </div>
          </Link>
        </div>
      </header>

      <style>{`
        @media (min-width: 640px) {
          .topbar-user-info { display: block !important; }
        }
      `}</style>
    </>
  );
}
