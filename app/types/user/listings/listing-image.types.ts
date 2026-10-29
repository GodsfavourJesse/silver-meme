export type ImageAnalysisState =
    | "PENDING"
    | "QUEUED"
    | "PROCESSING"
    | "PASSED"
    | "REVIEW"
    | "FAILED"
    | "CANCELLED";

export type ImageCheckStatus =
    | "PENDING"
    | "PASSED"
    | "REVIEW"
    | "FAILED";

export type ImageAnalysisJobStatus =
    | "QUEUED"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED";

export type ImageAnalysisRunStatus =
    | "RUNNING"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED";

export type ImageAnalysisDecision =
    | "PASSED"
    | "REVIEW"
    | "FAILED";

export type ImageAnalysisResultType =
    | "SHA256"
    | "PERCEPTUAL_HASH"
    | "EMBEDDING"
    | "OCR"
    | "MODERATION"
    | "WATERMARK"
    | "DUPLICATE";

export interface ListingImageRecord {
    id: string;
    listingId: string;
    objectKey: string;
    sortOrder: number;
    imageCheckStatus: ImageCheckStatus;
    mimeType?: string | null;
    width?: number | null;
    height?: number | null;
    originalName?: string | null;
    sha256?: string | null;
    perceptualHash?: string | null;
    similarityScore?: number | null;
    matchedImageId?: string | null;
    matchedListingId?: string | null;
    checkReason?: string | null;
    checkedAt?: string | null;
    createdAt?: string;
    url?: string;
    thumbnailUrl?: string;
    detailUrl?: string;
}

export interface ListingImageUploadResponse {
    success: boolean;
    data: {
        image: ListingImageRecord;
    };
    message?: string;
}

export interface ImageAnalysisJob {
    id: string;
    status: ImageAnalysisJobStatus;
    priority: number;
    attempts: number;
    maxAttempts: number;
    availableAt: string;
    lockedAt: string | null;
    startedAt: string | null;
    completedAt: string | null;
    failedAt: string | null;
    lastError: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ImageAnalysisRun {
    id: string;
    jobId: string | null;
    status: ImageAnalysisRunStatus;
    provider: string;
    providerVersion: string | null;
    pipelineVersion: string;
    modelVersion: string | null;
    decision: ImageAnalysisDecision | null;
    confidence: string | null;
    decisionReason: string | null;
    errorMessage: string | null;
    startedAt: string;
    completedAt: string | null;
    createdAt: string;
}

export interface ImageAnalysisResult {
    id: string;
    resultType: ImageAnalysisResultType;
    provider: string;
    providerVersion: string | null;
    modelVersion: string | null;
    confidence: string | null;
    score: string | null;
    passed: boolean | null;
    data: unknown;
    reason: string | null;
    createdAt: string;
}

export interface ImageAnalysisStatusResponse {
    success: boolean;
    data: {
        listingImageId: string;
        analysisState: ImageAnalysisState;
        failureReason: string | null;
        image: {
            id: string;
            imageCheckStatus: ImageCheckStatus;
            checkReason: string | null;
            checkedAt: string | null;
        } | null;
        job: ImageAnalysisJob | null;
        run: ImageAnalysisRun | null;
        results: ImageAnalysisResult[];
    };
    message?: string;
}

export interface ImageAnalysisEnqueueResponse {
    success: boolean;
    data: {
        jobId: string;
        listingImageId: string;
        status: ImageAnalysisJobStatus;
        message?: string;
    };
    message?: string;
}
