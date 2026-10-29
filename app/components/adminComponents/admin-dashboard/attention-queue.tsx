"use client";

import Link from "next/link";

import {
    ArrowRight,
    Car,
    CircleCheck,
    CreditCard,
    Flag,
    Rocket,
    ScanEye,
    Store,
    type LucideIcon,
} from "lucide-react";

import { formatNumber } from "@/app/lib/admin/format";
import type { AdminDashboardData } from "@/app/types/admin/admin-dashboard.types";
import { ADMIN_BASE_PATH } from "@/app/lib/admin/path";

interface QueueItem {
    label: string;
    description: string;
    count: number;
    href: string;
    icon: LucideIcon;
}

function buildQueue(data: AdminDashboardData): QueueItem[] {
    return [
        {
            label: "Listings awaiting review",
            description: "Review and approve vehicle listings",
            count: data.moderation.pendingListings,
            href: `${ADMIN_BASE_PATH}/dashboard/listings`,
            icon: Car,
        },
        {
            label: "Dealer applications",
            description: "Review dealer registration requests",
            count: data.dealers.pendingApplications,
            href: `${ADMIN_BASE_PATH}/dashboard/dealers`,
            icon: Store,
        },
        {
            label: "Boosts to approve",
            description: "Review pending listing promotions",
            count: data.boosts.pendingApproval,
            href: `${ADMIN_BASE_PATH}/dashboard/boosts`,
            icon: Rocket,
        },
        {
            label: "Images to review",
            description: "Check flagged vehicle photos",
            count: data.moderation.pendingOrReviewImages,
            href: `${ADMIN_BASE_PATH}/dashboard/image-review`,
            icon: ScanEye,
        },
        {
            label: "Reports to review",
            description: "Investigate user-reported listings",
            count: data.moderation.pendingReports,
            href: `${ADMIN_BASE_PATH}/dashboard/listings`,
            icon: Flag,
        },
        {
            label: "Refunds awaiting resolution",
            description: "Review refunds awaiting settlement",
            count: data.refunds.pendingOrProcessing,
            href: `${ADMIN_BASE_PATH}/dashboard/payments`,
            icon: CreditCard,
        },
    ].sort((a, b) => b.count - a.count);
}

function QueueCount({ count }: { count: number }) {
    if (count === 0) {
        return (
            <span className="inline-flex min-w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold tabular-nums text-slate-400">
                0
            </span>
        );
    }

    return (
        <span
            className={`inline-flex min-w-8 items-center justify-center rounded-lg border px-2 py-1 text-xs font-bold tabular-nums ${
                count >= 10
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
        >
            {formatNumber(count)}
        </span>
    );
}

export function AttentionQueue({
    data,
}: {
    data: AdminDashboardData;
}) {
    const queue = buildQueue(data);

    const total = queue.reduce(
        (sum, item) => sum + item.count,
        0,
    );

    const max = Math.max(...queue.map((item) => item.count), 1);

    return (
        <section className="h-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#D7EAFE] bg-[#F0F7FF] text-[#1491FF]">
                        <Flag size={19} strokeWidth={1.9} />
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-base font-semibold tracking-tight text-slate-900">
                            Attention required
                        </h2>

                        <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                            Tasks that may need your review or approval.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:shrink-0">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Outstanding
                        </p>

                        <p className="mt-0.5 text-2xl font-bold leading-none tracking-tight text-slate-900 tabular-nums">
                            {formatNumber(total)}
                        </p>
                    </div>

                    <div
                        className={`flex size-10 items-center justify-center rounded-xl border ${
                            total > 0
                                ? "border-amber-200 bg-amber-50 text-amber-600"
                                : "border-emerald-200 bg-emerald-50 text-emerald-600"
                        }`}
                    >
                        {total > 0 ? (
                            <Flag size={18} />
                        ) : (
                            <CircleCheck size={19} />
                        )}
                    </div>
                </div>
            </div>

            {/* Queue items */}
            {total === 0 ? (
                <div className="flex flex-col items-center px-5 py-10 text-center sm:py-12">
                    <div className="flex size-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600">
                        <CircleCheck size={27} strokeWidth={1.7} />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-slate-900">
                        You&apos;re all caught up
                    </h3>

                    <p className="mt-1.5 max-w-xs text-sm leading-6 text-slate-500">
                        There are no outstanding items in the current
                        dashboard queue. Everything is up to date.
                    </p>
                </div>
            ) : (
                <ul className="divide-y divide-slate-100">
                    {queue.map((item) => {
                        const Icon = item.icon;
                        const empty = item.count === 0;
                        const progress = (item.count / max) * 100;

                        return (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    aria-label={`${item.label}: ${formatNumber(item.count)} items. ${item.description}`}
                                    className="group flex min-w-0 items-center gap-3 px-4 py-4 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1491FF]/50 sm:gap-4 sm:px-6"
                                >
                                    {/* Item icon */}
                                    <div
                                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                                            empty
                                                ? "border-slate-200 bg-white text-slate-400"
                                                : "border-[#D7EAFE] bg-[#F0F7FF] text-[#0876D1] group-hover:border-[#B9DEFF] group-hover:bg-[#E5F2FF]"
                                        }`}
                                    >
                                        <Icon
                                            size={18}
                                            strokeWidth={1.8}
                                        />
                                    </div>

                                    {/* Item details */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3
                                                className={`truncate text-sm font-semibold ${
                                                    empty
                                                        ? "text-slate-500"
                                                        : "text-slate-800"
                                                }`}
                                            >
                                                {item.label}
                                            </h3>

                                            <QueueCount count={item.count} />
                                        </div>

                                        <p className="mt-1 truncate text-xs leading-5 text-slate-500">
                                            {item.description}
                                        </p>

                                        {/* Workload indicator */}
                                        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className={`h-full rounded-full transition-[width] duration-300 ${
                                                    empty
                                                        ? "bg-slate-200"
                                                        : item.count >= 10
                                                          ? "bg-red-500"
                                                          : "bg-[#1491FF]"
                                                }`}
                                                style={{
                                                    width: `${progress}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Navigation indicator */}
                                    <ArrowRight
                                        size={16}
                                        className="ml-0.5 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-[#1491FF]"
                                    />
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/70 px-4 py-3.5 sm:px-6">
                <p className="text-xs text-slate-500">
                    {total === 0
                        ? "No pending actions"
                        : `${formatNumber(total)} outstanding ${
                              total === 1 ? "item" : "items"
                          } across ${queue.filter((item) => item.count > 0).length} categories`}
                </p>

                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <span className="size-1.5 rounded-full bg-[#1491FF]" />
                    Admin overview
                </span>
            </div>
        </section>
    );
}