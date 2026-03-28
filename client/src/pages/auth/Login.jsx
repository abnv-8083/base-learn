import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password, 'student');
      // Let the user seamlessly navigate to whatever dashboard their role belongs to!
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="auth-container">
      <style>{`
        .auth-container { min-height: 100vh; display: flex; }
        .auth-left { flex: 1; display: none; background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%); position: relative; overflow: hidden; padding: var(--space-16); color: white; flex-direction: column; justify-content: space-between; }
        @media (min-width: 900px) { .auth-left { display: flex; } }
        .auth-logo { display: flex; align-items: center; gap: var(--space-3); text-decoration: none; }
        .auth-logo-icon { width: 48px; height: 48px; background: linear-gradient(135deg, var(--color-accent), #3B82F6); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: var(--text-2xl); box-shadow: 0 4px 20px rgba(0, 194, 255, 0.4); }
        .auth-logo-text { font-family: var(--font-heading); font-size: var(--text-2xl); font-weight: var(--fw-bold); color: white; letter-spacing: -0.03em; }
        .auth-logo-text span { color: var(--color-accent); }
        .auth-hero-content { max-width: 500px; position: relative; z-index: 10; }
        .auth-hero-title { font-family: var(--font-heading); font-size: 3.5rem; font-weight: var(--fw-extrabold); line-height: 1.1; margin-bottom: var(--space-6); transition: all 0.3s; }
        .auth-hero-subtitle { font-size: var(--text-lg); color: rgba(255, 255, 255, 0.8); line-height: 1.6; transition: all 0.3s; }
        .auth-decoration { position: absolute; border-radius: 50%; filter: blur(80px); z-index: 1; }
        .auth-circle-1 { width: 400px; height: 400px; background: rgba(0, 194, 255, 0.3); bottom: -100px; right: -100px; }
        .auth-circle-2 { width: 300px; height: 300px; background: rgba(99, 102, 241, 0.3); top: 10%; left: -50px; }
        
        .auth-right { flex: 1; display: flex; align-items: center; justify-content: center; background: var(--color-bg); padding: var(--space-8); }
        .native-form-wrapper { width: 100%; max-width: 440px; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 40px rgba(15, 45, 107, 0.08); border: 1px solid var(--color-border); }
        
        .auth-form-header { margin-bottom: 32px; }
        .auth-form-title { font-size: 28px; font-weight: 800; color: var(--color-text-primary); margin-bottom: 8px; display: flex; alignItems: center; gap: 10px; }
        .auth-form-subtitle { color: var(--color-text-secondary); }
        
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; font-size: 14px; font-weight: 600; color: var(--color-text-primary); margin-bottom: 8px; }
        .form-input { width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid var(--color-border); background: var(--color-bg); font-size: 16px; transition: all 0.2s; }
        .form-input:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 4px rgba(15, 45, 107, 0.1); }
        
        .btn-submit { width: 100%; padding: 16px; border-radius: 12px; background: var(--color-primary); color: white; border: none; font-size: 16px; font-weight: bold; cursor: pointer; transition: background 0.2s; margin-top: 12px; }
        .btn-submit:hover { background: var(--color-primary-dark); }
        
        .auth-error { background: #FEE2E2; color: #DC2626; padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
        
        .auth-footer { margin-top: 32px; text-align: center; color: var(--color-text-secondary); font-size: 15px; }
        .auth-footer a { color: var(--color-primary); font-weight: bold; text-decoration: none; }
        .auth-footer a:hover { text-decoration: underline; }
        .password-wrapper { position: relative; width: 100%; }
        .password-toggle { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; padding: 4px; color: var(--color-text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: color 0.2s; }
        .password-toggle:hover { color: var(--color-primary); }
      `}</style>
      
      <div className="auth-left">
        <div className="auth-decoration auth-circle-1"></div>
        <div className="auth-decoration auth-circle-2"></div>
        
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon">🎓</div>
          <span className="auth-logo-text">Base<span>Learn</span></span>
        </Link>
        
        <div className="auth-hero-content">
          <h1 className="auth-hero-title">Welcome back to class.</h1>
          <p className="auth-hero-subtitle">Login to continue where you left off, access your latest course materials, and track your progress.</p>
        </div>
        
        <div style={{ zIndex: 10 }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--text-sm)' }}>
             &copy; {new Date().getFullYear()} Base Learn. All rights reserved.
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="native-form-wrapper">
          <div className="mobile-logo-wrapper" style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-8)' }}>
             <style>{`@media (min-width: 900px) { .mobile-logo-wrapper { display: none !important; } }`}</style>
             <Link to="/" className="auth-logo" style={{ textDecoration: 'none' }}>
               <div className="auth-logo-icon" style={{ width: '40px', height: '40px', fontSize: 'var(--text-xl)', background: 'linear-gradient(135deg, var(--color-accent), #3B82F6)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0, 194, 255, 0.35)' }}>🎓</div>
               <span className="auth-logo-text" style={{ color: 'var(--color-primary-dark)', fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)', fontFamily: 'var(--font-heading)' }}>Base<span style={{ color: 'var(--color-accent)' }}>Learn</span></span>
             </Link>
          </div>

          <div className="auth-form-header">
            <h2 className="auth-form-title">Student Login</h2>
            <p className="auth-form-subtitle">Enter your email and password to access your structured curriculum.</p>
          </div>

          {error && (
            <div className="auth-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="you@example.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required 
              />
            </div>
            
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="form-label">Password</label>
                <a href="#" style={{ fontSize: '14px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
                  Forgot password?
                </a>
              </div>
              <div className="password-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-input" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required 
                  style={{ paddingRight: '46px' }}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-submit">Sign In</button>
          </form>

          <div className="auth-footer">
            Don't have an account? <Link to="/register">Sign up</Link>
            <br/><br/>
            <Link to="/staff-login" style={{ color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>Staff Directory & Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
