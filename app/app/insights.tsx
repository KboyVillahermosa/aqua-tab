import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PremiumLockModal from './components/PremiumLockModal';
import WeeklyInsights from './components/pages/insights/WeeklyInsights';
import * as api from './api';

export default function InsightsScreen() {
  const { token } = useLocalSearchParams();
  const router = useRouter();
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        // If no token, treat as non-premium without hitting API
        if (!token) {
          setIsPremium(false);
          return;
        }
        const sub = await api.get('/subscription/current', String(token), 3000).catch(() => ({ plan_slug: 'free' }));
        setIsPremium(sub?.plan_slug === 'premium');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: '#666' }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  if (!isPremium) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
          <Text style={{ fontSize: 22, fontWeight: '600' }}>Weekly Insights</Text>
          <Text style={{ color: '#666', marginTop: 4 }}>Premium feature</Text>
        </View>
        <PremiumLockModal
          visible={true}
          onClose={() => {
            // Return to previous screen, token stays in navigation params
            router.back();
          }}
          featureName="Smart Insights"
          token={String(token ?? '')}
        />
      </SafeAreaView>
    );
  }

  return <WeeklyInsights />;
}
