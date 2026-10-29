import type {
    ApiResponse,
} from "../../types/api.types.ts";

import type {
    AdminCsrfTokenResponse,
    AdminLoginRequest,
    AdminLoginResponse,
    AdminLogoutResponse,
    AdminMeResponse,
} from "../../types/admin/admin-auth.types.ts";
import { apiRequest } from "@/app/lib/api/api-client";

const ADMIN_AUTH_BASE = "/admin/auth";

export const adminAuthService = {
    async login(
        credentials: AdminLoginRequest,
    ): Promise<AdminLoginResponse> {
        const response =
            await apiRequest<
                ApiResponse<AdminLoginResponse>
            >(
                `${ADMIN_AUTH_BASE}/login`,
                {
                    method: "POST",
                    body: credentials,
                },
            );

        if (!response.success) {
            throw new Error(
                response.error?.message ??
                    response.message ??
                    "Administrator login failed.",
            );
        }

        return response.data;
    },

    async getMe(): Promise<AdminMeResponse> {
        const response =
            await apiRequest<
                ApiResponse<AdminMeResponse>
            >(
                `${ADMIN_AUTH_BASE}/me`,
                {
                    method: "GET",
                },
            );

        if (!response.success) {
            throw new Error(
                response.error?.message ??
                    response.message ??
                    "Unable to retrieve administrator information.",
            );
        }

        return response.data;
    },

    async getCsrfToken(): Promise<AdminCsrfTokenResponse> {
        const response =
            await apiRequest<
                ApiResponse<AdminCsrfTokenResponse>
            >(
                `${ADMIN_AUTH_BASE}/csrf-token`,
                {
                    method: "GET",
                },
            );

        if (!response.success) {
            throw new Error(
                response.error?.message ??
                    response.message ??
                    "Unable to retrieve the administrator security token.",
            );
        }

        return response.data;
    },

    async logout(
        csrfToken: string,
    ): Promise<AdminLogoutResponse> {
        const response =
            await apiRequest<
                ApiResponse<{
                    message: string;
                }>
            >(
                `${ADMIN_AUTH_BASE}/logout`,
                {
                    method: "POST",
                    csrfToken,
                },
            );

        if (!response.success) {
            throw new Error(
                response.error?.message ??
                    response.message ??
                    "Administrator logout failed.",
            );
        }

        return {
            message: response.message ??
                "Administrator logged out successfully.",
        };
    },
};