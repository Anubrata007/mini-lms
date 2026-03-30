import client from "./client";
import {
    AuthResponse,
    LoginCredentials,
    RegisterCredentials,
} from "@/types/auth.types";

export const authApi = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await client.post<AuthResponse>(
            "/api/v1/users/login",
            credentials
        );
        return response.data;
    },

    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        const response = await client.post<AuthResponse>(
            "/api/v1/users/register",
            credentials
        );
        return response.data;
    },

    async logout(): Promise<void> {
        await client.post("/api/v1/users/logout");
    },

    async getProfile(): Promise<AuthResponse> {
        const response = await client.get<AuthResponse>(
            "/api/v1/users/current-user"
        );
        return response.data;
    },
};