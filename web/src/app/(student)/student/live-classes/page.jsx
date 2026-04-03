"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Video, Calendar, Clock, Play, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentLiveClasses() {
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get('/api/student/live-classes');
        const { upcoming, past } = res.data.data || { upcoming: [], past: [] };
        setUpcoming(upcoming);
        setPast(past);
      } catch (err) {
        toast.error('Failed to grab live schedule.');
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const handleJoinSession = async (id) => {
    try {
      const res = await axios.get(`/api/student/live-classes/${id}/join`);
      if (res.data.data?.joinUrl) {
        window.open(res.data.data.joinUrl, '_blank');
        toast.success('Joining BigBlueButton lobby...');
      } else {
        toast.error('Meeting URL not generated.');
      }
    } catch (err) {
       toast.error(err.response?.data?.message || 'Failed to join session. The host may not have started it yet.');
    }
  };

  const allClasses = [...upcoming, ...past];

  return (
    <div style={{ paddingBottom: '60px', height: '100%' }}>
<div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">Live Sessions Hub</h1>
          <p className="page-subtitle">Join synchronous broadcasts, interact with instructors, and ask real-time questions.</p>
        </div>
      </div>

      {loading ? <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }}></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {allClasses.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', background: 'var(--color-bg)', borderRadius: '16px', border: '2px dashed var(--color-border)' }}>
              <Video size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>No Scheduled Broadcasts</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>You do not have any synchronous sessions scheduled for your batches currently.</p>
            </div>
          ) : allClasses.map(item => (
            <div key={item._id} className="card hover-lift" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '24px', flex: 1, position: 'relative' }}>
                 {/* Live Badge */}
                 {item.status === 'ongoing' && (
                    <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', alignItems: 'center', gap: '6px', background: '#fee2e2', color: '#ef4444', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}>
                       <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }}></span>
                       ON AIR
                    </div>
                 )}

                 <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: item.status === 'ongoing' ? '#fee2e2' : '#e0e7ff', color: item.status === 'ongoing' ? '#ef4444' : '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                   <Video size={24} />
                 </div>
                 
                 <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '6px', color: 'var(--color-text-primary)' }}>{item.title}</h3>
                 <p style={{ fontSize: '14px', color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '16px' }}>
                   {item.subject || 'Curriculum Subject'}
                 </p>

                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                     <Calendar size={16} />
                     <strong>{new Date(item.scheduledAt).toLocaleDateString()}</strong>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                     <Clock size={16} />
                     {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({item.duration}m)
                   </div>
                 </div>

                 <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', display: 'flex', gap: '6px' }}>
                    <strong>Instructor:</strong> {item.faculty?.name || 'TBD'}
                 </div>
              </div>
              
              <div style={{ padding: '16px 24px', background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)' }}>
                 {item.status === 'completed' ? (
                   <button className="btn" disabled style={{ width: '100%', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                      <AlertCircle size={18} /> Broadcast Ended
                   </button>
                 ) : (
                   <button onClick={() => handleJoinSession(item._id)} className="btn btn-primary" style={{ width: '100%', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                     <Play size={18} /> {item.status === 'ongoing' ? 'Join Stream Now' : 'Enter Waiting Room'}
                   </button>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
