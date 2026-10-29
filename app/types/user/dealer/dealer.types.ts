// ============================================================
// DEALER APPLICATION
// ============================================================

export type DealerApplicationStatus =
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

export interface ApplyAsDealerInput {
    companyName: string;
    registrationNumber?: string;
    businessAddress?: string;
}

export interface DealerApplication {
    id: string;
    companyName: string;
    registrationNumber: string | null;
    businessAddress: string | null;
    status: DealerApplicationStatus;
    createdAt: string;
    updatedAt?: string;
    reviewedAt?: string | null;
    rejectionReason?: string | null;
}

export interface ApplyAsDealerResponse {
    success: boolean;
    data: {
        application: DealerApplication;
    };
}

// ============================================================
// DEALER DOCUMENTS
// ============================================================

export type DealerDocumentStatus =
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

export interface DealerDocument {
    id: string;
    applicationId: string;
    documentType: string;
    status: DealerDocumentStatus;
    rejectionReason: string | null;
    reviewedAt?: string | null;
    createdAt: string;
}

export interface UploadDealerDocumentInput {
    applicationId: string;
    documentType: string;
    file: File;
}

export interface UploadDealerDocumentResponse {
    success: boolean;
    data: {
        document: DealerDocument;
    };
}

export interface GetDealerDocumentsResponse {
    success: boolean;
    data: {
        documents: DealerDocument[];
    };
}

export interface DealerDocumentUrl {
    documentId: string;
    documentType: string;
    url: string;
    mimeType: string;
    contentType: string;
    expiresInSeconds: number;
    fileName: string;
}

export interface DealerDocumentUrlResponse {
    success: boolean;
    data: {
        document: DealerDocumentUrl;
    };
}

export interface DeleteDealerDocumentResponse {
    success: boolean;
    data: {
        success: boolean;
    };
}

// ============================================================
// PUBLIC DEALER PROFILE
// ============================================================

export interface PublicDealerProfile {
    id: string;
    userId: string;
    companyName: string;
    verified: boolean;
    verifiedAt: string | null;
    createdAt: string;
    contactName: string;
    bio: string | null;
    profilePictureUrl: string | null;
    coverPhotoUrl: string | null;

    phone: string | null;
    showPhone: boolean;
}

export interface PublicDealerProfileResponse {
    success: boolean;
    data: {
        dealer: PublicDealerProfile;
    };
}

// ============================================================
// DEALER LISTINGS
// ============================================================

export interface DealerVehicleReference {
    id: string;
    name: string;
}

export interface DealerListing {
    id: string;
    title: string;
    description: string | null;
    price: string | number;
    currency: string;
    mileage: number | null;
    condition: string;
    country: string;
    state: string;
    city: string;
    publishedAt: string | null;
    createdAt: string;

    vehicleVariant: DealerVehicleReference;
    vehicleGeneration: DealerVehicleReference;
    vehicleModel: DealerVehicleReference;
    vehicleMake: DealerVehicleReference;

}

export interface DealerListingsPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface PublicDealerListingsResponse {
    success: boolean;
    data: {
        items: DealerListing[];
        pagination: DealerListingsPagination;
    };
}

// ============================================================
// DEALER ANALYTICS
// ============================================================

export interface DealerRecentListing {
    id: string;
    title: string;
    price: string | number;
    currency: string;
    status: string;
    viewCount: number;
    createdAt: string;
    expiresAt: string | null;

    variantName: string | null;
    generationName: string | null;
    modelName: string | null;
    makeName: string | null;
}

export interface DealerAnalytics {
    totalListings: number;
    activeListings: number;
    pendingListings: number;
    rejectedListings: number;
    soldListings: number;
    expiredListings: number;
    totalViews: number;
    averageViewsPerListing: number;
    recentListings: DealerRecentListing[];
}

export interface DealerAnalyticsResponse {
    success: boolean;
    data: {
        analytics: DealerAnalytics;
    };
}

/* ============================================================
   DEALER PROFILE CUSTOMIZATION
============================================================ */

export interface DealerEditableProfile {
    id: string;
    companyName: string;
    bio: string | null;
    profilePictureUrl: string | null;
    coverPhotoUrl: string | null;
    verified: boolean;
    verifiedAt: string | null;
}

export interface DealerProfileResponse {
    success: boolean;
    data: {
        profile: DealerEditableProfile;
    };
}

export interface UpdateDealerBioInput {
    bio: string;
}

export interface DealerProfileMutationResponse {
    success: boolean;
    data: {
        profile: DealerEditableProfile;
    };
}

// ============================================================
// PUBLIC DEALER DIRECTORY
// ============================================================

export interface PublicDealerDirectoryItem {
    id: string;
    userId: string;
    companyName: string;
    verified: boolean;
    verifiedAt: string | null;
    bio: string | null;
    profilePictureUrl: string | null;
    coverPhotoUrl: string | null;
    createdAt: string;
}

export interface PublicDealerDirectoryPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface PublicDealersResponse {
    success: boolean;
    data: {
        items: PublicDealerDirectoryItem[];
        pagination: PublicDealerDirectoryPagination;
    };
}

export interface PublicDealersQuery {
    search?: string;
    page?: number;
    limit?: number;
}
