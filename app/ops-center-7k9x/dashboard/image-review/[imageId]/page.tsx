"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
    ArrowLeft,
    AlertTriangle,
    CheckCircle2,
    ExternalLink,
    Eye,
    Image as ImageIcon,
    LoaderCircle,
    Maximize2,
    RefreshCw,
    ShieldCheck,
    X,
    XCircle,
} from "lucide-react";

import { AdminImageReviewDecision } from "@/app/types/admin/adminImageReview.types";

import { useAdminImageReview } from "@/app/hooks/admin/admin-image-review/useAdminImageReview";
import { useAdminImageReviewDecision } from "@/app/hooks/admin/admin-image-review/useAdminImageReviewDecision";
import { useRetryAdminImageAnalysis } from "@/app/hooks/admin/admin-image-review/useRetryAdminImageAnalysis";

import { ImageReviewDetailSkeleton } from "@/app/components/adminComponents/admin-image-review/ImageReviewDetailsSkeleton";
import { AdminImageReviewStatus } from "@/app/components/adminComponents/admin-image-review/AdminImageReviewStatus";
import {
    formatReviewDate,
    truncateId,
} from "@/app/components/adminComponents/admin-image-review/imageReview.utils";

import { ImageReviewDetailSections } from "@/app/components/adminComponents/admin-image-review/ImageReviewDetailSections";
import { ImageReviewDecisionModal } from "@/app/components/adminComponents/admin-image-review/ImageReviewDecisionModal";

const IMAGE_REVIEW_QUEUE_URL =
    "/ops-center-7k9x/dashboard/image-review";

export default function AdminImageReviewDetailPage() {
    const params = useParams<{ imageId: string }>();
    const imageId = params.imageId;

    const [decision, setDecision] =
        useState<AdminImageReviewDecision | null>(null);

    const [previewOpen, setPreviewOpen] = useState(false);

    const {
        data,
        isLoading,
        isError,
        refetch,
        isFetching,
    } = useAdminImageReview(imageId);

    const decisionMutation = useAdminImageReviewDecision();
    const retryMutation = useRetryAdminImageAnalysis();

    const image = data?.image;
    const listing = data?.listing ?? null;
    const vehicle = data?.vehicle ?? null;
    const seller = data?.seller ?? null;
    const analysis = data?.analysis;
    const reviewHistory = data?.reviewHistory ?? [];

    const latestReview = reviewHistory[0];

    /**
     * Determines whether the image was rejected by an administrator.
     * An administrator-rejected image must not be retried.
     */
    const analysisCheckedAt = analysis?.image?.checkedAt;
    const latestReviewAt = latestReview?.createdAt;

    const isAdminRejected = (() => {
        if (
            image?.imageCheckStatus !== "FAILED" ||
            latestReview?.decision !== "REJECTED" ||
            !analysisCheckedAt ||
            !latestReviewAt
        ) {
            return false;
        }

        const reviewTimestamp = new Date(latestReviewAt).getTime();
        const analysisTimestamp = new Date(analysisCheckedAt).getTime();

        return (
            Number.isFinite(reviewTimestamp) &&
            Number.isFinite(analysisTimestamp) &&
            reviewTimestamp >= analysisTimestamp
        );
    })();
    /**
     * Only technical failures should be eligible for retry.
     * PASSED images and administrator-rejected images cannot be retried.
     */
    const canRetry =
        image?.imageCheckStatus === "FAILED" &&
        !isAdminRejected;

    const handleDecision = (payload: {
        decision: AdminImageReviewDecision;
        reason?: string;
        notes?: string;
    }) => {
        decisionMutation.mutate(
            {
                imageId,
                payload,
            },
            {
                onSuccess: () => {
                    setDecision(null);
                    refetch();
                },
            },
        );
    };

    const handleRetry = () => {
        if (!canRetry || retryMutation.isPending) return;

        retryMutation.mutate(imageId, {
            onSuccess: () => {
                refetch();
            },
        });
    };

    if (isLoading) {
        return (
            <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
                <ImageReviewDetailSkeleton />
            </div>
        );
    }

    if (isError || !data || !image || !analysis) {
        return (
            <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                    <AlertTriangle className="h-7 w-7" />
                </div>

                <h2 className="mt-5 text-lg font-bold text-slate-900">
                    Unable to load image review
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                    The image details could not be retrieved. It may have
                    been removed or you may not have permission to access it.
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#1491FF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0878DC] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isFetching && (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        )}
                        Try again
                    </button>

                    <Link
                        href={IMAGE_REVIEW_QUEUE_URL}
                        className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Back to queue
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Page header */}
            <div className="space-y-5">
                <Link
                    href={IMAGE_REVIEW_QUEUE_URL}
                    className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#1491FF]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to image review
                </Link>

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                                Image review
                            </h1>

                            <AdminImageReviewStatus
                                status={image.imageCheckStatus}
                            />
                        </div>

                        <p className="mt-2 break-all text-xs text-slate-500">
                            Image ID: {image.imageId}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Submitted{" "}
                            {formatReviewDate(image.imageCreatedAt)}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => refetch()}
                            disabled={isFetching}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    isFetching ? "animate-spin" : ""
                                }`}
                            />
                            Refresh
                        </button>

                        {canRetry && (
                            <button
                                type="button"
                                onClick={handleRetry}
                                disabled={retryMutation.isPending}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1491FF]/20 bg-[#1491FF]/5 px-4 py-3 text-xs font-semibold text-[#1491FF] transition hover:bg-[#1491FF]/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {retryMutation.isPending ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4" />
                                )}

                                {retryMutation.isPending
                                    ? "Retrying..."
                                    : "Retry analysis"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Administrative decision panel */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1491FF]/10 text-[#1491FF]">
                            <ShieldCheck className="h-5 w-5" />
                        </div>

                        <div>
                            <h2 className="text-sm font-bold text-slate-900">
                                Administrative decision
                            </h2>

                            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                                Review the submitted image, vehicle listing,
                                seller information and automated analysis
                                before making a decision.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <button
                            type="button"
                            onClick={() => setDecision("APPROVED")}
                            disabled={decisionMutation.isPending}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve
                        </button>

                        <button
                            type="button"
                            onClick={() => setDecision("REJECTED")}
                            disabled={decisionMutation.isPending}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <XCircle className="h-4 w-4" />
                            Reject
                        </button>

                        <button
                            type="button"
                            onClick={() => setDecision("NEEDS_REVIEW")}
                            disabled={decisionMutation.isPending}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-xs font-bold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Eye className="h-4 w-4" />
                            Needs review
                        </button>
                    </div>
                </div>
            </section>

            {/* Main content */}
            <div className="grid items-start gap-6 xl:grid-cols-12">
                {/* Left column */}
                <div className="space-y-6 xl:col-span-7">
                    {/* Image preview */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-[#1491FF]" />

                                <h2 className="text-sm font-bold text-slate-900">
                                    Image preview
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => setPreviewOpen(true)}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#1491FF]/30 hover:text-[#1491FF]"
                            >
                                <Maximize2 className="h-3.5 w-3.5" />
                                Expand
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setPreviewOpen(true)}
                            className="group relative flex min-h-[300px] w-full items-center justify-center overflow-hidden bg-slate-100 p-3 sm:min-h-[480px] sm:p-6"
                            aria-label="Expand image preview"
                        >
                            <div className="relative h-[300px] w-full sm:h-[440px]">
                                <Image
                                    src={image.imageUrl}
                                    alt={
                                        image.originalName ||
                                        "Listing image"
                                    }
                                    fill
                                    unoptimized
                                    sizes="(max-width: 1280px) 100vw, 60vw"
                                    className="object-contain"
                                />
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/0 transition group-hover:bg-slate-950/10">
                                <span className="flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2.5 text-xs font-bold text-slate-800 opacity-0 shadow-lg transition group-hover:opacity-100">
                                    <Maximize2 className="h-4 w-4" />
                                    View full image
                                </span>
                            </div>
                        </button>

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-4 sm:px-5">
                            <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-slate-800">
                                    {image.originalName || "Untitled image"}
                                </p>

                                <p className="mt-1 text-[11px] text-slate-400">
                                    {image.width && image.height
                                        ? `${image.width} × ${image.height}px`
                                        : image.mimeType}
                                </p>
                            </div>

                            <a
                                href={image.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#1491FF] hover:underline"
                            >
                                Open original
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        </div>
                    </section>

                    {/* Associated listing */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1491FF]/10 text-[#1491FF]">
                                <ImageIcon className="h-5 w-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-slate-500">
                                    Associated listing
                                </p>

                                <p className="mt-1 truncate text-sm font-bold text-slate-900">
                                    {listing?.title ||
                                        truncateId(image.listingId)}
                                </p>

                                <p className="mt-1 text-[11px] text-slate-400">
                                    Listing ID:{" "}
                                    {truncateId(image.listingId)}
                                </p>
                            </div>

                            {listing?.status || image.listingStatus ? (
                                <span className="shrink-0 rounded-lg bg-slate-100 px-3 py-2 text-[10px] font-bold uppercase text-slate-600">
                                    {listing?.status || image.listingStatus}
                                </span>
                            ) : null}
                        </div>

                        {listing && (
                            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
                                <div>
                                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                        Price
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-slate-900">
                                        {listing.currency}{" "}
                                        {Number(listing.price).toLocaleString(
                                            "en-NG",
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                        Condition
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-700">
                                        {listing.condition || "Not specified"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                        Mileage
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-700">
                                        {listing.mileage != null
                                            ? `${Number(
                                                  listing.mileage,
                                              ).toLocaleString("en-NG")} km`
                                            : "Not specified"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right column: image, listing, vehicle, seller and analysis */}
                <div className="min-w-0 xl:col-span-5">
                    <ImageReviewDetailSections
                        image={image}
                        listing={listing}
                        vehicle={vehicle}
                        seller={seller}
                        analysis={analysis}
                        reviewHistory={reviewHistory}
                    />
                </div>
            </div>

            {/* Fullscreen image preview */}
            {previewOpen && (
                <div
                    className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/95 p-3 sm:p-8"
                    onClick={() => setPreviewOpen(false)}
                >
                    <button
                        type="button"
                        onClick={() => setPreviewOpen(false)}
                        className="absolute right-4 top-4 z-10 rounded-xl bg-white/10 p-3 text-white transition hover:bg-white/20"
                        aria-label="Close preview"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    <div
                        className="relative h-[85vh] w-full max-w-7xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <Image
                            src={image.imageUrl}
                            alt={
                                image.originalName || "Listing image"
                            }
                            fill
                            unoptimized
                            sizes="100vw"
                            className="object-contain"
                        />
                    </div>
                </div>
            )}

            {/* Decision modal */}
            <ImageReviewDecisionModal
                open={Boolean(decision)}
                decision={decision}
                loading={decisionMutation.isPending}
                onClose={() => setDecision(null)}
                onSubmit={handleDecision}
            />
        </div>
    );
}