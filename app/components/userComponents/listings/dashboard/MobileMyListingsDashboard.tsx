"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
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
    Clock3,
    ExternalLink,
    Eye,
    FilePlus2,
    History,
    Image as ImageIcon,
    LoaderCircle,
    MapPin,
    MoreHorizontal,
    Pencil,
    RefreshCw,
    RotateCcw,
    Search,
    ShieldAlert,
    SlidersHorizontal,
    Sparkles,
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
    ListingSummary,
    SellerListingItem,
    ListingPagination,
} from "@/app/types/user/listings/listing.types";

type DashboardFilter = "ALL" | ListingStatus;

interface DashboardData {
    summary: ListingSummary;
    items: SellerListingItem[];
    pagination: ListingPagination;
}

const BRAND = "#1491FF";
const PAGE_SIZE = 12;
const POLLING_INTERVAL = 5000;

const FILTERS: {
    label: string;
    value: DashboardFilter;
}[] = [
    { label: "All", value: "ALL" },
    { label: "Live", value: "APPROVED" },
    { label: "Pending", value: "PENDING_REVIEW" },
    { label: "Drafts", value: "DRAFT" },
    { label: "Rejected", value: "REJECTED" },
    { label: "Expired", value: "EXPIRED" },
    { label: "Sold", value: "SOLD" },
    { label: "Suspended", value: "SUSPENDED" },
];

const STATUS_STYLES: Record<ListingStatus, string> = {
    DRAFT: "border-slate-200 bg-slate-100 text-slate-600",
    PENDING_REVIEW: "border-amber-200 bg-amber-50 text-amber-700",
    APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
    EXPIRED: "border-slate-200 bg-slate-100 text-slate-500",
    SOLD: "border-blue-200 bg-blue-50 text-blue-700",
    SUSPENDED: "border-rose-200 bg-rose-50 text-rose-700",
    DELETED: "border-slate-200 bg-slate-100 text-slate-500",
};

const cardVariants = {
    hidden: {
        opacity: 0,
        y: 12,
    },
    visible: {
        opacity: 1,
        y: 0,
    },
};

const overlayVariants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
    },
    exit: {
        opacity: 0,
    },
};

const sheetVariants = {
    hidden: {
        opacity: 0,
        y: 35,
    },
    visible: {
        opacity: 1,
        y: 0,
    },
    exit: {
        opacity: 0,
        y: 35,
    },
};

function initialSummary(): ListingSummary {
    return {
        DRAFT: 0,
        PENDING_REVIEW: 0,
        APPROVED: 0,
        REJECTED: 0,
        EXPIRED: 0,
        SOLD: 0,
        SUSPENDED: 0,
        DELETED: 0,
        total: 0,
        deleted: 0,
    };
}

function initialPagination(): ListingPagination {
    return {
        page: 1,
        limit: PAGE_SIZE,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    };
}

function errorMessage(error: unknown, fallback: string) {
    return error instanceof Error && error.message.trim()
        ? error.message
        : fallback;
}

function formatStatus(status: ListingStatus) {
    return status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatPrice(price: string | number, currency: string) {
    const amount = Number(price);

    if (!Number.isFinite(amount)) {
        return `${currency} ${price}`;
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

function formatDate(value: string | Date | null | undefined) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

function vehicleName(item: SellerListingItem) {
    return [
        item.vehicleMake?.name,
        item.vehicleModel?.name,
        item.vehicleGeneration?.name,
        item.vehicleVariant?.name,
    ]
        .filter(
            (value): value is string =>
                Boolean(value?.trim()),
        )
        .join(" ");
}

function locationName(item: SellerListingItem) {
    return [
        item.listing.city,
        item.listing.state,
        item.listing.country,
    ]
        .filter(
            (value): value is string =>
                Boolean(value?.trim()),
        )
        .join(", ");
}

function canEdit(status: ListingStatus) {
    return status === "DRAFT" || status === "REJECTED";
}

function canSubmit(status: ListingStatus) {
    return status === "DRAFT" || status === "REJECTED";
}

function canMarkSold(status: ListingStatus) {
    return status === "APPROVED";
}

function canReactivate(status: ListingStatus) {
    return (
        status === "EXPIRED" ||
        status === "SOLD" ||
        status === "SUSPENDED"
    );
}

function canDelete(status: ListingStatus) {
    return status !== "DELETED";
}

function StatusGlyph({
    status,
}: {
    status: ListingStatus;
}) {
    if (status === "APPROVED") {
        return <CheckCircle2 size={11} />;
    }

    if (
        status === "REJECTED" ||
        status === "SUSPENDED"
    ) {
        return <ShieldAlert size={11} />;
    }

    return <Clock3 size={11} />;
}

function getImageStatusLabel(status: string) {
    switch (status) {
        case "PENDING":
            return "Checking";
        case "PASSED":
            return "Passed";
        case "REVIEW":
            return "Needs review";
        case "FAILED":
            return "Failed";
        default:
            return "Unknown";
    }
}

function getImageStatusStyles(status: string) {
    switch (status) {
        case "PENDING":
            return "border-amber-200 bg-amber-50 text-amber-700";

        case "PASSED":
            return "border-emerald-200 bg-emerald-50 text-emerald-700";

        case "REVIEW":
            return "border-orange-200 bg-orange-50 text-orange-700";

        case "FAILED":
            return "border-rose-200 bg-rose-50 text-rose-700";

        default:
            return "border-slate-200 bg-slate-100 text-slate-600";
    }
}

function getImageAnalysisMessage(item: SellerListingItem) {
    const analysis = item.imageAnalysis;

    if (!analysis || analysis.total === 0) {
        return "No image-analysis information is available.";
    }

    if (analysis.pending > 0) {
        return analysis.pending === 1
            ? "One image is still being checked."
            : `${analysis.pending} images are still being checked.`;
    }

    if (analysis.failed > 0) {
        return analysis.failed === 1
            ? "One image could not be analysed."
            : `${analysis.failed} images could not be analysed.`;
    }

    if (analysis.review > 0) {
        return analysis.review === 1
            ? "One image requires further review."
            : `${analysis.review} images require further review.`;
    }

    if (
        analysis.passed === analysis.total &&
        analysis.total > 0
    ) {
        return "All listing images passed automated checks.";
    }

    return "Image checks have been completed.";
}

export default function MobileMyListingsDashboard() {
    const prefersReducedMotion = useReducedMotion();

    const [data, setData] = useState<DashboardData>({
        summary: initialSummary(),
        items: [],
        pagination: initialPagination(),
    });

    const [activeFilter, setActiveFilter] =
        useState<DashboardFilter>("ALL");

    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [busyListingId, setBusyListingId] =
        useState<string | null>(null);

    const [retryingImageId, setRetryingImageId] =
        useState<string | null>(null);

    const [menuListing, setMenuListing] =
        useState<SellerListingItem | null>(null);

    const [deleteTarget, setDeleteTarget] =
        useState<SellerListingItem | null>(null);

    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const loadListings = useCallback(
        async (silent = false) => {
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
                    errorMessage(
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

    /*
     * Poll pending image-analysis jobs.
     * Each request finishes before the next polling timer starts,
     * preventing overlapping requests.
     */
    useEffect(() => {
        const hasPendingAnalysis = data.items.some(
            (item) =>
                (item.imageAnalysis?.pending ?? 0) > 0,
        );

        if (!hasPendingAnalysis) return;

        let cancelled = false;
        let timeoutId: number | undefined;

        const poll = async () => {
            await loadListings(true);

            if (!cancelled) {
                timeoutId = window.setTimeout(
                    poll,
                    POLLING_INTERVAL,
                );
            }
        };

        timeoutId = window.setTimeout(
            poll,
            POLLING_INTERVAL,
        );

        return () => {
            cancelled = true;

            if (timeoutId !== undefined) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [data.items, loadListings]);

    useEffect(() => {
        if (!menuListing && !deleteTarget) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                if (isDeleting) return;

                setMenuListing(null);
                setDeleteTarget(null);
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleEscape);
        };
    }, [menuListing, deleteTarget, isDeleting]);

    const changeFilter = (filter: DashboardFilter) => {
        setActiveFilter(filter);
        setPage(1);
        setNotice(null);
        setError(null);
        setMenuListing(null);
    };

    const runAction = async (
        item: SellerListingItem,
        action: "submit" | "reactivate" | "sold",
    ) => {
        if (busyListingId) return;

        setBusyListingId(item.listing.id);
        setError(null);
        setNotice(null);
        setMenuListing(null);

        try {
            const response = await performSellerListingAction(
                item.listing.id,
                action,
            );

            setNotice(
                response.message ??
                    "Your listing action was completed.",
            );

            await loadListings(true);
        } catch (requestError) {
            setError(
                errorMessage(
                    requestError,
                    "The listing action could not be completed.",
                ),
            );
        } finally {
            setBusyListingId(null);
        }
    };

    const removeListing = async () => {
        if (!deleteTarget || isDeleting) return;

        setIsDeleting(true);
        setError(null);
        setNotice(null);

        try {
            const response = await deleteSellerListing(
                deleteTarget.listing.id,
            );

            setNotice(
                response.message ?? "Your listing was deleted.",
            );

            setDeleteTarget(null);

            await loadListings(true);
        } catch (requestError) {
            setError(
                errorMessage(
                    requestError,
                    "Unable to delete this listing.",
                ),
            );
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRetryImageAnalysis = async (
        listingId: string,
        imageId: string,
    ) => {
        if (retryingImageId) return;

        setRetryingImageId(imageId);
        setError(null);
        setNotice(null);

        try {
            const response = await retrySellerImageAnalysis(
                listingId,
                imageId,
            );

            setNotice(
                response.message ??
                    "Image analysis has been queued.",
            );

            await loadListings(true);
        } catch (requestError) {
            setError(
                errorMessage(
                    requestError,
                    "Unable to retry image analysis. Please try again.",
                ),
            );
        } finally {
            setRetryingImageId(null);
        }
    };

    const filteredItems = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) return data.items;

        return data.items.filter((item) =>
            [
                item.listing.title,
                item.vehicleMake?.name,
                item.vehicleModel?.name,
                item.vehicleGeneration?.name,
                item.vehicleVariant?.name,
                item.listing.city,
                item.listing.state,
                item.listing.status,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(query),
        );
    }, [data.items, searchQuery]);

    const deletedCount =
        data.summary.deleted ?? data.summary.DELETED;

    const transition = prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.22, ease: "easeOut" as const };

    return (
        <main className="min-h-screen overflow-x-hidden bg-[#F7F9FC] text-slate-900 lg:hidden">
            <div className="mx-auto w-full max-w-xl px-4 pb-32 pt-5">

                {/* HEADER */}
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            aria-label="Back to dashboard"
                            className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-[#1491FF]"
                        >
                            <ArrowLeft size={18} />
                        </Link>

                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-slate-900">
                                My listings
                            </h1>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Manage your vehicles
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => void loadListings(true)}
                        disabled={isLoading || isRefreshing}
                        aria-label="Refresh listings"
                        className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:text-[#1491FF] disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={isRefreshing ? "animate-spin" : ""}
                        />
                    </button>
                </header>

                {/* OVERVIEW */}
                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500">
                                Total listings
                            </p>

                            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                                {data.summary.total}
                            </p>
                        </div>

                        <div className="flex size-11 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#1491FF]">
                            <FilePlus2 size={20} />
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 pt-4">
                        <div>
                            <p className="text-[11px] text-slate-500">
                                Live
                            </p>
                            <p className="mt-1 text-lg font-semibold text-emerald-600 tabular-nums">
                                {data.summary.APPROVED}
                            </p>
                        </div>

                        <div className="pl-4">
                            <p className="text-[11px] text-slate-500">
                                Pending
                            </p>
                            <p className="mt-1 text-lg font-semibold text-amber-600 tabular-nums">
                                {data.summary.PENDING_REVIEW}
                            </p>
                        </div>

                        <div className="pl-4">
                            <p className="text-[11px] text-slate-500">
                                Drafts
                            </p>
                            <p className="mt-1 text-lg font-semibold text-slate-800 tabular-nums">
                                {data.summary.DRAFT}
                            </p>
                        </div>
                    </div>
                </section>

                <Link
                    href="/dashboard/boost-history"
                    className="inline-flex items-center mt-2 gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#1491FF] hover:text-[#1491FF]"
                >
                    <History size={16} />
                    Boost history
                </Link>

                {/* DELETED LISTINGS */}
                <Link
                    href="/dashboard/my-listings/recently-deleted"
                    className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition hover:border-blue-200"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                            <Trash2 size={16} />
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-slate-800">
                                Recently deleted
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                                View or restore listings
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">
                            {deletedCount}
                        </span>
                        <ArrowRight size={15} className="text-slate-400" />
                    </div>
                </Link>

                {/* SEARCH */}
                <div className="mt-6">
                    <label className="relative block">
                        <Search
                            size={17}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(event) =>
                                setSearchQuery(event.target.value)
                            }
                            placeholder="Search your listings"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1491FF] focus:ring-2 focus:ring-[#1491FF]/10"
                        />
                    </label>
                </div>

                {/* FILTERS */}
                <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {FILTERS.map((filter) => {
                        const selected = activeFilter === filter.value;

                        const count =
                            filter.value === "ALL"
                                ? data.summary.total
                                : data.summary[filter.value] ?? 0;

                        return (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() => changeFilter(filter.value)}
                                className={`flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition ${
                                    selected
                                        ? "border-[#1491FF] bg-[#1491FF] text-white"
                                        : "border-slate-200 bg-white text-slate-600"
                                }`}
                            >
                                {filter.label}

                                <span
                                    className={`text-[10px] ${
                                        selected
                                            ? "text-white/75"
                                            : "text-slate-400"
                                    }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* INVENTORY HEADING */}
                <div className="mb-3 mt-7 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-900">
                            Your inventory
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            {filteredItems.length}{" "}
                            {filteredItems.length === 1 ? "listing" : "listings"}
                        </p>
                    </div>
                </div>

                {/* ERROR */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-700"
                            role="alert"
                        >
                            <AlertCircle size={15} className="mt-0.5 shrink-0" />
                            <p className="flex-1">{error}</p>

                            <button
                                type="button"
                                onClick={() => setError(null)}
                                aria-label="Dismiss error"
                            >
                                <X size={14} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* SUCCESS MESSAGE */}
                <AnimatePresence>
                    {notice && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-700"
                            role="status"
                        >
                            <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                            <p className="flex-1">{notice}</p>

                            <button
                                type="button"
                                onClick={() => setNotice(null)}
                                aria-label="Dismiss notification"
                            >
                                <X size={14} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* LOADING */}
                {isLoading ? (
                    <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white">
                        <LoaderCircle
                            size={23}
                            className="animate-spin text-[#1491FF]"
                        />
                        <p className="mt-3 text-xs font-medium text-slate-600">
                            Loading your listings...
                        </p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    /* EMPTY STATE */
                    <section className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#1491FF]">
                            {searchQuery ? (
                                <Search size={21} />
                            ) : (
                                <FilePlus2 size={21} />
                            )}
                        </div>

                        <h3 className="mt-4 text-sm font-semibold text-slate-900">
                            {searchQuery
                                ? "No matching listings"
                                : activeFilter === "ALL"
                                ? "No listings yet"
                                : `No ${FILTERS.find(
                                        (filter) =>
                                            filter.value === activeFilter,
                                    )?.label.toLowerCase()} listings`}
                        </h3>

                        <p className="mx-auto mt-1.5 max-w-xs text-xs leading-5 text-slate-500">
                            {searchQuery
                                ? "Try searching with another vehicle name or location."
                                : activeFilter === "ALL"
                                ? "Your vehicles will appear here once you create a listing."
                                : "There are currently no listings in this category."}
                        </p>

                        {searchQuery ? (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="mt-4 text-xs font-semibold text-[#0877D9]"
                            >
                                Clear search
                            </button>
                        ) : activeFilter !== "ALL" ? (
                            <button
                                type="button"
                                onClick={() => changeFilter("ALL")}
                                className="mt-4 text-xs font-semibold text-[#0877D9]"
                            >
                                View all listings
                            </button>
                        ) : null}
                    </section>
                ) : (
                    /* LISTING CARDS */
                    <motion.div layout className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {filteredItems.map((item) => {
                                const listing = item.listing;

                                const busy =
                                    busyListingId === listing.id;

                                const coverImageUrl =
                                    item.coverImage?.thumbnailUrl ||
                                    item.coverImage?.url;

                                const name = vehicleName(item);

                                return (
                                    <motion.article
                                        layout
                                        key={listing.id}
                                        initial={
                                            prefersReducedMotion
                                                ? false
                                                : { opacity: 0, y: 8 }
                                        }
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={transition}
                                        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                                    >
                                        {/* LISTING */}
                                        <div className="flex gap-3 p-3.5">
                                            <div className="relative size-[92px] shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                                {coverImageUrl ? (
                                                    <Image
                                                        src={coverImageUrl}
                                                        alt={`${listing.title} vehicle`}
                                                        fill
                                                        sizes="92px"
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="flex size-full items-center justify-center text-slate-400">
                                                        <ImageIcon size={22} />
                                                    </div>
                                                )}

                                                {busy && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-white/75">
                                                        <LoaderCircle
                                                            size={20}
                                                            className="animate-spin text-[#1491FF]"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span
                                                        className={`inline-flex max-w-[calc(100%-36px)] items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-medium ${STATUS_STYLES[listing.status]}`}
                                                    >
                                                        <StatusGlyph
                                                            status={listing.status}
                                                        />
                                                        <span className="truncate">
                                                            {formatStatus(listing.status)}
                                                        </span>
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setMenuListing(item)
                                                        }
                                                        aria-label={`Actions for ${listing.title}`}
                                                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                                                    >
                                                        <MoreHorizontal size={19} />
                                                    </button>
                                                </div>

                                                <h3 className="mt-1.5 line-clamp-1 text-sm font-semibold text-slate-900">
                                                    {listing.title}
                                                </h3>

                                                {name && (
                                                    <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">
                                                        {name}
                                                    </p>
                                                )}

                                                <p className="mt-2 text-base font-bold tracking-tight text-slate-900">
                                                    {formatPrice(
                                                        listing.price,
                                                        listing.currency,
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* LOCATION */}
                                        <div className="flex items-center gap-1.5 border-t border-slate-100 px-3.5 py-2.5">
                                            <MapPin
                                                size={13}
                                                className="shrink-0 text-slate-400"
                                            />

                                            <span className="min-w-0 flex-1 truncate text-[11px] text-slate-500">
                                                {locationName(item) ||
                                                    "Location not provided"}
                                            </span>

                                            <span className="shrink-0 text-[10px] text-slate-400">
                                                {formatDate(listing.createdAt)}
                                            </span>
                                        </div>

                                        {/* ACTIONS */}
                                        <div className="flex gap-2 px-3.5 pb-3.5">
                                            <Link
                                                href={`/dashboard/my-listings/${encodeURIComponent(listing.id)}/edit`}
                                                className={`flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition ${
                                                    canEdit(listing.status)
                                                        ? "bg-[#1491FF] text-white hover:bg-[#0877D9]"
                                                        : "border border-slate-200 bg-white text-slate-700 hover:border-blue-200"
                                                }`}
                                            >
                                                {canEdit(listing.status) ? (
                                                    <Pencil size={13} />
                                                ) : (
                                                    <Eye size={13} />
                                                )}

                                                {canEdit(listing.status)
                                                    ? "Edit listing"
                                                    : "View details"}
                                            </Link>

                                            {listing.status === "APPROVED" && (
                                                <Link
                                                    href={`/vehicles/${encodeURIComponent(listing.id)}`}
                                                    aria-label="View marketplace listing"
                                                    title="View live listing"
                                                    className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:text-[#1491FF]"
                                                >
                                                    <ExternalLink size={15} />
                                                </Link>
                                            )}
                                        </div>

                                        {/* REVIEW FEEDBACK */}
                                        {listing.rejectionReason && (
                                            <div className="mx-3.5 mb-3.5 rounded-lg bg-rose-50 px-3 py-2.5">
                                                <p className="text-[11px] font-semibold text-rose-700">
                                                    Review feedback
                                                </p>
                                                <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-rose-600">
                                                    {listing.rejectionReason}
                                                </p>
                                            </div>
                                        )}
                                    </motion.article>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* PAGINATION */}
                {!isLoading && data.pagination.totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-3">
                        <p className="text-xs text-slate-500">
                            Page {data.pagination.page} of{" "}
                            {data.pagination.totalPages}
                        </p>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={
                                    !data.pagination.hasPreviousPage ||
                                    isLoading
                                }
                                onClick={() =>
                                    setPage((current) =>
                                        Math.max(1, current - 1),
                                    )
                                }
                                aria-label="Previous page"
                                className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30"
                            >
                                <ArrowLeft size={15} />
                            </button>

                            <button
                                type="button"
                                disabled={
                                    !data.pagination.hasNextPage ||
                                    isLoading
                                }
                                onClick={() =>
                                    setPage((current) => current + 1)
                                }
                                aria-label="Next page"
                                className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30"
                            >
                                <ArrowRight size={15} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* CREATE LISTING BUTTON */}
            <div className="fixed inset-x-0 bottom-[calc(6.75rem+env(safe-area-inset-bottom))] z-30 px-4">
                <div className="mx-auto max-w-xl">
                    <Link
                        href="/dashboard/my-listings/create"
                        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#0877D9] active:scale-[0.99]"
                    >
                        <FilePlus2 size={17} />
                        Create a listing
                    </Link>
                </div>
            </div>

            {/* LISTING ACTION SHEET */}
            <AnimatePresence>
                {menuListing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[500] flex items-end justify-center bg-slate-950/40 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:items-center"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                setMenuListing(null);
                            }
                        }}
                    >
                        <motion.section
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            transition={
                                prefersReducedMotion
                                    ? { duration: 0 }
                                    : {
                                        type: "spring",
                                        damping: 28,
                                        stiffness: 320,
                                    }
                            }
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="mobile-listing-actions-title"
                            className="w-full max-w-xl rounded-2xl bg-white p-4 shadow-2xl"
                        >
                            <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-slate-200" />

                            <div className="mb-3 flex items-center justify-between">
                                <div className="min-w-0">
                                    <h2
                                        id="mobile-listing-actions-title"
                                        className="text-sm font-semibold text-slate-900"
                                    >
                                        Listing actions
                                    </h2>
                                    <p className="mt-1 truncate text-xs text-slate-500">
                                        {menuListing.listing.title}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setMenuListing(null)}
                                    aria-label="Close actions"
                                    className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500"
                                >
                                    <X size={15} />
                                </button>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {canEdit(menuListing.listing.status) && (
                                    <Link
                                        href={`/dashboard/my-listings/${encodeURIComponent(menuListing.listing.id)}/edit`}
                                        onClick={() => setMenuListing(null)}
                                        className="flex min-h-12 items-center gap-3 text-sm font-medium text-slate-700"
                                    >
                                        <Pencil size={16} className="text-slate-400" />
                                        Edit listing
                                    </Link>
                                )}

                                {menuListing.listing.status === "APPROVED" && (
                                    <Link
                                        href={`/dashboard/my-listings/${encodeURIComponent(menuListing.listing.id)}/boost`}
                                        onClick={() => setMenuListing(null)}
                                        className="flex min-h-12 items-center gap-3 text-sm font-medium text-[#0877D9]"
                                    >
                                        <TrendingUp size={16} />
                                        Boost this vehicle
                                    </Link>
                                )}

                                {canSubmit(menuListing.listing.status) && (
                                    <button
                                        type="button"
                                        disabled={Boolean(busyListingId)}
                                        onClick={() =>
                                            void runAction(menuListing, "submit")
                                        }
                                        className="flex min-h-12 w-full items-center gap-3 text-left text-sm font-medium text-slate-700 disabled:opacity-50"
                                    >
                                        <CheckCircle2 size={16} className="text-slate-400" />
                                        Submit for review
                                    </button>
                                )}

                                {canMarkSold(menuListing.listing.status) && (
                                    <button
                                        type="button"
                                        disabled={Boolean(busyListingId)}
                                        onClick={() =>
                                            void runAction(menuListing, "sold")
                                        }
                                        className="flex min-h-12 w-full items-center gap-3 text-left text-sm font-medium text-slate-700 disabled:opacity-50"
                                    >
                                        <CheckCircle2 size={16} className="text-emerald-600" />
                                        Mark as sold
                                    </button>
                                )}

                                {canReactivate(menuListing.listing.status) && (
                                    <button
                                        type="button"
                                        disabled={Boolean(busyListingId)}
                                        onClick={() =>
                                            void runAction(menuListing, "reactivate")
                                        }
                                        className="flex min-h-12 w-full items-center gap-3 text-left text-sm font-medium text-slate-700 disabled:opacity-50"
                                    >
                                        <RotateCcw size={16} className="text-slate-400" />
                                        Reactivate listing
                                    </button>
                                )}

                                {canDelete(menuListing.listing.status) && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDeleteTarget(menuListing);
                                            setMenuListing(null);
                                        }}
                                        className="flex min-h-12 w-full items-center gap-3 text-left text-sm font-medium text-rose-600"
                                    >
                                        <Trash2 size={16} />
                                        Delete listing
                                    </button>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setMenuListing(null)}
                                className="mt-3 min-h-11 w-full rounded-xl bg-slate-100 text-sm font-semibold text-slate-600"
                            >
                                Cancel
                            </button>
                        </motion.section>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* DELETE CONFIRMATION */}
            <AnimatePresence>
                {deleteTarget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[510] flex items-end justify-center bg-slate-950/40 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:items-center"
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
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 25 }}
                            role="alertdialog"
                            aria-modal="true"
                            aria-labelledby="delete-mobile-listing-title"
                            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
                        >
                            <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                                <Trash2 size={18} />
                            </div>

                            <h2
                                id="delete-mobile-listing-title"
                                className="mt-4 text-base font-semibold text-slate-900"
                            >
                                Delete this listing?
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-slate-800">
                                    {deleteTarget.listing.title}
                                </span>
                                ?
                            </p>

                            <div className="mt-5 grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() => setDeleteTarget(null)}
                                    className="min-h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() => void removeListing()}
                                    className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 text-sm font-semibold text-white disabled:opacity-50"
                                >
                                    {isDeleting ? (
                                        <LoaderCircle
                                            size={15}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Trash2 size={15} />
                                    )}

                                    {isDeleting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </motion.section>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}