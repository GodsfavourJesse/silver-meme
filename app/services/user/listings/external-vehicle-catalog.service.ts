import { apiRequest } from "@/app/lib/api/api-client";

const ENDPOINT = "/vehicles/external";

export interface ExternalVehicleOption {
    value: string;
    label: string;
    source: "carsxe" | "vehiclesdb";
}

interface ExternalOptionsResponse<T> {
    success: boolean;
    data: T;
}

async function getOptions(path: string): Promise<ExternalVehicleOption[]> {
    const response = await apiRequest<ExternalOptionsResponse<{ options?: ExternalVehicleOption[]; makes?: ExternalVehicleOption[]; models?: ExternalVehicleOption[] }>>(
        `${ENDPOINT}/${path}`,
        { method: "GET" },
    );
    if (!response?.success) throw new Error("The external vehicle catalogue could not be loaded.");
    const data = response.data;
    const options = data.options ?? data.makes ?? data.models ?? [];
    return options;
}

export function getExternalVehicleMakes(provider: "carsxe" | "vehiclesdb" = "carsxe"): Promise<ExternalVehicleOption[]> {
    return getOptions(`makes?provider=${provider}`);
}

export function getExternalVehicleModels(make: string, provider: "carsxe" | "vehiclesdb" = "carsxe"): Promise<ExternalVehicleOption[]> {
    return getOptions(`models?provider=${provider}&make=${encodeURIComponent(make)}`);
}

export function getExternalVehicleYears(make: string, model: string): Promise<ExternalVehicleOption[]> {
    return getOptions(`options?dimension=years&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`);
}

export function getExternalVehicleVariants(make: string, model: string, year: number): Promise<ExternalVehicleOption[]> {
    return getOptions(`options?dimension=variants&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`);
}
