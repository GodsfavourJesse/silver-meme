"use client";

import { useCurrentUser } from "./useCurrentUser";


export function useAuth() {
    const query = useCurrentUser();

    const user = query.data ?? null;

    return {
        user,

        isAuthenticated: Boolean(user),

        isLoading: query.isPending,

        isError: query.isError,

        error: query.error,

        refetch: query.refetch,
    };
}