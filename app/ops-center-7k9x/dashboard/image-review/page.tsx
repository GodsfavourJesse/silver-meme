"use client";

import { useState } from "react";

import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    ImageIcon,
    RefreshCw,
    ShieldCheck,
} from "lucide-react";
import { AdminImageReviewFilter, AdminImageReviewSort } from "@/app/types/admin/adminImageReview.types";
import { useAdminImageReviews } from "@/app/hooks/admin/admin-image-review/useAdminImageReviews";
import { AdminImageReviewFilters } from "@/app/components/adminComponents/admin-image-review/AdminImageReviewFilters";
import { AdminImageReviewCard } from "@/app/components/adminComponents/admin-image-review/AdminImageReviewCard";

const PAGE_SIZE = 20;

export default function AdminImageReviewPage() {
    const [status, setStatus] =
        useState<AdminImageReviewFilter>("REVIEW");

    const [sort, setSort] =
        useState<AdminImageReviewSort>("oldest");

    const [page, setPage] = useState(1);

    const {
        data,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useAdminImageReviews({
        status,
        sort,
        page,
        limit: PAGE_SIZE,
    });

    const images = data?.items ?? [];

    const pagination = data?.pagination;

    const handleStatusChange = (
        nextStatus: AdminImageReviewFilter,
    ) => {
        setStatus(nextStatus);
        setPage(1);
    };

    const handleSortChange = (
        nextSort: AdminImageReviewSort,
    ) => {
        setSort(nextSort);
        setPage(1);
    };

    return (
        <main className="
            min-h-screen bg-[#F7F9FC]
            px-3 py-5 sm:px-5
            md:px-20
        ">
            <div className="
                mx-auto w-full max-w-[1600px]
                space-y-5 sm:space-y-6
            ">
                {/* Header */}
                <section className="
                    flex flex-col gap-4
                    sm:flex-row sm:items-center
                    sm:justify-between
                ">
                    <div className="flex items-start gap-3">
                        <div className="
                            flex h-11 w-11 shrink-0
                            items-center justify-center
                            rounded-xl border
                            border-[#1491FF]/15
                            bg-[#1491FF]/10
                            text-[#1491FF]
                        ">
                            <ShieldCheck size={21} />
                        </div>

                        <div>
                            <h1 className="
                                text-lg font-bold
                                tracking-tight text-slate-900
                                sm:text-xl
                            ">
                                Image review
                            </h1>

                            <p className="
                                mt-1 max-w-xl
                                text-xs leading-relaxed
                                text-slate-500 sm:text-sm
                            ">
                                Review vehicle photos, inspect
                                automated checks and manage
                                image moderation decisions.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="
                            inline-flex h-10 items-center
                            justify-center gap-2 self-start
                            rounded-xl border border-slate-200
                            bg-white px-3.5 text-xs
                            font-semibold text-slate-700
                            transition-colors
                            hover:border-[#1491FF]/40
                            hover:text-[#1491FF]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            sm:self-auto
                        "
                    >
                        <RefreshCw
                            size={14}
                            className={
                                isFetching
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>
                </section>

                {/* Information banner */}
                <div className="
                    flex items-start gap-3
                    rounded-xl border
                    border-blue-100 bg-blue-50/70
                    px-3.5 py-3
                ">
                    <ShieldCheck
                        size={17}
                        className="mt-0.5 shrink-0 text-[#1491FF]"
                    />

                    <p className="
                        text-[11px] leading-relaxed
                        text-blue-800 sm:text-xs
                    ">
                        Carefully inspect every image before
                        making a decision. Automated image
                        analysis assists moderation but does
                        not replace administrator review.
                    </p>
                </div>

                {/* Filters */}
                <AdminImageReviewFilters
                    status={status}
                    sort={sort}
                    total={pagination?.total ?? 0}
                    onStatusChange={handleStatusChange}
                    onSortChange={handleSortChange}
                />

                {/* Queue heading */}
                <div className="
                    flex items-center justify-between gap-3
                ">
                    <div>
                        <h2 className="
                            text-sm font-bold text-slate-900
                        ">
                            {status === "ALL"
                                ? "All uploaded images"
                                : status === "REVIEW"
                                    ? "Images awaiting review"
                                    : `${status.charAt(0)}${status.slice(1).toLowerCase()} images`
                            }
                        </h2>

                        <p className="
                            mt-1 text-[11px] text-slate-500
                        ">
                            {pagination
                                ? `${pagination.total} image${pagination.total === 1 ? "" : "s"} found`
                                : "Loading review queue..."
                            }
                        </p>
                    </div>

                    {isFetching && !isLoading && (
                        <span className="
                            text-[10px] font-medium
                            text-[#1491FF]
                        ">
                            Updating...
                        </span>
                    )}
                </div>

                {/* Error */}
                {isError && !data && (
                    <div className="
                        flex flex-col items-center
                        rounded-2xl border border-red-200
                        bg-white px-5 py-12 text-center
                    ">
                        <div className="
                            flex h-12 w-12 items-center
                            justify-center rounded-full
                            bg-red-50 text-red-600
                        ">
                            <AlertCircle size={22} />
                        </div>

                        <h3 className="
                            mt-4 text-sm font-bold
                            text-slate-900
                        ">
                            Unable to load image reviews
                        </h3>

                        <p className="
                            mt-1 max-w-sm text-xs
                            leading-relaxed text-slate-500
                        ">
                            Something went wrong while
                            retrieving the image review queue.
                            Please try again.
                        </p>

                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="
                                mt-5 rounded-xl
                                bg-[#1491FF] px-4 py-2.5
                                text-xs font-semibold
                                text-white transition-colors
                                hover:bg-[#087DDF]
                            "
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Loading skeleton */}
                {isLoading && (
                    <div className="
                        grid grid-cols-2 gap-3
                        sm:grid-cols-3 sm:gap-4
                        xl:grid-cols-4
                    ">
                        {Array.from({ length: 8 }).map(
                            (_, index) => (
                                <div
                                    key={index}
                                    className="
                                        overflow-hidden rounded-2xl
                                        border border-slate-200
                                        bg-white
                                    "
                                >
                                    <div className="
                                        aspect-[4/3]
                                        animate-pulse bg-slate-100
                                    " />

                                    <div className="space-y-3 p-3.5">
                                        <div className="
                                            h-3 w-3/4 animate-pulse
                                            rounded bg-slate-100
                                        " />

                                        <div className="
                                            h-2.5 w-1/2 animate-pulse
                                            rounded bg-slate-100
                                        " />

                                        <div className="
                                            h-9 animate-pulse
                                            rounded-lg bg-slate-100
                                        " />
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                )}

                {/* Empty state */}
                {!isLoading &&
                    !isError &&
                    images.length === 0 && (
                        <div className="
                            flex flex-col items-center
                            rounded-2xl border
                            border-dashed border-slate-300
                            bg-white px-5 py-16 text-center
                        ">
                            <div className="
                                flex h-14 w-14 items-center
                                justify-center rounded-2xl
                                bg-slate-100 text-slate-400
                            ">
                                <ImageIcon size={26} />
                            </div>

                            <h3 className="
                                mt-4 text-sm font-bold
                                text-slate-900
                            ">
                                No images found
                            </h3>

                            <p className="
                                mt-1 max-w-sm text-xs
                                leading-relaxed text-slate-500
                            ">
                                There are currently no images
                                matching this review filter.
                                Try selecting another status.
                            </p>

                            {status !== "ALL" && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleStatusChange("ALL")
                                    }
                                    className="
                                        mt-4 text-xs
                                        font-semibold text-[#1491FF]
                                        hover:underline
                                    "
                                >
                                    View all images
                                </button>
                            )}
                        </div>
                    )}

                {/* Image grid */}
                {!isLoading && images.length > 0 && (
                    <div className="
                        grid grid-cols-2 gap-3
                        sm:grid-cols-3 sm:gap-4
                        xl:grid-cols-4
                        2xl:grid-cols-5
                    ">
                        {images.map((image) => (
                            <AdminImageReviewCard
                                key={image.imageId}
                                image={image}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!isLoading &&
                    pagination &&
                    pagination.totalPages > 1 && (
                        <div className="
                            flex flex-col gap-3
                            rounded-2xl border
                            border-slate-200 bg-white
                            p-3.5 sm:flex-row
                            sm:items-center sm:justify-between
                        ">
                            <p className="
                                text-[11px] text-slate-500
                            ">
                                Page{" "}
                                <span className="
                                    font-semibold text-slate-800
                                ">
                                    {pagination.page}
                                </span>{" "}
                                of{" "}
                                <span className="
                                    font-semibold text-slate-800
                                ">
                                    {pagination.totalPages}
                                </span>

                                <span className="mx-1.5">·</span>

                                {pagination.total} total images
                            </p>

                            <div className="
                                flex items-center gap-2
                            ">
                                <button
                                    type="button"
                                    disabled={
                                        page <= 1 || isFetching
                                    }
                                    onClick={() =>
                                        setPage((current) =>
                                            Math.max(1, current - 1),
                                        )
                                    }
                                    className="
                                        flex h-9 flex-1
                                        items-center justify-center
                                        gap-1.5 rounded-lg
                                        border border-slate-200
                                        px-3 text-xs font-semibold
                                        text-slate-700
                                        transition-colors
                                        hover:border-[#1491FF]
                                        hover:text-[#1491FF]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                        sm:flex-none
                                    "
                                >
                                    <ArrowLeft size={14} />
                                    Previous
                                </button>

                                <button
                                    type="button"
                                    disabled={
                                        page >= pagination.totalPages ||
                                        isFetching
                                    }
                                    onClick={() =>
                                        setPage((current) =>
                                            Math.min(
                                                pagination.totalPages,
                                                current + 1,
                                            ),
                                        )
                                    }
                                    className="
                                        flex h-9 flex-1
                                        items-center justify-center
                                        gap-1.5 rounded-lg
                                        border border-slate-200
                                        px-3 text-xs font-semibold
                                        text-slate-700
                                        transition-colors
                                        hover:border-[#1491FF]
                                        hover:text-[#1491FF]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                        sm:flex-none
                                    "
                                >
                                    Next
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
            </div>
        </main>
    );
}