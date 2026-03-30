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
import { Link, useRouter } from "expo-router";
import { useAuth } from "@/store/AuthContext";
import { registerSchema, RegisterFormData } from "@/utils/validators";
import { AxiosError } from "axios";

export default function RegisterScreen() {
    const { register, state } = useAuth();
    const router = useRouter();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await register({
                username: data.username,
                email: data.email,
                password: data.password,
                role: "USER",
            });
            Alert.alert(
                "Account Created!",
                "Please check your email and verify your account before logging in.",
                [{
                    text: "Go to Login",
                    onPress: () => router.replace("/(auth)/login"),
                }]
            );
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const message =
                axiosError.response?.data?.message ??
                "Registration failed. Please try again.";
            Alert.alert("Registration Failed", message);
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
                <View className="flex-1 justify-center px-6 py-10 bg-white">

                    {/* Header */}
                    <View className="mb-10">
                        <Text className="text-4xl font-bold text-gray-900 mb-2">
                            Create Account
                        </Text>
                        <Text className="text-base text-gray-500">
                            Start your learning journey today
                        </Text>
                    </View>

                    {/* Username */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Username
                        </Text>
                        <Controller
                            control={control}
                            name="username"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className={`border rounded-xl px-4 py-4 text-base bg-gray-50 text-gray-900 ${errors.username ? "border-red-500" : "border-gray-200"
                                        }`}
                                    placeholder="Choose a username"
                                    placeholderTextColor="#9ca3af"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            )}
                        />
                        {errors.username && (
                            <Text className="text-red-500 text-xs mt-1">
                                {errors.username.message}
                            </Text>
                        )}
                    </View>

                    {/* Email */}
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

                    {/* Password */}
                    <View className="mb-4">
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
                                    placeholder="Create a password"
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

                    {/* Confirm Password */}
                    <View className="mb-8">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                        </Text>
                        <Controller
                            control={control}
                            name="confirmPassword"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className={`border rounded-xl px-4 py-4 text-base bg-gray-50 text-gray-900 ${errors.confirmPassword
                                        ? "border-red-500"
                                        : "border-gray-200"
                                        }`}
                                    placeholder="Confirm your password"
                                    placeholderTextColor="#9ca3af"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    secureTextEntry
                                />
                            )}
                        />
                        {errors.confirmPassword && (
                            <Text className="text-red-500 text-xs mt-1">
                                {errors.confirmPassword.message}
                            </Text>
                        )}
                    </View>

                    {/* Register Button */}
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
                                Create Account
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View className="flex-row justify-center">
                        <Text className="text-gray-500 text-sm">
                            Already have an account?{" "}
                        </Text>
                        <Link href="/(auth)/login">
                            <Text className="text-blue-500 text-sm font-semibold">
                                Sign In
                            </Text>
                        </Link>
                    </View>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}