"use client";

import { useEffect, useRef } from "react";

import {
    ArrowRight,
    CheckCircle2,
    Coins,
    X,
} from "lucide-react";

import type {
    ListingCreditConsumption,
} from "@/app/types/user/listings/listing.types";

interface SubscriptionCreditsExhaustedModalProps {
    creditConsumption: ListingCreditConsumption;
    onClose: () => void;
    onViewPlans: () => void;
}

export function SubscriptionCreditsExhaustedModal({
    creditConsumption,
    onClose,
    onViewPlans,
}: SubscriptionCreditsExhaustedModalProps) {
    const primaryButtonRef = useRef<HTMLButtonElement>(null);

    const freeCredits =
        creditConsumption.freeCreditsRemaining;

    const hasFreeCredits = freeCredits > 0;

    useEffect(() => {
        primaryButtonRef.current?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        document.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            document.body.style.overflow = previousOverflow;

            document.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [onClose]);

    return (
        <div
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
        >
            <section
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="subscription-credit-title"
                aria-describedby="subscription-credit-description"
                className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
            >
                <div className="h-1.5 bg-[#1491FF]" />

                <div className="p-6 sm:p-8">
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="absolute right-4 top-5 flex size-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex size-14 items-center justify-center rounded-2xl bg-[#EAF5FF] text-[#1491FF]">
                        <Coins size={27} />
                    </div>

                    <h2
                        id="subscription-credit-title"
                        className="mt-5 text-xl font-bold tracking-tight text-slate-950"
                    >
                        Your subscription credits are exhausted
                    </h2>

                    <p
                        id="subscription-credit-description"
                        className="mt-2 text-sm leading-6 text-slate-600"
                    >
                        You've successfully used the last listing
                        credit from your subscription plan.
                    </p>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-slate-600">
                                Subscription credits
                            </span>

                            <span className="text-sm font-semibold text-red-600">
                                Exhausted
                            </span>
                        </div>

                        <div className="my-3 h-px bg-slate-200" />

                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-slate-600">
                                Free listing credits remaining
                            </span>

                            <span className="text-lg font-bold text-slate-950">
                                {freeCredits}
                            </span>
                        </div>
                    </div>

                    {hasFreeCredits ? (
                        <div className="mt-5 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                            <CheckCircle2
                                size={20}
                                className="mt-0.5 shrink-0 text-emerald-600"
                            />

                            <div>
                                <p className="text-sm font-semibold text-emerald-900">
                                    You can still create listings
                                </p>

                                <p className="mt-1 text-xs leading-5 text-emerald-800">
                                    You have {freeCredits} free listing
                                    {freeCredits === 1 ? " credit" : " credits"}{" "}
                                    remaining. Your next listing will use
                                    these credits automatically.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                            <p className="text-sm font-semibold text-amber-900">
                                Another plan is required
                            </p>

                            <p className="mt-1 text-xs leading-5 text-amber-800">
                                You have no free listing credits remaining.
                                Purchase another subscription plan to
                                create additional listings.
                            </p>
                        </div>
                    )}

                    <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                        >
                            {hasFreeCredits ? "Continue" : "Close"}
                        </button>

                        <button
                            ref={primaryButtonRef}
                            type="button"
                            onClick={onViewPlans}
                            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0877D9]"
                        >
                            Buy another plan
                            <ArrowRight size={17} />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}