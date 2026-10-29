"use client";

import {
    ArrowLeft,
    ArrowRight,
    CarFront,
    ChevronDown,
    RotateCcw,
    X,
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
    const totalPages = pagination?.totalPages ?? 1;
    const hasPreviousPage = pagination?.hasPreviousPage ?? page > 1;
    const hasNextPage = pagination?.hasNextPage ?? false;

    const activeFilters = getActiveMarketplaceFilters(
        filters,
        vehicleLabels,
    );

    return (
        <section className="min-w-0">
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:px-5">
                <div>
                    <p className="text-sm font-semibold text-slate-950">
                        {loading
                            ? "Finding vehicles..."
                            : `${totalResults.toLocaleString("en-NG")} vehicles found`}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        Vehicles listed across Nigeria
                    </p>
                </div>

                <label className="flex items-center gap-3 text-sm">
                    <span className="shrink-0 text-xs text-slate-500">
                        Sort by
                    </span>

                    <span className="relative">
                        <select
                            value={sort}
                            onChange={(event) =>
                                onSortChange(
                                    event.target.value as SortOption,
                                )
                            }
                            className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-9 text-sm font-medium outline-none focus:border-violet-500"
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
                            size={15}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                    </span>
                </label>
            </div>

            {activeFilters.length > 0 && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900">
                                Active filters
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Refine your search by removing individual filters.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClearFilters}
                            className="text-xs font-semibold text-violet-700 transition hover:text-violet-900"
                        >
                            Clear all
                        </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {activeFilters.map((filter) => (
                            <button
                                key={filter.key}
                                type="button"
                                onClick={() =>
                                    onRemoveFilter(filter.key)
                                }
                                aria-label={`Remove filter: ${filter.label}`}
                                className="group inline-flex min-h-9 items-center gap-2 rounded-full border border-violet-200 bg-violet-50 py-2 pl-3 pr-2 text-xs font-medium text-violet-900 transition hover:border-violet-300 hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                            >
                                <span>{filter.label}</span>

                                <span className="grid size-5 place-items-center rounded-full text-violet-600 transition group-hover:bg-violet-200 group-hover:text-violet-950">
                                    <X size={13} />
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {error && (
                <div
                    role="alert"
                    className="mt-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div>
                        <p className="text-sm font-semibold text-red-800">
                            Unable to load listings
                        </p>

                        <p className="mt-1 text-sm leading-6 text-red-700">
                            {error}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onRetry}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-800 hover:bg-red-100"
                    >
                        <RotateCcw size={15} />
                        Try again
                    </button>
                </div>
            )}

            {loading ? (
                <div className="mt-5 grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <MarketplaceListingSkeleton key={index} />
                    ))}
                </div>
            ) : !error && results.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
                    <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                        <CarFront size={28} />
                    </span>

                    <h2 className="mt-5 text-lg font-semibold">
                        No vehicles found
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                        Try a different search, widen your price range, or clear
                        some filters to see more vehicles.
                    </p>

                    <button
                        type="button"
                        onClick={onClearFilters}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
                    >
                        <RotateCcw size={15} />
                        Clear search and filters
                    </button>
                </div>
            ) : !error ? (
                <>
                    <div className="mt-5 grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                        {results.map((result) => (
                            <MarketplaceListingCard
                                key={result.listing.id}
                                result={result}
                            />
                        ))}
                    </div>

                    <div className="mt-8 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
                        <p className="text-sm text-slate-500">
                            Page{" "}
                            <span className="font-semibold text-slate-950">
                                {page}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-slate-950">
                                {Math.max(totalPages, 1)}
                            </span>
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    onPageChange(Math.max(1, page - 1))
                                }
                                disabled={!hasPreviousPage || loading}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ArrowLeft size={15} />
                                Previous
                            </button>

                            <button
                                type="button"
                                onClick={() => onPageChange(page + 1)}
                                disabled={!hasNextPage || loading}
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                                <ArrowRight size={15} />
                            </button>
                        </div>
                    </div>
                </>
            ) : null}
        </section>
    );
}