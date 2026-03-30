import {
    View,
    Text,
    FlatList,
} from "react-native";
import { useBookmarks } from "@/store/BookmarkContext";
import { useCourses } from "@/store/CourseContext";
import CourseCard from "@/components/course/CourseCard";

export default function BookmarksScreen() {
    const { bookmarks } = useBookmarks();
    const { courses } = useCourses();

    const bookmarkedCourses = courses.filter((course) =>
        bookmarks.includes(course.id)
    );

    if (bookmarkedCourses.length === 0) {
        return (
            <View className="flex-1 bg-gray-50 items-center justify-center px-8">
                <Text style={{ fontSize: 56 }}>🔖</Text>
                <Text className="text-gray-900 font-bold text-xl mt-4 text-center">
                    No bookmarks yet
                </Text>
                <Text className="text-gray-500 text-sm mt-2 text-center">
                    Tap the bookmark icon on any course to save it here
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <FlatList
                data={bookmarkedCourses}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <CourseCard course={item} />}
                ListHeaderComponent={
                    <View className="px-4 pt-5 pb-4">
                        <Text className="text-2xl font-bold text-gray-900">
                            Saved Courses
                        </Text>
                        <Text className="text-gray-500 text-sm mt-1">
                            {bookmarkedCourses.length} bookmarked
                        </Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
}