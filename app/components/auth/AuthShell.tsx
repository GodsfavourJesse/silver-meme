import type { ReactNode } from "react";
import Link from "next/link";

import {
    ArrowLeft,
} from "lucide-react";
import { CurrentYear } from "@/app/utils/current-year";

interface AuthShellProps {
    children: ReactNode;
    mode: "register" | "login";
}

export function AuthShell({
    children,
    mode,
}: AuthShellProps) {
    const isRegister = mode === "register";

    return (
        <div className="min-h-screen bg-white lg:grid lg:grid-cols-[1.05fr_0.95fr]">

            {/* Desktop branding panel */}
            <aside className="relative hidden min-h-screen overflow-hidden bg-[#f7f2ff] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">

                <div className="absolute -left-32 top-32 size-[420px] rounded-full bg-[#e8d8ff]/60 blur-3xl" />

                <div className="absolute -bottom-32 -right-24 size-[420px] rounded-full bg-[#d9c3ff]/50 blur-3xl" />

                <Link
                    href="/"
                    className="relative z-10 inline-flex w-fit items-center gap-3"
                >
                    <span className="grid size-11 place-items-center rounded-2xl bg-[#7138d2] text-lg font-black text-white shadow-lg shadow-purple-200">
                        K
                    </span>

                    <span className="text-2xl font-extrabold tracking-[-0.06em] text-[#28183c]">
                        KARMASS
                    </span>
                </Link>

                <div className="relative z-10 max-w-xl py-12">
                    <span className="inline-flex items-center rounded-full border border-[#e6d8fb] bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#7138d2]">
                        Your automotive marketplace
                    </span>

                    <h2 className="mt-7 text-5xl font-bold leading-[1.12] tracking-[-0.055em] text-[#28183c] xl:text-6xl">
                        {isRegister
                            ? "Your next car journey starts here."
                            : "Welcome back to your automotive world."}
                    </h2>

                    <p className="mt-6 max-w-md text-base leading-8 text-[#786b89]">
                        {isRegister
                            ? "Discover vehicles, connect with dealers, and find the right car for your next chapter."
                            : "Sign in to manage your account, explore vehicles, and continue where you left off."}
                    </p>

                    <div className="mt-10 grid grid-cols-3 gap-4">
                        <div className="rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur-sm">
                            <p className="text-xl font-bold text-[#332044]">
                                Discover
                            </p>

                            <p className="mt-2 text-xs leading-5 text-[#847693]">
                                Explore vehicles
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur-sm">
                            <p className="text-xl font-bold text-[#332044]">
                                Connect
                            </p>

                            <p className="mt-2 text-xs leading-5 text-[#847693]">
                                Meet dealers
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur-sm">
                            <p className="text-xl font-bold text-[#332044]">
                                Drive
                            </p>

                            <p className="mt-2 text-xs leading-5 text-[#847693]">
                                Find your car
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center justify-between gap-4 border-t border-[#e9dff5] pt-6 text-xs text-[#897c98]">
                    <p>
                        © <CurrentYear /> KARMASS
                    </p>

                    <p>
                        Built for your next journey.
                    </p>
                </div>
            </aside>

            {/* Form panel */}
            <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 sm:py-10 lg:px-12 xl:px-20">

                <div className="flex items-center justify-between gap-4 lg:justify-end">

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#756781] transition hover:text-[#7138d2] lg:hidden"
                    >
                        <ArrowLeft size={17} />

                        <span>KARMASS</span>
                    </Link>

                    <p className="text-sm text-[#82758f]">
                        {isRegister
                            ? "Already have an account?"
                            : "New to KARMASS?"}

                        <Link
                            href={isRegister ? "/login" : "/register"}
                            className="ml-1.5 font-bold text-[#7138d2] transition hover:text-[#5421ad]"
                        >
                            {isRegister
                                ? "Sign in"
                                : "Create account"}
                        </Link>
                    </p>
                </div>

                <div className="flex flex-1 items-center justify-center py-10 lg:py-12">
                    <div className="w-full max-w-[440px]">
                        {children}
                    </div>
                </div>

                <footer className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-[#f0ebf5] pt-5 text-xs text-[#968ba1] lg:border-0 lg:pt-0">
                    <Link
                        href="/privacy"
                        className="transition hover:text-[#7138d2]"
                    >
                        Privacy
                    </Link>

                    <Link
                        href="/terms"
                        className="transition hover:text-[#7138d2]"
                    >
                        Terms
                    </Link>

                    <span>
                        Secure account access
                    </span>
                </footer>
            </section>
        </div>
    );
}