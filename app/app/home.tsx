import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView, TextInput, SafeAreaView, Dimensions, Modal, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from './api';
import BottomNavigation from './components/navigation/BottomNavigation';
import PremiumLockModal from './components/PremiumLockModal';

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

interface QuickStatus {
  medicationsLeft: number;
  hydrationPercentage: number;
  medicationsTaken: number;
  medicationsTotal: number;
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const { token } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickStatus, setQuickStatus] = useState<QuickStatus>({ 
    medicationsLeft: 0, 
    hydrationPercentage: 0,
    medicationsTaken: 0,
    medicationsTotal: 0
  });
  const [menuVisible, setMenuVisible] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [premiumPopupVisible, setPremiumPopupVisible] = useState(false);
  const [premiumLockVisible, setPremiumLockVisible] = useState(false);
  const [premiumCongratsVisible, setPremiumCongratsVisible] = useState(false);
  const [plusCongratsVisible, setPlusCongratsVisible] = useState(false);
  const [weeklyReportExpanded, setWeeklyReportExpanded] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [snoozeSuggestions, setSnoozeSuggestions] = useState<any[]>([]);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [medicineSuggestions, setMedicineSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showGoalCompletionModal, setShowGoalCompletionModal] = useState(false);
  const [showOverHydrationModal, setShowOverHydrationModal] = useState(false);
  const [previousHydrationPercentage, setPreviousHydrationPercentage] = useState(0);
  const premiumCongratsShownRef = useRef(false);
  const plusCongratsShownRef = useRef(false);

  // Plan / tier helpers
  const planSlug = subscription?.plan_slug?.toLowerCase?.();
  const isPlus = planSlug?.includes('plus');
  const isPremium = planSlug === 'premium';
  const isFree = !isPlus && !isPremium;

  const getTierTheme = (slug?: string) => {
    const normalized = slug?.toLowerCase?.() || '';
    if (normalized === 'premium') {
      return { color: '#F59E0B', icon: 'trophy' as const, label: 'Premium' };
    }
    if (normalized.includes('plus')) {
      return { color: '#60A5FA', icon: 'star' as const, label: 'PLUS+' };
    }
    return { color: '#9CA3AF', icon: 'ellipse-outline' as const, label: 'Free' };
  };

  const tierTheme = getTierTheme(subscription?.plan_slug);
  const insightsScore = weeklyReport?.overall_score ?? 0;

  // Enable layout animation on Android for smooth collapses
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Debounce medicine search
  useEffect(() => {
    const searchMedicines = async () => {
      if (medicineSearch.trim().length < 2) {
        setMedicineSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const response = await api.get(`/medicines/search?query=${encodeURIComponent(medicineSearch)}`);
        setMedicineSuggestions(response.medicines || []);
        setShowSuggestions(true);
      } catch (err) {
        console.log('Medicine search error:', err);
        setMedicineSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(searchMedicines, 300);
    return () => clearTimeout(debounceTimer);
  }, [medicineSearch]);

  // Detect hydration goal completion and over-hydration
  useEffect(() => {
    const currentPercentage = quickStatus.hydrationPercentage;
    
    // Show goal completion modal when crossing 100% threshold
    if (currentPercentage >= 100 && previousHydrationPercentage < 100) {
      setShowGoalCompletionModal(true);
    }
    
    // Show over-hydration modal when exceeding 110% (after goal was already completed)
    if (currentPercentage > 110 && previousHydrationPercentage >= 100 && previousHydrationPercentage <= 110) {
      setShowOverHydrationModal(true);
    }
    
    // Update previous percentage
    if (currentPercentage !== previousHydrationPercentage) {
      setPreviousHydrationPercentage(currentPercentage);
    }
  }, [quickStatus.hydrationPercentage, previousHydrationPercentage]);

  useEffect(() => {
    // Safety timeout - always set loading to false after 5 seconds max (very aggressive)
    const safetyTimeout = setTimeout(() => {
      console.log('Safety timeout: forcing loading to false after 5 seconds');
      setLoading(false);
      // Set default user if still loading
      setUser((prevUser: any) => prevUser || { name: 'User', email: '', nickname: 'User' });
    }, 5000);

    async function load() {
      try {
        console.log('Home: token=', token);
        if (!token) {
          clearTimeout(safetyTimeout);
          setLoading(false);
          router.replace({ pathname: '/login' } as any);
          return;
        }
        
        // Try to load user data with shorter timeout
        try {
          const me = await Promise.race([
            api.get('/me', token as string, 3000), // 3 second timeout - very short
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
          ]) as any;
          console.log('Home: /me response:', me);
          setUser(me);
          // Set loading to false immediately after getting user data
          clearTimeout(safetyTimeout);
          setLoading(false);
        } catch (meErr: any) {
          console.log('Home: /me error:', meErr);
          // Set a default user to allow UI to render immediately
          setUser({ name: 'User', email: '', nickname: 'User' });
          clearTimeout(safetyTimeout);
          setLoading(false);
          // If it's an auth error, redirect to login
          if (meErr?.status === 401) {
            router.replace({ pathname: '/login' } as any);
            return;
          }
          // For other errors, continue to show UI with default data
        }
        
        const refreshSubscription = async () => {
          try {
            const subscriptionData: any = await Promise.race([
              api.get('/subscription/current', token as string, 3000),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ]);
            setSubscription(subscriptionData);
          } catch (subErr) {
            console.log('Error loading subscription (non-critical):', subErr);
            // Keep previous subscription value to avoid locking premium by mistake
            setSubscription((prev: any) => prev || { plan_slug: 'free', is_active: false });
          }
        };

        // Load other data in background (non-blocking, won't affect loading state)
        // These run after loading is already set to false
        setTimeout(() => {
          // Load quick status data (non-blocking with timeouts)
          Promise.allSettled([
            api.get('/hydration', token as string, 3000).catch(() => null),
            api.get('/medications/upcoming', token as string, 3000).catch(() => null),
            api.get('/medications/stats', token as string, 3000).catch(() => null),
          ]).then((results) => {
            const hydrationData = results[0].status === 'fulfilled' ? results[0].value : null;
            const upcoming = results[1].status === 'fulfilled' ? results[1].value : null;
            const stats = results[2].status === 'fulfilled' ? results[2].value : null;
            
            const hydrationPercentage = hydrationData ? Math.round(hydrationData?.percentage || 0) : 0;
            const medicationsLeft = Array.isArray(upcoming) ? upcoming.length : 0;
            const medicationsTaken = stats?.completed_today || 0;
            const medicationsTotal = stats?.total_reminders_today || 0;
            
            setQuickStatus({
              medicationsLeft,
              hydrationPercentage,
              medicationsTaken,
              medicationsTotal
            });
          }).catch(() => {
            // Set defaults if all fail
            setQuickStatus({ 
              medicationsLeft: 0, 
              hydrationPercentage: 0,
              medicationsTaken: 0,
              medicationsTotal: 0
            });
          });
          
          // Load timeline separately to avoid blocking on errors
          api.get('/notifications/today-timeline', token as string, 3000)
            .then((timelineData) => {
              if (Array.isArray(timelineData)) {
                setTimeline(timelineData);
              } else {
                setTimeline([]);
              }
            })
            .catch(() => {
              setTimeline([]);
            });

          // Load subscription status (non-blocking, with timeout)
          refreshSubscription();
        }, 100); // Small delay to ensure loading is set to false first
      } catch (err: any) {
        console.log('Home load error:', err);
        // Set default user immediately to allow UI to render
        setUser({ name: 'User', email: '', nickname: 'User' });
        clearTimeout(safetyTimeout);
        setLoading(false);
        // Don't show alerts for network/timeout errors
        if (err?.status !== 408 && err?.status !== 0 && err?.status !== undefined) {
          const message = err?.data?.message || err?.data || err?.message || 'Failed to load data';
          console.log('Error message:', message);
        }
      }
    }
    load();
    
    return () => {
      clearTimeout(safetyTimeout);
    };
  }, [token, router]);

  // Load Smart Insights when subscription is available (non-blocking)
  useEffect(() => {
    if ((isPremium || isPlus) && token) {
      const loadInsights = async () => {
        try {
          // Use Promise.allSettled to prevent one failing from blocking others
          const results = await Promise.allSettled([
            api.get('/insights/weekly-report', token as string),
            api.get('/insights/patterns', token as string),
            api.get('/insights/snooze-analysis', token as string),
          ]);
          
          if (results[0].status === 'fulfilled' && results[0].value) {
            setWeeklyReport(results[0].value);
          }
          if (results[1].status === 'fulfilled' && results[1].value?.patterns) {
            setPatterns(results[1].value.patterns);
          }
          if (results[2].status === 'fulfilled' && results[2].value?.suggestions) {
            setSnoozeSuggestions(results[2].value.suggestions);
          }
        } catch (insightsErr) {
          console.log('Error loading insights (non-critical):', insightsErr);
        }
      };
      loadInsights();
    } else {
      // Clear insights if not premium
      setWeeklyReport(null);
      setPatterns([]);
      setSnoozeSuggestions([]);
    }
  }, [isPremium, isPlus, token]);

  // One-time premium congratulations popup when user becomes premium (persistent with AsyncStorage)
  useEffect(() => {
    const checkAndShowPremiumPopup = async () => {
      if (isPremium && !premiumCongratsShownRef.current) {
        try {
          const hasSeenPopup = await AsyncStorage.getItem('hasSeenPremiumPopup');
          if (!hasSeenPopup) {
            premiumCongratsShownRef.current = true;
            setPremiumCongratsVisible(true);
            // Mark as seen
            await AsyncStorage.setItem('hasSeenPremiumPopup', 'true');
          }
        } catch (err) {
          console.log('Error checking premium popup flag:', err);
        }
      }
    };
    checkAndShowPremiumPopup();
  }, [isPremium]);

  // One-time PLUS+ congratulations popup when user becomes PLUS (persistent with AsyncStorage)
  useEffect(() => {
    const checkAndShowPlusPopup = async () => {
      if (isPlus && !plusCongratsShownRef.current) {
        try {
          const hasSeenPlus = await AsyncStorage.getItem('hasSeenPlusCongrats');
          if (!hasSeenPlus) {
            plusCongratsShownRef.current = true;
            setPlusCongratsVisible(true);
            await AsyncStorage.setItem('hasSeenPlusCongrats', 'true');
          }
        } catch (err) {
          console.log('Error checking plus popup flag:', err);
        }
      }
    };
    checkAndShowPlusPopup();
  }, [isPlus]);

  // Real-time hydration data refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!token || loading) return;

      const refreshHydrationData = async () => {
        try {
          const [hydrationRes, statsRes, subscriptionRes] = await Promise.all([
            api.get('/hydration', token as string, 3000).catch(() => null),
            api.get('/medications/stats', token as string, 3000).catch(() => null),
            api.get('/subscription/current', token as string, 3000).catch(() => null),
          ]);
          
          if (hydrationRes) {
            const hydrationPercentage = Math.round(hydrationRes.percentage || 0);
            
            setQuickStatus(prev => ({
              ...prev,
              hydrationPercentage
            }));
          }
          
          if (statsRes) {
            const medicationsTaken = statsRes.completed_today || 0;
            const medicationsTotal = statsRes.total_reminders_today || 0;
            
            setQuickStatus(prev => ({
              ...prev,
              medicationsTaken,
              medicationsTotal
            }));
          }

          if (subscriptionRes) {
            setSubscription(subscriptionRes);
          }
        } catch (err) {
          console.log('Data refresh error', err);
        }
      };
      
      refreshHydrationData();
    }, [token, loading])
  );

  // Real-time hydration polling - refresh every 10 seconds
  useEffect(() => {
    if (!token || loading) return;

    const fetchHydrationStatus = async () => {
      try {
        const results = await Promise.allSettled([
          api.get('/hydration', token as string, 3000).catch(() => null),
          api.get('/medications/upcoming', token as string, 3000).catch(() => null),
          api.get('/medications/stats', token as string, 3000).catch(() => null),
        ]);
        
        const hydrationData = results[0].status === 'fulfilled' ? results[0].value : null;
        const upcoming = results[1].status === 'fulfilled' ? results[1].value : null;
        const stats = results[2].status === 'fulfilled' ? results[2].value : null;
        
        const hydrationPercentage = hydrationData ? Math.round(hydrationData?.percentage || 0) : 0;
        const medicationsLeft = Array.isArray(upcoming) ? upcoming.length : 0;
        const medicationsTaken = stats?.completed_today || 0;
        const medicationsTotal = stats?.total_reminders_today || 0;
        
        setQuickStatus({
          medicationsLeft,
          hydrationPercentage,
          medicationsTaken,
          medicationsTotal
        });
        
        console.log('Real-time update: Hydration', hydrationPercentage + '%', 'Medications:', medicationsTaken + '/' + medicationsTotal);
      } catch (error) {
        console.log('Error refreshing quick status:', error);
      }
    };

    // Poll every 10 seconds for real-time updates
    const pollInterval = setInterval(fetchHydrationStatus, 10000);

    return () => clearInterval(pollInterval);
  }, [token, loading]);


  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={{ marginTop: 16, color: '#6B7280', fontSize: 14 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  // Use nickname if available, otherwise fall back to first name
  const displayName = user?.nickname || user?.name?.split(' ')[0] || 'User';

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

  const getTypeIcon = (type: string) => {
    if (type === 'medication') return 'medical';
    if (type === 'hydration') return 'water';
    return 'notifications';
  };

  const handleInsightsPress = () => {
    if (isPremium) {
      router.push({ pathname: '/insights', params: { token } } as any);
    } else {
      setPremiumPopupVisible(true);
    }
  };

  const menuItems = [
    { label: 'Profile', icon: 'person-outline', route: '/components/pages/profile/Profile' },
    { label: 'Settings', icon: 'settings-outline', route: '/components/pages/settings/Settings' },
    { label: 'Help & Support', icon: 'help-circle-outline', route: '/components/pages/profile/HelpSupport' },
  ];

  const handleMenuAction = (item: typeof menuItems[0]) => {
    setMenuVisible(false);
    if (item.route) {
      router.push({ pathname: item.route, params: { token } } as any);
    } else {
      Alert.alert('Coming Soon', `${item.label} will be available soon.`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
        {/* Group pre-timeline content for stable sticky index */}
        <View style={[styles.preContent, { paddingTop: insets.top || 12 }]}>
          {/* Header */}
          <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={24} color="#1F2937" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.profileAvatar}
            onPress={() => router.push({ pathname: '/components/pages/profile/Profile', params: { token } } as any)}
          >
            <Text style={styles.avatarText}>
              {(user?.name || 'U').split(' ').map((s:any)=>s[0]).slice(0,2).join('').toUpperCase()}
            </Text>
          </TouchableOpacity>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
          <View style={styles.welcomeRow}>
            <Text style={styles.welcomeText}>Hi, {displayName}</Text>
            {isPremium && (
              <View style={[styles.tierBadge, { backgroundColor: '#FEF3C7', borderColor: tierTheme.color }]}>
                <Ionicons name={tierTheme.icon} size={16} color={tierTheme.color} style={{ marginRight: 6 }} />
                <Text style={[styles.tierBadgeText, { color: '#92400E' }]}>{tierTheme.label}</Text>
              </View>
            )}
            {isPlus && !isPremium && (
              <View style={[styles.tierBadge, { backgroundColor: '#EFF6FF', borderColor: tierTheme.color }]}>
                <Ionicons name={tierTheme.icon} size={16} color={tierTheme.color} style={{ marginRight: 6 }} />
                <Text style={[styles.tierBadgeText, { color: '#1E3A8A' }]}>{tierTheme.label}</Text>
              </View>
            )}
          </View>
          
          <View>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
              <TextInput
                placeholder="Search medicine"
                style={styles.searchInput}
                placeholderTextColor="#9CA3AF"
                value={medicineSearch}
                onChangeText={setMedicineSearch}
                onFocus={() => medicineSearch.length >= 2 && setShowSuggestions(true)}
              />
              {medicineSearch.length > 0 && (
                <TouchableOpacity 
                  style={styles.searchClear}
                  onPress={() => {
                    setMedicineSearch('');
                    setShowSuggestions(false);
                  }}
                >
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
            
            {/* Medicine Suggestions Dropdown */}
            {showSuggestions && medicineSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <ScrollView style={styles.suggestionsList} nestedScrollEnabled>
                  {medicineSuggestions.map((medicine) => (
                    <TouchableOpacity
                      key={medicine.id}
                      style={styles.suggestionItem}
                      onPress={() => {
                        setMedicineSearch('');
                        setShowSuggestions(false);
                        Alert.alert(
                          medicine.name,
                          `${medicine.generic_name ? `Generic: ${medicine.generic_name}\n` : ''}${medicine.brand ? `Brand: ${medicine.brand}\n` : ''}Category: ${medicine.category}\n${medicine.description ? `\n${medicine.description}` : ''}${medicine.dosage ? `\n\nRecommended Dosage: ${medicine.dosage}` : ''}`,
                          [
                            { text: 'Close', style: 'cancel' },
                            {
                              text: 'Add to Medications',
                              onPress: () => {
                                // Determine frequency from dosage text
                                let frequency = 'daily';
                                const dosageLower = (medicine.dosage || '').toLowerCase();
                                if (dosageLower.includes('twice') || dosageLower.includes('2 times') || dosageLower.includes('every 12')) {
                                  frequency = 'twice_daily';
                                } else if (dosageLower.includes('three times') || dosageLower.includes('3 times') || dosageLower.includes('every 8')) {
                                  frequency = 'three_times_daily';
                                } else if (dosageLower.includes('four times') || dosageLower.includes('4 times') || dosageLower.includes('every 6')) {
                                  frequency = 'four_times_daily';
                                }
                                
                                router.push({ 
                                  pathname: '/components/pages/medication/Medication', 
                                  params: { 
                                    token, 
                                    medicineName: medicine.name, 
                                    medicineDosage: medicine.dosage || '',
                                    medicineData: JSON.stringify({
                                      description: medicine.description,
                                      category: medicine.category,
                                      frequency: frequency
                                    })
                                  } 
                                } as any);
                              }
                            }
                          ]
                        );
                      }}
                    >
                      <View style={styles.suggestionIcon}>
                        <Ionicons name="medical" size={20} color="#1E3A8A" />
                      </View>
                      <View style={styles.suggestionContent}>
                        <Text style={styles.suggestionName}>{medicine.name}</Text>
                        <Text style={styles.suggestionDetails}>
                          {medicine.generic_name || medicine.brand || medicine.category}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          </View>

          {/* Upsell Banner */}
          {isPlus && (
            <TouchableOpacity 
              style={styles.plusBadge}
              onPress={() => setPremiumPopupVisible(true)}
            >
              <View style={styles.premiumBadgeContent}>
                <Ionicons name="star" size={20} color="#2563EB" />
                <View style={styles.premiumBadgeText}>
                  <Text style={[styles.premiumBadgeTitle, { color: '#1E3A8A' }]}>Upgrade to Premium</Text>
                  <Text style={[styles.premiumBadgeSubtitle, { color: '#1F2937' }]}>Get Smart Insights & AI Analysis</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#2563EB" />
              </View>
            </TouchableOpacity>
          )}

          {isFree && (
            <TouchableOpacity 
              style={styles.premiumBadge}
              onPress={() => setPremiumPopupVisible(true)}
            >
              <View style={styles.premiumBadgeContent}>
                <Ionicons name="star" size={20} color="#F59E0B" />
                <View style={styles.premiumBadgeText}>
                  <Text style={styles.premiumBadgeTitle}>Unlock Premium</Text>
                  <Text style={styles.premiumBadgeSubtitle}>Get unlimited features • ₱149/month</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </View>
            </TouchableOpacity>
          )}

          {/* Weekly Report Card - Premium Feature */}
          {isPremium && weeklyReport && (
            <View style={styles.weeklyReportCard}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.weeklyReportHeader}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setWeeklyReportExpanded((prev) => !prev);
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="analytics" size={24} color="#1E3A8A" />
                  <Text style={styles.weeklyReportTitle}>Weekly Report Card</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={styles.weeklyReportSummary}>Overall {weeklyReport.overall_score || 0}%</Text>
                  <Ionicons
                    name={weeklyReportExpanded ? 'chevron-up' : 'chevron-down'}
                    size={22}
                    color="#1E3A8A"
                  />
                </View>
              </TouchableOpacity>

              {weeklyReportExpanded && (
                <View style={styles.weeklyReportContent}>
                  <View style={styles.weeklyReportItem}>
                    <Text style={styles.weeklyReportLabel}>Hydration</Text>
                    <Text style={styles.weeklyReportValue}>{weeklyReport.hydration?.percentage || 0}%</Text>
                    <Text style={styles.weeklyReportMessage}>{weeklyReport.hydration?.message || ''}</Text>
                  </View>
                  <View style={styles.weeklyReportDivider} />
                  <View style={styles.weeklyReportItem}>
                    <Text style={styles.weeklyReportLabel}>Medications</Text>
                    <Text style={styles.weeklyReportValue}>{weeklyReport.medications?.adherence_rate || 0}%</Text>
                    <Text style={styles.weeklyReportMessage}>{weeklyReport.medications?.message || ''}</Text>
                  </View>
                  <View style={styles.weeklyReportScore}>
                    <Text style={styles.weeklyReportScoreLabel}>Overall Score</Text>
                    <Text style={styles.weeklyReportScoreValue}>{weeklyReport.overall_score || 0}%</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Snooze Suggestions - Premium Feature */}
          {isPremium && snoozeSuggestions.length > 0 && (
            <View style={styles.snoozeCard}>
            <View style={styles.snoozeHeader}>
              <Ionicons name="time" size={24} color="#10B981" />
              <Text style={styles.snoozeTitle}>Smart Reminder Suggestions</Text>
            </View>
            {snoozeSuggestions.slice(0, 2).map((suggestion, index) => (
              <View key={index} style={styles.snoozeItem}>
                <Text style={styles.snoozeMessage}>{suggestion.message}</Text>
                <TouchableOpacity 
                  style={styles.snoozeActionButton}
                  onPress={() => {
                    Alert.alert(
                      'Update Reminder Time',
                      `Move ${suggestion.medication_name} reminder from ${suggestion.current_time} to ${suggestion.suggested_time}?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Update', 
                          onPress: () => {
                            // TODO: Implement reminder time update
                            Alert.alert('Success', 'Reminder time updated successfully!');
                          }
                        },
                      ]
                    );
                  }}
                >
                  <Text style={styles.snoozeActionText}>Update Time</Text>
                </TouchableOpacity>
              </View>
            ))}
            </View>
          )}

          {/* Summary Cards Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Overview</Text>
          </View>

          {/* Hydration Summary Card */}
          <TouchableOpacity 
            style={styles.summaryCard}
            onPress={() => router.push({ pathname: '/components/pages/hydration/Hydration', params: { token } } as any)}
            activeOpacity={0.7}
          >
            <View style={styles.summaryCardHeader}>
              <View>
                <Text style={styles.summaryCardTitle}>Hydration Goal</Text>
                <Text style={styles.summaryCardSubtitle}>{quickStatus.hydrationPercentage}% completed</Text>
              </View>
              <Ionicons name="water" size={32} color="#3B82F6" />
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${Math.min(quickStatus.hydrationPercentage, 100)}%` }]} />
            </View>
            <TouchableOpacity 
              style={styles.quickActionButton} 
              activeOpacity={0.8}
              onPress={async (e) => {
                e.stopPropagation();
                try {
                  // Log 250ml to hydration
                  await api.post('/hydration', { amount_ml: 250, source: 'quick' }, token as string);
                  
                  // Refresh hydration data immediately
                  const hydrationRes = await api.get('/hydration', token as string);
                  if (hydrationRes) {
                    const hydrationPercentage = Math.round(hydrationRes.percentage || 0);
                    const todayTotal = hydrationRes.today_total || 0;
                    const goal = hydrationRes.goal || 2000;
                    
                    setQuickStatus(prev => ({
                      ...prev,
                      hydrationPercentage
                    }));
                    
                    Toast.show({
                      type: 'success',
                      text1: '💧 Water Logged!',
                      text2: `+250ml • Total: ${todayTotal}ml / ${goal}ml (${hydrationPercentage}%)`,
                      position: 'top',
                      visibilityTime: 3000,
                      topOffset: 60,
                    });
                  }
                } catch (err) {
                  console.log('Error logging hydration:', err);
                  Toast.show({
                    type: 'error',
                    text1: '❌ Logging Failed',
                    text2: 'Failed to log hydration. Please try again.',
                    position: 'top',
                    visibilityTime: 3000,
                    topOffset: 60,
                  });
                }
              }}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.quickActionText}>Log +250ml</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Medication Summary Card */}
          <TouchableOpacity 
            style={styles.summaryCard}
            onPress={() => router.push({ pathname: '/components/pages/medication/Medication', params: { token } } as any)}
            activeOpacity={0.7}
          >
            <View style={styles.summaryCardHeader}>
              <View>
                <Text style={styles.summaryCardTitle}>Medications</Text>
                <Text style={styles.summaryCardSubtitle}>
                  {quickStatus.medicationsTotal === 0 
                    ? 'No medications scheduled' 
                    : `${quickStatus.medicationsTaken} of ${quickStatus.medicationsTotal} taken`}
                </Text>
              </View>
              <Ionicons name="medkit" size={32} color="#EF4444" />
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[
                styles.progressBar, 
                { 
                  width: quickStatus.medicationsTotal > 0 
                    ? `${Math.round((quickStatus.medicationsTaken / quickStatus.medicationsTotal) * 100)}%` 
                    : '0%', 
                  backgroundColor: '#EF4444' 
                }
              ]} />
            </View>
            {quickStatus.medicationsLeft > 0 && (
              <Text style={styles.nextMedicationText}>
                {quickStatus.medicationsLeft === 1 ? '1 medication remaining' : `${quickStatus.medicationsLeft} medications remaining`}
              </Text>
            )}
          </TouchableOpacity>

          {/* Smart Insights Card */}
          <TouchableOpacity 
            style={styles.summaryCard}
            onPress={handleInsightsPress}
            activeOpacity={0.7}
          >
            <View style={styles.summaryCardHeader}>
              <View>
                <Text style={styles.summaryCardTitle}>Smart Insights</Text>
                <Text style={styles.summaryCardSubtitle}>
                  {isPremium || isPlus
                    ? `Weekly Adherence: ${insightsScore}%`
                    : 'Unlock to see patterns'}
                </Text>
              </View>
              {(isPremium || isPlus) ? (
                <Ionicons name="analytics" size={32} color="#F59E0B" />
              ) : (
                <Ionicons name="lock-closed" size={32} color="#F59E0B" />
              )}
            </View>

            {(isPremium || isPlus) && weeklyReport && (
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${Math.min(insightsScore, 100)}%`, backgroundColor: '#F59E0B' }]} />
              </View>
            )}

            {isPlus && (
              <View style={styles.insightsTeaserContainer}>
                <TouchableOpacity 
                  style={styles.insightsTeaserButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    setPremiumPopupVisible(true);
                  }}
                >
                  <Ionicons name="lock-closed" size={14} color="#F59E0B" style={{ marginRight: 6 }} />
                  <Text style={styles.insightsTeaserButtonText}>Unlock AI Analysis</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>

          {/* Divider after Categories */}
          <View style={styles.sectionDivider} />
        </View>

      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation currentRoute="home" />

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handleMenuAction(item)}
              >
                <Ionicons name={item.icon as any} size={24} color="#1E3A8A" />
                <Text style={styles.menuItemText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Premium Popup Modal */}
      <Modal
        visible={premiumPopupVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPremiumPopupVisible(false)}
      >
        <View style={styles.premiumPopupOverlay}>
          <View style={styles.premiumPopupContent}>
            <View style={styles.premiumPopupHeader}>
              <Ionicons name="star" size={32} color="#F59E0B" />
              <Text style={styles.premiumPopupTitle}>Unlock Premium Features</Text>
              <Text style={styles.premiumPopupPrice}>₱149 / month</Text>
            </View>
            
            <View style={styles.premiumFeaturesList}>
              <View style={styles.premiumFeatureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.premiumFeatureText}>Unlimited medication tracking</Text>
              </View>
              <View style={styles.premiumFeatureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.premiumFeatureText}>Data export (PDF & CSV)</Text>
              </View>
              <View style={styles.premiumFeatureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.premiumFeatureText}>Smart insights & recommendations</Text>
              </View>
              <View style={styles.premiumFeatureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.premiumFeatureText}>Priority customer support</Text>
              </View>
              <View style={styles.premiumFeatureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.premiumFeatureText}>Advanced scheduling options</Text>
              </View>
            </View>

            <View style={styles.premiumPopupActions}>
              <TouchableOpacity 
                style={styles.premiumPopupButton}
                onPress={() => {
                  setPremiumPopupVisible(false);
                  router.push({ pathname: '/components/pages/subscription/Subscription', params: { token } } as any);
                }}
              >
                <Text style={styles.premiumPopupButtonText}>View Plans</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.premiumPopupCloseButton}
                onPress={() => setPremiumPopupVisible(false)}
              >
                <Text style={styles.premiumPopupCloseText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Premium Congratulations Modal */}
      <Modal
        visible={premiumCongratsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPremiumCongratsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.premiumCongratsContent}>
            <Ionicons name="star" size={40} color="#F59E0B" />
            <Text style={styles.premiumCongratsTitle}>Welcome to Premium!</Text>
            <Text style={styles.premiumCongratsBody}>
              You now have full access to all premium features. Enjoy smarter insights, unlimited tracking, and priority support.
            </Text>
            <TouchableOpacity style={styles.premiumCongratsButton} onPress={() => setPremiumCongratsVisible(false)}>
              <Text style={styles.premiumCongratsButtonText}>Awesome</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PLUS Congratulations Modal */}
      <Modal
        visible={plusCongratsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPlusCongratsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.plusCongratsContent}>
            <Ionicons name="star" size={40} color="#2563EB" />
            <Text style={styles.plusCongratsTitle}>Welcome to PLUS+</Text>
            <Text style={styles.plusCongratsBody}>
              Enjoy enhanced reminders, offline access, and extended history. You are one step away from full Premium insights.
            </Text>
            <View style={styles.plusFeatureList}>
              {['Unlimited Reminders', 'Offline Access', 'Extended History'].map((feature) => (
                <View key={feature} style={styles.plusFeatureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
                  <Text style={styles.plusFeatureText}>{feature}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.plusCongratsButton} onPress={() => setPlusCongratsVisible(false)}>
              <Text style={styles.plusCongratsButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Goal Completion Modal */}
      <Modal
        visible={showGoalCompletionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoalCompletionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.goalModalContent}>
            <View style={styles.goalModalHeader}>
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
              <Text style={styles.goalModalTitle}>🎉 Goal Achieved!</Text>
              <Text style={styles.goalModalSubtitle}>Amazing progress on your hydration goal!</Text>
            </View>
            
            <View style={styles.goalModalStats}>
              <View style={styles.goalStatBox}>
                <Text style={styles.goalStatValue}>{quickStatus.hydrationPercentage}%</Text>
                <Text style={styles.goalStatLabel}>Hydration Goal</Text>
              </View>
            </View>

            <Text style={styles.goalModalMessage}>
              You've reached 100% of your daily hydration goal! Keep up the excellent work and stay healthy! 💧
            </Text>

            <TouchableOpacity 
              style={styles.goalModalButton}
              onPress={() => setShowGoalCompletionModal(false)}
            >
              <Text style={styles.goalModalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Over-Hydration Warning Modal */}
      <Modal
        visible={showOverHydrationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOverHydrationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.overHydrationModalContent}>
            <View style={styles.overHydrationModalHeader}>
              <Ionicons name="warning" size={64} color="#F59E0B" />
              <Text style={styles.overHydrationModalTitle}>⚠️ Over-Hydration Alert</Text>
              <Text style={styles.overHydrationModalSubtitle}>You've exceeded your goal</Text>
            </View>
            
            <View style={styles.goalModalStats}>
              <View style={styles.overHydrationStatBox}>
                <Text style={styles.overHydrationStatValue}>{quickStatus.hydrationPercentage}%</Text>
                <Text style={styles.goalStatLabel}>Current Level</Text>
              </View>
            </View>

            <Text style={styles.overHydrationModalMessage}>
              You're at {quickStatus.hydrationPercentage}% of your daily goal. While staying hydrated is important, drinking too much water can dilute essential nutrients. Consider slowing down.
            </Text>

            <View style={styles.overHydrationTips}>
              <View style={styles.tipItem}>
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text style={styles.tipText}>Listen to your body's signals</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text style={styles.tipText}>Space out water intake evenly</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.overHydrationModalButton}
              onPress={() => setShowOverHydrationModal(false)}
            >
              <Text style={styles.goalModalButtonText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Premium Lock Modal */}
      <PremiumLockModal
        visible={premiumLockVisible}
        onClose={() => setPremiumLockVisible(false)}
        featureName="Smart Insights"
        token={token as string}
      />

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
    paddingTop: 6,
    paddingBottom: 6,
  },
  menuButton: {
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
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  tierBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
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
  searchClear: {
    padding: 4,
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  suggestionsList: {
    maxHeight: 300,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  suggestionDetails: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    marginBottom: 8,
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
    marginBottom: 2,
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
    padding: 18,
    marginBottom: 12,
    minHeight: 100,
  },
  timelineItem: {
    marginBottom: 12,
  },
  timelineItemContent: {
    flexDirection: 'row',
  },
  timelineLeft: {
    width: 24,
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
    paddingBottom: 2,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineTime: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timelineActivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  timelineIcon: {
    marginRight: 8,
  },
  timelineActivity: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  timelineBody: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    marginTop: 2,
    marginLeft: 26,
    lineHeight: 19,
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
  // Summary Cards Styles
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  summaryCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  summaryCardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    justifyContent: 'center',
    gap: 6,
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  nextMedicationText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },
  allCaughtUpContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  allCaughtUpText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
  },
  allCaughtUpSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  // Menu Modal Styles
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 16,
    fontWeight: '500',
  },
  // Premium Badge Styles
  premiumBadge: {
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  plusBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#60A5FA',
  },
  premiumBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumBadgeText: {
    flex: 1,
    marginLeft: 12,
  },
  premiumBadgeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  premiumBadgeSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  // Premium Popup Styles
  premiumPopupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  premiumPopupContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  premiumPopupHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  premiumPopupTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  premiumPopupPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  premiumFeaturesList: {
    marginBottom: 24,
  },
  premiumFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  premiumFeatureText: {
    fontSize: 15,
    color: '#4B5563',
    marginLeft: 12,
    flex: 1,
  },
  premiumPopupActions: {
    gap: 12,
  },
  premiumPopupButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  premiumPopupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  premiumPopupCloseButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  premiumPopupCloseText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  weeklyReportSummary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  premiumCongratsContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  premiumCongratsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  premiumCongratsBody: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  premiumCongratsButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
  },
  premiumCongratsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  insightsTeaserContainer: {
    marginTop: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightsTeaserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  insightsTeaserButtonText: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '700',
  },
  plusCongratsContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  plusCongratsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  plusCongratsBody: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  plusFeatureList: {
    width: '100%',
    marginBottom: 16,
  },
  plusFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  plusFeatureText: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
  },
  plusCongratsButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
  },
  plusCongratsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  // Weekly Report Card Styles
  weeklyReportCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#1E3A8A',
  },
  weeklyReportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  weeklyReportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  weeklyReportContent: {
    paddingTop: 12,
  },
  weeklyReportItem: {
    marginBottom: 12,
  },
  weeklyReportLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  weeklyReportValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  weeklyReportMessage: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  weeklyReportDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  weeklyReportScore: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  weeklyReportScoreLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  weeklyReportScoreValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  // Patterns Card Styles
  patternsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  patternsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  patternsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 12,
  },
  patternItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  patternText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 12,
    lineHeight: 20,
  },
  // Snooze Card Styles
  snoozeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  snoozeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  snoozeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 12,
  },
  snoozeItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
  },
  snoozeMessage: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  snoozeActionButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  snoozeActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // Pre-content wrapper to stabilize sticky header index
  preContent: {
    paddingTop: 0,
  },
  // Sticky header background
  stickyHeader: {
    backgroundColor: '#F8F9FA',
  },
  // Divider after Categories
  sectionDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // Goal Completion Modal Styles
  goalModalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  goalModalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  goalModalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  goalModalSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  goalModalStats: {
    width: '100%',
    marginBottom: 20,
  },
  goalStatBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  goalStatValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  goalStatLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  goalModalMessage: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  goalModalButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  goalModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Over-Hydration Modal Styles
  overHydrationModalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  overHydrationModalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  overHydrationModalTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  overHydrationModalSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  overHydrationStatBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  overHydrationStatValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 4,
  },
  overHydrationModalMessage: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  overHydrationTips: {
    width: '100%',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 10,
    flex: 1,
  },
  overHydrationModalButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});

