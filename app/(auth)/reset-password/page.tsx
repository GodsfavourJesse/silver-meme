import { Suspense } from "react";

import { motion } from "framer-motion";
import Link from "next/link";

import {
    KeyRound,
    ShieldCheck,
} from "lucide-react";

import { ResetPasswordForm } from "@/app/components/auth/ResetPasswordForm";

function ResetPasswordLoading() {
    return (
        <div
            className="
                flex min-h-[280px] items-center
                justify-center
            "
        >
            <div className="flex flex-col items-center gap-4">
                <div
                    className="
                        flex h-14 w-14 items-center
                        justify-center rounded-2xl
                        border border-[#1491FF]/15
                        bg-[#1491FF]/[0.07]
                        text-[#1491FF]
                    "
                >
                    <KeyRound size={25} />
                </div>

                <div
                    className="
                        h-6 w-6 animate-spin rounded-full
                        border-2 border-[#1491FF]/20
                        border-t-[#1491FF]
                    "
                    aria-label="Loading password reset form"
                    role="status"
                />
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
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
            {/* Background accents */}
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

            <div
                aria-hidden="true"
                className="
                    pointer-events-none absolute inset-0
                    -z-10 opacity-[0.22]
                    [background-image:radial-gradient(#94A3B8_0.7px,transparent_0.7px)]
                    [background-size:24px_24px]
                "
            />

            <div className="mx-auto flex w-full max-w-[440px] flex-col">
                {/* Brand */}
                <div className="mb-7 flex justify-center sm:mb-9">
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
                        <div
                            className="
                                flex h-11 w-11 items-center
                                justify-center rounded-[15px]
                                bg-[#1491FF] text-white
                                shadow-lg shadow-[#1491FF]/20
                                transition-transform duration-200
                                group-hover:scale-[1.03]
                            "
                        >
                            <KeyRound
                                size={21}
                                strokeWidth={2}
                                aria-hidden="true"
                            />
                        </div>

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
                </div>

                {/* Reset form */}
                <Suspense fallback={<ResetPasswordLoading />}>
                    <ResetPasswordForm />
                </Suspense>

                {/* Footer */}
                <div
                    className="
                        mt-6 flex items-center justify-center
                        gap-2 text-center text-[10px]
                        font-medium tracking-wide
                        text-slate-400
                    "
                >
                    <ShieldCheck
                        size={13}
                        className="text-[#1491FF]"
                        aria-hidden="true"
                    />

                    <span>Secure account recovery</span>

                    <span className="text-slate-300">·</span>

                    <span>
                        © {new Date().getFullYear()} KARMASS
                    </span>
                </div>
            </div>
        </main>
    );
}