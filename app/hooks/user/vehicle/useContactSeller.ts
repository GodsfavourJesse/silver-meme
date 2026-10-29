"use client";

import { useCallback, useState, type FormEvent } from "react";

import { contactMarketplaceSeller } from "@/app/services/user/marketplace/marketplace.service";
import { getErrorMessage, isAuthenticationError } from "@/app/lib/user/vehicle/vehicle-details-format";

export function useContactSeller(listingId: string | null) {
    const [message, setMessage] = useState("");
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
            const response = await contactMarketplaceSeller(
                listingId,
                message.trim() || undefined,
            );

            setSuccess(
                response.message ??
                    "Your conversation with the seller has been opened.",
            );

            setMessage("");
        } catch (caught) {
            if (isAuthenticationError(caught)) {
                setError(
                    "Sign in to contact the seller and start a conversation.",
                );
            } else {
                setError(getErrorMessage(caught));
            }
        } finally {
            setLoading(false);
        }
    }

    return {
        message,
        setMessage,
        loading,
        error,
        success,
        clearStatus,
        submit,
    };
}

export type ContactSellerState = ReturnType<typeof useContactSeller>;