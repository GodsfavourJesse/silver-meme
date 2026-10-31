"use client";

import { useRouter } from "next/navigation";

import {
    ArrowLeft,
    ArrowRight,
    Camera,
    CarFront,
    CheckCircle2,
    ChevronRight,
    Clock3,
    FileText,
    Image as ImageIcon,
    MapPin,
    Pencil,
    RefreshCw,
    ShieldCheck,
    XCircle,
} from "lucide-react";

import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "framer-motion";

import ListingImageUploader from
    "@/app/components/userComponents/listings/create/ListingImageUploader";

import {
    EditorFeedback,
    EditorStatusBadge,
    formatDate,
    formatMileage,
    formatPrice,
    ImageSummaryBar,
    ListingEditorViewProps,
} from "./listing-editor.shared";

export default function ListingEditorMobile(
    props: ListingEditorViewProps,
) {
    const router = useRouter();
    const shouldReduceMotion = useReducedMotion();

    const {
        editor,
        isSubmitting,
        error,
        success,
        setError,
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
    } = props;

    if (!editor) return null;

    const { listing, images } = editor;

    const listingEditUrl =
        `/my-listings/${encodeURIComponent(listing.id)}/edit-details`;

    const readinessItems = [
        {
            label: "Vehicle title",
            complete: titleComplete,
        },
        {
            label: "Description",
            complete: descriptionComplete,
        },
        {
            label: "Vehicle photos",
            complete: hasImages,
        },
        {
            label: "Photo checks",
            complete: imageChecksComplete,
        },
    ];

    const completedCount = readinessItems.filter(
        (item) => item.complete,
    ).length;

    const progress = (completedCount / readinessItems.length) * 100;

    const motionProps = {
        initial: shouldReduceMotion
            ? {}
            : { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: {
            duration: shouldReduceMotion ? 0 : 0.3,
        },
    };

    return (
        <main className="min-h-dvh bg-[#F4F6F9] text-slate-900">
            {/* App header */}
            <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
                <div className="flex h-[62px] items-center justify-between px-4">
                    <button
                        type="button"
                        onClick={() => router.push("/dashboard/my-listings")}
                        aria-label="Back to my listings"
                        className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition active:bg-slate-100"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>

                    <div className="text-center">
                        <h1 className="text-sm font-bold text-slate-900">
                            Manage listing
                        </h1>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                            Listing ID · {listing.id.slice(0, 8)}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void loadListing()}
                        aria-label="Refresh listing"
                        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition active:bg-slate-100"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>
            </header>

            <div className="mx-auto max-w-xl space-y-4 px-4 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-4">
                <EditorFeedback
                    error={error}
                    success={success}
                    onDismissError={() => setError("")}
                />

                {/* Vehicle summary */}
                <motion.section
                    {...motionProps}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                    <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-start gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1491FF]/10 text-[#1491FF]">
                                    <CarFront className="h-6 w-6" />
                                </div>

                                <div className="min-w-0">
                                    <EditorStatusBadge status={listing.status} />

                                    <h2 className="mt-2 line-clamp-2 text-base font-bold leading-6 text-slate-900">
                                        {listing.title || "Untitled vehicle"}
                                    </h2>

                                    {location && (
                                        <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
                                            <MapPin className="h-3 w-3 shrink-0" />
                                            {location}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
                            <div>
                                <p className="text-[11px] font-medium text-slate-400">
                                    Asking price
                                </p>

                                <p className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                                    {formatPrice(
                                        listing.price,
                                        listing.currency,
                                    )}
                                </p>
                            </div>

                            {editable && (
                                <button
                                    type="button"
                                    onClick={() => router.push(listingEditUrl)}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-[#087FE5] active:bg-blue-100"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>
                </motion.section>

                {/* Review progress */}
                <motion.section
                    {...motionProps}
                    transition={{
                        delay: 0.04,
                        duration: shouldReduceMotion ? 0 : 0.3,
                    }}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-[#1491FF]" />

                                <h3 className="text-sm font-bold text-slate-900">
                                    Listing readiness
                                </h3>
                            </div>

                            <p className="mt-1 text-[11px] text-slate-500">
                                Complete these checks before submitting.
                            </p>
                        </div>

                        <span className="text-sm font-bold text-[#1491FF]">
                            {completedCount}/{readinessItems.length}
                        </span>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{
                                duration: shouldReduceMotion ? 0 : 0.55,
                            }}
                            className="h-full rounded-full bg-[#1491FF]"
                        />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        {readinessItems.map((item) => (
                            <div
                                key={item.label}
                                className="flex items-center gap-2"
                            >
                                {item.complete ? (
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                ) : (
                                    <Clock3 className="h-4 w-4 shrink-0 text-slate-300" />
                                )}

                                <span className="text-[11px] font-medium text-slate-600">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* Vehicle details */}
                <motion.section
                    {...motionProps}
                    transition={{
                        delay: 0.08,
                        duration: shouldReduceMotion ? 0 : 0.3,
                    }}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-[#1491FF]" />

                            <h3 className="text-sm font-bold text-slate-900">
                                Vehicle details
                            </h3>
                        </div>

                        {editable && (
                            <button
                                type="button"
                                onClick={() => router.push(listingEditUrl)}
                                className="flex items-center gap-1 text-xs font-bold text-[#1491FF]"
                            >
                                Edit
                                <ArrowRight className="h-3 w-3" />
                            </button>
                        )}
                    </div>

                    <div className="divide-y divide-slate-100 px-4">
                        <MobileDetail
                            label="Mileage"
                            value={formatMileage(listing.mileage)}
                        />

                        <MobileDetail
                            label="Condition"
                            value={listing.condition || "Not specified"}
                        />

                        <MobileDetail
                            label="Location"
                            value={location || "Not specified"}
                        />

                        <MobileDetail
                            label="Date created"
                            value={formatDate(listing.createdAt)}
                        />
                    </div>

                    {listing.description && (
                        <div className="border-t border-slate-100 px-4 py-4">
                            <p className="text-xs font-semibold text-slate-500">
                                Description
                            </p>

                            <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-slate-600">
                                {listing.description}
                            </p>
                        </div>
                    )}
                </motion.section>

                {/* Photo section */}
                <motion.section
                    {...motionProps}
                    transition={{
                        delay: 0.12,
                        duration: shouldReduceMotion ? 0 : 0.3,
                    }}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Camera className="h-4 w-4 text-[#1491FF]" />

                            <h3 className="text-sm font-bold text-slate-900">
                                Vehicle photos
                            </h3>
                        </div>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                            {images.length} photos
                        </span>
                    </div>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        Good photos help buyers make confident decisions.
                    </p>

                    <div className="mt-4 rounded-xl bg-slate-50 p-3">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-700">
                                Photo verification
                            </span>

                            {imageSummary.failed > 0 ? (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-red-600">
                                    <XCircle className="h-3 w-3" />
                                    {imageSummary.failed} failed
                                </span>
                            ) : imageSummary.pending > 0 ? (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
                                    <Clock3 className="h-3 w-3" />
                                    Checking
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Complete
                                </span>
                            )}
                        </div>

                        <ImageSummaryBar summary={imageSummary} />
                    </div>

                    {editable ? (
                        <div
                            id="listing-image-uploader"
                            className="mt-5 scroll-mt-24"
                        >
                            <ListingImageUploader
                                listingId={listing.id}
                                images={images}
                                onImagesChange={handleImagesChange}
                                disabled={isSubmitting}
                            />
                        </div>
                    ) : (
                        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                <ImageIcon className="h-4 w-4 text-slate-400" />
                                Photo editing is unavailable for this listing.
                            </div>
                        </div>
                    )}
                </motion.section>

                {/* Rejection feedback */}
                <AnimatePresence>
                    {listing.status === "REJECTED" &&
                        listing.rejectionReason && (
                            <motion.section
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden rounded-2xl border border-red-200 bg-red-50 p-4"
                            >
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-600" />

                                    <h3 className="text-sm font-bold text-red-800">
                                        Review feedback
                                    </h3>
                                </div>

                                <p className="mt-2 text-xs leading-6 text-red-700">
                                    {listing.rejectionReason}
                                </p>
                            </motion.section>
                        )}
                </AnimatePresence>

                {/* Status information */}
                {listing.status === "PENDING_REVIEW" && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-center gap-2">
                            <Clock3 className="h-4 w-4 text-amber-600" />

                            <p className="text-sm font-bold text-amber-800">
                                Listing under review
                            </p>
                        </div>

                        <p className="mt-1 text-xs leading-5 text-amber-700">
                            Your vehicle is waiting for approval. We will update
                            you when the review is complete.
                        </p>
                    </div>
                )}

                {listing.status === "APPROVED" && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />

                            <p className="text-sm font-bold text-emerald-800">
                                Your listing is published
                            </p>
                        </div>

                        <p className="mt-1 text-xs leading-5 text-emerald-700">
                            Your vehicle listing has been approved.
                        </p>
                    </div>
                )}
            </div>

            {/* Fixed app action bar */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl">
                <div className="mx-auto max-w-xl">
                    {submitAllowed ? (
                        <button
                            type="button"
                            onClick={() => void handleSubmitForReview()}
                            disabled={isSubmitting}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200/70 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Submitting listing...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="h-4 w-4" />
                                    Submit for review
                                    <ChevronRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/my-listings")}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition active:bg-slate-50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to my listings
                        </button>
                    )}

                    <p className="mt-2 text-center text-[10px] text-slate-400">
                        KARMASS · Your vehicle marketplace
                    </p>
                </div>
            </div>
        </main>
    );
}

function MobileDetail({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-3.5">
            <span className="text-xs text-slate-500">{label}</span>

            <span className="max-w-[65%] truncate text-right text-xs font-semibold text-slate-800">
                {value}
            </span>
        </div>
    );
}