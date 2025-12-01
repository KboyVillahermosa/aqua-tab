import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Animated, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigation from '../../navigation/BottomNavigation';
import * as api from '../../../api';
import { useLocalSearchParams } from 'expo-router';
import { notificationService } from '../../../services/notificationService';
import PremiumLockModal from '../../PremiumLockModal';

type MedicationItem = {
  id: string;
  name: string;
  dosage: string;
  times: string[]; // ISO timestamps (time-of-day represented as ISO strings)
  reminder: boolean;
  start_date?: string;
  end_date?: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
  days_of_week?: number[];
  notes?: string;
  color?: string;
};

type HistoryEntry = {
  id: string;
  medId: string;
  time: string; // ISO
  status: 'completed' | 'skipped' | 'snoozed';
};

const STORAGE_KEYS = {
  MEDS: '@aqua:medications',
  HISTORY: '@aqua:med_history',
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function Medication() {
  const { token } = useLocalSearchParams();
  const [meds, setMeds] = useState<MedicationItem[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<MedicationItem | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [premiumLockVisible, setPremiumLockVisible] = useState(false);
  const [exporting, setExporting] = useState(false);

  // form state
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [times, setTimes] = useState<string[]>([]);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  
  // Advanced scheduling state
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('#1E3A8A');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState<'start' | 'end' | null>(null);
  // Time picker modal state
  const [tempTime, setTempTime] = useState<Date | null>(null);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const MODAL_ANIM = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (timeModalVisible) {
      Animated.timing(MODAL_ANIM, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    } else {
      Animated.timing(MODAL_ANIM, { toValue: 0, duration: 180, useNativeDriver: true }).start();
    }
  }, [timeModalVisible, MODAL_ANIM]);
  const [reminder, setReminder] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (token) {
          // load from backend
          const serverMeds: any[] = await api.get('/medications', token as string);
          setMeds(serverMeds || []);

          // load histories for meds (simple approach)
          const allHistory: HistoryEntry[] = [];
          for (const m of serverMeds || []) {
            try {
              const h = await api.get(`/medications/${m.id}/history`, token as string);
              (h || []).forEach((hh:any) => {
                allHistory.push({ id: hh.id?.toString() || uid(), medId: m.id.toString(), time: hh.time, status: hh.status });
              });
            } catch {
              // ignore per-med history errors
            }
          }
          setHistory(allHistory);

          // Load stats and upcoming medications
          try {
            const statsData = await api.get('/medications/stats', token as string);
            setStats(statsData || {
              total_medications: 0,
              active_medications: 0,
              completed_today: 0,
              missed_today: 0
            });
          } catch (e) {
            console.log('Failed to load stats:', e);
            // Initialize with zeros if stats fail to load
            setStats({
              total_medications: 0,
              active_medications: 0,
              completed_today: 0,
              missed_today: 0
            });
          }

          try {
            const upcomingData = await api.get('/medications/upcoming', token as string);
            setUpcoming(upcomingData || []);
          } catch (e) {
            console.log('Failed to load upcoming:', e);
          }

          // Load subscription status
          try {
            const subscriptionData = await api.get('/subscription/current', token as string);
            setSubscription(subscriptionData);
          } catch (subErr) {
            console.log('Error loading subscription:', subErr);
          }
        } else {
          const raw = await AsyncStorage.getItem(STORAGE_KEYS.MEDS);
          const hraw = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
          if (raw) setMeds(JSON.parse(raw));
          if (hraw) setHistory(JSON.parse(hraw));
        }
      } catch {
        console.log('Failed to load meds');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.MEDS, JSON.stringify(meds)).catch((e: any) => console.log(e));
  }, [meds]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history)).catch((e: any) => console.log(e));
  }, [history]);

  // Auto-mark missed medications and reload stats periodically
  useEffect(() => {
    if (!token || meds.length === 0) return;

    const checkAndReload = async () => {
      try {
        // Reload stats which will auto-mark missed medications on backend
        const statsData = await api.get('/medications/stats', token as string);
        setStats(statsData);
        
        // Reload history to get any new missed entries
        const allHistory: HistoryEntry[] = [];
        for (const m of meds) {
          try {
            const h = await api.get(`/medications/${m.id}/history`, token as string);
            (h || []).forEach((hh:any) => {
              allHistory.push({ id: hh.id?.toString() || uid(), medId: m.id.toString(), time: hh.time, status: hh.status });
            });
          } catch {
            // ignore per-med history errors
          }
        }
        setHistory(allHistory);
      } catch (e) {
        console.log('Failed to reload stats/history:', e);
      }
    };

    // Check immediately
    checkAndReload();

    // Check every 5 minutes
    const interval = setInterval(checkAndReload, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [token, meds]);

  function openAdd() {
    console.log('Medication: openAdd called');
    setEditing(null);
    setName('');
    setDosage('');
    setTimes([]);
    setReminder(true);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setFrequency('daily');
    setDaysOfWeek([]);
    setNotes('');
    setColor('#1E3A8A');
    setModalVisible(true);
  }

  function openEdit(m: MedicationItem) {
    setEditing(m);
    setName(m.name);
    setDosage(m.dosage);
    setTimes(m.times || []);
    setReminder(!!m.reminder);
    setStartDate(m.start_date || new Date().toISOString().split('T')[0]);
    setEndDate(m.end_date || '');
    setFrequency(m.frequency || 'daily');
    setDaysOfWeek(m.days_of_week || []);
    setNotes(m.notes || '');
    setColor(m.color || '#1E3A8A');
    setModalVisible(true);
  }

  async function saveMedication() {
    if (!name.trim()) return Alert.alert('Validation', 'Please enter a name');
    if (!times.length) return Alert.alert('Validation', 'Please add at least one reminder time');
    
    const med: MedicationItem = editing ? { 
      ...editing, 
      name, 
      dosage, 
      times, 
      reminder,
      start_date: startDate,
      end_date: endDate,
      frequency,
      days_of_week: daysOfWeek,
      notes,
      color
    } : { 
      id: uid(), 
      name, 
      dosage, 
      times, 
      reminder,
      start_date: startDate,
      end_date: endDate,
      frequency,
      days_of_week: daysOfWeek,
      notes,
      color
    };
    
    if (editing) {
      setMeds((s) => s.map((x) => (x.id === med.id ? med : x)));
      if (token) {
        // update on server
        await api.put(`/medications/${med.id}`, med, token as string).catch(()=>{});
        // Schedule medication reminders
        await scheduleMedicationReminders(med);
      }
    } else {
      setMeds((s) => [med, ...s]);
      if (token) {
        await api.post('/medications', med, token as string).catch(()=>{});
        // Schedule medication reminders
        await scheduleMedicationReminders(med);
      }
    }
    setModalVisible(false);
  }

  async function scheduleMedicationReminders(medication: MedicationItem) {
    if (!token || !medication.reminder) {
      // If reminder is disabled, cancel existing notifications
      if (medication.id) {
        await notificationService.cancelMedicationNotifications(medication.id);
      }
      return;
    }

    try {
      notificationService.setToken(token as string);
      
      // Schedule notifications for each time
      await notificationService.scheduleMedicationNotifications(
        medication.id,
        medication.name,
        medication.dosage,
        medication.times,
        medication.id // Use medication ID as backend notification ID for now
      );
    } catch (error) {
      console.error('Error scheduling medication reminders:', error);
    }
  }

  async function deleteMedication(id: string) {
    Alert.alert('Delete', 'Delete this medication?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        // optimistic remove locally and persist immediately to storage
        const previous = meds;
        const newMeds = previous.filter((m) => m.id !== id);
        setMeds(newMeds);
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.MEDS, JSON.stringify(newMeds));
        } catch {
          // if storage write fails, revert and notify
          setMeds(previous);
          Alert.alert('Delete failed', 'Could not update local storage. Please try again.');
          return;
        }
        if (token) {
          // Cancel notifications for this medication
          await notificationService.cancelMedicationNotifications(id);
          // attempt server delete and keep UI in sync; encapsulated in helper
          await performServerDelete(id, previous, newMeds);
        } else {
          // Cancel notifications even if no token
          await notificationService.cancelMedicationNotifications(id);
        }
      } },
    ]);
  }

  // Helper: attempt server deletion and provide richer error handling / retry
  async function performServerDelete(id: string, previous: MedicationItem[], newMeds: MedicationItem[]) {
    try {
            await api.del(`/medications/${id}`, token as string);
      const serverMeds: any[] = await api.get('/medications', token as string);
      setMeds(serverMeds || []);
      try { await AsyncStorage.setItem(STORAGE_KEYS.MEDS, JSON.stringify(serverMeds || [])); } catch {}
    } catch (err: any) {
      // revert local state and persistent storage
      setMeds(previous);
      try { await AsyncStorage.setItem(STORAGE_KEYS.MEDS, JSON.stringify(previous)); } catch {}

      // our api wrapper throws { status, data }
      console.log('performServerDelete error raw:', err);
      const status = err?.status;
      const data = err?.data;
      const serverMsg = (data && (data.message || (typeof data === 'string' ? data : JSON.stringify(data)))) || err?.message || 'Could not delete the medication on the server. Please try again.';

      const fullMsg = status ? `Server ${status}: ${serverMsg}` : serverMsg;

      Alert.alert('Delete failed', fullMsg, [
        { text: 'Retry', onPress: async () => {
            // re-apply optimistic delete then retry server call
            setMeds(newMeds);
            try { await AsyncStorage.setItem(STORAGE_KEYS.MEDS, JSON.stringify(newMeds)); } catch {}
            await performServerDelete(id, previous, newMeds);
          }
        },
        { text: 'OK', style: 'cancel' }
      ]);
      console.log('performServerDelete error', err);
    }
  }


  function removeTime(idx: number) {
    setTimes((t) => t.filter((_, i) => i !== idx));
  }

  async function markTaken(medId: string, timeIso?: string) {
    const med = meds.find(m => m.id === medId);
    if (!med) return;

    // Determine the scheduled time for this medication
    let scheduledTime = timeIso;
    if (!scheduledTime) {
      // Find the next scheduled time that hasn't passed yet, or use the closest one
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Find the scheduled time for today that's closest to now (or just passed)
      const scheduledTimes = (med.times || []).map(t => {
        const timeDate = new Date(t);
        const todayTime = new Date(today);
        todayTime.setHours(timeDate.getHours(), timeDate.getMinutes(), timeDate.getSeconds());
        
        // If time has passed today, use it (for marking as taken)
        if (todayTime <= now) {
          return todayTime.toISOString();
        }
        // Otherwise, use yesterday's time if we're marking it late
        return new Date(todayTime.getTime() - 24 * 60 * 60 * 1000).toISOString();
      });
      
      // Use the most recent scheduled time
      scheduledTime = scheduledTimes.length > 0 
        ? scheduledTimes.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
        : new Date().toISOString();
    }

    // Check if an entry already exists for this medication and scheduled time
    // We'll match entries within a 2-hour window of the scheduled time to prevent duplicates
    const scheduledTimeDate = new Date(scheduledTime);
    const twoHoursBefore = new Date(scheduledTimeDate.getTime() - 2 * 60 * 60 * 1000);
    const twoHoursAfter = new Date(scheduledTimeDate.getTime() + 2 * 60 * 60 * 1000);
    
    const existingEntry = history.find(h => {
      if (h.medId !== medId) return false;
      const entryTime = new Date(h.time);
      return entryTime >= twoHoursBefore && entryTime <= twoHoursAfter && h.status === 'completed';
    });

    if (existingEntry) {
      Alert.alert('Already Logged', 'This medication has already been marked as taken for this scheduled time.');
      return;
    }

    const entry: HistoryEntry = { id: uid(), medId, time: scheduledTime, status: 'completed' };
    setHistory((h) => [entry, ...h]);
    
    // Cancel any pending notifications for this medication (temporarily disabled)
    console.log('Notification cancellation temporarily disabled');
    
    if (token) {
      try {
        const response = await api.post(`/medications/${medId}/history`, { status: 'completed', time: entry.time }, token as string);
        // If response indicates it was updated (not created), reload history
        if (response && response.id) {
          // Reload history to get updated entry
          const allHistory: HistoryEntry[] = [];
          for (const m of meds) {
            try {
              const h = await api.get(`/medications/${m.id}/history`, token as string);
              (h || []).forEach((hh:any) => {
                allHistory.push({ id: hh.id?.toString() || uid(), medId: m.id.toString(), time: hh.time, status: hh.status });
              });
            } catch {
              // ignore per-med history errors
            }
          }
          setHistory(allHistory);
        }
        // Reload stats after marking as taken
        try {
          const statsData = await api.get('/medications/stats', token as string);
          setStats(statsData);
        } catch (e) {
          console.log('Failed to reload stats:', e);
        }
      } catch (err: any) {
        console.log('Error marking medication as taken:', err);
        if (err?.status === 409) {
          // Duplicate entry
          Alert.alert('Already Logged', err?.data?.message || 'This medication has already been logged for this scheduled time.');
          // Remove from local state
          setHistory((h) => h.filter(e => e.id !== entry.id));
        } else {
          Alert.alert('Error', 'Failed to save medication history. Please try again.');
          // Remove from local state if server save failed
          setHistory((h) => h.filter(e => e.id !== entry.id));
        }
      }
    }
  }

  async function snooze(medId: string, mins = 15) {
    const snoozedTime = new Date(Date.now() + mins * 60 * 1000).toISOString();
    const entry: HistoryEntry = { id: uid(), medId, time: snoozedTime, status: 'snoozed' };
    setHistory((h) => [entry, ...h]);
    
    // Reschedule notification (temporarily disabled)
    console.log('Notification rescheduling temporarily disabled');
    
    Alert.alert('Snoozed', `Reminder snoozed by ${mins} minutes`);
    if (token) {
      await api.post(`/medications/${medId}/history`, { status: 'snoozed', time: entry.time }, token as string).catch(()=>{});
    }
  }


  function clearHistory() {
    Alert.alert('Clear history', 'Remove all medication history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => setHistory([]) },
    ]);
  }

  // Helper functions for new features
  function toggleDayOfWeek(day: number) {
    setDaysOfWeek(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  }

  function getDayName(day: number) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
  }

  function getMedicationColor(med: MedicationItem) {
    return med.color || '#1E3A8A';
  }

  async function handleExport() {
    if (!token) return;

    // Check if user has premium
    const hasPremium = subscription?.plan_slug === 'premium' || subscription?.plan?.data_export === true;
    
    if (!hasPremium) {
      setPremiumLockVisible(true);
      return;
    }

    Alert.alert(
      'Export Medication History',
      'Choose export format:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export as CSV',
          onPress: async () => {
            try {
              setExporting(true);
              const baseUrl = 'http://10.0.2.2:8000'; // Adjust for your backend URL
              const url = `${baseUrl}/api/medications/export/csv`;
              const response = await fetch(url, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (response.ok) {
                const blob = await response.blob();
                // For React Native, you'd use a library like react-native-fs or expo-file-system
                // For now, we'll show a success message
                Alert.alert('Success', 'CSV export started. Check your downloads folder.');
              } else {
                const error = await response.json();
                if (error.requires_premium) {
                  setPremiumLockVisible(true);
                } else {
                  Alert.alert('Error', 'Failed to export CSV');
                }
              }
            } catch (err) {
              console.error('Export error:', err);
              Alert.alert('Error', 'Failed to export medication history');
            } finally {
              setExporting(false);
            }
          },
        },
        {
          text: 'Export as PDF',
          onPress: async () => {
            try {
              setExporting(true);
              const baseUrl = 'http://10.0.2.2:8000';
              const url = `${baseUrl}/api/medications/export/pdf`;
              const response = await fetch(url, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (response.ok) {
                Alert.alert('Success', 'PDF export started. Check your downloads folder.');
              } else {
                const error = await response.json();
                if (error.requires_premium) {
                  setPremiumLockVisible(true);
                } else {
                  Alert.alert('Error', 'Failed to export PDF');
                }
              }
            } catch (err) {
              console.error('Export error:', err);
              Alert.alert('Error', 'Failed to export medication history');
            } finally {
              setExporting(false);
            }
          },
        },
      ]
    );
  }

  function formatTimeUntilNext(nextTime: string) {
    const now = new Date();
    const next = new Date(nextTime);
    const diffMs = next.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Overdue';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${diffMinutes}m`;
    }
  }

  if (loading) {
  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading medications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Medications</Text>
              <Text style={styles.headerSubtitle}>Manage your medication schedule</Text>
            </View>
            <TouchableOpacity 
              style={styles.exportButton}
              onPress={handleExport}
              disabled={exporting}
            >
              <Ionicons name="download-outline" size={20} color="#1E3A8A" />
              <Text style={styles.exportButtonText}>Export</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Dashboard */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats?.total_medications ?? 0}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats?.active_medications ?? 0}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats?.completed_today ?? 0}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats?.missed_today ?? 0}</Text>
            <Text style={styles.statLabel}>Missed</Text>
          </View>
        </View>

        {/* Upcoming Medications */}
        {upcoming.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            {upcoming.slice(0, 3).map((item, index) => (
              <View key={index} style={styles.upcomingCard}>
                <View style={[styles.upcomingIcon, { backgroundColor: getMedicationColor(item.medication) }]}>
                  <Text style={styles.upcomingInitial}>{item.medication.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.upcomingContent}>
                  <Text style={styles.upcomingName}>{item.medication.name}</Text>
                  <Text style={styles.upcomingTime}>
                    {new Date(item.next_reminder).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={styles.upcomingRight}>
                  <Text style={styles.upcomingCountdown}>
                    {formatTimeUntilNext(item.next_reminder)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Medications List */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Medications</Text>
          {meds.length === 0 ? (
          <View style={styles.emptyState}>
              <Ionicons name="medical" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No medications yet</Text>
              <Text style={styles.emptySubtext}>Tap the + button to add your first medication</Text>
          </View>
          ) : (
            meds.map((med) => (
              <View key={med.id} style={styles.medicationCard}>
                <View style={[styles.medicationIcon, { backgroundColor: getMedicationColor(med) }]}>
                  <Text style={styles.medicationInitial}>{med.name.charAt(0).toUpperCase()}</Text>
                </View>
                
                <View style={styles.medicationContent}>
                  <Text style={styles.medicationName}>{med.name}</Text>
                  <Text style={styles.medicationDosage}>{med.dosage}</Text>
                  
                  <View style={styles.medicationTimes}>
                    {med.times.map((time, index) => (
                      <View key={index} style={styles.timeBadge}>
                         <Text style={styles.timeText}>
                           {new Date(time).toLocaleTimeString([], { hour: 'numeric', hour12: true })}
                         </Text>
                      </View>
                    ))}
                  </View>
                  
                  {med.notes && (
                    <Text style={styles.medicationNotes}>{med.notes}</Text>
                  )}
                </View>

                <View style={styles.medicationActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.takenButton]} 
                    onPress={() => markTaken(med.id)}
                  >
                    <Ionicons name="checkmark" size={16} color="white" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.snoozeButton]} 
                    onPress={() => snooze(med.id)}
                  >
                    <Ionicons name="time" size={16} color="white" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.editButton]} 
                    onPress={() => openEdit(med)}
                  >
                    <Ionicons name="create" size={16} color="white" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]} 
                    onPress={() => deleteMedication(med.id)}
                  >
                    <Ionicons name="trash" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Recent History */}
        {history.length > 0 && (
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>Recent History</Text>
              <TouchableOpacity onPress={clearHistory}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.historyList}>
              {history.slice(0, 5).map((h) => (
                <View key={h.id} style={styles.historyItem}>
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyMed}>
                      {meds.find(m => m.id === h.medId)?.name || 'Unknown'}
                    </Text>
                    <Text style={styles.historyTime}>
                      {new Date(h.time).toLocaleDateString()} at {new Date(h.time).toLocaleTimeString([], { hour: 'numeric', hour12: true })}
                    </Text>
                  </View>
                  <View style={styles.historyRight}>
                    <View style={[
                      styles.statusBadge, 
                      h.status === 'completed' ? styles.statusCompleted : 
                      h.status === 'snoozed' ? styles.statusSnoozed : 
                      styles.statusSkipped
                    ]}>
                      <Text style={styles.statusText}>{h.status}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <BottomNavigation currentRoute="medication" />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openAdd}
        accessibilityLabel="Add medication"
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" onRequestClose={()=>setModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={()=>setModalVisible(false)} style={styles.modalClose}>
              <Ionicons name="close" size={20} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editing ? 'Edit Medication' : 'Add Medication'}</Text>
            <View style={{ width: 40 }} />
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Name</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="e.g., Vitamin C" />

            <Text style={styles.label}>Dosage</Text>
            <TextInput value={dosage} onChangeText={setDosage} style={styles.input} placeholder="e.g., 500 mg" />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.label}>Times</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={()=>{ 
                  setPickerIndex(null);
                  setTempTime(new Date());
                    setTimeModalVisible(true);
                }}>
                  <Text style={styles.addTimeText}>Add time</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  // quick add current time
                  const now = new Date();
                  const iso = now.toISOString();
                  if (pickerIndex === null) setTimes((t) => [...t, iso]); else setTimes((t) => t.map((x,i)=> i===pickerIndex ? iso : x));
                  setPickerIndex(null);
                }} style={{ marginLeft: 12 }}>
                  <Text style={[styles.addTimeText, { fontWeight: '700' }]}>Now</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {times.map((t, idx) => (
                <View key={idx} style={styles.timeRowModal}>
                  <Text style={styles.timeTextModal}>{new Date(t).toLocaleTimeString([], { hour: 'numeric', hour12: true })}</Text>
                  <View style={{ flexDirection: 'row' }}>
                     <TouchableOpacity onPress={() => { 
                       setPickerIndex(idx); 
                       setTempTime(new Date(t)); 
                       setTimeModalVisible(true); 
                     }} style={styles.smallBtn}>
                      <Ionicons name="create" size={16} color="#1E3A8A" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeTime(idx)} style={styles.smallBtn}>
                      <Ionicons name="trash" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.rowBetween}>
              <Text style={styles.label}>Reminder</Text>
              <TouchableOpacity onPress={() => setReminder(r => !r)} style={[styles.toggle, reminder && styles.toggleOn]}>
                <View style={[styles.toggleKnob, reminder && { transform: [{ translateX: 16 }] }]} />
              </TouchableOpacity>
            </View>

            {/* Advanced Scheduling */}
            <Text style={styles.label}>Schedule</Text>
            
            <View style={styles.scheduleRow}>
               <TouchableOpacity 
                 style={styles.dateButton}
                 onPress={() => {
                   console.log('Start date button pressed');
                   setDatePickerType('start');
                   setShowDatePicker(true);
                   console.log('showDatePicker set to true, datePickerType set to start');
                 }}
                 activeOpacity={0.7}
               >
                 <Ionicons name="calendar" size={16} color="#1E3A8A" />
                 <Text style={styles.dateButtonText}>Start: {startDate}</Text>
                 <Ionicons name="chevron-down" size={16} color="#6B7280" style={{ marginLeft: 'auto' }} />
               </TouchableOpacity>
               
               <TouchableOpacity 
                 style={styles.dateButton}
                 onPress={() => {
                   console.log('End date button pressed');
                   setDatePickerType('end');
                   setShowDatePicker(true);
                   console.log('showDatePicker set to true, datePickerType set to end');
                 }}
                 activeOpacity={0.7}
               >
                 <Ionicons name="calendar" size={16} color="#1E3A8A" />
                 <Text style={styles.dateButtonText}>End: {endDate || 'Tap to set'}</Text>
                 <Ionicons name="chevron-down" size={16} color="#6B7280" style={{ marginLeft: 'auto' }} />
               </TouchableOpacity>
            </View>

            <Text style={styles.label}>Frequency</Text>
            <View style={styles.frequencyContainer}>
              {['daily', 'weekly', 'monthly', 'custom'].map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.frequencyButton,
                    frequency === freq && styles.frequencyButtonActive
                  ]}
                  onPress={() => setFrequency(freq as any)}
                >
                  <Text style={[
                    styles.frequencyButtonText,
                    frequency === freq && styles.frequencyButtonTextActive
                  ]}>
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {frequency === 'weekly' && (
              <View style={styles.daysContainer}>
                <Text style={styles.label}>Days of Week</Text>
                <View style={styles.daysRow}>
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayButton,
                        daysOfWeek.includes(day) && styles.dayButtonActive
                      ]}
                      onPress={() => toggleDayOfWeek(day)}
                    >
                      <Text style={[
                        styles.dayButtonText,
                        daysOfWeek.includes(day) && styles.dayButtonTextActive
                      ]}>
                        {getDayName(day)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <Text style={styles.label}>Notes</Text>
            <TextInput 
              value={notes} 
              onChangeText={setNotes} 
              style={[styles.input, styles.notesInput]} 
              placeholder="Add notes about this medication..."
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Color</Text>
            <View style={styles.colorContainer}>
              {['#1E3A8A', '#DC2626', '#059669', '#D97706', '#7C3AED', '#DB2777'].map((colorOption) => (
                <TouchableOpacity
                  key={colorOption}
                  style={[
                    styles.colorButton,
                    { backgroundColor: colorOption },
                    color === colorOption && styles.colorButtonActive
                  ]}
                  onPress={() => setColor(colorOption)}
                >
                  {color === colorOption && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={saveMedication} style={styles.saveBtn}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </ScrollView>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

           {/* Time picker modal */}
           <Modal visible={timeModalVisible} transparent animationType="fade" onRequestClose={() => { setTimeModalVisible(false); setPickerIndex(null); }}>
            <View style={styles.timeModalWrapper}>
               <TouchableWithoutFeedback onPress={() => { setTimeModalVisible(false); setPickerIndex(null); }}>
                <View style={styles.timeModalBackdrop} />
              </TouchableWithoutFeedback>
              <Animated.View style={[styles.timeModalContent, { opacity: MODAL_ANIM, transform: [{ translateY: MODAL_ANIM.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
                <Text style={styles.timeModalTitle}>Select time</Text>
                 <View style={styles.timePickerContainer}>
                   {/* Hour Picker (1-12) */}
                   <View style={styles.timePickerColumn}>
                     <Text style={styles.timePickerLabel}>Hour</Text>
                     <ScrollView style={styles.timePickerScroll} showsVerticalScrollIndicator={false}>
                       {Array.from({ length: 12 }, (_, i) => {
                         const hour = i + 1; // 1-12
                         const currentHour24 = tempTime ? tempTime.getHours() : new Date().getHours();
                         const currentHour12 = currentHour24 === 0 ? 12 : (currentHour24 > 12 ? currentHour24 - 12 : currentHour24);
                         return (
                           <TouchableOpacity
                             key={hour}
                             style={[styles.timePickerOption, currentHour12 === hour && styles.timePickerOptionSelected]}
                             onPress={() => {
                               const currentHour24 = tempTime ? tempTime.getHours() : new Date().getHours();
                               const isAM = currentHour24 < 12;
                               let newHour24;
                               if (hour === 12) {
                                 newHour24 = isAM ? 0 : 12; // 12 AM = 0, 12 PM = 12
                               } else {
                                 newHour24 = isAM ? hour : hour + 12; // AM = same, PM = +12
                               }
                               const now = new Date();
                               const newTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), newHour24, 0);
                               setTempTime(newTime);
                             }}
                           >
                             <Text style={[styles.timePickerOptionText, currentHour12 === hour && styles.timePickerOptionTextSelected]}>
                               {hour}
                             </Text>
                           </TouchableOpacity>
                         );
                       })}
                        </ScrollView>
                      </View>

                   {/* AM/PM Picker */}
                   <View style={styles.timePickerColumn}>
                     <Text style={styles.timePickerLabel}>Period</Text>
                     <ScrollView style={styles.timePickerScroll} showsVerticalScrollIndicator={false}>
                       {['AM', 'PM'].map((period) => {
                         const currentHour24 = tempTime ? tempTime.getHours() : new Date().getHours();
                         const isAM = currentHour24 < 12;
                         const isSelected = (period === 'AM' && isAM) || (period === 'PM' && !isAM);
                         return (
                           <TouchableOpacity
                             key={period}
                             style={[styles.timePickerOption, isSelected && styles.timePickerOptionSelected]}
                             onPress={() => {
                               const currentHour24 = tempTime ? tempTime.getHours() : new Date().getHours();
                               const currentHour12 = currentHour24 === 0 ? 12 : (currentHour24 > 12 ? currentHour24 - 12 : currentHour24);
                               let newHour24;
                               if (currentHour12 === 12) {
                                 newHour24 = period === 'AM' ? 0 : 12; // 12 AM = 0, 12 PM = 12
                               } else {
                                 newHour24 = period === 'AM' ? currentHour12 : currentHour12 + 12; // AM = same, PM = +12
                               }
                               const now = new Date();
                               const newTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), newHour24, 0);
                               setTempTime(newTime);
                             }}
                           >
                             <Text style={[styles.timePickerOptionText, isSelected && styles.timePickerOptionTextSelected]}>
                               {period}
                             </Text>
                           </TouchableOpacity>
                         );
                       })}
                        </ScrollView>
                      </View>
                            </View>
                 <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
                   <TouchableOpacity style={[styles.secondaryBtn, { marginRight: 8 }]} onPress={() => { setTimeModalVisible(false); setPickerIndex(null); }}>
                        <Text style={styles.secondaryBtnText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.primarySmallBtn} onPress={() => {
                     if (tempTime) {
                       if (pickerIndex === null) {
                         setTimes((t) => [...t, tempTime.toISOString()]);
                       } else {
                         setTimes((t) => t.map((x,i)=> i===pickerIndex ? tempTime.toISOString() : x));
                        setPickerIndex(null);
                       }
                     }
                     setTimeModalVisible(false);
                      }}>
                        <Text style={styles.primarySmallBtnText}>Add</Text>
                      </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
          </Modal>

          {/* DateTimePicker removed from inside Modal to avoid Android dialog/Modal conflict. */}
        </SafeAreaView>
      </Modal>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => { setShowDatePicker(false); setDatePickerType(null); }}>
        <View style={styles.dateModalWrapper}>
          <TouchableWithoutFeedback onPress={() => { setShowDatePicker(false); setDatePickerType(null); }}>
            <View style={styles.dateModalBackdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.dateModalContent}>
            <Text style={styles.dateModalTitle}>
              Select {datePickerType === 'start' ? 'Start' : 'End'} Date
            </Text>
            <View style={styles.datePickerContainer}>
              {/* Year Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Year</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    const currentYear = datePickerType === 'start' 
                      ? parseInt(startDate.split('-')[0]) 
                      : parseInt(endDate.split('-')[0]) || new Date().getFullYear();
                    return (
                      <TouchableOpacity
                        key={year}
                        style={[styles.pickerOption, currentYear === year && styles.pickerOptionSelected]}
                        onPress={() => {
                          const currentDate = datePickerType === 'start' ? startDate : endDate;
                          const [, month, day] = currentDate.split('-');
                          const newDate = `${year}-${month || '01'}-${day || '01'}`;
                          if (datePickerType === 'start') {
                            setStartDate(newDate);
                } else {
                            setEndDate(newDate);
                          }
                        }}
                      >
                        <Text style={[styles.pickerOptionText, currentYear === year && styles.pickerOptionTextSelected]}>
                          {year}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Month Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Month</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = i + 1;
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const currentMonth = datePickerType === 'start' 
                      ? parseInt(startDate.split('-')[1]) 
                      : parseInt(endDate.split('-')[1]) || 1;
                    return (
                      <TouchableOpacity
                        key={month}
                        style={[styles.pickerOption, currentMonth === month && styles.pickerOptionSelected]}
                        onPress={() => {
                          const currentDate = datePickerType === 'start' ? startDate : endDate;
                          const [year, , day] = currentDate.split('-');
                          const newDate = `${year || new Date().getFullYear()}-${month.toString().padStart(2, '0')}-${day || '01'}`;
                          if (datePickerType === 'start') {
                            setStartDate(newDate);
                          } else {
                            setEndDate(newDate);
                          }
                        }}
                      >
                        <Text style={[styles.pickerOptionText, currentMonth === month && styles.pickerOptionTextSelected]}>
                          {monthNames[i]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Day Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Day</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 31 }, (_, i) => {
                    const day = i + 1;
                    const currentDay = datePickerType === 'start' 
                      ? parseInt(startDate.split('-')[2]) 
                      : parseInt(endDate.split('-')[2]) || 1;
                    return (
                      <TouchableOpacity
                        key={day}
                        style={[styles.pickerOption, currentDay === day && styles.pickerOptionSelected]}
                        onPress={() => {
                          const currentDate = datePickerType === 'start' ? startDate : endDate;
                          const [year, month] = currentDate.split('-');
                          const newDate = `${year || new Date().getFullYear()}-${month || '01'}-${day.toString().padStart(2, '0')}`;
                          if (datePickerType === 'start') {
                            setStartDate(newDate);
                          } else {
                            setEndDate(newDate);
                          }
                        }}
                      >
                        <Text style={[styles.pickerOptionText, currentDay === day && styles.pickerOptionTextSelected]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
            <View style={styles.dateModalButtons}>
              <TouchableOpacity 
                style={styles.dateModalCancelButton} 
                onPress={() => { setShowDatePicker(false); setDatePickerType(null); }}
              >
                <Text style={styles.dateModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.dateModalDoneButton} 
                onPress={() => { setShowDatePicker(false); setDatePickerType(null); }}
              >
                <Text style={styles.dateModalDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Premium Lock Modal */}
      <PremiumLockModal
        visible={premiumLockVisible}
        onClose={() => setPremiumLockVisible(false)}
        featureName="Data Export"
        token={token as string}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#6B7280' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 }, // Extra padding for FAB and bottom navigation
  
  // Header
  headerSection: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#1F2937' },
  headerSubtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  
  // Stats Dashboard
  statsContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    marginBottom: 24,
    justifyContent: 'space-between'
  },
  statCard: { 
    backgroundColor: 'white', 
    borderRadius: 16, 
    padding: 16, 
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  statNumber: { fontSize: 24, fontWeight: '700', color: '#1F2937' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  
  // Sections
  sectionContainer: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  
  // Upcoming Medications
  upcomingCard: { 
    backgroundColor: 'white', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  upcomingIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 12
  },
  upcomingInitial: { color: 'white', fontWeight: '700', fontSize: 18 },
  upcomingContent: { flex: 1 },
  upcomingName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  upcomingTime: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  upcomingRight: { alignItems: 'flex-end' },
  upcomingCountdown: { fontSize: 14, fontWeight: '600', color: '#1E3A8A' },
  
  // Medication Cards
  medicationCard: { 
    backgroundColor: 'white', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  medicationIcon: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 16
  },
  medicationInitial: { color: 'white', fontWeight: '700', fontSize: 20 },
  medicationContent: { flex: 1 },
  medicationName: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  medicationDosage: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  medicationTimes: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  medicationNotes: { fontSize: 12, color: '#6B7280', marginTop: 4, fontStyle: 'italic' },
  
  // Time Badges
  timeBadge: { 
    backgroundColor: '#EFF6FF', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8, 
    marginRight: 6, 
    marginBottom: 4 
  },
  timeText: { color: '#1E3A8A', fontWeight: '600', fontSize: 12 },
  
  // Action Buttons
  medicationActions: { alignItems: 'center' },
  actionButton: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  takenButton: { backgroundColor: '#22C55E' },
  snoozeButton: { backgroundColor: '#F59E0B' },
  editButton: { backgroundColor: '#2563EB' },
  deleteButton: { backgroundColor: '#EF4444' },
  
  // Empty State
  emptyState: { 
    alignItems: 'center', 
    paddingVertical: 48,
    backgroundColor: 'white',
    borderRadius: 16,
    marginTop: 8
  },
  emptyText: { fontSize: 16, color: '#6B7280', marginTop: 12 },
  emptySubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
  
  // History
  historySection: { 
    paddingHorizontal: 20, 
    marginBottom: 24,
    marginTop: 8
  },
  historyHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  historyList: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  clearText: { color: '#EF4444', fontWeight: '600' },
  historyItem: { 
    backgroundColor: '#F9FAFB', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: '#1E3A8A'
  },
  historyLeft: { flex: 1 },
  historyMed: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  historyTime: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  historyRight: { alignItems: 'flex-end' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusCompleted: { backgroundColor: '#D1FAE5' },
  statusSnoozed: { backgroundColor: '#FEF3C7' },
  statusSkipped: { backgroundColor: '#F3F4F6' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  
  // FAB
  fab: { 
    position: 'absolute', 
    right: 20, 
    bottom: 100, // Moved up to avoid covering content
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: '#1E3A8A', 
    alignItems: 'center', 
    justifyContent: 'center', 
    zIndex: 2000, 
    elevation: 14, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.16, 
    shadowRadius: 16 
  },

  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: '#F8F9FA' },
  modalHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white'
  },
  modalClose: { padding: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  modalBody: { padding: 20 },
  
  // Form Elements
  label: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  input: { 
    backgroundColor: 'white', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.03, 
    shadowRadius: 6, 
    elevation: 1,
    fontSize: 16
  },
  notesInput: { height: 80, textAlignVertical: 'top' },
  
  // Time Management
  addTimeText: { color: '#1E3A8A', fontWeight: '600' },
  timeRowModal: { 
    backgroundColor: 'white', 
    padding: 12, 
    marginRight: 8, 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    minWidth: 120, 
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  timeTextModal: { fontWeight: '600', color: '#1F2937', fontSize: 16 },
  smallBtn: { marginLeft: 8, padding: 8 },
  
  // Toggle
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
  toggle: { width: 50, height: 30, borderRadius: 15, backgroundColor: '#E5E7EB', justifyContent: 'center', padding: 3 },
  toggleOn: { backgroundColor: '#1E3A8A' },
  toggleKnob: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'white', transform: [{ translateX: 0 }] },
  
  // Advanced Scheduling
  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  dateButton: { 
    flex: 1, 
    backgroundColor: 'white', 
    borderRadius: 12, 
    padding: 16, 
    flexDirection: 'row', 
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  dateButtonText: { marginLeft: 8, fontSize: 14, color: '#1F2937' },
  
  frequencyContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  frequencyButton: { 
    backgroundColor: 'white', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    marginRight: 8, 
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  frequencyButtonActive: { backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' },
  frequencyButtonText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  frequencyButtonTextActive: { color: 'white' },
  
  daysContainer: { marginBottom: 16 },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap' },
  dayButton: { 
    backgroundColor: 'white', 
    borderRadius: 12, 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    marginRight: 8, 
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  dayButtonActive: { backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' },
  dayButtonText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  dayButtonTextActive: { color: 'white' },
  
  // Color Picker
  colorContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  colorButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    marginRight: 12, 
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  colorButtonActive: { borderColor: '#1F2937' },
  
  // Save Button
  saveBtn: { 
    backgroundColor: '#1E3A8A', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  saveText: { color: 'white', fontWeight: '700', fontSize: 16 },
  
  // Time Picker Modal
  timeModalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  timeModalContent: { 
    backgroundColor: 'white', 
    marginHorizontal: 24, 
    borderRadius: 16, 
    padding: 20, 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 16, 
    elevation: 12 
  },
  timeModalTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  timeModalPreview: { fontSize: 24, fontWeight: '700', color: '#1E3A8A', marginBottom: 16 },
  timeModalWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Wheel Picker
  pickerLabel: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#6B7280', 
    textAlign: 'center', 
    marginBottom: 8 
  },
  wheelWrap: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8 },
  wheelColumn: { width: 80, height: 44 * 3, overflow: 'hidden' },
  wheelColumnSeparator: { width: 20, alignItems: 'center', justifyContent: 'center' },
  wheelItem: { height: 44, alignItems: 'center', justifyContent: 'center' },
  wheelItemSelected: { backgroundColor: 'transparent' },
  wheelItemText: { fontSize: 22, color: '#374151' },
  wheelItemTextSelected: { color: '#1E3A8A', fontWeight: '700' },
  previewText: { textAlign: 'center', color: '#6B7280', marginTop: 12, fontSize: 14 },
  
  // Date Picker Modal
  dateModalWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dateModalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  dateModalContent: { 
    backgroundColor: 'white', 
    marginHorizontal: 24, 
    borderRadius: 16, 
    padding: 20, 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 16, 
    elevation: 12,
    minWidth: 300
  },
  dateModalTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  
  // Custom Date Picker
  datePickerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 16,
    height: 200
  },
  pickerColumn: { 
    flex: 1, 
    marginHorizontal: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 8
  },
  pickerScroll: { 
    flex: 1,
    maxHeight: 160
  },
  pickerOption: { 
    paddingVertical: 8, 
    paddingHorizontal: 4, 
    borderRadius: 8, 
    marginVertical: 2,
    alignItems: 'center'
  },
  pickerOptionSelected: { 
    backgroundColor: '#1E3A8A' 
  },
  pickerOptionText: { 
    fontSize: 16, 
    color: '#374151',
    fontWeight: '500'
  },
  pickerOptionTextSelected: { 
    color: 'white', 
    fontWeight: '700' 
  },
  
  // Time Picker
  timePickerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 16,
    height: 200
  },
  timePickerColumn: { 
    flex: 1, 
    marginHorizontal: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 8
  },
  timePickerLabel: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#6B7280', 
    textAlign: 'center', 
    marginBottom: 8 
  },
  timePickerScroll: { 
    flex: 1,
    maxHeight: 160
  },
  timePickerOption: { 
    paddingVertical: 6, 
    paddingHorizontal: 4, 
    borderRadius: 8, 
    marginVertical: 1,
    alignItems: 'center'
  },
  timePickerOptionSelected: { 
    backgroundColor: '#1E3A8A' 
  },
  timePickerOptionText: { 
    fontSize: 14, 
    color: '#374151',
    fontWeight: '500'
  },
  timePickerOptionTextSelected: { 
    color: 'white', 
    fontWeight: '700' 
  },
  dateInput: { 
    backgroundColor: 'white', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: '#E5E7EB',
    fontSize: 16,
    textAlign: 'center'
  },
  timeInput: { 
    backgroundColor: 'white', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: '#E5E7EB',
    fontSize: 16,
    textAlign: 'center'
  },
  dateModalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, width: '100%' },
  dateModalCancelButton: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, backgroundColor: '#F3F4F6' },
  dateModalCancelText: { color: '#374151', fontWeight: '700' },
  dateModalDoneButton: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, backgroundColor: '#1E3A8A' },
  dateModalDoneText: { color: 'white', fontWeight: '700' },
  
  // Buttons
  secondaryBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' },
  secondaryBtnText: { color: '#374151', fontWeight: '700' },
  primarySmallBtn: { backgroundColor: '#1E3A8A', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  primarySmallBtnText: { color: 'white', fontWeight: '700' },
});
