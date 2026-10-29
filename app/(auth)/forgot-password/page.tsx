"use client";

import { zodResolver } from "@hookform/resolvers/zod";

import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    CircleAlert,
    Fingerprint,
    LockKeyhole,
    Mail,
    ShieldCheck,
} from "lucide-react";

import Link from "next/link";

import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "framer-motion";

import { useState } from "react";

import {
    useForm,
    type SubmitHandler,
} from "react-hook-form";

import { z } from "zod";

import { ApiError } from "@/app/lib/api/api-error";

import { authService } from "@/app/services/user/auth/auth.service";

import { forgotPasswordSchema } from "@/app/schema/auth/auth.schema";

type ForgotPasswordFormValues = z.infer<
    typeof forgotPasswordSchema
>;

const BRAND = "#1491FF";
const BRAND_HOVER = "#0876D1";

const easing = [0.22, 1, 0.36, 1] as const;

export default function ForgotPasswordPage() {
    const [submitted, setSubmitted] = useState(false);
    const [requestError, setRequestError] = useState("");

    const shouldReduceMotion = useReducedMotion();

    const {
        register,
        handleSubmit,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
        mode: "onBlur",
    });

    const onSubmit: SubmitHandler<
        ForgotPasswordFormValues
    > = async (values) => {
        setRequestError("");

        try {
            await authService.forgotPassword({
                email: values.email.trim().toLowerCase(),
            });

            setSubmitted(true);
        } catch (error) {
            if (
                error instanceof ApiError &&
                error.status === 429
            ) {
                setRequestError(
                    "Too many requests. Please wait a little while before trying again.",
                );

                return;
            }

            setRequestError(
                "We couldn't process your request right now. Please try again.",
            );
        }
    };

    const pageVariants = {
        hidden: {
            opacity: 0,
            y: shouldReduceMotion ? 0 : 14,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: shouldReduceMotion ? 0 : 0.45,
                ease: easing,
                staggerChildren: shouldReduceMotion ? 0 : 0.07,
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
            y: shouldReduceMotion ? 0 : 10,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: shouldReduceMotion ? 0 : 0.35,
                ease: easing,
            },
        },
    };

    return (
        <main
            className="
                relative isolate flex min-h-screen
                min-h-[100svh] w-full items-center
                justify-center overflow-hidden
                bg-[#F7FAFD] px-4 py-6
                sm:px-6 sm:py-8
            "
        >
            {/* Background decoration */}
            <div
                aria-hidden="true"
                className="
                    pointer-events-none absolute
                    -right-32 -top-36 -z-10
                    h-[360px] w-[360px]
                    rounded-full bg-[#1491FF]/[0.08]
                    blur-[100px]
                "
            />

            <div
                aria-hidden="true"
                className="
                    pointer-events-none absolute
                    -bottom-40 -left-36 -z-10
                    h-[400px] w-[400px]
                    rounded-full bg-sky-200/30
                    blur-[110px]
                "
            />

            {/* Subtle background grid */}
            <div
                aria-hidden="true"
                className="
                    pointer-events-none absolute inset-0
                    -z-10 opacity-[0.22]
                    [background-image:radial-gradient(#94A3B8_0.7px,transparent_0.7px)]
                    [background-size:24px_24px]
                "
            />

            <div className="relative mx-auto flex w-full max-w-[440px] flex-col">
                {/* Brand header */}
                <motion.div
                    initial={
                        shouldReduceMotion
                            ? false
                            : {
                                  opacity: 0,
                                  y: -10,
                              }
                    }
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: shouldReduceMotion ? 0 : 0.4,
                        ease: easing,
                    }}
                    className="mb-7 flex items-center justify-center sm:mb-9"
                >
                    <Link
                        href="/login"
                        aria-label="KARMASS home"
                        className="
                            group inline-flex items-center gap-3
                            rounded-xl focus-visible:outline-none
                            focus-visible:ring-4
                            focus-visible:ring-[#1491FF]/20
                        "
                    >
                        <motion.div
                            whileHover={
                                shouldReduceMotion
                                    ? undefined
                                    : {
                                          rotate: -5,
                                          scale: 1.04,
                                      }
                            }
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                            }}
                            className="
                                flex h-11 w-11 items-center
                                justify-center rounded-[15px]
                                bg-[#1491FF]
                                text-white
                                shadow-lg shadow-[#1491FF]/20
                            "
                        >
                            <LockKeyhole
                                size={21}
                                strokeWidth={2}
                                aria-hidden="true"
                            />
                        </motion.div>

                        <span
                            className="
                                text-[22px] font-extrabold
                                tracking-[-0.065em]
                                text-slate-900
                            "
                        >
                            KARMASS
                            <span className="text-[#1491FF]">.</span>
                        </span>
                    </Link>
                </motion.div>

                <AnimatePresence mode="wait" initial={false}>
                    {submitted ? (
                        /* ==========================================
                           SUCCESS STATE
                        ========================================== */
                        <motion.section
                            key="success"
                            variants={pageVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            aria-labelledby="success-heading"
                            className="
                                overflow-hidden rounded-[28px]
                                border border-slate-200/80
                                bg-white
                                shadow-[0_24px_80px_rgba(15,23,42,0.07)]
                            "
                        >
                            <div className="relative px-5 pb-6 pt-8 sm:px-8 sm:pb-8 sm:pt-10">
                                {/* Success background accent */}
                                <div
                                    aria-hidden="true"
                                    className="
                                        pointer-events-none absolute
                                        -right-16 -top-20
                                        h-48 w-48 rounded-full
                                        bg-[#1491FF]/[0.07]
                                        blur-3xl
                                    "
                                />

                                <motion.div
                                    variants={itemVariants}
                                    className="relative flex flex-col items-center text-center"
                                >
                                    <motion.div
                                        initial={
                                            shouldReduceMotion
                                                ? false
                                                : {
                                                      opacity: 0,
                                                      scale: 0.7,
                                                      rotate: -8,
                                                  }
                                        }
                                        animate={{
                                            opacity: 1,
                                            scale: 1,
                                            rotate: 0,
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 190,
                                            damping: 16,
                                        }}
                                        className="
                                            relative mb-6 flex h-[76px]
                                            w-[76px] items-center
                                            justify-center rounded-[25px]
                                            border border-[#1491FF]/15
                                            bg-[#1491FF]/[0.07]
                                            text-[#1491FF]
                                            ring-8 ring-[#1491FF]/[0.035]
                                        "
                                    >
                                        <CheckCircle2
                                            size={36}
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
                                            <Check
                                                size={12}
                                                strokeWidth={3}
                                            />
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
                                        <CheckCircle2
                                            size={12}
                                            aria-hidden="true"
                                        />
                                        Request submitted
                                    </span>

                                    <h1
                                        id="success-heading"
                                        className="
                                            mt-5 text-[27px] font-bold
                                            tracking-[-0.05em]
                                            text-slate-900
                                            sm:text-[31px]
                                        "
                                    >
                                        Check your inbox
                                        <span className="text-[#1491FF]">
                                            .
                                        </span>
                                    </h1>

                                    <p
                                        className="
                                            mt-3 max-w-[330px]
                                            text-[13px] leading-6
                                            text-slate-500
                                        "
                                    >
                                        If an account exists for that
                                        email address, you&apos;ll receive
                                        instructions to reset your password.
                                        Check your spam folder too.
                                    </p>
                                </motion.div>

                                {/* Security notice */}
                                <motion.div
                                    variants={itemVariants}
                                    className="
                                        mt-7 flex items-start gap-3
                                        rounded-2xl border
                                        border-slate-200/80
                                        bg-slate-50/80 p-4
                                        text-left
                                    "
                                >
                                    <div
                                        className="
                                            flex h-10 w-10 shrink-0
                                            items-center justify-center
                                            rounded-xl border
                                            border-[#1491FF]/10
                                            bg-white text-[#1491FF]
                                            shadow-sm
                                        "
                                    >
                                        <ShieldCheck size={19} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[12px] font-bold text-slate-800">
                                            Your privacy is protected
                                        </p>

                                        <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                            For your security, we don&apos;t
                                            disclose whether an email address
                                            is registered with KARMASS.
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.button
                                    variants={itemVariants}
                                    type="button"
                                    onClick={() => {
                                        setSubmitted(false);
                                        setRequestError("");
                                    }}
                                    whileHover={
                                        shouldReduceMotion
                                            ? undefined
                                            : { y: -1 }
                                    }
                                    whileTap={
                                        shouldReduceMotion
                                            ? undefined
                                            : { scale: 0.99 }
                                    }
                                    className="
                                        mt-5 flex min-h-[52px] w-full
                                        items-center justify-center gap-2
                                        rounded-2xl bg-[#1491FF]
                                        px-4 py-3 text-[13px]
                                        font-bold text-white
                                        shadow-lg shadow-[#1491FF]/15
                                        transition-colors duration-200
                                        hover:bg-[#0876D1]
                                        focus-visible:outline-none
                                        focus-visible:ring-4
                                        focus-visible:ring-[#1491FF]/20
                                    "
                                >
                                    <Mail size={16} />
                                    Try another email address
                                </motion.button>

                                <motion.div
                                    variants={itemVariants}
                                    className="mt-4"
                                >
                                    <Link
                                        href="/login"
                                        className="
                                            group flex min-h-[44px]
                                            items-center justify-center
                                            gap-2 rounded-xl px-3
                                            text-[13px] font-semibold
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
                                        Return to login
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.section>
                    ) : (
                        /* ==========================================
                           FORGOT PASSWORD FORM
                        ========================================== */
                        <motion.section
                            key="form"
                            variants={pageVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            aria-labelledby="forgot-password-heading"
                            className="
                                overflow-hidden rounded-[28px]
                                border border-slate-200/80
                                bg-white
                                shadow-[0_24px_80px_rgba(15,23,42,0.07)]
                            "
                        >
                            {/* Top brand line */}
                            <div className="h-[3px] w-full bg-slate-100">
                                <motion.div
                                    initial={{
                                        scaleX: 0,
                                    }}
                                    animate={{
                                        scaleX: 1,
                                    }}
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
                                <motion.div
                                    variants={itemVariants}
                                >
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
                                        <LockKeyhole
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
                                        Account recovery
                                    </p>

                                    <h1
                                        id="forgot-password-heading"
                                        className="
                                            text-[27px] font-bold
                                            leading-tight
                                            tracking-[-0.05em]
                                            text-slate-900
                                            sm:text-[31px]
                                        "
                                    >
                                        Forgot your password
                                        <span className="ml-0.5 text-[#1491FF]">
                                            ?
                                        </span>
                                    </h1>

                                    <p
                                        className="
                                            mt-3 max-w-[340px]
                                            text-[13px] leading-6
                                            text-slate-500
                                        "
                                    >
                                        Enter the email address linked to
                                        your KARMASS account. We&apos;ll
                                        send you a secure link to reset
                                        your password.
                                    </p>
                                </motion.div>

                                <motion.form
                                    variants={itemVariants}
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="mt-7 space-y-5"
                                    noValidate
                                >
                                    {/* API error */}
                                    <AnimatePresence initial={false}>
                                        {requestError && (
                                            <motion.div
                                                key="request-error"
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
                                                transition={{
                                                    duration: 0.2,
                                                }}
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
                                                            flex h-9 w-9
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-xl
                                                            bg-white
                                                            text-rose-500
                                                        "
                                                    >
                                                        <CircleAlert size={18} />
                                                    </div>

                                                    <div className="min-w-0 pt-0.5">
                                                        <p className="text-[12px] font-bold text-rose-800">
                                                            Request unsuccessful
                                                        </p>

                                                        <p className="mt-1 text-[12px] leading-5 text-rose-700">
                                                            {requestError}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Email input */}
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="email"
                                            className="
                                                block text-[12px]
                                                font-semibold
                                                text-slate-800
                                            "
                                        >
                                            Email address
                                        </label>

                                        <motion.div
                                            animate={
                                                errors.email &&
                                                !shouldReduceMotion
                                                    ? {
                                                          x: [
                                                              0,
                                                              -3,
                                                              3,
                                                              -2,
                                                              2,
                                                              0,
                                                          ],
                                                      }
                                                    : { x: 0 }
                                            }
                                            transition={{
                                                duration: 0.3,
                                            }}
                                            className="group relative"
                                        >
                                            <Mail
                                                size={18}
                                                aria-hidden="true"
                                                className={[
                                                    "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
                                                    errors.email
                                                        ? "text-rose-500"
                                                        : "text-slate-400 group-focus-within:text-[#1491FF]",
                                                ].join(" ")}
                                            />

                                            <input
                                                id="email"
                                                type="email"
                                                autoComplete="email"
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                                spellCheck={false}
                                                inputMode="email"
                                                placeholder="you@example.com"
                                                aria-invalid={Boolean(
                                                    errors.email,
                                                )}
                                                aria-describedby={
                                                    errors.email
                                                        ? "email-error"
                                                        : "email-hint"
                                                }
                                                {...register("email", {
                                                    onChange: () => {
                                                        if (requestError) {
                                                            setRequestError("");
                                                        }
                                                    },
                                                })}
                                                className={[
                                                    "min-h-[52px] w-full rounded-xl border bg-white py-3.5 pl-11 pr-4",
                                                    "text-base font-medium text-slate-800 outline-none transition-all duration-200 sm:text-sm",
                                                    "placeholder:font-normal placeholder:text-slate-400",
                                                    "focus:border-[#1491FF] focus:ring-4 focus:ring-[#1491FF]/10",
                                                    errors.email
                                                        ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
                                                        : "border-slate-200 hover:border-slate-300",
                                                ].join(" ")}
                                            />

                                            {/* Focus indicator */}
                                            <motion.div
                                                aria-hidden="true"
                                                initial={false}
                                                animate={{
                                                    scaleX: 0,
                                                    opacity: 0,
                                                }}
                                                className="
                                                    pointer-events-none
                                                    absolute bottom-0
                                                    left-4 right-4
                                                    h-[2px] origin-center
                                                    rounded-full
                                                    bg-[#1491FF]
                                                    group-focus-within:scale-x-100
                                                    group-focus-within:opacity-100
                                                "
                                            />
                                        </motion.div>

                                        <AnimatePresence initial={false}>
                                            {errors.email ? (
                                                <motion.p
                                                    id="email-error"
                                                    key="email-error"
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
                                                    transition={{
                                                        duration: 0.18,
                                                    }}
                                                    className="text-[11px] leading-5 text-rose-600"
                                                >
                                                    {errors.email.message}
                                                </motion.p>
                                            ) : (
                                                <motion.p
                                                    id="email-hint"
                                                    key="email-hint"
                                                    initial={false}
                                                    className="
                                                        flex items-center
                                                        gap-1.5 text-[11px]
                                                        leading-5
                                                        text-slate-400
                                                    "
                                                >
                                                    <ShieldCheck
                                                        size={12}
                                                        className="text-[#1491FF]"
                                                    />
                                                    Use the email linked to
                                                    your KARMASS account.
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Submit button */}
                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        whileHover={
                                            shouldReduceMotion ||
                                            isSubmitting
                                                ? undefined
                                                : { y: -1 }
                                        }
                                        whileTap={
                                            shouldReduceMotion ||
                                            isSubmitting
                                                ? undefined
                                                : { scale: 0.99 }
                                        }
                                        className="
                                            group relative flex min-h-[52px]
                                            w-full items-center
                                            justify-center gap-2.5
                                            overflow-hidden rounded-xl
                                            bg-[#1491FF] px-4 py-3
                                            text-[13px] font-bold text-white
                                            shadow-lg
                                            shadow-[#1491FF]/20
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
                                        <motion.span
                                            aria-hidden="true"
                                            initial={{
                                                x: "-150%",
                                            }}
                                            animate={
                                                isSubmitting
                                                    ? {}
                                                    : undefined
                                            }
                                            className="
                                                pointer-events-none
                                                absolute inset-y-0
                                                left-0 w-1/2
                                                -skew-x-[20deg]
                                                bg-gradient-to-r
                                                from-transparent
                                                via-white/20
                                                to-transparent
                                                group-hover:animate-[karmass-shimmer_0.8s_ease-in-out]
                                            "
                                        />

                                        {isSubmitting ? (
                                            <>
                                                <span
                                                    aria-hidden="true"
                                                    className="
                                                        h-[17px] w-[17px]
                                                        animate-spin
                                                        rounded-full
                                                        border-2
                                                        border-white/35
                                                        border-t-white
                                                    "
                                                />
                                                Sending instructions...
                                            </>
                                        ) : (
                                            <>
                                                Send reset instructions

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

                                    {/* Security information */}
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
                                                items-center
                                                justify-center
                                                rounded-xl border
                                                border-[#1491FF]/10
                                                bg-white text-[#1491FF]
                                            "
                                        >
                                            <Fingerprint size={18} />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-[11px] font-bold text-slate-800">
                                                Your security comes first
                                            </p>

                                            <p className="mt-1 text-[11px] leading-[1.65] text-slate-500">
                                                We&apos;ll never send your
                                                existing password. Use the
                                                secure link in your email
                                                to choose a new one.
                                            </p>
                                        </div>
                                    </motion.div>

                                    {/* Back to login */}
                                    <Link
                                        href="/login"
                                        className="
                                            group flex min-h-[40px]
                                            items-center justify-center
                                            gap-2 rounded-xl
                                            text-[12px] font-semibold
                                            text-slate-500
                                            transition-colors duration-200
                                            hover:text-[#0876D1]
                                            focus-visible:outline-none
                                            focus-visible:ring-2
                                            focus-visible:ring-[#1491FF]/30
                                        "
                                    >
                                        <ArrowLeft
                                            size={15}
                                            aria-hidden="true"
                                            className="
                                                transition-transform
                                                duration-200
                                                group-hover:-translate-x-1
                                            "
                                        />
                                        Back to login
                                    </Link>
                                </motion.form>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <motion.div
                    initial={
                        shouldReduceMotion
                            ? false
                            : {
                                  opacity: 0,
                              }
                    }
                    animate={{
                        opacity: 1,
                    }}
                    transition={{
                        delay: shouldReduceMotion ? 0 : 0.35,
                        duration: 0.4,
                    }}
                    className="
                        mt-6 flex items-center
                        justify-center gap-2
                        text-center text-[10px]
                        font-medium tracking-wide
                        text-slate-400
                    "
                >
                    <ShieldCheck
                        size={13}
                        className="text-[#1491FF]"
                        aria-hidden="true"
                    />

                    <span>
                        Secure account recovery
                    </span>

                    <span className="text-slate-300">·</span>

                    <span>© {new Date().getFullYear()} KARMASS</span>
                </motion.div>
            </div>
        </main>
    );
}