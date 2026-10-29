"use client";

import Link from "next/link";

import {
    ArrowLeft,
    ArrowRight,
    Search,
    X,
} from "lucide-react";

import { useSharedMarketplaceSearch } from "@/app/context/user/MarketplaceSearchProvider";

import { MarketplaceFilters } from "../MarketplaceFilters";
import { MarketplaceResultsPanel } from "../MarketplaceResultsPanel";
import { DesktopNavbar } from "../../public/Desktop/DesktopNavbar";

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
        <main className="min-h-screen bg-[#F8FAFC] text-slate-900">
            {/* Marketplace header */}
            {/* <DesktopNavbar /> */}

            {/* Marketplace content */}
            <div className="mx-auto max-w-[1440px] px-4 pb-12 pt-5 sm:px-6 sm:pt-7 lg:px-10 lg:pt-9">
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb">
                    <Link
                        href="/"
                        className="inline-flex min-h-8 items-center gap-2 rounded-lg text-sm font-medium text-slate-500 transition-colors hover:text-[#0876D1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1491FF] focus-visible:ring-offset-2"
                    >
                        <ArrowLeft
                            size={15}
                            aria-hidden="true"
                        />
                        Home
                    </Link>
                </nav>

                {/* Page introduction and search */}
                <section className="mt-5 flex flex-col gap-6 border-b border-slate-200 pb-7 sm:mt-6 sm:pb-8 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#1491FF]/15 bg-[#1491FF]/[0.06] px-3 py-1.5">
                            <span
                                className="h-1.5 w-1.5 rounded-full bg-[#1491FF]"
                                aria-hidden="true"
                            />

                            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0876D1] sm:text-[11px]">
                                The KARMASS marketplace
                            </span>
                        </div>

                        <h1 className="mt-4 text-[2rem] font-bold leading-[1.12] tracking-tight text-slate-950 sm:text-4xl lg:text-[2.75rem]">
                            Find a car that{" "}
                            <span className="text-[#1491FF]">
                                feels right.
                            </span>
                        </h1>

                        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                            From everyday drives to something special, explore
                            cars for sale from sellers across Nigeria.
                        </p>
                    </div>

                    {/* Search */}
                    <form
                        onSubmit={handleSearch}
                        role="search"
                        className="w-full xl:max-w-[520px]"
                    >
                        <label
                            htmlFor="marketplace-search"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            What are you looking for?
                        </label>

                        <div className="flex min-h-[54px] items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm transition-all focus-within:border-[#1491FF] focus-within:ring-4 focus-within:ring-[#1491FF]/10">
                            <Search
                                size={19}
                                className="ml-2 shrink-0 text-slate-400"
                                aria-hidden="true"
                            />

                            <input
                                id="marketplace-search"
                                type="search"
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder="Try Toyota Camry or Honda Accord"
                                autoComplete="off"
                                aria-label="Search cars by make, model, or keyword"
                                className="h-10 min-w-0 flex-1 bg-transparent px-1 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            />

                            {query && (
                                <button
                                    type="button"
                                    aria-label="Clear search"
                                    onClick={() => setQuery("")}
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1491FF]"
                                >
                                    <X
                                        size={16}
                                        aria-hidden="true"
                                    />
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0876D1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1491FF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
                            >
                                <Search
                                    size={16}
                                    aria-hidden="true"
                                />

                                <span className="hidden sm:inline">
                                    Search cars
                                </span>

                                <span className="sm:hidden">
                                    Search
                                </span>
                            </button>
                        </div>

                        <p className="mt-2 px-1 text-xs leading-5 text-slate-500">
                            Search by make, model, or any detail you have in
                            mind.
                        </p>
                    </form>
                </section>

                {/* Filters and results */}
                <section
                    aria-label="Vehicle listings"
                    className="mt-6 sm:mt-8"
                >
                    <div className="grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-8">
                        {/* Desktop filters */}
                        <aside className="hidden min-w-0 lg:block">
                            <div className="sticky top-[88px]">
                                <MarketplaceFilters
                                    filters={filters}
                                    onFilterChange={updateFilter}
                                    onClear={clearFilters}
                                    onApply={() => setPage(1)}
                                />
                            </div>
                        </aside>

                        {/* Results */}
                        <div className="min-w-0">
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
                </section>

                {/* Footer */}
                <footer className="mt-12 border-t border-slate-200 pt-5 sm:mt-16 sm:pt-6">
                    <div className="flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                        <p>
                            © {new Date().getFullYear()} KARMASS. Find your
                            next drive.
                        </p>

                        <Link
                            href="/sell"
                            className="inline-flex min-h-9 items-center gap-1.5 font-semibold text-slate-600 transition-colors hover:text-[#0876D1]"
                        >
                            Have a car to sell?
                            <span className="text-[#1491FF]">
                                Get started
                            </span>
                            <ArrowRight
                                size={13}
                                aria-hidden="true"
                            />
                        </Link>
                    </div>
                </footer>
            </div>
        </main>
    );
}

export default DesktopMarketplace;