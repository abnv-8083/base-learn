import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Camera, Save, BookOpen, GraduationCap, Briefcase, Info } from 'lucide-react';
import facultyService from '../../services/facultyService';
import toast from 'react-hot-toast';

const FacultyProfile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    district: '',
    specialization: '',
    qualification: '',
    experience: '',
    about: ''
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        district: user.district || '',
        specialization: user.specialization || '',
        qualification: user.qualification || '',
        experience: user.experience || '',
        about: user.about || 'Passionate educator dedicated to shaping the next generation of learners.'
      });
    }
  }, [user]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'name') {
      if (!value) error = 'Name is required';
      else if (value.length < 3) error = 'Name must be at least 3 characters';
    }
    if (name === 'phone') {
      const phoneRegex = /^[0-9+]{10,15}$/;
      if (value && !phoneRegex.test(value)) error = 'Invalid phone format';
    }
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) error = 'Email is required';
      else if (!emailRegex.test(value)) error = 'Invalid email format';
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
    
    // Inline validation
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Final validation check
    const newErrors = {};
    Object.keys(profileData).forEach(key => {
      const error = validateField(key, profileData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors before saving');
      return;
    }

    setIsSaving(true);
    try {
      await facultyService.updateProfile(profileData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      // Note: Ideally refresh the AuthContext user here if the backend returns updated user
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequest = async (type, newValue = null) => {
    try {
      const res = await axios.post('/api/faculty/profile/request-update', { type, newValue }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit request');
    }
  };

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const fields = [
    { key: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'Full name', required: true },
    { key: 'email', label: 'Email Address', icon: Mail, type: 'email', placeholder: 'email@school.edu', required: true, disabled: true },
    { key: 'phone', label: 'Phone Number', icon: Phone, type: 'text', placeholder: '+91 ...' },
    { key: 'district', label: 'Location / District', icon: MapPin, type: 'text', placeholder: 'e.g. Kozhikode' },
    { key: 'specialization', label: 'Subject Specialization', icon: BookOpen, type: 'text', placeholder: 'e.g. Physics, Mathematics' },
    { key: 'qualification', label: 'Highest Qualification', icon: GraduationCap, type: 'text', placeholder: 'e.g. MSc Physics, PhD' },
    { key: 'experience', label: 'Teaching Experience', icon: Briefcase, type: 'text', placeholder: 'e.g. 5+ Years' },
  ];

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">View and manage your personal and professional details.</p>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        {/* Cover */}
        <div style={{ height: '120px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', position: 'relative' }}></div>

        {/* Avatar & Header Row */}
        <div style={{ padding: '0 32px 32px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-44px', marginBottom: '24px' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={user?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Faculty')}&size=150&background=10b981&color=fff`}
                alt="Avatar"
                style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid white', objectFit: 'cover' }}
              />
              {isEditing && (
                <button style={{ position: 'absolute', bottom: '0', right: '0', background: '#10b981', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Camera size={15} />
                </button>
              )}
            </div>
            <div>
              {!isEditing ? (
                <button className="btn btn-outline" onClick={() => setIsEditing(true)}>Edit Profile</button>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-outline" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '8px' }} disabled={isSaving}>
                    {isSaving ? <div className="spinner-small" /> : <Save size={16} />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSave}>
            {/* Bio section */}
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{profileData.name || 'Faculty Member'}</h2>
              <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>Faculty Staff</div>
              {!isEditing ? (
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', fontSize: '15px', maxWidth: '600px' }}>{profileData.about}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>About Me</label>
                  <textarea
                    name="about"
                    value={profileData.about}
                    onChange={handleChange}
                    rows={3}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', resize: 'vertical', fontSize: '14px', lineHeight: '1.6', outline: 'none' }}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              )}
            </div>

            {/* Fields grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {fields.map(field => {
                const Icon = field.icon;
                const hasError = errors[field.key];
                return (
                  <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
                    </label>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      padding: '11px 14px', 
                      borderRadius: '8px', 
                      border: `1px solid ${hasError ? 'red' : 'var(--color-border)'}`, 
                      background: isEditing && !field.disabled ? 'white' : 'var(--color-bg)',
                      transition: 'border-color 0.2s'
                    }}>
                      <Icon size={17} color={hasError ? 'red' : "#10b981"} style={{ flexShrink: 0 }} />
                      {!isEditing || field.disabled ? (
                        <span style={{ fontSize: '15px', color: profileData[field.key] ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                          {profileData[field.key] || 'Not provided'}
                        </span>
                      ) : (
                        <input
                          type={field.type}
                          name={field.key}
                          value={profileData[field.key]}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                          style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '15px' }}
                        />
                      )}
                    </div>
                    {isEditing && hasError && (
                      <span style={{ fontSize: '11px', color: 'red', marginTop: '-4px' }}>{hasError}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </form>

          {/* Security Section */}
          <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Shield size={20} color="var(--color-primary)" /> Security & Account Updates
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ padding: '20px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                    <Mail size={18} />
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Email Address</div>
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>To update your login email, you must submit a request for administrative approval.</p>
                <button className="btn btn-outline" style={{ width: '100%', fontSize: '13px', padding: '8px' }} onClick={() => setShowEmailModal(true)}>Request Email Change</button>
              </div>

              <div style={{ padding: '20px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
                    <Lock size={18} />
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Account Password</div>
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Request a password reset. A new temporary password will be sent to your email upon approval.</p>
                <button className="btn btn-outline" style={{ width: '100%', fontSize: '13px', padding: '8px' }} onClick={() => { if(window.confirm('Request a password reset from admin?')) handleRequest('password'); }}>Request Password Reset</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Help Card */}
      <div className="card" style={{ marginTop: '24px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
         <Info size={24} color="#15803d" />
         <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#166534' }}>Professional Profile</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#166534', opacity: 0.8 }}>
               Your qualification and experience details are used to match you with appropriate batches and courses.
            </p>
         </div>
      </div>
    </div>
  );
};

export default FacultyProfile;
