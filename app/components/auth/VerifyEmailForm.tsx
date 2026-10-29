"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type FormEvent,
} from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

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
    Clock3,
    Fingerprint,
    LoaderCircle,
    LockKeyhole,
    Mail,
    RefreshCw,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

import { authService } from "@/app/services/user/auth/auth.service";
import { ApiError } from "@/app/lib/api/api-error";

type VerificationStatus =
    | "idle"
    | "verifying"
    | "success"
    | "error";

const BRAND = "#1491FF";
const CODE_LENGTH = 6;

function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        return error.message || "The request could not be completed.";
    }

    return "Something went wrong. Please try again.";
}

function AnimatedIcon({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.div
            initial={
                shouldReduceMotion
                    ? false
                    : { opacity: 0, scale: 0.7, rotate: -8 }
            }
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
                type: "spring",
                stiffness: 220,
                damping: 18,
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

function AnimatedCodeInput({
    value,
    onChange,
    disabled,
    hasError,
}: {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
    hasError: boolean;
}) {
    const shouldReduceMotion = useReducedMotion();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (rawValue: string) => {
        const digits = rawValue.replace(/\D/g, "").slice(0, CODE_LENGTH);
        onChange(digits);
    };

    return (
        <div className="space-y-3">
            <label
                htmlFor="verification-code"
                className="flex items-center justify-between text-[13px] font-semibold text-slate-800"
            >
                <span>Verification code</span>

                <span className="text-[11px] font-medium text-slate-400">
                    {value.length}/{CODE_LENGTH} digits
                </span>
            </label>

            <div
                className={`
                    relative rounded-2xl border p-3
                    transition-all duration-200
                    ${
                        hasError
                            ? "border-rose-300 bg-rose-50/40"
                            : isFocused
                              ? "border-[#1491FF] bg-white ring-4 ring-[#1491FF]/10"
                              : "border-slate-200 bg-slate-50/70 hover:border-slate-300"
                    }
                    ${disabled ? "opacity-60" : ""}
                `}
                onClick={() => inputRef.current?.focus()}
            >
                <input
                    ref={inputRef}
                    id="verification-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={value}
                    onChange={(event) =>
                        handleChange(event.target.value)
                    }
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={disabled}
                    maxLength={CODE_LENGTH}
                    required
                    aria-label="Six-digit email verification code"
                    aria-describedby="verification-code-hint"
                    aria-invalid={hasError}
                    className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
                />

                <div
                    aria-hidden="true"
                    className="grid grid-cols-6 gap-2 sm:gap-3"
                >
                    {Array.from({ length: CODE_LENGTH }).map((_, index) => {
                        const digit = value[index] ?? "";
                        const isCurrent = index === value.length && isFocused;
                        const isFilled = Boolean(digit);

                        return (
                            <motion.div
                                key={index}
                                animate={
                                    shouldReduceMotion
                                        ? {}
                                        : {
                                              scale: isCurrent ? 1.045 : 1,
                                              y: isCurrent ? -2 : 0,
                                          }
                                }
                                transition={{
                                    type: "spring",
                                    stiffness: 350,
                                    damping: 24,
                                }}
                                className={`
                                    relative flex h-[50px] min-w-0
                                    items-center justify-center
                                    overflow-hidden rounded-xl border
                                    text-lg font-bold tabular-nums
                                    transition-colors duration-200
                                    sm:h-[56px]
                                    ${
                                        hasError
                                            ? "border-rose-200 bg-white text-rose-600"
                                            : isCurrent
                                              ? "border-[#1491FF] bg-[#1491FF]/[0.04] text-[#0876D1] shadow-sm"
                                              : isFilled
                                                ? "border-[#1491FF]/30 bg-[#1491FF]/[0.06] text-slate-800"
                                                : "border-slate-200 bg-white text-slate-800"
                                    }
                                `}
                            >
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {digit ? (
                                        <motion.span
                                            key={digit}
                                            initial={
                                                shouldReduceMotion
                                                    ? false
                                                    : {
                                                          opacity: 0,
                                                          y: 9,
                                                          scale: 0.7,
                                                      }
                                            }
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                            }}
                                            exit={
                                                shouldReduceMotion
                                                    ? undefined
                                                    : {
                                                          opacity: 0,
                                                          y: -6,
                                                          scale: 0.8,
                                                      }
                                            }
                                            transition={{
                                                duration: 0.16,
                                            }}
                                            className="relative z-10"
                                        >
                                            {digit}
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            key="empty"
                                            initial={false}
                                            className={`
                                                h-1.5 w-1.5 rounded-full
                                                ${
                                                    isCurrent
                                                        ? "bg-[#1491FF]"
                                                        : "bg-slate-200"
                                                }
                                            `}
                                        />
                                    )}
                                </AnimatePresence>

                                {isCurrent && !shouldReduceMotion && (
                                    <motion.div
                                        layoutId="verification-code-focus"
                                        className="absolute inset-0 rounded-xl ring-1 ring-inset ring-[#1491FF]/40"
                                        transition={{
                                            duration: 0.18,
                                        }}
                                    />
                                )}

                                {isFilled && !hasError && (
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        className="absolute inset-x-2 bottom-0 h-[2px] origin-left rounded-full bg-[#1491FF]/70"
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <p
                id="verification-code-hint"
                className="flex items-center gap-1.5 text-[11px] leading-5 text-slate-400"
            >
                <LockKeyhole
                    size={12}
                    className="shrink-0"
                    aria-hidden="true"
                />
                Enter the code sent to your email. Numbers only.
            </p>
        </div>
    );
}

export function VerifyEmailForm() {
    const searchParams = useSearchParams();
    const shouldReduceMotion = useReducedMotion();

    const token = searchParams.get("token");
    const queryEmail = searchParams.get("email");

    const tokenAttempted = useRef(false);

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");

    const [status, setStatus] =
        useState<VerificationStatus>("idle");

    const [message, setMessage] = useState<string | null>(null);

    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] =
        useState<string | null>(null);
    const [resendError, setResendError] =
        useState<string | null>(null);

    const [isSubmittingCode, setIsSubmittingCode] = useState(false);

    useEffect(() => {
        const storedEmail =
            typeof window !== "undefined"
                ? sessionStorage.getItem("karmass_verification_email")
                : null;

        const initialEmail = queryEmail || storedEmail || "";

        if (initialEmail) {
            setEmail(initialEmail);
        }
    }, [queryEmail]);

    const verifyToken = useCallback(
        async (verificationToken: string) => {
            if (tokenAttempted.current) return;

            tokenAttempted.current = true;

            setStatus("verifying");
            setMessage(null);

            try {
                await authService.verifyEmailWithToken(
                    verificationToken,
                );

                setStatus("success");
                setMessage(
                    "Your email address has been verified successfully.",
                );

                if (typeof window !== "undefined") {
                    sessionStorage.removeItem(
                        "karmass_verification_email",
                    );
                }
            } catch (error) {
                setStatus("error");
                setMessage(getErrorMessage(error));
            }
        },
        [],
    );

    useEffect(() => {
        if (token) {
            void verifyToken(token);
        }
    }, [token, verifyToken]);

    const handleCodeVerification = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setMessage(null);
        setResendError(null);
        setStatus("idle");

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedCode = code.trim();

        if (!normalizedEmail) {
            setStatus("error");
            setMessage(
                "Enter the email address you registered with.",
            );
            return;
        }

        if (!new RegExp(`^\\d{${CODE_LENGTH}}$`).test(normalizedCode)) {
            setStatus("error");
            setMessage(
                `Enter the complete ${CODE_LENGTH}-digit verification code.`,
            );
            return;
        }

        setIsSubmittingCode(true);

        try {
            await authService.verifyEmailWithCode({
                email: normalizedEmail,
                code: normalizedCode,
            });

            setStatus("success");
            setMessage(
                "Your email address has been verified successfully.",
            );

            if (typeof window !== "undefined") {
                sessionStorage.removeItem(
                    "karmass_verification_email",
                );
            }
        } catch (error) {
            setStatus("error");
            setMessage(getErrorMessage(error));
        } finally {
            setIsSubmittingCode(false);
        }
    };

    const handleResendVerification = async () => {
        setResendMessage(null);
        setResendError(null);

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            setResendError(
                "Enter your registered email address first.",
            );
            return;
        }

        setIsResending(true);

        try {
            await authService.resendVerification({
                email: normalizedEmail,
            });

            setResendMessage(
                "If your account requires verification, a new verification email should arrive shortly.",
            );

            if (typeof window !== "undefined") {
                sessionStorage.setItem(
                    "karmass_verification_email",
                    normalizedEmail,
                );
            }
        } catch (error) {
            setResendError(getErrorMessage(error));
        } finally {
            setIsResending(false);
        }
    };

    const pageVariants = {
        hidden: {
            opacity: 0,
            y: shouldReduceMotion ? 0 : 18,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: shouldReduceMotion ? 0 : 0.45,
                ease: "easeOut" as const,
                staggerChildren: shouldReduceMotion ? 0 : 0.08,
            },
        },
    };

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: shouldReduceMotion ? 0 : 12,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: shouldReduceMotion ? 0 : 0.35,
                ease: "easeOut" as const,
            },
        },
    };

    if (status === "verifying") {
        return (
            <motion.div
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                className="py-8 text-center"
            >
                <AnimatedIcon
                    className="
                        relative mx-auto flex h-[76px] w-[76px]
                        items-center justify-center rounded-[25px]
                        border border-[#1491FF]/15
                        bg-gradient-to-br from-[#1491FF]/15
                        to-[#1491FF]/[0.03] text-[#1491FF]
                    "
                >
                    <LoaderCircle
                        size={32}
                        className="animate-spin"
                    />

                    <motion.span
                        animate={
                            shouldReduceMotion
                                ? {}
                                : { scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }
                        }
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                        }}
                        className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-[#1491FF]"
                    />
                </AnimatedIcon>

                <motion.h2
                    variants={itemVariants}
                    className="mt-7 text-xl font-bold tracking-tight text-slate-900"
                >
                    Verifying your email
                </motion.h2>

                <motion.p
                    variants={itemVariants}
                    className="mx-auto mt-3 max-w-sm text-[13px] leading-6 text-slate-500"
                >
                    We&apos;re securely confirming your email address.
                    Hang tight — this should only take a moment.
                </motion.p>

                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    className="mx-auto mt-7 h-1 max-w-[180px] origin-left overflow-hidden rounded-full bg-[#1491FF]"
                />
            </motion.div>
        );
    }

    if (status === "success") {
        return (
            <motion.div
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                className="py-4 text-center"
            >
                <motion.div
                    initial={
                        shouldReduceMotion
                            ? false
                            : { scale: 0.65, opacity: 0 }
                    }
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 180,
                        damping: 13,
                    }}
                    className="
                        relative mx-auto flex h-[88px] w-[88px]
                        items-center justify-center rounded-[28px]
                        border border-emerald-100
                        bg-gradient-to-br from-emerald-50 to-[#1491FF]/10
                        text-emerald-600
                    "
                >
                    <motion.div
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            delay: shouldReduceMotion ? 0 : 0.15,
                            type: "spring",
                            stiffness: 200,
                        }}
                    >
                        <CheckCircle2 size={42} strokeWidth={1.6} />
                    </motion.div>

                    <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            delay: shouldReduceMotion ? 0 : 0.3,
                            type: "spring",
                        }}
                        className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#1491FF] text-white"
                    >
                        <Sparkles size={13} />
                    </motion.span>
                </motion.div>

                <motion.p
                    variants={itemVariants}
                    className="mt-7 text-[10px] font-bold uppercase tracking-[0.24em] text-[#0876D1]"
                >
                    Verification complete
                </motion.p>

                <motion.h2
                    variants={itemVariants}
                    className="mt-3 text-[28px] font-bold tracking-[-0.04em] text-slate-900 sm:text-3xl"
                >
                    You&apos;re all set.
                </motion.h2>

                <motion.p
                    variants={itemVariants}
                    className="mx-auto mt-3 max-w-sm text-[13px] leading-6 text-slate-500"
                >
                    {message ||
                        "Your email address has been verified successfully."}{" "}
                    You can now continue to your KARMASS account.
                </motion.p>

                <motion.div variants={itemVariants}>
                    <Link
                        href="/login"
                        className="
                            group mt-8 flex h-[52px] w-full
                            items-center justify-center gap-2.5
                            rounded-2xl bg-[#1491FF] px-5
                            text-[13px] font-bold text-white
                            shadow-lg shadow-[#1491FF]/20
                            transition-all duration-200
                            hover:-translate-y-0.5 hover:bg-[#0876D1]
                            hover:shadow-xl hover:shadow-[#1491FF]/25
                            focus-visible:outline-none
                            focus-visible:ring-4 focus-visible:ring-[#1491FF]/20
                        "
                    >
                        Continue to sign in
                        <ArrowRight
                            size={17}
                            className="transition-transform group-hover:translate-x-1"
                        />
                    </Link>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-400"
                >
                    <ShieldCheck size={14} className="text-[#1491FF]" />
                    Your account is ready for a secure sign-in.
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="w-full"
        >
            {/* Intro */}
            <motion.div
                variants={itemVariants}
                className="text-center"
            >
                <div className="relative mx-auto flex h-[76px] w-[76px] items-center justify-center">
                    <motion.div
                        animate={
                            shouldReduceMotion
                                ? {}
                                : {
                                      scale: [1, 1.07, 1],
                                      opacity: [0.5, 0.8, 0.5],
                                  }
                        }
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute inset-0 rounded-[25px] bg-[#1491FF]/10"
                    />

                    <div className="relative flex h-[66px] w-[66px] items-center justify-center rounded-[22px] border border-[#1491FF]/15 bg-gradient-to-br from-white to-[#1491FF]/10 text-[#1491FF] shadow-sm shadow-[#1491FF]/5">
                        <Mail size={29} strokeWidth={1.6} />

                        <motion.span
                            animate={
                                shouldReduceMotion
                                    ? {}
                                    : { y: [0, -3, 0] }
                            }
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#1491FF] text-white shadow-sm"
                        >
                            <Check size={11} strokeWidth={3} />
                        </motion.span>
                    </div>
                </div>

                <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.24em] text-[#0876D1]">
                    One last step
                </p>

                <h2 className="mt-3 text-[27px] font-bold tracking-[-0.04em] text-slate-900 sm:text-3xl">
                    Verify your email<span className="text-[#1491FF]">.</span>
                </h2>

                <p className="mx-auto mt-3 max-w-[340px] text-[13px] leading-6 text-slate-500">
                    We&apos;ve sent a verification code to your inbox.
                    Enter it below to activate your KARMASS account.
                </p>
            </motion.div>

            {/* Error feedback */}
            <AnimatePresence initial={false}>
                {status === "error" && message && (
                    <motion.div
                        key="verification-error"
                        initial={
                            shouldReduceMotion
                                ? false
                                : { opacity: 0, height: 0, y: -5 }
                        }
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={
                            shouldReduceMotion
                                ? undefined
                                : { opacity: 0, height: 0, y: -5 }
                        }
                        transition={{ duration: 0.22 }}
                        role="alert"
                        className="mt-6 overflow-hidden"
                    >
                        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5">
                            <CircleAlert
                                size={17}
                                className="mt-0.5 shrink-0 text-rose-500"
                            />

                            <p className="text-[12px] leading-5 text-rose-700">
                                {message}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Verification form */}
            <motion.form
                variants={itemVariants}
                onSubmit={handleCodeVerification}
                className="mt-8 space-y-5"
            >
                {/* Email */}
                <div className="space-y-2">
                    <label
                        htmlFor="verification-email"
                        className="block text-[13px] font-semibold text-slate-800"
                    >
                        Email address
                    </label>

                    <motion.div
                        whileFocus={{ scale: 1.005 }}
                        className="group relative"
                    >
                        <Mail
                            size={17}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-[#1491FF]"
                            aria-hidden="true"
                        />

                        <input
                            id="verification-email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="you@example.com"
                            required
                            disabled={isSubmittingCode || isResending}
                            className="
                                h-[52px] w-full rounded-2xl
                                border border-slate-200 bg-white
                                pl-11 pr-4 text-[13px] font-medium
                                text-slate-800 outline-none
                                transition-all duration-200
                                placeholder:font-normal
                                placeholder:text-slate-400
                                hover:border-slate-300
                                focus:border-[#1491FF]
                                focus:ring-4 focus:ring-[#1491FF]/10
                                disabled:cursor-not-allowed
                                disabled:bg-slate-50
                            "
                        />
                    </motion.div>
                </div>

                {/* Animated verification code */}
                <AnimatedCodeInput
                    value={code}
                    onChange={(value) => {
                        setCode(value);

                        if (status === "error") {
                            setStatus("idle");
                            setMessage(null);
                        }
                    }}
                    disabled={isSubmittingCode || isResending}
                    hasError={status === "error"}
                />

                {/* Submit */}
                <motion.button
                    type="submit"
                    whileHover={
                        shouldReduceMotion || isSubmittingCode
                            ? undefined
                            : { y: -1 }
                    }
                    whileTap={
                        shouldReduceMotion || isSubmittingCode
                            ? undefined
                            : { scale: 0.99 }
                    }
                    disabled={isSubmittingCode || isResending}
                    className="
                        group relative flex h-[52px] w-full
                        items-center justify-center gap-2.5
                        overflow-hidden rounded-2xl bg-[#1491FF]
                        px-5 text-[13px] font-bold text-white
                        shadow-lg shadow-[#1491FF]/20
                        transition-all duration-200
                        hover:bg-[#0876D1]
                        hover:shadow-xl hover:shadow-[#1491FF]/25
                        focus-visible:outline-none
                        focus-visible:ring-4 focus-visible:ring-[#1491FF]/20
                        disabled:cursor-not-allowed disabled:opacity-60
                        disabled:shadow-none
                    "
                >
                    <motion.span
                        aria-hidden="true"
                        initial={{ x: "-120%" }}
                        whileHover={
                            shouldReduceMotion
                                ? {}
                                : { x: "120%" }
                        }
                        transition={{ duration: 0.6 }}
                        className="pointer-events-none absolute inset-0 w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />

                    {isSubmittingCode ? (
                        <>
                            <LoaderCircle
                                size={17}
                                className="animate-spin"
                            />
                            Verifying your email...
                        </>
                    ) : (
                        <>
                            Verify email
                            <ArrowRight
                                size={17}
                                className="transition-transform duration-200 group-hover:translate-x-1"
                            />
                        </>
                    )}
                </motion.button>
            </motion.form>

            {/* Resend */}
            <motion.div
                variants={itemVariants}
                className="mt-7 border-t border-slate-100 pt-6"
            >
                <div className="flex items-center justify-center gap-2 text-slate-400">
                    <Clock3 size={14} />

                    <p className="text-[12px]">
                        Didn&apos;t receive the email?
                    </p>
                </div>

                <motion.button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isResending || isSubmittingCode}
                    whileTap={
                        shouldReduceMotion ? undefined : { scale: 0.98 }
                    }
                    className="
                        mx-auto mt-3 flex min-h-9 items-center
                        justify-center gap-2 rounded-xl px-3
                        text-[12px] font-bold text-[#0876D1]
                        transition-colors hover:bg-[#1491FF]/[0.06]
                        disabled:cursor-not-allowed disabled:opacity-60
                    "
                >
                    {isResending ? (
                        <>
                            <LoaderCircle
                                size={15}
                                className="animate-spin"
                            />
                            Sending verification email...
                        </>
                    ) : (
                        <>
                            <RefreshCw size={14} />
                            Resend verification email
                        </>
                    )}
                </motion.button>

                <AnimatePresence initial={false}>
                    {resendMessage && (
                        <motion.p
                            key="resend-success"
                            initial={
                                shouldReduceMotion
                                    ? false
                                    : { opacity: 0, y: 5 }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            role="status"
                            className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-center text-[11px] leading-5 text-emerald-700"
                        >
                            {resendMessage}
                        </motion.p>
                    )}

                    {resendError && (
                        <motion.p
                            key="resend-error"
                            initial={
                                shouldReduceMotion
                                    ? false
                                    : { opacity: 0, y: 5 }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            role="alert"
                            className="mt-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-center text-[11px] leading-5 text-rose-600"
                        >
                            {resendError}
                        </motion.p>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Security reassurance */}
            <motion.div
                variants={itemVariants}
                className="mt-6 flex items-start gap-3 rounded-2xl border border-[#1491FF]/10 bg-gradient-to-r from-[#1491FF]/[0.07] to-slate-50 p-3.5"
            >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#1491FF] shadow-sm shadow-[#1491FF]/5">
                    <ShieldCheck size={16} />
                </div>

                <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-700">
                        Your security matters
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-slate-500">
                        Verification links expire for your protection.
                        If yours has expired, request a fresh verification
                        email above.
                    </p>
                </div>
            </motion.div>

            {/* Back to login */}
            <motion.div variants={itemVariants}>
                <Link
                    href="/login"
                    className="
                        group mx-auto mt-6 flex w-fit
                        items-center justify-center gap-2
                        rounded-lg py-2 text-[12px] font-medium
                        text-slate-400 transition-colors
                        hover:text-[#0876D1]
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-[#1491FF]
                    "
                >
                    <ArrowLeft
                        size={14}
                        className="transition-transform group-hover:-translate-x-1"
                    />
                    Back to log in
                </Link>
            </motion.div>

            <div className="sr-only" aria-live="polite">
                {isSubmittingCode
                    ? "Verifying your email address"
                    : isResending
                      ? "Sending a new verification email"
                      : ""}
            </div>
        </motion.div>
    );
}