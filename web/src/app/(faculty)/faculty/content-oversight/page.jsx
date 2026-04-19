"use client";

import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart2, Users, CheckCircle2, PlayCircle, FileText, Clock,
  FileWarning, Eye, ArrowLeft, Activity, TrendingUp, Target, Award,
  BookOpen, Calendar, Hash, Layers, AlertCircle, ChevronRight, Play
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatPreviewUrl = (url) => {
  if (!url) return '';
  const isExternal = url.includes('cloudinary.com') || url.includes('e2enetworks.net') || url.includes('objectstore');
  const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  if (isExternal || url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  if (url.startsWith('/')) return `${baseUrl}${url}`;
  return `${baseUrl}/uploads/${url}`;
};

function ContentOversightInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const itemId = searchParams.get('item');

  const [contentList, setContentList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    if (contentList.length > 0 && itemId) {
      const found = contentList.find(c => c._id === itemId);
      const target = found || contentList[0];
      setSelectedItem(target);
      fetchAnalysis(target._id);
      if (!found) router.replace(`/faculty/content-oversight?item=${contentList[0]._id}`);
    } else if (contentList.length > 0 && !itemId) {
      setSelectedItem(contentList[0]);
      fetchAnalysis(contentList[0]._id);
      router.replace(`/faculty/content-oversight?item=${contentList[0]._id}`);
    }
  }, [contentList, itemId]);

  const fetchContent = async () => {
    setPageLoading(true);
    try {
      const res = await axios.get('/api/faculty/content');
      const all = Array.isArray(res.data.data) ? res.data.data : [];
      setContentList(all.filter(c => (c.status || c.approvalStatus) === 'published'));
    } catch {
      toast.error('Failed to load content list.');
    } finally {
      setPageLoading(false);
    }
  };

  const fetchAnalysis = async (id) => {
    setAnalysisLoading(true);
    setAnalysis(null);
    try {
      const res = await axios.get(`/api/faculty/content/analysis/${id}`);
      setAnalysis(res.data.data);
    } catch {
      toast.error('Failed to load content metrics.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    router.push(`/faculty/content-oversight?item=${item._id}`);
    fetchAnalysis(item._id);
  };

  if (pageLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
      <div className="spinner"></div>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading your content library...</p>
    </div>
  );

  if (contentList.length === 0) return (
    <div style={{ padding: '80px', textAlign: 'center', background: 'var(--color-bg)', borderRadius: '20px', border: '2px dashed var(--color-border)', margin: '40px auto', maxWidth: '500px' }}>
      <FileWarning size={56} color="var(--color-text-muted)" style={{ margin: '0 auto 16px', opacity: 0.4 }} />
      <h3 style={{ fontSize: '20px', fontWeight: '800' }}>No Approved Content Yet</h3>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Only Instructor-approved resources appear here. Upload material and wait for verification.</p>
      <Link href="/faculty/content" className="btn btn-primary">Go to Upload Content</Link>
    </div>
  );

  // Derived stats
  const avgWatch = analysis?.watchProgress?.length > 0
    ? Math.round(analysis.watchProgress.reduce((a, p) => a + (p.watchPercentage || 0), 0) / analysis.watchProgress.length)
    : 0;
  const completedCount = analysis?.watchProgress?.filter(p => p.watchPercentage >= 90).length || 0;
  const inProgressCount = analysis?.watchProgress?.filter(p => p.watchPercentage > 0 && p.watchPercentage < 90).length || 0;
  const notStartedCount = (analysis?.watchProgress?.length || 0) - completedCount - inProgressCount;
  const previewUrl = selectedItem ? formatPreviewUrl(selectedItem.url) : '';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', height: 'calc(100vh - 160px)', overflow: 'hidden' }}>

      {/* ── LEFT: Content Selector ───────────────────────────── */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: 'white' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.85, marginBottom: '4px' }}>Approved Resources</div>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>{contentList.length} item{contentList.length !== 1 ? 's' : ''} available</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {contentList.map(item => {
            const isSelected = selectedItem?._id === item._id;
            return (
              <button key={item._id} onClick={() => handleSelectItem(item)} style={{
                width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: '10px', marginBottom: '4px',
                background: isSelected ? 'linear-gradient(135deg,#ede9fe,#e0e7ff)' : 'transparent',
                border: isSelected ? '1px solid #6366f1' : '1px solid transparent',
                cursor: 'pointer', transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: item.type === 'video' ? '#e0e7ff' : '#fef3c7', color: item.type === 'video' ? '#4f46e5' : '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.thumbnail
                    ? <img src={item.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    : (item.type === 'video' ? <Play size={16} /> : <FileText size={16} />)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: isSelected ? '#4f46e5' : 'var(--color-text-primary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', textTransform: 'capitalize' }}>
                    {item.type === 'video' ? <PlayCircle size={10} /> : <FileText size={10} />} {item.type}
                  </div>
                </div>
                {isSelected && <ChevronRight size={14} color="#6366f1" style={{ flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT: Oversight Viewer ──────────────────────────── */}
      <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '2px' }}>
        {!selectedItem ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
            Select a resource from the left panel
          </div>
        ) : (
          <>
            {/* Resource Info Header */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {selectedItem.thumbnail
                    ? <img src={selectedItem.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <BarChart2 size={22} color="white" />}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>{selectedItem.title}</h2>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BookOpen size={12} /> {selectedItem.subject?.name || 'Unlinked'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Layers size={12} style={{ textTransform: 'capitalize' }} /> {selectedItem.type?.toUpperCase()}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {new Date(selectedItem.createdAt || selectedItem.uploadedAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
              <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: '#dcfce7', color: '#166534' }}>✅ Approved</span>
            </div>

            {/* Stats Row */}
            {analysisLoading ? (
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '40px', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Fetching analytics...</p>
              </div>
            ) : analysis ? (
              <>
                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {[
                    { icon: <Eye size={20} color="white" />, bg: 'linear-gradient(135deg,#6366f1,#4f46e5)', label: 'Total Views', value: analysis.totalViews || 0, sub: 'times accessed' },
                    { icon: <TrendingUp size={20} color="white" />, bg: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', label: 'Total Clicks', value: analysis.totalClicks || 0, sub: 'interactions' },
                    { icon: <Users size={20} color="white" />, bg: 'linear-gradient(135deg,#06b6d4,#0891b2)', label: 'Students', value: analysis.watchProgress?.length || 0, sub: 'watching' },
                    { icon: <Award size={20} color="white" />, bg: 'linear-gradient(135deg,#10b981,#059669)', label: 'Avg Progress', value: `${avgWatch}%`, sub: 'watch completion' },
                  ].map(({ icon, bg, label, value, sub }) => (
                    <div key={label} style={{ background: 'white', borderRadius: '14px', border: '1px solid var(--color-border)', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
                      <div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text-primary)', lineHeight: 1 }}>{value}</div>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-text-secondary)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Media Preview + Completion + Batches */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Media Preview */}
                  <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-border)', fontSize: '13px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Eye size={13} /> Media Preview
                    </div>
                    <div style={{ background: '#0f172a', aspectRatio: selectedItem.type === 'video' ? '16/9' : '4/3' }}>
                      {selectedItem.type === 'video' ? (
                        <video key={previewUrl} controls controlsList="nodownload" style={{ width: '100%', height: '100%', display: 'block' }} src={previewUrl} poster={selectedItem.thumbnail} />
                      ) : previewUrl ? (
                        <iframe key={previewUrl} src={`${previewUrl}#toolbar=0`} style={{ width: '100%', height: '100%', border: 'none', background: 'white' }} title={selectedItem.title} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', padding: '40px' }}>
                          <FileText size={40} style={{ marginBottom: '8px', opacity: 0.3 }} />
                          <span style={{ fontSize: '13px' }}>No preview available</span>
                        </div>
                      )}
                    </div>
                    {selectedItem.assignmentUrl && (
                      <div style={{ padding: '12px 16px' }}>
                        <a href={formatPreviewUrl(selectedItem.assignmentUrl)} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#92400e', textDecoration: 'none' }}>
                          <FileText size={14} /> Open Exercise Sheet
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Completion Breakdown + Batches */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Completion Breakdown */}
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '18px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Target size={13} /> Completion Breakdown
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                        {[
                          { label: 'Completed', count: completedCount, color: '#10b981', bg: '#d1fae5', desc: '≥90%' },
                          { label: 'In Progress', count: inProgressCount, color: '#f59e0b', bg: '#fef3c7', desc: '1-89%' },
                          { label: 'Not Started', count: notStartedCount, color: '#94a3b8', bg: '#f1f5f9', desc: '0%' },
                        ].map(({ label, count, color, bg, desc }) => (
                          <div key={label} style={{ background: bg, borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: '800', color }}>{count}</div>
                            <div style={{ fontSize: '11px', fontWeight: '700', color, marginTop: '2px' }}>{label}</div>
                            <div style={{ fontSize: '10px', color, opacity: 0.7 }}>{desc}</div>
                          </div>
                        ))}
                      </div>
                      {/* Overall progress bar */}
                      {(analysis.watchProgress?.length || 0) > 0 && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                            <span>Overall Completion Rate</span>
                            <span style={{ fontWeight: '700' }}>{Math.round((completedCount / (analysis.watchProgress?.length || 1)) * 100)}%</span>
                          </div>
                          <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.round((completedCount / (analysis.watchProgress?.length || 1)) * 100)}%`, background: 'linear-gradient(90deg,#10b981,#059669)', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Batch Assignments */}
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '18px', flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={13} /> Batch Assignments ({analysis.assignedTo?.length || 0})
                      </div>
                      {analysis.assignedTo?.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {analysis.assignedTo.map(batch => (
                            <span key={batch._id} style={{ background: '#ede9fe', color: '#5b21b6', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                              {batch.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', background: '#f8fafc', borderRadius: '10px' }}>
                          <AlertCircle size={24} style={{ opacity: 0.3, marginBottom: '8px' }} />
                          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', textAlign: 'center', margin: 0 }}>Not yet assigned to any batches. Contact your instructor.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Student Watch Progress Table */}
                {analysis.watchProgress?.length > 0 && (
                  <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={14} /> Student Watch Progress
                      </div>
                      <span style={{ fontSize: '12px', background: '#ede9fe', color: '#5b21b6', padding: '4px 12px', borderRadius: '20px', fontWeight: '600' }}>{analysis.watchProgress.length} students</span>
                    </div>
                    <div style={{ padding: '8px 16px 16px' }}>
                      {analysis.watchProgress.map((p, i) => (
                        <div key={p._id || i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 8px', borderBottom: i < analysis.watchProgress.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                          {/* Avatar */}
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '800', flexShrink: 0 }}>
                            {p.student?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          {/* Name + Email */}
                          <div style={{ width: '180px', flexShrink: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{p.student?.name || 'Unknown'}</div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{p.student?.email || '—'}</div>
                          </div>
                          {/* Progress Bar */}
                          <div style={{ flex: 1 }}>
                            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{
                                height: '100%',
                                width: `${p.watchPercentage || 0}%`,
                                background: p.watchPercentage >= 90 ? 'linear-gradient(90deg,#10b981,#059669)' : p.watchPercentage > 0 ? 'linear-gradient(90deg,#f59e0b,#d97706)' : '#e2e8f0',
                                borderRadius: '4px',
                                transition: 'width 0.5s ease'
                              }} />
                            </div>
                          </div>
                          {/* Percent */}
                          <div style={{ width: '48px', textAlign: 'right', fontSize: '14px', fontWeight: '800', color: p.watchPercentage >= 90 ? '#10b981' : p.watchPercentage > 0 ? '#f59e0b' : '#94a3b8', flexShrink: 0 }}>
                            {p.watchPercentage || 0}%
                          </div>
                          {/* Status badge */}
                          <div style={{ flexShrink: 0 }}>
                            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                              background: p.watchPercentage >= 90 ? '#d1fae5' : p.watchPercentage > 0 ? '#fef3c7' : '#f1f5f9',
                              color: p.watchPercentage >= 90 ? '#065f46' : p.watchPercentage > 0 ? '#92400e' : '#64748b'
                            }}>
                              {p.watchPercentage >= 90 ? '✓ Done' : p.watchPercentage > 0 ? '⏳ Active' : '— Not started'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '60px', textAlign: 'center' }}>
                <AlertCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Analytics Unavailable</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>Could not load metrics for this resource.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ContentOversightPage() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <Link href="/faculty/content" className="btn btn-ghost" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <ArrowLeft size={16} /> Back to Content
        </Link>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Content Oversight</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Preview your approved resources and monitor student engagement.</p>
        </div>
      </div>

      <Suspense fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div className="spinner"></div>
        </div>
      }>
        <ContentOversightInner />
      </Suspense>
    </div>
  );
}
