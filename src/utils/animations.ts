/**
 * Animation Utilities
 * Reusable animation configurations
 */

import { withSpring, withTiming, interpolate, Extrapolate } from 'react-native-reanimated';

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

// Animation presets
export const animations = {
  // Fade in
  fadeIn: (opacity: Animated.Value, duration = TIMING_CONFIG.normal) => {
    return withTiming(1, { duration });
  },

  // Fade out
  fadeOut: (opacity: Animated.Value, duration = TIMING_CONFIG.normal) => {
    return withTiming(0, { duration });
  },

  // Slide up
  slideUp: (translateY: Animated.Value, distance = 50) => {
    return withSpring(0, SPRING_CONFIG.gentle);
  },

  // Slide down
  slideDown: (translateY: Animated.Value, distance = 50) => {
    return withSpring(distance, SPRING_CONFIG.gentle);
  },

  // Scale in
  scaleIn: (scale: Animated.Value) => {
    return withSpring(1, SPRING_CONFIG.bouncy);
  },

  // Scale out
  scaleOut: (scale: Animated.Value) => {
    return withSpring(0.8, SPRING_CONFIG.snappy);
  },

  // Bounce
  bounce: (scale: Animated.Value) => {
    return withSpring(1.1, SPRING_CONFIG.bouncy);
  },

  // Pulse
  pulse: (scale: Animated.Value) => {
    return withSpring(1.05, SPRING_CONFIG.stiff);
  },
};

// Interpolation helpers
export function interpolateOpacity(
  value: Animated.Value,
  inputRange: number[],
  outputRange: number[] = [0, 1]
) {
  return value.interpolate({
    inputRange,
    outputRange,
    extrapolate: Extrapolate.CLAMP,
  });
}

export function interpolateScale(
  value: Animated.Value,
  inputRange: number[],
  outputRange: number[] = [0.8, 1]
) {
  return value.interpolate({
    inputRange,
    outputRange,
    extrapolate: Extrapolate.CLAMP,
  });
}

export function interpolateTranslate(
  value: Animated.Value,
  inputRange: number[],
  outputRange: number[] = [20, 0]
) {
  return value.interpolate({
    inputRange,
    outputRange,
    extrapolate: Extrapolate.CLAMP,
  });
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
export function parallelAnimations(
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

import Animated from 'react-native-reanimated';
