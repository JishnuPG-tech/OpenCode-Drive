/**
 * Typing Indicator Component
 * Animated dots showing AI is typing
 */

import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { getThemeColors } from '../theme';
import { storage } from '../storage/mmkv';

interface TypingIndicatorProps {
  visible: boolean;
}

export function TypingIndicator({ visible }: TypingIndicatorProps) {
  const themeName = storage.getTheme() as 'dark' | 'light' | 'system';
  const theme = getThemeColors(themeName);

  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      const createAnimation = (value: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(value, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const animation = Animated.parallel([
        createAnimation(dot1, 0),
        createAnimation(dot2, 200),
        createAnimation(dot3, 400),
      ]);

      animation.start();

      return () => {
        animation.stop();
      };
    }
  }, [visible, dot1, dot2, dot3]);

  if (!visible) return null;

  const dotStyle = (animatedValue: Animated.Value) => ({
    backgroundColor: theme.primary,
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -6],
          extrapolate: Extrapolate.CLAMP,
        }),
      },
    ],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Animated.View style={[styles.dot, dotStyle(dot1)]} />
      <Animated.View style={[styles.dot, dotStyle(dot2)]} />
      <Animated.View style={[styles.dot, dotStyle(dot3)]} />
    </View>
  );
}

import { Extrapolate } from 'react-native-reanimated';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 6,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
