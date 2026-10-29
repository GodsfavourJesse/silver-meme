export interface VehicleDetailsImage {
    id: string;
    objectKey: string;
    sortOrder: number;
    url: string;
    thumbnailUrl: string;
    detailUrl: string;
    mimeType: string | null;
    width: number | null;
    height: number | null;
}

export interface VehicleDetailsListing {
    id: string;
    sellerId: string;
    vehicleVariantId: string;
    title: string;
    description: string | null;
    price: string | number;
    currency: string;
    mileage: number | null;
    condition: string | null;
    country: string;
    state: string | null;
    city: string | null;
    status: string;
    viewCount: number;
    publishedAt: string | null;
    createdAt: string;
    expiresAt: string | null;
}

export interface VehicleDetailsSeller {
    id: string;
    firstName: string;
    lastName: string;
    accountType: string;
    avatarUrl: string | null;
    createdAt: string;
    displayName: string;
}

export interface VehicleDetailsDealer {
    companyName: string;
    verified: boolean;
    verifiedAt: string | null;
}

export interface VehicleDetailsMake {
    id: string;
    name: string;
}

export interface VehicleDetailsModel {
    id: string;
    name: string;
}

export interface VehicleDetailsGeneration {
    id: string;
    name: string;
}

export interface VehicleDetailsVariant {
    id: string;
    name: string;
    year: number;
    engineName: string | null;
    engineDisplacementCc: number | null;
    cylinders: number | null;
    horsepower: number | null;
    fuelType: string | null;
    transmission: string | null;
    driveType: string | null;
    bodyStyle: string | null;
    seats: number | null;
    doors: number | null;
}

export interface VehicleDetailsResponse {
    listing: VehicleDetailsListing;
    seller: VehicleDetailsSeller;
    dealer: VehicleDetailsDealer | null;
    make: VehicleDetailsMake;
    model: VehicleDetailsModel;
    generation: VehicleDetailsGeneration;
    variant: VehicleDetailsVariant;
    isBoosted: boolean;
    images: VehicleDetailsImage[];
}

export interface VehicleDetailsApiResponse {
    success: boolean;
    data: VehicleDetailsResponse;
    message?: string;
}

export interface VehicleDetailsFavoriteStatusResponse {
    success: boolean;
    data: {
        listingId: string;
        favorited: boolean;
    };
}

export interface VehicleDetailsActionResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export type VehicleReportReason =
    | "SCAM_OR_FRAUD"
    | "WRONG_VEHICLE_INFORMATION"
    | "DUPLICATE_LISTING"
    | "ALREADY_SOLD"
    | "INAPPROPRIATE_CONTENT"
    | "MISLEADING_PRICE"
    | "OTHER";

export type VehicleSharePlatform =
    | "WHATSAPP"
    | "FACEBOOK"
    | "X"
    | "COPY_LINK"
    | "OTHER";

export interface VehicleContactResponse {
    success: boolean;
    message?: string;
    data: {
        conversationId: string;
        listingId: string;
        sellerId: string;
        messageSent: boolean;
    };
}