export interface User {
    _id: string;
    email: string;
    username: string;
    avatar: {
        url: string;
        localPath: string;
        _id: string;
    };
    role: string;
    loginType: string;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    username: string;
    password: string;
    role: "USER" | "ADMIN";
}

export interface AuthResponse {
    statusCode: number;
    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
    };
    message: string;
    success: boolean;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}