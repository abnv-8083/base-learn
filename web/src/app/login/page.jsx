"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, ArrowLeft, GraduationCap, BookOpen, Video, Award, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const HIGHLIGHTS = [
  { icon: Video,    text: 'Live & recorded classes'     },
  { icon: BookOpen, text: 'Smart assignments & tests'   },
  { icon: Award,    text: 'Progress analytics dashboard' },
];

export default function StudentLogin() {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const login  = useAuthStore(s => s.login);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const id = toast.loading('Signing you in...');
    try {
      const user = await login(email, password, 'student');
      toast.success('Welcome back! 🎓', { id });
      router.push(`/${user.role}/dashboard`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      setError(msg);
      toast.error('Login failed', { id });
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8faff' }}>

      {/* ── Left Panel ── */}
      <div style={{
        flex: '0 0 480px', display: 'none', flexDirection: 'column', justifyContent: 'space-between',
        background: 'linear-gradient(145deg, #091E4A 0%, #0F2D6B 60%, #1A3F8F 100%)',
        padding: '48px', position: 'relative', overflow: 'hidden',
      }} className="auth-left-panel">

        {/* Blobs */}
        <div style={{ position:'absolute', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(0,194,255,0.18) 0%, transparent 70%)', bottom:'-200px', right:'-150px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', top:'10%', left:'-80px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'28px 28px', pointerEvents:'none' }} />

        {/* Logo */}
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none', position:'relative', zIndex:2 }}>
          <img src="/logo-wide.png" alt="Base Learn" style={{ height: '80px', mixBlendMode: 'screen' }} />
        </Link>

        {/* Hero text */}
        <div style={{ position:'relative', zIndex:2 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'7px 14px', borderRadius:'99px', background:'rgba(0,194,255,0.12)', border:'1px solid rgba(0,194,255,0.28)', marginBottom:'24px' }}>
            <GraduationCap size={14} color="#00C2FF" />
            <span style={{ fontSize:'12px', fontWeight:'700', color:'#00C2FF', letterSpacing:'0.05em' }}>STUDENT PORTAL</span>
          </div>

          <h1 style={{ fontSize:'3rem', fontWeight:'900', color:'white', lineHeight:1.1, letterSpacing:'-0.04em', marginBottom:'18px', fontFamily:'var(--font-heading)' }}>
            Welcome back<br />to class. 📚
          </h1>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'16px', lineHeight:1.7, marginBottom:'40px' }}>
            Continue where you left off. Your classes, assignments, and progress are waiting for you.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {HIGHLIGHTS.map(({ icon: Icon, text }, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'34px', height:'34px', borderRadius:'9px', background:'rgba(0,194,255,0.12)', border:'1px solid rgba(0,194,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={15} color="#00C2FF" />
                </div>
                <span style={{ fontSize:'14px', color:'rgba(255,255,255,0.8)', fontWeight:'500' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize:'12px', color:'rgba(168,186,220,0.4)', position:'relative', zIndex:2 }}>
          © {new Date().getFullYear()} Base Learn Education Platform
        </p>
      </div>

      {/* ── Right Panel ── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 20px' }}>
        <div style={{ width:'100%', maxWidth:'440px' }}>

          {/* Back to home */}
          <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'13px', color:'#4A5680', textDecoration:'none', marginBottom:'32px', fontWeight:'500', transition:'color 0.2s' }}>
            <ArrowLeft size={15} /> Back to home
          </Link>

          {/* Mobile logo */}
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'28px' }} className="mobile-only-logo">
            <img src="/logo-wide.png" alt="Base Learn" style={{ height: '46px', filter: 'invert(1) grayscale(1)', mixBlendMode: 'multiply' }} />
          </div>

          <div style={{ marginBottom:'32px' }}>
            <h2 style={{ fontSize:'28px', fontWeight:'800', color:'#0D1B3E', letterSpacing:'-0.03em', marginBottom:'8px', fontFamily:'var(--font-heading)' }}>Student Sign In</h2>
            <p style={{ fontSize:'14px', color:'#4A5680', lineHeight:1.6 }}>Enter your email and password to access your learning portal.</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display:'flex', alignItems:'center', gap:'10px', background:'#fef2f2', border:'1.5px solid #fca5a5', borderRadius:'12px', padding:'13px 16px', marginBottom:'20px' }}>
              <AlertCircle size={16} color="#dc2626" style={{ flexShrink:0 }} />
              <span style={{ fontSize:'13px', color:'#dc2626', fontWeight:'500' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom:'18px' }}>
              <label style={{ display:'block', fontSize:'13px', fontWeight:'700', color:'#0D1B3E', marginBottom:'8px' }}>Email Address</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ width:'100%', padding:'14px 16px', borderRadius:'12px', border:'1.5px solid #E2E8F8', fontSize:'15px', background:'#f8faff', outline:'none', fontFamily:'var(--font-body)', transition:'border-color 0.2s, box-shadow 0.2s', boxSizing:'border-box' }}
                onFocus={e => { e.target.style.borderColor='#0F2D6B'; e.target.style.boxShadow='0 0 0 3px rgba(15,45,107,0.08)'; }}
                onBlur={e => { e.target.style.borderColor='#E2E8F8'; e.target.style.boxShadow='none'; }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom:'24px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                <label style={{ fontSize:'13px', fontWeight:'700', color:'#0D1B3E' }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize:'13px', color:'#0F2D6B', fontWeight:'600', textDecoration:'none' }}>Forgot password?</Link>
              </div>
              <div style={{ position:'relative' }}>
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required
                  style={{ width:'100%', padding:'14px 48px 14px 16px', borderRadius:'12px', border:'1.5px solid #E2E8F8', fontSize:'15px', background:'#f8faff', outline:'none', fontFamily:'var(--font-body)', transition:'border-color 0.2s, box-shadow 0.2s', boxSizing:'border-box' }}
                  onFocus={e => { e.target.style.borderColor='#0F2D6B'; e.target.style.boxShadow='0 0 0 3px rgba(15,45,107,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor='#E2E8F8'; e.target.style.boxShadow='none'; }}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#8492B4', display:'flex', padding:'4px' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="login-btn"
              style={{ width:'100%', padding:'15px', borderRadius:'12px', background:'linear-gradient(135deg, #0F2D6B, #1A3F8F)', color:'white', border:'none', fontWeight:'700', fontSize:'16px', cursor:loading ? 'not-allowed' : 'pointer', boxShadow:'0 6px 24px rgba(15,45,107,0.28)', transition:'all 0.3s ease', opacity:loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          {/* Footer links */}
          <div style={{ marginTop:'28px', textAlign:'center', borderTop:'1px solid #E2E8F8', paddingTop:'24px', display:'flex', flexDirection:'column', gap:'12px' }}>
            <p style={{ fontSize:'13px', color:'#4A5680' }}>
              Not enrolled yet?{' '}
              <Link href="/#enquiry" style={{ color:'#0F2D6B', fontWeight:'700', textDecoration:'none' }}>Apply for Admission</Link>
            </p>
            <Link href="/staff-login" style={{ fontSize:'13px', color:'#8492B4', textDecoration:'none' }}>
              Staff / Educator login →
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(15, 45, 107, 0.4);
        }
        @media (min-width: 900px) { .auth-left-panel { display: flex !important; } .mobile-only-logo { display: none !important; } }
      `}</style>
    </div>
  );
}
