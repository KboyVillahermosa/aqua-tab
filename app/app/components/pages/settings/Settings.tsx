import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNavigation from '../../navigation/BottomNavigation';

export default function Settings() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [medicationReminders, setMedicationReminders] = useState(true);
  const [hydrationReminders, setHydrationReminders] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const settingsGroups = [
    {
      title: 'Notifications',
      items: [
        {
          id: 1,
          title: 'Push Notifications',
          subtitle: 'Receive notifications on your device',
          icon: 'notifications-outline',
          type: 'switch',
          value: notifications,
          onToggle: setNotifications
        },
        {
          id: 2,
          title: 'Medication Reminders',
          subtitle: 'Get reminded about your medications',
          icon: 'medical-outline',
          type: 'switch',
          value: medicationReminders,
          onToggle: setMedicationReminders
        },
        {
          id: 3,
          title: 'Hydration Reminders',
          subtitle: 'Water intake reminders',
          icon: 'water-outline',
          type: 'switch',
          value: hydrationReminders,
          onToggle: setHydrationReminders
        },
      ]
    },
    {
      title: 'Appearance',
      items: [
        {
          id: 4,
          title: 'Dark Mode',
          subtitle: 'Switch to dark theme',
          icon: 'moon-outline',
          type: 'switch',
          value: darkMode,
          onToggle: setDarkMode
        },
        {
          id: 5,
          title: 'Language',
          subtitle: 'English (US)',
          icon: 'language-outline',
          type: 'navigation',
          onPress: () => console.log('Language settings')
        },
      ]
    },
    {
      title: 'Health Data',
      items: [
        {
          id: 6,
          title: 'Export Data',
          subtitle: 'Download your health data',
          icon: 'download-outline',
          type: 'navigation',
          onPress: () => console.log('Export data')
        },
        {
          id: 7,
          title: 'Sync with Health App',
          subtitle: 'Connect with Apple Health or Google Fit',
          icon: 'sync-outline',
          type: 'navigation',
          onPress: () => console.log('Sync health data')
        },
        {
          id: 8,
          title: 'Data Privacy',
          subtitle: 'Manage your data privacy settings',
          icon: 'shield-outline',
          type: 'navigation',
          onPress: () => console.log('Data privacy')
        },
      ]
    },
    {
      title: 'Support',
      items: [
        {
          id: 9,
          title: 'Help Center',
          subtitle: 'FAQs and troubleshooting',
          icon: 'help-circle-outline',
          type: 'navigation',
          onPress: () => console.log('Help center')
        },
        {
          id: 10,
          title: 'Contact Support',
          subtitle: 'Get help from our team',
          icon: 'mail-outline',
          type: 'navigation',
          onPress: () => console.log('Contact support')
        },
        {
          id: 11,
          title: 'Rate App',
          subtitle: 'Rate us on the App Store',
          icon: 'star-outline',
          type: 'navigation',
          onPress: () => console.log('Rate app')
        },
      ]
    },
    {
      title: 'Legal',
      items: [
        {
          id: 12,
          title: 'Terms of Service',
          subtitle: 'Read our terms and conditions',
          icon: 'document-text-outline',
          type: 'navigation',
          onPress: () => console.log('Terms of service')
        },
        {
          id: 13,
          title: 'Privacy Policy',
          subtitle: 'How we handle your data',
          icon: 'lock-closed-outline',
          type: 'navigation',
          onPress: () => console.log('Privacy policy')
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        {/* App Version */}
        <View style={styles.versionCard}>
          <View style={styles.appIcon}>
            <Ionicons name="medical" size={32} color="white" />
          </View>
          <View style={styles.versionInfo}>
            <Text style={styles.appName}>Aqua Health</Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
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

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
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
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 100,
  },
});
