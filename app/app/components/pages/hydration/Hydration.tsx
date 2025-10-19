import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, SafeAreaView, ScrollView, Animated, Easing } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as api from '../../../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigation from '../../navigation/BottomNavigation';
import { Ionicons } from '@expo/vector-icons';

// ProgressBar removed (unused) — visual progress is handled inline with animated circle

export default function Hydration() {
  const { token } = useLocalSearchParams();
  const [goal, setGoal] = useState<number>(2000);
  const [entries, setEntries] = useState<any[]>([]);
  const [amountInput, setAmountInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [historyRange, setHistoryRange] = useState<'daily'|'weekly'|'monthly'>('daily');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [missedCount, setMissedCount] = useState<number>(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const anim = useRef(new Animated.Value(0)).current;

  const fmt = (n:number) => {
    try { return n.toLocaleString(); } catch { return String(n); }
  };

  function chartItems() {
    if (!historyData || historyData.length === 0) return [];
    
    return historyData.map((h:any) => {
      let label = '';
      let amount = h.amount_ml || 0;
      
      if (h.date) {
        // Use day name for daily view (Mon, Tue, etc.)
        label = h.day_name || new Date(h.date).toLocaleDateString('en', { weekday: 'short' });
      } else if (h.week_start) {
        // Use week label from backend
        label = h.week_label || new Date(h.week_start).toLocaleDateString('en', { month: 'short', day: 'numeric' });
      } else if (h.month) {
        // Use month label from backend
        label = h.month_label || new Date(h.month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' });
      } else {
        // fallback
        label = String(Object.values(h)[0] || '').slice(0, 5);
      }
      
      return { label, amount, isToday: h.is_today || false };
    });
  }

  function getMaxAmount() {
    if (!historyData || historyData.length === 0) return goal;
    return Math.max(...historyData.map(h => h.amount_ml || 0), goal);
  }

  // Calendar functions
  function generateCalendarDays() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = calendarData.find(d => d.date === dateStr);
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const isSelected = dateStr === selectedDate.toISOString().split('T')[0];
      
      days.push({
        date: new Date(currentDate), // Create a new Date object
        dateStr,
        amount: dayData?.amount_ml || 0,
        percentage: dayData ? (dayData.amount_ml / goal) * 100 : 0,
        isCurrentMonth,
        isToday,
        isSelected
      });
    }
    
    return days;
  }

  function getHydrationLevel(percentage: number) {
    if (percentage >= 100) return { level: 'excellent', color: '#10B981', icon: 'checkmark-circle' };
    if (percentage >= 75) return { level: 'good', color: '#3B82F6', icon: 'checkmark' };
    if (percentage >= 50) return { level: 'fair', color: '#F59E0B', icon: 'warning' };
    if (percentage >= 25) return { level: 'poor', color: '#EF4444', icon: 'close-circle' };
    return { level: 'none', color: '#E5E7EB', icon: 'remove-circle' };
  }

  function navigateMonth(direction: 'prev' | 'next') {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  }

  useEffect(() => {
    async function load() {
      try {
        // first, try local storage
        const local = await AsyncStorage.getItem('hydration');
        if (local) {
          const parsed = JSON.parse(local);
          setGoal(parsed.goal ?? 2000);
          setEntries(parsed.entries ?? []);
        }
        // then try server
        if (token) {
          const res = await api.get('/hydration', token as string);
          if (res) {
            setGoal(res.goal ?? 2000);
            setEntries(res.entries ?? []);
            setMissedCount((res.missed || []).length || 0);
            await AsyncStorage.setItem('hydration', JSON.stringify(res));
          }
        }
      } catch (err:any) {
        console.log('Hydration load error', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  useEffect(() => {
    async function loadHistory() {
      if (!token) return;
      try {
        const h = await api.get(`/hydration/history?range=${historyRange}`, token as string);
        setHistoryData(h || []);
      } catch (e) { console.log('history load err', e); }
    }
    loadHistory();
  }, [token, historyRange]);

  useEffect(() => {
    async function loadCalendarData() {
      if (!token) return;
      try {
        // Load daily data for the current month
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        
        // Get all entries for the month
        const entries = await api.get(`/hydration/history?range=daily&start=${startDate.toISOString().split('T')[0]}&end=${endDate.toISOString().split('T')[0]}`, token as string);
        setCalendarData(entries || []);
      } catch (e) { 
        console.log('calendar data load err', e);
        // Fallback to current history data
        setCalendarData(historyData);
      }
    }
    loadCalendarData();
  }, [token, currentMonth, historyData]);

  // compute percent once and animate when it changes
  const currentPercent = percent();
  useEffect(() => {
    const to = Math.min(100, currentPercent);
    Animated.timing(anim, { toValue: to, duration: 800, useNativeDriver: false, easing: Easing.out(Easing.ease) }).start();
  }, [currentPercent, anim]);

  async function persistLocal(data?: any) {
    const payload = data ?? { goal, entries };
  try { await AsyncStorage.setItem('hydration', JSON.stringify(payload)); } catch { }
  }

  async function addAmount(amountMl: number, source = 'quick') {
    const entry = { amount_ml: amountMl, timestamp: new Date().toISOString(), source };
    const newEntries = [...entries, entry];
    setEntries(newEntries);
    await persistLocal({ goal, entries: newEntries });
    // optimistic server sync
    if (token) {
      try {
        await api.post('/hydration', { amount_ml: amountMl, source }, token as string);
      } catch (err:any) {
        console.log('Hydration sync error', err);
      }
    }
  }

  async function submitCustom() {
    const val = parseInt(amountInput || '0', 10);
    if (!val || val <= 0) return Alert.alert('Invalid', 'Enter a positive amount in ml');
    setAmountInput('');
    addAmount(val, 'custom');
  }

  async function changeGoal() {
    Alert.prompt(
      'Daily Hydration Goal', 
      'Set your daily water intake goal in milliliters\n\nRecommended: 2000-3000ml for adults', 
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Quick Set', onPress: () => {
          Alert.alert('Quick Goal Set', 'Choose a preset goal', [
            { text: '1500ml', onPress: () => updateGoal(1500) },
            { text: '2000ml', onPress: () => updateGoal(2000) },
            { text: '2500ml', onPress: () => updateGoal(2500) },
            { text: '3000ml', onPress: () => updateGoal(3000) },
            { text: 'Cancel', style: 'cancel' }
          ]);
        }},
        { text: 'Custom', onPress: async (text:any) => {
          const v = parseInt(text || '0', 10);
          if (!v || v <= 0) return Alert.alert('Invalid', 'Goal must be between 1000-5000ml');
          if (v < 1000 || v > 5000) return Alert.alert('Invalid', 'Goal must be between 1000-5000ml');
          await updateGoal(v);
        }}
      ], 
      'plain-text', 
      String(goal)
    );
  }

  async function updateGoal(newGoal: number) {
    setGoal(newGoal);
    await persistLocal({ goal: newGoal, entries });
    if (token) {
      try { 
        await api.post('/hydration/goal', { goal_ml: newGoal }, token as string);
        Alert.alert('Success', `Daily goal updated to ${newGoal}ml`);
      } catch (e) { 
        console.log('Goal update error:', e);
        Alert.alert('Error', 'Failed to update goal on server');
      }
    }
  }

  function totalToday() {
    const today = new Date().toISOString().slice(0,10);
    return entries.reduce((sum, e) => sum + ((e.timestamp||'').slice(0,10) === today ? (e.amount_ml||0) : 0), 0);
  }

  function recentList() {
    return [...entries].reverse().slice(0,8);
  }

  function percent() {
    return (totalToday() / (goal || 1)) * 100;
  }

  function getMotivationalMessage() {
    const pct = percent();
    if (pct >= 100) return "🎉 Excellent! You've reached your daily goal!";
    if (pct >= 75) return "💪 Almost there! Keep going!";
    if (pct >= 50) return "👍 Great progress! Halfway there!";
    if (pct >= 25) return "💧 Good start! Keep hydrating!";
    return "🚰 Let's start your hydration journey!";
  }

  function getProgressColor() {
    const pct = percent();
    if (pct >= 100) return '#10B981'; // Green
    if (pct >= 75) return '#3B82F6'; // Blue
    if (pct >= 50) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  }

  async function logMissed() {
    // record a missed reminder
    const ts = new Date().toISOString();
    try {
      // store locally as an entry in missed
      const localRaw = await AsyncStorage.getItem('hydration');
      const obj = localRaw ? JSON.parse(localRaw) : { goal, entries, missed: [] };
      obj.missed = obj.missed || [];
      obj.missed.push(ts);
      await AsyncStorage.setItem('hydration', JSON.stringify(obj));
      if (token) {
        await api.post('/hydration/missed', { timestamp: ts }, token as string);
      }
      Alert.alert('Logged', 'Missed reminder recorded');
    } catch (e) { console.log('missed log error', e); }
  }

  if (loading) return <SafeAreaView style={{flex:1,justifyContent:'center'}}><Text>Loading...</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 160 }]}>
        <View style={styles.headerRowAlt}>
          <View>
            <Text style={styles.title}>Hydration</Text>
          </View>
          <View style={styles.goalWrap}>
            <Text style={styles.goalLabel}>Goal:</Text>
            <TouchableOpacity onPress={changeGoal} style={styles.goalPill}><Text style={styles.goalText}>{goal} ml</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.progressCardRow}>
          <View style={styles.progressCardLeft}>
            <Text style={styles.progressHeadline}>{Math.round(percent())}%</Text>
            <View style={styles.progressBarWrapper}>
              <View style={styles.progressBarBg} />
              <Animated.View style={[
                styles.progressBarFill, 
                { 
                  width: anim.interpolate({ inputRange: [0,100], outputRange: ['0%','100%'] }),
                  backgroundColor: getProgressColor()
                }
              ]} />
            </View>
            <Text style={styles.progressSubText}>{fmt(totalToday())} / {fmt(goal)} ml</Text>
            <Text style={styles.motivationalText}>{getMotivationalMessage()}</Text>
          </View>

          <View style={styles.progressCardRight}>
            <View style={styles.missedCardAlt}>
              <View style={styles.missedIconPlaceholder} />
              <Text style={styles.missedLabelAlt}>Missed</Text>
              <Text style={styles.missedNumberAlt}>{missedCount}</Text>
              <TouchableOpacity onPress={logMissed}><Text style={styles.logMissedTextAlt}>Log missed</Text></TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.cardAlt}>
          <Text style={styles.quickAddTitle}>Quick Add</Text>
          <View style={styles.quickRowAlt}>
            <TouchableOpacity style={[styles.quickCard, {backgroundColor:'#60A5FA'}]} onPress={() => addAmount(200,'quick')} activeOpacity={0.85}>
              <Ionicons name="water" size={18} color="white" />
              <Text style={styles.quickCardValue}>200</Text>
              <Text style={styles.quickCardUnit}>ml</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickCard, {backgroundColor:'#3B82F6'}]} onPress={() => addAmount(500,'quick')} activeOpacity={0.85}>
              <Ionicons name="water" size={18} color="white" />
              <Text style={styles.quickCardValue}>500</Text>
              <Text style={styles.quickCardUnit}>ml</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickCard, {backgroundColor:'#1D4ED8'}]} onPress={() => addAmount(1000,'quick')} activeOpacity={0.85}>
              <Ionicons name="flask" size={18} color="white" />
              <Text style={styles.quickCardValue}>1</Text>
              <Text style={styles.quickCardUnit}>L</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.quickRowAlt}>
            <TouchableOpacity style={[styles.quickCard, {backgroundColor:'#10B981'}]} onPress={() => addAmount(150,'quick')} activeOpacity={0.85}>
              <Ionicons name="cafe" size={18} color="white" />
              <Text style={styles.quickCardValue}>150</Text>
              <Text style={styles.quickCardUnit}>ml</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickCard, {backgroundColor:'#F59E0B'}]} onPress={() => addAmount(750,'quick')} activeOpacity={0.85}>
              <Ionicons name="wine" size={18} color="white" />
              <Text style={styles.quickCardValue}>750</Text>
              <Text style={styles.quickCardUnit}>ml</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickCard, {backgroundColor:'#EF4444'}]} onPress={() => addAmount(1500,'quick')} activeOpacity={0.85}>
              <Ionicons name="beaker" size={18} color="white" />
              <Text style={styles.quickCardValue}>1.5</Text>
              <Text style={styles.quickCardUnit}>L</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.customRowAlt}>
            <TextInput value={amountInput} onChangeText={setAmountInput} placeholder="Enter amount in ml" keyboardType="numeric" style={styles.inputAlt} />
            <TouchableOpacity style={styles.addBtnAlt} onPress={submitCustom} activeOpacity={0.9}><Text style={styles.addBtnText}>Add</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
              <Ionicons name="chevron-back" size={20} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>
              {currentMonth.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
              <Ionicons name="chevron-forward" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarGrid}>
            {/* Day headers */}
            <View style={styles.dayHeaders}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Text key={day} style={styles.dayHeader}>{day}</Text>
              ))}
            </View>

            {/* Calendar days */}
            <View style={styles.calendarDays}>
              {generateCalendarDays().map((day, index) => {
                const hydrationLevel = getHydrationLevel(day.percentage);
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.calendarDay,
                      !day.isCurrentMonth && styles.calendarDayOtherMonth,
                      day.isToday && styles.calendarDayToday,
                      day.isSelected && styles.calendarDaySelected
                    ]}
                    onPress={() => setSelectedDate(day.date)}
                  >
                    <Text style={[
                      styles.calendarDayText,
                      !day.isCurrentMonth && styles.calendarDayTextOtherMonth,
                      day.isToday && styles.calendarDayTextToday,
                      day.isSelected && styles.calendarDayTextSelected
                    ]}>
                      {day.date.getDate()}
                    </Text>
                    
                    {day.amount > 0 && (
                      <View style={styles.hydrationIndicator}>
                        <Ionicons 
                          name={hydrationLevel.icon as any} 
                          size={12} 
                          color={hydrationLevel.color} 
                        />
                      </View>
                    )}
                    
                    {day.amount > 0 && (
                      <Text style={styles.dayAmount}>{Math.round(day.amount)}ml</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Selected day details */}
          {selectedDate && (
            <View style={styles.selectedDayDetails}>
              <Text style={styles.selectedDayTitle}>
                {selectedDate.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
              {(() => {
                const selectedDayData = calendarData.find(d => d.date === selectedDate.toISOString().split('T')[0]);
                const amount = selectedDayData?.amount_ml || 0;
                const percentage = (amount / goal) * 100;
                const level = getHydrationLevel(percentage);
                
                return (
                  <View style={styles.dayStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{amount}ml</Text>
                      <Text style={styles.statLabel}>Consumed</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{Math.round(percentage)}%</Text>
                      <Text style={styles.statLabel}>of Goal</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name={level.icon as any} size={20} color={level.color} />
                      <Text style={[styles.statLabel, { color: level.color }]}>{level.level}</Text>
                    </View>
                  </View>
                );
              })()}
            </View>
          )}

          {/* Recent entries with alternating rows */}
          <View style={{marginTop:12}}>
            {recentList().map((e:any, idx:number) => (
              <View key={idx} style={[styles.historyRowAlt, idx % 2 === 0 ? styles.rowAltEven : styles.rowAltOdd]}>
                <Text style={styles.historyText}>💧 {new Date(e.timestamp).toLocaleTimeString()} • {e.source}</Text>
                <Text style={styles.historyAmt}>{fmt(e.amount_ml || 0)} ml</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      <BottomNavigation currentRoute="hydration" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#F8FAFC' },
  content: { padding:20 },
  header: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  headerRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  title: { fontSize:24, fontWeight:'700', color:'#0F172A' },
  editGoal: { color:'#2563EB', fontWeight:'600' },
  card: { backgroundColor:'white', borderRadius:12, padding:16, marginBottom:16, shadowColor:'#000', shadowOpacity:0.05, elevation:2 },
  cardTitle: { fontSize:16, fontWeight:'700', color:'#0F172A', marginBottom:8 },
  total: { fontSize:20, fontWeight:'700', color:'#0F172A', marginBottom:8 },
  progressContainer: { marginBottom:12 },
  progressWrap: { height:12, backgroundColor:'#E6EEF8', borderRadius:8, overflow:'hidden', position:'relative' },
  progressBar: { height:12, backgroundColor:'#2563EB' },
  progressLabel: { position:'absolute', right:8, top:-18, color:'#0F172A', fontWeight:'600' },
  quickRow: { flexDirection:'row', justifyContent:'space-between', marginTop:12 },
  quickBtn: { padding:12, borderRadius:8, backgroundColor:'#E6EEF8', flex:1, marginRight:8, alignItems:'center' },
  quickBtnPrimary: { padding:12, borderRadius:8, backgroundColor:'#2563EB', flex:1, marginLeft:8, alignItems:'center' },
  quickText: { color:'#0F172A', fontWeight:'700' },
  quickTextPrimary: { color:'white', fontWeight:'700' },
  customRow: { flexDirection:'row', marginTop:12 },
  input: { flex:1, backgroundColor:'#F3F4F6', borderRadius:8, paddingHorizontal:12, marginRight:8 },
  addBtn: { backgroundColor:'#10B981', paddingHorizontal:16, justifyContent:'center', borderRadius:8 },
  historyCard: { backgroundColor:'white', borderRadius:12, padding:12, marginBottom:16 },
  emptyRecent: { paddingVertical:20 },
  emptyText: { color:'#6B7280' },
  historyItem: { flexDirection:'row', justifyContent:'space-between', paddingVertical:8, borderBottomColor:'#F1F5F9', borderBottomWidth:1 },
  
  actionsRow: { flexDirection:'row', justifyContent:'space-between' },
  missedBtn: { padding:12, borderRadius:8, backgroundColor:'#FEF3C7' },

  /* polished UI styles */
  headerRowAlt: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  goalWrap: { flexDirection: 'row', alignItems: 'center' },
  goalLabel: { color: '#6B7280', marginRight: 8, fontWeight: '600' },
  goalPill: { backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#E6EEF8' },
  goalText: { fontWeight: '700', color: '#0F172A' },

  progressCard: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 14, padding: 20, marginBottom: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 6 },
  progressLeft: { flex: 1, alignItems: 'center' },
  progressRight: { width: 120, alignItems: 'flex-end' },
  progressCircleWrap: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'visible' },
  circleTrack: { position: 'absolute', width: 112, height: 112, borderRadius: 56, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6EEF8', top: 4 },
  circleProgress: { position: 'absolute', height: 112, borderRadius: 56, backgroundColor: '#60A5FA', opacity: 0.12, top: 4, left: 4 },
  circleCenterAlt: { width: 92, height: 92, borderRadius: 46, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  percentText: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  progressSub: { fontSize: 12, color: '#6B7280', marginTop: 4 },

  /* top cap and droplet */
  topCap: { position: 'absolute', width: 18, height: 10, borderRadius: 6, backgroundColor: '#60A5FA', top: -10, left: 51, zIndex: 10 },
  percentTextLarge: { fontSize: 34, fontWeight: '900', color: '#0F172A' },
  progressSubLarge: { fontSize: 12, color: '#374151', marginTop: 6 },
  dropWrap: { position: 'absolute', bottom: -20, left: 53, alignItems: 'center' },
  drop: { width: 14, height: 20, backgroundColor: '#60A5FA', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, borderTopLeftRadius: 6, borderTopRightRadius: 6 },

  missedCard: { backgroundColor: '#FEF3C7', padding: 10, borderRadius: 10, alignItems: 'center' },
  missedLabel: { fontSize: 12, color: '#92400E' },
  missedNumber: { fontSize: 18, fontWeight: '800', color: '#92400E', marginTop: 6 },
  logMissedBtn: { marginTop: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: 'transparent' },
  logMissedText: { color: '#92400E', fontWeight: '700' },

  /* alternative missed card style to match pale yellow design */
  missedCardAlt: { backgroundColor: '#FEF7E7', padding: 20, borderRadius: 14, width: 150, alignItems: 'center', justifyContent: 'center', shadowColor:'#000', shadowOpacity:0.02, shadowRadius:6, elevation:2 },
  missedLabelAlt: { fontSize: 12, color: '#92400E', marginBottom: 8, fontWeight: '700' },
  missedNumberAlt: { fontSize: 36, fontWeight: '900', color: '#92400E', marginBottom: 6 },
  logMissedTextAlt: { marginTop: 6, color: '#92400E', fontWeight: '800' },

  cardAlt: { backgroundColor:'white', borderRadius:12, padding:14, marginBottom:16 },
  quickAddTitle: { fontSize:16, fontWeight:'700', color:'#0F172A', marginBottom:12 },
  quickRowAlt: { flexDirection:'row', justifyContent:'space-between', marginBottom:8 },
  quickCard: { flex: 1, marginRight: 8, paddingVertical: 14, borderRadius: 12, alignItems:'center' },
  quickCardValue: { color: 'white', fontWeight: '800', fontSize: 18, marginTop: 6 },
  quickCardUnit: { color: 'white', fontSize: 12, marginTop: 2 },
  customRowAlt: { flexDirection: 'row', marginTop: 12 },
  inputAlt: { flex:1, backgroundColor:'#F3F4F6', borderRadius:8, paddingHorizontal:12, marginRight:8 },
  addBtnAlt: { backgroundColor:'#0F172A', paddingHorizontal:16, justifyContent:'center', borderRadius:8 },
  addBtnText: { color:'white', fontWeight:'800' },

  // Calendar styles
  calendarCard: { backgroundColor:'white', borderRadius:16, padding:16, marginBottom:16, shadowColor:'#000', shadowOpacity:0.05, shadowRadius:8, elevation:3 },
  calendarHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  navButton: { width:32, height:32, borderRadius:16, backgroundColor:'#F3F4F6', justifyContent:'center', alignItems:'center' },
  calendarTitle: { fontSize:18, fontWeight:'700', color:'#1F2937' },
  calendarGrid: { marginBottom:16 },
  dayHeaders: { flexDirection:'row', marginBottom:8 },
  dayHeader: { flex:1, textAlign:'center', fontSize:12, fontWeight:'600', color:'#6B7280', paddingVertical:8 },
  calendarDays: { flexDirection:'row', flexWrap:'wrap' },
  calendarDay: { width:'14.28%', aspectRatio:1, justifyContent:'center', alignItems:'center', borderRadius:8, marginBottom:4, position:'relative' },
  calendarDayOtherMonth: { opacity:0.3 },
  calendarDayToday: { backgroundColor:'#EBF8FF', borderWidth:2, borderColor:'#3B82F6' },
  calendarDaySelected: { backgroundColor:'#1D4ED8' },
  calendarDayText: { fontSize:14, fontWeight:'500', color:'#374151' },
  calendarDayTextOtherMonth: { color:'#9CA3AF' },
  calendarDayTextToday: { color:'#1D4ED8', fontWeight:'700' },
  calendarDayTextSelected: { color:'white', fontWeight:'700' },
  hydrationIndicator: { position:'absolute', top:2, right:2 },
  dayAmount: { fontSize:8, color:'#6B7280', fontWeight:'500', marginTop:2 },
  selectedDayDetails: { backgroundColor:'#F8FAFC', borderRadius:12, padding:16, marginTop:8 },
  selectedDayTitle: { fontSize:16, fontWeight:'600', color:'#1F2937', marginBottom:12 },
  dayStats: { flexDirection:'row', justifyContent:'space-around' },
  statItem: { alignItems:'center' },
  statValue: { fontSize:18, fontWeight:'700', color:'#1F2937', marginBottom:4 },
  statLabel: { fontSize:12, color:'#6B7280', fontWeight:'500' },

  chartRowAlt: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 12, height: 160, paddingHorizontal: 4 },
  chartBarContainer: { alignItems: 'center', flex: 1, minWidth: 32 },
  chartBarWrapper: { alignItems: 'center', justifyContent: 'flex-end', height: 120, marginBottom: 8 },
  barAlt: { width: 20, backgroundColor: '#60A5FA', borderRadius: 4, marginBottom: 4 },
  barAmount: { fontSize: 9, color: '#374151', fontWeight: '600', textAlign: 'center', minHeight: 12 },
  barLabel: { fontSize: 10, color: '#6B7280', fontWeight: '500', textAlign: 'center' },
  todayLabel: { color: '#10B981', fontWeight: '700' },
  emptyChartContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptySubText: { fontSize: 12, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },

  historyRowAlt: { flexDirection: 'row', justifyContent:'space-between', paddingVertical:10, paddingHorizontal:8, borderRadius:8 },
  rowAltEven: { backgroundColor: '#FFFFFF' },
  rowAltOdd: { backgroundColor: '#F8FAFC' },
  historyText: { color:'#475569' },
  historyAmt: { fontWeight:'700', color:'#0F172A' },
  /* horizontal progress layout */
  progressCardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderRadius: 14, padding: 18, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 4 },
  progressCardLeft: { flex: 1, paddingRight: 12 },
  progressHeadline: { fontSize: 36, fontWeight: '900', color: '#0F172A' },
  progressBarWrapper: { marginTop: 10, height: 8, borderRadius: 8, backgroundColor: 'transparent', overflow: 'hidden' },
  progressBarBg: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#F1F5F9', borderRadius: 8 },
  progressBarFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#60A5FA', borderRadius: 8 },
  progressSubText: { marginTop: 8, color: '#6B7280', fontSize: 13 },
  motivationalText: { marginTop: 8, color: '#374151', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  progressCardRight: { width: 150, alignItems: 'center', justifyContent: 'center' },
  missedIconPlaceholder: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#FFF4E6', marginBottom: 8 },
});
