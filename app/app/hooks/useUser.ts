import { useState, useEffect } from 'react';
import api from '../api';

interface NormalizedUser {
  [key: string]: any;
}

export default function useUser(token?: string) {
  const [user, setUser] = useState<NormalizedUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      if (!token) {
        setUser(null);
        return;
      }
      const data: any = await api.get('/me', token as string);
      // Return the raw data but also add normalized/camelCase aliases
      const merged: any = {
        ...(data || {}),
        phone: data.phone || data.mobile || undefined,
        dateOfBirth: data.date_of_birth || data.dateOfBirth || undefined,
        emergencyContact: data.emergency_contact || data.emergencyContact || undefined,
      };
      setUser(merged);
    } catch (err) {
      console.warn('useUser: failed to load user', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return { user, setUser, loading, reload: load };
}
