"use client";

import { useEffect } from "react";
import { LogOut, X } from "lucide-react";

interface KarmassLogoutDialogProps {
    open: boolean;
    isLoggingOut?: boolean;
    title?: string;
    description?: string;
    onCancel: () => void;
    onConfirm: () => void;
}

export function KarmassLogoutDialog({
    open,
    isLoggingOut = false,
    title = "Sign out of KARMASS?",
    description = "You will need to sign in again to access your account. Are you sure you want to continue?",
    onCancel,
    onConfirm,
}: KarmassLogoutDialogProps) {
    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape" && !isLoggingOut) onCancel();
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, isLoggingOut, onCancel]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[190] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-[3px] sm:items-center sm:p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !isLoggingOut) onCancel();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="karmass-logout-title"
                aria-describedby="karmass-logout-description"
                className="w-full max-w-md rounded-t-[26px] border border-slate-200 bg-white p-5 shadow-2xl sm:rounded-[26px] sm:p-6"
            >
                <div className="flex items-start justify-between gap-4">
                    <span className="flex size-12 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-600">
                        <LogOut size={21} />
                    </span>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoggingOut}
                        aria-label="Close sign out confirmation"
                        className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
                    >
                        <X size={18} />
                    </button>
                </div>

                <h2 id="karmass-logout-title" className="mt-5 text-xl font-bold tracking-tight text-slate-900">
                    {title}
                </h2>
                <p id="karmass-logout-description" className="mt-2 text-sm leading-6 text-slate-500">
                    {description}
                </p>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoggingOut}
                        className="order-2 min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:order-1"
                    >
                        Stay signed in
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoggingOut}
                        className="order-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60 sm:order-2"
                    >
                        <LogOut size={16} />
                        Yes, sign out
                    </button>
                </div>
            </section>
        </div>
    );
}
