import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import api from './api';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function onSendResetLink() {
    if (!email) {
      Alert.alert('Validation', 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/forgot-password', { email });
      
      // THE MAGIC: Show the OTP code in dev mode
      if (response.debug_otp) {
        Alert.alert(
          'Dev Mode - Your Reset Code', 
          `Your verification code is: ${response.debug_otp}\n\nCopy this code to reset your password.`,
          [
            {
              text: 'OK',
              onPress: () => router.push({ 
                pathname: '/reset-password', 
                params: { email } 
              } as any)
            }
          ]
        );
      } else {
        Alert.alert(
          'Success', 
          'Verification code has been sent to your email.',
          [
            {
              text: 'OK',
              onPress: () => router.push({ 
                pathname: '/reset-password', 
                params: { email } 
              } as any)
            }
          ]
        );
      }
    } catch (err: any) {
      console.log('forgot password error', err);
      const message = err?.data?.message || err?.data || err?.message || 'Failed to send reset code';
      Alert.alert('Error', typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setLoading(false);
    }
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
            d={`M0,0 L${width},0 L${width},0 L${width},40 Q${width/2},80 0,40 Z`}
            fill="#1E3A8A"
          />
        </Svg>
      </View>

      {/* Main Content Card */}
      <View style={styles.contentCard}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={48} color="#1E3A8A" />
          </View>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            {emailSent 
              ? "We've sent you a password reset link"
              : "Enter your email and we'll send you a link to reset your password"
            }
          </Text>
        </View>

        {!emailSent && (
          <>
            {/* Email Input */}
            <View style={styles.inputContainer}>
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
            </View>

            {/* Send Reset Link Button */}
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={onSendResetLink} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.resetButtonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {emailSent && (
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.resetButtonText}>Back to Login</Text>
          </TouchableOpacity>
        )}

        {/* Back to Login Link */}
        {!emailSent && (
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.bottomLinkContainer}
          >
            <Ionicons name="arrow-back-outline" size={16} color="#1E3A8A" />
            <Text style={styles.bottomLinkText}>Back to Login</Text>
          </TouchableOpacity>
        )}
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
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
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
  resetButton: {
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
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingBottom: 20,
  },
  bottomLinkText: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
    marginLeft: 8,
  },
});
