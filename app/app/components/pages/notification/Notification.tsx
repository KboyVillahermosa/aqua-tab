import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigation from '../../navigation/BottomNavigation';
import * as api from '../../../api';
import { useLocalSearchParams } from 'expo-router';

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
  scheduledTime: string;
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

  async function registerForPushNotificationsAsync() {
    // Temporarily disabled - notifications will be enabled after Metro restart
    console.log('Notification permissions check temporarily disabled');
    setPermissionGranted(false);
  }

  const setupNotificationListeners = useCallback(() => {
    // Temporarily disabled - notifications will be enabled after Metro restart
    console.log('Notification listeners temporarily disabled');
  }, []);

  function handleNotificationReceived(notification: any) {
    // Temporarily disabled - notifications will be enabled after Metro restart
    console.log('Notification received handler temporarily disabled');
  }

  function handleNotificationResponse(response: any) {
    // Temporarily disabled - notifications will be enabled after Metro restart
    console.log('Notification response handler temporarily disabled');
  }

  function handleHydrationReminderResponse(response: any) {
    // Temporarily disabled - notifications will be enabled after Metro restart
    console.log('Hydration reminder response handler temporarily disabled');
  }

  function handleMedicationReminderResponse(response: any) {
    // Temporarily disabled - notifications will be enabled after Metro restart
    console.log('Medication reminder response handler temporarily disabled');
  }

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      
      if (token) {
        // Load from backend
        try {
          const serverNotifications = await api.get('/notifications', token as string);
          setNotifications(serverNotifications || []);
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

  useEffect(() => {
    registerForPushNotificationsAsync();
    loadNotifications();
    setupNotificationListeners();
    
    return () => {
      // Cleanup is handled automatically by React Native
    };
  }, [loadNotifications, setupNotificationListeners]);

  async function scheduleHydrationReminder() {
    // Temporarily disabled - notifications will be enabled after Metro restart
    console.log('Hydration reminder scheduling temporarily disabled');
  }


  async function markHydrationCompleted(notificationId: string) {
    // Temporarily disabled - notifications will be enabled after Metro restart
    console.log('Mark hydration completed temporarily disabled');
  }

  async function markMedicationTaken(notificationId: string) {
    // Temporarily disabled - notifications will be enabled after Metro restart
    console.log('Mark medication taken temporarily disabled');
  }

  async function snoozeHydrationReminder(notificationId: string) {
    // Temporarily disabled - notifications will be enabled after Metro restart
    console.log('Snooze hydration reminder temporarily disabled');
  }

  async function snoozeMedicationReminder(notificationId: string, minutes: number) {
    // Temporarily disabled - notifications will be enabled after Metro restart
    console.log('Snooze medication reminder temporarily disabled');
  }

  async function clearAllNotifications() {
    Alert.alert('Clear All', 'Remove all notifications?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => {
        // Temporarily disabled - notifications will be enabled after Metro restart
        console.log('Clear all notifications temporarily disabled');
        setNotifications([]);
      }},
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
                    {new Date(notification.scheduledTime).toLocaleString()}
                  </Text>
                </View>
                
                <View style={styles.notificationStatus}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(notification.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(notification.status) }]}>
                      {getStatusText(notification.status)}
                    </Text>
                  </View>
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
  notificationStatus: { alignItems: 'flex-end' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  
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
