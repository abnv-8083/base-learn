import axios from 'axios';

const API_URL = '/api/faculty';

const api = axios.create({ baseURL: API_URL });

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('baselearn_faculty_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const facultyService = {
  // Dashboard
  getDashboardStats: async () => {
    const res = await api.get('/dashboard');
    return res.data;
  },

  // Content
  getSubjects: async () => {
    const res = await api.get('/subjects');
    return res.data;
  },
  getChapters: async (subjectId) => {
    const res = await api.get(`/subjects/${subjectId}/chapters`);
    return res.data;
  },
  uploadContent: async (payload) => {
    const res = await api.post('/content/upload', payload);
    return res.data;
  },

  // Live Classes
  getScheduledClasses: async () => {
    const res = await api.get('/live-classes');
    return res.data;
  },
  scheduleLiveClass: async (data) => {
    const res = await api.post('/live-classes', data);
    return res.data;
  },

  // Students
  getBatches: async () => {
    const res = await api.get('/batches');
    return res.data;
  },
  getStudents: async () => {
    const res = await api.get('/students');
    return res.data;
  },
  getStudentMetrics: async (studentId) => {
    const res = await api.get(`/students/${studentId}/metrics`);
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put('/profile', data);
    return res.data;
  },
};

export default facultyService;
