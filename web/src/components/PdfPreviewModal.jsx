"use client";

import React from 'react';
import { X, ExternalLink, Download, FileText } from 'lucide-react';

export default function PdfPreviewModal({ isOpen, onClose, url, title }) {
  if (!isOpen || !url) return null;

  const formatPreviewUrl = (url) => {
    if (!url) return '';
    const isExternal = url.includes('cloudinary.com') || url.includes('e2enetworks.net') || url.includes('objectstore');
    const baseUrl = (typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '') : '');
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');

    if (isExternal) {
        return `${cleanBaseUrl}/api/media/stream?url=${encodeURIComponent(url)}`;
    }

    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    
    // Fallback to backend API URL for relative paths
    if (url.startsWith('/')) return `${cleanBaseUrl}${url}`;
    return `${cleanBaseUrl}/uploads/${url}`;
  };

  const previewUrl = formatPreviewUrl(url);
  
  // Use Google Docs Viewer for reliable cross-browser PDF rendering
  const getPreviewUrl = (url) => {
    return formatPreviewUrl(url);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(12px)' }}>
      <div className="fade-in" style={{ width: '96vw', maxWidth: '1200px', height: '92vh', background: 'white', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        {/* Modal Header */}
        <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <FileText size={20} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{title || 'Document Preview'}</h2>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Academic Material Viewer</p>
              </div>
           </div>
           <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => window.open(previewUrl, '_blank')}
                style={{ padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#475569' }}
              >
                <ExternalLink size={16} /> Open Full
              </button>
              <a 
                href={previewUrl}
                download
                style={{ padding: '8px 16px', background: 'var(--color-primary)', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'white', textDecoration: 'none' }}
              >
                <Download size={16} /> Download
              </a>
              <button onClick={onClose} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
           </div>
        </div>
        
        {/* Main Content Area */}
        <div style={{ flex: 1, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', overflow: 'hidden' }}>
           <div style={{ width: '100%', height: '100%', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <iframe 
                src={getPreviewUrl(previewUrl)} 
                style={{ width: '100%', height: '100%', border: 'none' }} 
                title={title || "Document Preview"}
              />
           </div>
        </div>

        {/* Footer Fallback */}
        <div style={{ padding: '16px', textAlign: 'center', background: '#f8fafc', borderTop: '1px solid var(--color-border)', fontSize: '12px', color: '#94a3b8' }}>
           If the document doesn't load correctly, please use the <strong>Open Full</strong> button in the header.
        </div>
      </div>
      <style jsx>{`
        .fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
