"use client";

import { AdminLoginForm } from "@/app/components/adminComponents/admin-login/admin-login-form";
import { KarmassAdminLogo } from "@/app/components/adminComponents/admin-login/karmass-admin-login";
import { CurrentYear } from "@/app/utils/current-year";
import {
    motion,
} from "framer-motion";

import {
    ArrowUpRight,
    CheckCircle2,
    LockKeyhole,
    ShieldCheck,
} from "lucide-react";

const ADMIN_BENEFITS = [
    "Manage vehicle listings and marketplace activity",
    "Review users, dealers, and account activity",
    "Keep the KARMASS marketplace running smoothly",
];

export default function AdminLoginPage() {
    return (
        <main className="relative min-h-dvh overflow-hidden bg-[#F5F8FC] text-[#172033]">
            <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-8">
                {/* Top bar */}
                <motion.header
                    initial={{
                        opacity: 0,
                        y: -8,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.4,
                    }}
                    className="flex items-center justify-between"
                >
                    <KarmassAdminLogo />

                    <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 sm:inline-flex">
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-40" />

                            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                        </span>

                        <span className="text-xs font-medium text-slate-600">
                            Administrator portal
                        </span>
                    </div>
                </motion.header>

                {/* Main content */}
                <div className="flex flex-1 items-center justify-center py-8 sm:py-10 lg:py-12">
                    <motion.section
                        initial={{
                            opacity: 0,
                            y: 18,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            duration: 0.55,
                            delay: 0.05,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="grid w-full max-w-[1050px] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_20px_65px_-38px_rgba(15,23,42,0.24)] lg:min-h-[600px] lg:grid-cols-[0.94fr_1.06fr]"
                    >
                        {/* Left brand panel */}
                        <div className="relative hidden flex-col justify-between overflow-hidden bg-[#F0F7FF] p-9 lg:flex xl:p-11">
                            <div className="absolute inset-y-0 right-0 w-px bg-[#D8EAFE]" />

                            <motion.div
                                initial={{
                                    opacity: 0,
                                    x: -12,
                                }}
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                }}
                                transition={{
                                    duration: 0.45,
                                    delay: 0.15,
                                }}
                                className="relative z-10"
                            >
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#C9E3FF] bg-white/80 px-3 py-1.5">
                                    <ShieldCheck
                                        size={15}
                                        className="text-[#1491FF]"
                                    />

                                    <span className="text-[11px] font-bold tracking-wide text-[#1766A8]">
                                        SECURE ADMINISTRATION
                                    </span>
                                </div>

                                <h1 className="mt-8 max-w-md text-[36px] font-bold leading-[1.13] tracking-[-0.045em] text-[#172033] xl:text-[42px]">
                                    Everything behind a better way to{" "}
                                    <span className="text-[#1491FF]">
                                        find your drive.
                                    </span>
                                </h1>

                                <p className="mt-5 max-w-sm text-sm leading-7 text-slate-600">
                                    Your workspace for managing the
                                    KARMASS automotive marketplace,
                                    supporting our community, and
                                    keeping everyday operations on track.
                                </p>

                                <div className="mt-8 space-y-4">
                                    {ADMIN_BENEFITS.map(
                                        (benefit, index) => (
                                            <motion.div
                                                key={benefit}
                                                initial={{
                                                    opacity: 0,
                                                    x: -8,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    x: 0,
                                                }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay:
                                                        0.25 +
                                                        index * 0.08,
                                                }}
                                                className="flex items-start gap-3"
                                            >
                                                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-[#1491FF] ring-1 ring-[#C9E3FF]">
                                                    <CheckCircle2
                                                        size={13}
                                                    />
                                                </span>

                                                <p className="text-sm leading-6 text-slate-600">
                                                    {benefit}
                                                </p>
                                            </motion.div>
                                        ),
                                    )}
                                </div>
                            </motion.div>

                            {/* Quiet decorative panel */}
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: 10,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                transition={{
                                    duration: 0.5,
                                    delay: 0.3,
                                }}
                                className="relative mt-10 rounded-2xl border border-[#D8EAFE] bg-white/75 p-5"
                            >
                                <div className="flex items-start gap-3.5">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#1491FF]">
                                        <LockKeyhole size={20} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold text-[#172033]">
                                            Security comes first
                                        </p>

                                        <p className="mt-1.5 text-xs leading-5 text-slate-500">
                                            Administrator access is
                                            restricted to authorized
                                            accounts and protected by
                                            additional verification.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Login panel */}
                        <div className="flex flex-col justify-center px-5 py-8 sm:px-9 sm:py-10 lg:px-10 xl:px-14">
                            <motion.div
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
                                    delay: 0.15,
                                }}
                                className="mx-auto w-full max-w-[390px]"
                            >
                                <div className="mb-8 lg:hidden">
                                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#B9DEFF] bg-[#EAF5FF] px-3 py-1.5">
                                        <ShieldCheck
                                            size={14}
                                            className="text-[#1491FF]"
                                        />

                                        <span className="text-[11px] font-semibold text-[#1766A8]">
                                            Administrator portal
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1491FF]">
                                        Welcome back
                                    </p>

                                    <h2 className="mt-2.5 text-[29px] font-bold tracking-[-0.045em] text-[#172033] sm:text-[33px]">
                                        Sign in to KARMASS
                                    </h2>

                                    <p className="mt-3 text-sm leading-6 text-slate-500">
                                        Use your administrator credentials
                                        to access your workspace.
                                    </p>
                                </div>

                                <div className="mt-8">
                                    <AdminLoginForm />
                                </div>

                                <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-100 pt-5">
                                    <LockKeyhole
                                        size={14}
                                        className="text-slate-400"
                                    />

                                    <p className="text-[11px] text-slate-500">
                                        Protected administrator sign-in
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.section>
                </div>

                {/* Footer */}
                <motion.footer
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                    transition={{
                        duration: 0.4,
                        delay: 0.25,
                    }}
                    className="flex flex-col items-center justify-between gap-3 pb-1 text-center sm:flex-row sm:text-left"
                >
                    <p className="text-[11px] text-slate-500">
                        © <CurrentYear /> KARMASS. All rights reserved.
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span>Built for better journeys.</span>

                        <ArrowUpRight
                            size={13}
                            className="text-[#1491FF]"
                        />
                    </div>
                </motion.footer>
            </div>
        </main>
    );
}