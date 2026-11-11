export type MarketplaceCondition =
    | "BRAND_NEW"
    | "FOREIGN_USED"
    | "NIGERIAN_USED";

export interface MarketplaceListing {
    id: string;
    sellerId: string;
    vehicleVariantId: string;
    title: string;
    description: string | null;
    price: string | number;
    currency: string;
    mileage: number | null;
    condition: MarketplaceCondition | null;
    state: string | null;
    city: string | null;
    status: string;
    viewCount: number;
    publishedAt: string | null;
    createdAt: string;
    updatedAt?: string;
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
    engineName?: string | null;
    engineDisplacementCc?: number | null;
    cylinders?: number | null;
    horsepower?: number | null;
    fuelType?: string | null;
    transmission?: string | null;
    driveType?: string | null;
    bodyStyle?: string | null;
    seats?: number | null;
    doors?: number | null;
}

export interface MarketplaceImage {
    id: string;
    objectKey: string;
    sortOrder: number;
    mimeType: string | null;
    width: number | null;
    height: number | null;
    url: string;
    thumbnailUrl: string;
    detailUrl: string;
}

export interface MarketplaceSeller {
    id: string;
    firstName: string;
    lastName: string;
    displayName: string;
    accountType: string;
    avatarUrl: string | null;
    createdAt: string;
}

export interface MarketplaceDealer {
    companyName: string | null;
    verified: boolean | null;
    verifiedAt: string | null;
}

export interface MarketplaceSearchResult {
    listing: MarketplaceListing;
    make: MarketplaceMake | null;
    model: MarketplaceModel | null;
    generation: MarketplaceGeneration | null;
    variant: MarketplaceVariant | null;
    seller: MarketplaceSeller;
    dealer: MarketplaceDealer | null;
    images: MarketplaceImage[];
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

    condition?: MarketplaceCondition;
    fuelType?: string;
    transmission?: string;
    bodyStyle?: string;

    state?: string;
    city?: string;

    dealerOnly?: boolean;
    verifiedDealerOnly?: boolean;

    /**
     * Optional administrative/special-purpose exclusion.
     * Normal marketplace and latest-vehicle results include boosted
     * listings; boosts affect placement, not listing eligibility.
     */
    excludeBoosted?: boolean;

    sort?: "newest" | "price_asc" | "price_desc" | "relevance";

    make?: string;
    model?: string;
    variant?: string;

    makeId?: string;
    modelId?: string;
    generationId?: string;
    variantId?: string;
}