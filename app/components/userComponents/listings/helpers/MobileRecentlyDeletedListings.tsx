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
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Clock3,
    Image as ImageIcon,
    LoaderCircle,
    MapPin,
    RotateCcw,
    Search,
    Trash2,
    X,
} from "lucide-react";

import {
    getSellerListings,
    restoreListing,
} from "@/app/services/user/listings/listing.service";

import type {
    ListingPagination,
    ListingSummary,
    SellerListingItem,
} from "@/app/types/user/listings/listing.types";

const PAGE_SIZE = 12;

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

function errorMessage(
    error: unknown,
    fallback: string,
): string {
    return error instanceof Error && error.message.trim()
        ? error.message
        : fallback;
}

function formatPrice(
    price: string | number,
    currency: string,
): string {
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

function formatDate(
    value: string | Date | null | undefined,
): string {
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

function vehicleName(
    item: SellerListingItem,
): string {
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

function locationName(
    item: SellerListingItem,
): string {
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

export default function MobileRecentlyDeletedListings() {
    const [items, setItems] = useState<SellerListingItem[]>([]);
    const [summary, setSummary] = useState<ListingSummary>(
        initialSummary(),
    );

    const [pagination, setPagination] =
        useState<ListingPagination>(initialPagination());

    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [restoringId, setRestoringId] =
        useState<string | null>(null);

    const [restoreTarget, setRestoreTarget] =
        useState<SellerListingItem | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const loadDeletedListings = useCallback(
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
                    includeDeleted: true,
                });

                setItems(response.data.items);
                setSummary(response.data.summary);
                setPagination(response.data.pagination);
                setError(null);
            } catch (requestError) {
                setError(
                    errorMessage(
                        requestError,
                        "Unable to load recently deleted listings.",
                    ),
                );
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        },
        [page],
    );

    useEffect(() => {
        void loadDeletedListings();
    }, [loadDeletedListings]);

    const filteredItems = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) {
            return items;
        }

        return items.filter((item) =>
            [
                item.listing.title,
                item.vehicleMake?.name,
                item.vehicleModel?.name,
                item.vehicleGeneration?.name,
                item.vehicleVariant?.name,
                item.listing.city,
                item.listing.state,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(query),
        );
    }, [items, searchQuery]);

    const handleRestore = async () => {
        if (!restoreTarget || restoringId) {
            return;
        }

        const listingId = restoreTarget.listing.id;

        setRestoringId(listingId);
        setError(null);
        setNotice(null);

        try {
            const response = await restoreListing(listingId);

            setRestoreTarget(null);

            setNotice(
                response.message ??
                    "Your listing has been restored successfully.",
            );

            // Refresh the deleted-listings count and records.
            await loadDeletedListings(true);
        } catch (requestError) {
            setError(
                errorMessage(
                    requestError,
                    "Unable to restore this listing. Please try again.",
                ),
            );
        } finally {
            setRestoringId(null);
        }
    };

    return (
        <main className="min-h-screen bg-[#F7F7FB] text-slate-900 lg:hidden">
            <div className="mx-auto w-full max-w-xl px-4 pb-10 pt-5">
                {/* Header */}
                <header className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <Link
                            href="/dashboard/my-listings"
                            aria-label="Back to My Listings"
                            className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition active:scale-95"
                        >
                            <ArrowLeft size={18} />
                        </Link>

                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7008E7]">
                                KARMASS GARAGE
                            </p>

                            <h1 className="mt-0.5 truncate text-xl font-bold tracking-tight">
                                Recently deleted
                            </h1>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => void loadDeletedListings(true)}
                        disabled={isLoading || isRefreshing}
                        aria-label="Refresh deleted listings"
                        className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition disabled:opacity-50"
                    >
                        <RotateCcw
                            size={16}
                            className={
                                isRefreshing ? "animate-spin" : ""
                            }
                        />
                    </button>
                </header>

                {/* Overview */}
                <section className="relative mt-5 overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-[#7008E7] via-[#6513D2] to-[#40109B] p-5 text-white shadow-[0_16px_36px_rgba(112,8,231,0.2)]">
                    <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full border border-white/10" />

                    <div className="relative flex items-start gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                            <Trash2 size={21} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white/75">
                                YOUR RECENTLY DELETED LISTINGS
                            </p>

                            <p className="mt-2 text-4xl font-bold tracking-tight">
                                {summary.deleted ?? summary.DELETED}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-white/75">
                                Restore a listing to return it to your
                                normal inventory.
                            </p>
                        </div>
                    </div>
                </section>

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
                            placeholder="Search deleted listings"
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7008E7]/50 focus:ring-4 focus:ring-[#7008E7]/[0.08]"
                        />
                    </label>
                </div>

                {/* Section heading */}
                <div className="mb-3 mt-6 flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-base font-bold tracking-tight">
                            Deleted inventory
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Restore listings whenever you need them.
                        </p>
                    </div>

                    <span className="shrink-0 text-xs font-medium text-slate-500">
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

                {/* Success */}
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
                        <LoaderCircle
                            size={25}
                            className="animate-spin text-[#7008E7]"
                        />

                        <p className="mt-3 text-sm font-semibold text-slate-700">
                            Loading deleted listings
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Getting your recently deleted inventory…
                        </p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <section className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#7008E7]/[0.08] text-[#7008E7]">
                            {searchQuery ? (
                                <Search size={23} />
                            ) : (
                                <CheckCircle2 size={23} />
                            )}
                        </div>

                        <h3 className="mt-4 text-base font-bold">
                            {searchQuery
                                ? "No matching listings"
                                : "Your deleted list is empty"}
                        </h3>

                        <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-slate-500">
                            {searchQuery
                                ? "Try another vehicle name, title, or location."
                                : "Listings you delete will appear here, where you can restore them."}
                        </p>

                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700"
                            >
                                Clear search
                            </button>
                        )}

                        {!searchQuery && (
                            <Link
                                href="/dashboard/my-listings"
                                className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-[#7008E7] px-4 text-xs font-bold text-white"
                            >
                                Back to My Listings
                            </Link>
                        )}
                    </section>
                ) : (
                    <div className="space-y-3">
                        {filteredItems.map((item) => {
                            const listing = item.listing;

                            const coverImageUrl =
                                item.coverImage?.thumbnailUrl ||
                                item.coverImage?.url;

                            const isRestoring =
                                restoringId === listing.id;

                            return (
                                <article
                                    key={listing.id}
                                    className="overflow-hidden rounded-[1.45rem] border border-slate-200/90 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.035)]"
                                >
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
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-600">
                                                <Clock3 size={11} />
                                                Deleted
                                            </span>

                                            <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-5 text-slate-900">
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

                                    <div className="p-3.5 pt-2">
                                        <button
                                            type="button"
                                            disabled={Boolean(restoringId)}
                                            onClick={() =>
                                                setRestoreTarget(item)
                                            }
                                            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#7008E7] px-4 text-xs font-bold text-white shadow-sm shadow-[#7008E7]/15 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isRestoring ? (
                                                <LoaderCircle
                                                    size={15}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <RotateCcw size={15} />
                                            )}

                                            {isRestoring
                                                ? "Restoring…"
                                                : "Restore listing"}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {!isLoading &&
                    pagination.totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3">
                            <p className="text-[11px] font-medium text-slate-500">
                                Page {pagination.page} of{" "}
                                {pagination.totalPages}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={
                                        !pagination.hasPreviousPage ||
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
                                        !pagination.hasNextPage ||
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

            {/* Restore confirmation */}
            {restoreTarget && (
                <div
                    className="fixed inset-0 z-[510] flex items-end justify-center bg-slate-950/40 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-[2px] sm:items-center"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !restoringId
                        ) {
                            setRestoreTarget(null);
                        }
                    }}
                >
                    <section
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="restore-listing-title"
                        className="w-full max-w-md rounded-[1.7rem] border border-white/70 bg-white p-5 shadow-2xl"
                    >
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-[#7008E7]/[0.08] text-[#7008E7]">
                            <RotateCcw size={20} />
                        </div>

                        <h2
                            id="restore-listing-title"
                            className="mt-4 text-lg font-bold"
                        >
                            Restore this listing?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            <span className="font-semibold text-slate-800">
                                {restoreTarget.listing.title}
                            </span>{" "}
                            will be removed from Recently Deleted. Its
                            resulting status will be determined by your
                            backend's restoration rules.
                        </p>

                        <div className="mt-5 grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                disabled={Boolean(restoringId)}
                                onClick={() => setRestoreTarget(null)}
                                className="min-h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={Boolean(restoringId)}
                                onClick={() => void handleRestore()}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#7008E7] text-sm font-bold text-white disabled:opacity-50"
                            >
                                {restoringId ? (
                                    <LoaderCircle
                                        size={15}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <RotateCcw size={15} />
                                )}

                                {restoringId
                                    ? "Restoring…"
                                    : "Confirm restore"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
}