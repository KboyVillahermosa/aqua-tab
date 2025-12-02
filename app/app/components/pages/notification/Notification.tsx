import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigation from '../../navigation/BottomNavigation';
import * as api from '../../../api';
import { useLocalSearchParams } from 'expo-router';
import { notificationService } from '../../../services/notificationService';

// Configure notification behavior (temporarily disabled)
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//     shouldShowBanner: true,
//     shouldShowList: true,
//   }),
// });

type NotificationItem = {
  id: string;
  type: 'hydration' | 'medication';
  title: string;
  body: string;
  scheduled_time: string;
  status: 'scheduled' | 'delivered' | 'missed' | 'completed';
  data?: any;
  reminderId?: string;
};

type ReminderSettings = {
  hydration: {
    enabled: boolean;
    interval: number; // minutes
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    lastReminder: string;
  };
  medication: {
    enabled: boolean;
    snoozeMinutes: number[];
    missedThreshold: number; // minutes
  };
};

const STORAGE_KEYS = {
  NOTIFICATIONS: '@aqua:notifications',
  REMINDER_SETTINGS: '@aqua:reminder_settings',
};

// function uid() {
//   return Math.random().toString(36).slice(2, 9);
// }

export default function Notification() {
  const { token } = useLocalSearchParams();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    hydration: {
      enabled: true,
      interval: 120, // 2 hours
      startTime: '08:00',
      endTime: '22:00',
      lastReminder: '',
    },
    medication: {
      enabled: true,
      snoozeMinutes: [15, 30, 60],
      missedThreshold: 30,
    },
  });
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);


  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.REMINDER_SETTINGS, JSON.stringify(reminderSettings));
  }, [reminderSettings]);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      
      if (token) {
        // Load from backend
        try {
          const serverNotifications = await api.get('/notifications', token as string);
          // Transform backend format to frontend format
          const transformed = (serverNotifications || []).map((n: any) => ({
            id: n.id?.toString() || '',
            type: n.type,
            title: n.title,
            body: n.body,
            scheduled_time: n.scheduled_time,
            status: n.status,
            data: typeof n.data === 'string' ? JSON.parse(n.data || '{}') : n.data,
          }));
          setNotifications(transformed);
        } catch (e) {
          console.log('Failed to load notifications from server:', e);
        }
      } else {
        // Load from local storage
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
        if (raw) setNotifications(JSON.parse(raw));
      }

      // Load reminder settings
      const settingsRaw = await AsyncStorage.getItem(STORAGE_KEYS.REMINDER_SETTINGS);
      if (settingsRaw) {
        setReminderSettings(JSON.parse(settingsRaw));
      }
    } catch (e) {
      console.log('Failed to load notifications:', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const registerForPushNotificationsAsync = useCallback(async () => {
    try {
      notificationService.setToken(token as string || null);
      const granted = await notificationService.requestPermissions();
      setPermissionGranted(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      setPermissionGranted(false);
      return false;
    }
  }, [token]);

  const handleHydrationReminderResponse = useCallback((response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data as any;
    const notificationId = data?.id ? String(data.id) : '';
    Alert.alert(
      'Hydration Reminder',
      'Did you drink water?',
      [
        { text: 'Snooze', onPress: () => snoozeHydrationReminder(notificationId) },
        { text: 'Mark Complete', onPress: () => markHydrationCompleted(notificationId) },
        { text: 'Later', style: 'cancel' },
      ]
    );
  }, []);

  const handleMedicationReminderResponse = useCallback((response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data as any;
    const notificationId = data?.id ? String(data.id) : '';
    Alert.alert(
      'Medication Reminder',
      'Did you take your medication?',
      [
        { text: 'Snooze', onPress: () => snoozeMedicationReminder(notificationId, 15) },
        { text: 'Mark Taken', onPress: () => markMedicationTaken(notificationId) },
        { text: 'Later', style: 'cancel' },
      ]
    );
  }, []);

  const setupNotificationListeners = useCallback(() => {
    const cleanup = notificationService.setupNotificationHandlers(
      (notification) => {
        console.log('Notification received:', notification);
        // Reload notifications when a new one is received
        loadNotifications();
      },
      (response) => {
        console.log('Notification tapped:', response);
        const data = response.notification.request.content.data as any;
        
        // Handle different notification types
        if (data?.type === 'hydration') {
          handleHydrationReminderResponse(response);
        } else if (data?.type === 'medication') {
          handleMedicationReminderResponse(response);
        }
      }
    );

    return cleanup;
  }, [loadNotifications, handleHydrationReminderResponse, handleMedicationReminderResponse]);

  useEffect(() => {
    registerForPushNotificationsAsync();
    loadNotifications();
    const cleanup = setupNotificationListeners();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [loadNotifications, setupNotificationListeners, registerForPushNotificationsAsync]);

  async function scheduleHydrationReminder() {
    if (!permissionGranted) {
      Alert.alert('Permissions Required', 'Please enable notification permissions first.');
      return;
    }

    try {
      const interval = reminderSettings.hydration.interval || 120;
      const amountMl = 200; // Default amount
      
      await notificationService.scheduleHydrationReminder(interval, amountMl);
      
      Alert.alert('Success', 'Hydration reminder scheduled!');
      loadNotifications();
    } catch (error) {
      console.error('Error scheduling hydration reminder:', error);
      Alert.alert('Error', 'Failed to schedule hydration reminder');
    }
  }

  async function markHydrationCompleted(notificationId: string) {
    if (!token) return;

    try {
      await notificationService.markCompleted(notificationId);
      if (token) {
        await api.post(`/notifications/${notificationId}/complete`, {}, token as string);
      }
      Alert.alert('Success', 'Hydration marked as completed!');
      loadNotifications();
    } catch (error) {
      console.error('Error marking hydration as completed:', error);
      Alert.alert('Error', 'Failed to mark hydration as completed');
    }
  }

  async function markMedicationTaken(notificationId: string) {
    if (!token) return;

    try {
      await notificationService.markCompleted(notificationId);
      if (token) {
        await api.post(`/notifications/${notificationId}/complete`, {}, token as string);
      }
      Alert.alert('Success', 'Medication marked as taken!');
      loadNotifications();
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      Alert.alert('Error', 'Failed to mark medication as taken');
    }
  }

  async function snoozeHydrationReminder(notificationId: string) {
    if (!token) return;

    Alert.alert(
      'Snooze Hydration',
      'How long would you like to snooze?',
      [
        { text: '15 min', onPress: () => performSnooze(notificationId, 15) },
        { text: '30 min', onPress: () => performSnooze(notificationId, 30) },
        { text: '1 hour', onPress: () => performSnooze(notificationId, 60) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }

  async function snoozeMedicationReminder(notificationId: string, minutes: number = 15) {
    await performSnooze(notificationId, minutes);
  }

  async function performSnooze(notificationId: string, minutes: number) {
    if (!token) return;

    try {
      // Find the expo notification ID if we have it
      const expoNotificationId = Array.from(notificationService.scheduledNotifications.entries())
        .find(([backendId]) => backendId === notificationId)?.[1];

      await notificationService.snoozeNotification(expoNotificationId || '', minutes, notificationId);
      
      Alert.alert('Snoozed', `Reminder snoozed for ${minutes} minutes`);
      loadNotifications();
    } catch (error) {
      console.error('Error snoozing notification:', error);
      Alert.alert('Error', 'Failed to snooze reminder');
    }
  }

  async function clearAllNotifications() {
    Alert.alert('Clear All', 'Remove all notifications?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Clear', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await notificationService.cancelAllNotifications();
            setNotifications([]);
            if (token) {
              // Optionally clear from backend too
              const allNotifications = await api.get('/notifications', token as string);
              if (Array.isArray(allNotifications)) {
                for (const notif of allNotifications) {
                  try {
                    await api.put(`/notifications/${notif.id}`, { status: 'completed' }, token as string);
                  } catch (e) {
                    console.log('Error clearing notification from backend:', e);
                  }
                }
              }
            }
            Alert.alert('Success', 'All notifications cleared');
          } catch (error) {
            console.error('Error clearing notifications:', error);
            Alert.alert('Error', 'Failed to clear notifications');
          }
        }
      },
    ]);
  }

  function getNotificationIcon(type: string) {
    return type === 'hydration' ? 'water' : 'medical';
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'scheduled': return '#3B82F6';
      case 'delivered': return '#10B981';
      case 'completed': return '#059669';
      case 'missed': return '#EF4444';
      default: return '#6B7280';
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'scheduled': return 'Scheduled';
      case 'delivered': return 'Delivered';
      case 'completed': return 'Completed';
      case 'missed': return 'Missed';
      default: return 'Unknown';
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Reminders & Notifications</Text>
          <Text style={styles.headerSubtitle}>Manage your health reminders</Text>
        </View>

        {/* Permission Status */}
        <View style={styles.permissionCard}>
          <View style={styles.permissionHeader}>
            <Ionicons 
              name={permissionGranted ? "checkmark-circle" : "alert-circle"} 
              size={24} 
              color={permissionGranted ? "#10B981" : "#F59E0B"} 
            />
            <Text style={styles.permissionTitle}>
              {permissionGranted ? 'Notifications Enabled' : 'Notifications Disabled'}
            </Text>
          </View>
          <Text style={styles.permissionText}>
            {permissionGranted 
              ? 'You will receive reminders for hydration and medications'
              : 'Enable notifications to receive health reminders'
            }
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={scheduleHydrationReminder}
              disabled={!permissionGranted}
            >
              <Ionicons name="water" size={24} color="#3B82F6" />
              <Text style={styles.actionButtonText}>Schedule Hydration</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={clearAllNotifications}
            >
              <Ionicons name="trash" size={24} color="#EF4444" />
              <Text style={styles.actionButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications List */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Notifications</Text>
            <Text style={styles.notificationCount}>{notifications.length}</Text>
          </View>
          
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No notifications yet</Text>
              <Text style={styles.emptySubtext}>Schedule reminders to see them here</Text>
            </View>
          ) : (
            notifications.slice(0, 10).map((notification) => (
              <View key={notification.id} style={styles.notificationCard}>
                <View style={styles.notificationIcon}>
                  <Ionicons 
                    name={getNotificationIcon(notification.type)} 
                    size={20} 
                    color={getStatusColor(notification.status)} 
                  />
                </View>
                
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationBody}>{notification.body}</Text>
                  <Text style={styles.notificationTime}>
                    {new Date(notification.scheduled_time).toLocaleString()}
                  </Text>
                </View>
                
                <View style={styles.notificationStatus}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(notification.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(notification.status) }]}>
                      {getStatusText(notification.status)}
                    </Text>
                  </View>
                  {notification.status === 'scheduled' && (
                    <View style={styles.notificationActions}>
                      <TouchableOpacity
                        style={styles.notificationActionButton}
                        onPress={() => {
                          if (notification.type === 'hydration') {
                            snoozeHydrationReminder(notification.id);
                          } else {
                            snoozeMedicationReminder(notification.id, 15);
                          }
                        }}
                      >
                        <Ionicons name="time-outline" size={16} color="#3B82F6" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.notificationActionButton}
                        onPress={() => {
                          if (notification.type === 'hydration') {
                            markHydrationCompleted(notification.id);
                          } else {
                            markMedicationTaken(notification.id);
                          }
                        }}
                      >
                        <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <BottomNavigation currentRoute="notification" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#6B7280' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  
  // Header
  headerSection: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#1F2937' },
  headerSubtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  
  // Permission Card
  permissionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8
  },
  permissionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20
  },
  
  // Sections
  sectionContainer: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  notificationCount: { fontSize: 14, color: '#6B7280', backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  
  // Action Buttons
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginTop: 8 },
  
  // Notifications
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  notificationBody: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  notificationTime: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  notificationStatus: { alignItems: 'flex-end', gap: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  notificationActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  notificationActionButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: 'white',
    borderRadius: 16,
    marginTop: 8
  },
  emptyText: { fontSize: 16, color: '#6B7280', marginTop: 12 },
  emptySubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
});
