import { useMemo } from 'react';

interface HydrationFactors {
  weight?: number;
  height?: number;
  gender?: string;
  climate?: string;
  exercise_frequency?: string;
  age?: number;
}

/**
 * Calculate recommended daily water intake based on user profile
 * Formula: Base calculation + adjustments for climate and activity
 */
export function calculateDailyWaterGoal(factors: HydrationFactors): number {
  let baseGoal = 2000; // Default 2L

  // Base calculation: 35ml per kg of body weight (common medical formula)
  if (factors.weight) {
    baseGoal = Math.round(factors.weight * 35);
  }

  // Climate adjustment: Add 500ml per liter in hot/humid climates
  if (factors.climate) {
    const climate = factors.climate.toLowerCase();
    if (climate.includes('hot') || climate.includes('tropical') || climate.includes('humid')) {
      baseGoal += 500;
    }
  }

  // Activity level adjustment: Add 500-1000ml based on exercise frequency
  if (factors.exercise_frequency) {
    const frequency = factors.exercise_frequency.toLowerCase();
    if (frequency.includes('daily') || frequency.includes('very')) {
      baseGoal += 1000;
    } else if (frequency.includes('moderate') || frequency.includes('3-4')) {
      baseGoal += 750;
    } else if (frequency.includes('light') || frequency.includes('1-2')) {
      baseGoal += 500;
    }
  }

  // Age adjustment: Elderly people need slightly less
  if (factors.age && factors.age > 55) {
    baseGoal = Math.round(baseGoal * 0.95);
  }

  // Cap between reasonable bounds (1500ml - 5000ml)
  return Math.max(1500, Math.min(5000, baseGoal));
}

/**
 * Get dynamic quick-add presets based on daily goal
 * Provides 6 preset amounts that make sense for the user's goal
 */
export function getDynamicQuickAddPresets(dailyGoal: number): number[] {
  const eighthOfGoal = Math.round(dailyGoal / 8);
  const quarterOfGoal = Math.round(dailyGoal / 4);
  const thirdOfGoal = Math.round(dailyGoal / 3);
  const halfGoal = Math.round(dailyGoal / 2);

  return [
    Math.round(eighthOfGoal / 50) * 50, // Round to nearest 50
    Math.round(quarterOfGoal / 50) * 50,
    Math.round(thirdOfGoal / 50) * 50,
    Math.round((eighthOfGoal * 1.5) / 50) * 50,
    Math.round(halfGoal / 50) * 50,
    Math.round((halfGoal * 1.5) / 50) * 50,
  ];
}

/**
 * Calculate remaining water to drink to stay on pace
 */
export function calculateHydrationPace(
  currentAmount: number,
  dailyGoal: number,
  timeOfDay: 'morning' | 'afternoon' | 'evening'
): { remaining: number; isOnPace: boolean; message: string } {
  const now = new Date();
  const hour = now.getHours();

  // Define expected amounts at different times
  let expectedAmount = 0;
  if (hour < 12) {
    // Morning: should have ~25% by 10am
    expectedAmount = Math.round(dailyGoal * 0.25);
  } else if (hour < 17) {
    // Afternoon: should have ~65% by 3pm
    expectedAmount = Math.round(dailyGoal * 0.65);
  } else {
    // Evening: should have ~85% by 6pm
    expectedAmount = Math.round(dailyGoal * 0.85);
  }

  const isOnPace = currentAmount >= expectedAmount;
  const remaining = Math.max(0, dailyGoal - currentAmount);

  let message = '';
  if (isOnPace && remaining > 0) {
    message = `Great! You're on track. ${remaining}ml to go!`;
  } else if (!isOnPace) {
    const behindBy = expectedAmount - currentAmount;
    message = `You're ${behindBy}ml behind. Drink now to stay on track!`;
  } else {
    message = `Amazing! You've reached your goal!`;
  }

  return { remaining, isOnPace, message };
}

/**
 * Hook to use hydration goal calculations
 */
export function useHydrationGoal(factors: HydrationFactors) {
  const goal = useMemo(() => calculateDailyWaterGoal(factors), [factors]);
  const presets = useMemo(() => getDynamicQuickAddPresets(goal), [goal]);

  return { goal, presets };
}
