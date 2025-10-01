import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import api from './api';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onRegister() {
    if (!name || !email || !password) {
      Alert.alert('Validation', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/register', { name, email, password });
      router.replace({ pathname: '/home', params: { token: res.token } } as any);
    } catch (err: any) {
      console.log('register error', err);
      // show detailed message when available for easier debugging
      const message = err?.data?.message || err?.data || err?.message || 'Registration failed';
      Alert.alert('Error', typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

      <TouchableOpacity style={styles.button} onPress={onRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push({ pathname: '/login' } as any)} style={styles.linkContainer}>
        <Text style={styles.link}>{"Already have an account? Login"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 26, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 6, marginBottom: 12 },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  linkContainer: { marginTop: 16, alignItems: 'center' },
  link: { color: '#007AFF' },
});
