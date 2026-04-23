"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, Search, MapPin, Users, Calendar, ArrowRight, Plus, X, BookOpen, Check, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// ── Shared form primitives ──────────────────────────────────
function FormField({ label, required, error, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: error ? '#dc2626' : '#64748b' }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
      {error && <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#dc2626', fontWeight: '600' }}><AlertCircle size={11} /> {error}</span>}
      {hint && !error && <span style={{ fontSize: '11px', color: '#94a3b8' }}>{hint}</span>}
    </div>
  );
}

function SInput({ value, onChange, placeholder, type = 'text', error, onBlur }) {
  const [focused, setFocused] = useState(false);
  return (
    <input type={type} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder}
      onFocus={() => setFocused(true)} onBlurCapture={() => setFocused(false)}
      style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${error ? '#ef4444' : focused ? 'var(--color-primary)' : '#e2e8f0'}`, borderRadius: '10px', fontSize: '14px', fontWeight: '500', color: '#1e293b', outline: 'none', transition: 'all 0.2s', background: 'white', boxShadow: error ? '0 0 0 3px rgba(239,68,68,0.1)' : focused ? '0 0 0 3px rgba(15,45,107,0.08)' : 'none' }}
    />
  );
}

function SSelect({ value, onChange, children, error, onBlur }) {
  const [focused, setFocused] = useState(false);
  return (
    <select value={value} onChange={onChange} onBlur={onBlur}
      onFocus={() => setFocused(true)} onBlurCapture={() => setFocused(false)}
      style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${error ? '#ef4444' : focused ? 'var(--color-primary)' : '#e2e8f0'}`, borderRadius: '10px', fontSize: '14px', fontWeight: '500', color: '#1e293b', outline: 'none', transition: 'all 0.2s', background: 'white', cursor: 'pointer', boxShadow: error ? '0 0 0 3px rgba(239,68,68,0.1)' : focused ? '0 0 0 3px rgba(15,45,107,0.08)' : 'none' }}>
      {children}
    </select>
  );
}

export default function InstructorBatches() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', studyClass: '', capacity: 50, location: '', mode: 'online' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState([]);

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchSubjects, setBatchSubjects] = useState([]);
  const [isUpdatingSubjects, setIsUpdatingSubjects] = useState(false);

  useEffect(() => {
    if (user?.role === 'instructor') fetchBatches();
  }, [user]);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/instructor/batches?managed=true');
      setBatches(Array.isArray(res.data.data) ? res.data.data : []);
    } catch { toast.error('Failed to load your batches.'); setBatches([]); }
    finally { setLoading(false); }
  };

  const fetchClasses = async () => {
    try { const res = await axios.get('/api/instructor/classes'); setClasses(res.data.data || []); }
    catch {}
  };

  // ── Validation ──────────────────────────────────────────────
  const validateField = (f, v) => {
    let err = null;
    if (f === 'name') {
      if (!v?.trim()) err = 'Batch name is required';
      else if (v.trim().length < 2) err = 'Name must be at least 2 characters';
      else if (v.trim().length > 80) err = 'Name must be 80 characters or fewer';
    }
    if (f === 'studyClass' && !v) err = 'Please select a target class';
    if (f === 'capacity') {
      const n = parseInt(v);
      if (isNaN(n) || n < 1) err = 'Capacity must be at least 1';
      else if (n > 500) err = 'Maximum capacity is 500';
    }
    setErrors(prev => ({ ...prev, [f]: err }));
    return !err;
  };

  const handleCreate = async () => {
    const newErrors = {};
    if (!form.name?.trim()) newErrors.name = 'Batch name is required';
    else if (form.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!form.studyClass) newErrors.studyClass = 'Please select a target class';
    const cap = parseInt(form.capacity);
    if (isNaN(cap) || cap < 1) newErrors.capacity = 'Capacity must be at least 1';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) { toast.error('Please fix the highlighted errors'); return; }

    setSaving(true);
    try {
      await axios.post('/api/instructor/batches', { ...form, instructor: user._id });
      toast.success('Batch created successfully');
      setShowModal(false);
      setForm({ name: '', description: '', studyClass: '', capacity: 50, location: '', mode: 'online' });
      fetchBatches();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create batch'); }
    finally { setSaving(false); }
  };

  const openSubjectModal = async (batch) => {
    setSelectedBatch(batch); setShowSubjectModal(true); setBatchSubjects([]);
    try { const res = await axios.get(`/api/instructor/batches/${batch._id}/subjects`); setBatchSubjects(res.data.data || []); }
    catch { toast.error('Failed to load batch subjects'); }
  };

  const toggleSubject = id => setBatchSubjects(prev => prev.map(s => s._id === id ? { ...s, isAssigned: !s.isAssigned } : s));

  const saveBatchSubjects = async () => {
    setIsUpdatingSubjects(true);
    try {
      const subjectIds = batchSubjects.filter(s => s.isAssigned).map(s => s._id);
      await axios.patch(`/api/instructor/batches/${selectedBatch._id}/subjects`, { subjectIds });
      toast.success('Subjects updated'); setShowSubjectModal(false);
    } catch { toast.error('Failed to update subjects'); }
    finally { setIsUpdatingSubjects(false); }
  };

  const filtered = batches.filter(b => b.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ paddingBottom: '60px' }}>
      <style>{`
        .instr-batches-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 14px; }
        .instr-search-bar2 { position: relative; width: 100%; max-width: 360px; margin-bottom: 28px; }
        .instr-batches-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
        @media (max-width: 640px) {
          .instr-search-bar2 { max-width: 100%; }
          .instr-batches-grid { grid-template-columns: 1fr; gap: 16px; }
          .instr-batches-header .btn { width: 100%; justify-content: center; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="instr-batches-header">
        <div>
          <h1 className="page-title">My Batches</h1>
          <p className="page-subtitle">Manage scheduling and student enrollments for your assigned cohorts.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { fetchClasses(); setForm({ name: '', description: '', studyClass: '', capacity: 50, location: '', mode: 'online' }); setErrors({}); setShowModal(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px', padding: '12px 20px', fontWeight: '700', boxShadow: '0 4px 12px rgba(15,45,107,0.3)' }}>
          <Plus size={18} /> Create Batch
        </button>
      </div>

      {/* ── Search ── */}
      <div className="instr-search-bar2">
        <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search batches…"
          style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '12px', border: '1.5px solid var(--color-border)', fontSize: '14px', outline: 'none', background: 'white', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
          onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
      </div>

      {loading ? <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }} /> : (
        <div className="instr-batches-grid">
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', background: 'white', borderRadius: '16px', border: '2px dashed var(--color-border)' }}>
              <Layers size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>No Batches Found</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>You haven't been assigned to any active batches yet.</p>
            </div>
          ) : filtered.map(batch => (
            <div key={batch._id} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '16px', boxShadow: '0 2px 12px rgba(15,45,107,0.08)', transition: 'box-shadow 0.2s, transform 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(15,45,107,0.14)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(15,45,107,0.08)'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ padding: '24px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--color-primary-light)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layers size={24} />
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: '#dcfce7', color: '#15803d', letterSpacing: '0.04em' }}>● Active</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: 'var(--color-text-primary)' }}>{batch.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '18px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {batch.description || 'Foundation syllabus overview'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    <Users size={15} color="var(--color-primary)" />
                    <span><strong>{batch.students?.length || 0}/{batch.capacity || 50}</strong> Students</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    <MapPin size={15} color="var(--color-error)" />
                    <span>{batch.location || 'Online'} Campus</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    <Calendar size={15} color="var(--color-success)" />
                    <span>Started {new Date(batch.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
              <div style={{ padding: '14px 24px', background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '8px' }}>
                <button onClick={() => openSubjectModal(batch)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '10px', border: 'none', background: '#e0e7ff', color: 'var(--color-primary)', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <BookOpen size={15} /> Subjects
                </button>
                <button onClick={() => router.push(`/instructor/batches/${batch._id}`)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '10px', border: '1.5px solid var(--color-border)', background: 'white', fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)', cursor: 'pointer', transition: 'all 0.15s' }}>
                  Details <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create Batch Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,50,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '520px', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '22px 28px', background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'white' }}>Create New Batch</h2>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>Configure and publish a student cohort</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <FormField label="Batch Name" required error={errors.name}>
                <SInput value={form.name} onChange={e => { setForm({...form, name: e.target.value}); if (errors.name) validateField('name', e.target.value); }} onBlur={() => validateField('name', form.name)} error={errors.name} placeholder="e.g. Alpha Founders 2025" />
              </FormField>

              <FormField label="Target Class" required error={errors.studyClass} hint="Students in this class will be eligible to join">
                <SSelect value={form.studyClass} onChange={e => { setForm({...form, studyClass: e.target.value}); if (errors.studyClass) validateField('studyClass', e.target.value); }} error={errors.studyClass} onBlur={() => validateField('studyClass', form.studyClass)}>
                  <option value="">Select a class…</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name} {c.targetGrade ? `(${c.targetGrade})` : ''}</option>)}
                </SSelect>
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FormField label="Capacity" error={errors.capacity} hint="Max students">
                  <SInput type="number" value={form.capacity} onChange={e => { setForm({...form, capacity: e.target.value}); if (errors.capacity) validateField('capacity', e.target.value); }} onBlur={() => validateField('capacity', form.capacity)} error={errors.capacity} />
                </FormField>
                <FormField label="Delivery Mode">
                  <SSelect value={form.mode} onChange={e => setForm({...form, mode: e.target.value})}>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                  </SSelect>
                </FormField>
              </div>

              <FormField label="Location / Campus" hint="Optional — for offline or hybrid batches">
                <SInput value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Block A, Room 102" />
              </FormField>

              <FormField label="Description">
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} placeholder="Brief overview of this batch…"
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: '500', color: '#1e293b', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </FormField>
            </div>

            <div style={{ padding: '18px 28px', background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleCreate} disabled={saving}
                style={{ flex: 2, padding: '12px', background: 'var(--color-primary)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(15,45,107,0.3)' }}>
                <CheckCircle size={16} /> {saving ? 'Creating…' : 'Publish Batch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Assign Subjects Modal ── */}
      {showSubjectModal && selectedBatch && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,50,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '460px', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>
            <div style={{ padding: '22px 28px', background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'white' }}>Assign Subjects</h2>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>Batch: {selectedBatch.name}</p>
              </div>
              <button onClick={() => setShowSubjectModal(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '20px 28px', overflowY: 'auto', flex: 1 }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
                Toggle the subjects you want mapped to this batch. Students will only see content from assigned subjects.
              </p>
              {batchSubjects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', border: '2px dashed var(--color-border)', borderRadius: '12px' }}>
                  <BookOpen size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                  <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>No subjects found. Add subjects via the Curriculum tab first.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {batchSubjects.map(sub => (
                    <div key={sub._id} onClick={() => toggleSubject(sub._id)}
                      style={{ padding: '14px 18px', borderRadius: '12px', border: `2px solid ${sub.isAssigned ? 'var(--color-primary)' : '#e2e8f0'}`, background: sub.isAssigned ? 'var(--color-primary-light)' : 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: sub.isAssigned ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{sub.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>Grade: {sub.targetGrade || 'N/A'}</div>
                      </div>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: sub.isAssigned ? 'var(--color-primary)' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}>
                        <Check size={13} color="white" strokeWidth={3} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: '16px 28px', background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowSubjectModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={saveBatchSubjects} disabled={isUpdatingSubjects}
                style={{ flex: 2, padding: '12px', background: 'var(--color-primary)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: isUpdatingSubjects ? 'not-allowed' : 'pointer', opacity: isUpdatingSubjects ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <CheckCircle size={16} /> {isUpdatingSubjects ? 'Saving…' : 'Update Assignments'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
