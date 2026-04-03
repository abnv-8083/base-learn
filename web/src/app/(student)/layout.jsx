"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { LayoutDashboard, BookOpen, Video, ClipboardList, PenTool, CalendarDays, Radio, User, HelpCircle, X, Send } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function StudentLayout({ children }) {
  const router = useRouter();
  const { user, loadUser, loading } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [enquiryMsg, setEnquiryMsg] = useState('');
  const [sendingEnquiry, setSendingEnquiry] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadUser('student');
      setIsReady(true);
    };
    init();
  }, [loadUser]);

  useEffect(() => {
    if (isReady && !loading && (!user || user.role !== 'student')) {
      router.push('/login');
    }
  }, [isReady, loading, user, router]);

  if (!isReady || loading) {
    return <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '30vh' }} />;
  }

  if (!user || user.role !== 'student') return null;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
    { icon: BookOpen, label: 'My Class', path: '/student/recorded-classes' },
    { icon: Radio, label: 'Live Classes', path: '/student/live-classes' },
    { icon: CalendarDays, label: 'Calendar', path: '/student/calendar' },
    { icon: ClipboardList, label: 'Assignments', path: '/student/assignments' },
    { icon: PenTool, label: 'Tests & Exams', path: '/student/tests' },
    { icon: User, label: 'My Profile', path: '/student/profile' },
  ];

  const handleSendEnquiry = async () => {
    if (!enquiryMsg.trim()) return toast.error('Please enter a message');
    setSendingEnquiry(true);
    try {
      await axios.post('/api/student/enquiry', { message: enquiryMsg });
      toast.success('Enquiry sent successfully to our team!');
      setShowEnquiry(false);
      setEnquiryMsg('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send enquiry. Please try again.');
    } finally {
      setSendingEnquiry(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar role="student" menuItems={menuItems} />
      <div className="main-content">
        <Topbar />
        <div className="page-body" style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </div>
      </div>

      {/* Floating Enquiry Button */}
      <button
        onClick={() => setShowEnquiry(v => !v)}
        style={{
          position: 'fixed', bottom: '28px', right: '28px',
          width: '56px', height: '56px', borderRadius: '16px',
          background: 'linear-gradient(135deg, #6366f1, #0F2D6B)',
          color: 'white', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 28px rgba(99,102,241,0.45)',
          zIndex: 1000, transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          transform: showEnquiry ? 'rotate(45deg) scale(0.9)' : 'rotate(0) scale(1)',
        }}
        title="Send an Enquiry"
      >
        {showEnquiry ? <X size={22} /> : <HelpCircle size={22} />}
      </button>

      {/* Enquiry Panel */}
      {showEnquiry && (
        <div style={{
          position: 'fixed', bottom: '96px', right: '28px', width: '360px',
          background: 'var(--color-surface)',
          borderRadius: '20px',
          boxShadow: '0 24px 64px rgba(15,45,107,0.18), 0 0 0 1px rgba(15,45,107,0.06)',
          zIndex: 999, overflow: 'hidden',
          animation: 'enquirySlideIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #0F2D6B)',
            padding: '20px 22px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HelpCircle size={18} color="white" />
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>Ask Us Anything</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px' }}>We'll respond within 24 hours</div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '20px 22px 22px' }}>
            <textarea
              value={enquiryMsg}
              onChange={(e) => setEnquiryMsg(e.target.value)}
              placeholder="Type your question about curriculum, fees, schedule..."
              style={{
                width: '100%', minHeight: '110px', resize: 'none',
                padding: '12px 14px', fontSize: '13px', lineHeight: '1.6',
                background: 'var(--color-bg)', border: '1.5px solid var(--color-border)',
                borderRadius: '12px', outline: 'none', color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-body)', marginBottom: '14px', display: 'block',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
            />
            <button
              onClick={handleSendEnquiry}
              disabled={sendingEnquiry || !enquiryMsg.trim()}
              style={{
                width: '100%', padding: '12px',
                background: enquiryMsg.trim() ? 'linear-gradient(135deg, #6366f1, #0F2D6B)' : 'var(--color-bg)',
                color: enquiryMsg.trim() ? 'white' : 'var(--color-text-muted)',
                border: `1.5px solid ${enquiryMsg.trim() ? 'transparent' : 'var(--color-border)'}`,
                borderRadius: '12px', fontWeight: '600', fontSize: '14px',
                cursor: sendingEnquiry || !enquiryMsg.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s', boxShadow: enquiryMsg.trim() ? '0 4px 14px rgba(99,102,241,0.35)' : 'none',
              }}
            >
              {sendingEnquiry
                ? <><Send size={15} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</>
                : <><Send size={15} /> Send Message</>}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes enquirySlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}