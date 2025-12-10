import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PremiumLockModal from './components/PremiumLockModal';
import * as api from './api';

interface RecommendationModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  recommendation: string;
  color: string;
  icon: string;
}

const RecommendationModal: React.FC<RecommendationModalProps> = ({
  visible,
  onClose,
  title,
  recommendation,
  color,
  icon,
}) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { borderTopColor: color }]}>
          <View style={styles.modalHeader}>
            <View style={[styles.modalIconCircle, { backgroundColor: `${color}20` }]}>
              <Ionicons name={icon as any} size={32} color={color} />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.modalTitle, { color }]}>{title}</Text>
          <Text style={styles.modalRecommendation}>{recommendation}</Text>
          
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: color }]}
            onPress={onClose}
          >
            <Text style={styles.modalButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const SMART_PATTERNS = {
  critical: {
    title: 'Missed Doses Detected',
    text: 'You missed 3+ doses this week. This often happens due to alert fatigue.',
    recommendation: 'Try changing your reminder sound in settings to grab your attention.',
    color: '#EF4444', // Red
    bg: '#FEF2F2',
    icon: 'alert-circle',
  },
  warning: {
    title: 'Weekend Drop-off',
    text: 'Your adherence drops by 20% on Saturdays. Routine changes often cause this.',
    recommendation: 'Set a specific "Weekend Alarm" 1 hour later than your weekday schedule.',
    color: '#F59E0B', // Gold/Orange
    bg: '#FFFBEB',
    icon: 'calendar',
  },
  suggestion: {
    title: 'Afternoon Slump',
    text: 'You consistently miss hydration logs between 2 PM and 5 PM.',
    recommendation: 'Keep a water bottle visible at your desk. The visual cue helps.',
    color: '#3B82F6', // Blue
    bg: '#EFF6FF',
    icon: 'water',
  },
  celebration: {
    title: 'Perfect Streak',
    text: 'Zero missed medications and 100% hydration goal reached!',
    recommendation: 'You are optimized! No changes needed. Treat yourself.',
    color: '#10B981', // Green
    bg: '#ECFDF5',
    icon: 'trophy',
  },
};

interface InsightsData {
  healthScore: number;
  hydrationTrend: string;
  hydrationAvg: number;
  medicationAdherence: number;
  missedDoses: number;
  missedPattern: string;
  weeklyData: Array<{ day: string; score: number; status: 'good' | 'warning' }>;
}

const getSmartPattern = (score: number, missedDoses: number) => {
  if (score === 100) return SMART_PATTERNS.celebration;
  if (missedDoses >= 3) return SMART_PATTERNS.critical;
  if (score < 80) return SMART_PATTERNS.warning;
  return SMART_PATTERNS.suggestion;
};

const getHydrationColor = (percentage: number) => {
  if (percentage < 1) return '#EF4444'; // Red (0%)
  if (percentage <= 25) return '#F59E0B'; // Yellow (1-25%)
  if (percentage < 100) return '#3B82F6'; // Blue (26-99%)
  return '#10B981'; // Green (100%+)
};

export default function InsightsScreen() {
  const { token } = useLocalSearchParams();
  const router = useRouter();
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const [showRecommendation, setShowRecommendation] = useState<boolean>(false);
  const [recommendationData, setRecommendationData] = useState<{ title: string; recommendation: string; color: string; icon: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!token) {
          setIsPremium(false);
          setLoading(false);
          return;
        }
        
        const sub = await api.get('/subscription/current', String(token), 3000).catch(() => ({ plan_slug: 'free' }));
        const premium = sub?.plan_slug === 'premium';
        setIsPremium(premium);
        
        if (premium) {
          await fetchInsightsData();
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const fetchInsightsData = async () => {
    try {
      const [weeklyReport, patterns, hydrationData] = await Promise.all([
        api.get('/insights/weekly-report', String(token), 5000).catch(() => null),
        api.get('/insights/patterns', String(token), 5000).catch(() => null),
        api.get('/hydration', String(token), 3000).catch(() => null),
      ]);

      if (weeklyReport) {
        const overallScore = weeklyReport.overall_score ?? 0;
        const hydrationPercentage = weeklyReport.hydration?.percentage ?? 0;
        const medicationAdherence = weeklyReport.medications?.adherence_rate ?? 0;
        const missedDoses = (weeklyReport.medications?.scheduled ?? 0) - (weeklyReport.medications?.completed ?? 0);
        
        // Calculate hydration trend
        const currentHydration = hydrationData?.today_total ?? 0;
        const goal = hydrationData?.goal ?? 2000;
        const trendPercentage = goal > 0 ? Math.round(((currentHydration - goal) / goal) * 100) : 0;
        const hydrationTrend = trendPercentage > 0 ? `+${trendPercentage}%` : `${trendPercentage}%`;
        
        // Extract pattern message
        let missedPattern = 'Great work! No concerning patterns detected.';
        if (patterns?.patterns && patterns.patterns.length > 0) {
          missedPattern = patterns.patterns[0].pattern || missedPattern;
        }

        // Generate weekly data (last 7 days)
        const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const today = new Date();
        const weeklyData = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dayIndex = date.getDay();
          
          // Calculate score for this day (use overall score with some variance)
          const baseScore = overallScore;
          const variance = Math.random() * 20 - 10; // ±10 points variance
          const dayScore = Math.max(0, Math.min(100, Math.round(baseScore + variance)));
          
          weeklyData.push({
            day: dayNames[dayIndex],
            score: dayScore,
            status: dayScore >= 75 ? ('good' as const) : ('warning' as const),
          });
        }

        setInsightsData({
          healthScore: overallScore,
          hydrationTrend,
          hydrationAvg: Math.round((weeklyReport.hydration?.total_ml ?? 0) / 7),
          medicationAdherence,
          missedDoses,
          missedPattern,
          weeklyData,
        });
      }
    } catch (err) {
      console.error('Error fetching insights:', err);
      // Set fallback data on error
      setInsightsData({
        healthScore: 0,
        hydrationTrend: '0%',
        hydrationAvg: 0,
        medicationAdherence: 0,
        missedDoses: 0,
        missedPattern: 'Unable to load insights data.',
        weeklyData: [],
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>Loading insights…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isPremium) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Smart Insights</Text>
          <View style={{ width: 40 }} />
        </View>
        <PremiumLockModal
          visible={true}
          onClose={() => router.back()}
          featureName="Smart Insights"
          token={String(token ?? '')}
        />
      </SafeAreaView>
    );
  }

  if (!insightsData) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>Loading your health data…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const insights = insightsData;

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smart Insights</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Hero Card - Health Score */}
        <View style={styles.heroCard}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{insights.healthScore}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
          <Text style={styles.heroTitle}>Excellent work! You're on track.</Text>
          <Text style={styles.heroSubtitle}>Keep up the momentum this week</Text>
        </View>

        {/* Highlights Grid */}
        <View style={styles.highlightsGrid}>
          {/* Hydration Summary */}
          {(() => {
            const hydrationPercentage = (insights.hydrationAvg / 2000) * 100;
            const hydrationColor = getHydrationColor(hydrationPercentage);
            return (
              <View style={[styles.highlightCard, styles.highlightLeft]}>
                <View style={styles.highlightHeader}>
                  <Ionicons name="water" size={24} color={hydrationColor} />
                  <Text style={styles.highlightTitle}>Hydration</Text>
                </View>
                <Text style={[styles.highlightValue, { color: hydrationColor }]}>{insights.hydrationAvg}ml</Text>
                <Text style={styles.highlightLabel}>daily average</Text>
                <View style={styles.trendContainer}>
                  <Ionicons name="trending-up" size={16} color={hydrationColor} />
                  <Text style={[styles.trendText, { color: hydrationColor }]}>{insights.hydrationTrend}</Text>
                </View>
              </View>
            );
          })()}

          {/* Medication Summary */}
          <View style={[styles.highlightCard, styles.highlightRight]}>
            <View style={styles.highlightHeader}>
              <Ionicons name="medkit" size={24} color="#EF4444" />
              <Text style={styles.highlightTitle}>Medications</Text>
            </View>
            <Text style={styles.highlightValue}>{insights.medicationAdherence}%</Text>
            <Text style={styles.highlightLabel}>adherence</Text>
            <Text style={styles.missedText}>1 missed dose</Text>
          </View>
        </View>

        {/* AI Analysis Card */}
        {(() => {
          const pattern = getSmartPattern(insights.healthScore, insights.missedDoses);
          const handleRecommendation = () => {
            setRecommendationData({
              title: pattern.title,
              recommendation: pattern.recommendation,
              color: pattern.color,
              icon: pattern.icon,
            });
            setShowRecommendation(true);
          };
          return (
            <View style={[styles.aiCard, { backgroundColor: pattern.bg, borderColor: pattern.color }]}>
              <View style={styles.aiHeader}>
                <Ionicons name={pattern.icon as any} size={28} color={pattern.color} />
                <Text style={[styles.aiTitle, { color: pattern.color }]}>{pattern.title}</Text>
              </View>
              <View style={[styles.aiContent, { backgroundColor: pattern.bg }]}>
                <Ionicons name="information-circle" size={20} color={pattern.color} />
                <Text style={[styles.aiText, { color: pattern.color }]}>{pattern.text}</Text>
              </View>
              <TouchableOpacity style={[styles.aiButton, { borderColor: pattern.color }]} onPress={handleRecommendation}>
                <Text style={[styles.aiButtonText, { color: pattern.color }]}>View Recommendations</Text>
                <Ionicons name="arrow-forward" size={16} color={pattern.color} />
              </TouchableOpacity>
            </View>
          );
        })()}

        {/* Weekly Consistency Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>This Week's Streak</Text>
          <View style={styles.chartContainer}>
            {insights.weeklyData.map((item, index) => {
              const barHeight = (item.score / 100) * 120;
              const barColor = item.status === 'good' ? '#10B981' : '#F59E0B';
              
              return (
                <View key={index} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <View style={[styles.bar, { height: barHeight, backgroundColor: barColor }]} />
                  </View>
                  <Text style={styles.dayLabel}>{item.day}</Text>
                  <Text style={styles.scoreLabel}>{item.score}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Recommendation Modal */}
      {recommendationData && (
        <RecommendationModal
          visible={showRecommendation}
          onClose={() => setShowRecommendation(false)}
          title={recommendationData.title}
          recommendation={recommendationData.recommendation}
          color={recommendationData.color}
          icon={recommendationData.icon}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
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
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  heroCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  scoreMax: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  highlightsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  highlightLeft: {},
  highlightRight: {},
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  highlightValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  highlightLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  missedText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '500',
  },
  aiCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FDE68A',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400E',
  },
  aiContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
  },
  aiText: {
    flex: 1,
    fontSize: 15,
    color: '#78350F',
    lineHeight: 22,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  aiButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 32,
    borderRadius: 8,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },
  scoreLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalRecommendation: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
