export interface Instructor {
    id: string;
    name: string;
    avatar: string;
    email: string;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    price: number;
    category: string;
    rating: number;
    instructor: Instructor;
    isBookmarked: boolean;
    isEnrolled: boolean;
}

// Raw API shapes
export interface RawProduct {
    id: number;
    title: string;
    description: string;
    price: number;
    category: string;
    rating: number;
    thumbnail: string;
}

export interface RawUser {
    id: number;
    firstName: string;
    lastName: string;
    image: string;
    email: string;
}

export interface ProductsApiResponse {
    statusCode: number;
    data: {
        data: RawProduct[];
        page: number;
        limit: number;
        totalPages: number;
        totalItems: number;
        hasPrevPage: boolean;
        hasNextPage: boolean;
    };
    message: string;
    success: boolean;
}

export interface UsersApiResponse {
    statusCode: number;
    data: {
        data: RawUser[];
        page: number;
        limit: number;
        totalPages: number;
        totalItems: number;
    };
    message: string;
    success: boolean;
}