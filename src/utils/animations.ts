/**
 * Animation Utilities
 * Reusable animation configurations using Reanimated 3
 */

import { withSpring, withTiming } from 'react-native-reanimated';

// Spring configurations
export const SPRING_CONFIG = {
  gentle: { damping: 15, stiffness: 150 },
  bouncy: { damping: 12, stiffness: 200 },
  snappy: { damping: 20, stiffness: 300 },
  stiff: { damping: 25, stiffness: 400 },
};

// Timing configurations
export const TIMING_CONFIG = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Animation helpers
export const animations = {
  // Fade in
  fadeIn: (value: number, duration = TIMING_CONFIG.normal) => {
    return withTiming(1, { duration });
  },

  // Fade out
  fadeOut: (duration = TIMING_CONFIG.normal) => {
    return withTiming(0, { duration });
  },

  // Slide up
  slideUp: (_value: number, _distance = 50) => {
    return withSpring(0, SPRING_CONFIG.gentle);
  },

  // Slide down
  slideDown: (distance = 50) => {
    return withSpring(distance, SPRING_CONFIG.gentle);
  },

  // Scale in
  scaleIn: () => {
    return withSpring(1, SPRING_CONFIG.bouncy);
  },

  // Scale out
  scaleOut: () => {
    return withSpring(0.8, SPRING_CONFIG.snappy);
  },

  // Bounce
  bounce: () => {
    return withSpring(1.1, SPRING_CONFIG.bouncy);
  },

  // Pulse
  pulse: () => {
    return withSpring(1.05, SPRING_CONFIG.stiff);
  },
};

// Interpolation helpers
export function interpolateOpacity(
  value: unknown,
  inputRange: number[],
  outputRange: number[] = [0, 1]
) {
  return { inputRange, outputRange };
}

export function interpolateScale(
  value: unknown,
  inputRange: number[],
  outputRange: number[] = [0.8, 1]
) {
  return { inputRange, outputRange };
}

export function interpolateTranslate(
  value: unknown,
  inputRange: number[],
  outputRange: number[] = [20, 0]
) {
  return { inputRange, outputRange };
}

// Stagger animation helper
export function staggerAnimations(
  animations: (() => void)[],
  delay: number = 50
) {
  animations.forEach((animation, index) => {
    setTimeout(animation, index * delay);
  });
}

// Parallel animation helper
export async function parallelAnimations(
  animations: (() => void)[]
) {
  return Promise.all(animations.map((animation) => animation()));
}

// Sequence animation helper
export async function sequenceAnimations(
  animations: (() => Promise<void>)[]
) {
  for (const animation of animations) {
    await animation();
  }
}