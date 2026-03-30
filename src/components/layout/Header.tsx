import { View, Text } from "react-native";

export default function Header() {
    return (
        <View className="bg-white px-5 pt-12 pb-4 flex-row items-center justify-between border-b border-gray-100">
            <View>
                <Text className="text-xl font-bold text-blue-500">
                    Mini<Text className="text-gray-900">LMS</Text>
                </Text>
            </View>
        </View>
    );
}