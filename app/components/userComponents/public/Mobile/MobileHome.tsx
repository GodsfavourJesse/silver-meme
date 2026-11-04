"use client";

import {
    useState,
    type FormEvent,
    type ReactNode,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
    ArrowRight,
    CarFront,
    CheckCircle2,
    ChevronRight,
    MapPin,
    Search,
    Sparkles,
    X,
    Zap,
} from "lucide-react";

import type {
    MarketplaceSearchParams,
    MarketplaceSearchResult,
} from "@/app/types/user/marketplace.types";

import HomeMobileNav from "./HomeMobileNav";
import { CurrentYear } from "@/app/utils/current-year";

import type { MarketplaceHomeState } from "../MarketplaceHomeClient";

/*
|--------------------------------------------------------------------------
| BRAND
|--------------------------------------------------------------------------
*/

const BRAND = "#1491FF";
const BRAND_DARK = "#0877D9";

/*
|--------------------------------------------------------------------------
| CATEGORIES
|--------------------------------------------------------------------------
*/

const categories = [
    "All cars",
    "SUV",
    "Sedan",
    "Electric",
    "Luxury",
] as const;

type Category = (typeof categories)[number];

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatPrice(
    price: string | number,
    currency: string,
): string {
    const numericPrice =
        typeof price === "number" ? price : Number(price);

    if (!Number.isFinite(numericPrice)) {
        return "Price on request";
    }

    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(numericPrice);
    } catch {
        return `${currency} ${numericPrice.toLocaleString("en-NG")}`;
    }
}

function formatMileage(
    mileage: number | null,
): string {
    if (mileage === null || mileage === undefined) {
        return "";
    }

    return `${new Intl.NumberFormat("en-NG").format(mileage)} km`;
}

function getVehicleTitle(
    result: MarketplaceSearchResult,
): string {
    const title = result.listing.title?.trim();

    if (title) return title;

    return [
        result.make?.name,
        result.model?.name,
        result.variant?.name,
    ]
        .filter(Boolean)
        .join(" ") || "Vehicle listing";
}

function getVehicleYear(
    result: MarketplaceSearchResult,
): string | null {
    const year = result.variant?.year;

    return year ? String(year) : null;
}

function getVehicleImage(
    result: MarketplaceSearchResult,
): string | null {
    return (
        result.images?.[0]?.thumbnailUrl ||
        result.images?.[0]?.url ||
        result.images?.[0]?.detailUrl ||
        null
    );
}

function getVehicleLocation(
    result: MarketplaceSearchResult,
): string {
    return [
        result.listing.city,
        result.listing.state,
    ]
        .filter(Boolean)
        .join(", ") || "Location not specified";
}

/*
|--------------------------------------------------------------------------
| CATEGORY FILTERS
|--------------------------------------------------------------------------
*/

function getCategoryFilters(
    category: Category,
): Partial<MarketplaceSearchParams> {
    switch (category) {
        case "SUV":
            return { bodyStyle: "SUV" };

        case "Sedan":
            return { bodyStyle: "SEDAN" };

        case "Electric":
            return { fuelType: "ELECTRIC" };

        case "Luxury":
            return { sort: "price_desc" };

        default:
            return {};
    }
}

/*
|--------------------------------------------------------------------------
| SECTION HEADING
|--------------------------------------------------------------------------
*/

function SectionHeading({
    title,
    description,
    action,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
                <h2 className="text-[17px] font-bold tracking-tight text-[#172337]">
                    {title}
                </h2>

                {description && (
                    <p className="mt-1 text-[11px] text-[#8491A3]">
                        {description}
                    </p>
                )}
            </div>

            {action}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| IMAGE PLACEHOLDER
|--------------------------------------------------------------------------
*/

function ListingImagePlaceholder() {
    return (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#F0F7FF] to-[#DCEEFF]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#1491FF] shadow-sm">
                <CarFront size={30} strokeWidth={1.5} />
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| LISTING SKELETON
|--------------------------------------------------------------------------
*/

function ListingSkeleton() {
    return (
        <article className="overflow-hidden rounded-xl border border-[#E9EEF5] bg-white">
            <div className="aspect-[1.18/1] animate-pulse bg-[#EDF2F7]" />

            <div className="space-y-3 p-3">
                <div className="h-3.5 w-4/5 animate-pulse rounded bg-[#EDF2F7]" />
                <div className="h-5 w-3/5 animate-pulse rounded bg-[#EDF2F7]" />

                <div className="flex gap-2">
                    <div className="h-3 w-12 animate-pulse rounded bg-[#F1F4F8]" />
                    <div className="h-3 w-16 animate-pulse rounded bg-[#F1F4F8]" />
                </div>

                <div className="h-px bg-[#F0F2F5]" />

                <div className="h-3 w-3/5 animate-pulse rounded bg-[#EDF2F7]" />
            </div>
        </article>
    );
}

/*
|--------------------------------------------------------------------------
| VEHICLE CARD
|--------------------------------------------------------------------------
*/

function VehicleCard({
    result,
}: {
    result: MarketplaceSearchResult;
}) {
    const listing = result.listing;

    const title = getVehicleTitle(result);
    const image = getVehicleImage(result);
    const year = getVehicleYear(result);
    const mileage = formatMileage(listing.mileage);
    const location = getVehicleLocation(result);

    const transmission = result.variant?.transmission;

    const details = [
        year,
        mileage,
        transmission,
    ].filter(Boolean);

    const listingHref = `/marketplace/${listing.id}`;

    return (
        <article className="group min-w-0 overflow-hidden rounded-xl border border-[#E8EDF4] bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C8E2FF] hover:shadow-[0_10px_28px_rgba(15,45,85,0.07)]">

            {/* VEHICLE IMAGE */}
            <Link
                href={listingHref}
                aria-label={`View ${title}`}
                className="relative block aspect-[1.18/1] overflow-hidden bg-[#F0F4F8]"
            >
                {image ? (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 48vw, 300px"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                ) : (
                    <ListingImagePlaceholder />
                )}

                {/* FEATURED BADGE */}
                {result.boostPriority > 0 && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[9px] font-bold text-[#0877D9] shadow-sm backdrop-blur-sm">
                        <Sparkles size={11} />
                        Featured
                    </span>
                )}

                {/* IMAGE INDICATOR */}
                <span className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-[#0877D9] shadow-sm transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowRight size={14} />
                </span>
            </Link>

            {/* VEHICLE INFORMATION */}
            <div className="p-3">

                <Link
                    href={listingHref}
                    className="line-clamp-2 min-h-[36px] text-[12px] font-semibold leading-[18px] text-[#243247] transition-colors hover:text-[#0877D9]"
                >
                    {title}
                </Link>

                {/* PRICE */}
                <p className="mt-2 text-[17px] font-extrabold tracking-tight text-[#172337]">
                    {formatPrice(
                        listing.price,
                        listing.currency,
                    )}
                </p>

                {/* VEHICLE DETAILS */}
                {details.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                        {details.map((detail, index) => (
                            <span
                                key={`${detail}-${index}`}
                                className="text-[10px] text-[#8491A3]"
                            >
                                {detail}

                                {index < details.length - 1 && (
                                    <span className="ml-2 text-[#CBD3DE]">
                                        ·
                                    </span>
                                )}
                            </span>
                        ))}
                    </div>
                )}

                {/* DIVIDER */}
                <div className="my-3 h-px bg-[#F0F2F6]" />

                {/* LOCATION */}
                <div className="flex min-w-0 items-center gap-1.5">
                    <MapPin
                        size={12}
                        className="shrink-0 text-[#1491FF]"
                    />

                    <span className="truncate text-[10px] text-[#8491A3]">
                        {location}
                    </span>
                </div>

                {/* SELLER VERIFICATION */}
                {result.dealer?.verified && (
                    <div className="mt-2 flex items-center gap-1 text-[9px] font-semibold text-emerald-600">
                        <CheckCircle2 size={11} />
                        Verified seller
                    </div>
                )}

            </div>
        </article>
    );
}

/*
|--------------------------------------------------------------------------
| FEATURED VEHICLE CARD
|--------------------------------------------------------------------------
*/

function FeaturedVehicleCard({
    result,
}: {
    result: MarketplaceSearchResult;
}) {
    const listing = result.listing;

    const title = getVehicleTitle(result);
    const image = getVehicleImage(result);
    const location = getVehicleLocation(result);

    return (
        <Link
            href={`/marketplace/${listing.id}`}
            className="group relative block w-[230px] shrink-0 overflow-hidden rounded-xl border border-[#E4EDF7] bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B9DEFF] hover:shadow-[0_12px_30px_rgba(15,45,85,0.10)]"
        >
            {/* IMAGE */}
            <div className="relative aspect-[1.35/1] overflow-hidden bg-[#F0F4F8]">
                {image ? (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        sizes="230px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <ListingImagePlaceholder />
                )}

                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[9px] font-bold text-[#0877D9] shadow-sm">
                    <Sparkles size={11} />
                    Featured
                </span>
            </div>

            {/* DETAILS */}
            <div className="p-3">
                <h3 className="line-clamp-1 text-[12px] font-bold text-[#243247] transition-colors group-hover:text-[#0877D9]">
                    {title}
                </h3>

                <p className="mt-2 text-[16px] font-extrabold tracking-tight text-[#172337]">
                    {formatPrice(
                        listing.price,
                        listing.currency,
                    )}
                </p>

                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#8491A3]">
                    <MapPin
                        size={11}
                        className="shrink-0 text-[#1491FF]"
                    />

                    <span className="truncate">
                        {location}
                    </span>
                </div>
            </div>
        </Link>
    );
}

/*
|--------------------------------------------------------------------------
| MAIN MOBILE HOME
|--------------------------------------------------------------------------
*/

export function MobileHome({
    marketplace,
}: {
    marketplace: MarketplaceHomeState;
}) {
    const {
        query,
        setQuery,
        submittedQuery,
        handleSearch,

        // Featured vehicles
        featuredVehicles,
        featuredLoading,
        featuredError,
        retryFeatured,

        // Marketplace results
        results,
        pagination,
        loading,
        error,
        retry,

        // Pagination
        hasMore,
        loadMore,
        loadingMore,

        // Filters
        updateFilter,
        clearFilters,
        handleSortChange,
    } = marketplace;

    const [category, setCategory] =
        useState<Category>("All cars");

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    const onSearch = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        handleSearch(event);
    };

    /*
    |--------------------------------------------------------------------------
    | CATEGORY FILTERS
    |--------------------------------------------------------------------------
    */

    const handleCategoryChange = (item: Category) => {
        setCategory(item);

        if (item === "All cars") {
            clearFilters();
            return;
        }

        switch (item) {
            case "SUV":
                updateFilter("bodyStyle", "SUV");
                break;

            case "Sedan":
                updateFilter("bodyStyle", "SEDAN");
                break;

            case "Electric":
                updateFilter("fuelType", "ELECTRIC");
                break;

            case "Luxury":
                handleSortChange("price_desc");
                break;
        }
    };

    const isSearching = Boolean(submittedQuery.trim());

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <main className="min-h-dvh overflow-x-clip bg-[#F7F9FC] pb-32 text-[#172337] md:hidden">

            {/* HEADER */}
            <header className="sticky top-0 z-30 border-b border-white/15 bg-[#1491FF]">

                <div className="flex items-center justify-between gap-3 px-4 pb-3.5 pt-[max(12px,env(safe-area-inset-top))]">

                    {/* LOGO */}
                    <Link
                        href="/"
                        aria-label="KARMASS home"
                        className="group flex min-w-0 items-center gap-2.5"
                    >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white text-[17px] font-bold tracking-[-0.08em] text-[#1491FF] shadow-[0_5px_14px_rgba(0,65,130,0.16)] transition-transform group-hover:scale-[1.03]">
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

                    {/* SELL BUTTON */}
                    <Link
                        href="/register"
                        className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 text-[11px] font-bold text-[#0877D9] shadow-sm transition-colors hover:bg-[#EAF5FF] active:scale-[0.98]"
                    >
                        <CarFront size={15} />
                        Sell a car
                    </Link>

                </div>

                {/* SEARCH BAR */}
                <div className="px-4 pb-4">
                    <form
                        onSubmit={onSearch}
                        className="flex min-h-[48px] items-center gap-2 rounded-xl border border-white/60 bg-white px-3 shadow-[0_5px_18px_rgba(0,65,130,0.12)] transition-all focus-within:ring-2 focus-within:ring-white/20"
                    >
                        <Search
                            size={18}
                            className="shrink-0 text-[#1491FF]"
                        />

                        <input
                            value={query}
                            onChange={(event) =>
                                setQuery(event.target.value)
                            }
                            placeholder="Search make, model or location"
                            aria-label="Search vehicles"
                            className="min-w-0 flex-1 bg-transparent py-2 text-[12px] text-[#243247] outline-none placeholder:text-[#9AA5B4]"
                        />

                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                aria-label="Clear search"
                                className="flex h-7 w-7 items-center justify-center rounded-full text-[#8491A3] transition hover:bg-gray-100"
                            >
                                <X size={15} />
                            </button>
                        )}

                        <button
                            type="submit"
                            aria-label="Search"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1491FF] text-white transition hover:bg-[#0877D9] active:scale-95"
                        >
                            <ArrowRight size={16} />
                        </button>
                    </form>
                </div>

            </header>

            {/* MAIN CONTENT */}
            <div className="mx-auto max-w-7xl">

                {/* CATEGORIES */}
                <section className="border-y border-[#EAEFF5] bg-white py-3.5">

                    <div className="mb-3 flex items-center justify-between px-4">
                        <h2 className="text-[12px] font-bold text-[#344256]">
                            Browse categories
                        </h2>
                    </div>

                    <div className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

                        {categories.map((item) => {
                            const active = category === item;

                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() =>
                                        handleCategoryChange(item)
                                    }
                                    aria-pressed={active}
                                    className={`inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3.5 text-[11px] font-semibold transition-all duration-200 active:scale-[0.97] ${
                                        active
                                            ? "border-[#1491FF] bg-[#1491FF] text-white shadow-sm shadow-blue-500/15"
                                            : "border-[#E5EAF1] bg-white text-[#64748B] hover:border-[#B9DEFF] hover:bg-[#F8FBFF]"
                                    }`}
                                >
                                    {item === "Electric" && (
                                        <Zap size={12} />
                                    )}

                                    {item}
                                </button>
                            );
                        })}

                    </div>

                </section>

                {/* FEATURED VEHICLES */}
                {!isSearching && (
                    <section
                        id="featured-vehicles"
                        className="pt-6"
                    >
                        <div className="px-4">
                            <SectionHeading
                                title="Featured vehicles"
                                description="Standout cars promoted by sellers."
                                action={
                                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#EAF5FF] px-2.5 py-1 text-[9px] font-bold text-[#0877D9]">
                                        <Sparkles size={11} />
                                        Promoted
                                    </span>
                                }
                            />
                        </div>

                        {/* FEATURED LOADING */}
                        {featuredLoading && (
                            <div className="mt-4 flex gap-3 overflow-hidden px-4">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="w-[230px] shrink-0 overflow-hidden rounded-xl border border-[#E8EDF4] bg-white"
                                    >
                                        <div className="aspect-[1.35/1] animate-pulse bg-[#EDF2F7]" />

                                        <div className="space-y-3 p-3">
                                            <div className="h-3 w-4/5 animate-pulse rounded bg-[#EDF2F7]" />
                                            <div className="h-5 w-3/5 animate-pulse rounded bg-[#EDF2F7]" />
                                            <div className="h-3 w-2/3 animate-pulse rounded bg-[#EDF2F7]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* FEATURED ERROR */}
                        {!featuredLoading && featuredError && (
                            <div className="mx-4 mt-4 rounded-xl border border-[#E8EDF4] bg-white p-4">
                                <p className="text-[11px] text-[#8491A3]">
                                    Featured vehicles are temporarily unavailable.
                                </p>

                                <button
                                    type="button"
                                    onClick={retryFeatured}
                                    className="mt-3 text-[11px] font-bold text-[#0877D9]"
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        {/* FEATURED EMPTY */}
                        {!featuredLoading &&
                            !featuredError &&
                            featuredVehicles.length === 0 && (
                                <div className="mx-4 mt-4 rounded-xl border border-dashed border-[#DCE7F2] bg-white px-4 py-5 text-center">
                                    <Sparkles
                                        size={20}
                                        className="mx-auto text-[#1491FF]"
                                    />

                                    <p className="mt-2 text-[11px] font-semibold text-[#344256]">
                                        No featured vehicles yet
                                    </p>

                                    <p className="mt-1 text-[10px] text-[#8491A3]">
                                        Check back soon for promoted listings.
                                    </p>
                                </div>
                            )}

                        {/* FEATURED LIST */}
                        {!featuredLoading &&
                            !featuredError &&
                            featuredVehicles.length > 0 && (
                                <div className="mt-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                    {featuredVehicles.map((result) => (
                                        <FeaturedVehicleCard
                                            key={result.listing.id}
                                            result={result}
                                        />
                                    ))}
                                </div>
                            )}
                    </section>
                )}

                {/* LATEST / SEARCH RESULTS */}
                <section
                    id="latest-vehicles"
                    className="px-4 pb-6 pt-7"
                >

                    <SectionHeading
                        title={
                            isSearching
                                ? "Search results"
                                : category === "All cars"
                                    ? "Latest vehicles"
                                    : `${category} vehicles`
                        }
                        description={
                            isSearching
                                ? `Results for "${submittedQuery}"`
                                : "Explore available cars from sellers."
                        }
                        action={
                            !isSearching && (
                                <Link
                                    href="/marketplace"
                                    className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-[#0877D9]"
                                >
                                    See all
                                    <ArrowRight size={13} />
                                </Link>
                            )
                        }
                    />

                    {/* RESULT COUNT */}
                    {!loading && !error && pagination && (
                        <div className="mt-3 flex items-center justify-between gap-3 border-y border-[#E8EDF4] py-3">
                            <p className="text-[10px] text-[#8491A3]">
                                Showing{" "}
                                <span className="font-bold text-[#344256]">
                                    {results.length}
                                </span>{" "}
                                of{" "}
                                <span className="font-bold text-[#344256]">
                                    {pagination.total}
                                </span>{" "}
                                vehicles
                            </p>

                            <span className="inline-flex shrink-0 items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-[#8491A3]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#1491FF]" />
                                {isSearching ? "Search" : "Latest"}
                            </span>
                        </div>
                    )}

                    {/* LOADING */}
                    {loading && (
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <ListingSkeleton key={index} />
                            ))}
                        </div>
                    )}

                    {/* ERROR */}
                    {!loading && error && (
                        <div
                            role="alert"
                            className="mt-5 rounded-xl border border-[#E8EDF4] bg-white p-5 text-center"
                        >
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#1491FF]">
                                <CarFront size={25} />
                            </div>

                            <h3 className="mt-3 text-[13px] font-bold text-[#172337]">
                                Unable to load vehicles
                            </h3>

                            <p className="mt-1.5 text-[11px] leading-5 text-[#8491A3]">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={retry}
                                className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#1491FF] px-4 text-[11px] font-bold text-white transition hover:bg-[#0877D9]"
                            >
                                Try again
                                <ArrowRight size={13} />
                            </button>
                        </div>
                    )}

                    {/* EMPTY STATE */}
                    {!loading && !error && results.length === 0 && (
                        <div className="mt-5 rounded-xl border border-[#E8EDF4] bg-white px-5 py-9 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#1491FF]">
                                <CarFront size={26} />
                            </div>

                            <h3 className="mt-3 text-[13px] font-bold text-[#172337]">
                                No vehicles found
                            </h3>

                            <p className="mt-1.5 text-[11px] leading-5 text-[#8491A3]">
                                {isSearching
                                    ? "We couldn't find vehicles matching your search. Try another search."
                                    : "There are no listings available in this category right now."}
                            </p>

                            {isSearching ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQuery("");
                                        clearFilters();
                                    }}
                                    className="mt-4 rounded-lg border border-[#B9DEFF] bg-[#EAF5FF] px-4 py-2 text-[11px] font-bold text-[#0877D9] transition hover:bg-[#DCEEFF]"
                                >
                                    Clear search
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleCategoryChange("All cars")}
                                    className="mt-4 rounded-lg border border-[#B9DEFF] bg-[#EAF5FF] px-4 py-2 text-[11px] font-bold text-[#0877D9] transition hover:bg-[#DCEEFF]"
                                >
                                    View all cars
                                </button>
                            )}
                        </div>
                    )}

                    {/* VEHICLE GRID */}
                    {!loading && !error && results.length > 0 && (
                        <>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                {results.map((result) => (
                                    <VehicleCard
                                        key={result.listing.id}
                                        result={result}
                                    />
                                ))}
                            </div>

                            {/* LOAD MORE */}
                            {hasMore && (
                                <button
                                    type="button"
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#D7E9FA] bg-white text-[11px] font-bold text-[#0877D9] transition hover:bg-[#F3F9FF] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loadingMore ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1491FF]/25 border-t-[#1491FF]" />
                                            Loading vehicles...
                                        </>
                                    ) : (
                                        <>
                                            Load more vehicles
                                            <ChevronRight size={14} />
                                        </>
                                    )}
                                </button>
                            )}

                            {!hasMore && results.length > 0 && (
                                <p className="mt-5 text-center text-[10px] text-[#9AA5B4]">
                                    You've reached the end of the listings.
                                </p>
                            )}
                        </>
                    )}

                </section>

                {/* SELLER CTA */}
                <section className="mx-4 mb-7 overflow-hidden rounded-xl border border-[#DCEBFA] bg-[#EDF6FF] p-4">

                    <div className="flex items-center justify-between gap-3">

                        <div className="min-w-0">
                            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#0877D9]">
                                Selling your car?
                            </span>

                            <h2 className="mt-2 text-[16px] font-bold leading-5 tracking-tight text-[#172337]">
                                Find your next buyer.
                            </h2>

                            <p className="mt-1.5 max-w-[210px] text-[10px] leading-5 text-[#64748B]">
                                List your vehicle and connect with interested buyers.
                            </p>

                            <Link
                                href="/sell"
                                className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0877D9] transition hover:gap-2.5"
                            >
                                Start selling
                                <ArrowRight size={13} />
                            </Link>
                        </div>

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-[#1491FF] shadow-sm">
                            <CarFront size={30} strokeWidth={1.5} />
                        </div>

                    </div>

                </section>

            </div>

            {/* FOOTER */}
            <footer className="border-t border-[#E8EDF4] bg-white px-4 pb-7 pt-5">

                <div className="flex items-center justify-between gap-3">

                    <div>
                        <p className="text-[11px] font-extrabold tracking-[0.13em] text-[#344256]">
                            KARMASS
                        </p>

                        <p className="mt-1 text-[10px] text-[#8491A3]">
                            Find your drive.
                        </p>
                    </div>

                    <Link
                        href="/marketplace"
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0877D9]"
                    >
                        Explore marketplace
                        <ArrowRight size={12} />
                    </Link>

                </div>

                <div className="mt-5 border-t border-[#F0F2F6] pt-4 text-[10px] text-[#9AA5B4]">
                    © <CurrentYear /> KARMASS. All rights reserved.
                </div>

            </footer>

            <HomeMobileNav />

        </main>
    );
}