import { createContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      try {
        // Parse the stored user data
        const userData = JSON.parse(storedUser);
        setUser(userData);

        // Create a demo user if needed
        if (!userData) {
          const demoUser = {
            id: '1',
            name: 'Demo User',
            email: 'demo@example.com',
            preferences: {
              currency: 'USD',
              language: 'en',
              theme: 'system'
            }
          };

          localStorage.setItem('user', JSON.stringify(demoUser));
          setUser(demoUser);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        // If there's an error parsing the user data, create a demo user
        const demoUser = {
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com',
          preferences: {
            currency: 'USD',
            language: 'en',
            theme: 'system'
          }
        };

        localStorage.setItem('user', JSON.stringify(demoUser));
        setUser(demoUser);
      }
    } else {
      // If no user is stored, create a demo user and log in automatically
      const demoUser = {
        id: '1',
        name: 'Demo User',
        email: 'demo@example.com',
        preferences: {
          currency: 'USD',
          language: 'en',
          theme: 'system'
        }
      };

      localStorage.setItem('token', `mock-jwt-token-${Date.now()}`);
      localStorage.setItem('user', JSON.stringify(demoUser));
      setUser(demoUser);
    }

    // Always set loading to false when done
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);

      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      return user;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      console.log('Attempting login with:', credentials);
      // For demo purposes, hardcode successful login
      console.log('Bypassing API call and using hardcoded login');

      // Create a demo user
      const demoUser = {
        id: '1',
        name: 'Demo User',
        email: credentials.email || 'demo@example.com',
        preferences: {
          currency: 'USD',
          language: 'en',
          theme: 'system'
        }
      };

      // Store user in localStorage
      localStorage.setItem('token', `mock-jwt-token-${Date.now()}`);
      localStorage.setItem('user', JSON.stringify(demoUser));

      // Update state
      setUser(demoUser);

      // Return the user
      return demoUser;
    } catch (err) {
      console.error('Login error in AuthContext:', err);
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const verifyTwoFactor = async (userId, token) => {
    try {
      setError(null);
      const response = await authAPI.verifyTwoFactor({ userId, token });

      const { token: authToken, user } = response.data;

      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      return user;
    } catch (err) {
      setError(err.response?.data?.error || 'Two-factor authentication failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await userAPI.updateProfile(profileData);

      const updatedUser = response.data.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.response?.data?.error || 'Profile update failed');
      throw err;
    }
  };

  const updatePassword = async (passwordData) => {
    try {
      setError(null);
      const response = await authAPI.updatePassword(passwordData);

      // Update token
      localStorage.setItem('token', response.data.token);

      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Password update failed');
      throw err;
    }
  };

  const enableTwoFactor = async () => {
    try {
      setError(null);
      const response = await authAPI.enableTwoFactor();
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to enable two-factor authentication');
      throw err;
    }
  };

  const verifyTwoFactorSetup = async (token) => {
    try {
      setError(null);
      await authAPI.verifyTwoFactorSetup(token);

      // Update user with 2FA enabled
      const response = await authAPI.getMe();
      const updatedUser = response.data.data;

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify two-factor authentication');
      throw err;
    }
  };

  const disableTwoFactor = async (password) => {
    try {
      setError(null);
      await authAPI.disableTwoFactor(password);

      // Update user with 2FA disabled
      const response = await authAPI.getMe();
      const updatedUser = response.data.data;

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to disable two-factor authentication');
      throw err;
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      await authAPI.forgotPassword(email);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send password reset email');
      throw err;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setError(null);
      await authAPI.resetPassword(token, password);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
      throw err;
    }
  };

  const deleteAccount = async (password) => {
    try {
      setError(null);
      await userAPI.deleteAccount(password);

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);

      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete account');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      register,
      login,
      verifyTwoFactor,
      logout,
      updateProfile,
      updatePassword,
      enableTwoFactor,
      verifyTwoFactorSetup,
      disableTwoFactor,
      forgotPassword,
      resetPassword,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}
