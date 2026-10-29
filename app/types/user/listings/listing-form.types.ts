export type VehicleCondition = "NEW" | "USED";

export interface ListingFormValues {
    vehicleVariantId: string;
    title: string;
    description: string;
    price: string;
    currency: "NGN";
    mileage: string;
    condition: VehicleCondition;
    country: string;
    state: string;
    city: string;
}

export interface VehicleMakeOption {
    id: string;
    name: string;
    slug?: string;
    active?: boolean;
    nigeriaMarket?: boolean;
}

export interface VehicleModelOption {
    id: string;
    makeId: string;
    name: string;
    slug?: string;
    active?: boolean;
    nigeriaMarket?: boolean;
}

export interface VehicleGenerationOption {
    id: string;
    modelId: string;
    name: string;
    slug?: string;
    startYear?: number | null;
    endYear?: number | null;
    active?: boolean;
    nigeriaMarket?: boolean;
}

export interface VehicleEngineOption {
    id: string;
    name: string;
    slug?: string;
    displacementCc?: number | null;
    cylinders?: number | null;
    horsepower?: number | null;
    aliases?: string[] | null;
}

export interface VehicleVariantOption {
    id: string;
    generationId: string;
    year: number;
    name: string;
    slug?: string;
    engineId?: string | null;
    engine?: VehicleEngineOption | null;
    engineName?: string | null;
    engineDisplacementCc?: number | null;
    variantCylinders?: number | null;
    variantHorsepower?: number | null;
    fuelType?: string | null;
    transmission?: string | null;
    driveType?: string | null;
    bodyStyle?: string | null;
    seats?: number | null;
    doors?: number | null;
    aliases?: string[] | null;
    nigeriaMarket?: boolean;
    active?: boolean;
}

export interface VehicleSearchResult {
    variantId: string;
    variantName: string;
    variantSlug?: string | null;
    variantAliases?: string[] | null;
    year: number;

    engineId?: string | null;
    engineName?: string | null;
    engineSlug?: string | null;
    engineAliases?: string[] | null;
    engineDisplacementCc?: number | null;
    engineCylinders?: number | null;
    engineHorsepower?: number | null;

    legacyEngineName?: string | null;
    legacyEngineDisplacementCc?: number | null;
    legacyCylinders?: number | null;
    legacyHorsepower?: number | null;

    bodyStyle?: string | null;
    fuelType?: string | null;
    transmission?: string | null;
    driveType?: string | null;
    seats?: number | null;
    doors?: number | null;

    generationId: string;
    generationName: string;
    generationSlug?: string | null;
    generationAliases?: string[] | null;

    modelId: string;
    modelName: string;
    modelSlug?: string | null;
    modelAliases?: string[] | null;

    makeId: string;
    makeName: string;
    makeSlug?: string | null;
    makeAliases?: string[] | null;
}

export interface VehicleCatalogResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface CreateListingPayload {
    vehicleVariantId: string;
    title: string;
    description: string;
    price: number;
    currency: "NGN";
    mileage?: number;
    condition: VehicleCondition;
    country: string;
    state?: string;
    city?: string;
}

export interface VehicleModelYearOption {
    id: string;
    generationId: string;
    year: number;
    nigeriaMarket?: boolean;
    active?: boolean;
}