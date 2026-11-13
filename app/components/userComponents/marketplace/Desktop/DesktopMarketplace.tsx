
"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import { createPortal } from "react-dom";
import Link from "next/link";
import { PublicAccountLink } from "@/app/components/auth/PublicAccountLink";

import {
    ArrowRight,
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

import { MarketplaceFilters } from "../MarketplaceFilters";
import { MarketplaceResultsPanel } from "../MarketplaceResultsPanel";
import { SaveSearchButton } from "@/app/components/userComponents/marketplace/SaveSearchButton";
import { CurrentYear } from "@/app/utils/current-year";

export function DesktopMarketplace() {
    const {
        query,
        setQuery,
        handleSearch,
        submittedQuery,
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

    const filterTriggerRef = useRef<HTMLButtonElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    const activeFilterCount = countActiveFilters(filters);
    const totalVehicles = pagination?.total ?? 0;

    useEffect(() => {
        setMounted(true);
    }, []);

    const openFilters = useCallback(() => {
        setFiltersOpen(true);
    }, []);

    const closeFilters = useCallback(() => {
        setFiltersOpen(false);
    }, []);

    // Handle modal keyboard interaction and body scrolling.
    useEffect(() => {
        if (!filtersOpen) return;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeFilters();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        closeButtonRef.current?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);

            filterTriggerRef.current?.focus();
        };
    }, [filtersOpen, closeFilters]);

    const clearSearch = () => {
        setQuery("");
    };

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-slate-900">

            {/* BLUE MARKETPLACE HEADER */}
            <header className="relative z-30 bg-[#1491FF] text-white shadow-[0_5px_20px_rgba(0,95,185,0.12)]">

                <div className="mx-auto max-w-[1440px]">

                    {/* TOP NAVIGATION */}
                    <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-[max(13px,env(safe-area-inset-top))] lg:px-10">

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

                        <PublicAccountLink
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
                        </PublicAccountLink>
                    </div>

                    {/* SEARCH + FILTER BAR */}
                    <div className="flex items-center gap-2 px-4 pb-5 pt-4 lg:px-10">

                        {/* FILTER BUTTON */}
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

                        {/* SEARCH BOX */}
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
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
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
                                disabled={loading}
                                aria-label="Search vehicles"
                                className="
                                    flex size-10 shrink-0
                                    items-center justify-center
                                    rounded-xl bg-[#1491FF]
                                    text-white shadow-sm
                                    transition hover:bg-[#0877D9]
                                    active:scale-95
                                    disabled:cursor-not-allowed disabled:opacity-60
                                "
                            >
                                <Search size={17} strokeWidth={2.2} />
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {/* MARKETPLACE CONTENT */}
            <div className="mx-auto max-w-[1440px] px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-10 lg:pt-9">

                {/* FILTERS AND RESULTS */}
                <section
                    aria-label="Vehicle listings"
                >
                        {/* RESULTS */}
                        <div className="min-w-0">

                            {/* RESULTS HEADING + SORT */}
                            <div className="mb-5 flex items-center justify-between gap-4">

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-base font-semibold tracking-tight text-slate-950 sm:text-lg">
                                            Explore vehicles
                                        </h2>

                                        {!loading && !error && (
                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium tabular-nums text-slate-500 sm:text-xs">
                                                {totalVehicles.toLocaleString("en-NG")}
                                            </span>
                                        )}
                                    </div>

                                    <p
                                        aria-live="polite"
                                        className="mt-1 text-xs text-slate-500"
                                    >
                                        {loading
                                            ? "Finding vehicles..."
                                            : error
                                              ? "Unable to update results."
                                              : `${totalVehicles.toLocaleString("en-NG")} ${
                                                    totalVehicles === 1
                                                        ? "car"
                                                        : "cars"
                                                } available`}
                                    </p>
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                <SaveSearchButton query={submittedQuery} filters={filters} sort={sort} />
                                <label className="flex shrink-0 items-center gap-2">
                                    <span className="text-xs font-medium text-slate-500">
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
                                                h-9 min-w-[112px] max-w-[145px]
                                                appearance-none rounded-lg
                                                border border-slate-200
                                                bg-white pl-2.5 pr-7
                                                text-xs font-semibold
                                                text-slate-700 outline-none
                                                transition hover:border-slate-300
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
                                            size={14}
                                            aria-hidden="true"
                                            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                                        />
                                    </span>
                                </label>
                                </div>
                            </div>

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
                    <div className="grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-8">

                        {/* DESKTOP FILTER SIDEBAR */}
                        {/* <aside className="hidden min-w-0 lg:block">
                            <div className="sticky top-[88px]">
                                <MarketplaceFilters
                                    filters={filters}
                                    onFilterChange={updateFilter}
                                    onClear={clearFilters}
                                    onApply={() => setPage(1)}
                                />
                            </div>
                        </aside> */}

                    </div>
                </section>

                {/* FOOTER */}
                <footer className="mt-12 border-t border-slate-200 pt-5 sm:mt-16 sm:pt-6">
                    <div className="flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                        <p>
                            © <CurrentYear /> KARMASS. Find your
                            next drive.
                        </p>

                        <PublicAccountLink
                            href="/register"
                            className="inline-flex min-h-9 items-center gap-1.5 font-semibold text-slate-600 transition-colors hover:text-[#0876D1]"
                        >
                            Have a car to sell?
                            <span className="text-[#1491FF]">
                                Get started
                            </span>
                            <ArrowRight size={13} aria-hidden="true" />
                        </PublicAccountLink>
                    </div>
                </footer>
            </div>

            {/* FILTER DIALOG */}
            {mounted && filtersOpen && createPortal(
                <div
                    className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/45 backdrop-blur-[2px] sm:items-center sm:p-5"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeFilters();
                        }
                    }}
                >
                    <div
                        id="desktop-marketplace-filter-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="desktop-marketplace-filter-title"
                        className="
                            relative z-10 flex
                            h-[min(88dvh,780px)] w-full
                            flex-col overflow-hidden
                            rounded-t-[26px] bg-white
                            shadow-2xl
                            sm:max-w-lg sm:rounded-[26px]
                        "
                    >
                        <MarketplaceFilters
                            variant="modal"
                            filters={filters}
                            onFilterChange={updateFilter}
                            onClear={clearFilters}
                            onApply={() => {
                                setPage(1);
                                closeFilters();
                            }}
                            onClose={closeFilters}
                            closeButtonRef={closeButtonRef}
                        />
                    </div>
                </div>,
                document.body,
            )}
        </main>
    );
}

export default DesktopMarketplace;
