"use client";

import Link from "next/link";
import {
    ArrowDownRight,
    ArrowRight,
    BadgeCheck,
    CarFront,
    ChevronRight,
    CircleDot,
    Fuel,
    Gauge,
    MapPin,
    RefreshCw,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    Sparkles,
    MoveUpRight,
} from "lucide-react";
import {
    useRef,
    type FormEvent,
    type ReactNode,
} from "react";

import { DesktopNavbar } from "./DesktopNavbar";
import PublicFooter from "./PublicFooter";

import type { MarketplaceHomeState } from "../MarketplaceHomeClient";
import type { MarketplaceSearchResult } from "@/app/types/user/marketplace.types";

/* =========================================================
   BRAND
========================================================= */

const BRAND_COLOR = "#1491FF";
const BRAND_HOVER = "#0877D9";
const BRAND_LIGHT = "#EAF5FF";

const categories = [
    { label: "SUVs", number: "01", query: "SUV" },
    { label: "Sedans", number: "02", query: "SEDAN" },
    { label: "Luxury", number: "03", query: "Luxury" },
    { label: "Electric", number: "04", query: "ELECTRIC" },
    { label: "Pickup trucks", number: "05", query: "TRUCK" },
];

const marketplaceSteps = [
    {
        number: "01",
        title: "Find your shortlist",
        description:
            "Explore cars that fit your lifestyle, priorities, and budget.",
        icon: Search,
    },
    {
        number: "02",
        title: "Make a closer comparison",
        description:
            "Look through the details and connect with the right seller.",
        icon: SlidersHorizontal,
    },
    {
        number: "03",
        title: "Get behind the wheel",
        description:
            "Take the next step toward a car that feels right for you.",
        icon: CarFront,
    },
];

/* =========================================================
   HELPERS
========================================================= */

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
            currency: currency || "NGN",
            maximumFractionDigits: 0,
        }).format(numericPrice);
    } catch {
        return `${currency || "NGN"} ${numericPrice.toLocaleString(
            "en-NG",
        )}`;
    }
}

function getVehicleTitle(
    result: MarketplaceSearchResult,
): string {
    const listingTitle = result.listing.title?.trim();

    if (listingTitle) {
        return listingTitle;
    }

    return [
        result.make?.name,
        result.model?.name,
        result.variant?.year,
    ]
        .filter(Boolean)
        .join(" ") || "Vehicle listing";
}

function getVehicleDetails(
    result: MarketplaceSearchResult,
): string {
    const details = [
        result.variant?.year
            ? String(result.variant.year)
            : undefined,
        result.variant?.fuelType,
        result.variant?.transmission,
    ].filter(
        (value): value is string =>
            typeof value === "string" &&
            value.trim().length > 0,
    );

    return [...new Set(details)].join(" · ");
}

function getVehicleLocation(
    result: MarketplaceSearchResult,
): string {
    return [
        result.listing.city,
        result.listing.state,
    ]
        .filter(
            (value): value is string =>
                typeof value === "string" &&
                value.trim().length > 0,
        )
        .join(", ");
}

function getVehicleImage(
    result: MarketplaceSearchResult,
): string | null {
    return (
        result.images?.[0]?.thumbnailUrl ||
        result.images?.[0]?.url ||
        null
    );
}

function getSellerName(
    result: MarketplaceSearchResult,
): string {
    if (result.dealer?.companyName?.trim()) {
        return result.dealer.companyName;
    }

    return result.seller?.displayName || "KARMASS seller";
}

/* =========================================================
   SECTION EYEBROW
========================================================= */

function SectionEyebrow({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="flex items-center gap-3">
            <span
                className="h-px w-8"
                style={{ backgroundColor: BRAND_COLOR }}
            />

            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                {children}
            </span>
        </div>
    );
}

/* =========================================================
   VEHICLE IMAGE
========================================================= */

function VehicleImage({
    result,
    title,
}: {
    result: MarketplaceSearchResult;
    title: string;
}) {
    const image = getVehicleImage(result);

    return (
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#F1F5F9]">
            {image ? (
                <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={image}
                        alt={title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
                </>
            ) : (
                <>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(20,145,255,0.12),transparent_60%)]" />

                    <div className="absolute inset-x-8 bottom-10 h-12 rounded-[50%] bg-slate-900/[0.045] blur-xl" />

                    <div className="relative flex flex-col items-center">
                        <CarFront
                            size={66}
                            strokeWidth={0.8}
                            className="text-slate-300 transition-all duration-700 group-hover:scale-110 group-hover:text-blue-400"
                            aria-hidden="true"
                        />

                        <span className="mt-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                            KARMASS
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}

/* =========================================================
   VEHICLE CARD
========================================================= */

function FeaturedVehicleCard({
    result,
    index,
}: {
    result: MarketplaceSearchResult;
    index: number;
}) {
    const title = getVehicleTitle(result);
    const details = getVehicleDetails(result);
    const location = getVehicleLocation(result);

    return (
        <Link
            href={`/marketplace/${result.listing.id}`}
            className="group relative flex h-full min-w-[290px] flex-col overflow-hidden rounded-[5px] border border-slate-200/80 bg-white transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_24px_65px_-32px_rgba(8,119,217,0.32)] sm:min-w-[320px]"
            style={{
                animationDelay: `${index * 90}ms`,
            }}
        >
            <div className="relative h-[225px] overflow-hidden bg-slate-100">
                <VehicleImage result={result} title={title} />

                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
                    <span className="border border-white/70 bg-white/85 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-slate-700 shadow-sm backdrop-blur-xl">
                        Available
                    </span>

                    {result.boostPriority > 0 && (
                        <span className="inline-flex items-center gap-1.5 border border-white/25 bg-slate-950/55 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white shadow-sm backdrop-blur-xl">
                            <Sparkles size={11} />
                            Featured
                        </span>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 pb-4">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/90">
                        KARMASS / {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/75 text-slate-700 backdrop-blur-md transition-all duration-300 group-hover:border-blue-500 group-hover:bg-blue-500 group-hover:text-white">
                        <ArrowDownRight
                            size={16}
                            className="transition-transform duration-300 group-hover:rotate-[-45deg]"
                        />
                    </span>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div>
                    <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        Vehicle for sale
                    </p>

                    <h3 className="line-clamp-2 min-h-[48px] text-[17px] font-semibold leading-6 tracking-[-0.035em] text-slate-900 transition-colors duration-300 group-hover:text-blue-700">
                        {title}
                    </h3>
                </div>

                {details && (
                    <p className="mt-2 text-[11px] font-medium tracking-wide text-slate-500">
                        {details}
                    </p>
                )}

                <div className="mt-4 flex min-h-5 items-center gap-2 text-[11px] text-slate-500">
                    {location ? (
                        <>
                            <MapPin
                                size={13}
                                className="shrink-0 text-slate-400"
                            />

                            <span className="truncate">
                                {location}
                            </span>
                        </>
                    ) : (
                        <span>Location not specified</span>
                    )}
                </div>

                <div className="mt-auto mt-5 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
                    <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                            Asking price
                        </p>

                        <p className="mt-1 truncate text-[19px] font-bold tracking-[-0.045em] text-slate-950">
                            {formatPrice(
                                result.listing.price,
                                result.listing.currency,
                            )}
                        </p>
                    </div>

                    {result.listing.mileage !== null &&
                        result.listing.mileage !== undefined && (
                            <div className="flex shrink-0 items-center gap-1.5 pb-1 text-[10px] font-medium text-slate-500">
                                <Gauge size={13} />

                                <span>
                                    {result.listing.mileage.toLocaleString(
                                        "en-NG",
                                    )}{" "}
                                    km
                                </span>
                            </div>
                        )}
                </div>
            </div>

            <div
                className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-500 group-hover:w-full"
                style={{ backgroundColor: BRAND_COLOR }}
            />
        </Link>
    );
}

/* =========================================================
   LATEST VEHICLE CARD
========================================================= */

function LatestVehicleCard({
    result,
    index,
}: {
    result: MarketplaceSearchResult;
    index: number;
}) {
    const title = getVehicleTitle(result);
    const details = getVehicleDetails(result);
    const location = getVehicleLocation(result);

    return (
        <Link
            href={`/marketplace/${result.listing.id}`}
            className="group relative flex h-full flex-col overflow-hidden rounded-[5px] border border-slate-200/80 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_20px_55px_-30px_rgba(8,119,217,0.3)]"
            style={{
                animationDelay: `${index * 60}ms`,
            }}
        >
            <div className="relative h-[215px] overflow-hidden bg-slate-100">
                <VehicleImage result={result} title={title} />

                <span className="absolute left-4 top-4 border border-white/70 bg-white/90 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-700 shadow-sm backdrop-blur-xl">
                    New arrival
                </span>

                {result.dealer?.verified && (
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 bg-blue-600 px-2.5 py-1.5 text-[9px] font-bold text-white shadow-sm">
                        <BadgeCheck size={12} />
                        Verified dealer
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col p-5">
                <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    {getSellerName(result)}
                </p>

                <h3 className="line-clamp-2 min-h-[48px] text-[16px] font-semibold leading-6 tracking-[-0.035em] text-slate-900 transition-colors group-hover:text-blue-700">
                    {title}
                </h3>

                {details && (
                    <p className="mt-2 text-[11px] font-medium text-slate-500">
                        {details}
                    </p>
                )}

                <div className="mt-4 flex min-h-5 items-center gap-2 text-[11px] text-slate-500">
                    <MapPin
                        size={13}
                        className="shrink-0 text-slate-400"
                    />

                    <span className="truncate">
                        {location || "Location not specified"}
                    </span>
                </div>

                <div className="mt-auto mt-5 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
                    <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                            Asking price
                        </p>

                        <p className="mt-1 truncate text-[19px] font-bold tracking-[-0.045em] text-slate-950">
                            {formatPrice(
                                result.listing.price,
                                result.listing.currency,
                            )}
                        </p>
                    </div>

                    {result.listing.mileage !== null &&
                        result.listing.mileage !== undefined && (
                            <div className="flex shrink-0 items-center gap-1.5 pb-1 text-[10px] font-medium text-slate-500">
                                <Gauge size={13} />

                                <span>
                                    {result.listing.mileage.toLocaleString(
                                        "en-NG",
                                    )}{" "}
                                    km
                                </span>
                            </div>
                        )}
                </div>
            </div>

            <div
                className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-500 group-hover:w-full"
                style={{ backgroundColor: BRAND_COLOR }}
            />
        </Link>
    );
}

/* =========================================================
   VEHICLE CARD SKELETON
========================================================= */

function VehicleCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-[5px] border border-slate-200 bg-white">
            <div className="h-[225px] animate-pulse bg-slate-100" />

            <div className="space-y-4 p-5">
                <div className="h-2 w-24 animate-pulse rounded bg-slate-100" />

                <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />

                <div className="h-3 w-2/5 animate-pulse rounded bg-slate-100" />

                <div className="mt-6 border-t border-slate-100 pt-4">
                    <div className="h-6 w-1/2 animate-pulse rounded bg-slate-200" />
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   DESKTOP HOME
========================================================= */

type DesktopHomeProps = {
    marketplace: MarketplaceHomeState;
};

export function DesktopHome({
    marketplace,
}: DesktopHomeProps) {
    const searchFormRef = useRef<HTMLFormElement>(null);

    const {
        // Search
        query,
        setQuery,
        submittedQuery,
        handleSearch,

        // Featured vehicles
        featuredVehicles,
        featuredLoading,
        featuredError,
        retryFeatured,

        // Ordinary marketplace results
        results,
        pagination,
        loading,
        error,
        retry,

        // Pagination
        hasMore,
        loadMore,
        loadingMore,
    } = marketplace;

    function handleCategorySearch(category: string) {
        const url = new URL(window.location.href);

        url.search = "";
        url.searchParams.set("q", category);

        window.location.assign(`${url.pathname}${url.search}`);
    }

    function handleSubmitSearch(
        event: FormEvent<HTMLFormElement>,
    ) {
        handleSearch(event);
    }

    const isSearching = Boolean(submittedQuery.trim());

    return (
        <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
            <style jsx global>{`
                @keyframes rise-in {
                    from {
                        opacity: 0;
                        transform: translateY(22px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slow-drift {
                    0%,
                    100% {
                        transform: translate3d(0, 0, 0);
                    }
                    50% {
                        transform: translate3d(0, -12px, 0);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    *,
                    *::before,
                    *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        scroll-behavior: auto !important;
                        transition-duration: 0.01ms !important;
                    }
                }

                html {
                    scroll-behavior: smooth;
                }

                ::selection {
                    background: #d6ebff;
                    color: #073b70;
                }
            `}</style>

            <DesktopNavbar />

            <main>
                {/* =================================================
                    HERO
                ================================================= */}

                <section className="relative isolate overflow-hidden bg-[#F7F9FC]">
                    <div
                        className="pointer-events-none absolute -right-48 -top-56 h-[650px] w-[650px] rounded-full blur-[100px]"
                        style={{
                            backgroundColor: "rgba(20,145,255,0.10)",
                        }}
                    />

                    <div className="pointer-events-none absolute -left-64 bottom-[-300px] h-[600px] w-[600px] rounded-full bg-blue-100/50 blur-[100px]" />

                    <div className="relative mx-auto max-w-[1500px] px-6 pb-16 pt-12 lg:px-16 lg:pb-24 lg:pt-16">
                        <div className="grid items-center gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-10">
                            <div className="relative z-10 motion-safe:animate-[rise-in_800ms_cubic-bezier(0.16,1,0.3,1)_both]">
                                <div className="flex items-center gap-3">
                                    <span
                                        className="h-[2px] w-8"
                                        style={{
                                            backgroundColor: BRAND_COLOR,
                                        }}
                                    />

                                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                                        The Nigerian car marketplace
                                    </p>
                                </div>

                                <h1 className="mt-7 max-w-[650px] text-[clamp(3.2rem,5.8vw,5.7rem)] font-semibold leading-[0.99] tracking-[-0.075em] text-slate-950">
                                    The right car.
                                    <br />

                                    <span className="relative inline-block">
                                        The{" "}
                                        <span
                                            className="relative z-10"
                                            style={{
                                                color: BRAND_COLOR,
                                            }}
                                        >
                                            right move.
                                        </span>

                                        <span
                                            className="absolute bottom-1 left-0 -z-0 h-[12%] w-full opacity-20"
                                            style={{
                                                backgroundColor: BRAND_COLOR,
                                            }}
                                        />
                                    </span>
                                </h1>

                                <p className="mt-7 max-w-[440px] text-[15px] leading-7 text-slate-600 sm:text-base sm:leading-8">
                                    Buying a car should feel exciting,
                                    not complicated. Explore vehicles,
                                    weigh your options, and find one
                                    that fits the way you live.
                                </p>

                                {/* Search */}

                                <form
                                    ref={searchFormRef}
                                    onSubmit={handleSubmitSearch}
                                    className="group/search mt-9 flex max-w-[540px] items-center gap-2 rounded-[5px] border border-slate-200/90 bg-white p-2 shadow-[0_15px_45px_-30px_rgba(15,23,42,0.28)] transition-all duration-300 focus-within:border-blue-300 focus-within:shadow-[0_15px_45px_-25px_rgba(20,145,255,0.25)] focus-within:ring-4 focus-within:ring-blue-100/60"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center text-slate-400 transition-colors group-focus-within/search:text-blue-500">
                                        <Search
                                            size={20}
                                            strokeWidth={1.7}
                                        />
                                    </div>

                                    <input
                                        value={query}
                                        onChange={(event) =>
                                            setQuery(event.target.value)
                                        }
                                        placeholder="Try Toyota Camry, Lexus RX..."
                                        aria-label="Search vehicles"
                                        className="min-w-0 flex-1 bg-transparent py-3 text-[13px] text-slate-900 outline-none placeholder:text-slate-400 sm:text-sm"
                                    />

                                    <button
                                        type="submit"
                                        className="group/button inline-flex shrink-0 items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-white transition-all duration-300 hover:brightness-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 sm:px-5 sm:text-sm"
                                        style={{
                                            backgroundColor: BRAND_COLOR,
                                        }}
                                    >
                                        Find a car

                                        <ArrowRight
                                            size={15}
                                            className="transition-transform duration-300 group-hover/button:translate-x-1"
                                        />
                                    </button>
                                </form>

                                {/* Categories */}

                                <div className="mt-7">
                                    <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                        Start with a category
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((category) => (
                                            <button
                                                key={category.label}
                                                type="button"
                                                onClick={() =>
                                                    handleCategorySearch(
                                                        category.query,
                                                    )
                                                }
                                                className="group/chip inline-flex items-center gap-2 border border-slate-200/90 bg-white/70 px-3.5 py-2.5 text-[11px] font-medium text-slate-600 backdrop-blur-sm transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                            >
                                                {category.label}

                                                <ArrowDownRight
                                                    size={12}
                                                    className="text-slate-300 transition-all duration-300 group-hover/chip:translate-x-0.5 group-hover/chip:translate-y-0.5 group-hover/chip:text-blue-500"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Trust row */}

                                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-200/80 pt-6">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck
                                            size={16}
                                            className="text-blue-600"
                                        />

                                        <span className="text-[11px] font-medium text-slate-600">
                                            Browse with confidence
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <BadgeCheck
                                            size={16}
                                            className="text-blue-600"
                                        />

                                        <span className="text-[11px] font-medium text-slate-600">
                                            Dealer profiles
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Hero visual */}

                            <div className="relative min-w-0 motion-safe:animate-[fade-in_1.2s_ease-out_both]">
                                <div className="relative min-h-[430px] overflow-hidden rounded-[4px] bg-slate-200 sm:min-h-[550px] lg:min-h-[620px]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1800&q=90"
                                        alt="Sports car on an open road"
                                        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[1600ms] ease-out hover:scale-[1.045]"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/5 to-slate-950/10" />

                                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/20 via-transparent to-transparent" />

                                    <div className="absolute left-5 top-5 flex items-center gap-3 rounded-[10px] border border-white/25 bg-slate-950/25 px-4 py-3 shadow-lg backdrop-blur-xl sm:left-7 sm:top-7">
                                        <span className="relative flex h-2 w-2">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-300 opacity-70" />

                                            <span
                                                className="relative inline-flex h-2 w-2 rounded-full"
                                                style={{
                                                    backgroundColor: BRAND_COLOR,
                                                }}
                                            />
                                        </span>

                                        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white sm:text-[10px]">
                                            A different way to find your car
                                        </span>
                                    </div>

                                    <div className="absolute right-5 top-6 text-right sm:right-7 sm:top-7">
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/65">
                                            Discover
                                        </p>

                                        <p className="mt-1 text-xs font-medium text-white">
                                            Your next chapter
                                        </p>
                                    </div>

                                    <div className="absolute bottom-5 left-5 right-5 rounded-[10px] border border-white/25 bg-slate-950/35 p-5 shadow-2xl backdrop-blur-xl sm:bottom-7 sm:left-7 sm:right-7 sm:p-7">
                                        <div className="flex items-end justify-between gap-5">
                                            <div className="max-w-md">
                                                <p className="text-[9px] font-bold uppercase tracking-[0.23em] text-blue-200">
                                                    Make the road yours
                                                </p>

                                                <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.045em] text-white sm:text-4xl">
                                                    Every great drive
                                                    starts somewhere.
                                                </h2>

                                                <p className="mt-3 max-w-sm text-xs leading-6 text-white/70 sm:text-sm">
                                                    Your next car is out there.
                                                    Let&apos;s help you find it.
                                                </p>
                                            </div>

                                            <Link
                                                href="#latest-vehicles"
                                                aria-label="Explore all vehicles"
                                                className="group/explore flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border border-white/30 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:border-blue-400 hover:bg-blue-500 sm:h-14 sm:w-14"
                                            >
                                                <MoveUpRight
                                                    size={22}
                                                    className="transition-transform duration-300 group-hover/explore:translate-x-0.5 group-hover/explore:-translate-y-0.5"
                                                />
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                <div className="pointer-events-none absolute -bottom-3 -right-3 -z-10 h-2/3 w-2/3 border border-blue-200/70" />

                                <div className="absolute -left-5 top-[35%] hidden rounded-[10px] border border-white/80 bg-white/70 px-4 py-3 shadow-[0_10px_35px_-15px_rgba(15,23,42,0.2)] backdrop-blur-xl motion-safe:animate-[slow-drift_6s_ease-in-out_infinite] xl:block">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="flex h-9 w-9 items-center justify-center"
                                            style={{
                                                backgroundColor: BRAND_LIGHT,
                                                color: BRAND_HOVER,
                                            }}
                                        >
                                            <CarFront size={18} />
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-bold text-slate-900">
                                                Your next car
                                            </p>

                                            <p className="mt-0.5 text-[9px] text-slate-500">
                                                Starts with a search
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Editorial strip */}

                        <div className="mt-12 grid grid-cols-1 border-y border-slate-200/80 sm:grid-cols-3">
                            <div className="flex items-center justify-between gap-4 py-5 sm:pr-8">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                        Explore
                                    </p>

                                    <p className="mt-1.5 text-sm font-semibold text-slate-800">
                                        Vehicles for different lifestyles
                                    </p>
                                </div>

                                <CircleDot
                                    size={17}
                                    className="shrink-0 text-blue-500"
                                />
                            </div>

                            <div className="flex items-center justify-between gap-4 border-slate-200/80 py-5 sm:border-l sm:px-8">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                        Compare
                                    </p>

                                    <p className="mt-1.5 text-sm font-semibold text-slate-800">
                                        Make an informed choice
                                    </p>
                                </div>

                                <SlidersHorizontal
                                    size={17}
                                    className="shrink-0 text-blue-500"
                                />
                            </div>

                            <div className="flex items-center justify-between gap-4 border-slate-200/80 py-5 sm:border-l sm:pl-8">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                        Connect
                                    </p>

                                    <p className="mt-1.5 text-sm font-semibold text-slate-800">
                                        Find the right seller
                                    </p>
                                </div>

                                <ArrowRight
                                    size={17}
                                    className="shrink-0 text-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* =================================================
                    HOW IT WORKS
                ================================================= */}

                <section className="border-b border-slate-200 bg-white">
                    <div className="mx-auto max-w-[1500px] px-6 py-16 lg:px-16 lg:py-20">
                        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
                            <div>
                                <SectionEyebrow>
                                    Simple by design
                                </SectionEyebrow>

                                <h2 className="mt-5 max-w-sm text-3xl font-semibold leading-[1.12] tracking-[-0.055em] text-slate-950 sm:text-4xl">
                                    Less searching.
                                    <br />
                                    More certainty.
                                </h2>

                                <p className="mt-5 max-w-sm text-sm leading-7 text-slate-500">
                                    Finding a car doesn&apos;t need to
                                    be a project. We make it easier to
                                    move from browsing to your next drive.
                                </p>
                            </div>

                            <div className="grid gap-0 sm:grid-cols-3">
                                {marketplaceSteps.map((step, index) => {
                                    const StepIcon = step.icon;

                                    return (
                                        <div
                                            key={step.number}
                                            className={`group relative border-t border-slate-200 py-6 transition-colors duration-300 hover:border-blue-400 sm:px-5 sm:py-5 ${
                                                index === 0
                                                    ? "sm:pl-0"
                                                    : "sm:border-l sm:border-t-0"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className="text-xs font-bold tracking-[0.12em]"
                                                    style={{
                                                        color: BRAND_COLOR,
                                                    }}
                                                >
                                                    {step.number}
                                                </span>

                                                <StepIcon
                                                    size={19}
                                                    strokeWidth={1.5}
                                                    className="text-slate-400 transition-colors duration-300 group-hover:text-blue-500"
                                                />
                                            </div>

                                            <h3 className="mt-7 text-sm font-semibold text-slate-900">
                                                {step.title}
                                            </h3>

                                            <p className="mt-3 text-xs leading-6 text-slate-500">
                                                {step.description}
                                            </p>

                                            <div className="mt-5 h-px w-0 bg-blue-500 transition-all duration-500 group-hover:w-full" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* =================================================
                    FEATURED VEHICLES
                ================================================= */}

                <section
                    id="featured-vehicles"
                    className="relative overflow-hidden bg-[#F7F9FC]"
                >
                    <div className="pointer-events-none absolute -right-48 top-40 h-[500px] w-[500px] rounded-full bg-blue-100/50 blur-[110px]" />

                    <div className="relative mx-auto max-w-[1500px] px-6 py-16 lg:px-16 lg:py-20">
                        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                            <div>
                                <SectionEyebrow>
                                    Selected for more visibility
                                </SectionEyebrow>

                                <div className="mt-5 flex items-center gap-3">
                                    <h2 className="text-3xl font-semibold leading-tight tracking-[-0.06em] text-slate-950 sm:text-5xl">
                                        Featured vehicles.
                                    </h2>

                                    <span className="hidden items-center gap-1.5 bg-blue-50 px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-blue-700 sm:inline-flex">
                                        <Sparkles size={12} />
                                        Promoted
                                    </span>
                                </div>

                                <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500">
                                    Discover vehicles currently receiving
                                    extra visibility from sellers on KARMASS.
                                </p>
                            </div>

                            <Link
                                href="#latest-vehicles"
                                className="group inline-flex w-fit items-center gap-3 border-b border-slate-300 pb-2 text-xs font-semibold text-slate-800 transition-colors duration-300 hover:border-blue-500 hover:text-blue-700"
                            >
                                Explore all vehicles

                                <ArrowRight
                                    size={15}
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </Link>
                        </div>

                        {featuredLoading ? (
                            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <VehicleCardSkeleton key={index} />
                                ))}
                            </div>
                        ) : featuredError ? (
                            <div
                                role="alert"
                                className="border border-red-100 bg-white px-6 py-14 text-center"
                            >
                                <div className="mx-auto flex h-12 w-12 items-center justify-center bg-red-50 text-red-500">
                                    <RefreshCw size={21} />
                                </div>

                                <h3 className="mt-5 text-base font-semibold text-slate-900">
                                    Featured vehicles couldn&apos;t load.
                                </h3>

                                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                                    {featuredError}
                                </p>

                                <button
                                    type="button"
                                    onClick={retryFeatured}
                                    className="mt-6 inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold text-white transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                                    style={{
                                        backgroundColor: BRAND_COLOR,
                                    }}
                                >
                                    <RefreshCw size={14} />
                                    Try again
                                </button>
                            </div>
                        ) : featuredVehicles.length === 0 ? (
                            <div className="border border-slate-200 bg-white px-6 py-16 text-center">
                                <div
                                    className="mx-auto flex h-14 w-14 items-center justify-center"
                                    style={{
                                        backgroundColor: BRAND_LIGHT,
                                        color: BRAND_COLOR,
                                    }}
                                >
                                    <CarFront
                                        size={27}
                                        strokeWidth={1.4}
                                    />
                                </div>

                                <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">
                                    Featured vehicles are on their way.
                                </h3>

                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                    There are no actively promoted vehicles
                                    right now. Browse the latest listings
                                    below to find your next car.
                                </p>

                                <Link
                                    href="#latest-vehicles"
                                    className="mt-6 inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold text-white transition hover:brightness-95"
                                    style={{
                                        backgroundColor: BRAND_COLOR,
                                    }}
                                >
                                    Browse latest vehicles
                                    <ArrowRight size={15} />
                                </Link>
                            </div>
                        ) : (
                            <div className="-mx-2 flex snap-x snap-mandatory gap-5 overflow-x-auto px-2 pb-6 [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent]">
                                {featuredVehicles.map((result, index) => (
                                    <div
                                        key={result.listing.id}
                                        className="w-[calc(33.333%-14px)] min-w-[290px] shrink-0 snap-start sm:min-w-[320px] lg:min-w-[calc(33.333%-14px)]"
                                    >
                                        <FeaturedVehicleCard
                                            result={result}
                                            index={index}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* =================================================
                    LATEST VEHICLES / SEARCH RESULTS
                ================================================= */}

                <section
                    id="latest-vehicles"
                    className="relative overflow-hidden bg-white"
                >
                    <div className="mx-auto max-w-[1500px] px-6 py-16 lg:px-16 lg:py-24">
                        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                            <div>
                                <SectionEyebrow>
                                    {isSearching
                                        ? "Your search"
                                        : "The latest arrivals"}
                                </SectionEyebrow>

                                <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.06em] text-slate-950 sm:text-5xl">
                                    {isSearching
                                        ? "Search results."
                                        : "Fresh on KARMASS."}
                                </h2>

                                <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500">
                                    {isSearching
                                        ? `Vehicles matching "${submittedQuery}". Refine your search to find exactly what you're looking for.`
                                        : "Explore the newest ordinary listings added to KARMASS. Your next favourite might be right here."}
                                </p>
                            </div>

                            {isSearching && (
                                <button
                                    type="button"
                                    onClick={() => marketplace.clearFilters()}
                                    className="group inline-flex w-fit items-center gap-2 border-b border-slate-300 pb-2 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-500 hover:text-blue-700"
                                >
                                    Clear search
                                    <RefreshCw
                                        size={13}
                                        className="transition-transform group-hover:rotate-[-45deg]"
                                    />
                                </button>
                            )}
                        </div>

                        {/* Result count */}
                        {!loading && !error && pagination && (
                            <div className="mb-6 flex flex-col gap-3 border-y border-slate-100 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-slate-500">
                                    Showing{" "}
                                    <span className="font-semibold text-slate-900">
                                        {results.length}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-semibold text-slate-900">
                                        {pagination.total}
                                    </span>{" "}
                                    vehicles
                                </p>

                                <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                    <CircleDot
                                        size={12}
                                        className="text-blue-500"
                                    />

                                    {submittedQuery.trim()
                                        ? "Search results"
                                        : "Latest listings"}
                                </span>
                            </div>
                        )}
                        
                        {loading && results.length === 0 ? (
                            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <VehicleCardSkeleton key={index} />
                                ))}
                            </div>
                        ) : error && results.length === 0 ? (
                            <div
                                role="alert"
                                className="border border-red-100 bg-white px-6 py-14 text-center"
                            >
                                <div className="mx-auto flex h-12 w-12 items-center justify-center bg-red-50 text-red-500">
                                    <RefreshCw size={21} />
                                </div>

                                <h3 className="mt-5 text-base font-semibold text-slate-900">
                                    The listings haven&apos;t loaded.
                                </h3>

                                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    onClick={retry}
                                    className="mt-6 inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold text-white transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                                    style={{
                                        backgroundColor: BRAND_COLOR,
                                    }}
                                >
                                    <RefreshCw size={14} />
                                    Try again
                                </button>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="border border-slate-200 bg-[#F8FAFC] px-6 py-16 text-center">
                                <div
                                    className="mx-auto flex h-14 w-14 items-center justify-center"
                                    style={{
                                        backgroundColor: BRAND_LIGHT,
                                        color: BRAND_COLOR,
                                    }}
                                >
                                    <Search
                                        size={25}
                                        strokeWidth={1.5}
                                    />
                                </div>

                                <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">
                                    {isSearching
                                        ? "No matching vehicles found."
                                        : "No vehicles available just yet."}
                                </h3>

                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                    {isSearching
                                        ? "Try another search term or clear your filters to explore more vehicles."
                                        : "New vehicles are added regularly. Please check back soon."}
                                </p>

                                {isSearching && (
                                    <button
                                        type="button"
                                        onClick={() => marketplace.clearFilters()}
                                        className="mt-6 inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold text-white transition hover:brightness-95"
                                        style={{
                                            backgroundColor: BRAND_COLOR,
                                        }}
                                    >
                                        Clear search
                                        <ArrowRight size={15} />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                    {results.map((result, index) => (
                                        <LatestVehicleCard
                                            key={result.listing.id}
                                            result={result}
                                            index={index}
                                        />
                                    ))}
                                </div>

                                {/* Subsequent page error */}

                                {error && results.length > 0 && (
                                    <div
                                        role="alert"
                                        className="mt-8 flex flex-col items-center gap-3 border border-red-100 bg-red-50/60 px-5 py-5 text-center sm:flex-row sm:justify-between sm:text-left"
                                    >
                                        <p className="text-xs text-red-700">
                                            We couldn&apos;t load more vehicles.
                                            Your existing listings are still available.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={retry}
                                            className="inline-flex shrink-0 items-center gap-2 bg-white px-4 py-2.5 text-xs font-semibold text-red-700 ring-1 ring-red-200 transition hover:bg-red-50"
                                        >
                                            <RefreshCw size={13} />
                                            Try again
                                        </button>
                                    </div>
                                )}

                                {/* Load more */}

                                {hasMore && (
                                    <div className="mt-12 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={loadMore}
                                            disabled={loadingMore || loading}
                                            className="group inline-flex min-w-[190px] items-center justify-center gap-3 border border-slate-200 bg-white px-7 py-4 text-xs font-semibold text-slate-800 transition-all duration-300 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {loadingMore ? (
                                                <>
                                                    <RefreshCw
                                                        size={15}
                                                        className="animate-spin"
                                                    />
                                                    Loading vehicles...
                                                </>
                                            ) : (
                                                <>
                                                    Load more vehicles
                                                    <ArrowDownRight
                                                        size={15}
                                                        className="transition-transform duration-300 group-hover:translate-y-1"
                                                    />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {!hasMore && results.length > 0 && (
                                    <p className="mt-10 text-center text-[11px] font-medium text-slate-400">
                                        You&apos;ve reached the end of the listings.
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </section>

                {/* =================================================
                    SELLER CTA
                ================================================= */}

                <section className="bg-white px-6 pb-16 lg:px-16 lg:pb-24">
                    <div className="relative mx-auto max-w-[1500px] overflow-hidden bg-[#071B33]">
                        <div
                            className="pointer-events-none absolute -right-20 -top-48 h-[450px] w-[450px] rounded-full blur-[100px]"
                            style={{
                                backgroundColor: "rgba(20,145,255,0.25)",
                            }}
                        />

                        <div className="pointer-events-none absolute -bottom-40 left-[25%] h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[80px]" />

                        <div
                            className="pointer-events-none absolute inset-0 opacity-[0.07]"
                            style={{
                                backgroundImage:
                                    "linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)",
                                backgroundSize: "44px 44px",
                            }}
                        />

                        <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16 lg:p-14">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 border border-white/15 bg-white/[0.06] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.19em] text-blue-200 backdrop-blur-xl">
                                    <CarFront size={14} />
                                    For car owners and dealers
                                </div>

                                <h2 className="mt-6 text-3xl font-semibold leading-[1.08] tracking-[-0.06em] text-white sm:text-5xl">
                                    Your car has a buyer.
                                    <br />
                                    Let them find it.
                                </h2>

                                <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">
                                    Put your vehicle in front of people
                                    who are actively looking. Create a
                                    listing and take the first step
                                    toward your next sale.
                                </p>
                            </div>

                            <div className="flex flex-col items-start gap-4 lg:items-end">
                                <Link
                                    href="/login"
                                    className="group inline-flex items-center gap-4 bg-[#1491FF] px-6 py-4 text-xs font-semibold text-white shadow-[0_10px_35px_-12px_rgba(20,145,255,0.65)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#0877D9] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/40"
                                >
                                    List your vehicle

                                    <span className="flex h-7 w-7 items-center justify-center border border-white/30 transition-transform duration-300 group-hover:translate-x-1">
                                        <ArrowRight size={15} />
                                    </span>
                                </Link>

                                <p className="text-[10px] text-slate-400">
                                    Start your next sale on KARMASS
                                </p>
                            </div>
                        </div>

                        <div className="relative flex items-center justify-between border-t border-white/10 px-7 py-4 sm:px-10 lg:px-14">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                Make your next move
                            </p>

                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 text-[10px] font-medium text-blue-300 transition-colors hover:text-white"
                            >
                                Start here
                                <ChevronRight size={13} />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* =================================================
                    FINAL DISCOVERY STRIP
                ================================================= */}

                <section className="border-t border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-16">
                        <div className="flex items-center gap-3">
                            <div
                                className="flex h-10 w-10 items-center justify-center"
                                style={{
                                    backgroundColor: BRAND_LIGHT,
                                    color: BRAND_HOVER,
                                }}
                            >
                                <Search size={18} />
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-slate-900">
                                    Still deciding?
                                </p>

                                <p className="mt-1 text-[11px] text-slate-500">
                                    Browse the full collection at your own pace.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="#latest-vehicles"
                            className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-700 transition-colors hover:text-blue-700"
                        >
                            Explore the latest vehicles

                            <ArrowRight
                                size={15}
                                className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                        </Link>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}