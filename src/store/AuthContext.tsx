import React, {
    createContext,
    useContext,
    useEffect,
    useReducer,
    useCallback,
} from "react";
import { authApi } from "@/api/auth";
import { secureStorage, appStorage } from "@/services/storage";
import { STORAGE_KEYS } from "@/utils/constants";
import {
    AuthState,
    User,
    LoginCredentials,
    RegisterCredentials,
} from "@/types/auth.types";

// ── Types ──────────────────────────────────────────────────────────────────

type AuthAction =
    | { type: "SET_LOADING"; payload: boolean }
    | {
        type: "SET_AUTH";
        payload: { user: User; accessToken: string; refreshToken: string };
    }
    | { type: "CLEAR_AUTH" }
    | { type: "UPDATE_USER"; payload: User };

interface AuthContextType {
    state: AuthState;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => Promise<void>;
}

// ── Initial State ──────────────────────────────────────────────────────────

const initialState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
};

// ── Reducer ────────────────────────────────────────────────────────────────

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "SET_LOADING":
            return { ...state, isLoading: action.payload };
        case "SET_AUTH":
            return {
                ...state,
                user: action.payload.user,
                accessToken: action.payload.accessToken,
                refreshToken: action.payload.refreshToken,
                isAuthenticated: true,
                isLoading: false,
            };
        case "CLEAR_AUTH":
            return { ...initialState, isLoading: false };
        case "UPDATE_USER":
            return { ...state, user: action.payload };
        default:
            return state;
    }
}

// ── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // ── Auto-login on app start ──────────────────────────────────────────────
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const accessToken = await secureStorage.get(STORAGE_KEYS.AUTH_TOKEN);
                const refreshToken = await secureStorage.get(STORAGE_KEYS.REFRESH_TOKEN);
                const user = await appStorage.get<User>(STORAGE_KEYS.USER_DATA);

                if (accessToken && refreshToken && user) {
                    dispatch({
                        type: "SET_AUTH",
                        payload: { user, accessToken, refreshToken },
                    });
                } else {
                    dispatch({ type: "SET_LOADING", payload: false });
                }
            } catch {
                dispatch({ type: "SET_LOADING", payload: false });
            }
        };

        restoreSession();
    }, []);

    // ── Login ────────────────────────────────────────────────────────────────
    const login = useCallback(async (credentials: LoginCredentials) => {
        dispatch({ type: "SET_LOADING", payload: true });
        try {
            const response = await authApi.login(credentials);

            // Exact path confirmed from logs: response.data.user/accessToken/refreshToken
            const { user, accessToken, refreshToken } = response.data;

            await secureStorage.set(STORAGE_KEYS.AUTH_TOKEN, accessToken);
            await secureStorage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
            await appStorage.set(STORAGE_KEYS.USER_DATA, user);

            dispatch({
                type: "SET_AUTH",
                payload: { user, accessToken, refreshToken },
            });
        } catch (error) {
            dispatch({ type: "SET_LOADING", payload: false });
            throw error;
        }
    }, []);

    // ── Register ─────────────────────────────────────────────────────────────
    const register = useCallback(async (credentials: RegisterCredentials) => {
        dispatch({ type: "SET_LOADING", payload: true });
        try {
            await authApi.register(credentials);
            // freeapi.app register does NOT return tokens
            // User must verify email then login separately
            dispatch({ type: "SET_LOADING", payload: false });
        } catch (error) {
            dispatch({ type: "SET_LOADING", payload: false });
            throw error;
        }
    }, []);

    // ── Logout ───────────────────────────────────────────────────────────────
    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch {
            // Continue logout even if API call fails
        } finally {
            await secureStorage.delete(STORAGE_KEYS.AUTH_TOKEN);
            await secureStorage.delete(STORAGE_KEYS.REFRESH_TOKEN);
            await appStorage.delete(STORAGE_KEYS.USER_DATA);
            dispatch({ type: "CLEAR_AUTH" });
        }
    }, []);

    return (
        <AuthContext.Provider value={{ state, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}