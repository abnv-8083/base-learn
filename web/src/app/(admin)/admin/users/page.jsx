"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search, X,
  User, Mail, School, MapPin, Calendar, Lock, CheckCircle, Phone,
  Shield, Eye, BookOpen, SortAsc, SortDesc, Filter, ChevronDown,
  AlertCircle, Users, GraduationCap, UserCheck, TrendingUp, Layers,
  MoreVertical, Sparkles, Download, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirmStore } from '@/store/confirmStore';

const ROLE_CONFIG = {
  student:    { label: 'Students',    singular: 'Student',    color: '#6366f1', grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)', bg: '#eef2ff', light: 'rgba(99,102,241,0.08)', icon: GraduationCap, fields: ['name','email','phone','studentClass','district','school','dob'] },
  faculty:    { label: 'Faculty',     singular: 'Faculty',    color: '#10b981', grad: 'linear-gradient(135deg,#10b981,#059669)', bg: '#ecfdf5', light: 'rgba(16,185,129,0.08)', icon: UserCheck, fields: ['name','email','phone','district','qualification','experience'] },
  instructor: { label: 'Instructors', singular: 'Instructor', color: '#f59e0b', grad: 'linear-gradient(135deg,#f59e0b,#d97706)', bg: '#fffbeb', light: 'rgba(245,158,11,0.08)', icon: Shield, fields: ['name','email','phone','district','experience','qualification'] },
};

const DISTRICTS = ['Thiruvananthapuram','Kollam','Pathanamthitta','Alappuzha','Kottayam','Idukki','Ernakulam','Thrissur','Palakkad','Malappuram','Kozhikode','Wayanad','Kannur','Kasaragod'];
const QUALIFICATIONS = ['B.Ed','M.Ed','PhD','MSc','BSc','M.A','B.A','B.Tech','M.Tech','Other'];

// ── Avatar Component ───────────────────────────────────────
function Avatar({ name, color, size = 42 }) {
  const initials = name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: `${color}20`, color, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontWeight: '800', fontSize: size * 0.38,
      flexShrink: 0, border: `1.5px solid ${color}30`, letterSpacing: '-0.02em'
    }}>{initials}</div>
  );
}

// ── Stat Card ──────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div style={{ background: 'white', borderRadius: '20px', padding: '22px 24px', border: '1px solid #e8edf5', boxShadow: '0 2px 12px rgba(15,23,42,0.05)', display: 'flex', gap: '16px', alignItems: 'center', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 28px ${color}20`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(15,23,42,0.05)'; }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color, borderRadius: '20px 20px 0 0' }} />
      <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', lineHeight: 1, letterSpacing: '-0.03em' }}>{value}</div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginTop: '4px' }}>{label}</div>
        {sub && <div style={{ fontSize: '11px', color: color, fontWeight: '700', marginTop: '2px' }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Form Components ────────────────────────────────────────
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
    <input type={type} value={value} onChange={onChange} onBlur={onBlur}
      onFocus={() => setFocused(true)} placeholder={placeholder} readOnly={readOnly}
      style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${error ? '#ef4444' : focused ? '#6366f1' : '#e2e8f0'}`, borderRadius: '10px', fontSize: '14px', fontWeight: '500', color: '#1e293b', outline: 'none', transition: 'all 0.2s', background: readOnly ? '#f8fafc' : 'white', boxShadow: error ? '0 0 0 3px rgba(239,68,68,0.1)' : focused ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none' }}
      onFocusCapture={() => setFocused(true)} onBlurCapture={() => setFocused(false)} />
  );
}

function StyledSelect({ value, onChange, children, error, onBlur }) {
  const [focused, setFocused] = useState(false);
  return (
    <select value={value} onChange={onChange} onBlur={onBlur} onFocus={() => setFocused(true)}
      style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${error ? '#ef4444' : focused ? '#6366f1' : '#e2e8f0'}`, borderRadius: '10px', fontSize: '14px', fontWeight: '500', color: '#1e293b', outline: 'none', transition: 'all 0.2s', background: 'white', cursor: 'pointer', boxShadow: error ? '0 0 0 3px rgba(239,68,68,0.1)' : focused ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none' }}
      onFocusCapture={() => setFocused(true)} onBlurCapture={() => setFocused(false)}>
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [subjects, setSubjects] = useState([]);

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
    setIsEditing(false); setEditingUserId(null);
    const empty = {};
    config.fields.forEach(f => empty[f] = '');
    empty.password = '';
    if (activeTab === 'faculty') empty.subject = '';
    setForm(empty); setErrors({});
    if (activeTab === 'faculty') fetchSubjects();
    setShowModal(true);
  };

  const openEdit = (u) => {
    setIsEditing(true); setEditingUserId(u._id);
    const data = { ...u };
    delete data.password;
    setForm(data); setErrors({});
    if (activeTab === 'faculty') fetchSubjects();
    setShowModal(true);
  };

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
    const requiredFields = isEditing ? ['name', 'email'] : ['name', 'email', 'password'];
    let valid = true;
    const newErrors = {};
    requiredFields.forEach(f => {
      let err = null;
      const v = form[f];
      if (f === 'name') { if (!v?.trim()) err = 'Full name is required'; else if (v.trim().length < 2) err = 'Name must be at least 2 characters'; }
      if (f === 'email') { if (!v?.trim()) err = 'Email is required'; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) err = 'Enter a valid email address'; }
      if (f === 'password') { if (!v?.trim()) err = 'Temporary password is required'; else if (v.length < 6) err = 'Minimum 6 characters required'; }
      if (err) { newErrors[f] = err; valid = false; }
    });
    if (form.phone) { if (!/^\+?[\d\s\-(]{7,15}$/.test(form.phone)) { newErrors.phone = 'Enter a valid phone number'; valid = false; } }
    setErrors(newErrors);
    if (!valid) { toast.error('Please fix the highlighted errors'); return; }
    setSaving(true);
    try {
      const payload = { ...form, role: activeTab };
      if (isEditing) { await axios.put(`/api/admin/users/${editingUserId}`, payload); toast.success(`${config.singular} updated successfully`); }
      else { await axios.post('/api/admin/users', payload); toast.success(`${config.singular} created successfully`); }
      setShowModal(false); fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} user`); }
    finally { setSaving(false); }
  };

  const openViewUser = async (u) => {
    setViewUser(u); setShowViewModal(true);
    if (activeTab === 'faculty') {
      try { const { data } = await axios.get('/api/admin/subjects'); setViewSubjects(data.data || []); } catch {}
      try { const { data } = await axios.get('/api/admin/users?role=instructor'); setInstructors(data.data || []); } catch {}
    }
  };

  const handleAssignSubject = async () => {
    if (!selectedSubject) return toast.error('Select a subject first');
    setAssigningSubject(true);
    try { await axios.put(`/api/admin/subjects/${selectedSubject}`, { facultyId: viewUser._id }); toast.success('Subject assigned'); setSelectedSubject(''); fetchUsers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
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
    confirm({ title: 'Remove Instructor?', message: 'This will revoke this instructor\'s oversight of this faculty.', confirmText: 'Yes, Remove', type: 'danger',
      onConfirm: async () => {
        try {
          const updatedInstructors = viewUser.assignedInstructors.filter(id => id !== instructorId);
          await axios.put(`/api/admin/users/${viewUser._id}`, { role: 'faculty', assignedInstructors: updatedInstructors });
          toast.success('Instructor removed'); setViewUser({ ...viewUser, assignedInstructors: updatedInstructors }); fetchUsers();
        } catch { toast.error('Failed to remove instructor'); }
      }
    });
  };

  const handleToggleStatus = async (id, current) => {
    try { await axios.patch(`/api/admin/users/${id}/status`, { isActive: !current }); toast.success(current ? 'User blocked' : 'User activated'); fetchUsers(); }
    catch { toast.error('Failed to update status'); }
  };

  const handleDelete = (id) => {
    confirm({ title: 'Delete User Account?', message: `Are you sure you want to permanently delete this ${config.singular.toLowerCase()}? This action cannot be undone.`, confirmText: 'Delete Permanently', type: 'danger', icon: Trash2,
      onConfirm: async () => {
        try { await axios.delete(`/api/admin/users/${id}`); toast.success('User deleted'); fetchUsers(); }
        catch { toast.error('Failed to delete user'); }
      }
    });
  };

  const fieldLabel = f => f.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
  const activeCount = users.filter(u => u.isActive).length;
  const blockedCount = users.filter(u => !u.isActive).length;
  const TabIcon = config.icon;

  return (
    <div style={{ paddingBottom: '60px' }}>

      {/* ── Premium Hero Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)', borderRadius: '28px', padding: '36px 40px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: `radial-gradient(circle, ${config.color}25 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '10%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${config.color}20`, border: `1px solid ${config.color}40`, padding: '6px 14px', borderRadius: '99px', marginBottom: '14px' }}>
              <Sparkles size={13} color={config.color} />
              <span style={{ fontSize: '12px', fontWeight: '700', color: config.color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>User Management</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', color: 'white', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
              {config.label} Roster
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: '15px', color: 'rgba(148,163,184,0.9)', fontWeight: '400' }}>
              Manage and provision all {config.label.toLowerCase()} on the platform.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={fetchUsers} title="Refresh" style={{ width: '42px', height: '42px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}>
              <RefreshCw size={16} />
            </button>
            <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: config.grad, border: 'none', borderRadius: '14px', padding: '12px 22px', fontWeight: '800', fontSize: '14px', color: 'white', cursor: 'pointer', boxShadow: `0 6px 20px ${config.color}50`, transition: 'all 0.2s, transform 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 10px 28px ${config.color}60`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 6px 20px ${config.color}50`; }}>
              <Plus size={18} /> Add {config.singular}
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatCard label={`Total ${config.label}`} value={users.length} icon={config.icon} color={config.color} sub={`All registered ${config.label.toLowerCase()}`} />
        <StatCard label="Active Accounts" value={activeCount} icon={CheckCircle} color="#10b981" sub="Currently enabled" />
        <StatCard label="Blocked Accounts" value={blockedCount} icon={Shield} color="#ef4444" sub="Access restricted" />
        <StatCard label="Showing Now" value={processed.length} icon={Filter} color="#8b5cf6" sub={search ? `Matching "${search}"` : 'All results'} />
      </div>

      {/* ── Role Tabs ── */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'white', padding: '5px', borderRadius: '16px', border: '1px solid #e8edf5', width: 'fit-content', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        {Object.entries(ROLE_CONFIG).map(([roleKey, rc]) => {
          const RoleIcon = rc.icon;
          const isActive = activeTab === roleKey;
          return (
            <button key={roleKey} onClick={() => { setActiveTab(roleKey); setSearch(''); setStatusFilter('all'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700', transition: 'all 0.2s', background: isActive ? rc.grad : 'transparent', color: isActive ? 'white' : '#64748b', boxShadow: isActive ? `0 4px 14px ${rc.color}40` : 'none' }}>
              <RoleIcon size={16} />
              {rc.label}
            </button>
          );
        })}
      </div>

      {/* ── Search + Filter Controls ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '380px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${config.label} by name, email…`}
            style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '14px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', transition: 'all 0.2s', background: 'white', color: '#1e293b', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}
            onFocus={e => { e.target.style.borderColor = config.color; e.target.style.boxShadow = `0 0 0 3px ${config.color}20`; }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)'; }} />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: '2px' }}>
              <X size={15} />
            </button>
          )}
        </div>

        {/* Status pills */}
        <div style={{ display: 'flex', gap: '6px', background: 'white', padding: '5px', borderRadius: '12px', border: '1px solid #e8edf5' }}>
          {[['all','All'], ['active','Active'], ['blocked','Blocked']].map(([val, lbl]) => (
            <button key={val} onClick={() => setStatusFilter(val)}
              style={{ padding: '7px 16px', borderRadius: '9px', border: 'none', background: statusFilter === val ? (val === 'blocked' ? '#fee2e2' : val === 'active' ? '#dcfce7' : config.color) : 'transparent', color: statusFilter === val ? (val === 'blocked' ? '#b91c1c' : val === 'active' ? '#15803d' : 'white') : '#64748b', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s' }}>
              {lbl}
            </button>
          ))}
        </div>

        {/* Sort buttons */}
        <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '5px', borderRadius: '12px', border: '1px solid #e8edf5', marginLeft: 'auto' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', alignSelf: 'center', paddingLeft: '8px', fontWeight: '600' }}>Sort:</span>
          {[['name','Name'],['email','Email'],['createdAt','Date']].map(([field, label]) => (
            <button key={field} onClick={() => toggleSort(field)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 12px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', transition: 'all 0.2s', background: sortField === field ? `${config.color}15` : 'transparent', color: sortField === field ? config.color : '#94a3b8' }}>
              {label}
              {sortField === field ? (sortDir === 'asc' ? <SortAsc size={13} /> : <SortDesc size={13} />) : <SortAsc size={13} style={{ opacity: 0.25 }} />}
            </button>
          ))}
        </div>
      </div>

      {/* ── Users Table ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '100px 0' }}>
          <div className="spinner" style={{ width: '48px', height: '48px', border: `3px solid ${config.color}20`, borderTopColor: config.color, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#94a3b8', fontWeight: '600', fontSize: '14px' }}>Loading {config.label}…</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e8edf5', boxShadow: '0 4px 20px rgba(15,23,42,0.07)', overflow: 'hidden' }}>
          {/* Table header bar */}
          <div style={{ padding: '16px 24px', background: 'linear-gradient(to right, #f8fafc, #f1f5f9)', borderBottom: '1px solid #e8edf5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: config.color, boxShadow: `0 0 6px ${config.color}` }} />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                <span style={{ color: config.color, fontSize: '15px', fontWeight: '900' }}>{processed.length}</span>
                <span style={{ color: '#94a3b8' }}> / {users.length}</span> {config.label}
              </span>
            </div>
            {(search || statusFilter !== 'all') && (
              <button onClick={() => { setSearch(''); setStatusFilter('all'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '9px', padding: '6px 12px', cursor: 'pointer', fontWeight: '700' }}>
                <X size={12} /> Clear Filters
              </button>
            )}
          </div>

          {processed.length === 0 ? (
            <div style={{ padding: '80px 40px', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <TabIcon size={40} color="#cbd5e1" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>No {config.label} Found</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '300px', margin: '0 auto' }}>Try adjusting your filters or create a new {config.singular.toLowerCase()}.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['User', 'Contact & Location', 'Status', 'Joined', 'Actions'].map((h, i) => (
                    <th key={h} style={{ padding: '13px 24px', textAlign: i >= 2 ? 'center' : 'left', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #e8edf5' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {processed.map((u, idx) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s', cursor: 'default' }}
                    onMouseEnter={e => e.currentTarget.style.background = config.light}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    
                    {/* User column */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <Avatar name={u.name} color={config.color} size={44} />
                        <div>
                          <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px', letterSpacing: '-0.01em' }}>{u.name}</div>
                          <div style={{ fontSize: '11px', color: config.color, fontWeight: '700', marginTop: '2px', background: `${config.color}12`, padding: '2px 8px', borderRadius: '6px', display: 'inline-block' }}>
                            {activeTab === 'student' ? (u.studentClass || 'No Class') : (u.experience ? `${u.experience} exp.` : config.singular)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact column */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: '600' }}>
                          <Mail size={12} color="#94a3b8" /> {u.email}
                        </div>
                        {u.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                            <Phone size={11} color="#cbd5e1" /> {u.phone}
                          </div>
                        )}
                        {u.district && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
                            <MapPin size={11} color="#cbd5e1" /> {u.district}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status column */}
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '99px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.04em', background: u.isActive ? '#dcfce7' : '#fee2e2', color: u.isActive ? '#15803d' : '#b91c1c', border: `1px solid ${u.isActive ? '#bbf7d0' : '#fecaca'}` }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.isActive ? '#22c55e' : '#ef4444', flexShrink: 0 }} />
                        {u.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>

                    {/* Joined date */}
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>

                    {/* Actions column */}
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                        <ActionBtn onClick={() => openViewUser(u)} title="View Profile" bg="#ede9fe" color="#7c3aed" icon={Eye} />
                        <ActionBtn onClick={() => openEdit(u)} title="Edit User" bg="#ecfdf5" color="#059669" icon={Pencil} />
                        <ActionBtn onClick={() => handleToggleStatus(u._id, u.isActive)} title={u.isActive ? 'Block User' : 'Activate User'} bg={u.isActive ? '#fef3c7' : '#dcfce7'} color={u.isActive ? '#d97706' : '#15803d'} icon={u.isActive ? ToggleLeft : ToggleRight} />
                        <ActionBtn onClick={() => handleDelete(u._id)} title="Delete User" bg="#fee2e2" color="#dc2626" icon={Trash2} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,50,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '640px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '24px 28px', background: config.grad, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: 'white', letterSpacing: '-0.02em' }}>{isEditing ? 'Edit' : 'New'} {config.singular}</h2>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>{isEditing ? 'Modify the account information below' : 'Fill in all required fields to create a new account'}</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}>
                <X size={17} />
              </button>
            </div>
            <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                {config.fields.map(f => (
                  <div key={f} style={{ gridColumn: f === 'about' ? 'span 2' : 'auto' }}>
                    <FormField label={fieldLabel(f)} required={['name','email'].includes(f)} error={errors[f]}>
                      {f === 'studentClass' ? (
                        <StyledSelect value={form[f] || ''} onChange={e => setForm({...form,[f]:e.target.value})} error={errors[f]}>
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
                        <StyledInput type="date" value={form[f] || ''} onChange={e => setForm({...form,[f]:e.target.value})} error={errors[f]} onBlur={() => validateField(f, form[f])} />
                      ) : (
                        <StyledInput value={form[f] || ''} onChange={e => { setForm({...form,[f]:e.target.value}); if (errors[f]) validateField(f, e.target.value); }} error={errors[f]} onBlur={() => validateField(f, form[f])} placeholder={f === 'phone' ? '+91 9876543210' : ''} />
                      )}
                    </FormField>
                  </div>
                ))}
                <div style={{ gridColumn: 'span 2' }}>
                  <FormField label="Temporary Password" required error={errors.password}>
                    <StyledInput type="text" value={form.password || ''} onChange={e => { setForm({...form, password: e.target.value}); if (errors.password) validateField('password', e.target.value); }} error={errors.password} onBlur={() => validateField('password', form.password)} placeholder="Min. 6 characters" />
                  </FormField>
                </div>
              </div>
            </div>
            <div style={{ padding: '20px 28px', background: '#f8fafc', borderTop: '1px solid #e8edf5', display: 'flex', gap: '12px', flexShrink: 0 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '13px', background: config.grad, border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '800', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.75 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: `0 4px 16px ${config.color}45`, transition: 'all 0.2s' }}>
                <CheckCircle size={16} /> {saving ? (isEditing ? 'Updating…' : 'Creating…') : `${isEditing ? 'Update' : 'Create'} ${config.singular}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Profile Modal ── */}
      {showViewModal && viewUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,50,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '540px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '24px 28px', borderBottom: `3px solid ${config.color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Avatar name={viewUser.name} color={config.color} size={52} />
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em' }}>{viewUser.name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: config.color, background: `${config.color}15`, padding: '3px 10px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{viewUser.role}</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '99px', background: viewUser.isActive ? '#dcfce7' : '#fee2e2', color: viewUser.isActive ? '#15803d' : '#b91c1c' }}>
                      {viewUser.isActive ? '● Active' : '● Blocked'}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e8edf5' }}>
                {[
                  ['Email', viewUser.email, Mail],
                  ['Phone', viewUser.phone || '—', Phone],
                  ['District', viewUser.district || '—', MapPin],
                  ...(activeTab === 'student' ? [['Class', viewUser.studentClass || '—', GraduationCap]] : [
                    ['Qualification', viewUser.qualification || '—', BookOpen],
                    ['Experience', viewUser.experience || '—', TrendingUp],
                  ]),
                  ['Joined', new Date(viewUser.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), Calendar],
                ].map(([k, v, Icon], i) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', background: i % 2 === 0 ? 'white' : '#fafbfc', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: `${config.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={15} color={config.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k}</div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginTop: '2px' }}>{v}</div>
                    </div>
                  </div>
                ))}
              </div>

              {activeTab === 'faculty' && (
                <div style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Layers size={14} color={config.color} />
                    <h3 style={{ margin: 0, fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b' }}>Assignment Configuration</h3>
                  </div>
                  <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '18px', border: '1px solid #e8edf5', marginBottom: '14px' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Assigned Instructors</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      {viewUser.assignedInstructors?.length > 0 ? viewUser.assignedInstructors.map(id => {
                        const inst = instructors.find(i => i._id === id);
                        return (
                          <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'white', borderRadius: '10px', border: '1px solid #e8edf5' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <Avatar name={inst?.name} color={ROLE_CONFIG.instructor.color} size={28} />
                              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{inst?.name || 'Loading…'}</span>
                            </div>
                            <button onClick={() => handleRemoveInstructor(id)} style={{ border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', padding: '6px', borderRadius: '7px', display: 'flex', alignItems: 'center' }} title="Remove">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      }) : (
                        <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '14px', background: 'white', borderRadius: '10px', border: '1px dashed #e2e8f0' }}>No instructors assigned yet.</div>
                      )}
                    </div>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Add Instructor</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <StyledSelect value={selectedInstructor} onChange={e => setSelectedInstructor(e.target.value)}>
                        <option value="">Select Instructor…</option>
                        {instructors.filter(inst => !viewUser.assignedInstructors?.includes(inst._id)).map(inst => (
                          <option key={inst._id} value={inst._id}>{inst.name} ({inst.email})</option>
                        ))}
                      </StyledSelect>
                      <button onClick={handleAssignInstructor} disabled={!selectedInstructor || assigningInstructor}
                        style={{ padding: '10px 20px', background: config.grad, border: 'none', borderRadius: '10px', color: 'white', fontWeight: '800', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', opacity: !selectedInstructor ? 0.4 : 1, flexShrink: 0 }}>
                        {assigningInstructor ? '…' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding: '16px 28px', background: '#f8fafc', borderTop: '1px solid #e8edf5', display: 'flex', gap: '10px', flexShrink: 0 }}>
              <button onClick={() => { setShowViewModal(false); openEdit(viewUser); }}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: config.grad, color: 'white', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Pencil size={14} /> Edit Profile
              </button>
              <button onClick={() => setShowViewModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function ActionBtn({ onClick, title, bg, color, icon: Icon }) {
  return (
    <button onClick={onClick} title={title}
      style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: bg, color, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.boxShadow = `0 3px 10px ${color}40`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
      <Icon size={15} />
    </button>
  );
}
