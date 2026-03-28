import axios from 'axios';

const API_URL = '/api';

const studentService = {
  getDashboard: async () => {
    const response = await axios.get(`${API_URL}/student/dashboard`);
    return response.data;
  },
  getRecordedClasses: async () => {
    const response = await axios.get(`${API_URL}/student/recorded-classes`);
    return response.data;
  },
  getLiveClasses: async () => {
    const response = await axios.get(`${API_URL}/student/live-classes`);
    return response.data;
  },
  getAssignments: async () => {
    const response = await axios.get(`${API_URL}/student/assignments`);
    return response.data;
  },
  getTests: async () => {
    const response = await axios.get(`${API_URL}/student/tests`);
    return response.data;
  },
  getMainAssessments: async () => {
    const response = await axios.get(`${API_URL}/student/main-assessments`);
    return response.data;
  },
  getLiveFaqSessions: async () => {
    const response = await axios.get(`${API_URL}/student/faq/live-sessions`);
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await axios.put(`${API_URL}/student/profile`, profileData);
    // Map native model returns to success wrappers on frontend to standardize
    return { success: true, data: response.data };
  },
  mockPayment: async () => {
    const response = await axios.post(`${API_URL}/student/pay`);
    return response.data;
  }
};

export default studentService;
