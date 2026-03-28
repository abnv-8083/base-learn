import { useState, useEffect, useRef } from 'react';
import { UploadCloud, ChevronLeft, Layers, BookOpen, Film, CheckCircle, Award } from 'lucide-react';
import axios from 'axios';

const FacultyContent = () => {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentView, setCurrentView] = useState('subjects'); // 'subjects' | 'chapters' | 'contentTypes' | 'upload'
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  const [uploadType, setUploadType] = useState('video');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);

  const fileInputRef = useRef(null);

  const token = localStorage.getItem('baselearn_faculty_token');

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get('/api/faculty/subjects', { headers: { Authorization: `Bearer ${token}` } });
      const data = res.data;
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch subjects', err);
      setSubjects([]);
    } finally { setLoading(false); }
  };

  const fetchChapters = async (subjectId) => {
    try {
      const res = await axios.get(`/api/faculty/subjects/${subjectId}/chapters`, { headers: { Authorization: `Bearer ${token}` } });
      const data = res.data;
      setChapters(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Failed to fetch chapters', err); setChapters([]); }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (uploadType === 'video' && file.type.startsWith('video/')) setSelectedFile(file);
      else if (uploadType !== 'video' && file.type === 'application/pdf') setSelectedFile(file);
      else alert(`Please drop a valid ${uploadType === 'video' ? 'video' : 'PDF'} file.`);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedChapter) return;
    if (!selectedFile) return alert('Please select a file to upload.');

    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadDone(false);

      const formData = new FormData();
      const isMain = !selectedChapter || ['test', 'assignment'].includes(uploadType);

      formData.append('file', selectedFile);
      formData.append('type', uploadType);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('subjectId', selectedSubject?._id);
      if (selectedChapter) formData.append('chapterId', selectedChapter._id);
      if (isMain) formData.append('isMain', 'true');

      await axios.post('/api/faculty/content/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(pct);
          }
        }
      });

      setUploadDone(true);
      setTitle(''); setSelectedFile(null); setDescription(''); setUploadProgress(0);
    } catch (err) {
      alert('Upload failed. Please try again.');
      console.error(err);
    } finally { setUploading(false); }
  };

  const contentTypes = [
    { id: 'video', label: '🎥 Recorded Class' },
    { id: 'faq', label: '❓ FAQ Session' },
    { id: 'note', label: '📄 Class Notes' },
    { id: 'liveNote', label: '📋 Live Class Notes' },
    { id: 'dpp', label: '✏️ DPP' },
    { id: 'pyq', label: '📚 PYQ' },
    { id: 'test', label: '📝 Main Test' },
    { id: 'assignment', label: '📋 Main Assignment' }
  ];

  if (loading) return <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }}></div>;

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'var(--space-6)' }}>
        {currentView !== 'subjects' && (
          <button className="icon-btn" onClick={() => {
            setUploadDone(false);
            if (currentView === 'upload') setCurrentView('contentTypes');
            else if (currentView === 'contentTypes') setCurrentView('chapters');
            else if (currentView === 'chapters') setCurrentView('subjects');
          }}><ChevronLeft /></button>
        )}
        <div>
          <h1 className="page-title">Upload Content</h1>
          <p className="page-subtitle">
            {currentView === 'subjects' ? 'Select a subject to manage content.' :
             currentView === 'chapters' ? `Subject: ${selectedSubject?.name}` :
             currentView === 'contentTypes' ? `Chapter: ${selectedChapter?.name}` :
             `Upload ${contentTypes.find(c => c.id === uploadType)?.label}`}
          </p>
        </div>
      </div>

      {/* SUBJECTS VIEW */}
      {currentView === 'subjects' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {subjects.length === 0 && <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: '12px', gridColumn: '1/-1' }}>No subjects have been assigned to you yet.</div>}
          {subjects.map(sub => (
            <div key={sub._id} className="card" style={{ cursor: 'pointer', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}
              onClick={() => { setSelectedSubject(sub); fetchChapters(sub._id); setCurrentView('chapters'); }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
                <BookOpen size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{sub.name}</h3>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{sub.chapters?.length || 0} chapters</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CHAPTERS VIEW */}
      {currentView === 'chapters' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="card" style={{ cursor: 'pointer', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', border: '2px dashed var(--color-primary)' }}
            onClick={() => { setSelectedChapter(null); setCurrentView('contentTypes'); setUploadDone(false); }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
              <Award size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Main Assessments</h3>
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Assign at Subject Level</span>
            </div>
          </div>
          {chapters.length === 0 && <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: '12px', gridColumn: '2/-1' }}>No chapters found.</div>}
          {chapters.map(chap => (
            <div key={chap._id} className="card" style={{ cursor: 'pointer', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}
              onClick={() => { setSelectedChapter(chap); setCurrentView('contentTypes'); setUploadDone(false); }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', flexShrink: 0 }}>
                <Layers size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{chap.name}</h3>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Click to upload content</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONTENT TYPES VIEW */}
      {currentView === 'contentTypes' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {contentTypes.map(ct => (
            <div key={ct.id} className="card" style={{ cursor: 'pointer', padding: '32px 24px', textAlign: 'center', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px -10px rgba(0,0,0,0.15)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              onClick={() => { setUploadType(ct.id); setCurrentView('upload'); }}>
              <div style={{ fontSize: '42px', marginBottom: '16px' }}>{ct.label.split(' ')[0]}</div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{ct.label.split(' ').slice(1).join(' ')}</h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>Manage {ct.label.split(' ').slice(1).join(' ').toLowerCase()}</p>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD FORM */}
      {currentView === 'upload' && (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          {uploadDone ? (
            <div className="card" style={{ padding: '48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <CheckCircle size={56} color="#22c55e" />
              <h2 style={{ fontSize: '22px', fontWeight: 'bold' }}>Upload Submitted!</h2>
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: '360px' }}>
                {uploadType === 'video' ? 'Your Recorded Class has been submitted for Instructor review and will appear in the pending queue shortly.' : 'Content has been added to the chapter curriculum.'}
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button className="btn btn-outline" onClick={() => { setUploadDone(false); }}>Upload Another</button>
                <button className="btn btn-primary" onClick={() => setCurrentView('chapters')}>Back to Chapters</button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>Upload to "{selectedChapter?.name}"</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
                Video uploads are queued for Instructor review before publishing to students.
              </p>

              <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Type Pills */}
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', fontSize: '14px' }}>Content Type</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {contentTypes.map(ct => (
                      <button key={ct.id} type="button"
                        onClick={() => { setUploadType(ct.id); setSelectedFile(null); }}
                        style={{ padding: '8px 16px', borderRadius: '20px', border: uploadType === ct.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', background: uploadType === ct.id ? 'var(--color-primary-light)' : 'white', cursor: 'pointer', fontSize: '14px', fontWeight: uploadType === ct.id ? 'bold' : '500', color: uploadType === ct.id ? 'var(--color-primary)' : 'var(--color-text-primary)', transition: 'all 0.2s' }}>
                        {ct.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Title *</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                    placeholder={uploadType === 'video' ? 'e.g. Thermodynamics Lecture 1' : 'e.g. Chapter 3 Notes'}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '15px' }} />
                </div>

                {/* Unified File Picker */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                    {uploadType === 'video' ? 'Video File *' : 'PDF Document *'} 
                    <span style={{ fontWeight: 'normal', color: 'var(--color-text-secondary)', marginLeft: '6px' }}>
                      ({uploadType === 'video' ? 'mp4, mov, webm — max 2GB' : 'PDF only — max 50MB'})
                    </span>
                  </label>
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${dragOver ? 'var(--color-primary)' : selectedFile ? '#22c55e' : 'var(--color-border)'}`,
                      borderRadius: '12px',
                      padding: '32px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: dragOver ? 'var(--color-primary-light)' : selectedFile ? '#f0fdf4' : 'var(--color-bg)',
                      transition: 'all 0.2s'
                    }}>
                    <input ref={fileInputRef} type="file" 
                      accept={uploadType === 'video' ? 'video/*' : '.pdf,application/pdf'} 
                      style={{ display: 'none' }} 
                      onChange={e => { if (e.target.files?.[0]) setSelectedFile(e.target.files[0]); }} />
                    
                    {selectedFile ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        {uploadType === 'video' ? <Film size={36} color="#22c55e" /> : <Layers size={36} color="#22c55e" />}
                        <div style={{ fontWeight: 'bold', color: '#166534' }}>{selectedFile.name}</div>
                        <div style={{ fontSize: '13px', color: '#4ade80' }}>{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</div>
                        <button type="button" onClick={e => { e.stopPropagation(); setSelectedFile(null); }} style={{ padding: '4px 12px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontSize: '12px', color: '#dc2626' }}>Remove</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)' }}>
                        <UploadCloud size={36} />
                        <div style={{ fontWeight: 'bold' }}>Drag & drop your {uploadType === 'video' ? 'video' : 'PDF'} here</div>
                        <div style={{ fontSize: '13px' }}>or click to browse files</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Description (Optional)</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)}
                    rows={3} placeholder="Brief description of this resource..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '15px', resize: 'vertical' }}>
                  </textarea>
                </div>

                {/* Progress Bar (video uploads only) */}
                {uploading && uploadType === 'video' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 'bold' }}>Uploading video…</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '4px', background: '#e2e8f0', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--color-primary)', borderRadius: '4px', transition: 'width 0.3s ease' }}></div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                  <button type="button" onClick={() => setCurrentView('chapters')} className="btn btn-outline" style={{ flex: 1, padding: '12px' }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={uploading}>
                    <UploadCloud size={18} /> {uploading ? (uploadType === 'video' ? `${uploadProgress}% Uploaded...` : 'Saving...') : 'Submit Upload'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FacultyContent;
