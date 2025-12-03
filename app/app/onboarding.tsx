import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, TextInput, Alert, Platform, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as api from './api';

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
  gender?: string;
  year_of_birth?: number;
  reminder_tone?: string;
  notification_permissions_accepted?: boolean;
  battery_optimization_set?: boolean;
  emergency_contact?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

// Reminder tone options
// Note: Sound files should be added to app/assets/sounds/ directory
// For now, using system notification sounds as fallback
const REMINDER_TONES = [
  { id: 'default', name: 'Default', sound: null },
  { id: 'gentle', name: 'Gentle Chime', sound: null },
  { id: 'classic', name: 'Classic Bell', sound: null },
  { id: 'modern', name: 'Modern Alert', sound: null },
  { id: 'soft', name: 'Soft Tone', sound: null },
];

export default function Onboarding() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = params.token as string;
  const userName = params.name as string || 'User';

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({});
  const [loading, setLoading] = useState(false);
  
  // Time picker states
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerField, setTimePickerField] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState<Date>(new Date());
  
  // Year and age picker states
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showAgePicker, setShowAgePicker] = useState(false);
  const [showWeightPicker, setShowWeightPicker] = useState(false);
  
  // Audio state
  const [playingTone, setPlayingTone] = useState<string | null>(null);

  const steps = [
    'nickname',
    'welcome',
    'profile',
    'emergency-contact',
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

  // Generate arrays for pickers
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
  const ages = Array.from({ length: 120 }, (_, i) => i + 1);
  const weights = Array.from({ length: 200 }, (_, i) => i + 20); // 20-219

  // Load saved data on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        if (token) {
          const saved = await api.get('/onboarding', token);
          if (saved && typeof saved === 'object') {
            // Merge saved data with current data, preserving any existing values
            setData(prev => ({ ...prev, ...saved }));
          }
        }
      } catch (err) {
        // Endpoint might not exist yet, which is fine
        console.log('Note: Could not load saved onboarding data (this is normal if starting fresh):', err);
      }
    };
    loadSavedData();
  }, [token]);

  const updateData = (key: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const convertTo24HourFormat = (timeString?: string): string => {
    if (!timeString) return '';
    try {
      const [time, period] = timeString.split(' ');
      if (!period) return timeString; // Already 24-hour format
      
      const [hours, minutes] = time.split(':');
      let hour = parseInt(hours);
      
      if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12;
      if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;
      
      return `${hour.toString().padStart(2, '0')}:${minutes}`;
    } catch {
      return timeString;
    }
  };

  const formatTime = (timeString?: string): string => {
    if (!timeString) return '';
    try {
      // Handle both "HH:MM" and "HH:MM AM/PM" formats
      const [time, period] = timeString.split(' ');
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const min = minutes || '00';
      
      if (period) {
        // Already in 12-hour format
        return timeString;
      } else {
        // Convert 24-hour to 12-hour
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        return `${hour12}:${min.padStart(2, '0')} ${ampm}`;
      }
    } catch {
      return timeString;
    }
  };

  const parseTimeToDate = (timeString?: string): Date => {
    if (!timeString) {
      return new Date();
    }
    try {
      const [time, period] = timeString.split(' ');
      const [hours, minutes] = time.split(':');
      let hour = parseInt(hours);
      const min = parseInt(minutes || '0');
      
      if (period) {
        // 12-hour format
        if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12;
        if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;
      }
      
      const date = new Date();
      date.setHours(hour, min, 0, 0);
      return date;
    } catch {
      return new Date();
    }
  };

  const openTimePicker = (field: string) => {
    const currentTime = parseTimeToDate(data[field as keyof OnboardingData] as string);
    setTempTime(currentTime);
    setTimePickerField(field);
    setShowTimePicker(true);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedTime && timePickerField) {
      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();
      const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const timeString = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      updateData(timePickerField as keyof OnboardingData, timeString);
      setTempTime(selectedTime);
    }
    
    if (Platform.OS === 'ios') {
      if (event.type === 'dismissed') {
        setShowTimePicker(false);
      }
    }
  };

  const confirmTimePicker = () => {
    if (timePickerField && tempTime) {
      const hours = tempTime.getHours();
      const minutes = tempTime.getMinutes();
      const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const timeString = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      updateData(timePickerField as keyof OnboardingData, timeString);
    }
    setShowTimePicker(false);
    setTimePickerField(null);
  };

  const playTone = async (toneId: string) => {
    try {
      const tone = REMINDER_TONES.find(t => t.id === toneId);
      if (!tone) {
        return;
      }

      setPlayingTone(toneId);

      // For preview, we'll use a simple visual feedback
      // In production, you would add actual sound files and use expo-audio
      // Sound files would go to app/assets/sounds/ directory
      setTimeout(() => {
        setPlayingTone(null);
      }, 1000);
    } catch (error) {
      console.log('Error playing tone:', error);
      setPlayingTone(null);
    }
  };

  const stopTone = async () => {
    setPlayingTone(null);
  };

  const nextStep = async () => {
    if (currentStep < steps.length - 1) {
      // Save data to backend on certain steps
      if (['nickname', 'profile', 'emergency-contact', 'medication-time', 'wake-up', 'end-of-day', 'meal-times', 'climate', 'exercise', 'weight', 'age', 'reminder-tone'].includes(steps[currentStep])) {
        try {
          // Convert time fields to 24-hour format for backend
          const dataToSend = { ...data };
          const timeFields: (keyof OnboardingData)[] = [
            'first_medication_time',
            'end_of_day_time',
            'wake_up_time',
            'breakfast_time',
            'lunch_time',
            'dinner_time',
          ];
          
          timeFields.forEach(field => {
            if (dataToSend[field]) {
              dataToSend[field] = convertTo24HourFormat(dataToSend[field] as string) as any;
            }
          });
          
          await api.put('/onboarding/update', dataToSend, token);
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
          // Convert time fields to 24-hour format for backend
          const dataToSend = { ...data };
          const timeFields: (keyof OnboardingData)[] = [
            'first_medication_time',
            'end_of_day_time',
            'wake_up_time',
            'breakfast_time',
            'lunch_time',
            'dinner_time',
          ];
          
          timeFields.forEach(field => {
            if (dataToSend[field]) {
              dataToSend[field] = convertTo24HourFormat(dataToSend[field] as string) as any;
            }
          });
          
          await api.put('/onboarding/update', dataToSend, token);
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
              <TouchableOpacity onPress={() => setShowYearPicker(true)} style={styles.pickerButton}>
                <Text style={[styles.pickerButtonText, !data.year_of_birth && styles.pickerPlaceholder]}>
                  {data.year_of_birth || 'Select year'}
                </Text>
                <Ionicons name="chevron-down-outline" size={20} color="#6B7280" />
              </TouchableOpacity>
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

      case 'emergency-contact':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <Text style={styles.emoji}>🆘</Text>
            </View>
            <Text style={styles.title}>Emergency Contact</Text>
            <Text style={styles.description}>
              In case of emergency, who should we contact?
            </Text>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#8E8E93"
                value={data.emergency_contact_name || ''}
                onChangeText={(text) => updateData('emergency_contact_name', text)}
                autoFocus
              />
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+63 912 345 6789"
                placeholderTextColor="#8E8E93"
                keyboardType="phone-pad"
                value={data.emergency_contact_phone || ''}
                onChangeText={(text) => updateData('emergency_contact_phone', text)}
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

      case 'medication-time':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>What time do you usually take your first medication?</Text>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Time</Text>
              <TouchableOpacity onPress={() => openTimePicker('first_medication_time')} style={styles.timeInputButton}>
                <Text style={[styles.timeInputText, !data.first_medication_time && styles.timeInputPlaceholder]}>
                  {data.first_medication_time ? formatTime(data.first_medication_time) : '8:00 AM'}
                </Text>
                <Ionicons name="time-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
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
              <TouchableOpacity onPress={() => openTimePicker('wake_up_time')} style={styles.timeInputButton}>
                <Text style={[styles.timeInputText, !data.wake_up_time && styles.timeInputPlaceholder]}>
                  {data.wake_up_time ? formatTime(data.wake_up_time) : '8:00 AM'}
                </Text>
                <Ionicons name="time-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
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
              <TouchableOpacity onPress={() => openTimePicker('end_of_day_time')} style={styles.timeInputButton}>
                <Text style={[styles.timeInputText, !data.end_of_day_time && styles.timeInputPlaceholder]}>
                  {data.end_of_day_time ? formatTime(data.end_of_day_time) : '11:00 PM'}
                </Text>
                <Ionicons name="time-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
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
              <TouchableOpacity onPress={() => openTimePicker('breakfast_time')} style={styles.timeInputButton}>
                <Text style={[styles.timeInputText, !data.breakfast_time && styles.timeInputPlaceholder]}>
                  {data.breakfast_time ? formatTime(data.breakfast_time) : '8:30 AM'}
                </Text>
                <Ionicons name="time-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Lunch</Text>
              <TouchableOpacity onPress={() => openTimePicker('lunch_time')} style={styles.timeInputButton}>
                <Text style={[styles.timeInputText, !data.lunch_time && styles.timeInputPlaceholder]}>
                  {data.lunch_time ? formatTime(data.lunch_time) : '12:00 PM'}
                </Text>
                <Ionicons name="time-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Dinner</Text>
              <TouchableOpacity onPress={() => openTimePicker('dinner_time')} style={styles.timeInputButton}>
                <Text style={[styles.timeInputText, !data.dinner_time && styles.timeInputPlaceholder]}>
                  {data.dinner_time ? formatTime(data.dinner_time) : '7:00 PM'}
                </Text>
                <Ionicons name="time-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
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
              <TouchableOpacity 
                onPress={() => {
                  // Set default unit to kg if not set
                  if (!data.weight_unit) {
                    updateData('weight_unit', 'kg');
                  }
                  setShowWeightPicker(true);
                }} 
                style={[styles.pickerButton, { flex: 1 }]}
              >
                <Text style={[styles.pickerButtonText, !data.weight && styles.pickerPlaceholder]}>
                  {data.weight || 'Select weight'}
                </Text>
                <Ionicons name="chevron-down-outline" size={20} color="#6B7280" />
              </TouchableOpacity>
              <View style={styles.unitSelector}>
                {['kg', 'lbs'].map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[styles.unitButton, (data.weight_unit === unit || (!data.weight_unit && unit === 'kg')) && styles.unitButtonSelected]}
                    onPress={() => updateData('weight_unit', unit)}
                  >
                    <Text style={[styles.unitText, (data.weight_unit === unit || (!data.weight_unit && unit === 'kg')) && styles.unitTextSelected]}>{unit}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
              <TouchableOpacity onPress={() => setShowAgePicker(true)} style={styles.pickerButton}>
                <Text style={[styles.pickerButtonText, !data.age && styles.pickerPlaceholder]}>
                  {data.age || 'Select age'}
                </Text>
                <Ionicons name="chevron-down-outline" size={20} color="#6B7280" />
              </TouchableOpacity>
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

      case 'reminder-tone':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Pick your reminder tone</Text>
            <Text style={styles.description}>For what matters most, choose a sound you won't ignore.</Text>
            
            <View style={styles.toneOptionsContainer}>
              {REMINDER_TONES.map((tone) => (
                <TouchableOpacity
                  key={tone.id}
                  style={[
                    styles.toneOption,
                    data.reminder_tone === tone.id && styles.toneOptionSelected,
                    playingTone === tone.id && styles.toneOptionPlaying
                  ]}
                  onPress={() => {
                    updateData('reminder_tone', tone.id);
                    playTone(tone.id);
                  }}
                >
                  <View style={styles.toneOptionContent}>
                    <Ionicons 
                      name={playingTone === tone.id ? "stop-circle" : "musical-notes"} 
                      size={24} 
                      color={data.reminder_tone === tone.id ? '#1E3A8A' : '#6B7280'} 
                    />
                    <Text style={[
                      styles.toneOptionText,
                      data.reminder_tone === tone.id && styles.toneOptionTextSelected
                    ]}>
                      {tone.name}
                    </Text>
                  </View>
                  {data.reminder_tone === tone.id && (
                    <Ionicons name="checkmark-circle" size={20} color="#1E3A8A" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            {playingTone && (
              <TouchableOpacity onPress={stopTone} style={styles.stopButton}>
                <Text style={styles.stopButtonText}>Stop Preview</Text>
              </TouchableOpacity>
            )}
            
            <Text style={styles.hintText}>Tap a tone to preview it. You can always change this later.</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={skipStep} style={styles.skipButton}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={nextStep} style={styles.nextButton}>
                <Text style={styles.nextButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
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

      {/* Time Picker Modal for iOS */}
      {Platform.OS === 'ios' && showTimePicker && (
        <Modal
          transparent
          animationType="slide"
          visible={showTimePicker}
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Time</Text>
                <TouchableOpacity onPress={confirmTimePicker}>
                  <Text style={styles.modalConfirm}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempTime}
                mode="time"
                is24Hour={false}
                display="spinner"
                onChange={handleTimeChange}
                themeVariant="light"
                accentColor="#1E3A8A"
                style={styles.dateTimePicker}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Time Picker for Android */}
      {Platform.OS === 'android' && showTimePicker && (
        <DateTimePicker
          value={tempTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {/* Year Picker Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={showYearPicker}
        onRequestClose={() => setShowYearPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowYearPicker(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Year</Text>
              <TouchableOpacity onPress={() => setShowYearPicker(false)}>
                <Text style={styles.modalConfirm}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerScrollView}>
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.pickerItem,
                    data.year_of_birth === year && styles.pickerItemSelected
                  ]}
                  onPress={() => {
                    updateData('year_of_birth', year);
                    setShowYearPicker(false);
                  }}
                >
                  <Text style={[
                    styles.pickerItemText,
                    data.year_of_birth === year && styles.pickerItemTextSelected
                  ]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Age Picker Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={showAgePicker}
        onRequestClose={() => setShowAgePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAgePicker(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Age</Text>
              <TouchableOpacity onPress={() => setShowAgePicker(false)}>
                <Text style={styles.modalConfirm}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerScrollView}>
              {ages.map((age) => (
                <TouchableOpacity
                  key={age}
                  style={[
                    styles.pickerItem,
                    data.age === age && styles.pickerItemSelected
                  ]}
                  onPress={() => {
                    updateData('age', age);
                    updateData('year_of_birth', new Date().getFullYear() - age);
                    setShowAgePicker(false);
                  }}
                >
                  <Text style={[
                    styles.pickerItemText,
                    data.age === age && styles.pickerItemTextSelected
                  ]}>
                    {age}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Weight Picker Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={showWeightPicker}
        onRequestClose={() => setShowWeightPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowWeightPicker(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Weight</Text>
              <TouchableOpacity onPress={() => setShowWeightPicker(false)}>
                <Text style={styles.modalConfirm}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerScrollView}>
              {weights.map((weight) => (
                <TouchableOpacity
                  key={weight}
                  style={[
                    styles.pickerItem,
                    data.weight === weight && styles.pickerItemSelected
                  ]}
                  onPress={() => {
                    updateData('weight', weight);
                    setShowWeightPicker(false);
                  }}
                >
                  <Text style={[
                    styles.pickerItemText,
                    data.weight === weight && styles.pickerItemTextSelected
                  ]}>
                    {weight}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  timeInputButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInputText: {
    color: '#1F2937',
    fontSize: 16,
  },
  timeInputPlaceholder: {
    color: '#8E8E93',
  },
  pickerButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    color: '#1F2937',
    fontSize: 16,
  },
  pickerPlaceholder: {
    color: '#8E8E93',
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
    color: '#1E3A8A',
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
  // Tone selection styles
  toneOptionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  toneOption: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toneOptionSelected: {
    borderColor: '#1E3A8A',
    backgroundColor: '#EBF8FF',
  },
  toneOptionPlaying: {
    borderColor: '#3B82F6',
    backgroundColor: '#DBEAFE',
  },
  toneOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toneOptionText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '500',
  },
  toneOptionTextSelected: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles for iOS time picker
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: height * 0.6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancel: {
    color: '#6B7280',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalConfirm: {
    color: '#1E3A8A',
    fontSize: 16,
    fontWeight: '600',
  },
  dateTimePicker: {
    height: 200,
  },
  // Picker modal styles
  pickerScrollView: {
    maxHeight: 300,
  },
  pickerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: '#EBF8FF',
  },
  pickerItemText: {
    fontSize: 18,
    color: '#1F2937',
  },
  pickerItemTextSelected: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
});
