import { useState, useEffect } from 'react';
import { Calendar, Users, Activity, Video, Radio, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import facultyService from '../../services/facultyService';

const FacultyDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [scheduled, setScheduled] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, classesRes] = await Promise.all([
           facultyService.getDashboardStats(),
           facultyService.getScheduledClasses()
        ]);
        setStatsData(statsRes);
        setScheduled(classesRes.slice(0, 3)); // Only show top 3 upcoming
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { id: 1, label: 'Assigned Batches', value: statsData?.batches || 0, type: 'primary', icon: Users },
    { id: 2, label: 'Assigned Subjects', value: statsData?.subjects || 0, type: 'warning', icon: BookOpen },
    { id: 3, label: 'Upcoming Live Streams', value: statsData?.liveClasses || 0, type: 'error', icon: Video },
    { id: 4, label: 'Total Students', value: statsData?.students || 0, type: 'success', icon: Activity },
  ];

  if (loading) return <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }}></div>;

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">Faculty Dashboard</h1>
          <p className="page-subtitle">Welcome back. Manage your live sessions, content uploads, and track metrics.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className="card" style={{ padding: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `var(--color-${stat.type}-light)`, color: `var(--color-${stat.type})` 
              }}>
                <Icon size={28} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: '800', lineHeight: 1, color: 'var(--color-text-primary)' }}>{stat.value}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: '500' }}>{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', marginBottom: '16px' }}>Upcoming Classes Payload</h2>
        {scheduled.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: '12px', color: 'var(--color-text-secondary)' }}>
            No classes scheduled for today. Navigate to the Live Sessions tab to broadcast.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {scheduled.map(cls => (
              <div key={cls._id || cls.id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--color-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: cls.type === 'faq' ? '#fce7f3' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: cls.type === 'faq' ? '#db2777' : '#EF4444' }}>
                      {cls.type === 'faq' ? '❓' : <Radio size={24} />}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{cls.title}</h3>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{cls.batch?.name || 'All Batches'}</div>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: '8px', padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                  <div><span style={{ color: 'var(--color-text-secondary)' }}>Status:</span> <strong style={{ textTransform: 'capitalize' }}>{cls.status}</strong></div>
                  <div><span style={{ color: 'var(--color-text-secondary)' }}>Duration:</span> <strong>{cls.duration} min</strong></div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Scheduled: </span>
                    <strong>{new Date(cls.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</strong>
                  </div>
                </div>
                
                <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => navigate('/faculty/live-classes')}>
                  Manage Session
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;
