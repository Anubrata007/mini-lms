import React, { memo, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Course } from "@/types/course.types";
import { useBookmarks } from "@/store/BookmarkContext";

interface CourseCardProps {
    course: Course;
}

function CourseCard({ course }: CourseCardProps) {
    const router = useRouter();
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const bookmarked = isBookmarked(course.id);
    const [imgError, setImgError] = useState(false);

    const thumbnailUri = imgError
        ? `https://picsum.photos/seed/${course.id}/600/400`
        : course.thumbnail;

    return (
        <TouchableOpacity
            className="bg-white mx-4 mb-4 rounded-2xl overflow-hidden"
            style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 3,
            }}
            onPress={() => router.push(`/course/${course.id}`)}
            activeOpacity={0.92}
        >
            {/* Thumbnail */}
            <View className="relative">
                <Image
                    source={{ uri: thumbnailUri }}
                    className="w-full h-44"
                    resizeMode="cover"
                    onError={() => setImgError(true)}
                />

                {/* Category Badge */}
                <View className="absolute top-3 left-3 bg-blue-500 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-semibold capitalize">
                        {course.category}
                    </Text>
                </View>

                {/* Bookmark Button */}
                <TouchableOpacity
                    onPress={() => toggleBookmark(course.id)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full items-center justify-center"
                    style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 2,
                    }}
                >
                    <Text style={{ fontSize: 16 }}>{bookmarked ? "🔖" : "🏷️"}</Text>
                </TouchableOpacity>

                {/* Price Tag */}
                <View className="absolute bottom-3 right-3 bg-white px-3 py-1 rounded-full">
                    <Text className="text-blue-500 font-bold text-sm">
                        ${course.price.toFixed(2)}
                    </Text>
                </View>
            </View>

            {/* Content */}
            <View className="p-4">
                <Text
                    className="text-gray-900 font-bold text-base leading-5 mb-2"
                    numberOfLines={2}
                >
                    {course.title}
                </Text>

                <Text
                    className="text-gray-500 text-sm leading-5 mb-3"
                    numberOfLines={2}
                >
                    {course.description}
                </Text>

                <View className="h-px bg-gray-100 mb-3" />

                <View className="flex-row items-center justify-between">
                    {/* Instructor */}
                    <View className="flex-row items-center flex-1">
                        <Image
                            source={{ uri: course.instructor.avatar }}
                            className="w-7 h-7 rounded-full bg-gray-200"
                            onError={() => { }}
                        />
                        <Text
                            className="text-gray-600 text-xs ml-2 flex-1"
                            numberOfLines={1}
                        >
                            {course.instructor.name}
                        </Text>
                    </View>

                    {/* Rating */}
                    <View className="flex-row items-center bg-amber-50 px-2 py-1 rounded-full">
                        <Text style={{ fontSize: 12 }}>⭐</Text>
                        <Text className="text-amber-600 text-xs font-semibold ml-1">
                            {course.rating.toFixed(1)}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default memo(CourseCard);