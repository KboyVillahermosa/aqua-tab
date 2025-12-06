/**
 * Activity Tab (formerly Notifications)
 * ====================================
 * Displays notification history and activity feed
 * Shows: Completed, Upcoming, Missed notifications
 * Actions: Complete, Snooze, Delete
 * 
 * Note: All notification SETTINGS are now in Profile > Notifications Settings
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';

import BottomNavigation from '../../navigation/BottomNavigation';
import api from '../../../api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Types
export type NotificationStatus = 'upcoming' | 'completed' | 'missed' | 'snoozed' | 'delivered' | 'scheduled';
export type NotificationType = 'hydration' | 'medication' | 'general';

export interface NotificationItem {
  id: number | string;
  title: string;
  message?: string;
  body?: string;
  type: NotificationType;
  status: NotificationStatus;
  scheduled_at?: string | null;
  scheduled_time?: string | null;
  created_at?: string | null;
}

export interface NotificationStats {
  completed: number;
  upcoming: number;
  missed: number;
}

export default function Activity() {
  const params = useLocalSearchParams();
  const token = (params?.token as string) || undefined;
  const insets = useSafeAreaInsets();

  // State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [stats, setStats] = useState<NotificationStats>({ completed: 0, upcoming: 0, missed: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Helper: Get status color
  const getStatusColor = useCallback((status: NotificationStatus) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'missed':
        return '#EF4444';
      case 'snoozed':
        return '#F59E0B';
      case 'delivered':
        return '#3B82F6';
      default:
        return '#3B82F6';
    }
  }, []);

  // Helper: Get status background color
  const getStatusBg = useCallback(
    (status: NotificationStatus) => `${getStatusColor(status)}20`,
    [getStatusColor]
  );

  // Helper: Get status text
  const getStatusText = useCallback((status: NotificationStatus) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'missed':
        return 'Missed';
      case 'snoozed':
        return 'Snoozed';
      case 'delivered':
        return 'Delivered';
      case 'scheduled':
        return 'Upcoming';
      default:
        return 'Upcoming';
    }
  }, []);

  // Helper: Get notification icon
  const getNotificationIcon = useCallback((type: NotificationType) => {
    switch (type) {
      case 'hydration':
        return 'water-outline' as const;
      case 'medication':
        return 'medkit-outline' as const;
      default:
        return 'notifications-outline' as const;
    }
  }, []);

  // Helper: Format time to 12-hour format
  const formatTime = (iso?: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  // Helper: Format date
  const formatDate = (iso?: string | null) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString();
  };

  // Normalize API response to NotificationItem[]
  const normalizeList = useCallback((payload: any): NotificationItem[] => {
    const arr = Array.isArray(payload) ? payload : payload?.data;
    if (!Array.isArray(arr)) return [];

    const seen = new Set<string | number>();
    const unique: NotificationItem[] = [];

    for (const raw of arr) {
      const id =
        raw?.id ??
        `${raw?.type}-${raw?.scheduled_at || raw?.scheduled_time || raw?.created_at || Math.random()}`;
      if (seen.has(id)) continue;

      seen.add(id);
      unique.push({
        id,
        title: raw?.title ?? 'Notification',
        message: raw?.message ?? raw?.body ?? '',
        body: raw?.body,
        type: (raw?.type ?? 'general') as NotificationType,
        status: (raw?.status ?? 'scheduled') as NotificationStatus,
        scheduled_at: raw?.scheduled_at ?? null,
        scheduled_time: raw?.scheduled_time ?? null,
        created_at: raw?.created_at ?? null,
      });
    }

    return unique;
  }, []);

  // Normalize stats response
  const normalizeStats = useCallback((payload: any): NotificationStats => {
    const s = payload?.data ?? payload ?? {};
    const upcoming = Number(s?.upcoming ?? s?.scheduled ?? 0) || 0;
    return {
      completed: Number(s?.completed ?? 0) || 0,
      upcoming,
      missed: Number(s?.missed ?? 0) || 0,
    };
  }, []);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications', token);
      const list = normalizeList(res);
      setNotifications(list);
    } catch (_) {
      setNotifications([]);
    }
  }, [normalizeList, token]);

  // Fetch stats from API
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/notifications/stats', token);
      setStats(normalizeStats(res));
    } catch (_) {
      setStats({ completed: 0, upcoming: 0, missed: 0 });
    }
  }, [normalizeStats, token]);

  // Initial load on mount
  const initialLoad = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchNotifications(), fetchStats()]);
    setLoading(false);
  }, [fetchNotifications, fetchStats]);

  useEffect(() => {
    initialLoad();
  }, [initialLoad]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.post('/notifications/mark-all-read', {}, token);
    } catch (_) {
      // If endpoint not available, fall back client-side
    }
    setNotifications(prev =>
      prev.map(n => ({
        ...n,
        status:
          n.status === 'scheduled' || n.status === 'delivered' || n.status === 'upcoming'
            ? 'completed'
            : n.status,
      }))
    );
    await fetchStats();
  }, [fetchStats, token]);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      await api.post('/notifications/clear', {}, token);
    } catch (_) {}
    setNotifications([]);
    await fetchStats();
  }, [fetchStats, token]);

  // Complete a notification
  const completeNotification = useCallback(
    async (id: number | string) => {
      try {
        await api.put(`/notifications/${id}/complete`, {}, token);
      } catch (_) {}
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, status: 'completed' } : n))
      );
      await fetchStats();
    },
    [fetchStats, token]
  );

  // Snooze a notification
  const snoozeNotification = useCallback(
    async (id: number | string) => {
      try {
        await api.put(`/notifications/${id}/snooze`, { minutes: 10 }, token);
      } catch (_) {}
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, status: 'snoozed' } : n))
      );
      await fetchStats();
    },
    [fetchStats, token]
  );

  // Delete a notification
  const deleteNotification = useCallback(
    async (id: number | string) => {
      try {
        await api.del(`/notifications/${id}`, token);
      } catch (_) {}
      setNotifications(prev => prev.filter(n => n.id !== id));
      await fetchStats();
    },
    [fetchStats, token]
  );

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchNotifications(), fetchStats()]);
    setRefreshing(false);
  }, [fetchNotifications, fetchStats]);

  // Memoized stats list
  const statsList = useMemo(
    () => [
      {
        key: 'completed',
        label: 'Completed',
        value: stats.completed,
        color: '#22c55e',
        icon: 'checkmark-done-outline' as const,
      },
      {
        key: 'upcoming',
        label: 'Upcoming',
        value: stats.upcoming,
        color: '#3b82f6',
        icon: 'time-outline' as const,
      },
      {
        key: 'missed',
        label: 'Missed',
        value: stats.missed,
        color: '#ef4444',
        icon: 'alert-circle-outline' as const,
      },
    ],
    [stats]
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top || 12 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Activity</Text>
          <Text style={styles.subtitle}>View your notification history</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          {statsList.map(s => (
            <View
              key={s.key}
              style={[styles.statBox, { borderColor: '#E5E7EB' }]}
            >
              <Ionicons name={s.icon} size={18} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value ?? 0}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={markAllAsRead}>
            <Ionicons name="checkmark-done" size={18} color="#10B981" />
            <Text style={styles.actionText}>Mark All Read</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={clearAllNotifications}>
            <Ionicons name="trash" size={18} color="#EF4444" />
            <Text style={styles.actionText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} size="large" color="#1E3A8A" />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="notifications-off-outline" size={40} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No Activity Yet</Text>
            <Text style={styles.emptyText}>Your notification history will appear here.</Text>
          </View>
        ) : (
          <View>
            {notifications.map(n => (
              <View key={n.id} style={styles.listItem}>
                <View style={styles.listIconWrap}>
                  <Ionicons
                    name={getNotificationIcon(n.type)}
                    size={20}
                    color="#1E3A8A"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.itemHeaderRow}>
                    <Text style={styles.itemTitle}>{n.title}</Text>
                    <View
                      style={[
                        styles.statusPill,
                        { backgroundColor: getStatusBg(n.status) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(n.status) },
                        ]}
                      >
                        {getStatusText(n.status)}
                      </Text>
                    </View>
                  </View>
                  {!!(n.message || n.body) && (
                    <Text style={styles.itemMessage}>{n.message || n.body}</Text>
                  )}
                  <Text style={styles.itemMeta}>
                    {n.scheduled_at || n.scheduled_time
                      ? `${formatDate(n.scheduled_at || n.scheduled_time)} • ${formatTime(n.scheduled_at || n.scheduled_time)}`
                      : n.created_at
                        ? `${formatDate(n.created_at)} • ${formatTime(n.created_at)}`
                        : ''}
                  </Text>
                  <View style={styles.itemActionsRow}>
                    <TouchableOpacity
                      style={styles.itemActionBtn}
                      onPress={() => completeNotification(n.id)}
                    >
                      <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                      <Text style={styles.itemActionText}>Complete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.itemActionBtn}
                      onPress={() => snoozeNotification(n.id)}
                    >
                      <Ionicons name="time" size={18} color="#F59E0B" />
                      <Text style={styles.itemActionText}>Snooze</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.itemActionBtn}
                      onPress={() => deleteNotification(n.id)}
                    >
                      <Ionicons name="trash" size={18} color="#EF4444" />
                      <Text style={styles.itemActionText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <BottomNavigation currentRoute="notification" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    color: '#1F2937',
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: '#6B7280',
    marginTop: 4,
  },
  sectionHeaderRow: {
    marginTop: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionText: {
    color: '#1F2937',
    fontWeight: '700',
    fontSize: 15,
  },
  listItem: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  listIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF8FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    paddingRight: 8,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemMessage: {
    color: '#4B5563',
    marginTop: 2,
  },
  itemMeta: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  itemActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  itemActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  itemActionText: {
    color: '#1F2937',
    fontWeight: '600',
  },
  emptyBox: {
    alignItems: 'center',
    gap: 8,
    padding: 24,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  emptyTitle: {
    color: '#1F2937',
    fontWeight: '800',
    fontSize: 18,
  },
  emptyText: {
    color: '#6B7280',
  },
});
