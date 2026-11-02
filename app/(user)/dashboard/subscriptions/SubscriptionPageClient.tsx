"use client";

import {
    motion,
    AnimatePresence,
    useReducedMotion,
} from "framer-motion";

import {
    ArrowRight,
    BadgePercent,
    CalendarCheck,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    CircleDollarSign,
    Clock3,
    CreditCard,
    History,
    Layers3,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    Wallet,
} from "lucide-react";

import Link from "next/link";

import { useCurrentSubscription } from "@/app/hooks/user/subscriptions/useCurrentSubscription";
import MobileSubscriptionsView from "@/app/components/userComponents/subscriptions/mobile-view/MobileSubscriptionsView";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type CurrentSubscriptionData = NonNullable<
    ReturnType<typeof useCurrentSubscription>["data"]
>;

type Subscription = CurrentSubscriptionData["subscription"];

/* -------------------------------------------------------------------------- */
/*                              Motion Settings                              */
/* -------------------------------------------------------------------------- */

const PAGE_VARIANTS = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05,
        },
    },
};

const ITEM_VARIANTS = {
    hidden: {
        opacity: 0,
        y: 18,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1] as const,
        },
    },
};

const CARD_HOVER = {
    y: -4,
    transition: {
        duration: 0.2,
        ease: "easeOut" as const,
    },
};

/* -------------------------------------------------------------------------- */
/*                                Utilities                                   */
/* -------------------------------------------------------------------------- */

function formatCurrency(
    amount: number | string,
    currency = "NGN",
) {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
}

function formatDate(date: string | null) {
    if (!date) return "Not started";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(parsedDate);
}

function getDaysRemaining(expiresAt: string | null) {
    if (!expiresAt) return 0;

    const expiry = new Date(expiresAt).getTime();

    if (Number.isNaN(expiry)) return 0;

    const difference = expiry - Date.now();

    return Math.max(
        0,
        Math.ceil(difference / (1000 * 60 * 60 * 24)),
    );
}

function formatStatus(status: string) {
    return status.charAt(0) + status.slice(1).toLowerCase();
}

/* -------------------------------------------------------------------------- */
/*                                Status Badge                                */
/* -------------------------------------------------------------------------- */

function StatusBadge({
    status,
}: {
    status: string;
}) {
    const styles: Record<
        string,
        {
            container: string;
            dot: string;
            label: string;
        }
    > = {
        ACTIVE: {
            container:
                "border-emerald-200 bg-emerald-50 text-emerald-700",
            dot: "bg-emerald-500",
            label: "Active",
        },
        PENDING: {
            container:
                "border-amber-200 bg-amber-50 text-amber-700",
            dot: "bg-amber-500",
            label: "Pending",
        },
        CANCELLED: {
            container:
                "border-orange-200 bg-orange-50 text-orange-700",
            dot: "bg-orange-500",
            label: "Cancelled",
        },
        EXPIRED: {
            container:
                "border-gray-200 bg-gray-100 text-gray-600",
            dot: "bg-gray-400",
            label: "Expired",
        },
    };

    const config = styles[status] ?? styles.EXPIRED;

    return (
        <span
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${config.container}`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
            />

            {config.label ?? formatStatus(status)}
        </span>
    );
}

/* -------------------------------------------------------------------------- */
/*                              Section Heading                              */
/* -------------------------------------------------------------------------- */

function SectionHeading({
    eyebrow,
    title,
    description,
}: {
    eyebrow?: string;
    title: string;
    description?: string;
}) {
    return (
        <div>
            {eyebrow && (
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1491FF]">
                    {eyebrow}
                </p>
            )}

            <h2 className="text-lg font-bold tracking-tight text-gray-950 sm:text-xl">
                {title}
            </h2>

            {description && (
                <p className="mt-1.5 text-sm leading-6 text-gray-500">
                    {description}
                </p>
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                              Loading State                                 */
/* -------------------------------------------------------------------------- */

function OverviewSkeleton() {
    return (
        <div className="space-y-8">
            <div className="animate-pulse space-y-3">
                <div className="h-3 w-32 rounded-full bg-blue-100" />

                <div className="h-8 w-56 max-w-full rounded-lg bg-gray-100" />

                <div className="h-4 w-80 max-w-full rounded-full bg-gray-100" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="h-48 animate-pulse rounded-2xl bg-blue-100/70 sm:col-span-2 xl:col-span-1" />

                {Array.from({ length: 2 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-48 animate-pulse rounded-2xl border border-gray-100 bg-gray-50"
                    />
                ))}
            </div>

            <div className="h-64 animate-pulse rounded-2xl border border-gray-100 bg-gray-50" />

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="h-24 animate-pulse rounded-2xl bg-gray-100" />

                <div className="h-24 animate-pulse rounded-2xl bg-gray-100" />
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                               Error State                                  */
/* -------------------------------------------------------------------------- */

function ErrorState({
    message,
    onRetry,
    isFetching,
}: {
    message: string;
    onRetry: () => void;
    isFetching: boolean;
}) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 16,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            className="mx-auto flex min-h-[420px] max-w-xl flex-col items-center justify-center px-4 text-center"
        >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500">
                <RefreshCw size={27} />
            </div>

            <h2 className="mt-6 text-xl font-bold tracking-tight text-gray-950">
                We couldn't load your subscription
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                {message}
            </p>

            <button
                type="button"
                onClick={onRetry}
                disabled={isFetching}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-[#0877D9] disabled:cursor-not-allowed disabled:opacity-60"
            >
                <RefreshCw
                    size={16}
                    className={isFetching ? "animate-spin" : ""}
                />

                Try again
            </button>
        </motion.div>
    );
}

/* -------------------------------------------------------------------------- */
/*                                 Metric Card                                */
/* -------------------------------------------------------------------------- */

function MetricCard({
    icon: Icon,
    label,
    value,
    description,
    iconColor = "text-[#1491FF]",
    iconBackground = "bg-blue-50",
    children,
}: {
    icon: typeof Wallet;
    label: string;
    value: string;
    description: string;
    iconColor?: string;
    iconBackground?: string;
    children?: React.ReactNode;
}) {
    return (
        <motion.div
            variants={ITEM_VARIANTS}
            whileHover={CARD_HOVER}
            className="group relative flex min-h-[184px] flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.025)] transition-shadow hover:border-blue-200 hover:shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:p-6"
        >
            <div className="flex items-start justify-between gap-3">
                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBackground} ${iconColor}`}
                >
                    <Icon size={21} strokeWidth={2} />
                </div>

                {children}
            </div>

            <div className="mt-auto pt-7">
                <p className="text-sm font-medium text-gray-500">
                    {label}
                </p>

                <h3 className="mt-1.5 text-2xl font-bold tracking-tight text-gray-950">
                    {value}
                </h3>

                <p className="mt-2 text-xs leading-5 text-gray-400">
                    {description}
                </p>
            </div>
        </motion.div>
    );
}

/* -------------------------------------------------------------------------- */
/*                            Listing Credit Card                             */
/* -------------------------------------------------------------------------- */

function CreditBalanceCard({
    balance,
}: {
    balance: number;
}) {
    return (
        <motion.div
            variants={ITEM_VARIANTS}
            whileHover={CARD_HOVER}
            className="group relative min-h-[184px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#1491FF] via-[#087FE8] to-[#0065C9] p-5 text-white shadow-[0_12px_30px_rgba(20,145,255,0.18)] sm:p-6"
        >
            <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -right-4 -top-8 h-32 w-32 rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -bottom-20 right-20 h-44 w-44 rounded-full bg-white/[0.06] blur-2xl" />

            <div className="relative flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/15 backdrop-blur-sm">
                    <Wallet size={22} />
                </div>

                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/95">
                    Available balance
                </span>
            </div>

            <div className="relative mt-7">
                <p className="text-sm font-medium text-blue-100">
                    Listing credits
                </p>

                <motion.h3
                    key={balance}
                    initial={{
                        opacity: 0.5,
                        y: 8,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    className="mt-1 text-4xl font-bold tracking-tight sm:text-[42px]"
                >
                    {balance.toLocaleString("en-NG")}
                </motion.h3>

                <p className="mt-2 max-w-xs text-xs leading-5 text-blue-100">
                    Credits available to publish your vehicle listings.
                </p>
            </div>
        </motion.div>
    );
}

/* -------------------------------------------------------------------------- */
/*                          Subscription Detail Item                         */
/* -------------------------------------------------------------------------- */

function DetailItem({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon: typeof CalendarDays;
}) {
    return (
        <div className="flex min-w-0 items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4 transition-colors hover:bg-blue-50/50">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#1491FF] shadow-sm ring-1 ring-gray-100">
                <Icon size={17} />
            </div>

            <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400">
                    {label}
                </p>

                <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                    {value}
                </p>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                           Subscription Details                             */
/* -------------------------------------------------------------------------- */

function SubscriptionDetails({
    subscription,
}: {
    subscription: Subscription;
}) {
    if (!subscription) return null;

    const discount = Number(
        subscription.dealerDiscountPercent,
    );

    return (
        <motion.section
            variants={ITEM_VARIANTS}
            className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.025)]"
        >
            <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1491FF]">
                        <CreditCard size={20} />
                    </div>

                    <div>
                        <h2 className="text-base font-bold text-gray-950 sm:text-lg">
                            Subscription details
                        </h2>

                        <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                            A breakdown of your current subscription.
                        </p>
                    </div>
                </div>

                <StatusBadge status={subscription.status} />
            </div>

            <div className="p-5 sm:p-6">
                <div className="mb-6 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-white p-4 sm:p-5">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                Current plan
                            </p>

                            <h3 className="mt-1 text-xl font-bold tracking-tight text-gray-950">
                                {subscription.plan?.name ?? "KARMASS Plan"}
                            </h3>
                        </div>

                        <div className="sm:text-right">
                            <p className="text-xs font-medium text-gray-500">
                                Subscription price
                            </p>

                            <p className="mt-1 text-xl font-bold tracking-tight text-[#0877D9]">
                                {formatCurrency(
                                    subscription.effectivePrice,
                                    subscription.currency,
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailItem
                        icon={CircleDollarSign}
                        label="Original price"
                        value={formatCurrency(
                            subscription.originalPrice,
                            subscription.currency,
                        )}
                    />

                    <DetailItem
                        icon={Wallet}
                        label="Listing credits"
                        value={subscription.listingCredits.toLocaleString("en-NG")}
                    />

                    <DetailItem
                        icon={CalendarCheck}
                        label="Subscription duration"
                        value={`${subscription.durationDays} days`}
                    />

                    <DetailItem
                        icon={CalendarDays}
                        label="Start date"
                        value={formatDate(subscription.startsAt)}
                    />

                    <DetailItem
                        icon={Clock3}
                        label="Expiration date"
                        value={formatDate(subscription.expiresAt)}
                    />

                    <DetailItem
                        icon={BadgePercent}
                        label="Dealer discount"
                        value={`${discount.toLocaleString("en-NG")}%`}
                    />
                </div>

                {discount > 0 && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                            <CheckCircle2 size={19} />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-emerald-800">
                                Dealer discount applied
                            </p>

                            <p className="mt-1 text-xs leading-5 text-emerald-700">
                                You received a {discount}% dealer discount on this subscription.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </motion.section>
    );
}

/* -------------------------------------------------------------------------- */
/*                            Empty Subscription                              */
/* -------------------------------------------------------------------------- */

function EmptySubscription() {
    return (
        <motion.section
            variants={ITEM_VARIANTS}
            className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/90 via-white to-white px-5 py-12 text-center sm:px-10 sm:py-16"
        >
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-100/50 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-blue-100/40 blur-3xl" />

            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-white text-[#1491FF] shadow-sm">
                <Sparkles size={28} />
            </div>

            <div className="relative mx-auto mt-6 max-w-lg">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#1491FF]">
                    Get more from KARMASS
                </p>

                <h2 className="mt-2 text-xl font-bold tracking-tight text-gray-950 sm:text-2xl">
                    Find a plan that works for you
                </h2>

                <p className="mt-3 text-sm leading-7 text-gray-500">
                    Choose a subscription to get listing credits and
                    make the most of your vehicle listings on KARMASS.
                </p>

                <Link
                    href="/dashboard/subscriptions/plans"
                    className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(20,145,255,0.2)] transition hover:bg-[#0877D9] hover:shadow-[0_7px_18px_rgba(20,145,255,0.25)] sm:w-auto"
                >
                    Explore subscription plans
                    <ArrowRight size={17} />
                </Link>
            </div>
        </motion.section>
    );
}

/* -------------------------------------------------------------------------- */
/*                              Quick Link Card                               */
/* -------------------------------------------------------------------------- */

function QuickLinkCard({
    href,
    icon: Icon,
    title,
    description,
    label,
}: {
    href: string;
    icon: typeof CreditCard;
    title: string;
    description: string;
    label: string;
}) {
    return (
        <motion.div
            variants={ITEM_VARIANTS}
            whileHover={CARD_HOVER}
        >
            <Link
                href={href}
                className="group flex h-full items-center gap-4 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.025)] transition-all hover:border-blue-200 hover:shadow-[0_10px_25px_rgba(15,23,42,0.05)] sm:p-5"
            >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1491FF] transition-colors group-hover:bg-[#1491FF] group-hover:text-white">
                    <Icon size={21} />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                        {label}
                    </p>

                    <h3 className="mt-1 text-sm font-bold text-gray-900">
                        {title}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                        {description}
                    </p>
                </div>

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-all group-hover:translate-x-1 group-hover:bg-blue-50 group-hover:text-[#1491FF]">
                    <ChevronRight size={19} />
                </div>
            </Link>
        </motion.div>
    );
}

/* -------------------------------------------------------------------------- */
/*                            Desktop Subscription                            */
/* -------------------------------------------------------------------------- */

function DesktopSubscriptionsView({
    subscription,
    creditBalance,
    daysRemaining,
    hasAccess,
}: {
    subscription: Subscription;
    creditBalance: number;
    daysRemaining: number;
    hasAccess: boolean;
}) {
    return (
        <main className="min-h-screen w-full bg-[#F8FAFC]">
            <motion.div
                variants={PAGE_VARIANTS}
                initial="hidden"
                animate="visible"
                className="mx-auto w-full max-w-7xl space-y-7 px-4 py-8 sm:space-y-9 sm:px-6 lg:px-8 lg:py-10"
            >
                {/* Page header */}
                <motion.header
                    variants={ITEM_VARIANTS}
                    className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
                >
                    <div className="min-w-0">
                        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#1491FF]">
                            <Layers3 size={15} />

                            <span className="uppercase tracking-[0.12em]">
                                Account management
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl lg:text-[34px]">
                            My subscription
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-[15px]">
                            Keep track of your subscription, listing
                            credits and the benefits available to your account.
                        </p>
                    </div>
                </motion.header>

                {/* Overview */}
                <section className="space-y-4">
                    <SectionHeading
                        eyebrow="Your account at a glance"
                        title="Subscription overview"
                        description="A quick look at your available credits and subscription status."
                    />

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <CreditBalanceCard balance={creditBalance} />

                        <MetricCard
                            icon={ShieldCheck}
                            label="Subscription status"
                            value={
                                subscription
                                    ? formatStatus(subscription.status)
                                    : "No subscription"
                            }
                            description={
                                hasAccess
                                    ? "Your subscription benefits are available."
                                    : "Choose a plan to access subscription benefits."
                            }
                        >
                            {subscription && (
                                <StatusBadge status={subscription.status} />
                            )}
                        </MetricCard>

                        <MetricCard
                            icon={Clock3}
                            label="Time remaining"
                            value={
                                hasAccess
                                    ? `${daysRemaining} ${daysRemaining === 1 ? "day" : "days"}`
                                    : "—"
                            }
                            description={
                                subscription?.expiresAt
                                    ? `Expires ${formatDate(subscription.expiresAt)}`
                                    : "No active subscription period."
                            }
                        />
                    </div>
                </section>

                {/* Subscription information */}
                <AnimatePresence mode="wait">
                    {subscription ? (
                        <SubscriptionDetails
                            key={subscription.id}
                            subscription={subscription}
                        />
                    ) : (
                        <EmptySubscription key="empty-subscription" />
                    )}
                </AnimatePresence>

                {/* Cancellation notice */}
                {subscription?.status === "CANCELLED" &&
                    daysRemaining > 0 && (
                        <motion.div
                            variants={ITEM_VARIANTS}
                            className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50/80 p-4 sm:p-5"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
                                <CalendarDays size={19} />
                            </div>

                            <div className="min-w-0">
                                <h3 className="text-sm font-bold text-orange-900">
                                    Your subscription has been cancelled
                                </h3>

                                <p className="mt-1 text-xs leading-6 text-orange-800 sm:text-sm">
                                    Your existing benefits and remaining
                                    listing credits are still available
                                    until{" "}
                                    <strong>
                                        {formatDate(subscription.expiresAt)}
                                    </strong>
                                    . Your subscription will expire at
                                    the end of that period.
                                </p>
                            </div>
                        </motion.div>
                    )}

                {/* Quick links */}
                <section className="space-y-4">
                    <SectionHeading
                        eyebrow="Manage your account"
                        title="Quick access"
                        description="Get to the subscription tools you use most."
                    />

                    <div className="grid gap-3 sm:grid-cols-2">
                        <QuickLinkCard
                            href="/dashboard/subscriptions/plans"
                            icon={CreditCard}
                            label="Explore"
                            title="Subscription plans"
                            description="Compare available plans and pricing."
                        />

                        <QuickLinkCard
                            href="/dashboard/subscriptions/history"
                            icon={History}
                            label="Transactions"
                            title="Payment history"
                            description="Review your previous subscription payments."
                        />
                    </div>
                </section>

                {/* Footer */}
                <motion.div
                    variants={ITEM_VARIANTS}
                    className="flex items-center justify-center gap-2 border-t border-gray-200/80 pt-5 text-center"
                >
                    <ShieldCheck
                        size={15}
                        className="shrink-0 text-emerald-600"
                    />

                    <p className="text-[11px] leading-5 text-gray-400 sm:text-xs">
                        Your subscription information is securely managed by KARMASS.
                    </p>
                </motion.div>
            </motion.div>
        </main>
    );
}

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

export default function SubscriptionsPageClient() {
    const shouldReduceMotion = useReducedMotion();

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useCurrentSubscription();

    if (isLoading) {
        return (
            <>
                {/* Mobile loading */}
                <div className="min-h-screen bg-[#F7F9FC] px-4 py-6 md:hidden">
                    <div className="mx-auto max-w-lg animate-pulse space-y-5">
                        <div className="space-y-2">
                            <div className="h-3 w-20 rounded-full bg-blue-100" />
                            <div className="h-7 w-40 rounded-lg bg-gray-200" />
                        </div>

                        <div className="h-40 rounded-[22px] bg-blue-100" />

                        <div className="h-48 rounded-[20px] bg-gray-100" />

                        <div className="h-14 rounded-xl bg-gray-100" />
                    </div>
                </div>

                {/* Desktop loading */}
                <div className="hidden min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 md:block lg:px-8">
                    <div className="mx-auto w-full max-w-7xl">
                        <OverviewSkeleton />
                    </div>
                </div>
            </>
        );
    }

    if (isError) {
        return (
            <main className="flex min-h-[70vh] w-full items-center justify-center bg-[#F8FAFC] px-4 py-8">
                <ErrorState
                    message={
                        error instanceof Error
                            ? error.message
                            : "Something went wrong while loading your subscription."
                    }
                    onRetry={() => refetch()}
                    isFetching={isFetching}
                />
            </main>
        );
    }

    const subscription = data?.subscription ?? null;
    const creditBalance = data?.creditBalance ?? 0;

    const daysRemaining = getDaysRemaining(
        subscription?.expiresAt ?? null,
    );

    const hasAccess =
        subscription?.status === "ACTIVE" ||
        (
            subscription?.status === "CANCELLED" &&
            daysRemaining > 0
        );

    return (
        <>
            {/* Mobile interface                                               */}

            <div className="md:hidden">
                <MobileSubscriptionsView
                    subscription={subscription}
                    creditBalance={creditBalance}
                    daysRemaining={daysRemaining}
                    hasAccess={hasAccess}
                />
            </div>

            {/* Desktop interface                                              */}

            <div className="hidden md:block">
                <DesktopSubscriptionsView
                    subscription={subscription}
                    creditBalance={creditBalance}
                    daysRemaining={daysRemaining}
                    hasAccess={hasAccess}
                />
            </div>
        </>
    );
}