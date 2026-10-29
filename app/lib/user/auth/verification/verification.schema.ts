import { z } from "zod";

export const verificationSchema = z.object({
    code: z
        .string()
        .trim()
        .regex(
            /^\d{6}$/,
            "Enter the six-digit verification code.",
        ),
});

export type VerificationFormValues = z.infer<
    typeof verificationSchema
>;

export const RESEND_COOLDOWN_SECONDS = 60;