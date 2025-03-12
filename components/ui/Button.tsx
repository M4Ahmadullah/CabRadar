import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";

interface ButtonProps extends TouchableOpacityProps {
  children: string;
  variant?: "primary" | "secondary";
}

export function Button({
  children,
  style,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "secondary" ? styles.secondaryButton : styles.primaryButton,
        style,
      ]}
      {...props}
    >
      <ThemedText
        style={[
          styles.text,
          variant === "secondary" ? styles.secondaryText : styles.primaryText,
        ]}
      >
        {children}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryText: {
    color: "#007AFF",
  },
});
