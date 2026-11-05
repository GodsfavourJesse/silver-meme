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
                className="flex h-11 w-11 items-center justify-center rounded-full bg-kar-royal text-sm font-semibold text-white shadow-lg shadow-kar-royal/25 transition hover:bg-kar-royal-hover"
            >
                {initialsOf(admin.firstName, admin.lastName)}
            </button>

            {open ? (
                <div
                    role="menu"
                    className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-kar-border bg-kar-surface shadow-2xl shadow-black/50"
                >
                    <div className="border-b border-kar-border px-4 py-3">
                        <p className="truncate text-sm font-medium">
                            {fullName(admin.firstName, admin.lastName)}
                        </p>

                        <p className="truncate text-xs text-kar-muted">
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
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-kar-muted transition hover:bg-kar-surface-raised hover:text-kar-text disabled:opacity-60"
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