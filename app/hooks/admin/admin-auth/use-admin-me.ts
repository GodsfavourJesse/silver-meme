"use client";

import {
    useQuery,
} from "@tanstack/react-query";

import { adminAuthService } from "../../../services/admin/admin-auth.service";

import { adminQueryKeys } from "./admin-query-keys";

export function useAdminMe(
enabled = true,
) {
    return useQuery({
        queryKey: adminQueryKeys.auth.me(),

        queryFn: () => adminAuthService.getMe(),

        enabled,

        staleTime: 30_000,

        retry: false,
    });
}
