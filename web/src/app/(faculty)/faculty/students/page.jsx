"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, User, Mail, Activity, BookOpen, Eye, TrendingUp, Clock, HelpCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function FacultyStudents() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user?.role === 'faculty') {
      fetchStudents();
    }
  }, [user]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/faculty/students`);
      setStudents(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      toast.error('Failed to load your students.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (student) => {
    router.push(`/faculty/students/${student._id}`);
  };

  const filtered = students.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ paddingBottom: '60px' }}>
<div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">My Enrolled Students</h1>
          <p className="page-subtitle">Track academic performance of students taking your listed subjects.</p>
        </div>
      </div>

      <div style={{ position: 'relative', width: '350px', marginBottom: '24px' }}>
        <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search students by name...`}
          style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '15px' }} />
      </div>

      {loading ? <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '20vh' }}></div> : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Student Details</th>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Subject Enrollment</th>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Overall Performance</th>
                <th style={{ padding: '16px 20px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                     <User size={32} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                     <p>No students found matching your criteria.</p>
                  </td>
                </tr>
              ) : filtered.map(student => (
                <tr key={student._id} style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {student.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{student.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Class: {student.studentClass || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-primary)' }}>
                      <BookOpen size={16} color="var(--color-warning)" />
                      {student.subject || 'All Associated Subjects'}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ height: '8px', flex: 1, background: 'var(--color-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                         <div style={{ height: '100%', width: `${student.score || 70}%`, background: 'var(--color-success)' }}></div>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{student.score || 70}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                     <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button onClick={() => handleViewDetails(student)} className="btn btn-ghost" style={{ padding: '8px', color: '#6366f1' }} title="View Deep Analytics">
                          <Activity size={18} />
                        </button>
                        <a href={`mailto:${student.email}`} className="btn btn-ghost" style={{ padding: '8px', color: 'var(--color-primary)' }} title="Message">
                          <Mail size={18} />
                        </a>
                     </div>
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
