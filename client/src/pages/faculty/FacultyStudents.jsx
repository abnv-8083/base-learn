import { useState, useMemo } from 'react';
import { Users, Activity, Clock, Calendar, TrendingUp, CheckCircle, Search, X } from 'lucide-react';

const FacultyStudents = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const students = [
    { id: 1, name: 'Arjun Kumar', batch: 'Class 10 – Batch A', attendance: 92, watchTime: '38h', activity: 'High', lastSeen: '2h ago' },
    { id: 2, name: 'Sana Malik', batch: 'Class 10 – Batch A', attendance: 78, watchTime: '22h', activity: 'Medium', lastSeen: '1d ago' },
    { id: 3, name: 'Rahul Dev', batch: 'Class 9 – Batch B', attendance: 55, watchTime: '10h', activity: 'Low', lastSeen: '3d ago' },
    { id: 4, name: 'Priya Sharma', batch: 'Class 9 – Batch B', attendance: 88, watchTime: '31h', activity: 'High', lastSeen: '5h ago' },
    { id: 5, name: 'Vikram Nair', batch: 'Class 10 – Batch A', attendance: 70, watchTime: '18h', activity: 'Medium', lastSeen: '2d ago' },
  ];

  const attendanceGraphData = useMemo(() => {
    const data = [];
    const year = parseInt(selectedYear);
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    // Empty blocks to align January 1st to the correct weekday (Sunday = 0)
    let startDayOfWeek = startDate.getDay();
    for (let i = 0; i < startDayOfWeek; i++) {
        data.push(null); // Empty block
    }

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const present = Math.random() > 0.25;
        data.push({
            date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            present,
            color: present ? '#22c55e' : '#ebedf0'
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return data;
  }, [selectedYear]);

  const monthLabels = useMemo(() => {
    const labels = [];
    const year = parseInt(selectedYear);
    for (let m = 0; m < 12; m++) {
       const firstOfMonth = new Date(year, m, 1);
       const diffDays = Math.floor((firstOfMonth - new Date(year, 0, 1)) / (24 * 60 * 60 * 1000));
       const firstDayOfWeek = new Date(year, 0, 1).getDay();
       const col = Math.floor((diffDays + firstDayOfWeek) / 7);
       labels.push({ text: firstOfMonth.toLocaleDateString('en-US', { month: 'short' }), col });
    }
    return labels;
  }, [selectedYear]);

  const getActivityColor = (act) => {
    if (act === 'High') return { bg: '#dcfce7', text: '#166534' };
    if (act === 'Medium') return { bg: '#fef3c7', text: '#92400e' };
    return { bg: '#fee2e2', text: '#991b1b' };
  };

  const getProcessedStudents = () => {
    let result = [...students];
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        result = result.filter(s => 
            s.name.toLowerCase().includes(lowerTerm) || 
            s.batch.toLowerCase().includes(lowerTerm)
        );
    }
    result.sort((a, b) => {
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        if (sortBy === 'attendance-desc') return b.attendance - a.attendance;
        if (sortBy === 'attendance-asc') return a.attendance - b.attendance;
        if (sortBy === 'watch-desc') return parseInt(b.watchTime) - parseInt(a.watchTime);
        return 0;
    });
    return result;
  };

  const processedStudents = getProcessedStudents();

  if (selectedStudent) {
    const colors = getActivityColor(selectedStudent.activity);
    return (
      <div>
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
          <button className="icon-btn" onClick={() => setSelectedStudent(null)}>&larr;</button>
          <div>
            <h1 className="page-title">{selectedStudent.name}</h1>
            <p className="page-subtitle">{selectedStudent.batch}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          {[
            { label: 'Attendance Rate', value: `${selectedStudent.attendance}%`, icon: CheckCircle, color: '#22c55e' },
            { label: 'Total Watch Time', value: selectedStudent.watchTime, icon: Clock, color: 'var(--color-primary)' },
            { label: 'Learning Activity', value: selectedStudent.activity, icon: TrendingUp, color: colors.text },
            { label: 'Last Active', value: selectedStudent.lastSeen, icon: Activity, color: '#f59e0b' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="card" style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: s.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                  <Icon size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: '800', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '3px' }}>{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card" style={{ padding: '24px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
             <h3 style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>Yearly Attendance Board</h3>
             <select 
                value={selectedYear} 
                onChange={e => setSelectedYear(e.target.value)}
                style={{
                  padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)', fontSize: '13px', cursor: 'pointer', outline: 'none'
                }}
             >
                {[0, 1, 2].map(offset => {
                  const y = new Date().getFullYear() - offset;
                  return <option key={y} value={y}>{y}</option>
                })}
             </select>
          </div>
          
          <div style={{ position: 'relative', minWidth: 'max-content' }}>
            {/* Month Header row */}
            <div style={{ display: 'flex', position: 'relative', height: '15px', marginBottom: '8px', marginLeft: '30px' }}>
               {monthLabels.map((lbl, idx) => (
                   <span key={idx} style={{ 
                       position: 'absolute', 
                       left: `calc(${lbl.col * 15}px)`, 
                       fontSize: '11px', 
                       color: 'var(--color-text-secondary)',
                       fontWeight: '500' 
                   }}>
                       {lbl.text}
                   </span>
               ))}
            </div>

            {/* Grid Container */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {/* Day Labels */}
              <div style={{ display: 'grid', gridTemplateRows: 'repeat(7, 12px)', gap: '3px', fontSize: '10px', color: 'var(--color-text-secondary)', alignContent: 'space-between', marginTop: '1px' }}>
                 <span style={{ height: '12px', lineHeight: '12px' }}>Sun</span>
                 <span style={{ height: '12px', lineHeight: '12px' }}></span>
                 <span style={{ height: '12px', lineHeight: '12px' }}>Tue</span>
                 <span style={{ height: '12px', lineHeight: '12px' }}></span>
                 <span style={{ height: '12px', lineHeight: '12px' }}>Thu</span>
                 <span style={{ height: '12px', lineHeight: '12px' }}></span>
                 <span style={{ height: '12px', lineHeight: '12px' }}>Sat</span>
              </div>
              
              {/* Actual Graphic Grid */}
              <div style={{ 
                  display: 'grid', 
                  gridTemplateRows: 'repeat(7, 12px)', 
                  gridAutoFlow: 'column', 
                  gap: '3px' 
              }}>
                {attendanceGraphData.map((a, i) => (
                  <div 
                    key={i} 
                    title={a ? `${a.date}: ${a.present ? 'Present' : 'Absent'}` : ''} 
                    style={{ 
                      width: '12px', height: '12px', borderRadius: '2px', 
                      background: a ? a.color : 'transparent', 
                      cursor: a ? 'pointer' : 'default',
                      transition: 'transform 0.1s ease',
                      outline: a && !a.present ? '1px solid rgba(27,31,35,0.06)' : 'none',
                      outlineOffset: '-1px'
                    }}
                    onMouseOver={e => {
                      if(a) {
                         e.currentTarget.style.transform = 'scale(1.2)';
                         e.currentTarget.style.zIndex = '10';
                      }
                    }}
                    onMouseOut={e => {
                      if(a) {
                         e.currentTarget.style.transform = 'scale(1)';
                         e.currentTarget.style.zIndex = '1';
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#ebedf0', outline: '1px solid rgba(27,31,35,0.06)', outlineOffset: '-1px' }}></div>
                <span>Absent</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#22c55e' }}></div>
                <span>Present</span>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title">Student Metrics</h1>
        <p className="page-subtitle">Track attendance, watch time, and learning engagement.</p>
      </div>

      {/* Overview Tally */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {[
          { label: 'Total Students', value: students.length, icon: Users },
          { label: 'Avg Attendance', value: `${Math.round(students.reduce((a, s) => a + s.attendance, 0) / students.length)}%`, icon: CheckCircle },
          { label: 'High Engagement', value: students.filter(s => s.activity === 'High').length, icon: TrendingUp },
          { label: 'Low Engagement', value: students.filter(s => s.activity === 'Low').length, icon: Activity },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="card" style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <Icon size={24} />
              </div>
              <div>
                <div style={{ fontSize: '26px', fontWeight: '800', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '3px' }}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Sort Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '0 12px', flex: '1', minWidth: '300px', maxWidth: '400px' }}>
            <Search size={18} color="var(--color-text-secondary)" />
            <input 
                type="text" 
                placeholder="Search by student name or batch..." 
                style={{ border: 'none', background: 'transparent', width: '100%', padding: '12px 10px', outline: 'none', color: 'var(--color-text-primary)', fontSize: '14px' }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
                <button onClick={() => setSearchTerm('')} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '50%', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text-secondary)' }} title="Clear search">
                    <X size={14} />
                </button>
            )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Sort by:</span>
            <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value)}
                style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px'
                }}
            >
                <option value="name-asc">Name (A - Z)</option>
                <option value="name-desc">Name (Z - A)</option>
                <option value="attendance-desc">Highest Attendance</option>
                <option value="attendance-asc">Lowest Attendance</option>
                <option value="watch-desc">Highest Watch Time</option>
            </select>
        </div>
      </div>

      {/* Student List Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>All Students</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: '600' }}>Student</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: '600' }}>Batch</th>
                <th style={{ padding: '12px 24px', textAlign: 'center', fontWeight: '600' }}>Attendance</th>
                <th style={{ padding: '12px 24px', textAlign: 'center', fontWeight: '600' }}>Watch Time</th>
                <th style={{ padding: '12px 24px', textAlign: 'center', fontWeight: '600' }}>Activity</th>
                <th style={{ padding: '12px 24px', textAlign: 'center', fontWeight: '600' }}>Last Seen</th>
                <th style={{ padding: '12px 24px', textAlign: 'center', fontWeight: '600' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {processedStudents.length === 0 ? (
                <tr>
                   <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                     <Search size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                     <div style={{ fontSize: '16px', fontWeight: '500' }}>No students found matching your criteria.</div>
                     <div style={{ fontSize: '14px', marginTop: '4px' }}>Try adjusting your search terms or filters.</div>
                   </td>
                </tr>
              ) : (
                processedStudents.map(s => {
                  const colors = getActivityColor(s.activity);
                  return (
                    <tr key={s.id} style={{ borderTop: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--color-bg)'}
                    onMouseOut={e => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                          {s.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: '600' }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>{s.batch}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontWeight: 'bold' }}>{s.attendance}%</span>
                        <div style={{ width: '80px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${s.attendance}%`, height: '100%', background: s.attendance > 75 ? '#22c55e' : s.attendance > 50 ? '#f59e0b' : '#EF4444', borderRadius: '3px' }}></div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center', fontWeight: '600' }}>{s.watchTime}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <span style={{ padding: '4px 10px', background: colors.bg, color: colors.text, borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>{s.activity}</span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>{s.lastSeen}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={() => setSelectedStudent(s)}>View</button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FacultyStudents;
