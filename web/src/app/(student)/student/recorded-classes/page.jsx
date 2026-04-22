"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PlayCircle, Search, Clock, ChevronRight, Home, Book, BookOpen,
  Folder, ArrowLeft, FileText, ClipboardList, MonitorPlay, CheckCircle,
  Percent, Sparkles, GraduationCap, Play, TrendingUp, Radio, X
} from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import toast from 'react-hot-toast';
import PdfPreviewModal from '@/components/PdfPreviewModal';

// ── Hub category config ──────────────────────────────────────
const HUB_CATS = [
  { id: 'video',    label: 'Recorded Classes', icon: PlayCircle,   color: '#6366f1', grad: 'linear-gradient(135deg,#4f46e5,#7c3aed)', subtitle: 'Premium Video Lectures' },
  { id: 'dpp',      label: 'DPP',              icon: ClipboardList, color: '#f59e0b', grad: 'linear-gradient(135deg,#d97706,#f59e0b)', subtitle: 'Daily Practice Papers' },
  { id: 'pyq',      label: 'PYQ',              icon: FileText,      color: '#10b981', grad: 'linear-gradient(135deg,#059669,#10b981)', subtitle: 'Previous Year Questions' },
  { id: 'resource', label: 'Resources',         icon: Book,          color: '#ec4899', grad: 'linear-gradient(135deg,#db2777,#ec4899)', subtitle: 'Complementary Materials' },
  { id: 'progress', label: 'My Progress',       icon: TrendingUp,    color: '#8b5cf6', grad: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', subtitle: 'Syllabus Coverage' },
];

// ── Breadcrumb ───────────────────────────────────────────────
function Breadcrumbs({ viewCategory, currentSubject, currentChapter, onHome, onCategory, onSubject }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', background: 'white', border: '1px solid #e8edf5', padding: '10px 16px', borderRadius: '14px', width: 'fit-content', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', marginBottom: '24px' }}>
      <button onClick={onHome} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', transition: 'color 0.15s', padding: '2px 4px', borderRadius: '6px' }}
        onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
        <Home size={13} /> Hub
      </button>
      {viewCategory && (
        <>
          <ChevronRight size={11} color="#cbd5e1" />
          <button onClick={onCategory}
            style={{ background: currentSubject ? 'none' : '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: currentSubject ? '#94a3b8' : '#6366f1', padding: '3px 8px', borderRadius: '7px', transition: 'all 0.15s', textTransform: 'capitalize' }}>
            {viewCategory === 'video' ? 'Recorded Classes' : viewCategory === 'progress' ? 'Progress' : viewCategory.toUpperCase()}
          </button>
        </>
      )}
      {currentSubject && (
        <>
          <ChevronRight size={11} color="#cbd5e1" />
          <button onClick={onSubject}
            style={{ background: currentChapter ? 'none' : '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: currentChapter ? '#94a3b8' : '#6366f1', padding: '3px 8px', borderRadius: '7px', transition: 'all 0.15s' }}>
            {currentSubject.title}
          </button>
        </>
      )}
      {currentChapter && (
        <>
          <ChevronRight size={11} color="#cbd5e1" />
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#6366f1', background: '#eef2ff', padding: '3px 8px', borderRadius: '7px' }}>{currentChapter.title}</span>
        </>
      )}
    </div>
  );
}

// ── Hub Card ────────────────────────────────────────────────
function HubCard({ cat, onClick }) {
  const Icon = cat.icon;
  return (
    <div onClick={onClick} style={{ borderRadius: '24px', overflow: 'hidden', background: 'white', border: '1px solid #e8edf5', boxShadow: '0 4px 16px rgba(15,23,42,0.07)', cursor: 'pointer', transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)', display: 'flex', flexDirection: 'column' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = `0 24px 40px ${cat.color}28`; e.currentTarget.style.borderColor = `${cat.color}50`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,23,42,0.07)'; e.currentTarget.style.borderColor = '#e8edf5'; }}>
      {/* Gradient top strip */}
      <div style={{ height: '5px', background: cat.grad }} />
      <div style={{ padding: '36px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '18px', flex: 1 }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '22px', background: `${cat.color}12`, border: `1.5px solid ${cat.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
          <Icon size={38} color={cat.color} />
        </div>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>{cat.label}</h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0, fontWeight: '600' }}>{cat.subtitle}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: cat.color, fontWeight: '800', background: `${cat.color}10`, padding: '5px 14px', borderRadius: '99px', marginTop: '4px' }}>
          Open <ChevronRight size={13} />
        </div>
      </div>
    </div>
  );
}

// ── Subject / Chapter row ────────────────────────────────────
function NavRow({ icon: Icon, title, sub, color = '#6366f1', onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', background: 'white', borderRadius: '18px', border: '1px solid #e8edf5', boxShadow: '0 2px 10px rgba(15,23,42,0.05)', cursor: 'pointer', transition: 'all 0.18s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 4px 20px ${color}18`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#e8edf5'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(15,23,42,0.05)'; }}>
      <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${color}12`, border: `1.5px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={24} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.01em' }}>{title}</h4>
        {sub && <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>{sub}</p>}
      </div>
      <ChevronRight size={18} color="#cbd5e1" />
    </div>
  );
}

// ── Progress Card ────────────────────────────────────────────
function ProgressCard({ item }) {
  const pct = item.progress || 0;
  const done = pct >= 100;
  return (
    <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: done ? '1px solid #6ee7b7' : '1px solid #e8edf5', boxShadow: done ? '0 4px 20px rgba(16,185,129,0.12)' : '0 2px 12px rgba(15,23,42,0.06)', transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(15,23,42,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = done ? '0 4px 20px rgba(16,185,129,0.12)' : '0 2px 12px rgba(15,23,42,0.06)'; }}>
      {/* top bar */}
      <div style={{ height: '4px', background: done ? 'linear-gradient(90deg,#10b981,#34d399)' : `linear-gradient(90deg, #6366f1 ${pct}%, #e8edf5 ${pct}%)` }} />
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: done ? '#ecfdf5' : '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={20} color={done ? '#10b981' : '#6366f1'} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: '900', padding: '5px 12px', borderRadius: '99px', letterSpacing: '0.04em', background: done ? '#dcfce7' : '#f1f5f9', color: done ? '#15803d' : '#64748b', border: `1px solid ${done ? '#bbf7d0' : '#e2e8f0'}` }}>
            {pct}% Complete
          </span>
        </div>
        <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginBottom: '6px', letterSpacing: '-0.02em' }}>{item.name}</h3>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px', fontWeight: '600' }}>
          Faculty: <strong style={{ color: '#475569' }}>{item.faculty?.name || 'Assigned'}</strong>
        </p>
        <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: done ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: '4px', transition: 'width 1s ease' }} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {[['📹', item.stats?.videos || 0, 'Videos'], ['📋', item.stats?.assignments || 0, 'Assignments'], ['📝', item.stats?.tests || 0, 'Tests']].map(([emoji, count, lbl]) => (
            <div key={lbl} style={{ flex: 1, textAlign: 'center', background: '#f8fafc', borderRadius: '10px', padding: '8px 4px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '15px' }}>{emoji}</div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#1e293b', lineHeight: 1 }}>{count}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', marginTop: '2px' }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Content Card (Video / PDF resource) ─────────────────────
function ContentCard({ item, onPlay, onPreview }) {
  const isRes = item.isResource;
  const color = isRes ? '#f59e0b' : '#6366f1';
  const grad = isRes ? 'linear-gradient(135deg,#b45309,#f59e0b)' : 'linear-gradient(135deg,#4f46e5,#7c3aed)';
  return (
    <div style={{ background: 'white', borderRadius: '22px', overflow: 'hidden', border: `1px solid ${color}20`, boxShadow: '0 4px 18px rgba(15,23,42,0.07)', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'all 0.2s' }}
      onClick={() => {
        if (isRes) onPreview(item.fileUrl, item.title);
        else if (item.contentType === 'liveRecording') window.open(item.videoUrl, '_blank');
        else onPlay(item);
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 16px 36px ${color}22`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 18px rgba(15,23,42,0.07)'; }}>
      {/* Thumbnail */}
      <div style={{ width: '100%', aspectRatio: '16/9', position: 'relative', overflow: 'hidden', background: '#0f172a', flexShrink: 0 }}>
        {item.thumbnail
          ? <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', background: grad, opacity: 0.2 }} />}
        {/* Center play icon */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: item.thumbnail ? 'rgba(0,0,0,0.2)' : 'transparent' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            {isRes ? <FileText size={22} color="white" /> : <Play size={22} color="white" />}
          </div>
        </div>
        {/* Type badge */}
        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)', color: color, padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '900', letterSpacing: '0.06em' }}>
          {item.type?.toUpperCase() || (isRes ? 'PDF' : 'VIDEO')}
        </div>
        {/* Gradient overlay bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', pointerEvents: 'none' }} />
      </div>
      {/* Card body */}
      <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px', lineHeight: 1.35, letterSpacing: '-0.01em' }}>{item.title}</h3>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px', lineHeight: 1.6, flex: 1 }}>{item.description || 'Access high-quality study materials and video lectures.'}</p>
        {item.assignmentUrl && (
          <button onClick={e => { e.stopPropagation(); onPreview(item.assignmentUrl, `${item.title} — Notes`); }}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 12px', borderRadius: '10px', background: '#fffbeb', border: '1px dashed #fde68a', color: '#92400e', fontSize: '12px', fontWeight: '800', cursor: 'pointer', marginBottom: '14px', width: 'fit-content', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fef3c7'}
            onMouseLeave={e => e.currentTarget.style.background = '#fffbeb'}>
            <FileText size={13} /> {item.contentType === 'liveRecording' ? 'Class Notes' : 'Worksheet'}
          </button>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={12} /> {new Date(item.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900', color: 'white', flexShrink: 0 }}>
              {item.faculty?.name?.charAt(0) || 'I'}
            </div>
            <span style={{ color: '#475569', fontWeight: '700' }}>{item.faculty?.name || 'Instructor'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Video Player View ────────────────────────────────────────
function PlayerView({ video, onBack, onPreview }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeUp 0.35s ease' }}>
      <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', background: 'white', border: '1.5px solid #e2e8f0', color: '#475569', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s', width: 'fit-content', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
        onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
        onMouseLeave={e => e.currentTarget.style.background = 'white'}>
        <ArrowLeft size={16} /> Back to Content
      </button>

      <div style={{ width: '100%', aspectRatio: '16/9', maxHeight: '70vh', background: '#000', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <VideoPlayer src={video.fileUrl} title={video.title} poster={video.thumbnail} />
      </div>

      <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e8edf5', boxShadow: '0 4px 20px rgba(15,23,42,0.06)', overflow: 'hidden' }}>
        {/* Now playing banner */}
        <div style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '99px', fontSize: '10px', fontWeight: '900', color: 'white', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
              <Radio size={10} /> Now Playing
            </div>
            <h2 style={{ margin: 0, fontSize: 'clamp(18px,3vw,26px)', fontWeight: '900', color: 'white', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{video.title}</h2>
          </div>
          {video.faculty && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.12)', padding: '10px 16px', borderRadius: '14px', backdropFilter: 'blur(8px)' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '900', color: 'white' }}>{video.faculty.name?.charAt(0)}</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: 'white' }}>{video.faculty.name}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontWeight: '600' }}>Senior Educator</div>
              </div>
            </div>
          )}
        </div>
        {/* Description + resource */}
        <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: video.assignmentUrl ? '1fr 320px' : '1fr', gap: '28px' }}>
          <div>
            <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>About this session</h3>
            <p style={{ fontSize: '15px', color: '#334155', lineHeight: 1.7, margin: 0 }}>{video.description || 'Master the concepts presented in this educational recording. Take notes and revisit as needed.'}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8', fontWeight: '600', marginTop: '14px' }}>
              <Clock size={13} /> {new Date(video.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          {video.assignmentUrl && (
            <div style={{ background: '#fffbeb', borderRadius: '16px', border: '1.5px dashed #fde68a', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={16} color="#d97706" />
                </div>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#92400e' }}>Learning Resource</h4>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#92400e', lineHeight: 1.5, opacity: 0.8 }}>Download the supplementary material to practice what you learned.</p>
              <button onClick={() => onPreview(video.assignmentUrl, `${video.title} — Resource`)}
                style={{ width: '100%', padding: '11px', borderRadius: '12px', background: 'linear-gradient(135deg,#d97706,#f59e0b)', border: 'none', color: 'white', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(245,158,11,0.35)' }}>
                <MonitorPlay size={15} /> Open Worksheet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Empty / No-content state ─────────────────────────────────
function NoContent({ icon: Icon, message }) {
  return (
    <div style={{ padding: '100px 40px', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px dashed #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <div style={{ width: '90px', height: '90px', borderRadius: '28px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-6deg)' }}>
        <Icon size={44} color="#cbd5e1" />
      </div>
      <div>
        <h3 style={{ color: '#1e293b', fontSize: '20px', fontWeight: '900', marginBottom: '8px' }}>Nothing here yet</h3>
        <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '600', margin: 0, maxWidth: '380px' }}>{message}</p>
      </div>
    </div>
  );
}

// ── Search Bar ───────────────────────────────────────────────
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '400px' }}>
      <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || 'Search…'}
        style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: '14px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', background: 'white', color: '#1e293b', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', transition: 'all 0.2s' }}
        onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)'; }} />
      {value && (
        <button onClick={() => onChange('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: '2px', display: 'flex' }}>
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function StudentRecordedClasses() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewCategory, setViewCategory] = useState(null);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [progressionData, setProgressionData] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [previewModal, setPreviewModal] = useState({ isOpen: false, url: '', title: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, progRes] = await Promise.all([
          axios.get('/api/student/recorded-classes'),
          axios.get('/api/student/progression'),
        ]);
        setData(Array.isArray(classesRes.data.data) ? classesRes.data.data : []);
        setProgressionData(Array.isArray(progRes.data.data) ? progRes.data.data : []);
      } catch { toast.error('Failed to load class resources.'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const goHome = () => { setViewCategory(null); setCurrentSubject(null); setCurrentChapter(null); setSearch(''); setActiveVideo(null); };
  const goCategory = () => { setCurrentSubject(null); setCurrentChapter(null); setSearch(''); };
  const goSubject = () => { setCurrentChapter(null); setSearch(''); };

  const openPdf = (url, title) => setPreviewModal({ isOpen: true, url, title });

  // Determine page heading
  const getHeading = () => {
    if (activeVideo) return 'Now Playing';
    if (!viewCategory) return 'Your Learning Hub';
    if (viewCategory === 'progress') return 'Course Progress';
    if (viewCategory === 'video') return 'Recorded Lectures';
    return viewCategory.toUpperCase() + 's';
  };

  const getSubheading = () => {
    if (!viewCategory) return 'Access all your class resources, practice papers, and track progress.';
    if (viewCategory === 'video') return 'Watch premium video lectures by your faculty.';
    if (viewCategory === 'dpp') return 'Daily practice papers to reinforce your learning.';
    if (viewCategory === 'pyq') return 'Previous year questions for exam preparation.';
    if (viewCategory === 'resource') return 'Supplementary study materials and notes.';
    if (viewCategory === 'progress') return 'Track your syllabus coverage and completion rates.';
    return '';
  };

  const catColor = HUB_CATS.find(c => c.id === viewCategory)?.color || '#6366f1';
  const catGrad  = HUB_CATS.find(c => c.id === viewCategory)?.grad  || 'linear-gradient(135deg,#4f46e5,#7c3aed)';

  return (
    <div style={{ paddingBottom: '100px' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .rc-fade { animation: fadeUp 0.4s ease both; }
      `}</style>

      {activeVideo ? (
        <PlayerView video={activeVideo} onBack={() => setActiveVideo(null)} onPreview={openPdf} />
      ) : (
        <>
          {/* ── Hero ── */}
          <div className="rc-fade" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)', borderRadius: '28px', padding: '36px 40px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-80px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: `radial-gradient(circle, ${catColor}28 0%, transparent 70%)`, pointerEvents: 'none', transition: 'background 0.5s' }} />
            <div style={{ position: 'absolute', bottom: '-80px', left: '8%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: `${catColor}20`, border: `1px solid ${catColor}40`, padding: '5px 13px', borderRadius: '99px', marginBottom: '14px' }}>
                  <Sparkles size={12} color={catColor} />
                  <span style={{ fontSize: '11px', fontWeight: '800', color: catColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Learning Hub</span>
                </div>
                <h1 style={{ margin: 0, fontSize: 'clamp(22px,4vw,32px)', fontWeight: '900', color: 'white', letterSpacing: '-0.03em', lineHeight: 1.15 }}>{getHeading()}</h1>
                <p style={{ margin: '8px 0 0', fontSize: '15px', color: 'rgba(148,163,184,0.9)', maxWidth: '560px' }}>{getSubheading()}</p>
              </div>
              {!viewCategory && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[
                    { emoji: '🎬', label: 'Videos', value: data.reduce((sum, s) => sum + (s.chapters?.reduce((a, c) => a + (c.videos?.filter(v => !v.isResource).length || 0), 0) || 0), 0) },
                    { emoji: '📚', label: 'Subjects', value: data.length },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '12px 20px', backdropFilter: 'blur(8px)', textAlign: 'center' }}>
                      <div style={{ fontSize: '22px', fontWeight: '900', color: 'white', lineHeight: 1 }}>{s.emoji} {s.value}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', fontWeight: '700', marginTop: '4px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Toolbar: Breadcrumb + Search ── */}
          <div className="rc-fade" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', animationDelay: '0.06s' }}>
            <Breadcrumbs viewCategory={viewCategory} currentSubject={currentSubject} currentChapter={currentChapter} onHome={goHome} onCategory={goCategory} onSubject={goSubject} />
            {viewCategory && viewCategory !== 'progress' && (
              <SearchBar value={search} onChange={setSearch} placeholder={`Search ${currentChapter ? 'content' : currentSubject ? 'chapters' : 'subjects'}…`} />
            )}
          </div>

          {/* ── Content ── */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '100px 0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid #e8edf5', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#94a3b8', fontWeight: '600', fontSize: '14px', letterSpacing: '0.05em' }}>Loading your knowledge hub…</p>
            </div>
          ) : (
            <div className="rc-fade" style={{ animationDelay: '0.12s' }}>

              {/* Hub grid */}
              {!viewCategory && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                  {HUB_CATS.map(cat => <HubCard key={cat.id} cat={cat} onClick={() => setViewCategory(cat.id)} />)}
                </div>
              )}

              {/* Progress */}
              {viewCategory === 'progress' && (
                progressionData.length === 0
                  ? <NoContent icon={TrendingUp} message="No progression data available yet. Start watching classes to track your progress." />
                  : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                      {progressionData.map(item => <ProgressCard key={item._id} item={item} />)}
                    </div>
              )}

              {/* Subjects */}
              {viewCategory && viewCategory !== 'progress' && !currentSubject && (() => {
                const filtered = data.filter(s => s.title?.toLowerCase().includes(search.toLowerCase()));
                return filtered.length === 0
                  ? <NoContent icon={Book} message={`No subjects found for "${search}". Try a different keyword.`} />
                  : <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {filtered.map((sub, i) => (
                        <NavRow key={sub._id || i} icon={Book} title={sub.title} sub="View content hierarchy" color={catColor} onClick={() => { setCurrentSubject(sub); setSearch(''); }} />
                      ))}
                    </div>;
              })()}

              {/* Chapters */}
              {currentSubject && !currentChapter && (() => {
                const filtered = currentSubject.chapters.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()));
                return filtered.length === 0
                  ? <NoContent icon={Folder} message="No chapters found in this subject." />
                  : <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {filtered.map((chap, i) => (
                        <NavRow key={chap._id || i} icon={Folder} title={chap.title} sub={`${chap.videos?.length || 0} assets available`} color={catColor} onClick={() => { setCurrentChapter(chap); setSearch(''); }} />
                      ))}
                    </div>;
              })()}

              {/* Videos / Resources */}
              {currentChapter && (() => {
                const filtered = currentChapter.videos.filter(v => {
                  const m = v.title?.toLowerCase().includes(search.toLowerCase());
                  if (viewCategory === 'video')    return m && !v.isResource;
                  if (viewCategory === 'dpp')      return m && v.isResource && v.type?.toLowerCase() === 'dpp';
                  if (viewCategory === 'pyq')      return m && v.isResource && v.type?.toLowerCase() === 'pyq';
                  if (viewCategory === 'resource') return m && v.isResource;
                  return m;
                });
                return filtered.length === 0
                  ? <NoContent icon={viewCategory === 'video' ? PlayCircle : FileText} message={`No ${viewCategory} content found here.`} />
                  : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                      {filtered.map((item, i) => (
                        <ContentCard key={item._id || i} item={item} onPlay={setActiveVideo} onPreview={openPdf} />
                      ))}
                    </div>;
              })()}
            </div>
          )}
        </>
      )}

      <PdfPreviewModal isOpen={previewModal.isOpen} onClose={() => setPreviewModal({ ...previewModal, isOpen: false })} url={previewModal.url} title={previewModal.title} />
    </div>
  );
}
