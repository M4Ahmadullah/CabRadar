import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { RadarAnimations } from "@/utils/animations";

type RadarRingProps = {
  isActive: boolean;
};

export const RadarRing: React.FC<RadarRingProps> = ({ isActive }) => {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const outerGlowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      // Start all animations
      RadarAnimations.pulse(pulseAnim).start();
      RadarAnimations.rotate(rotateAnim).start();

      // Fade in animations
      Animated.parallel([
        Animated.spring(glowAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 40,
          friction: 7,
        }),
        Animated.spring(outerGlowAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 30,
          friction: 7,
        }),
      ]).start();
    } else {
      // Reset animations
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
      glowAnim.setValue(0);
      outerGlowAnim.setValue(0);
    }
  }, [isActive]);

  if (!isActive) return null;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.outerGlow,
          {
            opacity: Animated.multiply(outerGlowAnim, 0.4),
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* Main rotating ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            opacity: glowAnim,
            transform: [{ scale: pulseAnim }, { rotate }],
          },
        ]}
      />

      {/* Inner glow */}
      <Animated.View
        style={[
          styles.glow,
          {
            opacity: Animated.multiply(glowAnim, 0.6),
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* Core glow */}
      <Animated.View
        style={[
          styles.coreGlow,
          {
            opacity: glowAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: -1,
  },
  outerGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 6,
  },
  ring: {
    position: "absolute",
    width: 85,
    height: 85,
    borderRadius: 42.5,
    borderWidth: 2,
    borderColor: "#4CAF50",
    backgroundColor: "transparent",
  },
  glow: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
  },
  coreGlow: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
});
