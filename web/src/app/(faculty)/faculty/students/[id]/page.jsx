"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
  ArrowLeft, User, Mail, Phone, School, MapPin, Calendar,
  BookOpen, Video, Radio, FileText, StickyNote, Clock,
  Zap, CheckCircle, XCircle, TrendingUp, Activity, Plus, Send
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'overview', label: 'Overview', icon: Activity },
  { key: 'videos', label: 'Recorded Classes', icon: Video },
  { key: 'live', label: 'Live Sessions', icon: Radio },
  { key: 'notes', label: 'Staff Notes', icon: StickyNote },
];

function StatCard({ icon: Icon, value, label, color = '#6366f1', bg = '#eef2ff' }) {
  return (
    <div style={{
      background: 'var(--color-card)', borderRadius: '16px', padding: '20px',
      border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px'
    }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={22} color={color} />
      </div>
      <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>{value}</div>
      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}

function formatDuration(secs) {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function FacultyStudentAnalytics() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [note, setNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/faculty/students/${id}/metrics`);
      setData(res.data.data);
    } catch {
      toast.error('Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return toast.error('Note cannot be empty');
    setAddingNote(true);
    try {
      const res = await axios.post(`/api/faculty/students/${id}/notes`, { note });
      setData(prev => ({ ...prev, student: res.data.data }));
      setNote('');
      toast.success('Note added successfully');
    } catch {
      toast.error('Failed to save note');
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: '48px', height: '48px' }}></div>
    </div>
  );

  if (!data) return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-secondary)' }}>
      <User size={64} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
      <p>Student data not found.</p>
    </div>
  );

  const { student, recordedClasses = [], liveClasses = [], assignments = [], tests = [], metrics = {} } = data;

  const totalVideos = recordedClasses.length;
  const totalLive = liveClasses.length;
  const attendedLive = liveClasses.filter(l => l.attendance?.attended).length;
  const totalWatchSecs = recordedClasses.reduce((sum, v) => sum + (v.progress?.durationWatched || 0), 0);

  const barData = [
    { name: 'Videos', value: totalVideos },
    { name: 'Live Attended', value: attendedLive },
    { name: 'Assignments', value: assignments.length },
    { name: 'Tests', value: tests.length },
  ];

  const radarData = [
    { subject: 'Activity', A: metrics.activityScore || 0 },
    { subject: 'Attendance', A: metrics.attendance || Math.round((attendedLive / Math.max(totalLive, 1)) * 100) },
    { subject: 'Watch Time', A: Math.min((totalWatchSecs / 36000) * 100, 100) | 0 },
    { subject: 'Videos', A: Math.min(totalVideos * 5, 100) },
    { subject: 'Tasks', A: Math.min((assignments.length + tests.length) * 8, 100) },
  ];

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <button onClick={() => router.back()} className="btn btn-ghost"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--color-text-secondary)' }}>
          <ArrowLeft size={16} /> Back to Students
        </button>

        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '24px', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '16px', background: 'var(--color-primary-light)',
            color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: '900', flexShrink: 0
          }}>
            {student?.name?.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{student?.name}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} />{student?.email}</span>
              {student?.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} />{student?.phone}</span>}
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><School size={14} />{student?.studentClass || 'N/A'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} />{student?.district || 'N/A'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} />Joined {formatDate(student?.createdAt)}</span>
            </div>
          </div>
          <div>
            <span style={{
              padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700',
              background: student?.isActive ? '#dcfce7' : '#fee2e2',
              color: student?.isActive ? '#166534' : '#991b1b'
            }}>
              {student?.isActive ? '● Active' : '● Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <StatCard icon={Video} value={totalVideos} label="Videos Watched" color="#6366f1" bg="#eef2ff" />
        <StatCard icon={Radio} value={`${attendedLive}/${totalLive}`} label="Live Sessions" color="#22c55e" bg="#f0fdf4" />
        <StatCard icon={Clock} value={formatDuration(totalWatchSecs)} label="Total Watch Time" color="#f59e0b" bg="#fffbeb" />
        <StatCard icon={FileText} value={assignments.length + tests.length} label="Assessments" color="#ec4899" bg="#fdf2f8" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: 'var(--color-bg)', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontWeight: '600', fontSize: '14px', transition: 'all 0.2s',
            background: tab === key ? 'white' : 'transparent',
            color: tab === key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            boxShadow: tab === key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
          }}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="var(--color-primary)" /> Activity Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={8} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '13px' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={['#6366f1', '#22c55e', '#f59e0b', '#ec4899'][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#ec4899" /> Performance Radar
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#cbd5e1' }} />
                <Radar name="Student" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Notes Preview */}
          <div className="card" style={{ padding: '24px', gridColumn: 'span 2' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StickyNote size={18} color="#f59e0b" /> Recent Staff Notes
            </h3>
            {(student?.instructorNotes?.length || 0) === 0 ? (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>No notes added yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[...(student?.instructorNotes || [])].slice(-3).reverse().map((n, i) => (
                  <div key={i} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px 16px' }}>
                    <p style={{ margin: '0 0 6px', fontSize: '14px', color: '#1e293b' }}>{n.note}</p>
                    <span style={{ fontSize: '12px', color: '#92400e' }}>{formatDate(n.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Recorded Videos */}
      {tab === 'videos' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Video size={18} color="var(--color-primary)" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Recorded Class Engagement</h3>
            <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--color-text-secondary)', background: 'var(--color-bg)', padding: '4px 12px', borderRadius: '20px', fontWeight: '600' }}>
              {totalVideos} {totalVideos === 1 ? 'Class' : 'Classes'} watched
            </span>
          </div>
          {totalVideos === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              <Video size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
              <p>This student hasn't watched any recorded classes yet.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg)', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 20px', textAlign: 'left' }}>Class Title</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>Completion</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>Duration Watched</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>Playback Speed</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>Rewatched</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left' }}>Last Watched</th>
                </tr>
              </thead>
              <tbody>
                {recordedClasses.map((v, i) => (
                  <tr key={v._id || i} style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '14px' }}>{v.title}</div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                        background: v.type === 'faq' ? '#e0f2fe' : '#ede9fe',
                        color: v.type === 'faq' ? '#0369a1' : '#7c3aed'
                      }}>
                        {v.type || 'lecture'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <div style={{ width: '80px', height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ width: `${v.progress?.watchPercentage || 0}%`, height: '100%', background: '#6366f1', borderRadius: '99px' }} />
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{v.progress?.watchPercentage || 0}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: '600', fontSize: '14px' }}>
                      {formatDuration(v.progress?.durationWatched)}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '12px', fontWeight: '700', fontSize: '13px',
                        background: (v.progress?.playbackSpeed || 1) > 1 ? '#fef9c3' : '#f8fafc',
                        color: (v.progress?.playbackSpeed || 1) > 1 ? '#a16207' : '#475569'
                      }}>
                        {v.progress?.playbackSpeed || 1}x
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                      {v.progress?.rewatchCount || 0}×
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      {formatDate(v.progress?.lastWatchedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab: Live Sessions */}
      {tab === 'live' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={18} color="#22c55e" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Live Session Attendance Log</h3>
            <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--color-text-secondary)', background: 'var(--color-bg)', padding: '4px 12px', borderRadius: '20px', fontWeight: '600' }}>
              {attendedLive}/{totalLive} attended
            </span>
          </div>
          {totalLive === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              <Radio size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
              <p>No live sessions scheduled or attended yet.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg)', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 20px', textAlign: 'left' }}>Session Title</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left' }}>Scheduled</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>Attended</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>Joined At</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>Left At</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>Duration (planned)</th>
                </tr>
              </thead>
              <tbody>
                {liveClasses.map((l, i) => (
                  <tr key={l._id || i} style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '14px 20px', fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '14px' }}>{l.title}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                        background: l.status === 'completed' ? '#dcfce7' : l.status === 'ongoing' ? '#fef9c3' : '#f1f5f9',
                        color: l.status === 'completed' ? '#166534' : l.status === 'ongoing' ? '#a16207' : '#475569'
                      }}>
                        {l.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      {formatDate(l.scheduledAt)} {formatTime(l.scheduledAt)}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      {l.attendance?.attended
                        ? <CheckCircle size={18} color="#22c55e" />
                        : <XCircle size={18} color="#ef4444" />}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: '600', fontSize: '14px', color: '#22c55e' }}>
                      {formatTime(l.attendance?.joinTime)}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: '600', fontSize: '14px', color: '#ef4444' }}>
                      {formatTime(l.attendance?.leaveTime)}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                      {l.duration} min
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab: Notes */}
      {tab === 'notes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Add Note */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} color="var(--color-primary)" /> Add Staff Note
            </h3>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add an observation, performance note, or recommendation for this student..."
              rows={4}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid var(--color-border)',
                fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                transition: 'border 0.2s'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button onClick={handleAddNote} disabled={addingNote || !note.trim()} className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}>
                <Send size={16} />
                {addingNote ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>

          {/* Notes List */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700' }}>
              Note History ({student?.instructorNotes?.length || 0})
            </h3>
            {(student?.instructorNotes?.length || 0) === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>
                <StickyNote size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                <p>No notes have been added for this student yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[...(student?.instructorNotes || [])].reverse().map((n, i) => (
                  <div key={i} style={{
                    padding: '16px 20px', background: 'var(--color-bg)', borderRadius: '12px',
                    borderLeft: '4px solid #f59e0b', position: 'relative'
                  }}>
                    <p style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: '1.6' }}>{n.note}</p>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                      {formatDate(n.date)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
