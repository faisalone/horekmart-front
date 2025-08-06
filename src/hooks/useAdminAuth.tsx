'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AdminUser, LoginCredentials, UserCheckResult, AuthMethodSelection, OtpResult } from '@/types/admin';
import { adminApi } from '@/lib/admin-api';

interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithOtp: (identifier: string, type: 'email' | 'phone', otpCode: string, name?: string) => Promise<void>;
  loginWithPassword: (identifier: string, type: 'email' | 'phone', password: string) => Promise<void>;
  lookup: (identifier: string) => Promise<UserCheckResult>;
  loginWithPasswordNew: (identifier: string, type: 'email' | 'phone', password: string) => Promise<void>;
  loginWithOtpNew: (identifier: string, type: 'email' | 'phone', otp: string) => Promise<void>;
  resendOtp: (identifier: string, type: 'email' | 'phone') => Promise<OtpResult>;
  forgotPassword: (identifier: string) => Promise<{ type: string; identifier: string; expires_at?: string }>;
  resetPassword: (identifier: string, type: 'email' | 'phone', otp: string, password: string, passwordConfirmation: string) => Promise<void>;
  register: (name: string, identifier: string, password: string) => Promise<{ type: string; identifier: string; expires_at?: string }>;
  verifyRegistration: (identifier: string, type: 'email' | 'phone', otp: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  checkIdentifier: (identifier: string) => Promise<UserCheckResult>;
  sendOtp: (identifier: string, type: 'email' | 'phone') => Promise<void>;
  setPassword: (password: string, confirmPassword: string) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user && !!adminApi.getToken();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = adminApi.getToken();
      if (token) {
        const profile = await adminApi.getProfile();
        setUser(profile);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      adminApi.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const tokens = await adminApi.login(credentials);
      const profile = await adminApi.getProfile();
      setUser(profile);
      router.push('/admin');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithOtp = async (identifier: string, type: 'email' | 'phone', otpCode: string, name?: string) => {
    try {
      setLoading(true);
      const tokens = await adminApi.verifyOtpAndLogin(identifier, type, otpCode, name);
      const profile = await adminApi.getProfile();
      setUser(profile);
      
      // Don't redirect if password setup is required
      if (!tokens.requires_password_setup) {
        router.push('/admin');
      }
    } catch (error) {
      console.error('OTP login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithPassword = async (identifier: string, type: 'email' | 'phone', password: string) => {
    try {
      setLoading(true);
      const tokens = await adminApi.loginWithPassword(identifier, type, password);
      const profile = await adminApi.getProfile();
      setUser(profile);
      router.push('/admin');
    } catch (error) {
      console.error('Password login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // New improved methods
  const lookup = async (identifier: string): Promise<UserCheckResult> => {
    return await adminApi.lookup(identifier);
  };

  const loginWithPasswordNew = async (identifier: string, type: 'email' | 'phone', password: string) => {
    try {
      setLoading(true);
      const tokens = await adminApi.loginWithPasswordNew(identifier, type, password);
      const profile = await adminApi.getProfile();
      setUser(profile);
      router.push('/admin');
    } catch (error) {
      console.error('Password login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithOtpNew = async (identifier: string, type: 'email' | 'phone', otp: string) => {
    try {
      setLoading(true);
      const tokens = await adminApi.loginWithOtpNew(identifier, type, otp);
      const profile = await adminApi.getProfile();
      setUser(profile);
      router.push('/admin');
    } catch (error) {
      console.error('OTP login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (identifier: string, type: 'email' | 'phone') => {
    return await adminApi.resendOtp(identifier, type);
  };

  const forgotPassword = async (identifier: string) => {
    return await adminApi.forgotPassword(identifier);
  };

  const resetPassword = async (identifier: string, type: 'email' | 'phone', otp: string, password: string, passwordConfirmation: string) => {
    await adminApi.resetPassword(identifier, type, otp, password, passwordConfirmation);
  };

  const register = async (name: string, identifier: string, password: string) => {
    return await adminApi.register(name, identifier, password);
  };

  const verifyRegistration = async (identifier: string, type: 'email' | 'phone', otp: string) => {
    try {
      setLoading(true);
      const tokens = await adminApi.verifyRegistration(identifier, type, otp);
      const profile = await adminApi.getProfile();
      setUser(profile);
      router.push('/admin');
    } catch (error) {
      console.error('Registration verification failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkIdentifier = async (identifier: string): Promise<UserCheckResult> => {
    return await adminApi.checkIdentifier(identifier);
  };

  const sendOtp = async (identifier: string, type: 'email' | 'phone') => {
    await adminApi.sendOtp(identifier, type);
  };

  const setPassword = async (password: string, confirmPassword: string) => {
    await adminApi.setPassword(password, confirmPassword);
    // Refresh user profile to get updated has_password status
    const profile = await adminApi.getProfile();
    setUser(profile);
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithOtp,
        loginWithPassword,
        lookup,
        loginWithPasswordNew,
        loginWithOtpNew,
        resendOtp,
        forgotPassword,
        resetPassword,
        register,
        verifyRegistration,
        logout,
        isAuthenticated,
        checkIdentifier,
        sendOtp,
        setPassword,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
