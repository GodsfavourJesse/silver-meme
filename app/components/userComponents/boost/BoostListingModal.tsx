"use client";

import { useEffect, useMemo, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    ChevronLeft,
    LoaderCircle,
    ShieldCheck,
    Sparkles,
    X,
} from "lucide-react";

import { toast } from "sonner";

import {
    useBoostPlans,
    useCreateListingBoost,
} from "@/app/hooks/user/boost/useBoost";

import {
    useInitializeBoostPayment,
} from "@/app/hooks/user/boost/useInitializeBoostPayment";

import type {
    BoostPlan,
} from "@/app/types/user/boost/boost.types";

import BoostPlanCard from "./BoostPlanCard";
import BoostPaymentSummary from "./BoostPaymentSummary";

// ============================================
// PROPS
// ============================================

interface BoostListingModalProps {
    open: boolean;

    listingId: string;
    listingTitle: string;

    vehicleImageUrl?: string | null;

    onClose: () => void;
}

// ============================================
// COMPONENT
// ============================================

export default function BoostListingModal({
    open,
    listingId,
    listingTitle,
    vehicleImageUrl,
    onClose,
}: BoostListingModalProps) {
    const [selectedPlan, setSelectedPlan] =
        useState<BoostPlan | null>(null);

    const [createdBoostId, setCreatedBoostId] =
        useState<string | null>(null);

    const [paymentInitializationFailed, setPaymentInitializationFailed] =
        useState(false);

    const {
        data: plans = [],
        isLoading: plansLoading,
        isError: plansError,
        refetch: refetchPlans,
    } = useBoostPlans(open);

    const createBoost = useCreateListingBoost();

    const initializePayment = useInitializeBoostPayment();

    const isProcessing =
        createBoost.isPending ||
        initializePayment.isPending;

    const availablePlans = useMemo(
        () => plans.filter((plan) => Number(plan.active) === 1),
        [plans],
    );

    // ============================================
    // RESET WHEN OPENED FOR A DIFFERENT SESSION
    // ============================================

    useEffect(() => {
        if (!open) {
            return;
        }

        setSelectedPlan(null);
        setCreatedBoostId(null);
        setPaymentInitializationFailed(false);
    }, [open, listingId]);

    // ============================================
    // ESCAPE KEY + BODY SCROLL
    // ============================================

    useEffect(() => {
        if (!open) {
            return;
        }

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isProcessing) {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;

            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [open, isProcessing, onClose]);

    // ============================================
    // SELECT FIRST AVAILABLE PLAN
    // ============================================

    useEffect(() => {
        if (
            availablePlans.length > 0 &&
            !selectedPlan
        ) {
            setSelectedPlan(availablePlans[0]);
        }
    }, [availablePlans, selectedPlan]);

    // ============================================
    // START PAYMENT
    // ============================================

    const startPayment = async (boostId: string) => {
        setPaymentInitializationFailed(false);

        try {
            const payment = await initializePayment.mutateAsync(
                boostId,
            );

            if (!payment.authorizationUrl) {
                throw new Error(
                    "The payment provider did not return a checkout URL. Please try again.",
                );
            }

            window.location.assign(
                payment.authorizationUrl,
            );
        } catch (error) {
            setPaymentInitializationFailed(true);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to initialize payment.",
            );
        }
    };

    // ============================================
    // CREATE BOOST + INITIALIZE PAYMENT
    // ============================================

    const handleContinue = async () => {
        if (!listingId) {
            toast.error("The selected vehicle could not be identified.");
            return;
        }

        if (!selectedPlan) {
            toast.error("Please select a boost plan.");
            return;
        }

        try {
            let boostId = createdBoostId;

            // Create the boost only once.
            if (!boostId) {
                const boost = await createBoost.mutateAsync({
                    listingId,
                    boostPlanId: selectedPlan.id,
                });

                boostId = boost.id;

                setCreatedBoostId(boostId);
            }

            // Initialize or retry payment for the same boost.
            await startPayment(boostId);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to create your boost request.",
            );
        }
    };

    // ============================================
    // CLOSE MODAL
    // ============================================

    const handleClose = () => {
        if (isProcessing) {
            return;
        }

        onClose();
    };

    // ============================================
    // RENDER
    // ============================================

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 backdrop-blur-[3px] sm:items-center sm:p-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !isProcessing
                        ) {
                            handleClose();
                        }
                    }}
                >
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="boost-modal-title"
                        initial={{
                            opacity: 0,
                            y: 35,
                            scale: 0.98,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: 25,
                            scale: 0.98,
                        }}
                        transition={{
                            duration: 0.22,
                            ease: "easeOut",
                        }}
                        className="flex max-h-[94dvh] w-full max-w-[680px] flex-col overflow-hidden rounded-t-[26px] bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-[26px]"
                    >
                        {/* ================================= */}
                        {/* HEADER */}
                        {/* ================================= */}

                        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#0877D9] via-[#1491FF] to-[#42AAFF] px-5 pb-6 pt-5 text-white sm:px-7 sm:pt-6">
                            <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full border-[28px] border-white/10" />

                            <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

                            <div className="relative flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-inner backdrop-blur-sm">
                                        <Sparkles
                                            size={23}
                                            fill="currentColor"
                                            className="text-white"
                                        />
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100">
                                            KARMASS Promotion
                                        </p>

                                        <h2
                                            id="boost-modal-title"
                                            className="mt-1 text-xl font-extrabold tracking-tight sm:text-2xl"
                                        >
                                            Boost your vehicle
                                        </h2>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={isProcessing}
                                    aria-label="Close boost modal"
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <X size={19} />
                                </button>
                            </div>

                            <p className="relative mt-4 max-w-md text-sm leading-6 text-blue-50">
                                Give this vehicle more visibility and
                                help more potential buyers discover it.
                            </p>
                        </div>

                        {/* ================================= */}
                        {/* CONTENT */}
                        {/* ================================= */}

                        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
                            {/* Individual listing notice */}

                            <div className="mb-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-[#F4F9FF] p-3.5">
                                <ShieldCheck
                                    size={19}
                                    className="mt-0.5 shrink-0 text-[#1491FF]"
                                />

                                <div>
                                    <p className="text-xs font-bold text-slate-800">
                                        Promoting one vehicle only
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        This boost applies exclusively to
                                        the selected listing. Your other
                                        vehicles will remain unaffected.
                                    </p>
                                </div>
                            </div>

                            {/* Created boost / payment retry notice */}

                            {createdBoostId && paymentInitializationFailed && (
                                <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
                                    <AlertCircle
                                        size={19}
                                        className="mt-0.5 shrink-0 text-amber-600"
                                    />

                                    <div>
                                        <p className="text-xs font-bold text-amber-800">
                                            Payment initialization unsuccessful
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-amber-700">
                                            Your boost request has already
                                            been created. You can retry
                                            payment without creating another
                                            boost request.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Vehicle title */}

                            <div className="mb-5">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Selected vehicle
                                </p>

                                <p className="mt-1 text-sm font-bold text-slate-900">
                                    {listingTitle}
                                </p>
                            </div>

                            {/* Plans heading */}

                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-extrabold text-slate-900">
                                        Choose your boost plan
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Select the promotion duration
                                        that works for you.
                                    </p>
                                </div>

                                {!plansLoading && availablePlans.length > 0 && (
                                    <span className="rounded-full bg-[#EAF5FF] px-3 py-1 text-[10px] font-bold text-[#0877D9]">
                                        {availablePlans.length} available
                                    </span>
                                )}
                            </div>

                            {/* Loading */}

                            {plansLoading && (
                                <div className="space-y-3">
                                    {[1, 2].map((item) => (
                                        <div
                                            key={item}
                                            className="h-[145px] animate-pulse rounded-2xl border border-slate-100 bg-slate-50"
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Error */}

                            {!plansLoading && plansError && (
                                <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
                                    <AlertCircle
                                        size={25}
                                        className="mx-auto text-red-500"
                                    />

                                    <p className="mt-3 text-sm font-bold text-slate-800">
                                        Unable to load boost plans
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Please check your connection
                                        and try again.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => refetchPlans()}
                                        className="mt-4 rounded-xl bg-[#1491FF] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0877D9]"
                                    >
                                        Try again
                                    </button>
                                </div>
                            )}

                            {/* Empty plans */}

                            {!plansLoading &&
                                !plansError &&
                                availablePlans.length === 0 && (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-9 text-center">
                                        <Sparkles
                                            size={27}
                                            className="mx-auto text-slate-300"
                                        />

                                        <p className="mt-3 text-sm font-bold text-slate-800">
                                            No boost plans available
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Please check back later.
                                        </p>
                                    </div>
                                )}

                            {/* Available plans */}

                            {!plansLoading &&
                                !plansError &&
                                availablePlans.length > 0 && (
                                    <div className="space-y-3">
                                        {availablePlans.map((plan) => (
                                            <BoostPlanCard
                                                key={plan.id}
                                                plan={plan}
                                                selected={
                                                    selectedPlan?.id === plan.id
                                                }
                                                onSelect={(selected) => {
                                                    if (!createdBoostId) {
                                                        setSelectedPlan(selected);
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                            {/* Payment summary */}

                            {selectedPlan && (
                                <div className="mt-6">
                                    <BoostPaymentSummary
                                        listingTitle={listingTitle}
                                        plan={selectedPlan}
                                        vehicleImageUrl={vehicleImageUrl}
                                    />
                                </div>
                            )}

                            {/* Approval note */}

                            <div className="mt-5 flex items-start gap-2.5">
                                <CheckCircle2
                                    size={16}
                                    className="mt-0.5 shrink-0 text-emerald-500"
                                />

                                <p className="text-[11px] leading-5 text-slate-500">
                                    After successful payment, KARMASS will
                                    verify your transaction. Your boost
                                    will become active once approved.
                                </p>
                            </div>
                        </div>

                        {/* ================================= */}
                        {/* FOOTER */}
                        {/* ================================= */}

                        <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={isProcessing}
                                    className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
                                >
                                    <ChevronLeft size={17} />
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    disabled={
                                        isProcessing ||
                                        plansLoading ||
                                        plansError ||
                                        availablePlans.length === 0 ||
                                        !selectedPlan
                                    }
                                    onClick={handleContinue}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-6 py-3.5 text-sm font-bold text-white shadow-[0_6px_18px_rgba(20,145,255,0.22)] transition hover:bg-[#0877D9] hover:shadow-[0_8px_22px_rgba(20,145,255,0.30)] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isProcessing ? (
                                        <>
                                            <LoaderCircle
                                                size={18}
                                                className="animate-spin"
                                            />

                                            {createBoost.isPending
                                                ? "Creating boost..."
                                                : "Preparing payment..."}
                                        </>
                                    ) : createdBoostId ? (
                                        <>
                                            Retry payment
                                            <ArrowRight size={17} />
                                        </>
                                    ) : (
                                        <>
                                            Continue to payment
                                            <ArrowRight size={17} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}