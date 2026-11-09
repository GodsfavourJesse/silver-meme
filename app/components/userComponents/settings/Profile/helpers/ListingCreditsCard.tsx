"use client";

import {
    CreditCard,
    Info,
    Layers3,
    Sparkles,
} from "lucide-react";

import type {
    UserCreditBreakdown,
    UserCreditSourceBalance,
} from "@/app/types/user/profile/profile.types";

const CREDIT_ITEMS = [
    {
        key: "free",
        title: "Free credits",
        description: "Credits included with your account.",
        icon: Sparkles,
        color: "blue",
    },
    {
        key: "subscribed",
        title: "Subscription credits",
        description: "Credits allocated through your plans.",
        icon: CreditCard,
        color: "emerald",
    },
    {
        key: "adjustment",
        title: "Additional credits",
        description: "Credits added by KARMASS support.",
        icon: Layers3,
        color: "amber",
    },
] as const;

function CreditProgress({
    balance,
}: {
    balance: UserCreditSourceBalance;
}) {
    const percentage =
        balance.total > 0
            ? Math.min(
                  100,
                  Math.max(0, (balance.used / balance.total) * 100),
              )
            : 0;

    return (
        <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">
                    {balance.used} used
                </span>

                <span className="font-semibold text-slate-700">
                    {balance.remaining} remaining
                </span>
            </div>

            <div
                className="h-2 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={balance.total}
                aria-valuenow={balance.used}
                aria-label={`${balance.used} of ${balance.total} credits used`}
            >
                <div
                    className="h-full rounded-full bg-[#1491FF] transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <p className="mt-2 text-[11px] text-slate-400">
                {balance.total} credits allocated
            </p>
        </div>
    );
}

export function ListingCreditsCard({
    credits,
}: {
    credits: UserCreditBreakdown;
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#0877D9]">
                                <CreditCard size={18} />
                            </span>

                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#0877D9]">
                                Listing allowance
                            </span>
                        </div>

                        <h2 className="mt-3 text-lg font-bold text-slate-900">
                            Your listing credits
                        </h2>

                        <p className="mt-1 text-sm leading-5 text-slate-500">
                            Track the credits available for publishing your vehicles.
                        </p>
                    </div>

                    <div className="rounded-2xl bg-[#EAF5FF] px-5 py-3 sm:min-w-36">
                        <p className="text-xs font-semibold text-[#0877D9]">
                            Total available
                        </p>

                        <p className="mt-1 text-3xl font-bold tracking-tight text-[#0065C9]">
                            {credits.totalRemaining}
                        </p>

                        <p className="text-[11px] text-[#0877D9]">
                            Listing credits
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-6">
                {CREDIT_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const balance = credits[item.key];

                    const styles = {
                        blue: {
                            icon: "bg-[#EAF5FF] text-[#0877D9]",
                            number: "text-[#0877D9]",
                        },
                        emerald: {
                            icon: "bg-emerald-50 text-emerald-700",
                            number: "text-emerald-700",
                        },
                        amber: {
                            icon: "bg-amber-50 text-amber-700",
                            number: "text-amber-700",
                        },
                    }[item.color];

                    return (
                        <div
                            key={item.key}
                            className="rounded-xl border border-slate-200 p-4"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles.icon}`}>
                                    <Icon size={17} />
                                </span>

                                <span className={`text-2xl font-bold ${styles.number}`}>
                                    {balance.remaining}
                                </span>
                            </div>

                            <h3 className="mt-4 text-sm font-bold text-slate-900">
                                {item.title}
                            </h3>

                            <p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">
                                {item.description}
                            </p>

                            <CreditProgress balance={balance} />
                        </div>
                    );
                })}
            </div>

            <div className="mx-4 mb-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3.5 sm:mx-6 sm:mb-6">
                <Info
                    size={16}
                    className="mt-0.5 shrink-0 text-[#0877D9]"
                />

                <p className="text-xs leading-5 text-slate-500">
                    Unused subscription credits remain available after your
                    subscription expires. Your available balance reflects
                    credits that have not yet been used.
                </p>
            </div>
        </section>
    );
}