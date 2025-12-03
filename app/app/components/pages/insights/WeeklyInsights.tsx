import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useInsights } from '../../../hooks/useInsights';

export default function WeeklyInsights() {
  const { data, loading, error } = useInsights('general');

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: '600' }}>Weekly Insights</Text>
        <Text style={{ color: '#666', marginTop: 4 }}>Highlights from your recent activity</Text>
      </View>
      {loading && (
        <View style={{ paddingHorizontal: 16 }}>
          <ActivityIndicator />
        </View>
      )}
      {error && (
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={{ color: 'red' }}>{error}</Text>
        </View>
      )}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        {data.map((item) => (
          <View key={item.id} style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 12, marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.title}</Text>
            {item.description ? (
              <Text style={{ color: '#444', marginTop: 6 }}>{item.description}</Text>
            ) : null}
            <View style={{ marginTop: 8 }}>
              <Text style={{ color: '#888', fontSize: 12 }}>Type: {item.type}</Text>
              <Text style={{ color: '#888', fontSize: 12 }}>Generated: {new Date(item.generated_at).toLocaleString()}</Text>
            </View>
          </View>
        ))}
        {data.length === 0 && !loading && !error && (
          <View style={{ paddingTop: 24 }}>
            <Text style={{ color: '#666' }}>No insights yet.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
