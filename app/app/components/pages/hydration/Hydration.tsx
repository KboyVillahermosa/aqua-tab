import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, SafeAreaView, ScrollView, Animated, Easing, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import * as api from '../../../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigation from '../../navigation/BottomNavigation';
import { Ionicons } from '@expo/vector-icons';
import { notificationManager } from '../../../services/notificationManager';
import { calculateDailyWaterGoal, getDynamicQuickAddPresets, calculateHydrationPace } from '../../../hooks/useHydrationGoal';
import { useCelebrationAnimation, useWaterGlassAnimation, usePulseAnimation, useBounceAnimation } from '../../../hooks/useHydrationAnimations';
import * as Notifications from 'expo-notifications';

/**
 * HYDRATION SCREEN - EXPO GO COMPATIBLE
 * 
 * This component uses ONLY Expo Go-compatible notification features.
 * NO native modules, NO push tokens, NO background tasks.
 * 
 * NOTIFICATION TYPES:
 * 1. In-App Toast Messages: For hydration reminders and progress updates
 *    - Uses react-native-toast-message
 *    - Works in Expo Go without any build
 * 
 * 2. Alert Dialogs: For critical warnings and confirmations
 *    - Uses React Native Alert API
 *    - System-style dialogs
 * 
 * 3. In-App Timers: For reminders while app is open
 *    - Uses JavaScript setInterval/setTimeout
 *    - Checks on app resume via AppState
 * 
 * 4. Custom Modals: For rich notification content
 *    - Goal completion celebrations
 *    - Daily summaries
 */

export default function Hydration() {
  const { token } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [goal, setGoal] = useState<number>(2000);
  const [idealGoal, setIdealGoal] = useState<number | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [amountInput, setAmountInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [historyRange] = useState<'daily'|'weekly'|'monthly'>('daily');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [missedCount, setMissedCount] = useState<number>(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [showIdealGoalAlert, setShowIdealGoalAlert] = useState(false);
  const [showInitialGoalModal, setShowInitialGoalModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [dynamicPresets, setDynamicPresets] = useState<number[]>([150, 200, 500, 750, 1000, 1500]);
  const [showGoalReachedModal, setShowGoalReachedModal] = useState(false);
  const [goalReachedToday, setGoalReachedToday] = useState(false); // Track if goal was already reached today
  const [behindAlert, setBehindAlert] = useState<string | null>(null);
  const [showBehindAlert, setShowBehindAlert] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState('');
  const [initialGoalStep, setInitialGoalStep] = useState<'choice' | 'custom'>('choice');

  const anim = useRef(new Animated.Value(0)).current;
  const { scaleAnim, opacityAnim, trigger: triggerCelebration } = useCelebrationAnimation();
  const { pulse: pulseButton } = usePulseAnimation();
  const bounceAnimation = useBounceAnimation();

  const fmt = (n:number) => {
    try { return n.toLocaleString(); } catch { return String(n); }
  };

  // Hydration reminder timer ID
  const [reminderTimerId, setReminderTimerId] = useState<string | null>(null);

  // Setup hydration reminder when component mounts
  useEffect(() => {
    // Schedule reminder to show every 2 hours while app is open
    const timerId = notificationManager.scheduleHydrationReminder(120, () => {
      const current = totalToday();
      const suggestedAmount = Math.round(goal / 8);
      notificationManager.showHydrationReminder(suggestedAmount, current, goal);
    });
    
    setReminderTimerId(timerId);

    // Cleanup on unmount
    return () => {
      if (timerId) {
        notificationManager.cancelReminder(timerId);
      }
    };
  }, [goal]);

  // FIX #3: Listen for notification taps to show confirmation modal
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      const data = response.notification.request.content.data;
      
      // If it's a hydration notification and water was logged, show the goal reached modal
      if (data?.type === 'hydration' && totalToday() >= goal) {
        setShowGoalReachedModal(true);
      }
    });

    return () => subscription.remove();
  }, [goal]);

  // FIX #1: Reset goalReachedToday at midnight each day
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const msUntilMidnight = midnight.getTime() - now.getTime();
      
      const timer = setTimeout(() => {
        console.log('Midnight reset: clearing goalReachedToday flag');
        setGoalReachedToday(false);
        // Recursively check again for next midnight
        checkMidnight();
      }, msUntilMidnight);
      
      return timer;
    };
    
    const timer = checkMidnight();
    return () => clearTimeout(timer);
  }, []);

  // Show initial goal modal on first load if no goal is set
  useEffect(() => {
    async function checkInitialGoal() {
      try {
        const local = await AsyncStorage.getItem('hydration');
        // If no local data exists, show initial goal modal
        if (!local && !loading) {
          setShowInitialGoalModal(true);
        }
      } catch (err:any) {
        console.log('Initial goal check error', err);
      }
    }
    if (!loading) {
      checkInitialGoal();
    }
  }, [loading]);


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
    if (percentage >= 130) return { level: 'over-hydrated', color: '#DC2626', icon: 'alert-circle' };
    if (percentage >= 110) return { level: 'high', color: '#F97316', icon: 'alert' };
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
            setUserProfile(res.user_profile); // Store user profile for calculations
            
            // Calculate dynamic goal based on user profile
            const calculatedGoal = calculateDailyWaterGoal({
              weight: res.user_profile?.weight,
              height: res.user_profile?.height,
              gender: res.user_profile?.gender,
              climate: res.user_profile?.climate,
              exercise_frequency: res.user_profile?.exercise_frequency,
              age: res.user_profile?.age,
            });
            
            // Use calculated goal if it differs significantly from stored goal
            const finalGoal = res.goal ?? calculatedGoal ?? 2000;
            setGoal(finalGoal);
            setIdealGoal(calculatedGoal);
            
            // Generate dynamic presets based on calculated goal
            const presets = getDynamicQuickAddPresets(finalGoal);
            setDynamicPresets(presets);
            
            setEntries(res.entries ?? []);
            setMissedCount((res.missed || []).length || 0);
            await AsyncStorage.setItem('hydration', JSON.stringify({ ...res, goal: finalGoal }));
            
            // FIX #1: Check if goal was already reached today (prevent modal flashing on re-render)
            const todayTotal = (res.entries ?? []).filter((e: any) => {
              const entryDate = new Date(e.timestamp).toDateString();
              const today = new Date().toDateString();
              return entryDate === today;
            }).reduce((sum: number, e: any) => sum + e.amount_ml, 0);
            
            if (todayTotal >= finalGoal) {
              setGoalReachedToday(true);
            }
            
            // Show ideal goal popup if it's different from current goal
            if (calculatedGoal && calculatedGoal !== finalGoal && finalGoal === 2000) {
              setTimeout(() => {
                setShowIdealGoalAlert(true);
              }, 500);
            }
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
    const oldTotal = totalToday();
    const newTotal = oldTotal + amountMl;
    
    setEntries(newEntries);
    await persistLocal({ goal, entries: newEntries });
    
    // Trigger pulse animation
    pulseButton();
    
    // FIX #1 & #2: Check if goal reached (only show modal once per day)
    const justReachedGoal = newTotal >= goal && oldTotal < goal;
    if (justReachedGoal && !goalReachedToday) {
      triggerCelebration();
      setShowGoalReachedModal(true);
      setGoalReachedToday(true); // Mark as reached today
      
      // Show goal completion notification
      notificationManager.showGoalCompletionAlert('hydration', goal);
    }
    
    // FIX #2: Over-hydration warnings - ONLY show if success modal is NOT visible
    // This prevents the black layer (double backdrop) issue
    const currentPercentage = (newTotal / goal) * 100;
    if (!showGoalReachedModal && goalReachedToday) {
      // User already acknowledged goal completion, now check for over-hydration
      if (currentPercentage > 130) {
        notificationManager.showOverhydrationWarning(currentPercentage, newTotal);
      } else if (currentPercentage > 110) {
        notificationManager.showOverhydrationWarning(currentPercentage, newTotal);
      }
    }
    
    // Check if behind on hydration pace (only if not yet reached goal)
    if (newTotal < goal) {
      const paceCheck = calculateHydrationPace(newTotal, goal, 'morning');
      if (!paceCheck.isOnPace && newTotal > 0 && newTotal < goal * 0.5) {
        const behindMessage = `Stay hydrated! Drink ${paceCheck.remaining}ml more today to reach your goal.`;
        setBehindAlert(behindMessage);
        setShowBehindAlert(true);
        
        // Show behind pace notification
        notificationManager.showBehindPaceAlert(paceCheck.remaining);
      }
    }
    
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
    const message = idealGoal && idealGoal !== goal 
      ? `Set your daily water intake goal in milliliters\n\nBased on your profile, your ideal hydration goal is ${idealGoal} ml.\n\nCurrent goal: ${goal} ml`
      : 'Set your daily water intake goal in milliliters\n\nRecommended: 2000-3000ml for adults';
    
    const buttons: any[] = [
      { text: 'Cancel', style: 'cancel' as const },
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
    ];
    
    if (idealGoal && idealGoal !== goal) {
      buttons.splice(1, 0, {
        text: `Use Ideal (${idealGoal}ml)`, 
        onPress: () => updateGoal(idealGoal)
      });
    }
    
    Alert.prompt(
      'Daily Hydration Goal', 
      message,
      buttons, 
      'plain-text', 
      String(goal)
    );
  }

  async function updateGoal(newGoal: number) {
    setGoal(newGoal);
    await persistLocal({ goal: newGoal, entries });
    
    // Update dynamic presets based on new goal
    const presets = getDynamicQuickAddPresets(newGoal);
    setDynamicPresets(presets);
    
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

  async function deleteEntry(index: number) {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this hydration entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const newEntries = [...entries];
            const deletedEntry = newEntries[index];
            
            if (!deletedEntry) {
              console.log('Entry not found at index:', index);
              return;
            }
            
            newEntries.splice(index, 1);
            
            setEntries(newEntries);
            await persistLocal({ goal, entries: newEntries });
            
            // Sync with server
            if (token && deletedEntry) {
              try {
                await api.post('/hydration/delete', { 
                  timestamp: deletedEntry.timestamp 
                }, token as string);
              } catch (err:any) {
                console.log('Delete sync error', err);
              }
            }
            
            // Reload calendar data to reflect deletion
            if (token) {
              try {
                const h = await api.get(`/hydration/history?range=${historyRange}`, token as string);
                setHistoryData(h || []);
              } catch (e) { console.log('history reload err', e); }
            }
          }
        }
      ]
    );
  }

  function totalToday() {
    const today = new Date().toISOString().slice(0,10);
    return entries.reduce((sum, e) => sum + ((e.timestamp||'').slice(0,10) === today ? (e.amount_ml||0) : 0), 0);
  }

  function recentList() {
    return [...entries].reverse().slice(0,8);
  }

  function percent() {
    return (totalToday() / (goal || 1)) * 100; // Allow exceeding 100% for over-hydration tracking
  }

  // Handle setting recommended goal from initial modal
  async function handleSetRecommendedGoal() {
    if (idealGoal) {
      await updateGoal(idealGoal);
      setShowInitialGoalModal(false);
      setInitialGoalStep('choice');
    }
  }

  // Handle setting custom goal from initial modal
  async function handleSetCustomGoal() {
    const val = parseInt(customGoalInput || '0', 10);
    if (!val || val <= 0) {
      Alert.alert('Invalid Input', 'Please enter a positive amount');
      return;
    }
    if (val < 1000 || val > 5000) {
      Alert.alert('Invalid Range', 'Goal must be between 1000-5000ml');
      return;
    }
    await updateGoal(val);
    setShowInitialGoalModal(false);
    setInitialGoalStep('choice');
    setCustomGoalInput('');
  }

  function getMotivationalMessage() {
    const pct = percent();
    if (pct >= 200) return "🚨 Critical! You've doubled your goal - stop immediately!";
    if (pct >= 150) return "⚠️ Extreme over-hydration! Please slow down!";
    if (pct >= 130) return "⚠️ Slow down! You're well over your goal!";
    if (pct >= 110) return "💧 You're over your goal - stay mindful!";
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
      
      // Show missed log notification
      notificationManager.showMissedLogReminder('hydration');
    } catch (e) { console.log('missed log error', e); }
  }

  if (loading) return <SafeAreaView style={{flex:1,justifyContent:'center'}}><Text>Loading...</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 160, paddingTop: (insets.top || 12) }]}>
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
              <TouchableOpacity onPress={logMissed} style={styles.logMissedButton}>
                <Text style={styles.logMissedTextAlt}>Log Missed</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.cardAlt}>
          <Text style={styles.quickAddTitle}>Quick Add</Text>
          <View style={styles.quickRowAlt}>
            <TouchableOpacity style={[styles.quickCard, {backgroundColor:'#60A5FA'}]} onPress={() => addAmount(dynamicPresets[0],'quick')} activeOpacity={0.85}>
              <Ionicons name="water" size={18} color="white" />
              <Text style={styles.quickCardValue}>{dynamicPresets[0]}</Text>
              <Text style={styles.quickCardUnit}>ml</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickCard, {backgroundColor:'#3B82F6'}]} onPress={() => addAmount(dynamicPresets[1],'quick')} activeOpacity={0.85}>
              <Ionicons name="water" size={18} color="white" />
              <Text style={styles.quickCardValue}>{dynamicPresets[1]}</Text>
              <Text style={styles.quickCardUnit}>ml</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickCard, {backgroundColor:'#1D4ED8'}]} onPress={() => addAmount(dynamicPresets[2],'quick')} activeOpacity={0.85}>
              <Ionicons name="flask" size={18} color="white" />
              <Text style={styles.quickCardValue}>{dynamicPresets[2] >= 1000 ? (dynamicPresets[2] / 1000).toFixed(1) : dynamicPresets[2]}</Text>
              <Text style={styles.quickCardUnit}>{dynamicPresets[2] >= 1000 ? 'L' : 'ml'}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.quickRowAlt}>
            <TouchableOpacity style={[styles.quickCard, {backgroundColor:'#10B981'}]} onPress={() => addAmount(dynamicPresets[3],'quick')} activeOpacity={0.85}>
              <Ionicons name="cafe" size={18} color="white" />
              <Text style={styles.quickCardValue}>{dynamicPresets[3]}</Text>
              <Text style={styles.quickCardUnit}>ml</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickCard, {backgroundColor:'#F59E0B'}]} onPress={() => addAmount(dynamicPresets[4],'quick')} activeOpacity={0.85}>
              <Ionicons name="wine" size={18} color="white" />
              <Text style={styles.quickCardValue}>{dynamicPresets[4]}</Text>
              <Text style={styles.quickCardUnit}>ml</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickCard, {backgroundColor:'#EF4444'}]} onPress={() => addAmount(dynamicPresets[5],'quick')} activeOpacity={0.85}>
              <Ionicons name="beaker" size={18} color="white" />
              <Text style={styles.quickCardValue}>{dynamicPresets[5] >= 1000 ? (dynamicPresets[5] / 1000).toFixed(1) : dynamicPresets[5]}</Text>
              <Text style={styles.quickCardUnit}>{dynamicPresets[5] >= 1000 ? 'L' : 'ml'}</Text>
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
                      <View style={[styles.hydrationIndicator, { backgroundColor: hydrationLevel.color + '20' }]}>
                        <Ionicons 
                          name={hydrationLevel.icon as any} 
                          size={16} 
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
                const selectedDateStr = selectedDate.toISOString().split('T')[0];
                const selectedDayData = calendarData.find(d => d.date === selectedDateStr);
                const amount = selectedDayData?.amount_ml || 0;
                const percentage = (amount / goal) * 100;
                const level = getHydrationLevel(percentage);
                
                // Get actual entries for selected date
                const dateEntries = entries.filter(e => 
                  e.timestamp && e.timestamp.slice(0,10) === selectedDateStr
                );
                
                return (
                  <>
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
                    
                    {/* Show actual logs for selected date */}
                    {dateEntries.length > 0 && (
                      <View style={styles.dateLogsContainer}>
                        <Text style={styles.dateLogsTitle}>Hydration Logs:</Text>
                        {dateEntries.map((entry, idx) => (
                          <View key={idx} style={styles.dateLogRow}>
                            <View style={styles.dateLogInfo}>
                              <Text style={styles.dateLogTime}>
                                {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Text>
                              <Text style={styles.dateLogAmount}>{fmt(entry.amount_ml)} ml</Text>
                            </View>
                            <Text style={styles.dateLogSource}>({entry.source})</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    {dateEntries.length === 0 && amount === 0 && (
                      <Text style={styles.noLogsText}>No hydration logged for this date</Text>
                    )}
                  </>
                );
              })()}
            </View>
          )}

          {/* Recent entries with alternating rows and delete buttons */}
          <View style={{marginTop:12}}>
            <Text style={styles.recentEntriesTitle}>Recent Entries</Text>
            {recentList().map((e:any, idx:number) => {
              // Find the actual index in the original entries array by matching timestamp
              const actualIndex = entries.findIndex(entry => 
                entry.timestamp === e.timestamp && entry.amount_ml === e.amount_ml
              );
              
              return (
                <View key={idx} style={[styles.historyRowAlt, idx % 2 === 0 ? styles.rowAltEven : styles.rowAltOdd]}>
                  <View style={styles.historyRowContent}>
                    <View style={styles.historyRowLeft}>
                      <Text style={styles.historyText}>💧 {new Date(e.timestamp).toLocaleTimeString()} • {e.source}</Text>
                      <Text style={styles.historyAmt}>{fmt(e.amount_ml || 0)} ml</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => {
                        if (actualIndex !== -1) {
                          deleteEntry(actualIndex);
                        } else {
                          console.log('Entry not found in array');
                        }
                      }}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

      </ScrollView>

      <BottomNavigation currentRoute="hydration" />

      {/* Ideal Goal Alert Modal */}
      <Modal
        visible={showIdealGoalAlert && idealGoal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setShowIdealGoalAlert(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Recommended Hydration Goal</Text>
            <Text style={styles.modalMessage}>
              Based on your profile (weight, age, climate, exercise), your ideal daily hydration goal is:
            </Text>
            <Text style={styles.modalGoalValue}>{idealGoal} ml</Text>
            <Text style={styles.modalSubtext}>
              This is calculated based on your personal information to help you stay optimally hydrated.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonSecondary}
                onPress={() => {
                  setShowIdealGoalAlert(false);
                }}
              >
                <Text style={styles.modalButtonSecondaryText}>Keep Current ({goal} ml)</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButtonPrimary}
                onPress={async () => {
                  setShowIdealGoalAlert(false);
                  await updateGoal(idealGoal!);
                }}
              >
                <Text style={styles.modalButtonPrimaryText}>Use Recommended</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Goal Reached Celebration Modal */}
      <Modal
        visible={showGoalReachedModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoalReachedModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.celebrationContainer, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
            <View style={styles.modalContent}>
              <Ionicons name="checkmark-circle" size={60} color="#10B981" style={{ marginBottom: 16 }} />
              <Text style={styles.celebrationTitle}>🎉 Goal Achieved!</Text>
              <Text style={styles.celebrationMessage}>
                Amazing! You've reached your daily hydration goal of {goal}ml. Keep up the great work!
              </Text>
              <View style={styles.celebrationStats}>
                <View style={styles.statBox}>
                  <Text style={styles.celebrationStatValue}>{fmt(totalToday())}</Text>
                  <Text style={styles.celebrationStatLabel}>Total Intake</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.celebrationStatValue}>100%</Text>
                  <Text style={styles.celebrationStatLabel}>Goal Completed</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.celebrationButton}
                onPress={() => setShowGoalReachedModal(false)}
              >
                <Text style={styles.celebrationButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Behind on Pace Alert Modal */}
      <Modal
        visible={showBehindAlert}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBehindAlert(false)}
      >
        <View style={styles.alertOverlay}>
          <Animated.View style={[styles.alertContent, bounceAnimation]}>
            <View style={styles.alertIcon}>
              <Ionicons name="warning" size={32} color="#EF4444" />
            </View>
            <Text style={styles.alertTitle}>Stay on Track!</Text>
            <Text style={styles.alertMessage}>{behindAlert}</Text>
            <TouchableOpacity 
              style={styles.alertButton}
              onPress={() => setShowBehindAlert(false)}
            >
              <Text style={styles.alertButtonText}>Got It</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Initial Hydration Goal Modal - Appears on First Load */}
      <Modal
        visible={showInitialGoalModal}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {initialGoalStep === 'choice' ? (
              <>
                <View style={styles.initialModalIcon}>
                  <Ionicons name="water" size={48} color="#3B82F6" />
                </View>
                <Text style={styles.modalTitle}>Set Your Hydration Goal</Text>
                <Text style={styles.modalMessage}>
                  Let's get started by setting your daily water intake goal.
                </Text>
                
                {idealGoal && (
                  <View style={styles.recommendedGoalBox}>
                    <Text style={styles.recommendedLabel}>📊 Recommended for You:</Text>
                    <Text style={styles.recommendedValue}>{idealGoal} ml</Text>
                    <Text style={styles.recommendedExplain}>
                      Calculated based on your body profile and climate
                    </Text>
                  </View>
                )}
                
                <View style={styles.modalButtons}>
                  {idealGoal ? (
                    <>
                      <TouchableOpacity 
                        style={styles.modalButtonPrimary}
                        onPress={handleSetRecommendedGoal}
                      >
                        <Text style={styles.modalButtonPrimaryText}>✓ Use Recommended</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.modalButtonSecondary}
                        onPress={() => setInitialGoalStep('custom')}
                      >
                        <Text style={styles.modalButtonSecondaryText}>Custom Amount</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity 
                      style={styles.modalButtonPrimary}
                      onPress={() => setInitialGoalStep('custom')}
                    >
                      <Text style={styles.modalButtonPrimaryText}>Set Custom Goal</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            ) : (
              <>
                <View style={styles.initialModalIcon}>
                  <Ionicons name="create" size={48} color="#F59E0B" />
                </View>
                <Text style={styles.modalTitle}>Custom Hydration Goal</Text>
                <Text style={styles.modalMessage}>
                  Enter your daily water intake goal in milliliters (1000-5000ml)
                </Text>
                
                <TextInput
                  placeholder="Enter amount in ml"
                  keyboardType="numeric"
                  value={customGoalInput}
                  onChangeText={setCustomGoalInput}
                  style={styles.customGoalInput}
                  placeholderTextColor="#9CA3AF"
                />
                
                <Text style={styles.inputHint}>
                  💡 Recommended: 2000-3000ml for most adults
                </Text>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.modalButtonSecondary}
                    onPress={() => {
                      setInitialGoalStep('choice');
                      setCustomGoalInput('');
                    }}
                  >
                    <Text style={styles.modalButtonSecondaryText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.modalButtonPrimary}
                    onPress={handleSetCustomGoal}
                  >
                    <Text style={styles.modalButtonPrimaryText}>Set Goal</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  logMissedButton: { marginTop: 8, backgroundColor: '#F59E0B', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  logMissedTextAlt: { color: '#FFFFFF', fontWeight: '900', fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 },

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
  calendarDay: { width:'14.28%', aspectRatio:1, justifyContent:'flex-start', alignItems:'center', borderRadius:8, marginBottom:4, position:'relative', paddingTop: 4 },
  calendarDayOtherMonth: { opacity:0.3 },
  calendarDayToday: { backgroundColor:'#EBF8FF', borderWidth:2, borderColor:'#3B82F6' },
  calendarDaySelected: { backgroundColor:'#1D4ED8' },
  calendarDayText: { fontSize:14, fontWeight:'500', color:'#374151', marginBottom: 2 },
  calendarDayTextOtherMonth: { color:'#9CA3AF' },
  calendarDayTextToday: { color:'#1D4ED8', fontWeight:'700' },
  calendarDayTextSelected: { color:'white', fontWeight:'700' },
  hydrationIndicator: { position:'absolute', bottom:2, alignSelf:'center', padding: 1, borderRadius: 6, borderWidth: 1.5, backgroundColor: 'transparent' },
  dayAmount: { fontSize:8, color:'#6B7280', fontWeight:'500', position:'absolute', bottom:14, alignSelf:'center' },
  selectedDayDetails: { backgroundColor:'#F8FAFC', borderRadius:12, padding:16, marginTop:8 },
  selectedDayTitle: { fontSize:16, fontWeight:'600', color:'#1F2937', marginBottom:12 },
  dayStats: { flexDirection:'row', justifyContent:'space-around', marginBottom: 16 },
  statItem: { alignItems:'center' },
  statValue: { fontSize:18, fontWeight:'700', color:'#1F2937', marginBottom:4 },
  statLabel: { fontSize:12, color:'#6B7280', fontWeight:'500' },
  
  // Date-specific logs styles
  dateLogsContainer: { marginTop: 12, backgroundColor: '#F9FAFB', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  dateLogsTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  dateLogRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginBottom: 4 },
  dateLogInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 8 },
  dateLogTime: { fontSize: 12, color: '#6B7280', fontWeight: '600', minWidth: 55 },
  dateLogAmount: { fontSize: 14, color: '#0F172A', fontWeight: '700' },
  dateLogSource: { fontSize: 10, color: '#9CA3AF', fontStyle: 'italic', paddingLeft: 4 },
  noLogsText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginTop: 8, fontStyle: 'italic' },
  
  // Recent entries with delete functionality
  recentEntriesTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  historyRowContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  historyRowLeft: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 8 },
  deleteButton: { padding: 8, borderRadius: 8, backgroundColor: '#FEE2E2' },

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
  // Modal styles
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 24, marginHorizontal: 20, maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#1F2937', marginBottom: 12, textAlign: 'center' },
  modalMessage: { fontSize: 15, color: '#6B7280', marginBottom: 16, textAlign: 'center', lineHeight: 22 },
  modalGoalValue: { fontSize: 32, fontWeight: '900', color: '#1E3A8A', textAlign: 'center', marginBottom: 12 },
  modalSubtext: { fontSize: 13, color: '#9CA3AF', marginBottom: 24, textAlign: 'center', lineHeight: 18 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalButtonSecondary: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  modalButtonSecondaryText: { color: '#6B7280', fontWeight: '600', textAlign: 'center', fontSize: 14 },
  modalButtonPrimary: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#1E3A8A', shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  modalButtonPrimaryText: { color: '#FFFFFF', fontWeight: '700', textAlign: 'center', fontSize: 14 },
  // Celebration styles
  celebrationContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  celebrationTitle: { fontSize: 28, fontWeight: '900', color: '#10B981', marginBottom: 12, textAlign: 'center' },
  celebrationMessage: { fontSize: 16, color: '#6B7280', marginBottom: 20, textAlign: 'center', lineHeight: 24 },
  celebrationStats: { flexDirection: 'row', marginBottom: 24, gap: 16 },
  statBox: { flex: 1, backgroundColor: '#F0FDF4', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center' },
  celebrationStatValue: { fontSize: 20, fontWeight: '900', color: '#10B981', marginBottom: 4 },
  celebrationStatLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  celebrationButton: { paddingVertical: 14, paddingHorizontal: 32, backgroundColor: '#10B981', borderRadius: 10, marginTop: 12 },
  celebrationButtonText: { color: 'white', fontWeight: '700', fontSize: 16, textAlign: 'center' },
  // Alert styles
  alertOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.3)', justifyContent: 'flex-end', zIndex: 999 },
  alertContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 32 },
  alertIcon: { alignItems: 'center', marginBottom: 16 },
  alertTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 8, textAlign: 'center' },
  alertMessage: { fontSize: 15, color: '#6B7280', marginBottom: 20, textAlign: 'center', lineHeight: 22 },
  alertButton: { paddingVertical: 12, paddingHorizontal: 20, backgroundColor: '#1E3A8A', borderRadius: 10 },
  alertButtonText: { color: 'white', fontWeight: '700', fontSize: 16, textAlign: 'center' },
  
  // Initial Goal Modal Styles
  initialModalIcon: { alignItems: 'center', marginBottom: 16 },
  recommendedGoalBox: { backgroundColor: '#EBF8FF', borderRadius: 12, padding: 16, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#3B82F6' },
  recommendedLabel: { fontSize: 12, color: '#1E40AF', fontWeight: '600', marginBottom: 4 },
  recommendedValue: { fontSize: 28, fontWeight: '900', color: '#1E3A8A', marginBottom: 4 },
  recommendedExplain: { fontSize: 12, color: '#3B82F6', lineHeight: 16 },
  customGoalInput: { borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#0F172A', marginBottom: 8 },
  inputHint: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginBottom: 16, fontStyle: 'italic' },
});

