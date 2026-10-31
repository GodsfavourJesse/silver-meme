"use client";

import { AdminImageStatus } from "@/app/types/admin/adminImageReview.types";
import {
    IMAGE_REVIEW_STATUS,
} from "./imageReview.utils";

interface AdminImageReviewStatusProps {
    status: AdminImageStatus;
    compact?: boolean;
}

export function AdminImageReviewStatus({
    status,
    compact = false,
}: AdminImageReviewStatusProps) {
    const config = IMAGE_REVIEW_STATUS[status];

    const Icon = config.icon;

    return (
        <span
            className={`
                inline-flex shrink-0 items-center gap-1.5
                rounded-full border font-semibold
                ${compact
                    ? "px-2 py-1 text-[10px]"
                    : "px-2.5 py-1.5 text-xs"
                }
                ${config.className}
            `}
        >
            <Icon
                size={compact ? 11 : 13}
                strokeWidth={2.2}
            />

            {config.label}
        </span>
    );
}