"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import {
    BadgeCheck,
    CarFront,
    Heart,
    MapPin,
    Zap,
} from "lucide-react";

import {
    formatPrice,
    getListingTitle,
    getLocation,
} from "@/app/lib/user/marketplace/marketplace-format";

import type {
    MarketplaceSearchResult,
} from "@/app/types/user/marketplace.types";

function ListingImagePlaceholder() {
    return (
        <div className="flex h-full w-full items-center justify-center bg-slate-100">
            <CarFront
                size={42}
                strokeWidth={1.2}
                className="text-slate-300"
            />
        </div>
    );
}

export function MarketplaceListingSkeleton() {
    return (
        <article
            aria-label="Loading vehicle listing"
            aria-busy="true"
            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
            <div className="aspect-[16/10] animate-pulse bg-slate-100" />

            <div className="space-y-3 p-3.5 sm:p-4">
                <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
                <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
            </div>
        </article>
    );
}

function formatCondition(condition?: string | null): string | null {
    if (!condition) return null;

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
    const location = getLocation(result);

    const isFeatured = result.boostPriority > 0;

    const [imageIndex, setImageIndex] = useState(0);

    // Try every available image field before displaying the placeholder.
    const imageSources = Array.from(
        new Set(
            (result.images ?? [])
                .flatMap((image) => [
                    image.thumbnailUrl,
                    image.url,
                    image.detailUrl,
                ])
                .filter(
                    (url): url is string =>
                        typeof url === "string" && url.trim().length > 0,
                ),
        ),
    );

    const currentImage = imageSources[imageIndex];

    const condition = formatCondition(listing.condition);

    const isVerifiedDealer =
        Boolean(result.dealer?.companyName) &&
        result.dealer?.verified === true;

    const hasImages = imageSources.length > 0;

    return (
        <Link
            href={`/marketplace/${listing.id}`}
            aria-label={`View ${title}`}
            className="group block min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-200 hover:border-[#1491FF]/50 hover:shadow-md hover:shadow-slate-900/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1491FF] focus-visible:ring-offset-2"
        >
            {/* Vehicle image */}
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                {currentImage ? (
                    <Image
                        key={currentImage}
                        src={currentImage}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        unoptimized
                        onError={() => {
                            setImageIndex((current) =>
                                current < imageSources.length - 1
                                    ? current + 1
                                    : imageSources.length,
                            );
                        }}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                ) : (
                    <ListingImagePlaceholder />
                )}

                {/* Featured badge */}
                {isFeatured && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-white/95 px-2.5 py-1.5 text-[10px] font-semibold text-amber-700 shadow-sm backdrop-blur-sm">
                        <Zap size={12} fill="currentColor" />
                        Featured
                    </span>
                )}

                {/* Photo count */}
                {result.images && result.images.length > 1 && (
                    <span className="absolute bottom-3 right-3 rounded-md bg-black/65 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                        {result.images.length} photos
                    </span>
                )}

                {/* Favorite visual */}
                <span
                    aria-hidden="true"
                    className="absolute right-3 top-3 grid size-9 place-items-center rounded-full border border-slate-200/70 bg-white/95 text-slate-500 shadow-sm transition-colors group-hover:text-[#1491FF]"
                >
                    <Heart size={17} strokeWidth={1.8} />
                </span>
            </div>

            {/* Essential vehicle information */}
            <div className="p-3.5 sm:p-4">
                {/* Vehicle name and verification */}
                <div className="flex min-w-0 items-start justify-between gap-2">
                    <h2 className="line-clamp-2 min-w-0 text-sm font-semibold leading-5 text-slate-900 transition-colors group-hover:text-[#0876D1] sm:text-[15px]">
                        {title}
                    </h2>

                    {isVerifiedDealer && (
                        <BadgeCheck
                            size={17}
                            className="mt-0.5 shrink-0 text-[#1491FF]"
                            aria-label="Verified dealer"
                        />
                    )}
                </div>

                {/* Price */}
                <p className="mt-2 text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
                    {formatPrice(listing.price, listing.currency)}
                </p>

                {/* Location and condition */}
                <div className="mt-3 flex min-w-0 items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <div className="flex min-w-0 items-center gap-1.5">
                        <MapPin
                            size={14}
                            className="shrink-0 text-slate-400"
                            aria-hidden="true"
                        />

                        <span className="truncate text-xs text-slate-500">
                            {location || "Location not specified"}
                        </span>
                    </div>

                    {condition && (
                        <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                            {condition}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}