"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, FileVideo, FileText, CheckCircle, XCircle, Clock, Eye, X, Edit2, Trash2, AlertCircle, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useConfirmStore } from '@/store/confirmStore';
import toast from 'react-hot-toast';
import VideoPlayer from '@/components/VideoPlayer';

export default function InstructorContentVerification() {
  const { user } = useAuthStore();
  const [content, setContent] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'approved', 'rejected'
  const confirm = useConfirmStore(s => s.confirm);

  // Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [pdfIframeError, setPdfIframeError] = useState(false);
  
  const formatPreviewUrl = (url) => {
    if (!url) return '';
    // Don't strip domains for Cloudinary
    if (url.includes('cloudinary.com')) return url;
    
    try {
      if (url.startsWith('http')) {
        const urlObj = new URL(url);
        // If it's the same host or localhost, we can use pathname
        if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
            return urlObj.pathname;
        }
        return url;
      }
    } catch (e) {
      console.error('URL parse error', e);
    }
    
    // If it's a relative path/filename, ensure it goes through the /uploads proxy
    if (!url.startsWith('http') && !url.startsWith('/') && !url.startsWith('blob:') && !url.startsWith('data:')) {
        return `/uploads/${url}`;
    }
    
    // Ensure relative paths starting with 'uploads' have a leading slash
    if (url.startsWith('uploads/')) return `/${url}`;
    
    return url;
  };
  
  const getGoogleViewerUrl = (url) => {
    const fullUrl = formatPreviewUrl(url);
    if (!fullUrl) return '';
    // Only use for absolute URLs (mostly Cloudinary or production backend)
    if (fullUrl.startsWith('http')) {
       return `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
    }
    return fullUrl;
  };

  // New States
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectItem, setRejectItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', batchIds: [] });

  useEffect(() => {
    if (user?.role === 'instructor') {
      fetchContent();
      fetchBatches();
    }
  }, [user, filter]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/instructor/content?status=${filter}`);
      setContent(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
       toast.error(`Failed to load ${filter} content.`);
       setContent([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const { data } = await axios.get('/api/instructor/batches?managed=true');
      setBatches(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error('Failed to load batches');
    }
  };

  const openReviewModal = (item) => {
    setPreviewItem(item);
    setSelectedBatches(item.assignedTo || []);
    setPdfIframeError(false);
    // Prefill deadline and maxMarks if assessment
    if (item.type === 'test' || item.type === 'assignment') {
        setDeadline(item.deadline ? new Date(item.deadline).toISOString().split('T')[0] : '');
        setMaxMarks(item.maxMarks || 100);
    }
    setShowReviewModal(true);
  };

  const toggleBatch = (batchId) => {
    if (selectedBatches.includes(batchId)) {
      setSelectedBatches(selectedBatches.filter(id => id !== batchId));
    } else {
      setSelectedBatches([...selectedBatches, batchId]);
    }
  };

  const handleStatusUpdate = async (item, status, batchIds = [], reason = '') => {
    if (status === 'rejected' && !reason) {
      setRejectItem(item);
      setShowRejectModal(true);
      return;
    }

    if (status === 'approved') setIsSubmitting(true);
    try {
      await axios.patch(`/api/instructor/content/${item._id}/status`, { 
        approvalStatus: status,
        itemModel: item.itemModel,
        chapterId: item.chapterId,
        batchIds: batchIds,
        rejectionReason: reason,
        deadline: deadline,
        maxMarks: maxMarks
      });
      toast.success(`Content ${status} successfully.`);
      setShowReviewModal(false);
      setShowRejectModal(false);
      setPreviewItem(null);
      setRejectItem(null);
      setRejectionReason('');
      fetchContent();
    } catch (err) {
      toast.error(`Failed to mark content as ${status}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setEditForm({
      title: item.title,
      description: item.description || '',
      batchIds: item.assignedTo || []
    });
    setShowEditModal(true);
  };

  const submitEdit = async () => {
    setIsSubmitting(true);
    try {
      await axios.put(`/api/instructor/content/${editItem._id}/manage`, {
        ...editForm,
        itemModel: editItem.itemModel,
        chapterId: editItem.chapterId
      });
      toast.success('Content updated successfully');
      setShowEditModal(false);
      fetchContent();
    } catch (err) {
      toast.error('Failed to update content');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    confirm({
      title: 'Permanently Remove Content?',
      message: 'Are you sure you want to permanently remove this assigned content? This action cannot be undone and will remove it from all assigned student dashboards.',
      confirmText: 'Delete Permanently',
      type: 'danger',
      icon: Trash2,
      onConfirm: async () => {
        try {
          await axios.delete(`/api/instructor/content/${item._id}/manage?itemModel=${item.itemModel}${item.chapterId ? `&chapterId=${item.chapterId}` : ''}`);
          toast.success('Content removed successfully');
          fetchContent();
        } catch (err) {
          toast.error('Failed to delete content');
        }
      }
    });
  };

  const filtered = content.filter(c => 
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">Content Verification</h1>
          <p className="page-subtitle">Review and approve academic materials submitted by faculty members.</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', background: 'var(--color-bg)', padding: '4px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'capitalize', border: 'none', background: filter === f ? 'var(--color-primary)' : 'transparent', color: filter === f ? 'white' : 'var(--color-text-secondary)', transition: 'all 0.2s' }}
            >
               {f}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search content titles...`}
            style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '14px' }} />
        </div>
      </div>

      {loading ? <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }}></div> : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Resource Title</th>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Submitted By</th>
                <th style={{ padding: '16px 20px', textAlign: 'center' }}>Type</th>
                <th style={{ padding: '16px 20px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '16px 20px', textAlign: 'center' }}>Verification Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '80px 20px', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', background: 'var(--color-bg)', color: 'var(--color-text-muted)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                       <CheckCircle size={32} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>All Caught Up!</h3>
                    <p style={{ color: 'var(--color-text-secondary)' }}>No {filter !== 'all' ? filter : ''} content submissions waiting in your queue.</p>
                  </td>
                </tr>
              ) : filtered.map(item => (
                <tr key={item._id} style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '48px', height: '40px', borderRadius: '8px', background: item.type === 'video' ? '#e0e7ff' : '#fef3c7', color: item.type === 'video' ? '#4f46e5' : '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          item.type === 'video' ? <FileVideo size={20} /> : <FileText size={20} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{item.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <Clock size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.faculty?.name || 'Unknown Faculty'}</div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{item.subject?.name || 'Unassigned Subject'}</div>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', textTransform: 'capitalize', color: 'var(--color-text-secondary)' }}>{item.type}</span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', 
                      background: item.approvalStatus === 'approved' ? '#dcfce7' : item.approvalStatus === 'rejected' ? '#fee2e2' : '#fef9c3', 
                      color: item.approvalStatus === 'approved' ? '#166534' : item.approvalStatus === 'rejected' ? '#991b1b' : '#854d0e', textTransform: 'capitalize' 
                    }}>
                      {item.approvalStatus || 'pending'}
                    </span>
                  </td>
                   <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    {item.approvalStatus === 'pending' ? (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button onClick={() => openReviewModal(item)} className="btn btn-ghost" style={{ padding: '8px', color: 'var(--color-primary)', background: '#e0e7ff' }} title="Review & Assign">
                          <Eye size={16} /> Review
                        </button>
                        <button onClick={() => handleStatusUpdate(item, 'rejected')} className="btn btn-ghost" style={{ padding: '8px', color: 'var(--color-error)', background: '#fee2e2' }} title="Reject">
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    ) : item.approvalStatus === 'pending delete' ? (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button onClick={() => handleDelete(item)} className="btn btn-ghost" style={{ padding: '8px', color: 'var(--color-error)', background: '#fee2e2', fontWeight: 'bold' }}>
                          <Trash2 size={16} /> Confirm Deletion
                        </button>
                      </div>
                    ) : item.approvalStatus === 'approved' ? (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button onClick={() => handleEdit(item)} className="btn btn-ghost" style={{ padding: '8px', color: 'var(--color-primary)', background: '#e0e7ff' }}>
                          <Edit2 size={16} /> Edit
                        </button>
                        <button onClick={() => handleDelete(item)} className="btn btn-ghost" style={{ padding: '8px', color: 'var(--color-error)', background: '#fee2e2' }}>
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    ) : (
                       <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Actioned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && previewItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 45, 107, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card fade-in" style={{ width: '95%', maxWidth: '1000px', height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', background: 'var(--color-bg)', borderBottom: `2px solid var(--color-border)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Review Content</h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', gap: '8px' }}>
                     <strong>{previewItem.title}</strong> • {previewItem.subject?.name} • {previewItem.faculty?.name}
                  </p>
               </div>
               <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button 
                    onClick={() => window.open(formatPreviewUrl(previewItem.url), '_blank')}
                    style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                  >
                    <ExternalLink size={16} /> Open Full Screen
                  </button>
                  <button onClick={() => setShowReviewModal(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
               </div>
            </div>
            
            {/* Modal Content */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
               {/* Left: Preview Area */}
               <div style={{ flex: 2, background: '#0f172a', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {previewItem.url ? (
                      previewItem.type === 'video' ? (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                           <video controls src={formatPreviewUrl(previewItem.url)} style={{ width: '100%', flex: 1, objectFit: 'contain' }} />
                           {previewItem.assignmentUrl && (
                              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FileText size={20} color="#f59e0b" />
                                    <div style={{ color: 'white' }}>
                                       <div style={{ fontSize: '13px', fontWeight: 'bold' }}>Associated Exercise Found</div>
                                       <div style={{ fontSize: '11px', opacity: 0.7 }}>Review supplementary PDF material</div>
                                    </div>
                                 </div>
                                 <button onClick={() => window.open(formatPreviewUrl(previewItem.assignmentUrl), '_blank')} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px', background: '#f59e0b', color: 'white', border: 'none' }}>
                                    View PDF
                                 </button>
                              </div>
                           )}
                        </div>
                      ) : (
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                          <iframe 
                            src={formatPreviewUrl(previewItem.url)} 
                            title="Document Preview" 
                            style={{ width: '100%', height: '100%', border: 'none', background: 'white' }}
                            onError={() => setPdfIframeError(true)}
                          />
                          <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                             <button 
                                onClick={() => {
                                  // Toggle to Google Viewer as fallback
                                  const frame = document.querySelector('iframe');
                                  if (frame) frame.src = getGoogleViewerUrl(previewItem.url);
                                }}
                                style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.9)', border: '1px solid #ddd', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                             >
                               Try Alternative Viewer
                             </button>
                          </div>
                        </div>
                      )
                   ) : (
                      <div style={{ color: '#94a3b8', textAlign: 'center' }}>
                         <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>{previewItem.type === 'video' ? '🎬' : '📄'}</div>
                         <p>No preview media available</p>
                      </div>
                   )}
                  </div>
               </div>

               {/* Right: Batch Assignment Area */}
               <div style={{ flex: 1, width: '320px', background: 'var(--color-bg)', borderLeft: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', background: '#f8fafc' }}>
                     <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '4px' }}>Assignment Controls</h3>
                     <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>Review academic configuration before publishing.</p>
                  </div>
                  
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
                     {(previewItem.type === 'test' || previewItem.type === 'assignment') && (
                       <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
                          <div>
                             <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Submission Deadline</label>
                             <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--color-border)', fontSize: '13px' }} />
                          </div>
                          <div>
                             <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Maximum Marks</label>
                             <input type="number" value={maxMarks} onChange={e => setMaxMarks(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--color-border)', fontSize: '13px' }} placeholder="E.g. 100" />
                          </div>
                       </div>
                     )}
                     
                     <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '4px' }}>Assign Batches</h3>
                     <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>Select target batches.</p>
                  </div>
                  
                  <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                     {batches.length === 0 ? (
                        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '20px' }}>No active batches found.</p>
                     ) : (
                        batches.map(batch => (
                           <div key={batch._id} onClick={() => toggleBatch(batch._id)} style={{ display: 'flex', alignItems: 'center', padding: '12px', margin: '4px 0', border: '1px solid', borderColor: selectedBatches.includes(batch._id) ? 'var(--color-primary)' : 'var(--color-border)', borderRadius: '8px', cursor: 'pointer', background: selectedBatches.includes(batch._id) ? 'var(--color-primary-light)' : 'transparent', transition: 'all 0.2s' }}>
                              <input type="checkbox" checked={selectedBatches.includes(batch._id)} readOnly style={{ marginRight: '12px', accentColor: 'var(--color-primary)' }} />
                              <div>
                                 <div style={{ fontSize: '14px', fontWeight: '600', color: selectedBatches.includes(batch._id) ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{batch.name}</div>
                                 <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{batch.studyClass?.name} ({batch.students?.length || 0} students)</div>
                               </div>
                           </div>
                        ))
                     )}
                  </div>
               </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
               <button onClick={() => setShowReviewModal(false)} className="btn btn-secondary" disabled={isSubmitting}>Cancel</button>
               <button onClick={() => handleStatusUpdate(previewItem, 'approved', selectedBatches)} className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }} disabled={isSubmitting}>
                  <CheckCircle size={16} /> {isSubmitting ? 'Approving...' : 'Approve & Assign'}
               </button>
            </div>
          </div>
        </div>
      )}
      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 45, 107, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
           <div className="card" style={{ width: '90%', maxWidth: '400px', padding: 0 }}>
              <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={20} color="var(--color-error)" /> Reject Content
                 </h3>
                 <button onClick={() => setShowRejectModal(false)} className="btn btn-ghost" style={{ padding: '4px' }}><X size={20} /></button>
              </div>
              <div style={{ padding: '20px' }}>
                 <label className="form-label">Reason for Rejection <span style={{color:'red'}}>*</span></label>
                 <textarea 
                   className="form-input" 
                   rows={4} 
                   placeholder="E.g. Video quality is too low, or incorrect subject mapping." 
                   value={rejectionReason} 
                   onChange={e => setRejectionReason(e.target.value)} 
                 />
                 <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>This reason will be visible to the faculty member.</p>
              </div>
              <div style={{ padding: '16px 20px', background: 'var(--color-bg)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                 <button onClick={() => setShowRejectModal(false)} className="btn btn-ghost">Cancel</button>
                 <button 
                   onClick={() => handleStatusUpdate(rejectItem, 'rejected', [], rejectionReason)} 
                   className="btn btn-primary" 
                   style={{ background: 'var(--color-error)' }}
                   disabled={!rejectionReason.trim()}
                 >Confirm Rejection</button>
              </div>
           </div>
        </div>
      )}

      {/* Edit Assigned Content Modal */}
      {showEditModal && editItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 45, 107, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
           <div className="card" style={{ width: '90%', maxWidth: '500px', padding: 0 }}>
              <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Edit Assigned Content</h3>
                 <button onClick={() => setShowEditModal(false)} className="btn btn-ghost" style={{ padding: '4px' }}><X size={20} /></button>
              </div>
              <div style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
                 <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Title</label>
                    <input className="form-input" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                 </div>
                 <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Description</label>
                    <textarea className="form-input" rows={3} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                 </div>
                 <label className="form-label">Update Batch Assignments</label>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginTop: '8px' }}>
                    {batches.map(b => (
                      <div key={b._id} onClick={() => {
                        const ids = editForm.batchIds.includes(b._id) ? editForm.batchIds.filter(id => id !== b._id) : [...editForm.batchIds, b._id];
                        setEditForm({...editForm, batchIds: ids});
                      }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: editForm.batchIds.includes(b._id) ? '#eff6ff' : 'white', border: '1px solid', borderColor: editForm.batchIds.includes(b._id) ? '#3b82f6' : '#e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
                         <input type="checkbox" checked={editForm.batchIds.includes(b._id)} readOnly />
                         <span style={{ fontSize: '13px', fontWeight: '500' }}>{b.name}</span>
                      </div>
                    ))}
                 </div>
              </div>
              <div style={{ padding: '16px 20px', background: 'var(--color-bg)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                 <button onClick={() => setShowEditModal(false)} className="btn btn-ghost">Cancel</button>
                 <button onClick={submitEdit} className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
