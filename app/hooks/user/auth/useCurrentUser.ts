"use client";

import {
    useQuery,
    type UseQueryResult,
} from "@tanstack/react-query";

import { queryKeys } from "@/app/lib/query/query-keys";
import { ApiError } from "@/app/lib/api/api-error";
import { authService } from "@/app/services/user/auth/auth.service";
import type { AuthUser } from "@/app/types/user/auth.types";

export function useCurrentUser(): UseQueryResult<AuthUser | null> {
    return useQuery({
        queryKey: queryKeys.auth.currentUser(),

        queryFn: async (): Promise<AuthUser | null> => {
            try {
                const response = await authService.getCurrentUser();

                return response.data.user;
            } catch (error: unknown) {
                if (
                    error instanceof ApiError &&
                    error.status === 401
                ) {
                    return null;
                }

                throw error;
            }
        },

        retry: false,

        // Keep account details reasonably fresh.
        staleTime: 5_000,

        // Recheck account details when the user returns to the app.
        refetchOnWindowFocus: true,

        // Recheck after reconnecting.
        refetchOnReconnect: true,

        // Always fetch again when the query is explicitly invalidated.
        refetchOnMount: true,
    });
}