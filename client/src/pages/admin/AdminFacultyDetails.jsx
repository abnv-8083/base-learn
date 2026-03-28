import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Award, BookOpen, Users, Video, Clock } from 'lucide-react';
import axios from 'axios';

const AdminFacultyDetails = () => {
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`/api/admin/faculty/${id}/details`, { headers: { Authorization: `Bearer ${token}` } });
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch faculty details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, token]);

  if (loading) return <div className="spinner" style={{ display: 'block', margin: '15vh auto' }}></div>;
  if (!data) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-secondary)' }}>Failed to load faculty details.</div>;

  const { faculty, stats, recentClasses } = data;

  return (
    <div style={{ paddingBottom: '60px' }}>
      <Link to="/admin/faculty" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', textDecoration: 'none', marginBottom: '20px', fontWeight: '500', fontSize: '14px' }}>
        <ArrowLeft size={16} /> Back to Faculty List
      </Link>

      {/* Profile Header */}
      <div className="card" style={{ padding: '32px', display: 'flex', gap: '30px', alignItems: 'center', marginBottom: '30px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', zIndex: 0 }}></div>
        
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'white', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', fontWeight: 'bold', color: '#10b981', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 1, marginTop: '40px', flexShrink: 0 }}>
          {faculty.profilePhoto ? <img src={faculty.profilePhoto} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="Profile" /> : faculty.name?.charAt(0)}
        </div>

        <div style={{ flex: 1, zIndex: 1, marginTop: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--color-text-primary)' }}>{faculty.name}</h1>
              <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {faculty.email}</span>
                {faculty.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> +91 {faculty.phone}</span>}
                {faculty.district && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {faculty.district}</span>}
              </div>
            </div>
            <span style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', background: faculty.isActive ? '#dcfce7' : '#fee2e2', color: faculty.isActive ? '#166534' : '#991b1b', border: `1px solid ${faculty.isActive ? '#bbf7d0' : '#fecaca'}` }}>
              {faculty.isActive ? 'Active' : 'Blocked'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: '600' }}>Qualification</div>
              <div style={{ fontSize: '15px', color: 'var(--color-text-primary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={16} color="#10b981" /> {faculty.qualification || 'Not specified'}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: '600' }}>Experience</div>
              <div style={{ fontSize: '15px', color: 'var(--color-text-primary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#10b981" /> {faculty.experience || 'Not specified'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Board */}
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Teaching Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
            <Video size={28} />
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '800', lineHeight: 1, color: 'var(--color-text-primary)', marginBottom: '4px' }}>{stats.totalClasses}</div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Live Classes Conducted</div>
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>{stats.completedClasses} officially completed</div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '800', lineHeight: 1, color: 'var(--color-text-primary)', marginBottom: '4px' }}>{stats.totalStudentsReached}</div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Students Reached</div>
            <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '4px', fontWeight: '600' }}>Total actual attendance</div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', flexShrink: 0 }}>
            <BookOpen size={28} />
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '800', lineHeight: 1, color: 'var(--color-text-primary)', marginBottom: '4px' }}>{stats.subjectsTaught.length}</div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Unique Subjects</div>
            <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
              {stats.subjectsTaught.join(', ') || 'None yet'}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Classes Table */}
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Recent Live Classes</h2>
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg)', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600' }}>Class Title</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600' }}>Subject</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600' }}>Date</th>
              <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: '600' }}>Attendance</th>
              <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: '600' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentClasses.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>No live classes conducted yet.</td></tr>
            ) : recentClasses.map(c => (
              <tr key={c._id} style={{ borderTop: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--color-bg)'}
                onMouseOut={e => e.currentTarget.style.background = 'white'}>
                <td style={{ padding: '16px 24px', fontWeight: '600', fontSize: '14px' }}>{c.title}</td>
                <td style={{ padding: '16px 24px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>{c.subject}</td>
                <td style={{ padding: '16px 24px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>{new Date(c.scheduledAt).toLocaleDateString()}</td>
                <td style={{ padding: '16px 24px', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                  {c.attendance?.filter(a => a.attended).length || 0}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', background: c.status === 'completed' ? '#dcfce7' : '#e0e7ff', color: c.status === 'completed' ? '#166534' : '#3730a3' }}>
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminFacultyDetails;
