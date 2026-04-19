"use client";

import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart2, Users, CheckCircle2, PlayCircle, FileText, Clock,
  FileWarning, Eye, ArrowLeft, Activity, TrendingUp, Target, Award,
  BookOpen, Calendar, Layers, AlertCircle, Play
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

  const [item, setItem] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    if (!itemId) {
      // No item specified — go back
      router.replace('/faculty/content');
      return;
    }
    fetchItemAndAnalysis(itemId);
  }, [itemId]);

  const fetchItemAndAnalysis = async (id) => {
    setPageLoading(true);
    try {
      // Fetch all content and find the specific item
      const res = await axios.get('/api/faculty/content');
      const all = Array.isArray(res.data.data) ? res.data.data : [];
      const found = all.find(c => c._id === id);

      if (!found) {
        toast.error('Content item not found.');
        router.replace('/faculty/content');
        return;
      }

      setItem(found);

      // Now fetch analytics
      setAnalysisLoading(true);
      try {
        const aRes = await axios.get(`/api/faculty/content/analysis/${id}`);
        setAnalysis(aRes.data.data);
      } catch {
        toast.error('Could not load analytics for this resource.');
        setAnalysis(null);
      } finally {
        setAnalysisLoading(false);
      }
    } catch {
      toast.error('Failed to load content.');
      router.replace('/faculty/content');
    } finally {
      setPageLoading(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────
  if (pageLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
      <div className="spinner"></div>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading content oversight...</p>
    </div>
  );

  if (!item) return null;

  // ── Derived stats ─────────────────────────────────────────
  const rawStatus = item.status || item.approvalStatus || 'draft';
  const previewUrl = formatPreviewUrl(item.url);
  const avgWatch = analysis?.watchProgress?.length > 0
    ? Math.round(analysis.watchProgress.reduce((a, p) => a + (p.watchPercentage || 0), 0) / analysis.watchProgress.length)
    : 0;
  const completedCount   = analysis?.watchProgress?.filter(p => p.watchPercentage >= 90).length || 0;
  const inProgressCount  = analysis?.watchProgress?.filter(p => p.watchPercentage > 0 && p.watchPercentage < 90).length || 0;
  const notStartedCount  = (analysis?.watchProgress?.length || 0) - completedCount - inProgressCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Resource Info Banner ────────────────────────────── */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', overflow: 'hidden', background: item.type === 'video' ? '#e0e7ff' : '#fef3c7', color: item.type === 'video' ? '#4f46e5' : '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {item.thumbnail
              ? <img src={item.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (item.type === 'video' ? <Play size={24} /> : <FileText size={24} />)}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{item.title}</h2>
            <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BookOpen size={12} /> {item.subject?.name || 'Unknown Subject'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'capitalize' }}><Layers size={12} /> {item.type}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {new Date(item.createdAt || item.uploadedAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
        <span style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', background: '#dcfce7', color: '#166534', flexShrink: 0 }}>
          ✅ Approved
        </span>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────── */}
      {analysisLoading ? (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '48px', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Fetching analytics data...</p>
        </div>
      ) : analysis ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            {[
              { icon: <Eye size={22} color="white" />,        bg: 'linear-gradient(135deg,#6366f1,#4f46e5)', label: 'Total Views',       value: analysis.totalViews || 0,              sub: 'times accessed' },
              { icon: <TrendingUp size={22} color="white" />, bg: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', label: 'Total Clicks',      value: analysis.totalClicks || 0,             sub: 'interactions' },
              { icon: <Users size={22} color="white" />,      bg: 'linear-gradient(135deg,#06b6d4,#0891b2)', label: 'Students',          value: analysis.watchProgress?.length || 0,   sub: 'watching this' },
              { icon: <Award size={22} color="white" />,      bg: 'linear-gradient(135deg,#10b981,#059669)', label: 'Avg Progress',      value: `${avgWatch}%`,                        sub: 'avg watch completion' },
            ].map(({ icon, bg, label, value, sub }) => (
              <div key={label} style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
                <div>
                  <div style={{ fontSize: '30px', fontWeight: '800', color: 'var(--color-text-primary)', lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Media Preview + Completion + Batches ──────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px' }}>

            {/* Media Preview */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={13} /> Live Media Preview
              </div>
              <div style={{ background: '#0f172a', aspectRatio: item.type === 'video' ? '16/9' : '4/3', position: 'relative' }}>
                {item.type === 'video' ? (
                  <video
                    key={previewUrl}
                    controls
                    controlsList="nodownload"
                    style={{ width: '100%', height: '100%', display: 'block' }}
                    src={previewUrl}
                    poster={item.thumbnail}
                  />
                ) : previewUrl ? (
                  <iframe
                    key={previewUrl}
                    src={`${previewUrl}#toolbar=0`}
                    style={{ width: '100%', height: '100%', border: 'none', background: 'white' }}
                    title={item.title}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', padding: '40px' }}>
                    <FileText size={40} style={{ marginBottom: '8px', opacity: 0.3 }} />
                    <span style={{ fontSize: '13px' }}>No preview available</span>
                  </div>
                )}
              </div>
              {item.assignmentUrl && (
                <div style={{ padding: '12px 16px' }}>
                  <a href={formatPreviewUrl(item.assignmentUrl)} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#92400e', textDecoration: 'none' }}>
                    <FileText size={14} /> Open Exercise Sheet
                  </a>
                </div>
              )}
            </div>

            {/* Right Column: Completion + Batches */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Completion Breakdown */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Target size={13} /> Completion Breakdown
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  {[
                    { label: 'Completed',   count: completedCount,  color: '#10b981', bg: '#d1fae5', desc: '≥ 90%' },
                    { label: 'In Progress', count: inProgressCount, color: '#f59e0b', bg: '#fef3c7', desc: '1–89%' },
                    { label: 'Not Started', count: notStartedCount, color: '#94a3b8', bg: '#f1f5f9', desc: '0%' },
                  ].map(({ label, count, color, bg, desc }) => (
                    <div key={label} style={{ background: bg, borderRadius: '12px', padding: '14px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '26px', fontWeight: '800', color }}>{count}</div>
                      <div style={{ fontSize: '11px', fontWeight: '700', color, marginTop: '2px' }}>{label}</div>
                      <div style={{ fontSize: '10px', color, opacity: 0.7 }}>{desc}</div>
                    </div>
                  ))}
                </div>
                {(analysis.watchProgress?.length || 0) > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                      <span>Overall Completion Rate</span>
                      <span style={{ fontWeight: '700' }}>{Math.round((completedCount / (analysis.watchProgress?.length || 1)) * 100)}%</span>
                    </div>
                    <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.round((completedCount / (analysis.watchProgress?.length || 1)) * 100)}%`, background: 'linear-gradient(90deg,#10b981,#059669)', borderRadius: '5px', transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Batch Assignments */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '20px', flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={13} /> Batch Assignments ({analysis.assignedTo?.length || 0})
                </div>
                {analysis.assignedTo?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {analysis.assignedTo.map(batch => (
                      <span key={batch._id} style={{ background: '#ede9fe', color: '#5b21b6', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                        {batch.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px', background: '#f8fafc', borderRadius: '10px' }}>
                    <AlertCircle size={28} style={{ opacity: 0.25, margin: '0 auto 8px' }} />
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', margin: 0 }}>Not yet assigned to any batches.<br />Check with your instructor.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Student Watch Progress Table ─────────────────── */}
          {analysis.watchProgress?.length > 0 && (
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} /> Student Watch Progress
                </div>
                <span style={{ fontSize: '12px', background: '#ede9fe', color: '#5b21b6', padding: '4px 14px', borderRadius: '20px', fontWeight: '600' }}>
                  {analysis.watchProgress.length} student{analysis.watchProgress.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ padding: '8px 16px 16px' }}>
                {analysis.watchProgress.map((p, i) => (
                  <div key={p._id || i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 8px', borderBottom: i < analysis.watchProgress.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    {/* Avatar */}
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: '800', flexShrink: 0 }}>
                      {p.student?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    {/* Name + Email */}
                    <div style={{ width: '200px', flexShrink: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{p.student?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{p.student?.email || '—'}</div>
                    </div>
                    {/* Progress Bar */}
                    <div style={{ flex: 1 }}>
                      <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${p.watchPercentage || 0}%`,
                          background: p.watchPercentage >= 90 ? 'linear-gradient(90deg,#10b981,#059669)' : p.watchPercentage > 0 ? 'linear-gradient(90deg,#f59e0b,#d97706)' : '#e2e8f0',
                          borderRadius: '5px',
                          transition: 'width 0.6s ease'
                        }} />
                      </div>
                    </div>
                    {/* Percent */}
                    <div style={{ width: '50px', textAlign: 'right', fontSize: '15px', fontWeight: '800', color: p.watchPercentage >= 90 ? '#10b981' : p.watchPercentage > 0 ? '#f59e0b' : '#94a3b8', flexShrink: 0 }}>
                      {p.watchPercentage || 0}%
                    </div>
                    {/* Badge */}
                    <div style={{ flexShrink: 0 }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                        background: p.watchPercentage >= 90 ? '#d1fae5' : p.watchPercentage > 0 ? '#fef3c7' : '#f1f5f9',
                        color:      p.watchPercentage >= 90 ? '#065f46' : p.watchPercentage > 0 ? '#92400e' : '#64748b'
                      }}>
                        {p.watchPercentage >= 90 ? '✓ Completed' : p.watchPercentage > 0 ? '⏳ In Progress' : '— Not Started'}
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
          <AlertCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.25 }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Analytics Unavailable</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>Could not load metrics for this resource. Try again later.</p>
        </div>
      )}
    </div>
  );
}

export default function ContentOversightPage() {
  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link href="/faculty/content" className="btn btn-ghost" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <ArrowLeft size={16} /> Back to Content
        </Link>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Content Oversight</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Full analytics and live preview for this resource.</p>
        </div>
      </div>

      <Suspense fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
          <div className="spinner"></div>
        </div>
      }>
        <ContentOversightInner />
      </Suspense>
    </div>
  );
}
