import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const getActiveRole = () => {
    const path = window.location.pathname;
    if (path.startsWith('/student') || path === '/login' || path === '/register') return 'student';
    if (path.startsWith('/instructor')) return 'instructor';
    if (path.startsWith('/faculty')) return 'faculty';
    if (path.startsWith('/admin')) return 'admin';
    return localStorage.getItem('last_active_role') || 'student';
};

export const AuthProvider = ({ children }) => {
    const activeRole = getActiveRole();
    const tokenKey = `baselearn_${activeRole}_token`;

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem(tokenKey) || null);
    const [loading, setLoading] = useState(true);

    // Setup Axios Interceptor
    useEffect(() => {
        const reqInterceptor = axios.interceptors.request.use((config) => {
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
        
        return () => {
            axios.interceptors.request.eject(reqInterceptor);
        };
    }, [token]);

    const loadUser = async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const res = await axios.get('/api/auth/me');
            setUser(res.data);
        } catch (error) {
            console.error('Failed to load user:', error.response?.data?.message || error.message);
            logout(); // Clear invalid token
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, [token]);

    const login = async (email, password, role) => {
        const res = await axios.post('/api/auth/login', { email, password, role });
        const userRole = res.data.role || role || getActiveRole();
        const roleKey = `baselearn_${userRole}_token`;
        
        localStorage.setItem(roleKey, res.data.token);
        localStorage.setItem('last_active_role', userRole);
        setToken(res.data.token);
        setUser(res.data);
        return res.data;
    };

    const registerStudent = async (data) => {
        // Now returns a 201 with message, NO token yet (OTP pending)
        const res = await axios.post('/api/auth/register', data);
        return res.data;
    };

    const verifyOTP = async (email, otp) => {
        const res = await axios.post('/api/auth/verify-otp', { email, otp });
        // Successful verification returns the user + token
        const role = res.data.role || getActiveRole();
        const roleKey = `baselearn_${role}_token`;

        localStorage.setItem(roleKey, res.data.token);
        localStorage.setItem('last_active_role', role);
        setToken(res.data.token);
        setUser(res.data);
        return res.data;
    };

    const logout = () => {
        const role = user?.role || getActiveRole();
        localStorage.removeItem(`baselearn_${role}_token`);
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, registerStudent, verifyOTP, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
