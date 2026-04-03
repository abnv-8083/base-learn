"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, Search, MapPin, Users, Calendar, ArrowRight, Plus, X, BookOpen, Check } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function InstructorBatches() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create Modal State
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', studyClass: '', capacity: 50, location: '', mode: 'online' });
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState([]);
  
  // Subject Assignment State
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchSubjects, setBatchSubjects] = useState([]);
  const [isUpdatingSubjects, setIsUpdatingSubjects] = useState(false);

  useEffect(() => {
    if (user?.role === 'instructor') {
      fetchBatches();
    }
  }, [user]);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/instructor/batches?managed=true`);
      setBatches(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      toast.error('Failed to load your assigned batches.');
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get('/api/instructor/classes');
      setClasses(res.data.data || []);
    } catch {
      console.error('Failed to load classes');
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.studyClass) return toast.error('Name and Class are required');
    setSaving(true);
    try {
      await axios.post('/api/instructor/batches', { ...form, instructor: user._id });
      toast.success('Batch created successfully');
      setShowModal(false);
      setForm({ name: '', description: '', studyClass: '', capacity: 50, location: '', mode: 'online' });
      fetchBatches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create batch');
    } finally {
      setSaving(false);
    }
  };

  const openSubjectModal = async (batch) => {
    setSelectedBatch(batch);
    setShowSubjectModal(true);
    setBatchSubjects([]);
    try {
      const res = await axios.get(`/api/instructor/batches/${batch._id}/subjects`);
      setBatchSubjects(res.data.data || []);
    } catch {
       toast.error('Failed to load batch subjects');
    }
  };

  const toggleSubject = (subjectId) => {
    setBatchSubjects(prev => prev.map(s => 
      s._id === subjectId ? { ...s, isAssigned: !s.isAssigned } : s
    ));
  };

  const saveBatchSubjects = async () => {
    setIsUpdatingSubjects(true);
    try {
      const subjectIds = batchSubjects.filter(s => s.isAssigned).map(s => s._id);
      await axios.patch(`/api/instructor/batches/${selectedBatch._id}/subjects`, { subjectIds });
      toast.success('Subjects assigned successfully');
      setShowSubjectModal(false);
    } catch {
      toast.error('Failed to update subjects');
    } finally {
      setIsUpdatingSubjects(false);
    }
  };

  const filtered = batches.filter(b => 
    b.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">My Batches</h1>
          <p className="page-subtitle">Manage scheduling and student enrollments for your assigned cohorts.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { fetchClasses(); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Create Batch
        </button>
      </div>

      <div style={{ position: 'relative', width: '350px', marginBottom: '32px' }}>
        <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search batches...`}
          style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '15px' }} />
      </div>

      {loading ? <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }}></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', background: 'var(--color-bg)', borderRadius: '16px', border: '2px dashed var(--color-border)' }}>
              <Layers size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>No Batches Assigned</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>You have not been assigned to any active batches yet.</p>
            </div>
          ) : filtered.map(batch => (
            <div key={batch._id} className="card hover-lift" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '24px', flex: 1 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                   <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <Layers size={24} />
                   </div>
                   <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', background: '#dcfce7', color: '#166534' }}>
                     Active
                   </span>
                 </div>
                 <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: 'var(--color-text-primary)' }}>{batch.name}</h3>
                 <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                   {batch.description || "Foundation syllabus overview"}
                 </p>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                     <Users size={16} color="var(--color-primary)" />
                     <strong>{batch.students?.length || 0} / {batch.capacity || 50}</strong> Students Enrolled
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                     <MapPin size={16} color="var(--color-error)" />
                     {batch.location || 'Online'} Campus
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                     <Calendar size={16} color="var(--color-success)" />
                     Starts: {new Date(batch.createdAt).toLocaleDateString()}
                   </div>
                 </div>
              </div>
               <div style={{ padding: '16px 24px', background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <button 
                    onClick={() => openSubjectModal(batch)}
                    className="btn btn-ghost" 
                    style={{ padding: '8px 12px', display: 'flex', gap: '8px', alignItems: 'center', background: '#e0e7ff', color: 'var(--color-primary)', flex: 1, borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}
                  >
                    <BookOpen size={16} /> Assign Subjects
                  </button>
                  <button 
                    onClick={() => router.push(`/instructor/batches/${batch._id}`)}
                    className="btn" 
                    style={{ padding: '8px 12px', display: 'flex', gap: '6px', alignItems: 'center', background: 'white', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: 'var(--color-primary)', flex: 1, fontSize: '13px' }}
                  >
                    Details <ArrowRight size={14} />
                  </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Batch Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 45, 107, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card fade-in" style={{ width: '90%', maxWidth: '500px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '24px', background: 'var(--color-primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Create New Batch</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Batch Name <span style={{color: 'red'}}>*</span></label>
                <input type="text" className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Alpha Founders" />
              </div>
              
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Target Class <span style={{color: 'red'}}>*</span></label>
                <select className="form-select" value={form.studyClass} onChange={e => setForm({...form, studyClass: e.target.value})}>
                  <option value="">Select a class...</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name} ({c.targetGrade})</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                 <div className="form-group">
                   <label className="form-label">Capacity</label>
                   <input type="number" className="form-input" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} />
                 </div>
                 <div className="form-group">
                   <label className="form-label">Delivery Mode</label>
                   <select className="form-select" value={form.mode} onChange={e => setForm({...form, mode: e.target.value})}>
                     <option value="online">Online</option>
                     <option value="offline">Offline</option>
                     <option value="hybrid">Hybrid</option>
                   </select>
                 </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Location (Campus / Server)</label>
                <input type="text" className="form-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Block A, Room 102" />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', padding: '24px', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleCreate} className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
                {saving ? 'Creating...' : `Publish Batch`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Subjects Modal */}
      {showSubjectModal && selectedBatch && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 45, 107, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card fade-in" style={{ width: '90%', maxWidth: '450px', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
             <div style={{ padding: '20px 24px', background: 'var(--color-primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                   <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Assign Subjects</h2>
                   <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>For Batch: {selectedBatch.name}</p>
                </div>
                <button onClick={() => setShowSubjectModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
             </div>
             
             <div style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>Select subjects that should be mapped to this batch. Students in this batch will only see content from assigned subjects.</p>
                
                {batchSubjects.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
                     <BookOpen size={32} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                     <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>No subjects found. Use the Curriculum tab to create subjects first.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {batchSubjects.map(sub => (
                       <div key={sub._id} onClick={() => toggleSubject(sub._id)} style={{ padding: '16px', borderRadius: '12px', border: '2px solid', borderColor: sub.isAssigned ? 'var(--color-primary)' : 'var(--color-border)', background: sub.isAssigned ? 'var(--color-primary-light)' : 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
                          <div>
                             <div style={{ fontSize: '15px', fontWeight: 'bold', color: sub.isAssigned ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{sub.name}</div>
                             <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Grade: {sub.targetGrade || 'N/A'}</div>
                          </div>
                          {sub.isAssigned && (
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                               <Check size={14} strokeWidth={4} />
                            </div>
                          )}
                       </div>
                    ))}
                  </div>
                )}
             </div>

             <div style={{ padding: '16px 24px', background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowSubjectModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button onClick={saveBatchSubjects} className="btn btn-primary" style={{ flex: 2 }} disabled={isUpdatingSubjects}>
                   {isUpdatingSubjects ? 'Saving...' : 'Update Assignments'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
