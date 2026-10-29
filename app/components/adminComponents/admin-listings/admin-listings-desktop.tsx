"use client";

import {
    AlertTriangle,
    CheckCircle2,
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
 * QUEUE ITEM
 * ============================================================
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
            onClick={onClick}
            type="button"
            className={`mb-1 w-full rounded-xl border p-4 text-left transition ${active ? "border-[#7008E7]/30 bg-[#7008E7]/[0.06]" : "border-transparent hover:bg-slate-50"}`}
        >
            <div className="flex items-start justify-between gap-3">
                <p className="line-clamp-2 text-sm font-bold text-slate-900">
                    {item.listing.title}
                </p>
                <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
                    Pending
                </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
                {vehicleLabel(item) || "Vehicle details unavailable"}
            </p>
            <div className="mt-3 flex justify-between gap-2 text-xs">
                <span className="font-semibold">
                    {formatMoney(item.listing.price, item.listing.currency)}
                </span>
                <span className="text-slate-500">
                    {counts.passed}/{counts.total} images passed
                </span>
            </div>
        </button>
    );
}

/*
 * ============================================================
 * LISTING DETAILS
 * ============================================================
 */

function Details({ p }: { p: ModerationViewProps }) {
    const { selected, detailLoading, onRefreshSelected } = p;
    if (!selected)
        return (
            <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                Select a listing from the queue to inspect its details.
            </div>
        );
    const counts = imageCounts(selected);
    return (
        <>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#7008E7]">
                    Listing details
                </p>
                <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-slate-950">
                            {selected.listing.title}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {vehicleLabel(selected) ||
                                "Vehicle details unavailable"}
                        </p>
                    </div>
                    <p className="text-xl font-extrabold">
                        {formatMoney(
                            selected.listing.price,
                            selected.listing.currency,
                        )}
                    </p>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase text-slate-500">
                            Seller
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                            {[
                                selected.seller?.firstName,
                                selected.seller?.lastName,
                            ]
                                .filter(Boolean)
                                .join(" ") || "Seller"}
                        </p>
                        <p className="mt-1 break-all text-xs text-slate-500">
                            {selected.seller?.email ??
                                selected.listing.sellerId}
                        </p>
                        {selected.seller?.accountType && (
                            <p className="mt-1 text-xs text-slate-500">
                                Account: {selected.seller.accountType}
                            </p>
                        )}
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase text-slate-500">
                            Submitted
                        </p>
                        <p className="mt-1 text-sm">
                            {new Date(
                                selected.listing.createdAt,
                            ).toLocaleString()}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            {[selected.listing.city, selected.listing.state]
                                .filter(Boolean)
                                .join(", ") || "Location not supplied"}
                        </p>
                    </div>
                </div>
                <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {selected.listing.description || "No description supplied."}
                </p>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="font-bold">Image intelligence</h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Approval requires every image to pass.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onRefreshSelected}
                        disabled={detailLoading}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold hover:border-[#7008E7]/40 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={13}
                            className={detailLoading ? "animate-spin" : ""}
                        />{" "}
                        Refresh scan
                    </button>
                </div>
                {selected.images.length ? (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        {selected.images
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
                                        <div className="flex h-44 items-center justify-center bg-slate-50">
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
                                                        className="mx-auto"
                                                        size={24}
                                                    />
                                                    <p className="mt-2 max-w-48 truncate text-xs">
                                                        {image.originalName ??
                                                            image.objectKey}
                                                    </p>
                                                    <p className="mt-1 text-[10px]">
                                                        Storage URL not
                                                        configured
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-3 p-4">
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
                    <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                        No listing images found. Approval is blocked.
                    </p>
                )}
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold">Image-check summary</p>
                    <p className="mt-2 text-xs text-slate-500">
                        {counts.passed} passed · {counts.pending} pending ·{" "}
                        {counts.review} review · {counts.failed} failed
                    </p>
                    {!canApprove(selected) && (
                        <p className="mt-2 text-xs text-amber-700">
                            Approval remains disabled until every image has
                            passed.
                        </p>
                    )}
                </div>
            </section>
        </>
    );
}

/*
 * ============================================================
 * ADMIN LISTINGS (DESKTOP)
 * ============================================================
 */

export function AdminListingsDesktop(p: ModerationViewProps) {
    return (
        <main className="space-y-6 text-slate-900 p-10">
            <header className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-[#7008E7]/10 bg-gradient-to-r from-[#7008E7]/[.08] via-white to-white p-6">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[.28em] text-[#7008E7]">
                        Marketplace moderation
                    </p>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
                        Listing review
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Review vehicle submissions and automated image checks
                        before deciding.
                    </p>
                </div>
                <button
                    onClick={p.onRefreshQueue}
                    disabled={p.loading}
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-[#7008E7] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#5D06C4] disabled:opacity-50"
                >
                    <RefreshCw
                        size={15}
                        className={p.loading ? "animate-spin" : ""}
                    />{" "}
                    Refresh queue
                </button>
            </header>
            {p.notice && (
                <div
                    role="status"
                    className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
                >
                    {p.notice}
                </div>
            )}
            {p.error && (
                <div
                    role="alert"
                    className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                >
                    <AlertTriangle size={18} />
                    <p className="flex-1">{p.error}</p>
                    <button
                        onClick={p.onRefreshQueue}
                        type="button"
                        className="font-bold underline"
                    >
                        Retry
                    </button>
                    <button
                        onClick={() => p.setError("")}
                        type="button"
                        aria-label="Dismiss"
                    >
                        ×
                    </button>
                </div>
            )}
            <div className="grid gap-5 xl:grid-cols-[minmax(290px,.8fr)_minmax(0,1.7fr)]">
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 p-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold">Awaiting review</h2>
                            <span className="rounded-full bg-[#7008E7]/10 px-2.5 py-1 text-xs font-bold text-[#7008E7]">
                                {p.items.length}
                            </span>
                        </div>
                        <label className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-[#7008E7]/50">
                            <Search size={16} className="text-slate-400" />
                            <input
                                value={p.search}
                                onChange={(e) => p.setSearch(e.target.value)}
                                placeholder="Search title, seller or vehicle"
                                className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"
                            />
                        </label>
                    </div>
                    <div className="max-h-[72vh] overflow-y-auto p-2">
                        {p.loading ? (
                            <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500">
                                <LoaderCircle
                                    className="animate-spin"
                                    size={17}
                                />
                                Loading queue…
                            </div>
                        ) : p.filteredItems.length ? (
                            p.filteredItems.map((item) => (
                                <QueueItem
                                    key={item.listing.id}
                                    item={item}
                                    active={p.selectedId === item.listing.id}
                                    onClick={() => p.onSelect(item.listing.id)}
                                />
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <ShieldCheck
                                    size={28}
                                    className="mx-auto text-[#7008E7]"
                                />
                                <p className="mt-3 text-sm font-semibold">
                                    {p.items.length
                                        ? "No matches found"
                                        : "Review queue is clear"}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    {p.items.length
                                        ? "Try another search."
                                        : "New submissions will appear here."}
                                </p>
                            </div>
                        )}
                    </div>
                </section>
                <div className="min-w-0 space-y-5">
                    <Details p={p} />
                    {p.selected && (
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="font-bold">Moderation decision</h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Rejection requires a clear reason for the
                                seller.
                            </p>
                            <label className="mt-4 block text-xs font-semibold text-slate-600">
                                Rejection reason
                                <textarea
                                    value={p.rejectionReason}
                                    onChange={(e) =>
                                        p.setRejectionReason(e.target.value)
                                    }
                                    rows={3}
                                    maxLength={2000}
                                    placeholder="Explain what needs to be corrected…"
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-normal outline-none focus:border-[#7008E7]/50"
                                />
                            </label>
                            <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={p.onApprove}
                                    disabled={
                                        p.actionLoading ||
                                        !canApprove(p.selected)
                                    }
                                    className="inline-flex items-center gap-2 rounded-full bg-[#7008E7] px-5 py-3 text-sm font-bold text-white hover:bg-[#5D06C4] disabled:cursor-not-allowed disabled:opacity-40"
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
                                    className="inline-flex items-center gap-2 rounded-full border border-red-200 px-5 py-3 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-40"
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
                    )}
                </div>
            </div>
        </main>
    );
}