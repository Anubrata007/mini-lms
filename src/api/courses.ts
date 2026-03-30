import client from "./client";
import { ProductsApiResponse, UsersApiResponse } from "@/types/course.types";

export const coursesApi = {
    async getProducts(page = 1, limit = 10): Promise<ProductsApiResponse> {
        const response = await client.get<ProductsApiResponse>(
            `/api/v1/public/randomproducts?page=${page}&limit=${limit}`
        );
        // Debug — check thumbnail URLs
        console.log(
            "THUMBNAILS:",
            response.data.data.data.map((p) => p.thumbnail)
        );
        return response.data;
    },

    async getInstructors(page = 1, limit = 10): Promise<UsersApiResponse> {
        const response = await client.get<UsersApiResponse>(
            `/api/v1/public/randomusers?page=${page}&limit=${limit}`
        );
        return response.data;
    },
};