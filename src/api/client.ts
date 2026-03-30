import axios, {
    AxiosInstance,
    AxiosError,
    InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL, STORAGE_KEYS } from "@/utils/constants";
import { secureStorage } from "@/services/storage";

const client: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// ── Request interceptor — attach token ─────────────────────────────────────
client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await secureStorage.get(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor — handle errors ───────────────────────────────────
client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // Token expired — attempt refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await secureStorage.get(
                    STORAGE_KEYS.REFRESH_TOKEN
                );

                if (!refreshToken) {
                    return Promise.reject(error);
                }

                const response = await axios.post(
                    `${API_BASE_URL}/api/v1/users/refresh-token`,
                    { refreshToken }
                );

                const { accessToken } = response.data.data;
                await secureStorage.set(STORAGE_KEYS.AUTH_TOKEN, accessToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return client(originalRequest);
            } catch {
                // Refresh failed — clear tokens
                await secureStorage.delete(STORAGE_KEYS.AUTH_TOKEN);
                await secureStorage.delete(STORAGE_KEYS.REFRESH_TOKEN);
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default client;