"use client";

import { useState } from "react";

import Link from "next/link";

import {
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    CalendarDays,
    CarFront,
    CheckCircle2,
    Clock3,
    CreditCard,
    History,
    LoaderCircle,
    RefreshCw,
    ShieldAlert,
    XCircle,
} from "lucide-react";

import { useBoostHistory } from "@/app/hooks/user/boost/useBoost";

import type {
    BoostHistoryItem,
    BoostStatus,
} from "@/app/types/user/boost/boost.types";

// ============================================
// CONSTANTS
// ============================================

const PAGE_LIMIT = 10;

const STATUS_CONFIG: Record<
    BoostStatus,
    {
        label: string;
        description: string;
        className: string;
        icon: typeof Clock3;
    }
> = {
    PENDING: {
        label: "Payment pending",
        description: "Complete payment to continue.",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock3,
    },

    AWAITING_APPROVAL: {
        label: "Awaiting approval",
        description: "Your payment has been verified.",
        className: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Clock3,
    },

    ACTIVE: {
        label: "Active",
        description: "Your vehicle is currently boosted.",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
    },

    REJECTED: {
        label: "Rejected",
        description: "This boost request was rejected.",
        className: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
    },

    EXPIRED: {
        label: "Expired",
        description: "The promotion period has ended.",
        className: "bg-slate-100 text-slate-600 border-slate-200",
        icon: CalendarDays,
    },

    CANCELLED: {
        label: "Cancelled",
        description: "This boost request was cancelled.",
        className: "bg-slate-100 text-slate-600 border-slate-200",
        icon: XCircle,
    },
};

// ============================================
// FORMATTERS
// ============================================

function formatPrice(
    price: string | number,
    currency: string,
) {
    const amount = Number(price);

    if (!Number.isFinite(amount)) {
        return `${currency} ${price}`;
    }

    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: currency || "NGN",
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${currency} ${amount.toLocaleString()}`;
    }
}

function formatDate(date?: string | null) {
    if (!date) return "Not available";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return "Not available";
    }

    return parsed.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

// ============================================
// PAGE
// ============================================

export default function BoostHistoryPage() {
    const [page, setPage] = useState(1);

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useBoostHistory({
        page,
        limit: PAGE_LIMIT,
    });

    const items = data?.items ?? [];
    const pagination = data?.pagination;

    const totalPages = pagination?.totalPages ?? 1;

    return (
        <main className="min-h-screen bg-[#F7FAFD] pb-16">

            <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">

                {/* HEADER */}

                <div className="mb-8">

                    <Link
                        href="/dashboard/my-listings"
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#1491FF]"
                    >
                        <ArrowLeft size={16} />
                        Back to my listings
                    </Link>

                    <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

                        <div>

                            <div className="flex items-center gap-2 text-[#1491FF]">
                                <History size={19} />

                                <span className="text-xs font-bold uppercase tracking-wider">
                                    Promotion activity
                                </span>
                            </div>

                            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                                Boost history
                            </h1>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                Track your vehicle promotions, payment
                                confirmations and boost activity.
                            </p>

                        </div>

                        <button
                            type="button"
                            onClick={() => refetch()}
                            disabled={isFetching}
                            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#1491FF] hover:text-[#1491FF] disabled:opacity-50 sm:self-auto"
                        >
                            <RefreshCw
                                size={15}
                                className={
                                    isFetching
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            Refresh
                        </button>

                    </div>
                </div>

                {/* SUMMARY */}

                <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">

                    <SummaryCard
                        label="Total boosts"
                        value={pagination?.total ?? 0}
                        icon={History}
                        iconClass="bg-[#EAF5FF] text-[#1491FF]"
                    />

                    <SummaryCard
                        label="Active on this page"
                        value={
                            items.filter(
                                (item) => item.status === "ACTIVE",
                            ).length
                        }
                        icon={CheckCircle2}
                        iconClass="bg-emerald-50 text-emerald-600"
                    />

                    <SummaryCard
                        label="Awaiting approval"
                        value={
                            items.filter(
                                (item) =>
                                    item.status === "AWAITING_APPROVAL",
                            ).length
                        }
                        icon={Clock3}
                        iconClass="bg-blue-50 text-blue-600"
                    />

                    <SummaryCard
                        label="Pending payment"
                        value={
                            items.filter(
                                (item) => item.status === "PENDING",
                            ).length
                        }
                        icon={CreditCard}
                        iconClass="bg-amber-50 text-amber-600"
                    />

                </div>

                {/* HISTORY */}

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                        <div>
                            <h2 className="text-sm font-bold text-slate-900">
                                Your promotions
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                A record of your vehicle boost requests.
                            </p>
                        </div>

                        <span className="text-xs font-medium text-slate-400">
                            {pagination?.total ?? 0} records
                        </span>

                    </div>

                    {/* LOADING */}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-20">

                            <LoaderCircle
                                size={30}
                                className="animate-spin text-[#1491FF]"
                            />

                            <p className="mt-4 text-sm text-slate-500">
                                Loading your boost history...
                            </p>

                        </div>
                    )}

                    {/* ERROR */}

                    {!isLoading && isError && (
                        <div className="px-5 py-16 text-center">

                            <ShieldAlert
                                size={32}
                                className="mx-auto text-red-400"
                            />

                            <h3 className="mt-4 text-sm font-bold text-slate-900">
                                Unable to load boost history
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                {error instanceof Error
                                    ? error.message
                                    : "Something went wrong."}
                            </p>

                            <button
                                type="button"
                                onClick={() => refetch()}
                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1491FF] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0877D9]"
                            >
                                <RefreshCw size={15} />
                                Try again
                            </button>

                        </div>
                    )}

                    {/* EMPTY */}

                    {!isLoading &&
                        !isError &&
                        items.length === 0 && (
                            <div className="px-5 py-20 text-center">

                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF5FF] text-[#1491FF]">
                                    <CarFront size={30} />
                                </div>

                                <h3 className="mt-5 text-base font-bold text-slate-900">
                                    No boost activity yet
                                </h3>

                                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                    When you promote one of your vehicles,
                                    your boost activity will appear here.
                                </p>

                                <Link
                                    href="/dashboard/my-listings"
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1491FF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0877D9]"
                                >
                                    View my listings
                                    <ArrowRight size={16} />
                                </Link>

                            </div>
                        )}

                    {/* HISTORY ITEMS */}

                    {!isLoading &&
                        !isError &&
                        items.length > 0 && (
                            <div className="divide-y divide-slate-100">

                                {items.map((item) => (
                                    <BoostHistoryCard
                                        key={item.id}
                                        item={item}
                                    />
                                ))}

                            </div>
                        )}

                    {/* PAGINATION */}

                    {!isLoading &&
                        !isError &&
                        pagination &&
                        pagination.totalPages > 1 && (
                            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                                <p className="text-xs text-slate-500">
                                    Page {pagination.page} of{" "}
                                    {pagination.totalPages}
                                </p>

                                <div className="flex items-center gap-2">

                                    <button
                                        type="button"
                                        disabled={
                                            page <= 1 ||
                                            isFetching
                                        }
                                        onClick={() =>
                                            setPage((current) =>
                                                Math.max(1, current - 1),
                                            )
                                        }
                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#1491FF] hover:text-[#1491FF] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ArrowLeft size={14} />
                                        Previous
                                    </button>

                                    <button
                                        type="button"
                                        disabled={
                                            page >= totalPages ||
                                            isFetching
                                        }
                                        onClick={() =>
                                            setPage((current) =>
                                                Math.min(
                                                    totalPages,
                                                    current + 1,
                                                ),
                                            )
                                        }
                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#1491FF] hover:text-[#1491FF] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Next
                                        <ArrowRight size={14} />
                                    </button>

                                </div>

                            </div>
                        )}

                </section>

                {/* INFORMATION */}

                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-[#F4F9FF] p-4">

                    <ShieldAlert
                        size={18}
                        className="mt-0.5 shrink-0 text-[#1491FF]"
                    />

                    <div>
                        <p className="text-xs font-bold text-slate-800">
                            Understanding your boost status
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                            A successful payment moves your boost into
                            administrative review. Your promotion only
                            becomes active after KARMASS approves it.
                        </p>
                    </div>

                </div>

            </div>

        </main>
    );
}

// ============================================
// SUMMARY CARD
// ============================================

function SummaryCard({
    label,
    value,
    icon: Icon,
    iconClass,
}: {
    label: string;
    value: number;
    icon: typeof History;
    iconClass: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">

            <div className="flex items-center justify-between gap-2">

                <span className="text-xs font-medium text-slate-500">
                    {label}
                </span>

                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}>
                    <Icon size={17} />
                </div>

            </div>

            <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">
                {value.toLocaleString()}
            </p>

        </div>
    );
}

// ============================================
// HISTORY CARD
// ============================================

function BoostHistoryCard({
    item,
}: {
    item: BoostHistoryItem;
}) {
    const config = STATUS_CONFIG[item.status];

    const StatusIcon = config.icon;

    const canContinuePayment =
        item.status === "PENDING";

    const canBoostAgain =
        item.status === "EXPIRED" ||
        item.status === "REJECTED" ||
        item.status === "CANCELLED";

    return (
        <article className="p-5 transition hover:bg-slate-50/60">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                {/* VEHICLE DETAILS */}

                <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${config.className}`}>
                            <StatusIcon size={12} />
                            {config.label}
                        </span>

                        <span className="text-[11px] text-slate-400">
                            {formatDate(item.createdAt)}
                        </span>

                    </div>

                    <h3 className="mt-3 text-sm font-bold text-slate-900">
                        {item.listingTitle}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">

                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                            <CalendarDays
                                size={13}
                                className="text-[#1491FF]"
                            />

                            {item.durationDays} days
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                            <CreditCard
                                size={13}
                                className="text-[#1491FF]"
                            />

                            {formatPrice(
                                item.price,
                                item.currency,
                            )}
                        </span>

                    </div>

                    {/* STATUS DESCRIPTION */}

                    <p className="mt-3 text-xs leading-5 text-slate-500">
                        {config.description}
                    </p>

                    {/* DATES */}

                    {(item.startsAt || item.expiresAt) && (
                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-3">

                            {item.startsAt && (
                                <div>
                                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                        Started
                                    </p>

                                    <p className="mt-1 text-xs font-semibold text-slate-700">
                                        {formatDate(item.startsAt)}
                                    </p>
                                </div>
                            )}

                            {item.expiresAt && (
                                <div>
                                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                        Expires
                                    </p>

                                    <p className="mt-1 text-xs font-semibold text-slate-700">
                                        {formatDate(item.expiresAt)}
                                    </p>
                                </div>
                            )}

                        </div>
                    )}

                    {/* REVIEW NOTE */}

                    {item.status === "REJECTED" &&
                        item.reviewNote && (
                            <div className="mt-3 rounded-xl bg-red-50 p-3">

                                <p className="text-[10px] font-bold uppercase tracking-wide text-red-600">
                                    Admin review note
                                </p>

                                <p className="mt-1 text-xs leading-5 text-red-700">
                                    {item.reviewNote}
                                </p>

                            </div>
                        )}

                </div>

                {/* ACTIONS */}

                <div className="flex shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-end">

                    <Link
                        href={`/dashboard/my-listings/${encodeURIComponent(item.listingId)}/boost`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1491FF]/20 bg-[#F4F9FF] px-3.5 py-2.5 text-xs font-bold text-[#0877D9] transition hover:border-[#1491FF] hover:bg-[#EAF5FF]"
                    >
                        {canContinuePayment
                            ? "Resume payment"
                            : canBoostAgain
                                ? "Boost again"
                                : "View boost"}

                        <ArrowRight size={14} />
                    </Link>

                </div>

            </div>

        </article>
    );
}