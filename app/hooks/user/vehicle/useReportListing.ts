"use client";

import { useCallback, useState, type FormEvent } from "react";

import { reportMarketplaceListing } from "@/app/services/user/marketplace/marketplace.service";
import type { VehicleReportReason } from "@/app/types/user/vehicle-details.types";
import { getErrorMessage, isAuthenticationError } from "@/app/lib/user/vehicle/vehicle-details-format";

export function useReportListing(listingId: string | null) {
    const [reason, setReason] = useState<VehicleReportReason>("SCAM_OR_FRAUD");
    const [details, setDetails] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const clearStatus = useCallback(() => {
        setError("");
        setSuccess("");
    }, []);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!listingId || loading) {
            return;
        }

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await reportMarketplaceListing(listingId, {
                reason,
                ...(details.trim() ? { details: details.trim() } : {}),
            });

            setSuccess(
                "Thank you. Your report has been submitted for review.",
            );

            setDetails("");
        } catch (caught) {
            if (isAuthenticationError(caught)) {
                setError("Sign in to report this listing.");
            } else {
                setError(getErrorMessage(caught));
            }
        } finally {
            setLoading(false);
        }
    }

    return {
        reason,
        setReason,
        details,
        setDetails,
        loading,
        error,
        success,
        clearStatus,
        submit,
    };
}

export type ReportListingState = ReturnType<typeof useReportListing>;