import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform, Alert, Linking } from "react-native";
import { NotificationModal } from "@/components/NotificationModal";
import { Coordinates } from "@/types";

// Add proper type for notification data
type NotificationData = {
  coordinates: { lat: number; long: number };
  name: string; // Changed from location to name to match our data structure
  message: string;
  type: string;
  distance: string;
};

class NotificationService {
  private static notificationIntervals: { [key: string]: NodeJS.Timeout } = {};
  private static notificationCount: { [key: string]: number } = {};
  private static expoPushToken: string | null = null;
  private static modalRef: {
    show: (data: any) => void;
    hide: () => void;
  } | null = null;

  static async registerForPushNotificationsAsync() {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get notification permissions!");
        return null;
      }

      // Get push token for both development and production
      try {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas.projectId,
        });
        this.expoPushToken = token.data;
        console.log("Push token obtained:", token.data);
        return token;
      } catch (error) {
        console.log(
          "Push token not available - using local notifications only"
        );
        return null;
      }
    } catch (error) {
      console.error("Error registering for notifications:", error);
      return null;
    }
  }

  static async requestPermissions() {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === "granted";
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  }

  static async configure() {
    try {
      await this.registerForPushNotificationsAsync();

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("opportunities", {
          name: "Opportunities",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 200, 200, 200],
          lightColor: "#FF0000",
          enableVibrate: true,
          enableLights: true,
          sound: "default",
          lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PUBLIC,
          bypassDnd: true,
          showBadge: true,
        });
      }

      // Safer notification handling
      Notifications.setNotificationHandler({
        handleNotification: async () => {
          try {
            return {
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: true,
              shouldVibrate: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
            };
          } catch (error) {
            console.error("Handle notification error:", error);
            return {
              shouldShowAlert: false,
              shouldPlaySound: false,
              shouldSetBadge: false,
            };
          }
        },
      });

      // Safer background subscription
      const backgroundSubscription =
        Notifications.addNotificationResponseReceivedListener((response) => {
          try {
            // Add type assertion to match our data structure
            const data = response.notification.request.content
              .data as NotificationData;
            if (data) {
              this.handleNotificationPress(data);
            }
          } catch (error) {
            console.error("Background notification error:", error);
          }
        });

      return () => {
        backgroundSubscription.remove();
      };
    } catch (error) {
      console.error("Notification configuration error:", error);
    }
  }

  static setModalRef(ref: { show: (data: any) => void; hide: () => void }) {
    this.modalRef = ref;
  }

  // Update the handleNotificationPress method to use the same type
  private static async handleNotificationPress(data: NotificationData) {
    if (this.modalRef) {
      this.modalRef.show(data);
    }
  }

  static async startRepeatingNotification(
    type: string,
    name: string,
    distance: string,
    message: string,
    coordinates: Coordinates
  ) {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } =
          await Notifications.requestPermissionsAsync();
        if (newStatus !== "granted") return;
      }

      // Only send notification, don't show modal
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${name} - ${distance}`,
          body: message,
          data: {
            type,
            name,
            message,
            distance,
            coordinates,
          },
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Notification error:", error);
    }
  }

  static stopSpecificNotification(identifier: string) {
    if (this.notificationIntervals[identifier]) {
      clearTimeout(this.notificationIntervals[identifier]);
      delete this.notificationIntervals[identifier];
    }
  }

  static stopAllNotifications() {
    Object.keys(this.notificationIntervals).forEach((id) =>
      this.stopSpecificNotification(id)
    );
  }

  static async sendSignalNotification(
    signalType: string,
    location: string,
    distance: string,
    message: string,
    identifier: string,
    coordinates: { lat: number; long: number }
  ) {
    // Add debug log
    console.log(`[Notification] Sending notification with coordinates:`, {
      type: signalType,
      location,
      coordinates,
    });

    const notificationContent = {
      title:
        signalType === "Event"
          ? "🚨 Event Ending Soon!"
          : "⚠️ Station Closure Alert!",
      body: message,
      data: {
        coordinates,
        location,
        message,
        type: signalType,
        distance,
      },
      sound: "default",
      priority: "max",
      sticky: true,
      autoDismiss: false,
      vibrate: Platform.OS === "android" ? [0, 200, 200, 200] : undefined,
      android: {
        channelId: "opportunities",
        priority: "max",
        sound: "default",
        vibrationPattern: [0, 200, 200, 200],
        ongoing: true,
        importance: Notifications.AndroidImportance.HIGH,
        foregroundServiceBehavior: "urgent",
        category: "alarm",
        color: "#FF0000",
        autoCancel: false,
        visibility: "public",
        wakeLockTimeout: 20000,
      },
      ios: {
        sound: "default",
        _displayInForeground: true,
        _badgeCount: 1,
        _interruption: "critical",
        _critical: true,
        _criticalVolume: 1.0,
        _applicationIconBadgeNumber: 1,
        _categoryIdentifier: "opportunities",
      },
    };

    try {
      await Notifications.dismissNotificationAsync(identifier);
      const result = await Notifications.scheduleNotificationAsync({
        identifier,
        content: notificationContent,
        trigger: null,
      });

      if (result) {
        console.log(
          `\n🔔 Notification Sent\n` +
            JSON.stringify(
              {
                type: signalType,
                location,
                distance,
                message,
                identifier: result,
              },
              null,
              2
            ) +
            "\n"
        );
      }

      return result;
    } catch (error) {
      console.error("Error sending notification:", error);
      return null;
    }
  }

  /* Future feature: Rich notifications with navigation
  static async sendRichNotification(
    signalType: string,
    location: string,
    distance: string,
    endTime: string
  ) {
    // ... implementation ready for future use
  }
  */
}

export default NotificationService;
