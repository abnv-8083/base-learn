"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PlaySquare, Calendar, ClipboardList, Award } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import Link from 'next/link';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ recorded: 0, live: 0, assignments: 0, completion: 0 });
  const [mainAssessments, setMainAssessments] = useState({ tests: [], assignments: [] });
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    upcomingLive: [],
    assessments: { assignments: [], tests: [] },
    recentVideos: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashRes = await axios.get('/api/student/dashboard');
        
        if (dashRes.data?.data) {
          const d = dashRes.data.data;
          setStats({
            recorded: d.recordedClassesAvailable,
            live: d.liveClassesCount,
            assignments: d.pendingAssignments,
            completion: d.completionRate,
            hasPaid: true, // Default to true if not provided, or handle as needed
            batch: d.batch,
            faculty: d.faculty,
            subjects: d.subjects || []
          });
          setDashboardData({
            upcomingLive: d.upcomingLiveClasses || [],
            assessments: d.latestAssessments || { assignments: [], tests: [] },
            recentVideos: d.recentVideos || []
          });
        }
      } catch (err) {
        console.error('Dash load failed', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '30vh' }} />;

  // Mock data for Recharts
  const completionData = [
    { name: 'Completed', value: stats.completion },
    { name: 'Pending', value: 100 - stats.completion },
  ];
  const COLORS = ['#10b981', '#cbd5e1'];

  const subjectData = (stats.subjects || []).map(s => ({
    name: s.name.substring(0, 10),
    progress: s.progress || 0
  }));

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="page-subtitle">You are part of <strong>{stats.batch?.name || 'Your Batch'}</strong>. Ready for today's session?</p>
          </div>
          <div className="page-header-actions">
            <Link href="/student/recorded-classes" className="btn btn-primary">Resume Learning</Link>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-card--accent">
          <div className="stat-card-header">
            <div className="stat-card-icon"><PlaySquare size={20} /></div>
          </div>
          <div>
            <div className="stat-card-value text-glow">{stats.recorded}</div>
            <div className="stat-card-label">Videos Available</div>
          </div>
        </div>

        <div className="stat-card stat-card--student">
          <div className="stat-card-header">
            <div className="stat-card-icon"><Calendar size={20} /></div>
          </div>
          <div>
            <div className="stat-card-value text-glow">{stats.live}</div>
            <div className="stat-card-label">Upcoming Live</div>
          </div>
        </div>

        <div className="stat-card stat-card--warning">
          <div className="stat-card-header">
            <div className="stat-card-icon"><ClipboardList size={20} /></div>
          </div>
          <div>
            <div className="stat-card-value text-glow">{stats.assignments}</div>
            <div className="stat-card-label">Pending Tasks</div>
          </div>
        </div>

        <div className="stat-card stat-card--success">
          <div className="stat-card-header">
            <div className="stat-card-icon"><Award size={20} /></div>
          </div>
          <div>
            <div className="stat-card-value text-glow">{stats.completion}%</div>
            <div className="stat-card-label">Total Progress</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Classes & Progression */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '32px' }}>
        
        {/* Upcoming Live Section */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">🔴 Live & Upcoming Sessions</h3>
            <Link href="/student/live-classes" style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: '600' }}>View Schedule</Link>
          </div>
          <div className="card-body">
            {dashboardData.upcomingLive.length > 0 ? (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {dashboardData.upcomingLive.map(lc => (
                        <div key={lc._id} style={{ 
                            padding: '16px', borderRadius: '16px', background: 'var(--color-bg-light)', 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            border: lc.status === 'ongoing' ? '1px solid #ff4d4d' : '1px solid transparent'
                        }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ 
                                    width: '40px', height: '40px', borderRadius: '10px', 
                                    background: lc.status === 'ongoing' ? '#ff4d4d' : 'var(--color-primary)', 
                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '18px'
                                }}>
                                    {lc.status === 'ongoing' ? '📡' : '🕒'}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{lc.topic}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                        {lc.faculty?.name} • {new Date(lc.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                            <Link href={`/student/live-classes/${lc._id}`} className={`btn ${lc.status === 'ongoing' ? 'btn-primary' : 'btn-outline-primary'}`} style={{ padding: '6px 14px', fontSize: '12px' }}>
                                Join
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--color-text-secondary)' }}>
                    <p style={{ fontSize: '13px' }}>No live sessions scheduled right now.</p>
                </div>
            )}
          </div>
        </div>

        {/* Subject Mastery Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Subject Mastery</h3>
          </div>
          <div className="card-body" style={{ height: '300px', position: 'relative' }}>
             {subjectData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={subjectData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '11px' }} />
                   <YAxis axisLine={false} tickLine={false} style={{ fontSize: '11px' }} />
                   <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                   <Bar dataKey="progress" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={30} />
                 </BarChart>
               </ResponsiveContainer>
             ) : (
               <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                 No subject data found.
               </div>
             )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '0.6fr 1.4fr', gap: '32px', marginTop: '32px' }}>
        {/* Task Completion Ratio Circle */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Academic Progress</h3>
          </div>
          <div className="card-body" style={{ height: '300px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    innerRadius={80}
                    outerRadius={105}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
               <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.completion}%</div>
               <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Overall Progress</div>
            </div>
          </div>
        </div>

      {/* Latest Assignments & Tests */}
      <div style={{ marginTop: '32px' }}>
          <div className="page-header" style={{ height: 'auto', padding: '0 0 16px', background: 'transparent', border: 'none', boxShadow: 'none' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>📋 New Assessments</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div className="card" style={{ borderTop: '4px solid var(--color-warning)' }}>
                  <div className="card-header">
                      <h3 className="card-title" style={{ fontSize: '15px' }}>Latest Assignments</h3>
                  </div>
                  <div className="card-body" style={{ padding: '8px 20px' }}>
                      {dashboardData.assessments?.assignments?.length > 0 ? (
                          dashboardData.assessments.assignments.map(a => (
                              <div key={a._id} style={{ padding: '16px 0', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{a.title}</div>
                                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                          {a.subject?.name} • Due: {a.deadline ? new Date(a.deadline).toLocaleDateString() : 'N/A'}
                                      </div>
                                  </div>
                                  <Link href="/student/assignments" style={{ color: 'var(--color-primary)', fontSize: '13px', fontWeight: '500' }}>Open</Link>
                              </div>
                          ))
                      ) : (
                          <p style={{ padding: '20px 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>No new assignments.</p>
                      )}
                  </div>
              </div>

              <div className="card" style={{ borderTop: '4px solid var(--color-success)' }}>
                  <div className="card-header">
                      <h3 className="card-title" style={{ fontSize: '15px' }}>Upcoming Tests</h3>
                  </div>
                  <div className="card-body" style={{ padding: '8px 20px' }}>
                    {dashboardData.assessments?.tests?.length > 0 ? (
                        dashboardData.assessments.tests.map(t => (
                            <div key={t._id} style={{ padding: '16px 0', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{t.title}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                        {t.subject?.name} • Scheduled: {t.deadline ? new Date(t.deadline).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                                <Link href="/student/tests" style={{ color: 'var(--color-primary)', fontSize: '13px', fontWeight: '500' }}>Start</Link>
                            </div>
                        ))
                    ) : (
                        <p style={{ padding: '20px 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>No tests scheduled.</p>
                    )}
                  </div>
              </div>
          </div>
      </div>

      {/* Recently Added Videos (Today) */}
      <div style={{ marginTop: '40px' }}>
          <div className="page-header" style={{ height: 'auto', padding: '0 0 16px', background: 'transparent', border: 'none', boxShadow: 'none' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>📽️ Recently Uploaded Classes</h2>
          </div>
          {dashboardData.recentVideos.length > 0 ? (
              <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                  gap: '24px' 
              }}>
                  {dashboardData.recentVideos.map(v => (
                      <Link key={v._id} href={`/student/recorded-classes?videoId=${v._id}`} className="card hover-lift" style={{ overflow: 'hidden', padding: '0', textDecoration: 'none' }}>
                          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' }}>
                              {v.thumbnail ? (
                                  <img src={v.thumbnail} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--linear-primary)', color: 'white' }}>🎓</div>
                              )}
                              <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
                                  New
                              </div>
                          </div>
                          <div style={{ padding: '16px' }}>
                              <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--color-text)' }}>{v.title}</div>
                              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                  <span>{v.subject?.name}</span>
                                  <span>{v.faculty?.name}</span>
                              </div>
                          </div>
                      </Link>
                  ))}
              </div>
          ) : (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <p>No new videos uploaded today. Visit your "Recorded Classes" to catch up on previous sessions!</p>
            </div>
          )}
      </div>

    </div>
  );
}
