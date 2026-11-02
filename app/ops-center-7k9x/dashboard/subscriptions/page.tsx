"use client";

import { useState } from "react";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    RefreshCw,
    Search,
    ShieldCheck,
    Users,
} from "lucide-react";

import { toast } from "sonner";

import type {
    AdminSubscription,
    AdminSubscriptionStatus,
} from "@/app/types/admin/admin-subscription.types";
import { useAdminSubscriptions } from "@/app/hooks/admin/subscriptions/useAdminSubscriptions";
import AdminSubscriptionDetailsDrawer from "@/app/components/adminComponents/admin-subscriptions/AdminSubscriptionDetailsDrawer";
import AdminSubscriptionsTable from "@/app/components/adminComponents/admin-subscriptions/AdminSubscriptionsTable";

const PAGE_SIZE = 10;

const FILTERS: {
    label: string;
    value: "ALL" | AdminSubscriptionStatus;
}[] = [
    { label: "All subscriptions", value: "ALL" },
    { label: "Active", value: "ACTIVE" },
    { label: "Pending", value: "PENDING" },
    { label: "Cancelled", value: "CANCELLED" },
    { label: "Expired", value: "EXPIRED" },
];

function SummaryCard({
    title,
    value,
    description,
    icon: Icon,
    iconClass,
}: {
    title: string;
    value: number;
    description: string;
    icon: typeof Users;
    iconClass: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.025)]">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-medium text-slate-400">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                        {value.toLocaleString()}
                    </p>
                </div>

                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
                >
                    <Icon size={20} />
                </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
                {description}
            </p>
        </div>
    );
}

function TableLoading() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
                <div
                    key={index}
                    className="h-[76px] animate-pulse rounded-2xl border border-slate-100 bg-white"
                />
            ))}
        </div>
    );
}

export default function AdminSubscriptionsPage() {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<
        "ALL" | AdminSubscriptionStatus
    >("ALL");
    const [search, setSearch] = useState("");
    const [selectedSubscription, setSelectedSubscription] =
        useState<AdminSubscription | null>(null);

    const {
        data,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useAdminSubscriptions({
        page,
        limit: PAGE_SIZE,
        ...(status !== "ALL" ? { status } : {}),
    });

    const subscriptions = data?.items ?? [];
    const pagination = data?.pagination;

    const filteredSubscriptions = subscriptions.filter((subscription) => {
        const customerName = [
            subscription.user.firstName,
            subscription.user.lastName,
        ]
            .filter(Boolean)
            .join(" ");

        const searchValue = search.trim().toLowerCase();

        if (!searchValue) return true;

        return (
            customerName.toLowerCase().includes(searchValue) ||
            (subscription.user.email || "").toLowerCase().includes(searchValue) ||
            subscription.plan.name.toLowerCase().includes(searchValue) ||
            subscription.id.toLowerCase().includes(searchValue)
        );
    });

    const total = pagination?.total ?? 0;

    const handleStatusChange = (value: "ALL" | AdminSubscriptionStatus) => {
        setStatus(value);
        setPage(1);
        setSelectedSubscription(null);
    };

    const handleRefresh = async () => {
        try {
            await refetch();
            toast.success("Subscription records refreshed.");
        } catch {
            toast.error("Unable to refresh subscription records.");
        }
    };

    return (
        <div className="space-y-7 py-6 px-6 md:px-28">
            {/* Page heading */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#1491FF]" />

                        <span className="text-xs font-bold uppercase tracking-wider text-[#1491FF]">
                            Subscription management
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Subscriptions
                    </h1>

                    <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                        Monitor customer subscriptions, plan purchases,
                        account access, and subscription periods.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            window.location.href =
                                "/ops-center-7k9x/dashboard/subscriptions/plans";
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#1491FF]/30 hover:bg-[#F4F9FF] hover:text-[#1491FF]"
                    >
                        <CreditCard size={16} />
                        Manage plans
                    </button>

                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={isFetching}
                        aria-label="Refresh subscriptions"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-[#EAF5FF] hover:text-[#1491FF] disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={isFetching ? "animate-spin" : ""}
                        />
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Total subscriptions"
                    value={total}
                    description="Records matching the current filters"
                    icon={CreditCard}
                    iconClass="bg-[#EAF5FF] text-[#1491FF]"
                />

                <SummaryCard
                    title="Active subscriptions"
                    value={subscriptions.filter((item) => item.status === "ACTIVE").length}
                    description="Active records on this page"
                    icon={ShieldCheck}
                    iconClass="bg-emerald-50 text-emerald-600"
                />

                <SummaryCard
                    title="Pending subscriptions"
                    value={subscriptions.filter((item) => item.status === "PENDING").length}
                    description="Pending records on this page"
                    icon={CalendarDays}
                    iconClass="bg-amber-50 text-amber-600"
                />

                <SummaryCard
                    title="Customers on this page"
                    value={new Set(subscriptions.map((item) => item.userId)).size}
                    description="Unique subscribed customers on this page"
                    icon={Users}
                    iconClass="bg-violet-50 text-violet-600"
                />
            </div>

            {/* Records */}
            <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
                <div className="border-b border-slate-100 p-5 sm:p-6">
                    <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                Subscription records
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                View and inspect customer subscription details.
                            </p>
                        </div>

                        <div className="relative w-full xl:max-w-xs">
                            <Search
                                size={17}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search customer, plan or ID..."
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#1491FF] focus:bg-white focus:ring-4 focus:ring-[#1491FF]/10"
                            />
                        </div>
                    </div>

                    {/* Status filters */}
                    <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                        {FILTERS.map((filter) => {
                            const active = status === filter.value;

                            return (
                                <button
                                    key={filter.value}
                                    type="button"
                                    onClick={() => handleStatusChange(filter.value)}
                                    className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                                        active
                                            ? "bg-[#1491FF] text-white shadow-sm shadow-[#1491FF]/20"
                                            : "bg-slate-100 text-slate-500 hover:bg-[#EAF5FF] hover:text-[#1491FF]"
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 sm:p-5">
                    {isLoading ? (
                        <TableLoading />
                    ) : isError ? (
                        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-10 text-center">
                            <p className="text-sm font-semibold text-red-700">
                                Unable to load subscription records.
                            </p>

                            <p className="mt-1 text-xs text-red-500">
                                Please check your connection and try again.
                            </p>

                            <button
                                type="button"
                                onClick={() => refetch()}
                                className="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-700"
                            >
                                Try again
                            </button>
                        </div>
                    ) : (
                        <>
                            <AdminSubscriptionsTable
                                subscriptions={filteredSubscriptions}
                                onView={setSelectedSubscription}
                            />

                            {/* Pagination */}
                            {pagination && pagination.totalPages > 1 && (
                                <div className="mt-5 flex flex-col justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
                                    <p className="text-xs text-slate-400">
                                        Showing page{" "}
                                        <span className="font-bold text-slate-700">
                                            {pagination.page}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-bold text-slate-700">
                                            {pagination.totalPages}
                                        </span>{" "}
                                        · {pagination.total.toLocaleString()} records
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={page <= 1 || isFetching}
                                            onClick={() => setPage((current) => current - 1)}
                                            className="flex h-9 items-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <ChevronLeft size={15} />
                                            Previous
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                page >= pagination.totalPages ||
                                                isFetching
                                            }
                                            onClick={() => setPage((current) => current + 1)}
                                            className="flex h-9 items-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Next
                                            <ChevronRight size={15} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Details drawer */}
            <AdminSubscriptionDetailsDrawer
                subscription={selectedSubscription}
                onClose={() => setSelectedSubscription(null)}
            />
        </div>
    );
}