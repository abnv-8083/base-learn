"use client";

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Video, Calendar, Clock, MapPin, Play, Plus, X, Trash2,
  BarChart2, StopCircle, FileText, Info, Zap, Radio, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import LiveAnalyticsModal from '@/components/LiveAnalyticsModal';

// ── Helpers ────────────────────────────────────────────────────────────────
function FormField({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px', letterSpacing: '0.05em' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '5px' }}>{hint}</p>}
    </div>
  );
}

function getStatusStyle(status) {
  switch (status) {
    case 'ongoing':   return { bg: '#fee2e2', color: '#dc2626', label: '🔴 Live Now',  bar: 'linear-gradient(90deg,#ef4444,#f97316)' };
    case 'completed': return { bg: '#f1f5f9', color: '#475569', label: '✅ Finished',  bar: '#e2e8f0' };
    case 'cancelled': return { bg: '#fef2f2', color: '#991b1b', label: 'Cancelled',    bar: '#fca5a5' };
    default:          return { bg: '#eff6ff', color: '#2563eb', label: '📅 Upcoming',  bar: 'var(--color-primary)' };
  }
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function FacultyLiveClasses() {
  const { user } = useAuthStore();

  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [subjects, setSubjects]       = useState([]);
  const [batches, setBatches]         = useState([]);
  const [selectedAnalytics, setSelectedAnalytics] = useState(null);

  // ── "New Session" chooser modal ──
  const [showChooser, setShowChooser] = useState(false);

  // ── Instant session modal ──
  const [showInstant, setShowInstant] = useState(false);
  const [instantForm, setInstantForm] = useState({ title: '', subject: '', batchId: '', duration: 60 });
  const [instantSaving, setInstantSaving] = useState(false);

  // ── Schedule session modal ──
  const [showSchedule, setShowSchedule] = useState(false);
  const [schedForm, setSchedForm]       = useState({});
  const [schedSaving, setSchedSaving]   = useState(false);

  // ── End Class modal ──
  const [showEndModal,   setShowEndModal]   = useState(false);
  const [endingId,       setEndingId]       = useState(null);
  const [notesPdf,       setNotesPdf]       = useState(null);
  const [ending,         setEnding]         = useState(false);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (user?.role === 'faculty') {
      fetchClasses();
      fetchSubjects();
      fetchBatches();
      intervalRef.current = setInterval(() => fetchClasses(), 30000);
    }
    return () => clearInterval(intervalRef.current);
  }, [user]);

  // ── API helpers ────────────────────────────────────────────────────────
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/faculty/live-classes');
      setLiveClasses(Array.isArray(res.data.data) ? res.data.data : []);
    } catch { toast.error('Failed to load live sessions.'); setLiveClasses([]); }
    finally { setLoading(false); }
  };

  const fetchSubjects = async () => {
    try { const r = await axios.get('/api/faculty/subjects'); setSubjects(Array.isArray(r.data.data) ? r.data.data : []); } catch {}
  };

  const fetchBatches = async () => {
    try { const r = await axios.get('/api/faculty/batches'); setBatches(Array.isArray(r.data.data) ? r.data.data : []); } catch {}
  };

  // ── Instant session ────────────────────────────────────────────────────
  const handleInstantSave = async () => {
    if (!instantForm.title?.trim()) return toast.error('Session title is required.');
    if (!instantForm.subject)       return toast.error('Please select a subject.');
    setInstantSaving(true);
    try {
      // Create with current time as scheduledAt
      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const date = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
      const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

      const created = await axios.post('/api/faculty/live-classes', {
        ...instantForm, date, time, scheduledAt: now.toISOString()
      });
      const sessionId = created.data.data._id;

      toast.success('Room created! Opening BigBlueButton…');
      setShowInstant(false);
      setInstantForm({ title: '', subject: '', batchId: '', duration: 60 });

      // Immediately start the BBB session
      const res = await axios.get(`/api/faculty/live-classes/${sessionId}/start`);
      if (res.data.data?.joinUrl) {
        window.open(res.data.data.joinUrl, '_blank');
        toast.success('🔴 Instant class is LIVE!');
      }
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start instant session.');
    } finally { setInstantSaving(false); }
  };

  // ── Scheduled session ──────────────────────────────────────────────────
  const handleScheduleSave = async () => {
    if (!schedForm.title?.trim())          return toast.error('Session title is required.');
    if (!schedForm.subject)                return toast.error('Please select a subject.');
    if (!schedForm.batchId)                return toast.error('Please select a target batch.');
    if (!schedForm.date || !schedForm.time) return toast.error('Date and time are required.');
    setSchedSaving(true);
    try {
      await axios.post('/api/faculty/live-classes', schedForm);
      toast.success('Session scheduled successfully!');
      setShowSchedule(false);
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule class');
    } finally { setSchedSaving(false); }
  };

  // ── Start / End ────────────────────────────────────────────────────────
  const handleStartSession = async (id) => {
    try {
      const res = await axios.get(`/api/faculty/live-classes/${id}/start`);
      if (res.data.data?.joinUrl) { window.open(res.data.data.joinUrl, '_blank'); fetchClasses(); }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to start session.'); }
  };

  const handleEndSession = async () => {
    if (!endingId) return;
    setEnding(true);
    try {
      const formData = new FormData();
      if (notesPdf) formData.append('notesPdf', notesPdf);

      await axios.post(
        `/api/faculty/live-classes/${endingId}/end`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      toast.success('Class ended! Recording & notes sent to instructor for review.');
      setShowEndModal(false); setEndingId(null); setNotesPdf(null);
      fetchClasses();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to end session.'); }
    finally { setEnding(false); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete session "${title}"?`)) return;
    try { await axios.delete(`/api/faculty/live-classes/${id}`); toast.success('Session deleted.'); fetchClasses(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete.'); }
  };

  // ── Sorted list ────────────────────────────────────────────────────────
  const sorted = [...liveClasses].sort((a, b) => {
    const order = { ongoing: 0, upcoming: 1, completed: 2, cancelled: 3 };
    return (order[a.status] ?? 4) - (order[b.status] ?? 4) || new Date(b.scheduledAt) - new Date(a.scheduledAt);
  });

  // ── Modal base ─────────────────────────────────────────────────────────
  const Overlay = ({ children, z = 1000 }) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: z, backdropFilter: 'blur(8px)', padding: '20px' }}>
      {children}
    </div>
  );

  // ─────────────────────────────────────── RENDER
  return (
    <div style={{ paddingBottom: '80px' }}>
      <style>{`
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.85)} }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Live Broadcast Hub</h1>
          <p className="page-subtitle">Manage your BigBlueButton live sessions — instant or scheduled.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowChooser(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '14px', fontWeight: '800' }}
        >
          <Plus size={20} /> New Session
        </button>
      </div>

      {/* ── Cards ── */}
      {loading ? (
        <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }} />
      ) : (
        <div className="card-grid" style={{ gap: '24px' }}>
          {sorted.length === 0 ? (
            <div style={{ gridColumn: '1/-1', padding: '100px 40px', textAlign: 'center', borderRadius: '24px', border: '2px dashed var(--color-border)' }}>
              <Video size={56} color="var(--color-text-muted)" style={{ margin: '0 auto 20px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>No Sessions Yet</h3>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Start an instant session or plan one for later.</p>
              <button className="btn btn-primary" onClick={() => setShowChooser(true)} style={{ borderRadius: '12px', padding: '12px 28px', fontWeight: '800' }}>
                <Plus size={16} /> New Session
              </button>
            </div>
          ) : sorted.map(session => {
            const st = getStatusStyle(session.status);
            const isOngoing = session.status === 'ongoing';
            const isCompleted = session.status === 'completed';
            return (
              <div key={session._id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', border: isOngoing ? '2px solid #fca5a5' : '1px solid var(--color-border)', boxShadow: isOngoing ? '0 0 0 4px rgba(239,68,68,0.08)' : 'none', transition: 'transform .2s, box-shadow .2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = isOngoing ? '0 8px 32px rgba(239,68,68,0.2)' : '0 8px 32px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = isOngoing ? '0 0 0 4px rgba(239,68,68,0.08)' : 'none'; }}
              >
                {/* Accent bar */}
                <div style={{ height: '4px', background: st.bar }} />

                <div style={{ padding: '22px 24px', flex: 1 }}>
                  {/* Status row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', background: st.bg, color: st.color, textTransform: 'uppercase' }}>
                      {isOngoing && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444', animation: 'livePulse 1.4s infinite' }} />}
                      {st.label}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                      {session.duration || 60}m
                    </span>
                  </div>

                  <h3 style={{ fontSize: '19px', fontWeight: '900', color: 'var(--color-text-primary)', margin: '0 0 6px', lineHeight: 1.3 }}>{session.title}</h3>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={12} />
                    {session.subject?.name || (typeof session.subject === 'string' ? session.subject : 'General')}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '14px', background: 'var(--color-bg)', borderRadius: '12px' }}>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: '900', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Date</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '700' }}>
                        <Calendar size={13} color="var(--color-primary)" />
                        {new Date(session.scheduledAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: '900', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Start Time</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '700' }}>
                        <Clock size={13} color="var(--color-primary)" />
                        {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '10px', background: 'var(--color-surface)' }}>
                  {isCompleted ? (
                    <>
                      <button onClick={() => setSelectedAnalytics(session)} className="btn btn-secondary" style={{ flex: 1, height: '42px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <BarChart2 size={15} /> Local Analytics
                      </button>
                      {session.internalMeetingId && (
                        <a 
                          href={`https://test-install.blindsidenetworks.com/learning-analytics-dashboard/?meeting=${session.internalMeetingId}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-secondary" 
                          style={{ flex: 1, height: '42px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}
                          title="Premium BBB Feature"
                        >
                          <BarChart2 size={15} /> BBB Dashboard
                        </a>
                      )}
                      <button onClick={() => handleDelete(session._id, session.title)} style={{ padding: '0 14px', height: '42px', borderRadius: '10px', background: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '700', fontSize: '13px' }}>
                        <Trash2 size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartSession(session._id)}
                        style={{ flex: 1, height: '44px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', background: isOngoing ? '#ef4444' : 'var(--color-primary)', color: 'white', boxShadow: isOngoing ? '0 4px 16px rgba(239,68,68,0.35)' : '0 4px 16px rgba(99,102,241,0.3)' }}
                      >
                        {isOngoing ? <><Radio size={16} /> Resume Class</> : <><Play size={16} /> Start Studio</>}
                      </button>
                      {isOngoing && (
                        <button onClick={() => { setEndingId(session._id); setNotesPdf(null); setShowEndModal(true); }} style={{ padding: '0 16px', height: '44px', borderRadius: '10px', border: '1.5px solid #fecdd3', background: '#fff1f2', color: '#dc2626', cursor: 'pointer', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <StopCircle size={15} /> End
                        </button>
                      )}
                      <button onClick={() => handleDelete(session._id, session.title)} style={{ padding: '0 14px', height: '44px', borderRadius: '10px', background: '#f8fafc', color: '#94a3b8', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          CHOOSER MODAL — Instant vs Scheduled
      ══════════════════════════════════════════════════════════════════ */}
      {showChooser && (
        <Overlay>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '480px', padding: '0', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>New Live Session</h2>
              <button onClick={() => setShowChooser(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Option A — Instant */}
              <button
                onClick={() => { setShowChooser(false); setInstantForm({ title: '', subject: '', batchId: '', duration: 60 }); setShowInstant(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '22px 20px', borderRadius: '16px', border: '2px solid #6366f1', background: 'linear-gradient(135deg,#eef2ff,#f5f3ff)', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all .2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.25)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={26} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '900', color: '#3730a3', marginBottom: '4px' }}>Instant Session</div>
                  <div style={{ fontSize: '13px', color: '#6366f1', fontWeight: '600' }}>Start a live class right now — students can join immediately</div>
                </div>
                <ChevronRight size={20} color="#6366f1" />
              </button>

              {/* Option B — Scheduled */}
              <button
                onClick={() => { setShowChooser(false); setSchedForm({ title: '', subject: '', batchId: '', date: '', time: '', duration: 60 }); setShowSchedule(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '22px 20px', borderRadius: '16px', border: '2px solid var(--color-border)', background: 'var(--color-bg)', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Calendar size={24} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--color-text-primary)', marginBottom: '4px' }}>Schedule Session</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Pick a future date & time — students will see it in advance</div>
                </div>
                <ChevronRight size={20} color="var(--color-text-muted)" />
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          INSTANT SESSION MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {showInstant && (
        <Overlay>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '460px', padding: 0, borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Zap size={22} color="white" />
                <div>
                  <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: 'white' }}>Instant Session</h2>
                  <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>Starts immediately after creation</p>
                </div>
              </div>
              <button onClick={() => setShowInstant(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', borderRadius: '10px' }}><X size={18} /></button>
            </div>

            <div style={{ padding: '24px' }}>
              <FormField label="Session Title" required>
                <input className="form-input" style={{ height: '46px', borderRadius: '12px' }} value={instantForm.title} onChange={e => setInstantForm({ ...instantForm, title: e.target.value })} placeholder="e.g. Quick Doubt Session" autoFocus />
              </FormField>

              <FormField label="Subject" required>
                <select className="form-select" style={{ height: '46px', borderRadius: '12px' }} value={instantForm.subject} onChange={e => setInstantForm({ ...instantForm, subject: e.target.value })}>
                  <option value="">Select subject...</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.targetGrade})</option>)}
                </select>
              </FormField>

              <FormField label="Batch (Optional)">
                <select className="form-select" style={{ height: '46px', borderRadius: '12px' }} value={instantForm.batchId} onChange={e => setInstantForm({ ...instantForm, batchId: e.target.value })}>
                  <option value="">Studio Session (No Batch)</option>
                  {batches.map(b => <option key={b._id} value={b._id}>{b.name} ({b.studyClass?.name})</option>)}
                </select>
              </FormField>

              <FormField label="Estimated Duration (minutes)">
                <input type="number" className="form-input" style={{ height: '46px', borderRadius: '12px' }} value={instantForm.duration} onChange={e => setInstantForm({ ...instantForm, duration: Number(e.target.value) })} />
              </FormField>

              <div style={{ padding: '12px 16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <Info size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={{ margin: 0, fontSize: '12px', color: '#1e40af', lineHeight: 1.6 }}>
                  A BBB room will be <strong>created and opened immediately</strong> in a new tab. Students will be notified.
                </p>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowInstant(false)} className="btn btn-secondary" style={{ flex: 1, height: '44px', borderRadius: '12px' }}>Cancel</button>
              <button
                onClick={handleInstantSave}
                disabled={instantSaving}
                style={{ flex: 2, height: '44px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#6366f1,#7c3aed)', color: 'white', fontWeight: '800', fontSize: '14px', cursor: instantSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: instantSaving ? 0.7 : 1 }}
              >
                <Zap size={16} /> {instantSaving ? 'Launching...' : 'Launch Now'}
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SCHEDULE SESSION MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {showSchedule && (
        <Overlay>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '480px', padding: 0, borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={20} color="white" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '900' }}>Schedule a Session</h2>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>Plan in advance for a future date</p>
                </div>
              </div>
              <button onClick={() => setShowSchedule(false)} style={{ background: 'var(--color-bg)', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '8px', borderRadius: '10px' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '24px', maxHeight: '65vh', overflowY: 'auto' }}>
              <FormField label="Session Title" required>
                <input className="form-input" style={{ height: '46px', borderRadius: '12px' }} value={schedForm.title || ''} onChange={e => setSchedForm({ ...schedForm, title: e.target.value })} placeholder="e.g. Cell Biology Q&A" autoFocus />
              </FormField>

              <FormField label="Subject" required>
                <select className="form-select" style={{ height: '46px', borderRadius: '12px' }} value={schedForm.subject || ''} onChange={e => setSchedForm({ ...schedForm, subject: e.target.value })}>
                  <option value="">Select subject...</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.targetGrade})</option>)}
                </select>
              </FormField>

              <FormField label="Target Batch" required>
                <select className="form-select" style={{ height: '46px', borderRadius: '12px' }} value={schedForm.batchId || ''} onChange={e => setSchedForm({ ...schedForm, batchId: e.target.value })}>
                  <option value="">Select batch...</option>
                  {batches.map(b => <option key={b._id} value={b._id}>{b.name} ({b.studyClass?.name})</option>)}
                </select>
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FormField label="Date" required>
                  <input type="date" className="form-input" style={{ height: '46px', borderRadius: '12px' }} value={schedForm.date || ''} onChange={e => setSchedForm({ ...schedForm, date: e.target.value })} />
                </FormField>
                <FormField label="Time" required>
                  <input type="time" className="form-input" style={{ height: '46px', borderRadius: '12px' }} value={schedForm.time || ''} onChange={e => setSchedForm({ ...schedForm, time: e.target.value })} />
                </FormField>
              </div>

              <FormField label="Duration (minutes)">
                <input type="number" className="form-input" style={{ height: '46px', borderRadius: '12px' }} value={schedForm.duration || 60} onChange={e => setSchedForm({ ...schedForm, duration: Number(e.target.value) })} />
              </FormField>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowSchedule(false)} className="btn btn-secondary" style={{ flex: 1, height: '44px', borderRadius: '12px' }}>Cancel</button>
              <button
                onClick={handleScheduleSave}
                disabled={schedSaving}
                className="btn btn-primary"
                style={{ flex: 2, height: '44px', borderRadius: '12px', fontWeight: '900', opacity: schedSaving ? 0.7 : 1 }}
              >
                {schedSaving ? 'Scheduling...' : '📅 Finalise & Schedule'}
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          END CLASS MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {showEndModal && (
        <Overlay z={1100}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '460px', padding: 0, borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '20px 24px', background: '#fff1f2', borderBottom: '1px solid #fecdd3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <StopCircle size={22} color="#dc2626" />
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#991b1b' }}>End Live Class</h2>
              </div>
              <button onClick={() => setShowEndModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', padding: '14px 16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                <Info size={17} color="#2563eb" style={{ flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '13px', color: '#1e40af', lineHeight: 1.65 }}>
                  After ending:
                  <br />• The <strong>BBB recording</strong> will be sent to your instructor for review.
                  <br />• <strong>Shared notes</strong> from the session are captured automatically.
                  <br />Students will only see materials once the instructor approves them.
                </p>
              </div>

              {/* Optional PDF Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px', letterSpacing: '0.05em' }}>
                  <FileText size={12} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                  Upload Class Notes PDF
                  <span style={{ marginLeft: '6px', fontWeight: '400', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'none' }}>(optional)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', border: `2px dashed ${notesPdf ? '#6366f1' : 'var(--color-border)'}`, background: notesPdf ? '#f5f3ff' : 'var(--color-bg)', cursor: 'pointer', transition: 'all .2s' }}>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    style={{ display: 'none' }}
                    onChange={e => setNotesPdf(e.target.files[0] || null)}
                  />
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: notesPdf ? '#6366f1' : 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={18} color="white" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {notesPdf
                      ? <><div style={{ fontSize: '13px', fontWeight: '700', color: '#4338ca', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{notesPdf.name}</div><div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{(notesPdf.size / 1024).toFixed(1)} KB</div></>
                      : <><div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Click to upload PDF notes</div><div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Max 10 MB • PDF only</div></>
                    }
                  </div>
                  {notesPdf && <button type="button" onClick={e => { e.preventDefault(); setNotesPdf(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}><X size={16} /></button>}
                </label>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowEndModal(false)} disabled={ending} className="btn btn-secondary" style={{ flex: 1, height: '44px', borderRadius: '12px' }}>Cancel</button>
              <button
                onClick={handleEndSession}
                disabled={ending}
                style={{ flex: 2, height: '44px', borderRadius: '12px', border: 'none', background: '#dc2626', color: 'white', fontWeight: '800', fontSize: '14px', cursor: ending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: ending ? 0.7 : 1 }}
              >
                <StopCircle size={16} /> {ending ? 'Ending...' : 'End Class & Submit'}
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {selectedAnalytics && <LiveAnalyticsModal session={selectedAnalytics} onClose={() => setSelectedAnalytics(null)} />}
    </div>
  );
}
