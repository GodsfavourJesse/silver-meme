import z from "zod";

export const registrationSchema = z
    .object({
        firstName: z
            .string()
            .trim()
            .min(2, "First name must contain at least 2 characters.")
            .max(100, "First name cannot exceed 100 characters."),

        lastName: z
            .string()
            .trim()
            .min(2, "Last name must contain at least 2 characters.")
            .max(100, "Last name cannot exceed 100 characters."),

        email: z
            .string()
            .trim()
            .email("Enter a valid email address."),

        phone: z
            .string()
            .trim()
            .max(30, "Phone number cannot exceed 30 characters.")
            .optional(),

        password: z
            .string()
            .min(8, "Password must contain at least 8 characters.")
            .max(128, "Password cannot exceed 128 characters."),

        confirmPassword: z
            .string()
            .min(1, "Please confirm your password."),
    })
    .refine(
        (values) => values.password === values.confirmPassword,
        {
            message: "Passwords do not match.",
            path: ["confirmPassword"],
        },
    );

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Enter a valid email address.")
        .max(254, "Email address is too long."),
});