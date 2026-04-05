"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Search, X, Layers, BookOpen, GraduationCap, Users, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirmStore } from '@/store/confirmStore';

// ── Reusable form components ────────────────────────────────
function FormField({ label, required, error, hint, children }) {
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
      {hint && !error && (
        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>{hint}</span>
      )}
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
      style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${error ? '#ef4444' : focused ? 'var(--color-primary)' : '#e2e8f0'}`, borderRadius: '10px', fontSize: '14px', fontWeight: '500', color: value ? '#1e293b' : '#94a3b8', outline: 'none', transition: 'all 0.2s', background: 'white', cursor: 'pointer', boxShadow: error ? '0 0 0 3px rgba(239,68,68,0.1)' : focused ? '0 0 0 3px rgba(15,45,107,0.08)' : 'none' }}>
      {children}
    </select>
  );
}

function STextarea({ value, onChange, placeholder, rows = 3, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      onFocus={() => setFocused(true)} onBlurCapture={() => setFocused(false)}
      style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${focused ? 'var(--color-primary)' : '#e2e8f0'}`, borderRadius: '10px', fontSize: '14px', fontWeight: '500', color: '#1e293b', outline: 'none', transition: 'all 0.2s', background: 'white', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxShadow: focused ? '0 0 0 3px rgba(15,45,107,0.08)' : 'none' }}
    />
  );
}

const TAB_CONFIG = {
  batches:  { icon: Layers,       color: '#6366f1', bg: '#eef2ff', singular: 'Batch'   },
  classes:  { icon: GraduationCap,color: '#10b981', bg: '#ecfdf5', singular: 'Class'   },
  subjects: { icon: BookOpen,     color: '#f59e0b', bg: '#fffbeb', singular: 'Subject' },
};

export default function AdminCurriculum() {
  const [activeTab, setActiveTab] = useState('batches');
  const tabCfg = TAB_CONFIG[activeTab];
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const confirm = useConfirmStore(s => s.confirm);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [lookups, setLookups] = useState({ faculties: [], instructors: [], classes: [], subjects: [] });

  useEffect(() => {
    fetchData();
    if (activeTab === 'batches') fetchLookups(['classes']);
    if (activeTab === 'classes') fetchLookups([]);
    if (activeTab === 'subjects') fetchLookups(['classes']);
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'batches' ? '/api/admin/batches' : activeTab === 'classes' ? '/api/admin/classes' : '/api/admin/subjects';
      const res = await axios.get(endpoint);
      setData(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setData([]);
      toast.error(`Failed to load ${activeTab}`, { id: `curriculum-${activeTab}` });
    } finally { setLoading(false); }
  };

  const fetchLookups = async (types) => {
    try {
      const n = { ...lookups };
      if (types.includes('instructors')) { const r = await axios.get('/api/admin/users?role=instructor'); n.instructors = r.data.data || []; }
      if (types.includes('faculties'))   { const r = await axios.get('/api/admin/users?role=faculty');    n.faculties   = r.data.data || []; }
      if (types.includes('classes'))     { const r = await axios.get('/api/admin/classes');               n.classes     = r.data.data || []; }
      setLookups(n);
    } catch {}
  };

  // ── Inline Validation ──────────────────────────────────────
  const validate = (f, v) => {
    let err = null;
    if (f === 'name') {
      if (!v?.trim()) err = 'Name is required';
      else if (v.trim().length < 2) err = 'Name must be at least 2 characters';
    }
    if (f === 'studyClass' && activeTab === 'batches' && !v) err = 'Please select a class';
    if (f === 'capacity') {
      const n = parseInt(v);
      if (isNaN(n) || n < 1) err = 'Capacity must be a positive number';
      else if (n > 500) err = 'Maximum capacity is 500';
    }
    setErrors(prev => ({ ...prev, [f]: err }));
    return !err;
  };

  const handleSave = async () => {
    // Validate all required fields
    const newErrors = {};
    if (!form.name?.trim()) newErrors.name = 'Name is required';
    else if (form.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (activeTab === 'batches') {
      if (!form.studyClass) newErrors.studyClass = 'Please select a class';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) { toast.error('Please fix the highlighted errors'); return; }

    setSaving(true);
    try {
      const endpoint = activeTab === 'batches' ? '/api/admin/batches' : activeTab === 'classes' ? '/api/admin/classes' : '/api/admin/subjects';
      let payload = { ...form };
      if (activeTab === 'classes') payload = { name: form.name, description: form.description, targetGrade: form.gradeLevel ? String(form.gradeLevel) : undefined };
      else if (activeTab === 'subjects') payload = { name: form.name, description: form.description, targetGrade: form.targetGrade };
      if (form._id) { await axios.put(`${endpoint}/${form._id}`, payload); toast.success('Record updated'); }
      else { await axios.post(endpoint, payload); toast.success('Record created'); }
      setShowModal(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = (id) => {
    confirm({
      title: `Delete ${activeTab.slice(0, -1)}?`,
      message: `Permanently delete this ${activeTab.slice(0, -1)}? This may affect related enrollments and schedules.`,
      confirmText: 'Delete Permanently', type: 'danger', icon: Trash2,
      onConfirm: async () => {
        try {
          const ep = activeTab === 'batches' ? '/api/admin/batches' : activeTab === 'classes' ? '/api/admin/classes' : '/api/admin/subjects';
          await axios.delete(`${ep}/${id}`); toast.success('Deleted'); fetchData();
        } catch { toast.error('Failed to delete'); }
      }
    });
  };

  const handleEdit = (item) => {
    setForm({ ...item, studyClass: item.studyClass?._id || item.studyClass, gradeLevel: item.targetGrade || item.gradeLevel });
    setErrors({});
    setShowModal(true);
  };

  const filtered = data.filter(item => item.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 className="page-title">Curriculum Management</h1>
          <p className="page-subtitle">Configure batches, study classes, and curriculum subjects.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({}); setErrors({}); setShowModal(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: tabCfg.color, border: 'none', borderRadius: '12px', padding: '12px 20px', fontWeight: '700', fontSize: '14px', color: 'white', cursor: 'pointer', boxShadow: `0 4px 12px ${tabCfg.color}40` }}>
          <Plus size={18} /> Add {tabCfg.singular}
        </button>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'white', padding: '6px', borderRadius: '14px', border: '1px solid var(--color-border)', width: 'fit-content', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {Object.entries(TAB_CONFIG).map(([tab, cfg]) => (
          <button key={tab} onClick={() => { setActiveTab(tab); setSearch(''); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', textTransform: 'capitalize', transition: 'all 0.2s', background: activeTab === tab ? cfg.color : 'transparent', color: activeTab === tab ? 'white' : 'var(--color-text-secondary)', boxShadow: activeTab === tab ? `0 4px 12px ${cfg.color}40` : 'none' }}>
            <cfg.icon size={15} /> {tab}
          </button>
        ))}
      </div>

      {/* ── Search ── */}
      <div style={{ position: 'relative', width: '320px', marginBottom: '20px' }}>
        <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${activeTab}…`}
          style={{ width: '100%', padding: '11px 14px 11px 40px', borderRadius: '12px', border: '1.5px solid var(--color-border)', fontSize: '14px', outline: 'none', background: 'white', transition: 'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor = tabCfg.color}
          onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
      </div>

      {/* ── Table ── */}
      {loading ? <div className="spinner" style={{ display: 'block', margin: '10vh auto' }} /> : (
        <div className="card" style={{ overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,45,107,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: '700' }}>
                  {activeTab === 'batches' ? 'Batch' : activeTab === 'classes' ? 'Class' : 'Subject'}
                </th>
                {activeTab === 'batches' && <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: '700' }}>Instructor</th>}
                {activeTab === 'batches' && <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: '700' }}>Mode / Location</th>}
                {activeTab === 'classes' && <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: '700' }}>Grade Level</th>}
                {activeTab === 'subjects' && <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: '700' }}>Assigned Faculty</th>}
                <th style={{ padding: '14px 20px', textAlign: 'center', fontWeight: '700' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={activeTab === 'batches' ? 4 : 3} style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  No records found.
                </td></tr>
              ) : filtered.map(item => (
                <tr key={item._id} style={{ borderTop: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = tabCfg.bg}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: tabCfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <tabCfg.icon size={17} color={tabCfg.color} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--color-text-primary)', fontSize: '14px' }}>{item.name}</div>
                        {item.description && <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{item.description.slice(0, 60)}{item.description.length > 60 ? '…' : ''}</div>}
                      </div>
                    </div>
                  </td>
                  {activeTab === 'batches' && <>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>{item.instructor?.name || '—'}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: '#f1f5f9', color: '#64748b' }}>
                        {item.mode || 'Online'} {item.location ? `· ${item.location}` : ''}
                      </span>
                    </td>
                  </>}
                  {activeTab === 'classes' && (
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: tabCfg.bg, color: tabCfg.color }}>
                        Grade {item.targetGrade ?? item.gradeLevel ?? '—'}
                      </span>
                    </td>
                  )}
                  {activeTab === 'subjects' && (
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: item.faculty?.name ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: item.faculty?.name ? '600' : '400' }}>
                      {item.faculty?.name || 'Unassigned'}
                    </td>
                  )}
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button onClick={() => handleEdit(item)} title="Edit"
                        style={{ width: '34px', height: '34px', borderRadius: '8px', border: 'none', background: '#ede9fe', color: '#7c3aed', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(item._id)} title="Delete"
                        style={{ width: '34px', height: '34px', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

      {/* ── Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,50,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '520px', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '22px 28px', background: `linear-gradient(135deg, ${tabCfg.color}cc, ${tabCfg.color})`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'white', textTransform: 'capitalize' }}>{form._id ? 'Edit' : 'Add New'} {tabCfg.singular}</h2>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>Fill in the required fields below</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <FormField label="Name" required error={errors.name}>
                <SInput value={form.name || ''} onChange={e => { setForm({...form, name: e.target.value}); if (errors.name) validate('name', e.target.value); }}
                  onBlur={() => validate('name', form.name)} error={errors.name} placeholder={`e.g. ${activeTab === 'batches' ? 'Alpha Founders' : activeTab === 'classes' ? 'Class 10 Foundation' : 'Mathematics'}`} />
              </FormField>

              <FormField label="Description" hint="Brief summary, visible to instructors">
                <STextarea value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional description…" rows={2} />
              </FormField>

              {activeTab === 'batches' && (<>
                <FormField label="Associated Class" required error={errors.studyClass}>
                  <SSelect value={form.studyClass || ''} onChange={e => { setForm({...form, studyClass: e.target.value}); if (errors.studyClass) validate('studyClass', e.target.value); }} error={errors.studyClass} onBlur={() => validate('studyClass', form.studyClass)}>
                    <option value="">Select class…</option>
                    {lookups.classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </SSelect>
                </FormField>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FormField label="Learning Mode">
                    <SSelect value={form.mode || 'online'} onChange={e => setForm({...form, mode: e.target.value})}>
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                      <option value="hybrid">Hybrid</option>
                    </SSelect>
                  </FormField>
                  <FormField label="Capacity" error={errors.capacity}>
                    <SInput type="number" value={form.capacity || 50} onChange={e => { setForm({...form, capacity: e.target.value}); if (errors.capacity) validate('capacity', e.target.value); }} onBlur={() => validate('capacity', form.capacity)} error={errors.capacity} />
                  </FormField>
                </div>
                <FormField label="Location District" hint="e.g. Ernakulam">
                  <SInput value={form.location || ''} onChange={e => setForm({...form, location: e.target.value})} placeholder="Optional location" />
                </FormField>
              </>)}

              {activeTab === 'classes' && (
                <FormField label="Grade Level" hint="Numeric grade, e.g. 10 for Class 10">
                  <SInput type="number" value={form.gradeLevel || 10} onChange={e => setForm({...form, gradeLevel: e.target.value})} />
                </FormField>
              )}

              {activeTab === 'subjects' && (<>
                <FormField label="Target Grade" hint="Select a class">
                  <SSelect value={form.targetGrade || ''} onChange={e => setForm({...form, targetGrade: e.target.value})}>
                    <option value="">Select target grade…</option>
                    {lookups.classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </SSelect>
                </FormField>
              </>)}
            </div>

            <div style={{ padding: '18px 28px', background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleSave} disabled={saving}
                style={{ flex: 2, padding: '12px', background: tabCfg.color, border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: `0 4px 14px ${tabCfg.color}50` }}>
                <CheckCircle size={16} /> {saving ? 'Saving…' : 'Save Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
