import type { MarketplaceCondition } from "./marketplace.types";

export type SavedSearchFilters = {
    q?: string;
    makeId?: string;
    modelId?: string;
    variantId?: string;
    make?: string;
    model?: string;
    variant?: string;
    minPrice?: number;
    maxPrice?: number;
    minMileage?: number;
    maxMileage?: number;
    minYear?: number;
    maxYear?: number;
    fuelType?: string;
    transmission?: string;
    bodyStyle?: string;
    condition?: MarketplaceCondition;
    state?: string;
    city?: string;
    dealerOnly?: boolean;
    verifiedDealerOnly?: boolean;
    sort?: "newest" | "price_asc" | "price_desc" | "relevance";
};

export interface SavedSearchRecord {
    id: string;
    userId: string;
    name: string;
    filters: SavedSearchFilters;
    createdAt: string;
    updatedAt: string;
}

export interface SavedSearchInput {
    name: string;
    filters: SavedSearchFilters;
}

export interface SavedSearchResponse {
    success: boolean;
    data: SavedSearchRecord;
    message?: string;
}

export interface SavedSearchListResponse {
    success: boolean;
    data: SavedSearchRecord[];
}

export interface SavedSearchMutationResponse {
    success: boolean;
    message?: string;
}

export interface FavoritePagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface FavoriteVehicle {
    favorite: {
        id: string;
        userId: string;
        listingId: string;
        createdAt: string;
    };
    listing: {
        id: string;
        title: string | null;
        price: string | number;
        currency: string;
        mileage: number | null;
        state: string | null;
        city: string | null;
        status: string;
        expiresAt: string | null;
        condition: MarketplaceCondition | null;
        createdAt: string;
    };
    make: { id: string; name: string } | null;
    model: { id: string; name: string } | null;
    generation: { id: string; name: string } | null;
    variant: {
        id: string;
        year: number | null;
        fuelType: string | null;
        transmission: string | null;
        bodyStyle: string | null;
    } | null;
}

export interface FavoriteListResponse {
    success: boolean;
    data: {
        items: FavoriteVehicle[];
        pagination: FavoritePagination;
    };
}
