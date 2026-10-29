import Link from "next/link";

import { ArrowRight, CarFront, MapPin } from "lucide-react";
import type { MarketplaceSearchResult } from "@/app/types/user/marketplace.types";
import { formatNaira } from "@/app/lib/user/vehicle/vehicle-details-format";

function SimilarVehicleCard({ result }: { result: MarketplaceSearchResult }) {
    const listing = result.listing;

    const title = [
        result.variant?.year,
        result.make?.name,
        result.model?.name,
        result.variant?.name,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <Link
            href={`/marketplace/${listing.id}`}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg"
        >
            <div className="flex h-36 items-center justify-center bg-slate-100 text-slate-400">
                <CarFront size={44} strokeWidth={1.2} />
            </div>

            <div className="p-4">
                <p className="line-clamp-2 text-sm font-semibold text-slate-950 transition group-hover:text-violet-700">
                    {title || listing.title}
                </p>

                <p className="mt-3 text-base font-bold text-slate-950">
                    {formatNaira(listing.price)}
                </p>

                <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={13} />

                    {[listing.city, listing.state].filter(Boolean).join(", ") ||
                        "Location unavailable"}
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
            <div className="flex items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
                        Keep exploring
                    </p>

                    <h2 className="mt-2 text-xl font-extrabold text-slate-950 sm:text-2xl">
                        Similar vehicles
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        More vehicles from the same make.
                    </p>
                </div>

                <Link
                    href="/marketplace"
                    className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-violet-700 transition hover:text-violet-900"
                >
                    View all
                    <ArrowRight size={16} />
                </Link>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {vehicles.map((item) => (
                    <SimilarVehicleCard key={item.listing.id} result={item} />
                ))}
            </div>
        </section>
    );
}