"use client";

import { useCallback, useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
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
    getImageAnalysisMessage,
    getImageStatCards,
    getImageStatusLabel,
    getImageStatusStyles,
    getListingLocation,
    getStatusCount,
    getSummaryCards,
    getVehicleName,
    hasPendingImageAnalysis,
    matchesSearch,
} from "../helpers/my-listings.helpers";

/* -------------------------------------------------------------------------- */
/*  Small presentational pieces                                               */
/* -------------------------------------------------------------------------- */

function StatusIcon({ status }: { status: ListingStatus }) {
    const Icon = STATUS_ICONS[status] ?? DEFAULT_STATUS_ICON;

    return <Icon size={13} />;
}

const MENU_ITEM_CLASS =
    "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-40";

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export default function MyListingsDashboard() {
    /* ----------------------------- Data & filters ---------------------------- */
    const [data, setData] = useState<DashboardData>(INITIAL_DATA);
    const [activeFilter, setActiveFilter] = useState<DashboardFilter>("ALL");
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
    const [deleteTarget, setDeleteTarget] = useState<SellerListingItem | null>(
        null,
    );
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
                    ...(activeFilter !== "ALL" ? { status: activeFilter } : {}),
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
                    response.message ?? "Your listing action was completed.",
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
            const response = await deleteSellerListing(deleteTarget.listing.id);

            setNotice(response.message ?? "Your listing was deleted.");
            setDeleteTarget(null);
            await loadListings({ silent: true });
        } catch (requestError) {
            setError(
                getErrorMessage(requestError, "Unable to delete this listing."),
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

    /* -------------------------------------------------------------------------- */
    /*  Render                                                                    */
    /* -------------------------------------------------------------------------- */

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8 lg:px-8">
            <div className="mx-auto max-w-7xl">
                {/* ------------------------------ Header ------------------------------ */}
                <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 text-xs text-slate-500 transition hover:text-slate-900"
                        >
                            <ArrowLeft size={14} />
                            Dashboard
                        </Link>

                        <div className="mt-5 flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-xl border border-[#7008E7]/20 bg-[#7008E7]/10 text-[#7008E7]">
                                <TrendingUp size={21} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                    My listings
                                </h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    Manage your vehicles and listing activity.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => void loadListings({ silent: true })}
                            disabled={isLoading || isRefreshing}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                            {isRefreshing ? (
                                <LoaderCircle size={15} className="animate-spin" />
                            ) : (
                                <RefreshCw size={15} />
                            )}
                            Refresh
                        </button>

                        <Link
                            href="/dashboard/my-listings/create"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7008E7] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5F07C5]"
                        >
                            <FilePlus2 size={16} />
                            Create listing
                        </Link>
                    </div>
                </header>

                {/* ------------------------------ Banners ----------------------------- */}
                {error && (
                    <div
                        role="alert"
                        className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
                    >
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <p className="flex-1">{error}</p>
                        <button
                            type="button"
                            onClick={() => setError(null)}
                            aria-label="Dismiss error"
                            className="text-red-400 hover:text-red-700"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {notice && (
                    <div
                        role="status"
                        className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700"
                    >
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                        <p className="flex-1">{notice}</p>
                        <button
                            type="button"
                            onClick={() => setNotice(null)}
                            aria-label="Dismiss notification"
                            className="text-emerald-400 hover:text-emerald-700"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* --------------------------- Summary cards -------------------------- */}
                <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {summaryCards.map((card) => (
                        <article
                            key={card.label}
                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                        >
                            <p className="text-xs text-slate-500">{card.label}</p>
                            <p
                                className={`mt-3 text-2xl font-semibold ${card.className}`}
                            >
                                {card.value}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">
                                {card.description}
                            </p>
                        </article>
                    ))}
                </section>

                {/* -------------------------- Recently Deleted ------------------------- */}
                <section className="mt-5">
                    <Link
                        href="/dashboard/my-listings/recently-deleted"
                        className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-rose-200 hover:shadow-md hover:shadow-rose-900/[0.04] focus:outline-none focus:ring-4 focus:ring-rose-500/10 sm:p-5"
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition group-hover:bg-rose-100">
                                <Trash2 size={18} />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Recently Deleted
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    View or restore your deleted listings.
                                </p>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                                {data.summary.deleted ?? data.summary.DELETED}
                            </span>
                            <ArrowRight
                                size={17}
                                className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-rose-600"
                            />
                        </div>
                    </Link>
                </section>

                {/* ------------------------ Search & status filters ------------------- */}
                <section className="mt-8">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal
                                size={16}
                                className="text-slate-500"
                            />
                            <h2 className="text-sm font-semibold">
                                Your vehicles
                            </h2>
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-500">
                                {data.pagination.total} total
                            </span>
                        </div>

                        <div className="relative w-full xl:max-w-sm">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(event.target.value)
                                }
                                placeholder="Search title, make, model, or location"
                                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#7008E7] focus:ring-4 focus:ring-[#7008E7]/10"
                            />
                        </div>
                    </div>

                    <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
                        {STATUS_FILTERS.map((filter) => {
                            const selected = activeFilter === filter.value;
                            const count = getStatusCount(
                                data.summary,
                                filter.value,
                            );

                            return (
                                <button
                                    key={filter.value}
                                    type="button"
                                    onClick={() => handleFilterChange(filter.value)}
                                    className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-medium transition ${
                                        selected
                                            ? "border-[#7008E7]/25 bg-[#7008E7]/[0.08] text-[#7008E7]"
                                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                    }`}
                                >
                                    {filter.label}
                                    <span
                                        className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                                            selected
                                                ? "bg-[#7008E7]/10 text-[#7008E7]"
                                                : "bg-slate-100 text-slate-500"
                                        }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* ------------------------------ Content ----------------------------- */}
                {isLoading ? (
                    <div className="mt-8 flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                            <LoaderCircle
                                size={20}
                                className="animate-spin text-[#7008E7]"
                            />
                            Loading your listings...
                        </div>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <section className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center sm:px-8">
                        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-500">
                            {searchQuery ? (
                                <Search size={23} />
                            ) : (
                                <FilePlus2 size={23} />
                            )}
                        </div>

                        <h3 className="mt-5 text-lg font-semibold">
                            {emptyState.title}
                        </h3>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            {emptyState.description}
                        </p>

                        {searchQuery ? (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="mt-6 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100"
                            >
                                Clear search
                            </button>
                        ) : activeFilter === "ALL" ? (
                            <Link
                                href="/dashboard/my-listings/create"
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7008E7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5F07C5]"
                            >
                                <FilePlus2 size={16} />
                                Create your first listing
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleFilterChange("ALL")}
                                className="mt-6 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100"
                            >
                                View all listings
                            </button>
                        )}
                    </section>
                ) : (
                    <>
                        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {filteredItems.map((item) => {
                                const { listing, imageAnalysis } = item;
                                const vehicleName = getVehicleName(item);
                                const busy = busyListingId === listing.id;
                                const menuOpen = menuListingId === listing.id;
                                const coverImage =
                                    item.coverImage?.thumbnailUrl ||
                                    item.coverImage?.url;
                                const editHref = `/dashboard/my-listings/${encodeURIComponent(listing.id)}/edit`;

                                return (
                                    <article
                                        key={listing.id}
                                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#7008E7]/25 hover:shadow-lg hover:shadow-slate-900/[0.04]"
                                    >
                                        {/* ---------------- Cover image ---------------- */}
                                        <div className="relative h-48 overflow-hidden border-b border-slate-100 bg-[radial-gradient(ellipse_at_top,rgba(112,8,231,0.09),transparent_68%)]">
                                            {coverImage ? (
                                                <Image
                                                    src={coverImage}
                                                    alt={`${listing.title} vehicle`}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                                                    <Eye size={25} />
                                                    <span className="text-xs">
                                                        No vehicle photo
                                                    </span>
                                                </div>
                                            )}

                                            {/* Status badge */}
                                            <div className="absolute left-3 top-3">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-medium shadow-sm ${STATUS_STYLES[listing.status]}`}
                                                >
                                                    <StatusIcon status={listing.status} />
                                                    {formatStatus(listing.status)}
                                                </span>
                                            </div>

                                            {/* Actions menu */}
                                            <div className="absolute right-3 top-3">
                                                <button
                                                    type="button"
                                                    aria-label="Open listing actions"
                                                    aria-expanded={menuOpen}
                                                    onClick={() =>
                                                        setMenuListingId(
                                                            menuOpen ? null : listing.id,
                                                        )
                                                    }
                                                    className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white/95 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>

                                                {menuOpen && (
                                                    <div className="absolute right-0 top-10 z-20 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
                                                        {canEdit(listing.status) && (
                                                            <Link
                                                                href={editHref}
                                                                onClick={() => setMenuListingId(null)}
                                                                className={MENU_ITEM_CLASS}
                                                            >
                                                                <Pencil size={14} />
                                                                Edit listing
                                                            </Link>
                                                        )}

                                                        {canSubmit(listing.status) && (
                                                            <button
                                                                type="button"
                                                                disabled={busy}
                                                                onClick={() =>
                                                                    void handleLifecycleAction(item, "submit")
                                                                }
                                                                className={MENU_ITEM_CLASS}
                                                            >
                                                                <CheckCircle2 size={14} />
                                                                Submit for review
                                                            </button>
                                                        )}

                                                        {canMarkSold(listing.status) && (
                                                            <button
                                                                type="button"
                                                                disabled={busy}
                                                                onClick={() =>
                                                                    void handleLifecycleAction(item, "sold")
                                                                }
                                                                className={MENU_ITEM_CLASS}
                                                            >
                                                                <CheckCircle2 size={14} />
                                                                Mark as sold
                                                            </button>
                                                        )}

                                                        {canReactivate(listing.status) && (
                                                            <button
                                                                type="button"
                                                                disabled={busy}
                                                                onClick={() =>
                                                                    void handleLifecycleAction(item, "reactivate")
                                                                }
                                                                className={MENU_ITEM_CLASS}
                                                            >
                                                                <RotateCcw size={14} />
                                                                Reactivate
                                                            </button>
                                                        )}

                                                        {canDelete(listing.status) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setDeleteTarget(item);
                                                                    setMenuListingId(null);
                                                                }}
                                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-red-600 hover:bg-red-400/10"
                                                            >
                                                                <Trash2 size={14} />
                                                                Delete listing
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Busy overlay */}
                                            {busy && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/75">
                                                    <LoaderCircle
                                                        size={22}
                                                        className="animate-spin text-[#7008E7]"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* ---------------- Card body ---------------- */}
                                        <div className="p-4">
                                            <p className="truncate text-base font-semibold text-slate-900">
                                                {listing.title}
                                            </p>

                                            {vehicleName && (
                                                <p className="mt-1 truncate text-xs text-slate-500">
                                                    {vehicleName}
                                                </p>
                                            )}

                                            <p className="mt-3 text-lg font-semibold text-[#7008E7]">
                                                {formatPrice(listing.price, listing.currency)}
                                            </p>

                                            <div className="mt-3 flex items-start gap-2 text-xs text-slate-500">
                                                <MapPin size={14} className="mt-0.5 shrink-0" />
                                                <span className="line-clamp-2">
                                                    {getListingLocation(item) ||
                                                        "Location not provided"}
                                                </span>
                                            </div>

                                            {/* ------------ Photo verification ------------ */}
                                            <section className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="text-xs font-semibold text-slate-800">
                                                            Photo verification
                                                        </h3>
                                                        <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                                            {getImageAnalysisMessage(item)}
                                                        </p>
                                                    </div>

                                                    {imageAnalysis && imageAnalysis.total > 0 && (
                                                        <span className="shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600">
                                                            {imageAnalysis.passed}/{imageAnalysis.total}
                                                        </span>
                                                    )}
                                                </div>

                                                {imageAnalysis && imageAnalysis.total > 0 && (
                                                    <>
                                                        <div className="mt-3 grid grid-cols-4 gap-1.5">
                                                            {getImageStatCards(imageAnalysis).map((stat) => (
                                                                <div
                                                                    key={stat.label}
                                                                    className={`rounded-lg px-1.5 py-2 text-center ${stat.style}`}
                                                                >
                                                                    <p className="text-sm font-semibold">
                                                                        {stat.value}
                                                                    </p>
                                                                    <p className="mt-0.5 text-[9px]">
                                                                        {stat.label}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div className="mt-3 space-y-3">
                                                            {imageAnalysis.images.map((image) => {
                                                                const retrying = retryingImageId === image.id;
                                                                const imageSrc = image.thumbnailUrl || image.url;

                                                                return (
                                                                    <div
                                                                        key={image.id}
                                                                        className="rounded-xl border border-slate-200 bg-white p-2.5"
                                                                    >
                                                                        <div className="flex items-start gap-3">
                                                                            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                                                                {imageSrc ? (
                                                                                    <Image
                                                                                        src={imageSrc}
                                                                                        alt={`Vehicle photo ${image.sortOrder + 1}`}
                                                                                        fill
                                                                                        sizes="64px"
                                                                                        className="object-cover"
                                                                                        unoptimized
                                                                                    />
                                                                                ) : (
                                                                                    <div className="flex size-full items-center justify-center text-slate-400">
                                                                                        <Eye size={18} />
                                                                                    </div>
                                                                                )}
                                                                            </div>

                                                                            <div className="min-w-0 flex-1">
                                                                                <div className="flex flex-wrap items-center gap-1.5">
                                                                                    <span className="text-[11px] font-medium text-slate-700">
                                                                                        Photo {image.sortOrder + 1}
                                                                                    </span>
                                                                                    <span
                                                                                        className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-medium ${getImageStatusStyles(image.imageCheckStatus)}`}
                                                                                    >
                                                                                        {getImageStatusLabel(image.imageCheckStatus)}
                                                                                    </span>
                                                                                </div>

                                                                                {image.checkReason && (
                                                                                    <p className="mt-1.5 break-words text-[11px] leading-4 text-slate-500">
                                                                                        {image.checkReason}
                                                                                    </p>
                                                                                )}

                                                                                {image.checkedAt && (
                                                                                    <p className="mt-1 text-[10px] text-slate-400">
                                                                                        Checked {formatDate(image.checkedAt)}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {image.canRetry && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    void handleRetryImageAnalysis(listing.id, image.id)
                                                                                }
                                                                                disabled={retryingImageId !== null}
                                                                                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#7008E7]/20 bg-[#7008E7]/[0.05] px-3 py-2 text-[11px] font-medium text-[#7008E7] transition hover:bg-[#7008E7]/10 disabled:cursor-not-allowed disabled:opacity-50"
                                                                            >
                                                                                {retrying ? (
                                                                                    <LoaderCircle size={13} className="animate-spin" />
                                                                                ) : (
                                                                                    <RotateCcw size={13} />
                                                                                )}
                                                                                {retrying
                                                                                    ? "Queueing retry..."
                                                                                    : "Retry image analysis"}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </>
                                                )}
                                            </section>

                                            {/* ------------ Dates ------------ */}
                                            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
                                                <div>
                                                    <p className="text-[10px] text-slate-400">Created</p>
                                                    <p className="mt-1 text-xs text-slate-600">
                                                        {formatDate(listing.createdAt)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400">Updated</p>
                                                    <p className="mt-1 text-xs text-slate-600">
                                                        {formatDate(listing.updatedAt)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* ------------ Review feedback ------------ */}
                                            {listing.rejectionReason && (
                                                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                                                    <p className="text-[11px] font-semibold text-red-700">
                                                        Review feedback
                                                    </p>
                                                    <p className="mt-1 line-clamp-3 text-xs leading-5 text-red-600">
                                                        {listing.rejectionReason}
                                                    </p>
                                                </div>
                                            )}

                                            {/* ------------ Footer actions ------------ */}
                                            <div className="mt-4 flex gap-2">
                                                {canEdit(listing.status) ? (
                                                    <Link
                                                        href={editHref}
                                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#7008E7] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#5F07C5]"
                                                    >
                                                        <Pencil size={14} />
                                                        Manage listing
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        href={editHref}
                                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                                                    >
                                                        <Eye size={14} />
                                                        View details
                                                    </Link>
                                                )}

                                                {listing.status === "APPROVED" && (
                                                    <Link
                                                        href={`/vehicles/${encodeURIComponent(listing.id)}`}
                                                        aria-label="View marketplace listing"
                                                        className="flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                                    >
                                                        <ArrowRight size={15} />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {/* ---------------------- Pagination ---------------------- */}
                        {data.pagination.totalPages > 1 && (
                            <nav
                                aria-label="Listing pagination"
                                className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <p className="text-xs text-slate-500">
                                    Page {data.pagination.page} of{" "}
                                    {data.pagination.totalPages}
                                    {" · "}
                                    {data.pagination.total} listings
                                </p>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPage((current) => Math.max(1, current - 1))
                                        }
                                        disabled={!data.pagination.hasPreviousPage || isLoading}
                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
                                    >
                                        <ArrowLeft size={14} />
                                        Previous
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPage((current) => current + 1)}
                                        disabled={!data.pagination.hasNextPage || isLoading}
                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
                                    >
                                        Next
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                            </nav>
                        )}
                    </>
                )}
            </div>

            {/* --------------------------- Delete dialog -------------------------- */}
            {deleteTarget && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !isDeleting) {
                            setDeleteTarget(null);
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-listing-title"
                        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/10 sm:p-6"
                    >
                        <div className="flex size-11 items-center justify-center rounded-xl bg-red-400/10 text-red-600">
                            <Trash2 size={20} />
                        </div>

                        <h2
                            id="delete-listing-title"
                            className="mt-5 text-lg font-semibold"
                        >
                            Delete this listing?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            You are about to delete{" "}
                            <span className="font-medium text-slate-900/80">
                                {deleteTarget.listing.title}
                            </span>
                            . The backend will determine whether this operation is
                            allowed.
                        </p>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                disabled={isDeleting}
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={() => void handleDelete()}
                                disabled={isDeleting}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <LoaderCircle size={15} className="animate-spin" />
                                ) : (
                                    <Trash2 size={15} />
                                )}
                                {isDeleting ? "Deleting..." : "Confirm delete"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
}
