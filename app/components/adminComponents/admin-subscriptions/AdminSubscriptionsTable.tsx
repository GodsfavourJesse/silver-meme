"use client";

import {
    CalendarDays,
    ChevronRight,
    Eye,
    UserRound,
} from "lucide-react";

import type { AdminSubscription } from "@/app/types/admin/admin-subscription.types";

type AdminSubscriptionsTableProps = {
    subscriptions: AdminSubscription[];
    onView: (subscription: AdminSubscription) => void;
};

const formatCurrency = (amount: string, currency: string) => {
    const value = Number(amount);

    if (!Number.isFinite(value)) return "—";

    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(value);
};

const formatDate = (date: string | null) => {
    if (!date) return "—";

    return new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(date));
};

const statusStyles: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700",
    PENDING: "bg-amber-50 text-amber-700",
    CANCELLED: "bg-orange-50 text-orange-700",
    EXPIRED: "bg-slate-100 text-slate-600",
};

function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyles[status] || "bg-slate-100 text-slate-600"}`}
        >
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
            {status}
        </span>
    );
}

function CustomerName({
    subscription,
}: {
    subscription: AdminSubscription;
}) {
    const name = [
        subscription.user.firstName,
        subscription.user.lastName,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#1491FF]">
                <UserRound size={17} />
            </div>

            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                    {name || "Unnamed customer"}
                </p>

                <p className="truncate text-xs text-slate-400">
                    {subscription.user.email || "No email"}
                </p>
            </div>
        </div>
    );
}

export default function AdminSubscriptionsTable({
    subscriptions,
    onView,
}: AdminSubscriptionsTableProps) {
    if (!subscriptions.length) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF5FF] text-[#1491FF]">
                    <CalendarDays size={25} />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-900">
                    No subscriptions found
                </h3>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                    Subscription records matching your selected filters will
                    appear here.
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-100 bg-white lg:block">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70">
                                {[
                                    "Customer",
                                    "Plan",
                                    "Amount",
                                    "Status",
                                    "Start date",
                                    "Expiry date",
                                    "",
                                ].map((heading, index) => (
                                    <th
                                        key={`${heading}-${index}`}
                                        className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-50">
                            {subscriptions.map((subscription) => (
                                <tr
                                    key={subscription.id}
                                    className="transition hover:bg-[#F8FBFF]"
                                >
                                    <td className="px-5 py-4">
                                        <CustomerName subscription={subscription} />
                                    </td>

                                    <td className="px-5 py-4">
                                        <p className="text-sm font-semibold text-slate-800">
                                            {subscription.plan.name}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            {subscription.listingCredits} credits
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        <p className="text-sm font-bold text-slate-800">
                                            {formatCurrency(
                                                subscription.effectivePrice,
                                                subscription.currency,
                                            )}
                                        </p>

                                        {Number(subscription.dealerDiscountPercent) > 0 && (
                                            <p className="mt-1 text-xs text-emerald-600">
                                                {subscription.dealerDiscountPercent}% discount
                                            </p>
                                        )}
                                    </td>

                                    <td className="px-5 py-4">
                                        <StatusBadge status={subscription.status} />
                                    </td>

                                    <td className="px-5 py-4 text-sm text-slate-500">
                                        {formatDate(subscription.startsAt)}
                                    </td>

                                    <td className="px-5 py-4 text-sm text-slate-500">
                                        {formatDate(subscription.expiresAt)}
                                    </td>

                                    <td className="px-5 py-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() => onView(subscription)}
                                            aria-label="View subscription"
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[#1491FF]/30 hover:bg-[#EAF5FF] hover:text-[#1491FF]"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 lg:hidden">
                {subscriptions.map((subscription) => {
                    const name = [
                        subscription.user.firstName,
                        subscription.user.lastName,
                    ]
                        .filter(Boolean)
                        .join(" ");

                    return (
                        <button
                            key={subscription.id}
                            type="button"
                            onClick={() => onView(subscription)}
                            className="w-full rounded-2xl border border-slate-100 bg-white p-4 text-left transition active:scale-[0.99] hover:border-[#1491FF]/30 hover:shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#1491FF]">
                                        <UserRound size={19} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-slate-900">
                                            {name || "Unnamed customer"}
                                        </p>

                                        <p className="truncate text-xs text-slate-400">
                                            {subscription.user.email || "No email"}
                                        </p>
                                    </div>
                                </div>

                                <ChevronRight
                                    size={18}
                                    className="mt-1 shrink-0 text-slate-400"
                                />
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                                <div>
                                    <p className="text-xs text-slate-400">
                                        {subscription.plan.name}
                                    </p>

                                    <p className="mt-1 text-base font-bold text-slate-900">
                                        {formatCurrency(
                                            subscription.effectivePrice,
                                            subscription.currency,
                                        )}
                                    </p>
                                </div>

                                <StatusBadge status={subscription.status} />
                            </div>

                            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                                <span>
                                    {subscription.listingCredits} listing credits
                                </span>

                                <span>
                                    Expires {formatDate(subscription.expiresAt)}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </>
    );
}