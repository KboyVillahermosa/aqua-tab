import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BottomNavigation from '../../navigation/BottomNavigation';

interface User {
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  bloodType?: string;
  allergies?: string;
  emergencyContact?: string;
}

export default function Profile() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Profile: token=', token);
    
    const fetchUserData = async () => {
      try {
        console.log('Profile: Making API call with token:', token);
        const response = await fetch('https://pseudohexagonal-minna-unobsolete.ngrok-free.dev/api/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('Profile: Response status:', response.status);
        
        if (response.ok) {
          const userData = await response.json();
          console.log('Profile: User data received:', userData);
          setUser({
            name: userData.name,
            email: userData.email,
            phone: userData.phone || '+1 (555) 123-4567',
            dateOfBirth: userData.date_of_birth || 'January 15, 1990',
            bloodType: userData.blood_type || 'O+',
            allergies: userData.allergies || 'Penicillin, Peanuts',
            emergencyContact: userData.emergency_contact || 'Jane Doe - (555) 987-6543'
          });
        } else {
          const errorData = await response.text();
          console.log('Profile: Error response:', errorData);
          Alert.alert('Error', 'Failed to fetch user data');
        }
      } catch (error) {
        console.error('Profile: Error fetching user data:', error);
        Alert.alert('Error', 'Network error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchUserData();
    }
  }, [token]);

  const profileOptions = [
    {
      id: 1,
      title: 'Personal Information',
      subtitle: 'View your profile details',
      icon: 'person-outline',
      action: () => router.push({ pathname: '/components/pages/profile/ProfileDetails', params: { token } } as any)
    },
    {
      id: 2,
      title: 'Medical History',
      subtitle: 'View and update medical records',
      icon: 'medical-outline',
      action: () => console.log('Medical history')
    },
    {
      id: 3,
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      icon: 'notifications-outline',
      action: () => console.log('Notifications')
    },
    {
      id: 4,
      title: 'Privacy & Security',
      subtitle: 'Security settings and privacy',
      icon: 'shield-outline',
      action: () => console.log('Privacy settings')
    },
    {
      id: 5,
      title: 'Premium Subscription',
      subtitle: 'Unlock more features',
      icon: 'star-outline',
      action: () => router.push({ pathname: '/components/pages/subscription/Subscription', params: { token } } as any)
    },
    {
      id: 6,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-circle-outline',
      action: () => console.log('Help & support')
    },
  ];

  const retryFetch = () => {
    setLoading(true);
    setUser(null);
    // Trigger useEffect by updating a state that doesn't affect the token dependency
    setTimeout(() => {
      if (token) {
        // This will trigger the useEffect again
        setLoading(true);
      }
    }, 100);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load user data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={retryFetch}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create-outline" size={20} color="#1E3A8A" />
          </TouchableOpacity>
        </View>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        {/* Quick Info Cards */}
        <View style={styles.quickInfoContainer}>
          <View style={styles.infoCard}>
            <Ionicons name="call-outline" size={20} color="#1E3A8A" />
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{user.phone || 'Not set'}</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Ionicons name="calendar-outline" size={20} color="#1E3A8A" />
            <Text style={styles.infoLabel}>Date of Birth</Text>
            <Text style={styles.infoValue}>{user.dateOfBirth || 'Not set'}</Text>
          </View>
        </View>

        {/* Onboarding Data Preview */}
        <TouchableOpacity 
          style={styles.onboardingCard}
          onPress={() => router.push({ pathname: '/components/pages/profile/ProfileDetails', params: { token } } as any)}
        >
          <View style={styles.onboardingHeader}>
            <Ionicons name="information-circle-outline" size={24} color="#1E3A8A" />
            <Text style={styles.onboardingTitle}>View Complete Profile Details</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </View>
          <Text style={styles.onboardingSubtitle}>
            See all your health information, daily routine, and app settings
          </Text>
        </TouchableOpacity>

        {/* Profile Options */}
        <View style={styles.optionsContainer}>
          {profileOptions.map((option) => (
            <TouchableOpacity key={option.id} style={styles.optionItem} onPress={option.action}>
              <View style={styles.optionIcon}>
                <Ionicons name={option.icon as any} size={24} color="#1E3A8A" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Emergency Contact */}
        <View style={styles.emergencyContainer}>
          <Text style={styles.emergencyTitle}>Emergency Contact</Text>
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyIcon}>
              <Ionicons name="call" size={20} color="#EF4444" />
            </View>
            <View style={styles.emergencyContent}>
              <Text style={styles.emergencyName}>Emergency Contact</Text>
              <Text style={styles.emergencyDetails}>{user.emergencyContact}</Text>
            </View>
            <TouchableOpacity style={styles.callButton}>
              <Ionicons name="call" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={async () => {
            try {
              await fetch('http://10.0.2.2:8000/api/logout', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
              });
            } catch (err) {
              console.log('Logout error:', err);
            }
            router.replace({ pathname: '/login' } as any);
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavigation currentRoute="profile" />
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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
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
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  editButton: {
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
    elevation: 3,
  },
  profileHeader: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 28,
    fontWeight: '600',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
  },
  quickInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  optionsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  emergencyContainer: {
    marginBottom: 24,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  emergencyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emergencyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  emergencyDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 100,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  onboardingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#1E3A8A',
  },
  onboardingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  onboardingTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
  },
  onboardingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 36,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
