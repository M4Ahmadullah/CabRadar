import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, Linking, View } from "react-native";
import NotificationService from "@/services/notificationService";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import LocationService from "@/services/locationService";
import {
  startBackgroundLocationTask,
  stopBackgroundLocationTask,
} from "@/services/backgroundLocation";

import { useColorScheme } from "@/hooks/useColorScheme";
import { NotificationModal } from "@/components/NotificationModal";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/LoadingScreen";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isLoading } = useAuth();

  console.log("[RootLayoutNav] Current auth state:", {
    hasUser: !!user,
    isLoading,
  });

  // Show loading screen while checking auth state
  if (isLoading) {
    console.log("[RootLayoutNav] Showing loading screen");
    return <LoadingScreen />;
  }

  console.log("[RootLayoutNav] Rendering navigation stack");
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(protected)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

function RootLayout() {
  console.log("[RootLayout] Initializing root layout");
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  useEffect(() => {
    if (loaded) {
      console.log("[RootLayout] Fonts loaded, hiding splash screen");
      SplashScreen.hideAsync().catch((error) => {
        console.error("[RootLayout] Error hiding splash screen:", error);
      });
    }
  }, [loaded]);

  useEffect(() => {
    console.log("[RootLayout] Initializing notification services");
    // Initialize notification services
    const initializeServices = async () => {
      try {
        // Configure notifications
        await NotificationService.configure();
        console.log("[RootLayout] Notification services initialized");
      } catch (error) {
        console.error(
          "[RootLayout] Error initializing notification services:",
          error
        );
      }
    };

    initializeServices();

    return () => {
      console.log("[RootLayout] Cleaning up notification services");
      // Cleanup
      NotificationService.stopAllNotifications();
    };
  }, []);

  useEffect(() => {
    console.log("[RootLayout] Setting up notification modal ref");
    NotificationService.setModalRef({
      show: (data) => {
        setModalData(data);
        setModalVisible(true);
      },
      hide: () => setModalVisible(false),
    });
  }, []);

  useEffect(() => {
    console.log("[RootLayout] Requesting location permissions");
    // Request initial permissions when app first launches
    LocationService.requestInitialPermissions().catch((error) => {
      console.error(
        "[RootLayout] Error requesting location permissions:",
        error
      );
    });
  }, []);

  const handleOpenMaps = () => {
    if (modalData?.coordinates) {
      const { lat, long } = modalData.coordinates;
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${long}`;
      Linking.openURL(url).catch((error) => {
        console.error("[RootLayout] Error opening maps:", error);
      });
    }
  };

  if (!loaded) {
    console.log("[RootLayout] Fonts not loaded, showing loading screen");
    return <LoadingScreen />;
  }

  console.log("[RootLayout] Rendering main layout");
  return (
    <AuthProvider>
      <NotificationProvider>
        <GestureHandlerRootView style={styles.container}>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <RootLayoutNav />
            <StatusBar style="auto" />
            <NotificationModal
              isVisible={modalVisible}
              onClose={() => setModalVisible(false)}
              onOpenMaps={handleOpenMaps}
              data={modalData}
            />
          </ThemeProvider>
        </GestureHandlerRootView>
      </NotificationProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default RootLayout;
