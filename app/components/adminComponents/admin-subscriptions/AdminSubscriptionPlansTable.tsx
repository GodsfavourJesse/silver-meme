"use client";

import {
    CheckCircle2,
    Clock3,
    Edit3,
    Layers3,
    MoreHorizontal,
    Power,
    Tag,
} from "lucide-react";

import type {
    AdminSubscriptionPlan,
} from "@/app/types/admin/admin-subscription.types";

interface AdminSubscriptionPlansTableProps {
    plans: AdminSubscriptionPlan[];
    isLoading?: boolean;
    onEdit: (plan: AdminSubscriptionPlan) => void;
}

function formatCurrency(
    amount: number | string,
    currency = "NGN",
) {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
}

function StatusBadge({
    active,
}: {
    active: boolean;
}) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                active
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-gray-100 text-gray-600"
            }`}
        >
            {active ? (
                <CheckCircle2 size={13} />
            ) : (
                <Power size={13} />
            )}

            {active ? "Active" : "Inactive"}
        </span>
    );
}

function TableSkeleton() {
    return (
        <div className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, index) => (
                <div
                    key={index}
                    className="flex animate-pulse items-center gap-5 px-6 py-5"
                >
                    <div className="h-10 w-10 rounded-xl bg-blue-50" />

                    <div className="flex-1 space-y-2">
                        <div className="h-3 w-32 rounded bg-gray-100" />
                        <div className="h-3 w-48 rounded bg-gray-100" />
                    </div>

                    <div className="hidden h-5 w-20 rounded bg-gray-100 sm:block" />
                    <div className="hidden h-5 w-20 rounded bg-gray-100 md:block" />
                </div>
            ))}
        </div>
    );
}

export default function AdminSubscriptionPlansTable({
    plans,
    isLoading,
    onEdit,
}: AdminSubscriptionPlansTableProps) {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5 sm:px-6">
                <div>
                    <h2 className="font-bold text-gray-950">
                        Subscription plans
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage your subscription offerings and pricing.
                    </p>
                </div>

                <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#0877D9]">
                    {plans.length} plans
                </span>
            </div>

            {isLoading ? (
                <TableSkeleton />
            ) : plans.length === 0 ? (
                <div className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1491FF]">
                        <Layers3 size={25} />
                    </div>

                    <h3 className="mt-4 font-semibold text-gray-900">
                        No subscription plans yet
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                        Create your first plan to start offering subscriptions.
                    </p>
                </div>
            ) : (
                <>
                    {/* Desktop table */}
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/80">
                                <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    <th className="px-6 py-4">Plan</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Duration</th>
                                    <th className="px-6 py-4">Credits</th>
                                    <th className="px-6 py-4">Dealer discount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {plans.map((plan) => {
                                    const version = plan.latestVersion;

                                    return (
                                        <tr
                                            key={plan.id}
                                            className="transition hover:bg-blue-50/30"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="font-semibold text-gray-900">
                                                    {plan.name}
                                                </div>

                                                <div className="mt-1 max-w-xs truncate text-xs text-gray-500">
                                                    {plan.description || "No description"}
                                                </div>

                                                {version && (
                                                    <span className="mt-2 inline-flex rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600">
                                                        Version {version.version}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-5">
                                                <span className="font-semibold text-gray-900">
                                                    {version
                                                        ? formatCurrency(
                                                            version.price,
                                                            version.currency,
                                                        )
                                                        : "—"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-5 text-sm text-gray-600">
                                                {version
                                                    ? `${version.durationDays} days`
                                                    : "—"}
                                            </td>

                                            <td className="px-6 py-5">
                                                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                                    <Layers3
                                                        size={15}
                                                        className="text-[#1491FF]"
                                                    />
                                                    {version?.listingCredits ?? "—"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-5">
                                                <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                                                    <Tag
                                                        size={14}
                                                        className="text-gray-400"
                                                    />
                                                    {version?.dealerDiscountPercent ?? 0}%
                                                </span>
                                            </td>

                                            <td className="px-6 py-5">
                                                <StatusBadge active={plan.active} />
                                            </td>

                                            <td className="px-6 py-5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => onEdit(plan)}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0877D9]"
                                                >
                                                    <Edit3 size={14} />
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="divide-y divide-gray-100 md:hidden">
                        {plans.map((plan) => {
                            const version = plan.latestVersion;

                            return (
                                <div
                                    key={plan.id}
                                    className="space-y-4 p-5"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-gray-950">
                                                {plan.name}
                                            </h3>

                                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                                                {plan.description || "No description"}
                                            </p>
                                        </div>

                                        <StatusBadge active={plan.active} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Price
                                            </p>

                                            <p className="mt-1 font-semibold text-gray-900">
                                                {version
                                                    ? formatCurrency(
                                                        version.price,
                                                        version.currency,
                                                    )
                                                    : "—"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Duration
                                            </p>

                                            <p className="mt-1 font-semibold text-gray-900">
                                                {version?.durationDays ?? "—"} days
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Listing credits
                                            </p>

                                            <p className="mt-1 font-semibold text-gray-900">
                                                {version?.listingCredits ?? "—"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Dealer discount
                                            </p>

                                            <p className="mt-1 font-semibold text-gray-900">
                                                {version?.dealerDiscountPercent ?? 0}%
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => onEdit(plan)}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0877D9]"
                                    >
                                        <Edit3 size={15} />
                                        Manage plan
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}