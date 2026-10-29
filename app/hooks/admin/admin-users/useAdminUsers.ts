"use client"; 

import { useQuery } from "@tanstack/react-query"; 
import { adminUsersService } from "@/app/services/admin/admin-users.service"; 
import type { AdminUsersQuery } from "@/app/types/admin/admin-users.types"; 
import { adminUsersQueryKeys } from "./admin-users-query-keys"; 

export function useAdminUsers( 
    query: AdminUsersQuery = {}, 
) { 
    return useQuery({ 
        queryKey: adminUsersQueryKeys.list(query),

        queryFn: () => adminUsersService.list(query),
        
        staleTime: 30_000, retry: false, placeholderData: (previousData) => previousData, 
    }); 
}