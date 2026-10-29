"use client";

import {
    useState,
} from "react";

import {
    AnimatePresence,
    motion,
} from "framer-motion";

import {
    AlertCircle,
    ArrowRight,
    Eye,
    EyeOff,
    KeyRound,
    Mail,
    ShieldCheck,
} from "lucide-react";

import { useAdminLoginForm } from "@/app/hooks/admin/admin-auth/use-admin-login-form";

import { AdminSecurityChallengeModal } from "./admin-security-challenge-modal";

export function AdminLoginForm() {
    const {
        email,
        password,
        formError,
        isSubmitting,
        challengeOpen,
        updateEmail,
        updatePassword,
        handleSubmit,
        closeChallenge,
        handleChallengeComplete,
    } = useAdminLoginForm();

    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <motion.form
                onSubmit={handleSubmit}
                initial={{
                    opacity: 0,
                    y: 12,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.45,
                    delay: 0.12,
                    ease: [0.22, 1, 0.36, 1],
                }}
                className="space-y-5"
                noValidate
            >
                <AnimatePresence mode="wait">
                    {formError && (
                        <motion.div
                            key={formError}
                            initial={{
                                opacity: 0,
                                height: 0,
                                y: -6,
                            }}
                            animate={{
                                opacity: 1,
                                height: "auto",
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                height: 0,
                                y: -4,
                            }}
                            transition={{
                                duration: 0.2,
                            }}
                            role="alert"
                            className="overflow-hidden"
                        >
                            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5">
                                <AlertCircle
                                    size={18}
                                    className="mt-0.5 shrink-0 text-rose-600"
                                />

                                <div>
                                    <p className="text-sm font-semibold text-rose-900">
                                        Unable to sign in
                                    </p>

                                    <p className="mt-1 text-sm leading-5 text-rose-700">
                                        {formError}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div>
                    <label
                        htmlFor="admin-email"
                        className="mb-2 block text-sm font-semibold text-[#172033]"
                    >
                        Administrator email
                    </label>

                    <div className="relative">
                        <Mail
                            size={18}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors"
                        />

                        <input
                            id="admin-email"
                            name="email"
                            type="email"
                            autoComplete="username"
                            inputMode="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(event) =>
                                updateEmail(event.target.value)
                            }
                            disabled={isSubmitting}
                            required
                            maxLength={255}
                            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-[#172033] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#1491FF] focus:ring-4 focus:ring-[#1491FF]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                        />
                    </div>
                </div>

                <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <label
                            htmlFor="admin-password"
                            className="text-sm font-semibold text-[#172033]"
                        >
                            Password
                        </label>

                        <span className="text-[11px] font-medium text-slate-400">
                            Keep your credentials private
                        </span>
                    </div>

                    <div className="relative">
                        <KeyRound
                            size={18}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            id="admin-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) =>
                                updatePassword(event.target.value)
                            }
                            disabled={isSubmitting}
                            required
                            maxLength={128}
                            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-[#172033] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#1491FF] focus:ring-4 focus:ring-[#1491FF]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword((previous) => !previous)
                            }
                            disabled={isSubmitting}
                            aria-label={
                                showPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                            aria-pressed={showPassword}
                            className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                        >
                            {showPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex items-start gap-2.5 pt-0.5">
                    <ShieldCheck
                        size={17}
                        className="mt-0.5 shrink-0 text-[#1491FF]"
                    />

                    <p className="text-xs leading-5 text-slate-500">
                        Your administrator session is protected by
                        server-side authentication and security checks.
                    </p>
                </div>

                <motion.button
                    type="submit"
                    disabled={isSubmitting || challengeOpen}
                    whileHover={
                        !isSubmitting
                            ? { y: -1 }
                            : undefined
                    }
                    whileTap={
                        !isSubmitting
                            ? { scale: 0.99 }
                            : undefined
                    }
                    className="group flex h-[50px] w-full items-center justify-center gap-2.5 rounded-xl bg-[#1491FF] px-5 text-sm font-bold text-white shadow-[0_5px_14px_-6px_rgba(20,145,255,0.65)] transition-colors duration-200 hover:bg-[#0876D1] focus:outline-none focus:ring-4 focus:ring-[#1491FF]/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? (
                        <>
                            <span className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />

                            Signing in...
                        </>
                    ) : (
                        <>
                            Continue to administration

                            <ArrowRight
                                size={17}
                                className="transition-transform duration-200 group-hover:translate-x-1"
                            />
                        </>
                    )}
                </motion.button>

                <p className="text-center text-[11px] leading-5 text-slate-400">
                    Authorized personnel only. All administrator sign-in
                    attempts may be logged for security purposes.
                </p>
            </motion.form>

            <AdminSecurityChallengeModal
                open={challengeOpen}
                isCompleting={isSubmitting}
                onClose={closeChallenge}
                onComplete={handleChallengeComplete}
            />
        </>
    );
}