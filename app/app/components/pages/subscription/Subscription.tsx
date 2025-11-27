import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../../api';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  billing_period: string;
  features: string[];
  max_medications: number | null;
  history_days: number;
  unlimited_reminders: boolean;
  advanced_scheduling: boolean;
  data_export: boolean;
  priority_support: boolean;
  smart_insights: boolean;
  offline_reminders: boolean;
  personalized_notifications: boolean;
  health_stats: boolean;
}

interface CurrentSubscription {
  plan: SubscriptionPlan | null;
  expires_at: string | null;
  is_active: boolean;
  plan_slug: string;
}

export default function Subscription() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = params.token as string;

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [plansData, currentData] = await Promise.all([
        api.get('/subscription/plans', token),
        api.get('/subscription/current', token),
      ]);
      
      // Ensure price is a number for each plan
      const normalizedPlans = Array.isArray(plansData) 
        ? plansData.map((plan: any) => ({
            ...plan,
            price: plan.price !== undefined && plan.price !== null ? Number(plan.price) : 0,
            features: Array.isArray(plan.features) ? plan.features : [],
          }))
        : [];
      
      setPlans(normalizedPlans);
      setCurrentSubscription(currentData);
    } catch (err: any) {
      console.log('Error loading subscription data:', err);
      Alert.alert('Error', 'Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe(planId: number) {
    if (subscribing) return;

    Alert.alert(
      'Subscribe',
      'This will activate your subscription. Payment processing will be implemented separately.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: async () => {
            try {
              setSubscribing(planId);
              await api.post(
                '/subscription/subscribe',
                {
                  plan_id: planId,
                  payment_method: 'manual',
                  payment_reference: `manual_${Date.now()}`,
                },
                token
              );
              Alert.alert('Success', 'Subscription activated successfully!');
              loadData();
            } catch (err: any) {
              console.log('Subscribe error:', err);
              const message = err?.data?.message || err?.data || err?.message || 'Subscription failed';
              Alert.alert('Error', typeof message === 'string' ? message : JSON.stringify(message));
            } finally {
              setSubscribing(null);
            }
          },
        },
      ]
    );
  }

  async function handleCancel() {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will keep access until the end of your billing period.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post('/subscription/cancel', {}, token);
              Alert.alert('Success', 'Subscription cancelled successfully');
              loadData();
            } catch (err: any) {
              console.log('Cancel error:', err);
              Alert.alert('Error', 'Failed to cancel subscription');
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Premium Plans</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      </View>
    );
  }

  const currentPlanSlug = currentSubscription?.plan_slug || 'free';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Unlock More with Premium!</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {currentSubscription?.is_active && currentSubscription.plan && (
          <View style={styles.currentPlanCard}>
            <Text style={styles.currentPlanTitle}>Current Plan</Text>
            <Text style={styles.currentPlanName}>{currentSubscription.plan.name}</Text>
            {currentSubscription.expires_at && (
              <Text style={styles.currentPlanExpiry}>
                Expires: {new Date(currentSubscription.expires_at).toLocaleDateString()}
              </Text>
            )}
            {currentPlanSlug !== 'free' && (
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.plansContainer}>
          {plans.map((plan) => {
            const isCurrent = currentPlanSlug === plan.slug;
            const isFree = plan.slug === 'free';
            const isSubscribing = subscribing === plan.id;

            return (
              <View
                key={plan.id}
                style={[
                  styles.planCard,
                  isCurrent && styles.planCardActive,
                  plan.slug === 'premium' && styles.planCardPremium,
                ]}
              >
                {isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>CURRENT</Text>
                  </View>
                )}
                <Text style={styles.planName}>{plan.name}</Text>
                {!isFree && plan.price !== undefined && plan.price !== null && (
                  <Text style={styles.planPrice}>
                    ₱{Number(plan.price).toFixed(0)} / {plan.billing_period || 'month'}
                  </Text>
                )}
                {isFree && <Text style={styles.planPrice}>FREE</Text>}

                <View style={styles.featuresContainer}>
                  {Array.isArray(plan.features) && plan.features.length > 0 ? (
                    plan.features.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                        <Text style={styles.featureText}>{feature || ''}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.featureText}>No features listed</Text>
                  )}
                </View>

                {!isCurrent && !isFree && (
                  <TouchableOpacity
                    style={[styles.subscribeButton, isSubscribing && styles.subscribeButtonDisabled]}
                    onPress={() => handleSubscribe(plan.id)}
                    disabled={isSubscribing}
                  >
                    {isSubscribing ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.subscribeButtonText}>Subscribe</Text>
                    )}
                  </TouchableOpacity>
                )}

                {isCurrent && !isFree && (
                  <View style={styles.currentButton}>
                    <Text style={styles.currentButtonText}>Current Plan</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E3A8A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  currentPlanCard: {
    backgroundColor: '#10B981',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  currentPlanTitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
  },
  currentPlanName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  currentPlanExpiry: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  plansContainer: {
    padding: 20,
    paddingTop: 10,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  planCardActive: {
    borderColor: '#10B981',
  },
  planCardPremium: {
    borderColor: '#1E3A8A',
    borderWidth: 3,
  },
  currentBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#10B981',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  planName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 20,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
    lineHeight: 20,
  },
  subscribeButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  currentButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  currentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

