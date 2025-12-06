import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname, useLocalSearchParams } from 'expo-router';

interface BottomNavigationProps {
  currentRoute?: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentRoute }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { token } = useLocalSearchParams();
  
  // Determine active tab based on current route
  const getActiveTab = () => {
    if (currentRoute) return currentRoute;
    
    if (pathname.includes('/home')) return 'home';
    if (pathname.includes('/components/pages/hydration')) return 'hydration';
    if (pathname.includes('/components/pages/medication')) return 'medication';
    if (pathname.includes('/components/pages/notification')) return 'notification';
    if (pathname.includes('/components/pages/profile')) return 'profile';
    if (pathname.includes('/components/pages/settings')) return 'settings';
    return 'home';
  };

  const activeTab = getActiveTab();

  const navigationItems = [
    { 
      key: 'home', 
      icon: 'home', 
      label: 'Home',
      route: '/home'
    },
    { 
      key: 'hydration', 
      icon: 'water', 
      label: 'Hydration',
      route: '/components/pages/hydration/Hydration'
    },
    { 
      key: 'medication', 
      icon: 'medical', 
      label: 'Medication',
      route: '/components/pages/medication/Medication'
    },
    { 
      key: 'notification', 
      icon: 'notifications', 
      label: 'Activity',
      route: '/components/pages/notification/Notification'
    },
    { 
      key: 'profile', 
      icon: 'person', 
      label: 'Profile',
      route: '/components/pages/profile/Profile'
    },
  ];

  const handleNavigation = (item: typeof navigationItems[0]) => {
    try {
      console.log('BottomNavigation: token=', token);
      console.log('BottomNavigation: navigating to', item.route);
      if (item.key === 'home') {
        router.push({ pathname: item.route, params: { token } } as any);
      } else {
        router.push({ pathname: item.route, params: { token } } as any);
      }
    } catch (error) {
      console.log('Navigation error:', error);
    }
  };

  return (
    // allow touches to pass through areas not occupied by the nav (helpful for overlapping layouts)
    <View style={styles.bottomNav} pointerEvents="box-none">
      {navigationItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[styles.navItem, activeTab === item.key && styles.activeNavItem]}
          onPress={() => handleNavigation(item)}
        >
          <Ionicons
            name={item.icon as any}
            size={20}
            color={activeTab === item.key ? '#1E3A8A' : '#9CA3AF'}
          />
          <Text style={[
            styles.navLabel,
            activeTab === item.key && styles.activeNavLabel
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  activeNavItem: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
  },
  navLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '500',
  },
  activeNavLabel: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
});

export default BottomNavigation;
