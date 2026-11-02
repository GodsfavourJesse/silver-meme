"use client";

import Link from "next/link";
import { useState } from "react";
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    ExternalLink,
    FileText,
    RefreshCw,
} from "lucide-react";
import { usePaymentHistory } from "@/app/hooks/user/payments/usePaymentHistory";
import PaymentStatusBadge from "@/app/components/userComponents/subscriptions/PaymentStatusBadge";

interface PaymentRecord {
    id?: string;
    reference?: string;
    purpose?: string;
    status?: string;
    amount?: number | string;
    currency?: string;
    paidAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    provider?: string;
}

interface HistoryResult {
    items: PaymentRecord[];
    total?: number;
    totalPages?: number;
    page?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function getPaymentRecords(value: unknown): HistoryResult {
    if (Array.isArray(value)) {
        return {
            items: value.filter(isRecord) as PaymentRecord[],
        };
    }

    if (!isRecord(value)) {
        return { items: [] };
    }

    const possibleItems =
        Array.isArray(value.items)
            ? value.items
            : Array.isArray(value.payments)
                ? value.payments
                : Array.isArray(value.transactions)
                    ? value.transactions
                    : [];

    const pagination = isRecord(value.pagination)
        ? value.pagination
        : undefined;

    return {
        items: possibleItems.filter(isRecord) as PaymentRecord[],
        total: typeof pagination?.total === "number"
            ? pagination.total
            : undefined,
        totalPages: typeof pagination?.totalPages === "number"
            ? pagination.totalPages
            : undefined,
        page: typeof pagination?.page === "number"
            ? pagination.page
            : undefined,
    };
}

function formatCurrency(
    amount: number | string | undefined,
    currency = "NGN",
) {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
}

function formatDate(value?: string | null) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function getPurposeLabel(purpose?: string) {
    switch (purpose) {
        case "SUBSCRIPTION":
            return "Subscription";
        case "BOOST":
            return "Listing boost";
        default:
            return purpose || "Payment";
    }
}

function PaymentHistorySkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
                <div
                    key={index}
                    className="h-20 animate-pulse rounded-xl bg-blue-50/60"
                />
            ))}
        </div>
    );
}

export default function SubscriptionHistoryPage() {
    const [page, setPage] = useState(1);
    const limit = 20;

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = usePaymentHistory({
        page,
        limit,
    });

    const history = getPaymentRecords(data);

    const totalPages = history.totalPages ??
        (history.total !== undefined
            ? Math.max(1, Math.ceil(history.total / limit))
            : undefined);

    return (
        <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:py-10">
            {/* Header */}
            <div>
                <Link
                    href="/dashboard/subscriptions"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1491FF]"
                >
                    <ArrowLeft size={16} />
                    Back to subscription
                </Link>

                <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-[#1491FF]">
                            <FileText size={16} />
                            Transactions
                        </div>

                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                            Payment history
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            View your KARMASS payments and transaction
                            references.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-blue-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={15}
                            className={isFetching ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Summary */}
            <section className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#1491FF] shadow-sm">
                        <CreditCard size={21} />
                    </div>

                    <div>
                        <h2 className="font-semibold text-gray-900">
                            Your transactions
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">
                            Payment records associated with your account.
                        </p>
                    </div>
                </div>
            </section>

            {/* Loading */}
            {isLoading && <PaymentHistorySkeleton />}

            {/* Error */}
            {isError && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
                    <h2 className="font-semibold text-gray-900">
                        Unable to load payment history
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                        {error instanceof Error
                            ? error.message
                            : "Something went wrong while retrieving your transactions."}
                    </p>

                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#1491FF] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0877D9]"
                    >
                        <RefreshCw size={16} />
                        Try again
                    </button>
                </div>
            )}

            {/* Transactions */}
            {!isLoading && !isError && history.items.length > 0 && (
                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                        <div>
                            <h2 className="font-semibold text-gray-950">
                                Transactions
                            </h2>

                            <p className="mt-1 text-xs text-gray-400">
                                {history.total !== undefined
                                    ? `${history.total.toLocaleString("en-NG")} records`
                                    : `${history.items.length} records loaded`}
                            </p>
                        </div>
                    </div>

                    {/* Desktop table */}
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/70">
                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Transaction
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Reference
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Amount
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Date
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {history.items.map((payment, index) => (
                                    <tr
                                        key={payment.id ?? payment.reference ?? index}
                                        className="transition hover:bg-gray-50/70"
                                    >
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {getPurposeLabel(payment.purpose)}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-400">
                                                {payment.provider ?? "Payment provider"}
                                            </p>
                                        </td>

                                        <td className="max-w-48 px-5 py-4">
                                            <p className="truncate font-mono text-xs text-gray-600">
                                                {payment.reference ?? "—"}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                                            {formatCurrency(
                                                payment.amount,
                                                payment.currency,
                                            )}
                                        </td>

                                        <td className="px-5 py-4 text-xs text-gray-500">
                                            {formatDate(
                                                payment.paidAt ?? payment.createdAt,
                                            )}
                                        </td>

                                        <td className="px-5 py-4">
                                            <PaymentStatusBadge
                                                status={payment.status ?? "PENDING"}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="divide-y divide-gray-100 md:hidden">
                        {history.items.map((payment, index) => (
                            <div
                                key={payment.id ?? payment.reference ?? index}
                                className="space-y-3 p-5"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {getPurposeLabel(payment.purpose)}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            {formatDate(
                                                payment.paidAt ?? payment.createdAt,
                                            )}
                                        </p>
                                    </div>

                                    <PaymentStatusBadge
                                        status={payment.status ?? "PENDING"}
                                    />
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-lg font-bold text-gray-950">
                                        {formatCurrency(
                                            payment.amount,
                                            payment.currency,
                                        )}
                                    </p>

                                    <span className="text-xs text-gray-400">
                                        {payment.provider ?? "Payment"}
                                    </span>
                                </div>

                                <div className="border-t border-gray-100 pt-3">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                                        Reference
                                    </p>

                                    <p className="mt-1 break-all font-mono text-xs text-gray-600">
                                        {payment.reference ?? "—"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages !== undefined && totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
                            <p className="text-xs text-gray-500">
                                Page {page} of {totalPages}
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                                    disabled={page <= 1 || isFetching}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft size={17} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                    disabled={page >= totalPages || isFetching}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label="Next page"
                                >
                                    <ChevronRight size={17} />
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* Empty state */}
            {!isLoading && !isError && history.items.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1491FF]">
                        <CreditCard size={25} />
                    </div>

                    <h2 className="mt-5 text-lg font-bold text-gray-900">
                        No transactions yet
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                        Your subscription and payment transactions
                        will appear here once you make a payment.
                    </p>

                    <Link
                        href="/dashboard/subscriptions/plans"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1491FF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0877D9]"
                    >
                        Explore subscription plans
                        <ExternalLink size={16} />
                    </Link>
                </div>
            )}
        </main>
    );
}