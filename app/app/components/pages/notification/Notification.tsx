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
  Modal,
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

export default function Notification() {
  const params = useLocalSearchParams();
  const token = (params?.token as string) || undefined;
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [stats, setStats] = useState<NotificationStats>({ completed: 0, upcoming: 0, missed: 0 });
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [permissionSwitch, setPermissionSwitch] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [hydrationInterval, setHydrationInterval] = useState<number>(30);
  const [hydrationAmount, setHydrationAmount] = useState<number>(200);
  const [showHydrationPicker, setShowHydrationPicker] = useState<boolean>(false);

  // Helpers
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

  const getStatusBg = useCallback((status: NotificationStatus) => `${getStatusColor(status)}20`, [getStatusColor]);

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
      await api.post('/notifications/schedule/hydration', { interval_minutes: hydrationInterval, amount_ml: hydrationAmount }, token);
      await fetchNotifications();
      await fetchStats();
      setShowHydrationPicker(false);
      Alert.alert('Hydration scheduled', `We’ll remind you every ${hydrationInterval} minutes. Stay hydrated! 💧`);
    } catch (_) {
      Alert.alert('Unable to schedule', 'Please try again later.');
    }
  }, [fetchNotifications, fetchStats, token, hydrationInterval, hydrationAmount]);

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
      await api.post('/notifications/clear', {}, token);
      Alert.alert('Cleared', 'Your recent notifications have been removed.');
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
            <Ionicons name="notifications" size={22} color="#1E3A8A" />
            <Text style={styles.cardTitle}>Push Notifications</Text>
            <View style={{ flex: 1 }} />
            <Switch value={permissionSwitch} onValueChange={onTogglePermission} />
          </View>
          {/* Removed description text per request */}
        </View>

        {/* Ringtone (Premium) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Ringtone</Text>
        </View>
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="musical-notes" size={20} color="#1E3A8A" />
              <Text style={styles.cardTitle}>Change Ringtone</Text>
            </View>
            <View style={[styles.premiumLockBadge]}>
              <Ionicons name="lock-closed" size={14} color="#F59E0B" />
              <Text style={{ color: '#F59E0B', fontWeight: '600', marginLeft: 6, fontSize: 12 }}>Premium</Text>
            </View>
          </View>
          <Text style={styles.cardText}>Choose from app ringtones or upload your own.</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Premium Feature', 'Changing ringtone is available for Premium users.')}>
              <Ionicons name="play" size={18} color="#1E3A8A" />
              <Text style={styles.actionText}>Browse Ringtones</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Premium Feature', 'Uploading personal ringtone requires Premium.')}>
              <Ionicons name="cloud-upload" size={18} color="#1E3A8A" />
              <Text style={styles.actionText}>Upload Ringtone</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Summary</Text>
        </View>
        <View style={styles.statsRow}>
          {statsList.map(s => (
            <View key={s.key} style={[styles.statBox, { borderColor: '#E5E7EB' }]}> 
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
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowHydrationPicker(true)}>
            <Ionicons name="water" size={18} color="#1E3A8A" />
            <Text style={styles.actionText}>Schedule Hydration</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={markAllAsRead}>
            <Ionicons name="checkmark-done" size={18} color="#10B981" />
            <Text style={styles.actionText}>Mark All as Read</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={clearAllNotifications}>
            <Ionicons name="trash" size={18} color="#EF4444" />
            <Text style={styles.actionText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showHydrationPicker} transparent animationType="fade" onRequestClose={() => setShowHydrationPicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="water" size={20} color="#1E3A8A" />
                  <Text style={styles.sheetTitle}>Schedule Hydration</Text>
                </View>
                <TouchableOpacity onPress={() => setShowHydrationPicker(false)}>
                  <Ionicons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <Text style={styles.sheetSubtitle}>Select interval and amount</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {[30, 60, 120, 180].map((min) => (
                  <TouchableOpacity key={min} style={[styles.pillOption, hydrationInterval === min && styles.pillOptionActive]} onPress={() => setHydrationInterval(min)}>
                    <Text style={[styles.pillText, hydrationInterval === min && styles.pillTextActive]}>{min} min</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {[200, 300, 400].map((ml) => (
                  <TouchableOpacity key={ml} style={[styles.pillOption, hydrationAmount === ml && styles.pillOptionActive]} onPress={() => setHydrationAmount(ml)}>
                    <Text style={[styles.pillText, hydrationAmount === ml && styles.pillTextActive]}>{ml} ml</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <TouchableOpacity style={styles.actionBtn} onPress={scheduleHydrationReminder}>
                  <Ionicons name="checkmark" size={18} color="#10B981" />
                  <Text style={styles.actionText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => setShowHydrationPicker(false)}>
                  <Ionicons name="close" size={18} color="#EF4444" />
                  <Text style={styles.actionText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>


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
                  <Ionicons name={getNotificationIcon(n.type)} size={20} color="#1E3A8A" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.itemHeaderRow}>
                    <Text style={styles.itemTitle}>{n.title}</Text>
                    <View style={[styles.statusPill, { backgroundColor: getStatusBg(n.status) }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(n.status) }]}>{getStatusText(n.status)}</Text>
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
                      <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                      <Text style={styles.itemActionText}>Complete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.itemActionBtn} onPress={() => snoozeNotification(n.id)}>
                      <Ionicons name="time" size={18} color="#F59E0B" />
                      <Text style={styles.itemActionText}>Snooze</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.itemActionBtn} onPress={() => deleteNotification(n.id)}>
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
  card: {
    backgroundColor: 'white',
    borderColor: '#E5E7EB',
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
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 6,
  },
  cardText: {
    color: '#6B7280',
    marginTop: 4,
  },
  premiumLockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
    maxWidth: 420,
  },
  sheetTitle: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '700',
  },
  sheetSubtitle: {
    color: '#6B7280',
    marginTop: 6,
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
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexBasis: '32%',
    flexGrow: 1,
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
  pillOption: {
    backgroundColor: 'white',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  pillOptionActive: {
    backgroundColor: '#EBF8FF',
    borderColor: '#93C5FD',
  },
  pillText: {
    color: '#1F2937',
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#1E3A8A',
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
 
