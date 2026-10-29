"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    ArrowLeft,
    ArrowRight,
    LoaderCircle,
    Mail,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { authService } from "@/app/services/user/auth/auth.service";
import { ApiError } from "@/app/lib/api/api-error";
import { PasswordInput } from "@/app/components/auth/PasswordInput";
import { queryKeys } from "@/app/lib/query/query-keys";

const BRAND_BLUE = "#1491FF";

const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Enter a valid email address"),

    password: z
        .string()
        .min(1, "Enter your password")
        .max(128, "Password cannot exceed 128 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setError,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
        setServerError(null);

        try {
            await authService.login({
                email: values.email.trim().toLowerCase(),
                password: values.password,
            });

            const currentUser = await queryClient.fetchQuery({
                queryKey: queryKeys.auth.currentUser(),
                queryFn: async () => {
                    const response = await authService.getCurrentUser();
                    return response.data.user;
                },
                staleTime: 0,
            });

            if (!currentUser) {
                throw new Error(
                    "Login succeeded, but the authenticated user could not be loaded.",
                );
            }

            router.replace("/dashboard");
            router.refresh();
        } catch (error) {
            if (error instanceof ApiError) {
                const message = error.message || "Unable to sign in.";

                if (message.toLowerCase().includes("verif")) {
                    setServerError(
                        "Your email address hasn't been verified yet. Verify your email to continue.",
                    );
                    return;
                }

                if (error.status === 401) {
                    setError("password", {
                        type: "server",
                        message: "Your email or password doesn't match our records.",
                    });
                    return;
                }

                if (error.status === 403) {
                    setServerError(
                        "Your account can't sign in at the moment. Check your account status or contact support.",
                    );
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

    const inputBase =
        "h-[54px] w-full rounded-2xl border bg-white pl-11 pr-4 text-[14px] text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:ring-4";

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
        >
            {/* Error message */}
            {serverError && (
                <div
                    role="alert"
                    aria-live="polite"
                    className="rounded-2xl border border-red-200 bg-red-50 p-4"
                >
                    <div className="flex items-start gap-3">
                        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
                            <ShieldCheck size={16} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-red-800">
                                We couldn't sign you in
                            </p>

                            <p className="mt-1 text-sm leading-6 text-red-700">
                                {serverError}
                            </p>

                            {serverError.toLowerCase().includes("verif") && (
                                <Link
                                    href="/verify-email"
                                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-red-800 underline decoration-red-300 underline-offset-4 transition hover:text-red-950"
                                >
                                    Verify your email
                                    <ArrowRight size={15} />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Intro */}
            <div className="space-y-1.5">
                <p className="text-sm font-medium text-slate-500">
                    Welcome back
                </p>

                <h2 className="text-xl font-bold tracking-tight text-slate-950">
                    Let's get you back in.
                </h2>

                <p className="text-sm leading-6 text-slate-500">
                    Sign in to continue your journey with KARMASS.
                </p>
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
                        size={18}
                        strokeWidth={1.8}
                        aria-hidden="true"
                        className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
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
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={
                            errors.email ? "email-error" : undefined
                        }
                        className={`${inputBase} ${
                            errors.email
                                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                : "border-slate-200 hover:border-slate-300 focus:border-[#1491FF] focus:ring-blue-100"
                        }`}
                    />
                </div>

                {errors.email && (
                    <p
                        id="email-error"
                        className="flex items-center gap-1.5 text-xs font-medium text-red-600"
                    >
                        {errors.email.message}
                    </p>
                )}
            </div>

            {/* Password */}
            <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <label
                        htmlFor="password"
                        className="text-[13px] font-semibold text-slate-700"
                    >
                        Password
                        <span className="ml-1 text-[#1491FF]">*</span>
                    </label>

                    <Link
                        href="/forgot-password"
                        className="text-xs font-semibold text-[#0876D1] transition-colors hover:text-[#005EAD]"
                    >
                        Forgot password?
                    </Link>
                </div>

                <div
                    className={`rounded-2xl transition-all ${
                        errors.password
                            ? "ring-1 ring-red-300"
                            : ""
                    }`}
                >
                    <PasswordInput
                        {...register("password")}
                        id="password"
                        label=""
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby={
                            errors.password ? "password-error" : undefined
                        }
                    />
                </div>

                {errors.password && (
                    <p
                        id="password-error"
                        className="text-xs font-medium text-red-600"
                    >
                        {errors.password.message}
                    </p>
                )}
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex min-h-[54px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-[#1491FF] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(20,145,255,0.20)] transition-all duration-200 hover:bg-[#0876D1] hover:shadow-[0_10px_26px_rgba(20,145,255,0.28)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
            >
                {isSubmitting ? (
                    <>
                        <LoaderCircle
                            size={18}
                            className="animate-spin"
                        />
                        Signing you in...
                    </>
                ) : (
                    <>
                        Sign in to KARMASS

                        <ArrowRight
                            size={17}
                            className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                    </>
                )}
            </button>

            {/* Security reassurance */}
            <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#1491FF]">
                    <ShieldCheck size={19} strokeWidth={1.8} />
                </div>

                <div className="min-w-0 pt-0.5">
                    <p className="text-xs font-semibold text-slate-700">
                        Your account, protected.
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Never share your password or sign-in details with anyone.
                    </p>
                </div>
            </div>

            {/* Registration link */}
            <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2 pt-1 text-sm">
                <span className="text-slate-500">
                    New to KARMASS?
                </span>

                <Link
                    href="/register"
                    className="inline-flex items-center gap-1 font-semibold text-[#0876D1] transition-colors hover:text-[#005EAD]"
                >
                    Create an account
                    <ArrowRight size={14} />
                </Link>
            </div>

            {/* Brand footer */}
            <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-slate-400">
                <Sparkles
                    size={12}
                    className="text-[#1491FF]"
                />
                <span>
                    Your next drive starts here.
                </span>
            </div>
        </form>
    );
}
