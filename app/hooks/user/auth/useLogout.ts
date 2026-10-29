"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/app/lib/query/query-keys";
import { authService } from "@/app/services/user/auth/auth.service";

export function useLogout() {
    const router = useRouter();

    const queryClient = useQueryClient();

    const [isLoggingOut, setIsLoggingOut] =
        useState(false);

    async function logout(): Promise<void> {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);

        try {
            await authService.logout();
        } finally {
            /*
             * Always clear locally cached private data,
             * even if the server request fails.
             *
             * A failed network request does not guarantee
             * that the backend session was revoked.
             */
            queryClient.removeQueries({
                queryKey: queryKeys.auth.all,
            });

            await queryClient.cancelQueries();

            router.replace("/login");

            router.refresh();

            setIsLoggingOut(false);
        }
    }

    return {
        logout,
        isLoggingOut,
    };
}