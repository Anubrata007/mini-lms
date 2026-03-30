import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

function SkeletonBox({
    className,
    style,
}: {
    className?: string;
    style?: object;
}) {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [opacity]);

    return (
        <Animated.View
            style={[{ opacity, backgroundColor: "#e5e7eb" }, style]}
            className={className}
        />
    );
}

export default function CourseCardSkeleton() {
    return (
        <View
            className="bg-white mx-4 mb-4 rounded-2xl overflow-hidden"
            style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 3,
            }}
        >
            {/* Thumbnail Skeleton */}
            <SkeletonBox style={{ width: "100%", height: 176 }} />

            <View className="p-4">
                {/* Title */}
                <SkeletonBox
                    style={{ height: 16, borderRadius: 8, marginBottom: 8 }}
                />
                <SkeletonBox
                    style={{ height: 16, borderRadius: 8, width: "70%", marginBottom: 12 }}
                />

                {/* Description */}
                <SkeletonBox
                    style={{ height: 12, borderRadius: 6, marginBottom: 6 }}
                />
                <SkeletonBox
                    style={{ height: 12, borderRadius: 6, width: "85%", marginBottom: 16 }}
                />

                {/* Divider */}
                <View className="h-px bg-gray-100 mb-3" />

                {/* Bottom Row */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <SkeletonBox
                            style={{ width: 28, height: 28, borderRadius: 14 }}
                        />
                        <SkeletonBox
                            style={{ height: 12, width: 80, borderRadius: 6, marginLeft: 8 }}
                        />
                    </View>
                    <SkeletonBox
                        style={{ height: 24, width: 50, borderRadius: 12 }}
                    />
                </View>
            </View>
        </View>
    );
}