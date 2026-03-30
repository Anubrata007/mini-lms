import { Platform } from "react-native";
import Constants from "expo-constants";
import { appStorage } from "./storage";

const LAST_OPENED_KEY = "app_last_opened";
const NOTIFICATION_PERMISSION_KEY = "notification_permission_granted";

const isExpoGo = Constants.appOwnership === "expo";

// Lazy loader — returns the Notifications module or null in Expo Go
async function getNotifications() {
    if (isExpoGo) {
        console.warn("expo-notifications is not supported in Expo Go. Use a development build.");
        return null;
    }
    const Notifications = await import("expo-notifications");
    return Notifications;
}

// Set handler only outside Expo Go
if (!isExpoGo) {
    import("expo-notifications").then((Notifications) => {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });
    });
}

export async function requestNotificationPermission(): Promise<boolean> {
    try {
        const Notifications = await getNotifications();
        if (!Notifications) return false;

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== "granted") return false;

        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "MiniLMS",
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#3b82f6",
            });

            await Notifications.setNotificationChannelAsync("reminders", {
                name: "Learning Reminders",
                importance: Notifications.AndroidImportance.DEFAULT,
                vibrationPattern: [0, 250],
                lightColor: "#3b82f6",
            });

            await Notifications.setNotificationChannelAsync("achievements", {
                name: "Achievements",
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 500, 250, 500],
                lightColor: "#10b981",
            });
        }

        await appStorage.set(NOTIFICATION_PERMISSION_KEY, true);
        return true;
    } catch (error) {
        console.log("Permission error:", error);
        return false;
    }
}

export async function recordAppOpen(): Promise<void> {
    try {
        await appStorage.set(LAST_OPENED_KEY, Date.now());
    } catch { }
}

export async function checkInactivityAndNotify(): Promise<void> {
    try {
        const Notifications = await getNotifications();
        if (!Notifications) return;

        const lastOpened = await appStorage.get<number>(LAST_OPENED_KEY);
        if (!lastOpened) return;

        const hoursSinceLastOpen = (Date.now() - lastOpened) / (1000 * 60 * 60);

        if (hoursSinceLastOpen >= 24) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "📚 Miss learning?",
                    body: "You haven't opened MiniLMS in a while. Pick up where you left off!",
                    data: { type: "inactivity_reminder" },
                    sound: true,
                },
                trigger: null,
            });
        }
    } catch (error) {
        console.log("Inactivity check error:", error);
    }
}

export async function notifyBookmarkMilestone(bookmarkCount: number): Promise<void> {
    try {
        const Notifications = await getNotifications();
        if (!Notifications) return;

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "🔖 5 Courses Saved!",
                body: "You've bookmarked 5 courses. Time to start learning — enroll in one today!",
                data: { type: "bookmark_milestone", count: bookmarkCount },
                sound: true,
            },
            trigger: null,
        });
    } catch (error) {
        console.log("Bookmark milestone error:", error);
    }
}

export async function notifyBookmarkUpdate(bookmarkCount: number): Promise<void> {
    try {
        const Notifications = await getNotifications();
        if (!Notifications) return;

        await Notifications.scheduleNotificationAsync({
            content: {
                title: `📚 ${bookmarkCount} Courses Saved!`,
                body: "Great collection! Start learning to make the most of your saved courses.",
                data: { type: "bookmark_update", count: bookmarkCount },
                sound: true,
            },
            trigger: null,
        });
    } catch (error) {
        console.log("Bookmark update error:", error);
    }
}

export async function notifyEnrollment(courseTitle: string): Promise<void> {
    try {
        const Notifications = await getNotifications();
        if (!Notifications) return;

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "🎓 Successfully Enrolled!",
                body: `You're now enrolled in "${courseTitle}". Start your first lesson now!`,
                data: { type: "enrollment" },
                sound: true,
            },
            trigger: null,
        });
    } catch (error) {
        console.log("Enrollment notification error:", error);
    }
}

export async function scheduleDailyReminder(): Promise<void> {
    try {
        const Notifications = await getNotifications();
        if (!Notifications) return;

        await cancelDailyReminder();
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "📖 Time to Learn!",
                body: "Keep your streak going — just 10 minutes of learning makes a difference.",
                data: { type: "daily_reminder" },
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: 9,
                minute: 0,
            },
        });
    } catch (error) {
        console.log("Daily reminder error:", error);
    }
}

export async function cancelDailyReminder(): Promise<void> {
    try {
        const Notifications = await getNotifications();
        if (!Notifications) return;

        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        const daily = scheduled.filter(
            (n: any) => n.content.data?.type === "daily_reminder"
        );
        for (const n of daily) {
            await Notifications.cancelScheduledNotificationAsync(n.identifier);
        }
    } catch { }
}

export async function cancelAllNotifications(): Promise<void> {
    try {
        const Notifications = await getNotifications();
        if (!Notifications) return;

        await Notifications.cancelAllScheduledNotificationsAsync();
    } catch { }
}

export async function getNotificationPermissionStatus(): Promise<string> {
    try {
        const Notifications = await getNotifications();
        if (!Notifications) return "unavailable";

        const { status } = await Notifications.getPermissionsAsync();
        return status;
    } catch {
        return "unavailable";
    }
}

export async function addNotificationReceivedListener(
    callback: (notification: any) => void
): Promise<{ remove: () => void }> {
    const Notifications = await getNotifications();
    if (!Notifications) return { remove: () => { } };
    return Notifications.addNotificationReceivedListener(callback);
}

export async function addNotificationResponseReceivedListener(
    callback: (response: any) => void
): Promise<{ remove: () => void }> {
    const Notifications = await getNotifications();
    if (!Notifications) return { remove: () => { } };
    return Notifications.addNotificationResponseReceivedListener(callback);
}