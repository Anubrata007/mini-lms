import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCourses } from "@/store/CourseContext";
import { useBookmarks } from "@/store/BookmarkContext";
import { useState } from "react";
import { appStorage } from "@/services/storage";
import { STORAGE_KEYS } from "@/utils/constants";
import { notifyEnrollment } from "@/services/notifications";

export default function CourseDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { courses } = useCourses();
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);

    const course = courses.find((c) => c.id === id);
    const bookmarked = isBookmarked(id ?? "");

    // Load enrolled state on mount
    useState(() => {
        const loadEnrolled = async () => {
            const enrolled = await appStorage.get<string[]>(
                STORAGE_KEYS.ENROLLED_COURSES
            );
            if (enrolled && id) {
                setIsEnrolled(enrolled.includes(id));
            }
        };
        loadEnrolled();
    });

    if (!course) {
        return (
            <View className="flex-1 bg-gray-50 items-center justify-center">
                <Text style={{ fontSize: 48 }}>😕</Text>
                <Text className="text-gray-700 font-bold text-xl mt-4">
                    Course not found
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-6 bg-blue-500 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-semibold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleEnroll = async () => {
        if (isEnrolled) {
            router.push(`/course/webview/${course.id}`);
            return;
        }

        setIsEnrolling(true);
        try {
            // Simulate enrollment — persist to storage
            await new Promise((resolve) => setTimeout(resolve, 1200));
            const enrolled =
                (await appStorage.get<string[]>(STORAGE_KEYS.ENROLLED_COURSES)) ?? [];
            if (!enrolled.includes(course.id)) {
                await appStorage.set(STORAGE_KEYS.ENROLLED_COURSES, [
                    ...enrolled,
                    course.id,
                ]);
            }
            setIsEnrolled(true);
            await notifyEnrollment(course.title);
            Alert.alert(
                "🎉 Enrolled!",
                `You have successfully enrolled in "${course.title}"`,
                [
                    {
                        text: "Start Learning",
                        onPress: () => router.push(`/course/webview/${course.id}`),
                    },
                    { text: "Later", style: "cancel" },
                ]
            );
        } catch {
            Alert.alert("Error", "Failed to enroll. Please try again.");
        } finally {
            setIsEnrolling(false);
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this course: ${course.title} - Available on MiniLMS`,
                title: course.title,
            });
        } catch {
            // Share cancelled
        }
    };

    const handleBookmark = () => {
        toggleBookmark(course.id);
    };

    return (
        <View className="flex-1 bg-white">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Hero Image */}
                <View className="relative">
                    <Image
                        source={{ uri: course.thumbnail }}
                        className="w-full"
                        style={{ height: 280 }}
                        resizeMode="cover"
                    />

                    {/* Gradient Overlay */}
                    <View
                        className="absolute inset-0"
                        style={{
                            backgroundColor: "transparent",
                        }}
                    />

                    {/* Top Bar */}
                    <View className="absolute top-0 left-0 right-0 flex-row items-center justify-between px-4 pt-12">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 bg-black/30 rounded-full items-center justify-center"
                        >
                            <Text className="text-white text-lg">←</Text>
                        </TouchableOpacity>

                        <View className="flex-row gap-3">
                            {/* Share */}
                            <TouchableOpacity
                                onPress={handleShare}
                                className="w-10 h-10 bg-black/30 rounded-full items-center justify-center"
                            >
                                <Text style={{ fontSize: 16 }}>📤</Text>
                            </TouchableOpacity>

                            {/* Bookmark */}
                            <TouchableOpacity
                                onPress={handleBookmark}
                                className="w-10 h-10 bg-black/30 rounded-full items-center justify-center"
                            >
                                <Text style={{ fontSize: 16 }}>
                                    {bookmarked ? "🔖" : "🏷️"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Category + Price */}
                    <View className="absolute bottom-4 left-4 right-4 flex-row items-center justify-between">
                        <View className="bg-blue-500 px-3 py-1 rounded-full">
                            <Text className="text-white text-xs font-semibold capitalize">
                                {course.category}
                            </Text>
                        </View>
                        <View className="bg-white px-4 py-1 rounded-full">
                            <Text className="text-blue-500 font-bold text-base">
                                ${course.price.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Content */}
                <View className="px-5 pt-5">
                    {/* Title */}
                    <Text className="text-2xl font-bold text-gray-900 leading-8 mb-3">
                        {course.title}
                    </Text>

                    {/* Stats Row */}
                    <View className="flex-row items-center gap-4 mb-5">
                        <View className="flex-row items-center bg-amber-50 px-3 py-1.5 rounded-full">
                            <Text style={{ fontSize: 14 }}>⭐</Text>
                            <Text className="text-amber-600 font-bold text-sm ml-1">
                                {course.rating.toFixed(1)}
                            </Text>
                        </View>
                        <View className="flex-row items-center bg-green-50 px-3 py-1.5 rounded-full">
                            <Text style={{ fontSize: 14 }}>👥</Text>
                            <Text className="text-green-600 font-bold text-sm ml-1">
                                {Math.floor(Math.random() * 5000 + 500).toLocaleString()} students
                            </Text>
                        </View>
                        <View className="flex-row items-center bg-purple-50 px-3 py-1.5 rounded-full">
                            <Text style={{ fontSize: 14 }}>🕐</Text>
                            <Text className="text-purple-600 font-bold text-sm ml-1">
                                {Math.floor(Math.random() * 20 + 5)}h
                            </Text>
                        </View>
                    </View>

                    {/* Instructor Card */}
                    <View className="bg-gray-50 rounded-2xl p-4 mb-5 flex-row items-center">
                        <Image
                            source={{ uri: course.instructor.avatar }}
                            className="w-14 h-14 rounded-full bg-gray-200"
                        />
                        <View className="ml-3 flex-1">
                            <Text className="text-xs text-gray-400 font-medium uppercase tracking-widest">
                                Instructor
                            </Text>
                            <Text className="text-gray-900 font-bold text-base mt-0.5">
                                {course.instructor.name}
                            </Text>
                            <Text className="text-gray-500 text-sm" numberOfLines={1}>
                                {course.instructor.email}
                            </Text>
                        </View>
                        <View className="bg-blue-100 px-3 py-1 rounded-full">
                            <Text className="text-blue-600 text-xs font-semibold">
                                Expert
                            </Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View className="mb-5">
                        <Text className="text-lg font-bold text-gray-900 mb-3">
                            About This Course
                        </Text>
                        <Text className="text-gray-600 text-sm leading-6">
                            {course.description}
                        </Text>
                    </View>

                    {/* What You'll Learn */}
                    <View className="mb-5">
                        <Text className="text-lg font-bold text-gray-900 mb-3">
                            What You'll Learn
                        </Text>
                        <View className="bg-blue-50 rounded-2xl p-4 gap-3">
                            {[
                                "Core concepts and fundamentals",
                                "Hands-on practical projects",
                                "Industry best practices",
                                "Real-world applications",
                                "Certificate of completion",
                            ].map((item, index) => (
                                <View key={index} className="flex-row items-start">
                                    <View className="w-5 h-5 bg-blue-500 rounded-full items-center justify-center mt-0.5">
                                        <Text className="text-white text-xs font-bold">✓</Text>
                                    </View>
                                    <Text className="text-gray-700 text-sm ml-3 flex-1 leading-5">
                                        {item}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Course Includes */}
                    <View className="mb-5">
                        <Text className="text-lg font-bold text-gray-900 mb-3">
                            This Course Includes
                        </Text>
                        <View className="flex-row flex-wrap gap-3">
                            {[
                                { emoji: "📱", label: "Mobile Access" },
                                { emoji: "🏆", label: "Certificate" },
                                { emoji: "⬇️", label: "Downloads" },
                                { emoji: "♾️", label: "Full Lifetime" },
                                { emoji: "💬", label: "Community" },
                                { emoji: "🔄", label: "Updates" },
                            ].map((item, index) => (
                                <View
                                    key={index}
                                    className="flex-row items-center bg-gray-50 px-3 py-2 rounded-xl border border-gray-100"
                                >
                                    <Text style={{ fontSize: 14 }}>{item.emoji}</Text>
                                    <Text className="text-gray-700 text-xs font-medium ml-2">
                                        {item.label}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom CTA */}
            <View
                className="absolute bottom-0 left-0 right-0 bg-white px-5 py-4 border-t border-gray-100"
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.06,
                    shadowRadius: 12,
                    elevation: 10,
                }}
            >
                <View className="flex-row items-center gap-3">
                    {/* Bookmark Button */}
                    <TouchableOpacity
                        onPress={handleBookmark}
                        className={`w-14 h-14 rounded-2xl items-center justify-center border ${bookmarked
                            ? "bg-blue-50 border-blue-200"
                            : "bg-gray-50 border-gray-200"
                            }`}
                    >
                        <Text style={{ fontSize: 22 }}>{bookmarked ? "🔖" : "🏷️"}</Text>
                    </TouchableOpacity>

                    {/* Enroll Button */}
                    <TouchableOpacity
                        onPress={handleEnroll}
                        disabled={isEnrolling}
                        className={`flex-1 h-14 rounded-2xl items-center justify-center flex-row ${isEnrolled ? "bg-green-500" : "bg-blue-500"
                            } ${isEnrolling ? "opacity-70" : ""}`}
                    >
                        {isEnrolling ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={{ fontSize: 18 }}>
                                    {isEnrolled ? "▶️" : "🎓"}
                                </Text>
                                <Text className="text-white font-bold text-base ml-2">
                                    {isEnrolled ? "Continue Learning" : `Enroll — $${course.price.toFixed(2)}`}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}