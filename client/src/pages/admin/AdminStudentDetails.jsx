import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, GraduationCap, School, Users, CalendarDays, BookOpen } from 'lucide-react';
import axios from 'axios';

const AdminStudentDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`/api/admin/students/${id}/details`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch student details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <div className="spinner" style={{ display: 'block', margin: '15vh auto' }}></div>;
  if (!data) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-secondary)' }}>Failed to load student details.</div>;

  const { student, batches = [] } = data;

  return (
    <div style={{ paddingBottom: '60px' }}>
      <Link to="/admin/students" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', textDecoration: 'none', marginBottom: '20px', fontWeight: '500', fontSize: '14px' }}>
        <ArrowLeft size={16} /> Back to Students List
      </Link>

      {/* Profile Header */}
      <div className="card" style={{ padding: '32px', display: 'flex', gap: '30px', alignItems: 'center', marginBottom: '30px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', zIndex: 0 }}></div>
        
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'white', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', fontWeight: 'bold', color: '#6366f1', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 1, marginTop: '40px', flexShrink: 0 }}>
          {student.profilePhoto ? <img src={student.profilePhoto} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="Profile" /> : student.name?.charAt(0)}
        </div>

        <div style={{ flex: 1, zIndex: 1, marginTop: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--color-text-primary)' }}>{student.name}</h1>
              <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {student.email}</span>
                {student.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> +91 {student.phone}</span>}
                {student.district && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {student.district}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {!student.isVerified && (
                <span style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' }}>
                  Unverified
                </span>
              )}
              <span style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', background: student.isActive ? '#dcfce7' : '#fee2e2', color: student.isActive ? '#166534' : '#991b1b', border: `1px solid ${student.isActive ? '#bbf7d0' : '#fecaca'}` }}>
                {student.isActive ? 'Active' : 'Blocked'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Academic & Personal Details</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* Academic Info */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={16} color="#6366f1" /> Academic Profile
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Target Class</div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>{student.studentClass || 'Not specified'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>School Name</div>
              <div style={{ fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <School size={14} color="#64748b" /> {student.school || 'Not specified'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Date of Birth</div>
              <div style={{ fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CalendarDays size={14} color="#64748b" /> {student.dob ? new Date(student.dob).toLocaleDateString() : 'Not provided'}
              </div>
            </div>
          </div>
        </div>

        {/* Guardian Info */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} color="#6366f1" /> Guardian Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Parent / Guardian Name</div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>{student.parentName || 'Not specified'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Emergency Contact</div>
              <div style={{ fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} color="#64748b" /> {student.parentPhone ? `+91 ${student.parentPhone}` : 'Not provided'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Joined Platform</div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>{new Date(student.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

      </div>

      {/* Batches Assigned */}
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BookOpen size={18} color="var(--color-primary)" /> Enrolled Batches
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {batches.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
            This student has not been assigned to any learning batches yet.
          </div>
        ) : batches.map(batch => (
          <div key={batch._id} style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '20px', borderTop: '4px solid #6366f1', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>Active</div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              {batch.studyClass?.name || 'Unknown Class'}
            </div>
            <div style={{ fontSize: '17px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-text-primary)' }}>{batch.name}</div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={12} /> {batch.students?.length || 0} Students in Batch
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AdminStudentDetails;
