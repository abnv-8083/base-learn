import { create } from 'zustand';
import axios from 'axios';

// Configure Axios defaults
axios.defaults.withCredentials = true;
// Hardcode the remote gateway to bypass Docker build-time env limitations
axios.defaults.baseURL = process.env.NODE_ENV === 'development' 
    ? (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || 'http://localhost:5000')
    : 'https://api.baselearn.in';

const getTokenKey = (role) => `bl_token_${role || 'student'}`;

// Create an interceptor to insert Bearer Token
axios.interceptors.request.use(config => {
  let token = useAuthStore.getState().token;
  
  // Fallback to storage for rehydration resilience
  if (!token && typeof window !== 'undefined') {
    const role = localStorage.getItem('last_active_role') || 'student';
    token = sessionStorage.getItem(`bl_token_${role}`);
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: true,

  // Simple setters
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (loading) => set({ loading }),

  // Actions
  login: async (email, password, role) => {
    try {
      set({ loading: true });
      const res = await axios.post('/api/auth/login', { email, password, role });
      const userData = res.data;
      const assignedRole = userData.role || role;
      
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(getTokenKey(assignedRole), userData.token);
        localStorage.setItem('last_active_role', assignedRole);
      }
      
      set({ token: userData.token, user: userData, loading: false });
      return userData;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: async (role) => {
    try {
      await axios.post('/api/auth/logout', { role });
    } catch (err) {
      console.error('Server logout failed:', err.message);
    } finally {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(getTokenKey(role));
      }
      set({ user: null, token: null });
    }
  },

  syncPortalSession: (role) => {
    if (typeof window !== 'undefined') {
      const roleToken = sessionStorage.getItem(getTokenKey(role));
      const currentToken = get().token;
      
      if (roleToken !== currentToken) {
        set({ token: roleToken });
        if (!roleToken) set({ user: null });
      }
    }
  },

  loadUser: async (role) => {
    const roleToken = typeof window !== 'undefined' ? sessionStorage.getItem(getTokenKey(role)) : null;
    if (!roleToken) {
      set({ user: null, loading: false });
      return;
    }

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('last_active_role', role);
      }
      const res = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${roleToken}` }
      });
      if (res.data.role === role) {
        set({ user: res.data, token: roleToken });
      } else {
        set({ user: null, token: null });
      }
    } catch (error) {
      console.warn('Silent user load failed:', error.message);
      set({ user: null, token: null });
    } finally {
      set({ loading: false });
    }
  }
}));
