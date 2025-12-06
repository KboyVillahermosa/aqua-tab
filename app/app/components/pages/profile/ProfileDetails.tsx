import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import EditProfileModal from './EditProfileModal';
import ProfileInfoList from './ProfileInfoList';
import useUser from '../../../hooks/useUser';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

interface UserDetails {
  name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  nickname?: string;
  emergency_contact?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  first_medication_time?: string;
  end_of_day_time?: string;
  wake_up_time?: string;
  breakfast_time?: string;
  lunch_time?: string;
  dinner_time?: string;
  climate?: string;
  exercise_frequency?: string;
  weight?: number;
  weight_unit?: string;
  age?: number;
  reminder_tone?: string;
  notification_permissions_accepted?: boolean;
  battery_optimization_set?: boolean;
}

export default function ProfileDetails() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const { user: fetchedUser, setUser: setFetchedUser, loading } = useUser(token as string | undefined);
  const insets = useSafeAreaInsets();

  // local alias to satisfy existing code that used `user`
  const user = fetchedUser as unknown as UserDetails | null;

  const [modalVisible, setModalVisible] = React.useState(false);
  const [showEmergencyContactName, setShowEmergencyContactName] = React.useState(false);

  const openEditModal = () => setModalVisible(true);
  const closeEditModal = () => setModalVisible(false);

  const handleSaved = (updated: any) => {
    // update shared user state
    setFetchedUser((prev: any) => ({ ...(prev || {}), ...(updated || {}) }));
  };

  const formatTime = (time: string | undefined) => {
    if (!time) return 'Not set';
    // If time is in HH:mm format, format it nicely
    if (time.includes(':')) {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    return time;
  };

  const formatClimate = (climate: string | undefined) => {
    if (!climate) return 'Not set';
    return climate.charAt(0).toUpperCase() + climate.slice(1);
  };

  const formatExercise = (exercise: string | undefined) => {
    if (!exercise) return 'Not set';
    return exercise.charAt(0).toUpperCase() + exercise.slice(1) + ' exercise';
  };

  const formatGender = (gender: string | undefined) => {
    if (!gender) return 'Not set';
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  const formatEmergencyContact = (
    contact?: string,
    contactName?: string,
    contactPhone?: string,
  ) => {
    if (contactName && contactPhone) return `${contactName} (${contactPhone})`;
    if (contactName) return contactName;
    if (contactPhone) return contactPhone;
    if (contact) return contact;
    return null;
  };

  const calculateAge = (dateOfBirth?: string): string | null => {
    if (!dateOfBirth) return null;
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return `${age} years old`;
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile details</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Details</Text>
          <TouchableOpacity style={styles.backButton} onPress={openEditModal}>
            <Ionicons name="create-outline" size={24} color="#1E3A8A" />
          </TouchableOpacity>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <ProfileInfoList
            sections={[
              {
                rows: [
                  { label: 'Full Name', value: user.name },
                  { label: 'Nickname', value: user.nickname },
                  { label: 'Email', value: user.email },
                  { label: 'Phone', value: user.phone },
                  { label: 'Gender', value: formatGender(user.gender) },
                  { label: 'Date of Birth', value: user.date_of_birth },
                  { label: 'Age', value: calculateAge(user.date_of_birth) },
                  { label: 'Address', value: user.address },
                ],
              },
            ]}
          />

          {/* Emergency Contact Custom Display */}
          <View style={[styles.card, { marginTop: 12 }]}>
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => setShowEmergencyContactName(!showEmergencyContactName)}
            >
              <Text style={styles.infoLabel}>Emergency Contact</Text>
              <Text style={styles.infoValue}>
                {showEmergencyContactName 
                  ? (user.emergency_contact_name || 'Not set')
                  : (user.emergency_contact_phone || 'Not set')
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Health Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Information</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>
                {user.weight ? `${user.weight} ${user.weight_unit || 'kg'}` : 'Not set'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Exercise Frequency</Text>
              <Text style={styles.infoValue}>{formatExercise(user.exercise_frequency)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Climate</Text>
              <Text style={styles.infoValue}>{formatClimate(user.climate)}</Text>
            </View>
          </View>
        </View>

        {/* Daily Routine Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Routine</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Ionicons name="sunny-outline" size={20} color="#1E3A8A" style={styles.icon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Wake Up Time</Text>
                <Text style={styles.infoValue}>{formatTime(user.wake_up_time)}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="medical-outline" size={20} color="#1E3A8A" style={styles.icon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>First Medication Time</Text>
                <Text style={styles.infoValue}>{formatTime(user.first_medication_time)}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="restaurant-outline" size={20} color="#1E3A8A" style={styles.icon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Breakfast Time</Text>
                <Text style={styles.infoValue}>{formatTime(user.breakfast_time)}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="restaurant-outline" size={20} color="#1E3A8A" style={styles.icon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Lunch Time</Text>
                <Text style={styles.infoValue}>{formatTime(user.lunch_time)}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="restaurant-outline" size={20} color="#1E3A8A" style={styles.icon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Dinner Time</Text>
                <Text style={styles.infoValue}>{formatTime(user.dinner_time)}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="moon-outline" size={20} color="#1E3A8A" style={styles.icon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>End of Day Time</Text>
                <Text style={styles.infoValue}>{formatTime(user.end_of_day_time)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Reminder Tone</Text>
              <Text style={styles.infoValue}>{user.reminder_tone || 'Default'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Notifications Enabled</Text>
              <View style={styles.statusBadge}>
                <Ionicons 
                  name={user.notification_permissions_accepted ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={user.notification_permissions_accepted ? "#10B981" : "#EF4444"} 
                />
                <Text style={[styles.statusText, { color: user.notification_permissions_accepted ? "#10B981" : "#EF4444" }]}>
                  {user.notification_permissions_accepted ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Battery Optimization</Text>
              <View style={styles.statusBadge}>
                <Ionicons 
                  name={user.battery_optimization_set ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={user.battery_optimization_set ? "#10B981" : "#EF4444"} 
                />
                <Text style={[styles.statusText, { color: user.battery_optimization_set ? "#10B981" : "#EF4444" }]}>
                  {user.battery_optimization_set ? 'Configured' : 'Not Configured'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <EditProfileModal
        visible={modalVisible}
        onClose={closeEditModal}
        user={user}
        token={token as string}
        onSaved={handleSaved}
      />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
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
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
    flexShrink: 1,
  },
  icon: {
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    flex: 0.5,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    textAlign: 'right',
    flex: 0.5,
    flexWrap: 'wrap',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
  scrollContent: {
    paddingBottom: 56,
  },
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalSaveButton: {
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

