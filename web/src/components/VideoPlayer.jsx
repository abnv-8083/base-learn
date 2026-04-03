"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, AlertCircle, RefreshCcw, Maximize, Settings } from 'lucide-react';

const VideoPlayer = ({ src, title, description, onClose, poster }) => {
  const [quality, setQuality] = useState('auto');
  const [videoSrc, setVideoSrc] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);
  const prevTimeRef = useRef(0);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setVideoSrc(getTransformedUrl(src, quality));
  }, [src, quality]);

  const getTransformedUrl = (url, q) => {
    if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return url;
    
    // Support both /upload/ and /authenticated/
    const isUpload = url.includes('/upload/');
    const separator = isUpload ? '/upload/' : '/authenticated/';
    const parts = url.split(separator);
    
    if (parts.length !== 2) return url;

    let versionPart = parts[1];
    if (versionPart.includes('/v')) {
        versionPart = 'v' + versionPart.split('/v')[1];
    }

    let transform = 'q_auto,f_auto';
    if (q === '1080p') transform = 'w_1920,h_1080,c_limit,q_auto';
    else if (q === '720p') transform = 'w_1280,h_720,c_limit,q_auto';
    else if (q === '480p') transform = 'w_854,h_480,c_limit,q_auto';
    else if (q === '360p') transform = 'w_640,h_360,c_limit,q_auto';
    else if (q === '240p') transform = 'w_426,h_240,c_limit,q_auto';
    else if (q === '144p') transform = 'w_256,h_144,c_limit,q_auto';
    
    return `${parts[0]}${separator}${transform}/${versionPart}`;
  };

  const handleQualityChange = (newQuality) => {
    if (videoRef.current) {
        prevTimeRef.current = videoRef.current.currentTime;
    }
    setQuality(newQuality);
  };

  const handleLoadedMetadata = () => {
    setLoading(false);
    if (videoRef.current && prevTimeRef.current > 0) {
        videoRef.current.currentTime = prevTimeRef.current;
        videoRef.current.play().catch(() => {});
    }
  };

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  if (!videoSrc) return null;

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%', 
      background: '#000', 
      borderRadius: 'inherit', 
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {loading && !error && (
        <div style={{ position: 'absolute', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)' }}></div>
          <p style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>Preparing video...</p>
        </div>
      )}

      {error ? (
        <div style={{ position: 'absolute', zIndex: 15, textAlign: 'center', padding: '40px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
          <AlertCircle size={56} color="#ef4444" style={{ marginBottom: '20px', margin: '0 auto 20px' }} />
          <h3 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>Playback Error</h3>
          <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '24px', lineHeight: '1.6' }}>We encountered an issue loading this video. This could be due to an expired link, slow network, or restricted access.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={() => window.location.reload()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px 24px', borderRadius: '16px', background: 'var(--color-student)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '15px', transition: 'transform 0.2s' }}>
                <RefreshCcw size={18} /> Refresh Player
            </button>
            <a href={videoSrc} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px 24px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontWeight: '600', cursor: 'pointer', fontSize: '14px', textDecoration: 'none' }}>
                <ExternalLink size={16} /> Open source in browser
            </a>
          </div>
        </div>
      ) : (
        <video 
          ref={videoRef}
          src={videoSrc} 
          poster={poster}
          onLoadedMetadata={handleLoadedMetadata}
          onError={(e) => {
            console.error("Video error on src:", videoSrc, e);
            handleError();
          }}
          onCanPlay={() => setLoading(false)}
          controls 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          autoPlay 
          playsInline
          crossOrigin={src?.includes('cloudinary.com') ? 'anonymous' : undefined}
          controlsList="nodownload"
        />
      )}
      
      {/* HUD Controls */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '20px', 
        right: '20px',
        zIndex: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        pointerEvents: 'none'
      }}>
        {onClose && (
          <button 
            onClick={onClose}
            style={{ 
              pointerEvents: 'auto',
              background: 'rgba(15, 23, 42, 0.6)', 
              color: 'white', 
              border: '1px solid rgba(255,255,255,0.1)', 
              padding: '10px', 
              borderRadius: '50%', 
              cursor: 'pointer', 
              backdropFilter: 'blur(12px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px'
            }}
            onMouseOver={e => {
                e.currentTarget.style.background = '#ef4444';
                e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
                e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={20} />
          </button>
        )}

        <div style={{ 
          pointerEvents: 'auto',
          display: 'flex', 
          gap: '6px', 
          background: 'rgba(15, 23, 42, 0.6)', 
          padding: '6px', 
          borderRadius: '16px', 
          backdropFilter: 'blur(12px)', 
          border: '1px solid rgba(255,255,255,0.1)',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          maxWidth: '300px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        }}>
          {['auto', '1080p', '720p', '480p', '360p', '240p'].map(q => (
            <button
              key={q}
              onClick={(e) => { e.stopPropagation(); handleQualityChange(q); }}
              style={{
                background: quality === q ? 'var(--color-primary)' : 'transparent',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {q === 'auto' ? 'Auto' : q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

