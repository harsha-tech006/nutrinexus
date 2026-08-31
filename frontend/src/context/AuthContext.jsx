import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Set default auth headers for all axios requests when token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user profile on startup if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await axios.get(`${API_URL}/auth/profile`);
          if (res.data && res.data.user) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.error('Failed to load user profile on startup:', err);
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            toast.error('Your session has expired. Please log in again.');
            setToken('');
            setUser(null);
            localStorage.removeItem('token');
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data.message || 'Login failed.' };
    } catch (err) {
      console.error('Login error:', err);
      let message = 'An unexpected login error occurred.';
      if (err.code === 'ERR_NETWORK') {
        message = 'Network error: Server is unreachable. Please check your internet connection or start the backend server.';
      } else if (err.response) {
        if (err.response.status === 404) {
          message = 'User not found. Please register first.';
        } else if (err.response.status === 401) {
          message = 'Incorrect password. Please try again.';
        } else if (err.response.status === 503 || (err.response.status === 500 && err.response.data?.message?.includes('Database'))) {
          message = 'Database is disconnected or unavailable.';
        } else {
          message = err.response.data?.message || 'Invalid email or password.';
        }
      } else if (err.request) {
        message = 'Server is unavailable. Please try again later.';
      }
      return {
        success: false,
        message,
        unverified: err.response?.status === 403,
        email: email
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (firstName, lastName, email, password, confirmPassword) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { 
        firstName, 
        lastName, 
        email, 
        password, 
        confirmPassword 
      });
      return { success: true, message: res.data.message };
    } catch (err) {
      console.error('Registration error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.'
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email, otp) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
      if (res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: true, message: res.data.message || 'Verification successful.' };
    } catch (err) {
      console.error('Verification error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid OTP code.'
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyForgotPasswordOtp = async (email, otp) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
      return { success: true, message: res.data.message };
    } catch (err) {
      console.error('Verify forgot password OTP error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid OTP code.'
      };
    } finally {
      setLoading(false);
    }
  };

  const requestLoginOtp = async (email) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/otp/send-otp`, { email });
      return { success: true, message: res.data.message };
    } catch (err) {
      console.error('Request Login OTP error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to send OTP.'
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyLoginOtp = async (email, otp) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/otp/verify-otp`, { email, otp });
      if (res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: 'OTP Login verification failed.' };
    } catch (err) {
      console.error('Verify Login OTP error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid OTP code.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put(`${API_URL}/auth/profile`, profileData);
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) {
      console.error('Update profile error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update profile.'
      };
    }
  };

  const requestForgotPasswordOtp = async (email) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      return { 
        success: true, 
        message: res.data.message,
        email: res.data.email
      };
    } catch (err) {
      console.error('Forgot password request error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'User not found'
      };
    } finally {
      setLoading(false);
    }
  };

  // Reset password with OTP code (uses /auth/reset-password backend endpoint)
  const resetPassword = async (email, otp, newPassword, confirmPassword) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/reset-password`, {
        email,
        otp,
        password: newPassword,
        confirmPassword
      });
      return { success: true, message: res.data.message };
    } catch (err) {
      console.error('Reset password error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to reset password.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Mock resend OTP for registration verification flow
  const resendOtp = async (email) => {
    return { success: true, message: 'Verification code resent successfully.' };
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    verifyOtp,
    requestLoginOtp,
    verifyLoginOtp,
    logout,
    updateProfile,
    requestForgotPasswordOtp,
    verifyForgotPasswordOtp,
    resetPassword,
    resendOtp,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;