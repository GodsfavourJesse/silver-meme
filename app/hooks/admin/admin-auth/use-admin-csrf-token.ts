"use client";

import {
    useQuery,
} from "@tanstack/react-query";

import { adminAuthService } from "../../../services/admin/admin-auth.service";

import { adminQueryKeys } from "./admin-query-keys";

export function useAdminCsrfToken(
enabled = true,
) {
    return useQuery({
        queryKey: adminQueryKeys.auth.csrfToken(),

        queryFn: () => adminAuthService.getCsrfToken(),

        enabled,

        staleTime: 5 * 60 * 1000,

        retry: false,

        refetchOnWindowFocus: false,
    });
}
