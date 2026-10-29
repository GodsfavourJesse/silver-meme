"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    useForm,
    type SubmitHandler,
    useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "framer-motion";

import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    CircleAlert,
    Fingerprint,
    KeyRound,
    LockKeyhole,
    ShieldCheck,
} from "lucide-react";

import { authService } from "@/app/services/user/auth/auth.service";
import { PasswordInput } from "@/app/components/auth/PasswordInput";
import { ApiError } from "@/app/lib/api/api-error";

const BRAND = "#1491FF";
const BRAND_HOVER = "#0876D1";

const easing = [0.22, 1, 0.36, 1] as const;

const resetPasswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(8, "Password must contain at least 8 characters")
            .max(128, "Password cannot exceed 128 characters"),

        confirmPassword: z
            .string()
            .min(1, "Please confirm your new password"),
    })
    .refine(
        (values) => values.newPassword === values.confirmPassword,
        {
            message: "Passwords do not match",
            path: ["confirmPassword"],
        },
    );

type ResetPasswordValues = z.infer<
    typeof resetPasswordSchema
>;

const passwordRequirements = [
    {
        label: "At least 8 characters",
        test: (password: string) => password.length >= 8,
    },
    {
        label: "An uppercase letter",
        test: (password: string) => /[A-Z]/.test(password),
    },
    {
        label: "A lowercase letter",
        test: (password: string) => /[a-z]/.test(password),
    },
    {
        label: "A number",
        test: (password: string) => /\d/.test(password),
    },
];

export function ResetPasswordForm() {
    const searchParams = useSearchParams();

    const token = searchParams.get("token");

    const [completed, setCompleted] = useState(false);
    const [serverError, setServerError] = useState<string | null>(
        null,
    );

    const shouldReduceMotion = useReducedMotion();

    const {
        register,
        handleSubmit,
        control,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
        mode: "onBlur",
    });

    const newPassword = useWatch({
        control,
        name: "newPassword",
        defaultValue: "",
    });

    const confirmPassword = useWatch({
        control,
        name: "confirmPassword",
        defaultValue: "",
    });

    const completedRequirements = passwordRequirements.filter(
        (requirement) => requirement.test(newPassword),
    ).length;

    const passwordsMatch =
        confirmPassword.length > 0 &&
        newPassword === confirmPassword;

    const pageVariants = {
        hidden: {
            opacity: 0,
            y: shouldReduceMotion ? 0 : 14,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: shouldReduceMotion ? 0 : 0.4,
                ease: easing,
                staggerChildren: shouldReduceMotion ? 0 : 0.065,
            },
        },
        exit: {
            opacity: 0,
            y: shouldReduceMotion ? 0 : -8,
            transition: {
                duration: shouldReduceMotion ? 0 : 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: shouldReduceMotion ? 0 : 9,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: shouldReduceMotion ? 0 : 0.32,
                ease: easing,
            },
        },
    };

    const onSubmit: SubmitHandler<
        ResetPasswordValues
    > = async (values) => {
        setServerError(null);

        if (!token) {
            setServerError(
                "This password-reset link is missing its token. Request a new reset link to continue.",
            );
            return;
        }

        try {
            await authService.resetPassword({
                token,
                newPassword: values.newPassword,
            });

            setCompleted(true);
        } catch (error) {
            if (error instanceof ApiError) {
                setServerError(
                    error.message ||
                        "We couldn't reset your password. Your reset link may have expired.",
                );
            } else {
                setServerError(
                    "We couldn't connect to KARMASS. Check your connection and try again.",
                );
            }
        }
    };

    return (
        <AnimatePresence mode="wait" initial={false}>
            {completed ? (
                /* ================================================
                   PASSWORD UPDATED
                ================================================ */
                <motion.section
                    key="success"
                    variants={pageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    aria-labelledby="reset-success-heading"
                    className="
                        overflow-hidden rounded-[28px]
                        border border-slate-200/80
                        bg-white
                        shadow-[0_24px_80px_rgba(15,23,42,0.07)]
                    "
                >
                    <div className="relative px-5 py-8 text-center sm:px-8 sm:py-10">
                        <div
                            aria-hidden="true"
                            className="
                                pointer-events-none absolute
                                -right-16 -top-20
                                h-48 w-48 rounded-full
                                bg-[#1491FF]/[0.08] blur-3xl
                            "
                        />

                        <motion.div
                            variants={itemVariants}
                            className="relative"
                        >
                            <motion.div
                                initial={
                                    shouldReduceMotion
                                        ? false
                                        : {
                                              opacity: 0,
                                              scale: 0.65,
                                              rotate: -10,
                                          }
                                }
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    rotate: 0,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 180,
                                    damping: 15,
                                }}
                                className="
                                    relative mx-auto mb-6
                                    flex h-[78px] w-[78px]
                                    items-center justify-center
                                    rounded-[25px]
                                    border border-[#1491FF]/15
                                    bg-[#1491FF]/[0.07]
                                    text-[#1491FF]
                                    ring-8 ring-[#1491FF]/[0.035]
                                "
                            >
                                <CheckCircle2
                                    size={38}
                                    strokeWidth={1.7}
                                    aria-hidden="true"
                                />

                                <motion.span
                                    initial={
                                        shouldReduceMotion
                                            ? false
                                            : {
                                                  scale: 0,
                                                  opacity: 0,
                                              }
                                    }
                                    animate={{
                                        scale: 1,
                                        opacity: 1,
                                    }}
                                    transition={{
                                        delay: shouldReduceMotion
                                            ? 0
                                            : 0.15,
                                        type: "spring",
                                        stiffness: 240,
                                    }}
                                    className="
                                        absolute -right-2 -top-2
                                        flex h-7 w-7 items-center
                                        justify-center rounded-full
                                        border-[3px] border-white
                                        bg-[#1491FF] text-white
                                        shadow-sm
                                    "
                                >
                                    <Check size={12} strokeWidth={3} />
                                </motion.span>
                            </motion.div>

                            <span
                                className="
                                    inline-flex items-center gap-2
                                    rounded-full border
                                    border-[#1491FF]/15
                                    bg-[#1491FF]/[0.055]
                                    px-3 py-1.5
                                    text-[10px] font-bold
                                    uppercase tracking-[0.15em]
                                    text-[#0876D1]
                                "
                            >
                                <ShieldCheck size={12} />
                                Security updated
                            </span>

                            <h2
                                id="reset-success-heading"
                                className="
                                    mt-5 text-[27px] font-bold
                                    tracking-[-0.05em]
                                    text-slate-900 sm:text-[31px]
                                "
                            >
                                Password changed
                                <span className="text-[#1491FF]">
                                    .
                                </span>
                            </h2>

                            <p
                                className="
                                    mx-auto mt-3 max-w-[320px]
                                    text-[13px] leading-6
                                    text-slate-500
                                "
                            >
                                Your KARMASS account now has a new
                                password. Use it the next time you
                                sign in.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="
                                mt-7 flex items-start gap-3
                                rounded-2xl border
                                border-slate-200/80
                                bg-slate-50/80 p-4 text-left
                            "
                        >
                            <div
                                className="
                                    flex h-10 w-10 shrink-0
                                    items-center justify-center
                                    rounded-xl border
                                    border-[#1491FF]/10
                                    bg-white text-[#1491FF]
                                "
                            >
                                <Fingerprint size={19} />
                            </div>

                            <div>
                                <p className="text-[12px] font-bold text-slate-800">
                                    Keep your account secure
                                </p>

                                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                    Never share your password or reuse it
                                    across different accounts.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Link
                                href="/login"
                                className="
                                    group mt-5 flex min-h-[52px]
                                    w-full items-center
                                    justify-center gap-2
                                    rounded-xl bg-[#1491FF]
                                    px-4 py-3 text-[13px]
                                    font-bold text-white
                                    shadow-lg shadow-[#1491FF]/20
                                    transition-colors duration-200
                                    hover:bg-[#0876D1]
                                    focus-visible:outline-none
                                    focus-visible:ring-4
                                    focus-visible:ring-[#1491FF]/25
                                "
                            >
                                Continue to sign in

                                <ArrowRight
                                    size={16}
                                    className="
                                        transition-transform
                                        duration-200
                                        group-hover:translate-x-1
                                    "
                                />
                            </Link>
                        </motion.div>
                    </div>
                </motion.section>
            ) : (
                /* ================================================
                   RESET PASSWORD FORM
                ================================================ */
                <motion.section
                    key="form"
                    variants={pageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    aria-labelledby="reset-password-heading"
                    className="
                        overflow-hidden rounded-[28px]
                        border border-slate-200/80
                        bg-white
                        shadow-[0_24px_80px_rgba(15,23,42,0.07)]
                    "
                >
                    {/* Brand accent */}
                    <div className="h-[3px] w-full bg-slate-100">
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{
                                duration: shouldReduceMotion ? 0 : 0.8,
                                ease: easing,
                            }}
                            className="
                                h-full w-full origin-left
                                bg-gradient-to-r
                                from-[#1491FF]
                                via-[#69B9FF]
                                to-[#1491FF]
                            "
                        />
                    </div>

                    <div className="px-5 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8">
                        {/* Heading */}
                        <motion.div variants={itemVariants}>
                            <motion.div
                                whileHover={
                                    shouldReduceMotion
                                        ? undefined
                                        : {
                                              y: -2,
                                              rotate: -3,
                                          }
                                }
                                transition={{
                                    type: "spring",
                                    stiffness: 280,
                                    damping: 20,
                                }}
                                className="
                                    mb-6 flex h-[58px] w-[58px]
                                    items-center justify-center
                                    rounded-[19px]
                                    border border-[#1491FF]/15
                                    bg-[#1491FF]/[0.07]
                                    text-[#1491FF]
                                "
                            >
                                <KeyRound
                                    size={25}
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />
                            </motion.div>

                            <p
                                className="
                                    mb-2 text-[10px] font-bold
                                    uppercase tracking-[0.19em]
                                    text-[#0876D1]
                                "
                            >
                                Account security
                            </p>

                            <h2
                                id="reset-password-heading"
                                className="
                                    text-[27px] font-bold
                                    leading-tight tracking-[-0.05em]
                                    text-slate-900 sm:text-[31px]
                                "
                            >
                                Create a new password
                                <span className="text-[#1491FF]">
                                    .
                                </span>
                            </h2>

                            <p
                                className="
                                    mt-3 max-w-[340px]
                                    text-[13px] leading-6
                                    text-slate-500
                                "
                            >
                                Choose a strong password to secure your
                                KARMASS account. Your old password will
                                no longer work after this change.
                            </p>
                        </motion.div>

                        <motion.form
                            variants={itemVariants}
                            onSubmit={handleSubmit(onSubmit)}
                            noValidate
                            className="mt-7 space-y-5"
                        >
                            {/* Missing token */}
                            {!token && (
                                <motion.div
                                    variants={itemVariants}
                                    role="alert"
                                    className="
                                        flex items-start gap-3
                                        rounded-2xl border
                                        border-amber-200
                                        bg-amber-50 p-3.5
                                    "
                                >
                                    <div
                                        className="
                                            flex h-9 w-9 shrink-0
                                            items-center justify-center
                                            rounded-xl bg-white
                                            text-amber-600
                                        "
                                    >
                                        <CircleAlert size={18} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[12px] font-bold text-amber-900">
                                            Reset link unavailable
                                        </p>

                                        <p className="mt-1 text-[11px] leading-5 text-amber-800">
                                            This link is missing its
                                            security token. Request a
                                            new reset email to continue.
                                        </p>

                                        <Link
                                            href="/forgot-password"
                                            className="
                                                mt-2 inline-flex
                                                items-center gap-1
                                                text-[11px] font-bold
                                                text-amber-900
                                                underline underline-offset-4
                                                hover:text-[#0876D1]
                                            "
                                        >
                                            Request a new link
                                            <ArrowRight size={12} />
                                        </Link>
                                    </div>
                                </motion.div>
                            )}

                            {/* Server error */}
                            <AnimatePresence initial={false}>
                                {serverError && (
                                    <motion.div
                                        key="server-error"
                                        role="alert"
                                        aria-live="polite"
                                        initial={
                                            shouldReduceMotion
                                                ? false
                                                : {
                                                      opacity: 0,
                                                      height: 0,
                                                      y: -5,
                                                  }
                                        }
                                        animate={{
                                            opacity: 1,
                                            height: "auto",
                                            y: 0,
                                        }}
                                        exit={
                                            shouldReduceMotion
                                                ? undefined
                                                : {
                                                      opacity: 0,
                                                      height: 0,
                                                      y: -5,
                                                  }
                                        }
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div
                                            className="
                                                flex items-start gap-3
                                                rounded-2xl border
                                                border-rose-200
                                                bg-rose-50 p-3.5
                                            "
                                        >
                                            <div
                                                className="
                                                    flex h-9 w-9 shrink-0
                                                    items-center justify-center
                                                    rounded-xl bg-white
                                                    text-rose-500
                                                "
                                            >
                                                <CircleAlert size={18} />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-[12px] font-bold text-rose-800">
                                                    Unable to update password
                                                </p>

                                                <p className="mt-1 text-[12px] leading-5 text-rose-700">
                                                    {serverError}
                                                </p>

                                                <Link
                                                    href="/forgot-password"
                                                    className="
                                                        mt-2 inline-flex
                                                        items-center gap-1
                                                        text-[11px] font-bold
                                                        text-rose-800
                                                        underline underline-offset-4
                                                    "
                                                >
                                                    Request another reset link
                                                    <ArrowRight size={12} />
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* New password */}
                            <motion.div
                                variants={itemVariants}
                                className="space-y-2"
                            >
                                <PasswordInput
                                    {...register("newPassword", {
                                        onChange: () => {
                                            if (serverError) {
                                                setServerError(null);
                                            }
                                        },
                                    })}
                                    id="newPassword"
                                    label="New password"
                                    placeholder="Create a strong password"
                                    autoComplete="new-password"
                                    aria-invalid={Boolean(
                                        errors.newPassword,
                                    )}
                                    aria-describedby={
                                        errors.newPassword
                                            ? "new-password-error"
                                            : "password-requirements"
                                    }
                                />

                                <AnimatePresence initial={false}>
                                    {errors.newPassword && (
                                        <motion.p
                                            id="new-password-error"
                                            key="new-password-error"
                                            role="alert"
                                            initial={
                                                shouldReduceMotion
                                                    ? false
                                                    : {
                                                          opacity: 0,
                                                          y: -4,
                                                      }
                                            }
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            exit={
                                                shouldReduceMotion
                                                    ? undefined
                                                    : {
                                                          opacity: 0,
                                                          y: -4,
                                                      }
                                            }
                                            className="text-[11px] leading-5 text-rose-600"
                                        >
                                            {errors.newPassword.message}
                                        </motion.p>
                                    )}
                                </AnimatePresence>

                                {/* Live password requirements */}
                                <div
                                    id="password-requirements"
                                    className="
                                        rounded-xl border
                                        border-slate-200/80
                                        bg-slate-50/80 p-3.5
                                    "
                                >
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <p className="text-[11px] font-semibold text-slate-700">
                                            Password requirements
                                        </p>

                                        <span
                                            className={[
                                                "text-[10px] font-bold",
                                                newPassword.length === 0
                                                    ? "text-slate-400"
                                                    : completedRequirements ===
                                                        passwordRequirements.length
                                                      ? "text-[#0876D1]"
                                                      : "text-slate-500",
                                            ].join(" ")}
                                        >
                                            {completedRequirements}/
                                            {passwordRequirements.length}
                                        </span>
                                    </div>

                                    <div
                                        className="
                                            mb-3 grid grid-cols-4
                                            gap-1.5
                                        "
                                        aria-hidden="true"
                                    >
                                        {passwordRequirements.map(
                                            (requirement, index) => {
                                                const passed =
                                                    requirement.test(
                                                        newPassword,
                                                    );

                                                return (
                                                    <motion.div
                                                        key={requirement.label}
                                                        initial={false}
                                                        animate={{
                                                            backgroundColor:
                                                                passed
                                                                    ? BRAND
                                                                    : "#E2E8F0",
                                                        }}
                                                        transition={{
                                                            duration: 0.2,
                                                        }}
                                                        className="
                                                            h-1 rounded-full
                                                        "
                                                    />
                                                );
                                            },
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {passwordRequirements.map(
                                            (requirement) => {
                                                const passed =
                                                    requirement.test(
                                                        newPassword,
                                                    );

                                                return (
                                                    <div
                                                        key={requirement.label}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <motion.span
                                                            initial={false}
                                                            animate={{
                                                                backgroundColor:
                                                                    passed
                                                                        ? "#1491FF"
                                                                        : "#E2E8F0",
                                                                color: passed
                                                                    ? "#FFFFFF"
                                                                    : "#94A3B8",
                                                                scale: passed
                                                                    ? 1
                                                                    : 0.92,
                                                            }}
                                                            className="
                                                                flex h-4 w-4
                                                                shrink-0
                                                                items-center
                                                                justify-center
                                                                rounded-full
                                                            "
                                                        >
                                                            <Check
                                                                size={10}
                                                                strokeWidth={3}
                                                            />
                                                        </motion.span>

                                                        <span
                                                            className={[
                                                                "text-[10px] transition-colors",
                                                                passed
                                                                    ? "font-medium text-slate-700"
                                                                    : "text-slate-400",
                                                            ].join(" ")}
                                                        >
                                                            {requirement.label}
                                                        </span>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Confirm password */}
                            <motion.div
                                variants={itemVariants}
                                className="space-y-2"
                            >
                                <PasswordInput
                                    {...register("confirmPassword", {
                                        onChange: () => {
                                            if (serverError) {
                                                setServerError(null);
                                            }
                                        },
                                    })}
                                    id="confirmPassword"
                                    label="Confirm new password"
                                    placeholder="Enter your password again"
                                    autoComplete="new-password"
                                    aria-invalid={Boolean(
                                        errors.confirmPassword,
                                    )}
                                    aria-describedby={
                                        errors.confirmPassword
                                            ? "confirm-password-error"
                                            : undefined
                                    }
                                />

                                <AnimatePresence initial={false}>
                                    {errors.confirmPassword ? (
                                        <motion.p
                                            id="confirm-password-error"
                                            key="confirm-password-error"
                                            role="alert"
                                            initial={
                                                shouldReduceMotion
                                                    ? false
                                                    : {
                                                          opacity: 0,
                                                          y: -4,
                                                      }
                                            }
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            exit={
                                                shouldReduceMotion
                                                    ? undefined
                                                    : {
                                                          opacity: 0,
                                                          y: -4,
                                                      }
                                            }
                                            className="text-[11px] leading-5 text-rose-600"
                                        >
                                            {errors.confirmPassword.message}
                                        </motion.p>
                                    ) : confirmPassword.length > 0 ? (
                                        <motion.p
                                            key="password-match"
                                            initial={
                                                shouldReduceMotion
                                                    ? false
                                                    : {
                                                          opacity: 0,
                                                          y: -4,
                                                      }
                                            }
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            exit={{
                                                opacity: 0,
                                            }}
                                            className={[
                                                "flex items-center gap-1.5 text-[11px]",
                                                passwordsMatch
                                                    ? "text-[#0876D1]"
                                                    : "text-slate-400",
                                            ].join(" ")}
                                        >
                                            {passwordsMatch ? (
                                                <>
                                                    <CheckCircle2 size={13} />
                                                    Passwords match
                                                </>
                                            ) : (
                                                <>
                                                    <CircleAlert size={13} />
                                                    Passwords do not match yet
                                                </>
                                            )}
                                        </motion.p>
                                    ) : null}
                                </AnimatePresence>
                            </motion.div>

                            {/* Submit */}
                            <motion.button
                                variants={itemVariants}
                                type="submit"
                                disabled={isSubmitting || !token}
                                whileHover={
                                    shouldReduceMotion ||
                                    isSubmitting ||
                                    !token
                                        ? undefined
                                        : { y: -1 }
                                }
                                whileTap={
                                    shouldReduceMotion ||
                                    isSubmitting ||
                                    !token
                                        ? undefined
                                        : { scale: 0.99 }
                                }
                                className="
                                    group relative flex min-h-[52px]
                                    w-full items-center justify-center
                                    gap-2.5 overflow-hidden rounded-xl
                                    bg-[#1491FF] px-4 py-3
                                    text-[13px] font-bold text-white
                                    shadow-lg shadow-[#1491FF]/20
                                    transition-colors duration-200
                                    hover:bg-[#0876D1]
                                    focus-visible:outline-none
                                    focus-visible:ring-4
                                    focus-visible:ring-[#1491FF]/25
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                    disabled:shadow-none
                                "
                            >
                                <span
                                    aria-hidden="true"
                                    className="
                                        pointer-events-none absolute
                                        inset-y-0 left-0 w-1/2
                                        -translate-x-[150%]
                                        -skew-x-[20deg]
                                        bg-gradient-to-r
                                        from-transparent
                                        via-white/20
                                        to-transparent
                                        transition-transform
                                        duration-700
                                        group-hover:translate-x-[350%]
                                    "
                                />

                                {isSubmitting ? (
                                    <>
                                        <span
                                            aria-hidden="true"
                                            className="
                                                h-[17px] w-[17px]
                                                animate-spin rounded-full
                                                border-2 border-white/35
                                                border-t-white
                                            "
                                        />
                                        Updating password...
                                    </>
                                ) : (
                                    <>
                                        Update password

                                        <ArrowRight
                                            size={16}
                                            aria-hidden="true"
                                            className="
                                                transition-transform
                                                duration-200
                                                group-hover:translate-x-1
                                            "
                                        />
                                    </>
                                )}
                            </motion.button>

                            {/* Security note */}
                            <motion.div
                                variants={itemVariants}
                                className="
                                    flex items-start gap-3
                                    rounded-xl border
                                    border-slate-200/80
                                    bg-slate-50/80 p-3.5
                                "
                            >
                                <div
                                    className="
                                        flex h-9 w-9 shrink-0
                                        items-center justify-center
                                        rounded-xl border
                                        border-[#1491FF]/10
                                        bg-white text-[#1491FF]
                                    "
                                >
                                    <ShieldCheck size={18} />
                                </div>

                                <div>
                                    <p className="text-[11px] font-bold text-slate-800">
                                        Your security comes first
                                    </p>

                                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                        Choose a password you haven&apos;t
                                        used for another account. Never
                                        share it with anyone.
                                    </p>
                                </div>
                            </motion.div>

                            {/* Back to login */}
                            <motion.div variants={itemVariants}>
                                <Link
                                    href="/login"
                                    className="
                                        group flex min-h-[40px]
                                        items-center justify-center
                                        gap-2 rounded-xl
                                        text-[12px] font-semibold
                                        text-slate-500
                                        transition-colors
                                        hover:text-[#0876D1]
                                        focus-visible:outline-none
                                        focus-visible:ring-2
                                        focus-visible:ring-[#1491FF]/30
                                    "
                                >
                                    <ArrowLeft
                                        size={15}
                                        className="
                                            transition-transform
                                            duration-200
                                            group-hover:-translate-x-1
                                        "
                                    />
                                    Back to login
                                </Link>
                            </motion.div>
                        </motion.form>
                    </div>
                </motion.section>
            )}
        </AnimatePresence>
    );
}