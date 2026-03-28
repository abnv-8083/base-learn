import { Search, UserCheck, Users, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import instructorService from '../../services/instructorService';

const FacultyManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [availableFaculties, setAvailableFaculties] = useState([]);
    const [assignedFaculties, setAssignedFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' or 'available'

    useEffect(() => {
        fetchFaculties();
    }, []);

    const fetchFaculties = async () => {
        try {
            setLoading(true);
            const data = await instructorService.getFaculties();
            setAvailableFaculties(data.available || []);
            setAssignedFaculties(data.assigned || []);
        } catch (error) {
            console.error('Error fetching faculties', error);
        } finally {
            setLoading(false);
        }
    };

    const getFacultiesToDisplay = () => {
        const list = activeTab === 'assigned' ? assignedFaculties : availableFaculties;
        return list.filter(f => 
            (f.name && f.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
            (f.email && f.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (f.department && f.department.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    };

    const displayList = getFacultiesToDisplay();

    return (
        <div style={{ paddingBottom: '40px' }}>
            <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="page-header-inner" style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                        <h1 className="page-title">Faculty Management</h1>
                        <p className="page-subtitle">View available faculties and those collaborating on your subjects.</p>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 12px', minWidth: '300px' }}>
                            <Search size={18} color="var(--color-text-secondary)" />
                            <input 
                                type="text" 
                                placeholder="Search faculty name, email, or dept..." 
                                className="input" 
                                style={{ border: 'none', background: 'transparent', flex: 1 }}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <button 
                    onClick={() => setActiveTab('assigned')}
                    style={{ 
                        padding: '12px 24px', 
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        border: 'none',
                        background: activeTab === 'assigned' ? 'var(--color-primary)' : 'var(--color-bg)',
                        color: activeTab === 'assigned' ? 'white' : 'var(--color-text-secondary)',
                        transition: 'all 0.2s',
                        boxShadow: activeTab === 'assigned' ? '0 4px 12px rgba(234, 106, 71, 0.3)' : 'none'
                    }}
                >
                    <UserCheck size={18} /> Collaborating Faculties ({assignedFaculties.length})
                </button>
                <button 
                    onClick={() => setActiveTab('available')}
                    style={{ 
                        padding: '12px 24px', 
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        border: 'none',
                        background: activeTab === 'available' ? 'var(--color-primary)' : 'var(--color-bg)',
                        color: activeTab === 'available' ? 'white' : 'var(--color-text-secondary)',
                        transition: 'all 0.2s',
                        boxShadow: activeTab === 'available' ? '0 4px 12px rgba(234, 106, 71, 0.3)' : 'none'
                    }}
                >
                    <Users size={18} /> All Available Faculties ({availableFaculties.length})
                </button>
            </div>

            {loading ? (
                <div className="spinner" style={{ margin: '40px auto' }}></div>
            ) : displayList.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1px dashed var(--color-border)' }}>
                    <Users size={40} color="var(--color-border)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>No Faculties Found</h3>
                    <p style={{ color: 'var(--color-text-secondary)' }}>We couldn't find any faculties matching your criteria in this list.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {displayList.map(faculty => (
                        <div key={faculty._id} className="card" style={{ padding: '24px', borderRadius: '16px', transition: 'transform 0.2s', cursor: 'default' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                <img 
                                    src={faculty.profilePhoto || `https://ui-avatars.com/api/?name=${faculty.name}&background=random`} 
                                    alt={faculty.name}
                                    style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover', border: '2px solid var(--color-bg)' }}
                                />
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'var(--color-text-primary)' }}>{faculty.name}</h3>
                                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'inline-block', background: 'var(--color-bg)', padding: '4px 8px', borderRadius: '6px' }}>
                                        {faculty.department || 'General Faculty'}
                                    </div>
                                </div>
                            </div>
                            
                            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0 0 20px 0' }} />
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                                    <Mail size={16} />
                                    <span>{faculty.email}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                                    <Phone size={16} />
                                    <span>{faculty.phone || 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                                    <MapPin size={16} />
                                    <span>{faculty.district || 'Unspecified Location'}</span>
                                </div>
                            </div>
                            
                            {activeTab === 'assigned' && (
                                <div style={{ marginTop: '20px', padding: '12px', background: 'var(--color-bg)', borderRadius: '10px', fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <CheckCircle size={16} color="var(--color-primary)" />
                                    <span>Collaborating on your subjects/chapters</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FacultyManagement;
