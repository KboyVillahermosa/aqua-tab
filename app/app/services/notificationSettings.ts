/**
 * Notification Settings Service
 * =============================
 * Handles all notification preferences and configuration
 * Manages: master toggle, ringtones, vibration, category toggles
 * 
 * Expo Go Compatible: Uses AsyncStorage only, no native modules
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../api';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface NotificationPreference {
  id: string;
  type: NotificationCategory;
  enabled: boolean;
  title: string;
  description: string;
  icon: string;
}

export type NotificationCategory = 'medications' | 'hydration' | 'appointments' | 'health_tips' | 'updates';

export interface NotificationSettings {
  masterToggle: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  ringtone: string;
  categories: Record<NotificationCategory, boolean>;
}

export interface RingtoneOption {
  id: string;
  name: string;
  file?: string;
  isPremium?: boolean;
}

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  MASTER_TOGGLE: 'notification_master_toggle',
  SOUND_ENABLED: 'notification_sound_enabled',
  VIBRATION_ENABLED: 'notification_vibration_enabled',
  RINGTONE: 'notification_ringtone',
  CATEGORY_PREFIX: 'notification_category_',
  PREFERENCES_CACHE: 'notification_preferences_cache',
} as const;

// ============================================================================
// Default Settings
// ============================================================================

const DEFAULT_SETTINGS: NotificationSettings = {
  masterToggle: true,
  soundEnabled: true,
  vibrationEnabled: true,
  ringtone: 'default',
  categories: {
    medications: true,
    hydration: true,
    appointments: true,
    health_tips: false,
    updates: false,
  },
};

const DEFAULT_PREFERENCES: NotificationPreference[] = [
  {
    id: 'med',
    type: 'medications',
    enabled: true,
    title: 'Medication Reminders',
    description: 'Get reminded when it\'s time to take your medications',
    icon: 'medical',
  },
  {
    id: 'hydration',
    type: 'hydration',
    enabled: true,
    title: 'Hydration Reminders',
    description: 'Get reminded to drink water throughout the day',
    icon: 'water',
  },
  {
    id: 'appointments',
    type: 'appointments',
    enabled: true,
    title: 'Appointment Reminders',
    description: 'Get reminded about upcoming health appointments',
    icon: 'calendar',
  },
  {
    id: 'health_tips',
    type: 'health_tips',
    enabled: false,
    title: 'Health Tips',
    description: 'Receive personalized health and wellness tips',
    icon: 'bulb',
  },
  {
    id: 'updates',
    type: 'updates',
    enabled: false,
    title: 'App Updates',
    description: 'Get notified about new features and improvements',
    icon: 'star',
  },
];

const AVAILABLE_RINGTONES: RingtoneOption[] = [
  { id: 'default', name: 'Default' },
  { id: 'chime', name: 'Chime' },
  { id: 'bell', name: 'Bell' },
  { id: 'alert', name: 'Alert' },
  { id: 'vibrate_only', name: 'Vibrate Only' },
];

const PREMIUM_RINGTONES: RingtoneOption[] = [
  { id: 'custom', name: 'Upload Custom', isPremium: true },
  { id: 'nature', name: 'Nature Sounds', isPremium: true },
  { id: 'meditation', name: 'Meditation', isPremium: true },
];

// ============================================================================
// NotificationSettingsService Class
// ============================================================================

class NotificationSettingsService {
  private initialized = false;
  private currentSettings: NotificationSettings = { ...DEFAULT_SETTINGS };

  /**
   * Initialize the service and load settings from storage
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.loadSettingsFromStorage();
      this.initialized = true;
      console.log('✅ NotificationSettingsService initialized');
    } catch (error) {
      console.error('❌ Failed to initialize NotificationSettingsService:', error);
      // Fall back to defaults
      this.currentSettings = { ...DEFAULT_SETTINGS };
      this.initialized = true;
    }
  }

  /**
   * Load all settings from AsyncStorage
   */
  private async loadSettingsFromStorage(): Promise<void> {
    try {
      const masterToggle = await AsyncStorage.getItem(STORAGE_KEYS.MASTER_TOGGLE);
      const soundEnabled = await AsyncStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
      const vibrationEnabled = await AsyncStorage.getItem(STORAGE_KEYS.VIBRATION_ENABLED);
      const ringtone = await AsyncStorage.getItem(STORAGE_KEYS.RINGTONE);

      this.currentSettings = {
        masterToggle: masterToggle !== 'false',
        soundEnabled: soundEnabled !== 'false',
        vibrationEnabled: vibrationEnabled !== 'false',
        ringtone: ringtone || 'default',
        categories: await this.loadCategoriesFromStorage(),
      };
    } catch (error) {
      console.error('Error loading settings from storage:', error);
    }
  }

  /**
   * Load category toggles from storage
   */
  private async loadCategoriesFromStorage(): Promise<Record<NotificationCategory, boolean>> {
    const categories = { ...DEFAULT_SETTINGS.categories };

    try {
      for (const category of Object.keys(categories) as NotificationCategory[]) {
        const stored = await AsyncStorage.getItem(`${STORAGE_KEYS.CATEGORY_PREFIX}${category}`);
        if (stored !== null) {
          categories[category] = stored === 'true';
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }

    return categories;
  }

  /**
   * Get current settings
   */
  getSettings(): NotificationSettings {
    return { ...this.currentSettings };
  }

  /**
   * Get preferences for UI
   */
  getPreferences(): NotificationPreference[] {
    return DEFAULT_PREFERENCES.map(pref => ({
      ...pref,
      enabled: this.currentSettings.categories[pref.type] || false,
    }));
  }

  /**
   * Toggle master notification switch
   */
  async setMasterToggle(enabled: boolean): Promise<void> {
    try {
      this.currentSettings.masterToggle = enabled;
      await AsyncStorage.setItem(STORAGE_KEYS.MASTER_TOGGLE, enabled ? 'true' : 'false');
      console.log(`🔔 Master toggle: ${enabled ? 'ON' : 'OFF'}`);
    } catch (error) {
      console.error('Error setting master toggle:', error);
      throw error;
    }
  }

  /**
   * Toggle sound notifications
   */
  async setSoundEnabled(enabled: boolean): Promise<void> {
    try {
      this.currentSettings.soundEnabled = enabled;
      await AsyncStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, enabled ? 'true' : 'false');
      console.log(`🔊 Sound: ${enabled ? 'ON' : 'OFF'}`);
    } catch (error) {
      console.error('Error setting sound:', error);
      throw error;
    }
  }

  /**
   * Toggle vibration
   */
  async setVibrationEnabled(enabled: boolean): Promise<void> {
    try {
      this.currentSettings.vibrationEnabled = enabled;
      await AsyncStorage.setItem(STORAGE_KEYS.VIBRATION_ENABLED, enabled ? 'true' : 'false');
      console.log(`📳 Vibration: ${enabled ? 'ON' : 'OFF'}`);
    } catch (error) {
      console.error('Error setting vibration:', error);
      throw error;
    }
  }

  /**
   * Set ringtone
   */
  async setRingtone(ringtoneId: string): Promise<void> {
    try {
      this.currentSettings.ringtone = ringtoneId;
      await AsyncStorage.setItem(STORAGE_KEYS.RINGTONE, ringtoneId);
      console.log(`🎵 Ringtone set to: ${ringtoneId}`);
    } catch (error) {
      console.error('Error setting ringtone:', error);
      throw error;
    }
  }

  /**
   * Toggle category notification
   */
  async toggleCategory(category: NotificationCategory): Promise<void> {
    try {
      const currentState = this.currentSettings.categories[category] || false;
      this.currentSettings.categories[category] = !currentState;
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.CATEGORY_PREFIX}${category}`,
        this.currentSettings.categories[category] ? 'true' : 'false'
      );
      console.log(`📌 ${category}: ${this.currentSettings.categories[category] ? 'ON' : 'OFF'}`);
    } catch (error) {
      console.error(`Error toggling category ${category}:`, error);
      throw error;
    }
  }

  /**
   * Update category with backend sync
   */
  async updateCategoryWithBackend(
    category: NotificationCategory,
    enabled: boolean,
    token?: string
  ): Promise<void> {
    try {
      // Update locally first
      this.currentSettings.categories[category] = enabled;
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.CATEGORY_PREFIX}${category}`,
        enabled ? 'true' : 'false'
      );

      // Sync with backend if token available
      if (token) {
        await api.put(
          `/notifications/preferences/${category}`,
          { enabled },
          token
        );
      }

      console.log(`✅ ${category} updated: ${enabled ? 'ON' : 'OFF'}`);
    } catch (error) {
      console.error(`Error updating category ${category}:`, error);
      throw error;
    }
  }

  /**
   * Get available ringtones
   */
  getAvailableRingtones(): RingtoneOption[] {
    return [...AVAILABLE_RINGTONES];
  }

  /**
   * Get premium ringtones
   */
  getPremiumRingtones(): RingtoneOption[] {
    return [...PREMIUM_RINGTONES];
  }

  /**
   * Get current ringtone
   */
  getCurrentRingtone(): string {
    return this.currentSettings.ringtone;
  }

  /**
   * Check if category is enabled
   */
  isCategoryEnabled(category: NotificationCategory): boolean {
    return this.currentSettings.masterToggle && (this.currentSettings.categories[category] || false);
  }

  /**
   * Check if any notifications are enabled
   */
  areNotificationsEnabled(): boolean {
    return this.currentSettings.masterToggle;
  }

  /**
   * Get all preferences as UI-ready objects
   */
  getPreferencesForUI(): NotificationPreference[] {
    return this.getPreferences();
  }

  /**
   * Sync all settings with backend
   */
  async syncWithBackend(token: string): Promise<void> {
    try {
      const settingsToSync = {
        master_toggle: this.currentSettings.masterToggle,
        sound_enabled: this.currentSettings.soundEnabled,
        vibration_enabled: this.currentSettings.vibrationEnabled,
        ringtone: this.currentSettings.ringtone,
        categories: this.currentSettings.categories,
      };

      await api.put('/user/notification-settings', settingsToSync, token);
      console.log('✅ Settings synced with backend');
    } catch (error) {
      console.error('Error syncing with backend:', error);
      throw error;
    }
  }

  /**
   * Reset all settings to defaults
   */
  async resetToDefaults(): Promise<void> {
    try {
      this.currentSettings = { ...DEFAULT_SETTINGS };

      await AsyncStorage.multiSet([
        [STORAGE_KEYS.MASTER_TOGGLE, 'true'],
        [STORAGE_KEYS.SOUND_ENABLED, 'true'],
        [STORAGE_KEYS.VIBRATION_ENABLED, 'true'],
        [STORAGE_KEYS.RINGTONE, 'default'],
      ]);

      // Reset categories
      for (const category of Object.keys(DEFAULT_SETTINGS.categories) as NotificationCategory[]) {
        const value = DEFAULT_SETTINGS.categories[category];
        await AsyncStorage.setItem(
          `${STORAGE_KEYS.CATEGORY_PREFIX}${category}`,
          value ? 'true' : 'false'
        );
      }

      console.log('🔄 Settings reset to defaults');
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  }

  /**
   * Clear all settings
   */
  async clearAll(): Promise<void> {
    try {
      const keysToRemove: string[] = [
        STORAGE_KEYS.MASTER_TOGGLE,
        STORAGE_KEYS.SOUND_ENABLED,
        STORAGE_KEYS.VIBRATION_ENABLED,
        STORAGE_KEYS.RINGTONE,
        STORAGE_KEYS.PREFERENCES_CACHE,
      ];

      // Add category keys
      for (const category of Object.keys(DEFAULT_SETTINGS.categories) as NotificationCategory[]) {
        keysToRemove.push(`${STORAGE_KEYS.CATEGORY_PREFIX}${category}`);
      }

      await AsyncStorage.multiRemove(keysToRemove);
      this.currentSettings = { ...DEFAULT_SETTINGS };
      console.log('🗑️ All settings cleared');
    } catch (error) {
      console.error('Error clearing settings:', error);
      throw error;
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const notificationSettings = new NotificationSettingsService();
