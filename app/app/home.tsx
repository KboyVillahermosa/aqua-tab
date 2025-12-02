import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView, TextInput, SafeAreaView, Dimensions, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
}

export default function Home() {
  const { token } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickStatus, setQuickStatus] = useState<QuickStatus>({ medicationsLeft: 0, hydrationPercentage: 0 });
  const [menuVisible, setMenuVisible] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [premiumPopupVisible, setPremiumPopupVisible] = useState(false);
  const [premiumLockVisible, setPremiumLockVisible] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [snoozeSuggestions, setSnoozeSuggestions] = useState<any[]>([]);

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
        
        // Load other data in background (non-blocking, won't affect loading state)
        // These run after loading is already set to false
        setTimeout(() => {
          // Load quick status data (non-blocking with timeouts)
          Promise.allSettled([
            api.get('/hydration', token as string, 3000).catch(() => null),
            api.get('/medications/upcoming', token as string, 3000).catch(() => null),
          ]).then((results) => {
            const hydrationData = results[0].status === 'fulfilled' ? results[0].value : null;
            const upcoming = results[1].status === 'fulfilled' ? results[1].value : null;
            
            const hydrationPercentage = hydrationData ? Math.round(hydrationData?.percentage || 0) : 0;
            const medicationsLeft = Array.isArray(upcoming) ? upcoming.length : 0;
            
            setQuickStatus({
              medicationsLeft,
              hydrationPercentage
            });
          }).catch(() => {
            // Set defaults if all fail
            setQuickStatus({ medicationsLeft: 0, hydrationPercentage: 0 });
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
          Promise.race([
            api.get('/subscription/current', token as string, 3000), // 3 second timeout
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
          ])
            .then((subscriptionData: any) => {
              setSubscription(subscriptionData);
            })
            .catch((subErr) => {
              console.log('Error loading subscription (non-critical):', subErr);
              // Set default subscription to avoid blocking
              setSubscription({ plan_slug: 'free', is_active: false });
            });
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
    if (subscription?.plan_slug === 'premium' && token) {
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
  }, [subscription, token]);


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

  const menuItems = [
    { label: 'Settings', icon: 'settings-outline', route: '/components/pages/settings/Settings' },
    { label: 'Profile', icon: 'person-outline', route: '/components/pages/profile/Profile' },
    { label: 'Help & Support', icon: 'help-circle-outline', route: null },
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
          <Text style={styles.welcomeText}>Hi, {displayName}</Text>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              placeholder="Search medicine"
              style={styles.searchInput}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Premium Badge - Show if not premium */}
        {subscription && subscription.plan_slug !== 'premium' && (
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
        {subscription?.plan_slug === 'premium' && weeklyReport && (
          <View style={styles.weeklyReportCard}>
            <View style={styles.weeklyReportHeader}>
              <Ionicons name="analytics" size={24} color="#1E3A8A" />
              <Text style={styles.weeklyReportTitle}>Weekly Report Card</Text>
            </View>
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
            </View>
            <View style={styles.weeklyReportScore}>
              <Text style={styles.weeklyReportScoreLabel}>Overall Score</Text>
              <Text style={styles.weeklyReportScoreValue}>{weeklyReport.overall_score || 0}%</Text>
            </View>
          </View>
        )}

        {/* Pattern Detection - Premium Feature */}
        {subscription?.plan_slug === 'premium' && patterns.length > 0 && (
          <View style={styles.patternsCard}>
            <View style={styles.patternsHeader}>
              <Ionicons name="bulb" size={24} color="#F59E0B" />
              <Text style={styles.patternsTitle}>Smart Insights</Text>
            </View>
            {patterns.slice(0, 3).map((pattern, index) => (
              <View key={index} style={styles.patternItem}>
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text style={styles.patternText}>{pattern.pattern}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Snooze Suggestions - Premium Feature */}
        {subscription?.plan_slug === 'premium' && snoozeSuggestions.length > 0 && (
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

        {/* Quick Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusText}>
            <Text style={styles.statusTitle}>
              Quick status: {quickStatus.medicationsLeft} medication{quickStatus.medicationsLeft !== 1 ? 's' : ''} left today • {quickStatus.hydrationPercentage}% hydration reached
            </Text>
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
                        size={18} 
                        color="#FFFFFF" 
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
    width: 56,
    height: 56,
    borderRadius: 28,
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
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  timelineBody: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    marginTop: 2,
    marginLeft: 26,
    lineHeight: 20,
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
  // Weekly Report Card Styles
  weeklyReportCard: {
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
    borderLeftColor: '#1E3A8A',
  },
  weeklyReportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weeklyReportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 12,
  },
  weeklyReportContent: {
    marginBottom: 16,
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
});
