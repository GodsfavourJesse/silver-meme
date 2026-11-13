"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
    ArrowRight,
    Check,
    CheckCircle2,
    LoaderCircle,
    ShieldCheck,
    Tag,
} from "lucide-react";

import { toast } from "sonner";

import {
    SubscriptionPlan,
    SubscriptionPrice,
    UserSubscription,
} from "@/app/types/user/subscription/subscription.types";

import { useSubscriptionPrice } from "@/app/hooks/user/subscriptions/useSubscriptionPrice";
import { useInitializeSubscriptionPayment } from "@/app/hooks/user/subscriptions/useInitializeSubscriptionPayment";

interface SubscriptionPlanCardProps {
    plan: SubscriptionPlan;
    currentSubscription: UserSubscription | null;
}

function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(amount);
}

function PlanFeature({ children }: { children: ReactNode }) {
    return (
        <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-[#1491FF]/10 text-[#0877D9]">
                <Check size={12} strokeWidth={3} />
            </span>

            <span className="text-[13px] leading-5 text-slate-600">
                {children}
            </span>
        </li>
    );
}

function PriceDisplay({
    pricing,
}: {
    pricing: SubscriptionPrice;
}) {
    const originalPrice = Number(pricing.originalPrice);
    const effectivePrice = Number(pricing.effectivePrice);
    const discount = Number(pricing.appliedDiscountPercent);

    if (originalPrice === 0) {
        return (
            <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Subscription price
                </p>

                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-slate-950">
                        Free
                    </span>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                    {pricing.durationDays}-day subscription
                </p>
            </div>
        );
    }

    return (
        <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Subscription price
            </p>

            {discount > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-400 line-through">
                        {formatCurrency(originalPrice, pricing.currency)}
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                        <Tag size={11} />
                        {discount}% {pricing.isDealer ? "DEALER DISCOUNT" : "CUSTOMER DISCOUNT"}
                    </span>
                </div>
            )}

            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-[27px] font-bold tracking-tight text-slate-950 sm:text-3xl">
                    {formatCurrency(effectivePrice, pricing.currency)}
                </span>
            </div>

            <p className="mt-1 text-xs text-slate-500">
                Valid for {pricing.durationDays} days
            </p>
        </div>
    );
}

export default function SubscriptionPlanCard({
    plan,
    currentSubscription,
}: SubscriptionPlanCardProps) {
    const shouldReduceMotion = useReducedMotion();

    const [checkoutStarted, setCheckoutStarted] = useState(false);

    const {
        data: price,
        isLoading: priceLoading,
        isError: priceError,
        refetch: refetchPrice,
        isFetching: isPriceFetching,
    } = useSubscriptionPrice(plan.id);

    const initializePayment = useInitializeSubscriptionPayment();

    const isActiveSubscription =
        currentSubscription?.status === "ACTIVE";

    const isPendingSubscription =
        currentSubscription?.status === "PENDING";

    const isPendingForThisPlan =
        isPendingSubscription &&
        currentSubscription?.planId === plan.id;

    const hasBlockingSubscription =
        isActiveSubscription ||
        (isPendingSubscription && !isPendingForThisPlan);

    const isCurrentPlan =
        isActiveSubscription &&
        currentSubscription?.planId === plan.id;

    const discount = Number(price?.appliedDiscountPercent ?? 0);
    const hasDiscount = discount > 0;

    const handleSubscribe = async () => {
        if (!price) {
            toast.error("Plan pricing is not available yet.");
            return;
        }

        if (hasBlockingSubscription) {
            toast.error(
                isActiveSubscription
                    ? "You already have an active subscription."
                    : "You already have another subscription awaiting payment.",
            );

            return;
        }

        setCheckoutStarted(true);

        try {
            const result = await initializePayment.mutateAsync(plan.id);

            if (result.status === "SUCCESS") {
                toast.success("Your subscription payment is already complete.");

                window.location.assign(
                    "/dashboard/subscriptions",
                );

                return;
            }

            if (
                result.status === "FAILED" ||
                result.status === "ABANDONED"
            ) {
                toast.error(
                    "Your previous payment attempt has ended. Please try again.",
                );

                setCheckoutStarted(false);
                return;
            }

            if (!result.authorizationUrl) {
                toast.error(
                    "Your payment session is being recovered. Please try again shortly. Do not create another subscription.",
                );

                setCheckoutStarted(false);
                return;
            }

            toast.success(
                isPendingForThisPlan
                    ? "Resuming your existing payment..."
                    : "Redirecting you to secure checkout...",
            );

            window.location.assign(result.authorizationUrl);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to initialize payment. Please try again.",
            );

            setCheckoutStarted(false);
        }
    };

    const isProcessing =
        checkoutStarted || initializePayment.isPending;

    return (
        <motion.article
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={
                shouldReduceMotion
                    ? undefined
                    : { y: -3, transition: { duration: 0.2 } }
            }
            className={`relative flex h-full flex-col overflow-hidden rounded-3xl border transition-shadow duration-300 ${
                isCurrentPlan
                    ? "border-[#1491FF] bg-[#F0F7FF] shadow-[0_8px_30px_rgba(20,145,255,0.12)]"
                    : "border-[#E1EAF4] bg-[#F7FAFE] shadow-[0_4px_18px_rgba(15,40,75,0.04)] hover:shadow-[0_12px_30px_rgba(15,40,75,0.08)]"
            }`}
        >
            {/* Brand accent */}
            <div className="h-1 w-full bg-gradient-to-r from-[#1491FF] via-[#55B4FF] to-[#A6D9FF]" />

            <div className="flex h-full flex-col p-5 sm:p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#1491FF] shadow-sm ring-1 ring-blue-100">
                            <ShieldCheck size={22} />
                        </div>

                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1491FF]">
                                KARMASS PLAN
                            </p>

                            <h2 className="mt-1 break-words text-lg font-bold leading-tight text-slate-950 sm:text-xl">
                                {plan.name}
                            </h2>
                        </div>
                    </div>

                    {isCurrentPlan && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-blue-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#0877D9]">
                            <CheckCircle2 size={12} />
                            Current
                        </span>
                    )}
                </div>

                {/* Description */}
                <p className="mt-4 min-h-[40px] text-[13px] leading-5 text-slate-500">
                    {plan.description ||
                        "Get more visibility and manage your vehicle listings with KARMASS."}
                </p>

                {/* Pricing panel */}
                <div className="mt-5 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
                    {priceLoading ? (
                        <div className="space-y-3">
                            <div className="h-3 w-28 animate-pulse rounded bg-blue-50" />
                            <div className="h-8 w-40 animate-pulse rounded-lg bg-blue-100" />
                            <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                        </div>
                    ) : priceError || !price ? (
                        <div>
                            <p className="text-sm font-semibold text-slate-800">
                                Pricing unavailable
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                We couldn't retrieve the latest pricing.
                            </p>

                            <button
                                type="button"
                                onClick={() => refetchPrice()}
                                disabled={isPriceFetching}
                                className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#0877D9] hover:underline disabled:opacity-50"
                            >
                                <LoaderCircle
                                    size={13}
                                    className={
                                        isPriceFetching
                                            ? "animate-spin"
                                            : "hidden"
                                    }
                                />
                                Try again
                            </button>
                        </div>
                    ) : (
                        <PriceDisplay pricing={price} />
                    )}
                </div>

                {/* Benefits */}
                <div className="mt-6 flex-1">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                            What's included
                        </h3>

                        {price && (
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold text-[#0877D9]">
                                {price.listingCredits.toLocaleString("en-NG")}{" "}
                                credits
                            </span>
                        )}
                    </div>

                    {price ? (
                        <ul className="space-y-3.5">
                            <PlanFeature>
                                {price.listingCredits.toLocaleString("en-NG")}{" "}
                                vehicle listing credits
                            </PlanFeature>

                            <PlanFeature>
                                {price.durationDays}-day subscription period
                            </PlanFeature>

                            <PlanFeature>
                                Access to KARMASS listing benefits
                            </PlanFeature>

                            <PlanFeature>
                                Secure subscription management
                            </PlanFeature>

                            {hasDiscount && (
                                <PlanFeature>
                                    {discount}% {price?.isDealer ? "verified dealer discount" : "customer discount"}
                                </PlanFeature>
                            )}
                        </ul>
                    ) : priceLoading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-4 w-full animate-pulse rounded bg-blue-100/70"
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs leading-5 text-slate-400">
                            Plan benefits will appear when pricing is
                            available.
                        </p>
                    )}
                </div>

                {/* Applied discount notice */}
                {price && hasDiscount && (
                    <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/80 p-3">
                        <Tag
                            size={15}
                            className="mt-0.5 shrink-0 text-emerald-700"
                        />

                        <p className="text-xs leading-5 text-emerald-800">
                            {price.isDealer
                                ? "Your verified dealer discount has been applied to this plan."
                                : "Your customer subscription discount has been applied to this plan."}
                        </p>
                    </div>
                )}

                {/* Action */}
                <div className="mt-6 border-t border-blue-100 pt-5">
                    <button
                        type="button"
                        onClick={handleSubscribe}
                        disabled={
                            !price ||
                            priceLoading ||
                            priceError ||
                            isProcessing ||
                            hasBlockingSubscription
                        }
                        className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed ${
                            isCurrentPlan
                                ? "border border-blue-200 bg-white text-[#0877D9]"
                                : hasBlockingSubscription
                                  ? "border border-slate-200 bg-slate-100 text-slate-400"
                                  : "bg-[#1491FF] text-white shadow-[0_4px_12px_rgba(20,145,255,0.2)] hover:bg-[#0877D9] hover:shadow-[0_6px_16px_rgba(20,145,255,0.25)] disabled:bg-blue-200 disabled:shadow-none"
                        }`}
                    >
                        {isProcessing ? (
                            <>
                                <LoaderCircle
                                    size={17}
                                    className="animate-spin"
                                />
                                Initializing payment...
                            </>
                        ) : isCurrentPlan ? (
                            <>
                                <CheckCircle2 size={17} />
                                Current plan
                            </>
                        ) : hasBlockingSubscription ? (
                            isActiveSubscription
                                ? "Subscription active"
                                : "Another payment is pending"
                        ) : (
                            <>
                                {isPendingForThisPlan
                                    ? "Resume payment"
                                    : "Continue to payment"}

                                <ArrowRight size={17} />
                            </>
                        )}
                    </button>

                    {!hasBlockingSubscription && (
                        <div className="mt-3 flex items-center justify-center gap-1.5 text-center">
                            <ShieldCheck
                                size={13}
                                className="shrink-0 text-slate-400"
                            />

                            <p className="text-[10px] font-medium text-slate-400">
                                Secure payment powered by Paystack
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </motion.article>
    );
}
