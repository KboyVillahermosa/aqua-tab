import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../../api';
import useUser from '../../../hooks/useUser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MedicationLog {
  id: string;
  medication: {
    id: string;
    name: string;
    dosage: string;
  };
  status: 'completed' | 'skipped' | 'missed';
  time: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

const STATUS_COLORS: Record<string, string> = {
  completed: '#10B981',
  skipped: '#EF4444',
  missed: '#F59E0B',
};

const STATUS_ICONS: Record<string, string> = {
  completed: 'checkmark-circle',
  skipped: 'close-circle',
  missed: 'alert-circle',
};

export default function MedicalHistory() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const { user } = useUser(token as string | undefined);
  const insets = useSafeAreaInsets();
  const isUserPremium = user?.subscription_type === 'PREMIUM';

  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [adherenceRate, setAdherenceRate] = useState(0);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all medications for the user
      const medsRes = await api.get('/medications', token as string);
      const medicationsData = Array.isArray(medsRes?.data) ? medsRes.data : [];
      setMedications(medicationsData);

      // Fetch history for all medications and consolidate
      const allLogs: MedicationLog[] = [];
      for (const med of medicationsData) {
        try {
          const historyRes = await api.get(
            `/medications/${med.id}/history`,
            token as string
          );
          const history = Array.isArray(historyRes?.data)
            ? historyRes.data
            : [];
          history.forEach((log: any) => {
            allLogs.push({
              id: log.id,
              medication: {
                id: med.id,
                name: med.name,
                dosage: med.dosage,
              },
              status: log.status,
              time: log.time,
            });
          });
        } catch (err) {
          console.warn(
            `Failed to fetch history for medication ${med.id}:`,
            err
          );
        }
      }

      // Sort by most recent first
      allLogs.sort(
        (a, b) =>
          new Date(b.time).getTime() - new Date(a.time).getTime()
      );
      setLogs(allLogs);

      // Calculate adherence rate (completed / total * 100)
      const takenCount = allLogs.filter(
        (l) => l.status === 'completed'
      ).length;
      const rate =
        allLogs.length > 0 ? Math.round((takenCount / allLogs.length) * 100) : 0;
      setAdherenceRate(rate);
    } catch (error) {
      console.error('Error fetching medical history:', error);
      Alert.alert('Error', 'Failed to load medical history');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!isUserPremium) {
      Alert.alert('Premium Feature', 'Upgrade to Premium to export your medical history');
      return;
    }
    // TODO: implement export (share or save)
    Alert.alert('Export', 'Medical history export triggered');
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  const formatDate = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return timeStr;
    }
  };

  const getRecentMedications = () => {
    const recentLogs = logs.slice(0, 3);
    return recentLogs.map((log) => ({
      name: log.medication?.name || 'Unknown',
      dosage: log.medication?.dosage || '',
      status: log.status,
    }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      </SafeAreaView>
    );
  }

  const recentMeds = getRecentMedications();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medical History</Text>
          <TouchableOpacity onPress={handleExport} style={styles.exportButton}>
            {isUserPremium ? (
              <Ionicons name="cloud-download-outline" size={20} color="#1E3A8A" />
            ) : (
              <View style={styles.lockedExportIcon}>
                <Ionicons name="lock-closed" size={12} color="white" />
                <Ionicons name="cloud-download-outline" size={16} color="white" style={{ marginLeft: -2 }} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Hero Section - Recent Medications */}
        {recentMeds.length > 0 ? (
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Recent Medications</Text>
            <View style={styles.heroContent}>
              {recentMeds.map((med, idx) => (
                <View key={idx} style={styles.heroMedCard}>
                  <View
                    style={[
                      styles.heroMedStatus,
                      { backgroundColor: STATUS_COLORS[med.status] },
                    ]}
                  >
                    <Ionicons
                      name={STATUS_ICONS[med.status] as any}
                      size={20}
                      color="white"
                    />
                  </View>
                  <View style={styles.heroMedInfo}>
                    <Text style={styles.heroMedName}>{med.name}</Text>
                    <Text style={styles.heroMedDosage}>{med.dosage}</Text>
                  </View>
                  <Text style={[styles.heroMedStatus, { color: STATUS_COLORS[med.status] }]}>
                    {med.status.charAt(0).toUpperCase() + med.status.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyHero}>
            <Ionicons name="medical" size={48} color="#D1D5DB" />
            <Text style={styles.emptyHeroText}>No medication history yet</Text>
          </View>
        )}

        {/* Stats Row - Adherence */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Adherence Rate</Text>
            <Text style={styles.statValue}>{adherenceRate}%</Text>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${adherenceRate}%` }]}
              />
            </View>
          </View>
        </View>

        {/* Medication History List */}
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>All Logs</Text>
          {logs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>No medication logs recorded</Text>
            </View>
          ) : (
            <View style={styles.logsList}>
              {logs.map((log, idx) => (
                <View key={log.id || idx} style={styles.logItem}>
                  <View style={styles.logTimeSection}>
                    <Text style={styles.logDate}>{formatDate(log.time)}</Text>
                    <Text style={styles.logTime}>{formatTime(log.time)}</Text>
                  </View>

                  <View style={styles.logMedSection}>
                    <Text style={styles.logMedName}>{log.medication?.name || 'Unknown'}</Text>
                    <Text style={styles.logMedDosage}>
                      {log.medication?.dosage || ''}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.logStatusBadge,
                      { backgroundColor: `${STATUS_COLORS[log.status]}20` },
                    ]}
                  >
                    <Ionicons
                      name={STATUS_ICONS[log.status] as any}
                      size={18}
                      color={STATUS_COLORS[log.status]}
                    />
                    <Text
                      style={[
                        styles.logStatusText,
                        { color: STATUS_COLORS[log.status] },
                      ]}
                    >
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  lockedExportIcon: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    width: 36,
    height: 36,
    borderRadius: 18,
    position: 'relative',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  heroContent: {
    gap: 12,
  },
  heroMedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  heroMedStatus: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroMedInfo: {
    flex: 1,
  },
  heroMedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  heroMedDosage: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyHero: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyHeroText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  statsRow: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  listSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  logsList: {
    gap: 8,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  logTimeSection: {
    width: 60,
  },
  logDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 2,
  },
  logTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  logMedSection: {
    flex: 1,
  },
  logMedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  logMedDosage: {
    fontSize: 13,
    color: '#6B7280',
  },
  logStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  logStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  bottomSpacing: {
    height: 40,
  },
});
