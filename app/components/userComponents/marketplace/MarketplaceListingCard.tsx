import Link from "next/link";

import {
    ArrowRight,
    CarFront,
    Heart,
    MapPin,
    Zap,
} from "lucide-react";

import {
    formatPrice,
    getListingTitle,
    getLocation,
    getVehicleDetails,
} from "@/app/lib/user/marketplace/marketplace-format";

import type {
    MarketplaceSearchResult,
} from "@/app/types/user/marketplace.types";

function ListingImagePlaceholder() {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 text-slate-400">
            <div className="grid size-16 place-items-center rounded-2xl border border-white/80 bg-white/70 shadow-sm">
                <CarFront
                    size={34}
                    strokeWidth={1.4}
                    className="text-slate-400"
                />
            </div>

            <span className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                KARMASS
            </span>

            <span className="mt-1 text-xs text-slate-400">
                Photo coming soon
            </span>
        </div>
    );
}

export function MarketplaceListingSkeleton() {
    return (
        <article
            aria-label="Loading vehicle listing"
            aria-busy="true"
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
            <div className="relative aspect-[16/10] animate-pulse bg-slate-100">
                <div className="absolute left-3 top-3 h-7 w-20 rounded-full bg-slate-200" />
                <div className="absolute right-3 top-3 size-9 rounded-full bg-slate-200" />
            </div>

            <div className="space-y-4 p-4 sm:p-5">
                <div className="space-y-2">
                    <div className="h-4 w-4/5 animate-pulse rounded-md bg-slate-200" />
                    <div className="h-3 w-2/5 animate-pulse rounded-md bg-slate-100" />
                </div>

                <div className="h-7 w-3/5 animate-pulse rounded-md bg-slate-200" />

                <div className="flex gap-2">
                    <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
                    <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
                </div>

                <div className="h-4 w-3/4 animate-pulse rounded-md bg-slate-100" />

                <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
            </div>
        </article>
    );
}

function formatCondition(condition: string): string {
    return condition
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function MarketplaceListingCard({
    result,
}: {
    result: MarketplaceSearchResult;
}) {
    const listing = result.listing;
    const title = getListingTitle(result);
    const details = getVehicleDetails(result);
    const location = getLocation(result);
    const isFeatured = result.boostPriority > 0;

    return (
        <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#1491FF]/40 hover:shadow-lg hover:shadow-slate-900/[0.06]">
            {/* Vehicle image */}
            <Link
                href={`/marketplace/${listing.id}`}
                aria-label={`View ${title}`}
                className="relative block aspect-[16/10] overflow-hidden bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#1491FF]/30"
            >
                <ListingImagePlaceholder />

                {/* Featured listing badge */}
                {isFeatured && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-200/80 bg-white/95 px-2.5 py-1.5 text-[11px] font-bold text-amber-800 shadow-sm backdrop-blur-sm">
                        <Zap
                            size={13}
                            fill="currentColor"
                            aria-hidden="true"
                        />
                        Featured
                    </span>
                )}

                {/* Favorite button is intentionally disabled until favorites are implemented */}
                <button
                    type="button"
                    aria-label={`Save ${title}`}
                    title="Favorites are not available yet"
                    disabled
                    onClick={(event) => event.preventDefault()}
                    className="absolute right-3 top-3 grid size-10 cursor-not-allowed place-items-center rounded-full border border-slate-200/70 bg-white/95 text-slate-400 shadow-sm backdrop-blur-sm"
                >
                    <Heart size={18} strokeWidth={1.8} />
                </button>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/10 to-transparent" />
            </Link>

            {/* Listing details */}
            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="min-w-0">
                    <Link
                        href={`/marketplace/${listing.id}`}
                        className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1491FF]/40"
                    >
                        <h2 className="line-clamp-2 min-h-[2.75rem] text-[15px] font-semibold leading-[1.4] tracking-tight text-slate-900 transition-colors group-hover:text-[#0876D1] sm:text-base">
                            {title}
                        </h2>
                    </Link>

                    {details.length > 0 && (
                        <p className="mt-2 line-clamp-1 text-xs leading-5 text-slate-500">
                            {details.join(" · ")}
                        </p>
                    )}
                </div>

                {/* Price */}
                <div className="mt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Asking price
                    </p>

                    <p className="mt-1 break-words text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                        {formatPrice(listing.price, listing.currency)}
                    </p>
                </div>

                {/* Condition */}
                <div className="mt-3 flex min-h-7 flex-wrap items-center gap-2">
                    {listing.condition ? (
                        <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 sm:text-[11px]">
                            {formatCondition(listing.condition)}
                        </span>
                    ) : (
                        <span className="text-xs text-slate-400">
                            Condition not specified
                        </span>
                    )}
                </div>

                {/* Location */}
                <div className="mt-4 flex min-w-0 items-center gap-2 border-t border-slate-100 pt-3.5">
                    <MapPin
                        size={15}
                        aria-hidden="true"
                        className="shrink-0 text-[#1491FF]"
                    />

                    <span
                        title={location}
                        className="truncate text-xs text-slate-500 sm:text-[13px]"
                    >
                        {location || "Location not specified"}
                    </span>
                </div>

                {/* Action */}
                <Link
                    href={`/marketplace/${listing.id}`}
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-xl bg-[#1491FF] px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-[#1491FF]/15 transition duration-200 hover:bg-[#0876D1] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1491FF]/20"
                >
                    <span>View vehicle</span>

                    <ArrowRight
                        size={17}
                        aria-hidden="true"
                        className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                </Link>
            </div>
        </article>
    );
}