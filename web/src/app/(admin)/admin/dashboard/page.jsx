"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { GraduationCap, Users, Layers, BookOpen, CreditCard, Activity, Shield, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashRes, logsRes] = await Promise.all([
          axios.get('/api/admin/dashboard'),
          axios.get('/api/admin/activity-logs').catch(() => ({ data: { data: [] } }))
        ]);
        setStats(dashRes.data.data);
        setLogs(logsRes.data?.data || []);
      } catch (err) {
        setStats({ students: 0, faculty: 0, instructors: 0, batches: 0, subjects: 0, revenue: 0, enrollments: 0 });
      } finally { 
        setLoading(false); 
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }}></div>;

  const statCards = [
    { label: 'Total Students', value: stats?.students || 0, icon: GraduationCap, color: '#6366f1', bg: '#eef2ff' },
    { label: 'Faculty Members', value: stats?.faculty || 0, icon: Users, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Instructors', value: stats?.instructors || 0, icon: Shield, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Active Batches', value: stats?.batches || 0, icon: Layers, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Subjects', value: stats?.subjects || 0, icon: BookOpen, color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Total Revenue', value: stats?.revenue || '₹0', icon: CreditCard, color: '#ef4444', bg: '#fef2f2' },
  ];

  // Stat-based charts (derived from real data)
  const roleData = [
    { name: 'Students', value: stats?.students || 0, color: '#6366f1' },
    { name: 'Faculty', value: stats?.faculty || 0, color: '#10b981' },
    { name: 'Instructors', value: stats?.instructors || 0, color: '#f59e0b' },
  ];

  const typeColors = { 'Created Student': '#6366f1', 'Created Faculty': '#10b981', 'Created Instructor': '#f59e0b', 'Approved Video': '#3b82f6', 'Deleted User': '#ef4444' };

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">Admin Overview</h1>
          <p className="page-subtitle">Platform command center — real-time snapshot of Base Learn LMS.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="card hover-lift" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                <Icon size={26} />
              </div>
              <div>
                <div style={{ fontSize: '26px', fontWeight: '800', lineHeight: 1, color: 'var(--color-text-primary)' }}>
                  {s.label === 'Total Revenue' ? `₹${s.value}` : s.value}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: '500' }}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real Data Charts */}
      <div className="dash-layout-grid">
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <TrendingUp size={18} color="var(--color-primary)" />
             <h3 className="card-title" style={{ margin: 0 }}>Platform User Distribution</h3>
          </div>
          <div className="card-body" style={{ height: '300px', padding: '16px' }}>
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={roleData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} />
                 <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                 <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                 <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60} name="Count">
                   {roleData.map((entry, index) => (
                     <Cell key={index} fill={entry.color} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
             <h3 className="card-title" style={{ margin: 0 }}>Platform Summary</h3>
          </div>
          <div className="card-body" style={{ padding: '16px' }}>
            {roleData.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < roleData.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
                  <span style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: '500' }}>{item.name}</span>
                </div>
                <span style={{ fontSize: '18px', fontWeight: '800', color: item.color }}>{item.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
              <span style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: '500' }}>Batches</span>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#3b82f6' }}>{stats?.batches || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity — from actual activity logs */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="var(--color-primary)" />
          <h2 style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>Recent Platform Activity</h2>
        </div>
        <div>
          {logs.length === 0 ? (
            <div style={{ padding: '60px 40px', textAlign: 'center', background: 'white', border: '1px dashed var(--color-border)' }}>
              <div style={{ width: '64px', height: '64px', background: 'var(--color-bg)', color: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px' }}>🛡️</div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-text-primary)' }}>System Log Empty</h3>
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto', fontSize: '14px' }}>
                There is no recent activity to report across the platform.
              </p>
            </div>
          ) : (
            logs.slice(0, 15).map((log, i) => (
              <div key={log._id || i} style={{ padding: '14px 24px', borderBottom: i < logs.length - 1 ? '1px solid var(--color-border)' : 'none', display: 'flex', alignItems: 'center', gap: '14px', transition: 'background 0.15s' }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--color-bg)'}
                onMouseOut={e => e.currentTarget.style.background = 'white'}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: typeColors[log.action] || '#94a3b8', flexShrink: 0 }}></div>
                <div style={{ flex: 1, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                  <strong>{log.actorName}</strong> {log.action} — {log.detail}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
