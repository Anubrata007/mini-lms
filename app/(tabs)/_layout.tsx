import { Tabs } from "expo-router";
import { View, Text, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/layout/Header";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface TabIconProps {
    name: IoniconsName;
    focusedName: IoniconsName;
    label: string;
    focused: boolean;
}

function TabIcon({ name, focusedName, label, focused }: TabIconProps) {
    return (
        <View className="items-center justify-center gap-1" style={{ paddingTop: 6 }}>
            <View
                style={{
                    width: 48,
                    height: 28,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: focused ? "#EEF2FF" : "transparent",
                }}
            >
                <Ionicons
                    name={focused ? focusedName : name}
                    size={22}
                    color={focused ? "#4F46E5" : "#9CA3AF"}
                />
            </View>
            <Text
                style={{
                    fontSize: 10,
                    fontWeight: focused ? "600" : "400",
                    color: focused ? "#4F46E5" : "#9CA3AF",
                    letterSpacing: 0.3,
                    width: 64,
                    textAlign: "center",
                }}
            >
                {label}
            </Text>
        </View>
    );
}

export default function TabsLayout() {
    return (
        <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
            {/* Shared Header across all tabs */}
            <Header />

            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarStyle: {
                        height: Platform.OS === "ios" ? 80 : 68,
                        paddingBottom: Platform.OS === "ios" ? 20 : 8,
                        paddingTop: 6,
                        paddingHorizontal: 4,
                        backgroundColor: "#FFFFFF",
                        borderTopWidth: 1,
                        borderTopColor: "#E5E7EB",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                        elevation: 10,
                    },
                    tabBarHideOnKeyboard: true,
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <TabIcon
                                name="book-outline"
                                focusedName="book"
                                label="Courses"
                                focused={focused}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="bookmarks"
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <TabIcon
                                name="bookmark-outline"
                                focusedName="bookmark"
                                label="Saved"
                                focused={focused}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <TabIcon
                                name="person-outline"
                                focusedName="person"
                                label="Profile"
                                focused={focused}
                            />
                        ),
                    }}
                />
            </Tabs>
        </View>
    );
}