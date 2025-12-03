import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../../api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Premium() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [plans, setPlans] = useState<any[] | null>(null);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadPlans = async () => {
      try {
        const data = await api.get('/subscription/plans', token as string);
        if (mounted) setPlans(data || []);
      } catch (err) {
        console.error('Failed to load plans', err);
        if (mounted) setPlans([]);
      }
    };
    loadPlans();
    return () => { mounted = false; };
  }, [token]);

  const handleSubscribe = async (planSlug: string) => {
    if (!token) {
      Alert.alert('Not signed in', 'Please sign in to subscribe');
      return;
    }

    setSubscribing(true);
    try {
      const res = await handleSubscribeRequest(planSlug, token as string);
      // If backend returned subscription, success
      if (res && (res.subscription || res.message)) {
        Alert.alert('Success', res.message || 'Subscription activated');
        // Optionally navigate back or refresh
        router.replace({ pathname: '/components/pages/profile/ProfileDetails', params: { token } } as any);
      } else {
        Alert.alert('Success', 'Subscription processed');
      }
    } catch (err: any) {
      console.error('Subscribe error:', err);
      const msg = err?.data?.message || err?.message || 'Failed to subscribe';
      Alert.alert('Error', msg);
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 20 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Plans & Pricing</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.lead}>Choose the plan that's right for you. Upgrade anytime.</Text>

        {/* Free Card (already unlocked) */}
        <View style={[styles.card, styles.freeCard]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>FREE</Text>
            <Text style={styles.cardSubtitle}>This is already unlocked</Text>
          </View>

          <View style={styles.features}>
            <Feature text="Basic reminders for hydration & medication" />
            <Feature text="Track up to 2 medications and daily water intake" />
            <Feature text="Manual logging only" />
            <Feature text="7-day activity history" />
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.unlockedBadge}>Unlocked</Text>
          </View>
        </View>

        {/* Plus+ Card */}
        <View style={[styles.card, styles.plusCard]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>PLUS+</Text>
            <Text style={styles.price}>₱89 / month</Text>
          </View>

          <View style={styles.features}>
            <Feature text="Everything in Free" />
            <Feature text="Unlimited reminders" />
            <Feature text="Track up to 10 medications with dosage schedules" />
            <Feature text="30-day adherence history" />
            <Feature text="Basic health stats & charts" />
            <Feature text="Offline reminders" />
            <Feature text="Personalized notification" />
          </View>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push({ pathname: '/components/pages/profile/Payment', params: { plan: 'plus', token } } as any)}
          >
            <Text style={styles.ctaText}>Upgrade to PLUS+</Text>
          </TouchableOpacity>
        </View>

        {/* Premium Card */}
        <View style={[styles.card, styles.premiumCard]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>PREMIUM</Text>
            <Text style={styles.price}>₱149 / month</Text>
          </View>

          <View style={styles.features}>
            <Feature text="Everything in PLUS+" />
            <Feature text="Unlimited medication & hydration tracking" />
            <Feature text="Data export" />
            <Feature text="Priority customer support" />
            <Feature text="Advanced scheduling" />
            <Feature text="Extended history" />
            <Feature text="Smart insights & recommendations" />
          </View>

          <TouchableOpacity
            style={[styles.ctaButton, styles.premiumCta]}
            onPress={() => router.push({ pathname: '/components/pages/profile/Payment', params: { plan: 'premium', token } } as any)}
          >
            <Text style={[styles.ctaText, styles.premiumCtaText]}>Upgrade to PREMIUM</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <View style={styles.featureRow}>
      <Ionicons name="checkmark-circle" size={18} color="#10B981" />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

async function subscribeToPlan(planSlug: string, token?: string | undefined) {
  // Fetch plans to find plan id then call subscribe endpoint
  const plans = await api.get('/subscription/plans', token);
  const plan = (plans || []).find((p: any) => p.slug === planSlug);
  if (!plan) throw new Error('Plan not found');

  if (!plan.price || Number(plan.price) === 0) {
    // free plan
    return { message: 'Plan is free or already unlocked', plan };
  }

  // For now use manual payment_method/payment_reference; replace with real payment integration later
  const payload = {
    plan_id: plan.id,
    payment_method: 'manual',
    payment_reference: `manual_${Date.now()}`,
  };

  const res = await api.post('/subscription/subscribe', payload, token);
  return res;
}

async function handleSubscribeRequest(planSlug: string, token?: string | undefined) {
  try {
    const res = await subscribeToPlan(planSlug, token);
    return res;
  } catch (err: any) {
    throw err;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scroll: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  title: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  lead: { color: '#6B7280', marginBottom: 16 },

  card: { backgroundColor: 'white', borderRadius: 14, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  freeCard: {},
  plusCard: {},
  premiumCard: {},

  cardHeader: { marginBottom: 8 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  cardSubtitle: { color: '#6B7280', fontSize: 13 },
  price: { fontSize: 14, fontWeight: '700', color: '#1E3A8A' },

  features: { marginTop: 4, marginBottom: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 6 },
  featureText: { color: '#374151', flex: 1, marginLeft: 8 },

  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end' },
  unlockedBadge: { backgroundColor: '#ECFDF5', color: '#065F46', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, fontWeight: '700' },

  ctaButton: { backgroundColor: '#1E3A8A', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  ctaText: { color: 'white', fontWeight: '700' },
  premiumCta: { backgroundColor: '#111827' },
  premiumCtaText: { color: '#F8FAFC' },
});