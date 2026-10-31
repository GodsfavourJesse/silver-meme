"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
    getSellerListingDetail,
    submitSellerListing,
} from "@/app/services/user/listings/listing.service";

import { ListingRecord } from "@/app/types/user/listings/listing.types";
import { ListingImageRecord } from "@/app/types/user/listings/listing-image.types";

export interface EditorState {
    listing: ListingRecord;
    images: ListingImageRecord[];
}

export interface ImageSummary {
    passed: number;
    review: number;
    failed: number;
    pending: number;
}

export function getImageSummary(
    images: ListingImageRecord[],
): ImageSummary {
    return images.reduce<ImageSummary>(
        (summary, image) => {
            switch (image.imageCheckStatus) {
                case "PASSED":
                    summary.passed++;
                    break;

                case "REVIEW":
                    summary.review++;
                    break;

                case "FAILED":
                    summary.failed++;
                    break;

                default:
                    summary.pending++;
                    break;
            }

            return summary;
        },
        {
            passed: 0,
            review: 0,
            failed: 0,
            pending: 0,
        },
    );
}

export function canSubmitListing(status: string) {
    return ["DRAFT", "REJECTED"].includes(status);
}

export function useListingEditor(listingId: string) {
    const [editor, setEditor] = useState<EditorState | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [imageFailureModalOpen, setImageFailureModalOpen] =
        useState(false);

    const loadListing = useCallback(async () => {
        try {
            setIsLoading(true);
            setError("");

            const response = await getSellerListingDetail(listingId);

            if (!response?.success || !response?.data?.listing?.id) {
                throw new Error(
                    response?.message || "Unable to load this listing.",
                );
            }

            setEditor({
                listing: response.data.listing,
                images: Array.isArray(response.data.images)
                    ? response.data.images
                    : [],
            });
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Something went wrong while loading your listing.";

            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [listingId]);

    useEffect(() => {
        void loadListing();
    }, [loadListing]);

    const handleImagesChange = useCallback(
        (images: ListingImageRecord[]) => {
            setEditor((current) => {
                if (!current) return current;

                return {
                    ...current,
                    images,
                };
            });
        },
        [],
    );

    const imageSummary = useMemo(
        () => getImageSummary(editor?.images ?? []),
        [editor?.images],
    );

    const editable = useMemo(
        () =>
            editor
                ? canSubmitListing(editor.listing.status)
                : false,
        [editor],
    );

    const titleComplete = useMemo(
        () =>
            typeof editor?.listing.title === "string" &&
            editor.listing.title.trim().length >= 5,
        [editor?.listing.title],
    );

    const descriptionComplete = useMemo(
        () =>
            typeof editor?.listing.description === "string" &&
            editor.listing.description.trim().length >= 10,
        [editor?.listing.description],
    );

    const hasImages = (editor?.images.length ?? 0) > 0;

    const imageChecksComplete =
        hasImages &&
        imageSummary.pending === 0 &&
        imageSummary.failed === 0;

    const submitAllowed =
        !!editor &&
        canSubmitListing(editor.listing.status) &&
        !isSubmitting;

    const location = useMemo(() => {
        if (!editor) return "";

        const listing = editor.listing;

        return [
            listing.city,
            listing.state,
            listing.country,
        ]
            .filter(Boolean)
            .join(", ");
    }, [editor]);

    const handleSubmitForReview = useCallback(async () => {
        if (!editor || isSubmitting) return;

        setError("");
        setSuccess("");

        if (!editor.images.length) {
            setError("Please upload at least one vehicle photo.");
            return;
        }

        const summary = getImageSummary(editor.images);

        if (summary.pending > 0) {
            setError(
                "Please wait for all uploaded photos to finish their initial checks.",
            );
            return;
        }

        if (summary.failed > 0) {
            setImageFailureModalOpen(true);
            return;
        }

        if (!canSubmitListing(editor.listing.status)) {
            setError(
                "This listing cannot be submitted for review in its current status.",
            );
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await submitSellerListing(listingId);

            if (response && response.success === false) {
                throw new Error(
                    response.message || "Unable to submit your listing.",
                );
            }

            setSuccess("Your listing was submitted for review.");

            await loadListing();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong while submitting your listing.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }, [editor, isSubmitting, listingId, loadListing]);

    return {
        editor,
        isLoading,
        isSubmitting,
        error,
        success,
        setError,
        setSuccess,
        imageFailureModalOpen,
        setImageFailureModalOpen,
        loadListing,
        handleImagesChange,
        handleSubmitForReview,
        imageSummary,
        editable,
        titleComplete,
        descriptionComplete,
        hasImages,
        imageChecksComplete,
        submitAllowed,
        location,
    };
}