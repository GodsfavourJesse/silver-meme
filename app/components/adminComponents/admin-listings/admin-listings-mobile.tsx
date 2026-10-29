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
import { ModerationViewProps, PendingListing } from "./admin-listings.types";

/*
 * ============================================================
 * QUEUE CARD
 * ============================================================
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
            className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm active:scale-[.99]"
        >
            <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#7008E7]/10 text-[#7008E7]">
                    <ShieldCheck size={21} />
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 text-sm font-bold">
                            {item.listing.title}
                        </h3>
                        <ChevronRight
                            size={18}
                            className="shrink-0 text-slate-400"
                        />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                        {vehicleLabel(item) || "Vehicle details unavailable"}
                    </p>
                </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <b className="text-sm">
                    {formatMoney(item.listing.price, item.listing.currency)}
                </b>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                    Pending review
                </span>
            </div>
            <p className="mt-3 flex justify-between text-xs text-slate-500">
                <span>{counts.total} image(s)</span>
                <span>
                    {counts.passed}/{counts.total} passed
                </span>
            </p>
        </button>
    );
}

/*
 * ============================================================
 * LISTING DETAILS
 * ============================================================
 */

function MobileDetails({ p }: { p: ModerationViewProps }) {
    const item = p.selected;
    if (!item) return null;
    const counts = imageCounts(item);
    return (
        <>
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#7008E7]">
                    Listing details
                </p>
                <h2 className="mt-2 text-lg font-extrabold">
                    {item.listing.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    {vehicleLabel(item) || "Vehicle details unavailable"}
                </p>
                <p className="mt-4 text-2xl font-extrabold text-[#7008E7]">
                    {formatMoney(item.listing.price, item.listing.currency)}
                </p>
                <div className="mt-4 grid gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase text-slate-500">
                            Seller
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                            {[item.seller?.firstName, item.seller?.lastName]
                                .filter(Boolean)
                                .join(" ") || "Seller"}
                        </p>
                        <p className="mt-1 break-all text-xs text-slate-500">
                            {item.seller?.email ?? item.listing.sellerId}
                        </p>
                        {item.seller?.accountType && (
                            <p className="mt-1 text-xs text-slate-500">
                                Account: {item.seller.accountType}
                            </p>
                        )}
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase text-slate-500">
                            Submitted
                        </p>
                        <p className="mt-1 text-sm">
                            {new Date(item.listing.createdAt).toLocaleString()}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            {[item.listing.city, item.listing.state]
                                .filter(Boolean)
                                .join(", ") || "Location not supplied"}
                        </p>
                    </div>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {item.listing.description || "No description supplied."}
                </p>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="font-bold">Image intelligence</h2>
                        <p className="mt-1 text-xs text-slate-500">
                            All images must pass before approval.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={p.onRefreshSelected}
                        disabled={p.detailLoading}
                        aria-label="Refresh image scan"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-[#7008E7]"
                    >
                        <RefreshCw
                            size={15}
                            className={p.detailLoading ? "animate-spin" : ""}
                        />
                    </button>
                </div>
                {item.images.length ? (
                    <div className="mt-4 space-y-3">
                        {item.images
                            .slice()
                            .sort((a, b) => a.sortOrder - b.sortOrder)
                            .map((image) => {
                                const status = imageStatus(
                                    image.imageCheckStatus,
                                );
                                const src = imageUrl(image.objectKey);
                                return (
                                    <article
                                        key={image.id}
                                        className="overflow-hidden rounded-xl border border-slate-200"
                                    >
                                        <div className="flex h-52 items-center justify-center bg-slate-50">
                                            {src ? (
                                                <img
                                                    src={src}
                                                    alt={
                                                        image.originalName ??
                                                        "Listing image"
                                                    }
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-center text-slate-400">
                                                    <ImageIcon
                                                        size={24}
                                                        className="mx-auto"
                                                    />
                                                    <p className="mt-2 max-w-60 truncate text-xs">
                                                        {image.originalName ??
                                                            image.objectKey}
                                                    </p>
                                                    <p className="text-[10px]">
                                                        Storage URL not
                                                        configured
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-3 p-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="truncate text-xs font-semibold">
                                                    {image.originalName ??
                                                        `Image ${image.sortOrder + 1}`}
                                                </p>
                                                <span
                                                    className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${status.className}`}
                                                >
                                                    <status.Icon size={12} />
                                                    {status.label}
                                                </span>
                                            </div>
                                            <p className="text-xs leading-5 text-slate-500">
                                                {image.checkReason ||
                                                    (image.imageCheckStatus ===
                                                    "PASSED"
                                                        ? "Automated image checks passed."
                                                        : "Waiting for analysis details.")}
                                            </p>
                                            {image.similarityScore != null && (
                                                <p className="text-xs">
                                                    Similarity score:{" "}
                                                    <b>
                                                        {image.similarityScore}
                                                    </b>
                                                </p>
                                            )}
                                            {image.matchedListingId && (
                                                <p className="break-all rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
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
                    <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                        No images found. Approval is blocked.
                    </p>
                )}
                <div className="mt-4 rounded-xl bg-slate-50 p-3">
                    <p className="text-sm font-bold">Image-check summary</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        {[
                            ["Passed", counts.passed, "text-emerald-700"],
                            ["Pending", counts.pending, "text-sky-700"],
                            ["Review", counts.review, "text-amber-700"],
                            ["Failed", counts.failed, "text-red-700"],
                        ].map(([label, value, color]) => (
                            <div
                                key={String(label)}
                                className="rounded-lg bg-white p-3"
                            >
                                <p className="text-[10px] text-slate-500">
                                    {label}
                                </p>
                                <p
                                    className={`mt-1 text-lg font-extrabold ${color}`}
                                >
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>
                    {!canApprove(item) && (
                        <p className="mt-3 text-xs text-amber-700">
                            Approval is blocked until every image has passed.
                        </p>
                    )}
                </div>
            </section>
        </>
    );
}

/*
 * ============================================================
 * ADMIN LISTINGS (MOBILE)
 * ============================================================
 */

export function AdminListingsMobile(p: ModerationViewProps) {
    return (
        <main className="space-y-4 pb-6 text-slate-900 p-6">
            <header className="rounded-2xl bg-gradient-to-br from-[#7008E7] to-[#4C05A8] p-5 text-white shadow-lg shadow-[#7008E7]/15">
                {p.selected && (
                    <button
                        type="button"
                        onClick={() => p.onSelect("")}
                        className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-white/80"
                    >
                        <ArrowLeft size={15} />
                        Back to queue
                    </button>
                )}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[.24em] text-white/70">
                            Marketplace moderation
                        </p>
                        <h1 className="mt-2 text-2xl font-extrabold">
                            {p.selected ? "Review listing" : "Listing review"}
                        </h1>
                        <p className="mt-2 text-xs leading-5 text-white/75">
                            {p.selected
                                ? "Inspect details and image checks before deciding."
                                : "Review new vehicle submissions."}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={p.onRefreshQueue}
                        disabled={p.loading}
                        aria-label="Refresh queue"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10"
                    >
                        <RefreshCw
                            size={16}
                            className={p.loading ? "animate-spin" : ""}
                        />
                    </button>
                </div>
                {!p.selected && (
                    <div className="mt-5 rounded-xl border border-white/15 bg-white/10 p-4">
                        <p className="text-xs text-white/70">
                            Listings awaiting review
                        </p>
                        <p className="mt-1 text-3xl font-extrabold">
                            {p.items.length}
                        </p>
                    </div>
                )}
            </header>
            {p.notice && (
                <div
                    role="status"
                    className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
                >
                    {p.notice}
                </div>
            )}
            {p.error && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                >
                    <div className="flex items-start gap-2">
                        <AlertTriangle size={17} />
                        <p className="flex-1">{p.error}</p>
                        <button
                            type="button"
                            onClick={() => p.setError("")}
                            aria-label="Dismiss error"
                        >
                            ×
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={p.onRefreshQueue}
                        className="mt-2 text-xs font-bold underline"
                    >
                        Try again
                    </button>
                </div>
            )}
            {p.selected ? (
                <div className="space-y-4">
                    <MobileDetails p={p} />
                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <h2 className="font-bold">Moderation decision</h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Provide a clear reason when rejecting.
                        </p>
                        <label className="mt-4 block text-xs font-semibold text-slate-600">
                            Rejection reason
                            <textarea
                                value={p.rejectionReason}
                                onChange={(e) =>
                                    p.setRejectionReason(e.target.value)
                                }
                                rows={4}
                                maxLength={2000}
                                placeholder="Explain what needs to be corrected…"
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-normal outline-none focus:border-[#7008E7]/50"
                            />
                        </label>
                        <div className="mt-4 grid gap-2">
                            <button
                                type="button"
                                onClick={p.onApprove}
                                disabled={
                                    p.actionLoading || !canApprove(p.selected)
                                }
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#7008E7] px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
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
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-700 disabled:opacity-40"
                            >
                                {p.actionLoading ? (
                                    <LoaderCircle
                                        size={16}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <XCircle size={16} />
                                )}
                                Reject listing
                            </button>
                        </div>
                    </section>
                </div>
            ) : (
                <section className="space-y-3">
                    <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm focus-within:border-[#7008E7]/50">
                        <Search size={16} className="text-slate-400" />
                        <input
                            value={p.search}
                            onChange={(e) => p.setSearch(e.target.value)}
                            placeholder="Search title, seller or vehicle"
                            className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
                        />
                    </label>
                    {p.loading ? (
                        <div className="flex items-center justify-center gap-2 rounded-2xl border bg-white p-10 text-sm text-slate-500">
                            <LoaderCircle size={17} className="animate-spin" />
                            Loading queue…
                        </div>
                    ) : p.filteredItems.length ? (
                        p.filteredItems.map((item) => (
                            <QueueCard
                                key={item.listing.id}
                                item={item}
                                onClick={() => p.onSelect(item.listing.id)}
                            />
                        ))
                    ) : (
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                            <ShieldCheck
                                size={30}
                                className="mx-auto text-[#7008E7]"
                            />
                            <p className="mt-3 text-sm font-bold">
                                {p.items.length
                                    ? "No matches found"
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
            )}
        </main>
    );
}