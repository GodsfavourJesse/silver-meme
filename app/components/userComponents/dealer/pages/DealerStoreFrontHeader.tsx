"use client";

import Image from "next/image";

import {
    BadgeCheck,
    MapPin,
    Store,
} from "lucide-react";

import type {
    PublicDealerProfile,
} from "@/app/types/user/dealer/dealer.types";

interface DealerStorefrontHeaderProps {
    dealer: PublicDealerProfile;
}

export default function DealerStorefrontHeader({
    dealer,
}: DealerStorefrontHeaderProps) {
    return (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Cover photo */}
            <div className="relative h-40 bg-gray-100 sm:h-56">
                {dealer.coverPhotoUrl ? (
                    <Image
                        src={dealer.coverPhotoUrl}
                        alt={`${dealer.companyName} cover`}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 1200px"
                        className="object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#7008E7] via-purple-600 to-purple-300">
                        <div className="flex h-full items-center justify-center">
                            <Store className="h-14 w-14 text-white/50" />
                        </div>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Dealer information */}
            <div className="relative px-4 pb-5 sm:px-6">
                <div className="-mt-11 flex items-end gap-3 sm:-mt-14 sm:gap-4">
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-purple-50 shadow-sm sm:h-28 sm:w-28">
                        {dealer.profilePictureUrl ? (
                            <Image
                                src={dealer.profilePictureUrl}
                                alt={`${dealer.companyName} profile`}
                                fill
                                unoptimized
                                sizes="112px"
                                className="object-cover"
                            />
                        ) : (
                            <Store className="h-9 w-9 text-[#7008E7] sm:h-12 sm:w-12" />
                        )}
                    </div>

                    <div className="min-w-0 flex-1 pb-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <h1 className="break-words text-lg font-extrabold text-gray-950 sm:text-2xl">
                                {dealer.companyName}
                            </h1>

                            {dealer.verified && (
                                <BadgeCheck
                                    className="h-5 w-5 shrink-0 text-blue-600"
                                    aria-label="Verified dealer"
                                />
                            )}
                        </div>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 sm:text-sm">
                            <MapPin className="h-3.5 w-3.5" />

                            {dealer.verified
                                ? "Verified dealer"
                                : "Dealer"}
                        </p>
                    </div>
                </div>

                {dealer.bio && (
                    <div className="mt-5 border-t border-gray-100 pt-4">
                        <h2 className="text-sm font-bold text-gray-900">
                            About this dealership
                        </h2>

                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                            {dealer.bio}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}