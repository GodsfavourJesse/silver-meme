"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
    CheckCircle2,
    Info,
    RefreshCw,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

import { useSubscriptionPlans } from "@/app/hooks/user/subscriptions/useSubscriptionPlans";
import { useCurrentSubscription } from "@/app/hooks/user/subscriptions/useCurrentSubscription";
import SubscriptionPlanCard from "@/app/components/userComponents/subscriptions/SubscriptionPlanCard";
import MobileSubscriptionPlansView from "@/app/components/userComponents/subscriptions/mobile-view/MobileSubscriptionPlansView";

export default function SubscriptionPlansPage() {
    const shouldReduceMotion = useReducedMotion();

    const {
        data: plans,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useSubscriptionPlans();

    const { data: currentData } = useCurrentSubscription();

    const currentSubscription = currentData?.subscription ?? null;
    const availablePlans = plans ?? [];

    const pageVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 18 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1] as const,
            },
        },
    };

    return (
        <>
            {/* Mobile experience */}
            <div className="md:hidden">
                <MobileSubscriptionPlansView
                    plans={availablePlans}
                    currentSubscription={currentSubscription}
                    isLoading={isLoading}
                    isError={isError}
                    error={error}
                    onRetry={() => refetch()}
                />
            </div>

            {/* Desktop experience */}
            <main className="hidden min-h-screen w-full bg-[#F8FAFC] px-6 py-10 md:block lg:px-8">
                <motion.div
                    variants={shouldReduceMotion ? undefined : pageVariants}
                    initial={shouldReduceMotion ? false : "hidden"}
                    animate="visible"
                    className="mx-auto w-full max-w-7xl space-y-9"
                >
                    {/* Header */}
                    <motion.header
                        variants={shouldReduceMotion ? undefined : itemVariants}
                        className="flex flex-col justify-between gap-5 border-b border-gray-100 pb-7 lg:flex-row lg:items-end"
                    >
                        <div>
                            <div className="flex items-center gap-2 text-sm font-semibold text-[#1491FF]">
                                <Sparkles size={17} />
                                KARMASS subscriptions
                            </div>

                            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
                                Choose your plan
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                                Find the right subscription for your vehicle
                                listings. Your credits, benefits and final
                                pricing will be shown before payment.
                            </p>
                        </div>

                        {currentSubscription && (
                            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
                                <CheckCircle2 size={15} />
                                Existing subscription:{" "}
                                {currentSubscription.status}
                            </div>
                        )}
                    </motion.header>

                    {/* Dealer benefit */}
                    <motion.div
                        variants={shouldReduceMotion ? undefined : itemVariants}
                        className="flex items-start gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-[#EAF5FF] to-white p-5"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#1491FF] shadow-sm">
                            <ShieldCheck size={23} />
                        </div>

                        <div>
                            <h2 className="text-sm font-bold text-gray-900">
                                Verified dealer benefits
                            </h2>

                            <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-600">
                                Verified KARMASS dealers may qualify for
                                discounted subscription pricing. Your
                                eligibility and final price are calculated
                                securely by our server.
                            </p>
                        </div>
                    </motion.div>

                    {/* Loading */}
                    {isLoading && (
                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-[430px] animate-pulse rounded-3xl border border-blue-100 bg-white"
                                />
                            ))}
                        </div>
                    )}

                    {/* Error */}
                    {isError && (
                        <motion.div
                            initial={
                                shouldReduceMotion
                                    ? false
                                    : { opacity: 0, y: 12 }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border border-red-100 bg-white p-7 shadow-sm"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                                    <Info size={21} />
                                </div>

                                <div className="flex-1">
                                    <h2 className="font-bold text-gray-900">
                                        Unable to load subscription plans
                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-gray-500">
                                        {error instanceof Error
                                            ? error.message
                                            : "Something went wrong. Please try again."}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => refetch()}
                                        disabled={isFetching}
                                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1491FF] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0877D9] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <RefreshCw
                                            size={15}
                                            className={
                                                isFetching ? "animate-spin" : ""
                                            }
                                        />
                                        Try again
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Available plans */}
                    {!isLoading &&
                        !isError &&
                        availablePlans.length > 0 && (
                            <motion.section
                                variants={
                                    shouldReduceMotion ? undefined : itemVariants
                                }
                                className="space-y-5"
                            >
                                <div className="flex items-end justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-950">
                                            Available plans
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {availablePlans.length} subscription{" "}
                                            {availablePlans.length === 1
                                                ? "plan"
                                                : "plans"}{" "}
                                            available.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                    {availablePlans.map((plan, index) => (
                                        <motion.div
                                            key={plan.id}
                                            initial={
                                                shouldReduceMotion
                                                    ? false
                                                    : { opacity: 0, y: 20 }
                                            }
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            transition={{
                                                duration: 0.4,
                                                delay: shouldReduceMotion
                                                    ? 0
                                                    : index * 0.07,
                                                ease: [0.22, 1, 0.36, 1],
                                            }}
                                            whileHover={
                                                shouldReduceMotion
                                                    ? undefined
                                                    : { y: -4 }
                                            }
                                        >
                                            <SubscriptionPlanCard
                                                plan={plan}
                                                currentSubscription={
                                                    currentSubscription
                                                }
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                    {/* Empty state */}
                    {!isLoading &&
                        !isError &&
                        availablePlans.length === 0 && (
                            <motion.div
                                variants={
                                    shouldReduceMotion ? undefined : itemVariants
                                }
                                className="rounded-3xl border border-dashed border-blue-200 bg-white px-6 py-16 text-center"
                            >
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF5FF] text-[#1491FF]">
                                    <Info size={25} />
                                </div>

                                <h2 className="mt-5 text-lg font-bold text-gray-900">
                                    No subscription plans available
                                </h2>

                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                                    There are currently no subscription plans
                                    available. Please check again later.
                                </p>
                            </motion.div>
                        )}

                    {/* Footer */}
                    <motion.footer
                        variants={shouldReduceMotion ? undefined : itemVariants}
                        className="border-t border-gray-100 pt-6"
                    >
                        <p className="text-center text-xs leading-6 text-gray-400">
                            Subscription payments are securely processed
                            through Paystack. Your subscription is activated
                            only after successful server-side payment
                            verification.
                        </p>
                    </motion.footer>
                </motion.div>
            </main>
        </>
    );
}