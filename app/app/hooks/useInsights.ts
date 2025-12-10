import { useEffect, useState, useCallback } from 'react';
import api from '../api';

export type Insight = {
  id: number;
  type: string; // hydration | medication | sleep | weather | general
  payload: any;
  title: string;
  description?: string;
  generated_at: string;
};

export function useInsights(initialType?: string, token?: string) {
  const [data, setData] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<string | undefined>(initialType);

  const fetchInsights = useCallback(async (t?: string) => {
    if (!token) {
      setError('Authentication required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const q = t ?? type;
      const url = q ? `/insights?type=${encodeURIComponent(q)}` : '/insights';
      const res = await api.get(url, token, 5000);
      setData(res?.data ?? res ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch insights');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [type, token]);

  const createInsight = useCallback(async (insight: Omit<Insight, 'id'>) => {
    if (!token) {
      const err = new Error('Authentication required');
      setError('Authentication required');
      throw err;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/insights', insight, token);
      return res?.data ?? res as Insight;
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create insight');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // initial fetch
    if (token) {
      fetchInsights().catch(() => {});
    }
  }, [type, token, fetchInsights]);

  return { data, loading, error, type, setType, fetchInsights, createInsight };
}
