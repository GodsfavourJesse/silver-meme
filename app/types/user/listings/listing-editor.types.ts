import { ListingImageRecord } from "./listing-image.types";
import { ListingRecord, ListingVehicleGeneration, ListingVehicleMake, ListingVehicleModel, ListingVehicleVariant } from "./listing.types";

export interface SellerListingDetailResponse {
    success: boolean;
    data: {
        listing: ListingRecord;
        images: ListingImageRecord[];
        vehicleVariant?: ListingVehicleVariant;
        vehicleGeneration?: ListingVehicleGeneration;
        vehicleModel?: ListingVehicleModel;
        vehicleMake?: ListingVehicleMake;
    };
    message?: string;
}

export interface ListingSubmitResponse {
    success: boolean;
    data?: {
        listing?: ListingRecord;
    };
    message?: string;
}