import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView, TextInput, SafeAreaView, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as api from './api';
import BottomNavigation from './components/navigation/BottomNavigation';

const { width } = Dimensions.get('window');

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

  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="menu" size={24} color="#1F2937" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.profileAvatar}>
            <Text style={styles.avatarText}>
              {(user?.name || 'U').split(' ').map((s:any)=>s[0]).slice(0,2).join('').toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Hi, {firstName}</Text>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              placeholder="Search medicine"
              style={styles.searchInput}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Quick Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusText}>
            <Text style={styles.statusTitle}>Quick status: 2 medications left today • 40% hydration reached</Text>
          </View>
          <View style={styles.statusIllustration}>
            <Ionicons name="medical" size={32} color="#3B82F6" />
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesGrid}>
          <TouchableOpacity style={styles.categoryCard}>
            <Ionicons name="medical" size={32} color="white" />
            <Text style={styles.categoryText}>Medication</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.categoryCard}>
            <Ionicons name="water" size={32} color="white" />
            <Text style={styles.categoryText}>Hydration</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.categoryCard}>
            <Ionicons name="alarm" size={32} color="white" />
            <Text style={styles.categoryText}>Reminder</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.categoryCard}>
            <Ionicons name="time" size={32} color="white" />
            <Text style={styles.categoryText}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Timeline Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today&apos;s Timeline</Text>
        </View>

        <View style={styles.timelineCard}>
          <View style={styles.timelineItem}>
            <Text style={styles.timelineTime}>8:00 AM</Text>
            <Text style={styles.timelineActivity}>Water reminder (completed ✅)</Text>
          </View>
          
          <View style={styles.timelineItem}>
            <Text style={styles.timelineTime}>10:30 AM</Text>
            <Text style={styles.timelineActivity}>Medicine dose (upcoming ⏳)</Text>
          </View>
          
          <View style={styles.timelineItem}>
            <Text style={styles.timelineTime}>12:00 PM</Text>
            <Text style={styles.timelineActivity}>Hydration check (skipped ❌)</Text>
          </View>
        </View>

        {/* Logout Button (temporary) */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation currentRoute="home" />
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
    paddingBottom: 16,
  },
  menuButton: {
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
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  statusCard: {
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
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  statusIllustration: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  seeAllButton: {
    padding: 4,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryCard: {
    width: (width - 52) / 2,
    aspectRatio: 1,
    backgroundColor: '#1E3A8A',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  timelineCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  timelineItem: {
    marginBottom: 16,
  },
  timelineTime: {
    color: '#93C5FD',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineActivity: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 100,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
