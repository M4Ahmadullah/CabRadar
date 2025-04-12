/**
 * Radar Animations
 *
 * This utility provides animation configurations for the radar component including:
 * - Rotation animation
 * - Pulse animation
 * - Animation timing
 * - Easing functions
 *
 * TODO:
 * 1. Add more animation presets
 * 2. Implement animation customization
 * 3. Add performance optimizations
 * 4. Add animation interruption handling
 * 5. Implement animation sequencing
 */

import { Animated, Easing } from "react-native";

export const RadarAnimations = {
  // Rotation animation configuration
  rotate: (value: Animated.Value) =>
    Animated.loop(
      Animated.timing(value, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ),

  // Pulse animation configuration
  pulse: (value: Animated.Value) =>
    Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          toValue: 1.2,
          duration: 1500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 1,
          duration: 1500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ])
    ),
};
