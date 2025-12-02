import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView, Dimensions, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import api from './api';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onRegister() {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Validation', 'Please fill all required fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validation', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Validation', 'Password must be at least 6 characters');
      return;
    }
    if (!agreeTerms) {
      Alert.alert('Validation', 'Please agree to Terms of Use');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/register', { 
        name, 
        email, 
        password,
        password_confirmation: confirmPassword,
        phone: phone || null,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        address: address || null,
      });
      
      // Check if onboarding is needed
      if (!res.onboarding_completed) {
        router.replace({ pathname: '/onboarding', params: { token: res.token, name: res.user?.name || name } } as any);
      } else {
        router.replace({ pathname: '/home', params: { token: res.token } } as any);
      }
    } catch (err: any) {
      console.log('register error', err);
      const message = err?.data?.message || err?.data || err?.message || 'Registration failed';
      Alert.alert('Error', typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleLogin() {
    Alert.alert('Coming Soon', 'Google login will be available soon');
  }

  async function onFacebookLogin() {
    Alert.alert('Coming Soon', 'Facebook login will be available soon');
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Curved Header Background */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Wave/Curve Bottom */}
        <Svg
          height={80}
          width={width}
          style={styles.wave}
          viewBox={`0 0 ${width} 80`}
        >
          <Path
            d={`M0,0 L${width},0 L${width},40 Q${width*0.8},60 ${width*0.6},45 Q${width*0.4},30 ${width*0.2},50 Q${width*0.1},65 0,45 Z`}
            fill="#1E3A8A"
          />
        </Svg>
      </View>

      {/* Main Content Card */}
      <View style={styles.contentCard}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Sign up</Text>
          <Text style={styles.subtitle}>Create an account here</Text>
        </View>

        {/* Form Inputs */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              placeholder="Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.input}
              placeholderTextColor="#8E8E93"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              style={styles.input}
              placeholderTextColor="#8E8E93"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              placeholder="Phone Number (Optional)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.input}
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="calendar-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              placeholder="Date of Birth (YYYY-MM-DD) (Optional)"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              style={styles.input}
              placeholderTextColor="#8E8E93"
            />
          </View>

          <TouchableOpacity 
            style={styles.inputWrapper}
            onPress={() => setShowGenderPicker(true)}
          >
            <Ionicons name="person-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
            <Text style={[styles.input, !gender && { color: '#8E8E93' }]}>
              {gender || 'Gender (Optional)'}
            </Text>
            <Ionicons name="chevron-down-outline" size={20} color="#8E8E93" />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <Ionicons name="location-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              placeholder="Address (Optional)"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]}
              placeholderTextColor="#8E8E93"
            />
          </View>
        </View>

        {/* Gender Picker Modal */}
        <Modal
          visible={showGenderPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowGenderPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={() => {
                  setGender('male');
                  setShowGenderPicker(false);
                }}
              >
                <Text style={styles.modalOptionText}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={() => {
                  setGender('female');
                  setShowGenderPicker(false);
                }}
              >
                <Text style={styles.modalOptionText}>Female</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={() => {
                  setGender('other');
                  setShowGenderPicker(false);
                }}
              >
                <Text style={styles.modalOptionText}>Other</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalOption, { borderTopWidth: 1, borderTopColor: '#E5E7EB' }]}
                onPress={() => {
                  setGender('');
                  setShowGenderPicker(false);
                }}
              >
                <Text style={[styles.modalOptionText, { color: '#6B7280' }]}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalCancel}
                onPress={() => setShowGenderPicker(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Terms Checkbox */}
        <TouchableOpacity style={styles.termsContainer} onPress={() => setAgreeTerms(!agreeTerms)}>
          <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
            {agreeTerms && <Ionicons name="checkmark" size={14} color="white" />}
          </View>
          <Text style={styles.termsText}>By signing up you agree with our Terms of Use</Text>
        </TouchableOpacity>

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signUpButton} onPress={onRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signUpButtonText}>Sign UP</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerCircle}>
            <Text style={styles.dividerText}>OR</Text>
          </View>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login Buttons */}
        <TouchableOpacity style={styles.socialButton} onPress={onGoogleLogin}>
          <Ionicons name="logo-google" size={20} color="#DB4437" style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Login with Gmail</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} onPress={onFacebookLogin}>
          <Ionicons name="logo-facebook" size={20} color="#1877F2" style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Login with Facebook</Text>
        </TouchableOpacity>

        {/* Bottom Link */}
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/login' } as any)}
          style={styles.bottomLinkContainer}
        >
          <Text style={styles.bottomLinkText}>
            New member? <Text style={styles.bottomLinkHighlight}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    position: 'relative',
  },
  header: {
    height: height * 0.25,
    backgroundColor: '#1E3A8A',
    position: 'relative',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentCard: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: -60,
    marginHorizontal: 20,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '400',
  },
  eyeIcon: {
    padding: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  signUpButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  dividerText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  socialIcon: {
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  bottomLinkContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 20,
  },
  bottomLinkText: {
    fontSize: 14,
    color: '#6B7280',
  },
  bottomLinkHighlight: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  modalCancel: {
    marginTop: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
});
