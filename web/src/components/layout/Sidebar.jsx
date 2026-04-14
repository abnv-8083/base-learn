"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { LogOut, User, X } from "lucide-react";
import { useLayoutStore } from "@/store/layoutStore";


const ROLE_COLORS = {
  admin:      { accent: '#ef4444', light: 'rgba(239,68,68,0.15)',      badge: '#fef2f2', badgeText: '#991b1b'   },
  student:    { accent: '#6366f1', light: 'rgba(99,102,241,0.15)',     badge: '#eef2ff', badgeText: '#3730a3'   },
  faculty:    { accent: '#10b981', light: 'rgba(16,185,129,0.15)',     badge: '#ecfdf5', badgeText: '#065f46'   },
  instructor: { accent: '#f59e0b', light: 'rgba(245,158,11,0.15)',     badge: '#fffbeb', badgeText: '#78350f'   },
};

const ROLE_LABELS = {
  admin: 'Admin Portal',
  student: 'Student Portal',
  faculty: 'Faculty Portal',
  instructor: 'Instructor Portal',
};

export default function Sidebar({ menuItems, role }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { isSidebarOpen, setSidebarOpen } = useLayoutStore();
  const router = useRouter();
  const home = `/${role}/dashboard`;
  const roleStyle = ROLE_COLORS[role] || ROLE_COLORS.student;


  const handleLogout = async () => {
    await logout(role);
    router.push(role === 'student' ? '/login' : '/staff-login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside id="app-sidebar" className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
      {/* Mobile Close Button */}
      <button 
        onClick={() => setSidebarOpen(false)}
        className="mobile-only"
        style={{
          position: 'absolute', top: '16px', right: '16px', 
          background: 'rgba(255,255,255,0.05)', border: 'none', 
          borderRadius: '8px', padding: '8px', color: 'white',
          cursor: 'pointer', zIndex: 10
        }}
      >
        <X size={20} />
      </button>

      {/* Top accent gradient */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, ${roleStyle.accent}, #00C2FF)`,
        zIndex: 1
      }} />

      <Link href={home} className="sidebar-logo" style={{ paddingTop: '28px', gap: '10px', alignItems: 'center' }}>
        <img src="/logo.png" alt="Logo" style={{
          width: '52px', height: '52px', borderRadius: '12px',
          boxShadow: `0 4px 16px ${roleStyle.light}`,
          objectFit: 'contain'
        }} />
        <div>
          <img src="/logo-wide.png" alt="Base Learn" style={{ height: '28px', display: 'block' }} />
          <div style={{ fontSize: '10px', color: 'rgba(168,186,220,0.5)', marginTop: '1px', letterSpacing: '0.05em' }}>
            {ROLE_LABELS[role] || ''}
          </div>
        </div>
      </Link>

      {/* Nav */}
      <nav className="sidebar-nav" style={{ paddingTop: '16px', gap: '2px' }}>
        {menuItems.map((item, idx) => {
          const isActive =
            pathname === item.path ||
            (item.path !== `/${role}` && pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={idx}
              href={item.path}
              className={`sidebar-link ${isActive ? "active" : ""}`}
              style={isActive ? {
                background: roleStyle.light,
                color: '#fff',
              } : {}}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isActive ? `${roleStyle.accent}30` : 'rgba(255,255,255,0.05)',
                flexShrink: 0, transition: 'all 0.2s'
              }}>
                <Icon size={16} color={isActive ? roleStyle.accent : undefined} />
              </div>
              <span style={{ fontSize: '13.5px' }}>{item.label}</span>
              {item.badge && (
                <span className="nav-badge" style={{ background: roleStyle.accent }}>{item.badge}</span>
              )}
              {isActive && (
                <div style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: '3px', height: '60%', borderRadius: '0 4px 4px 0',
                  background: roleStyle.accent
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div style={{
        margin: '8px 12px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: '12px',
      }}>
        {/* User info row — links to profile */}
        <Link href={`/${role}/profile`} style={{ textDecoration: 'none' }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)',
              marginBottom: '6px', cursor: 'pointer', transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          >
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg, ${roleStyle.accent}80, #0F2D6B)`,
              fontSize: '12px', fontWeight: '700', color: 'white',
              border: `2px solid ${roleStyle.accent}40`
            }}>
              {user?.imageUrl
                ? <img src={user.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: '11px', color: `${roleStyle.accent}cc`, textTransform: 'capitalize', fontWeight: '600' }}>
                View Profile →
              </div>
            </div>
          </div>
        </Link>

        {/* Logout btn */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
            padding: '9px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: 'rgba(239,68,68,0.08)', color: '#fca5a5',
            fontSize: '13px', fontWeight: '500', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.color = '#fecaca'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#fca5a5'; }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
