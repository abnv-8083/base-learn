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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, mainRes] = await Promise.all([
          axios.get('/api/student/dashboard'),
          axios.get('/api/student/main-assessments')
        ]);
        
        if (dashRes.data?.data) {
          const d = dashRes.data.data;
          setStats({
            recorded: d.recordedClassesAvailable,
            live: d.upcomingLiveClasses,
            assignments: d.pendingAssignments,
            completion: d.completionRate,
            hasPaid: d.hasPaid,
            batch: d.batch,
            faculty: d.faculty,
            subjects: d.subjects || []
          });
        }
        if (mainRes.data?.data) {
          setMainAssessments(mainRes.data.data);
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

  // Mock data for Recharts, to map with completion
  const completionData = [
    { name: 'Completed', value: stats.completion },
    { name: 'Pending', value: 100 - stats.completion },
  ];
  const COLORS = ['#10b981', '#cbd5e1'];

  const subjectData = stats.subjects.map(s => ({
    name: s.name.substring(0, 10),
    progress: s.progress || 0
  }));

  if (!stats.hasPaid) {
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px solid var(--color-border)', marginTop: '40px', boxShadow: '0 20px 40px rgba(15, 45, 107, 0.05)', maxWidth: '600px', margin: '40px auto' }}>
         <div style={{ width: '80px', height: '80px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '32px' }}>🔒</div>
         <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Complete Enrollment</h2>
         <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px', fontSize: '16px', lineHeight: '1.6' }}>You must complete your fee payment to unlock access to Batch resources, Live Classes, and Faculty Assignments.</p>
         <button className="btn btn-primary" onClick={async () => {
           try {
             await axios.post('/api/student/pay');
             window.location.reload();
           } catch(e) {
             alert('Payment Check Failed');
           }
         }}>Simulate Payment (UPI)</button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="page-subtitle">Here's an overview of your academic progress.</p>
          </div>
          <div className="page-header-actions">
            <Link href="/student/recorded-classes" className="btn btn-primary">Resume Learning</Link>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-card--accent hover-lift">
          <div className="stat-card-header">
            <div className="stat-card-icon"><PlaySquare size={22} /></div>
          </div>
          <div>
            <div className="stat-card-value text-glow">{stats.recorded}</div>
            <div className="stat-card-label">Recorded Classes</div>
          </div>
        </div>

        <div className="stat-card stat-card--student hover-lift">
          <div className="stat-card-header">
            <div className="stat-card-icon"><Calendar size={22} /></div>
          </div>
          <div>
            <div className="stat-card-value text-glow">{stats.live}</div>
            <div className="stat-card-label">Upcoming Live</div>
          </div>
        </div>

        <div className="stat-card stat-card--warning hover-lift">
          <div className="stat-card-header">
            <div className="stat-card-icon"><ClipboardList size={22} /></div>
          </div>
          <div>
            <div className="stat-card-value text-glow">{stats.assignments}</div>
            <div className="stat-card-label">Pending Tasks</div>
          </div>
        </div>

        <div className="stat-card stat-card--success hover-lift">
          <div className="stat-card-header">
            <div className="stat-card-icon"><Award size={22} /></div>
          </div>
          <div>
            <div className="stat-card-value text-glow">{stats.completion}%</div>
            <div className="stat-card-label">Overall Completion</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '32px' }}>
        
        {/* Recharts Analytics 1 */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Subject Mastery</h3>
          </div>
          <div className="card-body" style={{ height: '300px' }}>
             {subjectData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={subjectData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} />
                   <YAxis axisLine={false} tickLine={false} />
                   <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                   <Bar dataKey="progress" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={40} />
                 </BarChart>
               </ResponsiveContainer>
             ) : (
               <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                 No subject data mapped.
               </div>
             )}
          </div>
        </div>

        {/* Recharts Analytics 2 */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Task Completion Ratio</h3>
          </div>
          <div className="card-body" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={completionData}
                   innerRadius={80}
                   outerRadius={110}
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
            <div style={{ position: 'absolute', textAlign: 'center' }}>
               <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.completion}%</div>
               <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Completed</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
