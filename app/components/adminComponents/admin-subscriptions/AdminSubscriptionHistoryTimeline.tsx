"use client";

import { useState } from "react";

import {
    Activity,
    AlertCircle,
    ArrowDownRight,
    ArrowLeftRight,
    ArrowRight,
    ArrowUpRight,
    Ban,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    Clock3,
    Coins,
    CreditCard,
    FileText,
    History,
    LoaderCircle,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    XCircle,
} from "lucide-react";

import type {
    LucideIcon,
} from "lucide-react";

import { useAdminSubscriptionHistory } from "@/app/hooks/admin/subscriptions/useAdminSubscriptionHistory";

import type {
    AdminSubscriptionHistoryEvent,
    AdminSubscriptionHistoryItem,
} from "@/app/services/admin/admin-subscriptions/admin-subscription-history.service";

interface AdminSubscriptionHistoryTimelineProps {
    subscriptionId: string;
}

interface EventAppearance {
    label: string;
    description: string;
    icon: LucideIcon;
    color: string;
    background: string;
    border: string;
}

const EVENT_APPEARANCE: Record<
    AdminSubscriptionHistoryEvent,
    EventAppearance
> = {
    CREATED: {
        label: "Subscription created",
        description: "A subscription record was created.",
        icon: Sparkles,
        color: "text-blue-700",
        background: "bg-blue-50",
        border: "border-blue-200",
    },

    PAYMENT_PENDING: {
        label: "Payment pending",
        description: "Payment initialization is pending.",
        icon: Clock3,
        color: "text-amber-700",
        background: "bg-amber-50",
        border: "border-amber-200",
    },

    PAYMENT_SUCCESS: {
        label: "Payment successful",
        description: "Payment was successfully confirmed.",
        icon: CheckCircle2,
        color: "text-emerald-700",
        background: "bg-emerald-50",
        border: "border-emerald-200",
    },

    PAYMENT_FAILED: {
        label: "Payment failed",
        description: "The payment attempt was unsuccessful.",
        icon: XCircle,
        color: "text-red-700",
        background: "bg-red-50",
        border: "border-red-200",
    },

    ACTIVATED: {
        label: "Subscription activated",
        description: "The subscription became active.",
        icon: ShieldCheck,
        color: "text-emerald-700",
        background: "bg-emerald-50",
        border: "border-emerald-200",
    },

    RENEWED: {
        label: "Subscription renewed",
        description: "The subscription period was renewed.",
        icon: RefreshCw,
        color: "text-blue-700",
        background: "bg-blue-50",
        border: "border-blue-200",
    },

    CANCELLED: {
        label: "Subscription cancelled",
        description: "The subscription was cancelled.",
        icon: Ban,
        color: "text-red-700",
        background: "bg-red-50",
        border: "border-red-200",
    },

    EXPIRED: {
        label: "Subscription expired",
        description: "The subscription reached its expiry date.",
        icon: Clock3,
        color: "text-slate-700",
        background: "bg-slate-100",
        border: "border-slate-200",
    },

    REACTIVATED: {
        label: "Subscription reactivated",
        description: "The subscription was reactivated.",
        icon: RefreshCw,
        color: "text-emerald-700",
        background: "bg-emerald-50",
        border: "border-emerald-200",
    },

    REFUNDED: {
        label: "Payment refunded",
        description: "A refund was recorded.",
        icon: ArrowDownRight,
        color: "text-orange-700",
        background: "bg-orange-50",
        border: "border-orange-200",
    },

    SUSPENDED: {
        label: "Subscription suspended",
        description: "The subscription was suspended.",
        icon: Ban,
        color: "text-red-700",
        background: "bg-red-50",
        border: "border-red-200",
    },

    RESUMED: {
        label: "Subscription resumed",
        description: "The suspended subscription was resumed.",
        icon: Activity,
        color: "text-blue-700",
        background: "bg-blue-50",
        border: "border-blue-200",
    },

    CREDIT_GRANTED: {
        label: "Credits granted",
        description: "Subscription credits were granted.",
        icon: Coins,
        color: "text-emerald-700",
        background: "bg-emerald-50",
        border: "border-emerald-200",
    },

    CREDIT_REVOKED: {
        label: "Credits revoked",
        description: "Subscription credits were revoked.",
        icon: Coins,
        color: "text-orange-700",
        background: "bg-orange-50",
        border: "border-orange-200",
    },
};

function formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Unknown date";
    }

    return new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

function formatTime(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(date);
}

function formatAmount(
    amount: string | null,
    currency: string | null,
): string | null {
    if (amount === null) {
        return null;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount)) {
        return `${amount} ${currency ?? ""}`.trim();
    }

    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: currency || "NGN",
            maximumFractionDigits: 2,
        }).format(numericAmount);
    } catch {
        return `${currency ?? ""} ${numericAmount.toLocaleString("en-NG")}`.trim();
    }
}

function formatStatus(status: string | null): string {
    if (!status) return "—";

    return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatEvent(event: string): string {
    return event
        .split("_")
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ");
}

function parseMetadata(metadata: string | null): string | null {
    if (!metadata) return null;

    try {
        const parsed = JSON.parse(metadata);

        return JSON.stringify(parsed, null, 2);
    } catch {
        return metadata;
    }
}

function HistoryEventCard({
    item,
    isLast,
}: {
    item: AdminSubscriptionHistoryItem;
    isLast: boolean;
}) {
    const [metadataOpen, setMetadataOpen] = useState(false);

    const appearance = EVENT_APPEARANCE[item.event] ?? {
        label: formatEvent(item.event),
        description: "A subscription event was recorded.",
        icon: History,
        color: "text-slate-700",
        background: "bg-slate-100",
        border: "border-slate-200",
    };

    const Icon = appearance.icon;

    const amount = formatAmount(item.amount, item.currency);
    const metadata = parseMetadata(item.metadata);

    return (
        <div className="relative flex gap-4">
            {/* Timeline indicator */}
            <div className="relative flex shrink-0 flex-col items-center">
                <div
                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-2xl border ${appearance.background} ${appearance.border}`}
                >
                    <Icon className={`h-5 w-5 ${appearance.color}`} />
                </div>

                {!isLast && (
                    <div className="mt-2 min-h-8 w-px flex-1 bg-slate-200" />
                )}
            </div>

            {/* Event content */}
            <div className="mb-6 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold text-slate-900">
                                {appearance.label}
                            </h4>

                            <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${appearance.background} ${appearance.color}`}
                            >
                                {formatEvent(item.event)}
                            </span>
                        </div>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            {appearance.description}
                        </p>
                    </div>

                    <div className="shrink-0 sm:text-right">
                        <p className="text-xs font-semibold text-slate-700">
                            {formatDate(item.createdAt)}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            {formatTime(item.createdAt)}
                        </p>
                    </div>
                </div>

                {/* Amount */}
                {amount && (
                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
                            <CircleDollarSign className="h-4 w-4 text-[#1491FF]" />
                        </div>

                        <div>
                            <p className="text-[11px] font-medium text-slate-500">
                                Transaction amount
                            </p>

                            <p className="text-sm font-bold text-slate-900">
                                {amount}
                            </p>
                        </div>
                    </div>
                )}

                {/* Status transition */}
                {(item.previousStatus || item.newStatus) && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-slate-500">
                            Status:
                        </span>

                        {item.previousStatus && (
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                {formatStatus(item.previousStatus)}
                            </span>
                        )}

                        {item.previousStatus && item.newStatus && (
                            <ArrowRight className="h-3.5 w-3.5 text-[#1491FF]" />
                        )}

                        {item.newStatus && (
                            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                {formatStatus(item.newStatus)}
                            </span>
                        )}
                    </div>
                )}

                {/* Reason */}
                {item.reason && (
                    <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                        <div className="mb-1 flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-slate-400" />

                            <span className="text-xs font-semibold text-slate-600">
                                Reason
                            </span>
                        </div>

                        <p className="text-sm leading-6 text-slate-600">
                            {item.reason}
                        </p>
                    </div>
                )}

                {/* Reference */}
                {item.referenceId && (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-medium text-slate-500">
                            Reference ID
                        </span>

                        <span className="max-w-full break-all rounded-lg bg-slate-50 px-2.5 py-1 font-mono text-[11px] text-slate-600">
                            {item.referenceId}
                        </span>
                    </div>
                )}

                {/* Created by */}
                {item.createdBy && (
                    <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-500">
                            Recorded by
                        </span>

                        <span className="text-xs font-medium text-slate-700">
                            {item.createdBy}
                        </span>
                    </div>
                )}

                {/* Metadata */}
                {metadata && (
                    <div className="mt-4 border-t border-slate-100 pt-3">
                        <button
                            type="button"
                            onClick={() => setMetadataOpen((current) => !current)}
                            className="flex w-full items-center justify-between gap-3 text-left text-xs font-semibold text-[#0877D9] transition hover:text-[#0065C9]"
                        >
                            <span>Additional metadata</span>

                            <ChevronDown
                                className={`h-4 w-4 transition-transform ${
                                    metadataOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {metadataOpen && (
                            <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-slate-950 p-3 text-[11px] leading-5 text-blue-100">
                                {metadata}
                            </pre>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminSubscriptionHistoryTimeline({
    subscriptionId,
}: AdminSubscriptionHistoryTimelineProps) {
    const [page, setPage] = useState(1);

    const limit = 10;

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useAdminSubscriptionHistory(subscriptionId, {
        page,
        limit,
    });

    if (isLoading) {
        return (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                        <History className="h-5 w-5 text-[#1491FF]" />
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900">
                            Subscription history
                        </h3>

                        <p className="text-xs text-slate-500">
                            Loading subscription activity...
                        </p>
                    </div>
                </div>

                <div className="space-y-5">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex gap-4">
                            <div className="h-10 w-10 shrink-0 animate-pulse rounded-2xl bg-blue-50" />

                            <div className="flex-1 space-y-3 rounded-2xl border border-slate-100 p-4">
                                <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
                                <div className="h-3 w-64 max-w-full animate-pulse rounded bg-slate-100" />
                                <div className="h-12 animate-pulse rounded-xl bg-slate-50" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="rounded-2xl border border-red-100 bg-white p-6">
                <div className="flex flex-col items-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>

                    <h3 className="mt-3 font-semibold text-slate-900">
                        Unable to load subscription history
                    </h3>

                    <p className="mt-1 max-w-sm text-sm text-slate-500">
                        {error instanceof Error
                            ? error.message
                            : "Something went wrong while retrieving subscription activity."}
                    </p>

                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1491FF] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0877D9]"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try again
                    </button>
                </div>
            </section>
        );
    }

    const items = data?.items ?? [];
    const pagination = data?.pagination;

    const totalPages = pagination?.totalPages ?? 1;
    const total = pagination?.total ?? 0;

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                        <History className="h-5 w-5 text-[#1491FF]" />
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900">
                            Subscription history
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-500">
                            A chronological record of subscription activity.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#0877D9]">
                        {total} {total === 1 ? "event" : "events"}
                    </span>

                    {isFetching && (
                        <LoaderCircle className="h-4 w-4 animate-spin text-[#1491FF]" />
                    )}
                </div>
            </div>

            {/* Timeline */}
            <div className="p-5 sm:p-6">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                            <History className="h-7 w-7 text-[#1491FF]" />
                        </div>

                        <h4 className="mt-4 font-semibold text-slate-900">
                            No history available
                        </h4>

                        <p className="mt-1 max-w-xs text-sm leading-6 text-slate-500">
                            Subscription events will appear here as payments,
                            renewals, cancellations, and other activities occur.
                        </p>
                    </div>
                ) : (
                    <div>
                        {items.map((item, index) => (
                            <HistoryEventCard
                                key={item.id}
                                item={item}
                                isLast={index === items.length - 1}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-2 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-500">
                            Page{" "}
                            <span className="font-semibold text-slate-800">
                                {page}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-slate-800">
                                {totalPages}
                            </span>
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page <= 1 || isFetching}
                                onClick={() =>
                                    setPage((current) => Math.max(1, current - 1))
                                }
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0877D9] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </button>

                            <button
                                type="button"
                                disabled={page >= totalPages || isFetching}
                                onClick={() =>
                                    setPage((current) =>
                                        Math.min(totalPages, current + 1),
                                    )
                                }
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0877D9] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}