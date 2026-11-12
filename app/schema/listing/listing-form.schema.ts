import { z } from "zod";

const optionalText = (maxLength: number, message: string) =>
    z
        .string()
        .trim()
        .max(maxLength, message);

const optionalIntegerText = (
    maxLength: number,
    message: string,
) =>
    z
        .string()
        .trim()
        .max(maxLength, message)
        .refine(
            (value) =>
                value === "" || /^\d+$/.test(value),
            "Enter a valid whole number.",
        );

const optionalNumericText = (
    maxLength: number,
    message: string,
) =>
    z
        .string()
        .trim()
        .max(maxLength, message)
        .refine(
            (value) =>
                value === "" ||
                /^\d+(\.\d+)?$/.test(value),
            "Enter a valid number.",
        );

export const listingFormSchema = z
    .object({
        /*
         * VEHICLE IDENTITY
         *
         * These fields support both catalogue selection
         * and manual vehicle entry.
         */

        vehicleVariantId: z
            .string()
            .trim()
            .refine(
                (value) =>
                    value === "" ||
                    z.string().uuid().safeParse(value).success,
                "Select a valid vehicle variant.",
            ),

        makeName: z
            .string()
            .trim()
            .max(100, "Make cannot exceed 100 characters."),

        modelName: z
            .string()
            .trim()
            .max(100, "Model cannot exceed 100 characters."),

        year: z
            .string()
            .trim()
            .refine(
                (value) =>
                    value === "" ||
                    /^\d{4}$/.test(value),
                "Enter a valid four-digit vehicle year.",
            )
            .refine(
                (value) =>
                    value === "" ||
                    (
                        Number(value) >= 1900 &&
                        Number(value) <= new Date().getFullYear() + 1
                    ),
                "Enter a valid vehicle year.",
            ),

        generationName: optionalText(
            150,
            "Generation cannot exceed 150 characters.",
        ),

        variantName: optionalText(
            150,
            "Variant cannot exceed 150 characters.",
        ),

        /*
         * VEHICLE SPECIFICATIONS
         */

        bodyStyle: optionalText(
            50,
            "Body style cannot exceed 50 characters.",
        ),

        fuelType: optionalText(
            50,
            "Fuel type cannot exceed 50 characters.",
        ),

        transmission: optionalText(
            50,
            "Transmission cannot exceed 50 characters.",
        ),

        driveType: optionalText(
            50,
            "Drive type cannot exceed 50 characters.",
        ),

        engineCapacity: optionalText(
            30,
            "Engine capacity cannot exceed 30 characters.",
        ),

        horsepower: optionalIntegerText(
            30,
            "Horsepower cannot exceed 30 characters.",
        ),

        exteriorColor: optionalIntegerText(
            50,
            "Exterior color cannot exceed 50 characters.",
        ),

        interiorColor: optionalIntegerText(
            50,
            "Interior color cannot exceed 50 characters.",
        ),

        seats: optionalNumericText(
            10,
            "Seats cannot exceed 10 characters.",
        ),

        doors: optionalNumericText(
            10,
            "Doors cannot exceed 10 characters.",
        ),

        /*
         * LISTING DETAILS
         */

        title: z
            .string()
            .trim()
            .min(5, "Title must contain at least 5 characters.")
            .max(200, "Title cannot exceed 200 characters."),

        description: z
            .string()
            .trim()
            .min(10, "Description must contain at least 10 characters.")
            .max(10000, "Description cannot exceed 10,000 characters."),

        price: z
            .string()
            .trim()
            .min(1, "Enter the vehicle price.")
            .refine(
                (value) => {
                    const price = Number(value);

                    return (
                        Number.isFinite(price) &&
                        price > 0
                    );
                },
                "Enter a valid price greater than zero.",
            )
            .refine(
                (value) => {
                    const price = Number(value);

                    return (
                        Number.isFinite(price) &&
                        price <= 999999999999
                    );
                },
                "Enter a valid vehicle price.",
            ),

        mileage: z
            .string()
            .trim()
            .refine(
                (value) =>
                    value === "" ||
                    /^\d+$/.test(value),
                "Mileage must be a whole number.",
            )
            .refine(
                (value) =>
                    value === "" ||
                    Number.isSafeInteger(Number(value)),
                "Enter a valid mileage.",
            )
            .refine(
                (value) =>
                    value === "" ||
                    Number(value) >= 0,
                "Mileage cannot be negative.",
            ),

        condition: z.enum([
            "BRAND_NEW",
            "FOREIGN_USED",
            "NIGERIAN_USED",
        ]),

        country: z
            .string()
            .trim()
            .min(1, "Country is required.")
            .max(100),

        state: z
            .string()
            .trim()
            .max(100, "State cannot exceed 100 characters."),

        city: z
            .string()
            .trim()
            .max(100, "City cannot exceed 100 characters."),
    })
    .refine(
        (values) => {
            const hasCatalogueVariant =
                values.vehicleVariantId.length > 0;

            const hasManualVehicleIdentity =
                values.makeName.length > 0 &&
                values.modelName.length > 0 &&
                values.year.length > 0;

            return (
                hasCatalogueVariant ||
                hasManualVehicleIdentity
            );
        },
        {
            message:
                "Select a catalogue vehicle or enter the vehicle make, model and year.",
            path: ["vehicleVariantId"],
        },
    );

export type ListingFormSchemaValues =
    z.infer<typeof listingFormSchema>;