"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Layers, Plus, Pencil, Trash2, Search, X, CheckCircle, ChevronDown, ChevronRight, GraduationCap, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirmStore } from '@/store/confirmStore';

// ── Shared form primitives ──────────────────────────────────
function FormField({ label, required, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: error ? '#dc2626' : '#64748b' }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
      {error && (
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#dc2626', fontWeight: '600' }}>
          <AlertCircle size={11} /> {error}
        </span>
      )}
    </div>
  );
}

function SInput({ value, onChange, placeholder, error, onBlur, autoFocus }) {
  const [focused, setFocused] = useState(false);
  return (
    <input type="text" value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} autoFocus={autoFocus}
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

export default function InstructorCurriculum() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const confirm = useConfirmStore(s => s.confirm);
  const [expanded, setExpanded] = useState({});

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => { fetchSubjects(); fetchFaculties(); fetchClasses(); }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/instructor/subjects');
      const subs = Array.isArray(res.data) ? res.data : [];
      const withChapters = await Promise.all(subs.map(async s => {
        try { const r = await axios.get(`/api/instructor/subjects/${s._id}/chapters`); return { ...s, chapters: r.data || [] }; }
        catch { return { ...s, chapters: [] }; }
      }));
      setSubjects(withChapters);
    } catch { toast.error('Failed to load subjects.'); }
    finally { setLoading(false); }
  };

  const fetchFaculties = async () => {
    try {
      const res = await axios.get('/api/instructor/faculties');
      setFaculties(res.data.data?.available || []);
    } catch {}
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get('/api/instructor/classes');
      setClasses(res.data.data || []);
    } catch {}
  };

  const toggleExpand = id => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  // ── Validation ─────────────────────────────────────────────
  const validateField = (f, v) => {
    let err = null;
    if (f === 'name') {
      if (!v?.trim()) err = 'Name is required';
      else if (v.trim().length < 2) err = 'Name must be at least 2 characters';
      else if (v.trim().length > 80) err = 'Name must be 80 characters or fewer';
    }
    setErrors(prev => ({ ...prev, [f]: err }));
    return !err;
  };

  // ── Subject actions ────────────────────────────────────────
  const handleSaveSubject = async () => {
    if (!validateField('name', form.name)) { toast.error('Please fix the errors'); return; }
    setSaving(true);
    try {
      if (form._id) { await axios.put(`/api/instructor/subjects/${form._id}`, form); toast.success('Subject updated'); }
      else { await axios.post('/api/instructor/subjects', form); toast.success('Subject created'); }
      setShowSubjectModal(false); fetchSubjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save subject'); }
    finally { setSaving(false); }
  };

  const handleDeleteSubject = id => {
    confirm({
      title: 'Delete Subject?',
      message: 'Permanently delete this subject and all its chapter connections? This may affect student enrollments and progress.',
      confirmText: 'Delete Permanently', type: 'danger', icon: BookOpen,
      onConfirm: async () => {
        try { await axios.delete(`/api/instructor/subjects/${id}`); toast.success('Subject removed'); fetchSubjects(); }
        catch { toast.error('Failed to delete subject.'); }
      }
    });
  };

  // ── Chapter actions ────────────────────────────────────────
  const handleSaveChapter = async () => {
    if (!validateField('name', form.name)) { toast.error('Please fix the errors'); return; }
    if (!form.subjectId) { toast.error('Subject reference is missing'); return; }
    setSaving(true);
    try {
      if (form._id) { await axios.put(`/api/instructor/chapters/${form._id}`, { name: form.name }); toast.success('Chapter updated'); }
      else { await axios.post('/api/instructor/chapters', { name: form.name, subjectId: form.subjectId }); toast.success('Chapter added'); }
      setShowChapterModal(false); fetchSubjects();
    } catch { toast.error('Failed to save chapter.'); }
    finally { setSaving(false); }
  };

  const handleDeleteChapter = id => {
    confirm({
      title: 'Delete Chapter?',
      message: 'Permanently delete this chapter? All lesson links and content mappings will be removed.',
      confirmText: 'Delete Permanently', type: 'danger', icon: Trash2,
      onConfirm: async () => {
        try { await axios.delete(`/api/instructor/chapters/${id}`); toast.success('Chapter removed'); fetchSubjects(); }
        catch { toast.error('Deletion failed'); }
      }
    });
  };

  const filtered = subjects.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 className="page-title">Academic Curriculum</h1>
          <p className="page-subtitle">Organize your subjects and chapters to structure the learning path.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({}); setErrors({}); setShowSubjectModal(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px', padding: '12px 20px', fontWeight: '700', boxShadow: '0 4px 12px rgba(15,45,107,0.3)' }}>
          <Plus size={18} /> New Subject
        </button>
      </div>

      {/* ── Search ── */}
      <div style={{ position: 'relative', width: '360px', marginBottom: '24px' }}>
        <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subjects…"
          style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '12px', border: '1.5px solid var(--color-border)', fontSize: '14px', outline: 'none', background: 'white', transition: 'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
          onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
      </div>

      {/* ── Subject list ── */}
      {loading ? <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }} /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: '16px', border: '2px dashed var(--color-border)' }}>
              <BookOpen size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.4 }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>No Subjects Found</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>Get started by creating your first academic subject.</p>
            </div>
          ) : filtered.map(subject => (
            <div key={subject._id} style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,45,107,0.06)', transition: 'box-shadow 0.2s' }}>
              {/* Subject row */}
              <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'background 0.15s', background: expanded[subject._id] ? '#f8faff' : 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }} onClick={() => toggleExpand(subject._id)}>
                  <div style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>
                    {expanded[subject._id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--color-primary-light)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--color-text-primary)' }}>{subject.name}</h3>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '3px', fontSize: '12px', color: 'var(--color-text-muted)', alignItems: 'center' }}>
                      <span style={{ fontWeight: '700', color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '1px 8px', borderRadius: '10px' }}>{subject.targetGrade || 'All Levels'}</span>
                      <span>·</span>
                      <span>{subject.chapters?.length || 0} Chapters</span>
                      <span>·</span>
                      <span>Fac: {(typeof subject.faculty === 'object' ? subject.faculty?.name : faculties.find(f => f._id === subject.faculty)?.name) || 'Unassigned'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={() => { setForm({ ...subject }); setErrors({}); setShowSubjectModal(true); }}
                    style={{ width: '34px', height: '34px', borderRadius: '8px', border: 'none', background: '#ede9fe', color: '#7c3aed', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => { setForm({ subjectId: subject._id }); setErrors({}); setShowChapterModal(true); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: 'none', background: '#dcfce7', color: '#15803d', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>
                    <Plus size={14} /> Chapter
                  </button>
                  <button onClick={() => handleDeleteSubject(subject._id)}
                    style={{ width: '34px', height: '34px', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Expanded chapters */}
              {expanded[subject._id] && (
                <div style={{ borderTop: '1px solid var(--color-border)', padding: '12px 24px 16px 86px', background: '#fafbff' }}>
                  {subject.chapters?.length === 0 ? (
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '8px 0' }}>No chapters defined yet. Click "+ Chapter" to add one.</div>
                  ) : (
                    <div style={{ borderLeft: '2px solid var(--color-border)', paddingLeft: '0' }}>
                      {subject.chapters.map((ch, idx) => (
                        <div key={ch._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: idx < subject.chapters.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0 }} />
                            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>{ch.name}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => { setForm(ch); setErrors({}); setShowChapterModal(true); }}
                              style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: '#ede9fe', color: '#7c3aed', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Pencil size={12} />
                            </button>
                            <button onClick={() => handleDeleteChapter(ch._id)}
                              style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Subject Modal ── */}
      {showSubjectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,50,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '460px', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '22px 28px', background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'white' }}>{form._id ? 'Edit Subject' : 'Create New Subject'}</h2>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>Define curriculum structure</p>
              </div>
              <button onClick={() => setShowSubjectModal(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <FormField label="Subject Name" required error={errors.name}>
                <SInput value={form.name || ''} onChange={e => { setForm({...form, name: e.target.value}); if (errors.name) validateField('name', e.target.value); }}
                  onBlur={() => validateField('name', form.name)} error={errors.name} placeholder="e.g. Mathematics" />
              </FormField>
              <FormField label="Target Grade / Level" hint="Select a class">
                <SSelect value={form.targetGrade || ''} onChange={e => setForm({...form, targetGrade: e.target.value})}>
                  <option value="">Select target grade…</option>
                  {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </SSelect>
              </FormField>
            </div>
            <div style={{ padding: '16px 28px', background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowSubjectModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleSaveSubject} disabled={saving}
                style={{ flex: 2, padding: '12px', background: 'var(--color-primary)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <CheckCircle size={16} /> {saving ? 'Saving…' : 'Save Subject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Chapter Modal ── */}
      {showChapterModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,50,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '420px', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '22px 28px', background: 'linear-gradient(135deg, #065f46, #10b981)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'white' }}>{form._id ? 'Edit Chapter' : 'Add Chapter'}</h2>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>Add a chapter to this subject</p>
              </div>
              <button onClick={() => setShowChapterModal(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '28px' }}>
              <FormField label="Chapter Name" required error={errors.name}>
                <SInput value={form.name || ''} autoFocus
                  onChange={e => { setForm({...form, name: e.target.value}); if (errors.name) validateField('name', e.target.value); }}
                  onBlur={() => validateField('name', form.name)} error={errors.name} placeholder="e.g. Atomic Structure" />
              </FormField>
            </div>
            <div style={{ padding: '16px 28px', background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowChapterModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleSaveChapter} disabled={saving}
                style={{ flex: 2, padding: '12px', background: '#10b981', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <CheckCircle size={16} /> {saving ? 'Saving…' : 'Confirm Chapter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
