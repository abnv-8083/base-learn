"use client";

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { 
  Users, UserPlus, UserMinus, Search, ArrowLeft, 
  ShieldCheck, ShieldAlert, Mail, Phone, Hash, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BatchRoster() {
  const { id } = useParams();
  const router = useRouter();
  
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Search state for existing roster
  const [rosterSearch, setRosterSearch] = useState('');
  
  // Discovery state for adding new students
  const [allStudents, setAllStudents] = useState([]);
  const [discoverySearch, setDiscoverySearch] = useState('');
  const [discoveryLoading, setDiscoveryLoading] = useState(false);

  const fetchBatch = useCallback(async () => {
    try {
      const res = await axios.get(`/api/instructor/batches/${id}`);
      setBatch(res.data.data);
    } catch (err) {
      toast.error('Failed to load batch details');
      router.push('/instructor/batches');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  const fetchAllStudents = useCallback(async () => {
    setDiscoveryLoading(true);
    try {
      const res = await axios.get('/api/instructor/students');
      setAllStudents(res.data.data || []);
    } catch (err) {
      console.error('Failed to load global students');
    } finally {
      setDiscoveryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatch();
    fetchAllStudents();
  }, [fetchBatch, fetchAllStudents]);

  const handleUpdateRoster = async (studentId, action) => {
    try {
      await axios.patch(`/api/instructor/batches/${id}/students`, { studentId, action });
      toast.success(action === 'add' ? 'Student added to batch' : 'Student removed from batch');
      fetchBatch(); // Refresh roster
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <div className="spinner" style={{ margin: 'auto', display: 'block', marginTop: '30vh' }}></div>;
  if (!batch) return null;

  const currentRoster = batch.students || [];
  const filteredRoster = currentRoster.filter(s => 
    s.name?.toLowerCase().includes(rosterSearch.toLowerCase()) ||
    s.email?.toLowerCase().includes(rosterSearch.toLowerCase())
  );

  // Filter global students to exclude those already in THIS batch
  const eligibleStudents = allStudents.filter(s => 
    !currentRoster.some(rs => rs._id === s._id) &&
    (s.name?.toLowerCase().includes(discoverySearch.toLowerCase()) || 
     s.email?.toLowerCase().includes(discoverySearch.toLowerCase()))
  );

  const isAtCapacity = currentRoster.length >= (batch.capacity || 0);

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
           <button onClick={() => router.back()} style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--color-primary)' }}>
              <ArrowLeft size={20} />
           </button>
           <div>
              <h1 className="page-title">{batch.name} • Roster</h1>
              <p className="page-subtitle">{batch.studyClass?.name} ({batch.studyClass?.targetGrade}) • {batch.mode} mode</p>
           </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
        
        {/* LEFT: CURRENT ROSTER */}
        <section>
           <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Users size={20} color="var(--color-primary)" />
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Enrolled Students</h3>
                    <span style={{ padding: '2px 10px', background: isAtCapacity ? 'var(--color-error-light)' : 'var(--color-primary-light)', color: isAtCapacity ? 'var(--color-error)' : 'var(--color-primary)', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                       {currentRoster.length} / {batch.capacity}
                    </span>
                 </div>
                 <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                    <input 
                       value={rosterSearch} 
                       onChange={e => setRosterSearch(e.target.value)} 
                       placeholder="Filter enrolled..." 
                       style={{ padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '13px', width: '200px' }}
                    />
                 </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                       <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                          <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Student</th>
                          <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Class/Grade</th>
                          <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Status</th>
                          <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Actions</th>
                       </tr>
                    </thead>
                    <tbody>
                       {filteredRoster.map(student => (
                          <tr key={student._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                             <td style={{ padding: '16px 24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                   <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '14px' }}>
                                      {student.name?.charAt(0)}
                                   </div>
                                   <div>
                                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{student.name}</div>
                                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{student.email}</div>
                                   </div>
                                </div>
                             </td>
                             <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                                {student.studentClass || 'N/A'}
                             </td>
                             <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                {student.isActive ? (
                                   <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px' }}><ShieldCheck size={14}/> Active</span>
                                ) : (
                                   <span style={{ color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px' }}><ShieldAlert size={14}/> Offline</span>
                                )}
                             </td>
                             <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                <button 
                                   onClick={() => handleUpdateRoster(student._id, 'remove')}
                                   style={{ padding: '6px', borderRadius: '6px', border: '1px solid #fee2e2', color: '#ef4444', background: '#fef2f2', cursor: 'pointer' }}
                                   title="Remove from batch"
                                >
                                   <UserMinus size={16} />
                                </button>
                             </td>
                          </tr>
                       ))}
                       {filteredRoster.length === 0 && (
                          <tr>
                             <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                {rosterSearch ? 'No students match your filter.' : 'This batch is currently empty.'}
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </section>

        {/* RIGHT: STUDENT DISCOVERY (ADD NEW) */}
        <aside>
           <div className="card" style={{ padding: '24px', position: 'sticky', top: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                 <UserPlus size={20} color="var(--color-success)" />
                 <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Add Students</h3>
              </div>
              
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                 <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                 <input 
                    value={discoverySearch} 
                    onChange={e => setDiscoverySearch(e.target.value)} 
                    placeholder="Search global directory..." 
                    style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid var(--color-border)', fontSize: '14px' }}
                 />
              </div>

              {isAtCapacity && (
                 <div style={{ padding: '12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px' }}>
                    <ShieldAlert size={18} color="#d97706" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: '12px', color: '#92400e', margin: 0 }}>
                       <strong>Batch at Capacity!</strong> Adding more students will exceed the planned limit of {batch.capacity}.
                    </p>
                 </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }}>
                 {discoveryLoading ? <div className="spinner" style={{ scale: '0.6' }}></div> : (
                    eligibleStudents.length === 0 ? (
                       <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                          No eligible students found.
                       </div>
                    ) : eligibleStudents.map(student => (
                       <div key={student._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--color-bg)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '12px', border: '1px solid var(--color-border)' }}>
                             {student.name?.charAt(0)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                             <div style={{ fontSize: '13px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.name}</div>
                             <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{student.studentClass || 'No Class'}</div>
                          </div>
                          <button 
                             onClick={() => handleUpdateRoster(student._id, 'add')}
                             style={{ background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}
                          >
                             <UserPlus size={16} />
                          </button>
                       </div>
                    ))
                 )}
              </div>

              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
                 <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>Batch Summary</h4>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                       <span style={{ color: 'var(--color-text-secondary)' }}>Enrolled</span>
                       <span style={{ fontWeight: 'bold' }}>{currentRoster.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                       <span style={{ color: 'var(--color-text-secondary)' }}>Vacancy</span>
                       <span style={{ fontWeight: 'bold', color: isAtCapacity ? 'var(--color-error)' : 'var(--color-success)' }}>
                          {Math.max(0, batch.capacity - currentRoster.length)}
                       </span>
                    </div>
                 </div>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}
