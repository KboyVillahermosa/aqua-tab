import { useCallback, useState } from 'react';
import api from '../api';

export type SnoozePayload = {
  reminderType: string; // hydration | medication | general
  reminderKey?: string;
  scheduledTime?: string; // HH:mm
  snoozedAt?: string; // ISO, defaults to now
  snoozeMinutes: number; // 1-120
};

export type SnoozeStats = {
  total: number;
  byType: Array<{ reminder_type: string; count: number }>;
};

export function useSnooze() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logSnooze = useCallback(async (payload: SnoozePayload) => {
    setLoading(true);
    setError(null);
    try {
      const body = {
        reminder_type: payload.reminderType,
        reminder_key: payload.reminderKey,
        scheduled_time: payload.scheduledTime,
        snoozed_at: payload.snoozedAt ?? new Date().toISOString(),
        snooze_minutes: payload.snoozeMinutes,
      };
      const res = await api.post('/snooze', body);
      return res.data?.data;
    } catch (e: any) {
      setError(e?.message ?? 'Failed to log snooze');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStats = useCallback(async (days = 7): Promise<SnoozeStats> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/snooze/stats?days=${days}`);
      return res.data as SnoozeStats;
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch snooze stats');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { logSnooze, getStats, loading, error };
}
