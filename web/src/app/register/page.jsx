"use client";

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { CheckCircle2, Send, ArrowRight, User, School, Calendar, Phone, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    studentClass: '',
    school: '',
    dob: '',
    district: '',
    email: '',
    phone: '',
    parentName: '',
    parentPhone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/auth/admission-enquiry', formData);
      setSubmitted(true);
      toast.success('Enquiry submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', minHeight: '100vh' }}>
        <div className="native-form-wrapper" style={{ textAlign: 'center', padding: '60px 40px', background: 'white', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}>
          <div style={{ width: '80px', height: '80px', background: '#f0fdf4', color: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle2 size={48} />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '12px' }}>Request Received!</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
            Thank you for your interest in Base Learn. Our admissions team has received your enquiry and will contact you shortly via phone or email.
          </p>
          <Link href="/" className="btn-submit" style={{ display: 'inline-flex', alignItems: 'center', justifyItems: 'center', gap: '8px', textDecoration: 'none', width: 'auto', padding: '14px 32px' }}>
            Back to Home <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <style>{`
        .auth-container { min-height: 100vh; display: flex; }
        .auth-left { flex: 1; display: none; background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%); position: relative; overflow: hidden; padding: 40px; color: white; flex-direction: column; justify-content: space-between; }
        @media (min-width: 1024px) { .auth-left { display: flex; } }
        .auth-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; z-index: 10; }
        .auth-logo-icon { width: 44px; height: 44px; background: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); }
        .auth-logo-text { font-size: 24px; font-weight: 800; color: white; }
        .auth-logo-text span { color: #60a5fa; }
        
        .auth-hero-content { max-width: 500px; position: relative; z-index: 10; }
        .auth-hero-title { font-size: 3.5rem; font-weight: 800; line-height: 1.1; margin-bottom: 24px; }
        .auth-hero-subtitle { font-size: 1.125rem; color: rgba(255, 255, 255, 0.85); line-height: 1.6; }
        
        .auth-right { flex: 1.2; display: flex; align-items: center; justify-content: center; background: #f8fafc; padding: 40px 20px; overflow-y: auto; }
        .native-form-wrapper { width: 100%; max-width: 600px; background: white; padding: 48px; border-radius: 24px; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; }
        
        .auth-form-header { margin-bottom: 32px; }
        .auth-form-title { font-size: 32px; font-weight: 800; color: #1e293b; margin-bottom: 8px; letter-spacing: -0.02em; }
        .auth-form-subtitle { color: #64748b; font-size: 16px; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
        
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 8px; }
        .input-wrapper { position: relative; }
        .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
        .form-input { width: 100%; padding: 12px 12px 12px 42px; border-radius: 12px; border: 1px solid #cbd5e1; background: #fcfdfe; font-size: 15px; transition: all 0.2s; color: #1e293b; }
        .form-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); background: white; }
        
        .form-select { padding-left: 42px; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; background-size: 18px; }

        .btn-submit { width: 100%; padding: 16px; border-radius: 12px; background: #4f46e5; color: white; border: none; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 12px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); }
        .btn-submit:hover { background: #4338ca; transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3); }
        .btn-submit:active { transform: translateY(0); }
        .btn-submit:disabled { background: #94a3b8; cursor: not-allowed; transform: none; }
        
        .auth-error { background: #fef2f2; color: #b91c1c; padding: 14px; border-radius: 12px; font-size: 14px; font-weight: 500; margin-bottom: 24px; border: 1px solid #fee2e2; display: flex; align-items: center; gap: 10px; }
        
        .auth-footer { margin-top: 32px; text-align: center; color: #64748b; font-size: 15px; border-top: 1px solid #f1f5f9; pt: 24px; padding-top: 24px; }
        .auth-footer a { color: #4f46e5; font-weight: 700; text-decoration: none; }
        .auth-footer a:hover { text-decoration: underline; }

        .section-tag { display: inline-block; padding: 4px 12px; background: #e0e7ff; color: #4338ca; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
      `}</style>
      
      <div className="auth-left">
        <Link href="/" className="auth-logo">
          <div className="auth-logo-icon">🚀</div>
          <span className="auth-logo-text">Base<span>Learn</span></span>
        </Link>
        
        <div className="auth-hero-content">
          <h1 className="auth-hero-title">Unlock your potential.</h1>
          <p className="auth-hero-subtitle">Experience premium education with interactive live classes, expert mentorship, and a community of high achievers.</p>
        </div>
        
        <div style={{ zIndex: 10 }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
             &copy; {new Date().getFullYear()} Base Learn. All rights reserved.
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="native-form-wrapper">
          <div className="auth-form-header">
            <span className="section-tag">Admissions 2026-27</span>
            <h2 className="auth-form-title">Request Admission</h2>
            <p className="auth-form-subtitle">Fill in the details below to express your interest. Our counselors will reach out to guide you through the process.</p>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name of Student *</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input type="text" name="name" className="form-input" placeholder="Enter student's full name" value={formData.name} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Applying for Class *</label>
                <div className="input-wrapper">
                  <School className="input-icon" size={18} />
                  <select name="studentClass" className="form-input form-select" value={formData.studentClass} onChange={handleChange} required>
                    <option value="" disabled>Select Class</option>
                    {[8, 9, 10, 11, 12].map(c => <option key={c} value={`Class ${c}`}>{`Class ${c}`}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Current School *</label>
                <div className="input-wrapper">
                  <School className="input-icon" size={18} />
                  <input type="text" name="school" className="form-input" placeholder="School Name" value={formData.school} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Date of Birth *</label>
                <div className="input-wrapper">
                  <Calendar className="input-icon" size={18} />
                  <input type="date" name="dob" className="form-input" value={formData.dob} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">District *</label>
                <div className="input-wrapper">
                  <MapPin className="input-icon" size={18} />
                  <select name="district" className="form-input form-select" value={formData.district} onChange={handleChange} required>
                    <option value="" disabled>Select District</option>
                    {["Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ margin: '24px 0 16px', height: '1px', background: '#f1f5f9' }}></div>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '16px' }}>Contact Information</p>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input type="email" name="email" className="form-input" placeholder="Email for updates" value={formData.email} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp Number *</label>
                <div className="input-wrapper">
                  <Phone className="input-icon" size={18} />
                  <input type="tel" name="phone" className="form-input" placeholder="10 digit number" value={formData.phone} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Parent/Guardian Name</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input type="text" name="parentName" className="form-input" placeholder="Name" value={formData.parentName} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Parent Phone Number</label>
                <div className="input-wrapper">
                  <Phone className="input-icon" size={18} />
                  <input type="tel" name="parentPhone" className="form-input" placeholder="Number" value={formData.parentPhone} onChange={handleChange} />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? <RefreshCw className="spin" size={18} /> : <Send size={18} />}
              {loading ? 'Submitting...' : 'Send Enquiry'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link href="/login">Sign in to Student Desktop</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple RefreshCw component since we didn't import it
const RefreshCw = ({ className, size }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2v6h-6"></path>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
    <path d="M3 22v-6h6"></path>
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
  </svg>
);

const AlertCircle = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);
