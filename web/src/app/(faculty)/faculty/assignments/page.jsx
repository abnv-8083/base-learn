"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Eye, CheckCircle, Clock, Search, Filter, SortAsc, SortDesc, 
  FileText, User, Calendar, Award, ChevronRight, X, AlertCircle, 
  Users, ArrowLeft, ExternalLink, Send, ClipboardCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function FacultyAssignments() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assignment'); // 'assignment' or 'test'
  
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [gradingId, setGradingId] = useState(null);
  const [gradeModal, setGradeModal] = useState({ 
    open: false, assessmentId: null, studentId: null, 
    maxMarks: 100, type: 'assignment', title: '', studentName: '' 
  });
  const [gradeData, setGradeData] = useState({ marks: '', feedback: '' });

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/faculty/assessments/forwarded');
      const newSubmissions = res.data.data || [];
      setSubmissions(newSubmissions);
      
      // If we have a selected assessment, update it with fresh data
      if (selectedAssessment) {
        // Group new data to find the matching assessment
        const grouped = newSubmissions.filter(s => s.assessmentType === selectedAssessment.assessmentType)
          .reduce((acc, sub) => {
             const id = sub.assessmentId;
             if (!acc[id]) {
               acc[id] = {
                 _id: id,
                 title: sub.assessmentTitle,
                 assessmentType: sub.assessmentType,
                 maxMarks: sub.maxMarks,
                 deadline: sub.deadline,
                 submissionsCount: 0,
                 pendingCount: 0,
                 submissions: []
               };
             }
             acc[id].submissionsCount++;
             if (sub.status !== 'graded') acc[id].pendingCount++;
             acc[id].submissions.push(sub);
             return acc;
          }, {});
        
        if (grouped[selectedAssessment._id]) {
          setSelectedAssessment(grouped[selectedAssessment._id]);
        }
      }
    } catch (err) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleGradeSubmit = async () => {
    if (!gradeData.marks) {
      toast.error('Marks are required');
      return;
    }
    
    try {
      const sid = typeof gradeModal.studentId === 'object' ? gradeModal.studentId._id : gradeModal.studentId;
      setGradingId(sid);
      await axios.post(`/api/faculty/assessments/${gradeModal.assessmentId}/grade/${sid}`, {
        marks: Number(gradeData.marks),
        feedback: gradeData.feedback || '',
        type: gradeModal.type
      });
      toast.success('Graded successfully!');
      setGradeModal({ ...gradeModal, open: false });
      setGradeData({ marks: '', feedback: '' });
      fetchSubmissions();
      // If we are in the detail view, update the local view if needed (fetchSubmissions handles it)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to grade');
    } finally {
      setGradingId(null);
    }
  };

  // Group submissions by Assessment ID for the List View
  const groupedSubmissions = submissions
    .filter(s => s.assessmentType === activeTab)
    .reduce((acc, sub) => {
       const id = sub.assessmentId;
       if (!acc[id]) {
         acc[id] = {
           _id: id,
           title: sub.assessmentTitle,
           assessmentType: sub.assessmentType,
           maxMarks: sub.maxMarks,
           deadline: sub.deadline,
           submissionsCount: 0,
           pendingCount: 0,
           submissions: []
         };
       }
       acc[id].submissionsCount++;
       if (sub.status !== 'graded') acc[id].pendingCount++;
       acc[id].submissions.push(sub);
       return acc;
    }, {});

  const assessmentCards = Object.values(groupedSubmissions).sort((a, b) => new Date(b.deadline || 0) - new Date(a.deadline || 0));

  if (loading && !selectedAssessment) return <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }} />;

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
           {selectedAssessment && (
             <button onClick={() => setSelectedAssessment(null)} style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--color-primary)' }}>
                <ArrowLeft size={20} />
             </button>
           )}
           <div>
              <h1 className="page-title">{selectedAssessment ? `Grade Hub: ${selectedAssessment.title}` : 'Faculty Grade Hub'}</h1>
              <p className="page-subtitle">
                {selectedAssessment ? `Evaluating student submissions forwarded for ${selectedAssessment.assessmentType} grading.` : 'Review and grade student work forwarded by the Primary Instructor.'}
              </p>
           </div>
        </div>
      </div>

      {!selectedAssessment ? (
        <>
          {/* Tabs for Dashboard */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: 'var(--color-bg)', padding: '6px', borderRadius: '14px', width: 'fit-content', border: '1px solid var(--color-border)' }}>
             {['assignment', 'test'].map(type => (
               <button 
                  key={type}
                  onClick={() => setActiveTab(type)}
                  style={{ 
                    padding: '10px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', border: 'none', transition: 'all 0.3s',
                    background: activeTab === type ? 'var(--color-primary)' : 'transparent',
                    color: activeTab === type ? 'white' : 'var(--color-text-secondary)',
                    textTransform: 'capitalize'
                  }}
               >
                 {type}s
               </button>
             ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
            {assessmentCards.map(item => (
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
                onClick={() => setSelectedAssessment(item)}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: item.pendingCount > 0 ? 'var(--color-warning)' : 'var(--color-text-secondary)', fontSize: '13px', fontWeight: '700' }}>
                      {item.pendingCount > 0 ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                      {item.pendingCount} Pending
                    </div>
                  </div>
                  
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{item.title}</h3>
                  <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Max Marks: {item.maxMarks}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--color-bg)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                     <Calendar size={16} color="var(--color-primary)" />
                     <div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Deadline</div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                          {item.deadline ? new Date(item.deadline).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'No Deadline'}
                        </div>
                     </div>
                  </div>
                </div>
                <div style={{ padding: '16px 24px', background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-primary)' }}>Review & Grade</span>
                   <ChevronRight size={18} color="var(--color-primary)" />
                </div>
              </div>
            ))}

            {assessmentCards.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 40px', background: 'white', borderRadius: '32px', border: '2px dashed var(--color-border)' }}>
                 <ClipboardCheck size={48} color="var(--color-text-muted)" style={{ marginBottom: '16px' }} />
                 <h4 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '800' }}>No {activeTab}s Found</h4>
                 <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '15px' }}>There are currently no {activeTab}s with forwarded submissions in your queue.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Users size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Student Submissions</h3>
             </div>
             <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ padding: '6px 14px', borderRadius: '20px', background: '#f0fdf4', color: '#166534', fontSize: '12px', fontWeight: '800', border: '1px solid #bbf7d0' }}>
                   Graded: {selectedAssessment.submissions.filter(s => s.status === 'graded').length}
                </span>
                <span style={{ padding: '6px 14px', borderRadius: '20px', background: '#fef9c3', color: '#854d0e', fontSize: '12px', fontWeight: '800', border: '1px solid #fef08a' }}>
                   Pending: {selectedAssessment.submissions.filter(s => s.status !== 'graded').length}
                </span>
             </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Student</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Forwarded At</th>
                  <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Submission File</th>
                  <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Score / Max</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedAssessment.submissions.map(sub => (
                  <tr key={`${sub.assessmentId}-${sub.studentId}`} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '20px 24px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-bg)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: 'var(--color-primary)' }}>
                             {sub.studentName?.charAt(0) || 'S'}
                          </div>
                          <div>
                             <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{sub.studentName || 'Unknown Student'}</div>
                             <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>{sub.studentEmail}</div>
                          </div>
                       </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: '600' }}>
                          <Clock size={14} color="var(--color-text-secondary)" />
                          {sub.forwardedAt ? new Date(sub.forwardedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Recently'}
                       </div>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                       <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" 
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', textDecoration: 'none', fontSize: '13px', fontWeight: '800', border: '1px solid #bae6fd' }}>
                          <FileText size={16} /> View PDF <ExternalLink size={14} />
                       </a>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                       {sub.status === 'graded' ? (
                          <div style={{ fontWeight: '900', color: 'var(--color-success)', fontSize: '16px' }}>
                             {sub.marks} <span style={{ color: 'var(--color-text-muted)', fontSize: '13px', fontWeight: '500' }}>/ {selectedAssessment.maxMarks}</span>
                          </div>
                       ) : (
                          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Not Graded</span>
                       )}
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                       <button 
                          onClick={() => {
                            setGradeModal({ 
                               open: true, 
                               assessmentId: sub.assessmentId, 
                               studentId: sub.studentId, 
                               maxMarks: selectedAssessment.maxMarks, 
                               type: activeTab,
                               title: selectedAssessment.title,
                               studentName: sub.studentName
                            });
                            // Pre-fill if already graded
                            if (sub.status === 'graded') {
                               setGradeData({ marks: sub.marks.toString(), feedback: sub.feedback || '' });
                            } else {
                               setGradeData({ marks: '', feedback: '' });
                            }
                          }}
                          className={`btn ${sub.status === 'graded' ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                       >
                          <Award size={16} /> {sub.status === 'graded' ? 'Update Grade' : 'Submit Grade'}
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {gradeModal.open && (
         <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 45, 107, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(8px)', padding: '20px' }}>
            <div className="card fade-in" style={{ width: '100%', maxWidth: '480px', padding: 0, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
               <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                     <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: 'var(--color-text-primary)' }}>Evaluate Student</h3>
                     <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>{gradeModal.studentName} • {gradeModal.title}</p>
                  </div>
                  <button onClick={() => setGradeModal({ ...gradeModal, open: false })} className="btn btn-ghost" style={{ padding: '8px' }}><X size={20} /></button>
               </div>

               <div style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '20px' }}>
                     <label className="form-label" style={{ fontWeight: '800', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Marks Awarded (Out of {gradeModal.maxMarks})</label>
                     <input 
                        type="number" 
                        className="form-input" 
                        max={gradeModal.maxMarks}
                        value={gradeData.marks}
                        onChange={e => setGradeData({ ...gradeData, marks: e.target.value })}
                        placeholder="Enter score..."
                        style={{ height: '48px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}
                     />
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                     <label className="form-label" style={{ fontWeight: '800', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Feedback Notes (Optional)</label>
                     <textarea 
                        className="form-input" 
                        rows={4} 
                        value={gradeData.feedback}
                        onChange={e => setGradeData({ ...gradeData, feedback: e.target.value })}
                        placeholder="Write constructive feedback for the student..."
                        style={{ borderRadius: '12px', padding: '12px', fontSize: '14px' }}
                     />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                     <button onClick={() => setGradeModal({ ...gradeModal, open: false })} style={{ flex: 1, height: '48px', borderRadius: '12px', background: 'var(--color-bg)', color: 'var(--color-text-primary)', fontWeight: '800', border: '1px solid var(--color-border)', cursor: 'pointer' }}>Cancel</button>
                     <button 
                        onClick={handleGradeSubmit} 
                        disabled={gradingId || !gradeData.marks}
                        className="btn btn-primary"
                        style={{ flex: 2, height: '48px', borderRadius: '12px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                     >
                        {gradingId ? <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent' }}></div> : <><CheckCircle size={18} /> Submit Grade</>}
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
