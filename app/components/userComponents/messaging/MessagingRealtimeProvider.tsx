"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode, type Dispatch, type SetStateAction } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";

const MessagingSocketContext = createContext<{
    socket: Socket | null;
    mobileChatOpen: boolean;
    setMobileChatOpen: Dispatch<SetStateAction<boolean>>;
} | null>(null);

export function useMessagingSocket() {
    return useContext(MessagingSocketContext)?.socket ?? null;
}

export function useMessagingMobileChat() {
    const context = useContext(MessagingSocketContext);
    return {
        mobileChatOpen: context?.mobileChatOpen ?? false,
        setMobileChatOpen: context?.setMobileChatOpen ?? (() => undefined),
    };
}

export function MessagingRealtimeProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [mobileChatOpen, setMobileChatOpen] = useState(false);

    useEffect(() => {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
        if (!apiBase) return;

        const socketUrl = apiBase.replace(/\/api\/v1$/, "");
        const client = io(socketUrl, { withCredentials: true, transports: ["websocket", "polling"] });
        setSocket(client);

        const refreshMessaging = () => {
            void queryClient.invalidateQueries({ queryKey: ["messaging", "unread-count"] });
            void queryClient.invalidateQueries({ queryKey: ["messaging", "conversations"] });
        };

        client.on("message:received", refreshMessaging);
        client.on("message:read", refreshMessaging);
        client.on("connect", refreshMessaging);

        return () => {
            client.off("message:received", refreshMessaging);
            client.off("message:read", refreshMessaging);
            client.off("connect", refreshMessaging);
            client.disconnect();
            setSocket(null);
        };
    }, [queryClient]);

    const contextValue = useMemo(() => ({ socket, mobileChatOpen, setMobileChatOpen }), [socket, mobileChatOpen]);
    return <MessagingSocketContext.Provider value={contextValue}>{children}</MessagingSocketContext.Provider>;
}
