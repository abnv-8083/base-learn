"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Eye, CheckCircle, XCircle, Clock, FileText, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentAssignments() {
  const [activeTab, setActiveTab] = useState('view'); // 'view' or 'submitted'
  const [filterStatus, setFilterStatus] = useState('All');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/student/assignments');
      setAssignments(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleFileUpload = async (e, assignmentId) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed for assignments.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File exceeds 20MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'assignment');

    try {
      setUploadingId(assignmentId);
      await axios.post(`/api/student/assessments/${assignmentId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Assignment submitted successfully!');
      fetchAssignments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setUploadingId(null);
      e.target.value = ''; // reset input
    }
  };

  if (loading) return <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }} />;

  const pendingAssignments = assignments.filter(a => a.studentStatus === 'Pending' || a.studentStatus === 'Overdue');
  const submittedAssignments = assignments.filter(a => a.studentStatus !== 'Pending' && a.studentStatus !== 'Overdue');
  
  const filteredSubmitted = filterStatus === 'All' 
    ? submittedAssignments 
    : submittedAssignments.filter(a => {
        if (filterStatus === 'Submitted') return a.studentStatus === 'Submitted' || a.studentStatus === 'submitted';
        if (filterStatus === 'Graded') return a.studentStatus === 'Graded' || a.studentStatus === 'graded';
        return true;
      });

  const getStatusBadge = (status) => {
    const s = status.toLowerCase();
    if (s === 'pending') return <span className="badge" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>Pending</span>;
    if (s === 'overdue') return <span className="badge" style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)' }}>Overdue</span>;
    if (s === 'submitted') return <span className="badge" style={{ background: 'var(--color-info-light)', color: 'var(--color-info)' }}>Submitted</span>;
    if (s === 'graded') return <span className="badge" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>Graded</span>;
    return null;
  };

  const StatusIcon = ({ status }) => {
    const s = status.toLowerCase();
    if (s === 'pending') return <Clock size={16} color="var(--color-warning)" />;
    if (s === 'overdue') return <AlertCircle size={16} color="var(--color-danger)" />;
    if (s === 'submitted') return <Upload size={16} color="var(--color-info)" />;
    if (s === 'graded') return <CheckCircle size={16} color="var(--color-success)" />;
    return <FileText size={16} />;
  };

  return (
    <div>
<div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="page-header-inner" style={{ alignItems: 'flex-end' }}>
          <div>
            <h1 className="page-title">Assignments</h1>
            <p className="page-subtitle">Manage your coursework and track your submissions.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-6)' }}>
        <button 
          onClick={() => setActiveTab('view')}
          style={{ 
            padding: 'var(--space-3) var(--space-4)', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'view' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'view' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontWeight: activeTab === 'view' ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: 'var(--text-base)',
            transition: 'all 0.2s'
          }}
        >
          View Assignments
        </button>
        <button 
          onClick={() => setActiveTab('submitted')}
          style={{ 
            padding: 'var(--space-3) var(--space-4)', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'submitted' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'submitted' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontWeight: activeTab === 'submitted' ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: 'var(--text-base)',
            transition: 'all 0.2s'
          }}
        >
          Submitted Assignments
        </button>
      </div>

      {activeTab === 'view' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {pendingAssignments.length === 0 ? (
             <div style={{ gridColumn: '1 / -1', padding: '100px 40px', textAlign: 'center', background: 'white', borderRadius: '28px', border: '1px dashed #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '80px', height: '80px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', transform: 'rotate(-10deg)' }}>
                   <FileText size={32} />
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', color: '#0f172a' }}>All Caught Up!</h3>
                <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' }}>You have no pending assignments. New coursework will appear here once assigned by your faculty.</p>
             </div>
          ) : pendingAssignments.map(task => (
            <div key={task._id} className="card hover-lift" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, border: '1.5px solid #f1f5f9', borderRadius: '24px', background: '#fff' }}>
              <div style={{ width: '100%', height: '100px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={18} color="white" />
                   </div>
                </div>
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', padding: '4px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: '800', border: '1px solid rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
                  {task.studentStatus}
                </div>
              </div>

              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: '#0f172a' }}>{task.title}</h3>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', lineHeight: '1.6', fontWeight: '500' }}>{task.description || 'Access high-quality study materials and video lectures.'}</p>
                
                <div style={{ marginTop: 'auto', background: '#f8fafc', padding: '12px 16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: '700' }}>
                    <Clock size={14} color="#f59e0b" />
                    <span>Due {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div style={{ fontWeight: '800', fontSize: '13px', color: '#6366f1' }}>{task.maxMarks} Marks</div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <a href={task.fileUrl} target="_blank" rel="noreferrer" className="btn" style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#fff', border: '1.5px solid #e2e8f0', color: '#475569', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <FileText size={16} /> View Ques
                  </a>
                  
                  <div style={{ flex: 1, position: 'relative' }}>
                    <button className="btn btn-primary" style={{ width: '100%', height: '45px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={uploadingId === task._id}>
                      {uploadingId === task._id ? 'Up...' : <><Upload size={16} /> Submit</>}
                    </button>
                    <input 
                      type="file" 
                      accept=".pdf"
                      onChange={(e) => handleFileUpload(e, task._id)}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
                      disabled={uploadingId === task._id}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {['All', 'Submitted', 'Graded'].map(status => (
              <button 
                key={status}
                onClick={() => setFilterStatus(status)}
                className="btn"
                style={{
                  background: filterStatus === status ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: filterStatus === status ? 'white' : 'var(--color-text-secondary)',
                  border: filterStatus === status ? 'none' : '1px solid var(--color-border)',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: 'var(--text-sm)'
                }}
              >
                {status}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {filteredSubmitted.length === 0 ? (
               <div style={{ gridColumn: '1 / -1', padding: '60px 40px', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px dashed var(--color-border)' }}>
                  <div style={{ width: '64px', height: '64px', background: 'var(--color-bg)', color: 'var(--color-text-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px' }}>📂</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-text-primary)' }}>No Submissions Found</h3>
                  <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>There are no assignments with the status: <strong style={{color:'var(--color-primary)'}}>{filterStatus}</strong></p>
               </div>
            ) : filteredSubmitted.map(task => (
              <div key={task._id} className="card hover-lift" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className="badge" style={{ background: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}>Assignment</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                     <StatusIcon status={task.studentStatus} />
                     {getStatusBadge(task.studentStatus)}
                  </div>
                </div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', marginBottom: '8px' }}>{task.title}</h3>
                
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                  Submitted on {new Date(task.mySubmission?.submittedAt).toLocaleDateString()}
                </div>
                
                {task.studentStatus === 'Graded' && task.mySubmission?.marks != null && (
                  <div style={{ background: 'var(--color-success-light)', padding: '12px', borderRadius: '8px', marginBottom: '16px', color: 'var(--color-success)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>{task.mySubmission.marks} / {task.maxMarks}</div>
                    <div style={{ fontSize: '12px' }}>{task.mySubmission.feedback}</div>
                  </div>
                )}
                
                <div style={{ marginTop: 'auto' }}>
                  <a href={task.mySubmission?.fileUrl} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', border: '1px solid var(--color-border)' }}>
                    <Eye size={16} style={{ marginRight: '8px' }} /> View Submission File
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
