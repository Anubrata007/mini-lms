import { View, Text } from "react-native";
import { useNetwork } from "@/hooks/useNetwork";

export default function OfflineBanner() {
    const isConnected = useNetwork();

    if (isConnected) return null;

    return (
        <View className="bg-red-500 px-4 py-2 flex-row items-center justify-center">
            <Text style={{ fontSize: 14 }}>📡</Text>
            <Text className="text-white text-xs font-medium ml-2">
                No internet connection
            </Text>
        </View>
    );
}