"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Layers, Plus, Pencil, Trash2, Search, X, CheckCircle, ChevronDown, ChevronRight, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirmStore } from '@/store/confirmStore';

export default function InstructorCurriculum() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const confirm = useConfirmStore(s => s.confirm);
  
  // Expanded subjects (to show chapters)
  const [expanded, setExpanded] = useState({});

  // Modals
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  
  // Lookups (for Faculty assignment)
  const [faculties, setFaculties] = useState([]);

  useEffect(() => {
    fetchSubjects();
    fetchFaculties();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/instructor/subjects');
      // res.data for instructor subjects is an array of Subject models
      const subs = Array.isArray(res.data) ? res.data : [];
      
      // Fetch chapters for each subject to have a full view
      const subjectsWithChapters = await Promise.all(subs.map(async (s) => {
         try {
            const chRes = await axios.get(`/api/instructor/subjects/${s._id}/chapters`);
            return { ...s, chapters: chRes.data || [] };
         } catch {
            return { ...s, chapters: [] };
         }
      }));
      
      setSubjects(subjectsWithChapters);
    } catch {
      toast.error("Failed to load subjects.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const res = await axios.get('/api/instructor/faculties');
      // res.data.data includes { available, assigned }
      setFaculties(res.data.data?.available || []);
    } catch (err) {
      console.error('Failed to load faculties');
    }
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // SUBJECT ACTIONS
  const handleSaveSubject = async () => {
    if (!form.name) return toast.error('Subject name is required');
    setSaving(true);
    try {
      if (form._id) {
        await axios.put(`/api/instructor/subjects/${form._id}`, form);
        toast.success('Subject updated');
      } else {
        await axios.post('/api/instructor/subjects', form);
        toast.success('Subject created');
      }
      setShowSubjectModal(false);
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save subject');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    confirm({
      title: 'Delete Subject?',
      message: 'Are you sure you want to permanently delete this subject and its connection to chapters? This may affect student enrollments and progress.',
      confirmText: 'Delete Permanently',
      type: 'danger',
      icon: BookOpen,
      onConfirm: async () => {
        try {
          await axios.delete(`/api/instructor/subjects/${id}`);
          toast.success('Subject removed');
          fetchSubjects();
        } catch {
          toast.error('Failed to delete subject.');
        }
      }
    });
  };

  // CHAPTER ACTIONS
  const handleSaveChapter = async () => {
    if (!form.name || !form.subjectId) return toast.error('Chapter name is required');
    setSaving(true);
    try {
      if (form._id) {
        await axios.put(`/api/instructor/chapters/${form._id}`, { name: form.name });
        toast.success('Chapter updated');
      } else {
        await axios.post('/api/instructor/chapters', { name: form.name, subjectId: form.subjectId });
        toast.success('Chapter added');
      }
      setShowChapterModal(false);
      fetchSubjects();
    } catch (err) {
      toast.error('Failed to save chapter.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChapter = async (id) => {
    confirm({
      title: 'Delete Chapter?',
      message: 'Are you sure you want to permanently delete this chapter? This will remove all associated lesson links and content mappings.',
      confirmText: 'Delete Permanently',
      type: 'danger',
      icon: Trash2,
      onConfirm: async () => {
        try {
          await axios.delete(`/api/instructor/chapters/${id}`);
          toast.success('Chapter removed');
          fetchSubjects();
        } catch {
          toast.error('Deletion failed');
        }
      }
    });
  };

  const filtered = subjects.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">Academic Curriculum</h1>
          <p className="page-subtitle">Organize your subjects and Chapters to structure the learning path.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ targetGrade: 'Class 10' }); setShowSubjectModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> New Subject
        </button>
      </div>

      <div style={{ position: 'relative', width: '350px', marginBottom: '32px' }}>
        <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search curriculum...`}
          style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '15px' }} />
      </div>

      {loading ? <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }}></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '80px', textAlign: 'center', background: 'var(--color-bg)', borderRadius: '16px', border: '2px dashed var(--color-border)' }}>
              <BookOpen size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>No Subjects Found</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>Get started by creating your first academic subject.</p>
            </div>
          ) : filtered.map(subject => (
            <div key={subject._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: expanded[subject._id] ? 'var(--color-bg)' : 'white', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, cursor: 'pointer' }} onClick={() => toggleExpand(subject._id)}>
                  <div style={{ color: 'var(--color-text-secondary)' }}>
                    {expanded[subject._id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{subject.name}</h3>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontWeight: 'bold' }}>{subject.targetGrade || 'All Levels'}</span>
                      <span>•</span>
                      <span>{subject.chapters?.length || 0} Chapters</span>
                      <span>•</span>
                      <span>Fac: {(typeof subject.faculty === 'object' ? subject.faculty?.name : faculties.find(f => f._id === subject.faculty)?.name) || 'Unassigned'}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setForm({ ...subject, faculty: subject.faculty?._id || subject.faculty }); setShowSubjectModal(true); }} className="btn btn-ghost" style={{ padding: '8px', color: 'var(--color-primary)' }}><Pencil size={16} /></button>
                  <button onClick={() => { setForm({ subjectId: subject._id }); setShowChapterModal(true); }} className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 'bold', gap: '6px', color: 'var(--color-success)', background: '#ecfdf5' }}>
                    <Plus size={16} /> Add Chapter
                  </button>
                  <button onClick={() => handleDeleteSubject(subject._id)} className="btn btn-ghost" style={{ padding: '8px', color: 'var(--color-error)' }}><Trash2 size={16} /></button>
                </div>
              </div>

              {expanded[subject._id] && (
                <div style={{ padding: '8px 24px 24px 84px', background: 'white' }}>
                   {subject.chapters?.length === 0 ? (
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontStyle: 'italic', padding: '12px 0' }}>No chapters defined yet.</div>
                   ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1.5px solid var(--color-border)' }}>
                        {subject.chapters.map(chapter => (
                          <div key={chapter._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', position: 'relative' }}>
                             {/* Connector line */}
                             <div style={{ position: 'absolute', left: 0, top: '50%', width: '12px', height: '1px', background: 'var(--color-border)' }} />
                             
                             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ fontSize: '14px', fontWeight: '600' }}>{chapter.name}</div>
                             </div>
                             
                             <div style={{ display: 'flex', gap: '4px' }}>
                                <button onClick={() => { setForm(chapter); setShowChapterModal(true); }} className="btn btn-ghost" style={{ padding: '4px' }}><Pencil size={14} /></button>
                                <button onClick={() => handleDeleteChapter(chapter._id)} className="btn btn-ghost" style={{ padding: '4px', color: 'var(--color-error)' }}><Trash2 size={14} /></button>
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

      {/* Subject Modal */}
      {showSubjectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 45, 107, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card fade-in" style={{ width: '90%', maxWidth: '450px', padding: 0 }}>
            <div style={{ padding: '20px 24px', background: 'var(--color-primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{form._id ? 'Edit Subject' : 'Create New Subject'}</h2>
              <button onClick={() => setShowSubjectModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px' }}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Subject Name <span style={{color: 'red'}}>*</span></label>
                <input type="text" className="form-input" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Mathematics" />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Target Grade / Level</label>
                <input type="text" className="form-input" value={form.targetGrade || ''} onChange={e => setForm({...form, targetGrade: e.target.value})} placeholder="e.g. Class 10 Foundation" />
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Faculty Member</label>
                <select className="form-select" value={form.faculty || ''} onChange={e => setForm({...form, faculty: e.target.value})}>
                  <option value="">Select Faculty...</option>
                  {faculties.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ padding: '16px 24px', background: 'var(--color-bg)', display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)' }}>
              <button onClick={() => setShowSubjectModal(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleSaveSubject} className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Subject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Modal */}
      {showChapterModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 45, 107, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card fade-in" style={{ width: '90%', maxWidth: '400px', padding: 0 }}>
            <div style={{ padding: '20px 24px', background: 'var(--color-success)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{form._id ? 'Edit Chapter' : 'Add Chapter'}</h2>
              <button onClick={() => setShowChapterModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px' }}>
               <label className="form-label">Chapter Name <span style={{color: 'red'}}>*</span></label>
               <input type="text" className="form-input" autoFocus value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Atomic Structure" />
            </div>
            <div style={{ padding: '16px 24px', background: 'var(--color-bg)', display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)' }}>
               <button onClick={() => setShowChapterModal(false)} className="btn btn-ghost">Cancel</button>
               <button onClick={handleSaveChapter} className="btn btn-primary" style={{ background: 'var(--color-success)' }} disabled={saving}>
                 {saving ? 'Saving...' : 'Confirm Chapter'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
