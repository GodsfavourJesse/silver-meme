"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
    motion,
    useReducedMotion,
} from "framer-motion";

import {
    useDealerAnalytics,
} from "@/app/hooks/user/dealer/useDealer";

import type {
    DealerAnalytics,
    DealerRecentListing,
    PublicDealerProfile,
} from "@/app/types/user/dealer/dealer.types";

import {
    Activity,
    ArrowRight,
    BadgeCheck,
    Building2,
    CalendarDays,
    CarFront,
    Check,
    CheckCircle2,
    ChevronRight,
    CircleHelp,
    Clock3,
    ExternalLink,
    Eye,
    LayoutDashboard,
    RefreshCw,
    ShieldCheck,
    Store,
    TrendingUp,
} from "lucide-react";

// ============================================================
// KARMASS BRAND COLORS
// ============================================================

const BRAND = "#1491FF";
const BRAND_DARK = "#0874D1";
const BRAND_PALE = "#EAF5FF";
const BRAND_BORDER = "#CBE7FF";

interface VerifiedDealerProfileProps {
    profile: PublicDealerProfile;
}

const easing = [0.22, 1, 0.36, 1] as const;

function formatDate(date: string | null | undefined) {
    if (!date) return "Not available";

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

function formatPrice(
    price: string | number,
    currency = "NGN",
) {
    const amount = Number(price);

    if (!Number.isFinite(amount)) {
        return String(price);
    }

    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${currency} ${amount.toLocaleString("en-NG")}`;
    }
}

function formatCount(value: number | null | undefined) {
    return new Intl.NumberFormat("en-NG").format(value ?? 0);
}

function getStatusStyle(status: string) {
    switch (status.toUpperCase()) {
        case "ACTIVE":
        case "PUBLISHED":
        case "APPROVED":
            return "bg-emerald-50 text-emerald-700 ring-emerald-100";

        case "PENDING":
        case "DRAFT":
        case "PROCESSING":
            return "bg-amber-50 text-amber-700 ring-amber-100";

        case "REJECTED":
        case "EXPIRED":
            return "bg-red-50 text-red-700 ring-red-100";

        case "SOLD":
            return "bg-sky-50 text-sky-700 ring-sky-100";

        default:
            return "bg-slate-100 text-slate-600 ring-slate-200";
    }
}

const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.065,
            delayChildren: 0.025,
        },
    },
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 12,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.38,
            ease: easing,
        },
    },
};

function MotionSection({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const reduceMotion = useReducedMotion();

    return (
        <motion.section
            variants={itemVariants}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            className={className}
        >
            {children}
        </motion.section>
    );
}

function StatusBadge({
    status,
}: {
    status: string;
}) {
    return (
        <span
            className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold ring-1 ring-inset ${getStatusStyle(status)}`}
        >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
            <span className="truncate">{status}</span>
        </span>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
    tone,
}: {
    label: string;
    value: string;
    icon: React.ElementType;
    tone: "blue" | "green" | "amber" | "slate";
}) {
    const reduceMotion = useReducedMotion();

    const tones = {
        blue: {
            icon: "bg-[#EAF5FF] text-[#1491FF]",
            hover: "group-hover:border-[#B8DDFF]",
        },
        green: {
            icon: "bg-emerald-50 text-emerald-600",
            hover: "group-hover:border-emerald-200",
        },
        amber: {
            icon: "bg-amber-50 text-amber-600",
            hover: "group-hover:border-amber-200",
        },
        slate: {
            icon: "bg-slate-100 text-slate-600",
            hover: "group-hover:border-slate-300",
        },
    };

    return (
        <motion.article
            variants={itemVariants}
            whileHover={reduceMotion ? undefined : { y: -3 }}
            whileTap={reduceMotion ? undefined : { scale: 0.99 }}
            transition={{
                duration: 0.2,
                ease: easing,
            }}
            className={`group min-w-0 rounded-[20px] border border-[#E9EDF2] bg-white p-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.025)] transition-colors sm:p-5 ${tones[tone].hover}`}
        >
            <div className="flex items-center justify-between gap-2">
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-[13px] ${tones[tone].icon}`}
                >
                    <Icon size={19} strokeWidth={1.9} />
                </div>

                <span className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#A0A9B5] sm:text-[10px]">
                    KARMASS
                </span>
            </div>

            <p className="mt-4 break-words text-[11px] font-medium leading-4 text-[#7A8796] sm:text-xs">
                {label}
            </p>

            <p className="mt-1.5 break-words text-[25px] font-bold leading-tight tracking-[-0.05em] text-[#172B40] sm:text-3xl">
                {value}
            </p>
        </motion.article>
    );
}

function StatSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <div
                    key={index}
                    className="h-[142px] animate-pulse rounded-[20px] border border-[#E9EDF2] bg-white sm:h-40"
                />
            ))}
        </div>
    );
}

function SectionHeading({
    title,
    description,
    action,
}: {
    title: string;
    description?: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="mb-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
                <h2 className="text-[15px] font-bold tracking-tight text-[#172B40] sm:text-lg">
                    {title}
                </h2>

                {description && (
                    <p className="mt-1 text-[11px] leading-5 text-[#7A8796] sm:text-xs">
                        {description}
                    </p>
                )}
            </div>

            {action}
        </div>
    );
}

function QuickAction({
    href,
    title,
    subtitle,
    icon: Icon,
    primary = false,
}: {
    href: string;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    primary?: boolean;
}) {
    const reduceMotion = useReducedMotion();

    return (
        <motion.div
            variants={itemVariants}
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.985 }}
            className="min-w-0"
        >
            <Link
                href={href}
                className={`group flex min-h-[120px] h-full flex-col justify-between rounded-[20px] p-4 transition-all duration-200 sm:min-h-[145px] sm:p-5 ${
                    primary
                        ? "bg-gradient-to-br from-[#1491FF] via-[#0D83EA] to-[#0867B8] text-white shadow-[0_8px_24px_rgba(20,145,255,0.2)] hover:shadow-[0_10px_28px_rgba(20,145,255,0.28)]"
                        : "border border-[#E9EDF2] bg-white text-[#172B40] hover:border-[#B8DDFF] hover:bg-[#F7FBFF]"
                }`}
            >
                <div className="flex items-start justify-between gap-2">
                    <div
                        className={`flex h-10 w-10 items-center justify-center rounded-[13px] ${
                            primary
                                ? "bg-white/15 text-white"
                                : "bg-[#EAF5FF] text-[#1491FF]"
                        }`}
                    >
                        <Icon size={21} strokeWidth={1.8} />
                    </div>

                    <ArrowRight
                        size={16}
                        className={`mt-1 transition-transform duration-200 group-hover:translate-x-1 ${
                            primary ? "text-white/80" : "text-[#8DA0B2]"
                        }`}
                    />
                </div>

                <div className="mt-4">
                    <h3 className="text-xs font-bold sm:text-sm">
                        {title}
                    </h3>

                    <p
                        className={`mt-1 text-[10px] leading-4 sm:text-[11px] ${
                            primary ? "text-white/80" : "text-[#7A8796]"
                        }`}
                    >
                        {subtitle}
                    </p>
                </div>
            </Link>
        </motion.div>
    );
}

function RecentListingCard({
    listing,
}: {
    listing: DealerRecentListing;
}) {
    const vehicleName = [
        listing.makeName,
        listing.modelName,
        listing.generationName,
        listing.variantName,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <motion.article
            variants={itemVariants}
            className="flex min-w-0 items-center gap-3 rounded-[17px] border border-[#E9EDF2] bg-white p-3.5 transition-colors hover:border-[#B8DDFF] hover:bg-[#F7FBFF] sm:p-4"
        >
            <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[15px] bg-[#EAF5FF] text-[#1491FF]">
                <CarFront size={25} strokeWidth={1.7} />
            </div>

            <div className="min-w-0 flex-1">
                <h3 className="truncate text-xs font-bold text-[#172B40] sm:text-sm">
                    {listing.title}
                </h3>

                <p className="mt-1 truncate text-[10px] text-[#7A8796] sm:text-xs">
                    {vehicleName || "Vehicle listing"}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={listing.status} />

                    <span className="text-[9px] text-[#8C9AAA]">
                        {formatDate(listing.createdAt)}
                    </span>
                </div>
            </div>

            <div className="max-w-[42%] shrink-0 text-right">
                <p className="break-words text-xs font-bold leading-5 text-[#1491FF] sm:text-sm">
                    {formatPrice(listing.price, listing.currency)}
                </p>

                <p className="mt-1 text-[9px] text-[#8C9AAA]">
                    Asking price
                </p>
            </div>
        </motion.article>
    );
}

function RecentListings({
    analytics,
}: {
    analytics: DealerAnalytics;
}) {
    const listings = analytics.recentListings ?? [];

    if (!listings.length) {
        return (
            <div className="rounded-[20px] border border-dashed border-[#B8DDFF] bg-white px-5 py-9 text-center sm:py-12">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#EAF5FF] text-[#1491FF]">
                    <CarFront size={27} />
                </div>

                <h3 className="mt-4 text-sm font-bold text-[#172B40]">
                    Your inventory starts here
                </h3>

                <p className="mx-auto mt-2 max-w-xs text-[11px] leading-5 text-[#7A8796]">
                    Add your first vehicle and start building your dealership
                    presence on KARMASS.
                </p>

                <Link
                    href="/dashboard/my-listings"
                    className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-5 text-xs font-bold text-white transition hover:bg-[#0874D1]"
                >
                    Manage vehicles
                    <ArrowRight size={15} />
                </Link>
            </div>
        );
    }

    return (
        <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2.5"
        >
            {listings.map((listing) => (
                <RecentListingCard
                    key={listing.id}
                    listing={listing}
                />
            ))}
        </motion.div>
    );
}

function VerificationRow({
    label,
    value,
    verified = false,
}: {
    label: string;
    value: string;
    verified?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-3.5">
            <span className="text-[11px] text-[#7A8796] sm:text-xs">
                {label}
            </span>

            <span
                className={`flex min-w-0 items-center gap-1.5 text-right text-[11px] font-semibold sm:text-xs ${
                    verified ? "text-emerald-700" : "text-[#243B50]"
                }`}
            >
                {verified && (
                    <BadgeCheck size={15} className="shrink-0" />
                )}
                <span className="break-words">{value}</span>
            </span>
        </div>
    );
}

export default function VerifiedDealerProfile({
    profile,
}: VerifiedDealerProfileProps) {
    const reduceMotion = useReducedMotion();

    const {
        data: analyticsResponse,
        isPending: analyticsPending,
        isError: analyticsError,
        refetch: refetchAnalytics,
        isFetching: analyticsFetching,
    } = useDealerAnalytics();

    const analytics = analyticsResponse?.data?.analytics;

    const publicProfileUrl = `/dealers/${profile.id}`;

    const totalListings = analytics?.totalListings ?? 0;
    const activeListings = analytics?.activeListings ?? 0;
    const pendingListings = analytics?.pendingListings ?? 0;
    const totalViews = analytics?.totalViews ?? 0;

    const activePercentage = useMemo(() => {
        if (!totalListings) return 0;

        return Math.min(
            100,
            Math.round((activeListings / totalListings) * 100),
        );
    }, [activeListings, totalListings]);

    return (
        <motion.main
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            variants={pageVariants}
            className="min-h-screen overflow-x-clip bg-[#F7FAFD] pb-8 text-[#243B50] sm:pb-10"
        >
            {/* Top navigation */}
            <header className="sticky top-0 z-30 border-b border-[#E6F2FC] bg-white/95 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4 lg:static lg:px-9">
                <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3">
                    <Link
                        href="/dashboard"
                        className="flex min-w-0 items-center gap-2.5"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-[#52ACFF] via-[#1491FF] to-[#0874D1] text-white shadow-[0_5px_15px_rgba(20,145,255,0.24)]">
                            <Building2 size={21} />
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-extrabold tracking-tight text-[#172B40]">
                                KARMASS
                            </p>

                            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8C9AAA]">
                                Dealer studio
                            </p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2">
                        <span className="hidden items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-700 sm:inline-flex">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Verified dealer
                        </span>

                        <Link
                            href="/support"
                            aria-label="Get support"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border border-[#E8EDF3] bg-white text-[#63768A] transition hover:border-[#B8DDFF] hover:bg-[#F2F9FF] hover:text-[#1491FF]"
                        >
                            <CircleHelp size={19} />
                        </Link>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-[1200px] space-y-6 px-4 py-5 sm:space-y-8 sm:px-6 sm:py-8 lg:px-9">
                {/* Welcome heading */}
                <MotionSection>
                    <div className="flex items-end justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1491FF] sm:text-xs">
                                Dealership workspace
                            </p>

                            <h1 className="mt-1.5 break-words text-[25px] font-extrabold leading-tight tracking-[-0.05em] text-[#172B40] sm:text-3xl lg:text-4xl">
                                Good to have you here.
                            </h1>

                            <p className="mt-2 text-[11px] leading-5 text-[#7A8796] sm:text-sm">
                                Here&apos;s how your dealership is performing.
                            </p>
                        </div>

                        <Link
                            href={publicProfileUrl}
                            aria-label="Open public dealership profile"
                            className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border border-[#CBE7FF] bg-white text-[#1491FF] shadow-sm transition hover:bg-[#EAF5FF]"
                        >
                            <ExternalLink size={18} />
                        </Link>
                    </div>
                </MotionSection>

                {/* Premium dealer identity card */}
                <MotionSection>
                    <motion.section
                        whileHover={reduceMotion ? undefined : { y: -2 }}
                        transition={{ duration: 0.25, ease: easing }}
                        className="relative isolate overflow-hidden rounded-[28px] border border-[#CBE7FF] bg-white shadow-[0_16px_50px_rgba(20,80,130,0.09)] sm:rounded-[32px]"
                    >
                        {/* Blue branded header */}
                        <div className="relative min-h-[155px] overflow-hidden bg-gradient-to-br from-[#07345C] via-[#0874D1] to-[#1491FF] px-5 py-5 sm:min-h-[190px] sm:px-8 sm:py-7 lg:px-9">
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0 opacity-30"
                                style={{
                                    backgroundImage:
                                        "radial-gradient(circle at 80% 15%, rgba(255,255,255,0.32), transparent 27%), radial-gradient(circle at 15% 100%, rgba(100,190,255,0.42), transparent 34%)",
                                }}
                            />

                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -right-10 -top-28 h-64 w-64 rounded-full border border-white/10 sm:-right-4 sm:-top-36 sm:h-80 sm:w-80"
                            />

                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -right-1 -top-20 h-52 w-52 rounded-full border border-white/10 sm:right-12 sm:-top-28 sm:h-64 sm:w-64"
                            />

                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute bottom-[-95px] right-[22%] h-48 w-48 rounded-full bg-[#83C7FF]/20 blur-3xl"
                            />

                            <div className="relative z-10 flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                                    <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[19px] border border-white/20 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur-md sm:h-[72px] sm:w-[72px] sm:rounded-[22px]">
                                        <Building2
                                            size={32}
                                            strokeWidth={1.55}
                                        />
                                    </div>

                                    <div className="min-w-0 pt-1">
                                        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1.5 text-[9px] font-extrabold tracking-[0.12em] text-white backdrop-blur-md sm:text-[10px]">
                                            <BadgeCheck size={14} />
                                            VERIFIED DEALER
                                        </div>

                                        <p className="mt-2 text-[10px] font-medium text-white/70 sm:text-xs">
                                            KARMASS dealer network
                                        </p>
                                    </div>
                                </div>

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md sm:h-12 sm:w-12">
                                    <ShieldCheck size={23} strokeWidth={1.6} />
                                </div>
                            </div>

                            <div className="relative z-10 mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-white/75 sm:mt-8 sm:text-xs">
                                <span className="inline-flex items-center gap-1.5">
                                    <CheckCircle2
                                        size={14}
                                        className="text-emerald-300"
                                    />
                                    Identity verified
                                </span>

                                <span className="inline-flex items-center gap-1.5">
                                    <CalendarDays
                                        size={14}
                                        className="text-white/70"
                                    />
                                    Member since {formatDate(profile.createdAt)}
                                </span>
                            </div>
                        </div>

                        {/* Dealer information */}
                        <div className="relative px-5 pb-5 pt-6 sm:px-8 sm:pb-8 sm:pt-7 lg:px-9">
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute right-0 top-0 h-40 w-40 bg-[radial-gradient(circle,rgba(20,145,255,0.055),transparent_70%)]"
                            />

                            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[9px] font-extrabold uppercase tracking-[0.17em] text-[#5A9DD6] sm:text-[10px]">
                                            Official dealership
                                        </span>

                                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            Trusted identity
                                        </span>
                                    </div>

                                    <h2 className="mt-2.5 break-words text-[25px] font-extrabold leading-tight tracking-[-0.045em] text-[#102C43] sm:text-3xl lg:text-[36px]">
                                        {profile.companyName}
                                    </h2>

                                    <p className="mt-3 max-w-2xl text-[11px] leading-5 text-[#65788A] sm:text-sm sm:leading-6">
                                        Your official KARMASS dealership workspace.
                                        Manage your inventory, monitor vehicle
                                        performance, and build buyer confidence
                                        with your verified dealership identity.
                                    </p>

                                    {profile.verifiedAt && (
                                        <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#E3F2FF] bg-[#F7FBFF] px-3 py-2.5">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#DCEEFF] text-[#1491FF]">
                                                <BadgeCheck size={16} />
                                            </div>

                                            <div>
                                                <p className="text-[9px] font-medium text-[#738CA1]">
                                                    Verification completed
                                                </p>
                                                <p className="mt-0.5 text-[10px] font-bold text-[#155B91] sm:text-xs">
                                                    {formatDate(profile.verifiedAt)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2.5 lg:w-[290px] lg:shrink-0 lg:grid-cols-1">
                                    <Link
                                        href="/dashboard/my-listings"
                                        className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#1491FF] to-[#0874D1] px-3 py-3 text-[10px] font-bold text-white shadow-[0_6px_18px_rgba(20,145,255,0.19)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_9px_24px_rgba(20,145,255,0.26)] active:translate-y-0 sm:text-xs"
                                    >
                                        <CarFront size={17} />
                                        Manage vehicles
                                        <ArrowRight
                                            size={14}
                                            className="transition-transform group-hover:translate-x-0.5"
                                        />
                                    </Link>

                                    <Link
                                        href={publicProfileUrl}
                                        className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] border border-[#CBE7FF] bg-white px-3 py-3 text-[10px] font-bold text-[#155B91] transition duration-200 hover:border-[#9ED2FF] hover:bg-[#F7FBFF] active:scale-[0.99] sm:text-xs"
                                    >
                                        <ExternalLink size={15} />
                                        View public profile
                                    </Link>
                                </div>
                            </div>

                            {/* Trust indicators */}
                            <div className="relative mt-6 grid grid-cols-2 gap-2.5 border-t border-[#E8F2FB] pt-5 sm:grid-cols-3">
                                <div className="flex min-w-0 items-center gap-2.5 rounded-[14px] bg-[#F5FAFF] p-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DCEEFF] text-[#1491FF]">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-[#163D5B] sm:text-xs">
                                            Verified identity
                                        </p>
                                        <p className="mt-0.5 text-[9px] leading-4 text-[#738CA1]">
                                            Dealer credentials checked
                                        </p>
                                    </div>
                                </div>

                                <div className="flex min-w-0 items-center gap-2.5 rounded-[14px] bg-[#F8FAFC] p-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                                        <CheckCircle2 size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-[#243B50] sm:text-xs">
                                            Trusted dealer
                                        </p>
                                        <p className="mt-0.5 text-[9px] leading-4 text-[#8C9AAA]">
                                            Verified on KARMASS
                                        </p>
                                    </div>
                                </div>

                                <div className="col-span-2 flex min-w-0 items-center gap-2.5 rounded-[14px] bg-[#F8FAFC] p-3 sm:col-span-1">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#1491FF] shadow-sm">
                                        <CalendarDays size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-[#243B50] sm:text-xs">
                                            KARMASS member
                                        </p>
                                        <p className="mt-0.5 text-[9px] leading-4 text-[#8C9AAA]">
                                            Since {formatDate(profile.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                </MotionSection>

                {/* Performance */}
                <MotionSection>
                    <SectionHeading
                        title="Your performance"
                        description="A quick look at your dealership activity."
                    />

                    {analyticsPending ? (
                        <StatSkeleton />
                    ) : analyticsError || !analytics ? (
                        <div className="rounded-[20px] border border-[#E8EDF3] bg-white p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                    <Activity size={20} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h3 className="text-sm font-bold text-[#172B40]">
                                        Performance data unavailable
                                    </h3>

                                    <p className="mt-1 text-[11px] leading-5 text-[#7A8796]">
                                        Your verified profile is available,
                                        but your latest statistics could not
                                        be loaded.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => void refetchAnalytics()}
                                        disabled={analyticsFetching}
                                        className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#EAF5FF] px-3 text-[11px] font-bold text-[#1491FF] disabled:opacity-60"
                                    >
                                        <RefreshCw
                                            size={14}
                                            className={
                                                analyticsFetching
                                                    ? "animate-spin"
                                                    : ""
                                            }
                                        />
                                        Try again
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <motion.div
                            variants={pageVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-2 gap-3 lg:grid-cols-4"
                        >
                            <StatCard
                                label="Total listings"
                                value={formatCount(totalListings)}
                                icon={CarFront}
                                tone="blue"
                            />

                            <StatCard
                                label="Active vehicles"
                                value={formatCount(activeListings)}
                                icon={CheckCircle2}
                                tone="green"
                            />

                            <StatCard
                                label="Awaiting review"
                                value={formatCount(pendingListings)}
                                icon={Clock3}
                                tone="amber"
                            />

                            <StatCard
                                label="Total views"
                                value={formatCount(totalViews)}
                                icon={Eye}
                                tone="slate"
                            />
                        </motion.div>
                    )}
                </MotionSection>

                {/* Inventory health */}
                {!analyticsPending && !analyticsError && analytics && (
                    <MotionSection>
                        <section className="rounded-[22px] border border-[#E9EDF2] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)] sm:p-6">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-sm font-bold text-[#172B40] sm:text-base">
                                        Inventory health
                                    </h2>

                                    <p className="mt-1 text-[10px] leading-5 text-[#7A8796] sm:text-xs">
                                        The proportion of your listings currently active.
                                    </p>
                                </div>

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#EAF5FF] text-[#1491FF]">
                                    <TrendingUp size={20} />
                                </div>
                            </div>

                            <div className="mt-5 flex items-end justify-between gap-3">
                                <div>
                                    <p className="text-[10px] text-[#7A8796]">
                                        Active inventory
                                    </p>

                                    <p className="mt-1 text-[26px] font-extrabold tracking-tight text-[#172B40]">
                                        {activePercentage}
                                        <span className="ml-0.5 text-base font-semibold text-[#8C9AAA]">
                                            %
                                        </span>
                                    </p>
                                </div>

                                <p className="pb-1 text-right text-[10px] text-[#7A8796]">
                                    {formatCount(activeListings)} of{" "}
                                    {formatCount(totalListings)} listings
                                </p>
                            </div>

                            <div
                                className="mt-3 h-2 overflow-hidden rounded-full bg-[#E4F2FF]"
                                role="progressbar"
                                aria-label="Active inventory percentage"
                                aria-valuenow={activePercentage}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            >
                                <motion.div
                                    initial={{
                                        width: reduceMotion
                                            ? `${activePercentage}%`
                                            : "0%",
                                    }}
                                    animate={{
                                        width: `${activePercentage}%`,
                                    }}
                                    transition={{
                                        duration: reduceMotion ? 0 : 0.8,
                                        ease: easing,
                                    }}
                                    className="h-full rounded-full bg-gradient-to-r from-[#52ACFF] to-[#1491FF]"
                                />
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                <div className="rounded-[13px] border border-[#EDF0F4] bg-[#FAFBFD] p-3">
                                    <div className="flex items-center gap-1.5 text-[10px] text-[#7A8796]">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                        Active
                                    </div>

                                    <p className="mt-2 text-base font-bold text-[#172B40]">
                                        {formatCount(activeListings)}
                                    </p>
                                </div>

                                <div className="rounded-[13px] border border-[#EDF0F4] bg-[#FAFBFD] p-3">
                                    <div className="flex items-center gap-1.5 text-[10px] text-[#7A8796]">
                                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                                        Pending
                                    </div>

                                    <p className="mt-2 text-base font-bold text-[#172B40]">
                                        {formatCount(pendingListings)}
                                    </p>
                                </div>

                                <div className="rounded-[13px] border border-[#EDF0F4] bg-[#FAFBFD] p-3">
                                    <div className="flex items-center gap-1.5 text-[10px] text-[#7A8796]">
                                        <span className="h-2 w-2 rounded-full bg-red-400" />
                                        Rejected
                                    </div>

                                    <p className="mt-2 text-base font-bold text-[#172B40]">
                                        {formatCount(analytics.rejectedListings)}
                                    </p>
                                </div>

                                <div className="rounded-[13px] border border-[#EDF0F4] bg-[#FAFBFD] p-3">
                                    <div className="flex items-center gap-1.5 text-[10px] text-[#7A8796]">
                                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                                        Expired
                                    </div>

                                    <p className="mt-2 text-base font-bold text-[#172B40]">
                                        {formatCount(analytics.expiredListings)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-[#EDF0F4] pt-4">
                                <div>
                                    <p className="text-[10px] text-[#7A8796]">
                                        Average views per listing
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-[#172B40]">
                                        {formatCount(
                                            Math.round(
                                                analytics.averageViewsPerListing ?? 0,
                                            ),
                                        )}
                                    </p>
                                </div>

                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF5FF] text-[#1491FF]">
                                    <Eye size={17} />
                                </div>
                            </div>
                        </section>
                    </MotionSection>
                )}

                {/* Quick actions */}
                <MotionSection>
                    <SectionHeading
                        title="Quick actions"
                        description="Everything you need, right at your fingertips."
                    />

                    <motion.div
                        variants={pageVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
                    >
                        <QuickAction
                            href="/dashboard/my-listings"
                            title="My vehicles"
                            subtitle="Manage your inventory"
                            icon={CarFront}
                            primary
                        />

                        <QuickAction
                            href={publicProfileUrl}
                            title="Public profile"
                            subtitle="See your dealership"
                            icon={Store}
                        />

                        <QuickAction
                            href="/marketplace"
                            title="Marketplace"
                            subtitle="Explore available cars"
                            icon={LayoutDashboard}
                        />
                    </motion.div>
                </MotionSection>

                {/* Recent listings */}
                {!analyticsPending && !analyticsError && analytics && (
                    <MotionSection>
                        <SectionHeading
                            title="Recent vehicles"
                            description="Your latest inventory at a glance."
                            action={
                                <Link
                                    href="/dashboard/my-listings"
                                    className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-xl px-2 text-[10px] font-bold text-[#1491FF] transition hover:bg-[#EAF5FF] sm:text-xs"
                                >
                                    View all
                                    <ChevronRight size={14} />
                                </Link>
                            }
                        />

                        <RecentListings analytics={analytics} />
                    </MotionSection>
                )}

                {/* Verification details */}
                <MotionSection>
                    <section className="overflow-hidden rounded-[22px] border border-[#E9EDF2] bg-white">
                        <div className="flex items-center gap-3 border-b border-[#EDF0F4] p-4 sm:p-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#EAF5FF] text-[#1491FF]">
                                <ShieldCheck size={21} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2 className="text-sm font-bold text-[#172B40]">
                                    Dealer verification
                                </h2>

                                <p className="mt-1 text-[10px] text-[#7A8796]">
                                    Your dealership credentials
                                </p>
                            </div>

                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[9px] font-bold text-emerald-700">
                                <Check size={12} />
                                VERIFIED
                            </span>
                        </div>

                        <div className="px-4 py-1 sm:px-5">
                            <VerificationRow
                                label="Dealership"
                                value={profile.companyName}
                            />

                            <div className="border-t border-[#EDF0F4]" />

                            <VerificationRow
                                label="Business contact"
                                value={profile.contactName}
                            />

                            <div className="border-t border-[#EDF0F4]" />

                            <VerificationRow
                                label="Verification status"
                                value="Verified dealer"
                                verified
                            />

                            <div className="border-t border-[#EDF0F4]" />

                            <VerificationRow
                                label="Verified on"
                                value={formatDate(profile.verifiedAt)}
                            />

                            <div className="border-t border-[#EDF0F4]" />

                            <VerificationRow
                                label="Profile created"
                                value={formatDate(profile.createdAt)}
                            />
                        </div>
                    </section>
                </MotionSection>

                {/* Support */}
                <MotionSection>
                    <section className="relative isolate overflow-hidden rounded-[22px] bg-gradient-to-br from-[#102C43] via-[#064E86] to-[#0874D1] p-5 text-white sm:flex sm:items-center sm:justify-between sm:gap-5 sm:p-6">
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -right-10 -top-16 -z-10 h-40 w-40 rounded-full bg-[#52ACFF]/25 blur-3xl"
                        />

                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border border-white/10 bg-white/10 text-[#B9E0FF]">
                                <ShieldCheck size={21} />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-sm font-bold">
                                    We&apos;re here to help
                                </h2>

                                <p className="mt-1.5 text-[10px] leading-5 text-white/65 sm:text-xs">
                                    Need help with your dealership or listings?
                                    Our support team is here for you.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/support"
                            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[13px] bg-white px-4 text-xs font-bold text-[#0867B8] transition hover:bg-[#EAF5FF] active:scale-[0.99] sm:mt-0 sm:w-auto"
                        >
                            Contact support
                            <ArrowRight size={15} />
                        </Link>
                    </section>
                </MotionSection>

                <footer className="pb-3 pt-1 text-center text-[9px] text-[#8C9AAA] sm:pb-0 sm:text-[10px]">
                    © {new Date().getFullYear()} KARMASS
                    <span className="mx-1.5">·</span>
                    Built for your automotive business.
                </footer>
            </div>
        </motion.main>
    );
}