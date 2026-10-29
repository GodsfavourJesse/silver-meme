import {
    CheckCircle2,
    Clock3,
    ShieldAlert,
    type LucideIcon,
} from "lucide-react";

import type {
    ListingPagination,
    ListingStatus,
    ListingSummary,
    SellerListingItem,
} from "@/app/types/user/listings/listing.types";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type DashboardFilter = "ALL" | ListingStatus;

export type LifecycleAction = "submit" | "restore" | "reactivate" | "sold";

export interface DashboardData {
    summary: ListingSummary;
    items: SellerListingItem[];
    pagination: ListingPagination;
}

export interface StatusFilter {
    label: string;
    value: DashboardFilter;
}

/* -------------------------------------------------------------------------- */
/*  General                                                                   */
/* -------------------------------------------------------------------------- */

export const PAGE_SIZE = 12;

/** How long to wait before re-fetching while images are being analysed. */
export const POLL_INTERVAL_MS = 5000;

/* -------------------------------------------------------------------------- */
/*  Initial state                                                             */
/* -------------------------------------------------------------------------- */

export const INITIAL_SUMMARY: ListingSummary = {
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

export const INITIAL_PAGINATION: ListingPagination = {
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
};

export const INITIAL_DATA: DashboardData = {
    summary: INITIAL_SUMMARY,
    items: [],
    pagination: INITIAL_PAGINATION,
};

/* -------------------------------------------------------------------------- */
/*  Listing status                                                            */
/* -------------------------------------------------------------------------- */

export const STATUS_FILTERS: StatusFilter[] = [
    { label: "All listings", value: "ALL" },
    { label: "Drafts", value: "DRAFT" },
    { label: "Pending review", value: "PENDING_REVIEW" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
    { label: "Expired", value: "EXPIRED" },
    { label: "Sold", value: "SOLD" },
    { label: "Suspended", value: "SUSPENDED" },
];

export const STATUS_STYLES: Record<ListingStatus, string> = {
    DRAFT: "border-slate-200 bg-slate-100 text-slate-600",
    PENDING_REVIEW: "border-amber-200 bg-amber-50 text-amber-700",
    APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    REJECTED: "border-red-200 bg-red-50 text-red-700",
    EXPIRED: "border-slate-200 bg-slate-100 text-slate-500",
    SOLD: "border-blue-200 bg-blue-50 text-blue-700",
    SUSPENDED: "border-red-200 bg-red-50 text-red-700",
    DELETED: "border-slate-200 bg-slate-100 text-slate-400",
};

/** Statuses without an entry here fall back to `DEFAULT_STATUS_ICON`. */
export const STATUS_ICONS: Partial<Record<ListingStatus, LucideIcon>> = {
    APPROVED: CheckCircle2,
    PENDING_REVIEW: Clock3,
    REJECTED: ShieldAlert,
    SUSPENDED: ShieldAlert,
};

export const DEFAULT_STATUS_ICON: LucideIcon = Clock3;

/* -------------------------------------------------------------------------- */
/*  Which actions each status allows                                          */
/* -------------------------------------------------------------------------- */

export const EDITABLE_STATUSES: ListingStatus[] = ["DRAFT", "REJECTED"];
export const SUBMITTABLE_STATUSES: ListingStatus[] = ["DRAFT", "REJECTED"];
export const REACTIVATABLE_STATUSES: ListingStatus[] = [
    "EXPIRED",
    "SOLD",
    "SUSPENDED",
];

/* -------------------------------------------------------------------------- */
/*  Image analysis                                                            */
/* -------------------------------------------------------------------------- */

export const IMAGE_STATUS_LABELS: Record<string, string> = {
    PENDING: "Analysis pending",
    PASSED: "Image approved",
    REVIEW: "Needs review",
    FAILED: "Analysis failed",
};

export const IMAGE_STATUS_STYLES: Record<string, string> = {
    PENDING: "border-amber-200 bg-amber-50 text-amber-700",
    PASSED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    REVIEW: "border-orange-200 bg-orange-50 text-orange-700",
    FAILED: "border-red-200 bg-red-50 text-red-700",
};

export const DEFAULT_IMAGE_STATUS_LABEL = "Unknown status";
export const DEFAULT_IMAGE_STATUS_STYLE =
    "border-slate-200 bg-slate-100 text-slate-600";
