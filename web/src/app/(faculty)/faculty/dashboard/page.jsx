"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function FacultyDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ 
    totalStudents: 0, 
    pendingAssessments: 0, 
    upcomingClasses: 0, 
    batches: 0,
    verifiedContent: 0,
  });
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, contentRes] = await Promise.all([
          axios.get('/api/faculty/dashboard'),
          axios.get('/api/faculty/content').catch(() => ({ data: { data: [] } }))
        ]);
        if (dashRes.data?.data) setStats(dashRes.data.data);
        if (contentRes.data?.data) setContent(contentRes.data.data);
      } catch (err) {
        console.error('Faculty dash load failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '30vh' }} />;

  const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

  // Real content status chart from actual uploaded content
  const statusCounts = { draft: 0, published: 0, rejected: 0 };
  content.forEach(c => {
    if (statusCounts[c.status] !== undefined) statusCounts[c.status]++;
  });
  const pieData = [
    { name: 'Published', value: statusCounts.published },
    { name: 'Pending Review', value: statusCounts.draft },
    { name: 'Rejected', value: statusCounts.rejected },
  ].filter(d => d.value > 0);

  // Content uploaded per type (real data)
  const typeCounts = {};
  content.forEach(c => {
    const t = c.contentType || c.type || 'other';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });
  const barData = Object.entries(typeCounts).map(([name, count]) => ({ name, count }));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">Welcome back, Prof. {user?.name?.split(' ')[0]}!</h1>
            <p className="page-subtitle">Here is what is happening in your batches today.</p>
          </div>
          <div className="page-header-actions">
            <Link href="/faculty/assignments" className="btn btn-primary">Grade Pending</Link>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-card--accent hover-lift">
          <div className="stat-card-header">
            <div className="stat-card-icon"><CheckCircle size={22} /></div>
          </div>
          <div>
            <div className="stat-card-value text-glow">{stats.verifiedContent}</div>
            <div className="stat-card-label">Verified Content</div>
          </div>
        </div>

        <div className="stat-card stat-card--warning hover-lift">
          <div className="stat-card-header">
            <div className="stat-card-icon"><FileText size={22} /></div>
          </div>
          <div>
            <div className="stat-card-value text-glow">{stats.pendingAssessments}</div>
            <div className="stat-card-label">Pending Graded Tasks</div>
          </div>
        </div>

        <div className="stat-card stat-card--student hover-lift">
          <div className="stat-card-header">
            <div className="stat-card-icon"><Clock size={22} /></div>
          </div>
          <div>
            <div className="stat-card-value text-glow">{stats.upcomingClasses}</div>
            <div className="stat-card-label">Upcoming Sessions</div>
          </div>
        </div>

        <div className="stat-card stat-card--success hover-lift">
          <div className="stat-card-header">
            <div className="stat-card-icon"><CheckCircle size={22} /></div>
          </div>
          <div>
            <div className="stat-card-value text-glow">{stats.batches}</div>
            <div className="stat-card-label">Active Batches</div>
          </div>
        </div>
      </div>

      <div className="dash-layout-grid">
        
        {/* Content by Type Bar Chart (real data) */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">My Uploads by Content Type</h3>
          </div>
          <div className="card-body" style={{ height: '300px' }}>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={40} name="Uploads" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', flexDirection: 'column', gap: '8px' }}>
                <FileText size={32} style={{ opacity: 0.3 }} />
                <span>No content uploaded yet.</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Status Pie Chart (real data) */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Content Status</h3>
          </div>
          <div className="card-body" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <CheckCircle size={32} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
                <span>No content to show.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
