import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, Modal, FlatList, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigation from '../../navigation/BottomNavigation';
import * as api from '../../../api';
import { useLocalSearchParams } from 'expo-router';

type MedicationItem = {
  id: string;
  name: string;
  dosage: string;
  times: string[]; // ISO timestamps (time-of-day represented as ISO strings)
  reminder: boolean;
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

  // form state
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [times, setTimes] = useState<string[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  // Time picker modal state: we keep the native DateTimePicker at top-level
  // (avoids Android Modal/Dialog conflicts) and use a friendly modal wrapper
  // that lets users confirm/cancel selected times.
  const [tempTime, setTempTime] = useState<Date | null>(null);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  // Android JS fallback time parts
  const [tempHour, setTempHour] = useState<number>(9);
  const [tempMinute, setTempMinute] = useState<number>(0);
  const [tempAm, setTempAm] = useState<boolean>(true);
  const hourRef = useRef<ScrollView | null>(null);
  const minuteRef = useRef<ScrollView | null>(null);
  const amRef = useRef<ScrollView | null>(null);
  const MODAL_ANIM = useRef(new Animated.Value(0)).current;
  const ITEM_HEIGHT = 44;

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    if (timeModalVisible) {
      // animate modal in
      Animated.timing(MODAL_ANIM, { toValue: 1, duration: 220, useNativeDriver: true }).start();
      // initial wheel positions
      setTimeout(() => {
        if (hourRef.current && tempHour) {
          hourRef.current.scrollTo({ y: (tempHour - 1) * 44, animated: false });
        }
        if (minuteRef.current) {
          minuteRef.current.scrollTo({ y: tempMinute * 44, animated: false });
        }
        if (amRef.current) {
          amRef.current.scrollTo({ y: tempAm ? 0 : 44, animated: false });
        }
      }, 10);
    } else {
      Animated.timing(MODAL_ANIM, { toValue: 0, duration: 180, useNativeDriver: true }).start();
    }
  }, [timeModalVisible, MODAL_ANIM, tempHour, tempMinute, tempAm]);
  const [reminder, setReminder] = useState(true);

  useEffect(() => {
    (async () => {
      try {
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
        } else {
          const raw = await AsyncStorage.getItem(STORAGE_KEYS.MEDS);
          const hraw = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
          if (raw) setMeds(JSON.parse(raw));
          if (hraw) setHistory(JSON.parse(hraw));
        }
      } catch {
        console.log('Failed to load meds');
      }
    })();
  }, [token]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.MEDS, JSON.stringify(meds)).catch((e: any) => console.log(e));
  }, [meds]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history)).catch((e: any) => console.log(e));
  }, [history]);

  function openAdd() {
    console.log('Medication: openAdd called');
    setEditing(null);
    setName('');
    setDosage('');
    setTimes([]);
    setReminder(true);
    setModalVisible(true);
  }

  function openEdit(m: MedicationItem) {
    setEditing(m);
    setName(m.name);
    setDosage(m.dosage);
    setTimes(m.times || []);
    setReminder(!!m.reminder);
    setModalVisible(true);
  }

  function saveMedication() {
    if (!name.trim()) return Alert.alert('Validation', 'Please enter a name');
  const med: MedicationItem = editing ? { ...editing, name, dosage, times, reminder } : { id: uid(), name, dosage, times, reminder };
    if (editing) {
      setMeds((s) => s.map((x) => (x.id === med.id ? med : x)));
      if (token) {
        // update on server
        api.put(`/medications/${med.id}`, med, token as string).catch(()=>{});
      }
    } else {
      setMeds((s) => [med, ...s]);
      if (token) {
        api.post('/medications', med, token as string).catch(()=>{});
      }
    }
    setModalVisible(false);
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
          // attempt server delete and keep UI in sync; encapsulated in helper
          await performServerDelete(id, previous, newMeds);
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

  function addTime(date: Date) {
    // store only time part in ISO by using today with hh:mm:ss
    const iso = date.toISOString();
    if (pickerIndex === null) {
      setTimes((t) => [...t, iso]);
    } else {
      setTimes((t) => t.map((x, i) => (i === pickerIndex ? iso : x)));
      setPickerIndex(null);
    }
    setShowTimePicker(false);
  }

  function removeTime(idx: number) {
    setTimes((t) => t.filter((_, i) => i !== idx));
  }

  function markTaken(medId: string, timeIso?: string) {
    const entry: HistoryEntry = { id: uid(), medId, time: timeIso || new Date().toISOString(), status: 'completed' };
    setHistory((h) => [entry, ...h]);
    if (token) {
      api.post(`/medications/${medId}/history`, { status: 'completed', time: entry.time }, token as string).catch(()=>{});
    }
  }

  function snooze(medId: string, mins = 15) {
    const snoozedTime = new Date(Date.now() + mins * 60 * 1000).toISOString();
    const entry: HistoryEntry = { id: uid(), medId, time: snoozedTime, status: 'snoozed' };
    setHistory((h) => [entry, ...h]);
    Alert.alert('Snoozed', `Reminder snoozed by ${mins} minutes`);
    if (token) {
      api.post(`/medications/${medId}/history`, { status: 'snoozed', time: entry.time }, token as string).catch(()=>{});
    }
  }

  function renderMed({ item }: { item: MedicationItem }) {
    return (
      <View style={styles.medCard}>
        <View style={styles.medAvatar}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{(item.name || '?').charAt(0).toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.medContent}>
          <Text style={styles.medName}>{item.name}</Text>
          <Text style={styles.medMeta}>{item.dosage} • {item.times.length} times</Text>
          <View style={styles.timeRow}>
            {item.times.map((t, i) => (
              <View key={i} style={styles.timeBadge}>
                <Text style={styles.timeText}>{new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.medActionsColumn}>
          <TouchableOpacity onPress={() => markTaken(item.id)} style={[styles.actionBtn, styles.actionBtnGreen]} activeOpacity={0.85}>
            <Ionicons name="checkmark" size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => snooze(item.id)} style={[styles.actionBtn, styles.actionBtnOrange]} activeOpacity={0.85}>
            <Ionicons name="time" size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openEdit(item)} style={[styles.actionBtn, styles.actionBtnBlue]} activeOpacity={0.85}>
            <Ionicons name="create" size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteMedication(item.id)} style={[styles.actionBtn, styles.actionBtnRed]} activeOpacity={0.85}>
            <Ionicons name="trash" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function clearHistory() {
    Alert.alert('Clear history', 'Remove all medication history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => setHistory([]) },
    ]);
  }

  // ...existing code...
  return (
    <SafeAreaView style={styles.container}>
      {/* Header: let child touchables receive events; do not block touches at the header level. */}
      <View
        style={styles.headerRow}
        pointerEvents="box-none"
        onLayout={() => console.log('Header: onLayout')}
      >
        <View>
          <Text style={styles.headerTitle}>Medication</Text>
          <Text style={styles.headerSubtitle}>Manage medications, schedules and reminders</Text>
        </View>
        {/* Header no longer contains the Add button; FAB is rendered at the bottom-right */}
      </View>

      {/* Make FlatList the main scrollable to avoid nesting VirtualizedList inside ScrollView */}
      <FlatList
        data={meds}
        keyExtractor={(i) => i.id}
        renderItem={renderMed}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        ListHeaderComponent={() => (
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={styles.headerTitle}>Medication</Text>
            <Text style={styles.headerSubtitle}>Manage medications, schedules and reminders</Text>
            <View style={styles.divider} />
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No medications yet. Tap Add to create one.</Text>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={{ paddingHorizontal: 20 }}>
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>History</Text>
              <TouchableOpacity onPress={clearHistory}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />

            {history.length === 0 ? (
              <Text style={styles.emptyText}>No history yet.</Text>
            ) : (
              history.slice(0, 30).map((h) => (
                <View key={h.id} style={styles.historyItemRow}>
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyMed}>{meds.find(m => m.id === h.medId)?.name || 'Unknown'}</Text>
                    <Text style={styles.historyTime}>{new Date(h.time).toLocaleString()}</Text>
                  </View>
                  <View style={styles.historyRight}>
                    <View style={[styles.statusBadge, h.status === 'completed' ? { backgroundColor: '#D1FAE5' } : h.status === 'snoozed' ? { backgroundColor: '#FEF3C7' } : { backgroundColor: '#F3F4F6' }]}>
                      <Text style={styles.historyStatus}>{h.status}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      />

      <BottomNavigation currentRoute="medication" />

      {/* Floating Action Button (FAB) for Add - positioned above bottom navigation */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          try {
            openAdd();
          } catch (err) {
            console.log('FAB: openAdd threw', err);
          }
        }}
        accessibilityLabel="Add medication"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="button"
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
                  // On Android we'll use the native dialog and add immediately on selection
                  setPickerIndex(null);
                  setTempTime(new Date());
                  if (Platform.OS === 'android') {
                    // Open our JS fallback modal (avoids native picker issues)
                    const now = new Date();
                    let h = now.getHours();
                    const m = now.getMinutes();
                    const am = h < 12;
                    if (h === 0) h = 12; else if (h > 12) h = h - 12;
                    setTempHour(h);
                    setTempMinute(m);
                    setTempAm(am);
                    setTempTime(now);
                    setTimeModalVisible(true);
                    setShowTimePicker(false);
                  } else {
                    // iOS: show our friendly confirmation modal with embedded spinner
                    setTempTime(new Date());
                    setTimeModalVisible(true);
                    setShowTimePicker(true);
                  }
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
                  <Text style={styles.timeTextModal}>{new Date(t).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true })}</Text>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => { setPickerIndex(idx); const d = new Date(t); if (Platform.OS === 'android') { let h = d.getHours(); const m = d.getMinutes(); const am = h < 12; if (h === 0) h = 12; else if (h > 12) h = h - 12; setTempHour(h); setTempMinute(m); setTempAm(am); setTempTime(d); setTimeModalVisible(true); setShowTimePicker(false); } else { setTempTime(d); setTimeModalVisible(true); setShowTimePicker(true); } }} style={styles.smallBtn}>
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

            <TouchableOpacity onPress={saveMedication} style={styles.saveBtn}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </ScrollView>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

          {/* Time picker confirmation modal - friendly wrapper around top-level native picker */}
          <Modal visible={timeModalVisible} transparent animationType="fade" onRequestClose={() => { setTimeModalVisible(false); setShowTimePicker(false); setPickerIndex(null); }}>
            <View style={styles.timeModalWrapper}>
              <TouchableWithoutFeedback onPress={() => { setTimeModalVisible(false); setShowTimePicker(false); setPickerIndex(null); }}>
                <View style={styles.timeModalBackdrop} />
              </TouchableWithoutFeedback>
              <Animated.View style={[styles.timeModalContent, { opacity: MODAL_ANIM, transform: [{ translateY: MODAL_ANIM.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
                <Text style={styles.timeModalTitle}>Select time</Text>
                <Text style={styles.timeModalPreview}>{tempTime ? tempTime.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true }) : new Date().toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true })}</Text>
                    <Text style={styles.pickerLabel}>Pick a time</Text>
                    <View style={styles.wheelWrap}>
                      <View style={styles.wheelColumn}>
                        <ScrollView ref={hourRef} showsVerticalScrollIndicator={false} snapToInterval={ITEM_HEIGHT} decelerationRate="fast" onMomentumScrollEnd={(e) => {
                          const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
                          const val = hours[Math.max(0, Math.min(hours.length - 1, idx))];
                          setTempHour(val);
                        }}>
                          {hours.map((h) => (
                            <View key={`h-${h}`} style={[styles.wheelItem, tempHour === h && styles.wheelItemSelected]}>
                              <Text style={[styles.wheelItemText, tempHour === h && styles.wheelItemTextSelected]}>{h}</Text>
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                      <View style={styles.wheelColumnSeparator}><Text style={{ fontSize: 20 }}>:</Text></View>
                      <View style={styles.wheelColumn}>
                        <ScrollView ref={minuteRef} showsVerticalScrollIndicator={false} snapToInterval={ITEM_HEIGHT} decelerationRate="fast" onMomentumScrollEnd={(e) => {
                          const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
                          const val = minutes[Math.max(0, Math.min(minutes.length - 1, idx))];
                          setTempMinute(val);
                        }}>
                          {minutes.map((m) => (
                            <View key={`m-${m}`} style={[styles.wheelItem, tempMinute === m && styles.wheelItemSelected]}>
                              <Text style={[styles.wheelItemText, tempMinute === m && styles.wheelItemTextSelected]}>{m.toString().padStart(2, '0')}</Text>
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                      <View style={styles.wheelColumn}>
                        <ScrollView ref={amRef} showsVerticalScrollIndicator={false} snapToInterval={ITEM_HEIGHT} decelerationRate="fast" onMomentumScrollEnd={(e) => {
                          const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
                          setTempAm(idx % 2 === 0);
                        }}>
                          {[ 'AM', 'PM' ].map((p, i) => (
                            <View key={`a-${p}`} style={[styles.wheelItem, (tempAm ? 'AM' : 'PM') === p && styles.wheelItemSelected]}>
                              <Text style={[styles.wheelItemText, (tempAm ? 'AM' : 'PM') === p && styles.wheelItemTextSelected]}>{p}</Text>
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                    </View>

                    <Text style={styles.previewText}>You’ll be reminded at {`${tempHour}:${tempMinute.toString().padStart(2,'0')} ${tempAm ? 'AM' : 'PM'}`}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                      <TouchableOpacity style={[styles.secondaryBtn, { marginRight: 8 }]} onPress={() => { setTimeModalVisible(false); setPickerIndex(null); setTempTime(null); }}>
                        <Text style={styles.secondaryBtnText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.primarySmallBtn} onPress={() => {
                        // commit chosen time
                        const now = new Date();
                        let h = tempHour % 12;
                        if (!tempAm) h += 12;
                        const chosen = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, tempMinute, 0, 0);
                        if (pickerIndex === null) setTimes((t) => [...t, chosen.toISOString()]); else setTimes((t) => t.map((x,i)=> i===pickerIndex ? chosen.toISOString() : x));
                        setTimeModalVisible(false);
                        setPickerIndex(null);
                        setTempTime(null);
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

      {/* Render DateTimePicker at top-level (not inside Modal) to avoid Android Modal/Picker conflicts */}
      {showTimePicker && (
        <DateTimePicker
          value={tempTime || (pickerIndex !== null && times[pickerIndex] ? new Date(times[pickerIndex]) : new Date())}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e: any, d?: Date) => {
            const action = e?.type || e?.action || (e && e.nativeEvent && e.nativeEvent.action);
            const dismissed = action === 'dismissed' || action === 'dismissedAction' || action === 1;
            try {
              if (d && !dismissed) {
                if (Platform.OS === 'android') {
                  // Android: add immediately to avoid modal + native dialog overlap
                  addTime(d);
                } else {
                  // iOS: update preview and keep modal open for confirmation
                  setTempTime(d);
                }
              }
            } catch {
              // on error just hide native picker
            } finally {
              // ensure native picker is hidden after handling
              setTimeout(() => setShowTimePicker(false), 0);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollView: { flex: 1, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1F2937' },
  headerSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 6 },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E3A8A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  addText: { color: 'white', marginLeft: 8, fontWeight: '600' },
  addButtonFloat: { zIndex: 1000, elevation: 10 },
  fab: { position: 'absolute', right: 20, bottom: 80, width: 60, height: 60, borderRadius: 30, backgroundColor: '#1E3A8A', alignItems: 'center', justifyContent: 'center', zIndex: 2000, elevation: 14, shadowColor: '#000', shadowOffset: { width:0, height:8 }, shadowOpacity: 0.16, shadowRadius: 16 },
  emptyState: { padding: 24, alignItems: 'center' },
  emptyText: { color: '#6B7280' },
  medCard: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 14, padding: 18, marginBottom: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width:0, height:6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 },
  medAvatar: { width: 56, alignItems: 'center', marginRight: 12 },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E3A8A', alignItems: 'center', justifyContent: 'center' },
  medName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  medMeta: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  timeRow: { flexDirection: 'row', marginTop: 10, flexWrap: 'wrap' },
  timeBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, marginRight: 8, marginBottom: 8 },
  timeText: { color: '#1E3A8A', fontWeight: '700' },
  medActions: { marginLeft: 12, alignItems: 'center', justifyContent: 'center' },
  medContent: { flex: 1 },
  medActionsColumn: { width: 56, alignItems: 'center', justifyContent: 'center' },
  actionCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width:0, height:2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1, marginBottom: 8 },
  iconBtn: { padding: 6, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 10, marginBottom: 6 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  clearText: { color: '#EF4444', fontWeight: '600' },
  historyItem: { backgroundColor: 'white', borderRadius: 8, padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' },
  historyMed: { fontWeight: '600', color: '#1F2937' },
  historyTime: { color: '#6B7280' },
  historyStatus: { color: '#6B7280', fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12, borderRadius: 2 },
  historyItemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  historyLeft: { flex: 1 },
  historyRight: { width: 90, alignItems: 'flex-end' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },

  modalContainer: { flex: 1, backgroundColor: '#F8F9FA' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalClose: { padding: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  modalBody: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: 'white', borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width:0, height:2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  addTimeText: { color: '#1E3A8A', fontWeight: '600' },
  timeRowModal: { backgroundColor: 'white', padding: 8, marginRight: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minWidth: 110, marginBottom: 8 },
  timeTextModal: { fontWeight: '600', color: '#1F2937' },
  smallBtn: { marginLeft: 8, padding: 6 },
  inlinePicker: { backgroundColor: 'white', padding: 12, borderRadius: 12, marginTop: 12 },
  timeInput: { width: 64, height: 44, borderRadius: 10, backgroundColor: '#F3F4F6', textAlign: 'center', fontWeight: '600' },
  smallActionBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, backgroundColor: '#1E3A8A', alignItems: 'center', justifyContent: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  toggle: { width: 42, height: 26, borderRadius: 20, backgroundColor: '#E5E7EB', justifyContent: 'center', padding: 3 },
  toggleOn: { backgroundColor: '#1E3A8A' },
  toggleKnob: { width: 18, height: 18, borderRadius: 9, backgroundColor: 'white', transform: [{ translateX: 0 }] },
  saveBtn: { backgroundColor: '#1E3A8A', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  saveText: { color: 'white', fontWeight: '700' },
  timeModalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  timeModalContent: { backgroundColor: 'white', marginHorizontal: 24, borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width:0, height:6 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 10 },
  timeModalTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 6 },
  timeModalPreview: { fontSize: 22, fontWeight: '700', color: '#1E3A8A', marginBottom: 12 },
  timeModalButtons: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  outlineBtn: { borderWidth: 1, borderColor: '#1E3A8A', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
  outlineBtnText: { color: '#1E3A8A', fontWeight: '700' },
  secondaryBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' },
  secondaryBtnText: { color: '#374151', fontWeight: '700' },
  primarySmallBtn: { backgroundColor: '#1E3A8A', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  primarySmallBtnText: { color: 'white', fontWeight: '700' },
  modalAnimatedContainer: { backgroundColor: 'white', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E0E0E0', shadowColor: '#000', shadowOffset: { width:0, height:6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 12 },
  pickerLabel: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 8, textAlign: 'center' },
  wheelWrap: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 6 },
  wheelColumn: { width: 80, height: 44 * 3, overflow: 'hidden' },
  wheelColumnSeparator: { width: 20, alignItems: 'center', justifyContent: 'center' },
  wheelItem: { height: 44, alignItems: 'center', justifyContent: 'center' },
  wheelItemSelected: { backgroundColor: 'transparent' },
  wheelItemText: { fontSize: 22, color: '#374151' },
  wheelItemTextSelected: { color: '#0A2E68', fontWeight: '700' },
  previewText: { textAlign: 'center', color: '#6B7280', marginTop: 8 },
  timeModalWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: 'white', fontWeight: '700', fontSize: 16 },
  actionBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8, shadowColor: '#000', shadowOffset: { width:0, height:4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  actionBtnGreen: { backgroundColor: '#22C55E' },
  actionBtnOrange: { backgroundColor: '#F59E0B' },
  actionBtnBlue: { backgroundColor: '#2563EB' },
  actionBtnRed: { backgroundColor: '#EF4444' },
});
