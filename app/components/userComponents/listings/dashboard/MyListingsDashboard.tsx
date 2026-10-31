"use client";

import { useCallback, useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "framer-motion";

import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Eye,
    FilePlus2,
    LoaderCircle,
    MapPin,
    MoreHorizontal,
    Pencil,
    RefreshCw,
    RotateCcw,
    Search,
    SlidersHorizontal,
    Trash2,
    TrendingUp,
    X,
} from "lucide-react";

import {
    deleteSellerListing,
    getSellerListings,
    performSellerListingAction,
    retrySellerImageAnalysis,
} from "@/app/services/user/listings/listing.service";

import type {
    ListingStatus,
    SellerListingItem,
} from "@/app/types/user/listings/listing.types";

import {
    DEFAULT_STATUS_ICON,
    INITIAL_DATA,
    PAGE_SIZE,
    POLL_INTERVAL_MS,
    STATUS_FILTERS,
    STATUS_ICONS,
    STATUS_STYLES,
    type DashboardData,
    type DashboardFilter,
    type LifecycleAction,
} from "../helpers/my-listings.contants";

import {
    canDelete,
    canEdit,
    canMarkSold,
    canReactivate,
    canSubmit,
    formatDate,
    formatPrice,
    formatStatus,
    getEmptyStateCopy,
    getErrorMessage,
    getListingLocation,
    getStatusCount,
    getSummaryCards,
    getVehicleName,
    hasPendingImageAnalysis,
    matchesSearch,
} from "../helpers/my-listings.helpers";

/* -------------------------------------------------------------------------- */
/*  Animation configuration                                                   */
/* -------------------------------------------------------------------------- */

const pageVariants = {
    hidden: {
        opacity: 0,
        y: 16,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1] as const,
            staggerChildren: 0.08,
        },
    },
};

const sectionVariants = {
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

const cardVariants = {
    hidden: {
        opacity: 0,
        y: 18,
        scale: 0.98,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1] as const,
        },
    },
    exit: {
        opacity: 0,
        y: 10,
        scale: 0.98,
        transition: {
            duration: 0.2,
        },
    },
};

const menuVariants = {
    hidden: {
        opacity: 0,
        y: -6,
        scale: 0.96,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.18,
            ease: "easeOut" as const,
        },
    },
    exit: {
        opacity: 0,
        y: -5,
        scale: 0.97,
        transition: {
            duration: 0.12,
        },
    },
};

const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.94,
        y: 15,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            stiffness: 350,
            damping: 28,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.96,
        y: 10,
        transition: {
            duration: 0.18,
        },
    },
};

/* -------------------------------------------------------------------------- */
/*  Shared styles                                                             */
/* -------------------------------------------------------------------------- */

const BRAND = "#1491FF";

const MENU_ITEM_CLASS =
    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#1491FF] disabled:cursor-not-allowed disabled:opacity-40";

const SECONDARY_BUTTON =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-[#1491FF]/30 hover:bg-[#1491FF]/[0.04] hover:text-[#1491FF] disabled:cursor-not-allowed disabled:opacity-50";

const PRIMARY_BUTTON =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#1491FF]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#087EDB] hover:shadow-[#1491FF]/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50";

/* -------------------------------------------------------------------------- */
/*  Small presentational components                                           */
/* -------------------------------------------------------------------------- */

function StatusIcon({ status }: { status: ListingStatus }) {
    const Icon = STATUS_ICONS[status] ?? DEFAULT_STATUS_ICON;

    return <Icon size={12} strokeWidth={2.4} />;
}

function SectionLabel({
    children,
    icon: Icon,
}: {
    children: React.ReactNode;
    icon?: React.ElementType;
}) {
    return (
        <div className="flex items-center gap-2">
            {Icon && (
                <div className="flex size-9 items-center justify-center rounded-xl bg-[#1491FF]/[0.08] text-[#1491FF]">
                    <Icon size={17} />
                </div>
            )}

            <h2 className="text-sm font-bold tracking-tight text-slate-900 sm:text-base">
                {children}
            </h2>
        </div>
    );
}

function FeedbackBanner({
    type,
    message,
    onDismiss,
}: {
    type: "error" | "success";
    message: string;
    onDismiss: () => void;
}) {
    const isError = type === "error";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className={`flex items-start gap-3 overflow-hidden rounded-2xl border p-4 text-sm ${
                isError
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
            role={isError ? "alert" : "status"}
        >
            <div className="mt-0.5 shrink-0">
                {isError ? (
                    <AlertCircle size={18} />
                ) : (
                    <CheckCircle2 size={18} />
                )}
            </div>

            <p className="flex-1 leading-6">{message}</p>

            <button
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss message"
                className="shrink-0 rounded-lg p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
}

function ListingImagePlaceholder() {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#1491FF]/[0.07] via-slate-50 to-slate-100 text-slate-400">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-white bg-white/80 shadow-sm">
                <Eye size={21} className="text-[#1491FF]" />
            </div>

            <span className="text-[11px] font-medium">
                No vehicle photo available
            </span>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export default function MyListingsDashboard() {
    const shouldReduceMotion = useReducedMotion();

    /* ----------------------------- Data & filters ---------------------------- */

    const [data, setData] = useState<DashboardData>(INITIAL_DATA);
    const [activeFilter, setActiveFilter] =
        useState<DashboardFilter>("ALL");

    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);

    /* ------------------------------ Loading state ---------------------------- */

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    /* ------------------------------- Feedback -------------------------------- */

    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    /* ------------------------------ Row actions ------------------------------ */

    const [busyListingId, setBusyListingId] = useState<string | null>(null);
    const [menuListingId, setMenuListingId] = useState<string | null>(null);
    const [retryingImageId, setRetryingImageId] = useState<string | null>(null);

    /* ------------------------------ Delete dialog ---------------------------- */

    const [deleteTarget, setDeleteTarget] =
        useState<SellerListingItem | null>(null);

    const [isDeleting, setIsDeleting] = useState(false);

    /* -------------------------------------------------------------------------- */
    /*  Data loading                                                              */
    /* -------------------------------------------------------------------------- */

    const loadListings = useCallback(
        async (options?: { silent?: boolean }) => {
            const silent = options?.silent ?? false;

            if (silent) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            try {
                const response = await getSellerListings({
                    page,
                    limit: PAGE_SIZE,
                    ...(activeFilter !== "ALL"
                        ? { status: activeFilter }
                        : {}),
                });

                setData({
                    summary: response.data.summary,
                    items: response.data.items,
                    pagination: response.data.pagination,
                });

                setError(null);
            } catch (requestError) {
                setError(
                    getErrorMessage(
                        requestError,
                        "Unable to load your listings. Please try again.",
                    ),
                );
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        },
        [activeFilter, page],
    );

    useEffect(() => {
        void loadListings();
    }, [loadListings]);

    useEffect(() => {
        setPage(1);
    }, [activeFilter]);

    // Poll only while at least one image is awaiting analysis.
    useEffect(() => {
        if (!hasPendingImageAnalysis(data.items)) {
            return;
        }

        const timeout = window.setTimeout(() => {
            void loadListings({ silent: true });
        }, POLL_INTERVAL_MS);

        return () => window.clearTimeout(timeout);
    }, [data.items, loadListings]);

    // Close the open actions menu when clicking outside.
    useEffect(() => {
        const handleOutsideClick = () => setMenuListingId(null);

        if (menuListingId) {
            document.addEventListener("click", handleOutsideClick);
        }

        return () => {
            document.removeEventListener("click", handleOutsideClick);
        };
    }, [menuListingId]);

    /* -------------------------------------------------------------------------- */
    /*  Handlers                                                                  */
    /* -------------------------------------------------------------------------- */

    const resetFeedback = () => {
        setError(null);
        setNotice(null);
    };

    const handleFilterChange = useCallback((filter: DashboardFilter) => {
        setActiveFilter(filter);
        setPage(1);
        setNotice(null);
        setMenuListingId(null);
    }, []);

    const handleLifecycleAction = useCallback(
        async (item: SellerListingItem, action: LifecycleAction) => {
            if (busyListingId) {
                return;
            }

            setBusyListingId(item.listing.id);
            resetFeedback();
            setMenuListingId(null);

            try {
                const response = await performSellerListingAction(
                    item.listing.id,
                    action,
                );

                setNotice(
                    response.message ?? "Your listing has been updated.",
                );

                await loadListings({ silent: true });
            } catch (requestError) {
                setError(
                    getErrorMessage(
                        requestError,
                        "The listing action could not be completed.",
                    ),
                );
            } finally {
                setBusyListingId(null);
            }
        },
        [busyListingId, loadListings],
    );

    const handleDelete = useCallback(async () => {
        if (!deleteTarget || isDeleting) {
            return;
        }

        setIsDeleting(true);
        resetFeedback();

        try {
            const response = await deleteSellerListing(
                deleteTarget.listing.id,
            );

            setNotice(response.message ?? "Your listing was deleted.");
            setDeleteTarget(null);

            await loadListings({ silent: true });
        } catch (requestError) {
            setError(
                getErrorMessage(
                    requestError,
                    "Unable to delete this listing.",
                ),
            );
        } finally {
            setIsDeleting(false);
        }
    }, [deleteTarget, isDeleting, loadListings]);

    const handleRetryImageAnalysis = useCallback(
        async (listingId: string, imageId: string) => {
            if (retryingImageId) {
                return;
            }

            setRetryingImageId(imageId);
            resetFeedback();

            try {
                const response = await retrySellerImageAnalysis(
                    listingId,
                    imageId,
                );

                setNotice(
                    response.message ?? "Image analysis has been queued.",
                );

                await loadListings({ silent: true });
            } catch (requestError) {
                setError(
                    getErrorMessage(
                        requestError,
                        "Unable to retry image analysis. Please refresh and try again.",
                    ),
                );
            } finally {
                setRetryingImageId(null);
            }
        },
        [retryingImageId, loadListings],
    );

    /* -------------------------------------------------------------------------- */
    /*  Derived values                                                            */
    /* -------------------------------------------------------------------------- */

    const filteredItems = data.items.filter((item) =>
        matchesSearch(item, searchQuery),
    );

    const summaryCards = getSummaryCards(data.summary);
    const emptyState = getEmptyStateCopy(searchQuery, activeFilter);

    const totalListings = data.pagination.total;

    const pageMotion = shouldReduceMotion
        ? {}
        : {
              initial: "hidden" as const,
              animate: "visible" as const,
              variants: pageVariants,
          };

    /* -------------------------------------------------------------------------- */
    /*  Render                                                                    */
    /* -------------------------------------------------------------------------- */

    return (
        <main className="min-h-screen overflow-x-hidden bg-[#F5F8FC] px-3 py-5 text-slate-900 sm:px-6 sm:py-8 lg:px-8">
            <motion.div
                {...pageMotion}
                className="mx-auto max-w-[1440px]"
            >
                {/* ------------------------------------------------------------------ */}
                {/* Header                                                             */}
                {/* ------------------------------------------------------------------ */}

                <motion.header
                    variants={sectionVariants}
                    className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_35px_-25px_rgba(15,23,42,0.2)] sm:p-7 lg:p-9"
                >
                    {/* Decorative background */}
                    <div className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full bg-[#1491FF]/[0.06] blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-32 right-1/3 size-64 rounded-full bg-[#1491FF]/[0.04] blur-3xl" />

                    <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-[#1491FF]"
                            >
                                <ArrowLeft size={14} />
                                Back to dashboard
                            </Link>

                            <div className="mt-6 flex items-start gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#1491FF]/15 bg-[#1491FF]/[0.08] text-[#1491FF] shadow-sm sm:size-14">
                                    <TrendingUp size={24} />
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl lg:text-[34px]">
                                            My listings
                                        </h1>

                                        <span className="rounded-full border border-[#1491FF]/15 bg-[#1491FF]/[0.06] px-2.5 py-1 text-[9px] font-bold tracking-wider text-[#1491FF]">
                                            SELLER CENTRE
                                        </span>
                                    </div>

                                    <p className="mt-2 max-w-lg text-xs leading-6 text-slate-500 sm:text-sm">
                                        Keep track of your vehicles, manage
                                        enquiries and stay on top of your
                                        marketplace activity.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="relative flex flex-col gap-3 sm:flex-row">
                            <motion.button
                                type="button"
                                whileTap={
                                    shouldReduceMotion ? undefined : { scale: 0.97 }
                                }
                                onClick={() =>
                                    void loadListings({ silent: true })
                                }
                                disabled={isLoading || isRefreshing}
                                className={SECONDARY_BUTTON}
                            >
                                {isRefreshing ? (
                                    <LoaderCircle
                                        size={16}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <RefreshCw size={16} />
                                )}

                                {isRefreshing ? "Refreshing..." : "Refresh"}
                            </motion.button>

                            <motion.div
                                whileHover={
                                    shouldReduceMotion
                                        ? undefined
                                        : { y: -2 }
                                }
                                whileTap={
                                    shouldReduceMotion
                                        ? undefined
                                        : { scale: 0.97 }
                                }
                            >
                                <Link
                                    href="/dashboard/my-listings/create"
                                    className={`${PRIMARY_BUTTON} w-full sm:w-auto`}
                                >
                                    <FilePlus2 size={17} />
                                    Create a listing
                                    <ArrowRight size={15} />
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </motion.header>

                {/* ------------------------------------------------------------------ */}
                {/* Feedback                                                           */}
                {/* ------------------------------------------------------------------ */}

                <AnimatePresence mode="popLayout">
                    {(error || notice) && (
                        <motion.div
                            key={error ? "error" : "notice"}
                            layout
                            className="mt-5"
                        >
                            {error && (
                                <FeedbackBanner
                                    type="error"
                                    message={error}
                                    onDismiss={() => setError(null)}
                                />
                            )}

                            {!error && notice && (
                                <FeedbackBanner
                                    type="success"
                                    message={notice}
                                    onDismiss={() => setNotice(null)}
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ------------------------------------------------------------------ */}
                {/* Summary cards                                                      */}
                {/* ------------------------------------------------------------------ */}

                <motion.section
                    variants={sectionVariants}
                    className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4"
                >
                    {summaryCards.map((card, index) => (
                        <motion.article
                            key={card.label}
                            variants={cardVariants}
                            custom={index}
                            whileHover={
                                shouldReduceMotion
                                    ? undefined
                                    : {
                                          y: -4,
                                          transition: { duration: 0.2 },
                                      }
                            }
                            className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_20px_-16px_rgba(15,23,42,0.2)] transition-shadow hover:border-[#1491FF]/25 hover:shadow-lg hover:shadow-[#1491FF]/[0.05] sm:p-5"
                        >
                            <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-[#1491FF]/[0.035] transition-transform duration-500 group-hover:scale-150" />

                            <div className="relative flex items-center justify-between gap-2">
                                <p className="text-[11px] font-semibold text-slate-500 sm:text-sm">
                                    {card.label}
                                </p>

                                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#1491FF]/[0.08] text-[#1491FF] transition duration-300 group-hover:bg-[#1491FF] group-hover:text-white">
                                    <TrendingUp size={15} />
                                </div>
                            </div>

                            <p
                                className={`relative mt-4 text-2xl font-bold tracking-tight sm:text-3xl ${card.className}`}
                            >
                                {card.value}
                            </p>

                            <p className="relative mt-1.5 text-[10px] leading-5 text-slate-400 sm:text-xs">
                                {card.description}
                            </p>
                        </motion.article>
                    ))}
                </motion.section>

                {/* ------------------------------------------------------------------ */}
                {/* Recently deleted                                                   */}
                {/* ------------------------------------------------------------------ */}

                <motion.section
                    variants={sectionVariants}
                    className="mt-5"
                >
                    <Link
                        href="/dashboard/my-listings/recently-deleted"
                        className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-900/[0.04] focus:outline-none focus:ring-4 focus:ring-rose-500/10 sm:p-5"
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition group-hover:bg-rose-100">
                                <Trash2 size={18} />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-sm font-bold text-slate-900">
                                    Recently deleted
                                </h2>

                                <p className="mt-1 text-[11px] leading-5 text-slate-500 sm:text-xs">
                                    View or restore listings you've deleted.
                                </p>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                                {data.summary.deleted ?? data.summary.DELETED}
                            </span>

                            <ArrowRight
                                size={17}
                                className="text-slate-400 transition duration-200 group-hover:translate-x-1 group-hover:text-rose-500"
                            />
                        </div>
                    </Link>
                </motion.section>

                {/* ------------------------------------------------------------------ */}
                {/* Search and filters                                                 */}
                {/* ------------------------------------------------------------------ */}

                <motion.section
                    variants={sectionVariants}
                    className="mt-9"
                >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <SectionLabel icon={SlidersHorizontal}>
                                Your vehicles
                            </SectionLabel>

                            <p className="ml-11 mt-1 text-[11px] text-slate-400">
                                Manage and track your marketplace listings.
                            </p>
                        </div>

                        <div className="relative w-full lg:max-w-md">
                            <Search
                                size={17}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(event.target.value)
                                }
                                placeholder="Search title, make, model or location..."
                                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-11 text-xs text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1491FF] focus:ring-4 focus:ring-[#1491FF]/10 sm:text-sm"
                            />

                            <AnimatePresence>
                                {searchQuery && (
                                    <motion.button
                                        type="button"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        onClick={() => setSearchQuery("")}
                                        aria-label="Clear search"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                    >
                                        <X size={15} />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="mt-5 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {STATUS_FILTERS.map((filter) => {
                            const selected =
                                activeFilter === filter.value;

                            const count = getStatusCount(
                                data.summary,
                                filter.value,
                            );

                            return (
                                <button
                                    key={filter.value}
                                    type="button"
                                    onClick={() =>
                                        handleFilterChange(filter.value)
                                    }
                                    className={`relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${
                                        selected
                                            ? "border-[#1491FF] text-white shadow-md shadow-[#1491FF]/15"
                                            : "border-slate-200 bg-white text-slate-500 hover:border-[#1491FF]/30 hover:bg-[#1491FF]/[0.03] hover:text-[#1491FF]"
                                    }`}
                                >
                                    {selected && (
                                        <motion.span
                                            layoutId="active-listing-filter"
                                            className="absolute inset-0 rounded-xl bg-[#1491FF]"
                                            transition={{
                                                type: "spring",
                                                stiffness: 400,
                                                damping: 32,
                                            }}
                                        />
                                    )}

                                    <span className="relative z-10">
                                        {filter.label}
                                    </span>

                                    <span
                                        className={`relative z-10 rounded-md px-1.5 py-0.5 text-[10px] ${
                                            selected
                                                ? "bg-white/20 text-white"
                                                : "bg-slate-100 text-slate-500"
                                        }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-[11px] text-slate-400">
                            Showing{" "}
                            <span className="font-semibold text-slate-600">
                                {filteredItems.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-slate-600">
                                {totalListings}
                            </span>{" "}
                            listings
                        </p>

                        {isRefreshing && (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#1491FF]">
                                <LoaderCircle
                                    size={12}
                                    className="animate-spin"
                                />
                                Updating...
                            </span>
                        )}
                    </div>
                </motion.section>

                {/* ------------------------------------------------------------------ */}
                {/* Listings content                                                   */}
                {/* ------------------------------------------------------------------ */}

                <section className="mt-6">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="flex min-h-72 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm"
                            >
                                <div className="flex flex-col items-center gap-4 text-center">
                                    <div className="relative flex size-14 items-center justify-center rounded-2xl bg-[#1491FF]/[0.08] text-[#1491FF]">
                                        <LoaderCircle
                                            size={25}
                                            className="animate-spin"
                                        />
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold text-slate-800">
                                            Loading your listings
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Just a moment while we get
                                            everything ready.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : filteredItems.length === 0 ? (
                            <motion.section
                                key="empty"
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="rounded-3xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm sm:px-8"
                            >
                                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-[#1491FF]/15 bg-[#1491FF]/[0.07] text-[#1491FF]">
                                    {searchQuery ? (
                                        <Search size={25} />
                                    ) : (
                                        <FilePlus2 size={25} />
                                    )}
                                </div>

                                <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900">
                                    {emptyState.title}
                                </h3>

                                <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-slate-500 sm:text-sm">
                                    {emptyState.description}
                                </p>

                                {searchQuery ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSearchQuery("")
                                        }
                                        className={`${SECONDARY_BUTTON} mt-6`}
                                    >
                                        <X size={15} />
                                        Clear search
                                    </button>
                                ) : activeFilter === "ALL" ? (
                                    <Link
                                        href="/dashboard/my-listings/create"
                                        className={`${PRIMARY_BUTTON} mt-6`}
                                    >
                                        <FilePlus2 size={16} />
                                        Create your first listing
                                    </Link>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleFilterChange("ALL")
                                        }
                                        className={`${SECONDARY_BUTTON} mt-6`}
                                    >
                                        View all listings
                                        <ArrowRight size={15} />
                                    </button>
                                )}
                            </motion.section>
                        ) : (
                            <motion.div
                                key={`listings-${activeFilter}-${page}`}
                                initial={
                                    shouldReduceMotion
                                        ? false
                                        : { opacity: 0, y: 10 }
                                }
                                animate={{ opacity: 1, y: 0 }}
                                exit={
                                    shouldReduceMotion
                                        ? undefined
                                        : { opacity: 0, y: -6 }
                                }
                                transition={{ duration: 0.25 }}
                            >
                                <motion.div
                                    layout
                                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                                >
                                    <AnimatePresence mode="popLayout">
                                        {filteredItems.map((item, index) => {
                                            const { listing } = item;

                                            const vehicleName = getVehicleName(item);
                                            const busy = busyListingId === listing.id;
                                            const menuOpen = menuListingId === listing.id;

                                            const coverImage =
                                                item.coverImage?.thumbnailUrl ||
                                                item.coverImage?.url;

                                            const editHref = `/dashboard/my-listings/${encodeURIComponent(listing.id)}/edit`;

                                            return (
                                                <motion.article
                                                    key={listing.id}
                                                    layout
                                                    variants={cardVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    transition={{
                                                        layout: { duration: 0.25 },
                                                        delay: Math.min(index * 0.035, 0.25),
                                                    }}
                                                    whileHover={
                                                        shouldReduceMotion
                                                            ? undefined
                                                            : {
                                                                y: -3,
                                                                transition: { duration: 0.2 },
                                                            }
                                                    }
                                                    className="
                                                        group relative overflow-visible
                                                        rounded-2xl border border-slate-200/80
                                                        bg-white
                                                        shadow-[0_3px_14px_rgba(15,23,42,0.055)]
                                                        transition-all duration-300
                                                        hover:border-[#1491FF]/30
                                                        hover:shadow-[0_12px_28px_rgba(15,23,42,0.09)]
                                                        hover:shadow-[#1491FF]/[0.06]
                                                    "
                                                >
                                                    {/* Vehicle image */}
                                                    <div className="relative h-40 overflow-hidden rounded-t-2xl border-b border-slate-100 bg-gradient-to-br from-[#1491FF]/10 via-slate-50 to-slate-100 sm:h-36">
                                                        {coverImage ? (
                                                            <Image
                                                                src={coverImage}
                                                                alt={`${listing.title} vehicle`}
                                                                fill
                                                                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                                                                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                                                unoptimized
                                                            />
                                                        ) : (
                                                            <ListingImagePlaceholder />
                                                        )}

                                                        {/* Image overlay */}
                                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-slate-950/[0.08]" />

                                                        {/* Status badge */}
                                                        <div className="absolute left-2.5 top-2.5">
                                                            <span
                                                                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold shadow-sm backdrop-blur-md ${STATUS_STYLES[listing.status]}`}
                                                            >
                                                                <StatusIcon status={listing.status} />
                                                                {formatStatus(listing.status)}
                                                            </span>
                                                        </div>

                                                        {/* Actions menu */}
                                                        <div
                                                            className="absolute right-2.5 top-2.5"
                                                            onClick={(event) => event.stopPropagation()}
                                                        >
                                                            <button
                                                                type="button"
                                                                aria-label="Open listing actions"
                                                                aria-expanded={menuOpen}
                                                                onClick={() =>
                                                                    setMenuListingId(
                                                                        menuOpen ? null : listing.id,
                                                                    )
                                                                }
                                                                className="
                                                                    flex size-8 items-center justify-center
                                                                    rounded-lg border border-white/70
                                                                    bg-white/95 text-slate-600
                                                                    shadow-md backdrop-blur-md
                                                                    transition-all duration-200
                                                                    hover:bg-white hover:text-[#1491FF]
                                                                    hover:shadow-lg
                                                                "
                                                            >
                                                                <MoreHorizontal size={17} />
                                                            </button>

                                                            <AnimatePresence>
                                                                {menuOpen && (
                                                                    <motion.div
                                                                        variants={menuVariants}
                                                                        initial="hidden"
                                                                        animate="visible"
                                                                        exit="exit"
                                                                        className="
                                                                            absolute right-0 top-10 z-30
                                                                            w-48 origin-top-right
                                                                            rounded-xl border border-slate-200
                                                                            bg-white p-1.5
                                                                            shadow-xl shadow-slate-900/10
                                                                        "
                                                                    >
                                                                        {canEdit(listing.status) && (
                                                                            <Link
                                                                                href={editHref}
                                                                                onClick={() =>
                                                                                    setMenuListingId(null)
                                                                                }
                                                                                className={MENU_ITEM_CLASS}
                                                                            >
                                                                                <Pencil size={13} />
                                                                                Edit listing
                                                                            </Link>
                                                                        )}

                                                                        {canSubmit(listing.status) && (
                                                                            <button
                                                                                type="button"
                                                                                disabled={busy}
                                                                                onClick={() =>
                                                                                    void handleLifecycleAction(
                                                                                        item,
                                                                                        "submit",
                                                                                    )
                                                                                }
                                                                                className={MENU_ITEM_CLASS}
                                                                            >
                                                                                <CheckCircle2 size={13} />
                                                                                Submit for review
                                                                            </button>
                                                                        )}

                                                                        {canMarkSold(listing.status) && (
                                                                            <button
                                                                                type="button"
                                                                                disabled={busy}
                                                                                onClick={() =>
                                                                                    void handleLifecycleAction(
                                                                                        item,
                                                                                        "sold",
                                                                                    )
                                                                                }
                                                                                className={MENU_ITEM_CLASS}
                                                                            >
                                                                                <Check size={13} />
                                                                                Mark as sold
                                                                            </button>
                                                                        )}

                                                                        {canReactivate(listing.status) && (
                                                                            <button
                                                                                type="button"
                                                                                disabled={busy}
                                                                                onClick={() =>
                                                                                    void handleLifecycleAction(
                                                                                        item,
                                                                                        "reactivate",
                                                                                    )
                                                                                }
                                                                                className={MENU_ITEM_CLASS}
                                                                            >
                                                                                <RotateCcw size={13} />
                                                                                Reactivate listing
                                                                            </button>
                                                                        )}

                                                                        {(canEdit(listing.status) ||
                                                                            canSubmit(listing.status) ||
                                                                            canMarkSold(listing.status) ||
                                                                            canReactivate(listing.status)) && (
                                                                            <div className="my-1 border-t border-slate-100" />
                                                                        )}

                                                                        {canDelete(listing.status) && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setDeleteTarget(item);
                                                                                    setMenuListingId(null);
                                                                                }}
                                                                                className="
                                                                                    flex w-full items-center gap-2
                                                                                    rounded-lg px-3 py-2
                                                                                    text-left text-xs font-medium
                                                                                    text-red-600 transition
                                                                                    hover:bg-red-50
                                                                                "
                                                                            >
                                                                                <Trash2 size={13} />
                                                                                Delete listing
                                                                            </button>
                                                                        )}
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>

                                                        {/* Busy overlay */}
                                                        <AnimatePresence>
                                                            {busy && (
                                                                <motion.div
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    exit={{ opacity: 0 }}
                                                                    className="
                                                                        absolute inset-0 z-20
                                                                        flex items-center justify-center
                                                                        bg-white/80 backdrop-blur-[2px]
                                                                    "
                                                                >
                                                                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] font-semibold text-slate-600 shadow-lg">
                                                                        <LoaderCircle
                                                                            size={15}
                                                                            className="animate-spin text-[#1491FF]"
                                                                        />
                                                                        Updating listing...
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>

                                                    {/* Card content */}
                                                    <div className="p-3.5">
                                                        {/* Title */}
                                                        <div className="min-w-0">
                                                            <h3 className="truncate text-sm font-bold tracking-tight text-slate-900 transition-colors group-hover:text-[#1491FF]">
                                                                {listing.title}
                                                            </h3>

                                                            {vehicleName && (
                                                                <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">
                                                                    {vehicleName}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Price */}
                                                        <div className="mt-3 flex items-center justify-between gap-2">
                                                            <p className="text-lg font-extrabold tracking-tight text-[#1491FF]">
                                                                {formatPrice(
                                                                    listing.price,
                                                                    listing.currency,
                                                                )}
                                                            </p>

                                                            <span className="shrink-0 rounded-lg bg-slate-50 px-2 py-1 text-[9px] font-semibold text-slate-500">
                                                                {formatStatus(listing.status)}
                                                            </span>
                                                        </div>

                                                        {/* Location */}
                                                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                                                            <MapPin
                                                                size={12}
                                                                className="shrink-0 text-[#1491FF]"
                                                            />

                                                            <span className="truncate">
                                                                {getListingLocation(item) ||
                                                                    "Location not provided"}
                                                            </span>
                                                        </div>

                                                        {/* Dates */}
                                                        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-wide text-slate-400">
                                                                    <Clock3 size={10} />
                                                                    Created
                                                                </div>

                                                                <p className="mt-1 truncate text-[11px] font-semibold text-slate-600">
                                                                    {formatDate(listing.createdAt)}
                                                                </p>
                                                            </div>

                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-wide text-slate-400">
                                                                    <RefreshCw size={10} />
                                                                    Updated
                                                                </div>

                                                                <p className="mt-1 truncate text-[11px] font-semibold text-slate-600">
                                                                    {formatDate(listing.updatedAt)}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Review feedback */}
                                                        {listing.rejectionReason && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="mt-3 rounded-xl border border-red-100 bg-red-50/80 p-2.5"
                                                            >
                                                                <div className="flex items-center gap-1.5 text-red-700">
                                                                    <AlertCircle size={12} />

                                                                    <p className="text-[10px] font-bold">
                                                                        Review feedback
                                                                    </p>
                                                                </div>

                                                                <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-red-600">
                                                                    {listing.rejectionReason}
                                                                </p>
                                                            </motion.div>
                                                        )}

                                                        {/* Footer actions */}
                                                        <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                                                            {canEdit(listing.status) ? (
                                                                <Link
                                                                    href={editHref}
                                                                    className="
                                                                        inline-flex h-9 flex-1 items-center
                                                                        justify-center gap-1.5
                                                                        rounded-lg bg-[#1491FF] px-2.5
                                                                        text-[11px] font-bold text-white
                                                                        shadow-[0_3px_8px_rgba(20,145,255,0.16)]
                                                                        transition-all duration-200
                                                                        hover:bg-[#087EDB]
                                                                        hover:shadow-[0_5px_12px_rgba(20,145,255,0.22)]
                                                                        active:scale-[0.98]
                                                                    "
                                                                >
                                                                    <Pencil size={12} />
                                                                    Manage listing
                                                                </Link>
                                                            ) : (
                                                                <Link
                                                                    href={editHref}
                                                                    className="
                                                                        inline-flex h-9 flex-1 items-center
                                                                        justify-center gap-1.5
                                                                        rounded-lg border border-slate-200
                                                                        bg-white px-2.5
                                                                        text-[11px] font-bold text-slate-600
                                                                        transition-all duration-200
                                                                        hover:border-[#1491FF]/30
                                                                        hover:bg-[#1491FF]/[0.04]
                                                                        hover:text-[#1491FF]
                                                                    "
                                                                >
                                                                    <Eye size={12} />
                                                                    View details
                                                                </Link>
                                                            )}

                                                            {listing.status === "APPROVED" && (
                                                                <Link
                                                                    href={`/vehicles/${encodeURIComponent(listing.id)}`}
                                                                    aria-label="View marketplace listing"
                                                                    className="
                                                                        flex size-9 shrink-0 items-center
                                                                        justify-center rounded-lg
                                                                        border border-[#1491FF]/20
                                                                        bg-[#1491FF]/[0.06]
                                                                        text-[#1491FF]
                                                                        transition-all duration-200
                                                                        hover:bg-[#1491FF]
                                                                        hover:text-white
                                                                        hover:shadow-md hover:shadow-[#1491FF]/20
                                                                    "
                                                                >
                                                                    <ArrowRight size={15} />
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.article>
                                            );
                                        })}
                                    </AnimatePresence>
                                </motion.div>

                                {/* ------------------------------------------------ */}
                                {/* Pagination                                     */}
                                {/* ------------------------------------------------ */}

                                <AnimatePresence>
                                    {data.pagination.totalPages > 1 && (
                                        <motion.nav
                                            initial={{
                                                opacity: 0,
                                                y: 10,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: 8,
                                            }}
                                            aria-label="Listing pagination"
                                            className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
                                        >
                                            <div>
                                                <p className="text-xs font-semibold text-slate-700">
                                                    Page{" "}
                                                    {
                                                        data.pagination.page
                                                    }{" "}
                                                    of{" "}
                                                    {
                                                        data.pagination
                                                            .totalPages
                                                    }
                                                </p>

                                                <p className="mt-1 text-[11px] text-slate-400">
                                                    {totalListings} listings
                                                    in total
                                                </p>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPage((current) =>
                                                            Math.max(
                                                                1,
                                                                current - 1,
                                                            ),
                                                        )
                                                    }
                                                    disabled={
                                                        !data.pagination
                                                            .hasPreviousPage ||
                                                        isLoading
                                                    }
                                                    className={SECONDARY_BUTTON}
                                                >
                                                    <ArrowLeft size={14} />
                                                    Previous
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPage(
                                                            (current) =>
                                                                current + 1,
                                                        )
                                                    }
                                                    disabled={
                                                        !data.pagination
                                                            .hasNextPage ||
                                                        isLoading
                                                    }
                                                    className={PRIMARY_BUTTON}
                                                >
                                                    Next
                                                    <ArrowRight size={14} />
                                                </button>
                                            </div>
                                        </motion.nav>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </motion.div>

            {/* ------------------------------------------------------------------ */}
            {/* Delete confirmation modal                                         */}
            {/* ------------------------------------------------------------------ */}

            <AnimatePresence>
                {deleteTarget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-md"
                        role="presentation"
                        onMouseDown={(event) => {
                            if (
                                event.target === event.currentTarget &&
                                !isDeleting
                            ) {
                                setDeleteTarget(null);
                            }
                        }}
                    >
                        <motion.section
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="delete-listing-title"
                            className="w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl shadow-slate-950/20"
                        >
                            <div className="p-6 sm:p-7">
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
                                    <Trash2 size={21} />
                                </div>

                                <h2
                                    id="delete-listing-title"
                                    className="mt-5 text-xl font-bold tracking-tight text-slate-900"
                                >
                                    Delete this listing?
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    You're about to delete{" "}
                                    <span className="font-bold text-slate-800">
                                        {deleteTarget.listing.title}
                                    </span>
                                    . Please make sure this is the listing you
                                    want to remove.
                                </p>

                                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3">
                                    <div className="flex items-start gap-2.5">
                                        <AlertCircle
                                            size={16}
                                            className="mt-0.5 shrink-0 text-amber-600"
                                        />

                                        <p className="text-[11px] leading-5 text-amber-800">
                                            You may not be able to recover this
                                            listing unless it is available in
                                            your recently deleted section.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDeleteTarget(null)
                                        }
                                        disabled={isDeleting}
                                        className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                                    >
                                        Keep listing
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            void handleDelete()
                                        }
                                        disabled={isDeleting}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/15 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isDeleting ? (
                                            <LoaderCircle
                                                size={16}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Trash2 size={15} />
                                        )}

                                        {isDeleting
                                            ? "Deleting..."
                                            : "Delete listing"}
                                    </button>
                                </div>
                            </div>
                        </motion.section>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}