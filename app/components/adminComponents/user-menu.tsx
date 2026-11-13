"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { LogOut } from "lucide-react";
import { KarmassLogoutDialog } from "@/app/components/shared/KarmassLogoutDialog";
import { KarmassLoadingOverlay } from "@/app/components/shared/KarmassLoadingOverlay";

import {
    adminFetch,
    clearAdminCsrfCache,
} from "@/app/lib/api/api-client";

import { fullName, initialsOf } from "@/app/lib/admin/format";
import type { AdminSession } from "@/app/types/admin/admin-dashboard.types";
import { ADMIN_LOGIN_PATH } from "@/app/lib/admin/path";

export function UserMenu({ admin }: { admin: AdminSession }) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const containerRef = useRef<HTMLDivElement>(null);

    const [open, setOpen] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        function handlePointerDown(event: MouseEvent): void {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handlePointerDown);

        return () =>
            document.removeEventListener("mousedown", handlePointerDown);
    }, []);

    async function handleLogout(): Promise<void> {
        if (loggingOut) return;
        setLoggingOut(true);
        setShowLogoutDialog(false);

        try {
            await adminFetch("/auth/logout", { method: "POST" });
        } catch {
            // Local cleanup and redirect still happen if the network is unavailable.
        } finally {
            clearAdminCsrfCache();
            await queryClient.cancelQueries();
            queryClient.clear();
            router.replace(ADMIN_LOGIN_PATH);
            router.refresh();
        }
    }

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((current) => !current)}
                className="flex size-10 items-center justify-center rounded-full bg-[#0B4F86] text-xs font-bold text-white shadow-sm shadow-[#0B4F86]/20 transition hover:bg-[#083C67] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0B4F86]/15"
            >
                {initialsOf(admin.firstName, admin.lastName)}
            </button>

            {open ? (
                <div
                    role="menu"
                    className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl shadow-slate-900/10"
                >
                    <div className="border-b border-slate-100 px-4 py-3.5">
                        <p className="truncate text-sm font-bold">
                            {fullName(admin.firstName, admin.lastName)}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-slate-500">
                            {admin.email}
                        </p>
                    </div>

                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            setOpen(false);
                            setShowLogoutDialog(true);
                        }}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60"
                    >
                        <LogOut size={17} />
                        Sign out
                    </button>
                </div>
            ) : null}

            <KarmassLogoutDialog
                open={showLogoutDialog}
                isLoggingOut={loggingOut}
                onCancel={() => setShowLogoutDialog(false)}
                onConfirm={handleLogout}
                title="Sign out of the admin portal?"
                description="You will need to complete the administrator sign-in and security checks again to access the portal."
            />
            <KarmassLoadingOverlay
                open={loggingOut}
                message="Signing out of the admin portal"
                detail="Closing your secure administrator session."
            />
        </div>
    );
}
