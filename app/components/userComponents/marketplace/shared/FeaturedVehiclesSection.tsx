
"use client";

import Image from "next/image";
import Link from "next/link";

import {
    ArrowRight,
    CarFront,
    MapPin,
} from "lucide-react";

import type {
    MarketplaceSearchResult,
} from "@/app/types/user/marketplace.types";

type FeaturedVehiclesSectionProps = {
    vehicles: MarketplaceSearchResult[];
    loading: boolean;
    error: string;
    onRetry: () => void;
    variant?: "desktop" | "mobile";
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatPrice(
    price: string | number,
    currency: string,
): string {
    const amount =
        typeof price === "number" ? price : Number(price);

    if (!Number.isFinite(amount)) {
        return "Price on request";
    }

    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: currency || "NGN",
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${currency || "NGN"} ${amount.toLocaleString("en-NG")}`;
    }
}

function getTitle(result: MarketplaceSearchResult) {
    return (
        result.listing.title?.trim() ||
        [
            result.make?.name,
            result.model?.name,
            result.variant?.year,
        ]
            .filter(Boolean)
            .join(" ") ||
        "Vehicle listing"
    );
}

function getImage(result: MarketplaceSearchResult) {
    return (
        result.images?.[0]?.thumbnailUrl ||
        result.images?.[0]?.url ||
        result.images?.[0]?.detailUrl ||
        null
    );
}

function getLocation(result: MarketplaceSearchResult) {
    return [
        result.listing.city,
        result.listing.state,
    ]
        .filter(Boolean)
        .join(", ") || "Location not specified";
}

/*
|--------------------------------------------------------------------------
| LOADING CARD
|--------------------------------------------------------------------------
*/

function FeaturedVehicleSkeleton({
    mobile,
}: {
    mobile: boolean;
}) {
    return (
        <div
            className={
                mobile
                    ? "w-full overflow-hidden rounded-2xl border border-slate-200 bg-white"
                    : "w-[266px] overflow-hidden rounded-2xl border border-slate-200 bg-white"
            }
        >
            <div className="aspect-[4/3] animate-pulse bg-slate-100 sm:aspect-[16/10]" />

            <div className="space-y-3 p-4 sm:p-5">
                <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
                <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| FEATURED VEHICLE CARD
|--------------------------------------------------------------------------
*/

function FeaturedVehicleCard({
    vehicle,
    mobile,
}: {
    vehicle: MarketplaceSearchResult;
    mobile: boolean;
}) {
    const title = getTitle(vehicle);
    const image = getImage(vehicle);

    return (
        <Link
            href={`/marketplace/${vehicle.listing.id}`}
            aria-label={`View sponsored vehicle: ${title}`}
            className={
                mobile
                    ? "group w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:border-[#1491FF]/40 hover:shadow-lg"
                    : "group w-[266px] min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#1491FF]/40 hover:shadow-xl hover:shadow-blue-900/[0.07]"
            }
        >
            {/* VEHICLE IMAGE */}

            <div className="relative aspect-[4/3] overflow-hidden bg-slate-50 sm:aspect-[16/10]">
                {image ? (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        sizes={
                            mobile
                        ? "(max-width: 640px) 100vw, 400px"
                                : "(max-width: 768px) 100vw, 400px"
                        }
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EDF6FF] to-[#DCEEFF]">
                        <CarFront
                            size={48}
                            strokeWidth={1.2}
                            className="text-[#1491FF]/60"
                        />
                    </div>
                )}

            </div>

            {/* VEHICLE INFORMATION */}

            <div className="p-4 sm:p-5">
                <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#0876D1]">
                    <span className="size-1.5 rounded-full bg-[#0876D1]" />
                    Boosted
                </div>

                <h3 className="line-clamp-2 min-h-[40px] text-sm font-semibold leading-5 text-slate-900 transition-colors group-hover:text-[#0876D1]">
                    {title}
                </h3>

                <p className="mt-2 text-lg font-bold tracking-tight text-slate-950">
                    {formatPrice(
                        vehicle.listing.price,
                        vehicle.listing.currency,
                    )}
                </p>

                <div className="mt-3 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                    <MapPin
                        size={13}
                        className="shrink-0 text-slate-400"
                    />

                    <span className="truncate">
                        {getLocation(vehicle)}
                    </span>
                </div>
            </div>
        </Link>
    );
}

/*
|--------------------------------------------------------------------------
| FEATURED VEHICLES SECTION
|--------------------------------------------------------------------------
*/

export function FeaturedVehiclesSection({
    vehicles,
    loading,
    error,
    onRetry,
    variant = "desktop",
}: FeaturedVehiclesSectionProps) {
    const mobile = variant === "mobile";

    // Do not render an empty section.
    if (!loading && !error && vehicles.length === 0) {
        return null;
    }

    return (
        <section
            id="featured-vehicles"
            className={
                mobile
                    ? "overflow-hidden bg-white py-6"
                    : "relative overflow-hidden border-y border-slate-100 bg-[#F7F9FC] py-12 lg:py-16"
            }
        >
            <div
                className={
                    mobile
                        ? "px-4"
                        : "mx-auto max-w-[1500px] px-6 lg:px-12"
                }
            >
                {/* SECTION HEADER */}

                <div className="flex items-end justify-between gap-4">

                    <div className="min-w-0">

                        {/* EYEBROW */}

                        {/* TITLE */}

                        <h2
                            className={
                                mobile
                                    ? "text-lg font-semibold tracking-tight text-slate-900"
                                    : "text-2xl font-semibold tracking-tight text-slate-900 lg:text-[28px]"
                            }
                        >
                            Boosted vehicles
                        </h2>

                        {/* DESCRIPTION */}

                        <p
                            className={
                                mobile
                                    ? "mt-1 max-w-[300px] text-xs leading-5 text-slate-500"
                                    : "mt-2 text-sm leading-6 text-slate-500"
                            }
                        >
                            Sellers pay to give these vehicles extra visibility.
                        </p>
                    </div>

                </div>

                {/* LOADING */}

                {loading && (
                    <div
                        className={
                            mobile
                                ? "mt-5 flex flex-col gap-4"
                                : "mt-7 grid grid-cols-[repeat(auto-fill,minmax(min(100%,266px),266px))] gap-5"
                        }
                    >
                        {Array.from({ length: 3 }).map((_, index) => (
                            <FeaturedVehicleSkeleton
                                key={index}
                                mobile={mobile}
                            />
                        ))}
                    </div>
                )}

                {/* ERROR */}

                {!loading && error && (
                    <div className="mt-5 rounded-2xl border border-red-100 bg-white p-5 sm:p-7">
                        <h3 className="text-sm font-bold text-slate-800">
                            We couldn't load promoted vehicles.
                        </h3>

                        <p className="mt-2 text-xs leading-5 text-slate-500">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={onRetry}
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1491FF] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#0876D1]"
                        >
                            Try again
                            <ArrowRight size={14} />
                        </button>
                    </div>
                )}

                {/* VEHICLE CARDS */}

                {!loading && !error && vehicles.length > 0 && (
                    <div
                        className={
                            mobile
                                ? "mt-5 flex flex-col gap-4"
                                : "mt-7 grid grid-cols-[repeat(auto-fill,minmax(min(100%,266px),266px))] gap-5"
                        }
                    >
                        {vehicles.map((vehicle) => (
                            <FeaturedVehicleCard
                                key={vehicle.listing.id}
                                vehicle={vehicle}
                                mobile={mobile}
                            />
                        ))}
                    </div>
                )}

            </div>
        </section>
    );
}
