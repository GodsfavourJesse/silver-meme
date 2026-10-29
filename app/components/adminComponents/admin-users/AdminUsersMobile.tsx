"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    AlertCircle,
    Check,
    ChevronLeft,
    ChevronRight,
    Filter,
    RefreshCw,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    Store,
    X,
} from "lucide-react";

import type {
    AdminUser,
    AdminUserSort,
    AdminUserStatusFilter,
    AdminUserTypeFilter,
    AdminUsersQuery,
} from "@/app/types/admin/admin-users.types";

import {
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

export default function AdminUsersMobile({
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
    const [filterModalOpen, setFilterModalOpen] = useState(false);

    // Temporary filter state:
    // changes are applied only when the user taps "Apply filters".
    const [draftType, setDraftType] = useState(
        filters.type ?? "ALL",
    );

    const [draftStatus, setDraftStatus] = useState(
        filters.status ?? "ALL",
    );

    const [draftSort, setDraftSort] = useState(
        filters.sort ?? "newest",
    );

    function openFilters() {
        setDraftType(filters.type ?? "ALL");
        setDraftStatus(filters.status ?? "ALL");
        setDraftSort(filters.sort ?? "newest");
        setFilterModalOpen(true);
    }

    function applyFilters() {
        updateFilter("type", draftType as AdminUserTypeFilter);
        updateFilter("status", draftStatus as AdminUserStatusFilter);
        updateFilter("sort", draftSort as AdminUserSort);

        setFilterModalOpen(false);
    }

    function resetDraftFilters() {
        setDraftType("ALL");
        setDraftStatus("ALL");
        setDraftSort("newest");
    }

    useEffect(() => {
        if (!filterModalOpen) {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setFilterModalOpen(false);
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [filterModalOpen]);

    const activeFilterCount = [
        filters.type !== "ALL",
        filters.status !== "ALL",
        filters.sort !== "newest",
    ].filter(Boolean).length;

    return (
        <main className="min-h-screen bg-gray-50/70 px-3 py-4 sm:px-4 md:hidden">
            <div className="mx-auto max-w-xl space-y-5">
                {/* MOBILE HEADER */}

                <section className="flex items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Administration
                            <span>/</span>
                            <span className="font-medium text-gray-700">
                                Users
                            </span>
                        </div>

                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
                            Users
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage and review user accounts.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={refreshData}
                        disabled={isFetching || isStatsFetching}
                        aria-label="Refresh users"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-purple-50 hover:text-purple-700 disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                isFetching || isStatsFetching
                                    ? "animate-spin"
                                    : ""
                            }`}
                        />
                    </button>
                </section>

                {/* COMPACT STATISTICS */}

                <section className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-900">
                            Account overview
                        </h2>

                        {isStatsFetching && (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-gray-400" />
                        )}
                    </div>

                    <UserStatistics
                        stats={stats}
                        loading={isInitialStatsLoading}
                        compact
                    />

                    {isStatsError && (
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-3">
                            <p className="text-xs text-red-700">
                                Unable to load account statistics.
                            </p>

                            <button
                                type="button"
                                onClick={retryStats}
                                className="shrink-0 text-xs font-semibold text-red-800 underline"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                </section>

                {/* SEARCH + FILTER BUTTON */}

                <section className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                    <form
                        onSubmit={submitSearch}
                        className="flex gap-2"
                    >
                        <div className="relative min-w-0 flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                            <input
                                type="search"
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.target.value)
                                }
                                placeholder="Search users..."
                                aria-label="Search users"
                                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                            />
                        </div>

                        <button
                            type="submit"
                            aria-label="Submit search"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#7008E7] text-white transition hover:bg-purple-700"
                        >
                            <Search className="h-4 w-4" />
                        </button>
                    </form>

                    <div className="mt-3 flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={openFilters}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                        >
                            <SlidersHorizontal className="h-4 w-4" />

                            Filters

                            {activeFilterCount > 0 && (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-purple-100 px-1.5 text-xs font-bold text-purple-700">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        <p className="text-xs text-gray-500">
                            {pagination
                                ? `${pagination.total.toLocaleString("en-NG")} users`
                                : "User directory"}
                        </p>
                    </div>

                    {hasFilters && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            {filters.type !== "ALL" && (
                                <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                                    {filters.type === "USER"
                                        ? "Regular users"
                                        : filters.type === "ADMIN"
                                          ? "Administrators"
                                          : "Dealers"}
                                </span>
                            )}

                            {filters.status !== "ALL" && (
                                <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                                    {filters.status}
                                </span>
                            )}

                            {filters.sort === "oldest" && (
                                <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                                    Oldest first
                                </span>
                            )}

                            <button
                                type="button"
                                onClick={clearFilters}
                                className="ml-auto text-xs font-semibold text-red-600"
                            >
                                Clear
                            </button>
                        </div>
                    )}
                </section>

                {/* FILTER MODAL */}

                {filterModalOpen && (
                    <div
                        className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                setFilterModalOpen(false);
                            }
                        }}
                    >
                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="mobile-user-filter-title"
                            className="max-h-[85dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-3xl"
                        >
                            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-gray-200 sm:hidden" />

                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                                            <Filter className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <h2
                                                id="mobile-user-filter-title"
                                                className="text-lg font-bold text-gray-950"
                                            >
                                                Filter users
                                            </h2>

                                            <p className="mt-0.5 text-xs text-gray-500">
                                                Narrow down the user list.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setFilterModalOpen(false)}
                                    aria-label="Close filters"
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mt-6 space-y-5">
                                <UserFilterFields
                                    type={draftType}
                                    status={draftStatus}
                                    sort={draftSort}
                                    onTypeChange={setDraftType}
                                    onStatusChange={setDraftStatus}
                                    onSortChange={setDraftSort}
                                    prefix="mobile-filter"
                                />
                            </div>

                            <div className="mt-7 flex gap-3 border-t border-gray-100 pt-4">
                                <button
                                    type="button"
                                    onClick={resetDraftFilters}
                                    className="min-h-12 flex-1 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                >
                                    Reset
                                </button>

                                <button
                                    type="button"
                                    onClick={applyFilters}
                                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#7008E7] px-4 text-sm font-semibold text-white transition hover:bg-purple-700"
                                >
                                    <Check className="h-4 w-4" />
                                    Apply filters
                                </button>
                            </div>
                        </section>
                    </div>
                )}

                {/* USERS */}

                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-gray-950">
                            User directory
                        </h2>

                        {isFetching && (
                            <RefreshCw className="h-4 w-4 animate-spin text-purple-600" />
                        )}
                    </div>

                    {isError && (
                        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                                <div>
                                    <p className="text-sm font-semibold text-red-800">
                                        Unable to load users
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-red-700">
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
                        </div>
                    )}

                    {isInitialLoading && (
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-11 w-11 rounded-full bg-gray-100" />

                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 w-32 rounded bg-gray-100" />
                                            <div className="h-3 w-44 max-w-full rounded bg-gray-100" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isInitialLoading && !isError && !hasData && (
                        <div className="rounded-2xl border border-gray-100 bg-white">
                            <EmptyState
                                hasFilters={hasFilters}
                                onReset={clearFilters}
                            />
                        </div>
                    )}

                    {!isInitialLoading && hasData && (
                        <div className="space-y-3">
                            {users.map((user) => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => openUserDetails(user.id)}
                                    className="block w-full rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition active:scale-[0.99] hover:border-purple-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                                >
                                    <div className="flex items-start gap-3">
                                        <UserAvatar user={user} size="lg" />

                                        <div className="min-w-0 flex-1">
                                            <h3 className="break-words text-sm font-semibold text-gray-950">
                                                {getFullName(user)}
                                            </h3>

                                            <p className="mt-1 break-all text-xs text-gray-500">
                                                {user.email}
                                            </p>

                                            {user.phone && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {user.phone}
                                                </p>
                                            )}

                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <StatusBadge status={user.status} />

                                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                                    {user.accountType === "DEALER" ? (
                                                        <Store className="h-3 w-3" />
                                                    ) : null}

                                                    {user.accountType === "DEALER"
                                                        ? "Dealer"
                                                        : "User"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 border-t border-gray-100 pt-3">
                                        <RoleBadges roles={user.roles} />

                                        <div className="mt-3 flex items-center justify-between gap-2">
                                            <span className="text-xs text-gray-500">
                                                Joined {formatDate(user.createdAt)}
                                            </span>

                                            <span
                                                className={
                                                    user.emailVerified
                                                        ? "text-xs font-medium text-emerald-700"
                                                        : "text-xs font-medium text-amber-700"
                                                }
                                            >
                                                {user.emailVerified
                                                    ? "Email verified"
                                                    : "Unverified"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-end gap-1 text-xs font-semibold text-purple-700">
                                        View details
                                        <ChevronRight className="h-4 w-4" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* PAGINATION */}

                {!isInitialLoading && pagination && (
                    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <p className="text-center text-xs text-gray-500">
                            {pagination.total === 0
                                ? "No users to display"
                                : `Showing ${
                                      (pagination.page - 1) *
                                          pagination.limit +
                                      1
                                  }–${Math.min(
                                      pagination.page * pagination.limit,
                                      pagination.total,
                                  )} of ${pagination.total.toLocaleString("en-NG")} users`}
                        </p>

                        <div className="mt-3 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    changePage(pagination.page - 1)
                                }
                                disabled={
                                    pagination.page <= 1 || isFetching
                                }
                                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-gray-200 px-3 text-sm font-medium text-gray-700 disabled:opacity-40"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </button>

                            <span className="text-xs text-gray-500">
                                Page {pagination.page} of{" "}
                                {Math.max(pagination.totalPages, 1)}
                            </span>

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
                                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-gray-200 px-3 text-sm font-medium text-gray-700 disabled:opacity-40"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </section>
                )}

                {isFetching && !isInitialLoading && (
                    <div className="flex items-center justify-center gap-2 py-2 text-xs text-gray-500">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Updating users...
                    </div>
                )}
            </div>
        </main>
    );
}