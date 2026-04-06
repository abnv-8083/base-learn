"use client";

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Video, Calendar, Clock, Play, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

// Helper: detect if a string looks like a MongoDB ObjectId (24 hex chars)
const isObjectId = (str) => /^[a-f\d]{24}$/i.test(str?.trim());

// Helper: safely display the subject name
const displaySubject = (subject) => {
  if (!subject || isObjectId(subject)) return null;
  return subject;
};

export default function StudentLiveClasses() {
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const intervalRef = useRef(null);

  const fetchClasses = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await axios.get('/api/student/live-classes');
      const { upcoming = [], past = [] } = res.data.data || {};
      setUpcoming(upcoming);
      setPast(past);
      setLastRefreshed(new Date());
    } catch (err) {
      if (showLoader) toast.error('Failed to grab live schedule.');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses(true);
    // Auto-refresh every 30 seconds so ongoing classes appear immediately
    intervalRef.current = setInterval(() => fetchClasses(false), 30000);
    return () => clearInterval(intervalRef.current);
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
      toast.error(err.response?.data?.message || 'The host may not have started the class yet.');
    }
  };

  const allClasses = [...upcoming, ...past];
  const hasOngoing = upcoming.some(c => c.status === 'ongoing');

  return (
    <div style={{ paddingBottom: '60px', height: '100%' }}>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Live Sessions Hub</h1>
          <p className="page-subtitle">Join synchronous broadcasts, interact with instructors, and ask real-time questions.</p>
        </div>
        <button
          onClick={() => fetchClasses(false)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'transparent', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
        >
          <RefreshCw size={14} />
          Refresh
          {lastRefreshed && <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginLeft: '2px' }}>· {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
        </button>
      </div>

      {/* Ongoing alert banner */}
      {hasOngoing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', background: '#fee2e2', borderRadius: '14px', marginBottom: '24px', border: '1.5px solid #fca5a5' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
          <p style={{ margin: 0, fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>
            🔴 A live class is happening right now! Join immediately below.
          </p>
        </div>
      )}

      {loading ? (
        <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {allClasses.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', background: 'var(--color-bg)', borderRadius: '16px', border: '2px dashed var(--color-border)' }}>
              <Video size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>No Scheduled Broadcasts</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>You do not have any synchronous sessions scheduled for your batch currently.</p>
            </div>
          ) : allClasses.map(item => {
            const isOngoing = item.status === 'ongoing';
            const isCompleted = item.status === 'completed' || item.status === 'cancelled';
            const subjectName = displaySubject(item.subject);

            return (
              <div key={item._id} className="card hover-lift" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderTop: isOngoing ? '4px solid #ef4444' : '4px solid var(--color-primary)' }}>
                <div style={{ padding: '24px', flex: 1, position: 'relative' }}>
                  {/* Live Badge */}
                  {isOngoing && (
                    <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '6px', background: '#fee2e2', color: '#ef4444', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                      ON AIR
                    </div>
                  )}

                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: isOngoing ? '#fee2e2' : '#e0e7ff', color: isOngoing ? '#ef4444' : '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <Video size={24} />
                  </div>

                  <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px', color: 'var(--color-text-primary)' }}>{item.title}</h3>

                  {subjectName && (
                    <p style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {subjectName}
                    </p>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', marginTop: subjectName ? 0 : '16px' }}>
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
                  {isCompleted ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {item.recordingUrl ? (
                        <button 
                          onClick={() => window.open(item.recordingUrl, '_blank')}
                          className="btn btn-primary" 
                          style={{ width: '100%', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Play size={18} /> Watch Recording
                        </button>
                      ) : (
                        <button className="btn" disabled style={{ width: '100%', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                          <AlertCircle size={18} /> Broadcast Ended
                        </button>
                      )}
                      
                      {item.presentationUrl && (
                        <button 
                          onClick={() => window.open(item.presentationUrl, '_blank')}
                          className="btn btn-secondary" 
                          style={{ width: '100%', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FileText size={18} /> View Whiteboard Notes
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleJoinSession(item._id)}
                      className="btn btn-primary"
                      style={{ width: '100%', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', background: isOngoing ? '#ef4444' : undefined, borderColor: isOngoing ? '#ef4444' : undefined }}
                    >
                      <Play size={18} /> {isOngoing ? '🔴 Join Stream Now' : 'Enter Waiting Room'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
