/**
 * Haptic Feedback Utility
 * Platform-aware haptic feedback for iOS and Android
 */

import { Platform } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let HapticsModule: any = null;

try {
  const { Haptics } = require('expo-haptics');
  HapticsModule = Haptics;
} catch {
  HapticsModule = null;
}

const impactFeedbackStyles = {
  light: HapticsModule?.ImpactFeedbackStyle?.Light || 'light',
  medium: HapticsModule?.ImpactFeedbackStyle?.Medium || 'medium',
  heavy: HapticsModule?.ImpactFeedbackStyle?.Heavy || 'heavy',
};

const notificationFeedbackTypes = {
  success: HapticsModule?.NotificationFeedbackType?.Success || 'success',
  warning: HapticsModule?.NotificationFeedbackType?.Warning || 'warning',
  error: HapticsModule?.NotificationFeedbackType?.Error || 'error',
};

/**
 * Trigger impact haptic feedback
 * @param style - Intensity of the haptic feedback
 */
export function impact(style: 'light' | 'medium' | 'heavy' = 'medium') {
  if (HapticsModule && HapticsModule.impactAsync) {
    HapticsModule.impactAsync(impactFeedbackStyles[style]);
  } else if (Platform.OS === 'android') {
    try {
      const { Vibration } = require('react-native');
      const pattern = {
        light: 10,
        medium: 20,
        heavy: 30,
      }[style];
      Vibration.vibrate(pattern);
    } catch {
      // Vibration API not available
    }
  }
}

/**
 * Trigger notification haptic feedback
 * @param type - Type of notification feedback
 */
export function notification(type: 'success' | 'warning' | 'error') {
  if (HapticsModule && HapticsModule.notificationAsync) {
    HapticsModule.notificationAsync(notificationFeedbackTypes[type]);
  } else if (Platform.OS === 'android') {
    try {
      const { Vibration } = require('react-native');
      const pattern = {
        success: [0, 50, 50, 50],
        warning: [0, 100, 50, 100],
        error: [0, 100, 100, 100, 100],
      }[type];
      Vibration.vibrate(pattern);
    } catch {
      // Vibration API not available
    }
  }
}

/**
 * Trigger selection haptic feedback
 * Used for picker changes, tab switches, etc.
 */
export function selection() {
  if (HapticsModule && HapticsModule.selectionAsync) {
    HapticsModule.selectionAsync();
  } else if (Platform.OS === 'android') {
    try {
      const { Vibration } = require('react-native');
      Vibration.vibrate(5);
    } catch {
      // Vibration API not available
    }
  }
}

/**
 * Convenience functions for common interactions
 */
export const haptics = {
  // Button presses
  buttonPress: () => impact('light'),
  buttonLongPress: () => impact('medium'),

  // Navigation
  tabSwitch: () => selection(),
  backNavigation: () => impact('light'),
  modalOpen: () => impact('medium'),
  modalClose: () => impact('light'),

  // Form interactions
  inputFocus: () => selection(),
  inputError: () => impact('heavy'),
  toggleSwitch: () => selection(),
  sliderChange: () => selection(),

  // Actions
  deleteAction: () => impact('heavy'),
  copyAction: () => notification('success'),
  shareAction: () => notification('success'),
  sendAction: () => impact('medium'),

  // States
  loadingStart: () => impact('light'),
  loadingComplete: () => notification('success'),
  loadingError: () => notification('error'),
  networkError: () => notification('error'),

  // Session/Chat
  newMessage: () => impact('light'),
  streamingStart: () => impact('light'),
  streamingToken: () => {}, // No haptic for each token
  streamingComplete: () => notification('success'),
  abortGeneration: () => impact('medium'),
};

export default haptics;