export type AdminImageStatus =
    | "PENDING"
    | "REVIEW"
    | "FAILED"
    | "PASSED";

export type AdminImageReviewDecision =
    | "APPROVED"
    | "REJECTED"
    | "NEEDS_REVIEW";

export type AdminImageReviewFilter =
    | "ALL"
    | AdminImageStatus;

export type AdminImageReviewSort =
    | "oldest"
    | "newest";

export type AdminListingCondition =
    | "NEW"
    | "USED";

export type AdminSellerAccountType =
    | "USER"
    | "DEALER";

export type AdminSellerStatus =
    | "ACTIVE"
    | "SUSPENDED"
    | "DELETED";

// ============================================================
// IMAGE REVIEW QUERY
// ============================================================

export interface AdminImageReviewQuery {
    status: AdminImageReviewFilter;
    page: number;
    limit: number;
    sort: AdminImageReviewSort;
}

// ============================================================
// IMAGE REVIEW ITEM
// ============================================================

export interface AdminImageReviewItem {
    imageId: string;
    listingId: string;
    objectKey: string;
    imageUrl: string;
    originalName: string;
    mimeType: string;

    width: number | null;
    height: number | null;

    sortOrder: number;

    imageCheckStatus: AdminImageStatus;

    similarityScore: number | null;

    matchedImageId: string | null;
    matchedListingId: string | null;

    checkReason: string | null;

    imageCreatedAt: string;

    listingStatus: string;
    sellerId: string;
}

// ============================================================
// IMAGE REVIEW PAGINATION
// ============================================================

export interface AdminImageReviewPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// ============================================================
// IMAGE REVIEW LIST RESPONSE
// ============================================================

export interface AdminImageReviewListResponse {
    items: AdminImageReviewItem[];
    pagination: AdminImageReviewPagination;
}

// ============================================================
// LISTING INFORMATION
// ============================================================

export interface AdminImageReviewListing {
    id: string;

    title: string;
    description: string;

    price: string;
    currency: string;

    mileage: number | null;

    condition: AdminListingCondition;

    country: string;
    state: string | null;
    city: string | null;

    status: string;

    viewCount: number;

    rejectionReason: string | null;

    publishedAt: string | null;
    expiresAt: string | null;

    createdAt: string;
    updatedAt: string;
}

// ============================================================
// VEHICLE INFORMATION
// ============================================================

export interface AdminImageReviewVehicle {
    variantId: string;

    year: number;
    variantName: string;

    fuelType: string | null;
    transmission: string | null;
    driveType: string | null;
    bodyStyle: string | null;

    seats: number | null;
    doors: number | null;

    engineName: string | null;
    engineDisplacementCc: number | null;
    horsepower: number | null;

    generationId: string;
    generationName: string;

    modelId: string;
    modelName: string;

    makeId: string;
    makeName: string;
}

// ============================================================
// SELLER INFORMATION
// ============================================================

export interface AdminImageReviewSeller {
    id: string;

    firstName: string;
    lastName: string;
    fullName: string;

    email: string;

    phone: string | null;

    avatarUrl: string | null;

    accountType: AdminSellerAccountType;

    status: AdminSellerStatus;

    emailVerified: boolean;

    createdAt: string;
}

// ============================================================
// AUTOMATED IMAGE ANALYSIS
// ============================================================

export interface AdminImageAnalysisResult {
    id: string;

    resultType: string;

    reason?: string | null;

    passed?: boolean | null;

    score?: number | null;
}

export interface AdminImageAnalysis {
    analysisState?: string;

    run?: {
        id?: string;
        status?: string;
        decision?: string | null;
        decisionReason?: string | null;
    } | null;

    job?: {
        id?: string;
        status?: string;
    } | null;

    image?: {
        checkReason?: string | null;
        checkedAt?: string | null;
    } | null;

    failureReason?: string | null;

    results?: AdminImageAnalysisResult[];
}

// ============================================================
// IMAGE REVIEW HISTORY
// ============================================================

export interface AdminImageReviewHistory {
    id: string;

    listingImageId: string;
    listingId: string;

    reviewerId: string;

    decision: AdminImageReviewDecision;

    reason: string | null;
    notes: string | null;

    createdAt: string;
}

// ============================================================
// IMAGE REVIEW DETAIL RESPONSE
// ============================================================

export interface AdminImageReviewDetailResponse {
    image: AdminImageReviewItem & {
        sha256: string | null;
        perceptualHash: string | null;
    };

    listing: AdminImageReviewListing | null;

    vehicle: AdminImageReviewVehicle | null;

    seller: AdminImageReviewSeller | null;

    analysis: AdminImageAnalysis;

    reviewHistory: AdminImageReviewHistory[];
}

// ============================================================
// IMAGE REVIEW DECISION
// ============================================================

export interface AdminImageReviewDecisionPayload {
    decision: AdminImageReviewDecision;

    reason?: string;

    notes?: string;
}

export interface AdminImageReviewDecisionResponse {
    decision: AdminImageReviewHistory;

    image: {
        id: string;

        imageCheckStatus: AdminImageStatus;

        checkReason: string | null;

        checkedAt: string;
    };
}

// ============================================================
// RETRY IMAGE ANALYSIS
// ============================================================

export interface AdminImageAnalysisRetryResponse {
    listingImageId: string;

    listingId: string;

    jobId: string;

    status: string;

    message: string;
}