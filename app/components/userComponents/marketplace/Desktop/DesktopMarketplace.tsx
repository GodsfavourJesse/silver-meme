"use client";

import Link from "next/link";

import {
    ArrowLeft,
    Search,
    X,
} from "lucide-react";

import { useSharedMarketplaceSearch } from "@/app/context/user/MarketplaceSearchProvider";

import { MarketplaceFilters } from "../MarketplaceFilters";
import { MarketplaceResultsPanel } from "../MarketplaceResultsPanel";

export function DesktopMarketplace() {
    const {
        query,
        setQuery,
        handleSearch,
        filters,
        updateFilter,
        removeFilter,
        clearFilters,
        sort,
        handleSortChange,
        page,
        setPage,
        results,
        pagination,
        loading,
        error,
        retry,
        vehicleLabels,
    } = useSharedMarketplaceSearch();

    return (
        <main className="min-h-screen bg-[#f7f8fa] text-slate-950">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 lg:px-10">
                    <Link
                        href="/"
                        className="text-lg font-bold tracking-[.12em]"
                    >
                        KARMASS
                    </Link>

                    <Link
                        href="/sell"
                        className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800"
                    >
                        Sell your car
                    </Link>
                </div>
            </header>

            <div className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-950"
                >
                    <ArrowLeft size={16} />
                    Home
                </Link>

                <div className="mt-6 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[.16em] text-violet-700">
                            KARMASS marketplace
                        </p>

                        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                            Find your next car
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Explore vehicles from sellers across Nigeria.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSearch}
                        className="flex w-full max-w-xl items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100"
                    >
                        <Search
                            size={18}
                            className="ml-2 shrink-0 text-slate-400"
                        />

                        <input
                            value={query}
                            onChange={(event) =>
                                setQuery(event.target.value)
                            }
                            placeholder="Search make, model or keyword"
                            aria-label="Search vehicle listings"
                            className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-sm outline-none placeholder:text-slate-400"
                        />

                        {query && (
                            <button
                                type="button"
                                aria-label="Clear search input"
                                onClick={() => setQuery("")}
                                className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={16} />
                            </button>
                        )}

                        <button
                            type="submit"
                            className="rounded-lg bg-slate-950 p-2.5 text-white transition hover:bg-violet-700"
                            aria-label="Apply search"
                        >
                            <Search size={17} />
                        </button>
                    </form>
                </div>

                <div className="mt-8 grid items-start gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
                    <div className="hidden lg:block">
                        <MarketplaceFilters
                            filters={filters}
                            onFilterChange={updateFilter}
                            onClear={clearFilters}
                            onApply={() => setPage(1)}
                        />
                    </div>

                    <MarketplaceResultsPanel
                        results={results}
                        pagination={pagination}
                        page={page}
                        sort={sort}
                        filters={filters}
                        vehicleLabels={vehicleLabels}
                        loading={loading}
                        error={error}
                        onSortChange={handleSortChange}
                        onPageChange={setPage}
                        onRemoveFilter={removeFilter}
                        onRetry={retry}
                        onClearFilters={clearFilters}
                    />
                </div>
            </div>
        </main>
    );
}

export default DesktopMarketplace;