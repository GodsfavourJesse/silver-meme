"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminAuthGuard } from "@/app/components/adminComponents/admin-auth-guard";
import { adminFetch } from "@/app/lib/admin/admin-fetch";
import { AdminListingsDesktop } from "./admin-listings-desktop";
import { AdminListingsMobile } from "./admin-listings-mobile";
import { PendingListing } from "./admin-listings.types";

export function AdminListingsView() {
    /*
     * ============================================================
     * STATE
     * ============================================================
     */

    const [items, setItems] = useState<PendingListing[]>([]);
    const [selectedId, setSelectedId] = useState("");
    const [search, setSearch] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    /*
     * ============================================================
     * DERIVED DATA
     * ============================================================
     */

    const selected = useMemo(
        () => items.find((i) => i.listing.id === selectedId) ?? null,
        [items, selectedId],
    );
    const hasPending =
        selected?.images.some((i) => i.imageCheckStatus === "PENDING") ?? false;
    const filteredItems = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return items;
        return items.filter((item) =>
            [
                item.listing.title,
                item.listing.id,
                item.seller?.email,
                vehicleLabelForSearch(item),
            ].some((value) =>
                String(value ?? "")
                    .toLowerCase()
                    .includes(term),
            ),
        );
    }, [items, search]);

    /*
     * ============================================================
     * DATA LOADING
     * ============================================================
     */

    const loadPending = useCallback(async (preferredId?: string) => {
        setLoading(true);
        setError("");
        try {
            const response = await adminFetch<{ listings: PendingListing[] }>(
                "/listings/moderation/pending",
            );
            const next = response.data?.listings ?? [];
            setItems(next);
            setSelectedId(
                preferredId && next.some((i) => i.listing.id === preferredId)
                    ? preferredId
                    : (next[0]?.listing.id ?? ""),
            );
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "Unable to load listings awaiting review.",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshSelected = useCallback(async () => {
        if (!selectedId) return loadPending();
        setDetailLoading(true);
        setError("");
        try {
            const response = await adminFetch<{ listing: PendingListing }>(
                `/listings/moderation/${encodeURIComponent(selectedId)}`,
            );
            if (response.data?.listing)
                setItems((current) =>
                    current.map((i) =>
                        i.listing.id === selectedId
                            ? response.data!.listing
                            : i,
                    ),
                );
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "Unable to refresh listing analysis.",
            );
        } finally {
            setDetailLoading(false);
        }
    }, [loadPending, selectedId]);

    useEffect(() => {
        void loadPending();
    }, [loadPending]);

    /*
     * Poll the selected listing every 10 seconds while any of its
     * images is still waiting for analysis.
     */
    useEffect(() => {
        if (!selectedId || !hasPending) return;
        const timer = window.setInterval(() => {
            void adminFetch<{ listing: PendingListing }>(
                `/listings/moderation/${encodeURIComponent(selectedId)}`,
            )
                .then((response) => {
                    if (response.data?.listing)
                        setItems((current) =>
                            current.map((i) =>
                                i.listing.id === selectedId
                                    ? response.data!.listing
                                    : i,
                            ),
                        );
                })
                .catch(() => {});
        }, 10000);
        return () => window.clearInterval(timer);
    }, [selectedId, hasPending]);

    /*
     * ============================================================
     * MODERATION ACTIONS
     * ============================================================
     */

    async function approve() {
        if (
            !selected ||
            !selected.images.length ||
            !selected.images.every((i) => i.imageCheckStatus === "PASSED")
        )
            return;
        setActionLoading(true);
        setError("");
        setNotice("");
        try {
            const response = await adminFetch<{ listing: { id: string } }>(
                `/listings/moderation/${encodeURIComponent(selected.listing.id)}/approve`,
                { method: "POST", body: {} },
            );
            setNotice(response.message ?? "Listing approved and published.");
            await loadPending();
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "Listing approval failed.",
            );
            await refreshSelected();
        } finally {
            setActionLoading(false);
        }
    }

    async function reject() {
        if (!selected || rejectionReason.trim().length < 5) return;
        setActionLoading(true);
        setError("");
        setNotice("");
        try {
            const response = await adminFetch<{ listing: { id: string } }>(
                `/listings/moderation/${encodeURIComponent(selected.listing.id)}/reject`,
                { method: "POST", body: { reason: rejectionReason.trim() } },
            );
            setNotice(response.message ?? "Listing rejected.");
            setRejectionReason("");
            await loadPending();
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "Listing rejection failed.",
            );
        } finally {
            setActionLoading(false);
        }
    }

    /*
     * ============================================================
     * VIEW PROPS
     * ============================================================
     */

    const props = {
        items,
        filteredItems,
        selected,
        selectedId,
        search,
        rejectionReason,
        loading,
        detailLoading,
        actionLoading,
        error,
        notice,
        setSearch,
        setRejectionReason,
        setError,
        onSelect: (id: string) => {
            setSelectedId(id);
            setError("");
            setRejectionReason("");
        },
        onRefreshQueue: () => void loadPending(selectedId),
        onRefreshSelected: () => void refreshSelected(),
        onApprove: () => void approve(),
        onReject: () => void reject(),
    };

    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (
        <AdminAuthGuard>
            <div className="min-w-0">
                <div className="hidden lg:block">
                    <AdminListingsDesktop {...props} />
                </div>
                <div className="lg:hidden">
                    <AdminListingsMobile {...props} />
                </div>
            </div>
        </AdminAuthGuard>
    );
}

function vehicleLabelForSearch(item: PendingListing) {
    return [
        item.vehicleVariant?.year,
        item.vehicleMake?.name,
        item.vehicleModel?.name,
        item.vehicleGeneration?.name,
        item.vehicleVariant?.name,
    ]
        .filter(Boolean)
        .join(" ");
}