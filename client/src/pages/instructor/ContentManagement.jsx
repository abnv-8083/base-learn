import { useState, useEffect } from 'react';
import { Layers, Plus, Users, BookOpen, ChevronLeft, Video, Edit, Trash2, Link as LinkIcon, CheckCircle, Download, FileText } from 'lucide-react';
import instructorService from '../../services/instructorService';
import ConfirmModal from '../../components/ConfirmModal';
import VideoPlayer from '../../components/VideoPlayer';

const ContentManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [videos, setVideos] = useState([]);
  const [pendingVideos, setPendingVideos] = useState([]);
  const [pendingAssessments, setPendingAssessments] = useState({ tests: [], assignments: [] });
  const [batches, setBatches] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);

  // Hub Navigation
  const [activeHubSection, setActiveHubSection] = useState(null); // null = Dashboard/Hub
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'detail'
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  // Form States & Modals
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ id: null, name: '' });

  const [showChapterModal, setShowChapterModal] = useState(false);
  const [chapterForm, setChapterForm] = useState({ id: null, name: '' });

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignData, setAssignData] = useState({ type: '', id: '', name: '', currentBatches: [] });
  const [selectedBatchId, setSelectedBatchId] = useState('');

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);
  
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [distributeData, setDistributeData] = useState({ id: '', title: '', targetType: 'batch', type: 'assignment' }); // Added type
  const [distributeTargetId, setDistributeTargetId] = useState('');
  const [assessmentDeadline, setAssessmentDeadline] = useState('');

  // Dual View for Recorded Classes
  const [recordedSubSection, setRecordedSubSection] = useState('curriculum'); // 'pending' | 'curriculum'
  const [selectedStudyClassId, setSelectedStudyClassId] = useState('');

  // Reusable Delete Modal State
  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });
  
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [subs, bchs, pending, pendingAsgns, asgns, cls, stds] = await Promise.all([
        instructorService.getSubjects(),
        instructorService.getBatches(),
        instructorService.getPendingVideos(),
        instructorService.getPendingAssessments(),
        instructorService.getAssignments(),
        instructorService.getClasses(),
        instructorService.getStudents()
      ]);
      setSubjects(subs);
      setBatches(bchs);
      setPendingVideos(pending);
      setPendingAssessments(pendingAsgns);
      setAssignments(asgns);
      setClasses(cls);
      setStudents(stds);
    } catch (err) {
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async (subjectId) => {
    try {
      const data = await instructorService.getChapters(subjectId);
      setChapters(data);
    } catch (err) { setError('Failed to load chapters'); }
  };

  const fetchVideos = async (chapterId) => {
    try {
      const data = await instructorService.getVideosByChapter(chapterId);
      setVideos(data);
    } catch (err) { setError('Failed to load videos'); }
  };

  // --- Subject Actions ---
  const handleSaveSubject = async (e) => {
    e.preventDefault();
    try {
      if (subjectForm.id) {
        const updated = await instructorService.updateSubject(subjectForm.id, subjectForm.name);
        setSubjects(subjects.map(s => s._id === updated._id ? updated : s));
      } else {
        const created = await instructorService.createSubject(subjectForm.name);
        setSubjects([...subjects, created]);
      }
      setShowSubjectModal(false);
    } catch (err) { alert('Error saving subject'); }
  };

  const handleDeleteSubject = async (id) => {
    setConfirmDelete({
      isOpen: true,
      title: "Delete Subject?",
      message: "Are you sure you want to permanently delete this subject? All curriculum inside it will be orphaned.",
      onConfirm: async () => {
        try {
          await instructorService.deleteSubject(id);
          setSubjects(subjects.filter(s => s._id !== id));
          setConfirmDelete(prev => ({ ...prev, isOpen: false }));
        } catch (err) { alert('Error deleting subject'); }
      }
    });
  };

  // --- Chapter Actions ---
  const handleSaveChapter = async (e) => {
    e.preventDefault();
    try {
      if (chapterForm.id) {
        const updated = await instructorService.updateChapter(chapterForm.id, chapterForm.name);
        setChapters(chapters.map(c => c._id === updated._id ? updated : c));
      } else {
        const created = await instructorService.createChapter(chapterForm.name, selectedSubject._id);
        setChapters([...chapters, created]);
      }
      setShowChapterModal(false);
    } catch (err) { alert('Error saving chapter'); }
  };

  const handleDeleteChapter = async (id) => {
    setConfirmDelete({
      isOpen: true,
      title: "Delete Chapter?",
      message: "Are you sure you want to permanently delete this chapter?",
      onConfirm: async () => {
        try {
          await instructorService.deleteChapter(id);
          setChapters(chapters.filter(c => c._id !== id));
          setConfirmDelete(prev => ({ ...prev, isOpen: false }));
        } catch (err) { alert('Error deleting chapter'); }
      }
    });
  };

  // --- Video Actions ---
  const handleDeleteVideo = async (id) => {
    setConfirmDelete({
      isOpen: true,
      title: "Delete Video Link?",
      message: "Are you sure you want to delete this recorded video from the curriculum?",
      onConfirm: async () => {
        try {
          await instructorService.deleteVideo(id);
          setVideos(videos.filter(v => v._id !== id));
          setConfirmDelete(prev => ({ ...prev, isOpen: false }));
        } catch (err) { alert('Error deleting video'); }
      }
    });
  };

  const handleLinkVideo = async (videoId) => {
    try {
      const videoToLink = pendingVideos.find(v => v._id === videoId);
      
      // Use currently selected context OR fallback to what faculty assigned
      const chapterId = selectedChapter?._id || videoToLink?.chapter?._id || videoToLink?.chapter;
      const subjectId = selectedSubject?._id || videoToLink?.subject?._id || videoToLink?.subject;

      if (!chapterId || !subjectId) {
        alert("Could not determine the target chapter or subject for this video.");
        return;
      }

      const linked = await instructorService.linkVideoToChapter(videoId, chapterId, subjectId);
      
      // Update local state: add to current videos if it matches the current view chapter
      if (selectedChapter && (linked.chapter === selectedChapter._id || linked.chapter?._id === selectedChapter._id)) {
        setVideos([...videos, linked]);
      }
      
      setPendingVideos(pendingVideos.filter(v => v._id !== videoId));
      setShowReviewModal(false);
      setPreviewVideo(null);
      
      // Auto-trigger assignment flow
      openAssignModal('video', linked);
    } catch (err) { 
      console.error(err);
      alert("Error linking video: " + (err.response?.data?.message || err.message)); 
    }
  };

  // --- Assign Logic ---
  
  const handleDistributeAssignment = async (e) => {
    e.preventDefault();
    try {
      if (distributeData.type === 'assignment' && !distributeData.isNew) {
        const updated = await instructorService.distributeAssignment(distributeData.id, distributeData.targetType, distributeTargetId);
        setAssignments(assignments.map(a => a._id === updated._id ? updated : a));
      } else {
        // Approving NEW assignment or test from faculty
        const type = distributeData.type === 'test' ? 'test' : 'assignment';
        await instructorService.approveAssessment(distributeData.id, type, [distributeTargetId], assessmentDeadline);
        
        // Refresh Lists
        fetchInitialData();
      }
      setShowDistributeModal(false);
    } catch (err) {
      alert("Error distributing content");
    }
  };

  const openAssignModal = (type, item) => {
    setAssignData({ type, id: item._id, name: item.name || item.title, currentBatches: item.assignedTo || [] });
    setSelectedBatchId('');
    setShowAssignModal(true);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    const newBatchIds = [...assignData.currentBatches.map(b => b._id), selectedBatchId];
    try {
      let updated;
      if (assignData.type === 'subject') updated = await instructorService.assignSubject(assignData.id, newBatchIds);
      if (assignData.type === 'chapter') updated = await instructorService.assignChapter(assignData.id, newBatchIds);
      if (assignData.type === 'video') updated = await instructorService.assignVideo(assignData.id, newBatchIds);
      
      // Update local state
      if (assignData.type === 'subject') setSubjects(subjects.map(x => x._id === updated._id ? updated : x));
      if (assignData.type === 'chapter') setChapters(chapters.map(x => x._id === updated._id ? updated : x));
      if (assignData.type === 'video') setVideos(videos.map(x => x._id === updated._id ? updated : x));
      
      setShowAssignModal(false);
    } catch(err) { alert("Error assigning batch"); }
  };

  if (loading) return <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }}></div>;

  const renderBreadcrumbs = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
      <button onClick={() => setActiveHubSection(null)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0 }}>
        Content Hub
      </button>
      <ChevronLeft size={14} />
      <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>
        {activeHubSection === 'curriculum' && 'Subjects & Chapters'}
        {activeHubSection === 'recorded' && 'Recorded Classes'}
        {activeHubSection === 'dpp' && 'DPP'}
        {activeHubSection === 'pyq' && 'PYQ'}
        {activeHubSection === 'notes' && 'Class Notes'}
        {activeHubSection === 'liveNotes' && 'Live Notes'}
        {activeHubSection === 'assignments' && 'Main Assignment'}
        {activeHubSection === 'tests' && 'Main Test'}
      </span>
    </div>
  );

  return (
    <div style={{ paddingBottom: '60px' }}>
      {error && <div className="alert-error" style={{ background: '#FEE2E2', color: '#DC2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
      
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">Content Pipeline</h1>
          <p className="page-subtitle">Manage curriculum hierarchy, tests, assignments, and live classes.</p>
        </div>
        {(pendingVideos.length > 0 || pendingAssessments.tests.length > 0 || pendingAssessments.assignments.length > 0) && (
          <div style={{ background: '#FEF3C7', padding: '8px 16px', borderRadius: '8px', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: '8px', color: '#92400E', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setShowReviewModal(true)}>
             <CheckCircle size={16} /> {pendingVideos.length + pendingAssessments.tests.length + pendingAssessments.assignments.length} Pending Approvals
          </div>
        )}
      </div>

      {/* --- HUB VIEW: GRID OF CARDS --- */}
      {!activeHubSection && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {[
            { id: 'curriculum', title: 'Subjects & Chapters', icon: <BookOpen />, color: '#bae6fd', desc: 'Setup Subjects, Chapters and Batch assignments' },
            { id: 'recorded', title: 'Recorded Classes', count: pendingVideos.length, icon: <Video />, color: '#fee2e2', desc: 'Manual approval and linkage of videos' },
            { id: 'dpp', title: 'DPP', icon: <Edit />, color: '#fef3c7', desc: 'Daily Practice Problems distribution' },
            { id: 'pyq', title: 'PYQ', icon: <BookOpen />, color: '#dcfce7', desc: 'Previous Year Questions library' },
            { id: 'notes', title: 'Class Notes', icon: <FileText />, color: '#e0e7ff', desc: 'Standard classroom PDF materials' },
            { id: 'liveNotes', title: 'Live Notes', icon: <LinkIcon />, color: '#fae8ff', desc: 'Notes captured from live sessions' },
            { id: 'assignments', title: 'Main Assignment', count: pendingAssessments.assignments.length, icon: <CheckCircle />, color: '#f1f5f9', desc: 'High-priority student assignments' },
            { id: 'tests', title: 'Main Test', count: pendingAssessments.tests.length, icon: <Layers />, color: '#f3f4f6', desc: 'Curriculum-wide examinations' }
          ].map(card => (
            <div 
              key={card.id} 
              className="card hover-lift" 
              onClick={() => setActiveHubSection(card.id)}
              style={{ cursor: 'pointer', padding: '32px 24px', textAlign: 'center', border: '1px solid var(--color-border)', borderRadius: '24px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: card.color, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '20px', position: 'relative', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}>
                {card.icon}
                {card.count > 0 && (
                   <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#DC2626', color: 'white', fontSize: '12px', fontWeight: 'bold', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                     {card.count}
                   </span>
                )}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>{card.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{card.desc}</p>
              <div style={{ marginTop: '24px', width: '100%', padding: '12px', background: 'var(--color-bg)', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                View Module
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- SECTION VIEW: CURRICULUM (SUBJECTS & CHAPTERS) --- */}
      {activeHubSection === 'curriculum' && (
        <div>
          {renderBreadcrumbs()}
          {currentView === 'list' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold' }}>Subjects Management</h2>
                <button className="btn btn-primary" onClick={() => { setSubjectForm({ id: null, name: '' }); setShowSubjectModal(true); }}>
                  <Plus size={18} /> New Subject
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {subjects.map(sub => (
                  <div key={sub._id} style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', cursor: 'pointer' }} onClick={() => { setSelectedSubject(sub); setCurrentView('chapters'); fetchChapters(sub._id); }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📚</div>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0' }}>{sub.name}</h3>
                        <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{sub.assignedTo?.length || 0} Batches Accessing</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn btn-outline" style={{ flex: 2, fontSize: '13px' }} onClick={() => openAssignModal('subject', sub)}><Users size={14} style={{ marginRight: '6px' }}/> Assign Subject</button>
                      <button className="btn btn-outline" onClick={() => { setSubjectForm({ id: sub._id, name: sub.name }); setShowSubjectModal(true); }}><Edit size={14} /></button>
                      <button className="btn btn-outline" style={{ color: '#DC2626' }} onClick={() => handleDeleteSubject(sub._id)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <button className="icon-btn" onClick={() => setCurrentView('list')}><ChevronLeft /></button>
                   <h2 style={{ fontSize: '22px', fontWeight: 'bold' }}>{selectedSubject?.name} Chapters</h2>
                </div>
                <button className="btn btn-primary" onClick={() => { setChapterForm({ id: null, name: '' }); setShowChapterModal(true); }}>
                  <Plus size={18} /> New Chapter
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {chapters.map(chap => (
                  <div key={chap._id} style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '24px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 'bold', marginBottom: '16px' }}>{chap.name}</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-outline" style={{ flex: 1, fontSize: '12px' }} onClick={() => openAssignModal('chapter', chap)}>Assign</button>
                      <button className="btn btn-outline" onClick={() => { setChapterForm({ id: chap._id, name: chap.name }); setShowChapterModal(true); }}><Edit size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      {activeHubSection === 'recorded' && (
        <div>
           {renderBreadcrumbs()}
           
           {/* Section 1: Pending */}
           <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                 <h2 style={{ fontSize: '22px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }}></div>
                   Pending for Approval
                 </h2>
                 <span style={{ fontSize: '14px', padding: '6px 12px', background: '#FEE2E2', color: '#DC2626', borderRadius: '8px', fontWeight: 'bold' }}>
                    {pendingVideos.length} New Uploads
                 </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                  {pendingVideos.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'white', border: '2px dashed var(--color-border)', borderRadius: '24px' }}>
                       <p style={{ color: 'var(--color-text-secondary)', fontSize: '16px' }}>All caught up! No recorded videos waiting for review.</p>
                    </div>
                  ) : pendingVideos.map(vid => (
                    <div key={vid._id} style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🎥</div>
                        <div>
                           <h4 style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>{vid.title}</h4>
                           <p style={{ fontSize: '12px', color: '#666' }}>By {vid.faculty?.name} • For {vid.subject?.name || 'Various'}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                         <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setPreviewVideo({...vid, itemType: 'video'}); setShowReviewModal(true); }}>Review & Approve</button>
                      </div>
                    </div>
                  ))}
              </div>
           </div>

           {/* Section 2: Assigned */}
           <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                 <h2 style={{ fontSize: '22px', fontWeight: 'bold' }}>Recently Published</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                 {/* This would normally be filtered by a search or list, but for now we show all videos assigned to any batch */}
                 {/* In a real app, maybe you want a search bar here since chapter drilldown is gone */}
                 {videos.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#666' }}>No recently published videos found across batches.</div>}
                 {videos.slice(0, 12).map(vid => (
                    <div key={vid._id} style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px' }}>
                       <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                         <div style={{ color: 'var(--color-primary)' }}><Video size={20} /></div>
                         <h4 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0 }}>{vid.title}</h4>
                       </div>
                       <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                          <button className="btn btn-outline" style={{ fontSize: '12px', flex: 1 }} onClick={() => openAssignModal('video', vid)}>Modify Access</button>
                          <button className="btn btn-outline" style={{ color: '#DC2626' }} onClick={() => handleDeleteVideo(vid._id)}><Trash2 size={14} /></button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* --- SECTION VIEW: OTHERS (DPP, PYQ, ETC) PLACEHOLDERS --- */}
      {['dpp', 'pyq', 'notes', 'liveNotes'].includes(activeHubSection) && (
        <div>
           {renderBreadcrumbs()}
           <div style={{ background: 'white', padding: '60px', borderRadius: '24px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>{activeHubSection.toUpperCase()} Management</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>Review and distribute {activeHubSection} resources to student batches.</p>
              <button className="btn btn-primary" onClick={() => setShowReviewModal(true)}>Check Pending {activeHubSection.toUpperCase()} Uploads</button>
           </div>
        </div>
      )}

      {/* SECTION: ASSIGNMENTS */}
      {activeHubSection === 'assignments' && (
        <>
          {renderBreadcrumbs()}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
            <h2 style={{ fontSize: '22px', margin: 0, fontWeight: 'bold' }}>Main Assignments</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {assignments.length === 0 ? <div style={{ background: 'white', padding: '40px', textAlign: 'center', borderRadius: '16px', border: '1px dashed #ccc', gridColumn: '1 / -1' }}>No assignments available.</div> : null}
            {assignments.map(asgn => (
              <div key={asgn._id} style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>{asgn.title}</h3>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
                   Deadline: <strong>{new Date(asgn.deadline).toLocaleDateString()}</strong>
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => {
                  setDistributeData({ id: asgn._id, title: asgn.title, targetType: 'batch' });
                  setShowDistributeModal(true);
                }}>Distribute to Batches</button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* SECTION: TESTS */}
      {activeHubSection === 'tests' && (
        <div>
           {renderBreadcrumbs()}
           <div style={{ background: 'white', padding: '60px', borderRadius: '24px', border: '2px dashed var(--color-border)', textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>Tests Hub</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>Create and manage curriculum-wide examinations.</p>
              <button className="btn btn-primary"><Plus size={18} /> Create New Test</button>
           </div>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* Subject Modal */}
      {showSubjectModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '400px' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>{subjectForm.id ? "Edit Subject" : "New Subject"}</h2>
            <form onSubmit={handleSaveSubject}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Subject Name</label>
                <input type="text" value={subjectForm.name} onChange={e => setSubjectForm({...subjectForm, name: e.target.value})} placeholder="e.g. Mathematics" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowSubjectModal(false)} className="btn btn-outline" style={{ flex: 1, padding: '10px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '10px' }}>Save Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chapter Modal */}
      {showChapterModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '400px' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>{chapterForm.id ? "Edit Chapter" : "New Chapter"}</h2>
            <form onSubmit={handleSaveChapter}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Chapter Name</label>
                <input type="text" value={chapterForm.name} onChange={e => setChapterForm({...chapterForm, name: e.target.value})} placeholder="e.g. Algebra Basics" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowChapterModal(false)} className="btn btn-outline" style={{ flex: 1, padding: '10px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '10px' }}>Save Chapter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '440px' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>Assign {assignData.type.charAt(0).toUpperCase() + assignData.type.slice(1)}</h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: 'var(--color-text-secondary)' }}>Assign <strong>{assignData.name}</strong> to a new batch.</p>
            
            <div style={{ marginBottom: '20px' }}>
               <h4 style={{ fontSize: '13px', color: 'var(--color-text-light)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Currently Assigned To</h4>
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                 {assignData.currentBatches.length === 0 ? <span style={{ fontSize: '13px', color: '#666' }}>No batches assigned yet.</span> : null}
                 {assignData.currentBatches.map(b => (
                   <div key={b._id} style={{ padding: '4px 10px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={12} color="var(--color-primary)" /> {b.name}
                   </div>
                 ))}
               </div>
            </div>

            <form onSubmit={handleAssign}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Filter by Study Class</label>
                <select value={selectedStudyClassId} onChange={e => { setSelectedStudyClassId(e.target.value); setSelectedBatchId(''); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                  <option value="">All Classes</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name} ({c.targetGrade})</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Select Batch</label>
                <select value={selectedBatchId} onChange={e => setSelectedBatchId(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                  <option value="" disabled>Select a batch...</option>
                  {batches
                    .filter(b => !selectedStudyClassId || (b.studyClass?._id === selectedStudyClassId || b.studyClass === selectedStudyClassId))
                    .filter(b => !assignData.currentBatches.find(cb => cb._id === b._id))
                    .map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowAssignModal(false)} className="btn btn-outline" style={{ flex: 1, padding: '10px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '10px' }} disabled={!selectedBatchId}>Add Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Distribute Assignment Modal */}
      {showDistributeModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '440px' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>Distribute Assignment</h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: 'var(--color-text-secondary)' }}>Assign <strong>{distributeData.title}</strong> targeting a specific group.</p>

            <form onSubmit={handleDistributeAssignment}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Target Scope</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                   {['batch', 'class', 'student'].map(type => (
                     <button key={type} type="button" onClick={() => { setDistributeData({...distributeData, targetType: type}); setDistributeTargetId(''); }} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: distributeData.targetType === type ? 'var(--color-primary-light)' : '#f3f4f6', color: distributeData.targetType === type ? 'var(--color-primary)' : '#4b5563', border: distributeData.targetType === type ? '1px solid var(--color-primary)' : '1px solid transparent', fontWeight: 'bold', textTransform: 'capitalize' }}>
                       {type}
                     </button>
                   ))}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Select {distributeData.targetType.charAt(0).toUpperCase() + distributeData.targetType.slice(1)}</label>
                <select value={distributeTargetId} onChange={e => setDistributeTargetId(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                  <option value="" disabled>Select a {distributeData.targetType}...</option>
                  {distributeData.targetType === 'batch' && batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  {distributeData.targetType === 'class' && classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  {distributeData.targetType === 'student' && students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowDistributeModal(false)} className="btn btn-outline" style={{ flex: 1, padding: '10px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '10px' }} disabled={!distributeTargetId}>Distribute Now</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Review Pending Uploads</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
               {/* Left: List of items */}
               <div style={{ borderRight: '1px solid var(--color-border)', paddingRight: '20px' }}>
                  <h4 style={{ fontSize: '13px', color: '#666', marginBottom: '12px', textTransform: 'uppercase' }}>Videos & FAQ</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                      {pendingVideos.map(vid => (
                        <div key={vid._id} style={{ padding: '10px', border: previewVideo?._id === vid._id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', background: previewVideo?._id === vid._id ? 'var(--color-primary-light)' : '#f9fafb' }} onClick={() => setPreviewVideo({...vid, itemType: 'video'})}>
                           <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{vid.contentType === 'faq' ? '❓' : '🎥'} {vid.title}</div>
                           <div style={{ fontSize: '11px', color: '#666' }}>Sub: {vid.subject?.name} | By: {vid.faculty?.name}</div>
                        </div>
                      ))}
                  </div>

                  <h4 style={{ fontSize: '13px', color: '#666', marginBottom: '12px', textTransform: 'uppercase' }}>Assessments</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {pendingAssessments.tests.map(t => (
                        <div key={t._id} style={{ padding: '10px', border: previewVideo?._id === t._id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', background: previewVideo?._id === t._id ? 'var(--color-primary-light)' : '#f9fafb' }} onClick={() => setPreviewVideo({...t, itemType: 'test'})}>
                           <div style={{ fontSize: '14px', fontWeight: 'bold' }}>📝 {t.title} (Main Test)</div>
                        </div>
                      ))}
                      {pendingAssessments.assignments.map(a => (
                        <div key={a._id} style={{ padding: '10px', border: previewVideo?._id === a._id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', background: previewVideo?._id === a._id ? 'var(--color-primary-light)' : '#f9fafb' }} onClick={() => setPreviewVideo({...a, itemType: 'assignment'})}>
                           <div style={{ fontSize: '14px', fontWeight: 'bold' }}>📋 {a.title} (Main Assignment)</div>
                        </div>
                      ))}
                  </div>
               </div>

               {/* Right: Details / Preview */}
               <div>
                  {!previewVideo ? (
                    <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Select an item to preview</div>
                  ) : (
                    <>
                      <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div>
                            <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', display: 'block' }}>Faculty Target Curriculum</span>
                            <strong style={{ fontSize: '13px', color: 'var(--color-primary)' }}>
                               {previewVideo.subject?.name || 'No Subject'} / {previewVideo.chapter?.name || 'No Chapter'}
                            </strong>
                         </div>
                      </div>
                      {previewVideo.itemType === 'video' ? (
                        <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
                           {previewVideo.videoUrl.includes('youtube.com') || previewVideo.videoUrl.includes('youtu.be') ? (
                             <iframe width="100%" height="100%" src={previewVideo.videoUrl.replace('watch?v=', 'embed/')} frameBorder="0" allowFullScreen></iframe>
                           ) : (
                             <VideoPlayer src={previewVideo.videoUrl} />
                           )}
                        </div>
                      ) : (
                        <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', marginBottom: '16px', textAlign: 'center' }}>
                           <h3 style={{ margin: '0 0 8px 0' }}>{previewVideo.title}</h3>
                           <p style={{ color: '#666', fontSize: '14px' }}>Document Preview (PDF)</p>
                           <a href={previewVideo.fileUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'inline-block', marginTop: '12px' }}>Download/View File</a>
                        </div>
                      )}

                      {previewVideo.itemType === 'video' && previewVideo.assignmentUrl && (
                        <div style={{ background: '#f0f9ff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #bae6fd', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FileText size={18} color="#0369a1" />
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#0369a1' }}>Supplementary Assignment (PDF)</span>
                          </div>
                          <a href={previewVideo.assignmentUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', borderColor: '#bae6fd', background: 'white' }}>
                             <Download size={14} style={{ marginRight: '6px' }} /> View PDF
                          </a>
                        </div>
                      )}
                      
                      <div style={{ background: '#fff', border: '1px solid var(--color-border)', padding: '16px', borderRadius: '12px' }}>
                         <h4 style={{ margin: '0 0 8px 0' }}>{previewVideo.description || 'No description provided.'}</h4>
                         <div style={{ fontSize: '13px', color: '#666' }}>Submitted by: <strong>{previewVideo.faculty?.name || previewVideo.facultyId?.name}</strong></div>
                      </div>

                      <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                         {previewVideo.itemType === 'video' ? (
                           <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleLinkVideo(previewVideo._id)}>Approve & Link to Curriculum</button>
                         ) : (
                           <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
                             setDistributeData({ id: previewVideo._id, title: previewVideo.title, targetType: 'batch', type: previewVideo.itemType, isNew: true });
                             setShowDistributeModal(true);
                           }}>Approve & Distribute to Batches</button>
                         )}
                         <button className="btn btn-outline" style={{ color: '#DC2626' }}>Reject</button>
                      </div>
                    </>
                  )}
               </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <button onClick={() => { setShowReviewModal(false); setPreviewVideo(null); }} className="btn btn-outline">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        title={confirmDelete.title}
        message={confirmDelete.message}
        confirmText="Yes, Delete"
        confirmStyle="danger"
        onConfirm={confirmDelete.onConfirm}
        onCancel={() => setConfirmDelete(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default ContentManagement;
