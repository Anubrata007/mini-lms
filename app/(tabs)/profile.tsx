import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
    Image,
    Switch,
} from "react-native";
import { useAuth } from "@/store/AuthContext";
import { useState, useEffect, ComponentProps } from "react";
import {
    getNotificationPermissionStatus,
    requestNotificationPermission,
    scheduleDailyReminder,
    cancelDailyReminder,
} from "@/services/notifications";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
    const { state, logout } = useAuth();
    const { user } = state;
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [notifEnabled, setNotifEnabled] = useState(false);
    const [dailyReminder, setDailyReminder] = useState(false);

    useEffect(() => {
        const checkPermission = async () => {
            const status = await getNotificationPermissionStatus();
            setNotifEnabled(status === "granted");
        };
        checkPermission();
    }, []);

    const handleNotifToggle = async (value: boolean) => {
        if (value) {
            const granted = await requestNotificationPermission();
            setNotifEnabled(granted);
            if (!granted) {
                Alert.alert(
                    "Permission Required",
                    "Please enable notifications in your device settings to receive updates.",
                    [{ text: "OK" }]
                );
            }
        } else {
            Alert.alert(
                "Disable Notifications",
                "You can re-enable notifications from your device settings.",
                [{ text: "OK" }]
            );
        }
    };

    const handleDailyReminderToggle = async (value: boolean) => {
        setDailyReminder(value);
        if (value) {
            await scheduleDailyReminder();
        } else {
            await cancelDailyReminder();
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        setIsLoggingOut(true);
                        try {
                            await logout();
                        } catch {
                            setIsLoggingOut(false);
                            Alert.alert("Error", "Failed to logout. Please try again.");
                        }
                    },
                },
            ]
        );
    };

    if (!user) return null;

    return (
        <ScrollView className="flex-1 bg-gray-50">

            {/* Header */}
            <View className="bg-blue-500 pt-4 pb-8 px-6 items-center">
                <View className="w-24 h-24 rounded-full bg-white overflow-hidden mb-4 border-4 border-white">
                    <Image
                        source={{
                            uri:
                                user.avatar?.url &&
                                    user.avatar.url !== "https://via.placeholder.com/200x200.png"
                                    ? user.avatar.url
                                    : `https://ui-avatars.com/api/?name=${user.username}&background=3b82f6&color=fff&size=200`,
                        }}
                        className="w-full h-full"
                    />
                </View>
                <Text className="text-white text-2xl font-bold">
                    {user.username}
                </Text>
                <Text className="text-blue-100 text-sm mt-1">{user.email}</Text>

                {/* Role Badge */}
                <View className="bg-blue-600 px-3 py-1 rounded-full mt-2">
                    <Text className="text-white text-xs font-medium">{user.role}</Text>
                </View>
            </View>

            {/* Stats Row */}
            <View className="flex-row bg-white mx-4 -mt-4 rounded-2xl shadow-sm p-4 mb-6">
                <View className="flex-1 items-center">
                    <Text className="text-2xl font-bold text-gray-900">0</Text>
                    <Text className="text-xs text-gray-500 mt-1">Enrolled</Text>
                </View>
                <View className="w-px bg-gray-100" />
                <View className="flex-1 items-center">
                    <Text className="text-2xl font-bold text-gray-900">0</Text>
                    <Text className="text-xs text-gray-500 mt-1">Bookmarks</Text>
                </View>
                <View className="w-px bg-gray-100" />
                <View className="flex-1 items-center">
                    <Text className="text-2xl font-bold text-gray-900">0%</Text>
                    <Text className="text-xs text-gray-500 mt-1">Completed</Text>
                </View>
            </View>

            {/* Account Info */}
            <View className="bg-white mx-4 rounded-2xl mb-4 overflow-hidden">
                <Text className="text-xs font-semibold text-gray-400 uppercase px-4 pt-4 pb-2 tracking-widest">
                    Account Info
                </Text>

                <InfoRow label="Username" value={user.username} iconName="person-outline" />
                <InfoRow label="Email" value={user.email} iconName="mail-outline" />
                <InfoRow
                    label="Login Type"
                    value={user.loginType?.replace("_", " ")}
                    iconName="lock-closed-outline"
                />
                <InfoRow
                    label="Email Verified"
                    value={user.isEmailVerified ? "Verified" : "Not Verified"}
                    iconName={user.isEmailVerified ? "checkmark-circle-outline" : "warning-outline"}
                    valueColor={user.isEmailVerified ? "text-green-500" : "text-orange-500"}
                    isLast
                />
            </View>

            {/* App Settings */}
            <View className="bg-white mx-4 rounded-2xl mb-4 overflow-hidden">
                <Text className="text-xs font-semibold text-gray-400 uppercase px-4 pt-4 pb-2 tracking-widest">
                    Notifications
                </Text>

                <View className="flex-row items-center px-4 py-3 border-b border-gray-50">
                    <Ionicons name="notifications-outline" size={22} color="#3b82f6" />
                    <View className="flex-1 ml-3">
                        <Text className="text-gray-800 text-sm font-medium">
                            Push Notifications
                        </Text>
                        <Text className="text-gray-400 text-xs mt-0.5">
                            Bookmarks, enrollments & updates
                        </Text>
                    </View>
                    <Switch
                        value={notifEnabled}
                        onValueChange={handleNotifToggle}
                        trackColor={{ false: "#e5e7eb", true: "#93c5fd" }}
                        thumbColor={notifEnabled ? "#3b82f6" : "#fff"}
                    />
                </View>

                <View className="flex-row items-center px-4 py-3">
                    <Ionicons name="time-outline" size={22} color="#3b82f6" />
                    <View className="flex-1 ml-3">
                        <Text className="text-gray-800 text-sm font-medium">
                            Daily Reminder
                        </Text>
                        <Text className="text-gray-400 text-xs mt-0.5">
                            Remind me to learn at 9:00 AM
                        </Text>
                    </View>
                    <Switch
                        value={dailyReminder}
                        onValueChange={handleDailyReminderToggle}
                        trackColor={{ false: "#e5e7eb", true: "#93c5fd" }}
                        thumbColor={dailyReminder ? "#3b82f6" : "#fff"}
                        disabled={!notifEnabled}
                    />
                </View>
            </View>

            {/* Logout Button */}
            <View className="mx-4 mb-10">
                <TouchableOpacity
                    onPress={handleLogout}
                    disabled={isLoggingOut}
                    className="bg-red-50 border border-red-200 rounded-2xl py-4 items-center flex-row justify-center"
                >
                    {isLoggingOut ? (
                        <ActivityIndicator color="#ef4444" size="small" />
                    ) : (
                        <>
                            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                            <Text className="text-red-500 font-semibold text-base ml-2">
                                Logout
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
}

// ── Reusable Info Row ──

function InfoRow({
    label,
    value,
    iconName,
    valueColor = "text-gray-500",
    isLast = false,
}: {
    label: string;
    value: string;
    iconName: ComponentProps<typeof Ionicons>["name"];
    valueColor?: string;
    isLast?: boolean;
}) {
    return (
        <View
            className={`flex-row items-center px-4 py-3 ${!isLast ? "border-b border-gray-50" : ""
                }`}
        >
            <Ionicons name={iconName} size={18} color="#9ca3af" />
            <Text className="flex-1 text-gray-800 ml-3 text-sm">{label}</Text>
            <Text className={`text-sm ${valueColor}`}>{value}</Text>
        </View>
    );
}