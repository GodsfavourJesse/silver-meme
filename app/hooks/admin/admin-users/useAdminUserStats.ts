"use client";

import { useQuery } from "@tanstack/react-query";

import { adminUsersService } from "@/app/services/admin/admin-users.service";

import { adminUsersQueryKeys } from "./admin-users-query-keys";

export function useAdminUserStats() {
    return useQuery({
        queryKey: adminUsersQueryKeys.stats(),

        queryFn: () => adminUsersService.getStats(),

        staleTime: 30_000,

        retry: false,
    });
}