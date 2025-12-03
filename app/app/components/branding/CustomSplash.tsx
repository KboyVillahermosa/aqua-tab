import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Animated,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';

type Props = {
  onFinish?: () => void;
  minimumMs?: number;
};

const onboardingScreens = [
  {
    key: '1',
    title: 'Hydration Tracking 💧',
    description: 'Track your daily water intake effortlessly.',
    bgDecor: 'water',
  },
  {
    key: '2',
    title: 'Medication Reminders 💊',
    description: 'Never miss a dose with smart notifications.',
    bgDecor: 'pills',
  },
  {
    key: '3',
    title: 'Personalized Dashboard 📊',
    description: 'Monitor your health progress and goals in one place.',
    bgDecor: 'dashboard',
  },
];

export default function SplashOnboarding({ onFinish, minimumMs = 5000 }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [dots, setDots] = useState('');
  const [activeDotIndex, setActiveDotIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [splashFinished, setSplashFinished] = useState(false);
  const { width, height } = Dimensions.get('window');
  const flatListRef = useRef<FlatList>(null);
  const getStartedScale = useRef(new Animated.Value(0)).current;
  const personOpacity = useRef(new Animated.Value(1)).current;
  const personTranslate = useRef(new Animated.Value(0)).current;

  const bg = useMemo(() => require('../../../assets/images/mainbg.png'), []);
  const logo = useMemo(() => require('../../../assets/images/mainlogo.png'), []);

  // Splash animation + dots
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Progress bar fill over splash duration
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: minimumMs,
      useNativeDriver: false,
    }).start();

    const dotInterval = setInterval(() => {
      setActiveDotIndex(prev => (prev + 1) % 5); // 5 dots total, cycle through
    }, 400);

    const finishTimeout = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setSplashFinished(true));
    }, minimumMs);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(finishTimeout);
    };
  }, [minimumMs]);
  // Auto-scroll onboarding screens every 5s
  useEffect(() => {
    if (splashFinished && flatListRef.current) {
      let index = 0;
      let isScrolling = true;
      const interval = setInterval(() => {
        if (!isScrolling) return;
        index += 1;
        if (index >= onboardingScreens.length) {
          isScrolling = false;
          clearInterval(interval);
          return;
        }
        try {
          flatListRef.current?.scrollToIndex({ index, animated: true });
        } catch (error) {
          // Handle scroll error gracefully
          isScrolling = false;
          clearInterval(interval);
        }
      }, 5000);
      return () => {
        isScrolling = false;
        clearInterval(interval);
      };
    }
  }, [splashFinished]);

  // Animate "Get Started" appearance when onboarding shows
  useEffect(() => {
    if (splashFinished) {
      Animated.spring(getStartedScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
        tension: 120,
      }).start();
    }
  }, [splashFinished, getStartedScale]);

  const onGetStarted = () => {
    // Animate the person (last screen visual) to fade and move up
    Animated.parallel([
      Animated.timing(personOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(personTranslate, { toValue: -20, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      onFinish && onFinish();
    });
  };

  // Splash
  if (!splashFinished) {
    return (
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ImageBackground source={bg} resizeMode="cover" style={styles.bg}>
          <View style={styles.overlay} />
          <View style={[styles.center, { justifyContent: 'flex-start', paddingTop: height * -0.12 }]}>
            <Image
              source={logo}
              style={[styles.logo, { width: width * 0.7, height: width * 0.7, marginBottom: -40 }]}
              resizeMode="contain"
            />
            {/* Gradient app name */}
            <Animated.Text
              style={[
                styles.appName,
                {
                  // simple color step to simulate gradient without extra libs
                  color: '#FFFFFF',
                  textShadowColor: 'rgba(255,255,255,0.35)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 8,
                },
              ]}
            >
              AQUATAB
            </Animated.Text>

            {/* Single tagline */}
            <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>
              Smart Reminders, Healthier You.
            </Animated.Text>

            {/* Animated loading dots */}
            <Animated.View style={[styles.loadingDotsRow, { opacity: fadeAnim }]}>
              {[0, 1, 2, 3, 4].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.loadingDot,
                    {
                      opacity:
                        index === activeDotIndex ||
                        index === (activeDotIndex + 1) % 5 ||
                        index === (activeDotIndex + 2) % 5
                          ? 1
                          : 0.2,
                    },
                  ]}
                />
              ))}
            </Animated.View>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>© {new Date().getFullYear()} AQUATAB</Text>
          </View>
        </ImageBackground>
      </Animated.View>
    );
  }

  // Onboarding screens
  return (
    <View style={styles.bg}>
      {/* Decorative background shapes for onboarding */}
      <View style={styles.decorShapeOne} />
      <View style={styles.decorShapeTwo} />
      <FlatList
        ref={flatListRef}
        data={onboardingScreens}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.key}
        onViewableItemsChanged={({ viewableItems }) => {
          if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setCurrentPage(viewableItems[0].index);
          }
        }}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={[styles.onboardingScreen, { width, height }]}> 
            {/* Per-screen rich decorations */}
            {item.bgDecor === 'water' && (
              <>
                <View style={styles.waveTop} />
                <View style={styles.waveBottom} />
              </>
            )}
            {item.bgDecor === 'pills' && (
              <>
                <View style={styles.pillLarge} />
                <View style={styles.pillSmall} />
              </>
            )}
            {item.bgDecor === 'dashboard' && (
              <>
                <View style={styles.chartBarLeft} />
                <View style={styles.chartBarRight} />
              </>
            )}

            {/* Content wrapper to center main content */}
            <View style={styles.slideContentWrapper}>
              <Text style={styles.onboardingTitle}>{item.title}</Text>
              <Text style={styles.onboardingDescription}>{item.description}</Text>
              
              {/* Visible progress/next cue */}
              <View style={styles.nextCueRow}>
                <View style={[styles.nextDot, { opacity: currentPage === 0 ? 1 : 0.3 }]} />
                <View style={[styles.nextDot, { opacity: currentPage === 1 ? 1 : 0.3 }]} />
                <View style={[styles.nextDot, { opacity: currentPage === 2 ? 1 : 0.3 }]} />
              </View>

              {/* Last screen: interactive visual + animated button */}
              {item.key === '3' && (
                <View style={styles.lastScreenBlock}>
                  <Text style={styles.lastScreenText}>Create an account to start your journey</Text>
                <Animated.View
                  style={{
                    opacity: personOpacity,
                    transform: [{ translateY: personTranslate }],
                    flexDirection: 'row',
                    gap: 16,
                    marginTop: 16,
                  }}
                >
                  {/* Placeholder visuals: glass + person silhouette */}
                  <View style={styles.glassOfWater} />
                  <View style={styles.personSilhouette} />
                </Animated.View>

                <Animated.View
                  style={{
                    transform: [
                      { scale: getStartedScale.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
                    ],
                    opacity: getStartedScale,
                    marginTop: 18,
                  }}
                >
                  <TouchableOpacity style={styles.getStartedBtnHigh} onPress={onGetStarted}>
                    <Text style={styles.getStartedText}>Get Started →</Text>
                  </TouchableOpacity>
                </Animated.View>
                </View>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#1e3a8b',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30,58,138,0.35)',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  appName: {
    marginTop: 2,
    color: '#FFFFFF',
    fontSize: 35,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tagline: {
    marginTop: 5,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingDotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  progressTrack: {
    height: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  footer: {
    paddingBottom: Platform.select({ ios: 28, android: 22, default: 20 }),
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  onboardingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  slideContentWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  onboardingDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  getStartedBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  getStartedText: {
    color: '#1e3a8b',
    fontSize: 18,
    fontWeight: '600',
  },
  // Decorative shapes for background accents
  decorShapeOne: {
    position: 'absolute',
    top: 40,
    left: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  decorShapeTwo: {
    position: 'absolute',
    bottom: 100,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  // Per-screen rich decorations
  waveTop: {
    position: 'absolute',
    top: 80,
    left: -20,
    width: 220,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  waveBottom: {
    position: 'absolute',
    bottom: 140,
    right: -25,
    width: 180,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  pillLarge: {
    position: 'absolute',
    top: 120,
    right: 40,
    width: 140,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
    transform: [{ rotate: '20deg' }],
  },
  pillSmall: {
    position: 'absolute',
    bottom: 160,
    left: 30,
    width: 90,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    transform: [{ rotate: '-15deg' }],
  },
  chartBarLeft: {
    position: 'absolute',
    top: 120,
    left: 50,
    width: 16,
    height: 100,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  chartBarRight: {
    position: 'absolute',
    top: 150,
    right: 60,
    width: 16,
    height: 140,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  nextCueRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
  },
  nextDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  lastScreenBlock: {
    marginTop: 24,
    alignItems: 'center',
  },
  lastScreenText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  glassOfWater: {
    width: 80,
    height: 100,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  personSilhouette: {
    width: 80,
    height: 100,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  getStartedBtnHigh: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
});
