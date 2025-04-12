/**
 * Notification Service
 *
 * TODO: This service needs to be:
 * 1. Connected to the backend for push notifications
 * 2. Implement proper notification handling
 * 3. Add notification persistence
 * 4. Implement proper error handling
 * 5. Add notification grouping
 */

import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform, Alert, Linking } from "react-native";
import { NotificationModal } from "@/components/NotificationModal";
import { Coordinates } from "@/types";

// Change from type to export type
export type NotificationData = {
  coordinates: { lat: number; long: number };
  name: string;
  message: string;
  type: string;
  distance: string;
};

class NotificationService {
  // TODO: Implement proper notification management
  private static notificationIntervals: { [key: string]: NodeJS.Timeout } = {};
  private static notificationCount: { [key: string]: number } = {};
  private static expoPushToken: string | null = null;
  private static modalRef: {
    show: (data: any) => void;
    hide: () => void;
  } | null = null;

  // TODO: Implement proper push notification registration
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

      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) {
          console.warn("No project ID found in app configuration");
          return null;
        }

        const token = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        this.expoPushToken = token.data;
        console.log("Push token obtained:", token.data);
        return token;
      } catch (error) {
        console.error("Error getting push token:", error);
        return null;
      }
    } catch (error) {
      console.error("Error registering for push notifications:", error);
      return null;
    }
  }

  // TODO: Implement proper permission handling
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

  // TODO: Implement proper notification configuration
  static async configure() {
    try {
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          sound: "default",
          vibrationPattern: [0, 500, 200, 500],
        }),
      });

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 500, 200, 500],
          lightColor: "#FF231F7C",
          sound: "default",
        });
      }

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

      const backgroundSubscription =
        Notifications.addNotificationResponseReceivedListener((response) => {
          try {
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
      console.error(
        "[NotificationService] Error configuring notifications:",
        error
      );
    }
  }

  // TODO: Implement proper modal handling
  static setModalRef(ref: { show: (data: any) => void; hide: () => void }) {
    this.modalRef = ref;
  }

  // TODO: Implement proper notification press handling
  private static async handleNotificationPress(data: NotificationData) {
    if (this.modalRef) {
      this.modalRef.show(data);
    }
  }

  // TODO: Implement proper repeating notification handling
  static async startRepeatingNotification(
    type: string,
    title: string,
    subtitle: string,
    body: string,
    data: NotificationData
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          subtitle,
          body,
          data,
          sound: "default",
          vibrate: [0, 500, 200, 500],
          priority: "high",
        },
        trigger: null,
      });
    } catch (error) {
      console.error("[NotificationService] Notification error:", error);
    }
  }

  // TODO: Implement proper notification stopping
  static stopSpecificNotification(identifier: string) {
    if (this.notificationIntervals[identifier]) {
      clearTimeout(this.notificationIntervals[identifier]);
      delete this.notificationIntervals[identifier];
    }
  }

  // TODO: Implement proper notification cleanup
  static stopAllNotifications() {
    Object.keys(this.notificationIntervals).forEach((id) =>
      this.stopSpecificNotification(id)
    );
  }

  // TODO: Implement proper signal notification handling
  static async sendSignalNotification(
    signalType: string,
    location: string,
    distance: string,
    message: string,
    identifier: string,
    coordinates: { lat: number; long: number }
  ) {
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
}

export default NotificationService;
