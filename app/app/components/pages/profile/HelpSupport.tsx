import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function HelpSupport() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I add medications?',
      answer: 'Go to Medical History and tap "Add Medication". Enter the medication name, dosage, frequency, and reason. Your medications will be saved and you\'ll get reminders.',
    },
    {
      id: '2',
      question: 'Can I edit my profile picture?',
      answer: 'Yes! Tap the camera icon on your profile picture to upload a new photo from your gallery or take a new one with your camera.',
    },
    {
      id: '3',
      question: 'How do notifications work?',
      answer: 'You can customize notifications in Settings > Notifications. Choose which reminders you want to receive for medications, hydration, and health tips.',
    },
    {
      id: '4',
      question: 'Is my health data private?',
      answer: 'Yes, your health data is encrypted and stored securely. We never share your information with third parties without your consent.',
    },
    {
      id: '5',
      question: 'How do I change my password?',
      answer: 'Go to Privacy & Security and tap "Change Password". Enter your current password and your new password.',
    },
    {
      id: '6',
      question: 'Can I delete my account?',
      answer: 'Yes, you can delete your account in Privacy & Security settings. This action cannot be undone and will permanently delete all your data.',
    },
  ];

  const supportChannels = [
    {
      id: '1',
      title: 'Email Support',
      description: 'support@aquatab.com',
      icon: 'mail-outline',
      action: () => Linking.openURL('mailto:support@aquatab.com'),
    },
    {
      id: '2',
      title: 'Call Us',
      description: '+1 (555) 123-4567',
      icon: 'call-outline',
      action: () => Linking.openURL('tel:+15551234567'),
    },
    {
      id: '3',
      title: 'Live Chat',
      description: 'Chat with our team (9 AM - 6 PM EST)',
      icon: 'chatbubbles-outline',
      action: () => Alert.alert('Live Chat', 'Our support team is online now!'),
    },
    {
      id: '4',
      title: 'FAQ',
      description: 'Browse common questions',
      icon: 'help-circle-outline',
      action: () => setExpandedFAQ(expandedFAQ ? null : '1'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: insets.top || 12 }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Help & Support</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.content}>
          {/* Quick Support */}
          <Text style={styles.sectionTitle}>Quick Support</Text>
          {supportChannels.map((channel) => (
            <TouchableOpacity key={channel.id} style={styles.supportCard} onPress={channel.action}>
              <View style={styles.supportIcon}>
                <Ionicons name={channel.icon as any} size={24} color="#1E3A8A" />
              </View>
              <View style={styles.supportContent}>
                <Text style={styles.supportTitle}>{channel.title}</Text>
                <Text style={styles.supportDescription}>{channel.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}

          {/* FAQ Section */}
          <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Frequently Asked Questions</Text>
          {faqItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.faqItem}
              onPress={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Ionicons
                  name={expandedFAQ === item.id ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#1E3A8A"
                />
              </View>
              {expandedFAQ === item.id && (
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              )}
            </TouchableOpacity>
          ))}

          {/* Info Cards */}
          <View style={styles.infoCard}>
            <Ionicons name="document-text-outline" size={24} color="#1E3A8A" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Privacy Policy</Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://aquatab.com/privacy')}>
                <Text style={styles.infoLink}>Read our privacy policy</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#1E3A8A" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Terms of Service</Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://aquatab.com/terms')}>
                <Text style={styles.infoLink}>Read our terms of service</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.versionCard}>
            <Text style={styles.versionText}>App Version 1.0.0</Text>
            <Text style={styles.buildText}>Build 001</Text>
          </View>
        </View>
      </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  spacer: {
    width: 24,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  supportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  supportDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  faqItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  infoLink: {
    fontSize: 13,
    color: '#1E3A8A',
    textDecorationLine: 'underline',
  },
  versionCard: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  buildText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
