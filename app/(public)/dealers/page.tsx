"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    Building2,
    CarFront,
    ChevronLeft,
    ChevronRight,
    LoaderCircle,
    Search,
    ShieldCheck,
    Users,
    X,
} from "lucide-react";

import { usePublicDealers } from "@/app/hooks/user/dealer/useDealer";

const BRAND_COLOR = "#1491FF";
const PAGE_SIZE = 12;

/* =========================================================
   DEALER CARD SKELETON
========================================================= */

function DealerCardSkeleton() {
    return (
        <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="h-36 bg-slate-100" />

            <div className="px-4 pb-5 sm:px-5">
                <div className="-mt-8 mb-4 flex items-end justify-between gap-3">
                    <div className="h-[72px] w-[72px] shrink-0 rounded-2xl border-4 border-white bg-slate-200 shadow-sm" />

                    <div className="mb-2 h-4 w-24 rounded-full bg-slate-100" />
                </div>

                <div className="mb-2 h-5 w-3/4 rounded bg-slate-200" />

                <div className="mt-3 h-3 w-1/2 rounded bg-slate-100" />

                <div className="mt-4 h-4 w-2/3 rounded bg-slate-100" />

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="h-8 w-28 rounded-lg bg-slate-100" />
                    <div className="h-9 w-28 rounded-xl bg-slate-200" />
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   EMPTY DEALERS STATE
========================================================= */

function EmptyDealers({
    searching,
    onClear,
}: {
    searching: boolean;
    onClear: () => void;
}) {
    return (
        <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                <Building2
                    size={28}
                    style={{ color: BRAND_COLOR }}
                />
            </div>

            <h3 className="text-base font-bold text-slate-900">
                {searching
                    ? "No dealers found"
                    : "No verified dealers yet"}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {searching
                    ? "We couldn't find any verified dealers matching your search. Try another company name or keyword."
                    : "Verified dealers will appear here once they are approved to join the KARMASS marketplace."}
            </p>

            {searching && (
                <button
                    type="button"
                    onClick={onClear}
                    className="mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                    style={{ backgroundColor: BRAND_COLOR }}
                >
                    Clear search
                </button>
            )}
        </div>
    );
}

/* =========================================================
   DEALER CARD
========================================================= */

function DealerCard({
    dealer,
}: {
    dealer: {
        id: string;
        companyName: string;
        bio?: string | null;
        coverPhotoUrl?: string | null;
        profilePictureUrl?: string | null;
    };
}) {
    const bio = dealer.bio?.trim() ?? "";

    const shortBio =
        bio.length > 70
            ? `${bio.slice(0, 70)}...`
            : bio;

    return (
        <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/70">
            {/* Cover Photo */}
            <div className="relative h-36 overflow-hidden bg-gradient-to-br from-slate-100 to-blue-50">
                {dealer.coverPhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={dealer.coverPhotoUrl}
                        alt={`${dealer.companyName} cover`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <CarFront
                            size={42}
                            strokeWidth={1.2}
                            className="text-blue-200 transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                )}

                {/* Subtle Cover Overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />

                {/* Verified Badge */}
                <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/95 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700 shadow-sm">
                    <BadgeCheck
                        size={13}
                        className="shrink-0"
                    />
                    Verified
                </div>
            </div>

            {/* Dealer Information */}
            <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                {/* Floating Profile Picture */}
                <div className="-mt-8 mb-3 flex items-end justify-between gap-3">
                    <div className="relative shrink-0">
                        <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-blue-50 shadow-md transition-transform duration-300 group-hover:-translate-y-0.5">
                            {dealer.profilePictureUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={dealer.profilePictureUrl}
                                    alt={`${dealer.companyName} logo`}
                                    loading="lazy"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <Building2
                                    size={29}
                                    strokeWidth={1.5}
                                    style={{ color: BRAND_COLOR }}
                                />
                            )}
                        </div>

                        {/* Small Verification Indicator */}
                        <span
                            aria-label="Verified dealer"
                            title="Verified dealer"
                            className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white"
                        >
                            <BadgeCheck
                                size={12}
                                strokeWidth={2.5}
                            />
                        </span>
                    </div>

                    {/* Dealer Trust Label */}
                    <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1.5 text-[10px] font-semibold text-blue-700">
                        <ShieldCheck
                            size={13}
                            className="shrink-0"
                        />
                        KARMASS verified
                    </div>
                </div>

                {/* Company Name */}
                <h3
                    title={dealer.companyName}
                    className="truncate text-base font-bold tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-blue-700"
                >
                    {dealer.companyName}
                </h3>

                {/* Dealer Category */}
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <Building2
                        size={13}
                        className="shrink-0 text-slate-400"
                    />

                    <span>Automotive dealer</span>
                </div>

                {/* Short Bio */}
                <p
                    title={bio || undefined}
                    className="mt-3 min-h-5 text-sm leading-5 text-slate-500"
                >
                    {shortBio ||
                        "Explore this dealer's profile to learn more about their business and available vehicles."}
                </p>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 transition-colors duration-200 group-hover:bg-blue-50">
                            <Users
                                size={15}
                                className="text-slate-500 transition-colors group-hover:text-blue-600"
                            />
                        </span>

                        <span className="truncate font-medium">
                            KARMASS dealer
                        </span>
                    </div>

                    <Link
                        href={`/dealers/${encodeURIComponent(dealer.id)}`}
                        aria-label={`View ${dealer.companyName} profile`}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                        style={{
                            backgroundColor: BRAND_COLOR,
                        }}
                    >
                        View profile

                        <ArrowRight
                            size={14}
                            className="transition-transform duration-200 group-hover:translate-x-0.5"
                        />
                    </Link>
                </div>
            </div>
        </article>
    );
}

/* =========================================================
   DEALERS PAGE
========================================================= */

export default function DealersPage() {
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);

    /* Debounce Search */
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearch(searchInput.trim());
            setPage(1);
        }, 350);

        return () => window.clearTimeout(timer);
    }, [searchInput]);

    /* Fetch Dealers */
    const {
        data: response,
        isPending,
        isError,
        error,
        refetch,
        isFetching,
    } = usePublicDealers({
        search: debouncedSearch,
        page,
        limit: PAGE_SIZE,
    });

    const result = response?.data;
    const dealers = result?.items ?? [];
    const pagination = result?.pagination;

    const total = pagination?.total ?? 0;
    const totalPages = pagination?.totalPages ?? 0;

    const showInitialLoading = isPending && !response;

    const showSearchLoading =
        isFetching &&
        searchInput.trim() !== debouncedSearch;

    /* Clear Search */
    function clearSearch() {
        setSearchInput("");
        setDebouncedSearch("");
        setPage(1);
    }

    return (
        <main className="min-h-screen bg-slate-50 pb-28 md:pb-10">
            {/* =====================================================
                HERO
            ===================================================== */}
            <section
                className="relative overflow-hidden"
                style={{
                    background:
                        "linear-gradient(135deg, #071A33 0%, #0B2C50 55%, #124C82 100%)",
                }}
            >
                {/* Background Accent */}
                <div
                    className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full opacity-20 blur-3xl"
                    style={{ backgroundColor: BRAND_COLOR }}
                />

                <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8">
                    {/* Back Link */}
                    <Link
                        href="/"
                        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
                    >
                        <ArrowLeft size={16} />
                        Back to home
                    </Link>

                    {/* Hero Heading */}
                    <div className="max-w-2xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
                            <ShieldCheck
                                size={14}
                                style={{ color: "#60B7FF" }}
                            />

                            Trusted automotive dealers
                        </div>

                        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                            Discover verified{" "}
                            <span style={{ color: "#60B7FF" }}>
                                car dealers.
                            </span>
                        </h1>

                        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                            Connect with verified dealers on KARMASS,
                            explore their available vehicles, and find
                            the right car for you.
                        </p>
                    </div>

                    {/* Search */}
                    <div className="mt-8 max-w-2xl">
                        <label
                            htmlFor="dealer-search"
                            className="sr-only"
                        >
                            Search verified dealers
                        </label>

                        <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white p-2 shadow-xl shadow-black/10 sm:gap-3">
                            <Search
                                size={21}
                                className="ml-2 shrink-0 text-slate-400"
                            />

                            <input
                                id="dealer-search"
                                type="search"
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.target.value)
                                }
                                placeholder="Search dealer or company name..."
                                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            />

                            {searchInput && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    aria-label="Clear search"
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
                                >
                                    <X size={17} />
                                </button>
                            )}

                            <div
                                className="hidden items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white sm:flex"
                                style={{
                                    backgroundColor: BRAND_COLOR,
                                }}
                            >
                                <Search size={16} />
                                Search
                            </div>
                        </div>

                        <p className="mt-3 text-xs text-slate-400">
                            Only KARMASS-verified dealers are displayed.
                        </p>
                    </div>
                </div>
            </section>

            {/* =====================================================
                DEALER DIRECTORY
            ===================================================== */}
            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                {/* Directory Header */}
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p
                            className="text-xs font-bold uppercase tracking-[0.18em]"
                            style={{ color: BRAND_COLOR }}
                        >
                            Dealer directory
                        </p>

                        <h2 className="mt-2 text-xl font-extrabold text-slate-900 sm:text-2xl">
                            {debouncedSearch
                                ? "Search results"
                                : "Meet our dealers"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {showInitialLoading
                                ? "Finding verified dealers..."
                                : `${total.toLocaleString()} verified ${
                                      total === 1 ? "dealer" : "dealers"
                                  }${debouncedSearch ? " found" : ""}`}
                        </p>
                    </div>

                    {isFetching && !showInitialLoading && (
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <LoaderCircle
                                size={15}
                                className="animate-spin"
                            />
                            Updating...
                        </div>
                    )}
                </div>

                {/* Error State */}
                {isError && !response ? (
                    <div className="flex flex-col items-center rounded-2xl border border-red-100 bg-white px-5 py-14 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                            <AlertCircle
                                size={26}
                                className="text-red-500"
                            />
                        </div>

                        <h3 className="mt-4 font-bold text-slate-900">
                            Unable to load dealers
                        </h3>

                        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                            {error instanceof Error
                                ? error.message
                                : "Something went wrong while loading the dealer directory."}
                        </p>

                        <button
                            type="button"
                            onClick={() => void refetch()}
                            className="mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                            style={{
                                backgroundColor: BRAND_COLOR,
                            }}
                        >
                            Try again
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Dealer Grid */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {showInitialLoading
                                ? Array.from({ length: 6 }).map(
                                      (_, index) => (
                                          <DealerCardSkeleton
                                              key={index}
                                          />
                                      ),
                                  )
                                : dealers.map((dealer) => (
                                      <DealerCard
                                          key={dealer.id}
                                          dealer={dealer}
                                      />
                                  ))}
                        </div>

                        {/* Empty State */}
                        {!showInitialLoading &&
                            dealers.length === 0 &&
                            !isError && (
                                <EmptyDealers
                                    searching={Boolean(debouncedSearch)}
                                    onClear={clearSearch}
                                />
                            )}

                        {/* Pagination */}
                        {!showInitialLoading &&
                            dealers.length > 0 &&
                            totalPages > 1 && (
                                <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-center text-xs text-slate-500 sm:text-left">
                                        Page{" "}
                                        <span className="font-bold text-slate-900">
                                            {page}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-bold text-slate-900">
                                            {totalPages}
                                        </span>
                                    </p>

                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            disabled={
                                                page <= 1 || isFetching
                                            }
                                            onClick={() =>
                                                setPage((current) =>
                                                    Math.max(
                                                        1,
                                                        current - 1,
                                                    ),
                                                )
                                            }
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <ChevronLeft size={17} />

                                            <span className="hidden sm:inline">
                                                Previous
                                            </span>
                                        </button>

                                        <span className="min-w-10 text-center text-sm font-semibold text-slate-700">
                                            {page}
                                        </span>

                                        <button
                                            type="button"
                                            disabled={
                                                page >= totalPages ||
                                                isFetching
                                            }
                                            onClick={() =>
                                                setPage((current) =>
                                                    Math.min(
                                                        totalPages,
                                                        current + 1,
                                                    ),
                                                )
                                            }
                                            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                                            style={{
                                                backgroundColor: BRAND_COLOR,
                                            }}
                                        >
                                            <span className="hidden sm:inline">
                                                Next
                                            </span>

                                            <ChevronRight size={17} />
                                        </button>
                                    </div>
                                </div>
                            )}

                        {/* Search Loading */}
                        {showSearchLoading && (
                            <p className="mt-4 text-center text-xs text-slate-400">
                                Searching the dealer directory...
                            </p>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}