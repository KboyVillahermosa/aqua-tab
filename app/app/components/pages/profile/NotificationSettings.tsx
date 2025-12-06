import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { notificationSettings, NotificationPreference, NotificationCategory, RingtoneOption } from '../../../services/notificationSettings';

export default function NotificationSettings() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // State management
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [masterToggle, setMasterToggle] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);
  const [currentRingtone, setCurrentRingtone] = useState<string>('default');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showRingtonePicker, setShowRingtonePicker] = useState(false);

  // Initialize service and load preferences
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        setLoading(true);
        await notificationSettings.initialize();
        
        // Load current settings
        const settings = notificationSettings.getSettings();
        setMasterToggle(settings.masterToggle);
        setSoundEnabled(settings.soundEnabled);
        setVibrationEnabled(settings.vibrationEnabled);
        setCurrentRingtone(settings.ringtone);
        
        // Load preferences
        const prefs = notificationSettings.getPreferencesForUI();
        setPreferences(prefs);
      } catch (error) {
        console.error('Error initializing notification settings:', error);
        Alert.alert('Error', 'Failed to load notification settings');
      } finally {
        setLoading(false);
      }
    };

    initializeSettings();
  }, []);

  // Master toggle handler
  const handleMasterToggle = useCallback(async (value: boolean) => {
    try {
      setSaving(true);
      setMasterToggle(value);
      await notificationSettings.setMasterToggle(value);
    } catch (error) {
      Alert.alert('Error', 'Failed to update master toggle');
      setMasterToggle(!value);
    } finally {
      setSaving(false);
    }
  }, []);

  // Sound toggle handler
  const handleSoundToggle = useCallback(async (value: boolean) => {
    try {
      setSaving(true);
      setSoundEnabled(value);
      await notificationSettings.setSoundEnabled(value);
    } catch (error) {
      Alert.alert('Error', 'Failed to update sound setting');
      setSoundEnabled(!value);
    } finally {
      setSaving(false);
    }
  }, []);

  // Vibration toggle handler
  const handleVibrationToggle = useCallback(async (value: boolean) => {
    try {
      setSaving(true);
      setVibrationEnabled(value);
      await notificationSettings.setVibrationEnabled(value);
    } catch (error) {
      Alert.alert('Error', 'Failed to update vibration setting');
      setVibrationEnabled(!value);
    } finally {
      setSaving(false);
    }
  }, []);

  // Category toggle handler
  const handleCategoryToggle = useCallback(async (category: NotificationCategory) => {
    try {
      setSaving(true);
      await notificationSettings.updateCategoryWithBackend(
        category,
        !preferences.find(p => p.type === category)?.enabled,
        token as string
      );
      
      // Update local state
      const updated = preferences.map(pref =>
        pref.type === category ? { ...pref, enabled: !pref.enabled } : pref
      );
      setPreferences(updated);
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification preference');
    } finally {
      setSaving(false);
    }
  }, [preferences, token]);

  // Ringtone selection
  const handleSelectRingtone = useCallback(async (ringtoneId: string) => {
    // Check if premium
    const isPremium = notificationSettings.getPremiumRingtones().some(r => r.id === ringtoneId);
    if (isPremium) {
      Alert.alert('Premium Feature', 'This ringtone is available for Premium users.');
      return;
    }

    try {
      setSaving(true);
      setCurrentRingtone(ringtoneId);
      await notificationSettings.setRingtone(ringtoneId);
      setShowRingtonePicker(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update ringtone');
      // Revert
      setCurrentRingtone(currentRingtone);
    } finally {
      setSaving(false);
    }
  }, [currentRingtone]);

  const availableRingtones = useMemo(() => notificationSettings.getAvailableRingtones(), []);
  const premiumRingtones = useMemo(() => notificationSettings.getPremiumRingtones(), []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Notification Settings</Text>
          <View style={styles.spacer} />
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#1E3A8A" />
        ) : (
          <View style={styles.content}>
            {/* Master Toggle */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Master Control</Text>
              <View style={styles.settingCard}>
                <View style={styles.settingHeader}>
                  <View style={styles.settingIcon}>
                    <Ionicons name="notifications" size={20} color="#1E3A8A" />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Allow Notifications</Text>
                    <Text style={styles.settingDescription}>
                      Enable all notification types
                    </Text>
                  </View>
                  <Switch
                    value={masterToggle}
                    onValueChange={handleMasterToggle}
                    disabled={saving}
                  />
                </View>
              </View>
            </View>

            {/* Sound & Vibration Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sound & Vibration</Text>
              
              {/* Sound Toggle */}
              <View style={styles.settingCard}>
                <View style={styles.settingHeader}>
                  <View style={styles.settingIcon}>
                    <Ionicons name="volume-high" size={20} color="#10B981" />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Sound</Text>
                    <Text style={styles.settingDescription}>
                      Play notification sounds
                    </Text>
                  </View>
                  <Switch
                    value={soundEnabled}
                    onValueChange={handleSoundToggle}
                    disabled={saving || !masterToggle}
                  />
                </View>
              </View>

              {/* Vibration Toggle */}
              <View style={styles.settingCard}>
                <View style={styles.settingHeader}>
                  <View style={styles.settingIcon}>
                    <Ionicons name="phone-portrait" size={20} color="#F59E0B" />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Vibration</Text>
                    <Text style={styles.settingDescription}>
                      Enable haptic feedback
                    </Text>
                  </View>
                  <Switch
                    value={vibrationEnabled}
                    onValueChange={handleVibrationToggle}
                    disabled={saving || !masterToggle}
                  />
                </View>
              </View>

              {/* Ringtone Selection */}
              <TouchableOpacity 
                style={styles.settingCard}
                onPress={() => setShowRingtonePicker(true)}
                disabled={saving || !masterToggle}
              >
                <View style={styles.settingHeader}>
                  <View style={styles.settingIcon}>
                    <Ionicons name="musical-notes" size={20} color="#8B5CF6" />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Ringtone</Text>
                    <Text style={styles.settingDescription}>
                      {currentRingtone === 'default' ? 'Default tone' : currentRingtone}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Notification Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notification Categories</Text>
              <Text style={styles.sectionDescription}>
                Choose which types of notifications you want to receive
              </Text>

              {preferences.map((pref) => (
                <View key={pref.id} style={styles.settingCard}>
                  <View style={styles.settingHeader}>
                    <View style={styles.settingIcon}>
                      <Ionicons name={pref.icon as any} size={20} color="#1E3A8A" />
                    </View>
                    <View style={styles.settingContent}>
                      <Text style={styles.settingTitle}>{pref.title}</Text>
                      <Text style={styles.settingDescription}>
                        {pref.description}
                      </Text>
                    </View>
                    <Switch
                      value={pref.enabled}
                      onValueChange={() => handleCategoryToggle(pref.type)}
                      disabled={saving || !masterToggle}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={24} color="#1E3A8A" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>About Notifications</Text>
                <Text style={styles.infoText}>
                  When notifications are disabled, you won't receive any alerts. However, you can still view your activity history in the Activity tab.
                </Text>
              </View>
            </View>

            {/* Reset Button */}
            <TouchableOpacity 
              style={styles.dangerButton}
              onPress={() => {
                Alert.alert(
                  'Reset Settings',
                  'This will reset all notification settings to defaults. Continue?',
                  [
                    { text: 'Cancel', onPress: () => {}, style: 'cancel' },
                    {
                      text: 'Reset',
                      onPress: async () => {
                        try {
                          setSaving(true);
                          await notificationSettings.resetToDefaults();
                          const settings = notificationSettings.getSettings();
                          setMasterToggle(settings.masterToggle);
                          setSoundEnabled(settings.soundEnabled);
                          setVibrationEnabled(settings.vibrationEnabled);
                          setCurrentRingtone(settings.ringtone);
                          setPreferences(notificationSettings.getPreferencesForUI());
                          Alert.alert('Success', 'Settings reset to defaults');
                        } catch (error) {
                          Alert.alert('Error', 'Failed to reset settings');
                        } finally {
                          setSaving(false);
                        }
                      },
                      style: 'destructive',
                    },
                  ]
                );
              }}
              disabled={saving}
            >
              <Ionicons name="refresh" size={18} color="#EF4444" />
              <Text style={styles.dangerButtonText}>Reset to Defaults</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Ringtone Picker Modal */}
      <Modal
        visible={showRingtonePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRingtonePicker(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowRingtonePicker(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Ringtone</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Available Ringtones */}
            <Text style={styles.ringtoneCategory}>Standard Ringtones</Text>
            {availableRingtones.map((ringtone) => (
              <TouchableOpacity
                key={ringtone.id}
                style={[
                  styles.ringtoneOption,
                  currentRingtone === ringtone.id && styles.ringtoneOptionSelected,
                ]}
                onPress={() => handleSelectRingtone(ringtone.id)}
              >
                <Ionicons
                  name={currentRingtone === ringtone.id ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={currentRingtone === ringtone.id ? '#1E3A8A' : '#9CA3AF'}
                />
                <Text
                  style={[
                    styles.ringtoneOptionText,
                    currentRingtone === ringtone.id && styles.ringtoneOptionTextSelected,
                  ]}
                >
                  {ringtone.name}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Premium Ringtones */}
            <Text style={styles.ringtoneCategory}>Premium Ringtones</Text>
            {premiumRingtones.map((ringtone) => (
              <TouchableOpacity
                key={ringtone.id}
                style={[styles.ringtoneOption, styles.ringtoneOptionPremium]}
                onPress={() => handleSelectRingtone(ringtone.id)}
              >
                <Ionicons name="lock-closed" size={24} color="#F59E0B" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.ringtoneOptionText}>{ringtone.name}</Text>
                  <Text style={styles.ringtoneOptionSubtext}>Premium</Text>
                </View>
                <Ionicons name="diamond" size={18} color="#F59E0B" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  spacer: {
    width: 24,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  settingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginVertical: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#1E3A8A',
    lineHeight: 18,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    marginVertical: 24,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  ringtoneCategory: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 12,
  },
  ringtoneOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ringtoneOptionSelected: {
    backgroundColor: '#EBF8FF',
    borderColor: '#BFDBFE',
  },
  ringtoneOptionPremium: {
    opacity: 0.7,
  },
  ringtoneOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  ringtoneOptionTextSelected: {
    color: '#1E3A8A',
  },
  ringtoneOptionSubtext: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
    marginTop: 2,
  },
});
