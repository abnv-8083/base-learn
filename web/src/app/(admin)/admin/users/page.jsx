"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search, X, User, Mail, School, MapPin, Calendar, Lock, CheckCircle, Phone, Shield, Eye, BookOpen, SortAsc, SortDesc, Filter, ChevronDown, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirmStore } from '@/store/confirmStore';

const ROLE_CONFIG = {
  student:    { label: 'Students',    singular: 'Student',    color: '#6366f1', bg: '#eef2ff', fields: ['name','email','phone','studentClass','district','school','dob'] },
  faculty:    { label: 'Faculty',     singular: 'Faculty',    color: '#10b981', bg: '#ecfdf5', fields: ['name','email','phone','district','qualification','experience'] },
  instructor: { label: 'Instructors', singular: 'Instructor', color: '#f59e0b', bg: '#fffbeb', fields: ['name','email','phone','district','experience','qualification'] },
};

const DISTRICTS = ['Thiruvananthapuram','Kollam','Pathanamthitta','Alappuzha','Kottayam','Idukki','Ernakulam','Thrissur','Palakkad','Malappuram','Kozhikode','Wayanad','Kannur','Kasaragod'];
const QUALIFICATIONS = ['B.Ed','M.Ed','PhD','MSc','BSc','M.A','B.A','B.Tech','M.Tech','Other'];

// ── Reusable styled input ──────────────────────────────────
function FormField({ label, required, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: error ? '#dc2626' : '#64748b' }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
      {error && (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#dc2626', fontWeight: '600' }}>
          <AlertCircle size={11} /> {error}
        </span>
      )}
    </div>
  );
}

function StyledInput({ value, onChange, placeholder, type = 'text', error, onBlur, readOnly }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={() => setFocused(true)}
      placeholder={placeholder}
      readOnly={readOnly}
      style={{
        width: '100%', padding: '10px 14px',
        border: `1.5px solid ${error ? '#ef4444' : focused ? '#6366f1' : '#e2e8f0'}`,
        borderRadius: '10px', fontSize: '14px', fontWeight: '500', color: '#1e293b',
        outline: 'none', transition: 'all 0.2s', background: readOnly ? '#f8fafc' : 'white',
        boxShadow: error ? '0 0 0 3px rgba(239,68,68,0.1)' : focused ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
      }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => setFocused(false)}
    />
  );
}

function StyledSelect({ value, onChange, children, error, onBlur }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={() => setFocused(true)}
      style={{
        width: '100%', padding: '10px 14px',
        border: `1.5px solid ${error ? '#ef4444' : focused ? '#6366f1' : '#e2e8f0'}`,
        borderRadius: '10px', fontSize: '14px', fontWeight: '500', color: '#1e293b',
        outline: 'none', transition: 'all 0.2s', background: 'white', cursor: 'pointer',
        boxShadow: error ? '0 0 0 3px rgba(239,68,68,0.1)' : focused ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
      }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => setFocused(false)}
    >
      {children}
    </select>
  );
}

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState('student');
  const config = ROLE_CONFIG[activeTab];
  const confirm = useConfirmStore(s => s.confirm);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');  // 'all' | 'active' | 'blocked'
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [subjects, setSubjects] = useState([]);

  // View Modal
  const [viewUser, setViewUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewSubjects, setViewSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [assigningSubject, setAssigningSubject] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [assigningInstructor, setAssigningInstructor] = useState(false);

  useEffect(() => { fetchUsers(); }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/admin/users?role=${activeTab}`);
      setUsers(Array.isArray(data.data) ? data.data : []);
    } catch {
      setUsers([]);
      toast.error(`Failed to load ${config.label}`);
    } finally { setLoading(false); }
  };

  const fetchSubjects = async () => {
    try {
      const { data } = await axios.get('/api/admin/subjects');
      setSubjects(data.data || []);
    } catch {}
  };

  // Filtering & sorting pipeline
  const processed = users
    .filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q);
      const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? u.isActive : !u.isActive);
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const va = (a[sortField] || '').toString().toLowerCase();
      const vb = (b[sortField] || '').toString().toLowerCase();
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const openCreate = () => {
    const empty = {};
    config.fields.forEach(f => empty[f] = '');
    empty.password = '';
    if (activeTab === 'faculty') empty.subject = '';
    setForm(empty);
    setErrors({});
    if (activeTab === 'faculty') fetchSubjects();
    setShowModal(true);
  };

  // ── Inline validation ──────────────────────────────────────
  const validateField = (field, value) => {
    let err = null;
    if (field === 'name') {
      if (!value?.trim()) err = 'Full name is required';
      else if (value.trim().length < 2) err = 'Name must be at least 2 characters';
      else if (/[^a-zA-Z\s'.\-]/.test(value)) err = 'Name can only contain letters and spaces';
    }
    if (field === 'email') {
      if (!value?.trim()) err = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) err = 'Enter a valid email address';
    }
    if (field === 'phone' && value) {
      if (!/^\+?[\d\s\-(]{7,15}$/.test(value)) err = 'Enter a valid phone number';
    }
    if (field === 'password') {
      if (!value?.trim()) err = 'Temporary password is required';
      else if (value.length < 6) err = 'Minimum 6 characters required';
    }
    if (field === 'dob' && value) {
      const age = (Date.now() - new Date(value)) / (365.25 * 24 * 3600 * 1000);
      if (age < 8 || age > 80) err = 'Please enter a valid date of birth';
    }
    setErrors(prev => ({ ...prev, [field]: err }));
    return !err;
  };

  const handleSave = async () => {
    // Validate required fields
    const requiredFields = ['name', 'email', 'password'];
    let valid = true;
    const newErrors = {};
    requiredFields.forEach(f => {
      let err = null;
      const v = form[f];
      if (f === 'name') {
        if (!v?.trim()) err = 'Full name is required';
        else if (v.trim().length < 2) err = 'Name must be at least 2 characters';
      }
      if (f === 'email') {
        if (!v?.trim()) err = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) err = 'Enter a valid email address';
      }
      if (f === 'password') {
        if (!v?.trim()) err = 'Temporary password is required';
        else if (v.length < 6) err = 'Minimum 6 characters required';
      }
      if (err) { newErrors[f] = err; valid = false; }
    });
    if (form.phone) {
      if (!/^\+?[\d\s\-(]{7,15}$/.test(form.phone)) { newErrors.phone = 'Enter a valid phone number'; valid = false; }
    }
    setErrors(newErrors);
    if (!valid) { toast.error('Please fix the highlighted errors'); return; }

    setSaving(true);
    try {
      const payload = { ...form, role: activeTab };
      await axios.post('/api/admin/users', payload);
      toast.success(`${config.singular} created successfully`);
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally { setSaving(false); }
  };

  const openViewUser = async (u) => {
    setViewUser(u); setShowViewModal(true);
    if (activeTab === 'faculty') {
      try {
        const { data } = await axios.get('/api/admin/subjects');
        setViewSubjects(data.data || []);
      } catch {}
      try {
        const { data } = await axios.get('/api/admin/users?role=instructor');
        setInstructors(data.data || []);
      } catch {}
    }
  };

  const handleAssignSubject = async () => {
    if (!selectedSubject) return toast.error('Select a subject first');
    setAssigningSubject(true);
    try {
      await axios.put(`/api/admin/subjects/${selectedSubject}`, { facultyId: viewUser._id });
      toast.success('Subject assigned'); setSelectedSubject(''); fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setAssigningSubject(false); }
  };

  const handleAssignInstructor = async () => {
    if (!selectedInstructor) return toast.error('Select an instructor first');
    if (viewUser.assignedInstructors?.includes(selectedInstructor)) return toast.error('Instructor already assigned');
    
    setAssigningInstructor(true);
    try {
      const updatedInstructors = [...(viewUser.assignedInstructors || []), selectedInstructor];
      await axios.put(`/api/admin/users/${viewUser._id}`, { role: 'faculty', assignedInstructors: updatedInstructors });
      toast.success('Instructor assigned'); setSelectedInstructor(''); fetchUsers();
      setViewUser({ ...viewUser, assignedInstructors: updatedInstructors });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setAssigningInstructor(false); }
  };

  const handleRemoveInstructor = async (instructorId) => {
    confirm({
      title: 'Remove Instructor?',
      message: 'This will revoke this instructor\'s oversight of this faculty.',
      confirmText: 'Yes, Remove', type: 'danger',
      onConfirm: async () => {
        try {
          const updatedInstructors = viewUser.assignedInstructors.filter(id => id !== instructorId);
          await axios.put(`/api/admin/users/${viewUser._id}`, { role: 'faculty', assignedInstructors: updatedInstructors });
          toast.success('Instructor removed');
          setViewUser({ ...viewUser, assignedInstructors: updatedInstructors });
          fetchUsers();
        } catch { toast.error('Failed to remove instructor'); }
      }
    });
  };

  const handleToggleStatus = async (id, current) => {
    try {
      await axios.patch(`/api/admin/users/${id}/status`, { isActive: !current });
      toast.success(current ? 'User blocked' : 'User activated');
      fetchUsers();
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Delete User Account?',
      message: `Are you sure you want to permanently delete this ${config.singular.toLowerCase()}? This action cannot be undone.`,
      confirmText: 'Delete Permanently', type: 'danger', icon: Trash2,
      onConfirm: async () => {
        try {
          await axios.delete(`/api/admin/users/${id}`);
          toast.success('User deleted'); fetchUsers();
        } catch { toast.error('Failed to delete user'); }
      }
    });
  };

  const fieldLabel = f => f.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

  const SortBtn = ({ field, label }) => (
    <button onClick={() => toggleSort(field)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: sortField === field ? config.color : 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '4px 0' }}>
      {label}
      {sortField === field ? (sortDir === 'asc' ? <SortAsc size={13} /> : <SortDesc size={13} />) : <SortAsc size={13} style={{ opacity: 0.3 }} />}
    </button>
  );

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Provision and oversee platform accounts.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: config.color, border: 'none', borderRadius: '12px', padding: '12px 20px', fontWeight: '700', fontSize: '14px', color: 'white', cursor: 'pointer', boxShadow: `0 4px 12px ${config.color}40` }}>
          <Plus size={18} /> Add {config.singular}
        </button>
      </div>

      {/* ── Role tabs ── */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'white', padding: '6px', borderRadius: '14px', border: '1px solid var(--color-border)', width: 'fit-content', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {Object.keys(ROLE_CONFIG).map(roleKey => (
          <button key={roleKey}
            onClick={() => { setActiveTab(roleKey); setSearch(''); setStatusFilter('all'); }}
            style={{ padding: '9px 22px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s', background: activeTab === roleKey ? ROLE_CONFIG[roleKey].color : 'transparent', color: activeTab === roleKey ? 'white' : 'var(--color-text-secondary)', boxShadow: activeTab === roleKey ? `0 4px 12px ${ROLE_CONFIG[roleKey].color}40` : 'none' }}>
            {ROLE_CONFIG[roleKey].label}
          </button>
        ))}
      </div>

      {/* ── Search + Filter bar ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '360px' }}>
          <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${config.label} by name, email…`}
            style={{ width: '100%', padding: '11px 14px 11px 40px', borderRadius: '12px', border: '1.5px solid var(--color-border)', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', background: 'white' }}
            onFocus={e => e.target.style.borderColor = config.color}
            onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
        </div>

        {/* Status filter pills */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[['all','All'], ['active','Active'], ['blocked','Blocked']].map(([val, lbl]) => (
            <button key={val} onClick={() => setStatusFilter(val)}
              style={{ padding: '8px 14px', borderRadius: '20px', border: `1.5px solid ${statusFilter === val ? config.color : 'var(--color-border)'}`, background: statusFilter === val ? config.color : 'white', color: statusFilter === val ? 'white' : 'var(--color-text-secondary)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>
              {lbl}
            </button>
          ))}
        </div>

        {/* Sort quick buttons */}
        <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto', background: 'white', padding: '6px 12px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', alignSelf: 'center', marginRight: '4px' }}>Sort:</span>
          <SortBtn field="name" label="Name" />
          <SortBtn field="email" label="Email" />
          <SortBtn field="createdAt" label="Date" />
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? <div className="spinner" style={{ display: 'block', margin: '10vh auto' }} /> : (
        <div className="card" style={{ overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,45,107,0.08)' }}>
          <div style={{ padding: '14px 20px', background: 'white', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '500' }}>
              Showing <strong>{processed.length}</strong> of <strong>{users.length}</strong> {config.label.toLowerCase()}
            </span>
            {(search || statusFilter !== 'all') && (
              <button onClick={() => { setSearch(''); setStatusFilter('all'); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#ef4444', background: '#fef2f2', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: '600' }}>
                <X size={12} /> Clear Filters
              </button>
            )}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: '700' }}>User</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: '700' }}>Contact</th>
                <th style={{ padding: '14px 20px', textAlign: 'center', fontWeight: '700' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'center', fontWeight: '700' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {processed.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                      <Shield size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                      <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>No {config.label} Found</h3>
                      <p style={{ fontSize: '14px' }}>Try adjusting your search or filter settings.</p>
                    </div>
                  </td>
                </tr>
              ) : processed.map(u => (
                <tr key={u._id} style={{ borderTop: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = config.bg}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: config.color + '20', color: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px', flexShrink: 0 }}>
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--color-text-primary)', fontSize: '14px' }}>{u.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {activeTab === 'student' ? `Class: ${u.studentClass || 'N/A'}` : `Exp: ${u.experience || 'N/A'}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: '500' }}>{u.email}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{u.phone || '—'}</div>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: u.isActive ? '#dcfce7' : '#fee2e2', color: u.isActive ? '#15803d' : '#b91c1c', letterSpacing: '0.04em' }}>
                      {u.isActive ? '● Active' : '● Blocked'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                      <button onClick={() => openViewUser(u)} title="View Profile"
                        style={{ width: '34px', height: '34px', borderRadius: '8px', border: 'none', background: '#ede9fe', color: '#7c3aed', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                        <Eye size={15} />
                      </button>
                      <button onClick={() => handleToggleStatus(u._id, u.isActive)} title={u.isActive ? 'Block' : 'Activate'}
                        style={{ width: '34px', height: '34px', borderRadius: '8px', border: 'none', background: u.isActive ? '#fef3c7' : '#dcfce7', color: u.isActive ? '#d97706' : '#15803d', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                        {u.isActive ? <ToggleLeft size={15} /> : <ToggleRight size={15} />}
                      </button>
                      <button onClick={() => handleDelete(u._id)} title="Delete"
                        style={{ width: '34px', height: '34px', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,50,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '620px', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            {/* Modal header */}
            <div style={{ padding: '22px 28px', background: `linear-gradient(135deg, ${config.color}cc, ${config.color})`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'white' }}>Add New {config.singular}</h2>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>Fill in all required fields to create the account</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                {config.fields.map(f => (
                  <div key={f} style={{ gridColumn: f === 'about' ? 'span 2' : 'auto' }}>
                    <FormField label={fieldLabel(f)} required={['name','email'].includes(f)} error={errors[f]}>
                      {f === 'studentClass' ? (
                        <StyledSelect value={form[f] || ''} onChange={e => { setForm({...form,[f]:e.target.value}); }} error={errors[f]}>
                          <option value="">Select Class</option>
                          {['Class 8','Class 9','Class 10','Class 11','Class 12'].map(c => <option key={c} value={c}>{c}</option>)}
                        </StyledSelect>
                      ) : f === 'district' ? (
                        <StyledSelect value={form[f] || ''} onChange={e => setForm({...form,[f]:e.target.value})} error={errors[f]}>
                          <option value="">Select District</option>
                          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </StyledSelect>
                      ) : f === 'qualification' ? (
                        <StyledSelect value={form[f] || ''} onChange={e => setForm({...form,[f]:e.target.value})} error={errors[f]}>
                          <option value="">Select Qualification</option>
                          {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                        </StyledSelect>
                      ) : f === 'dob' ? (
                        <StyledInput type="date" value={form[f] || ''} onChange={e => setForm({...form,[f]:e.target.value})} error={errors[f]}
                          onBlur={() => validateField(f, form[f])} />
                      ) : (
                        <StyledInput value={form[f] || ''} onChange={e => { setForm({...form,[f]:e.target.value}); if (errors[f]) validateField(f, e.target.value); }}
                          error={errors[f]} onBlur={() => validateField(f, form[f])} placeholder={f === 'phone' ? '+91 9876543210' : ''} />
                      )}
                    </FormField>
                  </div>
                ))}

                {/* Password field */}
                <div style={{ gridColumn: 'span 2' }}>
                  <FormField label="Temporary Password" required error={errors.password}>
                    <StyledInput type="text" value={form.password || ''}
                      onChange={e => { setForm({...form, password: e.target.value}); if (errors.password) validateField('password', e.target.value); }}
                      error={errors.password} onBlur={() => validateField('password', form.password)}
                      placeholder="Min. 6 characters" />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div style={{ padding: '18px 28px', background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '12px', background: config.color, border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: `0 4px 14px ${config.color}50` }}>
                <CheckCircle size={16} /> {saving ? 'Creating...' : `Create ${config.singular}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View + Assignment Modal ── */}
      {showViewModal && viewUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,50,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '520px', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '22px 28px', borderBottom: `4px solid ${config.color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: config.color + '20', color: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '800' }}>
                  {viewUser.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{viewUser.name}</h2>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'capitalize', fontWeight: '600' }}>{viewUser.role}</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gap: '0', background: 'var(--color-bg)', borderRadius: '12px', overflow: 'hidden' }}>
                {[
                  ['Email', viewUser.email],
                  ['Phone', viewUser.phone || '—'],
                  ['District', viewUser.district || '—'],
                  ['Status', viewUser.isActive ? '✓ Active' : '✗ Blocked'],
                  ...(activeTab === 'student' ? [['Class', viewUser.studentClass || '—']] : [
                    ['Qualification', viewUser.qualification || '—'],
                    ['Experience', viewUser.experience || '—'],
                  ]),
                  ['Joined', new Date(viewUser.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })],
                ].map(([k, v], i) => (
                  <div key={k} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', padding: '12px 16px', background: i % 2 === 0 ? 'white' : 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', alignSelf: 'center' }}>{k}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)' }}>{v}</span>
                  </div>
                ))}
              </div>

              {activeTab === 'faculty' && (
                <div style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={13} /> Assignment Configuration
                  </h3>

                  <div style={{ background: 'var(--color-bg)', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>Current Assigned Instructors</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      {viewUser.assignedInstructors && viewUser.assignedInstructors.length > 0 ? (
                        viewUser.assignedInstructors.map(id => {
                          const inst = instructors.find(i => i._id === id);
                          return (
                            <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'white', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' }}>
                                  {inst?.name?.[0]}
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: '600' }}>{inst?.name || 'Loading...'}</span>
                              </div>
                              <button onClick={() => handleRemoveInstructor(id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Remove">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '10px' }}>No instructors assigned yet.</div>
                      )}
                    </div>

                    <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>Add New Instructor</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <StyledSelect value={selectedInstructor} onChange={e => setSelectedInstructor(e.target.value)}>
                        <option value="">Select Instructor…</option>
                        {instructors.filter(inst => !viewUser.assignedInstructors?.includes(inst._id)).map(inst => (
                          <option key={inst._id} value={inst._id}>{inst.name} ({inst.email})</option>
                        ))}
                      </StyledSelect>
                      <button onClick={handleAssignInstructor} disabled={!selectedInstructor || assigningInstructor}
                        style={{ padding: '10px 18px', background: config.color, border: 'none', borderRadius: '10px', color: 'white', fontWeight: '700', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', opacity: !selectedInstructor ? 0.5 : 1 }}>
                        {assigningInstructor ? '...' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '16px 28px', background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)' }}>
              <button onClick={() => setShowViewModal(false)} className="btn btn-secondary" style={{ width: '100%' }}>Close Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
