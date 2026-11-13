"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/app/hooks/user/auth/useAuth";
import { KarmassPageLoader } from "@/app/components/shared/KarmassPageLoader";

export function AuthPageRedirect({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { user, isLoading, isFetching } = useAuth();

    useEffect(() => {
        if (user && !isFetching) {
            router.replace("/dashboard");
        }
    }, [isFetching, router, user]);

    if (isLoading || isFetching || user) {
        return <KarmassPageLoader message={user ? "Opening your dashboard..." : "Checking your account..."} />;
    }

    return children;
}
