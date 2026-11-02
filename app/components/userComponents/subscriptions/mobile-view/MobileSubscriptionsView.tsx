"use client";

import Link from "next/link";
import {
    motion,
    AnimatePresence,
    useReducedMotion,
} from "framer-motion";

import {
    ArrowRight,
    CalendarDays,
    Check,
    ChevronRight,
    Clock3,
    History,
    Wallet,
} from "lucide-react";

import { useCurrentSubscription } from "@/app/hooks/user/subscriptions/useCurrentSubscription";

type SubscriptionData = NonNullable<
    ReturnType<typeof useCurrentSubscription>["data"]
>;

type Subscription = SubscriptionData["subscription"];

interface MobileSubscriptionsViewProps {
    subscription: Subscription;
    creditBalance: number;
    daysRemaining: number;
    hasAccess: boolean;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.09,
            delayChildren: 0.04,
        },
    },
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 14,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1] as const,
        },
    },
};

function formatCurrency(
    amount: number | string,
    currency = "NGN",
) {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
}

function formatDate(date: string | null) {
    if (!date) return "Not started";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(parsed);
}

function StatusIndicator({
    status,
}: {
    status: string;
}) {
    const config: Record<
        string,
        { label: string; className: string; dot: string }
    > = {
        ACTIVE: {
            label: "Active",
            className: "bg-emerald-50 text-emerald-700",
            dot: "bg-emerald-500",
        },
        PENDING: {
            label: "Pending",
            className: "bg-amber-50 text-amber-700",
            dot: "bg-amber-500",
        },
        CANCELLED: {
            label: "Cancelled",
            className: "bg-orange-50 text-orange-700",
            dot: "bg-orange-500",
        },
        EXPIRED: {
            label: "Expired",
            className: "bg-gray-100 text-gray-600",
            dot: "bg-gray-400",
        },
    };

    const current = config[status] ?? config.EXPIRED;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold ${current.className}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
            {current.label}
        </span>
    );
}

export default function MobileSubscriptionsView({
    subscription,
    creditBalance,
    daysRemaining,
    hasAccess,
}: MobileSubscriptionsViewProps) {
    const shouldReduceMotion = useReducedMotion();

    const animation = shouldReduceMotion
        ? undefined
        : containerVariants;

    const isActive = subscription?.status === "ACTIVE";

    return (
        <main className="min-h-[100dvh] bg-[#F7F9FC] pb-8">
            <motion.div
                variants={animation}
                initial="hidden"
                animate="visible"
                className="mx-auto w-full max-w-lg px-4 pb-8 pt-5"
            >
                {/* Header */}
                <motion.header
                    variants={itemVariants}
                    className="mb-6 flex items-center justify-between"
                >
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1491FF]">
                            KARMASS
                        </p>

                        <h1 className="mt-1 text-[23px] font-bold tracking-tight text-gray-950">
                            Subscription
                        </h1>
                    </div>

                    {subscription && (
                        <StatusIndicator status={subscription.status} />
                    )}
                </motion.header>

                {/* Credit balance */}
                <motion.section
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#1491FF] to-[#0877D9] p-5 text-white shadow-[0_12px_28px_rgba(20,145,255,0.18)]"
                >
                    <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full border border-white/10" />

                    <div className="pointer-events-none absolute -right-5 -top-8 h-32 w-32 rounded-full border border-white/10" />

                    <div className="relative flex items-center gap-2 text-sm font-medium text-blue-100">
                        <Wallet size={17} />
                        Listing credits
                    </div>

                    <div className="relative mt-5 flex items-end justify-between">
                        <div>
                            <AnimatePresence mode="wait">
                                <motion.h2
                                    key={creditBalance}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.25 }}
                                    className="text-[42px] font-bold leading-none tracking-tight"
                                >
                                    {creditBalance.toLocaleString("en-NG")}
                                </motion.h2>
                            </AnimatePresence>

                            <p className="mt-2 text-xs text-blue-100">
                                Available credits
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                            <Wallet size={21} />
                        </div>
                    </div>
                </motion.section>

                {/* Subscription content */}
                {subscription ? (
                    <motion.section
                        variants={itemVariants}
                        className="mt-5 overflow-hidden rounded-[20px] border border-gray-200/80 bg-white shadow-[0_3px_12px_rgba(15,23,42,0.025)]"
                    >
                        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
                            <div>
                                <p className="text-[11px] font-medium text-gray-400">
                                    CURRENT PLAN
                                </p>

                                <h2 className="mt-1 text-base font-bold text-gray-950">
                                    {subscription.plan?.name ?? "KARMASS Plan"}
                                </h2>
                            </div>

                            <StatusIndicator status={subscription.status} />
                        </div>

                        <div className="grid grid-cols-2 gap-3 p-4">
                            <div className="rounded-xl bg-gray-50 p-3">
                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <Clock3 size={14} />

                                    <span className="text-[11px] font-medium">
                                        Time left
                                    </span>
                                </div>

                                <p className="mt-2 text-lg font-bold text-gray-950">
                                    {hasAccess
                                        ? `${daysRemaining} days`
                                        : "Expired"}
                                </p>
                            </div>

                            <div className="rounded-xl bg-gray-50 p-3">
                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <CalendarDays size={14} />

                                    <span className="text-[11px] font-medium">
                                        Expires on
                                    </span>
                                </div>

                                <p className="mt-2 text-sm font-bold text-gray-950">
                                    {formatDate(subscription.expiresAt)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3.5">
                            <span className="text-xs text-gray-500">
                                Plan price
                            </span>

                            <span className="text-sm font-bold text-gray-950">
                                {formatCurrency(
                                    subscription.effectivePrice,
                                    subscription.currency,
                                )}
                            </span>
                        </div>

                        {subscription.status === "CANCELLED" &&
                            daysRemaining > 0 && (
                                <div className="flex items-start gap-2 border-t border-orange-100 bg-orange-50 px-4 py-3">
                                    <Check
                                        size={15}
                                        className="mt-0.5 shrink-0 text-orange-600"
                                    />

                                    <p className="text-xs leading-5 text-orange-800">
                                        Your benefits remain available until{" "}
                                        {formatDate(subscription.expiresAt)}.
                                    </p>
                                </div>
                            )}
                    </motion.section>
                ) : (
                    <motion.section
                        variants={itemVariants}
                        className="mt-5 rounded-[20px] border border-gray-200 bg-white p-5 text-center shadow-sm"
                    >
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1491FF]">
                            <Wallet size={23} />
                        </div>

                        <h2 className="mt-4 text-base font-bold text-gray-950">
                            No active plan yet
                        </h2>

                        <p className="mt-1.5 text-xs leading-5 text-gray-500">
                            Choose a plan to get listing credits.
                        </p>

                        <Link
                            href="/dashboard/subscriptions/plans"
                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-4 py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] hover:bg-[#0877D9]"
                        >
                            View available plans
                            <ArrowRight size={16} />
                        </Link>
                    </motion.section>
                )}

                {/* Primary action for existing subscribers */}
                {subscription && (
                    <motion.div
                        variants={itemVariants}
                        className="mt-5"
                    >
                        <Link
                            href="/dashboard/subscriptions/plans"
                            className="flex w-full items-center justify-between rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3.5 transition active:scale-[0.99] hover:bg-blue-50"
                        >
                            <span className="text-sm font-semibold text-[#0877D9]">
                                View subscription plans
                            </span>

                            <ArrowRight
                                size={17}
                                className="text-[#1491FF]"
                            />
                        </Link>
                    </motion.div>
                )}

                {/* Payment history */}
                <motion.div
                    variants={itemVariants}
                    className="mt-7"
                >
                    <Link
                        href="/dashboard/subscriptions/history"
                        className="group flex items-center gap-3 rounded-xl px-1 py-2 transition-colors hover:bg-white"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm ring-1 ring-gray-100">
                            <History size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-800">
                                Payment history
                            </p>

                            <p className="mt-0.5 text-xs text-gray-400">
                                View your transactions
                            </p>
                        </div>

                        <ChevronRight
                            size={18}
                            className="text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-[#1491FF]"
                        />
                    </Link>
                </motion.div>

                {/* Small account reassurance */}
                <motion.p
                    variants={itemVariants}
                    className="mt-7 text-center text-[10px] text-gray-400"
                >
                    Secure subscription management by KARMASS
                </motion.p>
            </motion.div>
        </main>
    );
}