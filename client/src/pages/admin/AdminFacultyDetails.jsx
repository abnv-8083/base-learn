import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Award, BookOpen, Users, Video, Clock, FileText, Check, X, AlertCircle, Calendar } from 'lucide-react';
import axios from 'axios';

const AdminFacultyDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleApproveRequest = async (requestId, action) => {
    if (action === 'reject' && !window.confirm('Reject this request?')) return;
    if (action === 'approve' && !window.confirm('Approve and process this request?')) return;

    setProcessing(true);
    try {
      await axios.post(`/api/admin/faculty/approve-request/${requestId}`, { action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDetails(); // Refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="spinner" style={{ display: 'block', margin: '15vh auto' }}></div>;
  if (!data) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-secondary)' }}>Failed to load faculty details.</div>;

  const { faculty, stats, recentClasses, uploadedContent, pendingRequests } = data;

  return (
    <div style={{ paddingBottom: '60px' }}>
      <Link to="/admin/faculty" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', textDecoration: 'none', marginBottom: '20px', fontWeight: '500', fontSize: '14px' }}>
        <ArrowLeft size={16} /> Back to Faculty List
      </Link>

      {/* Profile Header */}
      <div className="card" style={{ padding: '32px', display: 'flex', gap: '30px', alignItems: 'center', marginBottom: '30px', position: 'relative', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', zIndex: 0, borderRadius: '16px 16px 0 0' }}></div>
        
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'white', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', fontWeight: 'bold', color: '#10b981', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 1, marginTop: '20px', flexShrink: 0 }}>
          {faculty.profilePhoto ? <img src={faculty.profilePhoto} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="Profile" /> : faculty.name?.charAt(0)}
        </div>

        <div style={{ flex: 1, zIndex: 1, marginTop: '40px' }}>
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
              {faculty.isActive ? 'Active Member' : 'Blocked'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        <div>
          {/* Stats Board */}
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="var(--color-primary)" /> Performance Analytics
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div className="card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
                <Video size={24} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{stats.totalClasses}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Live Classes</div>
              </div>
            </div>

            <div className="card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
                <Users size={24} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{stats.totalStudentsReached}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Students Reached</div>
              </div>
            </div>

            <div className="card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', flexShrink: 0 }}>
                <BookOpen size={24} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{stats.subjectsTaught.length}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Subjects</div>
              </div>
            </div>
          </div>

          {/* Pending Requests */}
          {pendingRequests?.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} /> Pending Approval Requests
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingRequests.map(req => (
                  <div key={req._id} className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #f59e0b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '15px', textTransform: 'capitalize' }}>{req.type} Update Request</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {req.type === 'email' ? `Requested New Email: ${req.newValue}` : 'Requested Password Reset'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', color: '#ef4444', borderColor: '#fecaca' }} 
                        onClick={() => handleApproveRequest(req._id, 'reject')} disabled={processing}>Reject</button>
                      <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} 
                        onClick={() => handleApproveRequest(req._id, 'approve')} disabled={processing}>Approve</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Upload History */}
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--color-primary)" /> Uploaded Content History
          </h2>
          <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
            {uploadedContent?.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No content uploaded yet.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg)', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 20px', textAlign: 'left' }}>Content Title</th>
                    <th style={{ padding: '12px 20px', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: '12px 20px', textAlign: 'left' }}>Upload Date</th>
                    <th style={{ padding: '12px 20px', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedContent.map(content => (
                    <tr key={content._id} style={{ borderTop: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '14px 20px', fontWeight: '600', fontSize: '14px' }}>{content.title}</td>
                      <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#475569' }}>{content.contentType}</span>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} /> {new Date(content.createdAt).toLocaleDateString()}
                          <Clock size={12} style={{ marginLeft: '8px' }} /> {new Date(content.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: content.status === 'published' ? '#10b981' : '#f59e0b' }}>{content.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div>
          {/* Recent Live Classes Sidebar */}
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Calendar size={20} color="var(--color-primary)" /> Recent Live Sessions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {recentClasses.length === 0 ? (
              <div className="card" style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '14px' }}>No live sessions.</div>
            ) : recentClasses.map(c => (
              <div key={c._id} className="card" style={{ padding: '16px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>{c.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={12} /> {c.subject}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={12} /> {new Date(c.scheduledAt).toLocaleDateString()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 'bold', marginTop: '4px' }}>
                    <Users size={12} /> {c.attendance?.filter(a => a.attended).length || 0} Attended
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFacultyDetails;
