import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as api from '../api';

// Check if running in Expo Go (push notifications not supported, but local notifications work)
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// Configure notification handler (works for local notifications in Expo Go)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: !isExpoGo, // Badge might not work in Expo Go
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Suppress push token warnings in Expo Go
// The warning comes from automatic push token registration in expo-notifications
// This is expected behavior - local notifications still work fine in Expo Go
if (isExpoGo) {
  console.log('Running in Expo Go - using local notifications only (push notifications disabled)');
  
  // Suppress the specific Expo Go push notification warning
  // This warning appears because expo-notifications tries to auto-register push tokens
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    if (message.includes('expo-notifications') && 
        (message.includes('Expo Go') || message.includes('SDK 53') || message.includes('push notifications'))) {
      // Suppress this specific error/warning
      return;
    }
    originalError.apply(console, args);
  };
  
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    if (message.includes('expo-notifications') && 
        (message.includes('Expo Go') || message.includes('SDK 53') || message.includes('push notifications'))) {
      // Suppress this specific warning
      return;
    }
    originalWarn.apply(console, args);
  };
}

export interface NotificationData {
  type: 'hydration' | 'medication';
  id?: string;
  medicationId?: string;
  amount?: number;
  [key: string]: any;
}

class NotificationService {
  private token: string | null = null;
  public scheduledNotifications: Map<string, string> = new Map(); // Maps backend notification ID to expo notification ID

  setToken(token: string | null) {
    this.token = token;
  }

  /**
   * Request notification permissions (local notifications only in Expo Go)
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.log('Notifications are not available on simulator/emulator');
        return false;
      }

      // In Expo Go, we can only use local notifications
      if (isExpoGo) {
        console.log('Expo Go detected - requesting local notification permissions only');
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // Configure Android channel (works for local notifications)
      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Health Reminders',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#1E3A8A',
            sound: 'default',
            enableVibrate: true,
            showBadge: !isExpoGo, // Badge might not work in Expo Go
          });
        } catch (channelError) {
          console.log('Error setting notification channel (non-critical):', channelError);
          // Continue even if channel setup fails
        }
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Schedule a single notification
   */
  async scheduleNotification(
    title: string,
    body: string,
    trigger: Date | number,
    data?: NotificationData
  ): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          data: data || {},
          categoryId: data?.type === 'medication' ? 'medication' : 'hydration',
        },
        trigger: trigger instanceof Date 
          ? { date: trigger }
          : { seconds: trigger },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Schedule a recurring notification (daily)
   */
  async scheduleRecurringNotification(
    title: string,
    body: string,
    hour: number,
    minute: number,
    data?: NotificationData
  ): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          data: data || {},
          categoryId: data?.type === 'medication' ? 'medication' : 'hydration',
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling recurring notification:', error);
      return null;
    }
  }

  /**
   * Schedule medication notifications based on medication times
   */
  async scheduleMedicationNotifications(
    medicationId: string,
    medicationName: string,
    dosage: string,
    times: string[],
    backendNotificationId?: string
  ): Promise<void> {
    if (!this.token) return;

    try {
      // Cancel existing notifications for this medication
      await this.cancelMedicationNotifications(medicationId);

      for (const timeStr of times) {
        const scheduledTime = new Date(timeStr);
        const now = new Date();
        
        // If time has passed today, schedule for tomorrow
        const todayScheduled = new Date(now);
        todayScheduled.setHours(scheduledTime.getHours(), scheduledTime.getMinutes(), scheduledTime.getSeconds(), 0);
        
        let triggerDate = todayScheduled;
        if (todayScheduled <= now) {
          triggerDate = new Date(todayScheduled.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
        }

        const title = dosage ? `Take ${dosage} ${medicationName} 💊` : `Take ${medicationName} 💊`;
        const body = `Time for your medication at ${triggerDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}`;

        const notificationId = await this.scheduleRecurringNotification(
          title,
          body,
          triggerDate.getHours(),
          triggerDate.getMinutes(),
          {
            type: 'medication',
            medicationId,
            id: backendNotificationId,
          }
        );

        if (notificationId && backendNotificationId) {
          this.scheduledNotifications.set(backendNotificationId, notificationId);
        }

        // Also save to backend
        if (this.token) {
          try {
            await api.post('/notifications/schedule/medication', {
              medication_id: medicationId,
              medication_name: medicationName,
              scheduled_time: triggerDate.toISOString(),
              dosage,
            }, this.token);
          } catch (err) {
            console.log('Error saving medication notification to backend:', err);
          }
        }
      }
    } catch (error) {
      console.error('Error scheduling medication notifications:', error);
    }
  }

  /**
   * Schedule hydration reminder
   */
  async scheduleHydrationReminder(
    intervalMinutes: number = 120,
    amountMl: number = 200,
    backendNotificationId?: string
  ): Promise<void> {
    if (!this.token) return;

    try {
      const nextReminder = new Date(Date.now() + intervalMinutes * 60 * 1000);

      const notificationId = await this.scheduleNotification(
        'Time to hydrate 💧',
        `${amountMl}ml suggested to stay hydrated`,
        nextReminder,
        {
          type: 'hydration',
          amount: amountMl,
          id: backendNotificationId,
        }
      );

      if (notificationId && backendNotificationId) {
        this.scheduledNotifications.set(backendNotificationId, notificationId);
      }

      // Save to backend
      if (this.token) {
        try {
          await api.post('/notifications/schedule/hydration', {
            interval_minutes: intervalMinutes,
            amount_ml: amountMl,
          }, this.token);
        } catch (err) {
          console.log('Error saving hydration notification to backend:', err);
        }
      }
    } catch (error) {
      console.error('Error scheduling hydration reminder:', error);
    }
  }

  /**
   * Snooze a notification
   */
  async snoozeNotification(
    notificationId: string,
    minutes: number = 15,
    backendNotificationId?: string
  ): Promise<void> {
    if (!this.token) return;

    try {
      // Cancel the original notification
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }

      // Schedule new notification
      const snoozeTime = new Date(Date.now() + minutes * 60 * 1000);
      const newNotificationId = await this.scheduleNotification(
        'Reminder Snoozed',
        'Your reminder has been snoozed',
        snoozeTime,
        {
          type: 'medication', // Will be updated based on original notification
        }
      );

      // Update backend
      if (this.token && backendNotificationId) {
        try {
          await api.post(`/notifications/${backendNotificationId}/snooze`, {
            minutes,
          }, this.token);
        } catch (err) {
          console.log('Error updating snooze on backend:', err);
        }
      }
    } catch (error) {
      console.error('Error snoozing notification:', error);
    }
  }

  /**
   * Cancel a notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  /**
   * Cancel all notifications for a medication
   */
  async cancelMedicationNotifications(medicationId: string): Promise<void> {
    try {
      const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of allNotifications) {
        const data = notification.content.data as NotificationData;
        if (data?.medicationId === medicationId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
    } catch (error) {
      console.error('Error canceling medication notifications:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.scheduledNotifications.clear();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Setup notification response handlers
   */
  setupNotificationHandlers(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationTapped?: (response: Notifications.NotificationResponse) => void
  ) {
    // Handle notification received while app is in foreground
    const receivedListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    // Handle notification tapped/opened
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      if (onNotificationTapped) {
        onNotificationTapped(response);
      }
    });

    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  }

  /**
   * Mark notification as completed
   */
  async markCompleted(backendNotificationId: string): Promise<void> {
    if (!this.token) return;

    try {
      await api.post(`/notifications/${backendNotificationId}/complete`, {}, this.token);
    } catch (error) {
      console.error('Error marking notification as completed:', error);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

