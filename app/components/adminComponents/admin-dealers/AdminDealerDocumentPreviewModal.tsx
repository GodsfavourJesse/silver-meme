"use client";

import { useEffect, useState } from "react";
import {
    AlertCircle,
    Download,
    ExternalLink,
    FileText,
    LoaderCircle,
    RefreshCw,
    X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { adminDealerService } from "@/app/services/admin/admin-dealer.service";

interface AdminDealerDocumentPreview {
    id: string;
    applicationId: string;
    documentType: string;
    status: string;
    applicationStatus: string;
    url: string;
    expiresInSeconds: number;
    mimeType?: string;
    contentType?: string;
}

interface AdminDealerDocumentPreviewModalProps {
    documentId: string | null;
    documentLabel?: string;
    onClose: () => void;
}

export default function AdminDealerDocumentPreviewModal({
    documentId,
    documentLabel = "Verification document",
    onClose,
}: AdminDealerDocumentPreviewModalProps) {
    const [document, setDocument] = useState<AdminDealerDocumentPreview | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        if (!documentId) {
            setDocument(null);
            setError(null);
            return;
        }

        let cancelled = false;

        async function loadDocument() {
            setLoading(true);
            setError(null);
            setDocument(null);

            try {
                const response = await adminDealerService.getDocumentPreview(documentId!);
                const result = response.data.document as AdminDealerDocumentPreview;

                if (!result?.url) {
                    throw new Error("The server did not return a document preview URL.");
                }

                if (!cancelled) setDocument(result);
            } catch (cause) {
                if (!cancelled) {
                    setError(
                        cause instanceof Error
                            ? cause.message
                            : "Unable to load this document.",
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadDocument();

        return () => {
            cancelled = true;
        };
    }, [documentId, retryKey]);

    useEffect(() => {
        if (!documentId) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") onClose();
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [documentId, onClose]);

    const mimeType = document?.mimeType ?? document?.contentType ?? "";
    const url = document?.url ?? "";
    const isPdf = mimeType.includes("pdf") || /\.pdf(?:\?|$)/i.test(url);
    const isImage = mimeType.startsWith("image/") || /\.(png|jpe?g|webp|gif|avif)(?:\?|$)/i.test(url);

    return (
        <AnimatePresence>
            {documentId && (
                <motion.div
                    className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) onClose();
                    }}
                >
                    <motion.section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="dealer-document-preview-title"
                        className="flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#101014] shadow-2xl sm:max-h-[90dvh] sm:max-w-5xl sm:rounded-3xl"
                        initial={{ y: 28, opacity: 0, scale: 0.99 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 18, opacity: 0, scale: 0.99 }}
                        transition={{ duration: 0.2 }}
                    >
                        <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7008E7]/20 text-[#c7a3ff]">
                                    <FileText size={20} />
                                </div>
                                <div className="min-w-0">
                                    <h2 id="dealer-document-preview-title" className="truncate text-sm font-semibold text-white sm:text-base">
                                        {documentLabel}
                                    </h2>
                                    <p className="mt-1 text-xs text-white/45">Private verification document</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close document preview"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white"
                            >
                                <X size={19} />
                            </button>
                        </header>

                        <main className="min-h-[300px] flex-1 overflow-auto bg-[#09090c] p-3 sm:p-5">
                            {loading && (
                                <div className="flex min-h-[350px] flex-col items-center justify-center gap-3 text-white/55">
                                    <LoaderCircle size={30} className="animate-spin text-[#b783ff]" />
                                    <p className="text-sm">Loading secure document…</p>
                                </div>
                            )}

                            {!loading && error && (
                                <div className="flex min-h-[350px] flex-col items-center justify-center gap-3 px-5 text-center">
                                    <AlertCircle size={34} className="text-rose-400" />
                                    <p className="text-sm font-semibold text-white">Document unavailable</p>
                                    <p className="max-w-md break-words text-xs leading-5 text-white/50">{error}</p>
                                    <button
                                        type="button"
                                        onClick={() => setRetryKey((current) => current + 1)}
                                        className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#7008E7] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#5b06bf]"
                                    >
                                        <RefreshCw size={14} /> Try again
                                    </button>
                                </div>
                            )}

                            {!loading && !error && document && (
                                isPdf ? (
                                    <iframe
                                        src={document.url}
                                        title={documentLabel}
                                        className="h-[65dvh] min-h-[350px] w-full rounded-xl border border-white/10 bg-white sm:h-[70dvh]"
                                    />
                                ) : isImage ? (
                                    <div className="flex min-h-[350px] items-center justify-center">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={document.url}
                                            alt={documentLabel}
                                            className="max-h-[68dvh] max-w-full rounded-xl object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex min-h-[350px] flex-col items-center justify-center gap-4 text-center">
                                        <FileText size={42} className="text-[#b783ff]" />
                                        <p className="text-sm text-white/70">This file type cannot be previewed inline.</p>
                                        <a
                                            href={document.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="rounded-xl bg-[#7008E7] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5b06bf]"
                                        >
                                            Open document
                                        </a>
                                    </div>
                                )
                            )}
                        </main>

                        {document && !loading && !error && (
                            <footer className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3 sm:px-6">
                                <p className="text-[11px] text-white/45 sm:text-xs">
                                    Secure link expires in {Math.max(1, Math.ceil(document.expiresInSeconds / 60))} min
                                </p>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={document.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-medium text-white/75 transition hover:bg-white/5"
                                    >
                                        <ExternalLink size={15} /> <span className="hidden sm:inline">Open</span>
                                    </a>
                                    <a
                                        href={document.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download
                                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#7008E7] px-3 text-xs font-semibold text-white transition hover:bg-[#5b06bf]"
                                    >
                                        <Download size={15} /> Download
                                    </a>
                                </div>
                            </footer>
                        )}
                    </motion.section>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
