"use client";

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Settings, Shield, Activity, RefreshCw, CheckCircle, XCircle,
  MessageCircle, Wifi, WifiOff, LogOut, Bell, Globe, Upload,
  Lock, Users, Mail, Phone, ChevronRight, Save, AlertTriangle,
  Eye, EyeOff, Database, Sliders, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirmStore } from '@/store/confirmStore';

const TAB_CONFIG = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'requests', label: 'Profile Requests', icon: Shield },
  { id: 'logs', label: 'Activity Logs', icon: Activity },
];

const STATUS_STYLES = {
  ready:          { bg: '#f0fdf4', border: '#86efac', text: '#14532d', dot: '#22c55e', label: 'Connected' },
  authenticated:  { bg: '#f0fdf4', border: '#86efac', text: '#14532d', dot: '#22c55e', label: 'Authenticated' },
  qr:             { bg: '#fffbeb', border: '#fcd34d', text: '#78350f', dot: '#f59e0b', label: 'Scan QR Code' },
  initializing:   { bg: '#f8fafc', border: '#cbd5e1', text: '#475569', dot: '#94a3b8', label: 'Initializing...' },
  loading:        { bg: '#f8fafc', border: '#cbd5e1', text: '#475569', dot: '#94a3b8', label: 'Loading...' },
  disconnected:   { bg: '#fef2f2', border: '#fca5a5', text: '#7f1d1d', dot: '#ef4444', label: 'Disconnected' },
};

function SectionBlock({ icon: Icon, color, title, subtitle, children }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={17} color={color} />
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--color-text-primary)' }}>{title}</div>
          {subtitle && <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '1px' }}>{subtitle}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

function FieldRow({ label, hint, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '16px', alignItems: 'start', padding: '14px 0', borderBottom: '1px solid var(--color-border)' }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)' }}>{label}</div>
        {hint && <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '3px', lineHeight: '1.4' }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, colorOn = '#22c55e', colorOff = '#cbd5e1' }) {
  return (
    <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
      <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} checked={checked} onChange={onChange} />
      <div style={{
        width: '44px', height: '24px', borderRadius: '12px',
        background: checked ? colorOn : colorOff,
        transition: 'background 0.25s', position: 'relative'
      }}>
        <div style={{
          position: 'absolute', top: '3px',
          left: checked ? '23px' : '3px',
          width: '18px', height: '18px', borderRadius: '50%',
          background: 'white', transition: 'left 0.25s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }} />
      </div>
    </label>
  );
}

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.disconnected;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
      background: s.bg, border: `1px solid ${s.border}`, color: s.text
    }}>
      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

export default function AdminSystem() {
  const [activeTab, setActiveTab] = useState('settings');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [waStatus, setWaStatus] = useState(null);
  const [waLoading, setWaLoading] = useState(false);
  const confirm = useConfirmStore(s => s.confirm);

  const [settingsForm, setSettingsForm] = useState({
    platformName: '',
    supportEmail: '',
    maintenanceMode: false,
    maxUploadSizeMB: 50,
    allowRegistration: false,
    admissionContactEmail: '',
    admissionContactWhatsApp: '',
    notificationPreference: 'whatsapp'
  });

  const set = (key, val) => setSettingsForm(f => ({ ...f, [key]: val }));

  const fetchWaStatus = useCallback(async () => {
    try {
      const res = await axios.get('/api/admin/whatsapp/status');
      setWaStatus(res.data?.data || null);
    } catch { /* silent */ }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'settings') {
        const res = await axios.get('/api/admin/settings');
        if (res.data?.data) {
          const d = res.data.data;
          setSettingsForm({
            platformName: d.platformName || 'Base Learn',
            supportEmail: d.supportEmail || '',
            maintenanceMode: d.maintenanceMode || false,
            maxUploadSizeMB: d.maxUploadSizeMB || 50,
            allowRegistration: d.allowRegistration || false,
            admissionContactEmail: d.admissionContactEmail || '',
            admissionContactWhatsApp: d.admissionContactWhatsApp || '',
            notificationPreference: d.notificationPreference || 'whatsapp'
          });
        }
      } else if (activeTab === 'requests') {
        const res = await axios.get('/api/admin/profile-requests');
        setData(res.data?.data || []);
      } else if (activeTab === 'logs') {
        const res = await axios.get('/api/admin/activity-logs');
        setData(res.data?.data || []);
      }
    } catch {
      toast.error(`Failed to load ${activeTab}`);
      if (activeTab !== 'settings') setData([]);
    } finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
    if (activeTab === 'settings') {
      fetchWaStatus();
      const iv = setInterval(fetchWaStatus, 5000);
      return () => clearInterval(iv);
    }
  }, [activeTab, fetchData, fetchWaStatus]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await axios.put('/api/admin/settings', settingsForm);
      toast.success('Settings saved successfully');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const handleWaLogout = async () => {
    confirm({
      title: 'Reset WhatsApp Session?',
      message: 'This will disconnect the current WhatsApp session and generate a new QR code. This is useful if the connection is stale or you need to switch accounts.',
      confirmText: 'Reset Session',
      type: 'info',
      icon: MessageCircle,
      onConfirm: async () => {
        setWaLoading(true);
        try {
          await axios.post('/api/admin/whatsapp/logout');
          toast.success('WhatsApp session reset — scan the new QR code.');
          setTimeout(fetchWaStatus, 3000);
        } catch { toast.error('Failed to reset WhatsApp'); }
        finally { setWaLoading(false); }
      }
    });
  };

  const handleClearLogs = async () => {
    confirm({
      title: 'Clear All Activity Logs?',
      message: 'Are you sure you want to permanently delete ALL activity logs? This action cannot be undone and will remove all audit trails for the entire platform.',
      confirmText: 'Clear Permanently',
      type: 'danger',
      icon: Trash2,
      onConfirm: async () => {
        setSaving(true);
        try {
          await axios.delete('/api/admin/activity-logs');
          toast.success('Activity logs cleared');
          fetchData();
        } catch { toast.error('Failed to clear logs'); }
        finally { setSaving(false); }
      }
    });
  };

  const handleRequestAction = async (id, status) => {
    try {
      const path = status === 'approved'
        ? `/api/admin/profile-requests/${id}/approve`
        : `/api/admin/profile-requests/${id}/reject`;
      await axios.put(path, {});
      toast.success(`Request ${status}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${status} request`);
    }
  };

  const waConnected = waStatus?.status === 'ready' || waStatus?.status === 'authenticated';

  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: 'var(--color-text-primary)' }}>System Management</h1>
        <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Configure your platform, manage notifications, and audit activity.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: 'var(--color-bg)', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
        {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '9px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
              background: activeTab === id ? 'var(--color-surface)' : 'transparent',
              color: activeTab === id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              boxShadow: activeTab === id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <div className="spinner" />
        </div>
      ) : (
        <>
          {/* ── SETTINGS TAB ── */}
          {activeTab === 'settings' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>

              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Platform Config */}
                <div className="card">
                  <div className="card-header" style={{ padding: '20px 24px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Globe size={17} color="white" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Platform Configuration</h3>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>General platform identity & limits</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '4px 24px 20px' }}>
                    <FieldRow label="Platform Name" hint="Displayed across the platform">
                      <input className="form-input" style={{ fontSize: '13px' }} value={settingsForm.platformName} onChange={e => set('platformName', e.target.value)} />
                    </FieldRow>
                    <FieldRow label="Support Email" hint="Contact email for student queries">
                      <input className="form-input" style={{ fontSize: '13px' }} type="email" value={settingsForm.supportEmail} onChange={e => set('supportEmail', e.target.value)} placeholder="support@baselearn.com" />
                    </FieldRow>
                    <FieldRow label="Upload Limit (MB)" hint="Max file size for uploads">
                      <input className="form-input" style={{ fontSize: '13px', maxWidth: '120px' }} type="number" value={settingsForm.maxUploadSizeMB} onChange={e => set('maxUploadSizeMB', Number(e.target.value))} />
                    </FieldRow>
                    <div style={{ padding: '16px 0 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', background: settingsForm.maintenanceMode ? '#fef2f2' : 'var(--color-bg)', border: `1px solid ${settingsForm.maintenanceMode ? '#fca5a5' : 'var(--color-border)'}`, transition: 'all 0.3s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <AlertTriangle size={16} color={settingsForm.maintenanceMode ? '#ef4444' : 'var(--color-text-secondary)'} />
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '13px' }}>Maintenance Mode</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Locks all non-admin portals</div>
                          </div>
                        </div>
                        <Toggle checked={settingsForm.maintenanceMode} onChange={e => set('maintenanceMode', e.target.checked)} colorOn="#ef4444" />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', marginTop: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Users size={16} color="var(--color-text-secondary)" />
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '13px' }}>Open Registration</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Allow students to self-register</div>
                          </div>
                        </div>
                        <Toggle checked={settingsForm.allowRegistration} onChange={e => set('allowRegistration', e.target.checked)} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="card">
                  <div className="card-header" style={{ padding: '20px 24px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bell size={17} color="white" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Enquiry & Notifications</h3>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>Where to receive student enquiries</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '4px 24px 20px' }}>
                    <FieldRow label="Contact Email" hint="Admin email for enquiry alerts">
                      <input className="form-input" style={{ fontSize: '13px' }} type="email" value={settingsForm.admissionContactEmail} onChange={e => set('admissionContactEmail', e.target.value)} placeholder="admin@baselearn.com" />
                    </FieldRow>
                    <FieldRow label="WhatsApp Number" hint="Include country code, no + (e.g. 919876543210)">
                      <div style={{ position: 'relative' }}>
                        <MessageCircle size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#25D366' }} />
                        <input className="form-input" style={{ fontSize: '13px', paddingLeft: '32px' }} type="text" value={settingsForm.admissionContactWhatsApp} onChange={e => set('admissionContactWhatsApp', e.target.value)} placeholder="919876543210" />
                      </div>
                    </FieldRow>
                    <div style={{ padding: '16px 0 0' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: 'var(--color-text-primary)' }}>Route Enquiries To</div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {[
                          { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
                          { value: 'email',    label: 'Email',    icon: Mail,           color: '#6366f1' },
                          { value: 'both',     label: 'Both',     icon: Bell,           color: '#f59e0b' },
                        ].map(({ value, label, icon: Icon, color }) => (
                          <label key={value} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 16px', borderRadius: '9px', cursor: 'pointer',
                            border: `2px solid ${settingsForm.notificationPreference === value ? color : 'var(--color-border)'}`,
                            background: settingsForm.notificationPreference === value ? `${color}12` : 'var(--color-bg)',
                            transition: 'all 0.2s', fontSize: '13px', fontWeight: '600'
                          }}>
                            <input type="radio" name="notifPref" value={value} checked={settingsForm.notificationPreference === value} onChange={() => set('notificationPreference', value)} style={{ display: 'none' }} />
                            <Icon size={14} color={settingsForm.notificationPreference === value ? color : 'var(--color-text-secondary)'} />
                            <span style={{ color: settingsForm.notificationPreference === value ? color : 'var(--color-text-secondary)' }}>{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '14px 24px', borderRadius: '10px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                    background: 'linear-gradient(135deg, var(--color-primary), #6366f1)',
                    color: 'white', fontWeight: '700', fontSize: '14px',
                    opacity: saving ? 0.7 : 1, transition: 'all 0.2s',
                    boxShadow: '0 4px 14px rgba(99,102,241,0.35)'
                  }}
                >
                  {saving ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                  {saving ? 'Saving...' : 'Save All Settings'}
                </button>
              </div>

              {/* Right Column — WhatsApp Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px' }}>
                <div className="card" style={{ overflow: 'hidden' }}>
                  {/* Header band */}
                  <div style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', padding: '20px 20px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MessageCircle size={22} color="white" />
                        <div>
                          <div style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>WhatsApp</div>
                          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px' }}>Notification Gateway</div>
                        </div>
                      </div>
                      {waStatus && <StatusPill status={waStatus.status} />}
                    </div>
                  </div>

                  <div style={{ padding: '20px' }}>
                    {!waStatus ? (
                      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                        <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px', display: 'block' }} />
                        Connecting...
                      </div>
                    ) : (
                      <>
                        {/* Connected number */}
                        {waStatus.wid && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#f0fdf4', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' }}>
                            <Phone size={13} color="#22c55e" />
                            <span style={{ color: '#166534', fontWeight: '600' }}>+{waStatus.wid}</span>
                          </div>
                        )}

                        {/* QR Code */}
                        {waStatus.status === 'qr' && waStatus.qrCode && (
                          <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '12px', border: '2px dashed #25D366', marginBottom: '14px' }}>
                            <p style={{ margin: '0 0 10px', fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>Scan to Connect</p>
                            <img src={waStatus.qrCode} alt="WhatsApp QR" style={{ width: '200px', height: '200px', borderRadius: '6px', display: 'block', margin: '0 auto' }} />
                            <p style={{ margin: '10px 0 0', fontSize: '11px', color: '#64748b', lineHeight: '1.5' }}>
                              WhatsApp → Linked Devices → Link a Device
                            </p>
                          </div>
                        )}

                        {/* Status banners */}
                        {waConnected && (
                          <div style={{ padding: '12px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', fontSize: '12px', color: '#14532d', marginBottom: '14px', lineHeight: '1.5' }}>
                            ✅ Connected! Enquiries will be sent to <strong>{settingsForm.admissionContactWhatsApp || '—'}</strong>
                          </div>
                        )}
                        {waStatus.status === 'disconnected' && (
                          <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '12px', color: '#7f1d1d', marginBottom: '14px', lineHeight: '1.5' }}>
                            ⚠️ Disconnected. Reset to generate a new QR code.
                          </div>
                        )}
                        {(waStatus.status === 'initializing' || waStatus.status === 'loading') && (
                          <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#475569', marginBottom: '14px', lineHeight: '1.5' }}>
                            ⏳ Starting up WhatsApp service...
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={fetchWaStatus}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text-secondary)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            <RefreshCw size={13} /> Refresh
                          </button>
                          <button
                            onClick={handleWaLogout}
                            disabled={waLoading}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', fontSize: '12px', fontWeight: '600', cursor: 'pointer', opacity: waLoading ? 0.6 : 1 }}
                          >
                            {waLoading ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <LogOut size={13} />}
                            Reset
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick info card */}
                <div style={{ padding: '16px 18px', borderRadius: '12px', background: 'linear-gradient(135deg, #ede9fe, #dbeafe)', border: '1px solid #c4b5fd', fontSize: '12px', color: '#4c1d95', lineHeight: '1.6' }}>
                  <div style={{ fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>💡 How it works</div>
                  When a student submits an enquiry, it's automatically forwarded to your configured WhatsApp number and/or email based on your notification preference.
                </div>
              </div>
            </div>
          )}

          {/* ── REQUESTS TAB ── */}
          {activeTab === 'requests' && (
            <div className="card">
              <div className="card-header" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Pending Account Updates</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Review and approve staff profile change requests</p>
                </div>
                {data && <span style={{ padding: '4px 10px', background: 'var(--color-bg)', borderRadius: '20px', fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>{data.length} pending</span>}
              </div>
              {(!data || data.length === 0) ? (
                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  <Shield size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>All clear!</div>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>No pending profile requests at this time.</div>
                </div>
              ) : (
                <div style={{ padding: '0 24px 24px' }}>
                  {data.map(req => (
                    <div key={req._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '10px', border: '1px solid var(--color-border)', marginBottom: '10px', background: 'var(--color-bg)' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '14px' }}>{req.userId?.name || req.userId?.email || '—'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px', textTransform: 'capitalize' }}>{req.userModel} · Change {req.type}</div>
                        <div style={{ fontSize: '13px', marginTop: '6px' }}>
                          <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>→ </span>
                          <strong>{req.newValue}</strong>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleRequestAction(req._id, 'approved')} style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', background: '#f0fdf4', color: '#22c55e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Approve">
                          <CheckCircle size={17} />
                        </button>
                        <button onClick={() => handleRequestAction(req._id, 'rejected')} style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Reject">
                          <XCircle size={17} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── LOGS TAB ── */}
          {activeTab === 'logs' && (
            <div className="card">
              <div className="card-header" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Platform Audit Log</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Last 100 system actions</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                    <RefreshCw size={13} /> Refresh
                  </button>
                  <button onClick={handleClearLogs} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fef2f2', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#ef4444' }}>
                    <Trash2 size={13} /> Clear All Logs
                  </button>
                </div>
              </div>
              {(!data || data.length === 0) ? (
                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  <Activity size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>No recent activity</div>
                </div>
              ) : (
                <div style={{ padding: '0 24px 24px' }}>
                  {data.map((log, i) => (
                    <div key={log._id} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 0', borderBottom: i < data.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Activity size={15} color="var(--color-text-secondary)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: '700', fontSize: '13px' }}>{log.action}</span>
                          <span style={{ padding: '2px 7px', borderRadius: '12px', fontSize: '11px', background: 'var(--color-bg)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', textTransform: 'capitalize' }}>{log.actorRole}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '3px' }}>
                          By <strong>{log.actorName || '—'}</strong> · {log.target || [log.targetModel, log.targetId].filter(Boolean).join(' · ') || '—'}
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {new Date(log.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
