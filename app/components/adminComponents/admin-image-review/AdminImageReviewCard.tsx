"use client";

import Image from "next/image";
import Link from "next/link";

import {
    ArrowUpRight,
    CalendarDays,
    ImageIcon,
    Maximize2,
} from "lucide-react";

import {
    AdminImageReviewStatus,
} from "./AdminImageReviewStatus";

import {
    formatReviewDate,
    truncateId,
} from "./imageReview.utils";
import { AdminImageReviewItem, AdminImageStatus } from "@/app/types/admin/adminImageReview.types";

interface AdminImageReviewCardProps {
    image: AdminImageReviewItem;
}

export function AdminImageReviewCard({
    image,
}: AdminImageReviewCardProps) {
    const status =
        image.imageCheckStatus as AdminImageStatus;

    return (
        <article className="
            group overflow-hidden rounded-2xl
            border border-slate-200 bg-white
            transition-all duration-200
            hover:border-[#1491FF]/40
            hover:shadow-[0_8px_30px_rgba(15,23,42,0.07)]
        ">
            {/* Image preview */}
            <Link
                href={`/ops-center-7k9x/dashboard/image-review/${image.imageId}`}
                className="
                    relative block aspect-[4/3]
                    overflow-hidden bg-slate-100
                "
            >
                {image.imageUrl ? (
                    <Image
                        src={image.imageUrl}
                        alt={
                            image.originalName ||
                            "Listing image"
                        }
                        fill
                        unoptimized
                        sizes="
                            (max-width: 640px) 50vw,
                            (max-width: 1024px) 33vw,
                            25vw
                        "
                        className="
                            object-cover
                            transition-transform duration-500
                            group-hover:scale-[1.035]
                        "
                    />
                ) : (
                    <div className="
                        flex h-full items-center
                        justify-center text-slate-400
                    ">
                        <ImageIcon size={32} />
                    </div>
                )}

                <div className="
                    absolute left-3 top-3
                ">
                    <AdminImageReviewStatus
                        status={status}
                        compact
                    />
                </div>

                <div className="
                    absolute bottom-3 right-3
                    flex h-8 w-8 items-center justify-center
                    rounded-lg bg-black/45 text-white
                    opacity-0 backdrop-blur-sm
                    transition-opacity
                    group-hover:opacity-100
                ">
                    <Maximize2 size={15} />
                </div>
            </Link>

            {/* Content */}
            <div className="space-y-3 p-3.5 sm:p-4">
                <div className="min-w-0">
                    <h3
                        className="
                            truncate text-sm font-semibold
                            text-slate-900
                        "
                        title={image.originalName}
                    >
                        {image.originalName || "Untitled image"}
                    </h3>

                    <p className="
                        mt-1 text-[11px] text-slate-500
                    ">
                        Listing ID: {truncateId(image.listingId)}
                    </p>
                </div>

                <div className="
                    flex items-center justify-between
                    gap-2 border-t border-slate-100 pt-3
                ">
                    <div className="flex min-w-0 items-center gap-1.5">
                        <CalendarDays
                            size={13}
                            className="shrink-0 text-slate-400"
                        />

                        <span className="
                            truncate text-[11px] text-slate-500
                        ">
                            {formatReviewDate(image.imageCreatedAt)}
                        </span>
                    </div>

                    <span className="
                        shrink-0 text-[10px] font-medium
                        text-slate-400
                    ">
                        #{image.sortOrder + 1}
                    </span>
                </div>

                {image.checkReason && (
                    <div className="
                        rounded-lg border border-amber-100
                        bg-amber-50/70 px-3 py-2
                    ">
                        <p className="
                            line-clamp-2 text-[11px]
                            leading-relaxed text-amber-800
                        ">
                            {image.checkReason}
                        </p>
                    </div>
                )}

                <Link
                    href={`/ops-center-7k9x/dashboard/image-review/${image.imageId}`}
                    className="
                        flex w-full items-center
                        justify-center gap-2 rounded-xl
                        border border-slate-200
                        bg-white px-3 py-2.5
                        text-xs font-semibold text-slate-700
                        transition-colors
                        hover:border-[#1491FF]/40
                        hover:bg-[#1491FF]/5
                        hover:text-[#1491FF]
                    "
                >
                    Review image

                    <ArrowUpRight size={14} />
                </Link>
            </div>
        </article>
    );
}