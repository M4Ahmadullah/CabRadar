import { useEffect, useState } from "react";
import NotificationService from "@/services/notificationService";
import * as Notifications from "expo-notifications";

export function useNotifications() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Configure notifications
        await NotificationService.configure();

        // Register for push notifications
        await NotificationService.registerForPushNotificationsAsync();

        // Request permissions
        const hasPermission = await NotificationService.requestPermissions();
        if (!hasPermission) {
          setError("Notification permissions not granted");
        }
      } catch (err) {
        console.error("Error initializing notifications:", err);
        setError("Failed to initialize notifications");
      }
    };

    initializeNotifications();

    return () => {
      // Cleanup
      NotificationService.stopAllNotifications();
    };
  }, []);

  return { error };
}
