"use client";

import {
    useEffect,
    type ReactNode,
} from "react";

import { useRouter } from "next/navigation";
import { useAdminMe } from "@/app/hooks/admin/admin-auth/use-admin-me";
import { ApiError } from "@/app/lib/api/api-error";

interface AdminAuthGuardProps {
    children: ReactNode;
}

export function AdminAuthGuard({
    children,
}: AdminAuthGuardProps) {
    const router = useRouter();

    const {
        data,
        error,
        isPending,
        refetch,
        isFetching,
    } = useAdminMe();

    const isUnauthorized =
        error instanceof ApiError &&
        (
            error.status === 401 ||
            error.status === 403
        );

    useEffect(() => {
        if (isUnauthorized) {
            router.replace(
                "/ops-center-7k9x/login",
            );
        }
    }, [
        isUnauthorized,
        router,
    ]);

    if (isPending || isUnauthorized) {
        return (
            <main
                className="flex min-h-screen items-center justify-center p-6"
                aria-live="polite"
            >
                <div className="text-center">
                    <p className="text-lg font-semibold">
                        Verifying administrator session
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                        Please wait while we verify your access.
                    </p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex min-h-screen items-center justify-center p-6">
                <div className="w-full max-w-md text-center">
                    <h1 className="text-xl font-semibold">
                        Unable to verify your session
                    </h1>

                    <p className="mt-3 text-sm text-gray-600">
                        We could not verify your administrator
                        session. Check your connection and try again.
                    </p>

                    <button
                        type="button"
                        onClick={() => {
                            void refetch();
                        }}
                        disabled={isFetching}
                        className="mt-6 rounded-lg bg-green-700 px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isFetching
                            ? "Checking..."
                            : "Try again"}
                    </button>
                </div>
            </main>
        );
    }

    if (!data?.admin) {
        return null;
    }

    return <>{children}</>;
}