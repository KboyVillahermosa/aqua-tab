import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator, FlatList, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as api from '../../../api';
import { initNotifications, scheduleLocalReminder, cancelLocalReminder, snoozeLocalReminder, registerResponseHandler, unregisterResponseHandler } from '../../../notifications/manager';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from '../../navigation/BottomNavigation';
import DateTimePicker from '@react-native-community/datetimepicker';

type ReminderItem = {
  id: number;
  type: string;
  title: string;
  note?: string;
  scheduled_at?: string | null;
  interval_minutes?: number | null;
  enabled?: boolean;
  missed_count?: number;
};

export default function Notification() {
  const { token } = useLocalSearchParams();
  console.log('Notification: received token=', token);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);

  // form
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'water'|'medication'>('water');
  // use a proper date/time picker now
  const [pickerDate, setPickerDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [interval, setInterval] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Notification: calling GET /reminders with token=', token);
      const res = await api.get('/reminders', token as string);
      const list = res || [];
      setReminders(list);
      // ensure local notifications are scheduled for existing reminders
      (async () => {
        try {
          for (const r of list) {
            try { await import('../../../notifications/manager').then(m => m.scheduleLocalReminder(r)); } catch { /* ignore */ }
          }
        } catch (e:any) { console.log('ensure schedule err', e); }
      })();
      // detect past-due reminders and auto-mark missed (simple heuristic)
      (async function processMissed() {
        try {
          const now = Date.now();
          const grace = 10 * 60 * 1000; // 10 minutes
          for (const r of list) {
            if (!r.scheduled_at) continue;
            const t = new Date(r.scheduled_at).getTime();
            if (isNaN(t)) continue;
            if (t + grace < now) {
              // past due by grace period — mark missed
              try {
                const updated = await api.post(`/reminders/${r.id}/missed`, {}, token as string);
                setReminders((s) => s.map((x) => (x.id === r.id ? updated : x)));
                // run smart adjustment if needed
                try {
                  const adj = await import('../../../notifications/manager').then(m => m.adjustReminderFrequencyIfNeeded(r, updated.missed_count, async (id, changes) => {
                    return await api.put(`/reminders/${id}`, changes, token as string);
                  }));
                  if (adj) {
                    // if server returned an updated reminder, reschedule local
                    try { await import('../../../notifications/manager').then(m => m.scheduleLocalReminder(adj)); } catch (e:any) { console.log('reschedule local after adj fail', e); }
                  }
                } catch (e:any) { console.log('smart adj err', e); }
              } catch { /* ignore failures */ }
            }
          }
        } catch (e:any) { console.log('processMissed err', e); }
      })();
    } catch (e:any) {
      console.log('reminders load err', e);
      Alert.alert('Error', 'Failed to load reminders');
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    // initialize notifications permission/handler
    initNotifications().catch((err: any) => console.log('notif init err', err));

    // register a response handler so notification actions (snooze/missed) trigger API calls
    const handler = async (resp: any) => {
      try {
        const action = resp.actionIdentifier;
        const data = resp.notification?.request?.content?.data || {};
        const rid = data.reminderId;
        if (!rid) return;
        if (!token) {
          console.log('notification action but no token');
          return;
        }
        if (action === 'missed') {
          try {
            const updated = await api.post(`/reminders/${rid}/missed`, {}, token as string);
            setReminders((s) => s.map((r) => (r.id === updated.id ? updated : r)));
            // cancel local scheduled if any
            await cancelLocalReminder(rid);
          } catch (err:any) { console.log('missed action err', err); }
        } else if (action && action.startsWith('snooze')) {
          const mins = action === 'snooze15' ? 15 : action === 'snooze30' ? 30 : 60;
          try {
            const updated = await api.post(`/reminders/${rid}/snooze`, { minutes: mins }, token as string);
            setReminders((s) => s.map((r) => (r.id === updated.id ? updated : r)));
            await snoozeLocalReminder(rid, mins);
          } catch (err:any) { console.log('snooze action err', err); }
        }
      } catch (err:any) { console.log('response handler overall err', err); }
    };
    registerResponseHandler(handler);
    return () => { unregisterResponseHandler(); };
  }, [token]);

  async function createReminder() {
    if (!title.trim()) return Alert.alert('Please enter a title');
    const payload: any = { type, title };
    if (pickerDate) {
      payload.scheduled_at = pickerDate.toISOString();
    }
    if (interval) payload.interval_minutes = parseInt(interval, 10) || null;
    try {
      const res = await api.post('/reminders', payload, token as string);
  setReminders((s) => [res, ...s]);
  // schedule local notification for offline support
  try { await scheduleLocalReminder(res); } catch (e:any) { console.log('schedule local fail', e); }
  setTitle(''); setPickerDate(null); setInterval('');
      Alert.alert('Saved', 'Reminder created');
    } catch (e:any) {
      console.log('createReminder err', e);
      // api throws { status, data }
      if (e && e.data) {
        const data = e.data;
        const msg = (data && (data.message || data.error)) || JSON.stringify(data);
        Alert.alert('Error', String(msg));
      } else {
        Alert.alert('Error', 'Failed to create');
      }
    }
  }

  async function doDelete(id:number) {
    try {
      await api.del(`/reminders/${id}`, token as string);
      setReminders((s) => s.filter((r)=>r.id !== id));
      // cancel local notification
  cancelLocalReminder(id).catch((err: any) => console.log('cancel local fail', err));
    } catch (e:any) { console.log(e); Alert.alert('Error', 'Failed to delete'); }
  }

  async function doSnooze(id:number, minutes:number) {
    try {
      const res = await api.post(`/reminders/${id}/snooze`, { minutes }, token as string);
      setReminders((s) => s.map((r)=> (r.id===id ? res : r)));
      Alert.alert('Snoozed', `Reminder snoozed ${minutes} minutes`);
      // snooze local scheduled notification as well
  snoozeLocalReminder(id, minutes).catch((err: any) => console.log('snooze local fail', err));
    } catch (e:any) { console.log(e); Alert.alert('Error', 'Failed to snooze'); }
  }

  async function markMissed(id:number) {
    try {
      const res = await api.post(`/reminders/${id}/missed`, {}, token as string);
      setReminders((s) => s.map((r)=> (r.id===id ? res : r)));
      Alert.alert('Logged', 'Missed reminder recorded');
    } catch (e:any) { console.log(e); Alert.alert('Error', 'Failed to log missed'); }
  }

  function renderItem({ item }: { item: ReminderItem }) {
    const scheduled = item.scheduled_at ? new Date(item.scheduled_at).toLocaleString() : '—';
    return (
      <View style={styles.card}>
        <View style={styles.rowTop}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, item.type==='water' ? styles.badgeBlue : styles.badgeAmber]}>
              <Ionicons name={item.type==='water' ? 'water' : 'medical'} size={16} color={item.type==='water' ? '#075985' : '#92400E'} />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </View>
          <Text style={styles.missed}>{item.missed_count || 0} missed</Text>
        </View>

        <Text style={styles.scheduled}>Scheduled: {scheduled}</Text>
        {item.note ? <Text style={styles.note}>{item.note}</Text> : null}

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.smallButton} onPress={()=>doSnooze(item.id, 15)}><Text style={styles.smallBtnText}>Snooze 15m</Text></TouchableOpacity>
          <TouchableOpacity style={styles.smallButton} onPress={()=>doSnooze(item.id, 30)}><Text style={styles.smallBtnText}>Snooze 30m</Text></TouchableOpacity>
          <TouchableOpacity style={styles.smallButton} onPress={()=>doSnooze(item.id, 60)}><Text style={styles.smallBtnText}>Snooze 60m</Text></TouchableOpacity>
          <TouchableOpacity style={styles.ghost} onPress={()=>markMissed(item.id)}><Text style={styles.ghostText}>Mark missed</Text></TouchableOpacity>
          <TouchableOpacity style={styles.delete} onPress={()=>doDelete(item.id)}><Text style={styles.deleteText}>Delete</Text></TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) return <SafeAreaView style={{flex:1,justifyContent:'center'}}><ActivityIndicator /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.typeRow}>
          <TouchableOpacity style={[styles.typeBtn, type==='water' && styles.typeBtnActive]} onPress={()=>setType('water')}><Text style={[styles.typeTxt, type==='water' && styles.typeTxtActive]}>Water</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.typeBtn, type==='medication' && styles.typeBtnActive]} onPress={()=>setType('medication')}><Text style={[styles.typeTxt, type==='medication' && styles.typeTxtActive]}>Medication</Text></TouchableOpacity>
        </View>
        <TextInput placeholder={type==='water' ? 'Hydration reminder title (e.g. Drink water)' : 'Medication title (e.g. Paracetamol)'} value={title} onChangeText={setTitle} style={styles.input} />
        <View style={{flexDirection:'row'}}>
          <View style={[styles.input, {flex:1, marginRight:8, justifyContent:'center'}]}>
            <Text style={{color: pickerDate ? '#0F172A' : '#6B7280'}}>{pickerDate ? new Date(pickerDate).toLocaleString() : 'No scheduled time'}</Text>
          </View>
          <TextInput placeholder='Interval (min)' value={interval} onChangeText={setInterval} style={[styles.input, {width:110}]} keyboardType='numeric' />
        </View>
        <View style={{flexDirection:'row', alignItems:'center', marginTop:8}}>
          <TouchableOpacity style={[styles.secondaryBtn, {marginRight:8}]} onPress={()=> setShowDatePicker(true)}><Text style={styles.secondaryBtnText}>Pick date</Text></TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={()=> setShowTimePicker(true)}><Text style={styles.secondaryBtnText}>Pick time</Text></TouchableOpacity>
          <Text style={{marginLeft:12, color:'#374151'}}>{pickerDate ? new Date(pickerDate).toLocaleString() : 'No scheduled time'}</Text>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={pickerDate || new Date()}
            mode='date'
            display='default'
            onChange={(ev, val) => { setShowDatePicker(false); if (val) setPickerDate(new Date(val)); }}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={pickerDate || new Date()}
            mode='time'
            display='default'
            onChange={(ev, val) => { setShowTimePicker(false); if (val) {
              const d = pickerDate ? new Date(pickerDate) : new Date();
              d.setHours(val.getHours()); d.setMinutes(val.getMinutes()); setPickerDate(d);
            } }}
          />
        )}
        <View style={{flexDirection:'row', marginTop:10}}>
          <TouchableOpacity style={styles.primaryBtn} onPress={createReminder}><Text style={styles.primaryBtnText}>Create</Text></TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={load}><Text style={styles.secondaryBtnText}>Refresh</Text></TouchableOpacity>
        </View>
      </View>

      <FlatList data={reminders} keyExtractor={(i)=>String(i.id)} renderItem={renderItem} contentContainerStyle={{padding:16}} />
      <BottomNavigation currentRoute="notifications" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#F8FAFC' },
  form: { padding:16, backgroundColor:'white', margin:12, borderRadius:12, shadowColor:'#000', shadowOpacity:0.04, shadowRadius:8, elevation:3 },
  typeRow: { flexDirection:'row', marginBottom:8 },
  typeBtn: { paddingVertical:8, paddingHorizontal:12, borderRadius:8, marginRight:8, backgroundColor:'#F3F4F6' },
  typeBtnActive: { backgroundColor:'#EFF6FF' },
  typeTxt: { color:'#374151', fontWeight:'600' },
  typeTxtActive: { color:'#075985' },
  input: { backgroundColor:'#F3F4F6', padding:10, borderRadius:8, marginBottom:8, color:'#0F172A' },
  primaryBtn: { backgroundColor:'#0F172A', paddingVertical:12, paddingHorizontal:16, borderRadius:10, marginRight:8 },
  primaryBtnText: { color:'white', fontWeight:'700' },
  secondaryBtn: { borderColor:'#E5E7EB', borderWidth:1, paddingVertical:12, paddingHorizontal:16, borderRadius:10 },
  secondaryBtnText: { color:'#374151', fontWeight:'700' },

  card: { backgroundColor:'white', borderRadius:12, padding:12, marginBottom:12, shadowColor:'#000', shadowOpacity:0.03, shadowRadius:6, elevation:2 },
  rowTop: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  badgeRow: { flexDirection:'row', alignItems:'center' },
  badge: { width:34, height:34, borderRadius:10, alignItems:'center', justifyContent:'center', marginRight:10 },
  badgeBlue: { backgroundColor:'#EFF6FF' },
  badgeAmber: { backgroundColor:'#FFF7ED' },
  cardTitle: { fontSize:16, fontWeight:'800', color:'#0F172A' },
  missed: { color:'#92400E', fontWeight:'700' },
  scheduled: { color:'#6B7280', fontSize:13, marginBottom:6 },
  note: { color:'#374151', fontSize:13, marginBottom:8 },
  actionsRow: { flexDirection:'row', flexWrap:'wrap' },
  smallButton: { backgroundColor:'#EEF2FF', paddingVertical:8, paddingHorizontal:10, borderRadius:8, marginRight:8, marginBottom:8 },
  smallBtnText: { color:'#075985', fontWeight:'700' },
  ghost: { paddingVertical:8, paddingHorizontal:10, borderRadius:8, marginRight:8, marginBottom:8 },
  ghostText: { color:'#6B7280' },
  delete: { paddingVertical:8, paddingHorizontal:10, borderRadius:8, backgroundColor:'#FEF2F2' },
  deleteText: { color:'#B91C1C', fontWeight:'700' },
});
