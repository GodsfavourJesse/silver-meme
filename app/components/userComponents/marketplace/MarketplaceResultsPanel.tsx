"use client";

import {
    ArrowLeft,
    ArrowRight,
    CarFront,
    ChevronDown,
    RotateCcw,
    X,
    SlidersHorizontal,
    Search,
} from "lucide-react";

import {
    SORT_OPTIONS,
    getActiveMarketplaceFilters,
    type MarketplaceFilterKey,
    type MarketplaceFilterState,
    type MarketplaceVehicleFilterLabels,
    type SortOption,
} from "@/app/lib/user/marketplace/marketplace-search";

import type {
    MarketplacePagination,
    MarketplaceSearchResult,
} from "@/app/types/user/marketplace.types";

import {
    MarketplaceListingCard,
    MarketplaceListingSkeleton,
} from "./MarketplaceListingCard";

interface MarketplaceResultsPanelProps {
    results: MarketplaceSearchResult[];
    pagination: MarketplacePagination | null;
    page: number;
    sort: SortOption;
    filters: MarketplaceFilterState;
    vehicleLabels?: MarketplaceVehicleFilterLabels;
    loading: boolean;
    error: string;
    onSortChange: (sort: SortOption) => void;
    onPageChange: (page: number) => void;
    onRemoveFilter: (key: MarketplaceFilterKey) => void;
    onClearFilters: () => void;
    onRetry: () => void;
}

const formatCount = (value: number) =>
    new Intl.NumberFormat("en-NG").format(value);

export function MarketplaceResultsPanel({
    results,
    pagination,
    page,
    sort,
    filters,
    vehicleLabels,
    loading,
    error,
    onSortChange,
    onPageChange,
    onRemoveFilter,
    onClearFilters,
    onRetry,
}: MarketplaceResultsPanelProps) {
    const totalResults = pagination?.total ?? 0;
    const totalPages = Math.max(pagination?.totalPages ?? 1, 1);
    const hasPreviousPage = pagination?.hasPreviousPage ?? page > 1;
    const hasNextPage = pagination?.hasNextPage ?? false;

    const activeFilters = getActiveMarketplaceFilters(
        filters,
        vehicleLabels,
    );

    const hasResults = results.length > 0;
    const showEmptyState = !loading && !error && !hasResults;

    return (
        <section
            aria-label="Vehicle search results"
            aria-busy={loading}
            className="min-w-0 space-y-4 sm:space-y-5"
        >
            {/* Results toolbar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-semibold tracking-tight text-slate-950 sm:text-lg">
                                {loading
                                    ? "Finding vehicles"
                                    : `${formatCount(totalResults)} ${
                                          totalResults === 1
                                              ? "vehicle"
                                              : "vehicles"
                                      }`}
                            </h2>

                            {!loading && !error && (
                                <span className="inline-flex items-center rounded-full bg-[#1491FF]/10 px-2.5 py-1 text-[10px] font-semibold text-[#0876D1] sm:text-xs">
                                    {activeFilters.length > 0
                                        ? "Filtered results"
                                        : "Marketplace"}
                                </span>
                            )}
                        </div>

                        <p className="mt-1.5 text-xs leading-5 text-slate-500 sm:text-sm">
                            {loading
                                ? "Please wait while we update your results."
                                : error
                                  ? "Your search results couldn't be updated."
                                  : activeFilters.length > 0
                                    ? "Vehicles matching your selected preferences."
                                    : "Explore cars available from sellers across Nigeria."}
                        </p>
                    </div>

                    <label className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start">
                        <span className="shrink-0 text-xs font-medium text-slate-500">
                            Sort by
                        </span>

                        <span className="relative min-w-0 flex-1 sm:flex-none">
                            <select
                                value={sort}
                                onChange={(event) =>
                                    onSortChange(
                                        event.target.value as SortOption,
                                    )
                                }
                                aria-label="Sort vehicle listings"
                                className="min-h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-10 text-sm font-medium text-slate-800 outline-none transition hover:border-slate-300 focus:border-[#1491FF] focus:ring-4 focus:ring-[#1491FF]/10 sm:min-w-44"
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <ChevronDown
                                size={16}
                                aria-hidden="true"
                                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                        </span>
                    </label>
                </div>

                {!loading && !error && totalResults > 0 && (
                    <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3.5">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-[#1491FF] transition-all duration-300"
                                style={{
                                    width: `${Math.min(
                                        100,
                                        (page / totalPages) * 100,
                                    )}%`,
                                }}
                            />
                        </div>

                        <span className="shrink-0 text-[11px] font-medium text-slate-400">
                            Page {page} of {totalPages}
                        </span>
                    </div>
                )}
            </div>

            {/* Active filters */}
            {activeFilters.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-2.5">
                            <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-[#1491FF]/10 text-[#1491FF]">
                                <SlidersHorizontal size={16} />
                            </div>

                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-slate-900">
                                    Your filters
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Remove a filter to broaden your search.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClearFilters}
                            className="shrink-0 rounded-lg px-2 py-2 text-xs font-semibold text-[#0876D1] transition hover:bg-[#1491FF]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1491FF]/30"
                        >
                            Clear all
                        </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {activeFilters.map((filter) => (
                            <button
                                key={filter.key}
                                type="button"
                                onClick={() => onRemoveFilter(filter.key)}
                                aria-label={`Remove filter: ${filter.label}`}
                                className="group inline-flex min-h-9 max-w-full items-center gap-2 rounded-lg border border-[#1491FF]/20 bg-[#1491FF]/5 py-1.5 pl-3 pr-2 text-left text-xs font-medium text-slate-700 transition hover:border-[#1491FF]/50 hover:bg-[#1491FF]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1491FF]/30"
                            >
                                <span className="break-words">
                                    {filter.label}
                                </span>

                                <span className="grid size-5 shrink-0 place-items-center rounded-full text-slate-400 transition group-hover:bg-[#1491FF]/15 group-hover:text-[#0876D1]">
                                    <X size={13} />
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Request error */}
            {error && (
                <div
                    role="alert"
                    className="rounded-2xl border border-red-200 bg-white p-4 shadow-sm sm:p-5"
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600">
                                <RotateCcw size={18} />
                            </div>

                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-slate-900">
                                    We couldn't load the vehicles
                                </h3>

                                <p className="mt-1.5 break-words text-sm leading-6 text-slate-600">
                                    {error}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onRetry}
                            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0876D1] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1491FF]/20"
                        >
                            <RotateCcw size={15} />
                            Try again
                        </button>
                    </div>
                </div>
            )}

            {/* Loading state */}
            {loading && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 2xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <MarketplaceListingSkeleton key={index} />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {showEmptyState && (
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm sm:px-8 sm:py-16">
                    <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#1491FF]/10 text-[#1491FF]">
                        <CarFront size={31} strokeWidth={1.6} />
                    </div>

                    <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">
                        No cars match your search
                    </h3>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                        Try changing the price range, choosing a different
                        model, or removing some filters to see more listings.
                    </p>

                    <button
                        type="button"
                        onClick={onClearFilters}
                        className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-[#1491FF]/15 transition hover:bg-[#0876D1] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1491FF]/20"
                    >
                        <RotateCcw size={15} />
                        Clear filters
                    </button>
                </div>
            )}

            {/* Listing grid and pagination */}
            {!loading && !error && hasResults && (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 2xl:grid-cols-3">
                        {results.map((result) => (
                            <MarketplaceListingCard
                                key={result.listing.id}
                                result={result}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    <nav
                        aria-label="Vehicle listing pages"
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:px-5"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-center sm:text-left">
                                <p className="text-sm font-medium text-slate-800">
                                    Page {page}{" "}
                                    <span className="font-normal text-slate-400">
                                        of
                                    </span>{" "}
                                    {totalPages}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    {formatCount(totalResults)}{" "}
                                    {totalResults === 1
                                        ? "vehicle available"
                                        : "vehicles available"}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                                <button
                                    type="button"
                                    onClick={() =>
                                        onPageChange(Math.max(1, page - 1))
                                    }
                                    disabled={!hasPreviousPage || loading}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1491FF]/10 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
                                >
                                    <ArrowLeft size={15} />
                                    Previous
                                </button>

                                <button
                                    type="button"
                                    onClick={() => onPageChange(page + 1)}
                                    disabled={!hasNextPage || loading}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0876D1] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1491FF]/20 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
                                >
                                    Next
                                    <ArrowRight size={15} />
                                </button>
                            </div>
                        </div>
                    </nav>
                </>
            )}
        </section>
    );
}