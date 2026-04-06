"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  Search, Calendar, Clock, Video, FileText, CheckCircle, 
  XCircle, Users, Share2, Link as LinkIcon, AlertCircle, X, Upload,
  BarChart2
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useConfirmStore } from '@/store/confirmStore';
import toast from 'react-hot-toast';
import LiveAnalyticsModal from '@/components/LiveAnalyticsModal';

// --- Sub-components ---

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div className="card" style={{ padding: '24px', borderLeft: `4px solid ${color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>{label}</div>
        <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--color-text-primary)', lineHeight: 1 }}>{value}</div>
      </div>
      <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={28} color={color} />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const configs = {
    upcoming:  { bg: '#eff6ff', color: '#2563eb', label: 'Upcoming'  },
    ongoing:   { bg: '#fef2f2', color: '#ef4444', label: '🔴 Live'   },
    completed: { bg: '#f0fdf4', color: '#16a34a', label: 'Completed' },
    cancelled: { bg: '#f8fafc', color: '#64748b', label: 'Cancelled' },
  };
  const cfg = configs[status] || configs.upcoming;
  return (
    <span style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', background: cfg.bg, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {cfg.label}
    </span>
  );
}

// --- Main Component ---

export default function InstructorLiveClasses() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [search, setSearch] = useState('');
  const confirm = useConfirmStore(s => s.confirm);

  // Batch Assignment Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recording/Notes Modal
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaClass, setMediaClass] = useState(null);
  const [recordingUrl, setRecordingUrl] = useState('');
  const [notesUrl, setNotesUrl] = useState('');
  const [mediaSubmitting, setMediaSubmitting] = useState(false);
  const [selectedAnalytics, setSelectedAnalytics] = useState(null);

  useEffect(() => {
    let interval;
    if (user) { 
      fetchClasses(); 
      fetchBatches(); 

      // Auto-refresh every 30s to detect completed sessions
      interval = setInterval(() => {
        fetchClasses(false); 
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [user]);

  const fetchClasses = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const { data } = await axios.get('/api/instructor/live-classes');
      setClasses(data.data || []);
    } catch { 
      if (showLoader) toast.error('Failed to load live classes'); 
    } finally { 
      if (showLoader) setLoading(false); 
    }
  };

  const fetchBatches = async () => {
    try {
      const { data } = await axios.get('/api/instructor/batches?managed=true');
      setBatches(data.data || []);
    } catch { console.error('Failed to load batches'); }
  };

  // --- Handlers ---

  const openAssignModal = (cls) => {
    setSelectedClass(cls);
    setSelectedBatches(cls.batches?.map(b => b._id || b) || []);
    setShowAssignModal(true);
  };

  const toggleBatch = (batchId) => {
    setSelectedBatches(prev =>
      prev.includes(batchId) ? prev.filter(id => id !== batchId) : [...prev, batchId]
    );
  };

  const submitBatchAssignment = async () => {
    if (!selectedClass) return;
    setIsSubmitting(true);
    try {
      await axios.patch(`/api/instructor/live-classes/${selectedClass._id}/assign-batches`, { batchIds: selectedBatches });
      toast.success('Batches assigned successfully!');
      setShowAssignModal(false);
      fetchClasses();
    } catch { toast.error('Failed to assign batches'); }
    finally { setIsSubmitting(false); }
  };

  const openMediaModal = (cls) => {
    setMediaClass(cls);
    setRecordingUrl(cls.recording?.videoUrl !== 'pending' ? (cls.recording?.videoUrl || cls.recordingUrl || '') : (cls.recordingUrl || ''));
    setNotesUrl(cls.presentationUrl || '');
    setShowMediaModal(true);
  };

  const submitRecording = async () => {
    if (!mediaClass) return;
    setMediaSubmitting(true);
    try {
      await axios.patch(`/api/instructor/live-classes/${mediaClass._id}/assign-recording`, {
        recordingUrl: recordingUrl || undefined,
        notesUrl: notesUrl || undefined,
      });
      toast.success('Recording published to batches!');
      if (notesUrl) {
        await axios.patch(`/api/instructor/live-classes/${mediaClass._id}/assign-notes`, { notesUrl });
        toast.success('Notes also published!');
      }
      setShowMediaModal(false);
      fetchClasses();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to publish recording');
    } finally { setMediaSubmitting(false); }
  };

  // --- Derived Data ---

  const filtered = classes.filter(c => {
    const isUpcoming = ['upcoming', 'ongoing'].includes(c.status);
    const tabMatch = activeTab === 'upcoming' ? isUpcoming : c.status === 'completed';
    const searchMatch =
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.faculty?.name?.toLowerCase().includes(search.toLowerCase());
    return tabMatch && searchMatch;
  });

  const stats = {
    total: classes.length,
    today: classes.filter(c => c.status === 'upcoming' && new Date(c.scheduledAt).toDateString() === new Date().toDateString()).length,
    pending: classes.filter(c => c.status === 'completed' && (!c.recording || c.recording.status !== 'published')).length,
  };

  // --- Render ---

  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Live Class Management</h1>
          <p className="page-subtitle">Assign faculty live sessions to batches, then publish recordings and notes after each class ends.</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <StatCard label="Total Sessions" value={stats.total} color="var(--color-primary)" icon={Calendar} />
        <StatCard label="Today's Classes" value={stats.today} color="#10b981" icon={Clock} />
        <StatCard label="Recordings Pending" value={stats.pending} color="#f59e0b" icon={Video} />
      </div>

      {/* Tabs + Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', background: 'var(--color-bg)', padding: '4px', borderRadius: '14px', border: '1px solid var(--color-border)' }}>
          {[['upcoming', 'Scheduled Sessions'], ['completed', 'Past Sessions']].map(([val, label]) => (
            <button key={val} onClick={() => setActiveTab(val)} style={{
              padding: '10px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', border: 'none',
              background: activeTab === val ? 'var(--color-primary)' : 'transparent',
              color: activeTab === val ? 'white' : 'var(--color-text-secondary)',
              transition: 'all 0.2s ease',
            }}>{label}</button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or faculty..."
            style={{ width: '100%', padding: '11px 14px 11px 40px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '13px', outline: 'none' }} />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '80px 40px', textAlign: 'center' }}>
          <Video size={52} color="var(--color-text-muted)" style={{ margin: '0 auto 20px', opacity: 0.4 }} />
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>No Sessions Found</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {search ? `No results for "${search}"` : `No ${activeTab === 'upcoming' ? 'scheduled' : 'completed'} sessions available.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
          {filtered.map(cls => (
            <LiveClassCard
              key={cls._id}
              cls={cls}
              activeTab={activeTab}
              onAssignBatches={() => openAssignModal(cls)}
              onManageMedia={() => openMediaModal(cls)}
              onViewAnalytics={() => setSelectedAnalytics(cls)}
            />
          ))}
        </div>
      )}

      {/* Batch Assignment Modal */}
      {showAssignModal && selectedClass && (
        <Modal title="Assign to Batches" subtitle={selectedClass.title} onClose={() => setShowAssignModal(false)}>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#eff6ff', borderRadius: '12px', marginBottom: '20px', color: '#1d4ed8' }}>
              <AlertCircle size={18} />
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Students in checked batches will see this live session.</span>
            </div>
            <div style={{ maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
              {batches.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '30px' }}>No active batches found.</p>
              ) : batches.map(batch => {
                const active = selectedBatches.includes(batch._id);
                return (
                  <div key={batch._id} onClick={() => toggleBatch(batch._id)} style={{
                    display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '14px',
                    border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: active ? 'var(--color-primary-light)' : 'transparent',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '6px', border: `2px solid ${active ? 'var(--color-primary)' : '#d1d5db'}`,
                      background: active ? 'var(--color-primary)' : 'transparent', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {active && <CheckCircle size={14} color="white" fill="white" />}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: active ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{batch.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{batch.studyClass?.name} • {batch.students?.length || 0} students</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <ModalFooter onCancel={() => setShowAssignModal(false)} onConfirm={submitBatchAssignment} loading={isSubmitting} confirmText="Apply Assignment" />
        </Modal>
      )}

      {/* Recording & Notes Modal */}
      {showMediaModal && mediaClass && (
        <Modal title="Publish Recording & Notes" subtitle={mediaClass.title} onClose={() => setShowMediaModal(false)}>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {mediaClass.recording?.status === 'published' && (
              <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', color: '#166534', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} /> Recording already published. You can update the URL below.
              </div>
            )}

            <div>
              <label style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>Recording URL</label>
              <input value={recordingUrl} onChange={e => setRecordingUrl(e.target.value)}
                placeholder="https://zoom-recording-url.com or BBB recording link"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '13px', outline: 'none' }} />
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>Leave blank to publish with the auto-generated BBB recording link.</p>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>Class Notes / Presentation URL</label>
              <input value={notesUrl} onChange={e => setNotesUrl(e.target.value)}
                placeholder="https://link-to-slides-or-notes.pdf"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '13px', outline: 'none' }} />
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>If set, notes will be added to the chapter for the assigned batches.</p>
            </div>

            <div style={{ padding: '12px 16px', background: '#fefce8', border: '1px solid #fde68a', borderRadius: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#92400e', margin: 0 }}>
                📦 Will publish to <strong>{mediaClass.batches?.length || 0} batch(es)</strong>: {mediaClass.batches?.map(b => b.name).join(', ') || 'None assigned yet'}
              </p>
            </div>
          </div>
          <ModalFooter
            onCancel={() => setShowMediaModal(false)}
            onConfirm={submitRecording}
            loading={mediaSubmitting}
            confirmText="Publish to Batches"
            disabled={!recordingUrl && !notesUrl}
          />
        </Modal>
      )}

      {selectedAnalytics && <LiveAnalyticsModal session={selectedAnalytics} onClose={() => setSelectedAnalytics(null)} />}
    </div>
  );
}

// Helper: Live Class Card
function LiveClassCard({ cls, activeTab, onAssignBatches, onManageMedia, onViewAnalytics }) {
  const hasRecording = cls.recording?.status === 'published';

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Color bar */}
      <div style={{ height: '5px', background: cls.status === 'ongoing' ? '#ef4444' : cls.status === 'upcoming' ? 'var(--color-primary)' : '#94a3b8' }} />

      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <StatusBadge status={cls.status} />
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Users size={13} /> {cls.batches?.length || 0} {cls.batches?.length === 1 ? 'Batch' : 'Batches'}
          </div>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '6px', lineHeight: 1.35 }}>{cls.title}</h3>

        {/* Meta grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '16px 0', padding: '14px', background: 'var(--color-bg)', borderRadius: '12px' }}>
          <InfoCell icon={Calendar} label="Date" value={new Date(cls.scheduledAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: '2-digit' })} />
          <InfoCell icon={Clock} label="Time" value={new Date(cls.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
        </div>

        {/* Faculty */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', padding: '12px', background: 'var(--color-bg)', borderRadius: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', flexShrink: 0 }}>
            {cls.faculty?.name?.charAt(0) || 'F'}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700' }}>{cls.faculty?.name || 'Unknown Faculty'}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{cls.subject} · Faculty</div>
          </div>
        </div>

        {/* Recording status (for completed) */}
        {cls.status === 'completed' && (
          <div style={{
            fontSize: '12px', fontWeight: '700', padding: '8px 14px', borderRadius: '8px', marginBottom: '16px',
            background: hasRecording ? '#dcfce7' : '#fef9c3',
            color: hasRecording ? '#166534' : '#854d0e',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            {hasRecording ? <CheckCircle size={14} /> : (cls.recordingUrl ? <Play size={14} /> : <AlertCircle size={14} />)}
            {hasRecording ? 'Recording published to batches' : (cls.recordingUrl ? 'Recording Ready for Review (Auto-Fetched)' : 'Recording not yet published')}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
          {activeTab === 'upcoming' ? (
            <>
              <button onClick={onAssignBatches} className="btn btn-primary" style={{ flex: 1, height: '42px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', borderRadius: '10px' }}>
                <Share2 size={15} /> Assign Batches
              </button>
              <button onClick={() => window.open(cls.meetingLink, '_blank')} className="btn btn-secondary" style={{ height: '42px', padding: '0 16px', borderRadius: '10px' }}>
                <LinkIcon size={15} />
              </button>
            </>
          ) : (
            <>
              <button onClick={onManageMedia} className={`btn ${hasRecording ? 'btn-secondary' : 'btn-primary'}`} style={{ flex: 1, height: '42px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', borderRadius: '10px' }}>
                <Video size={15} /> {hasRecording ? 'Update' : 'Publish Recording'}
              </button>
              <button onClick={onViewAnalytics} className="btn btn-secondary" style={{ height: '42px', padding: '0 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px' }} title="View Analytics">
                <BarChart2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCell({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Icon size={15} color="var(--color-primary)" />
      <div>
        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontSize: '13px', fontWeight: '600' }}>{value}</div>
      </div>
    </div>
  );
}

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', padding: '20px' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: '520px', padding: 0, overflow: 'hidden', borderRadius: '20px' }}>
        <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg)' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: '800', margin: 0 }}>{title}</h2>
            {subtitle && <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '3px 0 0' }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}><X size={22} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalFooter({ onCancel, onConfirm, loading, confirmText = 'Confirm', disabled = false }) {
  return (
    <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--color-bg)' }}>
      <button onClick={onCancel} className="btn btn-secondary" disabled={loading} style={{ height: '42px', padding: '0 20px', borderRadius: '10px' }}>Cancel</button>
      <button onClick={onConfirm} disabled={loading || disabled} className="btn btn-primary" style={{ height: '42px', padding: '0 24px', borderRadius: '10px', fontWeight: '700' }}>
        {loading ? 'Processing…' : confirmText}
      </button>
    </div>
  );
}
