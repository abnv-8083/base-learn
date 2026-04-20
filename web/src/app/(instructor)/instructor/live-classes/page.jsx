"use client";

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Search, Calendar, Clock, Video, FileText, CheckCircle,
  XCircle, Users, Share2, Link as LinkIcon, AlertCircle, X,
  BarChart2, Play, Eye, Radio, Inbox, RefreshCw, ChevronDown,
  Filter, Zap, BookOpen, Award, TrendingUp, Layers
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import LiveAnalyticsModal from '@/components/LiveAnalyticsModal';

// ─────────────────────────────────────────────────────────
// Overlay backdrop
// ─────────────────────────────────────────────────────────
function Overlay({ children, onClose }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,30,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, gradient, icon: Icon }) {
  return (
    <div className="card fade-in" style={{ padding: '22px 24px', background: gradient || 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color }} />
      <div>
        <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '10px' }}>{label}</div>
        <div style={{ fontSize: '34px', fontWeight: '900', color: 'var(--color-text-primary)', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>{sub}</div>}
      </div>
      <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={26} color={color} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Status pill
// ─────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const map = {
    upcoming:  { bg: '#eff6ff', color: '#2563eb', dot: '#3b82f6', label: 'Upcoming'  },
    ongoing:   { bg: '#fef2f2', color: '#dc2626', dot: '#ef4444', label: 'Live Now'  },
    completed: { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e', label: 'Completed' },
    cancelled: { bg: '#f8fafc', color: '#64748b', dot: '#94a3b8', label: 'Cancelled' },
  };
  const c = map[status] || map.upcoming;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', background: c.bg, color: c.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: c.dot, animation: status === 'ongoing' ? 'pulse 1.5s infinite' : 'none' }} />
      {c.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────
// Draft approval pill
// ─────────────────────────────────────────────────────────
function DraftBadge({ status }) {
  const map = {
    draft:     { bg: '#fef3c7', color: '#b45309', label: '⏳ Pending Review' },
    published: { bg: '#dcfce7', color: '#15803d', label: '✅ Published'       },
    rejected:  { bg: '#fee2e2', color: '#dc2626', label: '❌ Rejected'         },
  };
  const c = map[status] || map.draft;
  return (
    <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────
// Avatar initials
// ─────────────────────────────────────────────────────────
function Avatar({ name, size = 38 }) {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'F';
  const colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'];
  const colorIdx = name ? name.charCodeAt(0) % colors.length : 0;
  return (
    <div style={{ width: size, height: size, borderRadius: '10px', background: colors[colorIdx], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: size * 0.37, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────
export default function InstructorLiveClasses() {
  const { user } = useAuthStore();

  const [classes,   setClasses]   = useState([]);
  const [drafts,    setDrafts]    = useState([]);   // RecordedClass drafts awaiting approval
  const [batches,   setBatches]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'upcoming' | 'past'
  const [search,    setSearch]    = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showAssignModal,  setShowAssignModal]  = useState(false);
  const [selectedClass,    setSelectedClass]    = useState(null);
  const [selectedBatches,  setSelectedBatches]  = useState([]);
  const [isSubmitting,     setIsSubmitting]     = useState(false);

  const [showDraftModal,   setShowDraftModal]   = useState(false);
  const [activeDraft,      setActiveDraft]      = useState(null);
  const [rejecting,        setRejecting]        = useState(false);

  const [selectedAnalytics, setSelectedAnalytics] = useState(null);

  // ── Fetch ─────────────────────────────────────────────
  const fetchAll = useCallback(async (loader = true) => {
    if (loader) setLoading(true);
    try {
      const [clsRes, draftRes] = await Promise.all([
        axios.get('/api/instructor/live-classes'),
        axios.get('/api/instructor/videos/pending'),  // RecordedClass drafts awaiting approval
      ]);
      setClasses(clsRes.data.data || []);
      setDrafts(draftRes.data.data || []);
    } catch {
      if (loader) toast.error('Failed to load live classes');
    } finally {
      if (loader) setLoading(false);
    }
  }, []);

  const fetchBatches = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/instructor/batches?managed=true');
      setBatches(data.data || []);
    } catch {}
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchAll();
    fetchBatches();
    const iv = setInterval(() => fetchAll(false), 30000);
    return () => clearInterval(iv);
  }, [user, fetchAll, fetchBatches]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll(false);
    setRefreshing(false);
    toast.success('Refreshed');
  };

  // ── Batch Assignment ──────────────────────────────────
  const openAssignModal = (cls) => {
    setSelectedClass(cls);
    setSelectedBatches(cls.batches?.map(b => b._id || b) || []);
    setShowAssignModal(true);
  };

  const submitBatchAssignment = async () => {
    if (!selectedClass) return;
    setIsSubmitting(true);
    try {
      await axios.patch(`/api/instructor/live-classes/${selectedClass._id}/assign-batches`, { batchIds: selectedBatches });
      toast.success('Batches assigned!');
      setShowAssignModal(false);
      fetchAll(false);
    } catch { toast.error('Failed to assign batches'); }
    finally { setIsSubmitting(false); }
  };

  // ── Draft Approval ────────────────────────────────────
  const openDraftModal = (draft) => {
    setActiveDraft(draft);
    setShowDraftModal(true);
  };

  const approveDraft = async () => {
    if (!activeDraft) return;
    setIsSubmitting(true);
    try {
      await axios.patch(`/api/instructor/content/${activeDraft._id}/status`, { 
        approvalStatus: 'approved',
        itemModel: 'RecordedClass',
        batchIds: activeDraft.assignedTo?.map(b => b._id || b) || []
      });
      toast.success('✅ Content published to students!');
      setShowDraftModal(false);
      fetchAll(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to publish');
    } finally { setIsSubmitting(false); }
  };

  const rejectDraft = async () => {
    if (!activeDraft) return;
    setRejecting(true);
    try {
      await axios.patch(`/api/instructor/content/${activeDraft._id}/status`, { 
        approvalStatus: 'rejected',
        itemModel: 'RecordedClass'
      });
      toast.success('Draft rejected.');
      setShowDraftModal(false);
      fetchAll(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject');
    } finally { setRejecting(false); }
  };

  const deleteDraft = async (draft) => {
    if (!window.confirm(`Permanently delete "${draft.title}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/instructor/content/${draft._id}/manage?itemModel=RecordedClass`);
      toast.success('Draft deleted.');
      fetchAll(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete draft');
    }
  };

  // ── Derived data ──────────────────────────────────────
  const now = new Date();

  // Only show live session drafts — not regular content review items
  const pendingDrafts = drafts.filter(d =>
    d.status === 'draft' &&
    ['liveRecording', 'liveNotes'].includes(d.contentType)
  );

  const upcomingClasses = classes.filter(c =>
    ['upcoming', 'ongoing'].includes(c.status) &&
    (c.title?.toLowerCase().includes(search.toLowerCase()) || c.faculty?.name?.toLowerCase().includes(search.toLowerCase()))
  );

  // Include ALL completed sessions regardless of scheduledAt —
  // faculty may end a session early (before its scheduled time)
  const pastClasses = classes.filter(c =>
    c.status === 'completed' &&
    (c.title?.toLowerCase().includes(search.toLowerCase()) || c.faculty?.name?.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    liveNow:  classes.filter(c => c.status === 'ongoing').length,
    upcoming: upcomingClasses.filter(c => c.status === 'upcoming').length,
    pending:  pendingDrafts.length,
    total:    classes.length,
  };

  const tabs = [
    { key: 'pending',  label: 'Pending Review', count: stats.pending  },
    { key: 'upcoming', label: 'Scheduled',       count: stats.upcoming },
    { key: 'past',     label: 'Completed',        count: pastClasses.length },
  ];

  // ── Render ────────────────────────────────────────────
  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '900', margin: '0 0 6px', color: 'var(--color-text-primary)' }}>Live Class Hub</h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Review & approve faculty recordings · Assign sessions to batches
          </p>
        </div>
        <button
          onClick={handleRefresh}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: 'var(--color-text-secondary)' }}
        >
          <RefreshCw size={15} style={{ transition: 'transform 0.5s', transform: refreshing ? 'rotate(360deg)' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Live Now"        value={stats.liveNow}  sub="Currently broadcasting"  color="#ef4444" icon={Radio}      />
        <StatCard label="Pending Review"  value={stats.pending}  sub="Drafts awaiting approval" color="#f59e0b" icon={Inbox}      />
        <StatCard label="Scheduled"       value={stats.upcoming} sub="Upcoming sessions"        color="#6366f1" icon={Calendar}   />
        <StatCard label="Total Sessions"  value={stats.total}    sub="All time"                 color="#10b981" icon={TrendingUp} />
      </div>

      {/* ── Tabs + Search ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '6px', background: 'var(--color-bg)', padding: '4px', borderRadius: '14px', border: '1px solid var(--color-border)' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                background: activeTab === tab.key ? 'var(--color-primary)' : 'transparent',
                color: activeTab === tab.key ? 'white' : 'var(--color-text-secondary)',
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '900', background: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : (tab.key === 'pending' ? '#fef3c7' : 'var(--color-border)'), color: activeTab === tab.key ? 'white' : (tab.key === 'pending' ? '#b45309' : 'var(--color-text-muted)') }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab !== 'pending' && (
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search sessions..."
              style={{ padding: '10px 14px 10px 36px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '13px', outline: 'none', width: '260px' }}
            />
          </div>
        )}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}><div className="spinner" /></div>
      ) : (

        <>
          {/* === PENDING REVIEW TAB === */}
          {activeTab === 'pending' && (
            pendingDrafts.length === 0 ? (
              <EmptyState icon={Inbox} title="All Clear!" body="No recordings or notes are waiting for your review. Great job!" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '12px 16px', background: '#fefce8', border: '1px solid #fde047', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertCircle size={17} color="#ca8a04" />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#854d0e' }}>
                    {pendingDrafts.length} item{pendingDrafts.length !== 1 ? 's' : ''} waiting for your approval before students can access them.
                  </span>
                </div>
                {pendingDrafts.map(draft => (
                  <DraftCard key={draft._id} draft={draft} onReview={() => openDraftModal(draft)} onDelete={() => deleteDraft(draft)} />
                ))}
              </div>
            )
          )}

          {/* === SCHEDULED TAB === */}
          {activeTab === 'upcoming' && (
            upcomingClasses.length === 0 ? (
              <EmptyState icon={Calendar} title="No Scheduled Sessions" body="No upcoming or live sessions right now." />
            ) : (
              <div className="card-grid">
                {upcomingClasses.map(cls => (
                  <LiveClassCard key={cls._id} cls={cls} mode="upcoming" onAssignBatches={() => openAssignModal(cls)} onViewAnalytics={() => setSelectedAnalytics(cls)} />
                ))}
              </div>
            )
          )}

          {/* === PAST TAB === */}
          {activeTab === 'past' && (
            pastClasses.length === 0 ? (
              <EmptyState icon={Video} title="No Completed Sessions" body={search ? `No results for "${search}"` : 'No completed sessions yet.'} />
            ) : (
              <div className="card-grid">
                {pastClasses.map(cls => (
                  <LiveClassCard key={cls._id} cls={cls} mode="past" onAssignBatches={() => openAssignModal(cls)} onViewAnalytics={() => setSelectedAnalytics(cls)} drafts={drafts} />
                ))}
              </div>
            )
          )}
        </>
      )}

      {/* ══ BATCH ASSIGN MODAL ══════════════════════════════════ */}
      {showAssignModal && selectedClass && (
        <Overlay onClose={() => setShowAssignModal(false)}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '500px', padding: 0, borderRadius: '22px', overflow: 'hidden' }}>
            <ModalHeader title="Assign to Batches" subtitle={selectedClass.title} onClose={() => setShowAssignModal(false)} accent="#6366f1" icon={<Share2 size={17} />} />
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', padding: '12px 16px', background: '#eff6ff', borderRadius: '12px', marginBottom: '18px' }}>
                <AlertCircle size={16} color="#2563eb" style={{ flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '13px', color: '#1e40af' }}>Students in selected batches will see this session in their Live Classes tab.</p>
              </div>
              <div style={{ maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {batches.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '30px' }}>No batches found.</p> :
                  batches.map(batch => {
                    const active = selectedBatches.includes(batch._id);
                    return (
                      <div key={batch._id} onClick={() => setSelectedBatches(prev => prev.includes(batch._id) ? prev.filter(id => id !== batch._id) : [...prev, batch._id])}
                        style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '14px', border: `2px solid ${active ? '#6366f1' : 'var(--color-border)'}`, background: active ? '#f5f3ff' : 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: `2px solid ${active ? '#6366f1' : '#d1d5db'}`, background: active ? '#6366f1' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {active && <CheckCircle size={13} color="white" fill="white" />}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: active ? '#4338ca' : 'var(--color-text-primary)' }}>{batch.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{batch.studyClass?.name} · {batch.students?.length || 0} students</div>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
            <ModalFooter onCancel={() => setShowAssignModal(false)} onConfirm={submitBatchAssignment} loading={isSubmitting} confirmText={`Assign ${selectedBatches.length} Batch${selectedBatches.length !== 1 ? 'es' : ''}`} accent="#6366f1" />
          </div>
        </Overlay>
      )}

      {/* ══ DRAFT REVIEW MODAL ══════════════════════════════════ */}
      {showDraftModal && activeDraft && (
        <Overlay onClose={() => setShowDraftModal(false)}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '520px', padding: 0, borderRadius: '22px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <ModalHeader
              title={activeDraft.contentType === 'liveRecording' ? '🎬 Review Recording' : '📄 Review Class Notes'}
              subtitle={activeDraft.liveClass?.title || activeDraft.title}
              onClose={() => setShowDraftModal(false)}
              accent={activeDraft.contentType === 'liveRecording' ? '#6366f1' : '#0ea5e9'}
              icon={activeDraft.contentType === 'liveRecording' ? <Video size={17} /> : <FileText size={17} />}
            />

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto' }}>
              {/* Info row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <InfoBox label="Faculty" value={activeDraft.faculty?.name || 'Unknown'} />
                <InfoBox label="Subject" value={typeof activeDraft.subject === 'object' ? activeDraft.subject?.name : (activeDraft.subject || '—')} />
                <InfoBox label="Type" value={activeDraft.contentType === 'liveRecording' ? 'Video Recording' : 'Class Notes / PDF'} />
                <InfoBox label="Submitted" value={new Date(activeDraft.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
              </div>

              {/* Preview link */}
              {activeDraft.videoUrl && (
                <div style={{ padding: '14px 16px', background: 'var(--color-bg)', borderRadius: '14px', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                    {activeDraft.contentType === 'liveRecording' ? 'Recording URL' : 'Notes / PDF URL'}
                  </div>
                  <a href={activeDraft.videoUrl} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '13px', color: '#6366f1', fontWeight: '600', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Eye size={14} /> Preview Content ↗
                  </a>
                </div>
              )}

              {/* Batches */}
              {activeDraft.assignedTo?.length > 0 && (
                <div style={{ padding: '12px 16px', background: '#f5f3ff', borderRadius: '12px', border: '1px solid #e0e7ff' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#6366f1', marginBottom: '6px' }}>Will Publish To</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {activeDraft.assignedTo.map((b, i) => (
                      <span key={i} style={{ padding: '4px 10px', background: '#ede9fe', color: '#5b21b6', borderRadius: '8px', fontSize: '12px', fontWeight: '600' }}>
                        {b.name || `Batch ${i + 1}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Warning */}
              <div style={{ padding: '12px 16px', background: '#fef3c7', borderRadius: '12px', border: '1px solid #fde68a', display: 'flex', gap: '10px' }}>
                <AlertCircle size={16} color="#d97706" style={{ flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '12px', color: '#92400e' }}>
                  Publishing will make this {activeDraft.contentType === 'liveRecording' ? 'recording' : 'notes'} visible to all students in the assigned batches.
                </p>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '10px' }}>
              <button onClick={rejectDraft} disabled={rejecting || isSubmitting} style={{ flex: 1, height: '44px', borderRadius: '12px', border: '1.5px solid #fecdd3', background: '#fff1f2', color: '#dc2626', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <XCircle size={15} /> {rejecting ? 'Rejecting…' : 'Reject'}
              </button>
              <button onClick={approveDraft} disabled={isSubmitting || rejecting} style={{ flex: 2, height: '44px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                <CheckCircle size={16} /> {isSubmitting ? 'Publishing…' : 'Approve & Publish'}
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {selectedAnalytics && <LiveAnalyticsModal session={selectedAnalytics} onClose={() => setSelectedAnalytics(null)} />}

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.5; transform:scale(0.85); } }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Live Class Card
// ─────────────────────────────────────────────────────────
function LiveClassCard({ cls, mode, onAssignBatches, onViewAnalytics, drafts = [] }) {
  const isOngoing   = cls.status === 'ongoing';
  const isUpcoming  = cls.status === 'upcoming';
  const hasDrafts   = drafts.some(d => d.liveClass?._id === cls._id || d.liveClass === cls._id);

  return (
    <div className="card fade-in" style={{ padding: 0, overflow: 'hidden', borderRadius: '18px', display: 'flex', flexDirection: 'column', border: isOngoing ? '2px solid #ef4444' : '1px solid var(--color-border)', boxShadow: isOngoing ? '0 0 0 4px rgba(239,68,68,0.08)' : 'none', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = isOngoing ? '0 0 0 4px rgba(239,68,68,0.12), 0 12px 40px rgba(0,0,0,0.12)' : '0 12px 40px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = isOngoing ? '0 0 0 4px rgba(239,68,68,0.08)' : 'none'; }}
    >
      {/* Accent bar */}
      <div style={{ height: '4px', background: isOngoing ? '#ef4444' : isUpcoming ? '#6366f1' : '#94a3b8' }} />

      <div style={{ padding: '22px 22px 0', flex: 1 }}>
        {/* Status row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <StatusPill status={cls.status} />
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Users size={13} /> {cls.batches?.length || 0} batch{cls.batches?.length !== 1 ? 'es' : ''}
          </div>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--color-text-primary)', margin: '0 0 14px', lineHeight: 1.35 }}>{cls.title}</h3>

        {/* Date/Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '12px', background: 'var(--color-bg)', borderRadius: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={14} color="#6366f1" />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Date</div>
              <div style={{ fontSize: '13px', fontWeight: '700' }}>{new Date(cls.scheduledAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={14} color="#6366f1" />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Time</div>
              <div style={{ fontSize: '13px', fontWeight: '700' }}>{new Date(cls.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        </div>

        {/* Faculty */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', padding: '10px 12px', background: 'var(--color-bg)', borderRadius: '12px' }}>
          <Avatar name={cls.faculty?.name} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700' }}>{cls.faculty?.name || 'Unknown Faculty'}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{typeof cls.subject === 'object' ? cls.subject?.name : cls.subject || 'General'} · Faculty</div>
          </div>
        </div>

        {/* Draft pending badge for past */}
        {mode === 'past' && hasDrafts && (
          <div style={{ padding: '8px 12px', background: '#fef3c7', borderRadius: '10px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', color: '#92400e' }}>
            <Inbox size={13} /> Content pending your review
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: '14px 22px 18px', display: 'flex', gap: '10px' }}>
        {mode !== 'past' && (
          <button onClick={onAssignBatches} style={{ flex: 1, height: '40px', borderRadius: '10px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Share2 size={14} /> Assign Batches
          </button>
        )}
        
        {/* Local Analytics (Primary Fallback) */}
        {mode === 'past' ? (
          <button onClick={onViewAnalytics} style={{ flex: 1, height: '40px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontWeight: '700', fontSize: '13px' }}>
            <BarChart2 size={14} /> Local Analytics
          </button>
        ) : (
          <button onClick={onViewAnalytics} style={{ padding: '0 14px', height: '40px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '700', fontSize: '13px' }}>
            <BarChart2 size={14} />
          </button>
        )}

        {/* BBB Learning Analytics Dashboard link (Premium Feature) */}
        {mode === 'past' && cls.internalMeetingId && (
          <a 
            href={`https://test-install.blindsidenetworks.com/learning-analytics-dashboard/?meeting=${cls.internalMeetingId}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ flex: 1, height: '40px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}
            title="Premium BBB Feature"
          >
            <BarChart2 size={14} /> BBB Dashboard
          </a>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Draft Card (for Pending Review tab)
// ─────────────────────────────────────────────────────────
function DraftCard({ draft, onReview, onDelete }) {
  const isRecording = draft.contentType === 'liveRecording';
  const accent = isRecording ? '#6366f1' : '#0ea5e9';

  return (
    <div className="card fade-in" style={{ padding: 0, borderRadius: '18px', overflow: 'hidden', border: `1px solid ${isRecording ? '#e0e7ff' : '#e0f2fe'}` }}>
      <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {/* Type icon */}
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {isRecording ? <Video size={22} color={accent} /> : <FileText size={22} color={accent} />}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: '180px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{draft.title}</span>
            <DraftBadge status={draft.status} />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Avatar name={draft.faculty?.name} size={16} />
              {draft.faculty?.name || 'Unknown'}
            </span>
            <span>·</span>
            <span>{isRecording ? '🎬 Recording' : '📄 Class Notes'}</span>
            <span>·</span>
            <span>{new Date(draft.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button onClick={onReview} style={{ padding: '10px 18px', borderRadius: '12px', border: 'none', background: accent, color: 'white', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Eye size={15} /> Review
          </button>
          <button onClick={onDelete} title="Delete draft" style={{ padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #fecdd3', background: '#fff1f2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <XCircle size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, body }) {
  return (
    <div className="card" style={{ padding: '80px 40px', textAlign: 'center', borderRadius: '20px' }}>
      <Icon size={52} color="var(--color-text-muted)" style={{ margin: '0 auto 20px', opacity: 0.3, display: 'block' }} />
      <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>{title}</h2>
      <p style={{ color: 'var(--color-text-secondary)', maxWidth: '340px', margin: '0 auto' }}>{body}</p>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div style={{ padding: '10px 14px', background: 'var(--color-bg)', borderRadius: '12px' }}>
      <div style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{value || '—'}</div>
    </div>
  );
}

function ModalHeader({ title, subtitle, onClose, accent = '#6366f1', icon }) {
  return (
    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {icon && <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>{icon}</div>}
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--color-text-primary)' }}>{title}</h2>
          {subtitle && <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>{subtitle}</p>}
        </div>
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}><X size={20} /></button>
    </div>
  );
}

function ModalFooter({ onCancel, onConfirm, loading, confirmText = 'Confirm', disabled = false, accent = '#6366f1' }) {
  return (
    <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: 'var(--color-bg)' }}>
      <button onClick={onCancel} disabled={loading} style={{ padding: '0 20px', height: '42px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontWeight: '700', fontSize: '13px', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>Cancel</button>
      <button onClick={onConfirm} disabled={loading || disabled} style={{ padding: '0 24px', height: '42px', borderRadius: '10px', border: 'none', background: disabled ? '#e2e8f0' : accent, color: disabled ? '#94a3b8' : 'white', fontWeight: '800', fontSize: '13px', cursor: disabled ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Processing…' : confirmText}
      </button>
    </div>
  );
}
