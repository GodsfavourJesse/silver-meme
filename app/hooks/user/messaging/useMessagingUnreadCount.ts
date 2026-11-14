"use client";

import { useQuery } from "@tanstack/react-query";
import { getMessagingUnreadCount } from "@/app/services/user/messaging/messaging.service";

export function useMessagingUnreadCount() {
    const query = useQuery({
        queryKey: ["messaging", "unread-count"],
        queryFn: getMessagingUnreadCount,
        refetchInterval: 30_000,
        refetchOnWindowFocus: true,
    });

    return Math.max(0, query.data?.data.total ?? 0);
}
