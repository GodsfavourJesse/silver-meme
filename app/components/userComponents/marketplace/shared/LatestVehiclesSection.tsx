"use client";

import Image from "next/image";
import Link from "next/link";

import {
    ArrowRight,
    BadgeCheck,
    CarFront,
    Gauge,
    MapPin,
} from "lucide-react";

import type {
    MarketplaceSearchResult,
} from "@/app/types/user/marketplace.types";

type LatestVehiclesSectionProps = {
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

function getDetails(result: MarketplaceSearchResult) {
    return [
        result.variant?.year
            ? String(result.variant.year)
            : undefined,
        result.variant?.fuelType,
        result.variant?.transmission,
    ].filter(Boolean);
}

export function LatestVehiclesSection({
    vehicles,
    loading,
    error,
    onRetry,
    variant = "desktop",
}: LatestVehiclesSectionProps) {
    const mobile = variant === "mobile";

    return (
        <section
            id="latest-vehicles"
            className={
                mobile
                    ? "px-4 pb-6 pt-7"
                    : "relative overflow-hidden bg-white"
            }
        >
            <div
                className={
                    mobile
                        ? ""
                        : "mx-auto max-w-[1500px] px-6 py-16 lg:px-16 lg:py-24"
                }
            >
                {/* HEADING */}

                <div
                    className={
                        mobile
                            ? "flex items-end justify-between gap-3"
                            : "mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"
                    }
                >
                    <div>
                        {/* <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0877D9]">
                            The latest arrivals
                        </span> */}

                        <h2
                            className={
                                mobile
                                    ? "mt-2 text-[17px] font-bold tracking-tight text-[#172337]"
                                    : "mt-5 text-3xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-5xl"
                            }
                        >
                            {mobile
                                ? "Latest Vehicles."
                                : "Fresh on KARMASS."}
                        </h2>

                        <p
                            className={
                                mobile
                                    ? "mt-1 text-[11px] text-[#8491A3]"
                                    : "mt-4 max-w-lg text-sm leading-7 text-slate-500"
                            }
                        >
                            Explore the newest vehicles listed by sellers.
                        </p>
                    </div>

                    <Link
                        href="/marketplace"
                        className={
                            mobile
                                ? "inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-[#0877D9]"
                                : "group inline-flex w-fit items-center gap-2 border-b border-slate-300 pb-2 text-xs font-semibold text-slate-800 transition-colors hover:border-blue-500 hover:text-blue-700"
                        }
                    >
                        See all vehicles
                        <ArrowRight
                            size={mobile ? 13 : 15}
                            className={
                                mobile
                                    ? ""
                                    : "transition-transform group-hover:translate-x-1"
                            }
                        />
                    </Link>
                </div>

                {/* LOADING */}

                {loading && (
                    <div
                        className={
                            mobile
                                ? "mt-4 grid grid-cols-2 gap-3"
                                : "mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
                        }
                    >
                        {Array.from({ length: mobile ? 6 : 6 }).map(
                            (_, index) => (
                                <div
                                    key={index}
                                    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                                >
                                    <div
                                        className={
                                            mobile
                                                ? "aspect-[1.18/1] animate-pulse bg-slate-100"
                                                : "h-[225px] animate-pulse bg-slate-100"
                                        }
                                    />

                                    <div className="space-y-3 p-3.5">
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
                        className="mt-6 border border-red-100 bg-white p-6 text-center"
                    >
                        <CarFront
                            size={25}
                            className="mx-auto text-[#1491FF]"
                        />

                        <h3 className="mt-3 text-sm font-semibold text-slate-900">
                            Unable to load the latest vehicles.
                        </h3>

                        <p className="mt-2 text-xs text-slate-500">
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
                    <div className="mt-6 border border-slate-200 bg-[#F8FAFC] px-6 py-12 text-center">
                        <CarFront
                            size={28}
                            className="mx-auto text-[#1491FF]"
                        />

                        <h3 className="mt-3 text-sm font-semibold text-slate-900">
                            No vehicles available just yet.
                        </h3>

                        <p className="mt-2 text-xs text-slate-500">
                            New listings are added regularly. Check back soon.
                        </p>
                    </div>
                )}

                {/* VEHICLES */}

                {!loading && !error && vehicles.length > 0 && (
                    <div
                        className={
                            mobile
                                ? "mt-4 grid grid-cols-2 gap-3"
                                : "mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
                        }
                    >
                        {vehicles.map((vehicle) => {
                            const title = getTitle(vehicle);
                            const image = getImage(vehicle);
                            const details = getDetails(vehicle);

                            return (
                                <article
                                    key={vehicle.listing.id}
                                    className={
                                        mobile
                                            ? "group min-w-0 overflow-hidden rounded-xl border border-[#E8EDF4] bg-white transition-all hover:border-[#C8E2FF] hover:shadow-lg"
                                            : "group relative flex h-full flex-col overflow-hidden rounded-[5px] border border-slate-200/80 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                                    }
                                >
                                    {/* IMAGE */}

                                    <Link
                                        href={`/marketplace/${vehicle.listing.id}`}
                                        aria-label={`View ${title}`}
                                        className={
                                            mobile
                                                ? "relative block aspect-[1.18/1] overflow-hidden bg-slate-100"
                                                : "relative block h-[225px] overflow-hidden bg-slate-100"
                                        }
                                    >
                                        {image ? (
                                            <Image
                                                src={image}
                                                alt={title}
                                                fill
                                                sizes={
                                                    mobile
                                                        ? "(max-width: 640px) 48vw, 300px"
                                                        : "(max-width: 768px) 80vw, 400px"
                                                }
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#F0F7FF] to-[#DCEEFF]">
                                                <CarFront
                                                    size={mobile ? 30 : 60}
                                                    className="text-[#1491FF]"
                                                    strokeWidth={1.4}
                                                />
                                            </div>
                                        )}

                                        {vehicle.dealer?.verified && (
                                            <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-[9px] font-bold text-white shadow-sm">
                                                <BadgeCheck size={11} />
                                                Verified
                                            </span>
                                        )}
                                    </Link>

                                    {/* DETAILS */}

                                    <div
                                        className={
                                            mobile
                                                ? "p-3"
                                                : "flex flex-1 flex-col p-5"
                                        }
                                    >
                                        <Link
                                            href={`/marketplace/${vehicle.listing.id}`}
                                            className={
                                                mobile
                                                    ? "line-clamp-2 min-h-[36px] text-[12px] font-semibold leading-[18px] text-[#243247] transition-colors hover:text-[#0877D9]"
                                                    : "line-clamp-2 min-h-[48px] text-base font-semibold leading-6 text-slate-900 transition-colors hover:text-blue-700"
                                            }
                                        >
                                            {title}
                                        </Link>

                                        <p
                                            className={
                                                mobile
                                                    ? "mt-2 text-[17px] font-extrabold tracking-tight text-[#172337]"
                                                    : "mt-4 text-xl font-bold tracking-tight text-slate-950"
                                            }
                                        >
                                            {formatPrice(
                                                vehicle.listing.price,
                                                vehicle.listing.currency,
                                            )}
                                        </p>

                                        {details.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
                                                {details.map((detail, index) => (
                                                    <span
                                                        key={`${detail}-${index}`}
                                                        className="text-[10px] text-slate-500"
                                                    >
                                                        {detail}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div
                                            className={
                                                mobile
                                                    ? "mt-3 flex items-center gap-1.5 border-t border-[#F0F2F6] pt-3"
                                                    : "mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4"
                                            }
                                        >
                                            <div className="flex min-w-0 items-center gap-1.5 text-[10px] text-slate-500">
                                                <MapPin
                                                    size={12}
                                                    className="shrink-0 text-[#1491FF]"
                                                />

                                                <span className="truncate">
                                                    {getLocation(vehicle)}
                                                </span>
                                            </div>

                                            {!mobile &&
                                                vehicle.listing.mileage !== null &&
                                                vehicle.listing.mileage !== undefined && (
                                                    <span className="flex shrink-0 items-center gap-1 text-[10px] text-slate-500">
                                                        <Gauge size={12} />
                                                        {vehicle.listing.mileage.toLocaleString("en-NG")} km
                                                    </span>
                                                )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}