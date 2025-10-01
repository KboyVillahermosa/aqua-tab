import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as api from './api';

export default function Home() {
  const { token } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        console.log('Home: token=', token);
        const me = await api.get('/me', token as string);
        console.log('Home: /me response:', me);
        setUser(me);
      } catch (err: any) {
        console.log('Home /me error', err);
        const message = err?.data?.message || err?.data || err?.message || 'Failed to load user';
        Alert.alert('Error', typeof message === 'string' ? message : JSON.stringify(message));
        router.replace({ pathname: '/login' } as any);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, router]);

  async function onLogout() {
    try {
      await api.post('/logout', {}, token as string);
    } catch {
      // ignore
    }
    router.replace({ pathname: '/login' } as any);
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.avatar}>{/* initials */}
          <Text style={styles.avatarText}>{(user?.name || 'U').split(' ').map((s:any)=>s[0]).slice(0,2).join('').toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logout} onPress={onLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 15, justifyContent: 'center', backgroundColor: '#f7f7fb' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 20 },
  info: { marginLeft: 16, flex: 1 },
  name: { fontSize: 20, fontWeight: '700' },
  email: { marginTop: 4, color: '#666' },
  logout: { marginTop: 24, backgroundColor: '#ff3b30', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '700' },
});
