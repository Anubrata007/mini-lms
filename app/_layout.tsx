import "../src/styles/globals.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "@/store/AuthContext";
import { BookmarkProvider } from "@/store/BookmarkContext";
import { CourseProvider } from "@/store/CourseContext";
import { useNotifications } from "@/hooks/useNotifications";

function NotificationSetup() {
    useNotifications();
    return null;
}

function RouteGuard() {
    const { state } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (state.isLoading) return;
        const inAuthGroup = segments[0] === "(auth)";
        if (!state.isAuthenticated && !inAuthGroup) {
            router.replace("/(auth)/login");
        } else if (state.isAuthenticated && inAuthGroup) {
            router.replace("/(tabs)");
        }
    }, [state.isAuthenticated, state.isLoading, segments]);

    return <Stack screenOptions={{ headerShown: false }} />;
}

export default function Layout() {
    return (
        <AuthProvider>
            <CourseProvider>
                <BookmarkProvider>
                    <NotificationSetup />
                    <RouteGuard />
                </BookmarkProvider>
            </CourseProvider>
        </AuthProvider>
    );
}