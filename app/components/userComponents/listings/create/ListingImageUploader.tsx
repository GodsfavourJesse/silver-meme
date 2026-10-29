"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import Image from "next/image";

import {
    AlertCircle,
    Clock3,
    ImagePlus,
    LoaderCircle,
    RefreshCw,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    UploadCloud,
    X,
} from "lucide-react";

import {
    getListingImageAnalysis,
    uploadListingImage,
} from "@/app/services/user/listings/listing.service";

import {
    type ImageAnalysisDecision,
    type ImageAnalysisStatusResponse,
    type ListingImageRecord,
} from "@/app/types/user/listings/listing-image.types";

// ============================================================
// TYPES
// ============================================================

interface ListingImageUploaderProps {
    listingId: string;
    images?: ListingImageRecord[];
    onImagesChange?: (
        images: ListingImageRecord[],
    ) => void;
    maxImages?: number;
    maxFileSizeMb?: number;
    disabled?: boolean;
}

interface LocalImage {
    id: string;
    file: File;
    previewUrl: string;
    status:
        | "READY"
        | "UPLOADING"
        | "UPLOADED"
        | "FAILED";
    progress: number;
    error?: string;
    image?: ListingImageRecord;
    analysis?: ImageAnalysisStatusResponse["data"];
    analysisError?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const BRAND_PURPLE = "#7008E7";

const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const DEFAULT_MAX_IMAGES = 10;
const DEFAULT_MAX_FILE_SIZE_MB = 10;

// ============================================================
// HELPERS
// ============================================================

function formatBytes(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getAnalysisDecision(
    analysis: ImageAnalysisStatusResponse["data"] | undefined,
): ImageAnalysisDecision | null {
    if (!analysis) {
        return null;
    }

    // Prefer the normalized state returned by the backend.
    if (
        analysis.analysisState === "PASSED" ||
        analysis.analysisState === "REVIEW" ||
        analysis.analysisState === "FAILED"
    ) {
        return analysis.analysisState;
    }

    // Fallback for responses where the run has a decision,
    // but the normalized state is not yet available.
    return analysis.run?.decision ?? null;
}

function getAnalysisLabel(
    analysis: ImageAnalysisStatusResponse["data"] | undefined,
): string {
    if (!analysis) {
        return "Analysis status unavailable";
    }

    switch (analysis.analysisState) {
        case "PENDING":
            return "Preparing image checks";

        case "QUEUED":
            return "Waiting for image checks";

        case "PROCESSING":
            return "Checking image";

        case "PASSED":
            return "Image checks passed";

        case "REVIEW":
            return "Additional review required";

        case "FAILED":
            return "Image checks failed";

        case "CANCELLED":
            return "Image checks cancelled";

        default:
            break;
    }

    // Compatibility fallback while the API rollout is completed.
    if (analysis.job?.status === "QUEUED") {
        return "Waiting for image checks";
    }

    if (
        analysis.job?.status === "PROCESSING" ||
        analysis.run?.status === "RUNNING"
    ) {
        return "Checking image";
    }

    if (
        analysis.job?.status === "FAILED" ||
        analysis.run?.status === "FAILED"
    ) {
        return "Image checks failed";
    }

    if (
        analysis.job?.status === "CANCELLED" ||
        analysis.run?.status === "CANCELLED"
    ) {
        return "Image checks cancelled";
    }

    const decision = getAnalysisDecision(analysis);

    if (decision === "PASSED") {
        return "Image checks passed";
    }

    if (decision === "REVIEW") {
        return "Additional review required";
    }

    if (decision === "FAILED") {
        return "Image checks failed";
    }

    return "Analysis status unavailable";
}

function getAnalysisDescription(
    analysis: ImageAnalysisStatusResponse["data"] | undefined,
): string | null {
    if (!analysis) {
        return null;
    }

    const state = analysis.analysisState;
    const decision = getAnalysisDecision(analysis);

    if (state === "FAILED") {
        return (
            analysis.failureReason ??
            analysis.image?.checkReason ??
            analysis.run?.decisionReason ??
            "We couldn't complete the image checks. Please try again."
        );
    }

    if (state === "CANCELLED") {
        return (
            analysis.failureReason ??
            "The image checks were cancelled. Please try again."
        );
    }

    if (state === "QUEUED") {
        return "Your image has been received and is waiting to be checked.";
    }

    if (state === "PROCESSING") {
        return "We're checking your image. This may take a short while.";
    }

    if (state === "PASSED" || decision === "PASSED") {
        return (
            analysis.image?.checkReason ??
            analysis.run?.decisionReason ??
            "Your image passed the initial checks."
        );
    }

    if (state === "REVIEW" || decision === "REVIEW") {
        return (
            analysis.image?.checkReason ??
            analysis.run?.decisionReason ??
            "Your image needs additional review before it can be approved."
        );
    }

    if (decision === "FAILED") {
        return (
            analysis.failureReason ??
            analysis.image?.checkReason ??
            analysis.run?.decisionReason ??
            "Your image did not pass the initial checks."
        );
    }

    return null;
}

function isAnalysisTerminal(
    analysis: ImageAnalysisStatusResponse["data"] | undefined,
): boolean {
    if (!analysis) {
        return false;
    }

    // The normalized backend state is the primary source of truth.
    switch (analysis.analysisState) {
        case "PASSED":
        case "REVIEW":
        case "FAILED":
        case "CANCELLED":
            return true;

        case "PENDING":
        case "QUEUED":
        case "PROCESSING":
            return false;
    }

    // Compatibility fallback for older API responses.
    if (
        analysis.job?.status === "FAILED" ||
        analysis.job?.status === "CANCELLED"
    ) {
        return true;
    }

    if (
        analysis.job?.status === "COMPLETED" &&
        analysis.run?.status !== "RUNNING"
    ) {
        return true;
    }

    return (
        analysis.run?.status === "COMPLETED" ||
        analysis.run?.status === "FAILED" ||
        analysis.run?.status === "CANCELLED"
    );
}

function getDecisionStyles(
    decision: ImageAnalysisDecision | null,
): string {
    if (decision === "PASSED") {
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (decision === "REVIEW") {
        return "border-amber-200 bg-amber-50 text-amber-700";
    }

    if (decision === "FAILED") {
        return "border-red-200 bg-red-50 text-red-700";
    }

    return "border-slate-200 bg-slate-50 text-slate-500";
}

function DecisionIcon({
    decision,
}: {
    decision: ImageAnalysisDecision | null;
}) {
    if (decision === "PASSED") {
        return <ShieldCheck size={14} />;
    }

    if (decision === "REVIEW") {
        return <ShieldAlert size={14} />;
    }

    if (decision === "FAILED") {
        return <AlertCircle size={14} />;
    }

    return <Clock3 size={14} />;
}

function getResultLabel(resultType: string): string {
    const labels: Record<string, string> = {
        SHA256: "Exact duplicate check",
        PERCEPTUAL_HASH: "Visual similarity check",
        EMBEDDING: "Image similarity analysis",
        OCR: "Text recognition",
        MODERATION: "Content moderation",
        WATERMARK: "Watermark detection",
        DUPLICATE: "Duplicate detection",
    };

    return labels[resultType] ?? resultType;
}

// ============================================================
// COMPONENT
// ============================================================

export default function ListingImageUploader({
    listingId,
    images = [],
    onImagesChange,
    maxImages = DEFAULT_MAX_IMAGES,
    maxFileSizeMb = DEFAULT_MAX_FILE_SIZE_MB,
    disabled = false,
}: ListingImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const mountedRef = useRef(true);

    const [localImages, setLocalImages] = useState<LocalImage[]>([]);

    const [serverImages, setServerImages] =
        useState<ListingImageRecord[]>(images);

    const [isUploadingAll, setIsUploadingAll] =
        useState(false);

    const [globalError, setGlobalError] =
        useState<string | null>(null);

    const maxFileSizeBytes =
        maxFileSizeMb * 1024 * 1024;

    const uploadedCount = serverImages.length;

    const pendingCount = localImages.filter(
        (image) =>
            image.status === "READY" ||
            image.status === "UPLOADING",
    ).length;

    const remainingSlots = Math.max(
        0,
        maxImages - uploadedCount - pendingCount,
    );

    const failedCount = localImages.filter(
        (image) => image.status === "FAILED",
    ).length;

    // ========================================================
    // CLEANUP PREVIEW URLS
    // ========================================================

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;

            for (const image of localImages) {
                URL.revokeObjectURL(image.previewUrl);
            }
        };

        // Preview URLs are created and owned by this component.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ========================================================
    // SYNC SERVER IMAGES
    // ========================================================

    useEffect(() => {
        setServerImages(images);
    }, [images]);

    // ========================================================
    // LOCAL STATE HELPERS
    // ========================================================

    const updateLocalImage = useCallback(
        (
            localId: string,
            update: Partial<LocalImage>,
        ) => {
            setLocalImages((current) =>
                current.map((image) =>
                    image.id === localId
                        ? { ...image, ...update }
                        : image,
                ),
            );
        },
        [],
    );

    const publishServerImages = useCallback(
        (nextImages: ListingImageRecord[]) => {
            setServerImages(nextImages);
            onImagesChange?.(nextImages);
        },
        [onImagesChange],
    );

    // ========================================================
    // SELECT FILES
    // ========================================================

    const handleFileSelection = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setGlobalError(null);

            const selectedFiles = Array.from(
                event.target.files ?? [],
            );

            event.target.value = "";

            if (selectedFiles.length === 0) {
                return;
            }

            const acceptedFiles: File[] = [];
            const errors: string[] = [];

            const availableSlots = Math.max(
                0,
                maxImages -
                    serverImages.length -
                    localImages.filter(
                        (image) => image.status !== "FAILED",
                    ).length,
            );

            for (const file of selectedFiles) {
                if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                    errors.push(
                        `${file.name}: use JPEG, PNG, or WebP.`,
                    );
                    continue;
                }

                if (file.size > maxFileSizeBytes) {
                    errors.push(
                        `${file.name}: the maximum file size is ${maxFileSizeMb} MB.`,
                    );
                    continue;
                }

                acceptedFiles.push(file);
            }

            if (acceptedFiles.length > availableSlots) {
                errors.push(
                    `You can add ${availableSlots} more photo${availableSlots === 1 ? "" : "s"}.`,
                );
            }

            const filesToAdd = acceptedFiles.slice(
                0,
                availableSlots,
            );

            const newImages: LocalImage[] =
                filesToAdd.map((file) => ({
                    id: crypto.randomUUID(),
                    file,
                    previewUrl: URL.createObjectURL(file),
                    status: "READY",
                    progress: 0,
                }));

            setLocalImages((current) => [
                ...current,
                ...newImages,
            ]);

            if (errors.length > 0) {
                setGlobalError(errors.join(" "));
            }
        },
        [
            localImages,
            maxFileSizeBytes,
            maxFileSizeMb,
            maxImages,
            serverImages.length,
        ],
    );

    // ========================================================
    // UPLOAD ONE IMAGE
    // ========================================================

    const uploadImage = useCallback(
        async (localImage: LocalImage) => {
            updateLocalImage(localImage.id, {
                status: "UPLOADING",
                progress: 15,
                error: undefined,
                analysisError: undefined,
            });

            try {
                const nextSortOrder = serverImages.length;

                /*
                * The backend now:
                * 1. Validates the image.
                * 2. Normalizes and stores it.
                * 3. Creates the listing image record.
                * 4. Creates the durable analysis job.
                *
                * These database records are committed together.
                */
                const response = await uploadListingImage(
                    listingId,
                    localImage.file,
                    nextSortOrder,
                );

                const uploadedImage = response.data.image;

                /*
                * Update the server image collection.
                */
                publishServerImages([
                    ...serverImages,
                    uploadedImage,
                ]);

                /*
                * Mark the upload as complete.
                *
                * This does not mean image analysis has passed.
                * The analysis worker processes the queued job
                * asynchronously.
                */
                updateLocalImage(localImage.id, {
                    status: "UPLOADED",
                    progress: 100,
                    image: uploadedImage,
                    analysisError: undefined,
                });
            } catch (error) {
                updateLocalImage(localImage.id, {
                    status: "FAILED",
                    error:
                        error instanceof Error
                            ? error.message
                            : "The photo could not be uploaded.",
                });
            }
        },
        [
            listingId,
            publishServerImages,
            serverImages,
            updateLocalImage,
        ],
    );

    // ========================================================
    // UPLOAD ALL READY IMAGES
    // ========================================================

    const uploadAll = useCallback(async () => {
        if (isUploadingAll || disabled) {
            return;
        }

        const readyImages = localImages.filter(
            (image) => image.status === "READY",
        );

        if (readyImages.length === 0) {
            return;
        }

        setIsUploadingAll(true);
        setGlobalError(null);

        try {
            for (const image of readyImages) {
                await uploadImage(image);
            }
        } finally {
            if (mountedRef.current) {
                setIsUploadingAll(false);
            }
        }
    }, [
        disabled,
        isUploadingAll,
        localImages,
        uploadImage,
    ]);

    // ========================================================
    // REMOVE LOCAL IMAGE
    // ========================================================

    const removeLocalImage = useCallback(
        (localId: string) => {
            setLocalImages((current) => {
                const target = current.find(
                    (image) => image.id === localId,
                );

                if (target) {
                    URL.revokeObjectURL(target.previewUrl);
                }

                return current.filter(
                    (image) => image.id !== localId,
                );
            });
        },
        [],
    );

    // ========================================================
    // REFRESH ANALYSIS
    // ========================================================

    const refreshAnalysis = useCallback(
        async (localImage: LocalImage) => {
            if (!localImage.image) {
                return;
            }

            try {
                const response =
                    await getListingImageAnalysis(
                        listingId,
                        localImage.image.id,
                    );

                updateLocalImage(localImage.id, {
                    analysis: response.data,
                    analysisError: undefined,
                });
            } catch (error) {
                updateLocalImage(localImage.id, {
                    analysisError:
                        error instanceof Error
                            ? error.message
                            : "Unable to retrieve analysis status.",
                });
            }
        },
        [
            listingId,
            updateLocalImage,
        ],
    );

    // ========================================================
    // POLL ANALYSIS STATUS
    // ========================================================

    useEffect(() => {
        const needsPolling = localImages.some(
            (image) =>
                image.status === "UPLOADED" &&
                image.image &&
                !isAnalysisTerminal(image.analysis),
        );

        if (!needsPolling) {
            return;
        }

        const interval = window.setInterval(() => {
            const candidates = localImages.filter(
                (image) =>
                    image.status === "UPLOADED" &&
                    image.image &&
                    !isAnalysisTerminal(image.analysis),
            );

            for (const image of candidates) {
                void refreshAnalysis(image);
            }
        }, 4000);

        return () => {
            window.clearInterval(interval);
        };
    }, [
        localImages,
        refreshAnalysis,
    ]);

    // ========================================================
    // KEEP THE PARENT'S AUTHORITATIVE IMAGE RECORDS IN SYNC
    // ========================================================
    // The listing editor validates `images`, not this component's
    // local preview state. Poll server-side PENDING records too, so a
    // page refresh or an image uploaded in another session cannot leave
    // the parent form stuck on a stale PENDING status.
    useEffect(() => {
        const pendingImages = serverImages.filter(
            (image) => image.imageCheckStatus === "PENDING",
        );

        if (pendingImages.length === 0 || disabled) return;

        let cancelled = false;
        const poll = async () => {
            const updates = await Promise.allSettled(
                pendingImages.map(async (image) => {
                    const response = await getListingImageAnalysis(listingId, image.id);
                    const analysis = response.data;
                    const decision = getAnalysisDecision(analysis);
                    if (!decision) return null;
                    return {
                        id: image.id,
                        imageCheckStatus: decision,
                        checkReason: analysis.image?.checkReason ?? analysis.run?.decisionReason ?? null,
                        checkedAt: analysis.image?.checkedAt ?? null,
                    };
                }),
            );

            if (cancelled) return;
            const resolved = new Map<string, { imageCheckStatus: ImageAnalysisDecision; checkReason: string | null; checkedAt: string | null }>();
            for (const result of updates) {
                if (result.status === "fulfilled" && result.value) {
                    resolved.set(result.value.id, result.value);
                }
            }
            if (resolved.size === 0) return;
            publishServerImages(serverImages.map((image) => {
                const update = resolved.get(image.id);
                return update ? { ...image, ...update } : image;
            }));
        };

        void poll();
        const interval = window.setInterval(() => void poll(), 3500);
        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [disabled, listingId, publishServerImages, serverImages]);

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <section id="listing-image-uploader" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* HEADER */}

            <div className="border-b border-slate-100 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                        <div
                            className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                            style={{
                                backgroundColor:
                                    "rgba(112, 8, 231, 0.08)",
                                color: BRAND_PURPLE,
                            }}
                        >
                            <ImagePlus size={21} />
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-base font-bold tracking-tight text-slate-900">
                                Vehicle photos
                            </h2>

                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                Upload clear, genuine photos of your
                                vehicle.
                            </p>
                        </div>
                    </div>

                    <div className="shrink-0 rounded-xl border border-purple-100 bg-purple-50 px-4 py-2.5 sm:text-right">
                        <p className="text-xs font-medium text-purple-600">
                            Uploaded photos
                        </p>

                        <p
                            className="mt-0.5 text-xl font-bold tracking-tight"
                            style={{
                                color: BRAND_PURPLE,
                            }}
                        >
                            {uploadedCount}
                            <span className="ml-1 text-sm font-medium text-purple-400">
                                / {maxImages}
                            </span>
                        </p>
                    </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-500">
                    Add exterior, interior, dashboard, engine, and
                    other relevant photos. Image checks help identify
                    duplicate images and content that may need
                    additional review.
                </p>
            </div>

            <div className="space-y-6 p-4 sm:p-6">
                {/* GLOBAL ERROR */}

                {globalError && (
                    <div
                        role="alert"
                        className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                    >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                            <AlertCircle size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-red-800">
                                Please check your selection
                            </p>

                            <p className="mt-1 text-sm leading-6 text-red-700">
                                {globalError}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setGlobalError(null)}
                            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-100 hover:text-red-700"
                            aria-label="Dismiss error"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* FILE INPUT */}

                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    multiple
                    onChange={handleFileSelection}
                    disabled={
                        disabled ||
                        remainingSlots <= 0 ||
                        isUploadingAll
                    }
                    className="hidden"
                />

                {/* UPLOAD DROP AREA */}

                {remainingSlots > 0 && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={disabled || isUploadingAll}
                        className="group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center transition hover:border-purple-300 hover:bg-purple-50/50 focus:outline-none focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-50 sm:py-10"
                    >
                        <div
                            className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition group-hover:scale-105"
                            style={{
                                color: BRAND_PURPLE,
                            }}
                        >
                            <UploadCloud size={25} />
                        </div>

                        <span className="mt-4 text-sm font-bold text-slate-900">
                            Select vehicle photos
                        </span>

                        <span className="mt-1 text-sm text-slate-500">
                            Choose photos from your device
                        </span>

                        <span className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
                            JPEG, PNG, or WebP · Maximum {maxFileSizeMb} MB per photo
                        </span>

                        <span
                            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold"
                            style={{
                                color: BRAND_PURPLE,
                            }}
                        >
                            <ImagePlus size={14} />

                            {remainingSlots} photo slot
                            {remainingSlots === 1 ? "" : "s"} remaining
                        </span>
                    </button>
                )}

                {remainingSlots <= 0 && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <AlertCircle
                            size={19}
                            className="mt-0.5 shrink-0 text-amber-600"
                        />

                        <div>
                            <p className="text-sm font-semibold text-amber-800">
                                Photo limit reached
                            </p>

                            <p className="mt-1 text-sm leading-6 text-amber-700">
                                You have reached the maximum of{" "}
                                {maxImages} photos for this listing.
                            </p>
                        </div>
                    </div>
                )}

                {/* SELECTED IMAGES */}

                {localImages.length > 0 && (
                    <div>
                        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    Selected photos
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                    Review your selections before
                                    uploading them.
                                </p>
                            </div>

                            <span className="text-xs font-medium text-slate-500">
                                {localImages.length} selected
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {localImages.map((image, index) => {
                                const decision =
                                    getAnalysisDecision(image.analysis);

                                const analysisLabel =
                                    getAnalysisLabel(image.analysis);

                                const analysisDescription =
                                    getAnalysisDescription(image.analysis);

                                return (
                                    <article
                                        key={image.id}
                                        className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
                                    >
                                        {/* IMAGE PREVIEW */}

                                        <div className="relative aspect-[4/3] bg-slate-100">
                                            <Image
                                                src={image.previewUrl}
                                                alt={`Selected vehicle photo ${index + 1}`}
                                                fill
                                                unoptimized
                                                sizes="(max-width: 640px) 50vw, 25vw"
                                                className="object-cover"
                                            />

                                            <div className="absolute left-2 top-2 rounded-md bg-black/65 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                                                Photo {index + 1}
                                            </div>

                                            {image.status !== "UPLOADING" && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeLocalImage(
                                                            image.id,
                                                        )
                                                    }
                                                    disabled={disabled}
                                                    aria-label={`Remove selected photo ${index + 1}`}
                                                    className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-lg bg-white/95 text-slate-600 shadow-sm transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}

                                            {image.status === "UPLOADING" && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55">
                                                    <div
                                                        className="flex size-12 items-center justify-center rounded-xl bg-white shadow-sm"
                                                        style={{
                                                            color: BRAND_PURPLE,
                                                        }}
                                                    >
                                                        <LoaderCircle
                                                            size={25}
                                                            className="animate-spin"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* IMAGE DETAILS */}

                                        <div className="space-y-3 p-3">
                                            <p
                                                className="truncate text-xs font-semibold text-slate-800"
                                                title={image.file.name}
                                            >
                                                {image.file.name}
                                            </p>

                                            <p className="text-[11px] text-slate-400">
                                                {formatBytes(
                                                    image.file.size,
                                                )}
                                            </p>

                                            {image.status === "READY" && (
                                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] font-medium text-slate-600">
                                                    <Clock3 size={13} />
                                                    Ready to upload
                                                </span>
                                            )}

                                            {image.status === "UPLOADING" && (
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between gap-2 text-[11px]">
                                                        <span className="font-medium text-slate-600">
                                                            Uploading
                                                        </span>

                                                        <span
                                                            className="font-semibold"
                                                            style={{
                                                                color: BRAND_PURPLE,
                                                            }}
                                                        >
                                                            {image.progress}%
                                                        </span>
                                                    </div>

                                                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                                        <div
                                                            className="h-full rounded-full transition-all"
                                                            style={{
                                                                width: `${image.progress}%`,
                                                                backgroundColor:
                                                                    BRAND_PURPLE,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {image.status === "UPLOADED" && (
                                                <div>
                                                    <span
                                                        className={`inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] font-medium ${getDecisionStyles(decision)}`}
                                                    >
                                                        <DecisionIcon
                                                            decision={decision}
                                                        />

                                                        <span className="truncate">
                                                            {analysisLabel}
                                                        </span>
                                                    </span>

                                                    {analysisDescription && (
                                                        <p className="mt-2 text-[11px] leading-5 text-slate-500">
                                                            {analysisDescription}
                                                        </p>
                                                    )}

                                                    {image.analysisError && (
                                                        <p className="mt-2 break-words text-[11px] leading-5 text-amber-700">
                                                            {image.analysisError}
                                                        </p>
                                                    )}

                                                    {image.analysis?.results &&
                                                        image.analysis.results.length > 0 && (
                                                            <details className="mt-3">
                                                                <summary
                                                                    className="cursor-pointer text-[11px] font-semibold hover:opacity-75"
                                                                    style={{
                                                                        color: BRAND_PURPLE,
                                                                    }}
                                                                >
                                                                    View analysis results
                                                                </summary>

                                                                <div className="mt-2 space-y-2">
                                                                    {image.analysis.results.map(
                                                                        (result) => (
                                                                            <div
                                                                                key={result.id}
                                                                                className="rounded-lg border border-slate-200 bg-slate-50 p-2"
                                                                            >
                                                                                <p className="text-[11px] font-semibold text-slate-700">
                                                                                    {getResultLabel(
                                                                                        result.resultType,
                                                                                    )}
                                                                                </p>

                                                                                <p className="mt-1 break-words text-[10px] leading-4 text-slate-500">
                                                                                    {result.reason ??
                                                                                        (result.passed === true
                                                                                            ? "Check passed."
                                                                                            : result.passed === false
                                                                                              ? "Check did not pass."
                                                                                              : "Result recorded.")}
                                                                                </p>

                                                                                {result.score !== null && (
                                                                                    <p className="mt-1 text-[10px] text-slate-400">
                                                                                        Score:{" "}
                                                                                        {result.score}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </details>
                                                        )}

                                                    {isAnalysisTerminal(
                                                        image.analysis,
                                                    ) &&
                                                        image.analysis?.job?.status === "FAILED" && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    void refreshAnalysis(
                                                                        image,
                                                                    )
                                                                }
                                                                className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold hover:opacity-75"
                                                                style={{
                                                                    color: BRAND_PURPLE,
                                                                }}
                                                            >
                                                                <RefreshCw
                                                                    size={12}
                                                                />
                                                                Refresh status
                                                            </button>
                                                        )}
                                                </div>
                                            )}

                                            {image.status === "FAILED" && (
                                                <div className="rounded-lg border border-red-200 bg-red-50 p-2.5">
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700">
                                                        <AlertCircle
                                                            size={13}
                                                        />
                                                        Upload failed
                                                    </span>

                                                    <p className="mt-2 break-words text-[11px] leading-5 text-red-600">
                                                        {image.error}
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateLocalImage(
                                                                image.id,
                                                                {
                                                                    status: "READY",
                                                                    error: undefined,
                                                                },
                                                            )
                                                        }
                                                        disabled={disabled}
                                                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-900 disabled:opacity-50"
                                                    >
                                                        <RefreshCw size={12} />
                                                        Try again
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {/* UPLOAD ACTIONS */}

                        <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                {failedCount > 0 ? (
                                    <p className="text-xs leading-5 text-red-600">
                                        {failedCount} photo upload
                                        {failedCount === 1 ? "" : "s"}{" "}
                                        failed. Retry before continuing.
                                    </p>
                                ) : (
                                    <p className="text-xs leading-5 text-slate-500">
                                        {uploadedCount} photo
                                        {uploadedCount === 1 ? "" : "s"}{" "}
                                        uploaded successfully.
                                    </p>
                                )}

                                <p className="mt-1 text-xs text-slate-400">
                                    Uploads are processed sequentially.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => void uploadAll()}
                                disabled={
                                    disabled ||
                                    isUploadingAll ||
                                    localImages.every(
                                        (image) =>
                                            image.status !== "READY",
                                    )
                                }
                                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none sm:w-auto"
                                style={{
                                    backgroundColor:
                                        !disabled &&
                                        !isUploadingAll &&
                                        localImages.some(
                                            (image) =>
                                                image.status === "READY",
                                        )
                                            ? BRAND_PURPLE
                                            : undefined,
                                }}
                            >
                                {isUploadingAll ? (
                                    <>
                                        <LoaderCircle
                                            size={17}
                                            className="animate-spin"
                                        />
                                        Uploading photos...
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud size={17} />
                                        Upload selected photos
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* SERVER IMAGE RECORDS */}

                {serverImages.length > 0 && (
                    <div className="border-t border-slate-100 pt-6">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">
                                Uploaded image records
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                These images have been accepted by the
                                upload endpoint. Their final moderation
                                decisions are determined by the
                                image-analysis pipeline.
                            </p>
                        </div>

                        <div className="mt-4 space-y-2">
                            {serverImages.map((image, index) => {
                                const imageDecision:
                                    ImageAnalysisDecision | null =
                                    image.imageCheckStatus === "PASSED"
                                        ? "PASSED"
                                        : image.imageCheckStatus === "REVIEW"
                                          ? "REVIEW"
                                          : image.imageCheckStatus === "FAILED"
                                            ? "FAILED"
                                            : null;

                                return (
                                    <div
                                        key={image.id}
                                        className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-slate-300"
                                    >
                                        <div
                                            className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                                            style={{
                                                backgroundColor:
                                                    "rgba(112, 8, 231, 0.07)",
                                                color: BRAND_PURPLE,
                                            }}
                                        >
                                            <ImagePlus size={17} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-semibold text-slate-800">
                                                Vehicle photo {index + 1}
                                            </p>

                                            <p className="mt-1 truncate text-[10px] text-slate-400">
                                                {image.id}
                                            </p>
                                        </div>

                                        <span
                                            className={`shrink-0 rounded-lg border px-2 py-1 text-[10px] font-semibold ${getDecisionStyles(
                                                imageDecision,
                                            )}`}
                                        >
                                            {image.imageCheckStatus}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* EMPTY STATE */}

                {localImages.length === 0 &&
                    serverImages.length === 0 && (
                        <div className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50/70 px-5 py-7 text-center">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
                                <ImagePlus size={20} />
                            </div>

                            <p className="mt-3 text-sm font-semibold text-slate-800">
                                No photos uploaded yet
                            </p>

                            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                                Add clear vehicle photos to help buyers
                                understand the condition of your vehicle.
                            </p>
                        </div>
                    )}

                {/* FOOTER NOTE */}

                <div className="flex items-start gap-3 rounded-xl border border-purple-100 bg-purple-50/60 p-4">
                    <ShieldCheck
                        size={18}
                        className="mt-0.5 shrink-0"
                        style={{
                            color: BRAND_PURPLE,
                        }}
                    />

                    <p className="text-xs leading-5 text-slate-600">
                        <span className="font-semibold text-slate-800">
                            Image verification.
                        </span>{" "}
                        Uploaded photos are subject to KARMASS image
                        checks. A successful upload does not necessarily
                        mean the image has passed moderation.
                    </p>
                </div>
            </div>
        </section>
    );
}