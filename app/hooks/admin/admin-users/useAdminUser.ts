"use client"; 

import { useQuery } from "@tanstack/react-query"; 
import { adminUsersService } from "@/app/services/admin/admin-users.service"; 
import { adminUsersQueryKeys } from "./admin-users-query-keys"; 

export function useAdminUser( 
    userId: string | null, 
) { 
    return useQuery({ 
        queryKey: adminUsersQueryKeys.detail( userId ?? "", ), 
        
        queryFn: () => { 
            if (!userId) { 
                throw new Error( 
                    "A user ID is required.", 
                ); 
            } 
            
            return adminUsersService.getById(userId); 
        }, 
        
        enabled: Boolean(userId), staleTime: 30_000, retry: false, 
    }); 
}