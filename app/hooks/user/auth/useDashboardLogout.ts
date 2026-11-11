"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { authService } from "@/app/services/user/auth/auth.service";
import { queryKeys } from "@/app/lib/query/query-keys";

export function useDashboardLogout() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const logoutStarted = useRef(false);

    const handleLogout = useCallback(async () => {
        // Prevent multiple logout requests.
        if (logoutStarted.current) return;

        logoutStarted.current = true;
        setIsLoggingOut(true);

        try {
            await authService.logout();
        } catch {
            // Continue with local cleanup even if the API request fails.
        } finally {
            try {
                await queryClient.cancelQueries({
                    queryKey: queryKeys.auth.all,
                });
            } catch {
                // Continue with local cleanup if query cancellation fails.
            } finally {
                queryClient.removeQueries({
                    queryKey: queryKeys.auth.all,
                });

                // Clear all cached private application data.
                queryClient.clear();

                router.replace("/login");
                router.refresh();
            }
        }
    }, [queryClient, router]);

    return {
        handleLogout,
        isLoggingOut,
    };
}