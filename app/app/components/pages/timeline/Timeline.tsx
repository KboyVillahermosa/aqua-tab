import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSnooze } from '../../../hooks/useSnooze';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BottomNavigation from '../../navigation/BottomNavigation';
import * as api from '../../../api';

export default function Timeline() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const { logSnooze } = useSnooze();
  const [timelineData, setTimelineData] = useState<Array<{ id: number; time: string; title: string; body?: string; description?: string; status: string; type?: string; icon?: string }>>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadTimeline = async () => {
      try {
        const data = await api.get('/notifications/today-timeline', token as string, 3000);
        if (Array.isArray(data)) {
          setTimelineData(data);
        } else {
          setTimelineData([]);
        }
      } catch (_) {
        setTimelineData([]);
      }
    };
    loadTimeline();
  }, [token]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'upcoming':
        return 'time';
      case 'skipped':
        return 'close-circle';
      case 'pending':
        return 'ellipse-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'upcoming':
        return '#F59E0B';
      case 'skipped':
        return '#EF4444';
      case 'pending':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed ✅';
      case 'upcoming':
        return 'Upcoming ⏳';
      case 'skipped':
        return 'Skipped ❌';
      case 'pending':
        return 'Pending ⏰';
      default:
        return 'Pending';
    }
  };

  const onSnooze = useCallback(async (item: any) => {
    try {
      await logSnooze({
        reminderType: item.icon === 'medical' ? 'medication' : item.icon === 'water' ? 'hydration' : 'general',
        reminderKey: String(item.id),
        scheduledTime: undefined,
        snoozeMinutes: 10,
      });
    } catch (_) {
      // ignore error for now; UI can show toast/snackbar if available
    }
  }, [logSnooze]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Today&apos;s Timeline</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Timeline Items */}
        <View style={styles.timelineContainer}>
          {timelineData.length > 0 ? (
            timelineData.map((item, index) => (
              <View key={item.id} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  <View style={styles.timelineLine}>
                    <View style={[styles.timelineDot, { backgroundColor: getStatusColor(item.status) }]} />
                    {index < timelineData.length - 1 && <View style={styles.connector} />}
                  </View>
                </View>

                <TouchableOpacity style={styles.timelineCard} onPress={() => { setSelectedItem(item); setModalVisible(true); }}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <Ionicons name={(item.type === 'medication' ? 'medical' : item.type === 'hydration' ? 'water' : 'notifications') as any} size={20} color="#1E3A8A" />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      {!!(item.body || item.description) && (
                        <Text style={styles.cardDescription}>{item.body || item.description}</Text>
                      )}
                    </View>
                    <View style={styles.statusContainer}>
                      <Ionicons name={getStatusIcon(item.status) as any} size={20} color={getStatusColor(item.status)} />
                    </View>
                  </View>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {getStatusText(item.status)}
                  </Text>
                  {(item.status === 'upcoming' || item.status === 'pending') && (
                    <View style={styles.actionsRow}>
                      <TouchableOpacity onPress={() => onSnooze(item)} style={styles.actionButton}>
                        <Ionicons name="time" size={16} color="#1E3A8A" />
                        <Text style={styles.actionText}>Snooze 10m</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={32} color="#6B7280" />
              <Text style={styles.emptyText}>No timeline data available</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalIconWrap}>
                    <Ionicons name={(selectedItem.type === 'medication' ? 'medical' : selectedItem.type === 'hydration' ? 'water' : 'notifications') as any} size={22} color="#1E3A8A" />
                  </View>
                  <Text style={styles.modalTitle}>{selectedItem.title}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Ionicons name="time" size={16} color="#6B7280" />
                  <Text style={styles.modalRowText}>{selectedItem.time || 'N/A'}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Ionicons name={getStatusIcon(selectedItem.status) as any} size={16} color={getStatusColor(selectedItem.status)} />
                  <Text style={[styles.modalRowText, { color: getStatusColor(selectedItem.status) }]}>{getStatusText(selectedItem.status)}</Text>
                </View>
                {!!(selectedItem.body || selectedItem.description) && (
                  <Text style={styles.modalBody}>{selectedItem.body || selectedItem.description}</Text>
                )}

                {(selectedItem.status === 'upcoming' || selectedItem.status === 'pending') && (
                  <TouchableOpacity style={styles.modalPrimaryButton} onPress={() => onSnooze(selectedItem)}>
                    <Ionicons name="time" size={18} color="#FFFFFF" />
                    <Text style={styles.modalPrimaryButtonText}>Snooze 10 minutes</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <BottomNavigation currentRoute="timeline" />
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
    paddingTop: 12,
    paddingBottom: 12,
  },
  backButton: {
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  // removed date header to keep UI clean and avoid placeholder date
  timelineContainer: {
    paddingBottom: 80,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
    width: 60,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  timelineLine: {
    alignItems: 'center',
    flex: 1,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  connector: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 8,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusContainer: {
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  actionText: {
    color: '#1E3A8A',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  modalRowText: {
    fontSize: 13,
    color: '#4B5563',
  },
  modalBody: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  modalPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E3A8A',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  modalPrimaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalCloseButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
  },
});
