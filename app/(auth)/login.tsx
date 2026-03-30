import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { useAuth } from "@/store/AuthContext";
import { loginSchema, LoginFormData } from "@/utils/validators";
import { AxiosError } from "axios";

export default function LoginScreen() {
    const { login, state } = useAuth();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data);
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const message =
                axiosError.response?.data?.message ?? "Login failed. Please try again.";
            Alert.alert("Login Failed", message);
        }
    };

    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="flex-1 justify-center px-6 bg-white">

                    {/* Header */}
                    <View className="mb-10">
                        <Text className="text-4xl font-bold text-gray-900 mb-2">
                            Welcome Back
                        </Text>
                        <Text className="text-base text-gray-500">
                            Sign in to continue learning
                        </Text>
                    </View>

                    {/* Email Field */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Email
                        </Text>
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className={`border rounded-xl px-4 py-4 text-base bg-gray-50 text-gray-900 ${errors.email ? "border-red-500" : "border-gray-200"
                                        }`}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#9ca3af"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            )}
                        />
                        {errors.email && (
                            <Text className="text-red-500 text-xs mt-1">
                                {errors.email.message}
                            </Text>
                        )}
                    </View>

                    {/* Password Field */}
                    <View className="mb-6">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Password
                        </Text>
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className={`border rounded-xl px-4 py-4 text-base bg-gray-50 text-gray-900 ${errors.password ? "border-red-500" : "border-gray-200"
                                        }`}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#9ca3af"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    secureTextEntry
                                />
                            )}
                        />
                        {errors.password && (
                            <Text className="text-red-500 text-xs mt-1">
                                {errors.password.message}
                            </Text>
                        )}
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        onPress={handleSubmit(onSubmit)}
                        disabled={state.isLoading}
                        className={`rounded-xl py-4 items-center mb-6 ${state.isLoading ? "bg-blue-300" : "bg-blue-500"
                            }`}
                    >
                        {state.isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white text-base font-semibold">
                                Sign In
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Register Link */}
                    <View className="flex-row justify-center">
                        <Text className="text-gray-500 text-sm">
                            Don't have an account?{" "}
                        </Text>
                        <Link href="/(auth)/register">
                            <Text className="text-blue-500 text-sm font-semibold">
                                Sign Up
                            </Text>
                        </Link>
                    </View>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}