"use client";

import { BellRing, Smartphone } from "lucide-react";

import { usePushNotifications } from "@/app/hooks/user/notifications/usePushNotifications";

export function PushNotificationCard() {
    const {
        supported,
        subscribed,
        permission,
        requiresHomeScreenInstall,
        isBusy,
        error,
        enable,
        disable,
    } = usePushNotifications();

    const hasVapidKey = Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);

    return (
        <section className="overflow-hidden rounded-2xl border border-[#DCE8F4] bg-white shadow-[0_8px_28px_rgba(24,58,92,0.04)]">
            <div className="border-b border-slate-100 p-5">
                <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#0B5FA5]">
                        <BellRing size={19} />
                    </span>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">Phone notifications</h2>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                            Get important KARMASS updates in your device notification panel, even when the site is closed.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-5">
                {supported === null ? (
                    <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                ) : !supported ? (
                    <p className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                        Push notifications are not supported by this browser. Try a recent version of Chrome, Edge, Firefox, or Safari.
                    </p>
                ) : requiresHomeScreenInstall ? (
                    <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3.5">
                        <div className="flex gap-2 text-[#0B5FA5]">
                            <Smartphone size={16} className="mt-0.5 shrink-0" />
                            <p className="text-xs leading-5">
                                On iPhone or iPad, first use Share → Add to Home Screen, then open the KARMASS app from your Home Screen to enable push.
                            </p>
                        </div>
                    </div>
                ) : !hasVapidKey ? (
                    <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                        Push setup is missing the site public key. Add <code>NEXT_PUBLIC_VAPID_PUBLIC_KEY</code> to the frontend environment and restart the site.
                    </p>
                ) : (
                    <>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold text-slate-800">
                                    {subscribed ? "Enabled on this device" : "Off on this device"}
                                </p>
                                <p className="mt-1 text-[11px] text-slate-500">
                                    {subscribed
                                        ? "You can turn off push for this browser at any time."
                                        : permission === "denied"
                                          ? "Allow notifications for KARMASS in your browser settings first."
                                          : "You choose whether KARMASS can send push alerts."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => void (subscribed ? disable() : enable())}
                                disabled={isBusy}
                                aria-pressed={subscribed}
                                className={`shrink-0 rounded-xl px-3.5 py-2.5 text-xs font-bold transition disabled:cursor-wait disabled:opacity-60 ${
                                    subscribed
                                        ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                        : "bg-[#0B5FA5] text-white hover:bg-[#084A80]"
                                }`}
                            >
                                {isBusy ? "Please wait…" : subscribed ? "Turn off" : "Enable push"}
                            </button>
                        </div>

                        {error && (
                            <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
                                {error}
                            </p>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
