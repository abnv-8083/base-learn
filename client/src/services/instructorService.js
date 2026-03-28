import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
});

// Attach token to every request for the `api` instance
api.interceptors.request.use((config) => {
  const role = localStorage.getItem('last_active_role') || 'instructor';
  const token = localStorage.getItem(`baselearn_${role}_token`);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// For legacy axios calls in this file
const getAuthHeaders = () => {
  const role = localStorage.getItem('last_active_role') || 'instructor';
  const token = localStorage.getItem(`baselearn_${role}_token`);
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

const instructorService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get(`/instructor/dashboard`);
    return response.data;
  },

  // Faculty Management
  getFaculties: async () => {
    const response = await axios.get(`${API_URL}/instructor/faculties`, getAuthHeaders());
    return response.data;
  },

  // --- Content Management (Subjects) ---
  getSubjects: async () => { const response = await axios.get(`${API_URL}/instructor/subjects`, getAuthHeaders()); return response.data; },
  createSubject: async (name) => { const response = await axios.post(`${API_URL}/instructor/subjects`, { name }, getAuthHeaders()); return response.data; },
  updateSubject: async (id, name) => { const response = await axios.put(`${API_URL}/instructor/subjects/${id}`, { name }, getAuthHeaders()); return response.data; },
  deleteSubject: async (id) => { const response = await axios.delete(`${API_URL}/instructor/subjects/${id}`, getAuthHeaders()); return response.data; },
  assignSubject: async (id, batchIds) => { const response = await axios.patch(`${API_URL}/instructor/subjects/${id}/assign`, { batchIds }, getAuthHeaders()); return response.data; },

  // --- Content Management (Chapters) ---
  getChapters: async (subjectId) => { const response = await axios.get(`${API_URL}/instructor/subjects/${subjectId}/chapters`, getAuthHeaders()); return response.data; },
  createChapter: async (name, subjectId) => { const response = await axios.post(`${API_URL}/instructor/chapters`, { name, subjectId }, getAuthHeaders()); return response.data; },
  updateChapter: async (id, name) => { const response = await axios.put(`${API_URL}/instructor/chapters/${id}`, { name }, getAuthHeaders()); return response.data; },
  deleteChapter: async (id) => { const response = await axios.delete(`${API_URL}/instructor/chapters/${id}`, getAuthHeaders()); return response.data; },
  assignChapter: async (id, batchIds) => { const response = await axios.patch(`${API_URL}/instructor/chapters/${id}/assign`, { batchIds }, getAuthHeaders()); return response.data; },

  // --- Content Management (Videos) ---
  getVideosByChapter: async (chapterId) => { const response = await axios.get(`${API_URL}/instructor/chapters/${chapterId}/videos`, getAuthHeaders()); return response.data; },
  getPendingVideos: async () => { const response = await axios.get(`${API_URL}/instructor/videos/pending`, getAuthHeaders()); return response.data; },
  uploadVideo: async (data) => { const response = await axios.post(`${API_URL}/instructor/videos/upload`, data, getAuthHeaders()); return response.data; },
  updateVideo: async (id, title, description) => { const response = await axios.put(`${API_URL}/instructor/videos/${id}`, { title, description }, getAuthHeaders()); return response.data; },
  deleteVideo: async (id) => { const response = await axios.delete(`${API_URL}/instructor/videos/${id}`, getAuthHeaders()); return response.data; },
  assignVideo: async (id, batchIds) => { const response = await axios.patch(`${API_URL}/instructor/videos/${id}/assign`, { batchIds }, getAuthHeaders()); return response.data; },
  linkVideoToChapter: async (id, chapterId, subjectId) => { const response = await axios.patch(`${API_URL}/instructor/videos/${id}/link`, { chapterId, subjectId }, getAuthHeaders()); return response.data; },

  // --- Assignments & Tests Review ---
  getPendingAssessments: async () => { const response = await axios.get(`${API_URL}/instructor/assessments/pending`, getAuthHeaders()); return response.data; },
  approveAssessment: async (id, type, assignedTo, deadline) => {
    const response = await axios.patch(`${API_URL}/instructor/assessments/${id}/${type}/approve`, { assignedTo, deadline }, getAuthHeaders());
    return response.data;
  },

  // --- Assignments Distribution (Legacy/Specific) ---
  getAssignments: async () => { const response = await axios.get(`${API_URL}/instructor/assignments`, getAuthHeaders()); return response.data; },
  distributeAssignment: async (id, targetType, targetId) => { const response = await axios.patch(`${API_URL}/instructor/assignments/${id}/distribute`, { targetType, targetId }, getAuthHeaders()); return response.data; },

  // Student Analysis
  getStudents: async () => {
    const response = await axios.get(`${API_URL}/instructor/students`, getAuthHeaders());
    return response.data;
  },

  getStudentAnalysis: async (id) => {
    const response = await axios.get(`${API_URL}/instructor/students/${id}/analysis`, getAuthHeaders());
    return response.data;
  },

  addStudentNote: async (id, note) => {
    const response = await axios.post(`${API_URL}/instructor/students/${id}/notes`, { note }, getAuthHeaders());
    return response.data;
  },

  updateStudent: async (id, data) => {
    const response = await axios.put(`${API_URL}/instructor/students/${id}`, data, getAuthHeaders());
    return response.data;
  },

  toggleStudentStatus: async (id) => {
    const response = await axios.patch(`${API_URL}/instructor/students/${id}/status`, {}, getAuthHeaders());
    return response.data;
  },

  deleteStudent: async (id) => {
    const response = await axios.delete(`${API_URL}/instructor/students/${id}`, getAuthHeaders());
    return response.data;
  },

  // Class Management
  getClasses: async () => {
    const response = await axios.get(`${API_URL}/instructor/classes`, getAuthHeaders());
    return response.data;
  },

  createClass: async (name, targetGrade) => {
    const response = await axios.post(`${API_URL}/instructor/classes`, { name, targetGrade }, getAuthHeaders());
    return response.data;
  },

  updateClass: async (id, name, targetGrade) => {
    const response = await axios.put(`${API_URL}/instructor/classes/${id}`, { name, targetGrade }, getAuthHeaders());
    return response.data;
  },

  deleteClass: async (id) => {
    const response = await axios.delete(`${API_URL}/instructor/classes/${id}`, getAuthHeaders());
    return response.data;
  },

  // Batch Management
  getBatches: async () => {
    const response = await axios.get(`${API_URL}/instructor/batches`, getAuthHeaders());
    return response.data;
  },

  createBatch: async (name, studyClass, capacity) => {
    const response = await axios.post(`${API_URL}/instructor/batches`, { name, studyClass, capacity }, getAuthHeaders());
    return response.data;
  },

  updateBatch: async (id, name, capacity) => {
    const response = await axios.put(`${API_URL}/instructor/batches/${id}`, { name, capacity }, getAuthHeaders());
    return response.data;
  },

  deleteBatch: async (id) => {
    const response = await axios.delete(`${API_URL}/instructor/batches/${id}`, getAuthHeaders());
    return response.data;
  },

  updateBatchStudents: async (id, action, studentId) => {
    // action: 'add' or 'remove'
    const response = await axios.patch(`${API_URL}/instructor/batches/${id}/students`, { action, studentId }, getAuthHeaders());
    return response.data;
  },

  moveStudentBatch: async (studentId, fromBatchId, toBatchId) => {
    const response = await axios.patch(`${API_URL}/instructor/batches/move-student`, { studentId, fromBatchId, toBatchId }, getAuthHeaders());
    return response.data;
  },

  // Notifications
  sendNotification: async (data) => {
    // data: { message, type, recipient }
    const response = await axios.post(`${API_URL}/instructor/notifications`, data, getAuthHeaders());
    return response.data;
  }
};

export default instructorService;
