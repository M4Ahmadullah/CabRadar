import { createContext, useContext, useEffect, useState } from "react";
import * as Notifications from "expo-notifications";

type NotificationData = {
  title: string;
  body: string;
  data?: Record<string, any>;
};

type NotificationContextType = {
  lastNotification: NotificationData | null;
  clearLastNotification: () => void;
};

const NotificationContext = createContext<NotificationContextType>({
  lastNotification: null,
  clearLastNotification: () => {},
});

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [lastNotification, setLastNotification] =
    useState<NotificationData | null>(null);

  useEffect(() => {
    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Set up notification listener
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        const { title, body, data } = notification.request.content;
        setLastNotification({
          title: title || "Notification",
          body: body || "",
          data,
        });
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const clearLastNotification = () => {
    setLastNotification(null);
  };

  return (
    <NotificationContext.Provider
      value={{ lastNotification, clearLastNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
