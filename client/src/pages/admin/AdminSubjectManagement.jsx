import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, BookOpen, X } from 'lucide-react';
import axios from 'axios';

const AdminSubjectManagement = () => {
  const token = localStorage.getItem('token');
  const [subjects, setSubjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [form, setForm] = useState({ name: '', targetGrade: 'Class 10', description: '', instructorId: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { 
    fetchSubjects(); 
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const [facRes, instRes] = await Promise.all([
        axios.get('/api/admin/users?role=faculty', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/admin/users?role=instructor', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStaff([...facRes.data, ...instRes.data]);
    } catch(err) { console.error('Failed to fetch staff list.'); }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/subjects', { headers: { Authorization: `Bearer ${token}` } });
      setSubjects(Array.isArray(res.data) ? res.data : []);
    } catch {
      setSubjects([]);
    } finally { setLoading(false); }
  };

  const openCreate = () => {
    setForm({ name: '', targetGrade: 'Class 10', description: '', instructorId: staff[0]?._id || '' });
    setEditingSubject(null);
    setShowModal(true);
  };

  const openEdit = (subject) => {
    setForm({ name: subject.name, targetGrade: subject.targetGrade || 'Class 10', description: subject.description || '', instructorId: subject.instructor?._id || staff[0]?._id || '' });
    setEditingSubject(subject);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) return alert('Subject name is required');
    setSaving(true);
    try {
      if (editingSubject) {
        await axios.put(`/api/admin/subjects/${editingSubject._id}`, form, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('/api/admin/subjects', form, { headers: { Authorization: `Bearer ${token}` } });
      }
      setShowModal(false);
      fetchSubjects();
    } catch { alert('Failed to save subject.'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try { await axios.delete(`/api/admin/subjects/${id}`, { headers: { Authorization: `Bearer ${token}` } }); fetchSubjects(); } catch { alert('Delete failed.'); }
  };

  const gradeColors = { 'Class 10': '#6366f1', 'Class 9': '#10b981', 'Class 8': '#f59e0b' };

  if (loading) return <div className="spinner" style={{ display: 'block', margin: '10vh auto' }}></div>;

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">Subject Management</h1>
          <p className="page-subtitle">Define and manage academic subjects for Class 8, 9, and 10.</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={openCreate}>
          <Plus size={18} /> New Subject
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {subjects.map(subject => {
          const color = gradeColors[subject.targetGrade] || '#6366f1';
          return (
            <div key={subject._id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: color + '22', color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={20} />
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => openEdit(subject)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'white', cursor: 'pointer', color: '#6366f1' }}><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(subject._id)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'white', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{subject.targetGrade}</div>
                <h3 style={{ fontSize: '17px', fontWeight: 'bold', margin: 0 }}>{subject.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>{subject.description || 'No description provided.'}</p>
              </div>
              
              <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--color-border)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Instructor: <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{subject.instructor?.name || 'Assigned Factory'}</span>
              </div>
            </div>
          );
        })}
        {subjects.length === 0 && (
             <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--color-text-secondary)' }}>
                 No subjects found. Create your first subject to get started.
             </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', width: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontWeight: 'bold', fontSize: '18px', margin: 0 }}>{editingSubject ? 'Edit Subject' : 'New Subject'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px' }}>Subject Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Physics"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px' }}>Target Grade</label>
                <select value={form.targetGrade} onChange={e => setForm({ ...form, targetGrade: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <option>Class 8</option>
                  <option>Class 9</option>
                  <option>Class 10</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the subject..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', minHeight: '80px', fontFamily: 'inherit' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px' }}>Assigned Faculty/Instructor</label>
                <select value={form.instructorId} onChange={e => setForm({ ...form, instructorId: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'white' }}>
                  {staff.length === 0 ? <option value="">No faculty/instructors available</option> : null}
                  {staff.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.role.charAt(0).toUpperCase() + s.role.slice(1)})</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleSave} className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
                {saving ? 'Saving...' : (editingSubject ? 'Save Changes' : 'Create Subject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubjectManagement;
