import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigation from '../../navigation/BottomNavigation';

export default function Settings() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  
  // App Behavior
  const [autoSync, setAutoSync] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  
  // Units & Preferences
  const [useMetricUnits, setUseMetricUnits] = useState(true);
  const [timeFormat24h, setTimeFormat24h] = useState(false);
  
  // Hydration Settings
  const [smartHydrationGoals, setSmartHydrationGoals] = useState(true);
  const [weatherBasedReminders, setWeatherBasedReminders] = useState(false);
  
  // Medication Settings
  const [flexibleSchedule, setFlexibleSchedule] = useState(true);

  const settingsGroups = [
    {
      title: 'App Behavior',
      items: [
        {
          id: 1,
          title: 'Auto-Sync Data',
          subtitle: 'Automatically sync with backend',
          icon: 'sync-outline',
          type: 'switch',
          value: autoSync,
          onToggle: setAutoSync
        },
        {
          id: 2,
          title: 'Offline Mode',
          subtitle: 'Access features without internet',
          icon: 'cloud-offline-outline',
          type: 'switch',
          value: offlineMode,
          onToggle: setOfflineMode
        },
      ]
    },
    {
      title: 'Units & Format',
      items: [
        {
          id: 3,
          title: 'Metric Units',
          subtitle: 'Use mL, kg, cm (off = oz, lb, in)',
          icon: 'speedometer-outline',
          type: 'switch',
          value: useMetricUnits,
          onToggle: setUseMetricUnits
        },
        {
          id: 4,
          title: '24-Hour Time Format',
          subtitle: 'Display time in 24-hour format',
          icon: 'time-outline',
          type: 'switch',
          value: timeFormat24h,
          onToggle: setTimeFormat24h
        },
      ]
    },
    {
      title: 'Hydration',
      items: [
        {
          id: 5,
          title: 'Smart Hydration Goals',
          subtitle: 'Adjust goals based on weather & activity',
          icon: 'water-outline',
          type: 'switch',
          value: smartHydrationGoals,
          onToggle: setSmartHydrationGoals
        },
        {
          id: 6,
          title: 'Weather-Based Reminders',
          subtitle: 'More reminders on hot days',
          icon: 'sunny-outline',
          type: 'switch',
          value: weatherBasedReminders,
          onToggle: setWeatherBasedReminders
        },
        {
          id: 7,
          title: 'Daily Hydration Goal',
          subtitle: '2000 mL',
          icon: 'stats-chart-outline',
          type: 'navigation',
          onPress: () => Alert.alert('Hydration Goal', 'Goal settings coming soon!')
        },
      ]
    },
    {
      title: 'Medication',
      items: [
        {
          id: 8,
          title: 'Flexible Schedule',
          subtitle: 'Allow ±30 min for medication times',
          icon: 'medical-outline',
          type: 'switch',
          value: flexibleSchedule,
          onToggle: setFlexibleSchedule
        },
        {
          id: 9,
          title: 'Medication Schedule',
          subtitle: 'Manage timing preferences',
          icon: 'calendar-outline',
          type: 'navigation',
          onPress: () => router.push({ pathname: '/components/pages/profile/ProfileDetails', params: { token } } as any)
        },
      ]
    },
    {
      title: 'Data Management',
      items: [
        {
          id: 10,
          title: 'Export Health Data',
          subtitle: 'Download your data as CSV/JSON',
          icon: 'download-outline',
          type: 'navigation',
          onPress: () => Alert.alert('Export Data', 'Data export feature coming soon!')
        },
        {
          id: 11,
          title: 'Clear Cache',
          subtitle: 'Free up storage space',
          icon: 'trash-outline',
          type: 'navigation',
          onPress: () => {
            Alert.alert(
              'Clear Cache',
              'This will clear temporary data. Your account data will be preserved.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: () => Alert.alert('Success', 'Cache cleared') }
              ]
            );
          }
        },
      ]
    },
    {
      title: 'About',
      items: [
        {
          id: 12,
          title: 'App Version',
          subtitle: '1.0.0',
          icon: 'information-circle-outline',
          type: 'navigation',
          onPress: () => Alert.alert('AQUATAB', 'Version 1.0.0\nBuild 2024.12.10')
        },
        {
          id: 13,
          title: 'Check for Updates',
          subtitle: 'Get the latest features',
          icon: 'refresh-outline',
          type: 'navigation',
          onPress: () => Alert.alert('Updates', 'You are using the latest version!')
        },
      ]
    },
  ];

  const renderSettingItem = (item: any) => {
    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.settingItem}
        onPress={item.type === 'navigation' ? item.onPress : undefined}
        disabled={item.type === 'switch'}
      >
        <View style={styles.settingIcon}>
          <Ionicons name={item.icon} size={24} color="#1E3A8A" />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
        <View style={styles.settingAction}>
          {item.type === 'switch' ? (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={item.value ? '#1E3A8A' : '#F3F4F6'}
            />
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* App Version */}
        <View style={styles.versionCard}>
          <Image 
            source={require('../../../assets/images/mainlogo copy.png')} 
            style={styles.appLogo}
            resizeMode="contain"
          />
          <View style={styles.versionInfo}>
            <Text style={styles.appName}>AQUATAB</Text>
            <Text style={styles.versionText}>Hydration & Medication Tracker</Text>
          </View>
        </View>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.settingsGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupContainer}>
              {group.items.map((item, itemIndex) => (
                <View key={item.id}>
                  {renderSettingItem(item)}
                  {itemIndex < group.items.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <BottomNavigation currentRoute="settings" />
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
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  versionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appLogo: {
    width: 120,
    height: 80,
    marginRight: 1,
  },
  appIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  versionInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  versionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    marginLeft: 4,
  },
  groupContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingAction: {
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 68,
  },
  bottomSpacing: {
    height: 100,
  },
});
