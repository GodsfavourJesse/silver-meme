"use client";

import { useEffect } from "react";

import {
    AlertCircle,
    Check,
    CheckCircle2,
    Clock3,
    Image as ImageIcon,
    X,
    XCircle,
} from "lucide-react";

import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "framer-motion";

import { useRouter } from "next/navigation";

import { ListingImageRecord } from "@/app/types/user/listings/listing-image.types";
import { ListingRecord } from "@/app/types/user/listings/listing.types";
import { EditorState, ImageSummary } from "@/app/hooks/user/listings/useListingEditor";

export interface ListingEditorViewProps {
    editor: EditorState | null;
    isLoading: boolean;
    isSubmitting: boolean;
    error: string;
    success: string;

    setError: (value: string) => void;

    imageFailureModalOpen: boolean;
    setImageFailureModalOpen: (value: boolean) => void;

    loadListing: () => Promise<void>;
    handleImagesChange: (images: ListingImageRecord[]) => void;
    handleSubmitForReview: () => Promise<void>;

    imageSummary: ImageSummary;

    editable: boolean;
    titleComplete: boolean;
    descriptionComplete: boolean;
    hasImages: boolean;
    imageChecksComplete: boolean;
    submitAllowed: boolean;

    location: string;
}

export function formatPrice(
    price: string | number,
    currency: string,
) {
    const amount = Number(price);

    if (!Number.isFinite(amount)) {
        return `${currency} ${price}`;
    }

    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${currency} ${amount.toLocaleString("en-NG")}`;
    }
}

export function formatDate(value?: string | Date | null) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export function formatMileage(mileage?: number | null) {
    if (typeof mileage !== "number" || !Number.isFinite(mileage)) {
        return "Not specified";
    }

    return `${mileage.toLocaleString("en-NG")} km`;
}

export function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
        DRAFT: "Draft",
        PENDING_REVIEW: "Under review",
        APPROVED: "Published",
        REJECTED: "Needs attention",
        EXPIRED: "Expired",
        SOLD: "Sold",
        SUSPENDED: "Suspended",
        DELETED: "Deleted",
    };

    return labels[status] ?? status.replaceAll("_", " ");
}

export function getStatusClasses(status: string) {
    const styles: Record<string, string> = {
        DRAFT: "bg-slate-100 text-slate-600 ring-slate-200",
        PENDING_REVIEW: "bg-amber-50 text-amber-700 ring-amber-200",
        APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        REJECTED: "bg-red-50 text-red-700 ring-red-200",
        EXPIRED: "bg-slate-100 text-slate-600 ring-slate-200",
        SOLD: "bg-blue-50 text-blue-700 ring-blue-200",
        SUSPENDED: "bg-orange-50 text-orange-700 ring-orange-200",
        DELETED: "bg-slate-100 text-slate-500 ring-slate-200",
    };

    return styles[status] ?? "bg-slate-100 text-slate-600 ring-slate-200";
}

export function EditorStatusBadge({
    status,
}: {
    status: string;
}) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(status)}`}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {getStatusLabel(status)}
        </span>
    );
}

export function EditorFeedback({
    error,
    success,
    onDismissError,
}: {
    error: string;
    success: string;
    onDismissError: () => void;
}) {
    return (
        <div className="space-y-3">
            {error && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                    <p className="min-w-0 flex-1 leading-6">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={onDismissError}
                        aria-label="Dismiss error"
                        className="rounded-md p-1 transition hover:bg-red-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

                    <p className="leading-6">{success}</p>
                </div>
            )}
        </div>
    );
}

export function ChecklistItem({
    label,
    description,
    complete,
}: {
    label: string;
    description: string;
    complete: boolean;
}) {
    return (
        <div className="flex items-start gap-3">
            <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    complete
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-400"
                }`}
            >
                {complete ? (
                    <Check className="h-3 w-3" />
                ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
            </span>

            <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">
                    {label}
                </p>

                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

export function ImageSummaryBar({
    summary,
}: {
    summary: ImageSummary;
}) {
    const items = [
        {
            label: "Passed",
            count: summary.passed,
            className: "bg-emerald-500",
            textClass: "text-emerald-700",
        },
        {
            label: "Review",
            count: summary.review,
            className: "bg-blue-500",
            textClass: "text-blue-700",
        },
        {
            label: "Pending",
            count: summary.pending,
            className: "bg-amber-400",
            textClass: "text-amber-700",
        },
        {
            label: "Failed",
            count: summary.failed,
            className: "bg-red-500",
            textClass: "text-red-700",
        },
    ];

    const total = Object.values(summary).reduce(
        (sum, value) => sum + value,
        0,
    );

    return (
        <div className="space-y-3">
            <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                {items.map((item) => (
                    <span
                        key={item.label}
                        className={`${item.className} transition-all duration-500`}
                        style={{
                            width: total
                                ? `${(item.count / total) * 100}%`
                                : "0%",
                        }}
                    />
                ))}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2">
                {items.map((item) => (
                    <div
                        key={item.label}
                        className="flex items-center gap-1.5"
                    >
                        <span
                            className={`h-2 w-2 rounded-full ${item.className}`}
                        />

                        <span className="text-xs text-slate-500">
                            {item.label}
                        </span>

                        <span className={`text-xs font-semibold ${item.textClass}`}>
                            {item.count}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function EditorLoading() {
    return (
        <div className="flex min-h-[65vh] flex-col items-center justify-center px-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                <span className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-[#1491FF]/20 border-t-[#1491FF]" />
            </div>

            <p className="mt-5 text-sm font-semibold text-slate-800">
                Loading your listing
            </p>

            <p className="mt-1 text-xs text-slate-500">
                Getting your vehicle details ready.
            </p>
        </div>
    );
}

export function EditorError({
    error,
    onRetry,
}: {
    error: string;
    onRetry: () => void;
}) {
    const router = useRouter();

    return (
        <div className="flex min-h-[65vh] items-center justify-center px-5">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <AlertCircle className="h-6 w-6" />
                </div>

                <h2 className="mt-5 text-lg font-bold text-slate-900">
                    Unable to open listing
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                    {error || "We couldn't retrieve this listing."}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => router.push("/dashboard/my-listings")}
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Go back
                    </button>

                    <button
                        type="button"
                        onClick={onRetry}
                        className="rounded-xl bg-[#1491FF] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#087FE5]"
                    >
                        Try again
                    </button>
                </div>
            </div>
        </div>
    );
}

export function ImageFailureDialog({
    open,
    images,
    onClose,
}: {
    open: boolean;
    images: ListingImageRecord[];
    onClose: () => void;
}) {
    const shouldReduceMotion = useReducedMotion();

    const failedImages = images.filter(
        (image) => image.imageCheckStatus === "FAILED",
    );

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

    const scrollToUploader = () => {
        onClose();

        window.setTimeout(() => {
            document
                .getElementById("listing-image-uploader")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
        }, 150);
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-[3px] sm:items-center sm:p-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            onClose();
                        }
                    }}
                >
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="image-failure-title"
                        initial={
                            shouldReduceMotion
                                ? false
                                : { opacity: 0, y: 28, scale: 0.98 }
                        }
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.98 }}
                        transition={{
                            duration: shouldReduceMotion ? 0 : 0.22,
                        }}
                        className="max-h-[90dvh] w-full max-w-lg overflow-hidden rounded-t-[26px] bg-white shadow-2xl sm:rounded-2xl"
                    >
                        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                    <ImageIcon className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2
                                        id="image-failure-title"
                                        className="text-base font-bold text-slate-900"
                                    >
                                        Some photos need attention
                                    </h2>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Your listing details are saved, but these
                                        photos need to be corrected before submission.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close dialog"
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="max-h-[48vh] space-y-3 overflow-y-auto px-5 py-5 sm:px-6">
                            {failedImages.map((image, index) => (
                                <div
                                    key={image.id}
                                    className="rounded-xl border border-red-100 bg-red-50/50 p-4"
                                >
                                    <div className="flex items-center gap-2">
                                        <XCircle className="h-4 w-4 shrink-0 text-red-600" />

                                        <p className="text-sm font-semibold text-slate-800">
                                            Photo {image.sortOrder + 1 || index + 1}: verification failed
                                        </p>
                                    </div>

                                    <p className="mt-2 text-xs leading-5 text-red-700">
                                        {image.checkReason?.trim() ||
                                            "This photo did not pass the platform's image checks."}
                                    </p>
                                </div>
                            ))}

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-semibold text-slate-800">
                                    Before uploading again
                                </p>

                                <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-600">
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                                        Use a genuine, clear photo of the listed vehicle.
                                    </li>

                                    <li className="flex gap-2">
                                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                                        Avoid reused photos, watermarks and promotional overlays.
                                    </li>

                                    <li className="flex gap-2">
                                        <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                                        Allow the replacement photos to finish checking.
                                    </li>
                                </ul>

                                <a
                                    href="/policies/listing-images"
                                    className="mt-3 inline-flex text-xs font-semibold text-[#087FE5] hover:underline"
                                >
                                    Read image-upload policy
                                </a>
                            </div>
                        </div>

                        <div className="flex gap-3 border-t border-slate-100 bg-white px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Keep editing
                            </button>

                            <button
                                type="button"
                                onClick={scrollToUploader}
                                className="flex-1 rounded-xl bg-[#1491FF] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#087FE5]"
                            >
                                Fix photos
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}