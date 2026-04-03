"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, Users, BookOpen, Clock, Activity, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function InstructorDashboard() {
  const [stats, setStats] = useState({ totalBatches: 0, totalStudents: 0, totalClasses: 0, pendingTasks: 0 });
  const [batches, setBatches] = useState([]);
  const [pendingContent, setPendingContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashRes, batchRes, pendingRes] = await Promise.all([
          axios.get('/api/instructor/dashboard'),
          axios.get('/api/instructor/batches').catch(() => ({ data: { data: [] } })),
          axios.get('/api/instructor/videos/pending').catch(() => ({ data: { data: [] } })),
        ]);
        if (dashRes.data?.data) setStats(dashRes.data.data);
        if (batchRes.data?.data) setBatches(batchRes.data.data);
        if (pendingRes.data?.data) setPendingContent(pendingRes.data.data);
      } catch (err) {
        console.error('Instructor dash load failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }}></div>;

  // Real batch student counts for bar chart
  const barData = batches.slice(0, 8).map(b => ({
    name: (b.name || 'Batch').substring(0, 12),
    students: b.students?.length || 0
  }));

  // Pending content breakdown by type
  const typeCounts = {};
  pendingContent.forEach(c => {
    const t = c.contentType || c.type || 'other';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });
  const pieData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  // Total students across all batches
  const realStudents = stats.totalStudents || 0;

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">Instructor Dashboard</h1>
          <p className="page-subtitle">Track batch performance, monitor students, and review pending curriculum approvals.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {[
          { label: 'Assigned Batches', value: stats.totalBatches, icon: Layers, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Total Students', value: stats.totalStudents, icon: Users, color: '#10b981', bg: '#ecfdf5' },
          { label: 'Active Classes', value: stats.totalClasses, icon: BookOpen, color: '#8b5cf6', bg: '#f5f3ff' },
          { label: 'Pending Reviews', value: pendingContent.length, icon: Clock, color: '#f59e0b', bg: '#fffbeb' }
        ].map((s, i) => (
          <div key={i} className="card hover-lift" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
              <s.icon size={28} />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '800', lineHeight: 1, color: 'var(--color-text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: '500' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Students per Batch Bar Chart (real data) */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Activity size={18} color="var(--color-primary)" />
             <h3 className="card-title" style={{ margin: 0 }}>Students per Batch</h3>
          </div>
          <div className="card-body" style={{ height: '300px', padding: '16px' }}>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="students" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', flexDirection: 'column', gap: '8px' }}>
                <Layers size={32} style={{ opacity: 0.3 }} />
                <span>No batch data yet.</span>
              </div>
            )}
          </div>
        </div>

        {/* Pending Content by Type (real data) */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Target size={18} color="var(--color-primary)" />
             <h3 className="card-title" style={{ margin: 0 }}>Pending Content Types</h3>
          </div>
          <div className="card-body" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <Clock size={32} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
                <span style={{ fontSize: '14px' }}>No pending reviews — all clear!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
