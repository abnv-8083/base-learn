"use client";

import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';
import { BarChart2, Users, CheckCircle2, PlayCircle, FileText, Clock, FileWarning, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

function OversightContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const itemId = searchParams.get('item');

  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [analysisItem, setAnalysisItem] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    fetchMyContent();
  }, []);

  useEffect(() => {
    if (contentList.length > 0) {
      if (itemId) {
        const found = contentList.find(c => c._id === itemId);
        if (found) {
          setSelectedItem(found);
          fetchAnalysis(found._id);
        } else {
          // Defaults to first if not found
          setSelectedItem(contentList[0]);
          fetchAnalysis(contentList[0]._id);
          router.replace('/faculty/content-oversight?item=' + contentList[0]._id);
        }
      } else {
        setSelectedItem(contentList[0]);
        fetchAnalysis(contentList[0]._id);
        router.replace('/faculty/content-oversight?item=' + contentList[0]._id);
      }
    }
  }, [contentList, itemId]);

  const fetchMyContent = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/faculty/content');
      const allContent = Array.isArray(res.data.data) ? res.data.data : [];
      // Only keep approved/published content that can have analysis
      const published = allContent.filter(c => c.status === 'published' || c.approvalStatus === 'published');
      setContentList(published);
    } catch {
      toast.error('Failed to load content list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async (id) => {
    setAnalysisLoading(true);
    try {
      const res = await axios.get(`/api/faculty/content/analysis/${id}`);
      setAnalysisItem(res.data.data);
    } catch {
      toast.error('Failed to load content metrics.');
      setAnalysisItem(null);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const formatPreviewUrl = (url) => {
    if (!url) return '';
    const isExternal = url.includes('cloudinary.com') || url.includes('e2enetworks.net') || url.includes('objectstore');
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '';
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');

    if (isExternal) return url;
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    if (url.startsWith('/')) return `${cleanBaseUrl}${url}`;
    return `${cleanBaseUrl}/uploads/${url}`;
  };

  const handleSelectItem = (item) => {
    router.push(`/faculty/content-oversight?item=${item._id}`);
  };

  if (loading) return <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }}></div>;

  if (contentList.length === 0) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', background: 'var(--color-bg)', borderRadius: '16px', border: '2px dashed var(--color-border)', margin: '40px' }}>
         <FileWarning size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
         <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>No Published Content Found</h3>
         <p style={{ color: 'var(--color-text-secondary)' }}>You must upload and have your content approved first.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '24px', paddingBottom: '60px', height: 'calc(100vh - 120px)' }}>
      
      {/* Left Sidebar - Content List */}
      <div style={{ width: '300px', background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-light)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
             <FileText size={18} /> Available Materials
          </h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {contentList.map(item => {
            const isSelected = selectedItem?._id === item._id;
            return (
              <div 
                key={item._id}
                onClick={() => handleSelectItem(item)}
                style={{ 
                  padding: '12px', 
                  borderRadius: '12px', 
                  cursor: 'pointer',
                  marginBottom: '8px',
                  background: isSelected ? 'var(--color-primary-light)' : 'transparent',
                  border: isSelected ? '1px solid var(--color-primary)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                  borderBottom: !isSelected ? '1px solid var(--color-border)' : '1px solid var(--color-primary)'
                }}
              >
                 <div style={{ fontSize: '14px', fontWeight: 'bold', color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{item.title}</div>
                 <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                    {item.type === 'video' ? <PlayCircle size={12} /> : <FileText size={12} />}
                    <span style={{ textTransform: 'capitalize' }}>{item.type}</span>
                    <span style={{ margin: '0 4px' }}>•</span>
                    <span>{new Date(item.createdAt || item.uploadedAt).toLocaleDateString()}</span>
                 </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right Content Area - Oversight Viewer */}
      <div style={{ flex: 1, background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {selectedItem ? (
            <>
              {/* Media Preview Component */}
              <div style={{ width: '100%', height: '400px', background: '#000', flexShrink: 0, borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                 {selectedItem.type === 'video' ? (
                   <video 
                      key={selectedItem.url}
                      controls 
                      controlsList="nodownload"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      src={formatPreviewUrl(selectedItem.url)}
                   />
                 ) : (
                   <iframe 
                      key={selectedItem.url}
                      src={`${formatPreviewUrl(selectedItem.url)}#toolbar=0`} 
                      style={{ width: '100%', height: '100%', border: 'none', background: 'white' }}
                      title="PDF Preview"
                   />
                 )}
                 <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '8px', color: 'white', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Eye size={14} /> LIVE PREVIEW
                 </div>
              </div>

              {/* Analytics Section */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                 {analysisLoading ? <div className="spinner" style={{ margin: 'auto' }}></div> : analysisItem ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <BarChart2 size={20} />
                          </div>
                          <div>
                             <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{selectedItem.title} - Analytics</h2>
                             <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Clock size={14} /> Synced metrics from student progression
                             </div>
                          </div>
                      </div>

                      <div className="grid-3-col" style={{ marginBottom: '32px' }}>
                          <div style={{ background: 'var(--color-bg)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                             <div style={{ color: 'var(--color-text-secondary)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '8px' }}>Total Views</div>
                             <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-primary)' }}>{analysisItem.totalViews || 0}</div>
                          </div>
                          <div style={{ background: 'var(--color-bg)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                             <div style={{ color: 'var(--color-text-secondary)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '8px' }}>Total Clicks</div>
                             <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-accent)' }}>{analysisItem.totalClicks || 0}</div>
                          </div>
                          <div style={{ background: 'var(--color-bg)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                             <div style={{ color: 'var(--color-text-secondary)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '8px' }}>Student Count</div>
                             <div style={{ fontSize: '28px', fontWeight: '800', color: '#10b981' }}>{analysisItem.watchProgress?.length || 0}</div>
                          </div>
                      </div>

                      <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Users size={18} /> Current Batch Assignments
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '32px' }}>
                          {analysisItem.assignedTo?.length > 0 ? analysisItem.assignedTo.map(batch => (
                            <div key={batch._id} style={{ background: 'white', border: '1px solid var(--color-border)', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                               <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                               {batch.name}
                            </div>
                          )) : (
                            <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px', fontStyle: 'italic' }}>Not assigned to any batches yet. Verify with instructors.</div>
                          )}
                      </div>

                      {analysisItem.watchProgress?.length > 0 && (
                        <>
                          <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <CheckCircle2 size={18} /> Student Watch Progress
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {analysisItem.watchProgress.map(p => (
                                <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--color-bg)', borderRadius: '12px' }}>
                                   <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{p.student?.name}</div>
                                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{p.student?.email}</div>
                                   </div>
                                   <div style={{ width: '200px' }}>
                                      <div style={{ height: '8px', width: '100%', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
                                         <div style={{ height: '100%', width: `${p.watchPercentage}%`, background: p.watchPercentage >= 90 ? '#10b981' : 'var(--color-primary)' }} />
                                      </div>
                                      <div style={{ fontSize: '12px', textAlign: 'right', fontWeight: 'bold' }}>{p.watchPercentage}% Completed</div>
                                   </div>
                                </div>
                              ))}
                          </div>
                        </>
                      )}
                    </div>
                 ) : (
                    <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginTop: '40px' }}>Failed to load analytics for this resource.</div>
                 )}
              </div>
            </>
          ) : (
            <div style={{ margin: 'auto', color: 'var(--color-text-secondary)' }}>Select an item to view its oversight report.</div>
          )}
      </div>

    </div>
  );
}

export default function ContentOversight() {
  return (
    <div>
      <div className="page-header" style={{ marginBottom: '24px' }}>
         <h1 className="page-title">Content Oversight</h1>
         <p className="page-subtitle">Track engagement, preview resources, and review student progress seamlessly.</p>
      </div>
      <Suspense fallback={<div className="spinner" style={{ margin: 'auto' }}></div>}>
        <OversightContent />
      </Suspense>
    </div>
  );
}
