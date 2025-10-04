import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNavigation from '../../navigation/BottomNavigation';

export default function Timeline() {
  const router = useRouter();

  const timelineData = [
    {
      id: 1,
      time: '8:00 AM',
      title: 'Morning Medication',
      description: 'Take vitamin D supplement',
      status: 'completed',
      icon: 'medical'
    },
    {
      id: 2,
      time: '8:30 AM',
      title: 'Water Reminder',
      description: 'Drink 250ml of water',
      status: 'completed',
      icon: 'water'
    },
    {
      id: 3,
      time: '10:30 AM',
      title: 'Medicine Dose',
      description: 'Blood pressure medication',
      status: 'upcoming',
      icon: 'medical'
    },
    {
      id: 4,
      time: '12:00 PM',
      title: 'Hydration Check',
      description: 'Check daily water intake progress',
      status: 'skipped',
      icon: 'water'
    },
    {
      id: 5,
      time: '2:00 PM',
      title: 'Afternoon Reminder',
      description: 'Take calcium supplement',
      status: 'pending',
      icon: 'alarm'
    },
    {
      id: 6,
      time: '6:00 PM',
      title: 'Evening Medication',
      description: 'Take prescribed medication',
      status: 'pending',
      icon: 'medical'
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'upcoming':
        return 'time';
      case 'skipped':
        return 'close-circle';
      case 'pending':
        return 'ellipse-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'upcoming':
        return '#F59E0B';
      case 'skipped':
        return '#EF4444';
      case 'pending':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed ✅';
      case 'upcoming':
        return 'Upcoming ⏳';
      case 'skipped':
        return 'Skipped ❌';
      case 'pending':
        return 'Pending ⏰';
      default:
        return 'Pending';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Today&apos;s Timeline</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Date Header */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>Today, October 4, 2025</Text>
          <Text style={styles.progressText}>4 of 6 activities completed</Text>
        </View>

        {/* Timeline Items */}
        <View style={styles.timelineContainer}>
          {timelineData.map((item, index) => (
            <View key={item.id} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <Text style={styles.timeText}>{item.time}</Text>
                <View style={styles.timelineLine}>
                  <View style={[styles.timelineDot, { backgroundColor: getStatusColor(item.status) }]} />
                  {index < timelineData.length - 1 && <View style={styles.connector} />}
                </View>
              </View>
              
              <TouchableOpacity style={styles.timelineCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}>
                    <Ionicons name={item.icon as any} size={20} color="#1E3A8A" />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDescription}>{item.description}</Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <Ionicons 
                      name={getStatusIcon(item.status) as any} 
                      size={20} 
                      color={getStatusColor(item.status)} 
                    />
                  </View>
                </View>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {getStatusText(item.status)}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNavigation currentRoute="timeline" />
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
    paddingBottom: 16,
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
  dateHeader: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
  },
  timelineContainer: {
    paddingBottom: 100,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
    width: 60,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  timelineLine: {
    alignItems: 'center',
    flex: 1,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  connector: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 8,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusContainer: {
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
