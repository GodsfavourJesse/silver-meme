export type DealerApplicationStatus =
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

export interface DealerApplication {
    id: string;
    companyName: string;
    registrationNumber: string | null;
    businessAddress: string | null;
    status: DealerApplicationStatus;
    rejectionReason: string | null;
    submittedAt: string;
    reviewedAt?: string | null;
    updatedAt: string;
}

export interface MyDealerApplicationsResponse {
    success: boolean;
    data: {
        applications: DealerApplication[];
    };
}