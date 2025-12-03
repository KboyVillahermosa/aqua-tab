import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BottomNavigation from '../../navigation/BottomNavigation';
import { Modal } from 'react-native';
import { SafeAreaView as ModalSafeAreaView } from 'react-native-safe-area-context';
import api from '../../../api';

const { width } = Dimensions.get('window');

export default function Categories() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [timeline, setTimeline] = useState<Array<{ time: string; label: string; icon?: string; color?: string }>>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  React.useEffect(() => {
    const loadTimeline = async () => {
      try {
        setLoadingTimeline(true);
        const res = await api.get('/timeline/today');
        const items = Array.isArray(res?.data) ? res.data : [];
        const mapped = items.map((it: any) => ({
          time: it.time || '',
          label: it.label || it.type || 'Event',
          icon: it.icon || (it.type === 'medication' ? 'medical-outline' : it.type === 'hydration' ? 'water-outline' : 'time-outline'),
          color: it.type === 'medication' ? '#1E3A8A' : it.type === 'hydration' ? '#0EA5E9' : '#6B7280',
        }));
        setTimeline(mapped);
      } catch (err) {
        // Fallback to a couple of default preview items
        setTimeline([
          { time: '08:00 AM', label: 'Medication', icon: 'medical-outline', color: '#1E3A8A' },
          { time: '09:30 AM', label: 'Hydration', icon: 'water-outline', color: '#0EA5E9' },
        ]);
      } finally {
        setLoadingTimeline(false);
      }
    };
    loadTimeline();
  }, []);

  const categories = [
    { 
      id: 1, 
      title: 'Medication', 
      icon: 'medical', 
      color: '#1E3A8A',
      description: 'Manage your medications'
    },
    { 
      id: 2, 
      title: 'Hydration', 
      icon: 'water', 
      color: '#0EA5E9',
      description: 'Track water intake'
    },
    { 
      id: 3, 
      title: 'Reminder', 
      icon: 'alarm', 
      color: '#F59E0B',
      description: 'Set health reminders'
    },
    { 
      id: 4, 
      title: 'History', 
      icon: 'time', 
      color: '#10B981',
      description: 'View your health history'
    },
    { 
      id: 5, 
      title: 'Appointments', 
      icon: 'calendar', 
      color: '#8B5CF6',
      description: 'Schedule appointments'
    },
    { 
      id: 6, 
      title: 'Insights', 
      icon: 'analytics', 
      color: '#EF4444',
      description: 'Health reports & insights'
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Categories</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Categories Grid */}
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity 
              key={category.id} 
              style={styles.categoryCard}
              onPress={() => {
                if (category.title === 'Medication') {
                  router.push('/components/pages/medication/Medication');
                } else if (category.title === 'Hydration') {
                  router.push('/components/pages/hydration/Hydration');
                } else if (category.title === 'Reminder') {
                  router.push('/components/pages/notification/Notification');
                } else if (category.title === 'Insights') {
                  router.push({ pathname: '/insights', params: { token } } as any);
                }
              }}
            >
              <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
                <Ionicons name={category.icon as any} size={32} color="white" />
              </View>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Simple Timeline holder directly below categories */}
      <View style={{ paddingHorizontal: 20 }}>
        <TouchableOpacity
          onPress={() => setTimelineOpen(true)}
          style={styles.timelineCard}
        >
          <View style={styles.timelineHeaderRow}>
            <Text style={styles.timelineTitle}>Today's Timeline</Text>
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
          </View>
          {(loadingTimeline ? [
            { time: '', label: 'Loading...', icon: 'time-outline', color: '#6B7280' },
          ] : timeline.slice(0, 2)).map((it, idx) => (
            <View key={idx} style={styles.timelinePreviewRow}>
              <Ionicons name={(it.icon as any) || 'time-outline'} size={18} color={it.color || '#6B7280'} />
              <Text style={styles.timelinePreviewText}>{it.time ? `${it.time} • ${it.label}` : it.label}</Text>
            </View>
          ))}
          <Text style={styles.timelineHint}>Tap to view full timeline</Text>
        </TouchableOpacity>
      </View>

      {/* Full timeline modal */}
      <Modal visible={timelineOpen} transparent animationType="slide" onRequestClose={() => setTimelineOpen(false)}>
        <View style={styles.modalBackdrop}>
          <ModalSafeAreaView style={styles.timelineModal} edges={['top']}>
            <View style={styles.timelineModalHeader}>
              <Text style={styles.timelineTitle}>Today's Timeline</Text>
              <TouchableOpacity onPress={() => setTimelineOpen(false)}>
                <Ionicons name="close" size={22} color="#1F2937" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator>
              {(loadingTimeline ? [] : timeline).map((it, idx) => (
                <View key={idx} style={styles.timelineItemRow}>
                  <Ionicons name={(it.icon as any) || 'time-outline'} size={18} color={it.color || '#6B7280'} />
                  <Text style={styles.timelineItemText}>{it.time ? `${it.time} • ${it.label}` : it.label}</Text>
                </View>
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          </ModalSafeAreaView>
        </View>
      </Modal>

      <BottomNavigation currentRoute="categories" />
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
    paddingTop: 10,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  categoryCard: {
    width: (width - 52) / 2,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  timelineCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  timelinePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  timelinePreviewText: {
    fontSize: 13,
    color: '#374151',
  },
  timelineHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  timelineModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
  },
  timelineModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  timelineItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  timelineItemText: {
    fontSize: 14,
    color: '#1F2937',
  },
});
