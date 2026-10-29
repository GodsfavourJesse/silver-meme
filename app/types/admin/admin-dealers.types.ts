export type DealerApplicationStatus =
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

/**
 * Frontend filter only.
 * ALL is not a database status.
 */
export type DealerApplicationFilter =
    | DealerApplicationStatus
    | "ALL";

export type DealerDocumentStatus =
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

export type DealerReviewDecision =
    | "APPROVED"
    | "REJECTED";

// ============================================================
// APPLICANT
// ============================================================

export interface DealerApplicant {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
}

// ============================================================
// DEALER DOCUMENT
// ============================================================

export interface DealerDocument {
    id: string;
    applicationId: string;
    documentType: string;
    status: DealerDocumentStatus;
    rejectionReason: string | null;
    reviewedByUserId: string | null;
    reviewedAt: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

// ============================================================
// DEALER APPLICATION
// ============================================================

export interface DealerApplication {
    id: string;
    userId: string;
    companyName: string;
    status: DealerApplicationStatus;
    rejectionReason: string | null;
    reviewedByUserId: string | null;
    reviewedAt: string | null;
    createdAt: string;
    updatedAt?: string;
    [key: string]: unknown;
}

// ============================================================
// RAW API ROW
// ============================================================

/**
 * A raw row returned by the API.
 *
 * An application may appear more than once if the backend
 * returns joined rows. Each row can contain an array of
 * documents or null when no documents exist.
 */
export interface DealerApplicationRow {
    application: DealerApplication;
    user: DealerApplicant;
    documents: DealerDocument[] | null;
}

// ============================================================
// NORMALIZED FRONTEND ROW
// ============================================================

/**
 * Normalized frontend representation.
 *
 * Each application appears once, with all unique documents
 * combined into a single array.
 */
export interface NormalizedDealerApplicationRow {
    application: DealerApplication;
    user: DealerApplicant;
    documents: DealerDocument[];
}

// ============================================================
// PAGINATION
// ============================================================

export interface DealerApplicationsPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

// ============================================================
// API RESPONSES
// ============================================================

export interface DealerApplicationsResponse {
    success: boolean;
    data: {
        applications: DealerApplicationRow[];
        pagination: DealerApplicationsPagination;
    };
}

export interface DealerApplicationReviewResponse {
    success: boolean;
    data: {
        application: DealerApplication;
    };
}

export interface DealerDocumentReviewResponse {
    success: boolean;
    data: {
        document: DealerDocument;
    };
}

// ============================================================
// REVIEW PAYLOAD
// ============================================================

export interface ReviewDealerPayload {
    decision: DealerReviewDecision;
    rejectionReason?: string;
}

// ============================================================
// DOCUMENT PREVIEW
// ============================================================

export interface DealerDocumentPreview {
    id: string;
    applicationId: string;
    documentType: string;
    status: DealerDocumentStatus;
    applicationStatus: DealerApplicationStatus;
    url: string;
    expiresInSeconds: number;
}

/**
 * Document preview returned by the admin API.
 */
export interface AdminDealerDocumentPreview {
    id: string;
    applicationId: string;
    documentType: string;
    status: string;
    applicationStatus: string;
    url: string;
    mimeType: string;
    expiresInSeconds: number;
}

export interface DealerDocumentPreviewResponse {
    success: boolean;
    data: {
        document: AdminDealerDocumentPreview;
    };
}