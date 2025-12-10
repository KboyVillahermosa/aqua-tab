/**
 * NotificationSettings.tsx
 * Subscription-aware notification preferences with premium gating.
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../../api';

const HEALTH_TIPS = [
  {
    id: 1,
    title: 'Stay Hydrated',
    description: 'Drink at least 2L (8 glasses) of water daily for optimal health.',
    icon: 'water' as const,
  },
  {
    id: 2,
    title: 'Take Medicines After Meals',
    description: 'Most medications are better absorbed with food and reduce stomach irritation.',
    icon: 'restaurant' as const,
  },
  {
    id: 3,
    title: 'Consistent Timing',
    description: 'Take medications at the same time each day for maximum effectiveness.',
    icon: 'time' as const,
  },
  {
    id: 4,
    title: 'Store Properly',
    description: 'Keep medicines in a cool, dry place away from direct sunlight.',
    icon: 'shield-checkmark' as const,
  },
  {
    id: 5,
    title: 'Check Expiry Dates',
    description: 'Always verify medication expiry dates before consumption.',
    icon: 'calendar' as const,
  },
  {
    id: 6,
    title: 'Morning Hydration',
    description: 'Start your day with a glass of water to kickstart metabolism.',
    icon: 'sunny' as const,
  },
];

interface Subscription {
  plan_slug: 'free' | 'plus' | 'premium';
  is_active: boolean;
}

export default function NotificationSettings() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const authToken = Array.isArray(token) ? token[0] : token;

  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const [masterToggle, setMasterToggle] = useState(true);
  const [medicationReminders, setMedicationReminders] = useState(true);
  const [hydrationReminders, setHydrationReminders] = useState(true);
  const [refillReminders, setRefillReminders] = useState(true);
  const [healthTips, setHealthTips] = useState(false);
  const [appUpdates, setAppUpdates] = useState(true);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const sub = await api.get('/subscription/current', authToken as string, 3000);
        setSubscription(sub || { plan_slug: 'free', is_active: false });
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setSubscription({ plan_slug: 'free', is_active: false });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [authToken]);

  const isPremium = subscription?.plan_slug === 'premium';
  const isPlusOrPremium = subscription?.plan_slug === 'plus' || subscription?.plan_slug === 'premium';

  const handleMasterToggle = (value: boolean) => {
    setMasterToggle(value);
    if (!value && healthTips) {
      setHealthTips(false);
    }
  };

  const handleHealthTipsToggle = (value: boolean) => {
    if (!isPremium && value) {
      Alert.alert(
        'Premium Feature',
        'Unlock Premium to enable Smart Health Tips with personalized medication and hydration insights.',
        [{ text: 'OK' }]
      );
      return;
    }
    setHealthTips(value);
  };

  const handleRingtonePress = () => {
    if (!isPlusOrPremium) {
      Alert.alert(
        'Plus Feature',
        'Upgrade to Plus or Premium to customize notification sounds with custom ringtones.',
        [{ text: 'OK' }]
      );
      return;
    }
    Alert.alert('Ringtone', 'Custom ringtone picker coming soon!');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Notification Settings</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Master Control</Text>
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={[styles.settingIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="notifications" size={20} color="#1E3A8A" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Allow Notifications</Text>
                  <Text style={styles.settingDescription}>Enable all notification types</Text>
                </View>
                <Switch
                  value={masterToggle}
                  onValueChange={handleMasterToggle}
                  trackColor={{ false: '#D1D5DB', true: '#1E3A8A' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reminder Types</Text>

            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={[styles.settingIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="medkit" size={20} color="#1E3A8A" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingTitle, !masterToggle && styles.disabledText]}>Medication Reminders</Text>
                  <Text style={[styles.settingDescription, !masterToggle && styles.disabledText]}>
                    Get notified when it's time to take your meds
                  </Text>
                </View>
                <Switch
                  value={medicationReminders && masterToggle}
                  onValueChange={setMedicationReminders}
                  disabled={!masterToggle}
                  trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={[styles.settingIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="water" size={20} color="#3B82F6" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingTitle, !masterToggle && styles.disabledText]}>Hydration Reminders</Text>
                  <Text style={[styles.settingDescription, !masterToggle && styles.disabledText]}>
                    Smart reminders to meet your daily water goals
                  </Text>
                </View>
                <Switch
                  value={hydrationReminders && masterToggle}
                  onValueChange={setHydrationReminders}
                  disabled={!masterToggle}
                  trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={[styles.settingIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="calendar" size={20} color="#8B5CF6" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingTitle, !masterToggle && styles.disabledText]}>Refill Reminders</Text>
                  <Text style={[styles.settingDescription, !masterToggle && styles.disabledText]}>
                    Get alerted before your prescriptions run out
                  </Text>
                </View>
                <Switch
                  value={refillReminders && masterToggle}
                  onValueChange={setRefillReminders}
                  disabled={!masterToggle}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <View style={[styles.settingCard, styles.tipsAccentCard]}>
              <View style={styles.settingRow}>
                <View style={[styles.settingIcon, styles.tipsAccentIcon]}>
                  <Ionicons name="sparkles" size={20} color="#B45309" />
                </View>
                <View style={styles.settingContent}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.settingTitle, (!masterToggle || !isPremium) && styles.disabledText]}>Smart Health Tips</Text>
                    {!isPremium && (
                      <View style={styles.premiumBadge}>
                        <Ionicons name="star" size={10} color="#FFFFFF" />
                        <Text style={styles.premiumBadgeText}>Premium</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.settingDescription, styles.tipsAccentText, (!masterToggle || !isPremium) && styles.disabledText]}>
                    Personalized wellness tips based on your meds and hydration
                  </Text>
                </View>
                <Switch
                  value={healthTips && masterToggle}
                  onValueChange={handleHealthTipsToggle}
                  disabled={!masterToggle}
                  trackColor={{ false: '#D1D5DB', true: '#F59E0B' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System Notifications</Text>
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={[styles.settingIcon, { backgroundColor: '#E5E7EB' }]}>
                  <Ionicons name="cloud-download" size={20} color="#4B5563" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingTitle, !masterToggle && styles.disabledText]}>App Updates</Text>
                  <Text style={[styles.settingDescription, !masterToggle && styles.disabledText]}>
                    Be notified about new features and updates
                  </Text>
                </View>
                <Switch
                  value={appUpdates && masterToggle}
                  onValueChange={setAppUpdates}
                  disabled={!masterToggle}
                  trackColor={{ false: '#D1D5DB', true: '#6366F1' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sound & Haptics</Text>
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={[styles.settingIcon, { backgroundColor: '#ECFDF3' }]}>
                  <Ionicons name="volume-high" size={20} color="#10B981" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingTitle, !masterToggle && styles.disabledText]}>Sound</Text>
                  <Text style={[styles.settingDescription, !masterToggle && styles.disabledText]}>Enable notification sounds</Text>
                </View>
                <Switch
                  value={soundEnabled && masterToggle}
                  onValueChange={setSoundEnabled}
                  disabled={!masterToggle}
                  trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={[styles.settingIcon, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="phone-portrait" size={20} color="#F59E0B" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingTitle, !masterToggle && styles.disabledText]}>Vibration</Text>
                  <Text style={[styles.settingDescription, !masterToggle && styles.disabledText]}>Enable haptic feedback</Text>
                </View>
                <Switch
                  value={vibrationEnabled && masterToggle}
                  onValueChange={setVibrationEnabled}
                  disabled={!masterToggle}
                  trackColor={{ false: '#D1D5DB', true: '#F59E0B' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.settingCard, styles.ringtoneAccentCard, (!masterToggle || !isPlusOrPremium) && styles.disabledCard]}
              onPress={handleRingtonePress}
              disabled={!masterToggle}
            >
              <View style={styles.settingRow}>
                <View style={[styles.settingIcon, styles.ringtoneAccentIcon]}>
                  <Ionicons name="musical-notes" size={20} color="#4338CA" />
                </View>
                <View style={styles.settingContent}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.settingTitle, (!masterToggle || !isPlusOrPremium) && styles.disabledText]}>
                      Ringtone
                    </Text>
                    {!isPlusOrPremium && (
                      <View style={[styles.premiumBadge, { backgroundColor: '#3B82F6' }]}>
                        <Ionicons name="star" size={10} color="#FFFFFF" />
                        <Text style={styles.premiumBadgeText}>Plus</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.settingDescription, styles.ringtoneAccentText, (!masterToggle || !isPlusOrPremium) && styles.disabledText]}>
                    {isPlusOrPremium ? 'Default tone · tap to change' : 'Upgrade to customize notification sounds'}
                  </Text>
                </View>
                {isPlusOrPremium ? (
                  <Ionicons name="chevron-forward" size={20} color={masterToggle ? '#9CA3AF' : '#D1D5DB'} />
                ) : (
                  <Ionicons name="lock-closed" size={20} color="#F59E0B" />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {healthTips && isPremium && masterToggle && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sample Health Tips</Text>
              <Text style={styles.sectionSubtitle}>You'll receive tips like these periodically:</Text>

              {HEALTH_TIPS.slice(0, 3).map((tip) => (
                <View key={tip.id} style={styles.tipCard}>
                  <View style={[styles.tipIcon, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name={tip.icon as any} size={24} color="#F59E0B" />
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    <Text style={styles.tipDescription}>{tip.description}</Text>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All Tips</Text>
                <Ionicons name="arrow-forward" size={16} color="#1E3A8A" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color="#6366F1" />
            <Text style={styles.infoBannerText}>Notification settings are synced across all your devices.</Text>
          </View>

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
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
    paddingBottom: 20,
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
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  settingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledCard: {
    opacity: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  disabledText: {
    color: '#D1D5DB',
  },
  tipsAccentCard: {
    borderWidth: 1,
    borderColor: '#FCD34D',
    backgroundColor: '#FFFBEB',
  },
  tipsAccentIcon: {
    backgroundColor: '#FEF3C7',
  },
  tipsAccentText: {
    color: '#92400E',
  },
  ringtoneAccentCard: {
    borderWidth: 1,
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
  },
  ringtoneAccentIcon: {
    backgroundColor: '#E0E7FF',
  },
  ringtoneAccentText: {
    color: '#312E81',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#4F46E5',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});
