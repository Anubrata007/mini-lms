import React, { useRef } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export default function SearchBar({
    value,
    onChangeText,
    placeholder = "Search courses...",
}: SearchBarProps) {
    const inputRef = useRef<TextInput>(null);

    return (
        <View className="flex-row items-center bg-white mx-4 mb-4 px-4 rounded-full border border-gray-100"
            style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
            }}
        >
            <Ionicons name="search" size={20} color="#9ca3af" className="mr-2" />
            <TextInput
                ref={inputRef}
                className="flex-1 py-3 px-3 text-sm text-gray-800"
                placeholder={placeholder}
                placeholderTextColor="#9ca3af"
                value={value}
                onChangeText={onChangeText}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
            />
            {value.length > 0 && (
                <TouchableOpacity
                    onPress={() => {
                        onChangeText("");
                        inputRef.current?.blur();
                    }}
                    className="w-6 h-6 bg-gray-200 rounded-full items-center justify-center"
                >
                    <Text style={{ fontSize: 10 }}>✕</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}