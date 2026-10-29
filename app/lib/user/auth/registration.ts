import { z } from "zod";

import { ApiError } from "@/app/lib/api/api-error";

/*
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 100;

const PHONE_MAX_LENGTH = 30;

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

/*
 * ============================================================
 * SCHEMA
 * ============================================================
 */

export const registrationSchema = z
    .object({
        firstName: z
            .string()
            .trim()
            .min(
                NAME_MIN_LENGTH,
                "First name must contain at least 2 characters.",
            )
            .max(
                NAME_MAX_LENGTH,
                "First name is too long.",
            ),

        lastName: z
            .string()
            .trim()
            .min(
                NAME_MIN_LENGTH,
                "Last name must contain at least 2 characters.",
            )
            .max(
                NAME_MAX_LENGTH,
                "Last name is too long.",
            ),

        email: z
            .string()
            .trim()
            .email("Enter a valid email address.")
            .max(
                254,
                "Email address is too long.",
            )
            .transform((value) => value.toLowerCase()),

        phone: z
            .string()
            .trim()
            .max(
                PHONE_MAX_LENGTH,
                "Phone number must not exceed 30 characters.",
            )
            .regex(
                /^[+\d\s()-]*$/,
                "Use digits, spaces, +, - or parentheses only.",
            ),

        password: z
            .string()
            .min(
                PASSWORD_MIN_LENGTH,
                "Password must contain at least 8 characters.",
            )
            .max(
                PASSWORD_MAX_LENGTH,
                "Password must not exceed 128 characters.",
            ),

        confirmPassword: z
            .string()
            .min(
                1,
                "Confirm your password.",
            ),
    })
    .refine(
        (values) => values.password === values.confirmPassword,
        {
            message: "Passwords do not match.",
            path: ["confirmPassword"],
        },
    );

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

export type RegistrationFormValues = z.infer<
    typeof registrationSchema
>;

export type RegistrationFieldName = keyof RegistrationFormValues;

/*
 * ============================================================
 * DEFAULT VALUES
 * ============================================================
 */

export const REGISTRATION_DEFAULTS: RegistrationFormValues = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
};

/*
 * ============================================================
 * API ERROR HANDLING
 * ============================================================
 */

export function isDuplicateAccountError(
    error: unknown,
): boolean {
    return (
        error instanceof ApiError &&
        error.status === 409
    );
}

export function getRegistrationErrorMessage(
    error: unknown,
): string {
    if (error instanceof ApiError) {
        if (error.status === 409) {
            return (
                "An account with these details may already exist. " +
                "Try logging in or use another email address."
            );
        }

        if (error.status === 400 || error.status === 422) {
            return (
                "Some registration details are invalid. " +
                "Please review your information and try again."
            );
        }

        if (error.status === 429) {
            return (
                "Too many attempts. Please wait a little while " +
                "before trying again."
            );
        }

        if (error.status === 0) {
            return (
                "We couldn't connect to the server. " +
                "Check your internet connection and try again."
            );
        }

        if (error.status >= 500) {
            return (
                "We couldn't complete your registration right now. " +
                "Please try again shortly."
            );
        }

        return error.message;
    }

    return (
        "Something went wrong while creating your account. " +
        "Please try again."
    );
}