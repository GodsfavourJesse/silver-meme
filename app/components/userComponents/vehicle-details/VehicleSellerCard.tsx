"use client";

import Image from "next/image";
import { useState } from "react";

import {
    BadgeCheck,
    Clock3,
    ShieldCheck,
    Store,
    UserRound,
} from "lucide-react";

import type {
    VehicleDetailsResponse,
} from "@/app/types/user/vehicle-details.types";

import {
    formatDate,
} from "@/app/lib/user/vehicle/vehicle-details-format";

export function VehicleSellerCard({
    details,
}: {
    details: VehicleDetailsResponse;
}) {
    const { seller, dealer } = details;

    const [avatarFailed, setAvatarFailed] = useState(false);

    const isDealer = seller.accountType === "DEALER";

    const sellerName =
        seller.displayName?.trim() ||
        [seller.firstName, seller.lastName]
            .filter(Boolean)
            .join(" ") ||
        "KARMASS Seller";

    const displayName =
        isDealer && dealer?.companyName
            ? dealer.companyName
            : sellerName;

    const initials = displayName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase();

    const isVerifiedDealer =
        isDealer && dealer?.verified === true;

    return (
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
            <div className="flex items-start gap-4">
                {seller.avatarUrl && !avatarFailed ? (
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
                        <Image
                            src={seller.avatarUrl}
                            alt={sellerName}
                            fill
                            unoptimized
                            sizes="56px"
                            onError={() => setAvatarFailed(true)}
                            className="object-cover"
                        />
                    </div>
                ) : (
                    <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#1491FF]/10 text-base font-bold text-[#0876D1]">
                        {initials || (
                            isDealer
                                ? <Store size={23} />
                                : <UserRound size={23} />
                        )}
                    </span>
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="break-words text-base font-bold text-slate-950">
                            {displayName}
                        </h2>

                        {isVerifiedDealer && (
                            <span
                                title="KARMASS dealer verification"
                                className="inline-flex items-center gap-1 rounded-full bg-[#1491FF]/10 px-2 py-1 text-[10px] font-bold text-[#0876D1]"
                            >
                                <BadgeCheck size={13} />
                                Verified
                            </span>
                        )}
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                        {isDealer ? "Car dealer" : "Private seller"}
                    </p>

                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock3 size={13} />
                        Member since {formatDate(seller.createdAt)}
                    </p>
                </div>
            </div>

            <div className="mt-5 rounded-xl border border-[#1491FF]/10 bg-[#1491FF]/5 p-3.5">
                <div className="flex items-start gap-2.5">
                    <ShieldCheck
                        size={18}
                        className="mt-0.5 shrink-0 text-[#0876D1]"
                    />

                    <p className="text-xs leading-5 text-slate-600">
                        {isVerifiedDealer
                            ? "This dealer has completed KARMASS's dealer verification process. Always inspect the vehicle and verify its documents before making payment."
                            : "Always verify the seller's identity, inspect the vehicle, and confirm ownership documents before making payment."}
                    </p>
                </div>
            </div>
        </section>
    );
}