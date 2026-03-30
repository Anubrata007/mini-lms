import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useRef,
} from "react";
import { coursesApi } from "@/api/courses";
import { Course, RawProduct, RawUser } from "@/types/course.types";

// ── Map raw API data directly into Course shape ────────────────────────────

function mapToCourse(
    product: RawProduct,
    user: RawUser,
): Course {
    return {
        id: String(product.id),
        title: product.title,
        description: product.description,
        thumbnail: product.thumbnail,
        price: product.price,
        category: product.category,
        rating: product.rating,
        instructor: {
            id: String(user.id),
            name: `${user.firstName} ${user.lastName}`,
            avatar:
                user.image ||
                `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=3b82f6&color=fff&size=100`,
            email: user.email,
        },
        isBookmarked: false,
        isEnrolled: false,
    };
}

// ── Context Types ──────────────────────────────────────────────────────────

interface CourseContextType {
    courses: Course[];
    isLoading: boolean;
    isRefreshing: boolean;
    isLoadingMore: boolean;
    hasNextPage: boolean;
    error: string | null;
    searchQuery: string;
    filteredCourses: Course[];
    fetchCourses: () => Promise<void>;
    refreshCourses: () => Promise<void>;
    loadMoreCourses: () => Promise<void>;
    setSearchQuery: (query: string) => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────────────────

export function CourseProvider({ children }: { children: React.ReactNode }) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const currentPage = useRef(1);

    const fetchCourses = useCallback(async () => {
        if (isLoading) return;
        setIsLoading(true);
        setError(null);
        try {
            currentPage.current = 1;
            const [productsRes, usersRes] = await Promise.all([
                coursesApi.getProducts(1, 10),
                coursesApi.getInstructors(1, 10),
            ]);

            const products = productsRes.data.data;
            const users = usersRes.data.data;

            const mapped = products.map((product, index) =>
                mapToCourse(product, users[index % users.length])
            );

            setCourses(mapped);
            setHasNextPage(productsRes.data.hasNextPage);
        } catch {
            setError("Failed to load courses. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [isLoading]);

    const refreshCourses = useCallback(async () => {
        setIsRefreshing(true);
        setError(null);
        try {
            currentPage.current = 1;
            const [productsRes, usersRes] = await Promise.all([
                coursesApi.getProducts(1, 10),
                coursesApi.getInstructors(1, 10),
            ]);

            const products = productsRes.data.data;
            const users = usersRes.data.data;

            const mapped = products.map((product, index) =>
                mapToCourse(product, users[index % users.length])
            );

            setCourses(mapped);
            setHasNextPage(productsRes.data.hasNextPage);
        } catch {
            setError("Failed to refresh courses.");
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    const loadMoreCourses = useCallback(async () => {
        if (isLoadingMore || !hasNextPage) return;
        setIsLoadingMore(true);
        try {
            const nextPage = currentPage.current + 1;
            const [productsRes, usersRes] = await Promise.all([
                coursesApi.getProducts(nextPage, 10),
                coursesApi.getInstructors(nextPage, 10),
            ]);

            const products = productsRes.data.data;
            const users = usersRes.data.data;

            if (products.length === 0) {
                setHasNextPage(false);
                return;
            }

            const mapped = products.map((product, index) =>
                mapToCourse(product, users[index % users.length])
            );

            setCourses((prev) => [...prev, ...mapped]);
            setHasNextPage(productsRes.data.hasNextPage);
            currentPage.current = nextPage;
        } catch {
            setError("Failed to load more courses.");
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, hasNextPage]);

    const filteredCourses = courses.filter(
        (course) =>
            searchQuery === "" ||
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.instructor.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
    );

    return (
        <CourseContext.Provider
            value={{
                courses,
                isLoading,
                isRefreshing,
                isLoadingMore,
                hasNextPage,
                error,
                searchQuery,
                filteredCourses,
                fetchCourses,
                refreshCourses,
                loadMoreCourses,
                setSearchQuery,
            }}
        >
            {children}
        </CourseContext.Provider>
    );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useCourses() {
    const context = useContext(CourseContext);
    if (!context) {
        throw new Error("useCourses must be used within a CourseProvider");
    }
    return context;
}