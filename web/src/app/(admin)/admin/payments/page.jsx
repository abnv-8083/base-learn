"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  CreditCard, Plus, Search, Download, Trash2, Edit3, X,
  CheckCircle, Clock, AlertCircle, RotateCcw, Filter,
  GraduationCap, IndianRupee, TrendingUp, Users, Receipt,
  ChevronDown, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirmStore } from '@/store/confirmStore';

// ─── Constants ────────────────────────────────────────────────────────────────
const METHOD_LABELS  = { cash: 'Cash', upi: 'UPI', bank_transfer: 'Bank Transfer', cheque: 'Cheque', online: 'Online', other: 'Other' };
const STATUS_STYLES  = {
  paid:     { bg: '#dcfce7', color: '#166534', label: 'Paid',     icon: CheckCircle },
  pending:  { bg: '#fef9c3', color: '#854d0e', label: 'Pending',  icon: Clock },
  partial:  { bg: '#dbeafe', color: '#1e40af', label: 'Partial',  icon: AlertCircle },
  refunded: { bg: '#fee2e2', color: '#991b1b', label: 'Refunded', icon: RotateCcw },
};
const CATEGORIES    = ['tuition', 'registration', 'exam', 'material', 'other'];
const METHODS       = Object.keys(METHOD_LABELS);
const STATUSES      = Object.keys(STATUS_STYLES);

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card" style={{ padding: '20px 22px', borderTop: `3px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ padding: '10px', borderRadius: '12px', background: `${color}18` }}>
          <Icon size={22} color={color} />
        </div>
      </div>
      <div style={{ marginTop: '14px' }}>
        <div style={{ fontSize: '26px', fontWeight: '900', lineHeight: 1, color: 'var(--color-text-primary)' }}>{value}</div>
        <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '6px' }}>{label}</div>
        {sub && <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '3px' }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const Icon = s.icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', background: s.bg, color: s.color }}>
      <Icon size={11} /> {s.label}
    </span>
  );
}

// ─── Shared UI Helpers ────────────────────────────────────────────────────────
const F = ({ label, children, req }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label} {req && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
    {children}
  </div>
);

const SelFilter = ({ options, setter, current }) => (
  <select value={current} onChange={e => setter(e.target.value)}
    style={{ padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontWeight: '600', background: current ? '#6366f10d' : 'white', color: current ? '#6366f1' : '#64748b', outline: 'none', cursor: 'pointer' }}>
    {options}
  </select>
);

// ─── Payment Modal ────────────────────────────────────────────────────────────
function PaymentModal({ payment, students, onClose, onSave }) {
  const isEdit = !!payment?._id;
  const [form, setForm] = useState(payment || {
    student: '', amount: '', method: 'cash', status: 'paid',
    category: 'tuition', remarks: '', transactionId: '',
    paidAt: new Date().toISOString().slice(0, 10), dueDate: ''
  });
  const [saving, setSaving] = useState(false);
  const [studentSearch, setStudentSearch] = useState(
    payment?.student ? (typeof payment.student === 'object' ? payment.student.name : '') : ''
  );
  const [showStudentDrop, setShowStudentDrop] = useState(false);

  const filteredStudents = useMemo(() =>
    students.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.email?.toLowerCase().includes(studentSearch.toLowerCase())),
    [students, studentSearch]
  );

  const handleSubmit = async () => {
    if (!form.student || !form.amount) return toast.error('Student and amount are required');
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save payment');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: '100%', padding: '10px 13px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', background: 'white', boxSizing: 'border-box' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,45,107,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(6px)', padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '560px', padding: 0, overflow: 'hidden', borderRadius: '20px', boxShadow: '0 24px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)' }}>
              <CreditCard size={18} />
            </div>
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>{isEdit ? 'Edit Payment' : 'Record New Payment'}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: '7px', borderRadius: '8px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px', overflowY: 'auto', flex: 1 }}>
          {/* Student picker */}
          <F label="Student" req>
            <div style={{ position: 'relative' }}>
              <input
                value={studentSearch}
                onChange={e => { setStudentSearch(e.target.value); setShowStudentDrop(true); }}
                onFocus={() => setShowStudentDrop(true)}
                placeholder="Search student by name or email…"
                style={inputStyle}
              />
              {showStudentDrop && filteredStudents.length > 0 && (
                <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 10, maxHeight: '180px', overflowY: 'auto' }}>
                  {filteredStudents.slice(0, 10).map(s => (
                    <div key={s._id}
                      onClick={() => { setForm(f => ({ ...f, student: s._id })); setStudentSearch(`${s.name} (${s.email})`); setShowStudentDrop(false); }}
                      style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', borderBottom: '1px solid #f8fafc' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >
                      <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px', flexShrink: 0 }}>{s.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: '700' }}>{s.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{s.email} · {s.studentClass || '—'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </F>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <F label="Amount (₹)" req>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" style={inputStyle} min="1" />
            </F>
            <F label="Payment Date" req>
              <input type="date" value={form.paidAt?.slice(0,10) || ''} onChange={e => setForm(f => ({ ...f, paidAt: e.target.value }))} style={inputStyle} />
            </F>
            <F label="Method">
              <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))} style={inputStyle}>
                {METHODS.map(m => <option key={m} value={m}>{METHOD_LABELS[m]}</option>)}
              </select>
            </F>
            <F label="Status">
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inputStyle}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_STYLES[s].label}</option>)}
              </select>
            </F>
            <F label="Category">
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </F>
            <F label="Transaction ID">
              <input value={form.transactionId || ''} onChange={e => setForm(f => ({ ...f, transactionId: e.target.value }))} placeholder="UTR / Ref no." style={inputStyle} />
            </F>
          </div>

          <F label="Due Date (for pending payments)">
            <input type="date" value={form.dueDate?.slice(0,10) || ''} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} style={inputStyle} />
          </F>

          <F label="Remarks / Notes">
            <textarea value={form.remarks || ''} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional internal note…" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </F>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', background: '#f8fafc' }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1, height: '44px', borderRadius: '12px', fontWeight: '700' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="btn btn-primary" style={{ flex: 2, height: '44px', borderRadius: '12px', fontWeight: '800', background: 'linear-gradient(135deg, #6366f1, #0f2d6b)' }}>
            {saving ? 'Saving…' : isEdit ? 'Update Payment' : 'Record Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPaymentsPage() {
  const confirm = useConfirmStore(s => s.confirm);
  const [payments, setPayments]   = useState([]);
  const [students, setStudents]   = useState([]);
  const [summary, setSummary]     = useState({});
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPayment, setEditPayment] = useState(null);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilterStatus]   = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMethod, setFilterMethod]   = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus)   params.status   = filterStatus;
      if (filterCategory) params.category = filterCategory;
      if (filterMethod)   params.method   = filterMethod;

      const [pRes, sRes] = await Promise.all([
        axios.get('/api/admin/payments', { params }),
        axios.get('/api/admin/users?role=student')
      ]);
      setPayments(pRes.data.data || []);
      setSummary(pRes.data.summary || {});
      setStudents(sRes.data.data || []);
    } catch {
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterCategory, filterMethod]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSave = async (form) => {
    if (form._id) {
      await axios.put(`/api/admin/payments/${form._id}`, form);
      toast.success('Payment updated');
    } else {
      await axios.post('/api/admin/payments', form);
      toast.success('Payment recorded successfully');
    }
    fetchAll();
  };

  const handleDelete = (payment) => {
    confirm({
      title: 'Delete Payment?',
      message: `Delete receipt ${payment.receiptNo}? This cannot be undone.`,
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/admin/payments/${payment._id}`);
          toast.success('Payment deleted');
          fetchAll();
        } catch { toast.error('Failed to delete'); }
      }
    });
  };

  const downloadCSV = () => {
    const rows = [
      ['Receipt No', 'Student', 'Email', 'Amount', 'Method', 'Status', 'Category', 'Transaction ID', 'Date', 'Remarks'],
      ...filtered.map(p => [
        p.receiptNo, p.student?.name || '—', p.student?.email || '—',
        p.amount, METHOD_LABELS[p.method] || p.method,
        STATUS_STYLES[p.status]?.label || p.status, p.category,
        p.transactionId || '—', fmtDate(p.paidAt), p.remarks || '—'
      ])
    ];
    const csv  = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'payments.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return payments.filter(p =>
      p.student?.name?.toLowerCase().includes(q) ||
      p.student?.email?.toLowerCase().includes(q) ||
      p.receiptNo?.toLowerCase().includes(q) ||
      p.transactionId?.toLowerCase().includes(q)
    );
  }, [payments, search]);

  // Unpaid students (those with no paid payment)
  const paidStudentIds = new Set(payments.filter(p => p.status === 'paid').map(p => p.student?._id?.toString()));
  const unpaidCount    = students.filter(s => !paidStudentIds.has(s._id?.toString())).length;

  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* ── Header ── */}
      <div className="page-header" style={{ marginBottom: '28px' }}>
        <div>
          <h1 className="page-title">Fee & Payment Management</h1>
          <p className="page-subtitle">Record, track and manage all student payments in one place.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={downloadCSV} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px' }}>
            <Download size={15} /> Export CSV
          </button>
          <button onClick={() => { setEditPayment(null); setShowModal(true); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', fontWeight: '800', background: 'linear-gradient(135deg, #6366f1, #0f2d6b)' }}>
            <Plus size={17} /> Add Payment
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '18px', marginBottom: '28px' }}>
        <StatCard icon={IndianRupee} label="Total Collected"  value={fmt(summary.paidTotal)}    color="#10b981" sub={`${summary.count || 0} transactions`} />
        <StatCard icon={Clock}       label="Pending Amount"   value={fmt(summary.pendingTotal)} color="#f59e0b" />
        <StatCard icon={Receipt}     label="All Transactions" value={summary.count || 0}        color="#6366f1" />
        <StatCard icon={Users}       label="Unpaid Students"  value={unpaidCount}               color="#ef4444" sub={`${students.length} total students`} />
      </div>

      {/* ── Filters + Search ── */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student, receipt, transaction ID…"
            style={{ width: '100%', padding: '10px 12px 10px 34px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <SelFilter options={<><option value="">All Statuses</option>{STATUSES.map(s => <option key={s} value={s}>{STATUS_STYLES[s].label}</option>)}</>} setter={setFilterStatus} current={filterStatus} />
        <SelFilter options={<><option value="">All Methods</option>{METHODS.map(m => <option key={m} value={m}>{METHOD_LABELS[m]}</option>)}</>} setter={setFilterMethod} current={filterMethod} />
        <SelFilter options={<><option value="">All Categories</option>{CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}</>} setter={setFilterCategory} current={filterCategory} />
        {(filterStatus || filterMethod || filterCategory) && (
          <button onClick={() => { setFilterStatus(''); setFilterMethod(''); setFilterCategory(''); }} style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fee2e2', color: '#dc2626', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* ── Payments Table ── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>Payment Records ({filtered.length})</h3>
        </div>

        {loading ? (
          <div style={{ padding: '80px', display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Receipt', 'Student', 'Amount', 'Method', 'Category', 'Status', 'Date', 'Transaction ID', 'Recorded By', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ padding: '80px 40px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CreditCard size={28} color="#94a3b8" />
                        </div>
                        <div style={{ color: '#64748b', fontWeight: '600' }}>No payments found</div>
                        <button onClick={() => { setEditPayment(null); setShowModal(true); }} className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Plus size={15} /> Record First Payment
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(payment => (
                  <tr key={payment._id} style={{ borderTop: '1px solid #f1f5f9' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafbff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}>

                    {/* Receipt */}
                    <td style={{ padding: '13px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '700', color: '#6366f1', background: '#eef2ff', padding: '3px 8px', borderRadius: '6px' }}>
                        {payment.receiptNo}
                      </span>
                    </td>

                    {/* Student */}
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        {payment.student?.profilePhoto
                          ? <img src={payment.student.profilePhoto} style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} alt="" />
                          : <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px', flexShrink: 0 }}>
                              {(payment.student?.name || '?').charAt(0)}
                            </div>
                        }
                        <div>
                          <div style={{ fontWeight: '700', whiteSpace: 'nowrap' }}>{payment.student?.name || 'Unknown'}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{payment.student?.studentClass || '—'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td style={{ padding: '13px 14px', whiteSpace: 'nowrap', fontWeight: '800', fontSize: '15px', color: payment.status === 'paid' ? '#10b981' : '#f59e0b' }}>
                      {fmt(payment.amount)}
                    </td>

                    {/* Method */}
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', background: '#f1f5f9', color: '#475569' }}>
                        {METHOD_LABELS[payment.method] || payment.method}
                      </span>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '13px 14px', fontSize: '12px', color: '#64748b', textTransform: 'capitalize' }}>
                      {payment.category}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '13px 14px' }}>
                      <StatusBadge status={payment.status} />
                    </td>

                    {/* Date */}
                    <td style={{ padding: '13px 14px', whiteSpace: 'nowrap', fontSize: '12px', color: '#64748b' }}>
                      {fmtDate(payment.paidAt)}
                    </td>

                    {/* Transaction ID */}
                    <td style={{ padding: '13px 14px' }}>
                      {payment.transactionId
                        ? <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#475569' }}>{payment.transactionId}</span>
                        : <span style={{ color: '#cbd5e1' }}>—</span>
                      }
                    </td>

                    {/* Recorded By */}
                    <td style={{ padding: '13px 14px', fontSize: '12px', color: '#64748b' }}>
                      {payment.recordedBy?.name || 'Admin'}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => { setEditPayment(payment); setShowModal(true); }}
                          style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: '#475569' }}
                          title="Edit"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(payment)}
                          style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fff5f5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: '#ef4444' }}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Unpaid Students Panel ── */}
      {!loading && students.length > 0 && (
        <div className="card" style={{ marginTop: '28px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: '#fee2e2' }}>
                <AlertCircle size={16} color="#ef4444" />
              </div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>Unpaid Students ({unpaidCount})</h3>
            </div>
          </div>
          <div style={{ padding: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '8px', padding: '8px' }}>
              {students
                .filter(s => !paidStudentIds.has(s._id?.toString()))
                .slice(0, 20)
                .map(s => (
                  <div key={s._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '12px', background: '#fff5f5', border: '1px solid #fee2e2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px' }}>
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700' }}>{s.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{s.studentClass || '—'}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => { setEditPayment({ student: s._id, status: 'paid', method: 'cash', category: 'tuition', paidAt: new Date().toISOString().slice(0,10) }); setShowModal(true); }}
                      style={{ padding: '5px 10px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontSize: '11px', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus size={12} /> Pay
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <PaymentModal
          payment={editPayment}
          students={students}
          onClose={() => { setShowModal(false); setEditPayment(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
