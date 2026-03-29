import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Award, BookOpen, Users, Video, Clock } from 'lucide-react';
import axios from 'axios';

const AdminInstructorDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`/api/admin/instructors/${id}/details`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch instructor details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <div className="spinner" style={{ display: 'block', margin: '15vh auto' }}></div>;
  if (!data) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-secondary)' }}>Failed to load instructor details.</div>;

  const { instructor, stats, studyClasses = [], batches = [] } = data;

  const getGradient = (index) => {
    const gradients = [
        'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
        'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      <Link to="/admin/instructors" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', textDecoration: 'none', marginBottom: '20px', fontWeight: '500', fontSize: '14px' }}>
        <ArrowLeft size={16} /> Back to Instructors List
      </Link>

      {/* Profile Header */}
      <div className="card" style={{ padding: '32px', display: 'flex', gap: '30px', alignItems: 'center', marginBottom: '30px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', zIndex: 0 }}></div>
        
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'white', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', fontWeight: 'bold', color: '#f59e0b', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 1, marginTop: '40px', flexShrink: 0 }}>
          {instructor.profilePhoto ? <img src={instructor.profilePhoto} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="Profile" /> : instructor.name?.charAt(0)}
        </div>

        <div style={{ flex: 1, zIndex: 1, marginTop: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--color-text-primary)' }}>{instructor.name}</h1>
              <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {instructor.email}</span>
                {instructor.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> +91 {instructor.phone}</span>}
              </div>
            </div>
            <span style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', background: instructor.isActive ? '#dcfce7' : '#fee2e2', color: instructor.isActive ? '#166534' : '#991b1b', border: `1px solid ${instructor.isActive ? '#bbf7d0' : '#fecaca'}` }}>
              {instructor.isActive ? 'Active' : 'Blocked'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: '600' }}>Qualification</div>
              <div style={{ fontSize: '15px', color: 'var(--color-text-primary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={16} color="#f59e0b" /> {instructor.qualification || 'Not specified'}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: '600' }}>Experience</div>
              <div style={{ fontSize: '15px', color: 'var(--color-text-primary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#f59e0b" /> {instructor.experience || 'Not specified'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Board */}
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Management Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', flexShrink: 0 }}>
            <BookOpen size={28} />
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '800', lineHeight: 1, color: 'var(--color-text-primary)', marginBottom: '4px' }}>{stats.totalClasses}</div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Global Classes Created</div>
            <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px', fontWeight: '600' }}>Course Management</div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
            <Video size={28} />
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '800', lineHeight: 1, color: 'var(--color-text-primary)', marginBottom: '4px' }}>{stats.totalBatches}</div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Batches Assigned</div>
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>Active Cohorts</div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '800', lineHeight: 1, color: 'var(--color-text-primary)', marginBottom: '4px' }}>{stats.totalStudentsManaged}</div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Students Overseen</div>
            <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '4px', fontWeight: '600' }}>Total learner population</div>
          </div>
        </div>
      </div>

      {/* Global Classes Managed */}
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Global Subjects & Classes Managed</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {studyClasses.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
            No global classes mapped to this instructor yet.
          </div>
        ) : studyClasses.map((sub, i) => {
          return (
            <div key={sub._id} style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: getGradient(i), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '16px' }}>
                <BookOpen size={20} />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{sub.targetGrade || 'Cross Grade'}</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '4px' }}>{sub.name}</div>
            </div>
          );
        })}
      </div>

      {/* Batch Mapping */}
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Student Batches Instructing</h2>
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg)', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600' }}>Batch Name</th>
              <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: '600' }}>Student Count</th>
              <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: '600' }}>Capacity Filled</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {batches.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>No student batches assigned yet.</td></tr>
            ) : batches.map(b => {
              const count = b.students?.length || 0;
              const cap = b.capacity || 30;
              const isFull = count >= cap;
              return (
                <tr key={b._id} style={{ borderTop: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--color-bg)'}
                  onMouseOut={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '16px 24px', fontWeight: '600', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isFull ? '#ef4444' : '#10b981' }}></div>
                      {b.name}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    {count}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <div style={{ background: '#e2e8f0', borderRadius: '10px', height: '6px', width: '100px', margin: '0 auto', overflow: 'hidden' }}>
                      <div style={{ background: isFull ? '#ef4444' : '#10b981', height: '100%', width: `${Math.min((count / cap) * 100, 100)}%` }}></div>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{Math.round((count/cap)*100)}%</div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', background: isFull ? '#fee2e2' : '#dcfce7', color: isFull ? '#991b1b' : '#166534' }}>
                      {isFull ? 'Full' : 'Accepting'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminInstructorDetails;
