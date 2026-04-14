"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import {
  Video, BookOpen, Target, Award, ChevronRight, Send,
  Star, Clock, Users, Zap, CheckCircle, ArrowRight, Sparkles
} from 'lucide-react';

const FEATURES = [
  { icon: Video,    color: '#6366f1', bg: '#eef2ff', title: 'Live Interactive Classes',    desc: 'Real-time sessions with top educators. Raise your hand, ask questions, and learn alongside classmates.' },
  { icon: BookOpen, color: '#00C2FF', bg: '#e0f9ff', title: 'Recorded Lecture Library',   desc: 'Re-watch any class at any time. Never miss a concept — your personal learning archive is always ready.' },
  { icon: Target,   color: '#10b981', bg: '#ecfdf5', title: 'Smart Assignments & Tests',  desc: 'Faculty-assigned work with real deadlines, instant feedback, and detailed progress tracking.' },
  { icon: Award,    color: '#f59e0b', bg: '#fffbeb', title: 'Performance Dashboards',     desc: 'Beautiful analytics that map your mastery across subjects — spot weak areas before the exam.' },
  { icon: Zap,      color: '#8b5cf6', bg: '#f5f3ff', title: 'Batch Learning System',      desc: 'Curated peer groups guided by dedicated instructors to keep you accountable and motivated.' },
  { icon: Clock,    color: '#ef4444', bg: '#fef2f2', title: 'Flexible Schedule',          desc: 'Attend live or catch the replay. Learning adapts to your timetable — not the other way around.' },
];

const STATS = [
  { value: '500+', label: 'Active Students' },
  { value: '50+',  label: 'Expert Faculty'  },
  { value: '98%',  label: 'Success Rate'    },
  { value: '3',    label: 'Grades Covered'  },
];

export default function Landing() {
  const { user } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', grade: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleEnquiry = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.grade) return toast.error('Please fill all required fields');
    setSubmitting(true);
    try {
      await axios.post('/api/student/public-enquiry', form);
      setSubmitted(true);
      toast.success('Enquiry submitted! We\'ll contact you shortly.');
    } catch {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8faff', width: '100%', overflowX: 'hidden' }}>

      {/* ── Navbar ────────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(20px, 5vw, 60px)', height: '80px',
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(226,232,248,0.8)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 2px 20px rgba(15,45,107,0.07)' : 'none',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img src="/logo-wide.png" alt="Base Learn Logo" style={{ height: '52px', display: 'block' }} />
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {!user ? (
            <>
              <Link href="#enquiry" className="hide-mobile" style={{ padding: '9px 14px', borderRadius: '9px', fontSize: '13px', fontWeight: '600', color: scrolled ? '#4A5680' : 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>
                Enquire
              </Link>
              <Link href="/login" style={{ padding: '8px 16px', borderRadius: '9px', fontSize: '13px', fontWeight: '700', color: scrolled ? 'white' : '#0D1B3E', background: scrolled ? '#0F2D6B' : '#00C2FF', textDecoration: 'none', boxShadow: '0 3px 12px rgba(0,194,255,0.3)' }}>
                Login
              </Link>
            </>
          ) : (
            <Link href={`/${user.role}/dashboard`} style={{ padding: '10px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: '700', color: 'white', background: 'linear-gradient(135deg, #0F2D6B, #00C2FF)', textDecoration: 'none' }}>
              Dashboard →
            </Link>
          )}
        </nav>
      </header>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #091E4A 0%, #0F2D6B 50%, #1A3F8F 100%)',
        position: 'relative', overflow: 'hidden', padding: '100px 20px 60px',
      }}>
        {/* Blobs */}
        {[
          { w:700, h:700, top:'-200px', left:'-200px', color:'rgba(0,194,255,0.12)' },
          { w:500, h:500, bottom:'-150px', right:'-100px', color:'rgba(99,102,241,0.15)' },
          { w:300, h:300, top:'40%', right:'20%', color:'rgba(0,194,255,0.08)' },
        ].map((b,i) => (
          <div key={i} style={{ position:'absolute', borderRadius:'50%', background:`radial-gradient(circle, ${b.color} 0%, transparent 70%)`, width:b.w, height:b.h, top:b.top, bottom:b.bottom, left:b.left, right:b.right, pointerEvents:'none' }} />
        ))}

        {/* Grid pattern overlay */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'32px 32px', pointerEvents:'none' }} />

        <div style={{ maxWidth:'900px', textAlign:'center', position:'relative', zIndex:10 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'8px 18px', borderRadius:'99px', background:'rgba(0,194,255,0.1)', border:'1px solid rgba(0,194,255,0.25)', marginBottom:'32px' }}>
            <Sparkles size={14} color="#00C2FF" />
            <span style={{ fontSize:'13px', fontWeight:'600', color:'#00C2FF', letterSpacing:'0.04em' }}>Grades 8, 9 & 10 · Premium LMS</span>
          </div>

          <h1 style={{ fontSize:'clamp(2.5rem, 6vw, 4.5rem)', fontWeight:'900', lineHeight:1.08, color:'white', letterSpacing:'-0.04em', marginBottom:'24px', fontFamily:'var(--font-heading)' }}>
            Master Your Foundation.<br />
            <span style={{ color:'#00C2FF', display:'block' }}>Excel in High School.</span>
          </h1>

          <p style={{ fontSize:'clamp(1rem, 2vw, 1.2rem)', color:'rgba(255,255,255,0.72)', lineHeight:1.7, maxWidth:'640px', margin:'0 auto 48px' }}>
            The ultimate learning platform built exclusively for 8th, 9th, and 10th graders — live classes, recorded sessions, smart assignments, and real progress tracking.
          </p>

          <div style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap' }}>
            <a href="#enquiry" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'15px 36px', borderRadius:'12px', background:'linear-gradient(135deg, #00C2FF, #3B82F6)', color:'#0D1B3E', fontWeight:'800', fontSize:'16px', textDecoration:'none', boxShadow:'0 8px 28px rgba(0,194,255,0.4)', transition:'all 0.2s' }}>
              Apply for Admission <ArrowRight size={18} />
            </a>
            <Link href="/login" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'15px 36px', borderRadius:'12px', border:'1.5px solid rgba(255,255,255,0.25)', color:'white', fontWeight:'600', fontSize:'16px', textDecoration:'none', background:'rgba(255,255,255,0.06)', backdropFilter:'blur(8px)', transition:'all 0.2s' }}>
              Student Login
            </Link>
          </div>

          {/* Stats bar */}
          <div className="grid-4-col" style={{ marginTop: '64px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', backdropFilter: 'blur(8px)', gap: 0 }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ padding: '20px 24px', textAlign: 'center', borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#00C2FF', fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginTop: '4px', fontWeight: '500' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section style={{ padding:'96px clamp(20px,5vw,80px)', background:'#f8faff' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'64px' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'6px 16px', borderRadius:'99px', background:'#eef2ff', border:'1px solid #c7d2fc', marginBottom:'16px' }}>
              <Star size={13} color='#6366f1' />
              <span style={{ fontSize:'12px', fontWeight:'700', color:'#4f46e5', letterSpacing:'0.06em' }}>EVERYTHING YOU NEED</span>
            </div>
            <h2 style={{ fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:'800', letterSpacing:'-0.03em', color:'#0D1B3E', marginBottom:'14px', fontFamily:'var(--font-heading)' }}>
              Built for how students actually learn
            </h2>
            <p style={{ fontSize:'17px', color:'#4A5680', maxWidth:'500px', margin:'0 auto', lineHeight:1.6 }}>
              Every feature is designed around the Grade 8-10 curriculum to help you score higher.
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:'24px' }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} style={{ background:'white', borderRadius:'20px', padding:'32px', border:'1px solid #E2E8F8', transition:'all 0.3s', cursor:'default', boxShadow:'0 2px 12px rgba(15,45,107,0.04)' }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(15,45,107,0.1)'; e.currentTarget.style.borderColor='#c7d2ec'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 12px rgba(15,45,107,0.04)'; e.currentTarget.style.borderColor='#E2E8F8'; }}
                >
                  <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:f.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'20px' }}>
                    <Icon size={24} color={f.color} />
                  </div>
                  <h3 style={{ fontSize:'17px', fontWeight:'700', color:'#0D1B3E', marginBottom:'10px', letterSpacing:'-0.01em' }}>{f.title}</h3>
                  <p style={{ fontSize:'14px', color:'#4A5680', lineHeight:1.65, margin:0 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────── */}
      <section style={{ padding: '80px clamp(20px,5vw,80px)', background: 'linear-gradient(135deg, #0F2D6B, #1A3F8F)' }}>
        <div className="grid-2-col" style={{ maxWidth: '1100px', margin: '0 auto', alignItems: 'center' }}>
          <div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'6px 14px', borderRadius:'99px', background:'rgba(0,194,255,0.12)', border:'1px solid rgba(0,194,255,0.25)', marginBottom:'20px' }}>
              <CheckCircle size={13} color='#00C2FF' />
              <span style={{ fontSize:'12px', fontWeight:'700', color:'#00C2FF', letterSpacing:'0.06em' }}>WHY BASE LEARN</span>
            </div>
            <h2 style={{ fontSize:'clamp(1.8rem,3.5vw,2.5rem)', fontWeight:'800', color:'white', letterSpacing:'-0.03em', lineHeight:1.15, marginBottom:'20px', fontFamily:'var(--font-heading)' }}>
              The smarter way to prepare for Board Exams
            </h2>
            <p style={{ fontSize:'16px', color:'rgba(255,255,255,0.7)', lineHeight:1.7, marginBottom:'32px' }}>
              We don't just teach — we build understanding. Our structured batch system, regular assessments, and live feedback loop ensures no student gets left behind.
            </p>
            {['Personalised batch assignments', 'Live doubt-clearing sessions', 'Faculty-verified course content', 'Admin-monitored progress'].map((item, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'14px' }}>
                <div style={{ width:'22px', height:'22px', borderRadius:'50%', background:'rgba(0,194,255,0.2)', border:'1px solid rgba(0,194,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <CheckCircle size={13} color='#00C2FF' />
                </div>
                <span style={{ fontSize:'15px', color:'rgba(255,255,255,0.85)', fontWeight:'500' }}>{item}</span>
              </div>
            ))}
          </div>

          <div className="grid-2-col">
            {[
              { value:'8th', caption:'Foundation', color:'#00C2FF' },
              { value:'9th', caption:'Intermediate', color:'#6366f1' },
              { value:'10th', caption:'Board Prep', color:'#10b981' },
              { value:'24/7', caption:'Support', color:'#f59e0b' },
            ].map((item, i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'16px', padding:'28px 20px', textAlign:'center', backdropFilter:'blur(8px)' }}>
                <div style={{ fontSize:'32px', fontWeight:'900', color:item.color, fontFamily:'var(--font-heading)', letterSpacing:'-0.03em' }}>{item.value}</div>
                <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', marginTop:'6px', fontWeight:'500' }}>{item.caption}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Enquiry Form ──────────────────────────────────── */}
      <section id="enquiry" style={{ padding:'96px clamp(20px,5vw,80px)', background:'#f8faff' }}>
        <div style={{ maxWidth:'720px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'48px' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'6px 16px', borderRadius:'99px', background:'#ecfdf5', border:'1px solid #a7f3d0', marginBottom:'16px' }}>
              <Send size={13} color='#10b981' />
              <span style={{ fontSize:'12px', fontWeight:'700', color:'#065f46', letterSpacing:'0.06em' }}>ADMISSIONS OPEN</span>
            </div>
            <h2 style={{ fontSize:'clamp(1.8rem,4vw,2.6rem)', fontWeight:'800', letterSpacing:'-0.03em', color:'#0D1B3E', marginBottom:'14px', fontFamily:'var(--font-heading)' }}>
              Ready to join Base Learn?
            </h2>
            <p style={{ fontSize:'16px', color:'#4A5680', lineHeight:1.6 }}>
              Fill out the form below and our admissions team will contact you within 24 hours.
            </p>
          </div>

          <div style={{ background:'white', borderRadius:'24px', padding:'clamp(24px,5vw,48px)', boxShadow:'0 8px 40px rgba(15,45,107,0.08)', border:'1px solid #E2E8F8' }}>
            {submitted ? (
              <div style={{ textAlign:'center', padding:'32px 0' }}>
                <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'#ecfdf5', border:'2px solid #86efac', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                  <CheckCircle size={36} color='#22c55e' />
                </div>
                <h3 style={{ fontSize:'22px', fontWeight:'800', color:'#0D1B3E', marginBottom:'10px' }}>Enquiry Submitted!</h3>
                <p style={{ color:'#4A5680', fontSize:'15px', lineHeight:1.6, maxWidth:'380px', margin:'0 auto 24px' }}>
                  Thank you! Our admissions counselor will reach you at the provided contact details within 24 hours.
                </p>
                <button onClick={() => setSubmitted(false)} style={{ padding:'10px 24px', borderRadius:'10px', background:'#0F2D6B', color:'white', border:'none', fontWeight:'600', fontSize:'14px', cursor:'pointer' }}>
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnquiry}>
                <div className="grid-2-col" style={{ marginBottom: '16px' }}>
                  {[
                    { label:'Parent / Guardian Name *', key:'name', type:'text', placeholder:'Full name' },
                    { label:'Phone Number *', key:'phone', type:'tel', placeholder:'+91 98765 43210' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display:'block', fontSize:'13px', fontWeight:'700', color:'#0D1B3E', marginBottom:'8px' }}>{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder} required value={form[f.key]} onChange={e => setForm(p => ({...p, [f.key]:e.target.value}))}
                        style={{ width:'100%', padding:'13px 15px', borderRadius:'11px', border:'1.5px solid #E2E8F8', fontSize:'14px', background:'#f8faff', outline:'none', fontFamily:'var(--font-body)', transition:'border-color 0.2s' }}
                        onFocus={e => e.target.style.borderColor='#0F2D6B'}
                        onBlur={e => e.target.style.borderColor='#E2E8F8'}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid-2-col" style={{ marginBottom: '16px' }}>
                  <div>
                    <label style={{ display:'block', fontSize:'13px', fontWeight:'700', color:'#0D1B3E', marginBottom:'8px' }}>Email Address</label>
                    <input type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm(p => ({...p, email:e.target.value}))}
                      style={{ width:'100%', padding:'13px 15px', borderRadius:'11px', border:'1.5px solid #E2E8F8', fontSize:'14px', background:'#f8faff', outline:'none', fontFamily:'var(--font-body)', transition:'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor='#0F2D6B'}
                      onBlur={e => e.target.style.borderColor='#E2E8F8'}
                    />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:'13px', fontWeight:'700', color:'#0D1B3E', marginBottom:'8px' }}>Student's Grade *</label>
                    <select required value={form.grade} onChange={e => setForm(p => ({...p, grade:e.target.value}))}
                      style={{ width:'100%', padding:'13px 15px', borderRadius:'11px', border:'1.5px solid #E2E8F8', fontSize:'14px', background:'#f8faff', outline:'none', fontFamily:'var(--font-body)', appearance:'none', cursor:'pointer', transition:'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor='#0F2D6B'}
                      onBlur={e => e.target.style.borderColor='#E2E8F8'}
                    >
                      <option value="">Select grade</option>
                      <option value="Grade 8">Grade 8</option>
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom:'24px' }}>
                  <label style={{ display:'block', fontSize:'13px', fontWeight:'700', color:'#0D1B3E', marginBottom:'8px' }}>Additional Message</label>
                  <textarea placeholder="Any specific subjects, concerns, or questions?" rows={4} value={form.message} onChange={e => setForm(p => ({...p, message:e.target.value}))}
                    style={{ width:'100%', padding:'13px 15px', borderRadius:'11px', border:'1.5px solid #E2E8F8', fontSize:'14px', background:'#f8faff', outline:'none', fontFamily:'var(--font-body)', resize:'vertical', transition:'border-color 0.2s', lineHeight:1.6 }}
                    onFocus={e => e.target.style.borderColor='#0F2D6B'}
                    onBlur={e => e.target.style.borderColor='#E2E8F8'}
                  />
                </div>

                <button type="submit" disabled={submitting} style={{ width:'100%', padding:'15px', borderRadius:'12px', background:'linear-gradient(135deg, #0F2D6B, #1A3F8F)', color:'white', border:'none', fontWeight:'700', fontSize:'16px', cursor:submitting ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:'0 6px 24px rgba(15,45,107,0.3)', transition:'all 0.2s', opacity:submitting ? 0.7 : 1 }}>
                  {submitting ? 'Submitting...' : <><Send size={17} /> Submit Enquiry</>}
                </button>

                <p style={{ textAlign:'center', fontSize:'12px', color:'#8492B4', marginTop:'14px' }}>
                  🔒 Your information is 100% private and will only be used for admissions.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer style={{ background:'#0B1D4A', color:'white', padding:'56px clamp(20px,5vw,80px) 32px' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:'48px', marginBottom:'48px' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                <img src="/logo-wide.png" alt="Base Learn" style={{ height: '30px' }} />
              </div>
              <p style={{ color:'rgba(168,186,220,0.7)', fontSize:'14px', lineHeight:1.7, maxWidth:'280px', margin:'0 0 20px' }}>
                Transforming the Grade 8-10 learning experience with structured, expert-led education.
              </p>
              <div style={{ display:'flex', gap:'10px' }}>
                {['📘','📸','💬'].map((icon, i) => (
                  <div key={i} style={{ width:'36px', height:'36px', borderRadius:'9px', background:'rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', cursor:'pointer' }}>
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontWeight:'700', fontSize:'13px', letterSpacing:'0.08em', color:'rgba(168,186,220,0.5)', marginBottom:'16px', textTransform:'uppercase' }}>Quick Links</div>
              {[['Home','#'], ['About','#'], ['Admissions','#enquiry'], ['Student Login','/login'], ['Staff Login','/staff-login']].map(([label, href]) => (
                <div key={label} style={{ marginBottom:'10px' }}>
                  <Link href={href} style={{ fontSize:'14px', color:'rgba(168,186,220,0.75)', textDecoration:'none', transition:'color 0.2s' }}>{label}</Link>
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontWeight:'700', fontSize:'13px', letterSpacing:'0.08em', color:'rgba(168,186,220,0.5)', marginBottom:'16px', textTransform:'uppercase' }}>Portals</div>
              {[['Admin Login','/staff-login?role=admin'], ['Faculty Login','/staff-login?role=faculty'], ['Instructor Login','/staff-login?role=instructor']].map(([label, href]) => (
                <div key={label} style={{ marginBottom:'10px' }}>
                  <Link href={href} style={{ fontSize:'14px', color:'rgba(168,186,220,0.75)', textDecoration:'none' }}>{label}</Link>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px' }}>
            <p style={{ fontSize:'13px', color:'rgba(168,186,220,0.45)', margin:0 }}>
              © {new Date().getFullYear()} Base Learn Education. All rights reserved.
            </p>
            <p style={{ fontSize:'13px', color:'rgba(168,186,220,0.35)', margin:0 }}>
              Designed for educational excellence.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
          .grid-4-col > div { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.08); }
          .grid-4-col > div:last-child { border-bottom: none !important; }
        }
      `}</style>
    </div>
  );
}
