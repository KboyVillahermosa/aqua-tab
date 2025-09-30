import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as api from './api';
// Requires: expo install expo-auth-session
import * as AuthSession from 'expo-auth-session';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      // navigate to home, pass token
      router.replace({ pathname: '/home', params: { token: res.token } } as any);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={onLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push({ pathname: '/register' } as any)} style={styles.linkContainer}>
        <Text style={styles.link}>{"Don't have an account? Register"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onGoogle} style={[styles.button, styles.google]} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Please wait...' : 'Continue with Google'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 26, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 6, marginBottom: 12 },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  linkContainer: { marginTop: 16, alignItems: 'center' },
  link: { color: '#007AFF' },
  google: { marginTop: 12, backgroundColor: '#DB4437' },
});
