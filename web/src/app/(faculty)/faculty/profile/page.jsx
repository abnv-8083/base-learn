"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Phone, MapPin, Mail, Lock, Shield, Award, Camera, BookOpen, CheckCircle, Eye, EyeOff, GraduationCap, Briefcase, Star, History, Send, X as XIcon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useFormValidation, FieldError } from '@/hooks/useFormValidation';
import toast from 'react-hot-toast';

const ACCENT = '#10b981';

function InputField({ icon: Icon, label, value, onChange, onBlur, type = 'text', placeholder, readOnly, error, id }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label htmlFor={id} style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {Icon && <Icon size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: readOnly ? '#cbd5e1' : error ? '#ef4444' : focused ? ACCENT : '#94a3b8', transition: 'color 0.2s' }} />}
        <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          style={{ width: '100%', padding: Icon ? '12px 14px 12px 40px' : '12px 14px', background: readOnly ? '#fafafa' : 'white', border: `1.5px solid ${error ? '#ef4444' : focused ? ACCENT : '#e2e8f0'}`, borderRadius: '12px', fontSize: '14px', fontWeight: '500', color: readOnly ? '#94a3b8' : '#1e293b', outline: 'none', transition: 'all 0.2s', cursor: readOnly ? 'not-allowed' : 'text', boxShadow: error ? '0 0 0 3px rgba(239,68,68,0.1)' : focused ? `0 0 0 3px ${ACCENT}18` : 'none' }}
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder, accentColor = '#10b981' }) {
  return (
    <div>
      <label style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>{label}</label>
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={4}
        style={{ width: '100%', padding: '12px 14px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: '500', color: '#1e293b', outline: 'none', transition: 'all 0.2s', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
        onFocus={e => { e.target.style.borderColor = accentColor; e.target.style.boxShadow = `0 0 0 3px ${accentColor}1a`; }}
        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );
}

function PasswordField({ label, value, onChange, accentColor = '#10b981' }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: accentColor }} />
        <input type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder="••••••••"
          style={{ width: '100%', padding: '12px 44px 12px 40px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: '500', color: '#1e293b', outline: 'none', transition: 'all 0.2s' }}
          onFocus={e => { e.target.style.borderColor = accentColor; e.target.style.boxShadow = `0 0 0 3px ${accentColor}1a`; }}
          onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
        />
        <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

export default function FacultyProfile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('credentials');
  const [pendingRequest, setPendingRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestEmail, setRequestEmail] = useState('');
  
  const profileValidation = useFormValidation();
  const passValidation = useFormValidation();
  const requestValidation = useFormValidation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [department, setDepartment] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [about, setAbout] = useState('');
  const [passState, setPassState] = useState({ old: '', new: '', confirm: '' });

  useEffect(() => { fetchProfile(); fetchPendingRequest(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/auth/me');
      const d = res.data;
      setProfile(d);
      setName(d.name || ''); setPhone(d.phone || ''); setDistrict(d.district || '');
      setDepartment(d.department || ''); setQualification(d.qualification || '');
      setExperience(d.experience || ''); setSpecialization(d.specialization || ''); setAbout(d.about || '');
    } catch { toast.error('Failed to load profile.'); }
    finally { setLoading(false); }
  };

  const fetchPendingRequest = async () => {
    try { const res = await axios.get('/api/auth/profile-request/pending'); setPendingRequest(res.data.data); } catch {}
  };

  const handleSave = async () => {
    const isValid = profileValidation.validate({
      name:           { value: name,           rules: ['required', 'min:2', 'max:60', 'name'] },
      phone:          { value: phone,          rules: ['phone'] },
      qualification:  { value: qualification,  rules: ['max:80'] },
      experience:     { value: experience,     rules: ['max:40'] },
      specialization: { value: specialization, rules: ['max:100'] },
    });
    if (!isValid) return toast.error('Please fix the errors before saving.');

    try {
      await axios.put('/api/auth/profile', { name, phone, district, department, qualification, experience, specialization, about });
      toast.success('Profile updated!'); fetchProfile();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handlePassword = async () => {
    const isValid = passValidation.validate({
      old:     { value: passState.old,     rules: ['required'],      label: 'Current Password' },
      new:     { value: passState.new,     rules: ['required', 'min:6'], label: 'New Password' },
      confirm: { value: passState.confirm, rules: ['required'],      label: 'Confirm Password' },
    });
    if (!isValid) return;
    if (passState.new !== passState.confirm) return toast.error('Passwords do not match');

    setSaving(true);
    try {
      await axios.put('/api/auth/password', { currentPassword: passState.old, newPassword: passState.new });
      toast.success('Password updated!'); setPassState({ old: '', new: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Incorrect password.'); }
    finally { setSaving(false); }
  };

  const handleRequest = async () => {
    const isValid = requestValidation.validate({
      email: { value: requestEmail, rules: ['required', 'email'], label: 'New Email' },
    });
    if (!isValid) return;
    if (requestEmail === profile?.email) return toast.error('New email must differ from your current email');

    setSaving(true);
    try {
      await axios.post('/api/auth/profile-request', { type: 'email', newValue: requestEmail });
      toast.success('Email change request submitted!'); fetchPendingRequest();
      setShowRequestModal(false); setRequestEmail('');
    } catch (err) { toast.error(err.response?.data?.message || 'Submission failed.'); }
    finally { setSaving(false); }
  };

  if (loading || !profile) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid #d1fae5', borderTopColor: ACCENT, animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );

  const joinDate = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';
  const tabs = [{ id: 'credentials', label: 'Credentials', icon: Award }, { id: 'contact', label: 'Contact', icon: Phone }, { id: 'security', label: 'Security', icon: Shield }];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 40%, #10b981 100%)', borderRadius: '24px', padding: '40px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '200px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: '88px', height: '88px', borderRadius: '20px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '800', color: 'white', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.2)' }}>
              {profile.profilePhoto ? <img src={profile.profilePhoto} alt="" style={{ width: '100%', height: '100%', borderRadius: '18px', objectFit: 'cover' }} /> : profile.name?.charAt(0)}
            </div>
            <button style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '26px', height: '26px', borderRadius: '8px', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              <Camera size={13} color={ACCENT} />
            </button>
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'white', margin: 0 }}>{profile.name}</h1>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.9)' }}>Faculty</span>
              {pendingRequest && <span style={{ background: 'rgba(251,191,36,0.25)', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', color: '#fde68a', border: '1px solid rgba(251,191,36,0.4)' }}>⏳ Pending Request</span>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              {[{ icon: Mail, text: profile.email }, { icon: Briefcase, text: profile.department || 'No Department' }, { icon: GraduationCap, text: profile.qualification || 'Qualification not set' }, { icon: MapPin, text: joinDate }].map(({ icon: Icon, text }) => (
                <span key={text} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontWeight: '500' }}>
                  <Icon size={13} /> {text}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {[{ label: 'Experience', value: profile.experience || '—' }, { label: 'Teaching', value: profile.teachingMode || 'Online' }].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.12)', padding: '12px 18px', borderRadius: '14px', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: 'white' }}>{stat.value}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontWeight: '600', marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', background: 'white', padding: '6px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', width: 'fit-content' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s', background: activeTab === tab.id ? `linear-gradient(135deg, ${ACCENT}, #047857)` : 'transparent', color: activeTab === tab.id ? 'white' : '#64748b', boxShadow: activeTab === tab.id ? `0 4px 12px ${ACCENT}50` : 'none' }}>
            <tab.icon size={15} />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'credentials' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={17} color={ACCENT} />
              </div>
              <div><h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Professional Credentials</h3><p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Academic qualifications</p></div>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <InputField id="name" icon={User} label="Full Name" value={name} onChange={e => setName(e.target.value)} error={profileValidation.errors.name} onBlur={() => profileValidation.validateField('name', name, ['required', 'min:2', 'max:60', 'name'])} />
              <InputField id="dept" icon={Briefcase} label="Department" value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. Science Faculty" />
              <InputField id="qual" icon={GraduationCap} label="Highest Qualification" value={qualification} onChange={e => setQualification(e.target.value)} error={profileValidation.errors.qualification} onBlur={() => profileValidation.validateField('qualification', qualification, ['max:80'])} />
              <InputField id="exp" icon={Star} label="Years of Experience" value={experience} onChange={e => setExperience(e.target.value)} error={profileValidation.errors.experience} onBlur={() => profileValidation.validateField('experience', experience, ['max:40'])} />
              <InputField id="spec" icon={BookOpen} label="Core Specialization" value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="e.g. Organic Chemistry" error={profileValidation.errors.specialization} onBlur={() => profileValidation.validateField('specialization', specialization, ['max:100'])} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', flex: 1 }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={17} color={ACCENT} />
                </div>
                <div><h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Professional Bio</h3><p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Your teaching philosophy</p></div>
              </div>
              <div style={{ padding: '24px' }}>
                <TextAreaField label="About You" value={about} onChange={e => setAbout(e.target.value)} placeholder="Share your teaching approach, values, and goals…" />
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: '14px', background: `linear-gradient(135deg, ${ACCENT}, #047857)`, border: 'none', borderRadius: '14px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: `0 4px 16px ${ACCENT}40` }}>
              <CheckCircle size={17} />{saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'contact' && (
        <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={17} color={ACCENT} />
              </div>
              <div><h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Contact Information</h3></div>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <InputField id="phone" icon={Phone} label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} error={profileValidation.errors.phone} onBlur={() => profileValidation.validateField('phone', phone, ['phone'])} />
              <InputField id="district" icon={MapPin} label="District" value={district} onChange={e => setDistrict(e.target.value)} />
              
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Academic Email</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ flex: 1, padding: '12px 14px 12px 40px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: '500', color: '#94a3b8', position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} />
                    {profile.email}
                  </div>
                  <button onClick={() => setShowRequestModal(true)} style={{ padding: '12px 16px', background: pendingRequest ? '#fef3c7' : '#f0fdf4', border: `1.5px solid ${pendingRequest ? '#fde68a' : '#bbf7d0'}`, borderRadius: '12px', color: pendingRequest ? '#d97706' : ACCENT, fontSize: '12px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {pendingRequest ? <><History size={13} />Pending</> : <><Send size={13} />Request Change</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: '14px', background: `linear-gradient(135deg, ${ACCENT}, #047857)`, border: 'none', borderRadius: '14px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: `0 4px 16px ${ACCENT}40` }}>
            <CheckCircle size={17} />{saving ? 'Saving…' : 'Save Contact Info'}
          </button>
        </div>
      )}

      {activeTab === 'security' && (
        <div style={{ maxWidth: '520px' }}>
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #fef2f2, #fde8e8)', borderBottom: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={17} color="#dc2626" />
              </div>
              <div><h3 style={{ fontSize: '15px', fontWeight: '700', color: '#991b1b', margin: 0 }}>Password & Security</h3></div>
            </div>
            <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <PasswordField label="Current Password" value={passState.old} onChange={e => setPassState(s => ({ ...s, old: e.target.value }))} accentColor={ACCENT} />
              <PasswordField label="New Password" value={passState.new} onChange={e => setPassState(s => ({ ...s, new: e.target.value }))} accentColor={ACCENT} />
              <PasswordField label="Confirm Password" value={passState.confirm} onChange={e => setPassState(s => ({ ...s, confirm: e.target.value }))} accentColor={ACCENT} />
              <button onClick={handlePassword} disabled={saving || !passState.old || !passState.new || !passState.confirm} style={{ width: '100%', padding: '14px', background: '#1e293b', border: 'none', borderRadius: '14px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer', opacity: (!passState.old || !passState.new || !passState.confirm) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Lock size={17} />{saving ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '440px', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={20} color={ACCENT} />
                </div>
                <div><h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>Request Email Change</h3><p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Admin approval required</p></div>
              </div>
              <button onClick={() => setShowRequestModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><XIcon size={16} /></button>
            </div>
            <div style={{ padding: '28px' }}>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: 1.6 }}>Email changes require verification by the Central Administration team to maintain academic integrity.</p>
              <InputField icon={Mail} label="New Email Address" value={requestEmail} onChange={e => setRequestEmail(e.target.value)} placeholder="teacher@baselearn.com" type="email" accentColor={ACCENT} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
                <button onClick={() => setShowRequestModal(false)} style={{ padding: '12px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', color: '#64748b', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleRequest} disabled={!requestEmail || saving} style={{ padding: '12px', background: `linear-gradient(135deg, ${ACCENT}, #047857)`, border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer', opacity: !requestEmail ? 0.5 : 1, boxShadow: `0 4px 12px ${ACCENT}40` }}>Submit Request</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
