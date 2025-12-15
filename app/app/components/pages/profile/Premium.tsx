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
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadPlans = async () => {
      try {
        const data = await api.get('/subscription/plans', token as string);
        if (mounted) setPlans(data || []);

        // Also load current subscription so we can refresh UI when changed
        const current = await api.get('/subscription/current', token as string).catch(() => null);
        if (mounted) setCurrentPlan(current?.plan_slug ?? null);
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
      } else {
        Alert.alert('Success', 'Subscription processed');
      }

      // Refresh current subscription so locks unlock immediately
      let refreshedPlanSlug: string | null = currentPlan;
      try {
        const refreshed = await api.get('/subscription/current', token as string);
        refreshedPlanSlug = refreshed?.plan_slug ?? null;
        setCurrentPlan(refreshedPlanSlug);
      } catch (refreshErr) {
        console.log('Unable to refresh subscription', refreshErr);
      }

      // Navigate back with the latest plan info
      router.replace({ pathname: '/components/pages/profile/ProfileDetails', params: { token, refreshed_plan: refreshedPlanSlug } } as any);
    } catch (err: any) {
      console.error('Subscribe error:', err);
      const msg = err?.data?.message || err?.message || 'Failed to subscribe';
      Alert.alert('Error', msg);
    } finally {
      setSubscribing(false);
    }
  };

  const renderFreeCard = (isCurrent: boolean) => (
    <View style={[styles.card, styles.freeCard, isCurrent && styles.currentCard]}>
      <View style={styles.cardHeaderRow}>
        <View>
          <Text style={styles.cardTitle}>FREE</Text>
          <Text style={styles.cardSubtitle}>This is already unlocked</Text>
        </View>
        {isCurrent && <Text style={styles.currentBadge}>Current</Text>}
      </View>

      <View style={styles.features}>
        <Feature text="Basic reminders for hydration & medication" color="#9CA3AF" />
        <Feature text="Track up to 2 medications and daily water intake" color="#9CA3AF" />
        <Feature text="Manual logging only" color="#9CA3AF" />
        <Feature text="7-day activity history" color="#9CA3AF" />
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.unlockedBadge}>Unlocked</Text>
      </View>
    </View>
  );

  const renderPlusCard = (isCurrent: boolean) => (
    <View style={[styles.card, styles.plusCard, isCurrent && styles.currentCard]}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>PLUS+</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {isCurrent && <Text style={styles.currentBadgePlus}>Current</Text>}
          <Text style={styles.pricePlus}>₱89 / month</Text>
        </View>
      </View>

      <View style={styles.features}>
        <Feature text="Everything in Free" color="#60A5FA" />
        <Feature text="Unlimited reminders" color="#60A5FA" />
        <Feature text="Track up to 10 medications with dosage schedules" color="#60A5FA" />
        <Feature text="30-day adherence history" color="#60A5FA" />
        <Feature text="Basic health stats & charts" color="#60A5FA" />
        <Feature text="Offline reminders" color="#60A5FA" />
        <Feature text="Personalized notification" color="#60A5FA" />
      </View>

      <TouchableOpacity
        style={[styles.ctaButtonPlus, subscribing ? styles.ctaButtonDisabled : null]}
        disabled={subscribing || isCurrent}
        onPress={() => handleSubscribe('plus')}
      >
        <Text style={styles.ctaText}>{isCurrent ? 'Current Plan' : subscribing ? 'Processing…' : 'Upgrade to PLUS+'}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPremiumCard = (isCurrent: boolean) => (
    <View style={[styles.card, styles.premiumCard, isCurrent && styles.currentCard]}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>PREMIUM</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {isCurrent && <Text style={styles.currentBadgePremium}>Current</Text>}
          <Text style={styles.pricePremium}>₱149 / month</Text>
        </View>
      </View>

      <View style={styles.features}>
        <Feature text="Everything in PLUS+" color="#F59E0B" />
        <Feature text="Unlimited medication & hydration tracking" color="#F59E0B" />
        <Feature text="Data export" color="#F59E0B" />
        <Feature text="Priority customer support" color="#F59E0B" />
        <Feature text="Advanced scheduling" color="#F59E0B" />
        <Feature text="Extended history" color="#F59E0B" />
        <Feature text="Smart insights & recommendations" color="#F59E0B" />
      </View>

      <TouchableOpacity
        style={[styles.ctaButton, styles.premiumCta, subscribing ? styles.ctaButtonDisabled : null]}
        disabled={subscribing || isCurrent}
        onPress={() => handleSubscribe('premium')}
      >
        <Text style={[styles.ctaText, styles.premiumCtaText]}>{isCurrent ? 'Current Plan' : subscribing ? 'Processing…' : 'Upgrade to PREMIUM'}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPlanCards = () => {
    const orderedSlugs = ['free', 'plus', 'premium'];
    const currentSlug = currentPlan || 'free';
    orderedSlugs.sort((a, b) => (a === currentSlug ? -1 : 0) + (b === currentSlug ? 1 : 0));

    return orderedSlugs.map((slug) => {
      const isCurrent = currentSlug === slug;
      if (slug === 'free') return <React.Fragment key={slug}>{renderFreeCard(isCurrent)}</React.Fragment>;
      if (slug === 'plus') return <React.Fragment key={slug}>{renderPlusCard(isCurrent)}</React.Fragment>;
      return <React.Fragment key={slug}>{renderPremiumCard(isCurrent)}</React.Fragment>;
    });
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

        {renderPlanCards()}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Feature({ text, color = '#10B981' }: { text: string; color?: string }) {
  return (
    <View style={styles.featureRow}>
      <Ionicons name="checkmark-circle" size={18} color={color} />
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
  freeCard: { borderLeftWidth: 3, borderLeftColor: '#9CA3AF' },
  plusCard: { borderLeftWidth: 3, borderLeftColor: '#60A5FA' },
  premiumCard: { borderLeftWidth: 3, borderLeftColor: '#F59E0B' },

  cardHeader: { marginBottom: 8 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  cardSubtitle: { color: '#6B7280', fontSize: 13 },
  price: { fontSize: 14, fontWeight: '700', color: '#1E3A8A' },
  pricePlus: { fontSize: 14, fontWeight: '700', color: '#3B82F6' },
  pricePremium: { fontSize: 14, fontWeight: '700', color: '#F59E0B' },

  features: { marginTop: 4, marginBottom: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 6 },
  featureText: { color: '#374151', flex: 1, marginLeft: 8 },

  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end' },
  unlockedBadge: { backgroundColor: '#F3F4F6', color: '#6B7280', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, fontWeight: '700' },

  ctaButton: { backgroundColor: '#1E3A8A', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  ctaButtonPlus: { backgroundColor: '#3B82F6', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  ctaText: { color: 'white', fontWeight: '700' },
  premiumCta: { backgroundColor: '#F59E0B' },
  premiumCtaText: { color: 'white' },
  ctaButtonDisabled: { opacity: 0.7 },
  currentCard: { borderWidth: 2, borderColor: '#10B981' },
  currentBadge: {
    backgroundColor: '#ECFDF5',
    color: '#065F46',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: '700',
    fontSize: 12,
  },
  currentBadgePlus: {
    backgroundColor: '#EFF6FF',
    color: '#1E40AF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: '700',
    fontSize: 12,
  },
  currentBadgePremium: {
    backgroundColor: '#FFFBEB',
    color: '#92400E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: '700',
    fontSize: 12,
  },
});