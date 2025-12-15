/**
 * Activity Tab - Advanced Analytics & History
 * ==========================================
 * Displays comprehensive medication/notification history with analytics
 * Features: Real stats, PDF export, adherence trends, premium charts
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
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import BottomNavigation from '../../navigation/BottomNavigation';
import PremiumLockModal from '../../PremiumLockModal';
import api from '../../../api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Types
export type NotificationStatus = 'upcoming' | 'completed' | 'missed' | 'snoozed' | 'delivered' | 'scheduled' | 'taken' | 'skipped';
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
  medication_name?: string;
  time?: string;
}

export interface NotificationStats {
  completed: number;
  upcoming: number;
  missed: number;
}

export interface MedicationHistory {
  id: number;
  medication_id: number;
  user_id: number;
  status: 'completed' | 'skipped' | 'taken' | 'missed';
  time: string;
  scheduled_time?: string;
  taken_time?: string;
  created_at: string;
  medication?: {
    id: number;
    name: string;
    dosage?: string;
    icon?: string;
  };
}

export interface AdherenceTrend {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

// PillIcon Component (inline since we don't have it as a separate file)
const PillIcon = ({ name, size = 20, color = '#1E3A8A' }: { name: string; size?: number; color?: string }) => {
  const iconMap: Record<string, any> = {
    pill: 'medkit',
    tablet: 'fitness',
    capsule: 'ellipse',
    liquid: 'water',
    injection: 'bandage',
    inhaler: 'cloud',
    drops: 'water-outline',
    cream: 'hand-left',
    default: 'medical',
  };
  
  const iconName = iconMap[name?.toLowerCase()] || iconMap.default;
  return <Ionicons name={iconName} size={size} color={color} />;
};

export default function Activity() {
  const params = useLocalSearchParams();
  const token = (params?.token as string) || undefined;
  const insets = useSafeAreaInsets();

  // State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [medicationHistory, setMedicationHistory] = useState<MedicationHistory[]>([]);
  const [stats, setStats] = useState<NotificationStats>({ completed: 0, upcoming: 0, missed: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);
  const [adherencePeriod, setAdherencePeriod] = useState<'7' | '30'>('7');
  const [adherenceTrends, setAdherenceTrends] = useState<AdherenceTrend[]>([]);
  const [exporting, setExporting] = useState<boolean>(false);

  // Helper: Get status color
  const getStatusColor = useCallback((status: NotificationStatus) => {
    switch (status) {
      case 'completed':
      case 'taken':
        return '#10B981';
      case 'missed':
      case 'skipped':
        return '#EF4444';
      case 'snoozed':
        return '#F59E0B';
      case 'delivered':
      case 'scheduled':
      case 'upcoming':
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
      case 'taken':
        return 'Completed';
      case 'missed':
      case 'skipped':
        return 'Missed';
      case 'snoozed':
        return 'Snoozed';
      case 'delivered':
        return 'Delivered';
      case 'scheduled':
      case 'upcoming':
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
        title: raw?.title ?? raw?.medication?.name ?? 'Notification',
        message: raw?.message ?? raw?.body ?? '',
        body: raw?.body,
        type: (raw?.type ?? 'general') as NotificationType,
        status: (raw?.status ?? 'scheduled') as NotificationStatus,
        scheduled_at: raw?.scheduled_at ?? null,
        scheduled_time: raw?.scheduled_time ?? raw?.time ?? null,
        created_at: raw?.created_at ?? null,
        medication_name: raw?.medication?.name,
        time: raw?.time,
      });
    }

    return unique;
  }, []);

  // Normalize medication history from API
  const normalizeMedicationHistory = useCallback((payload: any): MedicationHistory[] => {
    const arr = Array.isArray(payload) ? payload : payload?.data;
    if (!Array.isArray(arr)) return [];
    return arr.map((item: any) => ({
      id: item.id,
      medication_id: item.medication_id,
      user_id: item.user_id,
      status: item.status,
      time: item.time,
      scheduled_time: item.scheduled_time,
      taken_time: item.taken_time,
      created_at: item.created_at,
      medication: item.medication,
    }));
  }, []);

  // Normalize stats response
  const normalizeStats = useCallback((payload: any): NotificationStats => {
    const s = payload?.data ?? payload ?? {};
    const upcoming = Number(s?.upcoming ?? s?.scheduled ?? 0) || 0;
    return {
      completed: Number(s?.completed ?? s?.taken ?? 0) || 0,
      upcoming,
      missed: Number(s?.missed ?? s?.skipped ?? 0) || 0,
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

  // Fetch medication history from all medications
  const fetchMedicationHistory = useCallback(async () => {
    if (!token) return;
    try {
      // Get all medications first
      const medications: any[] = await api.get('/medications', token);
      
      // Fetch history for each medication
      const historyPromises = medications.map(async (med) => {
        try {
          const history = await api.get(`/medications/${med.id}/history`, token);
          // Attach medication info to each history entry
          return Array.isArray(history) ? history.map((h: any) => ({
            ...h,
            medication: {
              id: med.id,
              name: med.name,
              dosage: med.dosage,
              icon: med.icon,
            },
          })) : [];
        } catch {
          return [];
        }
      });

      const allHistory = (await Promise.all(historyPromises)).flat();
      const normalized = normalizeMedicationHistory(allHistory);
      setMedicationHistory(normalized);

      // Calculate real stats from medication history
      const today = new Date().toISOString().split('T')[0];
      const todayHistory = normalized.filter(h => h.time?.startsWith(today));
      
      const completed = todayHistory.filter(h => h.status === 'completed' || h.status === 'taken').length;
      const missed = todayHistory.filter(h => h.status === 'missed' || h.status === 'skipped').length;
      
      // Get upcoming from medications with scheduled times
      const upcoming = medications.filter(m => {
        const times = m.times || [];
        return times.some((t: string) => {
          const scheduledTime = new Date(`${today}T${t}`);
          return scheduledTime > new Date();
        });
      }).length;

      setStats({ completed, upcoming, missed });
    } catch (error) {
      console.error('Error fetching medication history:', error);
      setMedicationHistory([]);
    }
  }, [token, normalizeMedicationHistory]);

  // Fetch subscription status
  const fetchSubscription = useCallback(async () => {
    if (!token) return;
    try {
      const sub = await api.get('/subscription/current', token, 3000);
      setSubscription(sub || { plan_slug: 'free', is_active: false });
    } catch {
      setSubscription({ plan_slug: 'free', is_active: false });
    }
  }, [token]);

  // Calculate adherence trends
  const calculateAdherenceTrends = useCallback(() => {
    const days = adherencePeriod === '7' ? 7 : 30;
    const trends: AdherenceTrend[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayHistory = medicationHistory.filter(h => h.time?.startsWith(dateStr));
      const completed = dayHistory.filter(h => h.status === 'completed' || h.status === 'taken').length;
      const total = dayHistory.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      trends.push({
        date: dateStr,
        completed,
        total,
        percentage,
      });
    }
    
    setAdherenceTrends(trends);
  }, [medicationHistory, adherencePeriod]);

  // Fetch stats from API (fallback)
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/notifications/stats', token);
      const apiStats = normalizeStats(res);
      // Only use if we don't have medication history stats
      if (medicationHistory.length === 0) {
        setStats(apiStats);
      }
    } catch (_) {
      // Stats already calculated from medication history
    }
  }, [normalizeStats, token, medicationHistory.length]);

  // Initial load on mount - replaced with useFocusEffect
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([
          fetchNotifications(),
          fetchMedicationHistory(),
          fetchSubscription(),
          fetchStats(),
        ]);
        setLoading(false);
      };
      
      loadData();
    }, [fetchNotifications, fetchMedicationHistory, fetchSubscription, fetchStats])
  );

  // Calculate adherence trends when medication history changes
  useEffect(() => {
    if (medicationHistory.length > 0) {
      calculateAdherenceTrends();
    }
  }, [medicationHistory, adherencePeriod, calculateAdherenceTrends]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    // Optimistic Update: Update UI immediately for instant feedback
    setNotifications(prev =>
      prev.map(n => ({
        ...n,
        status:
          n.status === 'scheduled' || n.status === 'delivered' || n.status === 'upcoming'
            ? 'completed'
            : n.status,
      }))
    );
    
    setMedicationHistory(prev =>
      prev.map(h => ({
        ...h,
        status: h.status === 'missed' || h.status === 'skipped' ? 'completed' : h.status,
      }))
    );
    
    // Get entries to update before we proceed
    const entriesToUpdate = medicationHistory.filter(
      h => h.status === 'missed' || h.status === 'skipped'
    );

    // Now perform backend updates in the background
    try {
      // Mark all notifications as read
      await api.post('/notifications/mark-all-read', {}, token);
    } catch (_) {
      // If endpoint not available, fall back client-side
    }
    
    // Update medication history entries on backend
    try {
      await Promise.all(
        entriesToUpdate.map(entry =>
          api.put(
            `/medications/${entry.medication_id}/history/${entry.id}`,
            { status: 'completed' },
            token
          ).catch(() => {}) // Silently fail individual updates
        )
      );
    } catch (_) {
      // Backend update failed, but optimistic update already applied
    }
    
    // Reload data from backend to ensure sync
    await fetchMedicationHistory();
    await fetchStats();
    
    // Show success feedback
    Alert.alert('Success', 'All items marked as read');
  }, [fetchStats, fetchMedicationHistory, medicationHistory, token]);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    // Optimistic Update: Clear UI immediately
    setNotifications([]);
    setMedicationHistory([]);
    
    // Clear notifications from backend
    try {
      await api.post('/notifications/clear', {}, token);
    } catch (_) {
      // Backend clear failed, but UI already cleared
    }
    
    // Note: We only clear the local view state for medication history.
    // The medical data remains preserved in the backend database for adherence tracking.
    // This just hides it from the "Recent Activity" feed view.
    
    await fetchStats();
    
    // Show success feedback
    Alert.alert('Success', 'Activity feed cleared');
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
    await Promise.all([
      fetchNotifications(),
      fetchMedicationHistory(),
      fetchSubscription(),
      fetchStats(),
    ]);
    setRefreshing(false);
  }, [fetchNotifications, fetchMedicationHistory, fetchSubscription, fetchStats]);

  // Export to PDF
  const exportToPDF = useCallback(async () => {
    if (exporting) return;
    
    setExporting(true);
    try {
      // Get last 30 entries from medication history
      const recentHistory = medicationHistory
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 30);

      if (recentHistory.length === 0) {
        Alert.alert('No Data', 'No medication history available to export.');
        setExporting(false);
        return;
      }

      // Generate HTML for PDF
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Medication History Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #1F2937;
            }
            h1 {
              color: #1E3A8A;
              border-bottom: 3px solid #1E3A8A;
              padding-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #1E3A8A;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: bold;
            }
            td {
              padding: 10px;
              border-bottom: 1px solid #E5E7EB;
            }
            tr:nth-child(even) {
              background-color: #F9FAFB;
            }
            .completed {
              color: #10B981;
              font-weight: bold;
            }
            .missed {
              color: #EF4444;
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #6B7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <h1>Medication History Report</h1>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Period:</strong> Last 30 entries</p>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${recentHistory.map(entry => {
                const date = new Date(entry.time);
                const dateStr = date.toLocaleDateString();
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const statusClass = (entry.status === 'completed' || entry.status === 'taken') ? 'completed' : 'missed';
                const statusText = (entry.status === 'completed' || entry.status === 'taken') ? 'Completed' : 'Missed';
                
                return `
                  <tr>
                    <td>${dateStr}</td>
                    <td>${timeStr}</td>
                    <td>${entry.medication?.name || 'Unknown'}</td>
                    <td>${entry.medication?.dosage || '-'}</td>
                    <td class="${statusClass}">${statusText}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>AquaTab - Medication Tracking Report</p>
          </div>
        </body>
        </html>
      `;

      // Generate PDF
      const { uri } = await Print.printToFileAsync({ html });
      
      // Share PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Medication History Report',
        });
      } else {
        Alert.alert('Success', `PDF saved to: ${uri}`);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF report.');
    } finally {
      setExporting(false);
    }
  }, [medicationHistory, exporting]);

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
        {/* Header with Export Button */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Activity</Text>
            <Text style={styles.subtitle}>View your notification history</Text>
          </View>
          <TouchableOpacity
            style={styles.exportBtn}
            onPress={exportToPDF}
            disabled={exporting || medicationHistory.length === 0}
          >
            {exporting ? (
              <ActivityIndicator size="small" color="#1E3A8A" />
            ) : (
              <Ionicons name="download-outline" size={22} color="#1E3A8A" />
            )}
          </TouchableOpacity>
        </View>

        {/* Stats Cards - Real Data */}
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

        {/* Adherence Trends Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Adherence Trends</Text>
          <View style={styles.periodToggle}>
            <TouchableOpacity
              style={[styles.periodBtn, adherencePeriod === '7' && styles.periodBtnActive]}
              onPress={() => setAdherencePeriod('7')}
            >
              <Text style={[styles.periodText, adherencePeriod === '7' && styles.periodTextActive]}>
                7 Days
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.periodBtn, adherencePeriod === '30' && styles.periodBtnActive]}
              onPress={() => setAdherencePeriod('30')}
            >
              <Text style={[styles.periodText, adherencePeriod === '30' && styles.periodTextActive]}>
                30 Days
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chart with Premium Lock */}
        <View style={styles.chartContainer}>
          {subscription?.plan_slug !== 'premium' ? (
            <TouchableOpacity
              style={styles.premiumLockOverlay}
              onPress={() => setShowPremiumModal(true)}
            >
              <View style={styles.lockContent}>
                <Ionicons name="lock-closed" size={40} color="#F59E0B" />
                <Text style={styles.lockTitle}>Premium Feature</Text>
                <Text style={styles.lockText}>Unlock detailed adherence analytics</Text>
              </View>
            </TouchableOpacity>
          ) : adherenceTrends.length > 0 ? (
            <View style={styles.chart}>
              <View style={styles.chartBars}>
                {adherenceTrends.map((trend, idx) => (
                  <View key={idx} style={styles.barColumn}>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: `${trend.percentage}%`,
                            backgroundColor: trend.percentage >= 80 ? '#10B981' : trend.percentage >= 50 ? '#F59E0B' : '#EF4444',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>
                      {new Date(trend.date).getDate()}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.legendText}>Good (≥80%)</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={styles.legendText}>Fair (50-79%)</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.legendText}>Poor (&lt;50%)</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyChartText}>No data available for the selected period</Text>
            </View>
          )}
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
        ) : medicationHistory.length === 0 && notifications.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="notifications-off-outline" size={40} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No Activity Yet</Text>
            <Text style={styles.emptyText}>Your notification history will appear here.</Text>
          </View>
        ) : (
          <View>
            {/* Medication History Items */}
            {medicationHistory
              .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
              .slice(0, 20)
              .map(entry => (
                <View key={entry.id} style={styles.listItem}>
                  <View style={styles.listIconWrap}>
                    <PillIcon
                      name={entry.medication?.icon || 'default'}
                      size={20}
                      color="#1E3A8A"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.itemHeaderRow}>
                      <Text style={styles.itemTitle}>{entry.medication?.name || 'Medication'}</Text>
                      <View
                        style={[
                          styles.statusPill,
                          { backgroundColor: getStatusBg(entry.status as NotificationStatus) },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusColor(entry.status as NotificationStatus) },
                          ]}
                        >
                          {getStatusText(entry.status as NotificationStatus)}
                        </Text>
                      </View>
                    </View>
                    {entry.medication?.dosage && (
                      <Text style={styles.itemMessage}>{entry.medication.dosage}</Text>
                    )}
                    <Text style={styles.itemMeta}>
                      {formatDate(entry.time)} • {formatTime(entry.time)}
                    </Text>
                  </View>
                </View>
              ))}

            {/* Legacy Notifications */}
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
      
      {/* Premium Lock Modal */}
      {showPremiumModal && (
        <PremiumLockModal
          visible={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          featureName="Adherence Trends Analytics"
          token={token}
        />
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  exportBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
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
  periodToggle: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  periodBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'white',
  },
  periodBtnActive: {
    backgroundColor: '#1E3A8A',
  },
  periodText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 13,
  },
  periodTextActive: {
    color: 'white',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 16,
    minHeight: 200,
    position: 'relative',
  },
  premiumLockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  lockContent: {
    alignItems: 'center',
    gap: 8,
  },
  lockTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  lockText: {
    fontSize: 14,
    color: '#6B7280',
  },
  chart: {
    flex: 1,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 150,
    marginBottom: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barContainer: {
    flex: 1,
    width: '70%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  chartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyChart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyChartText: {
    color: '#6B7280',
    fontSize: 14,
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
