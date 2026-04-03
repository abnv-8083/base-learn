"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ClipboardCheck, Search, Users, Clock, Send, 
  FileText, ArrowLeft, ExternalLink, CheckCircle,
  Filter, Calendar, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MarkingCenter() {
  const [assessments, setAssessments] = useState({ tests: [], assignments: [] });
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submittingForward, setSubmittingForward] = useState(null);

  useEffect(() => {
    fetchActiveAssessments();
  }, []);

  const fetchActiveAssessments = async () => {
    try {
      const { data } = await axios.get('/api/instructor/assessments/active');
      setAssessments(data.data);
    } catch (err) {
      toast.error('Failed to load active assessments');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (assessment) => {
    setSubmissionsLoading(true);
    setSelectedAssessment(assessment);
    try {
      const { data } = await axios.get(`/api/instructor/assessments/${assessment._id}/${assessment.assessmentType}/submissions`);
      setSubmissions(data.data || []);
    } catch (err) {
      toast.error('Failed to load student submissions');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleForward = async (studentId) => {
    if (!selectedAssessment) return;
    setSubmittingForward(studentId);
    try {
      await axios.post(`/api/instructor/assessments/${selectedAssessment._id}/${selectedAssessment.assessmentType}/forward/${studentId}`);
      toast.success('Successfully forwarded to faculty for grading');
      // Refresh submissions
      fetchSubmissions(selectedAssessment);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to forward submission');
    } finally {
      setSubmittingForward(null);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }}></div>;

  const combinedAssessments = [...assessments.tests, ...assessments.assignments];

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
           {selectedAssessment && (
             <button onClick={() => setSelectedAssessment(null)} style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--color-primary)' }}>
                <ArrowLeft size={20} />
             </button>
           )}
           <div>
              <h1 className="page-title">{selectedAssessment ? `Marking Center: ${selectedAssessment.title}` : 'Marking Center'}</h1>
              <p className="page-subtitle">
                {selectedAssessment ? `Review and forward student submissions to faculty for ${selectedAssessment.assessmentType} grading.` : 'Consolidated view of all active assignments and tests requiring submission review.'}
              </p>
           </div>
        </div>
      </div>

      {!selectedAssessment ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {combinedAssessments.map(item => (
            <div key={item._id} className="card hover-lift" 
              style={{ 
                cursor: 'pointer', 
                border: '1.5px solid var(--color-border)',
                borderRadius: '20px',
                overflow: 'hidden',
                background: 'white',
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={() => fetchSubmissions(item)}
            >
              <div style={{ padding: '24px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '11px', 
                    fontWeight: '800', 
                    background: item.assessmentType === 'test' ? '#fee2e2' : '#e0f2fe', 
                    color: item.assessmentType === 'test' ? '#991b1b' : '#075985',
                    textTransform: 'uppercase'
                  }}>
                    {item.assessmentType}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: '500' }}>
                    <Users size={14} /> {(item.submissions || []).length} Submissions
                  </div>
                </div>
                
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{item.title}</h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>{item.subject?.name} • {item.chapter?.name}</p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--color-bg)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                   <Calendar size={16} color="var(--color-primary)" />
                   <div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Submission Deadline</div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                        {item.deadline ? new Date(item.deadline).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'No Deadline'}
                      </div>
                   </div>
                </div>
              </div>
              <div style={{ padding: '16px 24px', background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-primary)' }}>Review Submissions</span>
                 <ChevronRight size={18} color="var(--color-primary)" />
              </div>
            </div>
          ))}
          {combinedAssessments.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'white', borderRadius: '24px', border: '1.5px dashed var(--color-border)' }}>
               <ClipboardCheck size={48} color="var(--color-text-muted)" style={{ marginBottom: '16px' }} />
               <h4 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '800' }}>No active assessments</h4>
               <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Publish an assignment or test to begin receiving and tracking student submissions here.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Users size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Student Submissions</h3>
             </div>
             <span style={{ padding: '6px 14px', borderRadius: '20px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', fontSize: '14px', fontWeight: '700' }}>
               Total: {submissions.length}
             </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Student</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Submitted At</th>
                  <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Work (PDF)</th>
                  <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Current Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {submissionsLoading ? (
                  <tr><td colSpan="5" style={{ padding: '60px', textAlign: 'center' }}><div className="spinner"></div></td></tr>
                ) : submissions.map(sub => (
                  <tr key={sub._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '20px 24px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-bg)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: 'var(--color-primary)' }}>
                             {sub.studentId?.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                             <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{sub.studentId?.name || 'Unknown Student'}</div>
                             <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>{sub.studentId?.email}</div>
                          </div>
                       </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: '600' }}>
                          <Clock size={14} color="var(--color-text-secondary)" />
                          {new Date(sub.submittedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                       </div>
                       {sub.isLate && <span style={{ fontSize: '11px', color: 'var(--color-error)', fontWeight: '800', textTransform: 'uppercase' }}>Late Submission</span>}
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                       <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" 
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', textDecoration: 'none', fontSize: '13px', fontWeight: '800', border: '1px solid #bae6fd' }}>
                          <FileText size={16} /> View PDF <ExternalLink size={14} />
                       </a>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                       <span style={{ 
                         padding: '4px 12px', 
                         borderRadius: '20px', 
                         fontSize: '12px', 
                         fontWeight: '800', 
                         background: sub.status === 'graded' ? '#dcfce7' : (sub.status === 'forwarded' ? '#fdf9c4' : '#f1f5f9'), 
                         color: sub.status === 'graded' ? '#166534' : (sub.status === 'forwarded' ? '#854d0e' : '#475569'),
                         textTransform: 'capitalize'
                       }}>
                         {sub.status}
                       </span>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                       {sub.status === 'submitted' && (
                         <button 
                            disabled={submittingForward === sub.studentId?._id}
                            onClick={() => handleForward(sub.studentId?._id)}
                            style={{ padding: '10px 18px', borderRadius: '10px', background: 'var(--color-primary)', color: 'white', border: 'none', fontSize: '13px', fontWeight: '900', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: submittingForward === sub.studentId?._id ? 0.7 : 1 }}
                         >
                            {submittingForward === sub.studentId?._id ? 'FORWARDING...' : <><Send size={16} /> FORWARD TO FACULTY</>}
                         </button>
                       )}
                       {sub.status === 'forwarded' && (
                         <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: '800', fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                           <CheckCircle size={14} /> Pending Faculty Grading
                         </span>
                       )}
                       {sub.status === 'graded' && (
                         <div style={{ textAlign: 'right' }}>
                            <div style={{ color: 'var(--color-success)', fontSize: '14px', fontWeight: '950' }}>{sub.marks} / {selectedAssessment.maxMarks}</div>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginTop: '2px' }}>Final Score</div>
                         </div>
                       )}
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && !submissionsLoading && (
                  <tr>
                    <td colSpan="5" style={{ padding: '80px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                       <Users size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
                       <h4 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '800' }}>No submissions yet</h4>
                       <p style={{ margin: 0, fontSize: '14px' }}>Once students submit their work, it will appear here for your review and forwarding.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
