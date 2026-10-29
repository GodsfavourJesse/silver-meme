import Image from "next/image";

import { BadgeCheck, Clock3, ShieldCheck } from "lucide-react";
import type { VehicleDetailsResponse } from "@/app/types/user/vehicle-details.types";
import { formatDate } from "@/app/lib/user/vehicle/vehicle-details-format";

export function VehicleSellerCard({
    details,
}: {
    details: VehicleDetailsResponse;
}) {
    const { seller, dealer } = details;

    const isDealer = seller.accountType === "DEALER";

    return (
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 sm:rounded-3xl sm:p-6">
            <div className="flex items-start gap-4">
                {seller.avatarUrl ? (
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                        <Image
                            src={seller.avatarUrl}
                            alt={seller.displayName}
                            fill
                            unoptimized
                            sizes="56px"
                            className="object-cover"
                        />
                    </div>
                ) : (
                    <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-violet-50 text-lg font-bold text-violet-800">
                        {(seller.firstName.charAt(0) || "S").toUpperCase()}
                    </span>
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="break-words font-bold text-slate-950">
                            {isDealer
                                ? dealer?.companyName || seller.displayName
                                : seller.displayName}
                        </h2>

                        {isDealer && dealer?.verified && (
                            <span
                                title="KARMASS dealer verification"
                                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800"
                            >
                                <BadgeCheck size={13} />
                                Verified dealer
                            </span>
                        )}
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                        {isDealer ? "Dealer" : "Private seller"}
                    </p>

                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock3 size={13} />
                        Member since {formatDate(seller.createdAt)}
                    </p>
                </div>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-3.5">
                <div className="flex items-start gap-2.5">
                    <ShieldCheck
                        size={17}
                        className="mt-0.5 shrink-0 text-emerald-700"
                    />

                    <p className="text-xs leading-5 text-slate-600">
                        Dealer verification indicates that KARMASS has verified
                        the dealer&apos;s submitted information. It does not
                        certify this vehicle&apos;s mechanical condition or
                        guarantee a transaction.
                    </p>
                </div>
            </div>
        </section>
    );
}