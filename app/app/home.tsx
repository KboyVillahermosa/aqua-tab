import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView, TextInput, SafeAreaView, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as api from './api';
import BottomNavigation from './components/navigation/BottomNavigation';

const { width } = Dimensions.get('window');

interface TimelineItem {
  id: number;
  time: string;
  title: string;
  body: string;
  type: string;
  status: string;
  status_text: string;
  status_emoji: string;
}

export default function Home() {
  const { token } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        console.log('Home: token=', token);
        const me = await api.get('/me', token as string);
        console.log('Home: /me response:', me);
        setUser(me);
        
        // Load timeline separately to avoid blocking on errors
        try {
          const timelineData = await api.get('/notifications/today-timeline', token as string);
          console.log('Home: timeline data received:', timelineData);
          console.log('Home: timeline data type:', typeof timelineData);
          console.log('Home: is array?', Array.isArray(timelineData));
          if (Array.isArray(timelineData)) {
            console.log('Home: timeline count:', timelineData.length);
            setTimeline(timelineData);
          } else {
            console.log('Home: timeline data is not an array, setting empty');
            setTimeline([]);
          }
        } catch (timelineErr: any) {
          console.log('Home: timeline error:', timelineErr);
          console.log('Home: timeline error details:', JSON.stringify(timelineErr));
          setTimeline([]);
        }
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


  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  const firstName = user?.name?.split(' ')[0] || 'User';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'scheduled':
        return '#3B82F6';
      case 'missed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

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
          <TouchableOpacity style={styles.categoryCard} onPress={() => router.push({ pathname: '/components/pages/medication/Medication', params: { token } } as any)}>
            <Ionicons name="medical" size={32} color="white" />
            <Text style={styles.categoryText}>Medication</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.categoryCard} onPress={() => router.push({ pathname: '/components/pages/hydration/Hydration', params: { token } } as any)}>
            <Ionicons name="water" size={32} color="white" />
            <Text style={styles.categoryText}>Hydration</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.categoryCard} onPress={() => router.push({ pathname: '/components/pages/notification/Notification', params: { token } } as any)}>
            <Ionicons name="notifications" size={32} color="white" />
            <Text style={styles.categoryText}>Reminders</Text>
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
          {timeline.length > 0 ? (
            timeline.map((item, index) => (
              <View key={item.id || index} style={styles.timelineItem}>
                <View style={styles.timelineItemContent}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, { backgroundColor: getStatusColor(item.status) }]} />
                    {index < timeline.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.timelineRight}>
                    <View style={styles.timelineHeader}>
                      <Text style={styles.timelineTime}>{item.time || 'N/A'}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
                          {item.status_emoji || '📋'} {item.status_text || item.status}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.timelineActivityRow}>
                      <Ionicons 
                        name={item.type === 'medication' ? 'medical' : 'water'} 
                        size={16} 
                        color="#93C5FD" 
                        style={styles.timelineIcon}
                      />
                      <Text style={styles.timelineActivity}>{item.title || 'Reminder'}</Text>
                    </View>
                    {item.body && (
                      <Text style={styles.timelineBody}>{item.body}</Text>
                    )}
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.timelineEmpty}>
              <Ionicons name="calendar-outline" size={48} color="#93C5FD" style={styles.emptyIcon} />
              <Text style={styles.timelineEmptyText}>No scheduled reminders for today</Text>
              <Text style={styles.timelineEmptySubtext}>Your timeline will appear here when you have reminders</Text>
            </View>
          )}
        </View>

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
    minHeight: 100,
  },
  timelineItem: {
    marginBottom: 20,
  },
  timelineItemContent: {
    flexDirection: 'row',
  },
  timelineLeft: {
    width: 30,
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1E3A8A',
    zIndex: 1,
  },
  timelineLine: {
    position: 'absolute',
    top: 12,
    left: 5,
    width: 2,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 4,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  timelineTime: {
    color: '#93C5FD',
    fontSize: 14,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  timelineActivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineIcon: {
    marginRight: 8,
  },
  timelineActivity: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  timelineBody: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginTop: 2,
    marginLeft: 24,
  },
  timelineEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  timelineEmptyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  timelineEmptySubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    textAlign: 'center',
  },
});
