import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as api from '../../../api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacySecurity() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const securitySettings = [
    {
      id: '1',
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      enabled: false,
      icon: 'shield-checkmark',
      action: () => Alert.alert('Info', '2FA feature coming soon'),
    },
    {
      id: '2',
      title: 'Change Password',
      description: 'Update your account password',
      icon: 'key-outline',
      action: () => setModalVisible(true),
    },
    {
      id: '3',
      title: 'Active Sessions',
      description: 'Manage devices where you\'re logged in',
      icon: 'phone-portrait-outline',
      action: () => Alert.alert('Info', 'Active sessions: 1 device'),
    },
    {
      id: '4',
      title: 'Data & Privacy',
      description: 'Control how your data is used',
      icon: 'lock-outline',
      action: () => Alert.alert('Privacy Policy', 'Your data is encrypted and never shared with third parties without consent.'),
    },
  ];

  const privacySettings = [
    {
      id: '1',
      title: 'Profile Visibility',
      description: 'Control who can see your profile',
      value: 'Private',
    },
    {
      id: '2',
      title: 'Health Data Sharing',
      description: 'Allow sharing health data with healthcare providers',
      value: 'Off',
    },
    {
      id: '3',
      title: 'Analytics',
      description: 'Help improve the app by sharing usage data',
      value: 'On',
    },
  ];

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      await api.post(
        '/me/change-password',
        {
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        },
        token as string
      );

      Alert.alert('Success', 'Password updated successfully');
      setModalVisible(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={[styles.header, { paddingTop: insets.top || 12 }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Privacy & Security</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.content}>
          {/* Security Section */}
          <Text style={styles.sectionTitle}>Security</Text>
          {securitySettings.map((setting) => (
            <TouchableOpacity key={setting.id} style={styles.settingItem} onPress={setting.action}>
              <View style={styles.settingIcon}>
                <Ionicons name={setting.icon as any} size={20} color="#1E3A8A" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Text style={styles.settingDescription}>{setting.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}

          {/* Privacy Section */}
          <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Privacy</Text>
          {privacySettings.map((setting) => (
            <View key={setting.id} style={styles.privacyItem}>
              <View>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Text style={styles.settingDescription}>{setting.description}</Text>
              </View>
              <Text style={styles.privacyValue}>{setting.value}</Text>
            </View>
          ))}

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={24} color="#1E3A8A" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Your Privacy Matters</Text>
              <Text style={styles.infoText}>
                We take your privacy seriously. Your health data is encrypted and protected. Learn more about our privacy policy in the help section.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Password Change Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.label}>Current Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                secureTextEntry
                value={passwordData.currentPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
              />

              <Text style={styles.label}>New Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new password (min 8 characters)"
                secureTextEntry
                value={passwordData.newPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
              />

              <Text style={styles.label}>Confirm New Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Re-enter new password"
                secureTextEntry
                value={passwordData.confirmPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
              />

              <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleChangePassword}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>{loading ? 'Updating...' : 'Update Password'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
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
    marginBottom: 12,
    marginTop: 20,
  },
  sectionTitleSpaced: {
    marginTop: 32,
  },
  settingItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  privacyItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  privacyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalForm: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
