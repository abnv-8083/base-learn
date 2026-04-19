"use client";

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Search, FileVideo, FileText, CheckCircle, XCircle, Clock, Eye, X, 
  Edit2, Trash2, AlertCircle, ExternalLink, Filter, LayoutGrid, List,
  Calendar, Award, ChevronRight, Layers, User as UserIcon, Play
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useConfirmStore } from '@/store/confirmStore';
import toast from 'react-hot-toast';
import { useSocket } from '@/context/SocketContext';

export default function InstructorContentVerification() {
  const { user } = useAuthStore();
  const socket = useSocket();
  const [content, setContent] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'approved', 'rejected'
  const [viewMode, setViewMode] = useState('list'); // Default to list as requested
  const confirm = useConfirmStore(s => s.confirm);

  // Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [activeTab, setActiveTab] = useState('content'); // 'content' or 'notes'
  
  // Rejection
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectItem, setRejectItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', batchIds: [] });

  const formatPreviewUrl = (url) => {
    if (!url) return '';
    const isExternal = url.includes('cloudinary.com') || url.includes('e2enetworks.net') || url.includes('objectstore');
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '';
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');

    if (isExternal) {
        return url;
    }

    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    
    // Fallback to backend API URL for relative paths
    if (url.startsWith('/')) return `${cleanBaseUrl}${url}`;
    return `${cleanBaseUrl}/uploads/${url}`;
  };

  useEffect(() => {
    if (user?.role === 'instructor') {
      fetchContent();
      fetchBatches();
    }
  }, [user, filter]);

  // Socket.io for real-time updates
  useEffect(() => {
    if (socket) {
      socket.on('content_submitted', () => {
        toast('New content submitted for review!', { icon: '🔔' });
        fetchContent();
      });
      return () => socket.off('content_submitted');
    }
  }, [socket]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/instructor/content?status=${filter}`);
      setContent(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
       toast.error(`Failed to load content.`);
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
    if (item.type === 'test' || item.type === 'assignment') {
        setDeadline(item.deadline ? new Date(item.deadline).toISOString().split('T')[0] : '');
        setMaxMarks(item.maxMarks || 100);
    }
    setActiveTab('content');
    setShowReviewModal(true);
  };

  const toggleBatch = (batchId) => {
    setSelectedBatches(prev => prev.includes(batchId) ? prev.filter(id => id !== batchId) : [...prev, batchId]);
  };

  const handleStatusUpdate = async (item, status, batchIds = [], reason = '') => {
    if (status === 'rejected' && !reason) {
      setRejectItem(item);
      setShowRejectModal(true);
      return;
    }

    setIsSubmitting(true);
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
      
      // Emit socket event for faculty to know status change
      if (socket) socket.emit('content_status_changed', { userId: item.faculty?._id, status });

      toast.success(`Content ${status === 'approved' ? 'published' : status} successfully.`);
      setShowReviewModal(false);
      setShowRejectModal(false);
      fetchContent();
    } catch (err) {
      toast.error(`Error updating content status`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitEdit = async () => {
    setIsSubmitting(true);
    try {
      await axios.put(`/api/instructor/content/${editItem._id}/manage`, {
        ...editForm,
        itemModel: editItem.itemModel,
        chapterId: editItem.chapterId
      });
      toast.success('Content updated');
      setShowEditModal(false);
      fetchContent();
    } catch (err) {
      toast.error('Failed to update');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    confirm({
      title: 'Remove assigned content?',
      message: 'This will remove the material from all assigned batches.',
      confirmText: 'Yes, Delete',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/instructor/content/${item._id}/manage?itemModel=${item.itemModel}${item.chapterId ? `&chapterId=${item.chapterId}` : ''}`);
          toast.success('Deleted');
          fetchContent();
        } catch (err) {
          toast.error('Delete failed');
        }
      }
    });
  };

  const filtered = content.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()));

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return '#10b981';
      case 'published': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'pending delete': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  return (
    <div style={{ padding: '0 0 80px 0', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 640px) {
          .content-page-header { flex-direction: column !important; align-items: flex-start !important; }
          .content-page-header h1 { font-size: 22px !important; }
          .content-view-toggles { align-self: flex-end; }
          .content-filter-row { flex-direction: column !important; align-items: stretch !important; }
          .content-filter-tabs { overflow-x: auto; scrollbar-width: none; }
          .content-filter-tabs::-webkit-scrollbar { display: none; }
          .content-search { max-width: 100% !important; min-width: 0 !important; }
          .content-table th:nth-child(1), .content-table td:nth-child(1) { display: none; }
        }
      `}</style>

      {/* Header Section */}
      <div style={{ marginBottom: '32px' }}>
        <div className="content-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '800', color: 'var(--color-text-primary)', letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>Content Verification</h1>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', margin: 0 }}>Review, configure, and publish academic materials submitted by your faculty.</p>
          </div>
          
          <div className="content-view-toggles" style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '4px', display: 'flex' }}>
              <button 
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'active-view' : ''}
                style={{ padding: '8px', borderRadius: '8px', background: viewMode === 'grid' ? 'var(--color-primary)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === 'grid' ? 'white' : 'var(--color-text-muted)', transition: '0.2s' }}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                style={{ padding: '8px', borderRadius: '8px', background: viewMode === 'list' ? 'var(--color-primary)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === 'list' ? 'white' : 'var(--color-text-muted)', transition: '0.2s' }}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters & Tabs */}
        <div className="content-filter-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="content-filter-tabs" style={{ display: 'flex', gap: '6px', background: 'var(--color-bg)', padding: '6px', borderRadius: '16px', border: '1px solid var(--color-border)', flexShrink: 0 }}>
            {['all', 'pending', 'approved', 'rejected'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                style={{ 
                  padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: '700', 
                  cursor: 'pointer', textTransform: 'capitalize', border: 'none', whiteSpace: 'nowrap',
                  background: filter === f ? 'var(--color-primary)' : 'transparent', 
                  color: filter === f ? 'white' : 'var(--color-text-secondary)',
                  transition: 'all 0.2s',
                  boxShadow: filter === f ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none'
                }}
              >
                 {f}
              </button>
            ))}
          </div>

          <div className="content-search" style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search content by title..."
              style={{ 
                width: '100%', padding: '14px 16px 14px 44px', borderRadius: '16px', 
                border: '1px solid var(--color-border)', background: 'var(--color-surface)',
                fontSize: '14px', outline: 'none', transition: 'border-color 0.2s'
              }} 
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '16px', color: 'var(--color-text-muted)', fontSize: '14px' }}>Fetching content queue...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '100px 20px', textAlign: 'center', background: 'var(--color-surface)', borderRadius: '24px', border: '1px dashed var(--color-border)' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--color-bg)', color: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
             <CheckCircle size={40} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '8px' }}>Queue is Clear</h3>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto' }}>No {filter !== 'all' ? filter : ''} materials currently require your attention.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: viewMode === 'list' ? '12px' : '24px',
          display: viewMode === 'grid' ? 'grid' : 'flex',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(340px, 1fr))' : 'none',
        }}>
          {/* List Header (Only for List Mode) */}
          {viewMode === 'list' && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '80px 1fr 150px 150px 150px 180px', 
              gap: '20px', 
              padding: '12px 24px', 
              color: 'var(--color-text-muted)', 
              fontSize: '12px', 
              fontWeight: '800', 
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <span>Preview</span>
              <span>Title & Subject</span>
              <span>Type</span>
              <span>Faculty</span>
              <span>Date</span>
              <span style={{ textAlign: 'right' }}>Actions</span>
            </div>
          )}

          {filtered.map(item => (
            viewMode === 'list' ? (
              // PREMIUM LIST ROW
              <div 
                key={item._id} 
                className="card-row"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '80px 1fr 150px 150px 150px 180px', 
                  alignItems: 'center',
                  gap: '20px',
                  padding: '16px 24px',
                  background: 'var(--color-surface)',
                  borderRadius: '16px',
                  border: '1px solid var(--color-border)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#0f172a', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                  {item.thumbnail ? (
                    <img src={formatPreviewUrl(item.thumbnail)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, color: 'white' }}>
                      {item.type === 'video' ? <FileVideo size={24} /> : <FileText size={24} />}
                    </div>
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: '600' }}>{item.subject?.name}</div>
                </div>

                <div>
                   <span style={{ 
                     padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', 
                     background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)',
                     textTransform: 'uppercase'
                   }}>
                     {item.type}
                   </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                    {item.faculty?.name?.[0]}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>{item.faculty?.name}</span>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  {item.approvalStatus === 'pending' ? (
                    <button 
                      onClick={() => openReviewModal(item)}
                      style={{ padding: '10px 16px', borderRadius: '10px', background: 'var(--color-primary)', color: 'white', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }}
                    >
                      <Eye size={16} /> Verify
                    </button>
                  ) : (
                    <>
                      <button onClick={() => { setEditItem(item); setEditForm({ title: item.title || '', description: item.description || '', batchIds: item.assignedTo || [] }); setShowEditModal(true); }} style={{ padding: '8px', borderRadius: '8px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(item)} style={{ padding: '8px', borderRadius: '8px', background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              // GRID CARD
              <div 
                key={item._id} 
                className="card hover-up"
                style={{ 
                  padding: '0', overflow: 'hidden', border: '1px solid var(--color-border)', 
                  display: 'flex', flexDirection: 'column',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {/* Thumbnail / Icon Plate */}
                <div style={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: '180px',
                  background: '#0f172a',
                  flexShrink: 0
                }}>
                  {item.thumbnail ? (
                    <img src={formatPreviewUrl(item.thumbnail)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', opacity: 0.3 }}>
                      {item.type === 'video' ? <FileVideo size={48} /> : <FileText size={48} />}
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <span style={{ 
                      padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', 
                      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: 'white',
                      textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      {item.type}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{item.title}</h3>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(item.approvalStatus), marginTop: '6px' }} />
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{item.subject?.name}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', padding: '12px', background: 'var(--color-bg)', borderRadius: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                        {item.faculty?.name?.[0]}
                    </div>
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{item.faculty?.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{new Date(item.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                    {item.approvalStatus === 'pending' ? (
                      <>
                        <button onClick={() => openReviewModal(item)} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'var(--color-primary)', color: 'white', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <Eye size={16} /> Review
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditItem(item); setEditForm({ title: item.title || '', description: item.description || '', batchIds: item.assignedTo || [] }); setShowEditModal(true); }} style={{ flex: 4, padding: '10px', borderRadius: '10px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <Edit2 size={16} /> Edit
                        </button>
                        <button onClick={() => handleDelete(item)} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Modern IMMERSIVE Review Modal */}
      {showReviewModal && previewItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(12px)' }}>
          <div className="fade-in" style={{ width: '96vw', maxWidth: '1400px', height: '92vh', background: 'var(--color-surface)', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {previewItem.type === 'video' ? <FileVideo size={20} /> : <FileText size={20} />}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', letterSpacing: '-0.02em' }}>{previewItem.title}</h2>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{previewItem.subject?.name}</span>
                      <span>•</span>
                      <span>Submitted by {previewItem.faculty?.name}</span>
                    </div>
                  </div>
               </div>
               <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => window.open(formatPreviewUrl(previewItem.url), '_blank')}
                    style={{ padding: '10px 18px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                  >
                    <ExternalLink size={16} /> External Window
                  </button>
                  <button onClick={() => setShowReviewModal(false)} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '12px', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                    <X size={20} />
                  </button>
               </div>
            </div>
            
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
               {/* Preview Panel */}
                <div style={{ flex: 1, background: '#020617', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  {/* Tab Selector for dual-content (Video + Notes) */}
                  {previewItem.url && previewItem.assignmentUrl && (
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', margin: '16px auto 0', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', width: 'fit-content', zIndex: 10 }}>
                      <button 
                        onClick={() => setActiveTab('content')}
                        style={{ 
                          padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                          background: activeTab === 'content' ? 'var(--color-primary)' : 'transparent',
                          color: activeTab === 'content' ? 'white' : 'rgba(255,255,255,0.6)'
                        }}
                      >
                        Video Content
                      </button>
                      <button 
                        onClick={() => setActiveTab('notes')}
                        style={{ 
                          padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                          background: activeTab === 'notes' ? 'var(--color-primary)' : 'transparent',
                          color: activeTab === 'notes' ? 'white' : 'rgba(255,255,255,0.6)'
                        }}
                      >
                        Attached Notes
                      </button>
                    </div>
                  )}

                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    {activeTab === 'content' ? (
                      previewItem.type === 'video' ? (
                        <video controls className="video-player" src={formatPreviewUrl(previewItem.url)} style={{ width: '100%', maxHeight: '100%', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <iframe 
                            src={previewItem.url?.toLowerCase().endsWith('.pdf') 
                              ? formatPreviewUrl(previewItem.url)
                              : formatPreviewUrl(previewItem.url)
                            } 
                            style={{ flex: 1, width: '100%', background: 'white', borderRadius: '16px', border: 'none' }} 
                            title="Preview"
                          />
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                            <button 
                              onClick={() => window.open(formatPreviewUrl(previewItem.url), '_blank')}
                              style={{ padding: '8px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                            >
                              Open in New Tab
                            </button>
                            <a 
                              href={formatPreviewUrl(previewItem.url)} 
                              download 
                              style={{ padding: '8px 20px', borderRadius: '10px', background: 'var(--color-primary)', color: 'white', textDecoration: 'none', fontSize: '12px', fontWeight: '700' }}
                            >
                              Download File
                            </a>
                          </div>
                        </div>
                      )
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <iframe 
                          src={formatPreviewUrl(previewItem.assignmentUrl)} 
                          style={{ flex: 1, width: '100%', background: 'white', borderRadius: '16px', border: 'none' }} 
                          title="Notes Preview"
                        />
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                          <button 
                            onClick={() => window.open(formatPreviewUrl(previewItem.assignmentUrl), '_blank')}
                            style={{ padding: '8px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            Open Notes in New Tab
                          </button>
                          <a 
                            href={formatPreviewUrl(previewItem.assignmentUrl)} 
                            download 
                            style={{ padding: '8px 20px', borderRadius: '10px', background: 'var(--color-primary)', color: 'white', textDecoration: 'none', fontSize: '12px', fontWeight: '700' }}
                          >
                            Download Notes
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

               {/* Configuration Panel */}
               <div style={{ width: '400px', borderLeft: '1px solid var(--color-border)', flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--color-surface)' }}>
                  <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                    {(previewItem.itemModel === 'Test' || previewItem.itemModel === 'Assignment') && (
                      <div style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                          <Calendar size={18} color="var(--color-primary)" />
                          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assessment Setup</h4>
                        </div>
                        <div style={{ display: 'grid', gap: '16px' }}>
                          <div>
                             <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>Submission Deadline</label>
                             <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', fontSize: '14px' }} />
                          </div>
                          <div>
                             <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>Maximum Score</label>
                             <input type="number" value={maxMarks} onChange={e => setMaxMarks(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', fontSize: '14px' }} />
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Layers size={18} color="var(--color-primary)" />
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Batch Assignment</h4>
                      </div>
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {batches.map(batch => (
                          <div 
                            key={batch._id} 
                            onClick={() => toggleBatch(batch._id)} 
                            style={{ 
                              padding: '16px', borderRadius: '16px', cursor: 'pointer',
                              border: '1px solid', 
                              background: selectedBatches.includes(batch._id) ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
                              borderColor: selectedBatches.includes(batch._id) ? 'var(--color-primary)' : 'var(--color-border)',
                              display: 'flex', alignItems: 'center', gap: '12px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ 
                              width: '20px', height: '20px', borderRadius: '6px', 
                              border: '2px solid', borderColor: selectedBatches.includes(batch._id) ? 'var(--color-primary)' : 'var(--color-border)',
                              background: selectedBatches.includes(batch._id) ? 'var(--color-primary)' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {selectedBatches.includes(batch._id) && <CheckCircle size={14} color="white" />}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '14px', fontWeight: '700', color: selectedBatches.includes(batch._id) ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{batch.name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{batch.students?.length || 0} enrolled students</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '24px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button 
                      onClick={() => handleStatusUpdate(previewItem, 'approved', selectedBatches)} 
                      disabled={isSubmitting || selectedBatches.length === 0}
                      style={{ 
                        width: '100%', padding: '16px', borderRadius: '16px', background: 'var(--color-primary)', 
                        color: 'white', border: 'none', fontWeight: '800', fontSize: '15px', 
                        cursor: disabled => isSubmitting ? 'not-allowed' : 'pointer',
                        opacity: selectedBatches.length === 0 ? 0.5 : 1
                      }}
                    >
                      {isSubmitting ? 'Publishing...' : 'Approve & Publish'}
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(previewItem, 'rejected')} 
                      style={{ width: '100%', padding: '14px', borderRadius: '16px', background: 'transparent', color: '#ef4444', border: '1px solid #fee2e2', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                    >
                      Reject Submission
                    </button>
                    {selectedBatches.length === 0 && <p style={{ fontSize: '11px', color: '#f59e0b', textAlign: 'center', margin: 0 }}>* Select at least one batch to publish.</p>}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Glassmorphic Reject Modal */}
      {showRejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(8px)' }}>
           <div className="card fade-in" style={{ width: '420px', padding: '32px', borderRadius: '24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                 <div style={{ width: '64px', height: '64px', background: '#fee2e2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <AlertCircle size={32} />
                 </div>
                 <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Reject Content</h3>
                 <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>Please provide a specific reason for the faculty to correct.</p>
              </div>
              
              <textarea 
                placeholder="E.g. Audio quality issues in second half..."
                rows={4}
                value={rejectionReason} 
                onChange={e => setRejectionReason(e.target.value)} 
                style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', fontSize: '14px', outline: 'none', resize: 'none' }}
              />

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                 <button onClick={() => setShowRejectModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid var(--color-border)', background: 'transparent', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                 <button 
                   onClick={() => handleStatusUpdate(rejectItem, 'rejected', [], rejectionReason)} 
                   disabled={!rejectionReason.trim() || isSubmitting}
                   style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#ef4444', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', opacity: rejectionReason.trim() ? 1 : 0.5 }}
                 >
                   Confirm Reject
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(8px)' }}>
           <div className="card fade-in" style={{ width: '500px', padding: '32px', borderRadius: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                 <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Manage Material</h3>
                 <button onClick={() => setShowEditModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
              </div>
              
              <div style={{ display: 'grid', gap: '20px' }}>
                 <div>
                    <label style={{ fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>Display Title</label>
                    <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }} />
                 </div>
                 
                 <div>
                    <label style={{ fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>Active Batch Assignments</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                      {batches.map(b => (
                        <div key={b._id} onClick={() => {
                          const ids = editForm.batchIds.includes(b._id) ? editForm.batchIds.filter(id => id !== b._id) : [...editForm.batchIds, b._id];
                          setEditForm({...editForm, batchIds: ids});
                        }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: editForm.batchIds.includes(b._id) ? 'rgba(99, 102, 241, 0.05)' : 'transparent', border: '1px solid', borderColor: editForm.batchIds.includes(b._id) ? 'var(--color-primary)' : 'var(--color-border)', borderRadius: '12px', cursor: 'pointer' }}>
                           <input type="checkbox" checked={editForm.batchIds.includes(b._id)} readOnly style={{ accentColor: 'var(--color-primary)' }} />
                           <span style={{ fontSize: '13px', fontWeight: '600', color: editForm.batchIds.includes(b._id) ? 'var(--color-primary)' : 'inherit' }}>{b.name}</span>
                        </div>
                      ))}
                    </div>
                 </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                 <button onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid var(--color-border)', background: 'white' }}>Cancel</button>
                 <button onClick={submitEdit} disabled={isSubmitting} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: 'var(--color-primary)', color: 'white', border: 'none', fontWeight: '700' }}>
                   {isSubmitting ? 'Saving...' : 'Save Updates'}
                 </button>
              </div>
           </div>
        </div>
      )}

      <style jsx>{`
        .hover-show {
          pointer-events: none;
        }
        .card:hover .hover-show {
          opacity: 1 !important;
          pointer-events: auto;
        }
        .video-player:hover {
          filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.2));
        }
      `}</style>
    </div>
  );
}
