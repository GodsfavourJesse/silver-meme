"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    ExternalLink,
    Filter,
    RefreshCw,
    Rocket,
    Search,
    ShieldCheck,
    XCircle,
    AlertCircle,
    LoaderCircle,
} from "lucide-react";

import { ADMIN_BASE_PATH } from "@/app/lib/admin/path";

import {
    useAdminBoosts,
} from "@/app/hooks/admin/admin-boost/useAdminBoosts";

import type {
    AdminBoostStatus,
} from "@/app/types/admin/admin-boost.types";

const PAGE_SIZE = 10;

type StatusFilter = "ALL" | AdminBoostStatus;

const STATUS_OPTIONS: {
    label: string;
    value: StatusFilter;
}[] = [
    { label: "All requests", value: "ALL" },
    { label: "Awaiting approval", value: "AWAITING_APPROVAL" },
    { label: "Pending", value: "PENDING" },
    { label: "Active", value: "ACTIVE" },
    { label: "Rejected", value: "REJECTED" },
    { label: "Expired", value: "EXPIRED" },
    { label: "Cancelled", value: "CANCELLED" },
];

const STATUS_STYLES: Record<
    AdminBoostStatus,
    string
> = {
    PENDING:
        "bg-amber-50 text-amber-700 ring-amber-200",

    AWAITING_APPROVAL:
        "bg-blue-50 text-[#0877D9] ring-blue-200",

    ACTIVE:
        "bg-emerald-50 text-emerald-700 ring-emerald-200",

    REJECTED:
        "bg-red-50 text-red-700 ring-red-200",

    EXPIRED:
        "bg-slate-100 text-slate-600 ring-slate-200",

    CANCELLED:
        "bg-slate-100 text-slate-600 ring-slate-200",
};

function formatCurrency(
    amount: string | number,
    currency: string,
) {
    const value = Number(amount);

    if (!Number.isFinite(value)) {
        return `${currency} ${amount}`;
    }

    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
        }).format(value);
    } catch {
        return `${currency} ${value.toLocaleString()}`;
    }
}

function formatDate(date: string | null) {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(parsed);
}

function formatStatus(status: AdminBoostStatus) {
    return status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase(),
        );
}

function StatusBadge({
    status,
}: {
    status: AdminBoostStatus;
}) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ring-inset ${STATUS_STYLES[status]}`}
        >
            {formatStatus(status)}
        </span>
    );
}

function SummaryCard({
    label,
    value,
    description,
    icon: Icon,
    iconClass,
    loading,
}: {
    label: string;
    value: number | undefined;
    description: string;
    icon: typeof Rocket;
    iconClass: string;
    loading?: boolean;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {label}
                    </p>

                    {loading ? (
                        <div className="mt-3 h-8 w-16 animate-pulse rounded-lg bg-slate-100" />
                    ) : (
                        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                            {(value ?? 0).toLocaleString()}
                        </p>
                    )}
                </div>

                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
                >
                    <Icon size={21} />
                </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
                {description}
            </p>
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="divide-y divide-slate-100">
            {Array.from({ length: 6 }).map((_, index) => (
                <div
                    key={index}
                    className="flex items-center gap-4 px-5 py-5"
                >
                    <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-100" />

                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-3.5 w-40 animate-pulse rounded bg-slate-100" />
                        <div className="h-3 w-28 animate-pulse rounded bg-slate-50" />
                    </div>

                    <div className="hidden h-6 w-24 animate-pulse rounded-full bg-slate-100 sm:block" />

                    <div className="hidden h-4 w-20 animate-pulse rounded bg-slate-100 md:block" />
                </div>
            ))}
        </div>
    );
}

export default function AdminBoostsPage() {
    const [status, setStatus] =
        useState<StatusFilter>("ALL");

    const [page, setPage] = useState(1);

    const [search, setSearch] = useState("");

    const listQuery = useAdminBoosts({
        ...(status !== "ALL" ? { status } : {}),
        page,
        limit: PAGE_SIZE,
    });

    // Fetch global totals independently of the active table filter.
    const totalQuery = useAdminBoosts({
        page: 1,
        limit: 1,
    });

    const approvalQuery = useAdminBoosts({
        status: "AWAITING_APPROVAL",
        page: 1,
        limit: 1,
    });

    const pendingQuery = useAdminBoosts({
        status: "PENDING",
        page: 1,
        limit: 1,
    });

    const activeQuery = useAdminBoosts({
        status: "ACTIVE",
        page: 1,
        limit: 1,
    });

    const rejectedQuery = useAdminBoosts({
        status: "REJECTED",
        page: 1,
        limit: 1,
    });

    const expiredQuery = useAdminBoosts({
        status: "EXPIRED",
        page: 1,
        limit: 1,
    });

    const items = listQuery.data?.items ?? [];

    const filteredItems = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) return items;

        return items.filter((item) =>
            [
                item.listingTitle,
                item.sellerEmail,
                item.id,
                item.listingId,
            ].some((value) =>
                value?.toLowerCase().includes(term),
            ),
        );
    }, [items, search]);

    const pagination = listQuery.data?.pagination;

    const isInitialLoading =
        listQuery.isLoading;

    const statsLoading =
        totalQuery.isLoading ||
        approvalQuery.isLoading ||
        pendingQuery.isLoading ||
        activeQuery.isLoading ||
        rejectedQuery.isLoading ||
        expiredQuery.isLoading;

    function changeStatus(value: StatusFilter) {
        setStatus(value);
        setPage(1);
        setSearch("");
    }

    function refreshData() {
        void listQuery.refetch();
        void totalQuery.refetch();
        void approvalQuery.refetch();
        void pendingQuery.refetch();
        void activeQuery.refetch();
        void rejectedQuery.refetch();
        void expiredQuery.refetch();
    }

    return (
        <div className="min-h-screen bg-[#F7FAFE]">
            <div className="mx-auto max-w-[1500px] space-y-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

                {/* Header */}
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div>
                        <Link
                            href={`${ADMIN_BASE_PATH}/dashboard`}
                            className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-[#1491FF]"
                        >
                            <ArrowLeft size={14} />
                            Back to dashboard
                        </Link>

                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF5FF] text-[#1491FF]">
                                <Rocket size={24} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                    Boost Management
                                </h1>

                                <p className="mt-1 text-sm text-slate-500">
                                    Manage listing promotions, payments and approval requests.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={refreshData}
                        disabled={listQuery.isFetching}
                        className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-[#1491FF] hover:text-[#1491FF] disabled:opacity-50 sm:self-center"
                    >
                        <RefreshCw
                            size={15}
                            className={
                                listQuery.isFetching
                                    ? "animate-spin"
                                    : ""
                            }
                        />
                        Refresh
                    </button>
                </div>

                {/* Summary */}
                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-800">
                            Overview
                        </h2>

                        <span className="text-xs text-slate-400">
                            All boost requests
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                        <SummaryCard
                            label="Total requests"
                            value={totalQuery.data?.pagination.total}
                            description="All submitted boost requests"
                            icon={Rocket}
                            iconClass="bg-[#EAF5FF] text-[#1491FF]"
                            loading={statsLoading}
                        />

                        <SummaryCard
                            label="Awaiting approval"
                            value={approvalQuery.data?.pagination.total}
                            description="Paid requests requiring review"
                            icon={Clock3}
                            iconClass="bg-blue-50 text-blue-600"
                            loading={statsLoading}
                        />

                        <SummaryCard
                            label="Pending"
                            value={pendingQuery.data?.pagination.total}
                            description="Requests awaiting payment"
                            icon={AlertCircle}
                            iconClass="bg-amber-50 text-amber-600"
                            loading={statsLoading}
                        />

                        <SummaryCard
                            label="Active"
                            value={activeQuery.data?.pagination.total}
                            description="Currently active promotions"
                            icon={CheckCircle2}
                            iconClass="bg-emerald-50 text-emerald-600"
                            loading={statsLoading}
                        />

                        <SummaryCard
                            label="Rejected"
                            value={rejectedQuery.data?.pagination.total}
                            description="Requests declined by administrators"
                            icon={XCircle}
                            iconClass="bg-red-50 text-red-600"
                            loading={statsLoading}
                        />

                        <SummaryCard
                            label="Expired"
                            value={expiredQuery.data?.pagination.total}
                            description="Promotions that have ended"
                            icon={CalendarDays}
                            iconClass="bg-slate-100 text-slate-600"
                            loading={statsLoading}
                        />
                    </div>
                </section>

                {/* Requests */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-100 p-5 sm:p-6">
                        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Boost requests
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Review and manage listing promotion requests.
                                </p>
                            </div>

                            <div className="relative w-full lg:max-w-xs">
                                <Search
                                    size={17}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search current page..."
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1491FF] focus:ring-4 focus:ring-[#1491FF]/10"
                                />
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1">
                            <Filter
                                size={16}
                                className="mr-1 shrink-0 text-slate-400"
                            />

                            {STATUS_OPTIONS.map((option) => {
                                const selected =
                                    status === option.value;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() =>
                                            changeStatus(option.value)
                                        }
                                        className={`shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                                            selected
                                                ? "bg-[#1491FF] text-white shadow-sm shadow-blue-200"
                                                : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-[#0877D9]"
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Error */}
                    {listQuery.isError && (
                        <div className="m-5 flex flex-col items-center rounded-xl border border-red-100 bg-red-50 px-5 py-8 text-center">
                            <AlertCircle
                                size={28}
                                className="text-red-500"
                            />

                            <h3 className="mt-3 font-semibold text-red-800">
                                Unable to load boost requests
                            </h3>

                            <p className="mt-1 text-sm text-red-600">
                                Please check your connection and try again.
                            </p>

                            <button
                                type="button"
                                onClick={() => listQuery.refetch()}
                                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Table */}
                    {!listQuery.isError && (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] text-left">
                                    <thead className="bg-slate-50">
                                        <tr className="border-y border-slate-100">
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                Listing / Seller
                                            </th>

                                            <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                Boost plan
                                            </th>

                                            <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                Amount
                                            </th>

                                            <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                Submitted
                                            </th>

                                            <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                Status
                                            </th>

                                            <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {isInitialLoading ? (
                                            <tr>
                                                <td colSpan={6}>
                                                    <TableSkeleton />
                                                </td>
                                            </tr>
                                        ) : filteredItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={6}>
                                                    <div className="flex flex-col items-center px-5 py-16 text-center">
                                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0F7FF] text-[#1491FF]">
                                                            <Rocket size={25} />
                                                        </div>

                                                        <h3 className="mt-4 text-base font-semibold text-slate-800">
                                                            No boost requests found
                                                        </h3>

                                                        <p className="mt-1 max-w-sm text-sm text-slate-500">
                                                            {search
                                                                ? "Try another search term."
                                                                : "There are currently no requests under this status."}
                                                        </p>

                                                        {search && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setSearch("")}
                                                                className="mt-3 text-sm font-semibold text-[#1491FF] hover:underline"
                                                            >
                                                                Clear search
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredItems.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="transition hover:bg-[#F8FBFF]"
                                                >
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#1491FF]">
                                                                <Rocket size={19} />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="max-w-[260px] truncate text-sm font-semibold text-slate-900">
                                                                    {item.listingTitle}
                                                                </p>

                                                                <p className="mt-1 max-w-[260px] truncate text-xs text-slate-500">
                                                                    {item.sellerEmail}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-5">
                                                        <p className="text-sm font-semibold text-slate-800">
                                                            {item.durationDays} days
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            Listing promotion
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-5">
                                                        <p className="text-sm font-bold text-slate-900">
                                                            {formatCurrency(
                                                                item.price,
                                                                item.currency,
                                                            )}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {item.paymentVerifiedAt
                                                                ? "Payment verified"
                                                                : "Not verified"}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-5">
                                                        <p className="text-sm text-slate-700">
                                                            {formatDate(item.createdAt)}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-5">
                                                        <StatusBadge
                                                            status={item.status}
                                                        />
                                                    </td>

                                                    <td className="px-6 py-5 text-right">
                                                        <Link
                                                            href={`${ADMIN_BASE_PATH}/dashboard/boosts/${item.id}`}
                                                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#D8EBFF] bg-[#F0F7FF] px-3 text-xs font-semibold text-[#0877D9] transition hover:border-[#1491FF] hover:bg-[#E5F2FF]"
                                                        >
                                                            Review
                                                            <ExternalLink size={13} />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {!isInitialLoading && pagination && (
                                <div className="flex flex-col justify-between gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                                    <p className="text-xs text-slate-500">
                                        Showing{" "}
                                        <span className="font-semibold text-slate-800">
                                            {pagination.total === 0
                                                ? 0
                                                : (pagination.page - 1) *
                                                    pagination.limit +
                                                  1}
                                        </span>{" "}
                                        to{" "}
                                        <span className="font-semibold text-slate-800">
                                            {Math.min(
                                                pagination.page * pagination.limit,
                                                pagination.total,
                                            )}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-semibold text-slate-800">
                                            {pagination.total}
                                        </span>{" "}
                                        requests
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={
                                                page <= 1 ||
                                                listQuery.isFetching
                                            }
                                            onClick={() =>
                                                setPage((current) =>
                                                    Math.max(1, current - 1),
                                                )
                                            }
                                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-[#1491FF] hover:text-[#1491FF] disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <ArrowLeft size={14} />
                                            Previous
                                        </button>

                                        <span className="min-w-20 text-center text-xs font-semibold text-slate-700">
                                            Page {pagination.page} of{" "}
                                            {Math.max(
                                                pagination.totalPages,
                                                1,
                                            )}
                                        </span>

                                        <button
                                            type="button"
                                            disabled={
                                                page >= pagination.totalPages ||
                                                listQuery.isFetching
                                            }
                                            onClick={() =>
                                                setPage((current) => current + 1)
                                            }
                                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-[#1491FF] hover:text-[#1491FF] disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Next
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </section>

                {/* Review reminder */}
                <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-[#F0F7FF] p-4">
                    <ShieldCheck
                        size={19}
                        className="mt-0.5 shrink-0 text-[#1491FF]"
                    />

                    <div>
                        <p className="text-sm font-semibold text-[#075DAA]">
                            Approval policy
                        </p>

                        <p className="mt-1 text-xs leading-5 text-blue-800/80">
                            Only approve boost requests after confirming payment
                            verification and listing approval. The backend
                            performs the final eligibility checks and activates
                            the promotion.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}