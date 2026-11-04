"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
    Sparkles,
} from "lucide-react";

import type {
    ListingStatus,
} from "@/app/types/user/listings/listing.types";

import BoostListingModal from "./BoostListingModal";

// ============================================
// PROPS
// ============================================

interface BoostListingActionProps {
    listingId: string;
    listingTitle: string;

    listingStatus: ListingStatus;

    vehicleImageUrl?: string | null;

    variant?: "mobile" | "desktop";

    onBeforeOpen?: () => void;
}

// ============================================
// COMPONENT
// ============================================

export default function BoostListingAction({
    listingId,
    listingTitle,
    listingStatus,
    vehicleImageUrl,
    variant = "desktop",
    onBeforeOpen,
}: BoostListingActionProps) {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        return () => {
            setMounted(false);
        };
    }, []);

    // Only approved listings can be boosted.
    if (listingStatus !== "APPROVED") {
        return null;
    }

    const handleOpen = () => {
        onBeforeOpen?.();
        setOpen(true);
    };

    const buttonClassName =
        variant === "mobile"
            ? `
                flex min-h-11 w-full items-center gap-3
                rounded-xl px-3 text-left
                text-xs font-semibold text-[#0877D9]
                transition hover:bg-[#EAF5FF]
            `
            : `
                mt-1 flex w-full items-center gap-2
                rounded-lg border-t border-slate-100
                px-3 py-2.5 pt-3 text-left
                text-xs font-semibold text-[#0877D9]
                transition hover:bg-[#F4F9FF]
            `;

    return (
        <>
            <button
                type="button"
                onClick={handleOpen}
                className={buttonClassName}
            >
                <span
                    className="
                        flex size-7 shrink-0 items-center
                        justify-center rounded-lg
                        bg-[#EAF5FF] text-[#1491FF]
                    "
                >
                    <Sparkles size={15} />
                </span>

                <span className="flex-1">
                    Boost this vehicle
                </span>

                <Sparkles
                    size={13}
                    className="text-[#1491FF]"
                />
            </button>

            {mounted &&
                open &&
                createPortal(
                    <BoostListingModal
                        open={open}
                        listingId={listingId}
                        listingTitle={listingTitle}
                        vehicleImageUrl={vehicleImageUrl}
                        onClose={() => setOpen(false)}
                    />,
                    document.body,
                )}
        </>
    );
}