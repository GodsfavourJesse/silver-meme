"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    CheckCircle2,
    Info,
    RefreshCw,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { useState } from "react";
import { X } from "lucide-react";

import { useSubscriptionPlans } from "@/app/hooks/user/subscriptions/useSubscriptionPlans";
import { useCurrentSubscription } from "@/app/hooks/user/subscriptions/useCurrentSubscription";
import SubscriptionPlanCard from "@/app/components/userComponents/subscriptions/SubscriptionPlanCard";

type Plans = NonNullable<
    ReturnType<typeof useSubscriptionPlans>["data"]
>;

type CurrentSubscription = NonNullable<
    ReturnType<typeof useCurrentSubscription>["data"]
>["subscription"];

interface MobileSubscriptionPlansViewProps {
    plans: Plans;
    currentSubscription: CurrentSubscription | null | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    onRetry: () => void;
}

export default function MobileSubscriptionPlansView({
    plans,
    currentSubscription,
    isLoading,
    isError,
    error,
    onRetry,
}: MobileSubscriptionPlansViewProps) {
    const shouldReduceMotion = useReducedMotion();
    const [showDealerNotice, setShowDealerNotice] = useState(true);

    const motionProps = shouldReduceMotion
        ? {}
        : {
              initial: { opacity: 0, y: 14 },
              animate: { opacity: 1, y: 0 },
              transition: {
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1] as const,
              },
          };

    return (
        <main className="min-h-screen bg-[#F5F9FF] px-4 pb-10 pt-5">
            <motion.div
                {...motionProps}
                className="mx-auto max-w-lg space-y-6"
            >
                {/* Compact header */}
                <header className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1491FF]/10 text-[#1491FF]">
                                <Sparkles size={18} />
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1491FF]">
                                    KARMASS
                                </p>
                                <p className="text-xs text-gray-500">
                                    Subscription plans
                                </p>
                            </div>
                        </div>

                        {currentSubscription && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700">
                                <CheckCircle2 size={13} />
                                {currentSubscription.status}
                            </span>
                        )}
                    </div>

                    <div>
                        <h1 className="text-[26px] font-bold leading-tight tracking-tight text-gray-950">
                            Choose your plan.
                        </h1>

                        <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                            Pick a plan to get listing credits and put your
                            vehicles in front of more buyers.
                        </p>
                    </div>
                </header>

                {/* Dealer benefit */}
                <AnimatePresence>
                    {showDealerNotice && (
                        <motion.div
                            initial={{ opacity: 0, y: -12, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            role="status"
                            className="relative flex items-start gap-3 rounded-2xl border border-blue-100 bg-white p-3.5 pr-11 shadow-[0_4px_18px_rgba(20,145,255,0.07)]"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#1491FF]">
                                <ShieldCheck size={20} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900">
                                    Verified dealer benefit
                                </p>

                                <p className="mt-0.5 text-xs leading-5 text-gray-500">
                                    Eligible dealers get discounted subscription pricing
                                    automatically.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowDealerNotice(false)}
                                aria-label="Dismiss notification"
                                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 active:scale-90"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading */}
                {isLoading && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-32 animate-pulse rounded bg-blue-100" />
                            <div className="h-3 w-16 animate-pulse rounded bg-blue-50" />
                        </div>

                        {Array.from({ length: 2 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-[390px] animate-pulse rounded-3xl border border-blue-100 bg-white"
                            />
                        ))}
                    </div>
                )}

                {/* Error */}
                {isError && (
                    <div className="rounded-2xl border border-red-100 bg-white p-5 text-center shadow-sm">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                            <Info size={22} />
                        </div>

                        <h2 className="mt-3 text-base font-bold text-gray-900">
                            Plans couldn’t load
                        </h2>

                        <p className="mt-1 text-sm leading-6 text-gray-500">
                            {error instanceof Error
                                ? error.message
                                : "Something went wrong. Please try again."}
                        </p>

                        <button
                            type="button"
                            onClick={onRetry}
                            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-4 text-sm font-semibold text-white transition active:scale-[0.98] hover:bg-[#0877D9]"
                        >
                            <RefreshCw size={15} />
                            Try again
                        </button>
                    </div>
                )}

                {/* Plans */}
                {!isLoading && !isError && plans.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-end justify-between">
                            <div>
                                <h2 className="text-base font-bold text-gray-950">
                                    Available plans
                                </h2>
                                <p className="mt-1 text-xs text-gray-500">
                                    Choose what works for you.
                                </p>
                            </div>

                            <span className="rounded-full bg-[#EAF5FF] px-2.5 py-1 text-xs font-semibold text-[#0877D9]">
                                {plans.length}{" "}
                                {plans.length === 1 ? "plan" : "plans"}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {plans.map((plan, index) => (
                                    <motion.div
                                        key={plan.id}
                                        initial={
                                            shouldReduceMotion
                                                ? false
                                                : { opacity: 0, y: 18 }
                                        }
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.35,
                                            delay: shouldReduceMotion
                                                ? 0
                                                : index * 0.07,
                                            ease: [0.22, 1, 0.36, 1],
                                        }}
                                    >
                                        <SubscriptionPlanCard
                                            plan={plan}
                                            currentSubscription={
                                                currentSubscription ?? null
                                            }
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </section>
                )}

                {/* Empty state */}
                {!isLoading && !isError && plans.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-blue-200 bg-white px-5 py-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF5FF] text-[#1491FF]">
                            <Info size={22} />
                        </div>

                        <h2 className="mt-4 text-base font-bold text-gray-900">
                            No plans available
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            There are no subscription plans available right
                            now. Please check back later.
                        </p>
                    </div>
                )}

                <p className="px-3 text-center text-[11px] leading-5 text-gray-400">
                    Payments are securely processed through Paystack.
                    Your subscription is activated after successful
                    payment verification.
                </p>
            </motion.div>
        </main>
    );
}