import { apiRequest } from "@/app/lib/api/api-client";

import type { ApiResponse } from "@/app/types/api.types";

import type {
    AdminUserActionApiResponse,
    AdminUserDetails,
    AdminUserEmailRequest,
    AdminUserRoleUpdateRequest,
    AdminUserStats,
    AdminUsersApiResponse,
    AdminUsersListResponse,
    AdminUsersQuery,
    AdminUserStatusActionRequest,
    AdminUser,
    AdminUserStatsApiResponse,
    AdminUserApiResponse,
} from "@/app/types/admin/admin-users.types";

const ADMIN_USERS_BASE = "/admin/users";

// ============================================================
// RESPONSE HANDLING
// ============================================================

function unwrapResponse<T>(
    response: ApiResponse<T>,
    fallback: string,
): T {
    if (!response.success) {
        throw new Error(
            response.error?.message ??
                response.message ??
                fallback,
        );
    }

    return response.data;
}

function unwrapActionResponse(
    response: AdminUserActionApiResponse,
    fallback: string,
): void {
    if (!response.success) {
        throw new Error(
            response.error?.message ??
                response.message ??
                fallback,
        );
    }
}

// ============================================================
// QUERY STRING
// ============================================================

function buildQueryString(
    query: AdminUsersQuery = {},
): string {
    const params = new URLSearchParams();

    if (query.type) {
        params.set("type", query.type);
    }

    if (query.status) {
        params.set("status", query.status);
    }

    if (query.search?.trim()) {
        params.set("search", query.search.trim());
    }

    if (query.page !== undefined) {
        params.set("page", String(query.page));
    }

    if (query.limit !== undefined) {
        params.set("limit", String(query.limit));
    }

    if (query.sort) {
        params.set("sort", query.sort);
    }

    const queryString = params.toString();

    return queryString ? `?${queryString}` : "";
}

// ============================================================
// SERVICE
// ============================================================

export const adminUsersService = {
    // --------------------------------------------------------
    // LIST USERS
    // GET /admin/users
    // --------------------------------------------------------

    async list(
        query: AdminUsersQuery = {},
    ): Promise<AdminUsersListResponse> {
        const response =
            await apiRequest<AdminUsersApiResponse>(
                `${ADMIN_USERS_BASE}${buildQueryString(query)}`,
                {
                    method: "GET",
                },
            );

        const items = unwrapResponse<AdminUser[]>(
            response,
            "Unable to retrieve users.",
        );

        return {
            items,
            pagination: response.pagination,
        };
    },

    // --------------------------------------------------------
    // USER STATISTICS
    // GET /admin/users/stats
    // --------------------------------------------------------

    async getStats(): Promise<AdminUserStats> {
        const response =
            await apiRequest<AdminUserStatsApiResponse>(
                `${ADMIN_USERS_BASE}/stats`,
                {
                    method: "GET",
                },
            );

        return unwrapResponse(
            response,
            "Unable to retrieve user statistics.",
        );
    },

    // --------------------------------------------------------
    // USER DETAILS
    // GET /admin/users/:userId
    // --------------------------------------------------------

    async getById(
        userId: string,
    ): Promise<AdminUserDetails> {
        const response =
            await apiRequest<AdminUserApiResponse>(
                `${ADMIN_USERS_BASE}/${encodeURIComponent(userId)}`,
                {
                    method: "GET",
                },
            );

        return unwrapResponse(
            response,
            "Unable to retrieve user details.",
        );
    },

    // --------------------------------------------------------
    // SUSPEND USER
    // POST /admin/users/:userId/suspend
    // --------------------------------------------------------

    async suspend(
        userId: string,
        input: AdminUserStatusActionRequest = {},
        csrfToken?: string,
    ): Promise<void> {
        const response =
            await apiRequest<AdminUserActionApiResponse>(
                `${ADMIN_USERS_BASE}/${encodeURIComponent(userId)}/suspend`,
                {
                    method: "POST",
                    body: input,
                    csrfToken,
                },
            );

        unwrapActionResponse(
            response,
            "Unable to suspend this user.",
        );
    },

    // --------------------------------------------------------
    // RESTORE USER
    // POST /admin/users/:userId/unsuspend
    // --------------------------------------------------------

    async unsuspend(
        userId: string,
        input: AdminUserStatusActionRequest = {},
        csrfToken?: string,
    ): Promise<void> {
        const response =
            await apiRequest<AdminUserActionApiResponse>(
                `${ADMIN_USERS_BASE}/${encodeURIComponent(userId)}/unsuspend`,
                {
                    method: "POST",
                    body: input,
                    csrfToken
                },
            );

        unwrapActionResponse(
            response,
            "Unable to restore this user.",
        );
    },

    // --------------------------------------------------------
    // DELETE USER
    // DELETE /admin/users/:userId
    // --------------------------------------------------------

    async delete(
        userId: string,
        input: AdminUserStatusActionRequest = {},
        csrfToken?: string,
    ): Promise<void> {
        const response =
            await apiRequest<AdminUserActionApiResponse>(
                `${ADMIN_USERS_BASE}/${encodeURIComponent(userId)}`,
                {
                    method: "DELETE",
                    body: input,
                    csrfToken,
                },
            );

        unwrapActionResponse(
            response,
            "Unable to delete this user.",
        );
    },

    // --------------------------------------------------------
    // UPDATE USER ROLES
    // PATCH /admin/users/:userId/roles
    // --------------------------------------------------------

    async updateRoles(
        userId: string,
        input: AdminUserRoleUpdateRequest,
        csrfToken?: string,
    ): Promise<void> {
        const response =
            await apiRequest<AdminUserActionApiResponse>(
                `${ADMIN_USERS_BASE}/${encodeURIComponent(userId)}/roles`,
                {
                    method: "PATCH",
                    body: input,
                    csrfToken,
                },
            );

        unwrapActionResponse(
            response,
            "Unable to update user roles.",
        );
    },

    // --------------------------------------------------------
    // SEND USER EMAIL
    // POST /admin/users/:userId/email
    // --------------------------------------------------------

    async sendEmail(
        userId: string,
        input: AdminUserEmailRequest,
        csrfToken?: string,
    ): Promise<void> {
        const response =
            await apiRequest<AdminUserActionApiResponse>(
                `${ADMIN_USERS_BASE}/${encodeURIComponent(userId)}/email`,
                {
                    method: "POST",
                    body: input,
                    csrfToken,
                },
            );

        unwrapActionResponse(
            response,
            "Unable to send email to this user.",
        );
    },
};