import Link from "next/link";

import {
    CalendarDays,
    Heart,
    LoaderCircle,
    MapPin,
    MessageCircle,
    Share2,
    Zap,
} from "lucide-react";
import type { VehicleDetailsResponse } from "@/app/types/user/vehicle-details.types";
import { formatDate, formatEnum, formatNaira, getLocation } from "@/app/lib/user/vehicle/vehicle-details-format";
import { SignInLink } from "../Desktop/SignInLink";

interface VehicleSummaryCardProps {
    details: VehicleDetailsResponse;
    title: string;
    favorite: boolean;
    favoriteLoading: boolean;
    actionError: string;
    shareMessage: string;
    onFavorite: () => void;
    onShare: () => void;
    onContact: () => void;
}

export function VehicleSummaryCard({
    details,
    title,
    favorite,
    favoriteLoading,
    actionError,
    shareMessage,
    onFavorite,
    onShare,
    onContact,
}: VehicleSummaryCardProps) {
    const listing = details.listing;
    const location = getLocation(details);

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
                {listing.condition && (
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                        {formatEnum(listing.condition)}
                    </span>
                )}

                {details.isBoosted && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900">
                        <Zap size={13} />
                        Featured
                    </span>
                )}
            </div>

            <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-3xl">
                {title}
            </h1>

            {listing.title !== title && (
                <p className="mt-2 text-sm leading-6 text-slate-500">
                    {listing.title}
                </p>
            )}

            <p className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                {formatNaira(listing.price)}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                    <MapPin size={15} />
                    {location || "Location unavailable"}
                </span>

                <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={15} />
                    Listed {formatDate(listing.publishedAt || listing.createdAt)}
                </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={onFavorite}
                    disabled={favoriteLoading}
                    aria-pressed={favorite}
                    className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:opacity-60 ${
                        favorite
                            ? "border-rose-200 bg-rose-50 text-rose-700"
                            : "border-slate-200 bg-white text-slate-800 hover:border-violet-200 hover:bg-violet-50"
                    }`}
                >
                    {favoriteLoading ? (
                        <LoaderCircle size={17} className="animate-spin" />
                    ) : (
                        <Heart
                            size={17}
                            fill={favorite ? "currentColor" : "none"}
                        />
                    )}

                    {favorite ? "Saved" : "Save vehicle"}
                </button>

                <button
                    type="button"
                    onClick={onShare}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-violet-200 hover:bg-violet-50"
                >
                    <Share2 size={17} />
                    Share
                </button>
            </div>

            {(actionError || shareMessage) && (
                <div
                    role={actionError ? "alert" : "status"}
                    className={`mt-4 rounded-xl p-3 text-sm leading-6 ${
                        actionError
                            ? "border border-amber-200 bg-amber-50 text-amber-900"
                            : "border border-emerald-200 bg-emerald-50 text-emerald-800"
                    }`}
                >
                    {actionError || shareMessage}

                    <SignInLink message={actionError} />
                </div>
            )}

            <button
                type="button"
                onClick={onContact}
                className="mt-4 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-violet-800"
            >
                <MessageCircle size={18} />
                Contact seller
            </button>

            <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                Start a private conversation through KARMASS.
            </p>
        </section>
    );
}