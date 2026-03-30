import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
import { appStorage } from "@/services/storage";
import { STORAGE_KEYS } from "@/utils/constants";
import {
    notifyBookmarkMilestone,
    notifyBookmarkUpdate,
} from "@/services/notifications";

interface BookmarkContextType {
    bookmarks: string[];
    toggleBookmark: (courseId: string) => void;
    isBookmarked: (courseId: string) => boolean;
    bookmarkCount: number;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(
    undefined
);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
    const [bookmarks, setBookmarks] = useState<string[]>([]);

    useEffect(() => {
        const loadBookmarks = async () => {
            const stored = await appStorage.get<string[]>(STORAGE_KEYS.BOOKMARKS);
            if (stored) setBookmarks(stored);
        };
        loadBookmarks();
    }, []);

    const toggleBookmark = useCallback(
        async (courseId: string) => {
            const isRemoving = bookmarks.includes(courseId);
            const updated = isRemoving
                ? bookmarks.filter((id) => id !== courseId)
                : [...bookmarks, courseId];

            setBookmarks(updated);
            await appStorage.set(STORAGE_KEYS.BOOKMARKS, updated);

            // Fire notifications when adding bookmarks
            if (!isRemoving) {
                const newCount = updated.length;

                // Exactly 5 bookmarks — milestone notification
                if (newCount === 5) {
                    await notifyBookmarkMilestone(newCount);
                }

                // More than 5 — periodic update notification
                if (newCount > 5 && newCount % 5 === 0) {
                    await notifyBookmarkUpdate(newCount);
                }
            }
        },
        [bookmarks]
    );

    const isBookmarked = useCallback(
        (courseId: string) => bookmarks.includes(courseId),
        [bookmarks]
    );

    return (
        <BookmarkContext.Provider
            value={{
                bookmarks,
                toggleBookmark,
                isBookmarked,
                bookmarkCount: bookmarks.length,
            }}
        >
            {children}
        </BookmarkContext.Provider>
    );
}

export function useBookmarks() {
    const context = useContext(BookmarkContext);
    if (!context) {
        throw new Error("useBookmarks must be used within a BookmarkProvider");
    }
    return context;
}