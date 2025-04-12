import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useState, useRef, useEffect } from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useColorScheme } from "@/hooks/useColorScheme";

const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
});

type FormData = {
  email: string;
};

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      "keyboardWillShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardWillHideListener = Keyboard.addListener(
      "keyboardWillHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      // TODO: Implement forgot password API call
      console.log("Forgot password request for:", data.email);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Show success message
      alert("Password reset instructions sent to your email");
      router.back();
    } catch (err) {
      console.error("Forgot password error:", err);
      alert("Failed to send reset instructions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const gradientColors =
    colorScheme === "dark"
      ? (["#121212", "#1E1E1E"] as const)
      : (["#FFFFFF", "#F5F5F5"] as const);

  const inputTheme = {
    colors: {
      primary: "#007AFF",
      background: colorScheme === "dark" ? "#1E1E1E" : "#FFFFFF",
      text: colorScheme === "dark" ? "#FFFFFF" : "#000000",
      placeholder: colorScheme === "dark" ? "#666666" : "#999999",
      surface: colorScheme === "dark" ? "#2A2A2A" : "#FFFFFF",
    },
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <LinearGradient colors={gradientColors} style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            keyboardVisible && { paddingBottom: 100 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <MaterialCommunityIcons
              name="lock-reset"
              size={80}
              color={inputTheme.colors.primary}
              style={styles.icon}
            />

            <Text
              variant="headlineLarge"
              style={[styles.title, { color: inputTheme.colors.text }]}
            >
              Forgot Password
            </Text>

            <Text
              variant="titleMedium"
              style={[styles.subtitle, { color: inputTheme.colors.text }]}
            >
              Enter your email to reset your password
            </Text>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.email}
                  left={
                    <TextInput.Icon
                      icon="email"
                      color={inputTheme.colors.primary}
                    />
                  }
                  theme={inputTheme}
                  textColor={inputTheme.colors.text}
                  outlineColor={inputTheme.colors.primary}
                  activeOutlineColor={inputTheme.colors.primary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              )}
            />
            {errors.email && (
              <Text style={styles.error}>{errors.email.message}</Text>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              style={styles.button}
              theme={{
                colors: {
                  primary: inputTheme.colors.primary,
                  onPrimary: "#FFFFFF",
                },
              }}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonText}
            >
              Send Reset Instructions
            </Button>

            <View style={styles.footer}>
              <Text
                style={[styles.footerText, { color: inputTheme.colors.text }]}
              >
                Remember your password?
              </Text>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.footerButton}
              >
                <Text
                  style={[
                    styles.footerButtonText,
                    { color: inputTheme.colors.primary },
                  ]}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  icon: {
    alignSelf: "center",
    marginBottom: 32,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "bold",
    fontSize: 32,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 40,
    opacity: 0.8,
    fontSize: 18,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "transparent",
    borderRadius: 12,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    elevation: 4,
    minHeight: 56,
  },
  buttonContent: {
    height: 56,
    paddingVertical: 0,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
  },
  error: {
    color: "#FF3B30",
    marginBottom: 8,
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    paddingBottom: 8,
  },
  footerText: {
    marginRight: 4,
    fontSize: 16,
    lineHeight: 24,
  },
  footerButton: {
    marginLeft: 4,
    paddingVertical: 0,
    height: 24,
    justifyContent: "center",
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
});
