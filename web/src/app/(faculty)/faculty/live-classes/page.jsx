"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Video, Calendar, Clock, MapPin, Play, Plus, X, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useConfirmStore } from '@/store/confirmStore';
import toast from 'react-hot-toast';

export default function FacultyLiveClasses() {
  const { user } = useAuthStore();
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const confirm = useConfirmStore(s => s.confirm);
  
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  
  const [subjects, setSubjects] = useState([]);
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    if (user?.role === 'faculty') {
      fetchClasses();
      fetchSubjects();
      fetchBatches();
    }
  }, [user]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/faculty/live-classes`);
      setLiveClasses(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      toast.error('Failed to load your scheduled live sessions.');
      setLiveClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`/api/faculty/subjects`);
      setSubjects(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      console.error('Failed to load assigned subjects');
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await axios.get('/api/faculty/batches');
      setBatches(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      console.error('Failed to load batches');
    }
  };

  const handleCreate = () => {
    setForm({ title: '', subject: '', batchId: '', date: '', time: '', duration: 60 });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title?.trim()) return toast.error('Session title is required.');
    if (!form.subject) return toast.error('Please select a subject.');
    if (!form.batchId) return toast.error('Please select a target batch.');
    if (!form.date || !form.time) return toast.error('Date and time are required.');
    setSaving(true);
    try {
      await axios.post('/api/faculty/live-classes', {
        ...form,
        // Since we updated the model, we now send the subject ID directly
        subject: form.subject 
      });
      toast.success('Live class scheduled successfully!');
      setShowModal(false);
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule class');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, title) => {
    confirm({
      title: 'Delete Live Class?',
      message: `Are you sure you want to delete "${title}"? This cannot be undone.`,
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/faculty/live-classes/${id}`);
          toast.success('Live class deleted.');
          fetchClasses();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to delete class.');
        }
      }
    });
  };

  const handleStartSession = async (id) => {
    try {
      const res = await axios.get(`/api/faculty/live-classes/${id}/start`);
      if(res.data.data?.joinUrl) {
         window.open(res.data.data.joinUrl, '_blank');
         toast.success('Session started!');
         fetchClasses(); // Refresh status
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start session.');
    }
  };

  const handleEndSession = async (id) => {
    confirm({
      title: 'End Live Broadcast?',
      message: 'Are you sure you want to end this live broadcast? This will kick all participants and move the session to the finished list.',
      confirmText: 'End Sessions',
      onConfirm: async () => {
        try {
          await axios.post(`/api/faculty/live-classes/${id}/end`);
          toast.success('Broadcast ended successfully.');
          fetchClasses();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to end session.');
        }
      }
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'ongoing': return { bg: '#dcfce7', color: '#166534', label: '🔴 Ongoing' };
      case 'completed': return { bg: '#f1f5f9', color: '#475569', label: '✅ Finished' };
      case 'cancelled': return { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' };
      default: return { bg: '#e0f2fe', color: '#0369a1', label: '📅 Upcoming' };
    }
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Live Broadcast Hub</h1>
          <p className="page-subtitle">Standardized lifecycle management for your BigBlueButton sessions.</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px' }}>
           <Plus size={20} /> Schedule New Class
        </button>
      </div>

      {loading ? <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }}></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '32px' }}>
          {liveClasses.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '100px 40px', textAlign: 'center', background: 'white', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
              <Video size={56} color="#94a3b8" style={{ margin: '0 auto 20px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>No Sessions Scheduled</h3>
              <p style={{ color: '#64748b', fontSize: '15px' }}>Plan your curriculum by scheduling upcoming live interactions with your students.</p>
            </div>
          ) : liveClasses.sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt)).map(session => {
            const status = getStatusStyle(session.status);
            return (
              <div key={session._id} className="card hover-lift" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, borderRadius: '24px', border: '1.5px solid #f1f5f9' }}>
                <div style={{ padding: '24px', flex: 1 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                     <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Video size={26} />
                     </div>
                     <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', background: status.bg, color: status.color, textTransform: 'uppercase' }}>
                       {status.label}
                     </span>
                   </div>
                   
                   <h3 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '6px', color: '#0f172a', lineHeight: '1.3' }}>{session.title}</h3>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', marginBottom: '24px' }}>
                      <MapPin size={14} /> {session.subject || 'Standard Module'}
                   </div>

                   <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', border: '1px solid #f1f5f9' }}>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <span style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' }}>Date</span>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#1e293b', fontWeight: '700' }}>
                         <Calendar size={14} color="#6366f1" />
                         {new Date(session.scheduledAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                       </div>
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <span style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' }}>Start Time</span>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#1e293b', fontWeight: '700' }}>
                         <Clock size={14} color="#6366f1" />
                         {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </div>
                     </div>
                   </div>
                </div>
                
                <div style={{ padding: '20px 24px', background: 'white', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px' }}>
                    {session.status === 'completed' ? (
                       <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
                          <button className="btn btn-secondary" style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', opacity: 0.6 }} disabled>
                             Archive Ready
                          </button>
                          <button onClick={() => handleDelete(session._id, session.title)} className="btn" style={{ padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', background: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                             <Trash2 size={15} /> Delete
                          </button>
                       </div>
                    ) : (
                       <>
                         <button onClick={() => handleStartSession(session._id)} className="btn btn-primary" style={{ flex: 2, display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', padding: '12px', borderRadius: '12px', fontWeight: '800' }}>
                           <Play size={18} /> {session.status === 'ongoing' ? 'Resume Class' : 'Start Studio'}
                         </button>
                         {session.status === 'ongoing' && (
                            <button onClick={() => handleEndSession(session._id)} className="btn btn-ghost" style={{ flex: 1, color: '#ef4444', border: '1.5px solid #fee2e2', borderRadius: '12px', fontWeight: '800', fontSize: '13px' }}>
                               End
                            </button>
                         )}
                         <button onClick={() => handleDelete(session._id, session.title)} className="btn" style={{ padding: '12px 14px', borderRadius: '12px', background: '#fff1f2', color: '#ef4444', border: '1.5px solid #fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Delete">
                           <Trash2 size={16} />
                         </button>
                       </>
                    )}
                 </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 45, 107, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '20px' }}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '24px', background: 'white', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>Schedule Live Studio</h2>
              <button onClick={() => setShowModal(false)} style={{ background: '#f8fafc', border: 'none', color: '#64748b', cursor: 'pointer', padding: '8px', borderRadius: '10px' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: '800', fontSize: '13px', color: '#475569' }}>Session Title <span style={{color: 'red'}}>*</span></label>
                <input type="text" className="form-input" style={{ height: '48px', borderRadius: '12px' }} value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} placeholder="E.g. Cell Biology Q&A" />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: '800', fontSize: '13px', color: '#475569' }}>Assign to Subject <span style={{color: 'red'}}>*</span></label>
                <select className="form-select" style={{ height: '48px', borderRadius: '12px' }} value={form.subject || ''} onChange={e => setForm({...form, subject: e.target.value})}>
                  <option value="">Select subject context...</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.targetGrade})</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: '800', fontSize: '13px', color: '#475569' }}>Target Batch <span style={{color: 'red'}}>*</span></label>
                <select className="form-select" style={{ height: '48px', borderRadius: '12px' }} value={form.batchId || ''} onChange={e => setForm({...form, batchId: e.target.value})}>
                  <option value="">Select target audience...</option>
                  {batches.map(b => <option key={b._id} value={b._id}>{b.name} ({b.studyClass?.name})</option>)}
                </select>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ fontWeight: '800', fontSize: '13px', color: '#475569' }}>Broadcast Date <span style={{color: 'red'}}>*</span></label>
                  <input type="date" className="form-input" style={{ height: '48px', borderRadius: '12px' }} value={form.date || ''} onChange={e => setForm({...form, date: e.target.value})} />
                </div>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ fontWeight: '800', fontSize: '13px', color: '#475569' }}>Launch Time <span style={{color: 'red'}}>*</span></label>
                  <input type="time" className="form-input" style={{ height: '48px', borderRadius: '12px' }} value={form.time || ''} onChange={e => setForm({...form, time: e.target.value})} />
                </div>
              </div>
              
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontWeight: '800', fontSize: '13px', color: '#475569' }}>Estimated Duration (Minutes)</label>
                <input type="number" className="form-input" style={{ height: '48px', borderRadius: '12px' }} value={form.duration || 60} onChange={e => setForm({...form, duration: Number(e.target.value)})} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', padding: '24px', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1, height: '48px', borderRadius: '12px', fontWeight: '800' }}>Cancel</button>
              <button onClick={handleSave} className="btn btn-primary" style={{ flex: 2, height: '48px', borderRadius: '12px', fontWeight: '900' }} disabled={saving}>
                {saving ? 'Creating Room...' : `Finalize & Schedule`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
