"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyDealerApplications } from "@/app/services/user/dealer/dealer-application.service";
import type { DealerApplication } from "@/app/types/user/dealer/dealer-application.types";

export function useMyDealerApplications() {
    return useQuery<DealerApplication[]>({
        queryKey: ["dealer", "my-applications"],
        queryFn: getMyDealerApplications,
        staleTime: 30_000,
        retry: 1,
    });
}
