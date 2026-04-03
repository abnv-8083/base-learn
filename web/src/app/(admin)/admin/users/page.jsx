"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search, X, User, Mail, School, MapPin, Calendar, Lock, CheckCircle, Phone, ExternalLink, Shield, Eye, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirmStore } from '@/store/confirmStore';

const ROLE_CONFIG = {
  student: { 
    label: 'Students', 
    singular: 'Student', 
    color: '#6366f1', 
    fields: ['name', 'email', 'phone', 'studentClass', 'district', 'school', 'dob'] 
  },
  faculty: { label: 'Faculty', singular: 'Faculty', color: '#10b981', fields: ['name', 'email', 'phone', 'district', 'qualification', 'experience'] },
  instructor: { label: 'Instructors', singular: 'Instructor', color: '#f59e0b', fields: ['name', 'email', 'phone', 'district', 'experience', 'qualification'] },
};

const DISTRICTS = ['Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'];
const QUALIFICATIONS = ['B.Ed', 'M.Ed', 'PhD', 'MSc', 'BSc', 'M.A', 'B.A', 'B.Tech', 'M.Tech', 'Other'];

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState('student');
  const config = ROLE_CONFIG[activeTab];
  const confirm = useConfirmStore(s => s.confirm);
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  // View Modal state
  const [viewUser, setViewUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [assigningSubject, setAssigningSubject] = useState(false);
  
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [assigningInstructor, setAssigningInstructor] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/admin/users?role=${activeTab}`);
      setUsers(Array.isArray(data.data) ? data.data : []);
    } catch {
      setUsers([]);
      toast.error(`Failed to load ${config.label}`);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    const empty = {};
    config.fields.forEach(f => empty[f] = '');
    empty.password = '';
    setForm(empty);
    setShowModal(true);
  };

  const openViewUser = async (u) => {
    setViewUser(u);
    setShowViewModal(true);
    if (activeTab === 'faculty') {
      try {
        const { data } = await axios.get('/api/admin/subjects');
        setSubjects(data.data || []);
      } catch (err) {
        toast.error('Failed to load assignments');
      }
      try {
        const { data } = await axios.get('/api/admin/users?role=instructor');
        setInstructors(data.data || []);
      } catch (err) {
        console.error('Failed to load instructors');
      }
    }
  };

  const handleAssignSubject = async () => {
    if (!selectedSubject) return toast.error('Please select a subject to assign');
    setAssigningSubject(true);
    try {
      await axios.put(`/api/admin/subjects/${selectedSubject}`, { facultyId: viewUser._id });
      toast.success('Subject assigned successfully');
      fetchUsers(); // Refresh to possibly show assigned subject on table if needed
      setSelectedSubject('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign subject');
    } finally {
      setAssigningSubject(false);
    }
  };

  const handleAssignInstructor = async () => {
    if (!selectedInstructor) return toast.error('Please select an instructor');
    setAssigningInstructor(true);
    try {
      await axios.put(`/api/admin/users/${viewUser._id}`, { role: 'faculty', assignedInstructor: selectedInstructor });
      toast.success('Instructor assigned successfully');
      fetchUsers(); 
      setSelectedInstructor('');
      setViewUser({ ...viewUser, assignedInstructor: selectedInstructor });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign instructor');
    } finally {
      setAssigningInstructor(false);
    }
  };

  const handleSave = async () => {
    // Basic validation
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, Email and Password are required.');
      return;
    }

    setSaving(true);
    try {
      await axios.post('/api/admin/users', { ...form, role: activeTab });
      toast.success(`${config.singular} created successfully.`);
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id, current) => {
    try {
      await axios.patch(`/api/admin/users/${id}/status`, { isActive: !current });
      toast.success(current ? 'User blocked.' : 'User activated.');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Delete User Account?',
      message: `Are you sure you want to permanently delete this ${config.singular.toLowerCase()}? This action cannot be undone and will remove all their enrollment and progress data.`,
      confirmText: 'Delete Permanently',
      type: 'danger',
      icon: Trash2,
      onConfirm: async () => {
        try {
          await axios.delete(`/api/admin/users/${id}`);
          toast.success('User deleted.');
          fetchUsers();
        } catch (err) {
          toast.error('Failed to delete user.');
        }
      }
    });
  };

  const fieldLabel = (f) => f.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

  return (
    <div style={{ paddingBottom: '60px' }}>
<div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Provision and oversee platform accounts.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: config.color }}>
          <Plus size={18} /> Add {config.singular}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--color-border)' }}>
        {Object.keys(ROLE_CONFIG).map(roleKey => (
          <button 
            key={roleKey}
            onClick={() => { setActiveTab(roleKey); setSearch(''); }}
            style={{ 
              background: 'none', border: 'none', padding: '12px 24px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer',
              color: activeTab === roleKey ? ROLE_CONFIG[roleKey].color : 'var(--color-text-secondary)',
              borderBottom: activeTab === roleKey ? `3px solid ${ROLE_CONFIG[roleKey].color}` : '3px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            {ROLE_CONFIG[roleKey].label}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative', width: '300px', marginBottom: '24px' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${config.label}...`}
          style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '14px' }} />
      </div>

      {loading ? <div className="spinner" style={{ display: 'block', margin: '10vh auto' }}></div> : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>User</th>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Email / Phone</th>
                <th style={{ padding: '16px 20px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '16px 20px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                       <Shield size={40} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                       <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>No {config.label} Found</h3>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(u => (
                <tr key={u._id} style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: config.color + '22', color: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {u.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{u.name}</div>
                        {activeTab === 'student' && <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Class: {u.studentClass || 'N/A'}</div>}
                        {activeTab !== 'student' && <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Exp: {u.experience || 'N/A'}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '14px' }}>{u.email}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{u.phone}</div>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', background: u.isActive ? '#dcfce7' : '#fee2e2', color: u.isActive ? '#166534' : '#991b1b' }}>
                      {u.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button onClick={() => openViewUser(u)} className="btn btn-ghost" style={{ padding: '8px', color: '#6366f1' }} title="View">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleToggleStatus(u._id, u.isActive)} className="btn btn-ghost" style={{ padding: '8px', color: u.isActive ? '#f59e0b' : '#22c55e' }} title={u.isActive ? 'Block' : 'Activate'}>
                        {u.isActive ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                      </button>
                      <button onClick={() => handleDelete(u._id)} className="btn btn-ghost" style={{ padding: '8px', color: '#ef4444' }} title="Delete">
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

      {/* Create Modal logic */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 45, 107, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '90%', maxWidth: '600px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '24px', background: config.color, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Add New {config.singular}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {config.fields.map(f => (
                  <div key={f} className="form-group" style={{ gridColumn: (f === 'about') ? 'span 2' : 'auto' }}>
                    <label className="form-label">{fieldLabel(f)}</label>
                    
                    {f === 'studentClass' ? (
                      <select className="form-select" value={form[f] || ''} onChange={e => setForm({ ...form, [f]: e.target.value })} style={{ width: '100%' }}>
                        <option value="">Select Class</option>
                        {['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : f === 'district' ? (
                      <select className="form-select" value={form[f] || ''} onChange={e => setForm({ ...form, [f]: e.target.value })} style={{ width: '100%' }}>
                        <option value="">Select District</option>
                        {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    ) : f === 'qualification' ? (
                      <select className="form-select" value={form[f] || ''} onChange={e => setForm({ ...form, [f]: e.target.value })} style={{ width: '100%' }}>
                        <option value="">Select Qualification</option>
                        {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                      </select>
                    ) : f === 'dob' ? (
                      <input type="date" className="form-input" value={form[f] || ''} onChange={e => setForm({ ...form, [f]: e.target.value })} style={{ width: '100%' }} />
                    ) : (
                      <input type="text" className="form-input" value={form[f] || ''} onChange={e => setForm({ ...form, [f]: e.target.value })} style={{ width: '100%' }} />
                    )}
                  </div>
                ))}
                
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Temporary Password</label>
                  <input type="text" className="form-input" value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} style={{ width: '100%' }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', padding: '24px', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleSave} className="btn btn-primary" style={{ flex: 2, background: config.color, borderColor: config.color }} disabled={saving}>
                {saving ? 'Processing...' : `Create Account`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal logic */}
      {showViewModal && viewUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 45, 107, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card fade-in" style={{ width: '90%', maxWidth: '500px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '24px', background: 'var(--color-bg)', borderBottom: `4px solid ${config.color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: config.color + '22', color: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                  {viewUser.name?.charAt(0)}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{viewUser.name}</h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{viewUser.role}</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>Profile Information</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', fontSize: '14px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Email</span>
                  <span style={{ fontWeight: '500' }}>{viewUser.email}</span>
                  
                  <span style={{ color: 'var(--color-text-secondary)' }}>Phone</span>
                  <span style={{ fontWeight: '500' }}>{viewUser.phone || 'N/A'}</span>
                  
                  <span style={{ color: 'var(--color-text-secondary)' }}>Status</span>
                  <span>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', background: viewUser.isActive ? '#dcfce7' : '#fee2e2', color: viewUser.isActive ? '#166534' : '#991b1b' }}>
                      {viewUser.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </span>
                  
                  {activeTab === 'student' && (
                    <>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Class</span>
                      <span style={{ fontWeight: '500' }}>{viewUser.studentClass || 'N/A'}</span>
                    </>
                  )}
                  {activeTab !== 'student' && (
                    <>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Qualification</span>
                      <span style={{ fontWeight: '500' }}>{viewUser.qualification || 'N/A'}</span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Experience</span>
                      <span style={{ fontWeight: '500' }}>{viewUser.experience || 'N/A'}</span>
                    </>
                  )}
                  
                  <span style={{ color: 'var(--color-text-secondary)' }}>District</span>
                  <span style={{ fontWeight: '500' }}>{viewUser.district || 'N/A'}</span>
                  
                  <span style={{ color: 'var(--color-text-secondary)' }}>Joined On</span>
                  <span style={{ fontWeight: '500' }}>{new Date(viewUser.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {activeTab === 'faculty' && (
                 <div style={{ marginTop: '32px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BookOpen size={16} /> Assignment Configuration
                    </h3>
                    
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                       <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}><strong>1. Direct Instructor Assignment:</strong> Assign an Instructor to verify this faculty's content uploads automatically.</p>
                       
                       {viewUser.assignedInstructor && (
                         <div style={{ marginBottom: '12px', padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', color: '#334155' }}>
                           <strong>Currently Assigned Instructor:</strong> {instructors.find(i => i._id === viewUser.assignedInstructor)?.name || 'Unknown Instructor'}
                         </div>
                       )}

                       <div style={{ display: 'flex', gap: '12px' }}>
                         <select className="form-select" style={{ flex: 1 }} value={selectedInstructor} onChange={e => setSelectedInstructor(e.target.value)}>
                            <option value="">Select Instructor to assign...</option>
                            {instructors.map(inst => (
                              <option key={inst._id} value={inst._id}>{inst.name} ({inst.email})</option>
                            ))}
                         </select>
                         <button onClick={handleAssignInstructor} className="btn btn-primary" style={{ background: config.color, padding: '0 20px', whiteSpace: 'nowrap' }} disabled={assigningInstructor || !selectedInstructor}>
                           {assigningInstructor ? 'Saving...' : 'Assign'}
                         </button>
                       </div>
                    </div>

                    <div className="form-group">
                       <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}><strong>2. Subject Assignments:</strong> Assign subjects to this faculty member so they can upload lessons and grade related assessments.</p>
                       <div style={{ display: 'flex', gap: '12px' }}>
                         <select className="form-select" style={{ flex: 1 }} value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                            <option value="">Select subject to assign...</option>
                            {subjects.map(sub => (
                              <option key={sub._id} value={sub._id}>
                                {sub.name} (Grade: {sub.targetGrade}) {sub.faculty ? '- Assigned' : ''}
                              </option>
                            ))}
                         </select>
                         <button onClick={handleAssignSubject} className="btn btn-primary" style={{ background: config.color, padding: '0 20px', whiteSpace: 'nowrap' }} disabled={assigningSubject || !selectedSubject}>
                           {assigningSubject ? 'Saving...' : 'Assign'}
                         </button>
                       </div>
                    </div>
                 </div>
              )}
            </div>
            <div style={{ padding: '16px 24px', background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
               <button onClick={() => setShowViewModal(false)} className="btn btn-secondary" style={{ width: '100%' }}>Close Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
