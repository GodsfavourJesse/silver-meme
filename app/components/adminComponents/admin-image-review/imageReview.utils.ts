import { AdminImageStatus } from "@/app/types/admin/adminImageReview.types";
import {
    CheckCircle2,
    Clock3,
    AlertTriangle,
    XCircle,
    type LucideIcon,
} from "lucide-react";

export const IMAGE_REVIEW_STATUS: Record<
    AdminImageStatus,
    {
        label: string;
        className: string;
        icon: LucideIcon;
    }
> = {
    PENDING: {
        label: "Pending",
        className:
            "border-slate-200 bg-slate-50 text-slate-600",
        icon: Clock3,
    },

    REVIEW: {
        label: "Needs review",
        className:
            "border-amber-200 bg-amber-50 text-amber-700",
        icon: AlertTriangle,
    },

    FAILED: {
        label: "Failed",
        className:
            "border-red-200 bg-red-50 text-red-700",
        icon: XCircle,
    },

    PASSED: {
        label: "Passed",
        className:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
        icon: CheckCircle2,
    },
};

export function formatReviewDate(
    value: string,
) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Unknown date";
    }

    return new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export function truncateId(
    value: string,
    length = 8,
) {
    if (!value) return "—";

    return `${value.slice(0, length)}...`;
}