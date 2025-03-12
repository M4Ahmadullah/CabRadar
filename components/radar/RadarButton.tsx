import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";

type RadarButtonProps = {
  isActive: boolean;
  onPress: () => void;
};

function RippleEffect({ isActive }: { isActive: boolean }) {
  const ripple1 = useSharedValue(0);
  const ripple2 = useSharedValue(0);

  useEffect(() => {
    if (!isActive) {
      // Inactive state ripples (keep current logic)
      const duration = 2000;
      ripple1.value = withRepeat(
        withSequence(
          withTiming(1, { duration }),
          withTiming(0, { duration: 0 })
        ),
        -1
      );

      setTimeout(() => {
        ripple2.value = withRepeat(
          withSequence(
            withTiming(1, { duration }),
            withTiming(0, { duration: 0 })
          ),
          -1
        );
      }, 666);
    }
  }, [isActive]);

  const rippleStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + ripple1.value }],
    opacity: 0.4 - ripple1.value * 0.3,
  }));

  const rippleStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + ripple2.value }],
    opacity: 0.4 - ripple2.value * 0.3,
  }));

  return !isActive ? (
    <>
      <Animated.View style={[styles.ripple, rippleStyle1]} />
      <Animated.View style={[styles.ripple, rippleStyle2]} />
    </>
  ) : null;
}

export function RadarButton({ isActive, onPress }: RadarButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <ThemedView style={styles.buttonWrapper}>
        <RippleEffect isActive={isActive} />
        <ThemedView style={[styles.button, isActive && styles.activeButton]}>
          <ThemedText style={styles.buttonText}>
            {isActive ? "Stop Radar" : "Start Radar"}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 300,
    height: 300,
  },
  ripple: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: "#007AFF60",
  },
  activeRipple: {
    borderColor: "#34C75960",
  },
  buttonContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 20,
    borderRadius: 100,
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#34C759",
  },
  iconContainer: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonIcon: {
    fontSize: 30,
  },
  buttonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  scanLine: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: "#ffffff80",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
});
