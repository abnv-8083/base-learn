import { useNavigate } from 'react-router-dom';
import { 
  Film, HelpCircle, FileText, CheckCircle, 
  ArrowRight, UploadCloud, History, Layout 
} from 'lucide-react';

const FacultyContent = () => {
  const navigate = useNavigate();

  const contentTypes = [
    { id: 'video', label: 'Recorded Class', description: 'Manage lecture videos', icon: Film, color: '#6366f1', count: 0 },
    { id: 'faq', label: 'FAQ Session', description: 'Manage faq session', icon: HelpCircle, color: '#ec4899', count: 0 },
    { id: 'note', label: 'Class Notes', description: 'Manage class notes', icon: FileText, color: '#f59e0b', count: 0 },
    { id: 'liveNote', label: 'Live Class Notes', description: 'Manage live notes', icon: FileText, color: '#8b5cf6', count: 0 },
    { id: 'dpp', label: 'DPP', description: 'Manage daily practice papers', icon: FileText, color: '#10b981', count: 0 },
    { id: 'pyq', label: 'PYQ', description: 'Manage previous year questions', icon: FileText, color: '#3b82f6', count: 0 },
    { id: 'test', label: 'Main Test', description: 'Manage main examinations', icon: CheckCircle, color: '#ef4444', count: 0 },
    { id: 'assignment', label: 'Main Assignment', description: 'Manage student assignments', icon: CheckCircle, color: '#14b8a6', count: 0 }
  ];

  return (
    <div style={{ paddingBottom: '80px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '32px', fontWeight: '800' }}>Faculty Content Portal</h1>
          <p className="page-subtitle" style={{ fontSize: '16px', color: 'var(--color-text-muted)' }}>
            Select a category to view history, upload new materials, or manage existing content.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Role</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-faculty)' }}>Content Administrator</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {contentTypes.map((ct) => {
          const Icon = ct.icon;
          return (
            <div
              key={ct.id}
              className="card"
              style={{
                cursor: 'pointer',
                padding: '32px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                position: 'relative',
                border: '1.5px solid var(--color-border)',
                background: 'white'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = ct.color;
                e.currentTarget.style.boxShadow = `0 20px 25px -5px ${ct.color}15, 0 8px 10px -6px ${ct.color}15`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
              onClick={() => navigate(`/faculty/content/manage/${ct.id}`)}
            >
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '16px', 
                background: `${ct.color}12`, 
                color: ct.color, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                transition: 'all 0.3s'
              }}>
                <Icon size={30} />
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>{ct.label}</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: 0, lineHeight: '1.5' }}>{ct.description}</p>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <History size={14} /> History & Uploads
                </span>
                <div style={{ color: ct.color }}>
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* QUICK ACTIONS BANNER */}
      <div 
        style={{ 
          marginTop: '60px', 
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #0B1D4A 100%)', 
          borderRadius: '24px', 
          padding: '40px', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '32px',
          flexWrap: 'wrap',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 12px 0', color: 'white' }}>Need help managing content?</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '15px' }}>
            Check out our faculty guide for best practices on organizing your video lectures and class materials.
          </p>
        </div>
        <button 
          className="btn" 
          style={{ 
            background: 'var(--color-accent)', 
            color: 'var(--color-primary)', 
            fontWeight: '700',
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          View Faculty Guide
        </button>
      </div>
    </div>
  );
};

export default FacultyContent;
