"use client";

import { Bell, Mail } from "lucide-react";

import {
    useNotificationPreferences,
    useUpdateNotificationPreferences,
} from "@/app/hooks/user/notifications/useNotifications";

function PreferenceSwitch({
    label,
    description,
    checked,
    disabled,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    disabled: boolean;
    onChange: () => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-3.5">
            <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800">{label}</p>
                <p className="mt-1 text-[11px] leading-4 text-slate-500">{description}</p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                disabled={disabled}
                onClick={onChange}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:opacity-50 ${checked ? "bg-[#0B5FA5]" : "bg-slate-200"}`}
            >
                <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
            </button>
        </div>
    );
}

export function NotificationPreferencesCard() {
    const preferences = useNotificationPreferences();
    const update = useUpdateNotificationPreferences();
    const current = preferences.data;
    const busy = update.isPending;

    return (
        <section className="rounded-2xl border border-[#DCE8F4] bg-white p-5 shadow-[0_8px_28px_rgba(24,58,92,0.04)]">
            <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0B5FA5]">Your preferences</p>
                <h2 className="mt-1 text-sm font-bold text-slate-900">Notification settings</h2>
            </div>

            {preferences.isLoading ? (
                <div className="mt-4 space-y-3">
                    <div className="h-12 animate-pulse rounded-lg bg-slate-50" />
                    <div className="h-12 animate-pulse rounded-lg bg-slate-50" />
                </div>
            ) : current ? (
                <div className="mt-3 divide-y divide-slate-100">
                    <PreferenceSwitch
                        label="In-app alerts"
                        description="Allow live updates while you use KARMASS."
                        checked={current.inAppEnabled}
                        disabled={busy}
                        onChange={() => void update.mutateAsync({ inAppEnabled: !current.inAppEnabled }).catch(() => undefined)}
                    />
                    <PreferenceSwitch
                        label="Email updates"
                        description="Receive notification updates by email."
                        checked={current.emailEnabled}
                        disabled={busy}
                        onChange={() => void update.mutateAsync({ emailEnabled: !current.emailEnabled }).catch(() => undefined)}
                    />
                </div>
            ) : (
                <p className="mt-4 text-xs leading-5 text-slate-500">
                    Notification preferences could not be loaded.
                    <button type="button" onClick={() => void preferences.refetch()} className="ml-1 font-semibold text-[#0B5FA5]">Try again</button>
                </p>
            )}

            {update.isError && (
                <p role="alert" className="mt-2 text-xs text-red-600">
                    {update.error instanceof Error ? update.error.message : "Unable to save your preferences."}
                </p>
            )}

            <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-[10px] text-slate-400">
                <Bell size={13} />
                <span>Push alerts are managed separately on each device.</span>
                <Mail size={13} className="ml-auto" />
            </div>
        </section>
    );
}
