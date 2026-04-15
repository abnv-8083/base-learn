"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PlayCircle, Search, Clock, ChevronRight, Home, Book, BookOpen, Folder, ArrowLeft, FileText, ClipboardList, MonitorPlay, CheckCircle, Percent, LayoutGrid, Sparkles, GraduationCap } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import toast from 'react-hot-toast';

export default function StudentRecordedClasses() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Navigation State
  const [viewCategory, setViewCategory] = useState(null); // 'video', 'dpp', 'pyq', 'resource', 'progress'
  const [currentSubject, setCurrentSubject] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [progressionData, setProgressionData] = useState([]);
  
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, progRes] = await Promise.all([
          axios.get('/api/student/recorded-classes'),
          axios.get('/api/student/progression')
        ]);
        setData(Array.isArray(classesRes.data.data) ? classesRes.data.data : []);
        setProgressionData(Array.isArray(progRes.data.data) ? progRes.data.data : []);
      } catch (err) {
        toast.error('Failed to load class resources.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVideoSelect = (videoData) => {
     setActiveVideo(videoData);
  };

  // Navigation handlers
  const selectSubject = (sub) => {
    setCurrentSubject(sub);
    setCurrentChapter(null);
    setSearch('');
  };

  const selectChapter = (chap) => {
    setCurrentChapter(chap);
    setSearch('');
  };

  // Breadcrumbs component
  const Breadcrumbs = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', fontSize: '13px', flexWrap: 'wrap', background: 'rgba(255,255,255,0.05)', padding: '12px 20px', borderRadius: '12px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', width: 'fit-content' }}>
       <button onClick={() => { setViewCategory(null); setCurrentSubject(null); setCurrentChapter(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--color-primary)'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>
          <Home size={14} /> My Hub
       </button>
       
       {viewCategory && (
         <>
           <ChevronRight size={12} color="#475569" />
           <button onClick={() => { setCurrentSubject(null); setCurrentChapter(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: currentSubject ? '#94a3b8' : 'white', fontWeight: currentSubject ? '400' : '600', textTransform: 'capitalize' }}>
              {viewCategory === 'video' ? 'Recorded Classes' : (viewCategory === 'progress' ? 'My Progress' : viewCategory.charAt(0).toUpperCase() + viewCategory.slice(1) + 's')}
           </button>
         </>
       )}

       {currentSubject && (
         <>
           <ChevronRight size={12} color="#475569" />
           <button onClick={() => setCurrentChapter(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: currentChapter ? '#94a3b8' : 'white', fontWeight: currentChapter ? '400' : '600' }}>
              {currentSubject.title}
           </button>
         </>
       )}

       {currentChapter && (
         <>
           <ChevronRight size={12} color="#475569" />
           <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{currentChapter.title}</span>
         </>
       )}
    </div>
  );

  const renderHub = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
      {[
        { id: 'video', label: 'Recorded Classes', icon: PlayCircle, color: '#6366f1', subtitle: 'Premium Video Lectures' },
        { id: 'dpp', label: 'DPP', icon: ClipboardList, color: '#f59e0b', subtitle: 'Daily Practice Papers' },
        { id: 'pyq', label: 'PYQ', icon: FileText, color: '#10b981', subtitle: 'Previous Year Questions' },
        { id: 'resource', label: 'Resources', icon: Book, color: '#ec4899', subtitle: 'Complementary Materials' },
        { id: 'progress', label: 'My Progress', icon: Percent, color: '#8b5cf6', subtitle: 'Syllabus Coverage' },
      ].map(cat => (
        <div key={cat.id} className="card hover-lift" onClick={() => setViewCategory(cat.id)} 
          style={{ 
            cursor: 'pointer', 
            padding: '40px 24px', 
            textAlign: 'center', 
            background: '#ffffff', 
            border: '1.5px solid #e2e8f0',
            borderRadius: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '20px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-10px)';
            e.currentTarget.style.borderColor = cat.color;
            e.currentTarget.style.boxShadow = `0 20px 25px -5px ${cat.color}20, 0 10px 10px -5px ${cat.color}10`;
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
          }}
        >
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '20px', 
            background: `${cat.color}10`, 
            color: cat.color, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: `1px solid ${cat.color}20`
          }}>
            <cat.icon size={36} />
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 6px 0', color: '#0f172a' }}>{cat.label}</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0, fontWeight: '500' }}>{cat.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderProgression = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '28px' }}>
      {progressionData.map(item => (
        <div key={item._id} className="card hover-lift" 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
          <div style={{ padding: '32px', flex: 1, position: 'relative' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
               <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <BookOpen size={24} />
               </div>
               <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', background: item.progress >= 100 ? '#d1fae5' : '#f1f5f9', color: item.progress >= 100 ? '#065f46' : '#475569' }}>
                 {item.progress || 0}% Complete
               </span>
             </div>
             <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: '#0f172a' }}>{item.name}</h3>
             <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>Faculty: <strong style={{ color: '#0f172a' }}>{item.faculty?.name || 'Assigned'}</strong></p>
             
             <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ height: '100%', width: `${item.progress || 0}%`, background: item.progress >= 100 ? '#10b981' : 'linear-gradient(90deg, var(--color-primary), #ec4899)', transition: 'width 1s ease-in-out' }}></div>
             </div>
             
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', fontWeight: '700' }}>
                <span>{item.stats.videos} Videos</span>
                <span>{item.stats.assignments} Assignments</span>
                <span>{item.stats.tests} Tests</span>
             </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSubjects = () => {
    const filtered = data.filter(s => s.title?.toLowerCase().includes(search.toLowerCase()));
    if (filtered.length === 0) return <NoContent icon={Book} message={`No subjects found for ${viewCategory} view.`} />;
    
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filtered.map((sub, idx) => (
          <div key={sub._id || sub.id || idx} className="card hover-lift" onClick={() => selectSubject(sub)} 
            style={{ 
              cursor: 'pointer', 
              padding: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px', 
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '20px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
             <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, var(--color-primary), #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                <Book size={26} color="white" />
             </div>
             <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{sub.title}</h4>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>View Content Hierarchy</p>
             </div>
             <ChevronRight size={20} color="#cbd5e1" />
          </div>
        ))}
      </div>
    );
  };

  const renderChapters = () => {
    const filtered = currentSubject.chapters.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()));
    if (filtered.length === 0) return <NoContent icon={Folder} message="No chapters found in this subject." />;

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filtered.map((chap, idx) => (
          <div key={chap._id || chap.id || idx} className="card hover-lift" onClick={() => selectChapter(chap)} 
            style={{ 
              cursor: 'pointer', 
              padding: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px', 
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '20px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
             <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                <Folder size={26} color="#6366f1" />
             </div>
             <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{chap.title}</h4>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{chap.videos.length} Assets Available</p>
             </div>
             <ChevronRight size={20} color="#cbd5e1" />
          </div>
        ))}
      </div>
    );
  };

  const renderVideos = () => {
    const filtered = currentChapter.videos.filter(v => {
      const matchesSearch = v.title?.toLowerCase().includes(search.toLowerCase());
      if (viewCategory === 'video') return matchesSearch && !v.isResource;
      if (viewCategory === 'dpp') return matchesSearch && v.isResource && v.type?.toLowerCase() === 'dpp';
      if (viewCategory === 'pyq') return matchesSearch && v.isResource && v.type?.toLowerCase() === 'pyq';
      if (viewCategory === 'resource') return matchesSearch && v.isResource && (v.type?.toLowerCase() === 'note' || v.type?.toLowerCase() === 'pyq' || v.type?.toLowerCase() === 'dpp' || !v.type);
      return matchesSearch;
    });

    if (filtered.length === 0) return <NoContent icon={viewCategory === 'video' ? PlayCircle : FileText} message={`No ${viewCategory}s found here.`} />;

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '32px' }}>
        {filtered.map((item, idx) => (
          <div key={item._id || idx} className="card hover-lift" 
            onClick={() => {
              if (item.isResource) {
                 const finalUrl = item.fileUrl?.includes('/uploads/') ? item.fileUrl.substring(item.fileUrl.indexOf('/uploads/')) : item.fileUrl;
                 window.open(finalUrl, '_blank');
              } else if (item.contentType === 'liveRecording') {
                 window.open(item.videoUrl, '_blank');
              } else {
                 handleVideoSelect(item);
              }
            }} 
            style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden', 
              padding: '0', 
              background: '#ffffff',
              border: item.isResource ? '1.5px solid rgba(245, 158, 11, 0.2)' : '1.5px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '24px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)'
            }}>
            <div style={{ width: '100%', height: '200px', position: 'relative', overflow: 'hidden' }}>
               {item.thumbnail ? (
                 <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               ) : (
                 <div style={{ width: '100%', height: '100%', background: item.isResource ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #4f46e5, #ec4899)', opacity: 0.1 }} />
               )}
               <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: item.thumbnail ? 'rgba(0,0,0,0.2)' : 'transparent' }}>
                  {item.isResource ? <FileText size={56} color="#f59e0b" /> : <PlayCircle size={56} color="#6366f1" />}
               </div>
               <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', color: '#1e293b', padding: '6px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', border: '1px solid #e2e8f0' }}>
                 {item.type?.toUpperCase() || (item.isResource ? 'PDF' : 'VIDEO')}
               </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px' }}>
               <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: '#0f172a' }}>{item.title}</h3>
               <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', lineHeight: '1.6', fontWeight: '500' }}>{item.description || 'Access high-quality study materials and video lectures.'}</p>
               
               {item.assignmentUrl && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      const finalUrl = item.assignmentUrl?.includes('/uploads/') 
                        ? item.assignmentUrl.substring(item.assignmentUrl.indexOf('/uploads/')) 
                        : item.assignmentUrl;
                      window.open(finalUrl, '_blank'); 
                    }}
                    style={{ marginBottom: '20px', padding: '10px 16px', borderRadius: '12px', background: '#fffbeb', border: '1px dashed #f59e0b', color: '#b45309', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', width: 'fit-content' }}
                  >
                    <FileText size={14} /> {item.contentType === 'liveRecording' ? 'Class Notes / Whiteboard' : 'Supplementary Worksheet'}
                  </button>
               )}

               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#94a3b8', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                     <Clock size={14} /> {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-student)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white', fontWeight: 'bold' }}>
                        {item.faculty?.name?.charAt(0) || 'I'}
                    </div>
                    <span style={{ color: '#1e293b', fontWeight: '700' }}>{item.faculty?.name || 'Instructor'}</span>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ paddingBottom: '100px', height: '100%', color: 'var(--color-text-primary)' }}>
      {activeVideo ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <button onClick={() => setActiveVideo(null)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1.5px solid var(--color-border)', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }} onMouseOver={e => e.currentTarget.style.background = 'var(--color-bg)'} onMouseOut={e => e.currentTarget.style.background = 'var(--color-surface)'}>
               <ArrowLeft size={16} /> Back to Content
             </button>
           </div>
           
           <div style={{ width: '100%', aspectRatio: '16/9', maxHeight: '70vh', background: '#000', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <VideoPlayer src={activeVideo.fileUrl} title={activeVideo.title} poster={activeVideo.thumbnail} />
           </div>
           
           <div className="player-meta-container" style={{ padding: '32px 40px', background: 'var(--color-surface)', borderRadius: '24px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
              <div className="player-meta-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '40px' }}>
                 
                 {/* Left Column: Metadata */}
                 <div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
                       <span style={{ fontSize: '11px', fontWeight: '950', color: 'var(--color-primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '6px 14px', borderRadius: '30px', border: '1px solid rgba(99, 102, 241, 0.2)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                          Now Playing
                       </span>
                       {activeVideo.type && (
                         <span style={{ fontSize: '11px', fontWeight: '950', color: 'var(--color-text-secondary)', background: 'var(--color-bg)', padding: '6px 14px', borderRadius: '30px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                            {activeVideo.type}
                         </span>
                       )}
                    </div>
                    
                    <h2 className="player-title" style={{ margin: '0 0 16px', fontSize: '36px', fontWeight: '950', color: 'var(--color-text-primary)', letterSpacing: '-0.03em', lineHeight: '1.2' }}>
                       {activeVideo.title}
                    </h2>
                    
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px', color: 'var(--color-text-secondary)', fontSize: '14px', fontWeight: '600' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Clock size={16} /> {new Date(activeVideo.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                       </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                       <h3 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '900', color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>About this session</h3>
                       <p style={{ margin: 0, fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                          {activeVideo.description || 'Master the concepts presented in this educational recording.'}
                       </p>
                    </div>
                 </div>

                 {/* Right Column: Faculty & Resources */}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: 'var(--color-surface)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', backdropFilter: 'blur(20px)' }}>
                       <h4 style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Instructor</h4>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900', color: 'white', boxShadow: '0 8px 16px rgba(0,0,0,0.3)' }}>
                             {activeVideo.faculty?.name?.charAt(0) || 'I'}
                          </div>
                          <div>
                             <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{activeVideo.faculty?.name || 'Assigned Faculty'}</div>
                             <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Senior Educator</div>
                          </div>
                       </div>
                    </div>

                    {activeVideo.assignmentUrl && (
                      <div style={{ background: 'rgba(245, 158, 11, 0.03)', borderRadius: '20px', border: '1.5px dashed rgba(245, 158, 11, 0.2)', padding: '20px' }}>
                         <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                               <FileText size={16} />
                            </div>
                            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#f59e0b' }}>Learning Resource</h4>
                         </div>
                         <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>Download the supplementary worksheet to practice what you learned in this video.</p>
                         <button onClick={() => {
                             const finalUrl = activeVideo.assignmentUrl?.includes('/uploads/')
                               ? activeVideo.assignmentUrl.substring(activeVideo.assignmentUrl.indexOf('/uploads/'))
                               : activeVideo.assignmentUrl;
                             window.open(finalUrl, '_blank');
                         }}
                            style={{ width: '100%', padding: '10px', borderRadius: '12px', background: '#f59e0b', color: '#000', fontSize: '13px', fontWeight: '850', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.3s' }}>
                            <MonitorPlay size={16} /> OPEN WORKSHEET
                         </button>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <>
          <div style={{ 
            position: 'relative',
            padding: '80px 60px',
            borderRadius: '40px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '48px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Animated Glow Orbs */}
            <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'var(--color-student)', filter: 'blur(160px)', opacity: 0.15, borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '-150px', left: '-50px', width: '350px', height: '350px', background: '#ec4899', filter: 'blur(140px)', opacity: 0.12, borderRadius: '50%' }}></div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                  <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <GraduationCap size={22} color="var(--color-student)" />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-student)', textTransform: 'uppercase', letterSpacing: '0.25em' }}>Student Learning Portal</span>
              </div>
              <h1 className="hero-title" style={{ fontSize: '52px', fontWeight: '950', marginBottom: '16px', letterSpacing: '-0.03em', color: 'white', lineHeight: '1.1' }}>
                 {viewCategory ? (viewCategory === 'video' ? 'Recorded Lectures' : (viewCategory === 'progress' ? 'Course Progress' : viewCategory.charAt(0).toUpperCase() + viewCategory.slice(1) + 's')) : 'Your Learning Hub'}
              </h1>
              <p style={{ fontSize: '19px', color: '#94a3b8', maxWidth: '650px', lineHeight: '1.7', fontWeight: '400' }}>Master your subjects with high-definition recordings and curated resources designed for excellence.</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', gap: '24px', flexWrap: 'wrap' }}>
             <Breadcrumbs />
             <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
                <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter resources by name..."
                  style={{ width: '100%', padding: '18px 20px 18px 54px', borderRadius: '20px', background: 'rgba(255,255,255,0.7)', border: '1px solid #e2e8f0', fontSize: '15px', color: '#1e293b', outline: 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-student)'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(99, 102, 241, 0.1)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'; }} 
                />
             </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginTop: '15vh' }}>
              <div className="spinner" style={{ width: '50px', height: '50px', border: '3px solid rgba(255,255,255,0.05)', borderTopColor: 'var(--color-primary)' }}></div>
              <p style={{ color: '#94a3b8', fontWeight: '500', letterSpacing: '0.05em' }}>FETCHING YOUR KNOWLEDGE HUB...</p>
            </div>
          ) : (
            <div className="fade-in" style={{ animation: 'slideUp 0.6s ease-out' }}>
              {!viewCategory && renderHub()}
              {viewCategory === 'progress' && renderProgression()}
              {viewCategory && viewCategory !== 'progress' && !currentSubject && renderSubjects()}
              {currentSubject && !currentChapter && renderChapters()}
              {currentChapter && renderVideos()}
            </div>
          )}
        </>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .spinner {
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .hover-lift:hover {
          transform: translateY(-8px);
        }
        @media (max-width: 1024px) {
          .player-meta-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
        @media (max-width: 640px) {
           .player-meta-container { padding: 20px !important; }
           .player-title { fontSize: 24px !important; }
           .hero-title { fontSize: 32px !important; }
           .player-meta-grid { gap: 20px !important; }
        }
      `}</style>
    </div>
  );
}

function NoContent({ icon: Icon, message }) {
  return (
    <div style={{ 
      padding: '120px 40px', 
      textAlign: 'center', 
      background: 'rgba(255,255,255,0.02)', 
      borderRadius: '40px', 
      border: '1.5px dashed rgba(255,255,255,0.1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px',
      backdropFilter: 'blur(10px)',
      animation: 'slideUp 0.8s ease-out'
    }}>
      <div style={{ width: '100px', height: '100px', borderRadius: '30px', background: 'rgba(99, 102, 241, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
        <Icon size={48} color="#475569" style={{ opacity: 0.6 }} />
      </div>
      <div>
        <h3 style={{ color: 'var(--color-text-primary)', fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>Nothing here yet</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '16px', fontWeight: '500', margin: 0, maxWidth: '400px' }}>{message}</p>
      </div>
    </div>
  );
}

