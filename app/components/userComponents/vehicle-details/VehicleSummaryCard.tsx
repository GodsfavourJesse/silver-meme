"use client";

import { motion, useReducedMotion } from "framer-motion";

import {
    CalendarDays,
    Heart,
    LoaderCircle,
    MapPin,
    MessageCircle,
    Share2,
} from "lucide-react";

import type { VehicleDetailsResponse } from "@/app/types/user/vehicle-details.types";

import {
    formatDate,
    formatEnum,
    formatNaira,
    getLocation,
} from "@/app/lib/user/vehicle/vehicle-details-format";

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
    const shouldReduceMotion = useReducedMotion();

    const publishedDate = formatDate(
        listing.publishedAt || listing.createdAt,
    );

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

            {/* Vehicle information */}
            <div className="p-4 sm:p-5">

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                    {listing.condition && (
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                            {formatEnum(listing.condition)}
                        </span>
                    )}

                    {details.isBoosted && (
                        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-[#1491FF]">
                            Featured listing
                        </span>
                    )}
                </div>

                {/* Title */}
                <h1 className="mt-3 text-xl font-bold leading-snug tracking-tight text-slate-900 sm:text-2xl">
                    {title}
                </h1>

                {listing.title !== title && (
                    <p className="mt-1 text-sm leading-5 text-slate-500">
                        {listing.title}
                    </p>
                )}

                {/* Price */}
                <div className="mt-5">
                    <p className="text-xs font-medium text-slate-500">
                        Asking price
                    </p>

                    <p className="mt-1 text-[28px] font-bold tracking-tight text-slate-900 sm:text-[32px]">
                        {formatNaira(listing.price)}
                    </p>
                </div>
            </div>

            {/* Listing details */}
            <div className="border-y border-slate-100 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-3 py-2">
                    <MapPin
                        size={17}
                        className="shrink-0 text-slate-400"
                    />

                    <div className="min-w-0">
                        <p className="text-xs text-slate-500">
                            Location
                        </p>

                        <p className="mt-0.5 truncate text-sm font-medium text-slate-800">
                            {location || "Location not specified"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 py-2">
                    <CalendarDays
                        size={17}
                        className="shrink-0 text-slate-400"
                    />

                    <div>
                        <p className="text-xs text-slate-500">
                            Listed on
                        </p>

                        <p className="mt-0.5 text-sm font-medium text-slate-800">
                            {publishedDate}
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 sm:p-5">

                <div className="grid grid-cols-2 gap-3">
                    <motion.button
                        type="button"
                        onClick={onFavorite}
                        disabled={favoriteLoading}
                        aria-pressed={favorite}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                        className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                            favorite
                                ? "border-rose-200 bg-rose-50 text-rose-600"
                                : "border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                        {favoriteLoading ? (
                            <LoaderCircle
                                size={17}
                                className="animate-spin"
                            />
                        ) : (
                            <Heart
                                size={17}
                                fill={favorite ? "currentColor" : "none"}
                            />
                        )}

                        {favorite ? "Saved" : "Save listing"}
                    </motion.button>

                    <motion.button
                        type="button"
                        onClick={onShare}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                        className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        <Share2 size={17} />
                        Share
                    </motion.button>
                </div>

                {/* Action feedback */}
                {(actionError || shareMessage) && (
                    <div
                        role={actionError ? "alert" : "status"}
                        className={`mt-3 rounded-lg border p-3 ${
                            actionError
                                ? "border-amber-200 bg-amber-50"
                                : "border-emerald-200 bg-emerald-50"
                        }`}
                    >
                        <p
                            className={`text-xs leading-5 ${
                                actionError
                                    ? "text-amber-800"
                                    : "text-emerald-700"
                            }`}
                        >
                            {actionError || shareMessage}
                        </p>

                        {actionError && (
                            <SignInLink message={actionError} />
                        )}
                    </div>
                )}

                {/* Contact seller */}
                <motion.button
                    type="button"
                    onClick={onContact}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                    className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1491FF] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#087FE5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                >
                    <MessageCircle size={18} />
                    Contact seller
                </motion.button>

                <p className="mt-3 text-center text-[11px] text-slate-400">
                    Contact the seller directly through KARMASS.
                </p>
            </div>
        </section>
    );
}