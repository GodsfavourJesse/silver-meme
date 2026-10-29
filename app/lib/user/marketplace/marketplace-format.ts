import type { MarketplaceSearchResult } from "@/app/types/user/marketplace.types";

export function formatPrice(price: string | number, currency: string): string {
    const numericPrice = typeof price === "number" ? price : Number(price);

    if (!Number.isFinite(numericPrice)) {
        return "Price on request";
    }

    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: currency || "NGN",
            maximumFractionDigits: 0,
        }).format(numericPrice);
    } catch {
        return `${currency || "NGN"} ${numericPrice.toLocaleString("en-NG")}`;
    }
}

export function formatMileage(mileage: number | null): string | null {
    if (mileage === null || mileage === undefined) {
        return null;
    }

    return `${new Intl.NumberFormat("en-NG").format(mileage)} km`;
}

export function getListingTitle(result: MarketplaceSearchResult): string {
    const title = result.listing.title?.trim();

    if (title) {
        return title;
    }

    return (
        [result.make?.name, result.model?.name, result.variant?.name]
            .filter(Boolean)
            .join(" ") || "Vehicle listing"
    );
}

export function getLocation(result: MarketplaceSearchResult): string {
    return (
        [result.listing.city, result.listing.state].filter(Boolean).join(", ") ||
        "Nigeria"
    );
}

export function getVehicleDetails(result: MarketplaceSearchResult): string[] {
    const details: string[] = [];
    const year = result.variant?.year;
    const mileage = formatMileage(result.listing.mileage);
    const transmission = result.variant?.transmission;

    if (year) {
        details.push(String(year));
    }

    if (mileage) {
        details.push(mileage);
    }

    if (transmission) {
        details.push(transmission);
    }

    return details;
}