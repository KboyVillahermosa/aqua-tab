import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNavigation from '../../navigation/BottomNavigation';

const { width } = Dimensions.get('window');

export default function Categories() {
  const router = useRouter();

  const categories = [
    { 
      id: 1, 
      title: 'Medication', 
      icon: 'medical', 
      color: '#1E3A8A',
      description: 'Manage your medications'
    },
    { 
      id: 2, 
      title: 'Hydration', 
      icon: 'water', 
      color: '#0EA5E9',
      description: 'Track water intake'
    },
    { 
      id: 3, 
      title: 'Reminder', 
      icon: 'alarm', 
      color: '#F59E0B',
      description: 'Set health reminders'
    },
    { 
      id: 4, 
      title: 'History', 
      icon: 'time', 
      color: '#10B981',
      description: 'View your health history'
    },
    { 
      id: 5, 
      title: 'Appointments', 
      icon: 'calendar', 
      color: '#8B5CF6',
      description: 'Schedule appointments'
    },
    { 
      id: 6, 
      title: 'Reports', 
      icon: 'analytics', 
      color: '#EF4444',
      description: 'Health reports & insights'
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Categories</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Categories Grid */}
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity key={category.id} style={styles.categoryCard}>
              <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
                <Ionicons name={category.icon as any} size={32} color="white" />
              </View>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <BottomNavigation currentRoute="categories" />
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
  placeholder: {
    width: 40,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  categoryCard: {
    width: (width - 52) / 2,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});
