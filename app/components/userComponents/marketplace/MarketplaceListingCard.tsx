import Link from "next/link";
import { ArrowRight, CarFront, Heart, MapPin, Zap } from "lucide-react";

import {
    formatPrice,
    getListingTitle,
    getLocation,
    getVehicleDetails,
} from "@/app/lib/user/marketplace/marketplace-format";
import type { MarketplaceSearchResult } from "@/app/types/user/marketplace.types";

function ListingImagePlaceholder() {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 text-slate-400">
            <CarFront size={46} strokeWidth={1.2} />

            <span className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em]">
                KARMASS
            </span>

            <span className="mt-1 text-xs">Vehicle image unavailable</span>
        </div>
    );
}

export function MarketplaceListingSkeleton() {
    return (
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="h-52 animate-pulse bg-slate-200" />

            <div className="space-y-4 p-5">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />

                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />

                <div className="h-6 w-2/5 animate-pulse rounded bg-slate-200" />

                <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />

                <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
            </div>
        </article>
    );
}

export function MarketplaceListingCard({
    result,
}: {
    result: MarketplaceSearchResult;
}) {
    const listing = result.listing;
    const title = getListingTitle(result);
    const details = getVehicleDetails(result);

    return (
        <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5">
            <div className="relative h-52 overflow-hidden bg-slate-100">
                <ListingImagePlaceholder />

                {result.boostPriority > 0 && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-sm">
                        <Zap size={13} />
                        Featured
                    </span>
                )}

                <button
                    type="button"
                    aria-label={`Save ${title}`}
                    title="Favorites will be connected in the next phase"
                    disabled
                    className="absolute right-3 top-3 grid size-10 cursor-not-allowed place-items-center rounded-full bg-white/95 text-slate-400 shadow-sm"
                >
                    <Heart size={18} />
                </button>
            </div>

            <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="line-clamp-2 font-semibold text-slate-950">
                            {title}
                        </h2>

                        {details.length > 0 && (
                            <p className="mt-1.5 text-xs text-slate-500">
                                {details.join(" · ")}
                            </p>
                        )}
                    </div>
                </div>

                <p className="mt-4 text-xl font-bold tracking-tight text-slate-950">
                    {formatPrice(listing.price, listing.currency)}
                </p>

                {listing.condition && (
                    <span className="mt-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                        {listing.condition.replaceAll("_", " ")}
                    </span>
                )}

                <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin size={14} className="shrink-0" />

                    <span className="truncate">{getLocation(result)}</span>
                </p>

                <Link
                    href={`/marketplace/${listing.id}`}
                    className="mt-5 flex items-center justify-between rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                    View vehicle
                    <ArrowRight size={16} />
                </Link>
            </div>
        </article>
    );
}