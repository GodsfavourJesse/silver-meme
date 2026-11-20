import { apiRequest } from "@/app/lib/api/api-client";

const ENDPOINT = "/vehicles/external";

export type ExternalVehicleProvider =
    | "auto_dev"
    | "karmass"
    | "manual";

export interface ExternalVehicleOption {
    value: string;
    label: string;
    source: ExternalVehicleProvider;
}

interface ExternalOptionsResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface ExternalOptionsData {
    years?: ExternalVehicleOption[];
    makes?: ExternalVehicleOption[];
    models?: ExternalVehicleOption[];
}

type OptionCollection =
    | "years"
    | "makes"
    | "models";

function buildQuery(
    params: Record<string, string | number | undefined>,
): string {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (
            value !== undefined &&
            value !== ""
        ) {
            searchParams.set(key, String(value));
        }
    }

    return searchParams.toString();
}

async function getOptions(
    path: string,
    collection: OptionCollection,
): Promise<ExternalVehicleOption[]> {
    const response = await apiRequest<
        ExternalOptionsResponse<ExternalOptionsData>
    >(`${ENDPOINT}/${path}`, {
        method: "GET",
    });

    if (!response?.success || !response.data) {
        throw new Error(
            response?.message ??
                "The vehicle catalogue could not be loaded.",
        );
    }

    const options = response.data[collection];

    if (!Array.isArray(options)) {
        throw new Error(
            `The vehicle provider returned an invalid ${collection} response.`,
        );
    }

    return options;
}

/**
 * STEP 1
 * Load available vehicle years.
 */
export async function getExternalVehicleYears(): Promise<
    ExternalVehicleOption[]
> {
    return getOptions("years", "years");
}

/**
 * STEP 2
 * Load vehicle makes.
 */
export async function getExternalVehicleMakes(
    year: number,
): Promise<ExternalVehicleOption[]> {
    return getOptions(
        `makes?${buildQuery({ year })}`,
        "makes",
    );
}

/**
 * STEP 3
 * Load models belonging to a selected make.
 */
export async function getExternalVehicleModels(
    year: number,
    make: string,
): Promise<ExternalVehicleOption[]> {
    return getOptions(
        `models?${buildQuery({
            year,
            make,
        })}`,
        "models",
    );
}