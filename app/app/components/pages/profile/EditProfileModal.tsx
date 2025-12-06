import React, { useState } from 'react';
import { View, Text, Modal, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Image, Alert, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../../api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  onClose: () => void;
  token?: string;
  user: any;
  onSaved: (updated: any) => void;
}

export default function EditProfileModal({ visible, onClose, token, user, onSaved }: Props) {
  const [editData, setEditData] = useState<any>({ ...(user || {}) });
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1,1], quality: 0.8 });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error('EditProfileModal: pickImage', err);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
      if (!editData.name || !editData.name.trim()) {
        Alert.alert('Validation Error', 'Full name is required');
        setSaving(false);
        return;
      }
      if (!editData.email || !editData.email.trim()) {
        Alert.alert('Validation Error', 'Email is required');
        setSaving(false);
        return;
      }

      const weightValue =
        editData.weight === undefined || editData.weight === null || editData.weight === ''
          ? null
          : Number(editData.weight);

      const payload = {
        name: editData.name.trim(),
        email: editData.email.trim(),
        phone: editData.phone || null,
        emergency_contact: editData.emergency_contact || null,
        emergency_contact_name: editData.emergency_contact_name || null,
        emergency_contact_phone: editData.emergency_contact_phone || null,
        nickname: editData.nickname || null,
        gender: editData.gender || null,
        date_of_birth: editData.date_of_birth || null,
        address: editData.address || null,
        first_medication_time: editData.first_medication_time || null,
        wake_up_time: editData.wake_up_time || null,
        breakfast_time: editData.breakfast_time || null,
        lunch_time: editData.lunch_time || null,
        dinner_time: editData.dinner_time || null,
        end_of_day_time: editData.end_of_day_time || null,
        climate: editData.climate || null,
        exercise_frequency: editData.exercise_frequency || null,
        weight: Number.isFinite(weightValue) ? weightValue : null,
        weight_unit: editData.weight_unit || null,
        age: editData.age || null,
      };

      const resp = await api.put('/me', payload, token as string);
      // prefer server response if available
      const updated = resp?.user ? { ...(user || {}), ...(resp.user || {}) } : { ...(user || {}), ...payload };
      onSaved(updated);
      onClose();
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err: any) {
      console.error('EditProfileModal saveChanges', err);
      Alert.alert('Error', err.data?.message || err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // When opened, initialize local form
  React.useEffect(() => {
    setEditData({ ...(user || {}) });
    setProfileImage(null);
  }, [visible, user]);

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={[styles.modalHeader, { paddingTop: insets.top || 12 }] }>
          <TouchableOpacity onPress={onClose}><Text style={styles.modalCancelButton}>Cancel</Text></TouchableOpacity>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={saveChanges} disabled={saving}><Text style={[styles.modalSaveButton, saving && { opacity: 0.5 }]}>{saving ? 'Saving...' : 'Save'}</Text></TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.profilePictureSection}>
            <View style={styles.profilePictureContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}><Ionicons name="person" size={48} color="#9CA3AF" /></View>
              )}
            </View>
            <TouchableOpacity style={styles.cameraButton} onPress={pickImage}><Ionicons name="camera" size={20} color="white" /></TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Full Name *</Text>
            <TextInput style={styles.input} value={editData.name || ''} onChangeText={(t) => setEditData({ ...editData, name: t })} placeholder="Enter full name" placeholderTextColor="#D1D5DB" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Email *</Text>
            <TextInput style={styles.input} value={editData.email || ''} onChangeText={(t) => setEditData({ ...editData, email: t })} placeholder="Enter email" placeholderTextColor="#D1D5DB" keyboardType="email-address" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Phone</Text>
            <TextInput style={styles.input} value={editData.phone || ''} onChangeText={(t) => setEditData({ ...editData, phone: t })} placeholder="Enter phone number" placeholderTextColor="#D1D5DB" keyboardType="phone-pad" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Nickname</Text>
            <TextInput style={styles.input} value={editData.nickname || ''} onChangeText={(t) => setEditData({ ...editData, nickname: t })} placeholder="What should we call you?" placeholderTextColor="#D1D5DB" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Gender</Text>
            <TextInput style={styles.input} value={editData.gender || ''} onChangeText={(t) => setEditData({ ...editData, gender: t })} placeholder="e.g., Male, Female, Other" placeholderTextColor="#D1D5DB" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Date of Birth</Text>
            <TextInput style={styles.input} value={editData.date_of_birth || ''} onChangeText={(t) => setEditData({ ...editData, date_of_birth: t })} placeholder="YYYY-MM-DD" placeholderTextColor="#D1D5DB" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Address</Text>
            <TextInput style={[styles.input, styles.textArea]} value={editData.address || ''} onChangeText={(t) => setEditData({ ...editData, address: t })} placeholder="Enter address" placeholderTextColor="#D1D5DB" multiline numberOfLines={3} />
          </View>

          <Text style={styles.sectionHeader}>Emergency Contact</Text>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Contact Name</Text>
            <TextInput style={styles.input} value={editData.emergency_contact_name || ''} onChangeText={(t) => setEditData({ ...editData, emergency_contact_name: t })} placeholder="Contact name" placeholderTextColor="#D1D5DB" />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Contact Phone</Text>
            <TextInput style={styles.input} value={editData.emergency_contact_phone || ''} onChangeText={(t) => setEditData({ ...editData, emergency_contact_phone: t })} placeholder="Contact phone" placeholderTextColor="#D1D5DB" keyboardType="phone-pad" />
          </View>

          <Text style={styles.sectionHeader}>Daily Routine</Text>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Wake Up Time</Text>
            <TextInput style={styles.input} value={editData.wake_up_time || ''} onChangeText={(t) => setEditData({ ...editData, wake_up_time: t })} placeholder="e.g., 6:30 AM" placeholderTextColor="#D1D5DB" />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>First Medication Time</Text>
            <TextInput style={styles.input} value={editData.first_medication_time || ''} onChangeText={(t) => setEditData({ ...editData, first_medication_time: t })} placeholder="e.g., 7:00 AM" placeholderTextColor="#D1D5DB" />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Breakfast Time</Text>
            <TextInput style={styles.input} value={editData.breakfast_time || ''} onChangeText={(t) => setEditData({ ...editData, breakfast_time: t })} placeholder="e.g., 8:00 AM" placeholderTextColor="#D1D5DB" />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Lunch Time</Text>
            <TextInput style={styles.input} value={editData.lunch_time || ''} onChangeText={(t) => setEditData({ ...editData, lunch_time: t })} placeholder="e.g., 12:30 PM" placeholderTextColor="#D1D5DB" />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Dinner Time</Text>
            <TextInput style={styles.input} value={editData.dinner_time || ''} onChangeText={(t) => setEditData({ ...editData, dinner_time: t })} placeholder="e.g., 7:00 PM" placeholderTextColor="#D1D5DB" />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>End of Day Time</Text>
            <TextInput style={styles.input} value={editData.end_of_day_time || ''} onChangeText={(t) => setEditData({ ...editData, end_of_day_time: t })} placeholder="e.g., 10:30 PM" placeholderTextColor="#D1D5DB" />
          </View>

          <Text style={styles.sectionHeader}>Health & Goals</Text>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Weight</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                value={editData.weight !== undefined && editData.weight !== null ? String(editData.weight) : ''}
                onChangeText={(t) => setEditData({ ...editData, weight: t })}
                placeholder="e.g., 70"
                placeholderTextColor="#D1D5DB"
                keyboardType="numeric"
              />
              <View style={[styles.row, { flexShrink: 0 }]}>
                {['kg', 'lbs'].map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[styles.pill, editData.weight_unit === unit && styles.pillActive]}
                    onPress={() => setEditData({ ...editData, weight_unit: unit })}
                  >
                    <Text style={[styles.pillText, editData.weight_unit === unit && styles.pillTextActive]}>{unit.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Climate</Text>
            <View style={styles.row}>
              {['hot', 'temperate', 'cold'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.pill, editData.climate === option && styles.pillActive]}
                  onPress={() => setEditData({ ...editData, climate: option })}
                >
                  <Text style={[styles.pillText, editData.climate === option && styles.pillTextActive]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Exercise Frequency</Text>
            <View style={styles.row}>
              {['rarely', 'sometimes', 'regularly', 'often'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.pill, editData.exercise_frequency === option && styles.pillActive]}
                  onPress={() => setEditData({ ...editData, exercise_frequency: option })}
                >
                  <Text style={[styles.pillText, editData.exercise_frequency === option && styles.pillTextActive]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#F8F9FA' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  modalCancelButton: { fontSize: 16, color: '#6B7280', fontWeight: '600' },
  modalSaveButton: { fontSize: 16, color: '#1E3A8A', fontWeight: '600' },
  modalContent: { flex: 1, padding: 20 },
  profilePictureSection: { alignItems: 'center', marginBottom: 24, paddingTop: 20 },
  profilePictureContainer: { position: 'relative', marginBottom: 12 },
  profileImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E5E7EB' },
  profileImagePlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#E5E7EB' },
  cameraButton: { position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, borderRadius: 18, backgroundColor: '#1E3A8A', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  formGroup: { marginBottom: 20 },
  formLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#1F2937' },
  textArea: { textAlignVertical: 'top', paddingTop: 12 },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 8, marginTop: 12 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#D1D5DB', marginRight: 8, marginTop: 8 },
  pillActive: { backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' },
  pillText: { color: '#1F2937', fontWeight: '600' },
  pillTextActive: { color: 'white' },
});
