"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, FileText, CheckCircle, Search, Clock, Plus, X, ListPlus, Edit2, Trash2, Filter, BarChart2, Users, CheckCircle2, AlertCircle, LayoutGrid } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useConfirmStore } from '@/store/confirmStore';
import toast from 'react-hot-toast';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import PdfPreviewModal from '@/components/PdfPreviewModal';

export default function FacultyContent() {
  const { user } = useAuthStore();
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const confirm = useConfirmStore(s => s.confirm);

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };
  
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected
  
  const [previewModal, setPreviewModal] = useState({ isOpen: false, url: '', title: '' });
  
  const [form, setForm] = useState({ title: '', description: '', subjectId: '', chapterId: '', type: 'video', file: null, assignmentFile: null, thumbnail: null });
  const [subjects, setSubjects] = useState([]);
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapterName, setNewChapterName] = useState('');
  const [isChapterSaving, setIsChapterSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStartTime, setUploadStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (user?.role === 'faculty') {
      fetchMyContent();
      fetchSubjects();
    }
  }, [user]);

  const fetchMyContent = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/faculty/content');
      setContentList(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      toast.error('Failed to load your syllabus content.');
      setContentList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get('/api/faculty/subjects');
      setSubjects(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.warn('Failed to load mapped subjects:', err.message);
    }
  };

  const handleCreateChapter = async () => {
    if (!form.subjectId || !newChapterName.trim()) {
      toast.error('Select a subject and enter a chapter name!');
      return;
    }
    
    setIsChapterSaving(true);
    try {
      const res = await axios.post('/api/faculty/chapters', { 
        name: newChapterName.trim(), 
        subjectId: form.subjectId 
      });
      toast.success('Chapter created successfully!');
      setNewChapterName('');
      setShowAddChapter(false);
      await fetchSubjects(); // Refresh list
      setForm(prev => ({ ...prev, chapterId: res.data._id })); // Pre-select new chapter
    } catch (err) {
      toast.error('Failed to create chapter.');
    } finally {
      setIsChapterSaving(false);
    }
  };

  const handleFileChange = (e, fieldName = 'file') => {
    if (e.target.files[0]) {
      setForm({ ...form, [fieldName]: e.target.files[0] });
    }
  };

  const handleUpload = async () => {
    if (!form.title || !form.subjectId || (!form.file && !editItem)) {
       toast.error('File, Title, and Subject mapping are required!');
       return;
    }

    setSaving(true);
    setUploadProgress(0);
    setElapsedTime(0);
    const startTime = Date.now();
    setUploadStartTime(startTime);

    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('subjectId', form.subjectId);
    if (form.chapterId) formData.append('chapterId', form.chapterId);
    formData.append('type', form.type);
    formData.append('file', form.file);
    if (form.assignmentFile) formData.append('assignment', form.assignmentFile);
    if (form.thumbnail) formData.append('thumbnail', form.thumbnail);

    try {
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      };

      if (editItem) {
        await axios.put(`/api/faculty/content/manage/${editItem.type}/${editItem._id}`, formData, config);
        toast.success('Resource updated and re-queued for verification!');
      } else {
        await axios.post('/api/faculty/content/upload', formData, config);
        toast.success('Resource submitted for instructor verification!');
      }
      setShowModal(false);
      setEditItem(null);
      setForm({ title: '', description: '', subjectId: '', chapterId: '', type: 'video', file: null, assignmentFile: null, thumbnail: null });
      fetchMyContent();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload multimedia');
    } finally {
      clearInterval(timer);
      setSaving(false);
    }
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setForm({ 
       title: item.title || '', 
       description: item.description || '', 
       subjectId: item.subject?._id || item.subject || '', 
       chapterId: item.chapterId || '', 
       type: item.type || 'video', 
       file: null, 
       assignmentFile: null,
       thumbnail: null 
    });
    setShowModal(true);
  };

  const handleDelete = async (item) => {
    confirm({
      title: item.status === 'published' ? 'Request Deletion?' : 'Delete Resource?',
      message: item.status === 'published' 
        ? 'This resource is already published. Deleting it will request the instructor to remove it from the platform. Are you sure?'
        : 'Are you sure you want to permanently remove this resource? This action cannot be undone.',
      confirmText: item.status === 'published' ? 'Request Removal' : 'Delete Permanently',
      type: 'danger',
      icon: Trash2,
      onConfirm: async () => {
        try {
          const res = await axios.delete(`/api/faculty/content/manage/${item.type}/${item._id}${item.chapterId ? `?chapterId=${item.chapterId}` : ''}`);
          toast.success(res.data.message || 'Resource deleted.');
          fetchMyContent();
        } catch (err) {
          toast.error('Failed to remove content');
        }
      }
    });
  };

  const filteredContent = contentList.filter(item => {
    const s = (item.status || item.approvalStatus || 'draft');
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return s === 'draft';
    if (statusFilter === 'approved') return s === 'published';
    if (statusFilter === 'rejected') return s === 'rejected';
    return true;
  });

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">Syllabus Material</h1>
          <p className="page-subtitle">Upload lesson PDFs or Video recordings for Instructor verification.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm({ title: '', description: '', subjectId: '', chapterId: '', type: 'video', file: null, assignmentFile: null, thumbnail: null }); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
           <UploadCloud size={18} /> Upload Resource
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'white', padding: '16px 24px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
           {['all', 'pending', 'approved', 'rejected'].map(f => (
             <button key={f} onClick={() => setStatusFilter(f)} className={`btn ${statusFilter === f ? 'btn-primary' : 'btn-ghost'}`} style={{ textTransform: 'capitalize', padding: '8px 16px', fontSize: '13px' }}>
                {f === 'pending' && <Clock size={14} style={{marginRight: '6px'}} />}
                {f === 'approved' && <CheckCircle size={14} style={{marginRight: '6px'}} />}
                {f === 'rejected' && <X size={14} style={{marginRight: '6px'}} />}
                {f}
             </button>
           ))}
        </div>
        <div style={{ position: 'relative', width: '250px' }}>
           <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
           <input type="text" placeholder="Search my uploads..." style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '13px' }} />
        </div>
      </div>

      {loading ? <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }}></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {filteredContent.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '80px', textAlign: 'center', background: 'var(--color-bg)', borderRadius: '16px', border: '2px dashed var(--color-border)' }}>
              <ListPlus size={48} color="var(--color-primary)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>No {statusFilter !== 'all' ? statusFilter : ''} Content Found</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>Try adjusting your filters or upload new material.</p>
            </div>
          ) : filteredContent.map(item => {
            const rawStatus = item.status || item.approvalStatus || 'draft';
            const displayStatus = rawStatus === 'published' ? 'approved' : (rawStatus === 'draft' ? 'pending' : rawStatus.replace('_', ' '));
            
            return (
            <div key={item._id} className="card hover-lift" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '24px', flex: 1 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                   <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: item.type === 'video' ? '#e0e7ff' : '#fef3c7', color: item.type === 'video' ? '#4f46e5' : '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                     {item.thumbnail ? (
                       <img src={item.thumbnail} alt="Thumbnail preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     ) : (
                       item.type === 'video' ? <UploadCloud size={24} /> : <FileText size={24} />
                     )}
                   </div>
                   <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', 
                      background: displayStatus === 'approved' ? '#dcfce7' : displayStatus === 'rejected' ? '#fee2e2' : '#fef9c3', 
                      color: displayStatus === 'approved' ? '#166534' : displayStatus === 'rejected' ? '#991b1b' : '#854d0e', textTransform: 'capitalize' 
                   }}>
                     {displayStatus}
                   </span>
                 </div>
                 
                 <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: 'var(--color-text-primary)' }}>{item.title}</h3>
                 <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                   {item.description || 'No description provided.'}
                 </p>

                 {displayStatus === 'rejected' && item.rejectionReason && (
                    <div style={{ marginBottom: '16px', padding: '12px', background: '#fff1f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', color: '#991b1b', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                       <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                       <div>
                          <strong>Reason:</strong> {item.rejectionReason}
                          <div style={{ marginTop: '4px', fontWeight: 'bold', fontSize: '12px', opacity: 0.8 }}>Action: Please Review & Fix</div>
                       </div>
                    </div>
                 )}

                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                    Subject Map: {item.subject?.name || 'Unassigned'}
                 </div>
              </div>
              <div style={{ padding: '16px 24px', background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                   <Clock size={16} /> {new Date(item.createdAt || item.uploadedAt || Date.now()).toLocaleDateString()}
                 </div>
                 <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setPreviewModal({ isOpen: true, url: item.url, title: item.title })} className="btn btn-ghost" style={{ padding: '6px', color: 'var(--color-primary)' }} title="Preview Document">
                      <Eye size={16} />
                    </button>
                    {item.assignmentUrl && (
                      <button onClick={() => setPreviewModal({ isOpen: true, url: item.assignmentUrl, title: `${item.title} (Exercise)` })} className="btn btn-ghost" style={{ padding: '6px', color: '#f59e0b' }} title="Preview Exercise">
                        <FileText size={16} />
                      </button>
                    )}
                    {rawStatus === 'published' && (
                      <Link href={`/faculty/content-oversight?item=${item._id}`} className="btn btn-ghost" style={{ padding: '6px', color: 'var(--color-primary)' }} title="Content Oversight">
                        <BarChart2 size={16} />
                      </Link>
                    )}
                    {(rawStatus === 'rejected' || rawStatus === 'draft' || rawStatus === 'published') && (
                      <button onClick={() => openEditModal(item)} className="btn btn-ghost" style={{ padding: '6px', color: 'var(--color-primary)' }} title="Edit & Re-upload">
                        <Edit2 size={16} />
                      </button>
                    )}
                    {rawStatus !== 'pending_delete' && (
                      <button onClick={() => handleDelete(item)} className="btn btn-ghost" style={{ padding: '6px', color: 'var(--color-error)' }} title={rawStatus === 'published' ? 'Request Deletion' : 'Delete'}>
                        <Trash2 size={16} />
                      </button>
                    )}
                 </div>
              </div>
            </div>
          )})}
        </div>
      )}

      {/* Analysis Modal Removed - Moved to Content Oversight */}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 45, 107, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '90%', maxWidth: '500px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '24px', background: editItem ? '#1e293b' : 'var(--color-primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{editItem ? 'Edit & Re-submit Material' : 'Upload Study Material'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
              
              <div className="grid-2-col" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Material Target Subject <span style={{color: 'red'}}>*</span></label>
                  <select className="form-select" value={form.subjectId || ''} onChange={e => setForm({...form, subjectId: e.target.value, chapterId: ''})}>
                    <option value="">Select subject to attach</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                     <label className="form-label" style={{ margin: 0 }}>Target Chapter <span style={{color: 'red'}}>*</span></label>
                     {form.subjectId && !showAddChapter && (
                       <button onClick={() => setShowAddChapter(true)} className="btn btn-ghost" style={{ padding: '0 4px', fontSize: '11px', color: 'var(--color-primary)', height: 'auto', fontWeight: 'bold' }}>
                          + New Chapter
                       </button>
                     )}
                  </div>
                  
                  {showAddChapter ? (
                     <div style={{ display: 'flex', gap: '8px', animation: 'slideDown 0.2s ease-out' }}>
                        <input 
                           type="text" 
                           className="form-input" 
                           autoFocus
                           placeholder="Chapter Name..." 
                           value={newChapterName} 
                           onChange={e => setNewChapterName(e.target.value)}
                           style={{ flex: 1 }}
                        />
                        <button onClick={handleCreateChapter} disabled={isChapterSaving} className="btn btn-primary" style={{ padding: '0 12px' }}>
                           {isChapterSaving ? '...' : <CheckCircle size={16} />}
                        </button>
                        <button onClick={() => { setShowAddChapter(false); setNewChapterName(''); }} className="btn btn-ghost" style={{ padding: '0 12px', color: 'var(--color-error)' }}>
                           <X size={16} />
                        </button>
                     </div>
                  ) : (
                    <select className="form-select" value={form.chapterId || ''} onChange={e => setForm({...form, chapterId: e.target.value})} disabled={!form.subjectId}>
                      <option value="">Select chapter to attach</option>
                      {form.subjectId && subjects.find(s => s._id === form.subjectId)?.chapters?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid-2-col" style={{ marginBottom: '16px' }}>
                 <div className="form-group">
                   <label className="form-label">Title <span style={{color: 'red'}}>*</span></label>
                   <input type="text" className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="E.g. Algebra pt 1" />
                 </div>
                 <div className="form-group">
                   <label className="form-label">Type <span style={{color: 'red'}}>*</span></label>
                   <select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value, file: null, assignmentFile: null})}>
                     <option value="video">Recorded Class</option>
                     <option value="dpp">DPP</option>
                     <option value="pyq">PYQ</option>
                     <option value="assignment">Assignment</option>
                     <option value="test">Test</option>
                   </select>
                 </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Description / Synopsis</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">{form.type === 'video' ? 'Upload Video File' : 'Upload PDF File'} {editItem ? <span style={{color:'var(--color-text-muted)'}}>(Optional - leave empty to keep existing)</span> : <span style={{color: 'red'}}>*</span>}</label>
                <div style={{ border: '2px dashed var(--color-border)', borderRadius: '12px', padding: '32px', textAlign: 'center', background: 'var(--color-bg)', cursor: form.file ? 'default' : 'pointer' }} onClick={() => !form.file && document.getElementById('content-upload').click()}>
                  <input type="file" id="content-upload" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, 'file')} accept={form.type === 'video' ? 'video/mp4,video/mkv,video/avi' : 'application/pdf'} />
                  {form.file ? (
                    <div>
                      <CheckCircle size={32} color="var(--color-success)" style={{ margin: '0 auto 12px' }} />
                      <div style={{ fontWeight: 'bold' }}>{form.file.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{(form.file.size / (1024*1024)).toFixed(2)} MB</div>
                      <button className="btn btn-ghost" style={{ marginTop: '12px', color: 'var(--color-error)' }} onClick={(e) => { e.stopPropagation(); setForm({...form, file: null}); }}>Remove</button>
                    </div>
                  ) : (
                    <div>
                      <UploadCloud size={32} color="var(--color-primary)" style={{ margin: '0 auto 12px', opacity: 0.6 }} />
                      <div style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>Click to browse {form.type === 'video' ? 'videos' : 'PDFs'}</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Max size limitations apply</div>
                    </div>
                  )}
                </div>
              </div>

              {form.type === 'video' && (
                <>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Video Thumbnail <span style={{color: 'var(--color-text-muted)'}}>(Max 2MB, Image only)</span></label>
                    <div style={{ border: '2px dashed var(--color-border)', borderRadius: '12px', padding: '16px', textAlign: 'center', background: 'var(--color-bg)', cursor: form.thumbnail ? 'default' : 'pointer' }} onClick={() => !form.thumbnail && document.getElementById('thumbnail-upload').click()}>
                      <input type="file" id="thumbnail-upload" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, 'thumbnail')} />
                      {form.thumbnail ? (
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <img src={URL.createObjectURL(form.thumbnail)} alt="Thumbnail preview" style={{ height: '100px', borderRadius: '8px', objectFit: 'cover' }} />
                          <button className="btn btn-ghost" style={{ position: 'absolute', top: '-10px', right: '-10px', padding: '4px', background: 'white', borderRadius: '50%', color: 'var(--color-error)' }} onClick={(e) => { e.stopPropagation(); setForm({...form, thumbnail: null}); }}>
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <LayoutGrid size={24} color="var(--color-text-muted)" style={{ margin: '0 auto 8px', opacity: 0.6 }} />
                          <div style={{ fontWeight: 'bold', color: 'var(--color-text-secondary)', fontSize: '14px' }}>Upload custom thumbnail</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Upload Exercise (PDF) <span style={{color: 'var(--color-text-muted)'}}>(Optional)</span></label>
                    <div style={{ border: '2px dashed var(--color-border)', borderRadius: '12px', padding: '16px', textAlign: 'center', background: 'var(--color-bg)', cursor: form.assignmentFile ? 'default' : 'pointer' }} onClick={() => !form.assignmentFile && document.getElementById('exercise-upload').click()}>
                      <input type="file" id="exercise-upload" style={{ display: 'none' }} accept="application/pdf" onChange={(e) => handleFileChange(e, 'assignmentFile')} />
                      {form.assignmentFile ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                          <CheckCircle size={20} color="var(--color-success)" />
                          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{form.assignmentFile.name}</div>
                          <button className="btn btn-ghost" style={{ padding: '4px 8px', color: 'var(--color-error)' }} onClick={(e) => { e.stopPropagation(); setForm({...form, assignmentFile: null}); }}>X</button>
                        </div>
                      ) : (
                        <div>
                          <FileText size={24} color="var(--color-text-muted)" style={{ margin: '0 auto 8px', opacity: 0.6 }} />
                          <div style={{ fontWeight: 'bold', color: 'var(--color-text-secondary)', fontSize: '14px' }}>Attach an exercise PDF</div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
              {saving && (
                <div style={{ width: '100%', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} className="spin" />
                      <span>Uploading... {formatSeconds(elapsedTime)}</span>
                    </div>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div style={{ height: '8px', width: '100%', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--color-primary)', transition: 'width 0.3s ease-out' }} />
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: '16px' }}>
                <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }} disabled={saving}>Cancel</button>
                <button onClick={handleUpload} className="btn btn-primary" style={{ flex: 2 }} disabled={saving || (!form.file && !editItem)}>
                  {saving ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="spinner-xs" style={{ borderTopColor: 'white' }}></div>
                      <span>{uploadProgress}% Uploaded</span>
                    </div>
                  ) : (editItem ? 'Submit for Re-verification' : 'Upload Resource')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PdfPreviewModal 
        isOpen={previewModal.isOpen} 
        onClose={() => setPreviewModal({ ...previewModal, isOpen: false })} 
        url={previewModal.url} 
        title={previewModal.title} 
      />
    </div>
  );
}
