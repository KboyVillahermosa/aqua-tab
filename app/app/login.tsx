import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as api from './api';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
// Requires: expo install expo-auth-session
import * as AuthSession from 'expo-auth-session';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Setup AuthSession request at the top-level (hooks must be called at top level)
  // Generate a redirect URI. In some dev setups makeRedirectUri returns an exp:// deep link
  // which Google won't accept for the Web OAuth client. For development force the
  // Expo proxy redirect URI when that happens so the registered auth.expo.io URI is used.
  const generatedRedirect = AuthSession.makeRedirectUri({ useProxy: true });
  const proxyRedirect = 'https://auth.expo.io/@kboydev/app';
  const redirectUri = generatedRedirect && generatedRedirect.startsWith('exp://') ? proxyRedirect : generatedRedirect;
  console.log('AuthSession generated redirect:', generatedRedirect);
  console.log('AuthSession using effective redirectUri:', redirectUri);
  console.log('AuthSession redirectUri:', redirectUri);
  const clientId = '237625744653-f08o97b5d90esl7je4pie2hephi1t32e.apps.googleusercontent.com';
  const scopes = ['openid', 'email', 'profile'];
  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
  } as const;

  // Request an authorization code with PKCE (recommended for mobile/native apps).
  // We'll exchange the code on the backend for tokens.
  const [, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      redirectUri,
      scopes,
      responseType: AuthSession.ResponseType.Code,
      // For code flow we want PKCE enabled (default). Do not set usePKCE: false.
      extraParams: { prompt: 'select_account' },
    },
    discovery
  );

  // Use the response in an effect so it's not reported as unused; we still use the
  // returned value from promptAsync below for immediate handling.
  useEffect(() => {
    if (response) {
      // for debugging during development
      // console.log('AuthSession response changed', response);
    }
  }, [response]);

  async function onLogin() {
    if (!email || !password) {
      Alert.alert('Validation', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/login', { email, password });
      // Check if onboarding is needed
      if (!res.onboarding_completed) {
        router.replace({ pathname: '/onboarding', params: { token: res.token, name: res.user?.name || '' } } as any);
      } else {
        router.replace({ pathname: '/home', params: { token: res.token } } as any);
      }
    } catch (err: any) {
      console.log('login error', err);
      const message = err?.data?.message || err?.data || err?.message || 'Login failed';
      Alert.alert('Error', typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    try {
      setLoading(true);
      console.log('Starting Google auth flow (code + PKCE) with:', { clientId, scopes });
      const result = await promptAsync({ useProxy: true });
      console.log('promptAsync result:', result);
      if (result?.type !== 'success') {
        Alert.alert('Google Sign-in', 'Canceled or failed');
        return;
      }

      const code = (result as any).params?.code;
      if (!code) {
        Alert.alert('Google Sign-in', 'No code received');
        return;
      }

      // Send the code to your backend which will exchange it for tokens
      // and return your app session token.
      const res = await api.post('/oauth/google', { code, redirect_uri: redirectUri });
      router.replace({ pathname: '/home', params: { token: res.token } } as any);
    } catch (err: any) {
      console.log('google signin error', err);
      const message = err?.data?.message || err?.data || err?.message || 'Google sign-in failed';
      Alert.alert('Error', typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>Welcome back</Text>
        </View>

        {/* Form Inputs */}
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
        </View>

        {/* Forgot Password Link */}
        <TouchableOpacity style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Sign In Button */}
        <TouchableOpacity style={styles.signInButton} onPress={onLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signInButtonText}>Sign in</Text>
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
        <TouchableOpacity style={styles.socialButton} onPress={onGoogle}>
          <Ionicons name="logo-google" size={20} color="#DB4437" style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Login with Gmail</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} onPress={onFacebookLogin}>
          <Ionicons name="logo-facebook" size={20} color="#1877F2" style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Login with Facebook</Text>
        </TouchableOpacity>

        {/* Bottom Link */}
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/register' } as any)}
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
    marginBottom: 16,
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '500',
  },
  signInButton: {
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
  signInButtonText: {
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
});
