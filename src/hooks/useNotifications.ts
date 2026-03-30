import { useEffect, useRef, useState } from "react";
import Constants from "expo-constants";
import {
  requestNotificationPermission,
  recordAppOpen,
  checkInactivityAndNotify,
  scheduleDailyReminder,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
} from "@/services/notifications";

const isExpoGo = Constants.appOwnership === "expo";

export function useNotifications() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const notificationListener = useRef<{ remove: () => void } | null>(null);
  const responseListener = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    const setup = async () => {
      try {
        const granted = await requestNotificationPermission();
        setPermissionGranted(granted);

        if (granted) {
          await checkInactivityAndNotify();
          await recordAppOpen();
          await scheduleDailyReminder();
        }

        // Listen for notifications while app is open
        notificationListener.current = await addNotificationReceivedListener(
          (notification) => {
            console.log("Notification received:", notification.request.content.title);
          }
        );

        // Listen for user tapping a notification
        responseListener.current = await addNotificationResponseReceivedListener(
          (response) => {
            const data = response.notification.request.content.data;
            console.log("Notification tapped, type:", data?.type);
          }
        );
      } catch (error) {
        console.log("Notification setup error:", error);
      }
    };

    setup();

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return { permissionGranted };
}