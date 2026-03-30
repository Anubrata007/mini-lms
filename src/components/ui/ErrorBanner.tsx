import { View, Text, TouchableOpacity } from "react-native";

interface ErrorBannerProps {
    message: string;
    onRetry?: () => void;
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
    return (
        <View className="bg-red-50 border border-red-200 mx-4 rounded-2xl p-4 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
                <Text style={{ fontSize: 18 }}>⚠️</Text>
                <Text className="text-red-600 text-sm ml-2 flex-1">{message}</Text>
            </View>
            {onRetry && (
                <TouchableOpacity
                    onPress={onRetry}
                    className="bg-red-500 px-3 py-2 rounded-xl ml-3"
                >
                    <Text className="text-white text-xs font-semibold">Retry</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}