import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search, X, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ROLE_CONFIG = {
  student: { label: 'Students', singular: 'Student', color: '#6366f1', fields: ['name', 'email', 'phone', 'studentClass', 'district', 'parentName', 'parentPhone', 'school'] },
  faculty: { label: 'Faculty', singular: 'Faculty', color: '#10b981', fields: ['name', 'email', 'phone', 'district'] },
  instructor: { label: 'Instructors', singular: 'Instructor', color: '#f59e0b', fields: ['name', 'email', 'phone'] },
};

const AdminUserManagement = ({ role }) => {
  const config = ROLE_CONFIG[role];
  const token = localStorage.getItem('token');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { fetchUsers(); }, [role]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/users?role=${role}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch { setUsers([]); } finally { setLoading(false); }
  };

  const openCreate = () => {
    const empty = {};
    config.fields.forEach(f => { empty[f] = ''; });
    empty.password = '';
    setForm(empty);
    setEditingUser(null);
    setShowModal(true);
  };

  const openEdit = (user) => {
    const filled = {};
    config.fields.forEach(f => { filled[f] = user[f] || ''; });
    setForm(filled);
    setEditingUser(user);
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingUser) {
        await axios.put(`/api/admin/users/${editingUser._id}`, form, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('/api/admin/users', { ...form, role }, { headers: { Authorization: `Bearer ${token}` } });
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save user');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? This is permanent.')) return;
    await axios.delete(`/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchUsers();
  };

  const handleToggleStatus = async (id, current) => {
    await axios.patch(`/api/admin/users/${id}/status`, { isActive: !current }, { headers: { Authorization: `Bearer ${token}` } });
    fetchUsers();
  };

  const fieldLabel = (f) => f.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">{config.label}</h1>
          <p className="page-subtitle">Create, edit, and manage {config.label.toLowerCase()} on the platform.</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={openCreate}>
          <Plus size={18} /> Add {config.singular}
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '400px' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${config.label}...`}
          style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '10px', border: '1px solid var(--color-border)', fontSize: '14px' }} />
      </div>

      {loading ? <div className="spinner" style={{ display: 'block', margin: '10vh auto' }}></div> : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: '600' }}>Name</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: '600' }}>Email</th>
                {role === 'student' && <th style={{ padding: '12px 20px', textAlign: 'center', fontWeight: '600' }}>Class</th>}
                <th style={{ padding: '12px 20px', textAlign: 'center', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '12px 20px', textAlign: 'center', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>No {config.label.toLowerCase()} found.</td></tr>
              ) : filtered.map(u => (
                <tr key={u._id} style={{ borderTop: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--color-bg)'}
                  onMouseOut={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: config.color + '22', color: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                        {u.name?.charAt(0)}
                      </div>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>{u.email}</td>
                  {role === 'student' && <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: '13px' }}>{u.studentClass || '—'}</td>}
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', background: u.isActive ? '#dcfce7' : '#fee2e2', color: u.isActive ? '#166534' : '#991b1b' }}>
                      {u.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                      {role === 'faculty' && (
                        <Link to={`/admin/faculty/${u._id}`} style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'white', cursor: 'pointer', color: '#10b981', display: 'flex', alignItems: 'center' }} title="View Details">
                          <ExternalLink size={15} />
                        </Link>
                      )}
                      <button onClick={() => openEdit(u)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'white', cursor: 'pointer', color: '#6366f1' }} title="Edit"><Pencil size={15} /></button>
                      <button onClick={() => handleToggleStatus(u._id, u.isActive)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'white', cursor: 'pointer', color: u.isActive ? '#f59e0b' : '#22c55e' }} title={u.isActive ? 'Block' : 'Activate'}>
                        {u.isActive ? <ToggleLeft size={15} /> : <ToggleRight size={15} />}
                      </button>
                      <button onClick={() => handleDelete(u._id)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'white', cursor: 'pointer', color: '#ef4444' }} title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontWeight: 'bold', fontSize: '18px', margin: 0 }}>{editingUser ? `Edit ${config.singular}` : `Create ${config.singular}`}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {config.fields.map(f => (
                <div key={f}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>{fieldLabel(f)}</label>
                  <input type="text" value={form[f] || ''} onChange={e => setForm({ ...form, [f]: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }} />
                </div>
              ))}
              {!editingUser && (
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={form.password || ''} 
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      style={{ width: '100%', padding: '10px 42px 10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleSave} className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
                {saving ? 'Saving...' : (editingUser ? 'Save Changes' : `Create ${config.singular}`)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
