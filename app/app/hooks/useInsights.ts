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

export function useInsights(initialType?: string) {
  const [data, setData] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<string | undefined>(initialType);

  const fetchInsights = useCallback(async (t?: string) => {
    setLoading(true);
    setError(null);
    try {
      const q = t ?? type;
      const url = q ? `/insights?type=${encodeURIComponent(q)}` : '/insights';
      const res = await api.get(url);
      setData(res.data?.data ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  }, [type]);

  const createInsight = useCallback(async (insight: Omit<Insight, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/insights', insight);
      return res.data?.data as Insight;
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create insight');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // initial fetch
    fetchInsights().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  return { data, loading, error, type, setType, fetchInsights, createInsight };
}
