'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from './api';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const token = localStorage.getItem('token');
      if (!token) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const response = await authAPI.getCurrentUser();
        if (mounted) setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem('token');
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    router.push('/dashboard');
  };

  const register = async (email, password, firstName, lastName) => {
    const response = await authAPI.register(email, password, firstName, lastName);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return { user, loading, login, register, logout };
}
