"use client";

// global-error.jsx must include its own <html> and <body> tags
// because it replaces the root layout when an error occurs here.
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Grid overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(239,68,68,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />

          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: '540px' }}>
            {/* Explosion icon */}
            <div style={{ fontSize: '80px', marginBottom: '24px', filter: 'drop-shadow(0 8px 32px rgba(239,68,68,0.3))', animation: 'bounce 1s ease-in-out infinite alternate' }}>
              🚨
            </div>

            <h1 style={{
              fontSize: '32px',
              fontWeight: '900',
              color: 'white',
              margin: '0 0 8px',
              letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #ef4444, #fca5a5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Critical Error
            </h1>
            <p style={{
              fontSize: '15px',
              color: '#94a3b8',
              lineHeight: 1.7,
              margin: '0 0 32px',
            }}>
              A fatal error occurred in the application root. Our engineering team has been notified automatically.
            </p>

            {error?.message && (
              <div style={{
                margin: '0 0 32px',
                padding: '14px 16px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '12px',
                textAlign: 'left',
              }}>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 6px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Root Cause</p>
                <code style={{ fontSize: '12px', color: '#fca5a5', fontFamily: 'monospace', wordBreak: 'break-word', lineHeight: 1.6 }}>
                  {error.message}
                </code>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={reset}
                style={{
                  padding: '13px 28px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none',
                  borderRadius: '14px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(239,68,68,0.3)',
                }}
              >
                🔄 Reload Application
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '13px 28px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px',
                  color: '#94a3b8',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                🏠 Home
              </button>
            </div>
          </div>

          <style>{`
            @keyframes bounce {
              from { transform: translateY(0); }
              to   { transform: translateY(-12px); }
            }
          `}</style>
        </div>
      </body>
    </html>
  );
}
