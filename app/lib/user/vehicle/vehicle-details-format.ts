import { ApiError } from "@/app/lib/api/api-error";
import type { VehicleDetailsResponse } from "@/app/types/user/vehicle-details.types";

export function formatNaira(value: string | number): string {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return "Price unavailable";
    }

    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(value: string | null): string {
    if (!value) {
        return "Date unavailable";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

export function formatNumber(value: number | null): string | null {
    if (value === null || !Number.isFinite(value)) {
        return null;
    }

    return new Intl.NumberFormat("en-NG").format(value);
}

export function formatEnum(value: string | null | undefined): string | null {
    if (!value) {
        return null;
    }

    return value
        .toLowerCase()
        .split("_")
        .map((part) =>
            part.length > 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part,
        )
        .join(" ");
}

export function getLocation(details: VehicleDetailsResponse): string {
    return [details.listing.city, details.listing.state, details.listing.country]
        .filter(Boolean)
        .join(", ");
}

export function getVehicleTitle(details: VehicleDetailsResponse): string {
    return [
        details.variant.year,
        details.make.name,
        details.model.name,
        details.generation.name,
        details.variant.name,
    ]
        .filter(
            (value) =>
                value !== null &&
                value !== undefined &&
                String(value).trim().length > 0,
        )
        .join(" ");
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Something went wrong. Please try again.";
}

export function isAuthenticationError(error: unknown): boolean {
    return error instanceof ApiError && error.status === 401;
}