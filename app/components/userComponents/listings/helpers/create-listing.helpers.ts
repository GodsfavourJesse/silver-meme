import type { CreateListingPayload } from "@/app/types/user/listings/listing-form.types";

import type { ListingFormSchemaValues } from "@/app/schema/listing/listing-form.schema";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface FormError {
    message: string;
    code?: string;
    status?: number;
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

export const DEFAULT_VALUES: ListingFormSchemaValues = {
    vehicleVariantId: "",

    // Vehicle identity
    makeName: "",
    modelName: "",
    year: "",
    generationName: "",
    variantName: "",

    // Vehicle specifications
    bodyStyle: "",
    fuelType: "",
    transmission: "",
    driveType: "",
    engineCapacity: "",
    horsepower: "",
    exteriorColor: "",
    interiorColor: "",
    seats: "",
    doors: "",

    // Listing details
    title: "",
    description: "",
    price: "",
    mileage: "",

    // Location and condition
    condition: "NIGERIAN_USED",
    country: "Nigeria",
    state: "",
    city: "",
};

/** Error codes that mean the seller needs credits or a subscription. */
const SUBSCRIPTION_ERROR_CODES = [
    "SUBSCRIPTION_REQUIRED",
    "SUBSCRIPTION_EXPIRED",
    "SUBSCRIPTION_INACTIVE",
    "INSUFFICIENT_LISTING_CREDITS",
    "LISTING_ACCESS_REQUIRED",
];

const FALLBACK_MESSAGE =
    "We couldn't create your listing. Please try again.";

const SUBSCRIPTION_MESSAGES = {
    INSUFFICIENT_LISTING_CREDITS:
        "You've used all your free listing credits. Choose a subscription plan to continue creating listings.",
    SUBSCRIPTION_EXPIRED:
        "Your subscription has expired or is no longer active. Renew or choose a plan to continue creating listings.",
    SUBSCRIPTION_REQUIRED:
        "An active subscription is required to create another listing. Choose a plan to continue.",
    LISTING_ACCESS_REQUIRED:
        "You can't create another listing right now because your free listing credits may be exhausted or your subscription may have expired. View the available plans to continue.",
} as const;

/* -------------------------------------------------------------------------- */
/*  Error handling                                                            */
/* -------------------------------------------------------------------------- */

const asRecord = (value: unknown): Record<string, unknown> | null =>
    typeof value === "object" && value !== null
        ? (value as Record<string, unknown>)
        : null;

const findString = (values: unknown[]): string | undefined =>
    values.find(
        (value): value is string =>
            typeof value === "string" && value.trim().length > 0,
    );

const findNumber = (values: unknown[]): number | undefined =>
    values.find(
        (value): value is number =>
            typeof value === "number" && Number.isFinite(value),
    );

/** Infers an error code from the message when the API doesn't send one. */
function inferErrorCode(message: string | undefined): string | undefined {
    const text = (message ?? "").toLowerCase();

    if (
        /listing credits|free credits|insufficient.*credits|credits.*exhausted/.test(
            text,
        )
    ) {
        return "INSUFFICIENT_LISTING_CREDITS";
    }

    if (
        /subscription.*(expired|inactive)|(?:expired|inactive).*subscription/.test(
            text,
        )
    ) {
        return "SUBSCRIPTION_EXPIRED";
    }

    if (/subscription required|active subscription|please subscribe/.test(text)) {
        return "SUBSCRIPTION_REQUIRED";
    }

    return undefined;
}

/** Turns any thrown value into a user-friendly `FormError`. */
export function getErrorMessage(error: unknown): FormError {
    if (typeof error !== "object" || error === null) {
        return { message: FALLBACK_MESSAGE };
    }

    const candidate = error as Record<string, unknown>;
    const response = asRecord(candidate.response);
    const responseData = asRecord(response?.data);
    const data = asRecord(candidate.data);

    const message = findString([
        candidate.message,
        responseData?.message,
        data?.message,
    ]);

    const status = findNumber([
        candidate.status,
        candidate.statusCode,
        candidate.httpStatus,
        response?.status,
    ]);

    let code =
        findString([candidate.code, responseData?.code, data?.code]) ??
        inferErrorCode(message);

    // Some API wrappers return only the HTTP status.
    if (!code && status === 402) {
        code = "LISTING_ACCESS_REQUIRED";
    }

    switch (code) {
        case "INSUFFICIENT_LISTING_CREDITS":
            return {
                message: SUBSCRIPTION_MESSAGES.INSUFFICIENT_LISTING_CREDITS,
                code,
                status,
            };

        case "SUBSCRIPTION_EXPIRED":
        case "SUBSCRIPTION_INACTIVE":
            return {
                message: SUBSCRIPTION_MESSAGES.SUBSCRIPTION_EXPIRED,
                code,
                status,
            };

        case "SUBSCRIPTION_REQUIRED":
            return {
                message: SUBSCRIPTION_MESSAGES.SUBSCRIPTION_REQUIRED,
                code,
                status,
            };

        default:
            break;
    }

    if (status === 402) {
        return {
            message: SUBSCRIPTION_MESSAGES.LISTING_ACCESS_REQUIRED,
            code,
            status,
        };
    }

    return { message: message ?? FALLBACK_MESSAGE, code, status };
}

export function isSubscriptionError(error: FormError | null): boolean {
    if (!error) {
        return false;
    }

    return (
        SUBSCRIPTION_ERROR_CODES.includes(error.code ?? "") ||
        error.status === 402
    );
}

/* -------------------------------------------------------------------------- */
/*  Payload                                                                   */
/* -------------------------------------------------------------------------- */

export function buildCreateListingPayload(
    values: ListingFormSchemaValues,
): CreateListingPayload {
    const mileage = values.mileage.trim();
    const state = values.state.trim();
    const city = values.city.trim();

    const makeName = values.makeName.trim();
    const modelName = values.modelName.trim();
    const year = values.year.trim();

    const generationName = values.generationName.trim();
    const variantName = values.variantName.trim();
    const vehicleVariantId = values.vehicleVariantId.trim();

    const bodyStyle = values.bodyStyle.trim();
    const fuelType = values.fuelType.trim();
    const transmission = values.transmission.trim();
    const driveType = values.driveType.trim();

    const engineCapacity = values.engineCapacity.trim();
    const horsepower = values.horsepower.trim();

    const exteriorColor = values.exteriorColor.trim();
    const interiorColor = values.interiorColor.trim();

    const seats = values.seats.trim();
    const doors = values.doors.trim();

    return {
        ...(vehicleVariantId ? { vehicleVariantId } : {}),

        // Vehicle identity
        makeName,
        modelName,
        year: Number(year),

        ...(generationName ? { generationName } : {}),
        ...(variantName ? { variantName } : {}),

        // Vehicle specifications
        ...(bodyStyle ? { bodyStyle } : {}),
        ...(fuelType ? { fuelType } : {}),
        ...(transmission ? { transmission } : {}),
        ...(driveType ? { driveType } : {}),

        ...(engineCapacity ? { engineCapacity } : {}),
        ...(horsepower ? { horsepower: Number(horsepower) } : {}),

        ...(exteriorColor ? { exteriorColor } : {}),
        ...(interiorColor ? { interiorColor } : {}),

        ...(seats ? { seats: Number(seats) } : {}),
        ...(doors ? { doors: Number(doors) } : {}),

        // Listing details
        title: values.title.trim(),
        description: values.description.trim(),

        price: Number(values.price),
        currency: "NGN",

        condition: values.condition,
        country: values.country.trim(),

        ...(mileage !== "" ? { mileage: Number(mileage) } : {}),
        ...(state ? { state } : {}),
        ...(city ? { city } : {}),
    };
}
