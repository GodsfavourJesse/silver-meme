"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Car,
    Check,
    CheckCircle2,
    Clock3,
    ExternalLink,
    Eye,
    FilePlus2,
    LoaderCircle,
    MapPin,
    MoreHorizontal,
    Pencil,
    RefreshCw,
    RotateCcw,
    Rocket,
    Search,
    Trash2,
    X,
    History,
} from "lucide-react";

import {
    deleteSellerListing,
    getSellerListings,
    performSellerListingAction,
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

// Routes
const getEditHref = (listingId: string) =>
    `/dashboard/my-listings/${encodeURIComponent(listingId)}/edit`;

const getBoostHref = (listingId: string) =>
    `/dashboard/my-listings/${encodeURIComponent(listingId)}/boost`;

const getPublicHref = (listingId: string) =>
    `/vehicles/${encodeURIComponent(listingId)}`;

// Brand and shared styles
const BRAND = "#1491FF";

const BUTTON_BASE =
    "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1491FF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const PRIMARY_BUTTON =
    `${BUTTON_BASE} bg-[#1491FF] text-white shadow-sm shadow-blue-600/15 hover:bg-[#0877D9] active:bg-[#0065C9]`;

const SECONDARY_BUTTON =
    `${BUTTON_BASE} border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100`;

const MENU_ITEM =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:bg-blue-50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40";

const BLUE_FOCUS =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1491FF] focus-visible:ring-offset-2";

//  Animation
const menuVariants = {
    hidden: {
        opacity: 0,
        y: -5,
        scale: 0.98,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.15,
            ease: "easeOut" as const,
        },
    },
    exit: {
        opacity: 0,
        y: -4,
        scale: 0.98,
        transition: {
            duration: 0.1,
        },
    },
};

// Small components
function StatusIcon({ status }: { status: ListingStatus }) {
    const Icon = STATUS_ICONS[status] ?? DEFAULT_STATUS_ICON;

    return <Icon size={12} strokeWidth={2.3} />;
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
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            role={isError ? "alert" : "status"}
            className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm ${
                isError
                    ? "border-red-200 bg-red-50/80 text-red-800"
                    : "border-emerald-200 bg-emerald-50/80 text-emerald-800"
            }`}
        >
            <span className="mt-0.5 shrink-0">
                {isError ? (
                    <AlertCircle size={17} />
                ) : (
                    <CheckCircle2 size={17} />
                )}
            </span>

            <p className="flex-1 leading-6">{message}</p>

            <button
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss message"
                className="shrink-0 rounded-md p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100 focus-visible:outline-none"
            >
                <X size={15} />
            </button>
        </motion.div>
    );
}

// Summary cards                                     
function StatsStrip({
    cards,
}: {
    cards: ReturnType<typeof getSummaryCards>;
}) {
    return (
        <section
            aria-label="Listing summary"
            className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
            {cards.map((card, index) => (
                <div
                    key={card.label}
                    className="relative min-w-0 overflow-hidden rounded-xl border border-zinc-200/80 bg-white p-4 transition-all duration-200 hover:border-blue-200 hover:shadow-md hover:shadow-blue-950/[0.04] sm:p-5"
                >
                    {/* Subtle brand accent */}
                    <div className="absolute left-0 top-0 h-full w-[3px] bg-[#1491FF] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[13px] font-medium text-zinc-500 sm:text-sm">
                            {card.label}
                        </p>

                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF5FF] text-[#1491FF]">
                            {index === 0 ? (
                                <Car size={17} strokeWidth={1.9} />
                            ) : index === 1 ? (
                                <Clock3 size={17} strokeWidth={1.9} />
                            ) : index === 2 ? (
                                <CheckCircle2 size={17} strokeWidth={1.9} />
                            ) : (
                                <Eye size={17} strokeWidth={1.9} />
                            )}
                        </span>
                    </div>

                    <div className="mt-4">
                        <p className="text-[27px] font-semibold leading-none tracking-tight text-zinc-900 tabular-nums sm:text-3xl">
                            {card.value}
                        </p>

                        <p className="mt-2 text-xs leading-5 text-zinc-500">
                            {card.description}
                        </p>
                    </div>
                </div>
            ))}
        </section>
    );
}

// Loading state
function ListingSkeleton() {
    return (
        <div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
            aria-busy="true"
            aria-label="Loading your listings"
        >
            {Array.from({ length: 4 }).map((_, index) => (
                <div
                    key={index}
                    className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
                >
                    <div className="aspect-[16/10] animate-pulse bg-zinc-100" />

                    <div className="space-y-3 p-4">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-100" />
                        <div className="h-6 w-1/3 animate-pulse rounded bg-zinc-100" />
                        <div className="h-9 animate-pulse rounded-lg bg-zinc-100" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Listing card
type ListingCardProps = {
    item: SellerListingItem;
    busy: boolean;
    menuOpen: boolean;
    onToggleMenu: () => void;
    onCloseMenu: () => void;
    onAction: (item: SellerListingItem, action: LifecycleAction) => void;
    onDelete: (item: SellerListingItem) => void;
};

function ListingCard({
    item,
    busy,
    menuOpen,
    onToggleMenu,
    onCloseMenu,
    onAction,
    onDelete,
}: ListingCardProps) {
    const { listing } = item;

    const vehicleName = getVehicleName(item);
    const location = getListingLocation(item);
    const coverImage =
        item.coverImage?.thumbnailUrl || item.coverImage?.url;

    const editHref = getEditHref(listing.id);
    const isApproved = listing.status === "APPROVED";

    const hasPrimaryActions =
        canEdit(listing.status) ||
        canSubmit(listing.status) ||
        canMarkSold(listing.status) ||
        canReactivate(listing.status) ||
        isApproved;

    const showDivider =
        hasPrimaryActions && canDelete(listing.status);

    return (
        <article
            className={`group relative flex min-w-0 flex-col overflow-visible rounded-2xl border bg-white transition-all duration-200 ${
                menuOpen
                    ? "z-30 border-blue-200 shadow-lg shadow-blue-950/[0.06]"
                    : "z-0 border-zinc-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-zinc-950/[0.05]"
            }`}
        >
            {/* Vehicle image */}
            <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl bg-zinc-100">
                {coverImage ? (
                    <Image
                        src={coverImage}
                        alt={`${listing.title} vehicle`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        unoptimized
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-50 to-zinc-100 text-zinc-400">
                        <div className="flex size-14 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm">
                            <Car size={27} strokeWidth={1.5} />
                        </div>

                        <span className="text-xs font-medium">
                            No photo added
                        </span>
                    </div>
                )}

                {/* Image contrast */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/25 to-transparent" />

                {/* Listing status */}
                <div className="absolute left-3 top-3 z-[1]">
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-md ${STATUS_STYLES[listing.status]}`}
                    >
                        <StatusIcon status={listing.status} />
                        {formatStatus(listing.status)}
                    </span>
                </div>

                {/* Live indicator */}
                {isApproved && (
                    <div className="absolute bottom-3 left-3 z-[1]">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/70 bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur-md">
                            <CheckCircle2 size={13} />
                            Live on marketplace
                        </span>
                    </div>
                )}
            </div>

            {/* Actions menu */}
            <div
                data-listing-menu
                className="absolute right-3 top-3 z-20"
            >
                <button
                    type="button"
                    aria-label={`Actions for ${listing.title}`}
                    aria-expanded={menuOpen}
                    aria-haspopup="menu"
                    onClick={onToggleMenu}
                    className={`flex size-9 items-center justify-center rounded-xl border bg-white/95 text-zinc-600 shadow-sm backdrop-blur-md transition-all hover:border-blue-200 hover:bg-white hover:text-[#0877D9] ${BLUE_FOCUS} ${
                        menuOpen
                            ? "border-blue-200 text-[#0877D9] shadow-md"
                            : "border-white/80"
                    }`}
                >
                    <MoreHorizontal size={19} />
                </button>

                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            role="menu"
                            variants={menuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="absolute right-0 top-11 z-30 w-56 origin-top-right rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl shadow-zinc-950/10"
                        >
                            {canEdit(listing.status) && (
                                <Link
                                    href={editHref}
                                    role="menuitem"
                                    onClick={onCloseMenu}
                                    className={MENU_ITEM}
                                >
                                    <Pencil
                                        size={15}
                                        className="text-zinc-400"
                                    />
                                    Edit listing
                                </Link>
                            )}

                            {canSubmit(listing.status) && (
                                <button
                                    type="button"
                                    role="menuitem"
                                    disabled={busy}
                                    onClick={() =>
                                        onAction(item, "submit")
                                    }
                                    className={MENU_ITEM}
                                >
                                    <CheckCircle2
                                        size={15}
                                        className="text-zinc-400"
                                    />
                                    Submit for review
                                </button>
                            )}

                            {canMarkSold(listing.status) && (
                                <button
                                    type="button"
                                    role="menuitem"
                                    disabled={busy}
                                    onClick={() =>
                                        onAction(item, "sold")
                                    }
                                    className={MENU_ITEM}
                                >
                                    <Check
                                        size={15}
                                        className="text-zinc-400"
                                    />
                                    Mark as sold
                                </button>
                            )}

                            {canReactivate(listing.status) && (
                                <button
                                    type="button"
                                    role="menuitem"
                                    disabled={busy}
                                    onClick={() =>
                                        onAction(item, "reactivate")
                                    }
                                    className={MENU_ITEM}
                                >
                                    <RotateCcw
                                        size={15}
                                        className="text-zinc-400"
                                    />
                                    Reactivate listing
                                </button>
                            )}

                            {isApproved && (
                                <>
                                    {(canEdit(listing.status) ||
                                        canMarkSold(listing.status)) && (
                                        <div className="my-1.5 border-t border-zinc-100" />
                                    )}

                                    <Link
                                        href={getBoostHref(listing.id)}
                                        role="menuitem"
                                        onClick={onCloseMenu}
                                        className={`${MENU_ITEM} font-medium text-[#0877D9] hover:bg-blue-50`}
                                    >
                                        <Rocket size={15} />
                                        Boost this vehicle
                                    </Link>
                                </>
                            )}

                            {showDivider && (
                                <div className="my-1.5 border-t border-zinc-100" />
                            )}

                            {canDelete(listing.status) && (
                                <button
                                    type="button"
                                    role="menuitem"
                                    disabled={busy}
                                    onClick={() => onDelete(item)}
                                    className={`${MENU_ITEM} text-red-600 hover:bg-red-50`}
                                >
                                    <Trash2 size={15} />
                                    Delete listing
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Listing details */}
            <div className="flex flex-1 flex-col p-4 sm:p-5">
                {/* Title */}
                <div className="min-w-0">
                    <h3
                        className="truncate text-[15px] font-semibold tracking-tight text-zinc-900 transition-colors group-hover:text-[#0877D9] sm:text-base"
                        title={listing.title}
                    >
                        {listing.title}
                    </h3>

                    {vehicleName && vehicleName !== listing.title && (
                        <p className="mt-1 truncate text-sm text-zinc-500">
                            {vehicleName}
                        </p>
                    )}
                </div>

                {/* Price */}
                <div className="mt-4">
                    <p className="text-[22px] font-bold leading-none tracking-tight text-zinc-950 tabular-nums sm:text-2xl">
                        {formatPrice(listing.price, listing.currency)}
                    </p>
                </div>

                {/* Location */}
                <div className="mt-3 flex min-w-0 items-center gap-1.5">
                    <MapPin
                        size={14}
                        className="shrink-0 text-[#1491FF]"
                    />

                    <span className="truncate text-[13px] text-zinc-500">
                        {location || "Location not provided"}
                    </span>
                </div>

                {/* Listing dates */}
                <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-4">
                    <div className="min-w-0">
                        <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                            <Clock3 size={12} />
                            Created
                        </dt>

                        <dd className="mt-1.5 truncate text-xs font-semibold text-zinc-700">
                            {formatDate(listing.createdAt)}
                        </dd>
                    </div>

                    <div className="min-w-0">
                        <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                            <RefreshCw size={12} />
                            Updated
                        </dt>

                        <dd className="mt-1.5 truncate text-xs font-semibold text-zinc-700">
                            {formatDate(listing.updatedAt)}
                        </dd>
                    </div>
                </dl>

                {/* Review feedback */}
                {listing.rejectionReason && (
                    <div className="mt-4 rounded-xl border border-red-100 bg-red-50/70 p-3.5">
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-red-800">
                            <AlertCircle size={14} />
                            Review feedback
                        </p>

                        <p className="mt-1.5 line-clamp-3 text-xs leading-5 text-red-700">
                            {listing.rejectionReason}
                        </p>
                    </div>
                )}

                {/* Card actions */}
                <div className="mt-auto flex items-center gap-2 pt-5">
                    {canEdit(listing.status) ? (
                        <Link
                            href={editHref}
                            className={`${PRIMARY_BUTTON} min-h-10 flex-1`}
                        >
                            <Pencil size={14} />
                            Manage listing
                        </Link>
                    ) : (
                        <Link
                            href={editHref}
                            className={`${SECONDARY_BUTTON} min-h-10 flex-1`}
                        >
                            <Eye size={15} />
                            View details
                        </Link>
                    )}

                    {isApproved && (
                        <>
                            <Link
                                href={getBoostHref(listing.id)}
                                title="Boost this vehicle"
                                aria-label="Boost this vehicle"
                                className={`${BUTTON_BASE} min-h-10 border border-blue-200 bg-[#EAF5FF] px-3 text-[#0877D9] transition-colors hover:border-blue-300 hover:bg-blue-100`}
                            >
                                <Rocket size={15} />
                                <span className="hidden sm:inline">
                                    Boost
                                </span>
                            </Link>

                            <Link
                                href={getPublicHref(listing.id)}
                                aria-label="View live listing"
                                title="View live listing"
                                className={`${SECONDARY_BUTTON} min-h-10 px-3`}
                            >
                                <ExternalLink size={15} />
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Busy overlay */}
            <AnimatePresence>
                {busy && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-[3px]"
                    >
                        <span className="flex items-center gap-2.5 rounded-xl border border-blue-100 bg-white px-4 py-3 text-xs font-semibold text-zinc-700 shadow-lg shadow-blue-950/[0.06]">
                            <LoaderCircle
                                size={16}
                                className="animate-spin text-[#1491FF]"
                            />
                            Updating listing...
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </article>
    );
}

// Delete dialog
function DeleteDialog({
    target,
    isDeleting,
    onCancel,
    onConfirm,
}: {
    target: SellerListingItem | null;
    isDeleting: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    useEffect(() => {
        if (!target || isDeleting) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onCancel();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () =>
            document.removeEventListener("keydown", handleKeyDown);
    }, [target, isDeleting, onCancel]);

    return (
        <AnimatePresence>
            {target && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/45 p-4 backdrop-blur-[2px]"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !isDeleting
                        ) {
                            onCancel();
                        }
                    }}
                >
                    <motion.section
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-listing-title"
                        className="w-full max-w-md rounded-2xl border border-zinc-100 bg-white p-6 shadow-2xl shadow-black/15"
                    >
                        <div className="flex size-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <Trash2 size={20} />
                        </div>

                        <h2
                            id="delete-listing-title"
                            className="mt-4 text-lg font-semibold tracking-tight text-zinc-900"
                        >
                            Delete this listing?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-zinc-600">
                            <span className="font-medium text-zinc-900">
                                {target.listing.title}
                            </span>{" "}
                            will be taken off the marketplace. You may be
                            able to restore it later from Recently deleted.
                        </p>

                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={isDeleting}
                                className={SECONDARY_BUTTON}
                            >
                                Keep listing
                            </button>

                            <button
                                type="button"
                                onClick={onConfirm}
                                disabled={isDeleting}
                                className={`${BUTTON_BASE} bg-red-600 text-white hover:bg-red-700`}
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
                                    ? "Deleting..."
                                    : "Delete listing"}
                            </button>
                        </div>
                    </motion.section>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Page
export default function MyListingsDashboard() {
    const shouldReduceMotion = useReducedMotion();

    /* Data and filters */

    const [data, setData] = useState<DashboardData>(INITIAL_DATA);
    const [activeFilter, setActiveFilter] =
        useState<DashboardFilter>("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);

    /* Loading */

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    /* Feedback */

    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    /* Listing actions */

    const [busyListingId, setBusyListingId] =
        useState<string | null>(null);
    const [menuListingId, setMenuListingId] =
        useState<string | null>(null);

    /* Delete dialog */

    const [deleteTarget, setDeleteTarget] =
        useState<SellerListingItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    /* Request tracking */

    const requestIdRef = useRef(0);

    /* ---------------------------------------------------------------------- */
    /* Load listings                                                          */
    /* ---------------------------------------------------------------------- */

    const loadListings = useCallback(
        async (options?: { silent?: boolean }) => {
            const silent = options?.silent ?? false;
            const requestId = ++requestIdRef.current;

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

                if (requestId !== requestIdRef.current) {
                    return;
                }

                setData({
                    summary: response.data.summary,
                    items: response.data.items,
                    pagination: response.data.pagination,
                });

                setError(null);
            } catch (requestError) {
                if (requestId !== requestIdRef.current) {
                    return;
                }

                setError(
                    getErrorMessage(
                        requestError,
                        "Unable to load your listings. Please try again.",
                    ),
                );
            } finally {
                if (requestId === requestIdRef.current) {
                    setIsLoading(false);
                    setIsRefreshing(false);
                }
            }
        },
        [activeFilter, page],
    );

    useEffect(() => {
        void loadListings();
    }, [loadListings]);

    /* Poll while image analysis is pending */

    useEffect(() => {
        if (!hasPendingImageAnalysis(data.items)) {
            return;
        }

        const timeout = window.setTimeout(() => {
            void loadListings({ silent: true });
        }, POLL_INTERVAL_MS);

        return () => window.clearTimeout(timeout);
    }, [data.items, loadListings]);

    /* Close menu on outside click / Escape */

    useEffect(() => {
        if (!menuListingId) {
            return;
        }

        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target as Element | null;

            if (!target?.closest("[data-listing-menu]")) {
                setMenuListingId(null);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setMenuListingId(null);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener(
                "mousedown",
                handlePointerDown,
            );
            document.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [menuListingId]);

    // Handlers
    const resetFeedback = () => {
        setError(null);
        setNotice(null);
    };

    const handleFilterChange = useCallback(
        (filter: DashboardFilter) => {
            setActiveFilter(filter);
            setPage(1);
            setNotice(null);
            setMenuListingId(null);
        },
        [],
    );

    const handleLifecycleAction = useCallback(
        async (
            item: SellerListingItem,
            action: LifecycleAction,
        ) => {
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
                    response.message ??
                        "Your listing has been updated.",
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

            setNotice(
                response.message ?? "Your listing was deleted.",
            );

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

    const handleOpenDelete = useCallback(
        (item: SellerListingItem) => {
            setDeleteTarget(item);
            setMenuListingId(null);
        },
        [],
    );

    const handleCancelDelete = useCallback(() => {
        setDeleteTarget(null);
    }, []);

    // Derived values
    const filteredItems = data.items.filter((item) =>
        matchesSearch(item, searchQuery),
    );

    const summaryCards = getSummaryCards(data.summary);
    const emptyState = getEmptyStateCopy(
        searchQuery,
        activeFilter,
    );

    const totalListings = data.pagination.total;

    const deletedCount =
        data.summary.deleted ?? data.summary.DELETED ?? 0;

    // Render
    return (
        <main className="min-h-screen overflow-x-hidden bg-[#F7F9FC] px-4 py-6 text-zinc-900 px-6 sm:py-8 md:px-12">
            <motion.div
                initial={
                    shouldReduceMotion
                        ? false
                        : { opacity: 0, y: 5 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="mx-auto max-w-[1440px]"
            >
                {/* Header */}

                <header>
                    <Link
                        href="/dashboard"
                        className={`inline-flex items-center gap-1.5 rounded-md text-sm text-zinc-500 transition-colors hover:text-[#0877D9] ${BLUE_FOCUS}`}
                    >
                        <ArrowLeft size={14} />
                        Dashboard
                    </Link>

                    <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="h-6 w-1 rounded-full bg-[#1491FF]" />

                                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0877D9]">
                                    Inventory
                                </span>
                            </div>

                            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
                                My listings
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                                Keep track of your vehicles, manage
                                their status and see how they appear
                                to buyers.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    void loadListings({
                                        silent: true,
                                    })
                                }
                                disabled={isLoading || isRefreshing}
                                className={SECONDARY_BUTTON}
                            >
                                {isRefreshing ? (
                                    <LoaderCircle
                                        size={15}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <RefreshCw size={15} />
                                )}

                                {isRefreshing
                                    ? "Refreshing..."
                                    : "Refresh"}
                            </button>

                            <Link
                                href="/dashboard/my-listings/create"
                                className={PRIMARY_BUTTON}
                            >
                                <FilePlus2 size={16} />
                                Add a vehicle
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Feedback */}

                <AnimatePresence mode="wait">
                    {(error || notice) && (
                        <div className="mt-5">
                            {error ? (
                                <FeedbackBanner
                                    key="error"
                                    type="error"
                                    message={error}
                                    onDismiss={() => setError(null)}
                                />
                            ) : (
                                notice && (
                                    <FeedbackBanner
                                        key="notice"
                                        type="success"
                                        message={notice}
                                        onDismiss={() =>
                                            setNotice(null)
                                        }
                                    />
                                )
                            )}
                        </div>
                    )}
                </AnimatePresence>

                {/* Summary */}

                <StatsStrip cards={summaryCards} />

                {/* Listings toolbar */}

                <section className="mt-10">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
                                Your vehicles
                            </h2>

                            <p className="mt-1 text-sm text-zinc-500">
                                All the vehicles you have listed on
                                KARMASS.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Link
                                href="/dashboard/boost-history"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#1491FF] hover:text-[#1491FF]"
                            >
                                <History size={16} />
                                Boost history
                            </Link>

                            <Link
                                href="/dashboard/my-listings/recently-deleted"
                                className={`inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-[#0877D9] ${BLUE_FOCUS}`}
                            >
                                <Trash2 size={14} />
                                Recently deleted
                                <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs tabular-nums text-zinc-600">
                                    {deletedCount}
                                </span>
                            </Link>

                            <div className="relative w-full sm:w-[340px]">
                                <Search
                                    size={16}
                                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                                />

                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(event) =>
                                        setSearchQuery(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Search your vehicles..."
                                    aria-label="Search your listings"
                                    className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-10 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-[#1491FF] focus:ring-2 focus:ring-[#1491FF]/15"
                                />

                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSearchQuery("")
                                        }
                                        aria-label="Clear search"
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status tabs */}

                    <div
                        role="tablist"
                        aria-label="Filter listings by status"
                        className="mt-6 flex gap-1 overflow-x-auto border-b border-zinc-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
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
                                    role="tab"
                                    aria-selected={selected}
                                    onClick={() =>
                                        handleFilterChange(
                                            filter.value,
                                        )
                                    }
                                    className={`relative inline-flex shrink-0 items-center gap-2 px-3.5 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1491FF] ${
                                        selected
                                            ? "text-[#0877D9]"
                                            : "text-zinc-500 hover:text-zinc-900"
                                    }`}
                                >
                                    {filter.label}

                                    <span
                                        className={`rounded-md px-1.5 py-0.5 text-xs tabular-nums ${
                                            selected
                                                ? "bg-blue-50 text-[#0877D9]"
                                                : "bg-zinc-100 text-zinc-500"
                                        }`}
                                    >
                                        {count}
                                    </span>

                                    {selected && (
                                        <motion.span
                                            layoutId="active-listing-tab"
                                            className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#1491FF]"
                                            transition={
                                                shouldReduceMotion
                                                    ? { duration: 0 }
                                                    : { duration: 0.2 }
                                            }
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Results count */}

                    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-zinc-500">
                        <p>
                            Showing{" "}
                            <span className="font-semibold text-zinc-800">
                                {filteredItems.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-zinc-800">
                                {totalListings}
                            </span>{" "}
                            {totalListings === 1
                                ? "listing"
                                : "listings"}
                        </p>

                        {isRefreshing && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0877D9]">
                                <LoaderCircle
                                    size={13}
                                    className="animate-spin"
                                />
                                Updating...
                            </span>
                        )}
                    </div>
                </section>

                {/* Listings */}

                <section className="mt-5">
                    {isLoading ? (
                        <ListingSkeleton />
                    ) : filteredItems.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-blue-50 text-[#1491FF]">
                                {searchQuery ? (
                                    <Search size={21} />
                                ) : (
                                    <Car size={22} />
                                )}
                            </div>

                            <h3 className="mt-4 text-base font-semibold text-zinc-900">
                                {emptyState.title}
                            </h3>

                            <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-zinc-500">
                                {emptyState.description}
                            </p>

                            <div className="mt-6">
                                {searchQuery ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSearchQuery("")
                                        }
                                        className={SECONDARY_BUTTON}
                                    >
                                        <X size={15} />
                                        Clear search
                                    </button>
                                ) : activeFilter === "ALL" ? (
                                    <Link
                                        href="/dashboard/my-listings/create"
                                        className={PRIMARY_BUTTON}
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
                                        className={SECONDARY_BUTTON}
                                    >
                                        View all listings
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <motion.div
                                key={`listings-${activeFilter}-${page}`}
                                initial={
                                    shouldReduceMotion
                                        ? false
                                        : { opacity: 0 }
                                }
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                            >
                                {filteredItems.map((item) => (
                                    <ListingCard
                                        key={item.listing.id}
                                        item={item}
                                        busy={
                                            busyListingId ===
                                            item.listing.id
                                        }
                                        menuOpen={
                                            menuListingId ===
                                            item.listing.id
                                        }
                                        onToggleMenu={() =>
                                            setMenuListingId(
                                                (current) =>
                                                    current ===
                                                    item.listing.id
                                                        ? null
                                                        : item.listing.id,
                                            )
                                        }
                                        onCloseMenu={() =>
                                            setMenuListingId(null)
                                        }
                                        onAction={(target, action) =>
                                            void handleLifecycleAction(
                                                target,
                                                action,
                                            )
                                        }
                                        onDelete={handleOpenDelete}
                                    />
                                ))}
                            </motion.div>

                            {/* Pagination */}

                            {data.pagination.totalPages > 1 && (
                                <nav
                                    aria-label="Listing pagination"
                                    className="mt-8 flex flex-col gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <p className="text-sm text-zinc-500">
                                        Page{" "}
                                        <span className="font-semibold text-zinc-900">
                                            {data.pagination.page}
                                        </span>{" "}
                                        of{" "}
                                        {data.pagination.totalPages}
                                    </p>

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
                                            className={SECONDARY_BUTTON}
                                        >
                                            Next
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </nav>
                            )}
                        </>
                    )}
                </section>
            </motion.div>

            {/* Delete dialog */}

            <DeleteDialog
                target={deleteTarget}
                isDeleting={isDeleting}
                onCancel={handleCancelDelete}
                onConfirm={() => void handleDelete()}
            />
        </main>
    );
}