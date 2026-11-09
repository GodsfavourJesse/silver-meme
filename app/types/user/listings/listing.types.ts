import type {
    VehicleCondition,
} from "./listing-form.types";

export type ListingStatus =
    | "DRAFT"
    | "PENDING_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "EXPIRED"
    | "SOLD"
    | "SUSPENDED"
    | "DELETED";

export type ListingLifecycleAction =
    | "UPDATE_DETAILS"
    | "SUBMIT_FOR_REVIEW"
    | "APPROVE"
    | "REJECT"
    | "EXPIRE"
    | "MARK_SOLD"
    | "SUSPEND"
    | "RESTORE"
    | "REACTIVATE"
    | "DELETE";

export type ListingCreditSource =
    | "FREE_TRIAL"
    | "SUBSCRIPTION_CREDIT"
    | "ADMIN_ADJUSTMENT";

export interface ListingCreditPool {
    total: number;
    used: number;
    remaining: number;
}

export interface ListingCreditBreakdown {
    total: number;
    used: number;
    remaining: number;

    free: ListingCreditPool;
    subscription: ListingCreditPool;
    adjustment: ListingCreditPool;
}

export interface ListingCreditConsumption {
    consumed: boolean;
    inserted: boolean;

    consumedSource: ListingCreditSource | null;

    remaining: ListingCreditBreakdown;

    subscriptionCreditsExhausted: boolean;

    freeCreditsRemaining: number;
    subscriptionCreditsRemaining: number;
    adjustmentCreditsRemaining: number;
    totalRemaining: number;
}

export interface ListingSummary {
    DRAFT: number;
    PENDING_REVIEW: number;
    APPROVED: number;
    REJECTED: number;
    EXPIRED: number;
    SOLD: number;
    SUSPENDED: number;
    DELETED: number;

    // Total normal inventory, excluding deleted listings.
    total: number;

    // Convenient count for the Recently Deleted page.
    deleted: number;
}

export interface ListingVehicleVariant {
    id: string;
    name: string;
    generationId: string;
}

export interface ListingVehicleGeneration {
    id: string;
    name: string;
    modelId: string;
}

export interface ListingVehicleModel {
    id: string;
    name: string;
    makeId: string;
}

export interface ListingVehicleMake {
    id: string;
    name: string;
}

export interface ListingImage {
    id: string;
    listingId: string;
    objectKey: string;
    sortOrder: number;
    imageCheckStatus?: string;
    mimeType?: string;
    width?: number | null;
    height?: number | null;
    url?: string;
    thumbnailUrl?: string;
    detailUrl?: string;
}

export type ListingImageCheckStatus =
    | "PENDING"
    | "PASSED"
    | "REVIEW"
    | "FAILED";

export type ListingImageCheckSource =
    | "AUTOMATED"
    | "ADMIN";

export interface SellerListingImageAnalysisItem {
    id: string;
    sortOrder: number;
    imageCheckStatus: ListingImageCheckStatus;
    imageCheckSource: ListingImageCheckSource | null;
    checkReason: string | null;
    checkedAt: string | null;
    url?: string;
    thumbnailUrl?: string;
    canRetry?: boolean;
}

export interface SellerListingImageAnalysis {
    total: number;
    pending: number;
    passed: number;
    review: number;
    failed: number;
    images: SellerListingImageAnalysisItem[];
}

export interface ListingRecord {
    id: string;
    sellerId: string;

    /*
     * Catalogue reference.
     *
     * Null means the seller entered the vehicle manually.
     */

    vehicleVariantId: string | null;

    /*
     * Vehicle identity snapshots.
     */

    makeName: string;
    modelName: string;
    year: number;

    generationName: string | null;
    variantName: string | null;

    /*
     * Vehicle specification snapshots.
     */

    bodyStyle: string | null;
    fuelType: string | null;
    transmission: string | null;
    driveType: string | null;

    engineCapacity: number | null;
    horsepower: number | null;

    exteriorColor: string | null;
    interiorColor: string | null;

    seats: number | null;
    doors: number | null;

    specifications?: Record<string, unknown> | null;

    /*
     * Listing details.
     */

    title: string;
    description: string;

    price: string | number;
    currency: string;

    mileage: number | null;
    condition: VehicleCondition;

    country: string;
    state: string | null;
    city: string | null;

    status: ListingStatus;

    rejectionReason?: string | null;
    publishedAt?: string | null;
    expiresAt?: string | null;

    createdAt: string;
    updatedAt: string;
}

export interface SellerListingItem {
    listing: ListingRecord;

    /*
     * Catalogue relations are optional because manually
     * entered listings do not have these relations.
     */

    vehicleVariant?: ListingVehicleVariant | null;
    vehicleGeneration?: ListingVehicleGeneration | null;
    vehicleModel?: ListingVehicleModel | null;
    vehicleMake?: ListingVehicleMake | null;

    coverImage?: ListingImage | null;

    imageAnalysis?: SellerListingImageAnalysis;
}

export interface ListingPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface SellerListingsResponse {
    success: boolean;
    data: {
        summary: ListingSummary;
        items: SellerListingItem[];
        pagination: ListingPagination;
    };
    message?: string;
}

export interface ListingMutationResponse {
    success: boolean;
    message?: string;

    data?: {
        listing?: ListingRecord;
        replayed?: boolean;
        creditConsumption?: ListingCreditConsumption | null;
    };
}

export interface ListingDashboardParams {
    page?: number;
    limit?: number;
    status?: ListingStatus;

    // Explicitly request deleted listings.
    includeDeleted?: boolean;
}

export interface ListingStatusOption {
    label: string;
    value: ListingStatus | "ALL";
}