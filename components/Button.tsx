import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "text";
}

export function Button({
  title,
  style,
  loading = false,
  variant = "primary",
  ...props
}: ButtonProps) {
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.button,
          variant === "primary" && styles.primaryButton,
          variant === "secondary" && styles.secondaryButton,
          variant === "text" && styles.textButton,
          loading && styles.loadingButton,
          style,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={loading}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === "primary" ? "#FFFFFF" : Colors.light.tint}
            size="small"
          />
        ) : (
          <ThemedText
            style={[
              styles.text,
              variant === "primary" && styles.primaryText,
              variant === "secondary" && styles.secondaryText,
              variant === "text" && styles.textText,
            ]}
          >
            {title}
          </ThemedText>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
  },
  secondaryButton: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  textButton: {
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  loadingButton: {
    opacity: 0.8,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryText: {
    color: Colors.light.tint,
  },
  textText: {
    color: Colors.light.tint,
  },
});
