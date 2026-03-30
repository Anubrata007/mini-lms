export interface ApiResponse<T> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
}

export interface ApiError {
    statusCode: number;
    message: string;
    errors: string[];
    success: false;
}