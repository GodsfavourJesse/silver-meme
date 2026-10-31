"use client";

import { useMemo } from "react";

import {
    EditorError,
    EditorLoading,
    ImageFailureDialog,
    ListingEditorViewProps,
} from "./listing-editor.shared";
import { useListingEditor } from "@/app/hooks/user/listings/useListingEditor";
import ListingEditorDesktop from "./ListingEditorDesktop";
import ListingEditorMobile from "./ListingEditorMobile";

interface ListingEditorProps {
    listingId: string;
}

export default function ListingEditor({
    listingId,
}: ListingEditorProps) {
    const state = useListingEditor(listingId);

    const viewProps: ListingEditorViewProps = useMemo(
        () => ({
            editor: state.editor,
            isLoading: state.isLoading,
            isSubmitting: state.isSubmitting,
            error: state.error,
            success: state.success,
            setError: state.setError,
            imageFailureModalOpen: state.imageFailureModalOpen,
            setImageFailureModalOpen: state.setImageFailureModalOpen,
            loadListing: state.loadListing,
            handleImagesChange: state.handleImagesChange,
            handleSubmitForReview: state.handleSubmitForReview,
            imageSummary: state.imageSummary,
            editable: state.editable,
            titleComplete: state.titleComplete,
            descriptionComplete: state.descriptionComplete,
            hasImages: state.hasImages,
            imageChecksComplete: state.imageChecksComplete,
            submitAllowed: state.submitAllowed,
            location: state.location,
        }),
        [state],
    );

    if (state.isLoading && !state.editor) {
        return <EditorLoading />;
    }

    if (!state.editor) {
        return (
            <EditorError
                error={state.error}
                onRetry={state.loadListing}
            />
        );
    }

    return (
        <>
            <div className="hidden lg:block">
                <ListingEditorDesktop {...viewProps} />
            </div>

            <div className="lg:hidden">
                <ListingEditorMobile {...viewProps} />
            </div>

            <ImageFailureDialog
                open={state.imageFailureModalOpen}
                images={state.editor.images}
                onClose={() => state.setImageFailureModalOpen(false)}
            />
        </>
    );
}