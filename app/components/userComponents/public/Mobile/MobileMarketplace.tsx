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
    Search,
    SlidersHorizontal,
    X,
    ChevronDown,
} from "lucide-react";

import { useSharedMarketplaceSearch } from "@/app/context/user/MarketplaceSearchProvider";

import { 
    countActiveFilters,
    SORT_OPTIONS,
    type SortOption,
} from "@/app/lib/user/marketplace/marketplace-search";

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

            {/* BLUE MARKETPLACE HEADER */}
            <header className="relative z-30 bg-[#1491FF] text-white shadow-[0_5px_20px_rgba(0,95,185,0.12)]">

                {/* TOP NAVIGATION */}
                <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-[max(13px,env(safe-area-inset-top))]">

                    <Link
                        href="/"
                        aria-label="KARMASS home"
                        className="group flex min-w-0 items-center gap-2.5"
                    >
                        <span className="
                            flex h-10 w-10 shrink-0
                            items-center justify-center
                            rounded-[13px] bg-white
                            text-[17px] font-extrabold
                            tracking-[-0.08em] text-[#1491FF]
                            shadow-[0_5px_14px_rgba(0,65,130,0.16)]
                            transition-transform group-hover:scale-[1.03]
                        ">
                            K.
                        </span>

                        <span className="min-w-0">
                            <span className="block text-[14px] font-extrabold leading-5 tracking-[0.13em] text-white">
                                KARMASS
                            </span>

                            <span className="mt-0.5 block text-[8px] font-semibold uppercase tracking-[0.16em] text-white/75">
                                Find your drive
                            </span>
                        </span>
                    </Link>

                    <Link
                        href="/register"
                        className="
                            inline-flex min-h-10 shrink-0 items-center
                            justify-center rounded-xl
                            border border-white/25 bg-white/10
                            px-3.5 text-[11px] font-bold text-white
                            transition hover:bg-white/20
                            active:scale-[0.98]
                        "
                    >
                        Sell a car
                    </Link>
                </div>

                {/* SEARCH + FILTER BAR */}
                <div className="flex items-center gap-2 px-4 pb-5 pt-4">

                    {/* FILTER BUTTON — LEFT */}
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
                            relative inline-flex h-[54px] shrink-0
                            items-center justify-center gap-2
                            rounded-[15px] border border-white/20
                            bg-white/15 px-3
                            text-[11px] font-bold text-white
                            transition-all duration-200
                            hover:bg-white/25
                            active:scale-[0.97]
                            focus-visible:outline-none
                            focus-visible:ring-2 focus-visible:ring-white/50
                        "
                    >
                        <SlidersHorizontal size={17} strokeWidth={2.2} />

                        <span>Filters</span>

                        {activeFilterCount > 0 && (
                            <span className="
                                grid size-[17px] shrink-0 place-items-center
                                rounded-full bg-white
                                text-[9px] font-extrabold text-[#0876D1]
                            ">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    {/* SEARCH BOX — RIGHT */}
                    <form
                        onSubmit={handleSearch}
                        role="search"
                        className="
                            flex min-h-[54px] min-w-0 flex-1
                            items-center gap-2
                            rounded-[15px] bg-white
                            p-1.5 pl-3
                            shadow-[0_6px_20px_rgba(0,50,110,0.13)]
                            transition-all
                            focus-within:ring-2 focus-within:ring-white/30
                        "
                    >
                        <Search
                            size={18}
                            className="shrink-0 text-[#8292A6]"
                        />

                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Make, model or location"
                            aria-label="Search vehicles"
                            autoComplete="off"
                            enterKeyHint="search"
                            className="
                                min-w-0 flex-1 bg-transparent
                                py-2 text-[11px] font-medium
                                text-[#243247] outline-none
                                placeholder:text-[#9AA5B4]
                            "
                        />

                        {query && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                aria-label="Clear search"
                                className="
                                    flex size-7 shrink-0
                                    items-center justify-center
                                    rounded-full text-[#8491A3]
                                    transition hover:bg-gray-100
                                "
                            >
                                <X size={14} />
                            </button>
                        )}

                        <button
                            type="submit"
                            aria-label="Search vehicles"
                            className="
                                flex size-10 shrink-0
                                items-center justify-center
                                rounded-xl bg-[#1491FF]
                                text-white shadow-sm
                                transition hover:bg-[#0877D9]
                                active:scale-95
                            "
                        >
                            <Search size={17} strokeWidth={2.2} />
                        </button>
                    </form>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 sm:pt-7 lg:px-8">
    
                {/* RESULTS SUMMARY */}
                <section
                    aria-label="Marketplace results"
                    className="mt-7"
                >
                    <div className="flex items-center justify-between gap-3">

                        {/* LEFT: SECTION TITLE */}
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
                                className="mt-1 text-[11px] leading-5 text-slate-500"
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

                        {/* RIGHT: SORT CONTROL */}
                        <label className="flex shrink-0 items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-slate-500">
                                Sort by
                            </span>

                            <span className="relative">
                                <select
                                    value={sort}
                                    onChange={(event) =>
                                        handleSortChange(
                                            event.target.value as SortOption,
                                        )
                                    }
                                    aria-label="Sort vehicle listings"
                                    className="
                                        h-9 min-w-[112px] max-w-[132px]
                                        appearance-none rounded-lg
                                        border border-slate-200
                                        bg-white pl-2.5 pr-7
                                        text-[11px] font-semibold
                                        text-slate-700 outline-none
                                        transition
                                        hover:border-slate-300
                                        focus:border-[#1491FF]
                                        focus:ring-2 focus:ring-[#1491FF]/10
                                    "
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
                                    size={13}
                                    aria-hidden="true"
                                    className="
                                        pointer-events-none absolute
                                        right-2 top-1/2
                                        -translate-y-1/2
                                        text-slate-400
                                    "
                                />
                            </span>
                        </label>
                    </div>

                    {/* RESULTS */}
                    <div className="mt-4">
                        <MarketplaceResultsPanel
                            results={results}
                            pagination={pagination}
                            page={page}
                            filters={filters}
                            vehicleLabels={vehicleLabels}
                            loading={loading}
                            error={error}
                            onPageChange={setPage}
                            onRemoveFilter={removeFilter}
                            onRetry={retry}
                            onClearFilters={clearFilters}
                        />
                    </div>
                </section>
            </div>


            {/* FILTER DIALOG */}

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