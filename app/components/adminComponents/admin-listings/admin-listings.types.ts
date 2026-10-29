import type { Dispatch, SetStateAction } from "react";

export type ImageCheckStatus = "PENDING" | "PASSED" | "REVIEW" | "FAILED" | string;

export interface ListingImage {
  id: string; objectKey: string; originalName?: string | null; mimeType?: string | null;
  width?: number | null; height?: number | null; imageCheckStatus: ImageCheckStatus;
  similarityScore?: string | number | null; matchedImageId?: string | null;
  matchedListingId?: string | null; checkReason?: string | null; sortOrder: number;
}

export interface PendingListing {
  listing: {
    id: string; title: string; description: string; price: string | number;
    currency: string; status: string; condition?: string; mileage?: number | null;
    city?: string | null; state?: string | null; createdAt: string; sellerId: string;
  };
  vehicleMake?: { name: string }; vehicleModel?: { name: string };
  vehicleGeneration?: { name: string }; vehicleVariant?: { name: string; year: number };
  seller?: { email?: string; firstName?: string; lastName?: string; accountType?: string };
  images: ListingImage[];
  history?: Array<{ action?: string; reason?: string | null; createdAt?: string }>;
}

export interface ModerationViewProps {
  items: PendingListing[]; filteredItems: PendingListing[]; selected: PendingListing | null;
  selectedId: string; search: string; rejectionReason: string; loading: boolean;
  detailLoading: boolean; actionLoading: boolean; error: string; notice: string;
  setSearch: Dispatch<SetStateAction<string>>;
  setRejectionReason: Dispatch<SetStateAction<string>>;
  setError: Dispatch<SetStateAction<string>>;
  onSelect: (id: string) => void; onRefreshQueue: () => void;
  onRefreshSelected: () => void; onApprove: () => void; onReject: () => void;
}
