"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Phone, MapPin, Mail, Lock, Shield, Camera, BookOpen, Calendar, CheckCircle, Eye, EyeOff, GraduationCap, Star } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useFormValidation, FieldError } from '@/hooks/useFormValidation';
import toast from 'react-hot-toast';

const ACCENT = '#6366f1';

const PROFILE_CSS = `
  @keyframes spin { to { transform: rotate(360deg); } }

  .profile-hero {
    border-radius: 24px;
    padding: 36px 40px;
    margin-bottom: 28px;
  }
  .profile-hero-inner {
    display: flex;
    align-items: center;
    gap: 24px;
    position: relative;
    z-index: 1;
  }
  .profile-hero-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  .profile-hero-stats {
    display: flex;
    gap: 12px;
    margin-left: auto;
    flex-shrink: 0;
  }
  .profile-hero-stat {
    text-align: center;
    background: rgba(255,255,255,0.12);
    padding: 12px 18px;
    border-radius: 14px;
    backdrop-filter: blur(10px);
    min-width: 80px;
  }
  .profile-tab-bar {
    display: flex;
    gap: 6px;
    background: white;
    padding: 6px;
    border-radius: 14px;
    border: 1px solid #e2e8f0;
    margin-bottom: 24px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    width: fit-content;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .profile-tab-bar::-webkit-scrollbar { display: none; }
  .profile-tab-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 20px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .profile-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  @media (max-width: 768px) {
    .profile-hero { padding: 24px 20px !important; border-radius: 18px !important; }
    .profile-hero-inner { flex-wrap: wrap; gap: 16px; }
    .profile-hero-stats { margin-left: 0; }
    .profile-form-grid { grid-template-columns: 1fr !important; gap: 16px; }
  }
  @media (max-width: 540px) {
    .profile-hero { padding: 20px 16px !important; }
    .profile-hero-inner { flex-direction: column; align-items: flex-start; }
    .profile-hero-meta { gap: 10px; }
    .profile-hero-stats { flex-direction: row; width: 100%; }
    .profile-hero-stat { flex: 1; padding: 10px 12px; min-width: 0; }
    .profile-tab-btn { padding: 8px 14px; font-size: 12px; }
  }
`;

function InputField({ icon: Icon, label, value, onChange, onBlur, type = 'text', placeholder, readOnly, error, id }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label htmlFor={id} style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {Icon && <Icon size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: readOnly ? '#cbd5e1' : error ? '#ef4444' : focused ? ACCENT : '#94a3b8', transition: 'color 0.2s' }} />}
        <input
          id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          style={{ width: '100%', padding: Icon ? '12px 14px 12px 40px' : '12px 14px', background: readOnly ? '#f8fafc' : 'white', border: `1.5px solid ${error ? '#ef4444' : focused ? ACCENT : '#e2e8f0'}`, borderRadius: '12px', fontSize: '14px', fontWeight: '500', color: readOnly ? '#94a3b8' : '#1e293b', outline: 'none', transition: 'all 0.2s', cursor: readOnly ? 'not-allowed' : 'text', boxShadow: error ? '0 0 0 3px rgba(239,68,68,0.1)' : focused ? `0 0 0 3px ${ACCENT}18` : 'none', boxSizing: 'border-box' }}
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}

function PasswordField({ id, label, value, onChange, onBlur, error }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label htmlFor={id} style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: error ? '#ef4444' : focused ? ACCENT : '#94a3b8', transition: 'color 0.2s' }} />
        <input id={id} type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder="••••••••"
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          style={{ width: '100%', padding: '12px 44px 12px 40px', background: 'white', border: `1.5px solid ${error ? '#ef4444' : focused ? ACCENT : '#e2e8f0'}`, borderRadius: '12px', fontSize: '14px', fontWeight: '500', color: '#1e293b', outline: 'none', transition: 'all 0.2s', boxShadow: error ? '0 0 0 3px rgba(239,68,68,0.1)' : focused ? `0 0 0 3px ${ACCENT}18` : 'none', boxSizing: 'border-box' }}
        />
        <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px', display: 'flex', minHeight: '0' }}>
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      <FieldError message={error} />
    </div>
  );
}

export default function StudentProfile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const [phone, setPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [school, setSchool] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [passState, setPassState] = useState({ old: '', new: '', confirm: '' });

  const personalValidation = useFormValidation();
  const passValidation = useFormValidation();

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/auth/me');
      const d = res.data;
      setProfile(d);
      setPhone(d.phone || ''); setParentName(d.parentName || ''); setParentPhone(d.parentPhone || '');
      setDistrict(d.district || ''); setSchool(d.school || ''); setStudentClass(d.studentClass || '');
    } catch { toast.error('Failed to load profile.'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    const isValid = personalValidation.validate({
      phone:       { value: phone,       rules: ['phone'],   label: 'Phone' },
      parentPhone: { value: parentPhone, rules: ['phone'],   label: 'Parent Phone' },
      school:      { value: school,      rules: ['max:120'], label: 'School' },
      district:    { value: district,    rules: ['max:80'],  label: 'District' },
    });
    if (!isValid) return toast.error('Please fix the errors before saving.');
    setSaving(true);
    try {
      await axios.put('/api/auth/profile', { phone, parentName, parentPhone, district, school, studentClass });
      toast.success('Profile updated!');
      fetchProfile();
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) personalValidation.validate(serverErrors);
      toast.error(err.response?.data?.message || 'Save failed.');
    } finally { setSaving(false); }
  };

  const handlePassword = async () => {
    const isValid = passValidation.validate({
      old:     { value: passState.old,     rules: ['required'],         label: 'Current Password' },
      new:     { value: passState.new,     rules: ['required', 'min:6'], label: 'New Password' },
      confirm: { value: passState.confirm, rules: ['required'],          label: 'Confirm Password' },
    });
    if (!isValid) return;
    if (passState.new !== passState.confirm) {
      passValidation.validate({ confirm: { value: '' } });
      return toast.error('Passwords do not match');
    }
    setSaving(true);
    try {
      await axios.put('/api/auth/password', { currentPassword: passState.old, newPassword: passState.new });
      toast.success('Password updated!');
      setPassState({ old: '', new: '', confirm: '' });
      passValidation.clearAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Incorrect current password.'); }
    finally { setSaving(false); }
  };

  if (loading || !profile) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: ACCENT, animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      <p style={{ color: '#94a3b8', fontSize: '14px' }}>Loading your profile…</p>
    </div>
  );

  const joinDate = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';
  const tabs = [{ id: 'personal', label: 'Personal Info', icon: User }, { id: 'security', label: 'Security', icon: Shield }];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '60px' }}>
      <style>{PROFILE_CSS}</style>

      {/* ── Hero Banner ── */}
      <div className="profile-hero" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '80px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <div className="profile-hero-inner">
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: '82px', height: '82px', borderRadius: '20px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: '800', color: 'white', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.2)' }}>
              {profile.profilePhoto ? <img src={profile.profilePhoto} alt="" style={{ width: '100%', height: '100%', borderRadius: '18px', objectFit: 'cover' }} /> : profile.name?.charAt(0)}
            </div>
            <button style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '26px', height: '26px', borderRadius: '8px', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', minHeight: '0' }}>
              <Camera size={13} color={ACCENT} />
            </button>
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 'clamp(18px,4vw,26px)', fontWeight: '800', color: 'white', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{profile.name}</h1>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.9)', flexShrink: 0 }}>Scholar</span>
            </div>
            <div className="profile-hero-meta">
              {[{ icon: Mail, text: profile.email }, { icon: GraduationCap, text: profile.studentClass ? `Class ${profile.studentClass}` : 'Class not set' }, { icon: Calendar, text: `Joined ${joinDate}` }].map(({ icon: Icon, text }) => (
                <span key={text} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontWeight: '500' }}>
                  <Icon size={12} /> {text}
                </span>
              ))}
            </div>
          </div>

          {/* Stats pills */}
          <div className="profile-hero-stats">
            {[{ label: 'Batch', value: profile.batchName || '—' }, { label: 'Status', value: 'Active' }].map(stat => (
              <div key={stat.label} className="profile-hero-stat">
                <div style={{ fontSize: '15px', fontWeight: '800', color: 'white' }}>{stat.value}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontWeight: '600', marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="profile-tab-bar">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="profile-tab-btn"
            style={{ background: activeTab === tab.id ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'transparent', color: activeTab === tab.id ? 'white' : '#64748b', boxShadow: activeTab === tab.id ? '0 4px 12px rgba(99,102,241,0.3)' : 'none' }}>
            <tab.icon size={14} />{tab.label}
          </button>
        ))}
      </div>

      {/* ── Personal Tab ── */}
      {activeTab === 'personal' && (
        <div className="profile-form-grid">
          {/* Academic */}
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BookOpen size={17} color="#7c3aed" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Academic Details</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>School and class information</p>
              </div>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <InputField id="school" icon={BookOpen} label="School / Institution" value={school} onChange={e => { setSchool(e.target.value); personalValidation.clearError('school'); }} onBlur={() => personalValidation.validate({ school: { value: school, rules: ['max:120'] } })} error={personalValidation.errors.school} />
              <InputField id="class" icon={GraduationCap} label="Current Class / Grade" value={studentClass} onChange={e => setStudentClass(e.target.value)} />
              <InputField id="district" icon={MapPin} label="District" value={district} onChange={e => { setDistrict(e.target.value); personalValidation.clearError('district'); }} onBlur={() => personalValidation.validate({ district: { value: district, rules: ['max:80'] } })} error={personalValidation.errors.district} />
            </div>
          </div>

          {/* Contact + Save */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={17} color="#0284c7" />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Contact Details</h3>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Your and guardian's info</p>
                </div>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <InputField id="phone" icon={Phone} label="Your Phone" value={phone} onChange={e => { setPhone(e.target.value); personalValidation.clearError('phone'); }} onBlur={() => personalValidation.validate({ phone: { value: phone, rules: ['phone'] } })} error={personalValidation.errors.phone} placeholder="+91 00000 00000" />
                <InputField id="parentName" icon={User} label="Parent / Guardian Name" value={parentName} onChange={e => setParentName(e.target.value)} />
                <InputField id="parentPhone" icon={Phone} label="Parent / Guardian Phone" value={parentPhone} onChange={e => { setParentPhone(e.target.value); personalValidation.clearError('parentPhone'); }} onBlur={() => personalValidation.validate({ parentPhone: { value: parentPhone, rules: ['phone'] } })} error={personalValidation.errors.parentPhone} />
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}>
              <CheckCircle size={17} />{saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* ── Security Tab ── */}
      {activeTab === 'security' && (
        <div style={{ maxWidth: '520px' }}>
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #fef2f2, #fde8e8)', borderBottom: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={17} color="#dc2626" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#991b1b', margin: 0 }}>Password &amp; Security</h3>
                <p style={{ fontSize: '12px', color: '#b91c1c', margin: 0, opacity: 0.7 }}>Keep your account protected</p>
              </div>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ background: '#fef9ec', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Star size={15} color="#d97706" style={{ marginTop: '1px', flexShrink: 0 }} />
                <p style={{ fontSize: '13px', color: '#92400e', margin: 0, lineHeight: 1.5 }}>Use at least 6 characters. Rotate every 90 days for best security.</p>
              </div>
              <PasswordField id="pass-old" label="Current Password" value={passState.old} onChange={e => { setPassState(s => ({ ...s, old: e.target.value })); passValidation.clearError('old'); }} onBlur={() => passValidation.validate({ old: { value: passState.old, rules: ['required'] } })} error={passValidation.errors.old} />
              <PasswordField id="pass-new" label="New Password" value={passState.new} onChange={e => { setPassState(s => ({ ...s, new: e.target.value })); passValidation.clearError('new'); }} onBlur={() => passValidation.validate({ new: { value: passState.new, rules: ['required', 'min:6'] } })} error={passValidation.errors.new} />
              <PasswordField id="pass-confirm" label="Confirm New Password" value={passState.confirm} onChange={e => { setPassState(s => ({ ...s, confirm: e.target.value })); passValidation.clearError('confirm'); }} error={passValidation.errors.confirm} />
              <button onClick={handlePassword} disabled={saving} style={{ width: '100%', padding: '14px', background: '#1e293b', border: 'none', borderRadius: '14px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Lock size={17} />{saving ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
