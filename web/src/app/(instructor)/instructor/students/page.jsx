"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, User, Mail, School, MapPin, Calendar, ExternalLink, Activity } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function InstructorStudents() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user?.role === 'instructor') {
      fetchStudents();
    }
  }, [user]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/instructor/students`);
      setStudents(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      toast.error('Failed to load roster.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewDetails = (student) => {
    router.push(`/instructor/students/${student._id}`);
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
<div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">Enrolled Students</h1>
          <p className="page-subtitle">Oversee academic performance and contact details of your mapped students.</p>
        </div>
      </div>

      <div style={{ position: 'relative', width: '350px', marginBottom: '24px' }}>
        <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search students...`}
          style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '15px' }} />
      </div>

      {loading ? <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }}></div> : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Student</th>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Contact</th>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Grade Level</th>
                <th style={{ padding: '16px 20px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '16px 20px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                     No enrolled students match your filters.
                  </td>
                </tr>
              ) : filtered.map(student => (
                <tr key={student._id} style={{ borderTop: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--color-bg)'}
                  onMouseOut={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {student.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{student.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{student.school || 'Unspecified School'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '14px', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <Mail size={14} color="var(--color-text-muted)" /> {student.email}
                    </div>
                    {student.phone && (
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                         {student.phone}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500' }}>
                       <School size={16} color="var(--color-success)" />
                       {student.studentClass || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', background: student.isActive ? '#dcfce7' : '#fee2e2', color: student.isActive ? '#166534' : '#991b1b' }}>
                      {student.isActive ? 'Active' : 'Offline'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <button onClick={() => handleViewDetails(student)} className="btn btn-ghost" style={{ padding: '8px', color: '#6366f1' }} title="View Deep Analytics">
                      <Activity size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
