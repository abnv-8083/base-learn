"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Lock, Shield, Camera, CheckCircle, Eye, EyeOff, Activity, Settings, Users, Key, Star } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

function InputField({ icon: Icon, label, value, onChange, type = 'text', placeholder, readOnly }) {
  const ACCENT = '#ef4444';
  return (
    <div>
      <label style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {Icon && <Icon size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: readOnly ? '#cbd5e1' : ACCENT }} />}
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
          style={{ width: '100%', padding: Icon ? '12px 14px 12px 40px' : '12px 14px', background: readOnly ? '#fafafa' : 'white', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: '500', color: readOnly ? '#94a3b8' : '#1e293b', outline: 'none', transition: 'all 0.2s', cursor: readOnly ? 'not-allowed' : 'text' }}
          onFocus={e => { if (!readOnly) { e.target.style.borderColor = ACCENT; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)'; }}}
          onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
        />
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#ef4444' }} />
        <input type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder="••••••••"
          style={{ width: '100%', padding: '12px 44px 12px 40px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: '500', color: '#1e293b', outline: 'none', transition: 'all 0.2s' }}
          onFocus={e => { e.target.style.borderColor = '#ef4444'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)'; }}
          onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
        />
        <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

export default function AdminProfile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('identity');
  const [systemStats, setSystemStats] = useState({ users: 0, faculty: 0, students: 0 });

  const [name, setName] = useState('');
  const [passState, setPassState] = useState({ old: '', new: '', confirm: '' });

  useEffect(() => { fetchProfile(); fetchStats(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/auth/me');
      const d = res.data; setProfile(d); setName(d.name || '');
    } catch { toast.error('Failed to load profile.'); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const [usersRes, facultyRes] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/faculty')
      ]);
      setSystemStats({
        users: usersRes.data?.length || 0,
        faculty: facultyRes.data?.length || 0,
        students: (usersRes.data || []).filter(u => u.role === 'student').length
      });
    } catch {}
  };

  const handleSaveName = async () => {
    if (!name.trim()) return toast.error('Name cannot be empty');
    setSaving(true);
    try {
      await axios.put('/api/auth/profile', { name });
      toast.success('Profile updated!'); fetchProfile();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handlePassword = async () => {
    if (passState.new !== passState.confirm) return toast.error('Passwords do not match');
    if (passState.new.length < 6) return toast.error('Minimum 6 characters required');
    setSaving(true);
    try {
      await axios.put('/api/auth/password', { currentPassword: passState.old, newPassword: passState.new });
      toast.success('Password updated!'); setPassState({ old: '', new: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Incorrect current password.'); }
    finally { setSaving(false); }
  };

  if (loading || !profile) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid #fecaca', borderTopColor: '#ef4444', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );

  const joinDate = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Platform Founder';
  const tabs = [{ id: 'identity', label: 'Identity', icon: User }, { id: 'security', label: 'Security', icon: Key }];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Hero Banner — Deep Red/Crimson Admin Theme */}
      <div style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 40%, #dc2626 100%)', borderRadius: '24px', padding: '40px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '30%', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        
        {/* Subtle pattern overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.015) 40px, rgba(255,255,255,0.015) 80px)', borderRadius: '24px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: '88px', height: '88px', borderRadius: '20px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '800', color: 'white', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.25)' }}>
              {profile.profilePhoto ? <img src={profile.profilePhoto} alt="" style={{ width: '100%', height: '100%', borderRadius: '18px', objectFit: 'cover' }} /> : profile.name?.charAt(0)}
            </div>
            <button style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '26px', height: '26px', borderRadius: '8px', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              <Camera size={13} color="#ef4444" />
            </button>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'white', margin: 0 }}>{profile.name}</h1>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', color: 'white' }}>
                🔑 Administrator
              </span>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontWeight: '500' }}>
                <Mail size={13} /> {profile.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontWeight: '500' }}>
                <Star size={13} /> Joined {joinDate}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: '600', background: 'rgba(255,255,255,0.12)', padding: '2px 10px', borderRadius: '20px' }}>
                <Activity size={12} /> Active
              </span>
            </div>
          </div>

          {/* System Stats */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { icon: Users, label: 'Total Users', value: systemStats.users },
              { icon: User, label: 'Faculty', value: systemStats.faculty },
              { icon: Shield, label: 'Access Level', value: 'Root' }
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.12)', padding: '12px 18px', borderRadius: '14px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <stat.icon size={14} color="rgba(255,255,255,0.6)" style={{ margin: '0 auto 4px' }} />
                <div style={{ fontSize: '17px', fontWeight: '800', color: 'white' }}>{stat.value}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: '600', marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', background: 'white', padding: '6px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', width: 'fit-content' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s', background: activeTab === tab.id ? 'linear-gradient(135deg, #991b1b, #ef4444)' : 'transparent', color: activeTab === tab.id ? 'white' : '#64748b', boxShadow: activeTab === tab.id ? '0 4px 12px rgba(239,68,68,0.35)' : 'none' }}>
            <tab.icon size={15} />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'identity' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Identity Card */}
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={17} color="#ef4444" />
              </div>
              <div><h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Administrator Identity</h3><p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Primary platform credentials</p></div>
            </div>
            <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <InputField icon={User} label="Display Name" value={name} onChange={e => setName(e.target.value)} />
              <InputField icon={Mail} label="Email Address (read-only)" value={profile.email} readOnly />
              <InputField icon={Shield} label="Access Level" value="Platform Administrator" readOnly />
              <InputField icon={Activity} label="Account Status" value="Active" readOnly />
              
              <button onClick={handleSaveName} disabled={saving} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #991b1b, #ef4444)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }}>
                <CheckCircle size={17} />{saving ? 'Saving…' : 'Update Identity'}
              </button>
            </div>
          </div>

          {/* Admin Privileges Info */}
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Settings size={17} color="#ef4444" />
              </div>
              <div><h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Platform Overview</h3><p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>System status at a glance</p></div>
            </div>
            <div style={{ padding: '28px' }}>
              {[
                { icon: Users, label: 'Total Platform Users', value: systemStats.users, color: '#4f46e5' },
                { icon: User, label: 'Active Faculty Members', value: systemStats.faculty, color: '#10b981' },
                { icon: Shield, label: 'Content Approval Rights', value: 'Full Access', color: '#ef4444' },
                { icon: Key, label: 'Profile Request Authority', value: 'Unrestricted', color: '#f59e0b' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <item.icon size={15} color={item.color} />
                    </div>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div style={{ maxWidth: '520px' }}>
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #fef2f2, #fde8e8)', borderBottom: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Key size={17} color="#dc2626" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#991b1b', margin: 0 }}>Root Password Management</h3>
                <p style={{ fontSize: '12px', color: '#b91c1c', margin: 0, opacity: 0.7 }}>Highest-privilege credential</p>
              </div>
            </div>
            <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Shield size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontSize: '13px', color: '#7f1d1d', margin: 0, lineHeight: 1.5 }}>
                  As platform administrator, your password controls root-level access. Rotate frequently and never share with others.
                </p>
              </div>
              <PasswordField label="Current Password" value={passState.old} onChange={e => setPassState(s => ({ ...s, old: e.target.value }))} />
              <PasswordField label="New Password" value={passState.new} onChange={e => setPassState(s => ({ ...s, new: e.target.value }))} />
              <PasswordField label="Confirm New Password" value={passState.confirm} onChange={e => setPassState(s => ({ ...s, confirm: e.target.value }))} />
              <button onClick={handlePassword} disabled={saving || !passState.old || !passState.new || !passState.confirm} style={{ width: '100%', padding: '14px', background: '#1e293b', border: 'none', borderRadius: '14px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer', opacity: (!passState.old || !passState.new || !passState.confirm) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                <Key size={17} />{saving ? 'Rotating…' : 'Rotate Root Key'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
