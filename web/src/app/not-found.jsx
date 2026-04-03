"use client";

import Link from 'next/link';
import { useEffect } from 'react';

export default function NotFoundPage() {
  useEffect(() => {
    document.title = '404 — Page Not Found | Base Learn';
  }, []);

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
        backgroundImage: 'linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Glow blobs */}
      <div style={{ position: 'absolute', top: '20%', left: '10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: '560px' }}>
        {/* Error code */}
        <div style={{ position: 'relative', marginBottom: '32px' }}>
          <div style={{
            fontSize: 'clamp(120px, 20vw, 180px)',
            fontWeight: '900',
            lineHeight: 1,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #6366f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.05em',
            fontFamily: 'var(--font-heading, sans-serif)',
            filter: 'drop-shadow(0 0 60px rgba(99,102,241,0.3))',
          }}>
            404
          </div>
          {/* Ghost emoji floating */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '64px',
            animation: 'float 3s ease-in-out infinite',
            filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))',
          }}>
            👻
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
          Page Not Found
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#94a3b8',
          lineHeight: 1.7,
          margin: '0 0 40px',
          fontWeight: '400',
        }}>
          Looks like you wandered off the map. The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '13px 28px',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            borderRadius: '14px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '700',
            textDecoration: 'none',
            boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
          }}>
            🏠 Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
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
            ← Go Back
          </button>
        </div>

        {/* Helpful links */}
        <div style={{ marginTop: '48px', padding: '20px 24px', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Quick Links
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { href: '/login', label: 'Student Portal' },
              { href: '/staff-login', label: 'Staff Portal' },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{
                padding: '6px 14px',
                background: 'rgba(99,102,241,0.12)',
                borderRadius: '8px',
                color: '#a5b4fc',
                fontSize: '13px',
                fontWeight: '600',
                textDecoration: 'none',
                border: '1px solid rgba(99,102,241,0.2)',
              }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(-50%, -52%) rotate(-5deg); }
          50%       { transform: translate(-50%, -42%) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
