"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import {
    ArrowRight,
    CarFront,
    MapPin,
    Zap,
} from "lucide-react";

import type {
    MarketplaceSearchResult,
} from "@/app/types/user/marketplace.types";

import {
    formatNaira,
} from "@/app/lib/user/vehicle/vehicle-details-format";

function SimilarVehicleCard({
    result,
}: {
    result: MarketplaceSearchResult;
}) {
    const listing = result.listing;

    const [imageFailed, setImageFailed] = useState(false);

    const title = [
        result.variant?.year,
        result.make?.name,
        result.model?.name,
        result.variant?.name,
    ]
        .filter(Boolean)
        .join(" ") || listing.title;

    const image = result.images?.[0];

    const location = [
        listing.city,
        listing.state,
    ]
        .filter(Boolean)
        .join(", ");

    return (
        <Link
            href={`/marketplace/${listing.id}`}
            className="group min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#1491FF]/40 hover:shadow-lg"
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                {image?.thumbnailUrl && !imageFailed ? (
                    <Image
                        src={image.thumbnailUrl}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, 25vw"
                        unoptimized
                        onError={() => setImageFailed(true)}
                        className="object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 text-slate-400">
                        <CarFront size={42} strokeWidth={1.3} />
                    </div>
                )}

                {result.boostPriority > 0 && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-lg bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-amber-800 shadow-sm">
                        <Zap size={12} fill="currentColor" />
                        Featured
                    </span>
                )}

                {result.images?.length > 1 && (
                    <span className="absolute bottom-3 right-3 rounded-lg bg-slate-950/70 px-2.5 py-1 text-[10px] font-semibold text-white">
                        {result.images.length} photos
                    </span>
                )}
            </div>

            <div className="p-4">
                <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-900 transition group-hover:text-[#0876D1]">
                    {title}
                </h3>

                <p className="mt-3 text-lg font-bold tracking-tight text-slate-950">
                    {formatNaira(listing.price)}
                </p>

                <p className="mt-2 flex items-center gap-1.5 truncate text-xs text-slate-500">
                    <MapPin
                        size={13}
                        className="shrink-0 text-[#1491FF]"
                    />

                    {location || "Location unavailable"}
                </p>
            </div>
        </Link>
    );
}

export function SimilarVehicles({
    vehicles,
}: {
    vehicles: MarketplaceSearchResult[];
}) {
    if (vehicles.length === 0) {
        return null;
    }

    return (
        <section className="mt-12 sm:mt-16">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0876D1]">
                        Keep exploring
                    </p>

                    <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
                        Similar vehicles
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Discover more vehicles you might be interested in.
                    </p>
                </div>

                <Link
                    href="/marketplace"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0876D1] transition hover:text-[#005EAD]"
                >
                    View all vehicles
                    <ArrowRight size={16} />
                </Link>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {vehicles.map((item) => (
                    <SimilarVehicleCard
                        key={item.listing.id}
                        result={item}
                    />
                ))}
            </div>
        </section>
    );
}