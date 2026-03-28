import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [stage, setStage] = useState(1);
  const [error, setError] = useState('');
  const { registerStudent, verifyOTP } = useAuth();
  const navigate = useNavigate();

  // Stage 1 Fields
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [school, setSchool] = useState('');
  const [dob, setDob] = useState('');
  const [district, setDistrict] = useState('');

  // Stage 2 Fields
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Optional Fields (Combined)
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  // Stage 3 Fields
  const [otp, setOtp] = useState('');

  const nextStage = (e) => {
    e.preventDefault();
    if (stage === 1 && (!name || !studentClass || !school || !dob || !district)) {
      setError('Please fill all required fields');
      return;
    }
    setError('');
    setStage(stage + 1);
  };

  const prevStage = () => {
    setError('');
    setStage(stage - 1);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await registerStudent({
        name,
        studentClass,
        school,
        parentName,
        parentPhone,
        email,
        phone,
        password,
        dob,
        countryCode,
        district
      });
      setStage(3); // Move to OTP
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request registration. Check details.');
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await verifyOTP(email, otp);
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
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
        .auth-hero-title { font-family: var(--font-heading); font-size: 3.5rem; font-weight: var(--fw-extrabold); line-height: 1.1; margin-bottom: var(--space-6); }
        .auth-hero-subtitle { font-size: var(--text-lg); color: rgba(255, 255, 255, 0.8); line-height: 1.6; }
        .auth-decoration { position: absolute; border-radius: 50%; filter: blur(80px); z-index: 1; }
        .auth-circle-1 { width: 400px; height: 400px; background: rgba(0, 194, 255, 0.3); bottom: -100px; right: -100px; }
        .auth-circle-2 { width: 300px; height: 300px; background: rgba(99, 102, 241, 0.3); top: 10%; left: -50px; }
        
        .auth-right { flex: 1; display: flex; align-items: center; justify-content: center; background: var(--color-bg); padding: var(--space-8); }
        .native-form-wrapper { width: 100%; max-width: 440px; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 40px rgba(15, 45, 107, 0.08); border: 1px solid var(--color-border); }
        
        .auth-form-header { margin-bottom: 32px; }
        .auth-form-title { font-size: 28px; font-weight: 800; color: var(--color-text-primary); margin-bottom: 8px; }
        .auth-form-subtitle { color: var(--color-text-secondary); }
        
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; font-size: 14px; font-weight: 600; color: var(--color-text-primary); margin-bottom: 8px; }
        .form-input { width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid var(--color-border); background: var(--color-bg); font-size: 16px; transition: all 0.2s; }
        .form-input:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 4px rgba(15, 45, 107, 0.1); }
        
        .btn-submit { width: 100%; padding: 16px; border-radius: 12px; background: var(--color-primary); color: white; border: none; font-size: 16px; font-weight: bold; cursor: pointer; transition: background 0.2s; margin-top: 12px; }
        .btn-submit:hover { background: var(--color-primary-dark); }
        
        .btn-secondary { background: var(--color-bg); color: var(--color-text-primary); border: 1px solid var(--color-border); margin-bottom: 12px; }
        .btn-secondary:hover { background: #E2E8F8; }
        
        .auth-error { background: #FEE2E2; color: #DC2626; padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
        
        .auth-footer { margin-top: 32px; text-align: center; color: var(--color-text-secondary); font-size: 15px; }
        .auth-footer a { color: var(--color-primary); font-weight: bold; text-decoration: none; }
        .auth-footer a:hover { text-decoration: underline; }

        .stage-indicator { display: flex; gap: 8px; margin-bottom: 32px; }
        .stage-dot { height: 6px; flex: 1; border-radius: 3px; background: #E2E8F8; transition: all 0.3s; }
        .stage-dot.active { background: var(--color-primary); }
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
          <h1 className="auth-hero-title">Start your learning journey.</h1>
          <p className="auth-hero-subtitle">Join thousands of students mastering new skills through live classes, recordings, and guided assignments.</p>
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
            <h2 className="auth-form-title">
              {stage === 1 && "Personal Details"}
              {stage === 2 && "Account Setup"}
              {stage === 3 && "Verification"}
            </h2>
            <p className="auth-form-subtitle">
              {stage === 1 && "Tell us a bit about the student."}
              {stage === 2 && "Secure your new student account."}
              {stage === 3 && `We sent a 6-digit OTP code to ${email}.`}
            </p>
          </div>

          <div className="stage-indicator">
            <div className={`stage-dot ${stage >= 1 ? 'active' : ''}`}></div>
            <div className={`stage-dot ${stage >= 2 ? 'active' : ''}`}></div>
            <div className={`stage-dot ${stage >= 3 ? 'active' : ''}`}></div>
          </div>

          {error && (
            <div className="auth-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {error}
            </div>
          )}

          {stage === 1 && (
            <form onSubmit={nextStage}>
              <div className="form-group">
                <label className="form-label">Student Full Name *</label>
                <input type="text" className="form-input" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Student Class *</label>
                <select className="form-input" value={studentClass} onChange={e => setStudentClass(e.target.value)} required>
                  <option value="" disabled>Select a class</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">School Name *</label>
                <input type="text" className="form-input" placeholder="High School Name" value={school} onChange={e => setSchool(e.target.value)} required />
              </div>
              
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Date of Birth *</label>
                  <input type="date" className="form-input" value={dob} onChange={e => setDob(e.target.value)} required />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">District *</label>
                  <select className="form-input" value={district} onChange={e => setDistrict(e.target.value)} required>
                    <option value="" disabled>Select District</option>
                    <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                    <option value="Kollam">Kollam</option>
                    <option value="Pathanamthitta">Pathanamthitta</option>
                    <option value="Alappuzha">Alappuzha</option>
                    <option value="Kottayam">Kottayam</option>
                    <option value="Idukki">Idukki</option>
                    <option value="Ernakulam">Ernakulam</option>
                    <option value="Thrissur">Thrissur</option>
                    <option value="Palakkad">Palakkad</option>
                    <option value="Malappuram">Malappuram</option>
                    <option value="Kozhikode">Kozhikode</option>
                    <option value="Wayanad">Wayanad</option>
                    <option value="Kannur">Kannur</option>
                    <option value="Kasaragod">Kasaragod</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Parent Name (Optional)</label>
                  <input type="text" className="form-input" placeholder="Jane Doe" value={parentName} onChange={e => setParentName(e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Parent Phone (Optional)</label>
                  <input type="tel" className="form-input" placeholder="9876543210" value={parentPhone} onChange={e => setParentPhone(e.target.value)} />
                </div>
              </div>

              <button type="submit" className="btn-submit">Continue to Account Details</button>
            </form>
          )}

          {stage === 2 && (
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Student Phone *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select className="form-input" style={{ width: '100px', flexShrink: 0 }} value={countryCode} onChange={e => setCountryCode(e.target.value)}>
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+971">+971 (UAE)</option>
                  </select>
                  <input type="tel" className="form-input" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} required style={{ flex: 1 }} />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Password *</label>
                <div className="password-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-input" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required 
                  minLength={6} 
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

              <button type="button" onClick={prevStage} className="btn-submit btn-secondary">Back to Details</button>
              <button type="submit" className="btn-submit" style={{ marginTop: '0' }}>Request Verification OTP</button>
            </form>
          )}

          {stage === 3 && (
            <form onSubmit={handleOTPSubmit}>
              <div className="form-group" style={{ textAlign: 'center' }}>
                <label className="form-label">6-Digit Verification Code</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="000000" 
                  value={otp} 
                  onChange={e => setOtp(e.target.value)} 
                  required 
                  maxLength={6}
                  style={{ fontSize: '24px', letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold' }}
                />
              </div>

              <button type="submit" className="btn-submit">Verify Account</button>
              <button type="button" onClick={handleRegisterSubmit} className="btn-submit btn-secondary">Resend OTP Email</button>
            </form>
          )}

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
