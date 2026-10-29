export interface MarketplaceListing {
    id: string;
    sellerId: string;
    vehicleVariantId: string;
    title: string;
    description: string | null;
    price: string | number;
    currency: string;
    mileage: number | null;
    condition: string | null;
    state: string | null;
    city: string | null;
    status: string;
    viewCount: number;
    publishedAt: string | null;
    createdAt: string;
    expiresAt: string | null;
}

export interface MarketplaceMake {
    id: string;
    name: string;
    slug?: string;
}

export interface MarketplaceModel {
    id: string;
    name: string;
    slug?: string;
}

export interface MarketplaceGeneration {
    id: string;
    name: string;
}

export interface MarketplaceVariant {
    id: string;
    name?: string;
    year?: number | null;
    fuelType?: string | null;
    transmission?: string | null;
    bodyStyle?: string | null;
}

export interface MarketplaceSearchResult {
    listing: MarketplaceListing;
    make: MarketplaceMake | null;
    model: MarketplaceModel | null;
    generation: MarketplaceGeneration | null;
    variant: MarketplaceVariant | null;
    boostPriority: number;
}

export interface MarketplacePagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface MarketplaceSearchResponse {
    success: boolean;
    data: {
        listings: MarketplaceSearchResult[];
        pagination: MarketplacePagination;
    };
}

export interface MarketplaceSearchParams {
    page?: number;
    limit?: number;
    q?: string;
    minPrice?: number;
    maxPrice?: number;
    minMileage?: number;
    maxMileage?: number;
    minYear?: number;
    maxYear?: number;
    condition?: string;
    fuelType?: string;
    transmission?: string;
    bodyStyle?: string;
    state?: string;
    city?: string;
    dealerOnly?: boolean;
    verifiedDealerOnly?: boolean;
    sort?: "newest" | "price_asc" | "price_desc" | "relevance";
    makeId?: string;
    modelId?: string;
    variantId?: string;
}