import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Secure Store (for sensitive data like tokens)

export const secureStorage = {
    async set(key: string, value: string): Promise<void> {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (error) {
            console.error(`SecureStore set error [${key}]:`, error);
            throw error;
        }
    },

    async get(key: string): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync(key);
        } catch (error) {
            console.error(`SecureStore get error [${key}]:`, error);
            return null;
        }
    },

    async delete(key: string): Promise<void> {
        try {
            await SecureStore.deleteItemAsync(key);
        } catch (error) {
            console.error(`SecureStore delete error [${key}]:`, error);
            throw error;
        }
    },
};

// Async Storage (for non-sensitive app data)

export const appStorage = {
    async set<T>(key: string, value: T): Promise<void> {
        try {
            const serialized = JSON.stringify(value);
            await AsyncStorage.setItem(key, serialized);
        } catch (error) {
            console.error(`AsyncStorage set error [${key}]:`, error);
            throw error;
        }
    },

    async get<T>(key: string): Promise<T | null> {
        try {
            const item = await AsyncStorage.getItem(key);
            if (item === null) return null;
            return JSON.parse(item) as T;
        } catch (error) {
            console.error(`AsyncStorage get error [${key}]:`, error);
            return null;
        }
    },

    async delete(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error(`AsyncStorage delete error [${key}]:`, error);
            throw error;
        }
    },

    async clear(): Promise<void> {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error("AsyncStorage clear error:", error);
            throw error;
        }
    },
};