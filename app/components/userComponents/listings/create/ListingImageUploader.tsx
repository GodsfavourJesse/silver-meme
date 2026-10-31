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
    Check,
    CheckCircle2,
    Clock3,
    FileImage,
    ImagePlus,
    LoaderCircle,
    RefreshCw,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    UploadCloud,
    X,
    ChevronDown,
    Images,
    Info,
    RotateCw,
} from "lucide-react";

import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "framer-motion";

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

const BRAND_BLUE = "#1491FF";

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
    if (!analysis) return null;

    if (
        analysis.analysisState === "PASSED" ||
        analysis.analysisState === "REVIEW" ||
        analysis.analysisState === "FAILED"
    ) {
        return analysis.analysisState;
    }

    return analysis.run?.decision ?? null;
}

function getAnalysisLabel(
    analysis: ImageAnalysisStatusResponse["data"] | undefined,
): string {
    if (!analysis) {
        return "Status unavailable";
    }

    switch (analysis.analysisState) {
        case "PENDING":
            return "Preparing checks";

        case "QUEUED":
            return "Queued for review";

        case "PROCESSING":
            return "Checking image";

        case "PASSED":
            return "Checks passed";

        case "REVIEW":
            return "Needs review";

        case "FAILED":
            return "Checks failed";

        case "CANCELLED":
            return "Checks cancelled";

        default:
            break;
    }

    if (analysis.job?.status === "QUEUED") {
        return "Queued for review";
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
        return "Checks failed";
    }

    if (
        analysis.job?.status === "CANCELLED" ||
        analysis.run?.status === "CANCELLED"
    ) {
        return "Checks cancelled";
    }

    const decision = getAnalysisDecision(analysis);

    if (decision === "PASSED") return "Checks passed";
    if (decision === "REVIEW") return "Needs review";
    if (decision === "FAILED") return "Checks failed";

    return "Status unavailable";
}

function getAnalysisDescription(
    analysis: ImageAnalysisStatusResponse["data"] | undefined,
): string | null {
    if (!analysis) return null;

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
        return "Your photo has been received and is waiting to be checked.";
    }

    if (state === "PROCESSING") {
        return "Your photo is being checked. This may take a short while.";
    }

    if (state === "PASSED" || decision === "PASSED") {
        return (
            analysis.image?.checkReason ??
            analysis.run?.decisionReason ??
            "Your photo passed the initial checks."
        );
    }

    if (state === "REVIEW" || decision === "REVIEW") {
        return (
            analysis.image?.checkReason ??
            analysis.run?.decisionReason ??
            "Your photo needs additional review."
        );
    }

    if (decision === "FAILED") {
        return (
            analysis.failureReason ??
            analysis.image?.checkReason ??
            analysis.run?.decisionReason ??
            "Your photo did not pass the initial checks."
        );
    }

    return null;
}

function isAnalysisTerminal(
    analysis: ImageAnalysisStatusResponse["data"] | undefined,
): boolean {
    if (!analysis) return false;

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
    switch (decision) {
        case "PASSED":
            return "border-emerald-200 bg-emerald-50 text-emerald-700";

        case "REVIEW":
            return "border-amber-200 bg-amber-50 text-amber-700";

        case "FAILED":
            return "border-red-200 bg-red-50 text-red-700";

        default:
            return "border-slate-200 bg-slate-50 text-slate-500";
    }
}

function getDecisionDot(
    decision: ImageAnalysisDecision | null,
): string {
    switch (decision) {
        case "PASSED":
            return "bg-emerald-500";

        case "REVIEW":
            return "bg-amber-500";

        case "FAILED":
            return "bg-red-500";

        default:
            return "bg-slate-400";
    }
}

function DecisionIcon({
    decision,
}: {
    decision: ImageAnalysisDecision | null;
}) {
    if (decision === "PASSED") {
        return <ShieldCheck size={13} />;
    }

    if (decision === "REVIEW") {
        return <ShieldAlert size={13} />;
    }

    if (decision === "FAILED") {
        return <AlertCircle size={13} />;
    }

    return <Clock3 size={13} />;
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
// MAIN COMPONENT
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

    const serverImagesRef = useRef<ListingImageRecord[]>(images);

    const [localImages, setLocalImages] = useState<LocalImage[]>([]);

    const [serverImages, setServerImages] =
        useState<ListingImageRecord[]>(images);

    const [isUploadingAll, setIsUploadingAll] =
        useState(false);

    const [globalError, setGlobalError] =
        useState<string | null>(null);

    const shouldReduceMotion = useReducedMotion();

    const maxFileSizeBytes =
        maxFileSizeMb * 1024 * 1024;

    const uploadedCount = serverImages.length;

    const readyCount = localImages.filter(
        (image) => image.status === "READY",
    ).length;

    const uploadingCount = localImages.filter(
        (image) => image.status === "UPLOADING",
    ).length;

    const failedCount = localImages.filter(
        (image) => image.status === "FAILED",
    ).length;

    const pendingCount = localImages.filter(
        (image) =>
            image.status === "READY" ||
            image.status === "UPLOADING",
    ).length;

    const remainingSlots = Math.max(
        0,
        maxImages - uploadedCount - pendingCount,
    );

    const hasSelectedImages = localImages.length > 0;

    const allImagesCount = uploadedCount + pendingCount;

    // ========================================================
    // ANIMATION SETTINGS
    // ========================================================

    const cardAnimation = {
        initial: shouldReduceMotion
            ? {}
            : { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: {
            duration: shouldReduceMotion ? 0 : 0.25,
        },
    };

    // ========================================================
    // CLEANUP
    // ========================================================

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;

            for (const image of localImages) {
                URL.revokeObjectURL(image.previewUrl);
            }
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ========================================================
    // SYNC SERVER IMAGES
    // ========================================================

    useEffect(() => {
        serverImagesRef.current = images;
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
            serverImagesRef.current = nextImages;
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

            if (selectedFiles.length === 0) return;

            const acceptedFiles: File[] = [];
            const errors: string[] = [];

            const currentPendingCount = localImages.filter(
                (image) => image.status !== "FAILED",
            ).length;

            const availableSlots = Math.max(
                0,
                maxImages -
                    serverImagesRef.current.length -
                    currentPendingCount,
            );

            for (const file of selectedFiles) {
                if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                    errors.push(
                        `${file.name}: use JPEG, PNG or WebP.`,
                    );
                    continue;
                }

                if (file.size > maxFileSizeBytes) {
                    errors.push(
                        `${file.name}: maximum file size is ${maxFileSizeMb} MB.`,
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
        ],
    );

    // ========================================================
    // UPLOAD ONE IMAGE
    // ========================================================

    const uploadImage = useCallback(
        async (localImage: LocalImage) => {
            updateLocalImage(localImage.id, {
                status: "UPLOADING",
                progress: 20,
                error: undefined,
                analysisError: undefined,
            });

            try {
                const nextSortOrder =
                    serverImagesRef.current.length;

                const response = await uploadListingImage(
                    listingId,
                    localImage.file,
                    nextSortOrder,
                );

                const uploadedImage = response.data.image;

                const nextImages = [
                    ...serverImagesRef.current,
                    uploadedImage,
                ];

                publishServerImages(nextImages);

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
            updateLocalImage,
        ],
    );

    // ========================================================
    // UPLOAD ALL READY IMAGES
    // ========================================================

    const uploadAll = useCallback(async () => {
        if (isUploadingAll || disabled) return;

        const readyImages = localImages.filter(
            (image) => image.status === "READY",
        );

        if (readyImages.length === 0) return;

        setIsUploadingAll(true);
        setGlobalError(null);

        try {
            for (const image of readyImages) {
                if (!mountedRef.current) break;

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
            if (!localImage.image) return;

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
        [listingId, updateLocalImage],
    );

    // ========================================================
    // POLL LOCAL IMAGE ANALYSIS
    // ========================================================

    useEffect(() => {
        const needsPolling = localImages.some(
            (image) =>
                image.status === "UPLOADED" &&
                image.image &&
                !isAnalysisTerminal(image.analysis),
        );

        if (!needsPolling) return;

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
    }, [localImages, refreshAnalysis]);

    // ========================================================
    // POLL SERVER IMAGE RECORDS
    // ========================================================

    useEffect(() => {
        const pendingImages = serverImages.filter(
            (image) => image.imageCheckStatus === "PENDING",
        );

        if (pendingImages.length === 0 || disabled) return;

        let cancelled = false;

        const poll = async () => {
            const updates = await Promise.allSettled(
                pendingImages.map(async (image) => {
                    const response =
                        await getListingImageAnalysis(
                            listingId,
                            image.id,
                        );

                    const analysis = response.data;
                    const decision = getAnalysisDecision(analysis);

                    if (!decision) return null;

                    return {
                        id: image.id,
                        imageCheckStatus: decision,
                        checkReason:
                            analysis.image?.checkReason ??
                            analysis.run?.decisionReason ??
                            null,
                        checkedAt:
                            analysis.image?.checkedAt ?? null,
                    };
                }),
            );

            if (cancelled) return;

            const resolved = new Map<
                string,
                {
                    imageCheckStatus: ImageAnalysisDecision;
                    checkReason: string | null;
                    checkedAt: string | null;
                }
            >();

            for (const result of updates) {
                if (
                    result.status === "fulfilled" &&
                    result.value
                ) {
                    resolved.set(
                        result.value.id,
                        result.value,
                    );
                }
            }

            if (resolved.size === 0) return;

            const currentImages = serverImagesRef.current;

            const nextImages = currentImages.map((image) => {
                const update = resolved.get(image.id);

                return update
                    ? { ...image, ...update }
                    : image;
            });

            publishServerImages(nextImages);
        };

        void poll();

        const interval = window.setInterval(
            () => void poll(),
            3500,
        );

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [
        disabled,
        listingId,
        publishServerImages,
        serverImages,
    ]);

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="border-b border-slate-100 px-4 py-5 sm:px-6 sm:py-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#1491FF]/10 text-[#1491FF]">
                            <Images size={21} />
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-base font-bold tracking-tight text-slate-900">
                                Vehicle photos
                            </h2>

                            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                                Upload and manage the photos displayed on your listing.
                            </p>
                        </div>
                    </div>

                    <div className="shrink-0 text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Photo count
                        </p>

                        <p className="mt-0.5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                            {uploadedCount}
                            <span className="ml-1 text-sm font-medium text-slate-400">
                                / {maxImages}
                            </span>
                        </p>
                    </div>
                </div>

                {/* PHOTO COUNTERS */}

                <div className="mt-5 grid grid-cols-3 gap-2">
                    <CounterCard
                        label="Uploaded"
                        value={uploadedCount}
                        color="blue"
                    />

                    <CounterCard
                        label="Ready"
                        value={readyCount}
                        color="slate"
                    />

                    <CounterCard
                        label="Failed"
                        value={failedCount}
                        color="red"
                    />
                </div>
            </div>

            <div className="space-y-6 p-4 sm:p-6">

                {/* ==================================================
                    GLOBAL ERROR
                ================================================== */}

                <AnimatePresence>
                    {globalError && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            role="alert"
                            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5"
                        >
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                                <AlertCircle size={17} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-red-800">
                                    Unable to add some photos
                                </p>

                                <p className="mt-1 text-xs leading-5 text-red-700">
                                    {globalError}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setGlobalError(null)}
                                aria-label="Dismiss error"
                                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-100"
                            >
                                <X size={15} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ==================================================
                    FILE INPUT
                ================================================== */}

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

                {/* ==================================================
                    UPLOAD AREA
                ================================================== */}

                {remainingSlots > 0 ? (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={disabled || isUploadingAll}
                        className="group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-[#F8FAFC] px-5 py-8 text-center transition-all duration-200 hover:border-[#1491FF] hover:bg-blue-50/50 focus:outline-none focus:ring-4 focus:ring-[#1491FF]/10 disabled:cursor-not-allowed disabled:opacity-50 sm:py-10"
                    >
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#1491FF]/30 to-transparent opacity-0 transition group-hover:opacity-100" />

                        <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-[#1491FF] shadow-sm ring-1 ring-slate-200 transition duration-200 group-hover:-translate-y-1 group-hover:ring-[#1491FF]/30">
                            <UploadCloud size={25} />
                        </div>

                        <p className="mt-4 text-sm font-bold text-slate-900">
                            Add vehicle photos
                        </p>

                        <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                            Choose clear photos from your device. You can select multiple images.
                        </p>

                        <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1491FF] px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-200 transition group-hover:bg-[#087FE5]">
                            <ImagePlus size={15} />
                            Browse photos
                        </span>

                        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[10px] font-medium text-slate-400">
                            <span>JPEG</span>
                            <span className="size-1 rounded-full bg-slate-300" />
                            <span>PNG</span>
                            <span className="size-1 rounded-full bg-slate-300" />
                            <span>WebP</span>
                            <span className="size-1 rounded-full bg-slate-300" />
                            <span>Max {maxFileSizeMb} MB</span>
                        </div>

                        <span className="mt-3 text-[10px] font-semibold text-[#1491FF]">
                            {remainingSlots} photo slot{remainingSlots === 1 ? "" : "s"} remaining
                        </span>
                    </button>
                ) : (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <AlertCircle
                            size={18}
                            className="mt-0.5 shrink-0 text-amber-600"
                        />

                        <div>
                            <p className="text-xs font-bold text-amber-800">
                                Maximum photo limit reached
                            </p>

                            <p className="mt-1 text-xs leading-5 text-amber-700">
                                This listing supports a maximum of {maxImages} photos.
                            </p>
                        </div>
                    </div>
                )}

                {/* ==================================================
                    SELECTED PHOTOS
                ================================================== */}

                {hasSelectedImages && (
                    <motion.div {...cardAnimation}>
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Selected photos
                                    </h3>

                                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#087FE5]">
                                        {localImages.length}
                                    </span>
                                </div>

                                <p className="mt-1 text-xs text-slate-500">
                                    Review your images before uploading.
                                </p>
                            </div>

                            {readyCount > 0 && (
                                <span className="text-[11px] font-semibold text-slate-500">
                                    {readyCount} waiting to upload
                                </span>
                            )}
                        </div>

                        {/* PHOTO GRID */}

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                            <AnimatePresence mode="popLayout">
                                {localImages.map((image, index) => (
                                    <PhotoCard
                                        key={image.id}
                                        image={image}
                                        index={index}
                                        disabled={disabled}
                                        onRemove={removeLocalImage}
                                        onRetry={(id) =>
                                            updateLocalImage(id, {
                                                status: "READY",
                                                error: undefined,
                                            })
                                        }
                                        onRefresh={refreshAnalysis}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* UPLOAD ACTIONS */}

                        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    {isUploadingAll ? (
                                        <>
                                            <p className="text-xs font-bold text-slate-800">
                                                Uploading your photos
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Please keep this page open until the upload finishes.
                                            </p>
                                        </>
                                    ) : failedCount > 0 ? (
                                        <>
                                            <p className="text-xs font-bold text-red-700">
                                                {failedCount} upload{failedCount === 1 ? "" : "s"} need attention
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Retry failed photos or remove them.
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-xs font-bold text-slate-800">
                                                {readyCount > 0
                                                    ? `${readyCount} photo${readyCount === 1 ? "" : "s"} ready to upload`
                                                    : "All selected photos uploaded"}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Uploaded photos will undergo separate image checks.
                                            </p>
                                        </>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => void uploadAll()}
                                    disabled={
                                        disabled ||
                                        isUploadingAll ||
                                        readyCount === 0
                                    }
                                    className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-5 py-3 text-xs font-bold text-white shadow-sm shadow-blue-200 transition hover:bg-[#087FE5] focus:outline-none focus:ring-4 focus:ring-[#1491FF]/15 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none sm:w-auto"
                                >
                                    {isUploadingAll ? (
                                        <>
                                            <LoaderCircle
                                                size={16}
                                                className="animate-spin"
                                            />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud size={16} />
                                            Upload selected
                                        </>
                                    )}
                                </button>
                            </div>

                            {uploadingCount > 0 && (
                                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${(uploadingCount / Math.max(localImages.length, 1)) * 100}%`,
                                        }}
                                        className="h-full rounded-full bg-[#1491FF]"
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ==================================================
                    UPLOADED IMAGE RECORDS
                ================================================== */}

                {serverImages.length > 0 && (
                    <div className="border-t border-slate-100 pt-6">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Uploaded image records
                                    </h3>

                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                        {serverImages.length}
                                    </span>
                                </div>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Images received by the server and their current verification status.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            {serverImages.map((image, index) => {
                                const decision: ImageAnalysisDecision | null =
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
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1491FF]">
                                            <FileImage size={18} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-slate-800">
                                                Vehicle photo {index + 1}
                                            </p>

                                            <p className="mt-1 truncate text-[10px] text-slate-400">
                                                {image.id}
                                            </p>

                                            {image.checkReason && (
                                                <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">
                                                    {image.checkReason}
                                                </p>
                                            )}
                                        </div>

                                        <span
                                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[10px] font-bold ${getDecisionStyles(decision)}`}
                                        >
                                            <span
                                                className={`size-1.5 rounded-full ${getDecisionDot(decision)}`}
                                            />

                                            {image.imageCheckStatus}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ==================================================
                    EMPTY STATE
                ================================================== */}

                {localImages.length === 0 &&
                    serverImages.length === 0 && (
                        <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-5 py-8 text-center">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
                                <Images size={21} />
                            </div>

                            <p className="mt-3 text-sm font-bold text-slate-800">
                                No photos added yet
                            </p>

                            <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-500">
                                Your vehicle photos will appear here after you select and upload them.
                            </p>
                        </div>
                    )}

                {/* ==================================================
                    IMAGE POLICY NOTE
                ================================================== */}

                <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 sm:p-4">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#1491FF] shadow-sm">
                        <ShieldCheck size={16} />
                    </div>

                    <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800">
                            Image verification
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-slate-600">
                            Every uploaded photo goes through KARMASS image checks.
                            A successful upload does not automatically mean the
                            photo has passed moderation.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ============================================================
// COUNTER CARD
// ============================================================

function CounterCard({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: "blue" | "slate" | "red";
}) {
    const styles = {
        blue: "bg-blue-50 text-[#087FE5]",
        slate: "bg-slate-50 text-slate-600",
        red: "bg-red-50 text-red-600",
    };

    return (
        <div className="rounded-xl border border-slate-100 bg-white p-3">
            <div
                className={`mb-2 flex size-7 items-center justify-center rounded-lg ${styles[color]}`}
            >
                {color === "blue" && <CheckCircle2 size={14} />}
                {color === "slate" && <Clock3 size={14} />}
                {color === "red" && <AlertCircle size={14} />}
            </div>

            <p className="text-lg font-bold leading-none text-slate-900">
                {value}
            </p>

            <p className="mt-1 text-[10px] font-medium text-slate-500">
                {label}
            </p>
        </div>
    );
}

// ============================================================
// PHOTO CARD
// ============================================================

function PhotoCard({
    image,
    index,
    disabled,
    onRemove,
    onRetry,
    onRefresh,
}: {
    image: LocalImage;
    index: number;
    disabled: boolean;
    onRemove: (id: string) => void;
    onRetry: (id: string) => void;
    onRefresh: (image: LocalImage) => Promise<void>;
}) {
    const [showResults, setShowResults] = useState(false);

    const shouldReduceMotion = useReducedMotion();

    const decision = getAnalysisDecision(image.analysis);

    const analysisLabel = getAnalysisLabel(image.analysis);

    const analysisDescription =
        getAnalysisDescription(image.analysis);

    const isUploading = image.status === "UPLOADING";
    const isUploaded = image.status === "UPLOADED";
    const isFailed = image.status === "FAILED";

    return (
        <motion.article
            layout={!shouldReduceMotion}
            initial={
                shouldReduceMotion
                    ? false
                    : { opacity: 0, y: 12, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
                duration: shouldReduceMotion ? 0 : 0.22,
            }}
            className="group min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:border-[#1491FF]/30 hover:shadow-md hover:shadow-slate-200/50"
        >
            {/* IMAGE */}

            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <Image
                    src={image.previewUrl}
                    alt={`Vehicle photo ${index + 1}`}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />

                {/* PHOTO NUMBER */}

                <div className="absolute left-2 top-2 rounded-md bg-slate-950/65 px-2 py-1 text-[9px] font-bold text-white backdrop-blur-md">
                    PHOTO {index + 1}
                </div>

                {/* REMOVE */}

                {!isUploading && (
                    <button
                        type="button"
                        onClick={() => onRemove(image.id)}
                        disabled={disabled}
                        aria-label={`Remove photo ${index + 1}`}
                        className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-lg bg-white/95 text-slate-600 opacity-100 shadow-sm transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-40"
                    >
                        <Trash2 size={14} />
                    </button>
                )}

                {/* UPLOADING OVERLAY */}

                {isUploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/55 backdrop-blur-[2px]">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-white text-[#1491FF] shadow-lg">
                            <LoaderCircle
                                size={22}
                                className="animate-spin"
                            />
                        </div>

                        <p className="mt-3 text-[10px] font-bold text-white">
                            Uploading photo...
                        </p>
                    </div>
                )}

                {/* UPLOADED BADGE */}

                {isUploaded && (
                    <div className="absolute bottom-2 left-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[9px] font-bold text-white shadow-sm">
                            <Check size={11} />
                            UPLOADED
                        </span>
                    </div>
                )}

                {/* FAILED BADGE */}

                {isFailed && (
                    <div className="absolute bottom-2 left-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-[9px] font-bold text-white shadow-sm">
                            <AlertCircle size={11} />
                            FAILED
                        </span>
                    </div>
                )}
            </div>

            {/* CONTENT */}

            <div className="space-y-3 p-3">
                <div className="min-w-0">
                    <p
                        className="truncate text-[11px] font-bold text-slate-800"
                        title={image.file.name}
                    >
                        {image.file.name}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                        {formatBytes(image.file.size)}
                    </p>
                </div>

                {/* READY */}

                {image.status === "READY" && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-[10px] font-semibold text-slate-600">
                        <Clock3 size={12} />
                        Ready to upload
                    </div>
                )}

                {/* UPLOADING */}

                {isUploading && (
                    <div>
                        <div className="mb-1.5 flex items-center justify-between text-[10px]">
                            <span className="font-semibold text-slate-600">
                                Uploading
                            </span>

                            <span className="font-bold text-[#1491FF]">
                                {image.progress}%
                            </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${image.progress}%`,
                                }}
                                className="h-full rounded-full bg-[#1491FF]"
                            />
                        </div>
                    </div>
                )}

                {/* UPLOADED / ANALYSIS */}

                {isUploaded && (
                    <div className="space-y-2">
                        <span
                            className={`inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[10px] font-bold ${getDecisionStyles(decision)}`}
                        >
                            <DecisionIcon decision={decision} />

                            <span className="truncate">
                                {analysisLabel}
                            </span>
                        </span>

                        {analysisDescription && (
                            <p className="line-clamp-3 text-[10px] leading-5 text-slate-500">
                                {analysisDescription}
                            </p>
                        )}

                        {image.analysisError && (
                            <p className="break-words text-[10px] leading-5 text-amber-700">
                                {image.analysisError}
                            </p>
                        )}

                        {/* ANALYSIS RESULTS */}

                        {image.analysis?.results &&
                            image.analysis.results.length > 0 && (
                                <div className="overflow-hidden rounded-lg border border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowResults((value) => !value)
                                        }
                                        className="flex w-full items-center justify-between gap-2 bg-slate-50 px-2.5 py-2 text-left transition hover:bg-slate-100"
                                    >
                                        <span className="text-[10px] font-bold text-slate-600">
                                            Analysis details
                                        </span>

                                        <ChevronDown
                                            size={13}
                                            className={`shrink-0 text-slate-400 transition-transform ${
                                                showResults
                                                    ? "rotate-180"
                                                    : ""
                                            }`}
                                        />
                                    </button>

                                    <AnimatePresence>
                                        {showResults && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="space-y-2 p-2.5">
                                                    {image.analysis.results.map(
                                                        (result) => (
                                                            <div
                                                                key={result.id}
                                                                className="border-b border-slate-100 pb-2 last:border-0 last:pb-0"
                                                            >
                                                                <p className="text-[10px] font-bold text-slate-700">
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

                                                                {result.score != null && (
                                                                    <p className="mt-1 text-[9px] text-slate-400">
                                                                        Score: {result.score}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                        {isAnalysisTerminal(image.analysis) && (
                            <button
                                type="button"
                                onClick={() => void onRefresh(image)}
                                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#1491FF] transition hover:text-[#087FE5]"
                            >
                                <RefreshCw size={11} />
                                Refresh status
                            </button>
                        )}
                    </div>
                )}

                {/* UPLOAD FAILED */}

                {isFailed && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-2.5">
                        <div className="flex items-center gap-1.5 text-red-700">
                            <AlertCircle size={12} />

                            <span className="text-[10px] font-bold">
                                Upload failed
                            </span>
                        </div>

                        <p className="mt-1.5 break-words text-[10px] leading-5 text-red-600">
                            {image.error}
                        </p>

                        <button
                            type="button"
                            onClick={() => onRetry(image.id)}
                            disabled={disabled}
                            className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-[10px] font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100 disabled:opacity-50"
                        >
                            <RotateCw size={11} />
                            Retry upload
                        </button>
                    </div>
                )}
            </div>
        </motion.article>
    );
}