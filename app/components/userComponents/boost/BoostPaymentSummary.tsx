"use client";

import {
    BadgeCheck,
    CarFront,
    Clock3,
    CreditCard,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

import type {
    BoostPlan,
} from "@/app/types/user/boost/boost.types";

import {
    formatBoostDuration,
    formatBoostPrice,
} from "@/app/lib/user/boost/boost.utils";

interface BoostPaymentSummaryProps {
    listingTitle: string;
    plan: BoostPlan;
    vehicleImageUrl?: string | null;
}

export default function BoostPaymentSummary({
    listingTitle,
    plan,
    vehicleImageUrl,
}: BoostPaymentSummaryProps) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 bg-[#F4F9FF] px-4 py-3">
                <div className="flex items-center gap-2">
                    <CreditCard
                        size={16}
                        className="text-[#1491FF]"
                    />

                    <h3 className="text-sm font-bold text-slate-800">
                        Payment summary
                    </h3>
                </div>
            </div>

            <div className="p-4">
                {/* Vehicle */}
                <div className="flex items-center gap-3">
                    <div className="flex h-[58px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#EAF5FF]">
                        {vehicleImageUrl ? (
                            <div
                                role="img"
                                aria-label={listingTitle}
                                className="h-full w-full bg-cover bg-center"
                                style={{
                                    backgroundImage: `url("${vehicleImageUrl.replace(/["\\]/g, "")}")`,
                                }}
                            />
                        ) : (
                            <CarFront
                                size={28}
                                className="text-[#1491FF]"
                            />
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Vehicle being promoted
                        </p>

                        <p className="mt-1 line-clamp-2 text-sm font-bold text-slate-900">
                            {listingTitle}
                        </p>
                    </div>
                </div>

                <div className="my-4 border-t border-dashed border-slate-200" />

                {/* Selected plan */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-slate-500">
                            Boost plan
                        </span>

                        <span className="text-sm font-semibold text-slate-800">
                            {formatBoostDuration(plan.durationDays)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-slate-500">
                            Promotion duration
                        </span>

                        <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                            <Clock3
                                size={14}
                                className="text-[#1491FF]"
                            />

                            {formatBoostDuration(plan.durationDays)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-slate-500">
                            Boost price
                        </span>

                        <span className="text-sm font-semibold text-slate-800">
                            {formatBoostPrice(
                                plan.price,
                                plan.currency,
                            )}
                        </span>
                    </div>
                </div>

                <div className="my-4 border-t border-slate-200" />

                {/* Total */}
                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-slate-800">
                        Total payable
                    </span>

                    <span className="text-xl font-extrabold tracking-tight text-[#0877D9]">
                        {formatBoostPrice(
                            plan.price,
                            plan.currency,
                        )}
                    </span>
                </div>

                {/* Approval information */}
                <div className="mt-5 rounded-xl border border-blue-100 bg-[#F4F9FF] p-3">
                    <div className="flex items-start gap-2.5">
                        <ShieldCheck
                            size={18}
                            className="mt-0.5 shrink-0 text-[#1491FF]"
                        />

                        <div>
                            <p className="text-xs font-bold text-slate-800">
                                Secure payment and review
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Your payment will be verified by KARMASS.
                                Your vehicle boost becomes active only after
                                administrative approval.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400">
                    <BadgeCheck
                        size={14}
                        className="text-emerald-500"
                    />

                    <span>
                        Individual vehicle promotion
                    </span>

                    <Sparkles
                        size={13}
                        className="text-[#1491FF]"
                    />
                </div>
            </div>
        </div>
    );
}