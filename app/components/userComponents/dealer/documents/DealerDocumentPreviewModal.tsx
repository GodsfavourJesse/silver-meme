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

export interface DealerDocumentPreviewData {
    id: string;
    url: string;
    expiresInSeconds?: number;
    mimeType?: string;
    contentType?: string;
    fileName?: string;
}

interface DealerDocumentPreviewModalProps {
    open: boolean;
    title: string;
    document: DealerDocumentPreviewData | null;
    loading?: boolean;
    error?: string | null;
    onClose: () => void;
    onRetry?: () => void;
}

export default function DealerDocumentPreviewModal({
    open,
    title,
    document,
    loading = false,
    error = null,
    onClose,
    onRetry,
}: DealerDocumentPreviewModalProps) {
    const [previewFailed, setPreviewFailed] = useState(false);

    useEffect(() => {
        setPreviewFailed(false);
    }, [document?.url]);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);

    const url = document?.url ?? "";
    const mimeType = (
        document?.mimeType ??
        document?.contentType ??
        ""
    ).toLowerCase();

    const isPdf =
        mimeType === "application/pdf" ||
        (!mimeType &&
            /\.pdf(?:[?#]|$)/i.test(url));

    const isImage =
        mimeType.startsWith("image/") ||
        (!mimeType &&
            /\.(png|jpe?g|webp|gif|avif)(?:[?#]|$)/i.test(url));

    const canPreview = isPdf || isImage;

    return (
        <AnimatePresence>
            {open && (
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
                        initial={{ y: 24, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 16, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-6">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7008E7]/20 text-purple-300">
                                    <FileText size={20} />
                                </div>

                                <div className="min-w-0">
                                    <h2
                                        id="dealer-document-preview-title"
                                        className="truncate text-sm font-semibold text-white sm:text-base"
                                    >
                                        {title}
                                    </h2>

                                    <p className="mt-1 text-xs text-white/45">
                                        Private verification document
                                    </p>
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
                                    <LoaderCircle
                                        size={30}
                                        className="animate-spin text-purple-300"
                                    />
                                    <p className="text-sm">
                                        Loading secure document...
                                    </p>
                                </div>
                            )}

                            {!loading && error && (
                                <div className="flex min-h-[350px] flex-col items-center justify-center gap-3 px-5 text-center">
                                    <AlertCircle
                                        size={34}
                                        className="text-rose-400"
                                    />

                                    <p className="text-sm font-semibold text-white">
                                        Document unavailable
                                    </p>

                                    <p className="max-w-md break-words text-xs leading-5 text-white/50">
                                        {error}
                                    </p>

                                    {onRetry && (
                                        <button
                                            type="button"
                                            onClick={onRetry}
                                            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#7008E7] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#5b06bf]"
                                        >
                                            <RefreshCw size={14} />
                                            Try again
                                        </button>
                                    )}
                                </div>
                            )}

                            {!loading && !error && document && (
                                !canPreview ? (
                                    <div className="flex min-h-[350px] flex-col items-center justify-center gap-4 text-center">
                                        <FileText
                                            size={42}
                                            className="text-purple-300"
                                        />

                                        <p className="text-sm text-white/70">
                                            This file type cannot be previewed inline.
                                        </p>

                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="rounded-xl bg-[#7008E7] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5b06bf]"
                                        >
                                            Open document
                                        </a>
                                    </div>
                                ) : isPdf ? (
                                    <iframe
                                        key={url}
                                        src={url}
                                        title={title}
                                        className="h-[65dvh] min-h-[350px] w-full rounded-xl border border-white/10 bg-white sm:h-[70dvh]"
                                    />
                                ) : previewFailed ? (
                                    <div className="flex min-h-[350px] flex-col items-center justify-center gap-4 text-center">
                                        <AlertCircle
                                            size={36}
                                            className="text-amber-400"
                                        />

                                        <p className="text-sm text-white/70">
                                            The image could not be displayed.
                                        </p>

                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="rounded-xl bg-[#7008E7] px-4 py-3 text-sm font-semibold text-white"
                                        >
                                            Open image
                                        </a>
                                    </div>
                                ) : (
                                    <div className="flex min-h-[350px] items-center justify-center">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={url}
                                            alt={title}
                                            onError={() => setPreviewFailed(true)}
                                            className="max-h-[68dvh] max-w-full rounded-xl object-contain"
                                        />
                                    </div>
                                )
                            )}
                        </main>

                        {!loading && !error && document && (
                            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3 sm:px-6">
                                <p className="text-[11px] text-white/45 sm:text-xs">
                                    {document.expiresInSeconds
                                        ? `Secure link expires in ${Math.max(
                                              1,
                                              Math.ceil(
                                                  document.expiresInSeconds / 60,
                                              ),
                                          )} min`
                                        : "Private document"}
                                </p>

                                <div className="flex items-center gap-2">
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-medium text-white/75 transition hover:bg-white/5"
                                    >
                                        <ExternalLink size={15} />
                                        <span className="hidden sm:inline">
                                            Open
                                        </span>
                                    </a>

                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download={document.fileName ?? true}
                                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#7008E7] px-3 text-xs font-semibold text-white transition hover:bg-[#5b06bf]"
                                    >
                                        <Download size={15} />
                                        Download
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