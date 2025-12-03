import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  scheduled_time?: string | null; // sometimes used by backend
  created_at?: string | null;
}

export interface NotificationStats {
  completed: number;
  upcoming: number; // aka scheduled
  missed: number;
}

const STORAGE_KEYS = {
  PUSH_TOKEN: 'push_token',
  PERMISSION_SWITCH: 'permission_switch',
} as const;

export default function NotificationNew() {
  const params = useLocalSearchParams();
  const token = (params?.token as string) || undefined;
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [stats, setStats] = useState<NotificationStats>({ completed: 0, upcoming: 0, missed: 0 });
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [permissionSwitch, setPermissionSwitch] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Helpers
  const getStatusColor = useCallback((status: NotificationStatus) => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'missed':
        return '#ef4444';
      case 'snoozed':
        return '#f59e0b';
      case 'delivered':
        return '#10b981';
      default:
        return '#3b82f6';
    }
  }, []);

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

  const formatTime = (iso?: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString();
  };

  // API adapters to accept array or {data: array}
  const normalizeList = useCallback((payload: any): NotificationItem[] => {
    const arr = Array.isArray(payload) ? payload : payload?.data;
    if (!Array.isArray(arr)) return [];
    // Deduplicate by id
    const seen = new Set<string | number>();
    const unique: NotificationItem[] = [];
    for (const raw of arr) {
      const id = raw?.id ?? `${raw?.type}-${raw?.scheduled_at || raw?.scheduled_time || raw?.created_at || Math.random()}`;
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

  const normalizeStats = useCallback((payload: any): NotificationStats => {
    const s = payload?.data ?? payload ?? {};
    const upcoming = Number(s?.upcoming ?? s?.scheduled ?? 0) || 0;
    return {
      completed: Number(s?.completed ?? 0) || 0,
      upcoming,
      missed: Number(s?.missed ?? 0) || 0,
    };
  }, []);

  const loadPermissions = useCallback(async () => {
    try {
      const storedSwitch = await AsyncStorage.getItem(STORAGE_KEYS.PERMISSION_SWITCH);
      if (storedSwitch !== null) setPermissionSwitch(storedSwitch === 'true');
      const settings = await Notifications.getPermissionsAsync();
      const granted = settings.status === 'granted' || (settings as any).granted;
      setPermissionGranted(granted);
      if (storedSwitch === null) setPermissionSwitch(granted);
    } catch (_) {}
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications', token);
      const list = normalizeList(res);
      setNotifications(list);
    } catch (_) {
      setNotifications([]);
    }
  }, [normalizeList, token]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/notifications/stats', token);
      setStats(normalizeStats(res));
    } catch (_) {
      setStats({ completed: 0, upcoming: 0, missed: 0 });
    }
  }, [normalizeStats, token]);

  const initialLoad = useCallback(async () => {
    setLoading(true);
    await loadPermissions();
    await Promise.all([fetchNotifications(), fetchStats()]);
    setLoading(false);
  }, [fetchNotifications, fetchStats, loadPermissions]);

  useEffect(() => {
    initialLoad();
  }, [initialLoad]);

  // Permission toggle handling
  const registerForPushNotifications = useCallback(async () => {
    try {
      const isExpoGo = Constants.appOwnership === 'expo' || (Constants as any).executionEnvironment === 'storeClient';
      if (isExpoGo) {
        setPermissionGranted(true);
        await AsyncStorage.setItem(STORAGE_KEYS.PERMISSION_SWITCH, 'true');
        await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, '');
        console.log('expo-notifications: Skipping remote token registration in Expo Go (SDK 53).');
        return;
      }
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      setPermissionGranted(granted);
      await AsyncStorage.setItem(STORAGE_KEYS.PERMISSION_SWITCH, granted ? 'true' : 'false');
      if (!granted) return;
      const tokenData = await Notifications.getExpoPushTokenAsync();
      await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, tokenData.data);
    } catch (_) {}
  }, []);

  const onTogglePermission = useCallback(async (value: boolean) => {
    setPermissionSwitch(value);
    await AsyncStorage.setItem(STORAGE_KEYS.PERMISSION_SWITCH, value ? 'true' : 'false');
    if (value && !permissionGranted) {
      await registerForPushNotifications();
    }
  }, [permissionGranted, registerForPushNotifications]);

  // Actions
  const scheduleHydrationReminder = useCallback(async () => {
    try {
      await api.post('/notifications/schedule/hydration', { minutesFromNow: 30 }, token);
      await fetchNotifications();
      await fetchStats();
    } catch (_) {
      Alert.alert('Unable to schedule', 'Please try again later.');
    }
  }, [fetchNotifications, fetchStats, token]);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.post('/notifications/mark-all-read', {}, token);
    } catch (_) {
      // If endpoint not available, fall back client-side
    }
    setNotifications(prev => prev.map(n => ({ ...n, status: n.status === 'scheduled' || n.status === 'delivered' || n.status === 'upcoming' ? 'completed' : n.status })));
    await fetchStats();
  }, [fetchStats, token]);

  const clearAllNotifications = useCallback(async () => {
    try {
      await api.del('/notifications/clear-old', token);
    } catch (_) {}
    setNotifications([]);
    await fetchStats();
  }, [fetchStats, token]);

  const completeNotification = useCallback(async (id: number | string) => {
    try {
      await api.put(`/notifications/${id}/complete`, {}, token);
    } catch (_) {}
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, status: 'completed' } : n)));
    await fetchStats();
  }, [fetchStats, token]);

  const snoozeNotification = useCallback(async (id: number | string) => {
    try {
      await api.put(`/notifications/${id}/snooze`, { minutes: 10 }, token);
    } catch (_) {}
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, status: 'snoozed' } : n)));
    await fetchStats();
  }, [fetchStats, token]);

  const deleteNotification = useCallback(async (id: number | string) => {
    try {
      await api.del(`/notifications/${id}`, token);
    } catch (_) {}
    setNotifications(prev => prev.filter(n => n.id !== id));
    await fetchStats();
  }, [fetchStats, token]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchNotifications(), fetchStats()]);
    setRefreshing(false);
  }, [fetchNotifications, fetchStats]);

  const statsList = useMemo(() => ([
    { key: 'completed', label: 'Completed', value: stats.completed, color: '#22c55e', icon: 'checkmark-done-outline' as const },
    { key: 'upcoming', label: 'Upcoming', value: stats.upcoming, color: '#3b82f6', icon: 'time-outline' as const },
    { key: 'missed', label: 'Missed', value: stats.missed, color: '#ef4444', icon: 'alert-circle-outline' as const },
  ]), [stats]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: (insets.top || 12) } ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>Stay on top of your routine</Text>
        </View>

        {/* Permission card + toggle */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Ionicons name="notifications-outline" size={22} color="#2563eb" />
            <Text style={styles.cardTitle}>Push Notifications</Text>
            <View style={{ flex: 1 }} />
            <Switch value={permissionSwitch} onValueChange={onTogglePermission} />
          </View>
          <Text style={styles.cardText}>
            {permissionGranted ? 'Enabled on device' : 'Enable to receive reminders'}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Summary</Text>
        </View>
        <View style={styles.statsRow}>
          {statsList.map(s => (
            <View key={s.key} style={[styles.statBox, { borderColor: s.color }]}> 
              <Ionicons name={s.icon} size={18} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value ?? 0}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions: Schedule Hydration, Mark All as Read, Clear */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={scheduleHydrationReminder}>
            <Ionicons name="water-outline" size={18} color="#2563eb" />
            <Text style={styles.actionText}>Schedule Hydration</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={markAllAsRead}>
            <Ionicons name="checkmark-done-outline" size={18} color="#16a34a" />
            <Text style={styles.actionText}>Mark All as Read</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={clearAllNotifications}>
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
            <Text style={styles.actionText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent</Text>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="notifications-off-outline" size={40} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyText}>You’re all caught up for now.</Text>
          </View>
        ) : (
          <View>
            {notifications.map((n) => (
              <View key={n.id} style={styles.listItem}>
                <View style={styles.listIconWrap}>
                  <Ionicons name={getNotificationIcon(n.type)} size={20} color="#2563eb" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.itemHeaderRow}>
                    <Text style={styles.itemTitle}>{n.title}</Text>
                    <View style={[styles.statusPill, { backgroundColor: getStatusColor(n.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(n.status)}</Text>
                    </View>
                  </View>
                  {!!(n.message || n.body) && <Text style={styles.itemMessage}>{n.message || n.body}</Text>}
                  <Text style={styles.itemMeta}>
                    {n.scheduled_at || n.scheduled_time
                      ? `${formatDate(n.scheduled_at || n.scheduled_time)} • ${formatTime(n.scheduled_at || n.scheduled_time)}`
                      : n.created_at
                        ? `${formatDate(n.created_at)} • ${formatTime(n.created_at)}`
                        : ''}
                  </Text>
                  <View style={styles.itemActionsRow}>
                    <TouchableOpacity style={styles.itemActionBtn} onPress={() => completeNotification(n.id)}>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#16a34a" />
                      <Text style={styles.itemActionText}>Complete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.itemActionBtn} onPress={() => snoozeNotification(n.id)}>
                      <Ionicons name="time-outline" size={18} color="#f59e0b" />
                      <Text style={styles.itemActionText}>Snooze</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.itemActionBtn} onPress={() => deleteNotification(n.id)}>
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
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
    backgroundColor: '#0B1220',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#94a3b8',
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#111827',
    borderColor: '#1f2937',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
  cardText: {
    color: '#94a3b8',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
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
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1f2937',
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
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    paddingRight: 8,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    color: '#0b1220',
    fontSize: 12,
    fontWeight: '700',
  },
  itemMessage: {
    color: '#cbd5e1',
    marginTop: 2,
  },
  itemMeta: {
    color: '#94a3b8',
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
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 8,
  },
  itemActionText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyBox: {
    alignItems: 'center',
    gap: 8,
    padding: 24,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
  },
  emptyTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  emptyText: {
    color: '#94a3b8',
  },
});
