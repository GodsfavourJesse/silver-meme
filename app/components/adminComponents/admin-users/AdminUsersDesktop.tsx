"use client";

import {
    AlertCircle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    RefreshCw,
    Search,
    ShieldCheck,
} from "lucide-react";

import type {
    AdminUser,
    AdminUserSort,
    AdminUserStatusFilter,
    AdminUserTypeFilter,
    AdminUsersQuery,
} from "@/app/types/admin/admin-users.types";

import {
    AccountTypeLabel,
    EmptyState,
    formatDate,
    getFullName,
    RoleBadges,
    StatusBadge,
    UserAvatar,
    UserFilterFields,
    UserStatistics,
    type AdminUserStats,
} from "./AdminUsersShared";

interface Props {
    users: AdminUser[];
    filters: AdminUsersQuery;
    searchInput: string;
    setSearchInput: (value: string) => void;
    updateFilter: <K extends keyof AdminUsersQuery>(
        key: K,
        value: AdminUsersQuery[K],
    ) => void;
    submitSearch: (event: React.FormEvent<HTMLFormElement>) => void;
    clearFilters: () => void;
    openUserDetails: (userId: string) => void;
    refreshData: () => void;
    changePage: (page: number) => void;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    stats?: AdminUserStats;
    isInitialLoading: boolean;
    isInitialStatsLoading: boolean;
    isFetching: boolean;
    isStatsFetching: boolean;
    isError: boolean;
    isStatsError: boolean;
    retryUsers: () => void;
    retryStats: () => void;
    hasFilters: boolean;
    hasData: boolean;
}

const inputClassName =
    "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100";

export default function AdminUsersDesktop({
    users,
    filters,
    searchInput,
    setSearchInput,
    updateFilter,
    submitSearch,
    clearFilters,
    openUserDetails,
    refreshData,
    changePage,
    pagination,
    stats,
    isInitialLoading,
    isInitialStatsLoading,
    isFetching,
    isStatsFetching,
    isError,
    isStatsError,
    retryUsers,
    retryStats,
    hasFilters,
    hasData,
}: Props) {
    return (
        <main className="hidden min-h-screen bg-gray-50/70 px-6 py-7 md:block lg:px-8">
            <div className="mx-auto max-w-[1600px] space-y-7">
                {/* HEADER */}

                <section className="flex items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Administration</span>
                            <span>/</span>
                            <span className="font-medium text-gray-700">
                                Users
                            </span>
                        </div>

                        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
                            User Management
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            Manage accounts, monitor account statuses, and
                            review administrators and dealers.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={refreshData}
                        disabled={isFetching || isStatsFetching}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-60"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                isFetching || isStatsFetching
                                    ? "animate-spin"
                                    : ""
                            }`}
                        />
                        Refresh
                    </button>
                </section>

                {/* STATISTICS */}

                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-900">
                            Account overview
                        </h2>

                        {isStatsFetching && (
                            <span className="text-xs text-gray-400">
                                Updating statistics...
                            </span>
                        )}
                    </div>

                    {isStatsError && (
                        <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                            <div>
                                <p className="text-sm font-semibold text-red-800">
                                    Could not load account statistics
                                </p>

                                <button
                                    type="button"
                                    onClick={retryStats}
                                    className="mt-2 text-sm font-semibold text-red-800 underline"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    )}

                    <UserStatistics
                        stats={stats}
                        loading={isInitialStatsLoading}
                    />
                </section>

                {/* USERS PANEL */}

                <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-100 p-5">
                        <div className="flex items-center justify-between gap-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-950">
                                    All users
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Search, filter, and review user accounts.
                                </p>
                            </div>

                            <form
                                onSubmit={submitSearch}
                                className="flex w-full max-w-md gap-2"
                            >
                                <div className="relative min-w-0 flex-1">
                                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                                    <input
                                        type="search"
                                        value={searchInput}
                                        onChange={(event) =>
                                            setSearchInput(event.target.value)
                                        }
                                        placeholder="Search name, email, phone..."
                                        aria-label="Search users"
                                        className={`${inputClassName} pl-10`}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="rounded-xl bg-[#7008E7] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
                                >
                                    Search
                                </button>
                            </form>
                        </div>

                        <div className="mt-5">
                            <UserFilterFields
                                type={filters.type ?? "ALL"}
                                status={filters.status ?? "ALL"}
                                sort={filters.sort ?? "newest"}
                                onTypeChange={(value) =>
                                    updateFilter(
                                        "type",
                                        value as AdminUserTypeFilter,
                                    )
                                }
                                onStatusChange={(value) =>
                                    updateFilter(
                                        "status",
                                        value as AdminUserStatusFilter,
                                    )
                                }
                                onSortChange={(value) =>
                                    updateFilter(
                                        "sort",
                                        value as AdminUserSort,
                                    )
                                }
                                prefix="desktop-users"
                            />
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={clearFilters}
                                disabled={!hasFilters}
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Clear filters
                            </button>
                        </div>
                    </div>

                    {/* REQUEST ERROR */}

                    {isError && (
                        <div className="m-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                            <div>
                                <p className="text-sm font-semibold text-red-800">
                                    Unable to load users
                                </p>

                                <p className="mt-1 text-sm text-red-700">
                                    Check your connection and administrator
                                    permissions, then try again.
                                </p>

                                <button
                                    type="button"
                                    onClick={retryUsers}
                                    className="mt-3 text-sm font-semibold text-red-800 underline"
                                >
                                    Retry request
                                </button>
                            </div>
                        </div>
                    )}

                    {/* LOADING */}

                    {isInitialLoading && (
                        <div className="space-y-4 p-5">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="flex animate-pulse items-center gap-4"
                                >
                                    <div className="h-11 w-11 rounded-full bg-gray-100" />

                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-40 rounded bg-gray-100" />
                                        <div className="h-3 w-56 rounded bg-gray-100" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* EMPTY */}

                    {!isInitialLoading && !isError && !hasData && (
                        <EmptyState
                            hasFilters={hasFilters}
                            onReset={clearFilters}
                        />
                    )}

                    {/* TABLE */}

                    {!isInitialLoading && hasData && (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[950px] border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/80">
                                        {[
                                            "User",
                                            "Account type",
                                            "Roles",
                                            "Status",
                                            "Email verification",
                                            "Registered",
                                        ].map((heading) => (
                                            <th
                                                key={heading}
                                                className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500"
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="transition hover:bg-purple-50/30"
                                        >
                                            <td className="px-5 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openUserDetails(user.id)
                                                    }
                                                    className="group flex w-full items-center gap-3 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                                                >
                                                    <UserAvatar user={user} />

                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-purple-700">
                                                            {getFullName(user)}
                                                        </p>

                                                        <p className="mt-1 truncate text-sm text-gray-500">
                                                            {user.email}
                                                        </p>

                                                        {user.phone && (
                                                            <p className="mt-1 text-xs text-gray-400">
                                                                {user.phone}
                                                            </p>
                                                        )}
                                                    </div>
                                                </button>
                                            </td>

                                            <td className="px-5 py-4">
                                                <AccountTypeLabel
                                                    accountType={user.accountType}
                                                />
                                            </td>

                                            <td className="max-w-[240px] px-5 py-4">
                                                <RoleBadges roles={user.roles} />
                                            </td>

                                            <td className="px-5 py-4">
                                                <StatusBadge status={user.status} />
                                            </td>

                                            <td className="px-5 py-4">
                                                {user.emailVerified ? (
                                                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700">
                                                        <Clock className="h-4 w-4" />
                                                        Unverified
                                                    </span>
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                                                {formatDate(user.createdAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* PAGINATION */}

                    {!isInitialLoading && pagination && (
                        <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-5 py-4">
                            <p className="text-sm text-gray-500">
                                {pagination.total === 0 ? (
                                    "No users to display"
                                ) : (
                                    <>
                                        Showing{" "}
                                        <span className="font-semibold text-gray-900">
                                            {(pagination.page - 1) *
                                                pagination.limit +
                                                1}
                                        </span>
                                        {" "}to{" "}
                                        <span className="font-semibold text-gray-900">
                                            {Math.min(
                                                pagination.page *
                                                    pagination.limit,
                                                pagination.total,
                                            )}
                                        </span>
                                        {" "}of{" "}
                                        <span className="font-semibold text-gray-900">
                                            {pagination.total.toLocaleString("en-NG")}
                                        </span>
                                        {" "}users
                                    </>
                                )}
                            </p>

                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500">
                                    Page {pagination.page} of{" "}
                                    {Math.max(pagination.totalPages, 1)}
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        changePage(pagination.page - 1)
                                    }
                                    disabled={
                                        pagination.page <= 1 || isFetching
                                    }
                                    aria-label="Previous page"
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        changePage(pagination.page + 1)
                                    }
                                    disabled={
                                        pagination.page >=
                                            pagination.totalPages ||
                                        isFetching
                                    }
                                    aria-label="Next page"
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {isFetching && (
                        <div className="flex items-center justify-center gap-2 border-t border-gray-100 bg-gray-50/70 px-4 py-2.5 text-xs text-gray-500">
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            Updating users...
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}