import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from './api';

const { width, height } = Dimensions.get('window');

interface OnboardingData {
  nickname?: string;
  first_medication_time?: string;
  end_of_day_time?: string;
  wake_up_time?: string;
  breakfast_time?: string;
  lunch_time?: string;
  dinner_time?: string;
  climate?: 'hot' | 'temperate' | 'cold';
  exercise_frequency?: 'rarely' | 'sometimes' | 'regularly' | 'often';
  weight?: number;
  weight_unit?: 'kg' | 'lbs';
  age?: number;
  reminder_tone?: string;
  notification_permissions_accepted?: boolean;
  battery_optimization_set?: boolean;
}

export default function Onboarding() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = params.token as string;
  const userName = params.name as string || 'User';

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({});
  const [loading, setLoading] = useState(false);

  const steps = [
    'nickname',
    'welcome',
    'profile',
    'medication-time',
    'wake-up',
    'end-of-day',
    'meal-times',
    'climate',
    'exercise',
    'weight',
    'age',
    'reminder-tone',
    'notifications',
    'complete'
  ];

  const updateData = (key: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = async () => {
    if (currentStep < steps.length - 1) {
      // Save data to backend on certain steps
      if (['nickname', 'profile', 'medication-time', 'wake-up', 'end-of-day', 'meal-times', 'climate', 'exercise', 'weight', 'age'].includes(steps[currentStep])) {
        try {
          await api.put('/onboarding/update', data, token);
        } catch (err) {
          console.log('Error saving onboarding data:', err);
        }
      }
      setCurrentStep(currentStep + 1);
    } else {
      await completeOnboarding();
    }
  };

  const skipStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    try {
      setLoading(true);
      // Save any remaining data first
      if (Object.keys(data).length > 0) {
        try {
          await api.put('/onboarding/update', data, token);
        } catch (updateErr) {
          console.log('Error updating onboarding data:', updateErr);
          // Continue even if update fails
        }
      }
      // Mark onboarding as complete
      await api.post('/onboarding/complete', {}, token);
      router.replace({ pathname: '/home', params: { token } } as any);
    } catch (err: any) {
      console.log('Error completing onboarding:', err);
      const message = err?.data?.message || err?.data || err?.message || 'Failed to complete onboarding';
      Alert.alert('Error', typeof message === 'string' ? message : JSON.stringify(message));
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (steps[currentStep]) {
      case 'nickname':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <Text style={styles.emoji}>☀️</Text>
            </View>
            <Text style={styles.title}>To start with, what should we call you?</Text>
            <TextInput
              style={styles.input}
              placeholder="Nickname"
              placeholderTextColor="#8E8E93"
              value={data.nickname || ''}
              onChangeText={(text) => updateData('nickname', text)}
              autoFocus
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={skipStep} style={styles.skipButton}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={nextStep} style={styles.nextButton}>
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'welcome':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <Text style={styles.emoji}>🌱</Text>
            </View>
            <Text style={styles.title}>Nice to Meet You, {data.nickname || userName}</Text>
            <Text style={styles.description}>
              We're here to support you on your health journey. Now let's quickly personalize the app for you.
            </Text>
            <TouchableOpacity onPress={nextStep} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Let's go</Text>
            </TouchableOpacity>
          </View>
        );

      case 'profile':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Hi, {data.nickname || userName}! Tell us more about you</Text>
            <Text style={styles.description}>
              We ask you this to give you personalized tips for your health and well-being.
            </Text>
            
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Gender</Text>
              <View style={styles.optionsRow}>
                {['Male', 'Female', 'Other'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.optionButton, data.gender?.toLowerCase() === option.toLowerCase() && styles.optionButtonSelected]}
                    onPress={() => updateData('gender', option.toLowerCase())}
                  >
                    <Text style={[styles.optionText, data.gender?.toLowerCase() === option.toLowerCase() && styles.optionTextSelected]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Year of birth</Text>
              <TextInput
                style={styles.input}
                placeholder="2001"
                placeholderTextColor="#8E8E93"
                keyboardType="numeric"
                value={data.age ? (new Date().getFullYear() - data.age).toString() : ''}
                onChangeText={(text) => {
                  const year = parseInt(text);
                  if (year && year > 1900 && year <= new Date().getFullYear()) {
                    updateData('age', new Date().getFullYear() - year);
                  }
                }}
              />
            </View>

            <TouchableOpacity onPress={nextStep} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        );

      case 'medication-time':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>What time do you usually take your first medication?</Text>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Time</Text>
              <TextInput
                style={styles.input}
                placeholder="8:00 AM"
                placeholderTextColor="#8E8E93"
                value={data.first_medication_time || ''}
                onChangeText={(text) => updateData('first_medication_time', text)}
              />
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={skipStep} style={styles.skipButton}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={nextStep} style={styles.nextButton}>
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'wake-up':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Getting hydrated <Text style={styles.highlight}>right after</Text> waking up will give you energy in the morning!
              </Text>
            </View>
            <Text style={styles.title}>When do you usually wake up?</Text>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Time</Text>
              <TextInput
                style={styles.input}
                placeholder="8:00 AM"
                placeholderTextColor="#8E8E93"
                value={data.wake_up_time || ''}
                onChangeText={(text) => updateData('wake_up_time', text)}
              />
            </View>
            <TouchableOpacity onPress={nextStep} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        );

      case 'end-of-day':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Drinking water <Text style={styles.highlight}>1 hour before</Text> sleep will keep you hydrated during your sweet dream
              </Text>
            </View>
            <Text style={styles.title}>When do you usually end a day?</Text>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Time</Text>
              <TextInput
                style={styles.input}
                placeholder="11:00 PM"
                placeholderTextColor="#8E8E93"
                value={data.end_of_day_time || ''}
                onChangeText={(text) => updateData('end_of_day_time', text)}
              />
            </View>
            <TouchableOpacity onPress={nextStep} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        );

      case 'meal-times':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                We'll remind you to drink <Text style={styles.highlight}>1 hour before</Text> and <Text style={styles.highlight}>1 hour after</Text> meals for better digestion
              </Text>
            </View>
            <Text style={styles.title}>What's your usual meal time?</Text>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Breakfast</Text>
              <TextInput
                style={styles.input}
                placeholder="8:30 AM"
                placeholderTextColor="#8E8E93"
                value={data.breakfast_time || ''}
                onChangeText={(text) => updateData('breakfast_time', text)}
              />
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Lunch</Text>
              <TextInput
                style={styles.input}
                placeholder="12:00 PM"
                placeholderTextColor="#8E8E93"
                value={data.lunch_time || ''}
                onChangeText={(text) => updateData('lunch_time', text)}
              />
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Dinner</Text>
              <TextInput
                style={styles.input}
                placeholder="7:00 PM"
                placeholderTextColor="#8E8E93"
                value={data.dinner_time || ''}
                onChangeText={(text) => updateData('dinner_time', text)}
              />
            </View>
            <TouchableOpacity onPress={nextStep} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        );

      case 'climate':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                The hotter the climate, the more water you need to consume per day
              </Text>
            </View>
            <Text style={styles.title}>What's the weather in your country now?</Text>
            <View style={styles.optionsContainer}>
              {[
                { value: 'hot', label: 'Hot', icon: '☀️' },
                { value: 'temperate', label: 'Temperate', icon: '🍃' },
                { value: 'cold', label: 'Cold', icon: '❄️' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.climateOption, data.climate === option.value && styles.climateOptionSelected]}
                  onPress={() => updateData('climate', option.value as any)}
                >
                  <Text style={styles.climateIcon}>{option.icon}</Text>
                  <Text style={[styles.climateText, data.climate === option.value && styles.climateTextSelected]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={nextStep} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        );

      case 'exercise':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                The daily water intake needs of people with <Text style={styles.highlight}>different exercise</Text> amount vary
              </Text>
            </View>
            <Text style={styles.title}>How much exercise do you do each week?</Text>
            {[
              { value: 'rarely', label: 'Rarely exercise' },
              { value: 'sometimes', label: 'Sometimes exercise' },
              { value: 'regularly', label: 'Regularly exercise' },
              { value: 'often', label: 'Often exercise' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.exerciseOption, data.exercise_frequency === option.value && styles.exerciseOptionSelected]}
                onPress={() => updateData('exercise_frequency', option.value as any)}
              >
                <Text style={[styles.exerciseText, data.exercise_frequency === option.value && styles.exerciseTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={nextStep} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        );

      case 'weight':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                The daily water intake for people of <Text style={styles.highlight}>different weights</Text> varies greatly
              </Text>
            </View>
            <Text style={styles.title}>How much do you weigh?</Text>
            <View style={styles.fieldRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="60"
                placeholderTextColor="#8E8E93"
                keyboardType="numeric"
                value={data.weight?.toString() || ''}
                onChangeText={(text) => updateData('weight', parseFloat(text) || 0)}
              />
              <View style={styles.unitSelector}>
                {['kg', 'lbs'].map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[styles.unitButton, data.weight_unit === unit && styles.unitButtonSelected]}
                    onPress={() => updateData('weight_unit', unit)}
                  >
                    <Text style={[styles.unitText, data.weight_unit === unit && styles.unitTextSelected]}>{unit}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity onPress={nextStep} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        );

      case 'age':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                The daily water intake needs of people of <Text style={styles.highlight}>different ages</Text> vary
              </Text>
            </View>
            <Text style={styles.title}>Choose your age</Text>
            <View style={styles.fieldRow}>
              <TextInput
                style={styles.input}
                placeholder="21"
                placeholderTextColor="#8E8E93"
                keyboardType="numeric"
                value={data.age?.toString() || ''}
                onChangeText={(text) => updateData('age', parseInt(text) || 0)}
              />
            </View>
            <TouchableOpacity onPress={nextStep} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        );

      case 'reminder-tone':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Pick your reminder tone</Text>
            <Text style={styles.description}>For what matters most, choose a sound you won't ignore.</Text>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Sound</Text>
              <View style={styles.input}>
                <Text style={{ color: '#1F2937' }}>MyTherapy (standard)</Text>
              </View>
            </View>
            <Text style={styles.hintText}>You can always change this later</Text>
            <TouchableOpacity onPress={nextStep} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        );

      case 'notifications':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Never miss a dose!</Text>
            <Text style={styles.description}>Let's make sure you get reminders exactly when you need them.</Text>
            <TouchableOpacity 
              onPress={() => {
                updateData('notification_permissions_accepted', true);
                nextStep();
              }} 
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Allow notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={skipStep} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>No thanks, I'll take the risk</Text>
            </TouchableOpacity>
          </View>
        );

      case 'complete':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <Text style={styles.emoji}>✅</Text>
            </View>
            <Text style={styles.title}>Your profile is created!</Text>
            <Text style={styles.description}>You've taken the first step towards a healthier you!</Text>
            <TouchableOpacity onPress={completeOnboarding} style={styles.primaryButton} disabled={loading}>
              <Text style={styles.primaryButtonText}>{loading ? 'Loading...' : 'Continue'}</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {currentStep > 0 && currentStep < steps.length - 1 && (
        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentStep(Math.max(0, currentStep - 1))}>
          <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>
      )}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {renderStep()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 80,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    minHeight: height * 0.7,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  emoji: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    color: '#1F2937',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fieldRow: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 8,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  skipButton: {
    padding: 16,
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
  infoBox: {
    backgroundColor: '#EBF8FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#1E3A8A',
  },
  infoText: {
    color: '#1F2937',
    fontSize: 14,
    lineHeight: 20,
  },
  highlight: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  optionButtonSelected: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  optionText: {
    color: '#6B7280',
    fontSize: 14,
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  climateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  climateOptionSelected: {
    borderColor: '#1E3A8A',
    backgroundColor: '#EBF8FF',
  },
  climateIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  climateText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '500',
  },
  climateTextSelected: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
  exerciseOption: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  exerciseOptionSelected: {
    backgroundColor: '#EBF8FF',
    borderColor: '#1E3A8A',
  },
  exerciseText: {
    color: '#1F2937',
    fontSize: 16,
  },
  exerciseTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  unitSelector: {
    flexDirection: 'row',
    marginLeft: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  unitButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  unitButtonSelected: {
    backgroundColor: '#1E3A8A',
  },
  unitText: {
    color: '#6B7280',
    fontSize: 14,
  },
  unitTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  hintText: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});

