import { Animated, Easing } from "react-native";

export const RadarAnimations = {
  rotate: (value: Animated.Value) =>
    Animated.loop(
      Animated.timing(value, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ),

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
