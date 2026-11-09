"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Crown,
    Package,
    RefreshCw,
} from "lucide-react";

import type {
    UserCurrentSubscription,
} from "@/app/types/user/profile/profile.types";

const BRAND = "#1491FF";

const FIVE_DAYS = 5 * 24 * 60 * 60 * 1000;

function formatPrice(
    amount: string | number,
    currency: string,
): string {
    const value = Number(amount);

    if (!Number.isFinite(value)) {
        return `${currency} ${amount}`;
    }

    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(value);
}

function formatDate(value?: string | null): string {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

function useSubscriptionCountdown(
    expiresAt: string | null,
) {
    const [now, setNow] = useState<number | null>(null);

    useEffect(() => {
        const update = () => setNow(Date.now());

        update();

        const interval = window.setInterval(update, 1000);

        return () => window.clearInterval(interval);
    }, []);

    if (!expiresAt || now === null) {
        return null;
    }

    const expiry = new Date(expiresAt).getTime();

    if (!Number.isFinite(expiry)) {
        return null;
    }

    const difference = expiry - now;

    if (difference <= 0) {
        return {
            expired: true,
            urgent: true,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
        };
    }

    const totalSeconds = Math.floor(difference / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
        expired: false,
        urgent: difference <= FIVE_DAYS,
        days,
        hours,
        minutes,
        seconds,
    };
}

function Countdown({
    expiresAt,
}: {
    expiresAt: string | null;
}) {
    const countdown = useSubscriptionCountdown(expiresAt);

    if (!countdown) return null;

    const urgent = countdown.urgent;

    if (countdown.expired) {
        return (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-700">
                <AlertTriangle size={18} />

                <div>
                    <p className="text-sm font-bold">
                        Subscription expired
                    </p>

                    <p className="mt-0.5 text-xs">
                        Your unused listing credits remain available.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={[
                "rounded-xl border p-4 transition-colors",
                urgent
                    ? "border-red-200 bg-red-50"
                    : "border-[#D5EAFE] bg-[#F4F9FF]",
            ].join(" ")}
        >
            <div className="flex items-center gap-2">
                {urgent ? (
                    <AlertTriangle size={17} className="text-red-600" />
                ) : (
                    <Clock3 size={17} style={{ color: BRAND }} />
                )}

                <p
                    className={[
                        "text-sm font-bold",
                        urgent ? "text-red-700" : "text-[#0877D9]",
                    ].join(" ")}
                >
                    {urgent
                        ? "Your subscription is expiring soon"
                        : "Time remaining"}
                </p>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
                {[
                    { value: countdown.days, label: "Days" },
                    { value: countdown.hours, label: "Hours" },
                    { value: countdown.minutes, label: "Minutes" },
                    { value: countdown.seconds, label: "Seconds" },
                ].map((item) => (
                    <div
                        key={item.label}
                        className={[
                            "min-w-[62px] rounded-lg border px-3 py-2 text-center",
                            urgent
                                ? "border-red-200 bg-white"
                                : "border-[#D5EAFE] bg-white",
                        ].join(" ")}
                    >
                        <p
                            className={[
                                "text-xl font-bold tabular-nums",
                                urgent ? "text-red-600" : "text-slate-900",
                            ].join(" ")}
                        >
                            {String(item.value).padStart(2, "0")}
                        </p>

                        <p
                            className={[
                                "mt-0.5 text-[10px] font-semibold uppercase",
                                urgent ? "text-red-500" : "text-slate-400",
                            ].join(" ")}
                        >
                            {item.label}
                        </p>
                    </div>
                ))}
            </div>

            <p
                className={[
                    "mt-3 text-xs",
                    urgent ? "text-red-600" : "text-slate-500",
                ].join(" ")}
            >
                Expires on {formatDate(expiresAt)}
            </p>
        </div>
    );
}

export function CurrentSubscriptionCard({
    subscription,
    onBrowsePlans,
}: {
    subscription: UserCurrentSubscription | null;
    onBrowsePlans: () => void;
}) {
    if (!subscription) {
        return (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#0877D9]">
                    <Crown size={21} />
                </div>

                <h2 className="mt-4 text-lg font-bold text-slate-900">
                    No active subscription
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    You don't currently have an active plan. Explore our
                    available plans to get more listing credits and publish
                    your vehicles.
                </p>

                <button
                    type="button"
                    onClick={onBrowsePlans}
                    className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0877D9]"
                >
                    Explore subscription plans
                    <RefreshCw size={16} />
                </button>
            </section>
        );
    }

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0877D9] to-[#1491FF] p-5 text-white sm:p-6">
                <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full border-[25px] border-white/10" />

                <div className="relative flex items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
                            <Crown size={17} />
                            CURRENT SUBSCRIPTION
                        </div>

                        <h2 className="mt-3 text-2xl font-bold tracking-tight">
                            {subscription.planName}
                        </h2>

                        {subscription.planVersion !== null && (
                            <p className="mt-1 text-xs text-white/75">
                                Plan version {subscription.planVersion}
                            </p>
                        )}
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold">
                        <CheckCircle2 size={14} />
                        Active
                    </span>
                </div>

                <div className="relative mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/15 bg-white/10 p-3.5">
                        <div className="flex items-center gap-2 text-xs text-white/75">
                            <Package size={15} />
                            Listing credits
                        </div>

                        <p className="mt-2 text-2xl font-bold">
                            {subscription.listingCredits}
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/15 bg-white/10 p-3.5">
                        <div className="flex items-center gap-2 text-xs text-white/75">
                            <CalendarDays size={15} />
                            Duration
                        </div>

                        <p className="mt-2 text-2xl font-bold">
                            {subscription.durationDays}
                            <span className="ml-1 text-sm font-medium text-white/75">
                                days
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-5 p-4 sm:p-6">
                <Countdown expiresAt={subscription.expiresAt} />

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <p className="text-xs text-slate-500">
                            Subscription started
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                            {formatDate(subscription.startsAt)}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">
                            Subscription expires
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                            {formatDate(subscription.expiresAt)}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">
                            Original price
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                            {formatPrice(
                                subscription.originalPrice,
                                subscription.currency,
                            )}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">
                            Amount paid
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                            {formatPrice(
                                subscription.effectivePrice,
                                subscription.currency,
                            )}
                        </p>
                    </div>
                </div>

                {Number(subscription.dealerDiscountPercent) > 0 && (
                    <div className="rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
                        You received a{" "}
                        {Number(subscription.dealerDiscountPercent)}% dealer discount.
                    </div>
                )}
            </div>
        </section>
    );
}