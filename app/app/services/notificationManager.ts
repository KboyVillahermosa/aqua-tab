/**
 * UNIFIED NOTIFICATION MANAGER - EXPO GO COMPATIBLE
 * 
 * This service provides all notification functionality using ONLY Expo Go-compatible features.
 * NO native modules, NO push tokens, NO background tasks, NO native scheduling.
 * 
 * Uses:
 * - react-native-toast-message for toast notifications
 * - React Native Alert for system-style dialogs
 * - Custom modals for rich notifications
 * - AppState listeners for app resume triggers
 * - JavaScript timers for in-app reminders
 */

import { Alert, AppState } from 'react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Notification types
export type NotificationType = 
  | 'hydration_reminder'
  | 'medication_reminder'
  | 'goal_completed'
  | 'overhydration_warning'
  | 'missed_log'
  | 'daily_summary'
  | 'streak_milestone'
  | 'behind_pace'
  | 'custom';

// Notification priority levels
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

interface NotificationConfig {
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  duration?: number; // in milliseconds for toast
  onPress?: () => void;
}

interface ReminderTimer {
  id: string;
  type: 'hydration' | 'medication';
  intervalMs: number;
  callback: () => void;
  timerId?: any; // Use any to support both browser and Node.js environments
}

class NotificationManager {
  private activeTimers: Map<string, ReminderTimer> = new Map();
  private appStateSubscription: any = null;
  private lastNotificationTime: Map<string, number> = new Map();

  /**
   * Initialize the notification manager with AppState listeners
   */
  initialize() {
    // Listen for app state changes to trigger reminders on resume
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        this.checkPendingReminders();
      }
    });
  }

  /**
   * Clean up timers and listeners
   */
  cleanup() {
    this.activeTimers.forEach(timer => {
      if (timer.timerId) {
        clearInterval(timer.timerId);
      }
    });
    this.activeTimers.clear();
    
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }

  /**
   * Show a toast notification
   */
  private showToast(config: NotificationConfig) {
    const { type, title, message, priority = 'medium', duration = 4000, onPress } = config;

    let toastType: 'success' | 'error' | 'info' = 'info';
    if (priority === 'critical' || type === 'overhydration_warning') {
      toastType = 'error';
    } else if (type === 'goal_completed' || type === 'streak_milestone') {
      toastType = 'success';
    }

    Toast.show({
      type: toastType,
      text1: title,
      text2: message,
      visibilityTime: duration,
      autoHide: true,
      position: 'top',
      topOffset: 50,
      onPress: onPress,
    });
  }

  /**
   * Show a system alert dialog
   */
  private showAlert(config: NotificationConfig) {
    const { title, message, onPress } = config;
    
    Alert.alert(
      title,
      message,
      [
        {
          text: 'OK',
          onPress: onPress,
        },
      ],
      { cancelable: true }
    );
  }

  /**
   * Check if enough time has passed since last notification of this type
   */
  private canShowNotification(type: NotificationType, minIntervalMs: number = 60000): boolean {
    const lastTime = this.lastNotificationTime.get(type) || 0;
    const now = Date.now();
    return (now - lastTime) >= minIntervalMs;
  }

  /**
   * Mark notification as shown
   */
  private markNotificationShown(type: NotificationType) {
    this.lastNotificationTime.set(type, Date.now());
  }

  // ==============================================
  // PUBLIC NOTIFICATION METHODS
  // ==============================================

  /**
   * Show hydration reminder
   */
  showHydrationReminder(amountMl: number, currentTotal: number, goal: number) {
    if (!this.canShowNotification('hydration_reminder', 2 * 60 * 60 * 1000)) {
      return; // Prevent spam - max once per 2 hours
    }

    const remaining = goal - currentTotal;
    this.showToast({
      type: 'hydration_reminder',
      title: '💧 Time to Hydrate!',
      message: `Drink ${amountMl}ml of water. ${remaining > 0 ? `${remaining}ml remaining today.` : 'Goal reached!'}`,
      priority: 'medium',
      duration: 5000,
    });

    this.markNotificationShown('hydration_reminder');
  }

  /**
   * Show medication reminder
   */
  showMedicationReminder(medicationName: string, dosage: string, time: string) {
    this.showAlert({
      type: 'medication_reminder',
      title: '💊 Medication Reminder',
      message: `Time to take ${medicationName}\nDosage: ${dosage}\nScheduled: ${time}`,
      priority: 'high',
    });

    this.markNotificationShown('medication_reminder');
  }

  /**
   * Show goal completion alert
   */
  showGoalCompletionAlert(goalType: 'hydration' | 'medication', goalValue: number | string) {
    this.showToast({
      type: 'goal_completed',
      title: '🎉 Goal Achieved!',
      message: goalType === 'hydration' 
        ? `You've reached your daily hydration goal of ${goalValue}ml!`
        : `You've completed your medication schedule!`,
      priority: 'medium',
      duration: 6000,
    });

    this.markNotificationShown('goal_completed');
  }

  /**
   * Show overhydration warning
   */
  showOverhydrationWarning(percentage: number, amount: number) {
    const severity = percentage >= 200 ? 'critical' : percentage >= 150 ? 'high' : 'medium';
    const title = percentage >= 200 
      ? '🚨 Critical Over-Hydration!'
      : percentage >= 150 
        ? '⚠️ Extreme Over-Hydration!'
        : '⚠️ Over-Hydration Alert';
    
    const message = percentage >= 200
      ? `You've consumed ${Math.round(percentage)}% of your goal (${amount}ml). Stop immediately and consult a healthcare professional if you feel unwell.`
      : percentage >= 150
        ? `You're at ${Math.round(percentage)}% of your goal (${amount}ml). Please slow down to avoid health risks.`
        : `You're at ${Math.round(percentage)}% of your goal. Consider slowing down.`;

    this.showAlert({
      type: 'overhydration_warning',
      title,
      message,
      priority: severity as NotificationPriority,
    });

    this.markNotificationShown('overhydration_warning');
  }

  /**
   * Show missed log reminder
   */
  showMissedLogReminder(type: 'hydration' | 'medication') {
    this.showToast({
      type: 'missed_log',
      title: '⏭️ Missed Reminder',
      message: type === 'hydration'
        ? 'Your missed hydration reminder has been logged.'
        : 'Your missed medication reminder has been logged.',
      priority: 'low',
      duration: 3000,
    });

    this.markNotificationShown('missed_log');
  }

  /**
   * Show behind pace alert
   */
  showBehindPaceAlert(remaining: number, goalType: 'hydration' = 'hydration') {
    if (!this.canShowNotification('behind_pace', 4 * 60 * 60 * 1000)) {
      return; // Max once per 4 hours
    }

    this.showToast({
      type: 'behind_pace',
      title: '⚡ Stay on Track!',
      message: `You're behind schedule! Drink ${remaining}ml more today to reach your goal.`,
      priority: 'medium',
      duration: 5000,
    });

    this.markNotificationShown('behind_pace');
  }

  /**
   * Show daily summary
   */
  showDailySummary(stats: {
    hydrationPercentage: number;
    hydrationTotal: number;
    medicationsTaken: number;
    medicationsTotal: number;
  }) {
    const { hydrationPercentage, hydrationTotal, medicationsTaken, medicationsTotal } = stats;
    
    this.showToast({
      type: 'daily_summary',
      title: '📊 Daily Summary',
      message: `Hydration: ${Math.round(hydrationPercentage)}% (${hydrationTotal}ml)\nMedications: ${medicationsTaken}/${medicationsTotal} taken`,
      priority: 'low',
      duration: 6000,
    });

    this.markNotificationShown('daily_summary');
  }

  /**
   * Show streak milestone
   */
  showStreakMilestone(days: number) {
    this.showToast({
      type: 'streak_milestone',
      title: '🔥 Streak Milestone!',
      message: `Amazing! You've maintained your health routine for ${days} days straight!`,
      priority: 'medium',
      duration: 5000,
    });

    this.markNotificationShown('streak_milestone');
  }

  /**
   * Show custom notification
   */
  showCustomNotification(title: string, message: string, type: 'toast' | 'alert' = 'toast', priority: NotificationPriority = 'medium') {
    if (type === 'alert') {
      this.showAlert({
        type: 'custom',
        title,
        message,
        priority,
      });
    } else {
      this.showToast({
        type: 'custom',
        title,
        message,
        priority,
      });
    }
  }

  // ==============================================
  // REMINDER SCHEDULING (IN-APP TIMERS)
  // ==============================================

  /**
   * Schedule hydration reminder (runs while app is open)
   */
  scheduleHydrationReminder(intervalMinutes: number, callback: () => void): string {
    const id = `hydration_${Date.now()}`;
    const intervalMs = intervalMinutes * 60 * 1000;

    const timer: ReminderTimer = {
      id,
      type: 'hydration',
      intervalMs,
      callback,
    };

    // Set interval to trigger callback
    timer.timerId = setInterval(() => {
      callback();
    }, intervalMs);

    this.activeTimers.set(id, timer);
    
    // Store reminder info for resume checks
    this.storeReminderInfo(id, { type: 'hydration', intervalMinutes, lastTrigger: Date.now() });

    return id;
  }

  /**
   * Schedule medication reminder (runs while app is open)
   */
  scheduleMedicationReminder(targetTime: Date, callback: () => void): string {
    const id = `medication_${Date.now()}`;
    const now = Date.now();
    const targetMs = targetTime.getTime();
    const delayMs = targetMs - now;

    if (delayMs <= 0) {
      // Time already passed, trigger immediately
      callback();
      return id;
    }

    const timer: ReminderTimer = {
      id,
      type: 'medication',
      intervalMs: delayMs,
      callback,
    };

    // Set timeout to trigger callback at specific time
    timer.timerId = setTimeout(() => {
      callback();
      this.activeTimers.delete(id);
    }, delayMs);

    this.activeTimers.set(id, timer);
    
    // Store reminder info
    this.storeReminderInfo(id, { type: 'medication', targetTime: targetMs, lastTrigger: Date.now() });

    return id;
  }

  /**
   * Cancel a scheduled reminder
   */
  cancelReminder(id: string) {
    const timer = this.activeTimers.get(id);
    if (timer && timer.timerId) {
      clearTimeout(timer.timerId);
      clearInterval(timer.timerId);
      this.activeTimers.delete(id);
      this.removeReminderInfo(id);
    }
  }

  /**
   * Cancel all reminders of a specific type
   */
  cancelAllReminders(type?: 'hydration' | 'medication') {
    this.activeTimers.forEach((timer, id) => {
      if (!type || timer.type === type) {
        if (timer.timerId) {
          clearTimeout(timer.timerId);
          clearInterval(timer.timerId);
        }
        this.activeTimers.delete(id);
        this.removeReminderInfo(id);
      }
    });
  }

  /**
   * Check for pending reminders when app resumes
   */
  private async checkPendingReminders() {
    try {
      const stored = await AsyncStorage.getItem('reminder_info');
      if (!stored) return;

      const reminders = JSON.parse(stored);
      const now = Date.now();

      Object.entries(reminders).forEach(([id, info]: [string, any]) => {
        if (info.type === 'hydration') {
          const timeSinceLastTrigger = now - info.lastTrigger;
          const intervalMs = info.intervalMinutes * 60 * 1000;
          
          if (timeSinceLastTrigger >= intervalMs) {
            // Should have triggered while app was closed
            this.showHydrationReminder(250, 0, 2000); // Default values
          }
        } else if (info.type === 'medication') {
          const targetTime = info.targetTime;
          const tolerance = 30 * 60 * 1000; // 30 minute window
          
          if (now >= targetTime && now <= (targetTime + tolerance)) {
            // Within reminder window
            this.showMedicationReminder('Medication', 'Check schedule', new Date(targetTime).toLocaleTimeString());
          }
        }
      });
    } catch (error) {
      console.error('Error checking pending reminders:', error);
    }
  }

  /**
   * Store reminder info for persistence
   */
  private async storeReminderInfo(id: string, info: any) {
    try {
      const stored = await AsyncStorage.getItem('reminder_info');
      const reminders = stored ? JSON.parse(stored) : {};
      reminders[id] = info;
      await AsyncStorage.setItem('reminder_info', JSON.stringify(reminders));
    } catch (error) {
      console.error('Error storing reminder info:', error);
    }
  }

  /**
   * Remove reminder info
   */
  private async removeReminderInfo(id: string) {
    try {
      const stored = await AsyncStorage.getItem('reminder_info');
      if (!stored) return;
      
      const reminders = JSON.parse(stored);
      delete reminders[id];
      await AsyncStorage.setItem('reminder_info', JSON.stringify(reminders));
    } catch (error) {
      console.error('Error removing reminder info:', error);
    }
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();
export default notificationManager;
