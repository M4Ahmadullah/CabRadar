import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, Linking } from "react-native";
import NotificationService from "@/services/notificationService";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import LocationService from "@/services/locationService";

import { useColorScheme } from "@/hooks/useColorScheme";
import { NotificationModal } from "@/components/NotificationModal";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const BACKGROUND_LOCATION_TASK = "BACKGROUND_LOCATION_TASK";

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];
    if (location) {
      LocationService.currentLocation = location;
    }
  }
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    async function setupNotifications() {
      try {
        const hasPermission = await NotificationService.requestPermissions();
        if (hasPermission) {
          await NotificationService.configure();

          const subscription =
            Notifications.addNotificationResponseReceivedListener(
              (response) => {
                const data = response.notification.request.content.data;
                // Show the modal directly instead of navigation
                router.push("/(tabs)");
              }
            );

          return () => subscription.remove();
        }
      } catch (error) {
        console.error("Setup notification error:", error);
      }
    }

    setupNotifications();
  }, []);

  useEffect(() => {
    NotificationService.setModalRef({
      show: (data) => {
        setModalData(data);
        setModalVisible(true);
      },
      hide: () => setModalVisible(false),
    });
  }, []);

  const handleOpenMaps = () => {
    if (modalData?.coordinates) {
      const { lat, long } = modalData.coordinates;
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${long}`;
      Linking.openURL(url);
    }
  };

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
        <NotificationModal
          isVisible={modalVisible}
          onClose={() => setModalVisible(false)}
          onOpenMaps={handleOpenMaps}
          data={modalData}
        />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
