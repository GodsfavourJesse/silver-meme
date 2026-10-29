"use client";

import { useEffect, useState, type ReactNode } from "react";

import { useRouter } from "next/navigation";

import { useAdminSession } from "@/app/hooks/admin/use-admin-session";
import { ApiError } from "@/app/lib/api/api-error";
import { ADMIN_LOGIN_PATH } from "@/app/lib/admin/path";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";

export function AdminShell({ children }: { children: ReactNode }) {
    const router = useRouter();
    const session = useAdminSession();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!session.error) {
            return;
        }

        if (
            session.error instanceof ApiError &&
            (session.error.status === 401 || session.error.status === 403)
        ) {
            router.replace(ADMIN_LOGIN_PATH);
        }
    }, [session.error, router]);

    if (session.isPending) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-kar-bg">
                <p className="animate-pulse text-sm font-medium tracking-[0.4em] text-kar-accent">
                    KARMASS
                </p>
            </div>
        );
    }

    if (session.isError || !session.data) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-kar-bg px-6 text-center">
                <div>
                    <p className="text-lg font-semibold">
                        Unable to verify your session
                    </p>

                    <button
                        type="button"
                        onClick={() => session.refetch()}
                        className="mt-4 rounded-full bg-kar-royal px-6 py-3 text-sm font-semibold text-white hover:bg-kar-royal-hover"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-console min-h-screen bg-kar-bg text-kar-text">
            <AdminSidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="lg:pl-64">
                <AdminTopbar
                    admin={session.data}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}