import React, { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';

const VideoPlayer = ({ src, title, description, onClose }) => {
  const [quality, setQuality] = useState('auto');
  const [videoSrc, setVideoSrc] = useState(src);

  const getTransformedUrl = (url, q) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;

    let transform = 'q_auto,f_auto';
    if (q === '1080p') transform = 'w_1920,h_1080,c_limit,q_auto';
    else if (q === '720p') transform = 'w_1280,h_720,c_limit,q_auto';
    else if (q === '480p') transform = 'w_854,h_480,c_limit,q_auto';
    else if (q === '360p') transform = 'w_640,h_360,c_limit,q_auto';
    else if (q === '240p') transform = 'w_426,h_240,c_limit,q_auto';
    else if (q === '144p') transform = 'w_256,h_144,c_limit,q_auto';
    
    return `${parts[0]}/upload/${transform}/${parts[1]}`;
  };

  useEffect(() => {
    setVideoSrc(getTransformedUrl(src, quality));
  }, [src, quality]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000', borderRadius: 'inherit', overflow: 'hidden' }}>
      <video 
        key={videoSrc}
        src={videoSrc} 
        controls 
        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
        autoPlay 
      />
      
      {/* QUALITY SELECTOR OVERLAY */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        right: '20px', 
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '4px', 
          background: 'rgba(0,0,0,0.7)', 
          padding: '6px', 
          borderRadius: '12px', 
          backdropFilter: 'blur(12px)', 
          border: '1px solid rgba(255,255,255,0.1)',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          maxWidth: '240px'
        }}>
          {['auto', '1080p', '720p', '480p', '360p', '240p', '144p'].map(q => (
            <button
              key={q}
              onClick={(e) => { e.stopPropagation(); setQuality(q); }}
              style={{
                background: quality === q ? 'var(--color-primary, #6366f1)' : 'transparent',
                color: 'white',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'uppercase'
              }}
            >
              {q === 'auto' ? 'Auto' : q}
            </button>
          ))}
        </div>
      </div>

      {onClose && (
        <button 
          onClick={onClose}
          style={{ 
            position: 'absolute', 
            top: '20px', 
            left: '20px', 
            zIndex: 20,
            background: 'rgba(255,255,255,0.15)', 
            color: 'white', 
            border: '1px solid rgba(255,255,255,0.2)', 
            padding: '10px', 
            borderRadius: '50%', 
            cursor: 'pointer', 
            backdropFilter: 'blur(8px)' 
          }}
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};

export default VideoPlayer;
