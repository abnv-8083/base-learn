"use client";

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log to an error reporting service in production
    console.error('[App Error Boundary]', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'var(--font-body, Inter, sans-serif)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(239,68,68,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.05) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Glow blobs */}
      <div style={{ position: 'absolute', top: '15%', left: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: '580px' }}>
        {/* Error code with icon */}
        <div style={{ position: 'relative', marginBottom: '32px' }}>
          <div style={{
            fontSize: 'clamp(100px, 18vw, 160px)',
            fontWeight: '900',
            lineHeight: 1,
            background: 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.05em',
            fontFamily: 'var(--font-heading, sans-serif)',
            filter: 'drop-shadow(0 0 60px rgba(239,68,68,0.25))',
          }}>
            500
          </div>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '64px',
            animation: 'shake 0.6s ease-in-out infinite alternate',
          }}>
            💥
          </div>
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: '800',
          color: 'white',
          margin: '0 0 12px',
          letterSpacing: '-0.02em',
          fontFamily: 'var(--font-heading, sans-serif)',
        }}>
          Something Went Wrong
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#94a3b8',
          lineHeight: 1.7,
          margin: '0 0 12px',
          fontWeight: '400',
        }}>
          Our servers hit an unexpected snag. This has been logged and we're on it.
        </p>

        {/* Error message (dev-friendly) */}
        {error?.message && (
          <div style={{
            margin: '0 0 32px',
            padding: '12px 16px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '12px',
            textAlign: 'left',
          }}>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 4px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Error details</p>
            <code style={{ fontSize: '12px', color: '#fca5a5', fontFamily: 'var(--font-mono, monospace)', wordBreak: 'break-word', lineHeight: 1.6 }}>
              {error.message}
            </code>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
          <button
            onClick={reset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '13px 28px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none',
              borderRadius: '14px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 24px rgba(239,68,68,0.35)',
              transition: 'all 0.2s',
            }}
          >
            🔄 Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '13px 28px',
              background: 'rgba(255,255,255,0.06)',
              border: '1.5px solid rgba(255,255,255,0.12)',
              borderRadius: '14px',
              color: '#cbd5e1',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
          >
            🏠 Go Home
          </button>
        </div>

        {/* Status hint */}
        <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', flexShrink: 0, boxShadow: '0 0 0 3px rgba(239,68,68,0.2)', animation: 'pulse 2s ease infinite' }} />
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0, textAlign: 'left', lineHeight: 1.5 }}>
            If the problem persists, contact your platform administrator or try again after a few minutes.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%   { transform: translate(-50%, -55%) rotate(-8deg); }
          100% { transform: translate(-50%, -45%) rotate(8deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
