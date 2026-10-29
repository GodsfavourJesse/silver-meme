"use client";

import {
    isServer,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";

import { useState } from "react";

function makeQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30_000,
                refetchOnWindowFocus: true,

                retry: (
                    failureCount: number,
                    error: unknown,
                ) => {
                    if (
                        typeof error === "object" &&
                        error !== null &&
                        "status" in error &&
                        typeof error.status === "number"
                    ) {
                        if (
                            error.status === 401 ||
                            error.status === 403 ||
                            error.status === 404
                        ) {
                            return false;
                        }
                    }

                    return failureCount < 2;
                },
            },

            mutations: {
                retry: false,
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient(): QueryClient {
    if (isServer) {
        return makeQueryClient();
    }

    if (!browserQueryClient) {
        browserQueryClient = makeQueryClient();
    }

    return browserQueryClient;
}

export function QueryProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [queryClient] = useState(
        () => getQueryClient(),
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}