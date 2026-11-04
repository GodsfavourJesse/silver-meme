import type {
    BoostStatus,
    BoostPlan,
} from "@/app/types/user/boost/boost.types";

// ============================================
// STATUS CONFIGURATION
// ============================================

export interface BoostStatusConfig {
    label: string;
    description: string;
    className: string;
    dotClassName: string;
}

export const BOOST_STATUS_CONFIG: Record<
    BoostStatus,
    BoostStatusConfig
> = {
    PENDING: {
        label: "Awaiting Payment",

        description:
            "Complete payment to submit your boost for review.",

        className:
            "bg-amber-50 text-amber-700 ring-amber-200",

        dotClassName:
            "bg-amber-500",
    },

    AWAITING_APPROVAL: {
        label: "Under Review",

        description:
            "Your payment has been verified. Your boost is awaiting administrative approval.",

        className:
            "bg-blue-50 text-blue-700 ring-blue-200",

        dotClassName:
            "bg-blue-500",
    },

    ACTIVE: {
        label: "Currently Boosted",

        description:
            "Your vehicle listing is currently being promoted.",

        className:
            "bg-emerald-50 text-emerald-700 ring-emerald-200",

        dotClassName:
            "bg-emerald-500",
    },

    REJECTED: {
        label: "Rejected",

        description:
            "Your boost request was rejected.",

        className:
            "bg-red-50 text-red-700 ring-red-200",

        dotClassName:
            "bg-red-500",
    },

    EXPIRED: {
        label: "Expired",

        description:
            "Your boost promotion period has ended.",

        className:
            "bg-slate-100 text-slate-600 ring-slate-200",

        dotClassName:
            "bg-slate-400",
    },

    CANCELLED: {
        label: "Cancelled",

        description:
            "This boost request was cancelled.",

        className:
            "bg-slate-100 text-slate-600 ring-slate-200",

        dotClassName:
            "bg-slate-400",
    },
};

// ============================================
// GET STATUS CONFIGURATION
// ============================================

export function getBoostStatusConfig(
    status: BoostStatus,
): BoostStatusConfig {
    return BOOST_STATUS_CONFIG[status];
}

// ============================================
// STATUS LABEL
// ============================================

export function getBoostStatusLabel(
    status: BoostStatus,
): string {
    return BOOST_STATUS_CONFIG[status].label;
}

// ============================================
// REMAINING BOOST DAYS
// ============================================

export function getBoostRemainingDays(
    expiresAt: string | null,
): number | null {
    if (!expiresAt) {
        return null;
    }

    const expiryTime = new Date(expiresAt).getTime();

    if (!Number.isFinite(expiryTime)) {
        return null;
    }

    const remaining = expiryTime - Date.now();

    if (remaining <= 0) {
        return 0;
    }

    return Math.ceil(
        remaining / (1000 * 60 * 60 * 24),
    );
}

// ============================================
// BOOST EXPIRY FORMATTING
// ============================================

export function formatBoostExpiry(
    expiresAt: string | null,
): string {
    if (!expiresAt) {
        return "Not started";
    }

    const date = new Date(expiresAt);

    if (Number.isNaN(date.getTime())) {
        return "Unavailable";
    }

    return new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

// ============================================
// BOOST PRICE FORMATTING
// ============================================

export function formatBoostPrice(
    price: string | number,
    currency = "NGN",
): string {
    const amount = Number(price);

    if (!Number.isFinite(amount)) {
        return "Price unavailable";
    }

    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `${currency} ${amount.toLocaleString("en-NG")}`;
    }
}

// ============================================
// BOOST PLAN DURATION
// ============================================

export function formatBoostDuration(
    durationDays: number,
): string {
    if (!Number.isFinite(durationDays) || durationDays <= 0) {
        return "Invalid duration";
    }

    return `${durationDays} ${durationDays === 1 ? "day" : "days"}`;
}

// ============================================
// BOOST PLAN PRICE
// ============================================

export function getBoostPlanPrice(
    plan: BoostPlan,
): string {
    return formatBoostPrice(
        plan.price,
        plan.currency,
    );
}

// ============================================
// BOOST ELIGIBILITY
// ============================================

/**
 * Determines whether a listing can be boosted.
 *
 * This is a frontend convenience check.
 * The backend remains responsible for enforcing eligibility.
 */

export function canListingBeBoosted(
    listingStatus: string,
    existingBoostStatus?: BoostStatus | null,
): boolean {
    if (listingStatus !== "APPROVED") {
        return false;
    }

    if (!existingBoostStatus) {
        return true;
    }

    return ![
        "PENDING",
        "AWAITING_APPROVAL",
        "ACTIVE",
    ].includes(existingBoostStatus);
}

// ============================================
// BOOST STATUS HELPERS
// ============================================

export function isBoostActive(
    status: BoostStatus,
): boolean {
    return status === "ACTIVE";
}

export function isBoostPending(
    status: BoostStatus,
): boolean {
    return status === "PENDING";
}

export function isBoostAwaitingApproval(
    status: BoostStatus,
): boolean {
    return status === "AWAITING_APPROVAL";
}

export function isBoostFinished(
    status: BoostStatus,
): boolean {
    return [
        "EXPIRED",
        "REJECTED",
        "CANCELLED",
    ].includes(status);
}