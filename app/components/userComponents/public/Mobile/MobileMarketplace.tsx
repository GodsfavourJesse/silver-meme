"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import Link from "next/link";
import { createPortal } from "react-dom";

import {
    ArrowLeft,
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react";

import { useSharedMarketplaceSearch } from "@/app/context/user/MarketplaceSearchProvider";

import { countActiveFilters } from "@/app/lib/user/marketplace/marketplace-search";

import { MarketplaceFilters } from "../../marketplace/MarketplaceFilters";
import { MarketplaceResultsPanel } from "../../marketplace/MarketplaceResultsPanel";

export function MobileMarketplace() {
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

    const [filtersOpen, setFiltersOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [closing, setClosing] = useState(false);

   const closeTimerRef = useRef<number | null>(null);

    const closeButtonRef = useRef<HTMLButtonElement | null>(null);

    const activeFilterCount = countActiveFilters(filters);

    useEffect(() => {
        setMounted(true);
    }, []);

    /*
     * Lock background scrolling while the filter modal is open.
     * Support Escape and restore focus when the modal closes.
     */
    useEffect(() => {
        if (!filtersOpen) {
            return;
        }

        const previouslyFocusedElement =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        const focusTimer = window.setTimeout(() => {
            closeButtonRef.current?.focus();
        }, 50);

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                closeFilters();
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            window.clearTimeout(focusTimer);

            document.body.style.overflow = previousOverflow;

            document.removeEventListener(
                "keydown",
                handleKeyDown,
            );

            previouslyFocusedElement?.focus();
        };
    }, [filtersOpen]);

    /*
     * Prevent a pending close timer from updating state after unmount.
     */
    useEffect(() => {
        return () => {
            if (closeTimerRef.current !== null) {
                window.clearTimeout(closeTimerRef.current);
            }
        };
    }, []);

    function openFilters() {
        if (closeTimerRef.current !== null) {
            window.clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }

        setClosing(false);
        setFiltersOpen(true);
    }

    function closeFilters() {
        if (closing) {
            return;
        }

        setClosing(true);

        closeTimerRef.current = window.setTimeout(() => {
            setFiltersOpen(false);
            setClosing(false);
            closeTimerRef.current = null;
        }, 260);
    }

    function applyFilters() {
        setPage(1);
        closeFilters();
    }

    return (
        <main className="min-h-screen overflow-x-clip bg-[#f7f8fa] pb-8 text-slate-950">
            <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
                <div className="flex items-center justify-between px-4 py-3.5">
                    <Link
                        href="/"
                        aria-label="KARMASS home"
                        className="text-base font-bold tracking-[.12em]"
                    >
                        KARMASS
                    </Link>

                    <Link
                        href="/sell"
                        className="rounded-xl bg-violet-700 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition active:scale-[0.98]"
                    >
                        Sell your car
                    </Link>
                </div>
            </header>

            <div className="px-4 pt-5">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-slate-950"
                >
                    <ArrowLeft size={15} />
                    Home
                </Link>

                <section className="mt-5">
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-violet-700">
                        KARMASS marketplace
                    </p>

                    <h1 className="mt-2 text-[28px] font-semibold leading-tight tracking-tight">
                        Find your next car
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Explore vehicles from sellers across Nigeria.
                    </p>
                </section>

                <form
                    onSubmit={handleSearch}
                    className="mt-5 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100/70"
                >
                    <Search
                        size={18}
                        className="ml-2 shrink-0 text-slate-400"
                    />

                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search make or model"
                        aria-label="Search vehicle listings"
                        className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-sm outline-none placeholder:text-slate-400"
                    />

                    {query && (
                        <button
                            type="button"
                            aria-label="Clear search input"
                            onClick={() => setQuery("")}
                            className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100"
                        >
                            <X size={15} />
                        </button>
                    )}

                    <button
                        type="submit"
                        aria-label="Search"
                        className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-white transition hover:bg-violet-700 active:scale-95"
                    >
                        <Search size={17} />
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-900">
                            Available vehicles
                        </h2>

                        <p
                            className="mt-1 text-xs text-slate-500"
                            aria-live="polite"
                        >
                            {loading
                                ? "Finding vehicles..."
                                : pagination
                                  ? `${pagination.total.toLocaleString()} vehicles found`
                                  : "Explore available listings"}
                        </p>
                    </div>

                    {activeFilterCount > 0 && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="shrink-0 text-xs font-semibold text-violet-700 transition hover:text-violet-900"
                        >
                            Clear filters
                        </button>
                    )}
                </div>

                <section className="mt-4">
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
                </section>
            </div>

            {/* Floating filter button */}
            <button
                type="button"
                onClick={openFilters}
                aria-label={
                    activeFilterCount > 0
                        ? `Open filters, ${activeFilterCount} active`
                        : "Open filters"
                }
                aria-haspopup="dialog"
                aria-expanded={filtersOpen}
                className="
                    fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))]
                    right-4 z-40
                    inline-flex items-center gap-2.5
                    rounded-full bg-violet-700
                    px-5 py-4 text-sm font-semibold text-white
                    shadow-[0_10px_35px_rgba(109,40,217,0.35)]
                    ring-1 ring-white/20
                    transition duration-200
                    hover:-translate-y-0.5 hover:bg-violet-800
                    active:scale-95
                    focus-visible:outline-none focus-visible:ring-4
                    focus-visible:ring-violet-300
                    motion-reduce:transition-none
                "
            >
                <SlidersHorizontal size={19} />

                <span>Filters</span>

                {activeFilterCount > 0 && (
                    <span className="grid min-w-5 place-items-center rounded-full bg-white px-1.5 py-1 text-[10px] font-bold leading-none text-violet-800">
                        {activeFilterCount}
                    </span>
                )}
            </button>

            {/* Filter modal */}
            {mounted &&
                filtersOpen &&
                createPortal(
                    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
                        <button
                            type="button"
                            aria-label="Close filter dialog"
                            onClick={closeFilters}
                            className={`
                                absolute inset-0 bg-slate-950/45
                                backdrop-blur-[3px]
                                transition-opacity duration-[260ms]
                                motion-reduce:transition-none
                                ${
                                    closing
                                        ? "opacity-0"
                                        : "opacity-100"
                                }
                            `}
                        />

                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="mobile-marketplace-filter-title"
                            className={`
                                relative z-10
                                flex h-[min(88dvh,780px)] w-full
                                flex-col overflow-hidden
                                rounded-t-[28px] bg-white
                                shadow-[0_-12px_60px_rgba(15,23,42,0.18)]
                                transition-[transform,opacity]
                                duration-[260ms]
                                ease-[cubic-bezier(0.22,1,0.36,1)]
                                motion-reduce:transition-none
                                sm:max-w-lg sm:rounded-[28px]
                                ${
                                    closing
                                        ? "translate-y-full opacity-90 sm:translate-y-4 sm:scale-[0.98] sm:opacity-0"
                                        : "translate-y-0 opacity-100"
                                }
                            `}
                        >
                            <div className="shrink-0 pt-3 sm:hidden">
                                <div className="mx-auto h-1.5 w-11 rounded-full bg-slate-200" />
                            </div>

                            <div className="min-h-0 flex-1">
                                <MarketplaceFilters
                                    filters={filters}
                                    onFilterChange={updateFilter}
                                    onClear={clearFilters}
                                    onApply={applyFilters}
                                    variant="modal"
                                    onClose={closeFilters}
                                    closeButtonRef={closeButtonRef}
                                />
                            </div>
                        </section>
                    </div>,
                    document.body,
                )}
        </main>
    );
}

export default MobileMarketplace;