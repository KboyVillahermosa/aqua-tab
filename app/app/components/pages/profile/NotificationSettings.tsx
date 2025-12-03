import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as api from '../../../api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NotificationPreference {
  id: string;
  type: string;
  enabled: boolean;
  title: string;
  description: string;
  icon: string;
}

export default function NotificationSettings() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: '1',
      type: 'medications',
      enabled: true,
      title: 'Medication Reminders',
      description: 'Get reminded when it\'s time to take your medications',
      icon: 'medical',
    },
    {
      id: '2',
      type: 'hydration',
      enabled: true,
      title: 'Hydration Reminders',
      description: 'Get reminded to drink water throughout the day',
      icon: 'water',
    },
    {
      id: '3',
      type: 'appointments',
      enabled: true,
      title: 'Appointment Reminders',
      description: 'Get reminded about upcoming health appointments',
      icon: 'calendar',
    },
    {
      id: '4',
      type: 'health_tips',
      enabled: false,
      title: 'Health Tips',
      description: 'Receive personalized health and wellness tips',
      icon: 'bulb',
    },
    {
      id: '5',
      type: 'updates',
      enabled: false,
      title: 'App Updates',
      description: 'Get notified about new features and improvements',
      icon: 'star',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const toggleNotification = async (id: string) => {
    const updated = preferences.map((pref) =>
      pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
    );
    setPreferences(updated);

    try {
      setLoading(true);
      const notification = updated.find((p) => p.id === id);
      // Save to backend
      await api.put(
        `/notifications/preferences/${notification?.type}`,
        { enabled: notification?.enabled },
        token as string
      );
    } catch (error) {
      // Revert on error
      setPreferences(preferences);
      Alert.alert('Error', 'Failed to update notification preference');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          <Text style={styles.sectionDescription}>
            Choose which notifications you want to receive
          </Text>

          {preferences.map((pref) => (
            <View key={pref.id} style={styles.preferencItem}>
              <View style={styles.prefIcon}>
                <Ionicons name={pref.icon as any} size={20} color="#1E3A8A" />
              </View>
              <View style={styles.prefContent}>
                <Text style={styles.prefTitle}>{pref.title}</Text>
                <Text style={styles.prefDescription}>{pref.description}</Text>
              </View>
              <Switch
                value={pref.enabled}
                onValueChange={() => toggleNotification(pref.id)}
                disabled={loading}
              />
            </View>
          ))}

          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={24} color="#1E3A8A" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Need help?</Text>
              <Text style={styles.infoText}>
                You can always change these settings later. Some notifications are essential for your health and may not be disabled.
              </Text>
            </View>
          </View>
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
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  preferencItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  prefContent: {
    flex: 1,
  },
  prefTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  prefDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 24,
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
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 18,
  },
});
