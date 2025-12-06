import { Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';

/**
 * Celebration animation (water splash/confetti effect)
 */
export function useCelebrationAnimation() {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const trigger = () => {
    scaleAnim.setValue(0);
    opacityAnim.setValue(1);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: false,
          easing: Easing.out(Easing.back(1.2)),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: false,
        delay: 400,
      }),
    ]).start();
  };

  return { scaleAnim, opacityAnim, trigger };
}

/**
 * Water glass filling animation
 */
export function useWaterGlassAnimation(progress: number) {
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: Math.min(100, progress),
      duration: 800,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease),
    }).start();
  }, [progress, fillAnim]);

  return fillAnim;
}

/**
 * Pulse animation for buttons
 */
export function usePulseAnimation() {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const pulse = () => {
    scaleAnim.setValue(1);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  return { scaleAnim, pulse };
}

/**
 * Shake animation for alerts
 */
export function useShakeAnimation() {
  const translateX = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(translateX, {
        toValue: -10,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(translateX, {
        toValue: 10,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(translateX, {
        toValue: -10,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  return { translateX, shake };
}

/**
 * Bounce animation for success messages
 */
export function useBounceAnimation() {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const bounce = () => {
    bounceAnim.setValue(0);
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
        easing: Easing.out(Easing.bounce),
      }),
    ]).start();
  };

  return {
    transform: [
      {
        translateY: bounceAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
    opacity: bounceAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    bounce,
  };
}
