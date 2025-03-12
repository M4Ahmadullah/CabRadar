import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInRight,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

export function EventAlertModal() {
  const router = useRouter();
  const { type, location: name, message, lat, lng } = useLocalSearchParams();

  // Animation values
  const scale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleBackPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    router.back();
  };

  const handleCardPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.98, {}, () => {
      scale.value = withSpring(1);
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Event Alert",
          headerLeft: () => (
            <Pressable
              onPress={handleBackPress}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <IconSymbol name="chevron.left" size={28} color="#007AFF" />
            </Pressable>
          ),
          animation: "slide_from_bottom",
          headerTransparent: true,
          headerStyle: {
            backgroundColor: "transparent",
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "600",
          },
          headerShadowVisible: false,
          headerTitleAlign: "center",
        }}
      />
      <ThemedView style={styles.container}>
        <Animated.View
          entering={FadeInUp.delay(400).springify()}
          style={styles.contentContainer}
        >
          <Pressable onPress={handleCardPress}>
            <Animated.View style={[styles.card, cardStyle]}>
              <Animated.View
                entering={SlideInRight.delay(500).springify()}
                style={styles.iconContainer}
              >
                <IconSymbol
                  size={32}
                  name={
                    type === "Transport Closure"
                      ? "train.side.front.car"
                      : "music.note"
                  }
                  color="#007AFF"
                />
              </Animated.View>

              <Animated.Text
                entering={FadeInDown.delay(600)}
                style={styles.title}
              >
                {name}
              </Animated.Text>

              <Animated.View
                entering={FadeInDown.delay(700)}
                style={styles.detailsContainer}
              >
                <ThemedText style={styles.message}>{message}</ThemedText>
              </Animated.View>

              <Animated.Text
                entering={FadeInDown.delay(800)}
                style={styles.type}
              >
                {type}
              </Animated.Text>
            </Animated.View>
          </Pressable>

          <Animated.View
            entering={FadeInUp.delay(900)}
            style={[styles.buttonContainer, buttonStyle]}
          >
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleBackPress}
            >
              <ThemedText style={styles.buttonText}>Back to Radar</ThemedText>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 120,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  card: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#ffffff15",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#007AFF15",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  detailsContainer: {
    width: "100%",
    gap: 12,
  },
  message: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
  },
  type: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  buttonContainer: {
    marginTop: "auto",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
