/**
 * Haptic Feedback Utilities
 * Native haptic feedback for interactions
 */

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export async function triggerHaptic(type: HapticType = 'light'): Promise<void> {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return;
  }

  try {
    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  } catch (error) {
    // Silently fail if haptics not available
    console.warn('Haptic feedback not available:', error);
  }
}

export function hapticLight() {
  return triggerHaptic('light');
}

export function hapticMedium() {
  return triggerHaptic('medium');
}

export function hapticHeavy() {
  return triggerHaptic('heavy');
}

export function hapticSuccess() {
  return triggerHaptic('success');
}

export function hapticWarning() {
  return triggerHaptic('warning');
}

export function hapticError() {
  return triggerHaptic('error');
}
