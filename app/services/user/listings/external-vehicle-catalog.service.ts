import { apiRequest } from "@/app/lib/api/api-client";

const ENDPOINT = "/vehicles/external";

export type ExternalVehicleProvider = "carsxe" | "vehiclesdb";

export interface ExternalVehicleOption {
    value: string;
    label: string;
    source: ExternalVehicleProvider;
}

interface ExternalOptionsResponse<T> {
    success: boolean;
    data: T;
}

interface ExternalOptionsData {
    options?: ExternalVehicleOption[];
    makes?: ExternalVehicleOption[];
    models?: ExternalVehicleOption[];
}

async function getOptions(
    path: string
): Promise<ExternalVehicleOption[]> {
    const response = await apiRequest<
        ExternalOptionsResponse<ExternalOptionsData>
    >(`${ENDPOINT}/${path}`, {
        method: "GET",
    });

    if (!response?.success) {
        throw new Error(
            "The external vehicle catalogue could not be loaded."
        );
    }

    const data = response.data;

    return data.options ?? data.makes ?? data.models ?? [];
}

function buildQuery(
    params: Record<string, string | number | undefined>
): string {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
            searchParams.set(key, String(value));
        }
    }

    return searchParams.toString();
}

/**
 * Loads vehicle makes.
 *
 * When a provider is supplied, only that provider is queried.
 * Otherwise, CarsXE is attempted first, followed by VehiclesDB.
 */
export async function getExternalVehicleMakes(
    provider?: ExternalVehicleProvider
): Promise<ExternalVehicleOption[]> {
    if (provider) {
        return getOptions(
            `makes?${buildQuery({ provider })}`
        );
    }

    let carsXeError: unknown;

    try {
        const options = await getExternalVehicleMakes("carsxe");

        if (options.length > 0) {
            return options;
        }
    } catch (error) {
        carsXeError = error;
    }

    try {
        return await getExternalVehicleMakes("vehiclesdb");
    } catch {
        throw carsXeError instanceof Error
            ? carsXeError
            : new Error(
                  "No vehicle make provider is currently available."
              );
    }
}

/**
 * Loads models for a selected make.
 *
 * Supports explicit provider selection and automatic fallback.
 */
export async function getExternalVehicleModels(
    make: string,
    provider?: ExternalVehicleProvider
): Promise<ExternalVehicleOption[]> {
    if (provider) {
        const query = buildQuery({
            provider,
            make,
        });

        return getOptions(`models?${query}`);
    }

    let carsXeError: unknown;

    try {
        const options = await getExternalVehicleModels(
            make,
            "carsxe"
        );

        if (options.length > 0) {
            return options;
        }
    } catch (error) {
        carsXeError = error;
    }

    try {
        return await getExternalVehicleModels(
            make,
            "vehiclesdb"
        );
    } catch {
        throw carsXeError instanceof Error
            ? carsXeError
            : new Error(
                  "No vehicle model provider is currently available."
              );
    }
}

/**
 * Loads available model years.
 */
export function getExternalVehicleYears(
    make: string,
    model: string
): Promise<ExternalVehicleOption[]> {
    // VehiclesDB currently supplies makes/models only.
    // Model years and variants are resolved through CarsXE.
    const query = buildQuery({
        dimension: "years",
        make,
        model,
    });

    return getOptions(`options?${query}`);
}

/**
 * Loads available vehicle variants.
 */
export function getExternalVehicleVariants(
    make: string,
    model: string,
    year: number
): Promise<ExternalVehicleOption[]> {
    const query = buildQuery({
        dimension: "variants",
        make,
        model,
        year,
    });

    return getOptions(`options?${query}`);
}