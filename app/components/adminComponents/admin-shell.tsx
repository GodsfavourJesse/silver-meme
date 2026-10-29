"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAdminSession } from "@/app/hooks/admin/use-admin-session";
import { ApiError } from "@/app/lib/api/api-error";
import { ADMIN_LOGIN_PATH } from "@/app/lib/admin/path";

export function AdminShell({ children }: { children: ReactNode }) {
    const router = useRouter();
    const session = useAdminSession();

    useEffect(() => {
        if (
            session.error instanceof ApiError &&
            (session.error.status === 401 ||
                session.error.status === 403)
        ) {
            router.replace(ADMIN_LOGIN_PATH);
        }
    }, [session.error, router]);

    if (session.isPending) {
        return (
            <div
                aria-busy="true"
                className="flex min-h-dvh items-center justify-center bg-[#F5F8FC]"
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="relative flex size-12 items-center justify-center">
                        <div className="absolute size-12 animate-spin rounded-full border-2 border-[#D9ECFF] border-t-[#1491FF]" />

                        <span className="size-2.5 rounded-full bg-[#1491FF]" />
                    </div>

                    <p className="text-sm font-bold tracking-[0.24em] text-[#1491FF]">
                        KARMASS
                    </p>

                    <p className="text-xs text-slate-500">
                        Verifying administrator access...
                    </p>
                </div>
            </div>
        );
    }

    if (session.isError || !session.data) {
        return (
            <div className="flex min-h-dvh items-center justify-center bg-[#F5F8FC] px-5 py-10">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-[0_16px_50px_-30px_rgba(15,23,42,0.25)] sm:p-9">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#EAF5FF]">
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="size-7 text-[#1491FF]"
                        >
                            <path
                                d="M12 8v4m0 4h.01M10.3 3.86 1.82 18.14A2 2 0 0 0 3.53 21h16.94a2 2 0 0 0 1.71-2.86L13.7 3.86a2 2 0 0 0-3.4 0Z"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    <h1 className="mt-5 text-xl font-bold tracking-tight text-[#172033]">
                        Unable to verify your session
                    </h1>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                        We couldn't confirm your administrator access.
                        Check your connection and try again.
                    </p>

                    <button
                        type="button"
                        onClick={() => session.refetch()}
                        disabled={session.isFetching}
                        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#1491FF] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0878DF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1491FF]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {session.isFetching
                            ? "Verifying..."
                            : "Try again"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-console min-h-dvh bg-[#F5F8FC] text-[#172033]">
            <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
                {children}
            </main>
        </div>
    );
}