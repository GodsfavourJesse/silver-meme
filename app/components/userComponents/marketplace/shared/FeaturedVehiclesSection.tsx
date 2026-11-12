
"use client";

import Image from "next/image";
import Link from "next/link";

import {
    ArrowRight,
    CarFront,
    MapPin,
    Sparkles,
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
                    ? "w-[280px] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white"
                    : "overflow-hidden rounded-2xl border border-slate-200 bg-white"
            }
        >
            <div className="aspect-[16/10] animate-pulse bg-slate-100" />

            <div className="space-y-4 p-4">
                <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
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
                    ? "group w-[280px] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#1491FF]/40 hover:shadow-xl hover:shadow-blue-900/[0.07]"
                    : "group min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#1491FF]/40 hover:shadow-xl hover:shadow-blue-900/[0.07]"
            }
        >
            {/* VEHICLE IMAGE */}

            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">

                {image ? (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        sizes={
                            mobile
                                ? "280px"
                                : "(max-width: 768px) 100vw, 400px"
                        }
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
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

                {/* IMAGE OVERLAY */}

                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />

                {/* SPONSORED LABEL */}

                <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-[#0876D1] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.09em] text-white shadow-lg">
                    <Sparkles size={11} fill="currentColor" />
                    Sponsored
                </div>

                {/* PROMOTION INDICATOR */}

                <span className="absolute bottom-3 left-3 text-[10px] font-semibold tracking-wide text-white">
                    Boosted listing
                </span>

                {/* VIEW ARROW */}

                <span className="absolute bottom-3 right-3 grid size-8 place-items-center rounded-full bg-white text-[#0876D1] shadow-md transition-all duration-300 group-hover:bg-[#1491FF] group-hover:text-white">
                    <ArrowRight
                        size={15}
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                </span>
            </div>

            {/* VEHICLE INFORMATION */}

            <div className="p-4">

                {/* TITLE */}

                <h3 className="line-clamp-2 min-h-[40px] text-[14px] font-bold leading-5 text-[#172337] transition-colors group-hover:text-[#0876D1]">
                    {title}
                </h3>

                {/* PRICE */}

                <p className="mt-2 text-[20px] font-extrabold tracking-tight text-[#172337]">
                    {formatPrice(
                        vehicle.listing.price,
                        vehicle.listing.currency,
                    )}
                </p>

                {/* LOCATION */}

                <div className="mt-3 flex min-w-0 items-center gap-2 border-t border-slate-100 pt-3">
                    <MapPin
                        size={14}
                        className="shrink-0 text-[#1491FF]"
                    />

                    <span className="truncate text-[11px] font-medium text-slate-500">
                        {getLocation(vehicle)}
                    </span>
                </div>

                {/* CARD FOOTER */}

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-semibold text-slate-400">
                        Promoted by seller
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0876D1] transition-all group-hover:gap-2">
                        View vehicle
                        <ArrowRight size={13} />
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

                        <div className="mb-2 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#0876D1]">
                            <Sparkles size={12} />
                            KARMASS promotions
                        </div>

                        {/* TITLE */}

                        <h2
                            className={
                                mobile
                                    ? "text-[19px] font-extrabold tracking-tight text-[#172337]"
                                    : "text-2xl font-extrabold tracking-tight text-[#172337] lg:text-[28px]"
                            }
                        >
                            Boosted vehicles
                        </h2>

                        {/* DESCRIPTION */}

                        <p
                            className={
                                mobile
                                    ? "mt-1.5 max-w-[270px] text-[11px] leading-5 text-slate-500"
                                    : "mt-2 text-sm leading-6 text-slate-500"
                            }
                        >
                            Vehicles promoted by sellers for greater visibility.
                        </p>
                    </div>

                    {/* PROMOTED INDICATOR */}

                    <div className="mb-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#B9DEFF] bg-[#EAF5FF] px-3 py-1.5">
                        <span className="size-1.5 rounded-full bg-[#1491FF]" />

                        <span className="text-[9px] font-bold uppercase tracking-wide text-[#0876D1]">
                            Sponsored
                        </span>
                    </div>
                </div>

                {/* LOADING */}

                {loading && (
                    <div
                        className={
                            mobile
                                ? "mt-5 flex gap-3 overflow-hidden"
                                : "mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
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
                                ? "mt-5 flex gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                : "mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
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
