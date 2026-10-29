"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertCircle,
    CheckCircle2,
    Clock3,
    ExternalLink,
    FileCheck2,
    FileText,
    LoaderCircle,
    ShieldCheck,
    Trash2,
    X,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";

import type {
    DealerDocument,
    DealerDocumentStatus,
} from "@/app/types/user/dealer/dealer.types";
import { useDeleteDealerDocument, useGetDealerDocumentUrl } from "@/app/hooks/user/dealer/useDealer";
import DealerDocumentPreviewModal, { DealerDocumentPreviewData } from "./DealerDocumentPreviewModal";

interface DealerDocumentCardProps {
    document: DealerDocument;
    applicationId: string;
    canDelete: boolean;
}

const STATUS_CONFIG: Record<
    DealerDocumentStatus,
    {
        label: string;
        className: string;
        icon: typeof Clock3;
    }
> = {
    PENDING: {
        label: "Under review",
        className: "bg-amber-50 text-amber-700 border-amber-100",
        icon: Clock3,
    },
    APPROVED: {
        label: "Approved",
        className: "bg-emerald-50 text-emerald-700 border-emerald-100",
        icon: CheckCircle2,
    },
    REJECTED: {
        label: "Rejected",
        className: "bg-red-50 text-red-700 border-red-100",
        icon: XCircle,
    },
};

const DOCUMENT_LABELS: Record<string, string> = {
    BUSINESS_REGISTRATION: "Business registration",
    IDENTITY_DOCUMENT: "Identity document",
    ADDRESS_PROOF: "Proof of business address",
    OTHER: "Supporting document",
};

export default function DealerDocumentCard({
    document,
    applicationId,
    canDelete,
}: DealerDocumentCardProps) {
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    const [previewDocument, setPreviewDocument] = useState<DealerDocumentPreviewData | null>(null);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [previewRetryKey, setPreviewRetryKey] = useState(0);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const urlMutation = useGetDealerDocumentUrl();
    const deleteMutation = useDeleteDealerDocument(applicationId);

    const status =
        STATUS_CONFIG[document.status] ?? STATUS_CONFIG.PENDING;

    const StatusIcon = status.icon;

    const loadDocumentPreview = useCallback(async () => {
        setPreviewError(null);
        setPreviewDocument(null);

        try {
            const response = await urlMutation.mutateAsync(document.id);
            const result = response.data.document;

            if (!result?.url) {
                throw new Error("A document preview link is not available.");
            }

            setPreviewDocument({
                id: document.id,
                url: result.url,
                expiresInSeconds: result.expiresInSeconds,
                mimeType: result.mimeType,
                contentType: result.contentType,
                fileName: result.fileName,
            });
        } catch (error) {
            setPreviewError(
                error instanceof Error
                    ? error.message
                    : "Unable to load this document.",
            );
        }
    }, [document.id, urlMutation.mutateAsync]);

    useEffect(() => {
        if (!isPreviewOpen) return;

        void loadDocumentPreview();
    }, [isPreviewOpen, previewRetryKey, loadDocumentPreview]);

    const handleView = () => {
        setPreviewError(null);
        setPreviewDocument(null);
        setIsPreviewOpen(true);
    };

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(document.id);

            toast.success("Document deleted successfully.");
            setShowDeleteConfirmation(false);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to delete this document.",
            );
        }
    };

    const isOpening = urlMutation.isPending;
    const isDeleting = deleteMutation.isPending;

    return (
        <>
            <motion.article
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-purple-200 hover:shadow-sm sm:p-5"
            >
                <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#7008E7]">
                        <FileText size={23} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className="break-words text-sm font-bold text-slate-900">
                            {DOCUMENT_LABELS[document.documentType] ??
                                document.documentType.replace(/_/g, " ")}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                            Uploaded{" "}
                            {new Date(document.createdAt).toLocaleDateString(
                                undefined,
                                {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                },
                            )}
                        </p>

                        <span
                            className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.className}`}
                        >
                            <StatusIcon size={13} />
                            {status.label}
                        </span>
                    </div>
                </div>

                {document.status === "REJECTED" &&
                    document.rejectionReason && (
                        <div className="mt-4 flex gap-2 rounded-xl border border-red-100 bg-red-50 p-3">
                            <AlertCircle
                                size={17}
                                className="mt-0.5 shrink-0 text-red-600"
                            />

                            <div>
                                <p className="text-xs font-bold text-red-700">
                                    Review feedback
                                </p>

                                <p className="mt-1 break-words text-xs leading-5 text-red-600">
                                    {document.rejectionReason}
                                </p>
                            </div>
                        </div>
                    )}

                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    <button
                        type="button"
                        onClick={handleView}
                        disabled={isOpening || isDeleting}
                        className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-purple-50 px-3 py-2 text-xs font-bold text-[#7008E7] transition hover:bg-purple-100 disabled:opacity-50"
                    >
                        {isOpening ? (
                            <LoaderCircle
                                size={15}
                                className="animate-spin"
                            />
                        ) : (
                            <ExternalLink size={15} />
                        )}

                        {isOpening ? "Opening..." : "View document"}
                    </button>

                    {canDelete && document.status !== "APPROVED" && (
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirmation(true)}
                            disabled={isDeleting || isOpening}
                            aria-label="Delete document"
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                            <Trash2 size={15} />
                            Delete
                        </button>
                    )}
                </div>
            </motion.article>

            <DealerDocumentPreviewModal
                open={isPreviewOpen}
                title={
                    DOCUMENT_LABELS[document.documentType] ??
                    document.documentType.replace(/_/g, " ")
                }
                document={previewDocument}
                loading={isPreviewOpen && urlMutation.isPending}
                error={previewError}
                onClose={() => setIsPreviewOpen(false)}
                onRetry={() => setPreviewRetryKey((current) => current + 1)}
            />

            <AnimatePresence>
                {showDeleteConfirmation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget && !isDeleting) {
                                setShowDeleteConfirmation(false);
                            }
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                                    <Trash2 size={23} />
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowDeleteConfirmation(false)
                                    }
                                    disabled={isDeleting}
                                    aria-label="Close confirmation"
                                    className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 disabled:opacity-50"
                                >
                                    <X size={19} />
                                </button>
                            </div>

                            <h3 className="mt-5 text-lg font-extrabold">
                                Delete this document?
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                This removes the uploaded document from your
                                application. You may need to upload it again
                                if it is required for verification.
                            </p>

                            <div className="mt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowDeleteConfirmation(false)
                                    }
                                    disabled={isDeleting}
                                    className="min-h-12 flex-1 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                                >
                                    {isDeleting ? (
                                        <LoaderCircle
                                            size={17}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Trash2 size={17} />
                                    )}

                                    {isDeleting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}