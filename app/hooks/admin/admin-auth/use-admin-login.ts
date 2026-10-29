"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { adminAuthService } from "../../../services/admin/admin-auth.service";

import { adminQueryKeys } from "./admin-query-keys";

import type {
    AdminLoginRequest,
} from "../../../types/admin/admin-auth.types";

export function useAdminLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (
            credentials: AdminLoginRequest,
        ) => adminAuthService.login(credentials),

        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey:
                        adminQueryKeys.auth.me(),
                }),

                queryClient.invalidateQueries({
                    queryKey:
                        adminQueryKeys.auth.csrfToken(),
                }),
            ]);
        },
    });
}
