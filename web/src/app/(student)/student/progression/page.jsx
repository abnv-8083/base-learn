"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, CheckCircle, Percent, MonitorPlay, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentProgression() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgression = async () => {
      try {
        const res = await axios.get('/api/student/progression');
        setSubjects(Array.isArray(res.data.data) ? res.data.data : []);
      } catch (err) {
        toast.error('Failed to load curriculum progression map.');
      } finally {
        setLoading(false);
      }
    };
    fetchProgression();
  }, []);

  return (
    <div style={{ paddingBottom: '60px', height: '100%' }}>
<div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">My Curriculum</h1>
          <p className="page-subtitle">Track your mastery level and course completions across structured learning paths.</p>
        </div>
      </div>

      {loading ? <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }}></div> : (
        <div className="card-grid">
          {subjects.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', background: 'var(--color-bg)', borderRadius: '16px', border: '2px dashed var(--color-border)' }}>
              <BookOpen size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>No Assigned Subjects</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>You are not formally mapped to any active curriculums for your current grade level.</p>
            </div>
          ) : subjects.map(item => (
            <div key={item._id} className="card hover-lift" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '24px', flex: 1, position: 'relative' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                   <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <BookOpen size={24} />
                   </div>
                   <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', background: item.progress >= 100 ? '#dcfce7' : '#e0e7ff', color: item.progress >= 100 ? '#166534' : '#4f46e5' }}>
                     {item.progress || 0}% Complete
                   </span>
                 </div>
                 
                 <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: 'var(--color-text-primary)' }}>{item.name}</h3>
                 <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
                   Faculty Lead: <strong>{item.faculty?.name || 'Assigned Instructor'}</strong>
                 </p>

                 {/* Progress Bar */}
                 <div style={{ width: '100%', height: '8px', background: 'var(--color-bg)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{ height: '100%', width: `${item.progress || 0}%`, background: item.progress >= 100 ? 'var(--color-success)' : 'var(--color-primary)', transition: 'width 0.5s ease' }}></div>
                 </div>
                 
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
                    <span>0%</span>
                    <span>Mastery Index</span>
                    <span>100%</span>
                 </div>

                 {/* Embedded Stats */}
                 <div className="grid-3-col" style={{ gap: '12px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                   <div style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{item.stats?.videos || 0}</div>
                     <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}><MonitorPlay size={12} style={{marginRight: '4px'}}/>Lecs</div>
                   </div>
                   <div style={{ textAlign: 'center', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>
                     <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{item.stats?.assignments || 0}</div>
                     <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}><FileText size={12} style={{marginRight: '4px'}}/>Tasks</div>
                   </div>
                   <div style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{item.stats?.tests || 0}</div>
                     <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}><Percent size={12} style={{marginRight: '4px'}}/>Exams</div>
                   </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
