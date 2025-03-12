import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { LocationObject } from "expo-location";
import LocationService from "@/utils/location";
import { TEST_LOCATION } from "@/utils/testData";

const BACKGROUND_LOCATION_TASK = "BACKGROUND_LOCATION_TASK";
const NOTIFICATION_CHANNEL_ID = "opportunities";

// Define the task data type
interface LocationTaskData {
  locations: Location.LocationObject[];
}

async function setupNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
      name: "Opportunities",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2196F3",
      enableVibrate: true,
      enableLights: true,
      showBadge: true,
    });
  }

  // Configure how notifications appear when app is in foreground
  await Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export async function startBackgroundLocationTask() {
  try {
    console.log("[BackgroundLocation] Starting task with test location:", {
      lat: TEST_LOCATION.coords.latitude,
      lng: TEST_LOCATION.coords.longitude,
    });

    // Setup notifications first
    await setupNotifications();

    // First completely stop and remove the existing task
    await stopBackgroundLocationTask();

    // Remove any existing task definition
    if (TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK)) {
      await TaskManager.unregisterAllTasksAsync();
    }

    // Clear existing notifications
    await Notifications.dismissAllNotificationsAsync();

    // Wait to ensure clean state
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Don't request real permissions
    // const { status } = await Location.requestBackgroundPermissionsAsync();
    // if (status !== "granted") return;

    TaskManager.defineTask(
      BACKGROUND_LOCATION_TASK,
      async ({
        data,
        error,
      }: {
        data?: LocationTaskData; // Use the interface here
        error?: any;
      }) => {
        if (error) {
          console.error(error);
          return;
        }

        // Log the actual location we're overriding (for debugging)
        if (data?.locations?.[0]) {
          const realLocation = data.locations[0];
          console.log("[Debug] Actual device location:", {
            lat: realLocation.coords.latitude.toFixed(5),
            lng: realLocation.coords.longitude.toFixed(5),
          });
        }

        // Always use and log test location
        const timeStr = new Date().toLocaleTimeString();
        console.log(`[${timeStr}] Using test location:`, {
          lat: TEST_LOCATION.coords.latitude.toFixed(5),
          lng: TEST_LOCATION.coords.longitude.toFixed(5),
        });

        await LocationService.updateCurrentLocation(TEST_LOCATION);
        return null;
      }
    );

    // Start with minimal settings and shorter intervals
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 20000, // Changed from 60000 to 20000 (20 seconds)
      distanceInterval: 10, // Keep this small for testing
      foregroundService: {
        notificationTitle: "CabRadar",
        notificationBody: "Using test location...",
      },
    });

    // Force trigger notifications
    await new Promise((resolve) => setTimeout(resolve, 500));
    await triggerExampleNotifications();
  } catch (error) {
    console.error("Error starting background task:", error);
  }
}

export async function stopBackgroundLocationTask() {
  try {
    // Clear all notifications
    await Notifications.dismissAllNotificationsAsync();

    // Stop and unregister all tasks
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_LOCATION_TASK
    );
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      await TaskManager.unregisterAllTasksAsync();
    }

    // Wait to ensure everything is stopped
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (error) {
    console.error("Error stopping background task:", error);
  }
}

async function triggerExampleNotifications() {
  try {
    const notifications = [
      {
        title: "New Opportunity!",
        body: "Example notification 1",
      },
      {
        title: "Another Opportunity!",
        body: "Example notification 2",
      },
      {
        title: "One More!",
        body: "Example notification 3",
      },
    ];

    // Force immediate notifications
    for (const notif of notifications) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notif.title,
          body: notif.body,
          sound: true,
          // For Android, we need to use the channel ID in a different way
          ...(Platform.OS === "android" && {
            // @ts-ignore - Android specific properties
            android: {
              channelId: NOTIFICATION_CHANNEL_ID,
              priority: "high",
            },
          }),
        },
        trigger: null,
      });
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.error("Error sending notifications:", error);
  }
}
