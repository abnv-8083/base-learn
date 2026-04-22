import { create } from 'zustand';
import axios from 'axios';

// Configure Axios defaults
axios.defaults.withCredentials = true;
// Hardcode the remote gateway to bypass Docker build-time env limitations
axios.defaults.baseURL = process.env.NODE_ENV === 'development' 
    ? (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || 'http://localhost:5000')
    : 'https://api.baselearn.in';

const getTokenKey = (role) => `bl_token_${role || 'student'}`;

// ── Storage helpers: use localStorage so sessions survive browser restarts ──
const saveToken = (role, token) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getTokenKey(role), token);
  localStorage.setItem('last_active_role', role);
  // Also clean up old sessionStorage entries (migration)
  sessionStorage.removeItem(getTokenKey(role));
};

const loadToken = (role) => {
  if (typeof window === 'undefined') return null;
  // Try localStorage first (new), fallback to sessionStorage (old)
  return localStorage.getItem(getTokenKey(role)) || sessionStorage.getItem(getTokenKey(role));
};

const clearToken = (role) => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getTokenKey(role));
  sessionStorage.removeItem(getTokenKey(role));
};

const clearAllTokens = () => {
  if (typeof window === 'undefined') return;
  // Wipe tokens for all known roles
  ['student', 'faculty', 'instructor', 'admin'].forEach(r => {
    localStorage.removeItem(getTokenKey(r));
    sessionStorage.removeItem(getTokenKey(r));
  });
  localStorage.removeItem('last_active_role');
};

// Create an interceptor to insert Bearer Token
axios.interceptors.request.use(config => {
  let token = useAuthStore.getState().token;
  
  // Fallback to storage for rehydration resilience (survives hot reload & SSR)
  if (!token && typeof window !== 'undefined') {
    const role = localStorage.getItem('last_active_role') || 'student';
    token = loadToken(role);
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
      
      // Persist to localStorage so session survives browser restart
      saveToken(assignedRole, userData.token);
      
      set({ token: userData.token, user: userData, loading: false });
      return userData;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: async (role) => {
    // 1. Clear client state IMMEDIATELY — synchronous and reliable
    clearAllTokens();
    // 2. Strip the Authorization header from axios so no future request leaks the old token
    delete axios.defaults.headers.common['Authorization'];
    // 3. Wipe Zustand state right away so UI reflects logged-out state
    set({ user: null, token: null });

    // 4. Best-effort server-side session invalidation (fire-and-forget)
    try {
      await axios.post('/api/auth/logout', { role });
    } catch (err) {
      // Silent — client is already fully cleared regardless
    }
  },

  syncPortalSession: (role) => {
    if (typeof window !== 'undefined') {
      const roleToken = loadToken(role);
      const currentToken = get().token;
      
      if (roleToken !== currentToken) {
        set({ token: roleToken });
        if (!roleToken) set({ user: null });
      }
    }
  },

  loadUser: async (role) => {
    const roleToken = typeof window !== 'undefined' ? loadToken(role) : null;
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
        // Token is valid but for a different role — clear it
        clearToken(role);
        set({ user: null, token: null });
      }
    } catch (error) {
      console.warn('Silent user load failed:', error.message);
      // If token is expired/invalid, clear it so user is prompted to log in again
      clearToken(role);
      set({ user: null, token: null });
    } finally {
      set({ loading: false });
    }
  }
}));
