"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    adminUsersService,
} from "@/app/services/admin/admin-users.service";

import {
    adminUsersQueryKeys,
} from "./admin-users-query-keys";

import type {
    AdminUserEmailRequest,
    AdminUserRoleUpdateRequest,
    AdminUserStatusActionRequest,
} from "@/app/types/admin/admin-users.types";
import { useAdminCsrfToken } from "../admin-auth/use-admin-csrf-token";

// ============================================================
// MUTATION INPUTS
// ============================================================

interface UserActionInput {
    userId: string;
    input?: AdminUserStatusActionRequest;
}

interface UserRoleActionInput {
    userId: string;
    input: AdminUserRoleUpdateRequest;
}

interface UserEmailActionInput {
    userId: string;
    input: AdminUserEmailRequest;
}

// ============================================================
// HOOK
// ============================================================

export function useAdminUserActions() {
    const queryClient = useQueryClient();

    const csrfQuery = useAdminCsrfToken();

    // --------------------------------------------------------
    // CSRF TOKEN
    // --------------------------------------------------------

    async function getCsrfToken(): Promise<string> {
        let token = csrfQuery.data?.csrfToken;

        /*
         * Reuse the cached token when available.
         * Otherwise, request a fresh token before performing
         * the protected operation.
         */

        if (!token) {
            const result = await csrfQuery.refetch();

            if (result.isError) {
                throw result.error;
            }

            token = result.data?.csrfToken;
        }

        if (!token) {
            throw new Error(
                "Unable to obtain a CSRF token. Please refresh the page and try again.",
            );
        }

        return token;
    }

    // --------------------------------------------------------
    // CACHE INVALIDATION
    // --------------------------------------------------------

    async function invalidateUserData(userId: string) {
        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: adminUsersQueryKeys.lists(),
            }),

            queryClient.invalidateQueries({
                queryKey: adminUsersQueryKeys.stats(),
            }),

            queryClient.invalidateQueries({
                queryKey: adminUsersQueryKeys.detail(userId),
            }),
        ]);
    }

    // --------------------------------------------------------
    // SUSPEND USER
    // --------------------------------------------------------

    const suspend = useMutation({
        mutationFn: async ({
            userId,
            input = {},
        }: UserActionInput) => {
            const csrfToken = await getCsrfToken();

            return adminUsersService.suspend(
                userId,
                input,
                csrfToken,
            );
        },

        onSuccess: async (_, variables) => {
            await invalidateUserData(variables.userId);
        },
    });

    // --------------------------------------------------------
    // UNSUSPEND USER
    // --------------------------------------------------------

    const unsuspend = useMutation({
        mutationFn: async ({
            userId,
            input = {},
        }: UserActionInput) => {
            const csrfToken = await getCsrfToken();

            return adminUsersService.unsuspend(
                userId,
                input,
                csrfToken,
            );
        },

        onSuccess: async (_, variables) => {
            await invalidateUserData(variables.userId);
        },
    });

    // --------------------------------------------------------
    // DELETE USER
    // --------------------------------------------------------

    const deleteUser = useMutation({
        mutationFn: async ({
            userId,
            input = {},
        }: UserActionInput) => {
            const csrfToken = await getCsrfToken();

            return adminUsersService.delete(
                userId,
                input,
                csrfToken,
            );
        },

        onSuccess: async (_, variables) => {
            await invalidateUserData(variables.userId);
        },
    });

    // --------------------------------------------------------
    // UPDATE USER ROLES
    // --------------------------------------------------------

    const updateRoles = useMutation({
        mutationFn: async ({
            userId,
            input,
        }: UserRoleActionInput) => {
            const csrfToken = await getCsrfToken();

            return adminUsersService.updateRoles(
                userId,
                input,
                csrfToken,
            );
        },

        onSuccess: async (_, variables) => {
            await invalidateUserData(variables.userId);
        },
    });

    // --------------------------------------------------------
    // SEND EMAIL
    // --------------------------------------------------------

    const sendEmail = useMutation({
        mutationFn: async ({
            userId,
            input,
        }: UserEmailActionInput) => {
            const csrfToken = await getCsrfToken();

            return adminUsersService.sendEmail(
                userId,
                input,
                csrfToken,
            );
        },
    });

    // --------------------------------------------------------
    // RETURN
    // --------------------------------------------------------

    return {
        suspend,
        unsuspend,
        deleteUser,
        updateRoles,
        sendEmail,

        isWorking:
            suspend.isPending ||
            unsuspend.isPending ||
            deleteUser.isPending ||
            updateRoles.isPending ||
            sendEmail.isPending,
    };
}