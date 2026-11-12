"use client";

import {
    AlertTriangle,
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
| Queue item
|--------------------------------------------------------------------------
*/

function QueueItem({
    item,
    active,
    onClick,
}: {
    item: PendingListing;
    active: boolean;
    onClick: () => void;
}) {
    const counts = imageCounts(item);

    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full border-b border-slate-100 p-4 text-left transition ${
                active
                    ? "bg-[#EAF5FF]"
                    : "bg-white hover:bg-slate-50"
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
                        {item.listing.title}
                    </h3>

                    <p className="mt-1.5 truncate text-xs text-slate-500">
                        {vehicleLabel(item) || "Vehicle details unavailable"}
                    </p>
                </div>

                <ChevronRight
                    size={17}
                    className={`mt-0.5 shrink-0 ${
                        active ? "text-[#1491FF]" : "text-slate-300"
                    }`}
                />
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-slate-900">
                    {formatMoney(
                        item.listing.price,
                        item.listing.currency,
                    )}
                </span>

                <span className="rounded-md bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                    Pending review
                </span>
            </div>

            <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-[#1491FF] transition-all"
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
                    {counts.passed}/{counts.total} passed
                </span>
            </div>
        </button>
    );
}

/*
|--------------------------------------------------------------------------
| Feedback messages
|--------------------------------------------------------------------------
*/

function Feedback({
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
            className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${
                error
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
        >
            {error ? (
                <AlertTriangle size={17} className="mt-0.5 shrink-0" />
            ) : (
                <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
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
                    className="shrink-0 text-lg leading-none opacity-60 hover:opacity-100"
                >
                    ×
                </button>
            )}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Listing details
|--------------------------------------------------------------------------
*/

function ListingDetails({
    item,
    detailLoading,
    onRefresh,
}: {
    item: PendingListing;
    detailLoading: boolean;
    onRefresh: () => void;
}) {
    const counts = imageCounts(item);

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

    const sortedImages = item.images
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder);

    return (
        <div className="space-y-5">
            {/* Listing overview */}

            <section className="rounded-xl border border-slate-200 bg-white">
                <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-amber-400" />

                                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                                    Awaiting approval
                                </span>
                            </div>

                            <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                                {item.listing.title}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {vehicleLabel(item) ||
                                    "Vehicle details unavailable"}
                            </p>
                        </div>

                        <p className="text-xl font-bold text-slate-950">
                            {formatMoney(
                                item.listing.price,
                                item.listing.currency,
                            )}
                        </p>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Seller
                            </p>

                            <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                                {sellerName || "Seller"}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                                {item.seller?.email ?? "Email unavailable"}
                            </p>
                        </div>

                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Location
                            </p>

                            <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                                {location || "Not supplied"}
                            </p>
                        </div>

                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Submitted
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                {new Date(
                                    item.listing.createdAt,
                                ).toLocaleDateString()}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                {new Date(
                                    item.listing.createdAt,
                                ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                    </div>

                    {item.listing.description && (
                        <div className="mt-5 border-t border-slate-100 pt-4">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Description
                            </p>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                {item.listing.description}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Image analysis */}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            Image verification
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                            Automated checks for submitted vehicle images.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={detailLoading}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-[#1491FF]/40 hover:text-[#0877D9] disabled:opacity-50"
                    >
                        <RefreshCw
                            size={14}
                            className={detailLoading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>
                </div>

                <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
                    {[
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
                    ].map((stat) => (
                        <div key={stat.label} className="p-3 text-center">
                            <p className={`text-lg font-bold ${stat.color}`}>
                                {stat.value}
                            </p>

                            <p className="mt-0.5 text-[10px] text-slate-500">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>

                {sortedImages.length ? (
                    <div className="grid grid-cols-2 gap-3 p-4 xl:grid-cols-3">
                        {sortedImages.map((image) => {
                            const status = imageStatus(
                                image.imageCheckStatus,
                            );

                            const src = imageUrl(
                                item.listing.id,
                                image.id,
                            );

                            return (
                                <article
                                    key={image.id}
                                    className="overflow-hidden rounded-lg border border-slate-200"
                                >
                                    <div className="relative aspect-[4/3] bg-slate-50">
                                        {src ? (
                                            <img
                                                src={src}
                                                alt={
                                                    image.originalName ??
                                                    "Vehicle image"
                                                }
                                                loading="lazy"
                                                onError={(event) => {
                                                    event.currentTarget.style.display = "none";
                                                }}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
                                                <ImageIcon size={25} />

                                                <span className="max-w-[90%] truncate text-[10px]">
                                                    {image.originalName ??
                                                        "Image unavailable"}
                                                </span>
                                            </div>
                                        )}

                                        <span
                                            className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-md border bg-white/95 px-2 py-1 text-[10px] font-semibold shadow-sm ${status.className}`}
                                        >
                                            <status.Icon size={11} />
                                            {status.label}
                                        </span>
                                    </div>

                                    <div className="space-y-2 p-3">
                                        <p className="truncate text-xs font-semibold text-slate-700">
                                            {image.originalName ??
                                                `Image ${image.sortOrder + 1}`}
                                        </p>

                                        <p className="line-clamp-2 text-[11px] leading-4 text-slate-500">
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
                                            <p className="break-all rounded-md bg-amber-50 p-2 text-[10px] text-amber-800">
                                                Possible duplicate listing:{" "}
                                                {image.matchedListingId}
                                            </p>
                                        )}

                                        {image.matchedImageId && (
                                            <p className="break-all text-[10px] text-slate-400">
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
                            size={28}
                            className="mx-auto text-slate-300"
                        />

                        <p className="mt-2 text-sm font-semibold text-slate-700">
                            No listing images
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            Approval is unavailable without images.
                        </p>
                    </div>
                )}

                {!canApprove(item) && (
                    <div className="border-t border-amber-100 bg-amber-50/70 px-5 py-3">
                        <p className="text-xs text-amber-800">
                            All submitted images must pass verification before
                            this listing can be approved.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Desktop moderation view
|--------------------------------------------------------------------------
*/

export function AdminListingsDesktop(p: ModerationViewProps) {
    return (
        <main className="min-w-0 space-y-5 p-6 text-slate-900 xl:p-8">
            {/* Header */}

            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#0877D9]">
                        <ShieldCheck size={15} />
                        Marketplace moderation
                    </div>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                        Listing review
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Review vehicle listings before they go live.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={p.onRefreshQueue}
                    disabled={p.loading}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#1491FF] px-4 text-sm font-semibold text-white transition hover:bg-[#0877D9] disabled:opacity-50"
                >
                    <RefreshCw
                        size={15}
                        className={p.loading ? "animate-spin" : ""}
                    />
                    Refresh queue
                </button>
            </header>

            <Feedback
                message={p.notice}
                error={false}
            />

            <Feedback
                message={p.error}
                error
                onDismiss={() => p.setError("")}
                onRetry={p.onRefreshQueue}
            />

            {/* Workspace */}

            <div className="grid min-w-0 gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
                {/* Queue */}

                <section className="h-fit overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 p-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-900">
                                Pending listings
                            </h2>

                            <span className="rounded-md bg-[#EAF5FF] px-2.5 py-1 text-xs font-bold text-[#0877D9]">
                                {p.items.length}
                            </span>
                        </div>

                        <label className="mt-4 flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 transition focus-within:border-[#1491FF] focus-within:ring-2 focus-within:ring-[#1491FF]/10">
                            <Search size={15} className="text-slate-400" />

                            <input
                                value={p.search}
                                onChange={(e) => p.setSearch(e.target.value)}
                                placeholder="Search listings..."
                                className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400"
                            />
                        </label>
                    </div>

                    <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                        {p.loading ? (
                            <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500">
                                <LoaderCircle
                                    size={17}
                                    className="animate-spin"
                                />
                                Loading listings...
                            </div>
                        ) : p.filteredItems.length ? (
                            p.filteredItems.map((item) => (
                                <QueueItem
                                    key={item.listing.id}
                                    item={item}
                                    active={
                                        p.selectedId === item.listing.id
                                    }
                                    onClick={() =>
                                        p.onSelect(item.listing.id)
                                    }
                                />
                            ))
                        ) : (
                            <div className="px-5 py-12 text-center">
                                <ShieldCheck
                                    size={28}
                                    className="mx-auto text-[#1491FF]"
                                />

                                <p className="mt-3 text-sm font-semibold text-slate-800">
                                    {p.items.length
                                        ? "No matching listings"
                                        : "Queue is clear"}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    {p.items.length
                                        ? "Try a different search."
                                        : "New submissions will appear here."}
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Selected listing */}

                <div className="min-w-0 space-y-5">
                    {p.selected ? (
                        <>
                            <ListingDetails
                                item={p.selected}
                                detailLoading={p.detailLoading}
                                onRefresh={p.onRefreshSelected}
                            />

                            <section className="rounded-xl border border-slate-200 bg-white p-5">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Moderation decision
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Approve a verified listing or provide a
                                        reason for rejection.
                                    </p>
                                </div>

                                <textarea
                                    value={p.rejectionReason}
                                    onChange={(e) =>
                                        p.setRejectionReason(e.target.value)
                                    }
                                    rows={3}
                                    maxLength={2000}
                                    placeholder="Explain what needs to be corrected..."
                                    className="mt-4 w-full resize-y rounded-lg border border-slate-200 p-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#1491FF] focus:ring-2 focus:ring-[#1491FF]/10"
                                />

                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={p.onApprove}
                                        disabled={
                                            p.actionLoading ||
                                            !canApprove(p.selected)
                                        }
                                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#1491FF] px-5 text-sm font-semibold text-white transition hover:bg-[#0877D9] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {p.actionLoading ? (
                                            <LoaderCircle
                                                size={16}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <CheckCircle2 size={16} />
                                        )}

                                        Approve listing
                                    </button>

                                    <button
                                        type="button"
                                        onClick={p.onReject}
                                        disabled={
                                            p.actionLoading ||
                                            p.rejectionReason.trim().length < 5
                                        }
                                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <XCircle size={16} />
                                        Reject listing
                                    </button>
                                </div>
                            </section>
                        </>
                    ) : (
                        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#1491FF]">
                                <ShieldCheck size={24} />
                            </div>

                            <h3 className="mt-4 text-sm font-bold text-slate-900">
                                Select a listing to review
                            </h3>

                            <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                                Choose a submission from the pending queue to
                                inspect its details and image verification.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}