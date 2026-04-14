"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, ArrowLeft, Shield, Users, BookOpen, AlertCircle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = [
  {
    id: 'instructor',
    label: 'Instructor',
    icon: BookOpen,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.3)',
    title: 'Instructor Portal',
    subtitle: 'Manage student batches, review content, and track performance analytics across your cohorts.',
    gradient: 'linear-gradient(135deg, #78350f, #92400e)',
  },
  {
    id: 'faculty',
    label: 'Faculty',
    icon: Users,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.3)',
    title: 'Faculty Portal',
    subtitle: 'Upload lecture recordings, create assignments, and schedule live sessions for your students.',
    gradient: 'linear-gradient(135deg, #064e3b, #065f46)',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Shield,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.3)',
    title: 'Admin Portal',
    subtitle: 'Monitor platform analytics, manage all user accounts, and configure system-wide settings.',
    gradient: 'linear-gradient(135deg, #7f1d1d, #991b1b)',
  },
];

function StaffLoginForm() {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [activeRole, setActiveRole]   = useState('instructor');

  const login  = useAuthStore(s => s.login);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const rp = searchParams.get('role');
    if (['admin', 'faculty', 'instructor'].includes(rp)) setActiveRole(rp);
  }, [searchParams]);

  const role = ROLES.find(r => r.id === activeRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const id = toast.loading('Authenticating...');
    try {
      const user = await login(email, password, activeRole);
      toast.success('Welcome back! 👋', { id });
      router.push(`/${user.role}/dashboard`);
    } catch (err) {
      toast.error('Authentication failed', { id });
      const message    = err.response?.data?.message || 'Invalid email or password.';
      const actualRole = err.response?.data?.actualRole;
      setError({ message, actualRole });
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'#f8faff' }}>

      {/* ── Left Panel ── */}
      <div style={{
        flex:'0 0 460px', display:'none', flexDirection:'column', justifyContent:'space-between',
        background: role.gradient,
        padding:'48px', position:'relative', overflow:'hidden', transition:'background 0.4s ease',
      }} className="auth-left-panel">

        <div style={{ position:'absolute', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', bottom:'-200px', right:'-150px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'28px 28px', pointerEvents:'none' }} />

        <Link href="/" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none', position:'relative', zIndex:2 }}>
          <img src="/logo-wide.png" alt="Base Learn" style={{ height: '55px' }} />
        </Link>

        <div style={{ position:'relative', zIndex:2 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'7px 14px', borderRadius:'99px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', marginBottom:'24px' }}>
            {role && <role.icon size={14} color="white" />}
            <span style={{ fontSize:'12px', fontWeight:'700', color:'white', letterSpacing:'0.05em' }}>{role?.label?.toUpperCase()} PORTAL</span>
          </div>

          <h1 style={{ fontSize:'2.8rem', fontWeight:'900', color:'white', lineHeight:1.1, letterSpacing:'-0.04em', marginBottom:'18px', fontFamily:'var(--font-heading)' }}>
            {role?.title}
          </h1>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'15px', lineHeight:1.7, marginBottom:'40px' }}>
            {role?.subtitle}
          </p>

          {/* Role switcher mini */}
          <div style={{ display:'flex', gap:'8px' }}>
            {ROLES.map(r => (
              <button key={r.id} onClick={() => { setActiveRole(r.id); setError(null); }}
                style={{ flex:1, padding:'10px', borderRadius:'10px', border:`1.5px solid ${activeRole === r.id ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'}`, background: activeRole === r.id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)', color:'white', fontSize:'12px', fontWeight:'700', cursor:'pointer', transition:'all 0.2s', backdropFilter:'blur(8px)' }}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)', position:'relative', zIndex:2 }}>
          © {new Date().getFullYear()} Base Learn Education Platform
        </p>
      </div>

      {/* ── Right Panel ── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 20px' }}>
        <div style={{ width:'100%', maxWidth:'440px' }}>

          <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'13px', color:'#4A5680', textDecoration:'none', marginBottom:'32px', fontWeight:'500' }}>
            <ArrowLeft size={15} /> Back to home
          </Link>

          {/* Mobile logo */}
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px' }} className="mobile-only-logo">
            <img src="/logo-wide.png" alt="Base Learn" style={{ height: '28px' }} />
          </div>

          {/* Role tabs (mobile) */}
          <div style={{ display:'flex', gap:'4px', background:'#f0f4ff', padding:'4px', borderRadius:'12px', marginBottom:'28px', border:'1px solid #E2E8F8' }}>
            {ROLES.map(r => {
              const Icon = r.icon;
              return (
                <button key={r.id} onClick={() => { setActiveRole(r.id); setError(null); }}
                  style={{ flex:1, padding:'9px 8px', borderRadius:'9px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', transition:'all 0.2s',
                    background: activeRole === r.id ? 'white' : 'transparent',
                    color:       activeRole === r.id ? r.color  : '#4A5680',
                    boxShadow:   activeRole === r.id ? '0 2px 8px rgba(0,0,0,0.07)' : 'none',
                  }}>
                  <Icon size={13} />
                  {r.label}
                </button>
              );
            })}
          </div>

          <div style={{ marginBottom:'28px' }}>
            <h2 style={{ fontSize:'26px', fontWeight:'800', color:'#0D1B3E', letterSpacing:'-0.03em', marginBottom:'6px', fontFamily:'var(--font-heading)' }}>
              {role?.title}
            </h2>
            <p style={{ fontSize:'13px', color:'#4A5680', lineHeight:1.6 }}>Sign in with your assigned credentials to continue.</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background:'#fef2f2', border:'1.5px solid #fca5a5', borderRadius:'12px', padding:'13px 16px', marginBottom:'20px' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:'10px' }}>
                <AlertCircle size={16} color="#dc2626" style={{ flexShrink:0, marginTop:'1px' }} />
                <div>
                  <span style={{ fontSize:'13px', color:'#dc2626', fontWeight:'500' }}>{error.message}</span>
                  {error.actualRole && (
                    <button onClick={() => { setActiveRole(error.actualRole); setError(null); }}
                      style={{ display:'flex', alignItems:'center', gap:'4px', marginTop:'8px', fontSize:'12px', color:'#dc2626', background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.25)', borderRadius:'6px', padding:'4px 10px', cursor:'pointer', fontWeight:'700' }}>
                      Switch to {error.actualRole} portal <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:'18px' }}>
              <label style={{ display:'block', fontSize:'13px', fontWeight:'700', color:'#0D1B3E', marginBottom:'8px' }}>Assigned Email</label>
              <input type="email" placeholder="you@institution.com" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ width:'100%', padding:'14px 16px', borderRadius:'12px', border:'1.5px solid #E2E8F8', fontSize:'15px', background:'#f8faff', outline:'none', fontFamily:'var(--font-body)', transition:'border-color 0.2s, box-shadow 0.2s', boxSizing:'border-box' }}
                onFocus={e => { e.target.style.borderColor = role.color; e.target.style.boxShadow=`0 0 0 3px ${role.bg}`; }}
                onBlur={e => { e.target.style.borderColor='#E2E8F8'; e.target.style.boxShadow='none'; }}
              />
            </div>

            <div style={{ marginBottom:'24px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                <label style={{ fontSize:'13px', fontWeight:'700', color:'#0D1B3E' }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize:'13px', color:role.color, fontWeight:'600', textDecoration:'none' }}>Forgot password?</Link>
              </div>
              <div style={{ position:'relative' }}>
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required
                  style={{ width:'100%', padding:'14px 48px 14px 16px', borderRadius:'12px', border:'1.5px solid #E2E8F8', fontSize:'15px', background:'#f8faff', outline:'none', fontFamily:'var(--font-body)', transition:'border-color 0.2s, box-shadow 0.2s', boxSizing:'border-box' }}
                  onFocus={e => { e.target.style.borderColor = role.color; e.target.style.boxShadow=`0 0 0 3px ${role.bg}`; }}
                  onBlur={e => { e.target.style.borderColor='#E2E8F8'; e.target.style.boxShadow='none'; }}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#8492B4', padding:'4px', display:'flex' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:'15px', borderRadius:'12px', background: role.gradient, color:'white', border:'none', fontWeight:'700', fontSize:'16px', cursor:loading ? 'not-allowed' : 'pointer', boxShadow:`0 6px 24px ${role.bg}`, transition:'all 0.2s', opacity:loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : `Sign in as ${role?.label} →`}
            </button>
          </form>

          <div style={{ marginTop:'28px', textAlign:'center', borderTop:'1px solid #E2E8F8', paddingTop:'24px' }}>
            <p style={{ fontSize:'13px', color:'#4A5680' }}>
              Are you a student?{' '}
              <Link href="/login" style={{ color:'#0F2D6B', fontWeight:'700', textDecoration:'none' }}>Student Login →</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) { .auth-left-panel { display: flex !important; } .mobile-only-logo { display: none !important; } }
      `}</style>
    </div>
  );
}

export default function StaffLogin() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8faff' }}><div className="spinner" /></div>}>
      <StaffLoginForm />
    </Suspense>
  );
}
