import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, Plus, Pencil, Trash2, Search, Filter, 
  Film, HelpCircle, FileText, CheckCircle, X, UploadCloud,
  History, BarChart3, Clock, Calendar, MoreVertical,
  Download, Eye, AlertCircle, Upload, BookOpen
} from 'lucide-react';
import axios from 'axios';
import facultyService from '../../services/facultyService';
import VideoPlayer from '../../components/VideoPlayer';
import toast from 'react-hot-toast';

const FacultyContentManager = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contentList, setContentList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // UI State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form State
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewResource, setPreviewResource] = useState(null);

  const fileInputRef = useRef(null);
  const assignmentInputRef = useRef(null);
  const token = localStorage.getItem('baselearn_faculty_token');

  const contentTypes = {
    video: { label: 'Recorded Class', icon: Film, color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', bgLight: '#eef2ff' },
    faq: { label: 'FAQ Session', icon: HelpCircle, color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', bgLight: '#fdf2f8' },
    note: { label: 'Class Note', icon: FileText, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', bgLight: '#fffbeb' },
    liveNote: { label: 'Live Note', icon: FileText, color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', bgLight: '#f5f3ff' },
    dpp: { label: 'DPP', icon: FileText, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', bgLight: '#ecfdf5' },
    pyq: { label: 'PYQ', icon: FileText, color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', bgLight: '#eff6ff' },
    test: { label: 'Main Test', icon: CheckCircle, color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', bgLight: '#fef2f2' },
    assignment: { label: 'Main Assignment', icon: CheckCircle, color: '#14b8a6', gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)', bgLight: '#f0fdfa' }
  };

  const currentType = contentTypes[type] || { label: 'Content', icon: FileText, color: '#0F2D6B', gradient: 'linear-gradient(135deg, #0F2D6B 0%, #0B1D4A 100%)', bgLight: '#f0f4ff' };

  useEffect(() => {
    fetchContent();
    fetchSubjects();
  }, [type]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const data = await facultyService.getUploadedContent(type);
      setContentList(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load content history');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get('/api/faculty/subjects', { headers: { Authorization: `Bearer ${token}` } });
      const data = res.data || [];
      setSubjects(data);
      
      // Build a unified flat list for the dropdown
      const unified = [];
      data.forEach(sub => {
        // Add Subject itself (for Main Assessments)
        unified.push({ id: sub._id, name: sub.name, subName: sub.name, type: 'subject', subId: sub._id });
        // Add Chapters
        if (sub.chapters) {
          sub.chapters.forEach(chap => {
            unified.push({ id: chap._id, name: chap.name, subName: sub.name, type: 'chapter', subId: sub._id });
          });
        }
      });
      setChapters(unified);
    } catch (err) { console.error('Failed to fetch subjects', err); }
  };

  const fetchChapters = async (subId) => {
    try {
      const res = await axios.get(`/api/faculty/subjects/${subId}/chapters`, { headers: { Authorization: `Bearer ${token}` } });
      setChapters(res.data || []);
    } catch (err) { console.error('Failed to fetch chapters', err); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return toast.error('Please select a file');
    
    setUploading(true);
    try {
      const formData = new FormData();
      if (selectedFile) formData.append('file', selectedFile);
      if (selectedAssignment) formData.append('assignment', selectedAssignment);
      formData.append('type', type);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('subjectId', selectedSubject);
      if (selectedChapter) formData.append('chapterId', selectedChapter);
      if (['test', 'assignment'].includes(type) || !selectedChapter) {
        formData.append('isMain', 'true');
      }

      await axios.post('/api/faculty/content/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
        onUploadProgress: (p) => setProgress(Math.round((p.loaded * 100) / p.total))
      });

      toast.success(`${currentType.label} uploaded successfully!`);
      setShowUploadModal(false);
      resetForm();
      fetchContent();
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (selectedFile) formData.append('file', selectedFile);
      if (selectedAssignment) formData.append('assignment', selectedAssignment);
      if (['note', 'liveNote', 'dpp', 'pyq'].includes(type)) {
        formData.append('chapterId', editingItem.chapterId);
      }
      
      await axios.put(`/api/faculty/content/manage/${type}/${editingItem._id || editingItem.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });

      toast.success('Information updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchContent();
    } catch (err) {
      console.error(err);
      toast.error('Update failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Are you sure you want to permanently delete this content?')) return;
    try {
      await facultyService.deleteContent(type, item._id || item.id, item.chapterId);
      toast.success('Deleted successfully');
      fetchContent();
    } catch (err) {
      console.error(err);
      toast.error('Delete failed');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedSubject('');
    setSelectedChapter('');
    setSelectedFile(null);
    setSelectedAssignment(null);
    setProgress(0);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description || '');
    setShowEditModal(true);
  };

  const filteredList = contentList.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subjectName?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt || b.uploadedAt) - new Date(a.createdAt || a.uploadedAt);
    if (sortBy === 'oldest') return new Date(a.createdAt || a.uploadedAt) - new Date(b.createdAt || b.uploadedAt);
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  const Icon = currentType.icon;

  return (
    <div style={{ paddingBottom: '80px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* PAGE HERO HEADER */}
      <div 
        style={{ 
          background: currentType.gradient, 
          borderRadius: '24px', 
          padding: '48px', 
          marginBottom: '40px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px -12px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.15 }}>
          <Icon size={280} />
        </div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <button 
            onClick={() => navigate('/faculty/content')}
            style={{ 
              background: 'rgba(255,255,255,0.15)', 
              border: '1px solid rgba(255,255,255,0.2)', 
              color: 'white',
              backdropFilter: 'blur(8px)',
              padding: '8px 16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              marginBottom: '24px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <ChevronLeft size={18} /> Back to Dashboard
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                {currentType.label} Management
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', maxWidth: '500px' }}>
                Create, organize, and manage your {currentType.label.toLowerCase()} content and track student engagement.
              </p>
            </div>
            
            <button 
              className="btn btn-primary" 
              onClick={() => { resetForm(); setShowUploadModal(true); }}
              style={{ 
                background: 'white', 
                color: currentType.color, 
                padding: '14px 28px', 
                fontSize: '16px',
                fontWeight: '700',
                borderRadius: '14px',
                boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)'
              }}
            >
              <Plus size={20} style={{ marginRight: '8px' }} /> Upload New Content
            </button>
          </div>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="stats-grid" style={{ marginBottom: '40px' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: `${currentType.color}15`, color: currentType.color }}>
              <History size={20} />
            </div>
          </div>
          <div className="stat-card-value">{contentList.length}</div>
          <div className="stat-card-label">Total Uploads</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: '#10b98115', color: '#10b981' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-card-value">{contentList.filter(i => new Date(i.createdAt || i.uploadedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</div>
          <div className="stat-card-label">Uploaded this week</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: '#3b82f615', color: '#3b82f6' }}>
              <Eye size={20} />
            </div>
          </div>
          <div className="stat-card-value">--</div>
          <div className="stat-card-label">Total Student Views</div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Content History</h2>
          
          <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '300px', justifyContent: 'flex-end' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search history..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '10px', border: '1.5px solid var(--color-border)', fontSize: '14px' }} 
              />
            </div>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '10px', borderRadius: '10px', border: '1.5px solid var(--color-border)', fontSize: '14px', background: 'white' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 20px auto' }}></div>
            <p style={{ color: 'var(--color-text-muted)' }}>Loading your content history...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div style={{ padding: '100px 40px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: 'var(--color-bg)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', color: 'var(--color-text-muted)' }}>
              <History size={40} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>No content found</h3>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto 24px auto' }}>
              {searchTerm ? "We couldn't find any results matching your search terms." : `You haven't uploaded any ${currentType.label.toLowerCase()}s yet.`}
            </p>
            {!searchTerm && (
              <button 
                className="btn btn-primary" 
                onClick={() => setShowUploadModal(true)}
                style={{ background: currentType.color, border: 'none' }}
              >
                Upload Your First {currentType.label}
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Content Detail</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Category / Chapter</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Date Uploaded</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Stats</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item) => (
                  <tr key={item._id || item.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }} className="hover-row">
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: currentType.bgLight, color: currentType.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={22} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '4px' }}>{item.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px', whiteSpace: 'nowrap' }}>
                            {item.description || "No description provided."}
                          </div>
                          {item.assignmentUrl && (
                            <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', fontSize: '11px', fontWeight: '700' }}>
                              <BookOpen size={12} /> Assignment Included
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-primary)' }}>📖 {item.subject?.name || item.subjectName}</span>
                        {(item.chapter?.name || item.chapterName) && (
                          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>📁 {item.chapter?.name || item.chapterName}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px', fontSize: '14px', color: 'var(--color-text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={14} style={{ color: 'var(--color-text-muted)' }} />
                        {new Date(item.createdAt || item.uploadedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                         <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', fontWeight: '700' }}>0</div>
                            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Views</div>
                         </div>
                         <div style={{ width: '1px', background: 'var(--color-border)' }}></div>
                         <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', fontWeight: '700' }}>0</div>
                            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Clicks</div>
                         </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        {(type === 'video' || type === 'faq') && (
                          <button className="icon-btn" title="Preview" onClick={() => { setPreviewResource(item); setShowPreviewModal(true); }}>
                            <Eye size={16} />
                          </button>
                        )}
                        <button className="icon-btn" title="Edit" onClick={() => openEdit(item)}><Pencil size={16} /></button>
                        <button className="icon-btn" title="Delete" style={{ color: '#ef4444' }} onClick={() => handleDelete(item)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal modal--lg">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Upload New {currentType.label}</h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Fill in the details below to add content to your course.</p>
              </div>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600' }}>Content Title *</label>
                  <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`e.g. Chapter 1: Introduction to ${currentType.label}`} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--color-border)' }} />
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600' }}>Target Module / Chapter *</label>
                  <select 
                    required 
                    value={selectedChapter || selectedSubject} 
                    onChange={(e) => {
                       const val = e.target.value;
                       const selected = chapters.find(c => c.id === val);
                       if (selected) {
                          setSelectedSubject(selected.subId);
                          setSelectedChapter(selected.type === 'chapter' ? selected.id : '');
                       } else {
                          setSelectedSubject('');
                          setSelectedChapter('');
                       }
                    }}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--color-border)', background: 'white' }}
                  >
                    <option value="">— Choose where this content belongs —</option>
                    {chapters.map((item, idx) => (
                      <option key={`${item.id}-${idx}`} value={item.id} style={{ fontWeight: item.type === 'subject' ? 'bold' : 'normal', paddingLeft: item.type === 'chapter' ? '20px' : '0' }}>
                        {item.type === 'subject' ? `[Subject] ${item.name}` : `↳ ${item.name} (${item.subName})`}
                      </option>
                    ))}
                  </select>
                  <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                     Tip: Subjects are for Main Assessments/Tests. Chapters are for daily lectures and notes.
                  </p>
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600' }}>Short Description</label>
                  <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide a brief overview of what this content covers..." style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--color-border)', resize: 'none' }}></textarea>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600' }}>Lecture Video / Resource *</label>
                  <div onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer', border: '1.5px dashed var(--color-border)', borderRadius: '12px', padding: '24px', textAlign: 'center', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}><Upload size={20} /></div>
                    {selectedFile ? <span style={{ fontSize: '14px', fontWeight: '700', color: '#166534' }}>📄 {selectedFile.name}</span> : <span style={{ fontSize: '14px', fontWeight: '600' }}>Click to upload</span>}
                    <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600' }}>Assignment (Optional PDF)</label>
                  <div onClick={() => assignmentInputRef.current?.click()} style={{ cursor: 'pointer', border: '1.5px dashed var(--color-border)', borderRadius: '12px', padding: '24px', textAlign: 'center', background: 'rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}><BookOpen size={20} /></div>
                    {selectedAssignment ? <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-primary)' }}>📄 {selectedAssignment.name}</span> : <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Optional PDF Assignment</span>}
                    <input ref={assignmentInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && setSelectedAssignment(e.target.files[0])} />
                  </div>
                </div>

                {uploading && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', fontWeight: '600' }}>
                      <span>Uploading content...</span>
                      <span>{progress}%</span>
                    </div>
                    <div style={{ height: '10px', backgroundColor: 'var(--color-bg)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress}%`, backgroundColor: currentType.color }}></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={uploading || !selectedFile} style={{ background: currentType.color, border: 'none' }}>
                  {uploading ? 'Processing...' : 'Upload & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal modal--sm">
            <div className="modal-header">
              <h2 className="modal-title">Edit Details</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600' }}>Title *</label>
                  <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--color-border)' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600' }}>Description</label>
                  <textarea rows="4" value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--color-border)', resize: 'none' }}></textarea>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600' }}>Replace Resource (Optional)</label>
                  <div onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer', border: '1.5px dashed var(--color-border)', borderRadius: '10px', padding: '12px', textAlign: 'center', background: 'var(--color-bg)' }}>
                    <input ref={fileInputRef} type="file" style={{ display: 'none' }} accept={['video', 'faq'].includes(type) ? 'video/*' : '.pdf'} onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])} />
                    {selectedFile ? <span style={{ fontSize: '12px', fontWeight: '600', color: '#166534' }}>🎥 {selectedFile.name}</span> : <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Replace Resource</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600' }}>Replace Assignment (Optional PDF)</label>
                  <div onClick={() => assignmentInputRef.current?.click()} style={{ cursor: 'pointer', border: '1.5px dashed var(--color-border)', borderRadius: '10px', padding: '12px', textAlign: 'center', background: 'var(--color-bg)' }}>
                    <input ref={assignmentInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && setSelectedAssignment(e.target.files[0])} />
                    {selectedAssignment ? <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-primary)' }}>📄 {selectedAssignment.name}</span> : <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Replace Assignment</span>}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => { setShowEditModal(false); resetForm(); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={uploading} style={{ background: currentType.color, border: 'none' }}>
                  {uploading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="modal-overlay" onClick={() => setShowPreviewModal(false)} style={{ zIndex: 1000 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ background: '#000', padding: 0, border: 'none', borderRadius: '24px', overflow: 'hidden', maxWidth: '900px', width: '95%' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' }}>
              <VideoPlayer 
                src={previewResource?.videoUrl || previewResource?.url} 
                onClose={() => setShowPreviewModal(false)}
              />
            </div>
            
            <div style={{ padding: '24px', background: 'white' }}>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '800', color: 'var(--color-primary)' }}>{previewResource?.title}</h2>
              <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'white', background: 'var(--color-faculty)', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>Faculty Preview</span>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Testing all quality tiers (144p - 1080p)</span>
                </div>
                {previewResource?.assignmentUrl && (
                  <a 
                    href={previewResource.assignmentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}
                  >
                    <Download size={16} /> Download Attached Assignment
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .hover-row:hover {
          background: var(--color-bg) !important;
        }
        .spinner-xs {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0,0,0,0.1);
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default FacultyContentManager;
