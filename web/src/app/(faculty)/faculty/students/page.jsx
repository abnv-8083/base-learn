"use client";

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Search, User, Mail, Phone, MapPin, School,
  Users, CheckCircle, XCircle, CreditCard, Filter,
  ChevronDown, Activity, BookOpen, StickyNote, Send, X,
  GraduationCap, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const AVATAR_COLORS = [
  ['#6366f1', '#e0e7ff'], ['#10b981', '#d1fae5'], ['#f59e0b', '#fef3c7'],
  ['#ef4444', '#fee2e2'], ['#8b5cf6', '#ede9fe'], ['#14b8a6', '#ccfbf1'],
];

function getAvatarColors(name = '') {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default function FacultyStudents() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [noteModal, setNoteModal] = useState(null); // { studentId, studentName }
  const [noteText, setNoteText] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/faculty/students');
      setStudents(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      toast.error('Failed to load your students.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Derive unique classes for filter
  const classes = useMemo(() => {
    const set = new Set(students.map(s => s.studentClass).filter(Boolean));
    return [...set].sort();
  }, [students]);

  // Filter & search
  const filtered = useMemo(() => {
    return students.filter(s => {
      const matchSearch = !search ||
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.phone?.includes(search);
      const matchClass = filterClass === 'all' || s.studentClass === filterClass;
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && s.isActive) ||
        (filterStatus === 'inactive' && !s.isActive) ||
        (filterStatus === 'paid' && s.hasPaid) ||
        (filterStatus === 'unpaid' && !s.hasPaid);
      return matchSearch && matchClass && matchStatus;
    });
  }, [students, search, filterClass, filterStatus]);

  // KPIs
  const kpis = useMemo(() => ({
    total: students.length,
    active: students.filter(s => s.isActive).length,
    paid: students.filter(s => s.hasPaid).length,
    unpaid: students.filter(s => !s.hasPaid).length,
  }), [students]);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setSubmittingNote(true);
    try {
      await axios.post(`/api/faculty/students/${noteModal.studentId}/notes`, { note: noteText });
      toast.success('Note saved!');
      setNoteModal(null);
      setNoteText('');
      fetchStudents();
    } catch {
      toast.error('Failed to save note.');
    } finally {
      setSubmittingNote(false);
    }
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">My Students</h1>
            <p className="page-subtitle">Students enrolled in the batches you teach across all your subjects.</p>
          </div>
        </div>
      </div>

      {/* KPI Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Students', value: kpis.total, icon: <Users size={20} />, color: '#6366f1', bg: '#e0e7ff' },
          { label: 'Active', value: kpis.active, icon: <CheckCircle size={20} />, color: '#10b981', bg: '#d1fae5' },
          { label: 'Fee Paid', value: kpis.paid, icon: <CreditCard size={20} />, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Fee Pending', value: kpis.unpaid, icon: <AlertCircle size={20} />, color: '#ef4444', bg: '#fee2e2' },
        ].map(kpi => (
          <div key={kpi.label} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: kpi.bg, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: '800', lineHeight: 1, color: 'var(--color-text-primary)' }}>{kpi.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: '600' }}>{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '380px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone…"
            style={{ width: '100%', padding: '11px 16px 11px 42px', borderRadius: '12px', border: '1.5px solid var(--color-border)', fontSize: '14px', background: 'var(--color-bg-card)', boxSizing: 'border-box' }}
          />
        </div>

        {/* Class filter */}
        <div style={{ position: 'relative' }}>
          <GraduationCap size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
          <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
            style={{ padding: '11px 36px 11px 36px', borderRadius: '12px', border: '1.5px solid var(--color-border)', fontSize: '14px', background: 'var(--color-bg-card)', cursor: 'pointer', appearance: 'none' }}>
            <option value="all">All Classes</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-secondary)' }} />
        </div>

        {/* Status filter */}
        <div style={{ position: 'relative' }}>
          <Filter size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '11px 36px 11px 36px', borderRadius: '12px', border: '1.5px solid var(--color-border)', fontSize: '14px', background: 'var(--color-bg-card)', cursor: 'pointer', appearance: 'none' }}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="paid">Fee Paid</option>
            <option value="unpaid">Fee Pending</option>
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-secondary)' }} />
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
          Showing {filtered.length} of {students.length} students
        </div>
      </div>

      {/* Student Grid */}
      {loading ? (
        <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }} />
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', background: 'var(--color-bg-card)', borderRadius: '20px', border: '2px dashed var(--color-border)' }}>
          <User size={48} style={{ margin: '0 auto 16px', color: 'var(--color-text-muted)', opacity: 0.5 }} />
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>No Students Found</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            {students.length === 0 ? 'No students are currently enrolled in your subject\'s batches.' : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filtered.map(student => {
            const [fg, bg] = getAvatarColors(student.name);
            return (
              <div key={student._id} className="card hover-lift" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1.5px solid var(--color-border)' }}>
                
                {/* Card Top: Avatar + Name + Badges */}
                <div style={{ padding: '20px 20px 16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px', flexShrink: 0 }}>
                    {student.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.email}</div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: student.isActive ? '#d1fae5' : '#fee2e2', color: student.isActive ? '#065f46' : '#991b1b' }}>
                        {student.isActive ? '● Active' : '● Inactive'}
                      </span>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: student.hasPaid ? '#fef3c7' : '#f1f5f9', color: student.hasPaid ? '#92400e' : '#475569' }}>
                        {student.hasPaid ? '✓ Paid' : '⚠ Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'var(--color-border)', margin: '0 20px' }} />

                {/* Info Grid */}
                <div style={{ padding: '14px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {student.studentClass && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      <GraduationCap size={14} color="var(--color-primary)" />
                      <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{student.studentClass}</span>
                    </div>
                  )}
                  {student.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      <Phone size={14} color="var(--color-primary)" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                  {student.school && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: 'var(--color-text-secondary)', gridColumn: '1 / -1' }}>
                      <School size={14} color="var(--color-primary)" />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.school}</span>
                    </div>
                  )}
                  {student.district && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      <MapPin size={14} color="var(--color-primary)" />
                      <span>{student.district}</span>
                    </div>
                  )}
                  {student.batches?.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: 'var(--color-text-secondary)', gridColumn: '1 / -1' }}>
                      <BookOpen size={14} color="#8b5cf6" />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.batches.join(', ')}</span>
                    </div>
                  )}
                  {student.instructorNotes?.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      <StickyNote size={14} color="#f59e0b" />
                      <span>{student.instructorNotes.length} note{student.instructorNotes.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'var(--color-border)', margin: '0 20px' }} />

                {/* Actions */}
                <div style={{ padding: '12px 16px', display: 'flex', gap: '8px', background: 'var(--color-bg)', marginTop: 'auto' }}>
                  <button
                    onClick={() => router.push(`/faculty/students/${student._id}`)}
                    className="btn btn-primary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', fontSize: '13px', fontWeight: '700' }}
                  >
                    <Activity size={15} /> View Analytics
                  </button>
                  <button
                    onClick={() => { setNoteModal({ studentId: student._id, studentName: student.name }); setNoteText(''); }}
                    className="btn btn-outline-primary"
                    title="Add Note"
                    style={{ padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <StickyNote size={15} />
                  </button>
                  <a href={`mailto:${student.email}`}
                    className="btn btn-outline-primary"
                    title="Send Email"
                    style={{ padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Mail size={15} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Note Modal */}
      {noteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '28px', position: 'relative' }}>
            <button onClick={() => setNoteModal(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
              <X size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0e7ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <StickyNote size={20} />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '16px' }}>Add Note</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{noteModal.studentName}</div>
              </div>
            </div>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Write your note here (visible to instructors only)…"
              rows={4}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid var(--color-border)', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', marginBottom: '16px' }}
            />
            <button
              onClick={handleAddNote}
              disabled={submittingNote || !noteText.trim()}
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', fontSize: '14px', fontWeight: '700', opacity: (!noteText.trim() || submittingNote) ? 0.6 : 1 }}
            >
              <Send size={16} /> {submittingNote ? 'Saving…' : 'Save Note'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
