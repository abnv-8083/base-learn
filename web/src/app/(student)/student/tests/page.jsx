"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, Clock, AlertCircle, Upload, CheckCircle, FileText, Eye, Trophy, Sparkles, GraduationCap } from 'lucide-react';
import PdfPreviewModal from '@/components/PdfPreviewModal';

const STATUS_CONFIG = {
  pending:   { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', label: 'Pending' },
  overdue:   { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', label: 'Overdue' },
  submitted: { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', label: 'Submitted' },
  graded:    { color: '#10b981', bg: '#ecfdf5', border: '#6ee7b7', label: 'Graded' },
};

function StatusBadge({ status }) {
  const s = (status || '').toLowerCase();
  const cfg = STATUS_CONFIG[s] || { color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0', label: status };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.04em', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

export default function StudentTests() {
  const [activeTab, setActiveTab] = useState('view');
  const [filterStatus, setFilterStatus] = useState('All');
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploadingId, setUploadingId] = useState(null);
  const [previewModal, setPreviewModal] = useState({ isOpen: false, url: '', title: '' });

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/student/tests');
      setTests(Array.isArray(res.data.data) ? res.data.data : []);
    } catch { toast.error('Failed to load tests'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTests(); }, []);

  const handleFileUpload = async (e, testId) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { toast.error('Only PDF files are allowed.'); return; }
    if (file.size > 20 * 1024 * 1024) { toast.error('File exceeds 20MB limit.'); return; }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'test');
    try {
      setUploadingId(testId);
      await axios.post(`/api/student/assessments/${testId}/submit`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Test submitted successfully!');
      fetchTests();
    } catch (err) { toast.error(err.response?.data?.message || 'Submission failed'); }
    finally { setUploadingId(null); e.target.value = ''; }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid #fde68a', borderTopColor: '#f59e0b', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>Loading tests…</p>
    </div>
  );

  const pendingTests = tests.filter(t => (t.studentStatus === 'Pending' || t.studentStatus === 'Overdue') && t.title?.toLowerCase().includes(search.toLowerCase()));
  const submittedTests = tests.filter(t => t.studentStatus !== 'Pending' && t.studentStatus !== 'Overdue' && t.title?.toLowerCase().includes(search.toLowerCase()));
  const gradedCount = submittedTests.filter(t => t.studentStatus?.toLowerCase() === 'graded').length;
  const filteredSubmitted = filterStatus === 'All' ? submittedTests : submittedTests.filter(t => {
    if (filterStatus === 'Submitted') return t.studentStatus?.toLowerCase() === 'submitted';
    if (filterStatus === 'Graded') return t.studentStatus?.toLowerCase() === 'graded';
    return true;
  });

  return (
    <div style={{ paddingBottom: '60px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } } .test-fade { animation: fadeUp 0.4s ease both; }`}</style>

      {/* ── Hero ── */}
      <div className="test-fade" style={{ background: 'linear-gradient(135deg, #1c0f00 0%, #78350f 55%, #1c0f00 100%)', borderRadius: '28px', padding: '32px 40px', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(245,158,11,0.18)', border: '1px solid rgba(245,158,11,0.35)', padding: '5px 13px', borderRadius: '99px', marginBottom: '12px' }}>
            <Sparkles size={12} color="#fcd34d" />
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#fcd34d', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tests & Exams</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: 'white', letterSpacing: '-0.03em' }}>My Assessment Hub</h1>
          <p style={{ margin: '8px 0 20px', fontSize: '14px', color: 'rgba(253,211,77,0.75)' }}>Participate in tests and evaluate your knowledge.</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'Pending', value: pendingTests.length, color: '#fbbf24' },
              { label: 'Submitted', value: submittedTests.filter(t => t.studentStatus?.toLowerCase() === 'submitted').length, color: '#60a5fa' },
              { label: 'Graded', value: gradedCount, color: '#34d399' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px 18px', backdropFilter: 'blur(8px)' }}>
                <div style={{ fontSize: '20px', fontWeight: '900', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', fontWeight: '700', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Search + Tabs ── */}
      <div className="test-fade" style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap', animationDelay: '0.05s' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '340px' }}>
          <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tests…"
            style={{ width: '100%', padding: '11px 14px 11px 40px', borderRadius: '14px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', background: 'white', color: '#1e293b', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}
            onFocus={e => { e.target.style.borderColor = '#f59e0b'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)'; }} />
        </div>
        <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '5px', borderRadius: '16px', border: '1px solid #e8edf5', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          {[['view', 'Pending Tests', FileText], ['submitted', 'My Submissions', CheckCircle]].map(([val, lbl, Icon]) => (
            <button key={val} onClick={() => setActiveTab(val)}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 22px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700', transition: 'all 0.2s', background: activeTab === val ? 'linear-gradient(135deg,#d97706,#f59e0b)' : 'transparent', color: activeTab === val ? 'white' : '#64748b', boxShadow: activeTab === val ? '0 4px 14px rgba(245,158,11,0.4)' : 'none' }}>
              <Icon size={15} />
              {lbl}
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '20px', height: '20px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', background: activeTab === val ? 'rgba(255,255,255,0.25)' : '#f1f5f9', color: activeTab === val ? 'white' : '#64748b', padding: '0 5px' }}>
                {val === 'view' ? pendingTests.length : submittedTests.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Pending Cards ── */}
      {activeTab === 'view' && (
        <div className="test-fade" style={{ animationDelay: '0.1s' }}>
          {pendingTests.length === 0 ? (
            <div style={{ padding: '80px 40px', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px dashed #e2e8f0', boxShadow: '0 2px 12px rgba(15,23,42,0.04)' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg,#d97706,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', transform: 'rotate(-8deg)' }}>
                <CheckCircle size={36} color="white" />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', marginBottom: '10px' }}>All Clear! 🎉</h3>
              <p style={{ color: '#64748b', fontSize: '15px', margin: 0, maxWidth: '360px', marginInline: 'auto', lineHeight: 1.6 }}>No pending tests right now. Your faculty will assign new assessments soon.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {pendingTests.map(task => {
                const isOverdue = task.studentStatus === 'Overdue';
                return (
                  <div key={task._id} style={{ background: 'white', borderRadius: '22px', overflow: 'hidden', border: `1px solid ${isOverdue ? '#fecaca' : '#e8edf5'}`, boxShadow: isOverdue ? '0 0 0 3px rgba(239,68,68,0.06)' : '0 2px 12px rgba(15,23,42,0.06)', display: 'flex', flexDirection: 'column', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(15,23,42,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = isOverdue ? '0 0 0 3px rgba(239,68,68,0.06)' : '0 2px 12px rgba(15,23,42,0.06)'; }}>
                    <div style={{ height: '90px', background: isOverdue ? 'linear-gradient(135deg,#9f1239,#ef4444)' : 'linear-gradient(135deg,#b45309,#f59e0b)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                      <div style={{ width: '40px', height: '40px', borderRadius: '13px', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <GraduationCap size={18} color="white" />
                      </div>
                      <div style={{ position: 'absolute', top: '10px', right: '12px' }}>
                        <StatusBadge status={task.studentStatus} />
                      </div>
                    </div>
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px', color: '#0f172a', lineHeight: 1.35 }}>{task.title}</h3>
                      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', lineHeight: 1.6, margin: '0 0 16px' }}>{task.description || 'Complete this assessment and upload your PDF answer sheet.'}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', fontWeight: '700' }}>
                          <Clock size={13} color={isOverdue ? '#ef4444' : '#f59e0b'} />
                          Due {new Date(task.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                        <div style={{ fontWeight: '900', fontSize: '13px', color: '#f59e0b' }}>{task.maxMarks} Marks</div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                        <button onClick={() => setPreviewModal({ isOpen: true, url: task.fileUrl, title: task.title })}
                          style={{ flex: 1, padding: '11px', borderRadius: '12px', background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#475569', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}>
                          <FileText size={15} /> View Questions
                        </button>
                        <div style={{ flex: 1, position: 'relative' }}>
                          <button style={{ width: '100%', height: '43px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#b45309,#f59e0b)', color: 'white', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(245,158,11,0.4)', transition: 'all 0.2s', opacity: uploadingId === task._id ? 0.7 : 1 }} disabled={uploadingId === task._id}>
                            {uploadingId === task._id ? <><span style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Uploading…</> : <><Upload size={15} /> Submit</>}
                          </button>
                          <input type="file" accept=".pdf" onChange={e => handleFileUpload(e, task._id)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} disabled={uploadingId === task._id} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Submitted Tab ── */}
      {activeTab === 'submitted' && (
        <div className="test-fade" style={{ animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', gap: '6px', background: 'white', padding: '5px', borderRadius: '12px', border: '1px solid #e8edf5', marginBottom: '20px', width: 'fit-content' }}>
            {['All', 'Submitted', 'Graded'].map(status => (
              <button key={status} onClick={() => setFilterStatus(status)}
                style={{ padding: '7px 16px', borderRadius: '9px', border: 'none', background: filterStatus === status ? (status === 'Graded' ? '#ecfdf5' : status === 'Submitted' ? '#eff6ff' : '#f59e0b') : 'transparent', color: filterStatus === status ? (status === 'Graded' ? '#059669' : status === 'Submitted' ? '#2563eb' : 'white') : '#64748b', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s' }}>
                {status}
              </button>
            ))}
          </div>

          {filteredSubmitted.length === 0 ? (
            <div style={{ padding: '60px 40px', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px dashed #e2e8f0' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📂</div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>No Submissions Found</h3>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>No tests with status: <strong style={{ color: '#f59e0b' }}>{filterStatus}</strong></p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {filteredSubmitted.map(task => (
                <div key={task._id} style={{ background: 'white', borderRadius: '20px', border: '1px solid #e8edf5', boxShadow: '0 2px 12px rgba(15,23,42,0.05)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(15,23,42,0.05)'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', background: '#f8fafc', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>Test</span>
                    <StatusBadge status={task.studentStatus} />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: 1.35 }}>{task.title}</h3>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>
                    Submitted {new Date(task.mySubmission?.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  {task.studentStatus?.toLowerCase() === 'graded' && task.mySubmission?.marks != null && (
                    <div style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', padding: '14px 16px', borderRadius: '14px', border: '1px solid #fde68a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Trophy size={16} color="#d97706" />
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score</span>
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '900', color: '#d97706', lineHeight: 1 }}>{task.mySubmission.marks} <span style={{ fontSize: '14px', fontWeight: '600', color: '#b45309' }}>/ {task.maxMarks}</span></div>
                      {task.mySubmission.feedback && <div style={{ fontSize: '12px', color: '#92400e', marginTop: '6px', lineHeight: 1.5 }}>{task.mySubmission.feedback}</div>}
                    </div>
                  )}
                  <button onClick={() => setPreviewModal({ isOpen: true, url: task.mySubmission?.fileUrl, title: `${task.title} (Submission)` })}
                    style={{ width: '100%', padding: '11px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', transition: 'all 0.2s', marginTop: 'auto' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <Eye size={14} /> View Submission
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <PdfPreviewModal isOpen={previewModal.isOpen} onClose={() => setPreviewModal({ ...previewModal, isOpen: false })} url={previewModal.url} title={previewModal.title} />
    </div>
  );
}
