"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    Clock3,
    Eye,
    FilePlus2,
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

const PAGE_SIZE = 12;
const POLLING_INTERVAL = 5000;

const FILTERS: { label: string; value: DashboardFilter }[] = [
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
        return <CheckCircle2 size={12} />;
    }

    if (
        status === "REJECTED" ||
        status === "SUSPENDED"
    ) {
        return <ShieldAlert size={12} />;
    }

    return <Clock3 size={12} />;
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
     * Poll while any listing on the current page has
     * image analysis jobs that are still pending.
     */
    useEffect(() => {
        const hasPendingAnalysis = data.items.some(
            (item) =>
                (item.imageAnalysis?.pending ?? 0) > 0,
        );

        if (!hasPendingAnalysis) {
            return;
        }

        const intervalId = window.setInterval(() => {
            void loadListings(true);
        }, POLLING_INTERVAL);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [data.items, loadListings]);

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

        if (!query) {
            return data.items;
        }

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

    return (
        <main className="min-h-screen bg-[#F7F7FB] text-slate-900 lg:hidden">
            <div className="mx-auto w-full max-w-xl px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-5">
                {/* Header */}
                <header className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <Link
                            href="/dashboard"
                            aria-label="Back to dashboard"
                            className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition active:scale-95"
                        >
                            <ArrowLeft size={18} />
                        </Link>

                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7008E7]">
                                KARMASS GARAGE
                            </p>

                            <h1 className="mt-0.5 truncate text-xl font-bold tracking-tight">
                                My listings
                            </h1>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => void loadListings(true)}
                        disabled={isLoading || isRefreshing}
                        aria-label="Refresh listings"
                        className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={
                                isRefreshing ? "animate-spin" : ""
                            }
                        />
                    </button>
                </header>

                {/* Overview */}
                <section className="relative mt-5 overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-[#7008E7] via-[#6513D2] to-[#40109B] p-5 text-white shadow-[0_16px_36px_rgba(112,8,231,0.2)]">
                    <div className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full border border-white/10" />
                    <div className="pointer-events-none absolute -right-2 -top-4 size-24 rounded-full border border-white/10" />

                    <div className="relative flex items-start justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white/90">
                                <TrendingUp size={12} />
                                LISTING OVERVIEW
                            </div>

                            <p className="mt-4 text-sm text-white/75">
                                Your marketplace inventory
                            </p>

                            <p className="mt-1 text-4xl font-bold tracking-tight">
                                {data.summary.total}
                            </p>

                            <p className="mt-1 text-xs text-white/65">
                                Total listings created
                            </p>
                        </div>

                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm">
                            <SlidersHorizontal size={21} />
                        </div>
                    </div>

                    <div className="relative mt-5 grid grid-cols-3 gap-2 border-t border-white/15 pt-4">
                        <div>
                            <p className="text-[10px] font-medium text-white/65">
                                Live
                            </p>
                            <p className="mt-1 text-lg font-bold">
                                {data.summary.APPROVED}
                            </p>
                        </div>

                        <div className="border-x border-white/15 px-3">
                            <p className="text-[10px] font-medium text-white/65">
                                Pending
                            </p>
                            <p className="mt-1 text-lg font-bold">
                                {data.summary.PENDING_REVIEW}
                            </p>
                        </div>

                        <div className="pl-2">
                            <p className="text-[10px] font-medium text-white/65">
                                Drafts
                            </p>
                            <p className="mt-1 text-lg font-bold">
                                {data.summary.DRAFT}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Recently Deleted */}
                <Link
                    href="/dashboard/my-listings/recently-deleted"
                    className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition active:scale-[0.99]"
                >
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                            <Trash2 size={17} />
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800">
                                Recently Deleted
                            </p>

                            <p className="mt-0.5 text-[11px] text-slate-500">
                                View or restore deleted listings
                            </p>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                            {data.summary.deleted ?? data.summary.DELETED}
                        </span>

                        <ArrowRight size={16} className="text-slate-400" />
                    </div>
                </Link>

                {/* Search */}
                <div className="mt-5">
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
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7008E7]/50 focus:ring-4 focus:ring-[#7008E7]/[0.08]"
                        />
                    </label>
                </div>

                {/* Filters */}
                <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {FILTERS.map((filter) => {
                        const selected =
                            activeFilter === filter.value;

                        const count =
                            filter.value === "ALL"
                                ? data.summary.total
                                : data.summary[filter.value] ?? 0;

                        return (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() =>
                                    changeFilter(filter.value)
                                }
                                className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition active:scale-[0.98] ${
                                    selected
                                        ? "border-[#7008E7] bg-[#7008E7] text-white shadow-sm shadow-[#7008E7]/20"
                                        : "border-slate-200 bg-white text-slate-600"
                                }`}
                            >
                                {selected && <Check size={12} />}

                                {filter.label}

                                <span
                                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                                        selected
                                            ? "bg-white/15 text-white"
                                            : "bg-slate-100 text-slate-500"
                                    }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Inventory heading */}
                <div className="mb-3 mt-6 flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-base font-bold tracking-tight">
                            Your inventory
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Manage status and listing details
                        </p>
                    </div>

                    <span className="text-xs font-medium text-slate-500">
                        {filteredItems.length} shown
                    </span>
                </div>

                {/* Error */}
                {error && (
                    <div
                        role="alert"
                        className="mb-4 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs leading-5 text-rose-700"
                    >
                        <AlertCircle
                            size={16}
                            className="mt-0.5 shrink-0"
                        />

                        <p className="flex-1">{error}</p>

                        <button
                            type="button"
                            onClick={() => setError(null)}
                            aria-label="Dismiss error"
                        >
                            <X size={15} />
                        </button>
                    </div>
                )}

                {/* Success notice */}
                {notice && (
                    <div
                        role="status"
                        className="mb-4 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs leading-5 text-emerald-700"
                    >
                        <CheckCircle2
                            size={16}
                            className="mt-0.5 shrink-0"
                        />

                        <p className="flex-1">{notice}</p>

                        <button
                            type="button"
                            onClick={() => setNotice(null)}
                            aria-label="Dismiss notification"
                        >
                            <X size={15} />
                        </button>
                    </div>
                )}

                {/* Loading */}
                {isLoading ? (
                    <div className="flex min-h-52 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white text-center">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#7008E7]/[0.08] text-[#7008E7]">
                            <LoaderCircle
                                size={22}
                                className="animate-spin"
                            />
                        </div>

                        <p className="mt-3 text-sm font-semibold text-slate-700">
                            Loading your listings
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Getting your inventory ready…
                        </p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    /* Empty state */
                    <section className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#7008E7]/[0.08] text-[#7008E7]">
                            {searchQuery ? (
                                <Search size={23} />
                            ) : (
                                <FilePlus2 size={23} />
                            )}
                        </div>

                        <h3 className="mt-4 text-base font-bold">
                            {searchQuery
                                ? "No matching listings"
                                : activeFilter === "ALL"
                                  ? "Start building your inventory"
                                  : `No ${
                                        FILTERS.find(
                                            (filter) =>
                                                filter.value === activeFilter,
                                        )?.label.toLowerCase()
                                    } listings`}
                        </h3>

                        <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-slate-500">
                            {searchQuery
                                ? "Try a different title, vehicle name, or location."
                                : activeFilter === "ALL"
                                  ? "Create your first listing and track its progress here."
                                  : "Listings with this status will appear here."}
                        </p>

                        {searchQuery ? (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700"
                            >
                                Clear search
                            </button>
                        ) : activeFilter !== "ALL" ? (
                            <button
                                type="button"
                                onClick={() => changeFilter("ALL")}
                                className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700"
                            >
                                View all listings
                            </button>
                        ) : null}
                    </section>
                ) : (
                    /* Listing cards */
                    <div className="space-y-3">
                        {filteredItems.map((item) => {
                            const listing = item.listing;
                            const busy =
                                busyListingId === listing.id;

                            const coverImageUrl =
                                item.coverImage?.thumbnailUrl ||
                                item.coverImage?.url;

                            const analysis = item.imageAnalysis;

                            return (
                                <article
                                    key={listing.id}
                                    className="overflow-hidden rounded-[1.45rem] border border-slate-200/90 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.035)] transition"
                                >
                                    {/* Listing summary */}
                                    <div className="flex gap-3 p-3.5">
                                        <div className="relative size-[5.3rem] shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#F0E6FF] via-[#F7F3FF] to-[#E7DBFF]">
                                            {coverImageUrl ? (
                                                <Image
                                                    src={coverImageUrl}
                                                    alt={`${listing.title} vehicle`}
                                                    fill
                                                    sizes="85px"
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="flex size-full items-center justify-center text-[#7008E7]">
                                                    <ImageIcon size={23} />
                                                </div>
                                            )}

                                            {busy && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/75">
                                                    <LoaderCircle
                                                        size={20}
                                                        className="animate-spin text-[#7008E7]"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1 pt-0.5">
                                            <div className="flex items-start justify-between gap-2">
                                                <span
                                                    className={`inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-bold ${STATUS_STYLES[listing.status]}`}
                                                >
                                                    <StatusGlyph
                                                        status={listing.status}
                                                    />

                                                    <span className="truncate">
                                                        {formatStatus(
                                                            listing.status,
                                                        )}
                                                    </span>
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setMenuListing(item)
                                                    }
                                                    aria-label={`Actions for ${listing.title}`}
                                                    className="-mr-1 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-xl text-slate-500 transition active:bg-slate-100"
                                                >
                                                    <MoreHorizontal size={19} />
                                                </button>
                                            </div>

                                            <h3 className="mt-2 line-clamp-1 text-sm font-bold leading-5 text-slate-900">
                                                {listing.title}
                                            </h3>

                                            {vehicleName(item) && (
                                                <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">
                                                    {vehicleName(item)}
                                                </p>
                                            )}

                                            <p className="mt-1.5 truncate text-sm font-extrabold tracking-tight text-[#7008E7]">
                                                {formatPrice(
                                                    listing.price,
                                                    listing.currency,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Location and date */}
                                    <div className="flex items-center gap-1.5 border-t border-slate-100 px-3.5 py-2.5 text-[10px] text-slate-500">
                                        <MapPin
                                            size={12}
                                            className="shrink-0 text-slate-400"
                                        />

                                        <span className="min-w-0 flex-1 truncate">
                                            {locationName(item) ||
                                                "Location not provided"}
                                        </span>

                                        <span className="shrink-0 text-slate-300">
                                            •
                                        </span>

                                        <span className="shrink-0">
                                            {formatDate(listing.createdAt)}
                                        </span>
                                    </div>

                                    {/* Image analysis */}
                                    {analysis && analysis.total > 0 && (
                                        <div className="border-t border-slate-100 px-3.5 py-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <ShieldAlert
                                                            size={14}
                                                            className="shrink-0 text-[#7008E7]"
                                                        />

                                                        <h4 className="text-xs font-bold text-slate-800">
                                                            Image checks
                                                        </h4>
                                                    </div>

                                                    <p className="mt-1 text-[10px] leading-4 text-slate-500">
                                                        {getImageAnalysisMessage(
                                                            item,
                                                        )}
                                                    </p>
                                                </div>

                                                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                                                    {analysis.passed}/
                                                    {analysis.total} passed
                                                </span>
                                            </div>

                                            {/* Analysis counts */}
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {analysis.pending > 0 && (
                                                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                                                        {analysis.pending} pending
                                                    </span>
                                                )}

                                                {analysis.review > 0 && (
                                                    <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-[10px] font-semibold text-orange-700">
                                                        {analysis.review} for review
                                                    </span>
                                                )}

                                                {analysis.failed > 0 && (
                                                    <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-700">
                                                        {analysis.failed} failed
                                                    </span>
                                                )}
                                            </div>

                                            {/* Individual image results */}
                                            <div className="mt-3 space-y-2">
                                                {analysis.images.map((image) => {
                                                    const imageUrl =
                                                        image.thumbnailUrl ||
                                                        image.url;

                                                    const retrying =
                                                        retryingImageId ===
                                                        image.id;

                                                    return (
                                                        <div
                                                            key={image.id}
                                                            className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-2"
                                                        >
                                                            <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                                                                {imageUrl ? (
                                                                    <Image
                                                                        src={imageUrl}
                                                                        alt={`Vehicle photo ${image.sortOrder + 1}`}
                                                                        fill
                                                                        sizes="56px"
                                                                        className="object-cover"
                                                                        unoptimized
                                                                    />
                                                                ) : (
                                                                    <div className="flex size-full items-center justify-center text-slate-400">
                                                                        <ImageIcon
                                                                            size={18}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex flex-wrap items-center gap-1.5">
                                                                    <span className="text-[10px] font-bold text-slate-700">
                                                                        Photo{" "}
                                                                        {image.sortOrder +
                                                                            1}
                                                                    </span>

                                                                    <span
                                                                        className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${getImageStatusStyles(image.imageCheckStatus)}`}
                                                                    >
                                                                        {image.imageCheckStatus ===
                                                                        "PASSED" ? (
                                                                            <CheckCircle2
                                                                                size={10}
                                                                            />
                                                                        ) : image.imageCheckStatus ===
                                                                          "PENDING" ? (
                                                                            <LoaderCircle
                                                                                size={10}
                                                                                className="animate-spin"
                                                                            />
                                                                        ) : (
                                                                            <AlertCircle
                                                                                size={10}
                                                                            />
                                                                        )}

                                                                        {getImageStatusLabel(
                                                                            image.imageCheckStatus,
                                                                        )}
                                                                    </span>
                                                                </div>

                                                                {image.checkReason && (
                                                                    <p className="mt-1 break-words text-[10px] leading-4 text-slate-600">
                                                                        {image.checkReason}
                                                                    </p>
                                                                )}

                                                                {image.checkedAt && (
                                                                    <p className="mt-1 text-[9px] text-slate-400">
                                                                        Checked{" "}
                                                                        {formatDate(
                                                                            image.checkedAt,
                                                                        )}
                                                                    </p>
                                                                )}

                                                                {image.canRetry && (
                                                                    <button
                                                                        type="button"
                                                                        disabled={Boolean(
                                                                            retryingImageId,
                                                                        )}
                                                                        onClick={() =>
                                                                            void handleRetryImageAnalysis(
                                                                                listing.id,
                                                                                image.id,
                                                                            )
                                                                        }
                                                                        className="mt-2 inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-[#7008E7]/20 bg-white px-2.5 text-[10px] font-bold text-[#7008E7] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                                                                    >
                                                                        {retrying ? (
                                                                            <LoaderCircle
                                                                                size={12}
                                                                                className="animate-spin"
                                                                            />
                                                                        ) : (
                                                                            <RefreshCw
                                                                                size={12}
                                                                            />
                                                                        )}

                                                                        {retrying
                                                                            ? "Retrying…"
                                                                            : "Retry analysis"}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Listing actions */}
                                    <div className="flex gap-2 px-3.5 pb-3.5 pt-2">
                                        <Link
                                            href={`/dashboard/my-listings/${encodeURIComponent(listing.id)}/edit`}
                                            className={`inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-bold transition active:scale-[0.98] ${
                                                canEdit(listing.status)
                                                    ? "bg-[#7008E7] text-white shadow-sm shadow-[#7008E7]/15"
                                                    : "border border-slate-200 bg-white text-slate-700"
                                            }`}
                                        >
                                            {canEdit(listing.status) ? (
                                                <Pencil size={13} />
                                            ) : (
                                                <Eye size={13} />
                                            )}

                                            {canEdit(listing.status)
                                                ? "Manage listing"
                                                : "View details"}
                                        </Link>

                                        {listing.status === "APPROVED" && (
                                            <Link
                                                href={`/vehicles/${encodeURIComponent(listing.id)}`}
                                                aria-label="View marketplace listing"
                                                className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition active:bg-slate-50"
                                            >
                                                <ArrowRight size={15} />
                                            </Link>
                                        )}
                                    </div>

                                    {/* Listing rejection feedback */}
                                    {listing.rejectionReason && (
                                        <div className="mx-3.5 mb-3.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5">
                                            <p className="text-[10px] font-bold text-rose-700">
                                                Review feedback
                                            </p>

                                            <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-rose-700/80">
                                                {listing.rejectionReason}
                                            </p>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {!isLoading &&
                    data.pagination.totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3">
                            <p className="text-[11px] font-medium text-slate-500">
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
                                    className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 disabled:opacity-35"
                                    aria-label="Previous page"
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
                                    className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 disabled:opacity-35"
                                    aria-label="Next page"
                                >
                                    <ArrowRight size={15} />
                                </button>
                            </div>
                        </div>
                    )}
            </div>

            {/* Fixed create-listing button */}
            <div className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 px-4">
                <div className="mx-auto max-w-xl">
                    <Link
                        href="/dashboard/my-listings/create"
                        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#7008E7] px-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(112,8,231,0.3)] transition active:scale-[0.98]"
                    >
                        <FilePlus2 size={17} />
                        Create a listing
                    </Link>
                </div>
            </div>

            {/* Listing action sheet */}
            {menuListing && (
                <div
                    className="fixed inset-0 z-[500] flex items-end justify-center bg-slate-950/35 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-[2px]"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setMenuListing(null);
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="mobile-listing-actions-title"
                        className="w-full max-w-xl overflow-hidden rounded-[1.7rem] border border-white/70 bg-white p-4 shadow-2xl"
                    >
                        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />

                        <div className="mb-3 flex items-start justify-between gap-3 px-1">
                            <div className="min-w-0">
                                <h2
                                    id="mobile-listing-actions-title"
                                    className="text-base font-bold"
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
                                className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-1">
                            {canEdit(menuListing.listing.status) && (
                                <Link
                                    href={`/dashboard/my-listings/${encodeURIComponent(menuListing.listing.id)}/edit`}
                                    onClick={() => setMenuListing(null)}
                                    className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-700 active:bg-slate-50"
                                >
                                    <Pencil
                                        size={16}
                                        className="text-[#7008E7]"
                                    />
                                    Edit listing
                                </Link>
                            )}

                            {canSubmit(menuListing.listing.status) && (
                                <button
                                    type="button"
                                    disabled={Boolean(busyListingId)}
                                    onClick={() =>
                                        void runAction(
                                            menuListing,
                                            "submit",
                                        )
                                    }
                                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-slate-700 active:bg-slate-50 disabled:opacity-50"
                                >
                                    <CheckCircle2
                                        size={16}
                                        className="text-[#7008E7]"
                                    />
                                    Submit for review
                                </button>
                            )}

                            {canMarkSold(menuListing.listing.status) && (
                                <button
                                    type="button"
                                    disabled={Boolean(busyListingId)}
                                    onClick={() =>
                                        void runAction(
                                            menuListing,
                                            "sold",
                                        )
                                    }
                                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-slate-700 active:bg-slate-50 disabled:opacity-50"
                                >
                                    <CheckCircle2
                                        size={16}
                                        className="text-emerald-600"
                                    />
                                    Mark as sold
                                </button>
                            )}

                            {canReactivate(menuListing.listing.status) && (
                                <button
                                    type="button"
                                    disabled={Boolean(busyListingId)}
                                    onClick={() =>
                                        void runAction(
                                            menuListing,
                                            "reactivate",
                                        )
                                    }
                                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-slate-700 active:bg-slate-50 disabled:opacity-50"
                                >
                                    <RotateCcw
                                        size={16}
                                        className="text-[#7008E7]"
                                    />
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
                                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-rose-600 active:bg-rose-50"
                                >
                                    <Trash2 size={16} />
                                    Delete listing
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setMenuListing(null)}
                            className="mt-3 min-h-11 w-full rounded-xl bg-slate-100 text-sm font-bold text-slate-600"
                        >
                            Cancel
                        </button>
                    </section>
                </div>
            )}

            {/* Delete confirmation */}
            {deleteTarget && (
                <div
                    className="fixed inset-0 z-[510] flex items-end justify-center bg-slate-950/40 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-[2px] sm:items-center"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !isDeleting
                        ) {
                            setDeleteTarget(null);
                        }
                    }}
                >
                    <section
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-mobile-listing-title"
                        className="w-full max-w-md rounded-[1.7rem] border border-white/70 bg-white p-5 shadow-2xl"
                    >
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                            <Trash2 size={20} />
                        </div>

                        <h2
                            id="delete-mobile-listing-title"
                            className="mt-4 text-lg font-bold"
                        >
                            Delete this listing?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            You are about to delete{" "}
                            <span className="font-semibold text-slate-800">
                                {deleteTarget.listing.title}
                            </span>
                            . The backend will determine whether this
                            operation is allowed.
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
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 text-sm font-bold text-white disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <LoaderCircle
                                        size={15}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Trash2 size={15} />
                                )}

                                {isDeleting
                                    ? "Deleting…"
                                    : "Delete listing"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
}