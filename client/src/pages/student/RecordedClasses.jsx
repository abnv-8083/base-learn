import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, PlayCircle, Clock, Settings, Maximize, Play, Pause, Volume2, Calendar, BookOpen, Download, FileText } from 'lucide-react';

import studentService from '../../services/studentService';
import VideoPlayer from '../../components/VideoPlayer';

const RecordedClasses = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('subjects'); // 'subjects' | 'chapters' | 'chapterHub' | 'player'
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [liveFaqs, setLiveFaqs] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
       const res = await studentService.getRecordedClasses();
       if (res.success) {
         setSubjects(res.data);
       }
    } catch (err) {
       console.error(err);
    } finally {
       setLoading(false);
    }
  };

  const fetchLiveFaqs = async () => {
    try {
      const res = await studentService.getLiveFaqSessions();
      if (res.success) setLiveFaqs(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setView('chapters');
  };

  const handleChapterClick = (chapter) => {
    setSelectedChapter(chapter);
    setView('chapterHub');
  };

  const handleCategoryClick = (categoryId) => {
    if (categoryId === 'assignments') return navigate('/student/assignments');
    if (categoryId === 'tests') return navigate('/student/tests');
    
    setActiveCategory(categoryId);
    let initialResource = null;
    if (categoryId === 'video' && selectedChapter.videos?.length > 0) initialResource = { ...selectedChapter.videos[0], type: 'video' };
    else if (categoryId === 'note' && selectedChapter.notes?.length > 0) initialResource = { ...selectedChapter.notes[0], type: 'note' };
    else if (categoryId === 'liveNote' && selectedChapter.liveNotes?.length > 0) initialResource = { ...selectedChapter.liveNotes[0], type: 'liveNote' };
    else if (categoryId === 'dpp' && selectedChapter.dpps?.length > 0) initialResource = { ...selectedChapter.dpps[0], type: 'dpp' };
    else if (categoryId === 'pyq' && selectedChapter.pyqs?.length > 0) initialResource = { ...selectedChapter.pyqs[0], type: 'pyq' };
    else if (categoryId === 'faq') {
       fetchLiveFaqs();
       setView('faqHub');
       return;
    }
    
    setSelectedResource(initialResource);
    setView('player');
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setView('subjects');
  };

  const handleBackToChapters = () => {
    setSelectedChapter(null);
    setSelectedResource(null);
    setActiveCategory(null);
    setView('chapters');
  };

  const handleBackToHub = () => {
    setSelectedResource(null);
    setActiveCategory(null);
    setView('chapterHub');
  };

  // ── Render Subjects View ──
  const renderSubjects = () => (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Class</h1>
        <p className="page-subtitle">Select a subject to explore your curriculum.</p>
      </div>
      {loading ? (
        <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '10vh' }}></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {subjects.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', background: 'var(--color-bg)', borderRadius: '24px', border: '2px dashed var(--color-border)' }}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>📁</div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '12px' }}>No Subjects Assigned</h3>
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: '460px', margin: '0 auto', lineHeight: '1.6' }}>
                Your curriculum is currently being prepared. Once your instructor assigns subjects to your batch, they will appear here automatically.
              </p>
            </div>
          ) : subjects.map((sub) => (
            <div key={sub.id} className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} onClick={() => handleSubjectClick(sub)}>
              <div style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 'var(--space-4)' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: sub.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}>
                  {sub.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', marginBottom: '8px' }}>{sub.title}</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                    {sub.chapters.length} Chapter{sub.chapters.length !== 1 && 's'} • {sub.chapters.reduce((acc, c) => acc + c.videos.length, 0)} Videos
                  </p>
                </div>
                <button className="btn btn-ghost" style={{ width: '100%', marginTop: '8px' }}>View Chapters</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── Render Chapters View ──
  const renderChapters = () => (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <button className="icon-btn" onClick={handleBackToSubjects} title="Back to Subjects">
          <ChevronLeft />
        </button>
        <div>
          <h1 className="page-title">{selectedSubject?.title}</h1>
          <p className="page-subtitle">Select a chapter to start watching.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {selectedSubject?.chapters.map((chap) => (
          <div key={chap.id} className="card" style={{ cursor: 'pointer' }} onClick={() => handleChapterClick(chap)}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold' }}>{chap.title}</h3>
                <span className="badge" style={{ background: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}>
                  {chap.videos?.length || 0} Videos, {(chap.notes?.length || 0) + (chap.dpps?.length || 0) + (chap.pyqs?.length || 0)} Docs
                </span>
              </div>
              
              <div className="progress-bar-wrap">
                <div className="progress-bar-label">
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Progress</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{chap.progress}%</span>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${chap.progress}%`, background: selectedSubject.color }}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Render Chapter Hub View ──
  const renderChapterHub = () => {
    const categories = [
      { id: 'video', title: 'Recorded Classes', icon: '🎥', count: selectedChapter?.videos?.length || 0, color: '#fee2e2' },
      { id: 'liveRecordings', title: 'Live Class Recordings', icon: '🔴', count: 0, color: '#ffedd5' },
      { id: 'note', title: 'Class Notes', icon: '📄', count: selectedChapter?.notes?.length || 0, color: '#fef3c7' },
      { id: 'liveNote', title: 'Live Class Notes', icon: '📋', count: selectedChapter?.liveNotes?.length || 0, color: '#dcfce7' },
      { id: 'dpp', title: 'DPP', icon: '✏️', count: selectedChapter?.dpps?.length || 0, color: '#e0e7ff' },
      { id: 'pyq', title: 'PYQs', icon: '📚', count: selectedChapter?.pyqs?.length || 0, color: '#fae8ff' },
      { id: 'assignments', title: 'Assignments', icon: '📝', count: '-', color: '#f1f5f9' },
      { id: 'tests', title: 'Tests', icon: '📝', count: '-', color: '#f3f4f6' },
      { id: 'faq', title: 'FAQ Sessions', icon: '❓', count: selectedChapter?.faqs?.length || 0, color: '#fce7f3' },
    ];

    return (
      <div>
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button className="icon-btn" onClick={handleBackToChapters} title="Back to Chapters">
            <ChevronLeft />
          </button>
          <div>
            <h1 className="page-title">{selectedChapter?.title} Hub</h1>
            <p className="page-subtitle">Select a resource category to explore.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
          {categories.map(cat => (
             <div key={cat.id} className="card hover-lift" style={{ cursor: 'pointer', transition: 'all 0.2s', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }} onClick={() => handleCategoryClick(cat.id)}>
                <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}>
                  {cat.icon}
                </div>
                <div>
                   <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'var(--color-text-primary)' }}>{cat.title}</h3>
                   <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>{cat.count} {cat.count !== '-' ? 'Items' : 'Portal'}</span>
                </div>
             </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Render Player View ──
  const renderPlayer = () => (
    <div className="player-view-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* Header breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button className="icon-btn" onClick={handleBackToHub}>
          <ChevronLeft size={20} />
        </button>
        <span style={{ color: 'var(--color-text-muted)', cursor: 'pointer' }} onClick={handleBackToSubjects}>{selectedSubject?.title}</span>
        <span style={{ color: 'var(--color-border-strong)' }}>/</span>
        <span style={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{selectedChapter?.title}</span>
      </div>

      <div className="player-flex-layout" style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0 }}>
        {/* LEFT: Video Player */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '8px' }}>
          
          {/* Simulated Video Element */}
          <div style={{ 
            width: '100%', 
            aspectRatio: '16/9', 
            background: '#000', 
            borderRadius: '16px', 
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            flexShrink: 0
          }}>
            {selectedResource?.type === 'video' || selectedResource?.type === 'faq' ? (
              <VideoPlayer 
                src={selectedResource.videoUrl || selectedResource.url} 
                title={selectedResource.title}
              />
            ) : selectedResource?.url ? (
               <iframe src={selectedResource.url} style={{ width: '100%', height: '100%', border: 'none', background: 'white' }} title="Document Viewer" />
            ) : (
              <div style={{ color: '#666', fontSize: '14px', textAlign: 'center' }}>Select a resource from the playlist</div>
            )}
          </div>

          <div style={{ padding: '8px 4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', marginBottom: '8px' }}>
                  {selectedResource?.title || 'Select a resource'}
                </h2>
                {selectedResource?.type === 'video' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {selectedResource?.date}</span>
                  </div>
                )}
              </div>
              {selectedResource?.type !== 'video' && selectedResource?.url && (
                <a href={selectedResource.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Download File (PDF)</a>
              )}
            </div>
            
            {selectedResource?.type === 'video' && (
              <div style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h4 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Description</h4>
                  <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    {selectedResource?.description || "No description provided for this recording."}
                  </p>
                </div>

                {selectedResource?.assignmentUrl && (
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
                    <h4 style={{ fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <BookOpen size={20} color="var(--color-primary)" />
                      Attached Assignment
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-bg)', padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                          <FileText size={22} color="var(--color-primary)" />
                        </div>
                        <div>
                          <p style={{ fontWeight: '700', fontSize: '15px', margin: '0 0 2px 0' }}>Supplementary Materials</p>
                          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>PDF Document • Verification Required</p>
                        </div>
                      </div>
                      <a 
                        href={selectedResource.assignmentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
                      >
                        <Download size={18} /> Download PDF
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Playlist */}
        <div className="playlist-sidebar" style={{ 
          width: '380px', 
          background: 'var(--color-surface)', 
          border: '1px solid var(--color-border)', 
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-raised)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', marginBottom: '4px' }}>Curriculum Explorer</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Explore videos, notes and question banks</p>
          </div>
          
          <div style={{ overflowY: 'auto', flex: 1, paddingBottom: '20px' }}>
            {[
              { title: 'Recorded Classes', data: selectedChapter?.videos, type: 'video', icon: <Play size={16} /> },
              { title: 'FAQ Sessions', data: selectedChapter?.faqs, type: 'faq', icon: '❓' },
              { title: 'Class Notes', data: selectedChapter?.notes, type: 'note', icon: '📄' },
              { title: 'Live Class Notes', data: selectedChapter?.liveNotes, type: 'liveNote', icon: '📋' },
              { title: 'Daily Practice Problems (DPP)', data: selectedChapter?.dpps, type: 'dpp', icon: '✏️' },
              { title: 'Previous Year Questions', data: selectedChapter?.pyqs, type: 'pyq', icon: '📚' },
            ].filter(section => !activeCategory || section.type === activeCategory).map(section => {
              if (!section.data || section.data.length === 0) return null;
              return (
                <div key={section.type}>
                  <div style={{ padding: '16px 20px 8px', fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {section.title}
                  </div>
                  {section.data.map((item, index) => {
                    const isActive = selectedResource?._id === item._id || selectedResource?.id === item.id;
                    const idKey = item._id || item.id;
                    return (
                      <div 
                        key={idKey}
                        onClick={() => { setSelectedResource({ ...item, type: section.type }); setIsPlaying(false); }}
                        style={{ 
                          padding: '12px 20px', 
                          borderBottom: '1px solid var(--color-border)',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '16px',
                          background: isActive ? 'var(--color-accent-subtle)' : 'transparent',
                          borderLeft: isActive ? '4px solid var(--color-accent)' : '4px solid transparent',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => { if(!isActive) e.currentTarget.style.background = 'var(--color-bg)' }}
                        onMouseOut={(e) => { if(!isActive) e.currentTarget.style.background = 'transparent' }}
                      >
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                          background: isActive ? 'var(--color-accent)' : 'var(--color-bg)',
                          color: isActive ? 'white' : 'var(--color-text-muted)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 'bold', fontSize: '14px'
                        }}>
                          {isActive ? typeof section.icon === 'string' ? section.icon : <Play size={14} fill="white" /> : (index + 1)}
                        </div>
                        
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
                          <h4 style={{ 
                            fontSize: '14px', 
                            fontWeight: isActive ? 'bold' : '500', 
                            color: isActive ? 'var(--color-primary)' : 'var(--color-text-primary)',
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {item.title}
                          </h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Mobile styling overlay */}
      <style>{`
        @media (max-width: 1000px) {
          .player-flex-layout {
            flex-direction: column !important;
          }
          .playlist-sidebar {
            width: 100% !important;
            flex: none !important;
            height: 400px !important;
            margin-bottom: 24px;
          }
          .player-view-container {
            height: auto !important;
            min-height: calc(100vh - 120px);
          }
        }
      `}</style>
    </div>
  );

  const renderFaqHub = () => {
    const ongoing = liveFaqs.filter(s => s.status === 'ongoing');
    const upcoming = liveFaqs.filter(s => s.status === 'upcoming');
    const past = liveFaqs.filter(s => s.status === 'completed' || s.status === 'cancelled');

    return (
      <div style={{ paddingBottom: '40px' }}>
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button className="icon-btn" onClick={handleBackToHub} title="Back to Chapter Hub">
            <ChevronLeft />
          </button>
          <div>
            <h1 className="page-title">FAQ & Doubt Sessions</h1>
            <p className="page-subtitle">{selectedChapter?.title} • Live & Recorded</p>
          </div>
        </div>

        {/* Live Sessions Section */}
        <div style={{ marginBottom: '40px' }}>
           <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }}></div> Live Sessions
           </h3>
           
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
             {ongoing.map(s => (
               <div key={s._id} className="card" style={{ border: '2px solid #EF4444', animation: 'borderPulse 2s infinite' }}>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span className="badge" style={{ background: '#FEE2E2', color: '#B91C1C', fontWeight: 'bold' }}>🔴 ONGOING</span>
                      <span style={{ fontSize: '12px', color: '#666' }}>Started: {new Date(s.scheduledAt).toLocaleTimeString()}</span>
                    </div>
                    <h4 style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>{s.title}</h4>
                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>Host: {s.faculty?.name}</p>
                    <a href={s.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ width: '100%', background: '#EF4444', border: 'none' }}>Join Session Now</a>
                  </div>
               </div>
             ))}

             {upcoming.map(s => (
               <div key={s._id} className="card" style={{ opacity: 0.9 }}>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span className="badge" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>UPCOMING</span>
                      <span style={{ fontSize: '12px', color: '#666' }}>{new Date(s.scheduledAt).toLocaleDateString()}</span>
                    </div>
                    <h4 style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>{s.title}</h4>
                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>Starts at {new Date(s.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    <button className="btn btn-outline" style={{ width: '100%' }} disabled>Waiting for Host...</button>
                  </div>
               </div>
             ))}

             {liveFaqs.length === 0 && !loading && (
               <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: 'var(--color-bg)', borderRadius: '16px', border: '1px dashed var(--color-border)' }}>
                 <p style={{ color: 'var(--color-text-secondary)' }}>No live sessions scheduled at the moment.</p>
               </div>
             )}
           </div>
        </div>

        {/* Recorded Section */}
        <div>
           <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Recorded FAQ Library</h3>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {selectedChapter?.faqs?.map(faq => (
                <div key={faq.id} className="card hover-lift" style={{ cursor: 'pointer' }} onClick={() => { setSelectedResource({...faq, type: 'faq'}); setView('player'); }}>
                   <div style={{ aspectRatio: '16/9', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🎥</div>
                   <div style={{ padding: '16px' }}>
                      <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{faq.title}</h4>
                      <p style={{ fontSize: '12px', color: '#666' }}>Recorded on {faq.date}</p>
                   </div>
                </div>
              ))}
              {(!selectedChapter?.faqs || selectedChapter.faqs.length === 0) && (
                <div style={{ gridColumn: '1/-1', color: '#666', fontSize: '14px' }}>No recorded FAQ sessions available yet.</div>
              )}
           </div>
        </div>

        <style>{`
          @keyframes borderPulse {
            0% { border-color: #EF4444; }
            50% { border-color: #F87171; }
            100% { border-color: #EF4444; }
          }
        `}</style>
      </div>
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {view === 'subjects' && renderSubjects()}
      {view === 'chapters' && renderChapters()}
      {view === 'chapterHub' && renderChapterHub()}
      {view === 'faqHub' && renderFaqHub()}
      {view === 'player' && renderPlayer()}
    </div>
  );
};

export default RecordedClasses;
