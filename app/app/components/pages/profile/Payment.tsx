import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../../api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Payment() {
  const router = useRouter();
  const { plan, token } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [method, setMethod] = useState<'card' | 'gcash'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [gcashNumber, setGcashNumber] = useState('');
  const [gcashRef, setGcashRef] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // basic guard: require plan param
    if (!plan) {
      Alert.alert('Error', 'No plan selected');
      router.back();
    }
  }, [plan]);

  const validateCard = () => {
    const num = cardNumber.replace(/\s+/g, '');
    if (num.length < 12) return 'Enter a valid card number';
    if (!cardName.trim()) return 'Enter cardholder name';
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return 'Expiry must be MM/YY';
    if (!/^\d{3,4}$/.test(cvv)) return 'CVV must be 3 or 4 digits';
    return null;
  };

  const validateGcash = () => {
    if (!/^[0-9+\s-]{7,15}$/.test(gcashNumber)) return 'Enter a valid phone number';
    if (!gcashRef.trim()) return 'Enter payment reference';
    return null;
  };

  const submitPayment = async () => {
    if (!plan) return;
    if (!token) {
      Alert.alert('Sign in required', 'Please sign in to proceed');
      return;
    }

    if (method === 'card') {
      const err = validateCard();
      if (err) { Alert.alert('Validation', err); return; }
    } else {
      const err = validateGcash();
      if (err) { Alert.alert('Validation', err); return; }
    }

    setSubmitting(true);
    try {
      // find plan id from backend
      const plans = await api.get('/subscription/plans', token as string);
      const selected = (plans || []).find((p: any) => p.slug === (plan as string));
      if (!selected) throw new Error('Selected plan not found');

      const payment_method = method === 'card' ? 'card' : 'gcash';
      const payment_reference = method === 'card' ? `card_${cardNumber.slice(-4)}` : gcashRef;

      // call subscribe endpoint
      const payload = {
        plan_id: selected.id,
        payment_method,
        payment_reference,
      };

      const res = await api.post('/subscription/subscribe', payload, token as string);

      Alert.alert('Payment successful', 'Your subscription is now active', [
        { text: 'OK', onPress: () => router.replace({ pathname: '/home' } as any) }
      ]);
    } catch (err: any) {
      console.error('Payment error', err);
      Alert.alert('Payment failed', err?.data?.message || err.message || 'Unable to complete payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top || 12, padding: 20 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={20} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Checkout</Text>
          <View style={{ width: 36 }} />
        </View>

        <Text style={styles.lead}>Pay for {(plan as string).toUpperCase()} plan</Text>

        <View style={styles.methodRow}>
          <TouchableOpacity style={[styles.methodBtn, method === 'card' && styles.methodActive]} onPress={() => setMethod('card')}>
            <Text style={styles.methodText}>Visa / Mastercard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.methodBtn, method === 'gcash' && styles.methodActive]} onPress={() => setMethod('gcash')}>
            <Text style={styles.methodText}>GCash</Text>
          </TouchableOpacity>
        </View>

        {method === 'card' ? (
          <View>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput style={styles.input} value={cardNumber} onChangeText={setCardNumber} keyboardType="numeric" placeholder="1234 5678 9012 3456" />
            <Text style={styles.inputLabel}>Cardholder Name</Text>
            <TextInput style={styles.input} value={cardName} onChangeText={setCardName} placeholder="Name on card" />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Expiry (MM/YY)</Text>
                <TextInput style={styles.input} value={expiry} onChangeText={setExpiry} placeholder="MM/YY" />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ width: 120 }}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput style={styles.input} value={cvv} onChangeText={setCvv} keyboardType="numeric" placeholder="123" secureTextEntry={true} />
              </View>
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.inputLabel}>GCash Phone Number</Text>
            <TextInput style={styles.input} value={gcashNumber} onChangeText={setGcashNumber} keyboardType="phone-pad" placeholder="09xx xxx xxxx" />
            <Text style={styles.inputLabel}>Payment Reference</Text>
            <TextInput style={styles.input} value={gcashRef} onChangeText={setGcashRef} placeholder="Reference number" />
          </View>
        )}

        <View style={{ height: 20 }} />
        <TouchableOpacity style={styles.payBtn} onPress={submitPayment} disabled={submitting}>
          {submitting ? <ActivityIndicator color="white" /> : <Text style={styles.payText}>Pay Now</Text>}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  lead: { color: '#6B7280', marginBottom: 16 },
  methodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  methodBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: 'white', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  methodActive: { borderColor: '#1E3A8A', backgroundColor: '#EEF2FF' },
  methodText: { color: '#111827', fontWeight: '600' },
  inputLabel: { color: '#374151', marginBottom: 8, marginTop: 12, fontWeight: '600' },
  input: { backgroundColor: 'white', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  payBtn: { backgroundColor: '#1E3A8A', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  payText: { color: 'white', fontWeight: '700' },
});
