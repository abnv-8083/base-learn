"use client";

import React from 'react';
import { X, User, Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';

export default function LiveAnalyticsModal({ session, onClose }) {
  if (!session) return null;

  const attendance = session.attendance || [];
  const totalStudents = attendance.length;
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const attendanceRate = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 45, 107, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(8px)', padding: '20px' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh' }}>
        
        {/* Header */}
        <div style={{ padding: '24px', background: 'white', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>Live Session Analytics</h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{session.title} • {new Date(session.scheduledAt).toLocaleDateString()}</p>
          </div>
          <button onClick={onClose} style={{ background: '#f8fafc', border: 'none', color: '#64748b', cursor: 'pointer', padding: '8px', borderRadius: '10px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Hero Stats */}
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', background: '#f8fafc' }}>
          <div style={{ background: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Participation</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--color-primary)' }}>{presentCount}/{totalStudents}</div>
          </div>
          <div style={{ background: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Attendance Rate</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>{attendanceRate.toFixed(1)}%</div>
          </div>
          <div style={{ background: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Session Length</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#6366f1' }}>{session.duration}m</div>
          </div>
        </div>

        {/* Detailed List */}
        <div style={{ padding: '0 24px 24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '16px' }}>Student Participation Log</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {attendance.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No student data captured for this session.</div>
              ) : attendance.map((record, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                      <User size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{record.studentId?.name || 'Enrolled Student'}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>ID: {record.studentId?.email || record.studentId}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ display: 'flex', gap: '32px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Join Time</div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                          {record.joinTime ? new Date(record.joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Exit Time</div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                          {record.leaveTime ? new Date(record.leaveTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (record.joinTime ? 'Active' : '--:--')}
                        </div>
                      </div>
                    </div>

                    <div style={{ width: '100px', textAlign: 'center' }}>
                       <span style={{ 
                         padding: '6px 12px', 
                         borderRadius: '20px', 
                         fontSize: '11px', 
                         fontWeight: '900', 
                         textTransform: 'uppercase',
                         background: record.status === 'present' ? '#dcfce7' : record.status === 'late' ? '#fef9c3' : '#fee2e2',
                         color: record.status === 'present' ? '#166534' : record.status === 'late' ? '#854d0e' : '#991b1b'
                       }}>
                         {record.status}
                       </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
          * Participation is marked as "Present" if the student attended at least 80% of the scheduled session.
        </div>
      </div>
    </div>
  );
}
