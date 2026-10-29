"use client";

import {
    useCallback,
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

const BRAND_BLUE = "#1491FF";
const BRAND_BLUE_DARK = "#0876D1";

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
    const filterTriggerRef = useRef<HTMLButtonElement | null>(null);

    const activeFilterCount = countActiveFilters(filters);

    const cancelCloseTimer = useCallback(() => {
        if (closeTimerRef.current !== null) {
            window.clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    /*
     * Manage body scrolling, Escape key, and focus
     * while the filter dialog is open.
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
                event.preventDefault();
                closeFilters();
            }

            if (event.key === "Tab") {
                const dialog = document.getElementById(
                    "mobile-marketplace-filter-dialog",
                );

                if (!dialog) {
                    return;
                }

                const focusableElements = dialog.querySelectorAll<HTMLElement>(
                    [
                        "button:not([disabled])",
                        "input:not([disabled])",
                        "select:not([disabled])",
                        "textarea:not([disabled])",
                        '[tabindex]:not([tabindex="-1"])',
                    ].join(","),
                );

                const firstElement = focusableElements[0];
                const lastElement =
                    focusableElements[focusableElements.length - 1];

                if (!firstElement || !lastElement) {
                    return;
                }

                if (
                    event.shiftKey &&
                    document.activeElement === firstElement
                ) {
                    event.preventDefault();
                    lastElement.focus();
                } else if (
                    !event.shiftKey &&
                    document.activeElement === lastElement
                ) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            window.clearTimeout(focusTimer);

            document.body.style.overflow = previousOverflow;

            document.removeEventListener("keydown", handleKeyDown);

            previouslyFocusedElement?.focus();
        };
    }, [filtersOpen]);

    /*
     * Clean up the closing animation timer on unmount.
     */
    useEffect(() => {
        return () => {
            cancelCloseTimer();
        };
    }, [cancelCloseTimer]);

    const openFilters = useCallback(() => {
        cancelCloseTimer();

        setClosing(false);
        setFiltersOpen(true);
    }, [cancelCloseTimer]);

    const closeFilters = useCallback(() => {
        if (closing) {
            return;
        }

        setClosing(true);

        cancelCloseTimer();

        closeTimerRef.current = window.setTimeout(() => {
            setFiltersOpen(false);
            setClosing(false);
            closeTimerRef.current = null;

            window.requestAnimationFrame(() => {
                filterTriggerRef.current?.focus();
            });
        }, 260);
    }, [cancelCloseTimer, closing]);

    function applyFilters() {
        setPage(1);
        closeFilters();
    }

    function clearSearch() {
        setQuery("");
    }

    const totalVehicles = pagination?.total ?? 0;

    return (
        <main className="min-h-screen overflow-x-clip bg-[#F7F9FC] pb-[calc(8rem+env(safe-area-inset-bottom))] text-slate-950">
            {/* ================================================== */}
            {/* MOBILE HEADER */}
            {/* ================================================== */}

            <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
                <div className="mx-auto flex h-[66px] max-w-7xl items-center justify-between px-4 sm:px-6">
                    <Link
                        href="/"
                        aria-label="KARMASS home"
                        className="group flex min-w-0 items-center gap-2.5"
                    >
                        <span
                            className="
                                flex h-10 w-10 shrink-0
                                items-center justify-center
                                border border-[#E6EDF5] bg-white
                                text-[16px] font-semibold
                                tracking-[-0.08em]
                                text-[#1491FF]
                                transition-colors
                                group-hover:border-[#1491FF]
                            "
                        >
                            K.
                        </span>

                        <span className="min-w-0">
                            <span className="block text-[15px] font-semibold leading-5 tracking-[0.15em] text-[#20201F]">
                                KARMASS
                            </span>

                            <span className="mt-0.5 block text-[8px] font-medium uppercase tracking-[0.17em] text-[#8491A3]">
                                Find your drive
                            </span>
                        </span>
                    </Link>

                    <Link
                        href="/sell"
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-3.5 text-xs font-bold text-white shadow-sm shadow-blue-500/15 transition hover:bg-[#0876D1] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                    >
                        Sell your car
                    </Link>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 sm:pt-7 lg:px-8">
                {/* ================================================== */}
                {/* BREADCRUMB */}
                {/* ================================================== */}

                <nav aria-label="Breadcrumb">
                    <Link
                        href="/"
                        className="group inline-flex min-h-8 items-center gap-1.5 rounded-lg text-xs font-medium text-slate-500 transition hover:text-[#0876D1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1491FF]"
                    >
                        <ArrowLeft
                            size={14}
                            className="transition-transform group-hover:-translate-x-0.5"
                        />

                        <span>Home</span>
                    </Link>
                </nav>

                {/* ================================================== */}
                {/* PAGE INTRODUCTION */}
                {/* ================================================== */}

                <section className="mt-5">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5">
                        <span className="size-1.5 rounded-full bg-[#1491FF]" />

                        <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#0876D1]">
                            KARMASS Marketplace
                        </span>
                    </div>

                    <h1 className="mt-3 text-[27px] font-bold leading-[1.18] tracking-[-0.045em] text-slate-950 sm:text-3xl">
                        Find a car that
                        <span className="block text-[#1491FF]">
                            feels right.
                        </span>
                    </h1>

                    <p className="mt-2.5 max-w-sm text-[13px] leading-[1.8] text-slate-500 sm:text-sm">
                        Discover cars for every journey, from trusted sellers
                        across Nigeria.
                    </p>
                </section>

                {/* ================================================== */}
                {/* SEARCH BAR */}
                {/* ================================================== */}

                <form
                    onSubmit={handleSearch}
                    role="search"
                    className="mt-5 flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-[0_4px_20px_rgba(15,23,42,0.035)] transition focus-within:border-[#1491FF]/70 focus-within:ring-4 focus-within:ring-blue-100/70"
                >
                    <span className="grid size-10 shrink-0 place-items-center text-slate-400">
                        <Search size={19} strokeWidth={2} />
                    </span>

                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Make, model or keyword"
                        aria-label="Search vehicle listings"
                        autoComplete="off"
                        enterKeyHint="search"
                        className="h-10 min-w-0 flex-1 bg-transparent text-[13px] font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400 sm:text-sm"
                    />

                    {query && (
                        <button
                            type="button"
                            aria-label="Clear search input"
                            onClick={clearSearch}
                            className="grid size-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1491FF]"
                        >
                            <X size={16} />
                        </button>
                    )}

                    <button
                        type="submit"
                        aria-label="Search vehicles"
                        className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#1491FF] text-white shadow-sm shadow-blue-500/20 transition hover:bg-[#0876D1] active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                    >
                        <Search size={18} strokeWidth={2.2} />
                    </button>
                </form>

                {/* ================================================== */}
                {/* RESULTS SUMMARY */}
                {/* ================================================== */}

                <section
                    aria-label="Marketplace results"
                    className="mt-7"
                >
                    <div className="flex items-end justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-[16px] font-bold tracking-tight text-slate-950">
                                    Explore vehicles
                                </h2>

                                {!loading && !error && pagination && (
                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#0876D1]">
                                        {totalVehicles.toLocaleString("en-NG")}
                                    </span>
                                )}
                            </div>

                            <p
                                aria-live="polite"
                                aria-atomic="true"
                                className="mt-1 text-[11px] leading-5 text-slate-500 sm:text-xs"
                            >
                                {loading
                                    ? "Finding cars that match..."
                                    : error
                                      ? "We couldn't load the listings."
                                      : pagination
                                        ? `${totalVehicles.toLocaleString("en-NG")} ${
                                              totalVehicles === 1
                                                  ? "car"
                                                  : "cars"
                                          } available`
                                        : "Explore available listings"}
                            </p>
                        </div>

                        {activeFilterCount > 0 && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-2 text-[11px] font-semibold text-[#0876D1] transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1491FF]"
                            >
                                <X size={13} />
                                Clear filters
                            </button>
                        )}
                    </div>

                    {/* ================================================== */}
                    {/* RESULTS */}
                    {/* ================================================== */}

                    <div className="mt-4">
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
                </section>
            </div>

            {/* ================================================== */}
            {/* FLOATING FILTER BUTTON */}
            {/* ================================================== */}

            <button
                ref={filterTriggerRef}
                type="button"
                onClick={openFilters}
                aria-label={
                    activeFilterCount > 0
                        ? `Open filters, ${activeFilterCount} active`
                        : "Open vehicle filters"
                }
                aria-haspopup="dialog"
                aria-expanded={filtersOpen}
                className="
                    fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))]
                    right-4 z-40
                    inline-flex min-h-[50px] items-center justify-center gap-2.5
                    rounded-2xl border border-white/20
                    bg-[#1491FF] px-5 py-3
                    text-[13px] font-bold text-white
                    shadow-[0_8px_28px_rgba(20,145,255,0.32)]
                    transition duration-200
                    hover:-translate-y-0.5 hover:bg-[#0876D1]
                    active:scale-[0.97]
                    focus-visible:outline-none focus-visible:ring-4
                    focus-visible:ring-blue-200
                    motion-reduce:transition-none
                "
            >
                <SlidersHorizontal size={18} strokeWidth={2.2} />

                <span>Filters</span>

                {activeFilterCount > 0 && (
                    <span className="grid min-w-5 place-items-center rounded-full bg-white px-1.5 py-1 text-[10px] font-extrabold leading-none text-[#0876D1]">
                        {activeFilterCount}
                    </span>
                )}
            </button>

            {/* ================================================== */}
            {/* FILTER DIALOG */}
            {/* ================================================== */}

            {mounted &&
                filtersOpen &&
                createPortal(
                    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-5">
                        {/* Backdrop */}

                        <button
                            type="button"
                            tabIndex={-1}
                            aria-label="Close filter dialog"
                            onClick={closeFilters}
                            className={`
                                absolute inset-0 bg-slate-950/50
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

                        {/* Dialog */}

                        <section
                            id="mobile-marketplace-filter-dialog"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="mobile-marketplace-filter-title"
                            className={`
                                relative z-10 flex
                                h-[min(88dvh,780px)]
                                w-full flex-col overflow-hidden
                                rounded-t-[26px] border border-slate-200/70
                                bg-white shadow-[0_-12px_60px_rgba(15,23,42,0.2)]
                                transition-[transform,opacity]
                                duration-[260ms]
                                ease-[cubic-bezier(0.22,1,0.36,1)]
                                motion-reduce:transition-none
                                sm:max-w-lg sm:rounded-[26px]
                                ${
                                    closing
                                        ? "translate-y-full opacity-90 sm:translate-y-4 sm:scale-[0.98] sm:opacity-0"
                                        : "translate-y-0 opacity-100"
                                }
                            `}
                        >
                            {/* Mobile drag handle */}

                            <div className="shrink-0 pb-1 pt-3 sm:hidden">
                                <div className="mx-auto h-1.5 w-10 rounded-full bg-slate-200" />
                            </div>

                            {/* Filter content */}

                            <div className="min-h-0 flex-1 overflow-hidden">
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