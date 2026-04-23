"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PlaySquare, Calendar, ClipboardList, Award, Sparkles, ArrowRight, Play, BookOpen, Radio, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import Link from 'next/link';

const MOBILE_CSS = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
  .dash-fade { animation: fadeUp 0.5s ease both; }

  .dash-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }
  .dash-2col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 32px;
  }
  .dash-video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
  }
  .dash-hero {
    border-radius: 28px;
    padding: 36px 40px;
    margin-bottom: 32px;
  }
  .dash-hero-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
  }
  .dash-resume-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg,#6366f1,#8b5cf6);
    color: white;
    padding: 13px 24px;
    border-radius: 14px;
    font-weight: 800;
    font-size: 14px;
    text-decoration: none;
    box-shadow: 0 6px 20px rgba(99,102,241,0.45);
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .assess-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
    border-bottom: 1px solid #f1f5f9;
    gap: 10px;
  }
  .assess-row-title {
    font-weight: 700;
    font-size: 14px;
    color: #1e293b;
  }
  .assess-row-sub {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 3px;
  }

  @media (max-width: 900px) {
    .dash-stats-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
  }
  @media (max-width: 768px) {
    .dash-2col { grid-template-columns: 1fr !important; gap: 16px; }
    .dash-hero { padding: 24px 20px !important; border-radius: 20px !important; }
  }
  @media (max-width: 540px) {
    .dash-stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
    .dash-video-grid { grid-template-columns: 1fr; gap: 12px; }
    .dash-hero { padding: 20px 16px !important; margin-bottom: 20px; }
    .dash-resume-btn { width: 100%; justify-content: center; }
    .dash-hero-inner { flex-direction: column; align-items: flex-start; }
    .assess-row { flex-direction: column; align-items: flex-start; }
  }
  @media (max-width: 360px) {
    .dash-stats-grid { grid-template-columns: 1fr 1fr; }
  }
  .stat-card-arrow { display: flex; }
  @media (max-width: 500px) {
    .stat-card-arrow { display: none; }
  }
`;

function StatCard({ href, icon: Icon, value, label, color, grad }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: 'clamp(12px,2.5vw,18px) clamp(12px,2.5vw,18px)', border: '1px solid #e8edf5', boxShadow: '0 2px 12px rgba(15,23,42,0.05)', display: 'flex', gap: '10px', alignItems: 'center', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', height: '100%', minWidth: 0 }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 10px 24px ${color}22`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(15,23,42,0.05)'; }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: grad }} />
        <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={18} color={color} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 'clamp(18px,3.5vw,26px)', fontWeight: '900', color: '#0f172a', lineHeight: 1, letterSpacing: '-0.03em' }}>{value}</div>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginTop: '4px', lineHeight: 1.3, wordBreak: 'break-word' }}>{label}</div>
        </div>
        <div className="stat-card-arrow" style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <ArrowRight size={13} color={color} style={{ opacity: 0.5 }} />
        </div>
      </div>
    </Link>
  );
}

function AssessItem({ title, sub, href, linkLabel, color }) {
  return (
    <div className="assess-row"
      onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
      onMouseLeave={e => e.currentTarget.style.background = ''}>
      <div style={{ minWidth: 0 }}>
        <div className="assess-row-title">{title}</div>
        <div className="assess-row-sub">{sub}</div>
      </div>
      <Link href={href} style={{ padding: '6px 14px', borderRadius: '10px', background: `${color}15`, color, fontSize: '12px', fontWeight: '800', textDecoration: 'none', flexShrink: 0 }}>
        {linkLabel}
      </Link>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ recorded: 0, live: 0, assignments: 0, completion: 0 });
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({ upcomingLive: [], assessments: { assignments: [], tests: [] }, recentVideos: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashRes = await axios.get('/api/student/dashboard');
        if (dashRes.data?.data) {
          const d = dashRes.data.data;
          setStats({ recorded: d.recordedClassesAvailable, live: d.liveClassesCount, assignments: d.pendingAssignments, completion: d.completionRate, batch: d.batch, subjects: d.subjects || [] });
          setDashboardData({ upcomingLive: d.upcomingLiveClasses || [], assessments: d.latestAssessments || { assignments: [], tests: [] }, recentVideos: d.recentVideos || [] });
        }
      } catch (err) { console.error('Dash load failed', err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>Loading your dashboard…</p>
    </div>
  );

  const subjectData = (stats.subjects || []).map(s => ({ name: s.name?.substring(0, 10), progress: s.progress || 0 }));
  const firstName = user?.name?.split(' ')[0] || 'Student';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ paddingBottom: '60px' }}>
      <style>{MOBILE_CSS}</style>

      {/* ── Hero Banner ── */}
      <div className="dash-fade dash-hero" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-100px', left: '5%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="dash-hero-inner" style={{ position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.35)', padding: '5px 13px', borderRadius: '99px', marginBottom: '14px' }}>
              <Sparkles size={12} color="#a5b4fc" />
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Student Dashboard</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: '900', color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {greeting}, <span style={{ color: '#a5b4fc' }}>{firstName}!</span>
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'rgba(148,163,184,0.9)' }}>
              You're in <strong style={{ color: 'white' }}>{stats.batch?.name || 'your batch'}</strong>. Ready to learn today?
            </p>
          </div>
          <Link href="/student/recorded-classes" className="dash-resume-btn"
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}>
            <Play size={16} /> Resume Learning
          </Link>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="dash-stats-grid dash-fade" style={{ animationDelay: '0.05s' }}>
        <StatCard href="/student/recorded-classes" icon={PlaySquare} value={stats.recorded} label="Videos Available" color="#6366f1" grad="linear-gradient(135deg,#6366f1,#8b5cf6)" />
        <StatCard href="/student/live-classes"     icon={Radio}       value={stats.live}      label="Upcoming Live"   color="#ef4444" grad="linear-gradient(135deg,#ef4444,#f97316)" />
        <StatCard href="/student/assignments"      icon={ClipboardList} value={stats.assignments} label="Pending Tasks" color="#f59e0b" grad="linear-gradient(135deg,#f59e0b,#ef4444)" />
        <StatCard href="/student/progression"      icon={Award}       value={`${stats.completion}%`} label="Total Progress" color="#10b981" grad="linear-gradient(135deg,#10b981,#059669)" />
      </div>

      {/* ── Recent Videos ── */}
      <div className="dash-fade" style={{ marginBottom: '32px', animationDelay: '0.1s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ fontSize: 'clamp(16px,3vw,20px)', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>📽️ Recently Uploaded Classes</h2>
          <Link href="/student/recorded-classes" style={{ fontSize: '13px', fontWeight: '700', color: '#6366f1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>View all <ArrowRight size={13} /></Link>
        </div>
        {dashboardData.recentVideos.length > 0 ? (
          <div className="dash-video-grid">
            {dashboardData.recentVideos.map(v => (
              <Link key={v._id} href={`/student/recorded-classes?videoId=${v._id}`} style={{ textDecoration: 'none', borderRadius: '18px', overflow: 'hidden', background: 'white', border: '1px solid #e8edf5', boxShadow: '0 2px 12px rgba(15,23,42,0.06)', display: 'flex', flexDirection: 'column', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(15,23,42,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(15,23,42,0.06)'; }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: 'linear-gradient(135deg,#1e1b4b,#312e81)', overflow: 'hidden' }}>
                  {v.thumbnail
                    ? <img src={v.thumbnail} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Play size={20} color="white" />
                        </div>
                      </div>}
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#6366f1', color: 'white', padding: '3px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '800' }}>NEW</div>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)', pointerEvents: 'none' }} />
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a', marginBottom: '6px', lineHeight: 1.35 }}>{v.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                    <span>{v.subject?.name}</span><span>{v.faculty?.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ padding: '40px 24px', textAlign: 'center', background: 'white', borderRadius: '18px', border: '1px dashed #e2e8f0' }}>
            <BookOpen size={32} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#94a3b8', fontWeight: '600', fontSize: '14px', margin: 0 }}>No new videos uploaded recently.</p>
          </div>
        )}
      </div>

      {/* ── Assessments ── */}
      <div className="dash-2col dash-fade" style={{ animationDelay: '0.15s' }}>
        <div style={{ background: 'white', borderRadius: '18px', border: '1px solid #e8edf5', overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
          <div style={{ padding: '14px 20px', background: 'linear-gradient(to right,#fffbeb,#fef3c7)', borderBottom: '1px solid #fde68a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#92400e' }}>Latest Assignments</h3>
            </div>
            <Link href="/student/assignments" style={{ fontSize: '11px', fontWeight: '800', color: '#d97706', textDecoration: 'none' }}>View All</Link>
          </div>
          {dashboardData.assessments?.assignments?.length > 0 ? dashboardData.assessments.assignments.map(a => (
            <AssessItem key={a._id} title={a.title} sub={`${a.subject?.name || ''} • Due: ${a.deadline ? new Date(a.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}`} href="/student/assignments" linkLabel="Open →" color="#f59e0b" />
          )) : (
            <div style={{ padding: '28px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>✅ No new assignments.</div>
          )}
        </div>

        <div style={{ background: 'white', borderRadius: '18px', border: '1px solid #e8edf5', overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
          <div style={{ padding: '14px 20px', background: 'linear-gradient(to right,#ecfdf5,#d1fae5)', borderBottom: '1px solid #6ee7b7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#065f46' }}>Upcoming Tests</h3>
            </div>
            <Link href="/student/tests" style={{ fontSize: '11px', fontWeight: '800', color: '#059669', textDecoration: 'none' }}>View All</Link>
          </div>
          {dashboardData.assessments?.tests?.length > 0 ? dashboardData.assessments.tests.map(t => (
            <AssessItem key={t._id} title={t.title} sub={`${t.subject?.name || ''} • ${t.deadline ? new Date(t.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}`} href="/student/tests" linkLabel="Start →" color="#10b981" />
          )) : (
            <div style={{ padding: '28px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>✅ No tests scheduled.</div>
          )}
        </div>
      </div>

      {/* ── Live + Chart ── */}
      <div className="dash-2col dash-fade" style={{ animationDelay: '0.2s' }}>
        <div style={{ background: 'white', borderRadius: '18px', border: '1px solid #e8edf5', overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
          <div style={{ padding: '14px 20px', background: 'linear-gradient(to right, #fef2f2, #fee2e2)', borderBottom: '1px solid #fca5a5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'livePulse 1.5s ease infinite' }} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#991b1b' }}>Live &amp; Upcoming Sessions</h3>
            </div>
            <Link href="/student/live-classes" style={{ fontSize: '11px', fontWeight: '800', color: '#dc2626', textDecoration: 'none' }}>Schedule</Link>
          </div>
          <div style={{ padding: '12px' }}>
            {dashboardData.upcomingLive.length > 0 ? dashboardData.upcomingLive.map(lc => (
              <div key={lc._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '12px', background: lc.status === 'ongoing' ? '#fee2e2' : '#f8fafc', marginBottom: '8px', border: lc.status === 'ongoing' ? '1px solid #fca5a5' : '1px solid #f1f5f9', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: lc.status === 'ongoing' ? '#ef4444' : '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {lc.status === 'ongoing' ? <Radio size={15} color="white" /> : <Calendar size={14} color="white" />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lc.topic}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{lc.faculty?.name} · {new Date(lc.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
                <Link href={`/student/live-classes/${lc._id}`} style={{ padding: '6px 12px', borderRadius: '9px', background: lc.status === 'ongoing' ? '#ef4444' : '#6366f1', color: 'white', fontSize: '12px', fontWeight: '800', textDecoration: 'none', flexShrink: 0 }}>Join</Link>
              </div>
            )) : (
              <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>No sessions scheduled right now.</div>
            )}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '18px', border: '1px solid #e8edf5', overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>Subject Mastery</h3>
            </div>
            <div style={{ width: '48px', height: '48px', position: 'relative' }}>
              <svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="24" cy="24" r="18" fill="none" stroke="#e2e8f0" strokeWidth="5" />
                <circle cx="24" cy="24" r="18" fill="none" stroke="#6366f1" strokeWidth="5" strokeDasharray={`${(stats.completion / 100) * 113} 113`} strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '900', color: '#6366f1' }}>{stats.completion}%</div>
            </div>
          </div>
          <div style={{ padding: '8px', height: '220px' }}>
            {subjectData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: '700' }} />
                  <YAxis axisLine={false} tickLine={false} style={{ fontSize: '10px' }} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                  <Bar dataKey="progress" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px', flexDirection: 'column', gap: '8px' }}>
                <TrendingUp size={28} color="#e2e8f0" />
                <span>No subject data yet.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}