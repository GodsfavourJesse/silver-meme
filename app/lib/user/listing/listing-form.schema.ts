import { z } from "zod";

export const listingFormSchema = z.object({
    vehicleVariantId: z
        .string()
        .uuid("Select a valid vehicle variant."),

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

    condition: z.enum(["NEW", "USED"]),

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
});

export type ListingFormSchemaValues =
    z.infer<typeof listingFormSchema>;