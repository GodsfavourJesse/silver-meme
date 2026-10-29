"use client";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import Link from "next/link";

import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Clock3,
    FileText,
    LoaderCircle,
    ShieldCheck,
    UploadCloud,
    RefreshCw,
    CarFront,
    MapPin,
    CalendarDays,
    Gauge,
    CircleCheck,
    ImageIcon,
    X,
    ShieldAlert,
    ExternalLink,
} from "lucide-react";

import ListingImageUploader from
    "@/app/components/userComponents/listings/create/ListingImageUploader";

import {
    getSellerListingDetail,
    submitSellerListing,
} from "@/app/services/user/listings/listing.service";

import { ListingRecord } from "@/app/types/user/listings/listing.types";
import { ListingImageRecord } from "@/app/types/user/listings/listing-image.types";

// ============================================================
// TYPES
// ============================================================

interface ListingEditorProps {
    listingId: string;
}

interface EditorState {
    listing: ListingRecord;
    images: ListingImageRecord[];
}

// ============================================================
// CONSTANTS
// ============================================================

const BRAND_PURPLE = "#7008E7";

const STATUS_STYLES: Record<string, string> = {
    DRAFT:
        "border-slate-200 bg-slate-50 text-slate-600",

    PENDING_REVIEW:
        "border-amber-200 bg-amber-50 text-amber-700",

    APPROVED:
        "border-emerald-200 bg-emerald-50 text-emerald-700",

    REJECTED:
        "border-red-200 bg-red-50 text-red-700",

    EXPIRED:
        "border-slate-200 bg-slate-50 text-slate-500",

    SOLD:
        "border-blue-200 bg-blue-50 text-blue-700",

    SUSPENDED:
        "border-red-200 bg-red-50 text-red-700",

    DELETED:
        "border-slate-200 bg-slate-50 text-slate-400",
};

// ============================================================
// HELPERS
// ============================================================

function formatPrice(
    price: string | number,
    currency: string,
): string {
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

function getStatusLabel(status: string | null | undefined): string {
    if (typeof status !== "string" || !status.trim()) {
        return "Unknown";
    }

    return status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (character) =>
            character.toUpperCase(),
        );
}

function canEditListing(status: string): boolean {
    return [
        "DRAFT",
        "REJECTED",
    ].includes(status);
}

function canSubmitListing(status: string): boolean {
    return [
        "DRAFT",
        "REJECTED",
    ].includes(status);
}

function getImageSummary(
    images: ListingImageRecord[],
): {
    passed: number;
    review: number;
    failed: number;
    pending: number;
} {
    return images.reduce(
        (summary, image) => {
            switch (image.imageCheckStatus) {
                case "PASSED":
                    summary.passed += 1;
                    break;

                case "REVIEW":
                    summary.review += 1;
                    break;

                case "FAILED":
                    summary.failed += 1;
                    break;

                default:
                    summary.pending += 1;
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

function formatDate(value: string | Date): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

// ============================================================
// REUSABLE COMPONENTS
// ============================================================

function SectionHeading({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description?: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div
                className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                style={{
                    backgroundColor: "rgba(112, 8, 231, 0.08)",
                    color: BRAND_PURPLE,
                }}
            >
                {icon}
            </div>

            <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold tracking-tight text-slate-900">
                    {title}
                </h2>

                {description && (
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

function ChecklistItem({
    complete,
    title,
    description,
}: {
    complete: boolean;
    title: string;
    description?: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
                    complete
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-amber-100 text-amber-600"
                }`}
            >
                {complete ? (
                    <CheckCircle2 size={13} />
                ) : (
                    <Clock3 size={13} />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <p
                    className={`text-sm font-medium ${
                        complete
                            ? "text-slate-800"
                            : "text-slate-600"
                    }`}
                >
                    {title}
                </p>

                {description && (
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

function SummaryRow({
    label,
    value,
    valueClassName = "text-slate-900",
}: {
    label: string;
    value: number;
    valueClassName?: string;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-600">
                {label}
            </span>

            <span className={`text-sm font-bold ${valueClassName}`}>
                {value}
            </span>
        </div>
    );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ListingEditor({
    listingId,
}: ListingEditorProps) {
    const [editor, setEditor] =
        useState<EditorState | null>(null);

    const [isLoading, setIsLoading] = useState(true);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [success, setSuccess] =
        useState<string | null>(null);

    const [imageFailureModalOpen, setImageFailureModalOpen] =
        useState(false);

    // ========================================================
    // LOAD LISTING
    // ========================================================
    const loadListing = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getSellerListingDetail(listingId);

            const listing = response?.data?.listing;
            const images = response?.data?.images;

            if (
                !response?.success ||
                !listing ||
                typeof listing.id !== "string"
            ) {
                console.error(
                    "[ListingEditor] Invalid listing detail response:",
                    response,
                );

                throw new Error(
                    "The server returned an invalid listing response. Please refresh and try again.",
                );
            }

            setEditor({
                listing,
                images: Array.isArray(images) ? images : [],
            });
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Unable to load this listing.",
            );
        } finally {
            setIsLoading(false);
        }
    }, [listingId]);

    useEffect(() => {
        void loadListing();
    }, [loadListing]);

    // ========================================================
    // HANDLE IMAGE UPDATES
    // ========================================================

    const handleImagesChange = useCallback(
        (images: ListingImageRecord[]) => {
            setEditor((current) =>
                current
                    ? {
                          ...current,
                          images,
                      }
                    : current,
            );
        },
        [],
    );

    // ========================================================
    // SUBMIT LISTING FOR REVIEW
    // ========================================================

    const handleSubmitForReview = useCallback(
        async () => {
            if (!editor || isSubmitting) {
                return;
            }

            setError(null);
            setSuccess(null);

            if (editor.images.length === 0) {
                setError(
                    "Upload at least one vehicle photo before submitting.",
                );
                return;
            }

            const summary = getImageSummary(editor.images);

            if (summary.pending > 0) {
                setError(
                    "Some images are still pending their initial image checks. Wait for those checks to finish and refresh the listing before submitting.",
                );
                return;
            }

            if (summary.failed > 0) {
                setImageFailureModalOpen(true);
                return;
            }

            setIsSubmitting(true);

            try {
                await submitSellerListing(listingId);

                setSuccess(
                    "Your listing was submitted for review.",
                );

                await loadListing();
            } catch (requestError) {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : "Unable to submit the listing.",
                );
            } finally {
                setIsSubmitting(false);
            }
        },
        [
            editor,
            isSubmitting,
            listingId,
            loadListing,
        ],
    );

    // ========================================================
    // LOADING STATE
    // ========================================================

    if (isLoading && !editor) {
        return (
            <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto flex min-h-[360px] max-w-5xl flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                    <div
                        className="flex size-14 items-center justify-center rounded-2xl"
                        style={{
                            backgroundColor: "rgba(112, 8, 231, 0.08)",
                            color: BRAND_PURPLE,
                        }}
                    >
                        <LoaderCircle
                            size={26}
                            className="animate-spin"
                        />
                    </div>

                    <h2 className="mt-5 text-lg font-bold text-slate-900">
                        Loading your listing
                    </h2>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                        Please wait while we retrieve your vehicle
                        information and image-check status.
                    </p>
                </div>
            </main>
        );
    }

    // ========================================================
    // FAILED TO LOAD
    // ========================================================

    if (!editor) {
        return (
            <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                        <AlertCircle size={26} />
                    </div>

                    <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
                        Unable to open listing
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        {error ??
                            "This listing could not be loaded. Please try again."}
                    </p>

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => void loadListing()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-purple-100"
                            style={{
                                backgroundColor: BRAND_PURPLE,
                            }}
                        >
                            <RefreshCw size={16} />
                            Try again
                        </button>

                        <Link
                            href="/my-listings"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            <ArrowLeft size={16} />
                            Back to my listings
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    // ========================================================
    // DERIVED STATE
    // ========================================================

    const { listing, images } = editor;

    const imageSummary = getImageSummary(images);

    const editable = canEditListing(listing.status);

    const submitAllowed =
        canSubmitListing(listing.status) &&
        !isSubmitting;

    const titleComplete =
        typeof listing.title === "string" &&
        listing.title.trim().length >= 5;

    const descriptionComplete =
        typeof listing.description === "string" &&
        listing.description.trim().length >= 10;

    const hasImages = images.length > 0;

    const imageChecksComplete =
        imageSummary.pending === 0 &&
        imageSummary.failed === 0 &&
        hasImages;

    const statusStyle =
        STATUS_STYLES[listing.status] ??
        STATUS_STYLES.DRAFT;

    const location = [
        listing.city,
        listing.state,
        listing.country,
    ]
        .filter(Boolean)
        .join(", ");

    // ========================================================
    // MAIN UI
    // ========================================================

    return (
        <>
        <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mx-auto max-w-7xl">
                {/* ============================================
                    BACK NAVIGATION
                ============================================ */}

                <Link
                    href="/dashboard/my-listings"
                    className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
                >
                    <ArrowLeft
                        size={16}
                        className="transition-transform group-hover:-translate-x-0.5"
                    />

                    Back to my listings
                </Link>

                {/* ============================================
                    PAGE HEADER
                ============================================ */}

                <header className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="p-5 sm:p-7 lg:p-8">
                        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${statusStyle}`}
                                    >
                                        <span className="mr-2 size-1.5 rounded-full bg-current" />

                                        {getStatusLabel(listing.status)}
                                    </span>

                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
                                        <FileText size={12} />

                                        ID: {listing.id}
                                    </span>
                                </div>

                                <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
                                    Manage your listing
                                </h1>

                                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                                    Manage your vehicle details, upload
                                    photos, and monitor image checks
                                    before submitting your listing for
                                    review.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => void loadListing()}
                                disabled={isLoading}
                                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <LoaderCircle
                                        size={16}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <RefreshCw size={15} />
                                )}

                                {isLoading
                                    ? "Refreshing..."
                                    : "Refresh listing"}
                            </button>
                        </div>
                    </div>

                    <div
                        className="h-1"
                        style={{
                            background: `linear-gradient(90deg, ${BRAND_PURPLE} 0%, #9D4DFF 55%, #E9D5FF 100%)`,
                        }}
                    />
                </header>

                {/* ============================================
                    ERROR ALERT
                ============================================ */}

                {error && (
                    <div
                        role="alert"
                        className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:p-5"
                    >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                            <AlertCircle size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-red-800">
                                Something needs your attention
                            </p>

                            <p className="mt-1 text-sm leading-6 text-red-700">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {/* ============================================
                    SUCCESS ALERT
                ============================================ */}

                {success && (
                    <div
                        role="status"
                        className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5"
                    >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                            <CheckCircle2 size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-emerald-800">
                                Submission successful
                            </p>

                            <p className="mt-1 text-sm leading-6 text-emerald-700">
                                {success}
                            </p>
                        </div>
                    </div>
                )}

                {/* ============================================
                    MAIN CONTENT GRID
                ============================================ */}

                <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
                    {/* ========================================
                        LEFT COLUMN
                    ======================================== */}

                    <div className="min-w-0 space-y-6">
                        {/* ====================================
                            VEHICLE INFORMATION
                        ==================================== */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 p-5 sm:p-6">
                                <SectionHeading
                                    icon={<CarFront size={20} />}
                                    title="Vehicle information"
                                    description="Review the information currently saved against this listing."
                                />
                            </div>

                            <div className="p-5 sm:p-6">
                                {/* VEHICLE TITLE AND PRICE */}

                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                            Vehicle listing
                                        </p>

                                        <h3 className="mt-2 break-words text-xl font-bold leading-snug tracking-tight text-slate-900 sm:text-2xl">
                                            {listing.title}
                                        </h3>
                                    </div>

                                    <div className="shrink-0 rounded-xl border border-purple-100 bg-purple-50 px-4 py-3 sm:text-right">
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-600">
                                            Asking price
                                        </p>

                                        <p
                                            className="mt-1 text-xl font-bold tracking-tight sm:text-2xl"
                                            style={{
                                                color: BRAND_PURPLE,
                                            }}
                                        >
                                            {formatPrice(
                                                listing.price,
                                                listing.currency,
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* DESCRIPTION */}

                                <div className="mt-6">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Description
                                    </h4>

                                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                                        {listing.description ||
                                            "No description has been provided."}
                                    </p>
                                </div>

                                {/* VEHICLE DETAILS */}

                                <div className="mt-7 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-2">
                                    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200/70">
                                            <CarFront size={17} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-slate-400">
                                                Condition
                                            </p>

                                            <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                                                {listing.condition ||
                                                    "Not specified"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200/70">
                                            <Gauge size={17} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-slate-400">
                                                Mileage
                                            </p>

                                            <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                                                {typeof listing.mileage === "number" &&
                                                Number.isFinite(listing.mileage)
                                                    ? `${listing.mileage.toLocaleString("en-NG")} km`
                                                    : "Not specified"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200/70">
                                            <MapPin size={17} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-slate-400">
                                                Location
                                            </p>

                                            <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                                                {location ||
                                                    "Not specified"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200/70">
                                            <CalendarDays size={17} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-slate-400">
                                                Date created
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                                {formatDate(
                                                    listing.createdAt,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* REJECTION FEEDBACK */}

                                {listing.rejectionReason && (
                                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 sm:p-5">
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                                                <AlertCircle size={18} />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-sm font-bold text-red-800">
                                                    Previous review feedback
                                                </h4>

                                                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-red-700">
                                                    {listing.rejectionReason}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* EDIT DETAILS */}

                                {editable && (
                                    <div className="mt-6 border-t border-slate-100 pt-6">
                                        <Link
                                            href={`/my-listings/${encodeURIComponent(listing.id)}/edit-details`}
                                            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-5 py-3 text-sm font-semibold text-purple-700 transition hover:border-purple-300 hover:bg-purple-100 sm:w-auto"
                                        >
                                            <FileText size={16} />

                                            Edit vehicle details
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* ====================================
                            LISTING IMAGES
                        ==================================== */}

                        {editable && (
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 p-5 sm:p-6">
                                    <SectionHeading
                                        icon={<ImageIcon size={20} />}
                                        title="Vehicle photos"
                                        description="Upload and manage the photos you want to include with your listing."
                                    />
                                </div>

                                <div className="p-4 sm:p-6">
                                    <ListingImageUploader
                                        listingId={listing.id}
                                        images={images}
                                        onImagesChange={handleImagesChange}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                        )}

                        {/* ====================================
                            READ-ONLY IMAGES
                        ==================================== */}

                        {!editable && (
                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                <SectionHeading
                                    icon={<ImageIcon size={20} />}
                                    title="Listing photos"
                                    description="Your listing's current photo records."
                                />

                                <div className="mt-5 flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                                        <ImageIcon size={20} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-slate-800">
                                            {images.length}{" "}
                                            {images.length === 1
                                                ? "image"
                                                : "images"}{" "}
                                            recorded
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Photo editing is unavailable
                                            while this listing is{" "}
                                            {getStatusLabel(
                                                listing.status,
                                            ).toLowerCase()}
                                            .
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* ========================================
                        RIGHT SIDEBAR
                    ======================================== */}

                    <aside className="min-w-0 space-y-6 xl:sticky xl:top-6">
                        {/* ====================================
                            IMAGE CHECK SUMMARY
                        ==================================== */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 p-5">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                                        style={{
                                            backgroundColor:
                                                "rgba(112, 8, 231, 0.08)",
                                            color: BRAND_PURPLE,
                                        }}
                                    >
                                        <ShieldCheck size={20} />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900">
                                            Image-check summary
                                        </h2>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Image processing status
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5">
                                {/* IMAGE TOTAL */}

                                <div className="rounded-xl border border-purple-100 bg-purple-50/70 p-4">
                                    <p className="text-xs font-medium text-purple-700">
                                        Total listing images
                                    </p>

                                    <div className="mt-1 flex items-end justify-between gap-3">
                                        <p
                                            className="text-3xl font-bold tracking-tight"
                                            style={{
                                                color: BRAND_PURPLE,
                                            }}
                                        >
                                            {images.length}
                                        </p>

                                        <ImageIcon
                                            size={24}
                                            className="mb-1 text-purple-300"
                                        />
                                    </div>
                                </div>

                                {/* IMAGE STATUS COUNTS */}

                                <div className="mt-5 space-y-4">
                                    <SummaryRow
                                        label="Passed"
                                        value={imageSummary.passed}
                                        valueClassName="text-emerald-600"
                                    />

                                    <SummaryRow
                                        label="Requires review"
                                        value={imageSummary.review}
                                        valueClassName="text-amber-600"
                                    />

                                    <SummaryRow
                                        label="Failed"
                                        value={imageSummary.failed}
                                        valueClassName="text-red-600"
                                    />

                                    <SummaryRow
                                        label="Pending"
                                        value={imageSummary.pending}
                                        valueClassName="text-slate-500"
                                    />
                                </div>

                                {/* STATUS PROGRESS BAR */}

                                {images.length > 0 && (
                                    <div className="mt-5">
                                        <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                                            {imageSummary.passed > 0 && (
                                                <div
                                                    className="bg-emerald-500 transition-all"
                                                    style={{
                                                        width: `${
                                                            (imageSummary.passed /
                                                                images.length) *
                                                            100
                                                        }%`,
                                                    }}
                                                />
                                            )}

                                            {imageSummary.review > 0 && (
                                                <div
                                                    className="bg-amber-400 transition-all"
                                                    style={{
                                                        width: `${
                                                            (imageSummary.review /
                                                                images.length) *
                                                            100
                                                        }%`,
                                                    }}
                                                />
                                            )}

                                            {imageSummary.failed > 0 && (
                                                <div
                                                    className="bg-red-500 transition-all"
                                                    style={{
                                                        width: `${
                                                            (imageSummary.failed /
                                                                images.length) *
                                                            100
                                                        }%`,
                                                    }}
                                                />
                                            )}

                                            {imageSummary.pending > 0 && (
                                                <div
                                                    className="bg-slate-300 transition-all"
                                                    style={{
                                                        width: `${
                                                            (imageSummary.pending /
                                                                images.length) *
                                                            100
                                                        }%`,
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}

                                <p className="mt-5 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                                    These counts reflect the image-check
                                    statuses returned by the listing API.
                                    They do not replace the results of
                                    dedicated image-analysis jobs.
                                </p>
                            </div>
                        </section>

                        {/* ====================================
                            SUBMISSION CHECKLIST
                        ==================================== */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                        <CircleCheck size={20} />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900">
                                            Submission checklist
                                        </h2>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Review these requirements
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5 p-5">
                                <ChecklistItem
                                    complete={titleComplete}
                                    title="Listing title provided"
                                    description={
                                        titleComplete
                                            ? "Your listing title has been provided."
                                            : "Your title should contain at least 5 characters."
                                    }
                                />

                                <ChecklistItem
                                    complete={descriptionComplete}
                                    title="Description provided"
                                    description={
                                        descriptionComplete
                                            ? "Your vehicle description has been provided."
                                            : "Your description should contain at least 10 characters."
                                    }
                                />

                                <ChecklistItem
                                    complete={hasImages}
                                    title="Vehicle photos uploaded"
                                    description={
                                        hasImages
                                            ? `${images.length} image${images.length === 1 ? "" : "s"} currently attached to this listing.`
                                            : "Upload at least one vehicle photo."
                                    }
                                />

                                <ChecklistItem
                                    complete={imageChecksComplete}
                                    title="Initial image checks completed"
                                    description={
                                        imageSummary.failed > 0
                                            ? "Resolve images that failed their initial checks."
                                            : imageSummary.pending > 0
                                              ? "Wait for pending image checks to finish."
                                              : imageSummary.review > 0
                                                ? "Some images require review. The backend determines final eligibility."
                                                : imageChecksComplete
                                                  ? "No pending or failed initial image checks."
                                                  : "Upload at least one image and complete its initial checks."
                                    }
                                />
                            </div>

                            {/* SUBMISSION ACTION */}

                            <div className="border-t border-slate-100 bg-slate-50/70 p-5">
                                {editable ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                void handleSubmitForReview()
                                            }
                                            disabled={
                                                !submitAllowed ||
                                                images.length === 0
                                            }
                                            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
                                            style={{
                                                backgroundColor:
                                                    submitAllowed &&
                                                    images.length > 0
                                                        ? BRAND_PURPLE
                                                        : undefined,
                                            }}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <LoaderCircle
                                                        size={17}
                                                        className="animate-spin"
                                                    />

                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <UploadCloud
                                                        size={17}
                                                    />

                                                    Submit for review
                                                </>
                                            )}
                                        </button>

                                        <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                                            Your listing will be sent
                                            for administrative review.
                                            Final eligibility is
                                            determined by KARMASS
                                            backend services.
                                        </p>
                                    </>
                                ) : (
                                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                                <ShieldCheck size={18} />
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">
                                                    Submission unavailable
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                                    This listing cannot
                                                    currently be edited
                                                    or submitted for
                                                    review because of
                                                    its current status.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* ====================================
                            SECURITY NOTE
                        ==================================== */}

                        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                            <ShieldCheck
                                size={17}
                                className="mt-0.5 shrink-0"
                                style={{
                                    color: BRAND_PURPLE,
                                }}
                            />

                            <p className="text-xs leading-5 text-slate-500">
                                <span className="font-semibold text-slate-700">
                                    Protected review process.
                                </span>{" "}
                                Submission and moderation decisions
                                are enforced by KARMASS backend
                                services.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
            {imageFailureModalOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setImageFailureModalOpen(false);
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="image-failure-title"
                        className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl"
                    >
                        <div className="flex items-start gap-4 border-b border-red-100 bg-gradient-to-br from-red-50 to-white p-6 sm:p-7">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                                <ShieldAlert size={24} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600">Image verification</p>
                                <h2 id="image-failure-title" className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Some photos need attention</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600">We can’t submit this listing until the failed images are corrected. Your listing details are saved.</p>
                            </div>
                            <button type="button" aria-label="Close dialog" onClick={() => setImageFailureModalOpen(false)} className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"><X size={20} /></button>
                        </div>
                        <div className="max-h-[48vh] space-y-3 overflow-y-auto p-6 sm:p-7">
                            {editor?.images.filter((image) => image.imageCheckStatus === "FAILED").map((image, index) => (
                                <div key={image.id} className="rounded-2xl border border-red-100 bg-red-50/70 p-4">
                                    <p className="text-sm font-semibold text-slate-900">Photo {image.sortOrder + 1 || index + 1}: verification failed</p>
                                    <p className="mt-1.5 text-sm leading-6 text-slate-700">{image.checkReason?.trim() || "This photo did not pass the platform’s image checks."}</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-600"><strong>What to do:</strong> use a genuine, clear photo of the listed vehicle. Avoid reusing photos from another listing or using images with promotional overlays or watermarks. Replace the photo and wait for the new checks to finish.</p>
                                </div>
                            ))}
                            <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4">
                                <p className="text-sm font-semibold text-slate-900">Need help understanding the rules?</p>
                                <p className="mt-1 text-sm leading-6 text-slate-600">Read the image-upload policy for guidance on acceptable vehicle photos and how verification works.</p>
                                <Link href="/policies/listing-images" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-purple-700 underline decoration-purple-300 underline-offset-4 hover:text-purple-900">Read image-upload policy <ExternalLink size={15} /></Link>
                            </div>
                        </div>
                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-white p-6 sm:flex-row sm:justify-end sm:p-7">
                            <button type="button" onClick={() => setImageFailureModalOpen(false)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Keep editing</button>
                            <button type="button" onClick={() => { setImageFailureModalOpen(false); document.getElementById("listing-image-uploader")?.scrollIntoView({ behavior: "smooth", block: "center" }); }} className="rounded-xl bg-[#7008E7] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-800">Fix photos</button>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}