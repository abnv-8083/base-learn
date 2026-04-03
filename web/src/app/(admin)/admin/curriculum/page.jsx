"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Search, X, Layers, BookOpen, GraduationCap, MapPin, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirmStore } from '@/store/confirmStore';

export default function AdminCurriculum() {
  const [activeTab, setActiveTab] = useState('batches'); // 'batches', 'classes', 'subjects'
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const confirm = useConfirmStore(s => s.confirm);
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  
  // Lookups
  const [lookups, setLookups] = useState({ faculties: [], instructors: [], classes: [], subjects: [] });

  useEffect(() => {
    fetchData();
    if (activeTab === 'batches') fetchLookups(['instructors', 'classes']);
    if (activeTab === 'classes') fetchLookups(['subjects']);
    if (activeTab === 'subjects') fetchLookups(['faculties', 'classes']);
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'batches' ? '/api/admin/batches' : 
                       activeTab === 'classes' ? '/api/admin/classes' : '/api/admin/subjects';
      const res = await axios.get(`${endpoint}`);
      setData(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setData([]);
      toast.error(`Failed to load ${activeTab}`, { id: `curriculum-load-${activeTab}` });
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async (types) => {
    try {
      const newLookups = { ...lookups };
      if (types.includes('instructors')) {
        const res = await axios.get('/api/admin/users?role=instructor');
        newLookups.instructors = res.data.data || [];
      }
      if (types.includes('faculties')) {
        const res = await axios.get('/api/admin/users?role=faculty');
        newLookups.faculties = res.data.data || [];
      }
      if (types.includes('classes')) {
        const res = await axios.get('/api/admin/classes');
        newLookups.classes = res.data.data || [];
      }
      if (types.includes('subjects')) {
        const res = await axios.get('/api/admin/subjects');
        newLookups.subjects = res.data.data || [];
      }
      setLookups(newLookups);
    } catch (err) {
      console.error('Failed fetching lookups', err);
    }
  };

  const handleCreate = () => {
    setForm({});
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setForm({
      ...item,
      // Normalize IDs for select fields
      instructor: item.instructor?._id || item.instructor,
      studyClass: item.studyClass?._id || item.studyClass,
      faculty: item.faculty?._id || item.faculty,
      gradeLevel: item.targetGrade || item.gradeLevel
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const endpoint = activeTab === 'batches' ? '/api/admin/batches' : 
                       activeTab === 'classes' ? '/api/admin/classes' : '/api/admin/subjects';

      let payload = { ...form };
      if (activeTab === 'classes') {
        payload = {
          name: form.name,
          description: form.description,
          targetGrade: form.gradeLevel != null && form.gradeLevel !== '' ? String(form.gradeLevel) : undefined,
          instructorId: form.instructorId || form.instructor || undefined
        };
      } else if (activeTab === 'subjects') {
        payload = {
          name: form.name,
          description: form.description,
          facultyId: form.faculty || undefined,
          targetGrade: form.targetGrade || 'Class 10'
        };
      }

      if (form._id) {
        await axios.put(`${endpoint}/${form._id}`, payload);
        toast.success(`Updated successfully`);
      } else {
        await axios.post(`${endpoint}`, payload);
        toast.success(`Created successfully`);
      }
      
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: `Delete ${activeTab.slice(0, -1)}?`,
      message: `Are you sure you want to permanently delete this ${activeTab.slice(0, -1)}? This action cannot be undone and may affect related schedules and enrollments.`,
      confirmText: 'Delete Permanently',
      type: 'danger',
      icon: Trash2,
      onConfirm: async () => {
        try {
          const endpoint = activeTab === 'batches' ? '/api/admin/batches' : 
                           activeTab === 'classes' ? '/api/admin/classes' : '/api/admin/subjects';
          await axios.delete(`${endpoint}/${id}`);
          toast.success('Deleted successfully');
          fetchData();
        } catch (err) {
          toast.error('Failed to delete');
        }
      }
    });
  };

  const filtered = data.filter(item => 
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">Curriculum Management</h1>
          <p className="page-subtitle">Configure batches, study classes, and curriculum subjects.</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add {activeTab === 'batches' ? 'Batch' : activeTab === 'classes' ? 'Class' : 'Subject'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--color-border)' }}>
        {['batches', 'classes', 'subjects'].map(tab => (
          <button 
            key={tab}
            onClick={() => { setActiveTab(tab); setSearch(''); }}
            style={{ 
              background: 'none', border: 'none', padding: '12px 24px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'capitalize',
              color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === tab ? `3px solid var(--color-primary)` : '3px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative', width: '300px', marginBottom: '24px' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${activeTab}...`}
          style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '14px' }} />
      </div>

      {loading ? <div className="spinner" style={{ display: 'block', margin: '10vh auto' }}></div> : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>{activeTab === 'batches' ? 'Batch Name' : activeTab === 'classes' ? 'Class Name' : 'Subject Name'}</th>
                {activeTab === 'batches' && <th style={{ padding: '16px 20px', textAlign: 'left' }}>Instructor</th>}
                {activeTab === 'batches' && <th style={{ padding: '16px 20px', textAlign: 'left' }}>Location / Mode</th>}
                {activeTab === 'classes' && <th style={{ padding: '16px 20px', textAlign: 'left' }}>Curriculum / Grade</th>}
                {activeTab === 'subjects' && <th style={{ padding: '16px 20px', textAlign: 'left' }}>Assigned Faculty</th>}
                <th style={{ padding: '16px 20px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'batches' ? 4 : 3} style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                     No records found.
                  </td>
                </tr>
              ) : filtered.map(item => (
                <tr key={item._id} style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 'bold' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {activeTab === 'batches' && <Layers size={16} color="var(--color-primary)" />}
                      {activeTab === 'classes' && <GraduationCap size={16} color="var(--color-success)" />}
                      {activeTab === 'subjects' && <BookOpen size={16} color="var(--color-warning)" />}
                      {item.name}
                    </div>
                  </td>
                  
                  {activeTab === 'batches' && (
                    <>
                      <td style={{ padding: '16px 20px' }}>{item.instructor?.name || 'Unassigned'}</td>
                      <td style={{ padding: '16px 20px' }}>
                         <div style={{ fontSize: '12px', background: 'var(--color-bg)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
                           {item.location || '—'} ({item.mode || 'online'})
                         </div>
                      </td>
                    </>
                  )}

                  {activeTab === 'classes' && (
                    <td style={{ padding: '16px 20px', fontSize: '13px' }}>
                      Level: {item.targetGrade ?? item.gradeLevel ?? '—'}
                    </td>
                  )}

                  {activeTab === 'subjects' && (
                    <td style={{ padding: '16px 20px' }}>{item.faculty?.name || 'Unassigned'}</td>
                  )}

                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button onClick={() => handleEdit(item)} className="btn btn-ghost" style={{ padding: '8px', color: 'var(--color-primary)' }} title="Edit">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="btn btn-ghost" style={{ padding: '8px', color: '#ef4444' }} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal logic */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 45, 107, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '90%', maxWidth: '500px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '24px', background: 'var(--color-primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', textTransform: 'capitalize' }}>{form._id ? 'Edit' : 'Add New'} {activeTab.slice(0, -1)}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Name <span style={{color: 'red'}}>*</span></label>
                <input type="text" className="form-input" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="E.g. Class 10 Foundation" />
              </div>
              
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Description</label>
                <textarea className="form-input" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
              </div>

              {activeTab === 'batches' && (
                <>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Associated Class <span style={{color: 'red'}}>*</span></label>
                    <select className="form-select" value={form.studyClass || ''} onChange={e => setForm({...form, studyClass: e.target.value})}>
                      <option value="">Select Class</option>
                      {lookups.classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Primary Instructor <span style={{color: 'red'}}>*</span></label>
                    <select className="form-select" value={form.instructor || ''} onChange={e => setForm({...form, instructor: e.target.value})}>
                      <option value="">Select Instructor</option>
                      {lookups.instructors.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Learning Mode</label>
                      <select className="form-select" value={form.mode || 'online'} onChange={e => setForm({...form, mode: e.target.value})}>
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Capacity</label>
                      <input type="number" className="form-input" value={form.capacity || 50} onChange={e => setForm({...form, capacity: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Location District</label>
                    <input type="text" className="form-input" value={form.location || ''} onChange={e => setForm({...form, location: e.target.value})} placeholder="E.g. Ernakulam" />
                  </div>
                </>
              )}

              {activeTab === 'classes' && (
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Grade Level</label>
                  <input type="number" className="form-input" value={form.gradeLevel || 10} onChange={e => setForm({...form, gradeLevel: e.target.value})} />
                </div>
              )}

              {activeTab === 'subjects' && (
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Assigned Faculty Member <span style={{color: 'red'}}>*</span></label>
                  <select className="form-select" value={form.faculty || ''} onChange={e => setForm({...form, faculty: e.target.value})}>
                    <option value="">Select Faculty</option>
                    {lookups.faculties.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                  </select>
                </div>
              )}

            </div>
            <div style={{ display: 'flex', gap: '16px', padding: '24px', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleSave} className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
                {saving ? 'Processing...' : `Save Record`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
