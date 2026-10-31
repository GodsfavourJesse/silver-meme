"use client";

import { useRouter } from "next/navigation";

import {
    ArrowLeft,
    ArrowUpRight,
    CalendarDays,
    CarFront,
    CheckCircle2,
    ChevronRight,
    ClipboardCheck,
    Clock3,
    ExternalLink,
    FileText,
    Gauge,
    Image as ImageIcon,
    MapPin,
    Pencil,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    Wallet,
} from "lucide-react";

import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "framer-motion";

import ListingImageUploader from
    "@/app/components/userComponents/listings/create/ListingImageUploader";

import {
    ChecklistItem,
    EditorFeedback,
    EditorStatusBadge,
    formatDate,
    formatMileage,
    formatPrice,
    ImageSummaryBar,
    ListingEditorViewProps,
} from "./listing-editor.shared";

export default function ListingEditorDesktop(
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

    const checklist = [
        {
            label: "Vehicle title",
            description: "A clear title helps buyers find your vehicle.",
            complete: titleComplete,
        },
        {
            label: "Vehicle description",
            description: "Provide enough information about your vehicle.",
            complete: descriptionComplete,
        },
        {
            label: "Vehicle photos",
            description: "Upload at least one clear vehicle photo.",
            complete: hasImages,
        },
        {
            label: "Photo verification",
            description: "All photos must pass their initial checks.",
            complete: imageChecksComplete,
        },
    ];

    const completedCount = checklist.filter(
        (item) => item.complete,
    ).length;

    const progress = (completedCount / checklist.length) * 100;

    const fadeUp = {
        initial: shouldReduceMotion
            ? {}
            : { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: shouldReduceMotion ? 0 : 0.35 },
    };

    return (
        <main className="min-h-screen bg-[#F5F7FA] px-6 py-8 xl:px-10">
            <div className="mx-auto max-w-[1440px]">
                {/* Top navigation */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/my-listings")}
                            className="group mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#1491FF]"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            My listings
                        </button>

                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                                Manage listing
                            </h1>

                            <EditorStatusBadge status={listing.status} />
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            Review your vehicle details, photos and listing readiness.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void loadListing()}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#1491FF]/30 hover:text-[#1491FF]"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                </div>

                <EditorFeedback
                    error={error}
                    success={success}
                    onDismissError={() => setError("")}
                />

                {/* Vehicle overview */}
                <motion.section
                    {...fadeUp}
                    className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                    <div className="flex flex-col justify-between gap-6 p-6 xl:flex-row xl:items-center">
                        <div className="flex min-w-0 items-start gap-5">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#1491FF]/10 text-[#1491FF]">
                                <CarFront className="h-8 w-8" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-400">
                                    Vehicle listing
                                </p>

                                <h2 className="mt-1 truncate text-xl font-bold text-slate-950">
                                    {listing.title || "Untitled vehicle"}
                                </h2>

                                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                                    {location && (
                                        <span className="inline-flex items-center gap-1.5">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {location}
                                        </span>
                                    )}

                                    <span className="inline-flex items-center gap-1.5">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        Created {formatDate(listing.createdAt)}
                                    </span>

                                    <span className="inline-flex items-center gap-1.5">
                                        <ImageIcon className="h-3.5 w-3.5" />
                                        {images.length} photos
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-start gap-3 xl:items-end">
                            <p className="text-xs font-medium text-slate-400">
                                Asking price
                            </p>

                            <p className="text-2xl font-bold tracking-tight text-slate-950">
                                {formatPrice(listing.price, listing.currency)}
                            </p>

                            {editable && (
                                <button
                                    type="button"
                                    onClick={() => router.push(listingEditUrl)}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#1491FF] transition hover:text-[#087FE5]"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit vehicle details
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </motion.section>

                <div className="mt-7 grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,1fr)_340px]">
                    {/* Main workspace */}
                    <div className="min-w-0 space-y-7">
                        {/* Vehicle information */}
                        <motion.section
                            {...fadeUp}
                            transition={{
                                delay: 0.04,
                                duration: shouldReduceMotion ? 0 : 0.35,
                            }}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-[#1491FF]" />

                                        <h3 className="text-base font-bold text-slate-900">
                                            Vehicle information
                                        </h3>
                                    </div>

                                    <p className="mt-1 text-xs text-slate-500">
                                        The details buyers see when viewing your listing.
                                    </p>
                                </div>

                                {editable && (
                                    <button
                                        type="button"
                                        onClick={() => router.push(listingEditUrl)}
                                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#1491FF] transition hover:bg-blue-50"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit details
                                    </button>
                                )}
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-3">
                                <InfoItem
                                    icon={<Wallet />}
                                    label="Price"
                                    value={formatPrice(
                                        listing.price,
                                        listing.currency,
                                    )}
                                />

                                <InfoItem
                                    icon={<Gauge />}
                                    label="Mileage"
                                    value={formatMileage(listing.mileage)}
                                />

                                <InfoItem
                                    icon={<CarFront />}
                                    label="Condition"
                                    value={listing.condition || "Not specified"}
                                />

                                <InfoItem
                                    icon={<MapPin />}
                                    label="Location"
                                    value={location || "Not specified"}
                                />

                                <InfoItem
                                    icon={<CalendarDays />}
                                    label="Date created"
                                    value={formatDate(listing.createdAt)}
                                />
                            </div>

                            {listing.description && (
                                <div className="mt-7 border-t border-slate-100 pt-5">
                                    <p className="text-xs font-semibold text-slate-500">
                                        Description
                                    </p>

                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                                        {listing.description}
                                    </p>
                                </div>
                            )}
                        </motion.section>

                        {/* Photo management */}
                        <motion.section
                            {...fadeUp}
                            transition={{
                                delay: 0.08,
                                duration: shouldReduceMotion ? 0 : 0.35,
                            }}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4 text-[#1491FF]" />

                                        <h3 className="text-base font-bold text-slate-900">
                                            Vehicle photos
                                        </h3>
                                    </div>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Manage the photos displayed on your vehicle listing.
                                    </p>
                                </div>

                                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                    {images.length} uploaded
                                </span>
                            </div>

                            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <p className="text-xs font-semibold text-slate-700">
                                        Image verification
                                    </p>

                                    {imageSummary.failed > 0 ? (
                                        <span className="text-xs font-semibold text-red-600">
                                            Attention required
                                        </span>
                                    ) : imageSummary.pending > 0 ? (
                                        <span className="text-xs font-semibold text-amber-600">
                                            Checks in progress
                                        </span>
                                    ) : (
                                        <span className="text-xs font-semibold text-emerald-600">
                                            Checks complete
                                        </span>
                                    )}
                                </div>

                                <ImageSummaryBar summary={imageSummary} />
                            </div>

                            {editable ? (
                                <div
                                    id="listing-image-uploader"
                                    className="mt-6 scroll-mt-8"
                                >
                                    <ListingImageUploader
                                        listingId={listing.id}
                                        images={images}
                                        onImagesChange={handleImagesChange}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            ) : (
                                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-sm text-slate-600">
                                        Photos cannot be changed while this listing is{" "}
                                        <span className="font-semibold">
                                            {listing.status.toLowerCase().replaceAll("_", " ")}
                                        </span>.
                                    </p>
                                </div>
                            )}
                        </motion.section>
                    </div>

                    {/* Review sidebar */}
                    <aside className="space-y-5">
                        <motion.section
                            {...fadeUp}
                            transition={{
                                delay: 0.12,
                                duration: shouldReduceMotion ? 0 : 0.35,
                            }}
                            className="sticky top-6 space-y-5"
                        >
                            {/* Readiness */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ClipboardCheck className="h-4 w-4 text-[#1491FF]" />

                                        <h3 className="text-sm font-bold text-slate-900">
                                            Listing readiness
                                        </h3>
                                    </div>

                                    <span className="text-xs font-bold text-[#1491FF]">
                                        {completedCount}/{checklist.length}
                                    </span>
                                </div>

                                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{
                                            duration: shouldReduceMotion ? 0 : 0.65,
                                        }}
                                        className="h-full rounded-full bg-[#1491FF]"
                                    />
                                </div>

                                <div className="mt-6 space-y-5">
                                    {checklist.map((item) => (
                                        <ChecklistItem
                                            key={item.label}
                                            {...item}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Submission card */}
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 p-6">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1491FF]">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>

                                    <h3 className="mt-4 text-base font-bold text-slate-900">
                                        Ready for review?
                                    </h3>

                                    <p className="mt-2 text-xs leading-6 text-slate-500">
                                        Once submitted, our team will review your
                                        vehicle listing before it becomes available
                                        to buyers.
                                    </p>
                                </div>

                                <div className="space-y-4 p-6">
                                    {listing.status === "REJECTED" &&
                                        listing.rejectionReason && (
                                            <div className="rounded-xl border border-red-100 bg-red-50 p-3">
                                                <p className="text-xs font-semibold text-red-700">
                                                    Previous review feedback
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-red-600">
                                                    {listing.rejectionReason}
                                                </p>
                                            </div>
                                        )}

                                    {submitAllowed ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => void handleSubmitForReview()}
                                                disabled={isSubmitting}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-4 py-3.5 text-sm font-bold text-white shadow-sm shadow-blue-200 transition hover:bg-[#087FE5] disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        Submit for review
                                                        <ChevronRight className="h-4 w-4" />
                                                    </>
                                                )}
                                            </button>

                                            <p className="text-center text-[11px] leading-5 text-slate-400">
                                                You can continue editing your listing
                                                until it is submitted.
                                            </p>
                                        </>
                                    ) : (
                                        <div className="rounded-xl bg-slate-50 p-4 text-center">
                                            {listing.status === "PENDING_REVIEW" ? (
                                                <>
                                                    <Clock3 className="mx-auto h-5 w-5 text-amber-500" />

                                                    <p className="mt-2 text-sm font-semibold text-slate-800">
                                                        Review in progress
                                                    </p>

                                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                                        Your listing is waiting for our team.
                                                    </p>
                                                </>
                                            ) : listing.status === "APPROVED" ? (
                                                <>
                                                    <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" />

                                                    <p className="mt-2 text-sm font-semibold text-slate-800">
                                                        Listing published
                                                    </p>

                                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                                        Your vehicle listing has been approved.
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="mx-auto h-5 w-5 text-slate-400" />

                                                    <p className="mt-2 text-sm font-semibold text-slate-800">
                                                        Submission unavailable
                                                    </p>

                                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                                        This listing cannot currently be submitted.
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => router.push("/dashboard/my-listings")}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                    >
                                        Back to my listings
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </motion.section>
                    </aside>
                </div>
            </div>
        </main>
    );
}

function InfoItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="min-w-0">
            <div className="flex items-center gap-2 text-slate-400">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 [&>svg]:h-3.5 [&>svg]:w-3.5">
                    {icon}
                </span>

                <span className="text-xs font-medium">{label}</span>
            </div>

            <p className="mt-2 truncate pl-9 text-sm font-semibold text-slate-800">
                {value}
            </p>
        </div>
    );
}