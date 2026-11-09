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

export function FeaturedVehiclesSection({
    vehicles,
    loading,
    error,
    onRetry,
    variant = "desktop",
}: FeaturedVehiclesSectionProps) {
    const mobile = variant === "mobile";

    return (
        <section
            id="featured-vehicles"
            className={
                mobile
                    ? "overflow-hidden pt-6"
                    : "relative overflow-hidden bg-[#F7F9FC]"
            }
        >
            <div
                className={
                    mobile
                        ? "px-4"
                        : "mx-auto max-w-[1500px] px-6 py-16 lg:px-16 lg:py-20"
                }
            >
                {/* HEADING — MOBILE ONLY */}

                {mobile && (
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h2 className="mt-2 text-[17px] font-bold tracking-tight text-[#172337]">
                                Featured vehicles.
                            </h2>

                            <p className="mt-1 text-[11px] text-[#8491A3]">
                                Standout cars promoted by sellers.
                            </p>
                        </div>

                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#EAF5FF] px-2.5 py-1 text-[9px] font-bold text-[#0877D9]">
                            <Sparkles size={11} />
                            Promoted
                        </span>
                    </div>
                )}

                {/* LOADING */}

                {loading && (
                    <div
                        className={
                            mobile
                                ? "mt-4 flex gap-3 overflow-hidden"
                                : "mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
                        }
                    >
                        {Array.from({ length: mobile ? 3 : 3 }).map(
                            (_, index) => (
                                <div
                                    key={index}
                                    className={
                                        mobile
                                            ? "w-[230px] shrink-0 overflow-hidden rounded-xl border border-[#E8EDF4] bg-white"
                                            : "overflow-hidden rounded-[5px] border border-slate-200 bg-white"
                                    }
                                >
                                    <div
                                        className={
                                            mobile
                                                ? "aspect-[1.35/1] animate-pulse bg-[#EDF2F7]"
                                                : "h-[225px] animate-pulse bg-slate-100"
                                        }
                                    />

                                    <div className="space-y-3 p-4">
                                        <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
                                        <div className="h-5 w-3/5 animate-pulse rounded bg-slate-200" />
                                        <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                )}

                {/* ERROR */}

                {!loading && error && (
                    <div
                        role="alert"
                        className={
                            mobile
                                ? "mt-4 rounded-xl border border-[#E8EDF4] bg-white p-4"
                                : "mt-10 border border-red-100 bg-white px-6 py-14 text-center"
                        }
                    >
                        <p className="text-sm font-semibold text-slate-800">
                            Featured vehicles couldn't load.
                        </p>

                        <p className="mt-2 text-xs leading-6 text-slate-500">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={onRetry}
                            className="mt-4 text-xs font-bold text-[#0877D9]"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* EMPTY */}

                {!loading && !error && vehicles.length === 0 && (
                    <div
                        className={
                            mobile
                                ? "mt-4 rounded-xl border border-dashed border-[#DCE7F2] bg-white px-4 py-6 text-center"
                                : "mt-10 border border-slate-200 bg-white px-6 py-16 text-center"
                        }
                    >
                        <CarFront
                            size={mobile ? 22 : 30}
                            className="mx-auto text-[#1491FF]"
                        />

                        <h3 className="mt-3 text-sm font-semibold text-slate-900">
                            No featured vehicles yet.
                        </h3>

                        <p className="mt-2 text-xs leading-6 text-slate-500">
                            Check back soon for promoted listings.
                        </p>
                    </div>
                )}

                {/* VEHICLES */}

                {!loading && !error && vehicles.length > 0 && (
                    <div
                        className={
                            mobile
                                ? "mt-4 flex gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                : "mt-10 -mx-2 flex snap-x snap-mandatory gap-5 overflow-x-auto px-2 pb-6 [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent]"
                        }
                    >
                        {vehicles.map((vehicle, index) => {
                            const title = getTitle(vehicle);
                            const image = getImage(vehicle);

                            return (
                                <Link
                                    key={vehicle.listing.id}
                                    href={`/marketplace/${vehicle.listing.id}`}
                                    className={
                                        mobile
                                            ? "group w-[230px] shrink-0 overflow-hidden rounded-xl border border-[#E4EDF7] bg-white shadow-sm transition-all hover:border-[#B9DEFF] hover:shadow-lg"
                                            : "group w-[calc(33.333%-14px)] min-w-[290px] shrink-0 snap-start overflow-hidden rounded-[5px] border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl sm:min-w-[320px] lg:min-w-[calc(33.333%-14px)]"
                                    }
                                >
                                    {/* IMAGE */}

                                    <div
                                        className={
                                            mobile
                                                ? "relative aspect-[1.35/1] overflow-hidden bg-slate-100"
                                                : "relative h-[225px] overflow-hidden bg-slate-100"
                                        }
                                    >
                                        {image ? (
                                            <Image
                                                src={image}
                                                alt={title}
                                                fill
                                                sizes={
                                                    mobile
                                                        ? "230px"
                                                        : "(max-width: 768px) 80vw, 400px"
                                                }
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#F0F7FF] to-[#DCEEFF]">
                                                <CarFront
                                                    size={mobile ? 34 : 60}
                                                    className="text-[#1491FF]"
                                                    strokeWidth={1.3}
                                                />
                                            </div>
                                        )}

                                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-white/95 px-2.5 py-1.5 text-[9px] font-bold text-[#0877D9] shadow-sm">
                                            <Sparkles size={11} />
                                            Featured
                                        </span>

                                        {!mobile && (
                                            <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 transition-all group-hover:bg-[#1491FF] group-hover:text-white">
                                                <ArrowRight size={16} />
                                            </span>
                                        )}
                                    </div>

                                    {/* DETAILS */}

                                    <div className="p-3.5">
                                        <h3
                                            className={
                                                mobile
                                                    ? "line-clamp-1 text-[12px] font-bold text-[#243247]"
                                                    : "line-clamp-2 min-h-[44px] text-base font-semibold leading-6 text-slate-900"
                                            }
                                        >
                                            {title}
                                        </h3>

                                        <p
                                            className={
                                                mobile
                                                    ? "mt-2 text-[16px] font-extrabold tracking-tight text-[#172337]"
                                                    : "mt-3 text-xl font-bold tracking-tight text-slate-950"
                                            }
                                        >
                                            {formatPrice(
                                                vehicle.listing.price,
                                                vehicle.listing.currency,
                                            )}
                                        </p>

                                        <div className="mt-2 flex min-w-0 items-center gap-1.5 text-[10px] text-slate-500">
                                            <MapPin
                                                size={12}
                                                className="shrink-0 text-[#1491FF]"
                                            />

                                            <span className="truncate">
                                                {getLocation(vehicle)}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* {mobile && (
                    <Link
                        href="/marketplace"
                        className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-[#0877D9]"
                    >
                        Explore all vehicles
                        <ArrowRight size={13} />
                    </Link>
                )} */}
            </div>
        </section>
    );
}