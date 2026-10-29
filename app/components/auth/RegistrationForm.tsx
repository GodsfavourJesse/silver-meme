"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowRight,
    Check,
    CheckCircle2,
    CircleAlert,
    LoaderCircle,
    LockKeyhole,
    Mail,
    Phone,
    ShieldCheck,
    Sparkles,
    UserRound,
} from "lucide-react";
import { z } from "zod";
import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "framer-motion";

import { authService } from "@/app/services/user/auth/auth.service";
import { PasswordInput } from "@/app/components/auth/PasswordInput";
import { ApiError } from "@/app/lib/api/api-error";
import { registrationSchema } from "@/app/schema/auth/auth.schema";

type RegistrationFormValues = z.infer<typeof registrationSchema>;

const inputClass =
    "h-[52px] w-full rounded-xl border bg-white px-4 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60";

const getInputClass = (hasError: boolean) =>
    `${inputClass} ${
        hasError
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-slate-200 hover:border-slate-300 focus:border-[#1491FF] focus:ring-blue-100"
    }`;

const sectionVariants = {
    hidden: {
        opacity: 0,
        y: 18,
    },
    visible: {
        opacity: 1,
        y: 0,
    },
    exit: {
        opacity: 0,
        y: -8,
    },
};

const errorVariants = {
    hidden: {
        opacity: 0,
        height: 0,
        y: -4,
    },
    visible: {
        opacity: 1,
        height: "auto",
        y: 0,
    },
    exit: {
        opacity: 0,
        height: 0,
        y: -4,
    },
};

function FieldError({ message }: { message?: string }) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <AnimatePresence initial={false}>
            {message && (
                <motion.p
                    key={message}
                    id={undefined}
                    role="alert"
                    initial={
                        shouldReduceMotion
                            ? { opacity: 1 }
                            : "hidden"
                    }
                    animate="visible"
                    exit={shouldReduceMotion ? { opacity: 0 } : "exit"}
                    variants={errorVariants}
                    transition={{
                        duration: shouldReduceMotion ? 0 : 0.2,
                        ease: "easeOut",
                    }}
                    className="flex items-start gap-1.5 overflow-hidden text-xs leading-5 text-red-600"
                >
                    <CircleAlert
                        size={14}
                        className="mt-0.5 shrink-0"
                        aria-hidden="true"
                    />

                    <span>{message}</span>
                </motion.p>
            )}
        </AnimatePresence>
    );
}

export function RegistrationForm() {
    const router = useRouter();
    const shouldReduceMotion = useReducedMotion();

    const [serverError, setServerError] = useState<string | null>(null);

    const transition = {
        duration: shouldReduceMotion ? 0 : 0.45,
        ease: [0.22, 1, 0.36, 1] as const,
    };

    const formVariants = {
        hidden: {
            opacity: shouldReduceMotion ? 1 : 0,
            y: shouldReduceMotion ? 0 : 24,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                ...transition,
                staggerChildren: shouldReduceMotion ? 0 : 0.09,
                delayChildren: shouldReduceMotion ? 0 : 0.05,
            },
        },
    };

    const animatedSectionVariants = shouldReduceMotion
        ? {
              hidden: { opacity: 1, y: 0 },
              visible: { opacity: 1, y: 0 },
          }
        : sectionVariants;

    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<RegistrationFormValues>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
        },
        mode: "onBlur",
    });

    const firstName = watch("firstName") ?? "";
    const password = watch("password") ?? "";
    const confirmPassword = watch("confirmPassword") ?? "";

    const passwordsMatch =
        Boolean(password) &&
        Boolean(confirmPassword) &&
        password === confirmPassword;

    const passwordChecks = [
        {
            label: "At least 8 characters",
            passed: password.length >= 8,
        },
        {
            label: "Contains a number",
            passed: /\d/.test(password),
        },
        {
            label: "Contains an uppercase letter",
            passed: /[A-Z]/.test(password),
        },
    ];

    const passwordStrength = passwordChecks.filter(
        (check) => check.passed,
    ).length;

    const onSubmit: SubmitHandler<RegistrationFormValues> = async (
        values,
    ) => {
        setServerError(null);

        try {
            const response = await authService.register({
                firstName: values.firstName.trim(),
                lastName: values.lastName.trim(),
                email: values.email.trim().toLowerCase(),
                phone: values.phone?.trim() || undefined,
                password: values.password,
            });

            const result = response.data;

            if (!result?.user?.email) {
                setServerError(
                    "Your account may have been created, but we couldn't confirm the response. Please try signing in or contact support before registering again.",
                );
                return;
            }

            if (result.requiresEmailVerification) {
                sessionStorage.setItem(
                    "karmass_verification_email",
                    result.user.email,
                );

                router.push(
                    `/verify-email?email=${encodeURIComponent(
                        result.user.email,
                    )}`,
                );

                return;
            }

            router.push("/login");
        } catch (error: unknown) {
            if (error instanceof ApiError) {
                const message = error.message || "Registration failed.";

                if (
                    /email/i.test(message) &&
                    /already|exist|registered/i.test(message)
                ) {
                    setError("email", {
                        type: "server",
                        message,
                    });

                    return;
                }

                setServerError(message);
                return;
            }

            setServerError(
                "We couldn't connect to KARMASS. Check your internet connection and try again.",
            );
        }
    };

    return (
        <motion.form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
        >
            {/* Intro */}
            <motion.div
                variants={animatedSectionVariants}
                transition={transition}
                className="space-y-2"
            >
                <motion.div
                    initial={
                        shouldReduceMotion
                            ? false
                            : { opacity: 0, scale: 0.94 }
                    }
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: shouldReduceMotion ? 0 : 0.35,
                        delay: shouldReduceMotion ? 0 : 0.1,
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5"
                >
                    <Sparkles
                        size={13}
                        className="text-[#1491FF]"
                        aria-hidden="true"
                    />

                    <span className="text-[11px] font-semibold tracking-wide text-[#0876D1]">
                        YOUR NEXT DRIVE STARTS HERE
                    </span>
                </motion.div>

                <AnimatePresence mode="wait" initial={false}>
                    <motion.h2
                        key={firstName.trim() || "default-heading"}
                        initial={
                            shouldReduceMotion
                                ? { opacity: 1 }
                                : { opacity: 0, y: 7 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        exit={
                            shouldReduceMotion
                                ? { opacity: 1 }
                                : { opacity: 0, y: -5 }
                        }
                        transition={{
                            duration: shouldReduceMotion ? 0 : 0.2,
                        }}
                        className="text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px]"
                    >
                        {firstName.trim()
                            ? `Let's get you started, ${firstName.trim()}.`
                            : "Create your account."}
                    </motion.h2>
                </AnimatePresence>

                <p className="max-w-md text-sm leading-6 text-slate-500">
                    Join KARMASS to discover cars, connect with sellers,
                    and find the right vehicle for your next journey.
                </p>
            </motion.div>

            {/* Server error */}
            <AnimatePresence initial={false}>
                {serverError && (
                    <motion.div
                        key="registration-server-error"
                        initial={
                            shouldReduceMotion
                                ? { opacity: 1 }
                                : { opacity: 0, height: 0, y: -8 }
                        }
                        animate={{
                            opacity: 1,
                            height: "auto",
                            y: 0,
                        }}
                        exit={
                            shouldReduceMotion
                                ? { opacity: 0 }
                                : { opacity: 0, height: 0, y: -8 }
                        }
                        transition={{
                            duration: shouldReduceMotion ? 0 : 0.25,
                            ease: "easeOut",
                        }}
                        role="alert"
                        aria-live="polite"
                        className="overflow-hidden"
                    >
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                            <div className="flex items-start gap-3">
                                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-red-100 text-red-600">
                                    <CircleAlert size={18} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-red-800">
                                        We couldn't create your account
                                    </p>

                                    <p className="mt-1 break-words text-sm leading-6 text-red-700">
                                        {serverError}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Personal information */}
            <motion.section
                variants={animatedSectionVariants}
                transition={transition}
                className="space-y-4"
                aria-labelledby="personal-information-heading"
            >
                <div className="flex items-center gap-2">
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-[#1491FF]">
                        <UserRound size={16} aria-hidden="true" />
                    </div>

                    <div>
                        <h3
                            id="personal-information-heading"
                            className="text-sm font-semibold text-slate-800"
                        >
                            Personal information
                        </h3>

                        <p className="text-xs text-slate-500">
                            Let's start with your name.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* First name */}
                    <div className="space-y-2">
                        <label
                            htmlFor="firstName"
                            className="block text-[13px] font-semibold text-slate-700"
                        >
                            First name
                            <span className="ml-1 text-[#1491FF]">*</span>
                        </label>

                        <input
                            {...register("firstName")}
                            id="firstName"
                            autoComplete="given-name"
                            placeholder="e.g. John"
                            disabled={isSubmitting}
                            aria-invalid={Boolean(errors.firstName)}
                            aria-describedby={
                                errors.firstName
                                    ? "firstName-error"
                                    : undefined
                            }
                            className={getInputClass(
                                Boolean(errors.firstName),
                            )}
                        />

                        <div id="firstName-error">
                            <FieldError
                                message={errors.firstName?.message}
                            />
                        </div>
                    </div>

                    {/* Last name */}
                    <div className="space-y-2">
                        <label
                            htmlFor="lastName"
                            className="block text-[13px] font-semibold text-slate-700"
                        >
                            Last name
                            <span className="ml-1 text-[#1491FF]">*</span>
                        </label>

                        <input
                            {...register("lastName")}
                            id="lastName"
                            autoComplete="family-name"
                            placeholder="e.g. Doe"
                            disabled={isSubmitting}
                            aria-invalid={Boolean(errors.lastName)}
                            aria-describedby={
                                errors.lastName
                                    ? "lastName-error"
                                    : undefined
                            }
                            className={getInputClass(
                                Boolean(errors.lastName),
                            )}
                        />

                        <div id="lastName-error">
                            <FieldError
                                message={errors.lastName?.message}
                            />
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Contact information */}
            <motion.section
                variants={animatedSectionVariants}
                transition={transition}
                className="space-y-4 border-t border-slate-100 pt-5"
                aria-labelledby="contact-information-heading"
            >
                <div className="flex items-center gap-2">
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-[#1491FF]">
                        <Mail size={16} aria-hidden="true" />
                    </div>

                    <div>
                        <h3
                            id="contact-information-heading"
                            className="text-sm font-semibold text-slate-800"
                        >
                            Contact details
                        </h3>

                        <p className="text-xs text-slate-500">
                            How can we reach you?
                        </p>
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label
                        htmlFor="email"
                        className="block text-[13px] font-semibold text-slate-700"
                    >
                        Email address
                        <span className="ml-1 text-[#1491FF]">*</span>
                    </label>

                    <div className="relative">
                        <Mail
                            size={17}
                            aria-hidden="true"
                            className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
                                errors.email
                                    ? "text-red-400"
                                    : "text-slate-400"
                            }`}
                        />

                        <input
                            {...register("email")}
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            disabled={isSubmitting}
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={
                                errors.email ? "email-error" : undefined
                            }
                            className={`${getInputClass(
                                Boolean(errors.email),
                            )} pl-11`}
                        />
                    </div>

                    <div id="email-error">
                        <FieldError message={errors.email?.message} />
                    </div>

                    {!errors.email && (
                        <p className="text-[11px] leading-5 text-slate-400">
                            We'll use this for account verification and
                            important updates.
                        </p>
                    )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                    <label
                        htmlFor="phone"
                        className="flex items-center gap-2 text-[13px] font-semibold text-slate-700"
                    >
                        Phone number

                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                            Optional
                        </span>
                    </label>

                    <div className="relative">
                        <Phone
                            size={17}
                            aria-hidden="true"
                            className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
                                errors.phone
                                    ? "text-red-400"
                                    : "text-slate-400"
                            }`}
                        />

                        <input
                            {...register("phone")}
                            id="phone"
                            type="tel"
                            autoComplete="tel"
                            placeholder="+234 800 000 0000"
                            disabled={isSubmitting}
                            aria-invalid={Boolean(errors.phone)}
                            aria-describedby={
                                errors.phone ? "phone-error" : undefined
                            }
                            className={`${getInputClass(
                                Boolean(errors.phone),
                            )} pl-11`}
                        />
                    </div>

                    <div id="phone-error">
                        <FieldError message={errors.phone?.message} />
                    </div>
                </div>
            </motion.section>

            {/* Account security */}
            <motion.section
                variants={animatedSectionVariants}
                transition={transition}
                className="space-y-4 border-t border-slate-100 pt-5"
                aria-labelledby="account-security-heading"
            >
                <div className="flex items-center gap-2">
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-[#1491FF]">
                        <LockKeyhole size={16} aria-hidden="true" />
                    </div>

                    <div>
                        <h3
                            id="account-security-heading"
                            className="text-sm font-semibold text-slate-800"
                        >
                            Secure your account
                        </h3>

                        <p className="text-xs text-slate-500">
                            Choose a password only you know.
                        </p>
                    </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <PasswordInput
                        {...register("password")}
                        id="password"
                        name="password"
                        label="Password"
                        placeholder="Create a strong password"
                        autoComplete="new-password"
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby={
                            errors.password
                                ? "password-error"
                                : "password-guidance"
                        }
                        disabled={isSubmitting}
                    />

                    <div id="password-error">
                        <FieldError message={errors.password?.message} />
                    </div>

                    <AnimatePresence initial={false}>
                        {password.length > 0 && (
                            <motion.div
                                key="password-strength"
                                initial={
                                    shouldReduceMotion
                                        ? { opacity: 1 }
                                        : { opacity: 0, height: 0, y: -6 }
                                }
                                animate={{
                                    opacity: 1,
                                    height: "auto",
                                    y: 0,
                                }}
                                exit={
                                    shouldReduceMotion
                                        ? { opacity: 0 }
                                        : { opacity: 0, height: 0, y: -6 }
                                }
                                transition={{
                                    duration: shouldReduceMotion ? 0 : 0.22,
                                    ease: "easeOut",
                                }}
                                className="overflow-hidden"
                            >
                                <div
                                    className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3"
                                    aria-live="polite"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-xs font-semibold text-slate-600">
                                            Password strength
                                        </span>

                                        <span
                                            className={`text-xs font-semibold ${
                                                passwordStrength === 3
                                                    ? "text-emerald-600"
                                                    : passwordStrength === 2
                                                      ? "text-[#0876D1]"
                                                      : "text-slate-500"
                                            }`}
                                        >
                                            {passwordStrength === 3
                                                ? "Looking good"
                                                : passwordStrength === 2
                                                  ? "Almost there"
                                                  : "Keep going"}
                                        </span>
                                    </div>

                                    <div className="flex gap-1.5">
                                        {[0, 1, 2].map((index) => (
                                            <motion.div
                                                key={index}
                                                initial={false}
                                                animate={{
                                                    scaleY:
                                                        index <
                                                        passwordStrength
                                                            ? 1
                                                            : 0.85,
                                                }}
                                                transition={{
                                                    duration: shouldReduceMotion
                                                        ? 0
                                                        : 0.18,
                                                }}
                                                className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                                                    index < passwordStrength
                                                        ? passwordStrength === 3
                                                            ? "bg-emerald-500"
                                                            : "bg-[#1491FF]"
                                                        : "bg-slate-200"
                                                }`}
                                            />
                                        ))}
                                    </div>

                                    <div className="grid gap-1.5">
                                        {passwordChecks.map((check) => (
                                            <div
                                                key={check.label}
                                                className={`flex items-center gap-2 text-[11px] transition-colors duration-200 ${
                                                    check.passed
                                                        ? "text-emerald-700"
                                                        : "text-slate-500"
                                                }`}
                                            >
                                                <Check
                                                    size={13}
                                                    className={
                                                        check.passed
                                                            ? "text-emerald-500"
                                                            : "text-slate-300"
                                                    }
                                                    aria-hidden="true"
                                                />

                                                {check.label}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!password && !errors.password && (
                        <p
                            id="password-guidance"
                            className="text-[11px] leading-5 text-slate-400"
                        >
                            Use at least 8 characters for a more secure
                            account.
                        </p>
                    )}
                </div>

                {/* Confirm password */}
                <div className="space-y-2">
                    <label
                        htmlFor="confirmPassword"
                        className="block text-[13px] font-semibold text-slate-700"
                    >
                        Confirm password
                        <span className="ml-1 text-[#1491FF]">*</span>
                    </label>

                    <PasswordInput
                        {...register("confirmPassword")}
                        id="confirmPassword"
                        name="confirmPassword"
                        label=""
                        placeholder="Enter your password again"
                        autoComplete="new-password"
                        aria-invalid={Boolean(
                            errors.confirmPassword ||
                                (confirmPassword && !passwordsMatch),
                        )}
                        aria-describedby={
                            errors.confirmPassword
                                ? "confirmPassword-error"
                                : undefined
                        }
                        disabled={isSubmitting}
                    />

                    <div id="confirmPassword-error">
                        <FieldError
                            message={errors.confirmPassword?.message}
                        />
                    </div>

                    <AnimatePresence initial={false}>
                        {!errors.confirmPassword &&
                            confirmPassword &&
                            passwordsMatch && (
                                <motion.p
                                    key="passwords-match"
                                    initial={
                                        shouldReduceMotion
                                            ? { opacity: 1 }
                                            : { opacity: 0, y: -4 }
                                    }
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={
                                        shouldReduceMotion
                                            ? { opacity: 0 }
                                            : { opacity: 0, y: -4 }
                                    }
                                    transition={{
                                        duration: shouldReduceMotion
                                            ? 0
                                            : 0.2,
                                    }}
                                    className="flex items-center gap-1.5 text-xs font-medium text-emerald-600"
                                >
                                    <CheckCircle2
                                        size={14}
                                        aria-hidden="true"
                                    />

                                    Your passwords match.
                                </motion.p>
                            )}
                    </AnimatePresence>
                </div>
            </motion.section>

            {/* Submit and legal information */}
            <motion.section
                variants={animatedSectionVariants}
                transition={transition}
                className="space-y-4 border-t border-slate-100 pt-5"
            >
                <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={
                        shouldReduceMotion || isSubmitting
                            ? undefined
                            : { y: -1 }
                    }
                    whileTap={
                        shouldReduceMotion || isSubmitting
                            ? undefined
                            : { scale: 0.99 }
                    }
                    className="group flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-xl bg-[#1491FF] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(20,145,255,0.18)] transition-colors duration-200 hover:bg-[#0876D1] hover:shadow-[0_10px_24px_rgba(20,145,255,0.26)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                >
                    {isSubmitting ? (
                        <>
                            <LoaderCircle
                                size={18}
                                className="animate-spin"
                                aria-hidden="true"
                            />

                            Creating your account...
                        </>
                    ) : (
                        <>
                            Create my account

                            <ArrowRight
                                size={17}
                                className="transition-transform duration-200 group-hover:translate-x-1"
                                aria-hidden="true"
                            />
                        </>
                    )}
                </motion.button>

                <div className="flex items-start gap-2.5 rounded-xl border border-blue-100/80 bg-blue-50/60 p-3.5">
                    <ShieldCheck
                        size={18}
                        className="mt-0.5 shrink-0 text-[#1491FF]"
                        aria-hidden="true"
                    />

                    <p className="text-xs leading-5 text-slate-600">
                        Your information is used to create and protect
                        your KARMASS account. We take your privacy
                        seriously.
                    </p>
                </div>

                <p className="text-center text-xs leading-5 text-slate-500">
                    By creating an account, you agree to our{" "}
                    <Link
                        href="/terms"
                        className="font-semibold text-[#0876D1] underline decoration-blue-200 underline-offset-4 transition hover:text-[#005EAD]"
                    >
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                        href="/privacy"
                        className="font-semibold text-[#0876D1] underline decoration-blue-200 underline-offset-4 transition hover:text-[#005EAD]"
                    >
                        Privacy Policy
                    </Link>
                    .
                </p>

                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-sm">
                    <span className="text-slate-500">
                        Already have an account?
                    </span>

                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1 font-semibold text-[#0876D1] transition-colors hover:text-[#005EAD]"
                    >
                        Sign in

                        <ArrowRight
                            size={14}
                            aria-hidden="true"
                        />
                    </Link>
                </div>
            </motion.section>
        </motion.form>
    );
}