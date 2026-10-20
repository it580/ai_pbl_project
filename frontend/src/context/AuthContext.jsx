import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, studentsApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('careermatch_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [studentProfile, setStudentProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('careermatch_token'));
  const [loading, setLoading] = useState(true);

  // Load user data on startup if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('careermatch_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res.data.success) {
            setUser(res.data.user);
            setStudentProfile(res.data.student_profile);
            localStorage.setItem('careermatch_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error("Auth validation failed:", err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data.success) {
      const { access_token, user: userData } = res.data;
      localStorage.setItem('careermatch_token', access_token);
      localStorage.setItem('careermatch_user', JSON.stringify(userData));
      setToken(access_token);
      setUser(userData);

      // Fetch profile if student
      if (userData.role === 'student') {
        try {
          const meRes = await authApi.getMe();
          setStudentProfile(meRes.data.student_profile);
        } catch (e) {
          console.error(e);
        }
      }
      return userData;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.data.success) {
      const { access_token, user: registeredUser } = res.data;
      localStorage.setItem('careermatch_token', access_token);
      localStorage.setItem('careermatch_user', JSON.stringify(registeredUser));
      setToken(access_token);
      setUser(registeredUser);

      // Fetch profile
      try {
        const meRes = await authApi.getMe();
        setStudentProfile(meRes.data.student_profile);
      } catch (e) {
        console.error(e);
      }
      return registeredUser;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('careermatch_token');
    localStorage.removeItem('careermatch_user');
    setToken(null);
    setUser(null);
    setStudentProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await studentsApi.getMyProfile();
      if (res.data.success) {
        setStudentProfile(res.data.profile);
      }
    } catch (err) {
      console.error("Failed to refresh student profile:", err);
    }
  };

  const value = {
    user,
    studentProfile,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
