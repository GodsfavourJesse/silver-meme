"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { LoaderCircle, LogOut } from "lucide-react";

import { adminFetch, clearAdminCsrfCache } from "@/app/lib/admin/admin-fetch";
import { fullName, initialsOf } from "@/app/lib/admin/format";
import type { AdminSession } from "@/app/types/admin/admin-dashboard.types";
import { ADMIN_LOGIN_PATH } from "@/app/lib/admin/path";


export function UserMenu({ admin }: { admin: AdminSession }) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const containerRef = useRef<HTMLDivElement>(null);

    const [open, setOpen] = useState(false);
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
        setLoggingOut(true);

        try {
            await adminFetch("/auth/logout", { method: "POST" });
        } catch {
            // Leave the portal even if the server call fails.
        } finally {
            clearAdminCsrfCache();
            queryClient.clear();
            router.replace(ADMIN_LOGIN_PATH);
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
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-kar-muted transition hover:bg-kar-surface-raised hover:text-kar-text disabled:opacity-60"
                    >
                        {loggingOut ? (
                            <LoaderCircle size={17} className="animate-spin" />
                        ) : (
                            <LogOut size={17} />
                        )}
                        Sign out
                    </button>
                </div>
            ) : null}
        </div>
    );
}