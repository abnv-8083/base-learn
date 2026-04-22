"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Video, Calendar, Clock, Play, AlertCircle, RefreshCw, FileText, Radio, BookOpen, Users, ChevronRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// ── Helpers ────────────────────────────────────────────────────────────────
const isObjectId = (str) => /^[a-f\d]{24}$/i.test(str?.trim());
const displaySubject = (subject) => (!subject || isObjectId(subject) ? null : subject);

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// ── Countdown Hook ─────────────────────────────────────────────────────────
function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) { setTimeLeft('Starting now'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h > 0) setTimeLeft(`${h}h ${m}m`);
      else if (m > 0) setTimeLeft(`${m}m ${s}s`);
      else setTimeLeft(`${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

// ── Countdown Badge (for next upcoming class) ──────────────────────────────
function CountdownBadge({ scheduledAt }) {
  const timeLeft = useCountdown(scheduledAt);
  const isNear = new Date(scheduledAt) - new Date() < 15 * 60 * 1000; // < 15 min
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
      background: isNear ? '#fef3c7' : '#eff6ff',
      color: isNear ? '#92400e' : '#1d4ed8',
      letterSpacing: '0.02em'
    }}>
      <Clock size={10} /> {timeLeft}
    </span>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────
function EmptyState({ tab }) {
  return (
    <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 40px', textAlign: 'center' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', opacity: 0.15 }}>
        <Video size={40} color="white" />
      </div>
      <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
        No {tab === 'upcoming' ? 'Upcoming' : 'Past'} Sessions
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', maxWidth: '320px', lineHeight: 1.7 }}>
        {tab === 'upcoming'
          ? 'Your instructor has not yet scheduled any live sessions for your batch. Check back soon!'
          : 'Past sessions will appear here after they have been completed.'}
      </p>
    </div>
  );
}

// ── Session Card ───────────────────────────────────────────────────────────
function SessionCard({ item, isNext, onJoin, joiningId }) {
  const isOngoing = item.status === 'ongoing';
  const isCompleted = item.status === 'completed' || item.status === 'cancelled';
  const subjectName = displaySubject(item.subject?.name || item.subject);
  const isJoining = joiningId === item._id;

  const accentColor = isOngoing ? '#ef4444' : isCompleted ? '#94a3b8' : 'var(--color-primary)';

  return (
    <div
      className="card"
      style={{
        display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0,
        border: isOngoing ? '2px solid #fca5a5' : isNext ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
        boxShadow: isOngoing ? '0 0 0 4px rgba(239,68,68,0.08)' : isNext ? '0 0 0 4px rgba(99,102,241,0.06)' : 'none',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: '4px', background: isOngoing ? 'linear-gradient(90deg, #ef4444, #f97316)' : isCompleted ? '#e2e8f0' : 'var(--linear-primary)' }} />

      <div style={{ padding: '20px 24px', flex: 1 }}>
        {/* Status row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          {isOngoing ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: '#fee2e2', color: '#dc2626', fontSize: '11px', fontWeight: '800', letterSpacing: '0.06em' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444', animation: 'livePulse 1.4s ease-in-out infinite' }} />
              LIVE NOW
            </span>
          ) : isCompleted ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', background: '#f1f5f9', color: '#64748b', fontSize: '11px', fontWeight: '700' }}>
              <CheckCircle size={10} /> Completed
            </span>
          ) : isNext ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', background: 'var(--color-primary-light, #eef2ff)', color: 'var(--color-primary)', fontSize: '11px', fontWeight: '700' }}>
              ⏭ Next Up
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', background: '#f0fdf4', color: '#16a34a', fontSize: '11px', fontWeight: '700' }}>
              <Calendar size={10} /> Scheduled
            </span>
          )}

          {!isCompleted && !isOngoing && <CountdownBadge scheduledAt={item.scheduledAt} />}
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)', margin: '0 0 6px', lineHeight: 1.3 }}>{item.title}</h3>

        {subjectName && (
          <p style={{ fontSize: '12px', fontWeight: '700', color: accentColor, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 16px' }}>{subjectName}</p>
        )}

        {/* Meta chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '14px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--color-bg)', borderRadius: '10px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
            <Calendar size={13} color={accentColor} />
            {formatDate(item.scheduledAt)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--color-bg)', borderRadius: '10px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
            <Clock size={13} color={accentColor} />
            {formatTime(item.scheduledAt)} · {item.duration || 60}m
          </div>
        </div>

        {/* Faculty row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--color-bg)', borderRadius: '12px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(135deg, ${accentColor}88, var(--color-primary))`,
            color: 'white', fontSize: '12px', fontWeight: '800'
          }}>
            {getInitials(item.faculty?.name)}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{item.faculty?.name || 'TBD'}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Faculty</div>
          </div>
          {item.batches?.length > 0 && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
              <Users size={11} /> {item.batches.length} batch{item.batches.length > 1 ? 'es' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Action footer */}
      <div style={{ padding: '14px 24px', background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)' }}>
        {isCompleted ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {item.recordingUrl ? (
              <button
                onClick={() => window.open(item.recordingUrl, '_blank')}
                className="btn btn-primary"
                style={{ width: '100%', height: '44px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', fontWeight: '700' }}
              >
                <Play size={16} /> Watch Recording
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>
                <AlertCircle size={15} /> Recording not yet available
              </div>
            )}
            {item.presentationUrl && (
              <button
                onClick={() => window.open(item.presentationUrl, '_blank')}
                className="btn btn-secondary"
                style={{ width: '100%', height: '40px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', fontWeight: '600', fontSize: '13px' }}
              >
                <FileText size={14} /> Class Notes
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => onJoin(item._id)}
            disabled={isJoining}
            style={{
              width: '100%', height: '48px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center',
              borderRadius: '12px', border: 'none', cursor: isJoining ? 'not-allowed' : 'pointer',
              backgroundColor: isOngoing ? '#ef4444' : 'var(--color-primary)',
              color: 'white', fontWeight: '800', fontSize: '15px',
              opacity: isJoining ? 0.8 : 1,
              transition: 'all 0.2s',
              boxShadow: isOngoing ? '0 4px 16px rgba(239,68,68,0.4)' : '0 4px 16px rgba(99,102,241,0.3)',
            }}
          >
            {isJoining ? (
              <>
                <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                Checking...
              </>
            ) : isOngoing ? (
              <><Radio size={17} /> Join Live Now</>
            ) : (
              <><Play size={16} /> Enter Waiting Room <ChevronRight size={15} style={{ marginLeft: '2px' }} /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function StudentLiveClasses() {
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [joiningId, setJoiningId] = useState(null);
  const intervalRef = useRef(null);

  const fetchClasses = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await axios.get('/api/student/live-classes');
      const { upcoming = [], past = [] } = res.data.data || {};
      setUpcoming(upcoming);
      setPast(past);
      setLastRefreshed(new Date());
    } catch (err) {
      if (showLoader) toast.error('Failed to load live schedule.');
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses(true);
    intervalRef.current = setInterval(() => fetchClasses(false), 30000);
    return () => clearInterval(intervalRef.current);
  }, [fetchClasses]);

  const handleJoinSession = async (id, retryCount = 0) => {
    setJoiningId(id);
    try {
      const res = await axios.get(`/api/student/live-classes/${id}/join`);
      if (res.data.data?.joinUrl) {
        window.open(res.data.data.joinUrl, '_blank');
        toast.success('Opening class room... 🎓');
        fetchClasses();
      } else {
        toast.error('Meeting URL not generated.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || '';
      const notStarted = msg.toLowerCase().includes('not started');
      if (notStarted && retryCount < 3) {
        const toastId = toast.loading(`Checking for instructor… (${retryCount + 1}/3)`);
        setTimeout(async () => {
          toast.dismiss(toastId);
          setJoiningId(null);
          await handleJoinSession(id, retryCount + 1);
        }, 5000);
        return; // Keep joiningId set during retry
      } else {
        toast.error(notStarted
          ? 'Instructor hasn\'t started the class yet. Try again in a moment.'
          : (msg || 'Could not join. Please try again.'));
      }
    } finally {
      if (retryCount === 0 || joiningId !== id) setJoiningId(null);
    }
  };

  const hasOngoing = upcoming.some(c => c.status === 'ongoing');
  const nextUpcoming = upcoming.find(c => c.status === 'upcoming');
  const displayList = activeTab === 'upcoming' ? upcoming : past;

  return (
    <div style={{ paddingBottom: '80px' }}>
      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .live-banner { animation: slideDown 0.4s ease; }
        .session-card-btn:hover:not(:disabled) { transform: translateY(-1px) !important; }
      `}</style>

      {/* ── Hero Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #1a0a0a 0%, #7f1d1d 55%, #1a0a0a 100%)', borderRadius: '28px', padding: '32px 40px', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.25) 0%, transparent 70%)' }} />
        <style>{`@keyframes livePulseIcon { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }`}</style>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.35)', padding: '5px 13px', borderRadius: '99px', marginBottom: '12px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444', animation: 'livePulseIcon 1.4s ease infinite' }} />
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live Classes</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: 'white', letterSpacing: '-0.03em' }}>Live Sessions</h1>
            <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'rgba(252,165,165,0.75)' }}>
              Join your live classes and interact with your instructor in real time.
            </p>
          </div>
          <button onClick={() => fetchClasses(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0, backdropFilter: 'blur(6px)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
            <RefreshCw size={14} />
            Refresh
            {lastRefreshed && <span style={{ fontSize: '11px', opacity: 0.65 }}>{lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
          </button>
        </div>
      </div>

      {/* ── Live Now Banner ── */}
      {hasOngoing && (
        <div className="live-banner" style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '16px 22px', marginBottom: '24px',
          background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)',
          borderRadius: '16px', boxShadow: '0 8px 32px rgba(220,38,38,0.35)',
          color: 'white'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Radio size={22} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '800', letterSpacing: '0.02em' }}>
              🔴 A class is LIVE right now!
            </div>
            <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px' }}>
              Your instructor has started the session. Join immediately below.
            </div>
          </div>
          <button
            onClick={() => setActiveTab('upcoming')}
            style={{ marginLeft: 'auto', padding: '8px 20px', borderRadius: '10px', border: 'none', background: 'white', color: '#dc2626', fontWeight: '800', fontSize: '13px', cursor: 'pointer', flexShrink: 0 }}
          >
            Join Now →
          </button>
        </div>
      )}

      {/* ── Stats row ── */}
      {!loading && (upcoming.length > 0 || past.length > 0) && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { label: 'Upcoming', value: upcoming.length, color: '#6366f1', icon: Calendar },
            { label: 'Completed', value: past.length, color: '#10b981', icon: CheckCircle },
            { label: 'Live Now', value: upcoming.filter(c => c.status === 'ongoing').length, color: '#ef4444', icon: Radio },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)', flex: '1 1 120px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={17} color={color} />
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text-primary)', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '600', marginTop: '2px' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--color-bg)', padding: '5px', borderRadius: '14px', border: '1px solid var(--color-border)', marginBottom: '24px', width: 'fit-content' }}>
        {[['upcoming', 'Upcoming', BookOpen], ['past', 'Past Sessions', CheckCircle]].map(([val, label, Icon]) => (
          <button
            key={val}
            onClick={() => setActiveTab(val)}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: activeTab === val ? 'var(--color-primary)' : 'transparent',
              color: activeTab === val ? 'white' : 'var(--color-text-secondary)',
              fontWeight: '700', fontSize: '13px', transition: 'all 0.2s',
              boxShadow: activeTab === val ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
            }}
          >
            <Icon size={14} />
            {label}
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '20px', height: '20px', borderRadius: '50%', fontSize: '10px', fontWeight: '800',
              background: activeTab === val ? 'rgba(255,255,255,0.25)' : 'var(--color-border)',
              color: activeTab === val ? 'white' : 'var(--color-text-secondary)'
            }}>
              {val === 'upcoming' ? upcoming.length : past.length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Cards Grid ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '15vh', gap: '16px' }}>
          <div className="spinner" />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading your sessions...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {displayList.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : displayList.map((item, idx) => (
            <SessionCard
              key={item._id}
              item={item}
              isNext={activeTab === 'upcoming' && idx === 0 && item.status === 'upcoming'}
              onJoin={handleJoinSession}
              joiningId={joiningId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
