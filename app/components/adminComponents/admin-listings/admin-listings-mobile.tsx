"use client";

import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    ChevronRight,
    Image as ImageIcon,
    LoaderCircle,
    RefreshCw,
    Search,
    ShieldCheck,
    XCircle,
} from "lucide-react";

import {
    canApprove,
    formatMoney,
    imageCounts,
    imageStatus,
    imageUrl,
    vehicleLabel,
} from "./admin-listings.utils";

import {
    ModerationViewProps,
    PendingListing,
} from "./admin-listings.types";

/*
|--------------------------------------------------------------------------
| Queue card
|--------------------------------------------------------------------------
*/

function QueueCard({
    item,
    onClick,
}: {
    item: PendingListing;
    onClick: () => void;
}) {
    const counts = imageCounts(item);

    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left transition active:scale-[0.99]"
        >
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF5FF] text-[#1491FF]">
                    <ShieldCheck size={20} />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">
                            {item.listing.title}
                        </h3>

                        <ChevronRight
                            size={17}
                            className="mt-0.5 shrink-0 text-slate-400"
                        />
                    </div>

                    <p className="mt-1 truncate text-xs text-slate-500">
                        {vehicleLabel(item) || "Vehicle details unavailable"}
                    </p>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-sm font-bold text-slate-900">
                    {formatMoney(
                        item.listing.price,
                        item.listing.currency,
                    )}
                </span>

                <span className="rounded-md bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                    Pending
                </span>
            </div>

            <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-[#1491FF]"
                        style={{
                            width: `${
                                counts.total
                                    ? (counts.passed / counts.total) * 100
                                    : 0
                            }%`,
                        }}
                    />
                </div>

                <span className="shrink-0 text-[10px] text-slate-500">
                    {counts.passed}/{counts.total} images passed
                </span>
            </div>
        </button>
    );
}

/*
|--------------------------------------------------------------------------
| Notification
|--------------------------------------------------------------------------
*/

function MobileFeedback({
    message,
    error,
    onDismiss,
    onRetry,
}: {
    message: string;
    error: boolean;
    onDismiss?: () => void;
    onRetry?: () => void;
}) {
    if (!message) return null;

    return (
        <div
            role={error ? "alert" : "status"}
            className={`flex items-start gap-2 rounded-xl border p-3 text-xs leading-5 ${
                error
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
        >
            {error ? (
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            ) : (
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            )}

            <p className="min-w-0 flex-1">{message}</p>

            {error && onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="shrink-0 font-semibold underline"
                >
                    Retry
                </button>
            )}

            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label="Dismiss notification"
                    className="shrink-0 text-base"
                >
                    ×
                </button>
            )}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Listing overview
|--------------------------------------------------------------------------
*/

function MobileListingOverview({
    item,
}: {
    item: PendingListing;
}) {
    const sellerName = [
        item.seller?.firstName,
        item.seller?.lastName,
    ]
        .filter(Boolean)
        .join(" ");

    const location = [
        item.listing.city,
        item.listing.state,
    ]
        .filter(Boolean)
        .join(", ");

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="p-4">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />

                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                        Awaiting approval
                    </span>
                </div>

                <h2 className="mt-2 text-lg font-bold leading-6 text-slate-950">
                    {item.listing.title}
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                    {vehicleLabel(item) || "Vehicle details unavailable"}
                </p>

                <p className="mt-4 text-xl font-bold text-slate-950">
                    {formatMoney(
                        item.listing.price,
                        item.listing.currency,
                    )}
                </p>
            </div>

            <div className="grid grid-cols-2 border-t border-slate-100">
                <div className="border-r border-slate-100 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Seller
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                        {sellerName || "Seller"}
                    </p>

                    <p className="mt-1 break-all text-[11px] text-slate-500">
                        {item.seller?.email ?? "Email unavailable"}
                    </p>
                </div>

                <div className="p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Location
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                        {location || "Not supplied"}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                        {new Date(
                            item.listing.createdAt,
                        ).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {item.listing.description && (
                <div className="border-t border-slate-100 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Description
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-600">
                        {item.listing.description}
                    </p>
                </div>
            )}
        </section>
    );
}

/*
|--------------------------------------------------------------------------
| Image verification
|--------------------------------------------------------------------------
*/

function MobileImageVerification({
    item,
    detailLoading,
    onRefresh,
}: {
    item: PendingListing;
    detailLoading: boolean;
    onRefresh: () => void;
}) {
    const counts = imageCounts(item);

    const sortedImages = item.images
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder);

    const metrics = [
        {
            label: "Passed",
            value: counts.passed,
            color: "text-emerald-600",
        },
        {
            label: "Pending",
            value: counts.pending,
            color: "text-sky-600",
        },
        {
            label: "Review",
            value: counts.review,
            color: "text-amber-600",
        },
        {
            label: "Failed",
            value: counts.failed,
            color: "text-red-600",
        },
    ] as const;

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">
                        Image verification
                    </h3>

                    <p className="mt-1 text-[11px] text-slate-500">
                        Automated image checks
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={detailLoading}
                    aria-label="Refresh image verification"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-[#1491FF] transition hover:bg-[#EAF5FF] disabled:opacity-50"
                >
                    <RefreshCw
                        size={15}
                        className={detailLoading ? "animate-spin" : ""}
                    />
                </button>
            </div>

            <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
                {metrics.map((metric) => (
                    <div
                        key={metric.label}
                        className="px-1 py-3 text-center"
                    >
                        <p className={`text-lg font-bold ${metric.color}`}>
                            {metric.value}
                        </p>

                        <p className="mt-0.5 text-[9px] text-slate-500">
                            {metric.label}
                        </p>
                    </div>
                ))}
            </div>

            {sortedImages.length ? (
                <div className="grid grid-cols-2 gap-2 p-3">
                    {sortedImages.map((image) => {
                        const status = imageStatus(
                            image.imageCheckStatus,
                        );

                        const src = imageUrl(image.objectKey);

                        return (
                            <article
                                key={image.id}
                                className="min-w-0 overflow-hidden rounded-lg border border-slate-200"
                            >
                                <div className="relative aspect-square bg-slate-50">
                                    {src ? (
                                        <img
                                            src={src}
                                            alt={
                                                image.originalName ??
                                                "Vehicle image"
                                            }
                                            loading="lazy"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
                                            <ImageIcon size={22} />

                                            <span className="max-w-[90%] truncate text-[9px]">
                                                {image.originalName ??
                                                    "Image unavailable"}
                                            </span>
                                        </div>
                                    )}

                                    <span
                                        className={`absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md border bg-white/95 px-2 py-1 text-[9px] font-semibold shadow-sm ${status.className}`}
                                    >
                                        <status.Icon size={10} />
                                        {status.label}
                                    </span>
                                </div>

                                <div className="space-y-1.5 p-2.5">
                                    <p className="truncate text-[11px] font-semibold text-slate-700">
                                        {image.originalName ??
                                            `Image ${image.sortOrder + 1}`}
                                    </p>

                                    <p className="line-clamp-2 text-[10px] leading-4 text-slate-500">
                                        {image.checkReason ||
                                            (image.imageCheckStatus ===
                                            "PASSED"
                                                ? "Automated checks passed."
                                                : "Analysis details unavailable.")}
                                    </p>

                                    {image.similarityScore != null && (
                                        <p className="text-[10px] text-slate-500">
                                            Similarity:{" "}
                                            <strong>
                                                {image.similarityScore}
                                            </strong>
                                        </p>
                                    )}

                                    {image.matchedListingId && (
                                        <p className="break-all rounded-md bg-amber-50 p-2 text-[9px] leading-4 text-amber-800">
                                            Possible duplicate:{" "}
                                            {image.matchedListingId}
                                        </p>
                                    )}

                                    {image.matchedImageId && (
                                        <p className="break-all text-[9px] text-slate-400">
                                            Matched image:{" "}
                                            {image.matchedImageId}
                                        </p>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <div className="p-8 text-center">
                    <ImageIcon
                        size={26}
                        className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 text-xs font-semibold text-slate-700">
                        No listing images
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                        Approval is unavailable without images.
                    </p>
                </div>
            )}

            {!canApprove(item) && (
                <div className="border-t border-amber-100 bg-amber-50/70 p-3">
                    <p className="text-[11px] leading-5 text-amber-800">
                        Every image must pass verification before this listing
                        can be approved.
                    </p>
                </div>
            )}
        </section>
    );
}

/*
|--------------------------------------------------------------------------
| Mobile moderation view
|--------------------------------------------------------------------------
*/

export function AdminListingsMobile(p: ModerationViewProps) {
    return (
        <main className="min-w-0 space-y-4 px-4 pb-8 pt-5 text-slate-900">
            {/* Header */}

            <header className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        {p.selected ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => p.onSelect("")}
                                    className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0877D9]"
                                >
                                    <ArrowLeft size={15} />
                                    Back to listings
                                </button>

                                <h1 className="text-xl font-bold tracking-tight text-slate-950">
                                    Review listing
                                </h1>

                                <p className="mt-1 text-xs text-slate-500">
                                    Inspect the submission before deciding.
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 text-xs font-semibold text-[#0877D9]">
                                    <ShieldCheck size={15} />
                                    Marketplace moderation
                                </div>

                                <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                                    Listing review
                                </h1>

                                <p className="mt-1 text-xs text-slate-500">
                                    Review vehicle submissions.
                                </p>
                            </>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={p.onRefreshQueue}
                        disabled={p.loading}
                        aria-label="Refresh listings"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#1491FF] transition hover:bg-[#EAF5FF] disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={p.loading ? "animate-spin" : ""}
                        />
                    </button>
                </div>

                {!p.selected && (
                    <div className="flex items-center justify-between rounded-xl border border-[#D6EBFF] bg-[#EAF5FF] px-4 py-3">
                        <div>
                            <p className="text-xs font-medium text-slate-600">
                                Awaiting review
                            </p>

                            <p className="mt-0.5 text-xl font-bold text-[#0877D9]">
                                {p.items.length}
                            </p>
                        </div>

                        <ShieldCheck
                            size={25}
                            className="text-[#1491FF]"
                        />
                    </div>
                )}
            </header>

            <MobileFeedback
                message={p.notice}
                error={false}
            />

            <MobileFeedback
                message={p.error}
                error
                onDismiss={() => p.setError("")}
                onRetry={p.onRefreshQueue}
            />

            {/* Queue */}

            {!p.selected ? (
                <section className="space-y-3">
                    <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-[#1491FF] focus-within:ring-2 focus-within:ring-[#1491FF]/10">
                        <Search size={16} className="text-slate-400" />

                        <input
                            value={p.search}
                            onChange={(e) => p.setSearch(e.target.value)}
                            placeholder="Search listings..."
                            className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400"
                        />
                    </label>

                    {p.loading ? (
                        <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-10 text-xs text-slate-500">
                            <LoaderCircle
                                size={17}
                                className="animate-spin"
                            />
                            Loading listings...
                        </div>
                    ) : p.filteredItems.length ? (
                        <div className="space-y-3">
                            {p.filteredItems.map((item) => (
                                <QueueCard
                                    key={item.listing.id}
                                    item={item}
                                    onClick={() =>
                                        p.onSelect(item.listing.id)
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center">
                            <ShieldCheck
                                size={30}
                                className="mx-auto text-[#1491FF]"
                            />

                            <p className="mt-3 text-sm font-semibold text-slate-800">
                                {p.items.length
                                    ? "No matching listings"
                                    : "Queue is clear"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                {p.items.length
                                    ? "Try another search."
                                    : "New submissions will appear here."}
                            </p>
                        </div>
                    )}
                </section>
            ) : (
                /* Selected listing */

                <div className="space-y-4">
                    <MobileListingOverview item={p.selected} />

                    <MobileImageVerification
                        item={p.selected}
                        detailLoading={p.detailLoading}
                        onRefresh={p.onRefreshSelected}
                    />

                    {/* Moderation decision */}

                    <section className="rounded-xl border border-slate-200 bg-white p-4">
                        <h3 className="text-sm font-bold text-slate-900">
                            Moderation decision
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                            Provide a reason when rejecting a listing.
                        </p>

                        <textarea
                            value={p.rejectionReason}
                            onChange={(e) =>
                                p.setRejectionReason(e.target.value)
                            }
                            rows={3}
                            maxLength={2000}
                            placeholder="Explain what needs to be corrected..."
                            className="mt-4 w-full resize-y rounded-lg border border-slate-200 p-3 text-xs leading-5 outline-none transition placeholder:text-slate-400 focus:border-[#1491FF] focus:ring-2 focus:ring-[#1491FF]/10"
                        />

                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={p.onApprove}
                                disabled={
                                    p.actionLoading ||
                                    !canApprove(p.selected)
                                }
                                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-[#1491FF] px-3 text-xs font-semibold text-white transition hover:bg-[#0877D9] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {p.actionLoading ? (
                                    <LoaderCircle
                                        size={15}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <CheckCircle2 size={15} />
                                )}

                                Approve
                            </button>

                            <button
                                type="button"
                                onClick={p.onReject}
                                disabled={
                                    p.actionLoading ||
                                    p.rejectionReason.trim().length < 5
                                }
                                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {p.actionLoading ? (
                                    <LoaderCircle
                                        size={15}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <XCircle size={15} />
                                )}

                                Reject
                            </button>
                        </div>

                        {!canApprove(p.selected) && (
                            <p className="mt-3 text-[10px] leading-4 text-slate-400">
                                Approval becomes available after all images
                                pass verification.
                            </p>
                        )}
                    </section>
                </div>
            )}
        </main>
    );
}