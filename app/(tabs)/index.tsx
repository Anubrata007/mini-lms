import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useEffect } from "react";
import { useCourses } from "@/store/CourseContext";
import CourseCard from "@/components/course/CourseCard";
import CourseCardSkeleton from "@/components/course/CourseCardSkeleton";
import SearchBar from "@/components/course/SearchBar";
import ErrorBanner from "@/components/ui/ErrorBanner";
import OfflineBanner from "@/components/ui/OfflineBanner";

export default function CoursesScreen() {
  const {
    filteredCourses,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasNextPage,
    error,
    searchQuery,
    fetchCourses,
    refreshCourses,
    loadMoreCourses,
    setSearchQuery,
  } = useCourses();

  useEffect(() => {
    fetchCourses();
  }, []);

  const renderFooter = () => {
    if (!isLoadingMore) return <View className="h-6" />;
    return (
      <View className="py-6 items-center">
        <ActivityIndicator color="#3b82f6" />
        <Text className="text-gray-400 text-xs mt-2">Loading more...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Text style={{ fontSize: 48 }}>🔍</Text>
        <Text className="text-gray-700 font-semibold text-lg mt-4">
          No courses found
        </Text>
        <Text className="text-gray-400 text-sm mt-2 text-center px-8">
          Try searching with different keywords
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <OfflineBanner />

      <FlatList
        data={isLoading ? [] : filteredCourses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CourseCard course={item} />}
        ListHeaderComponent={
          <View>
            {/* Section Title */}
            <View className="px-4 pt-5 pb-4">
              <Text className="text-2xl font-bold text-gray-900">
                Explore Courses
              </Text>
              <Text className="text-gray-500 text-sm mt-1">
                {filteredCourses.length} courses available
              </Text>
            </View>

            {/* Search Bar */}
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {/* Error Banner */}
            {error && (
              <ErrorBanner
                message={error}
                onRetry={fetchCourses}
              />
            )}

            {/* Skeleton Loaders */}
            {isLoading && (
              <View>
                {[1, 2, 3].map((i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </View>
            )}
          </View>
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={() => {
          if (hasNextPage && !isLoadingMore && searchQuery === "") {
            loadMoreCourses();
          }
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshCourses}
            colors={["#3b82f6"]}
            tintColor="#3b82f6"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}