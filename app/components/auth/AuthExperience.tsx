import type { ReactNode } from "react";
import Link from "next/link";

import { AuthBrandVisual } from "./AuthBrandVisual";
import { AuthFormHeader } from "./AuthFormHeader";

interface AuthExperienceProps {
    mode: "register" | "login";
    children: ReactNode;
}

export function AuthExperience({
    mode,
    children,
}: AuthExperienceProps) {
    const isRegister = mode === "register";

    return (
        <main className="h-[100dvh] w-full overflow-hidden bg-[#F7F9FC] text-[#20211E] antialiased">
            <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[1.08fr_0.92fr]">
                {/* Brand experience — fixed, never scrolls */}
                <aside className="relative hidden h-full min-h-0 overflow-hidden lg:block">
                    <AuthBrandVisual mode={mode} />
                </aside>

                {/* Form experience — the only scrollable section */}
                <section className="relative flex h-full min-h-0 flex-col overflow-hidden bg-white">
                    {/* Mobile brand header — stays fixed */}
                    <header className="z-20 flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-8 lg:hidden">
                        <Link
                            href="/"
                            aria-label="KARMASS home"
                            className="inline-flex items-center gap-3"
                        >
                            <span className="flex size-9 items-center justify-center rounded-xl bg-[#1491FF] text-sm font-bold tracking-[-0.08em] text-white shadow-sm shadow-blue-200">
                                K.
                            </span>

                            <span className="text-base font-bold tracking-[0.16em] text-slate-950">
                                KARMASS
                            </span>
                        </Link>

                        <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Find your drive
                        </span>
                    </header>

                    {/* Desktop top navigation — stays fixed */}
                    <div className="z-10 hidden shrink-0 items-center justify-end border-b border-slate-100 bg-white px-8 py-5 lg:flex lg:px-12 xl:px-16">
                        <p className="text-xs text-slate-500">
                            {isRegister
                                ? "Already a member?"
                                : "New to KARMASS?"}
                        </p>

                        <Link
                            href={isRegister ? "/login" : "/register"}
                            className="ml-2 text-xs font-semibold text-[#1491FF] underline-offset-4 transition-colors hover:text-[#0876D1] hover:underline"
                        >
                            {isRegister
                                ? "Sign in"
                                : "Create an account"}
                        </Link>
                    </div>

                    {/* Scrollable form content */}
                    <div
                        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-5 py-7 sm:px-8 sm:py-9 lg:px-12 lg:py-10 xl:px-16"
                        style={{
                            scrollbarWidth: "thin",
                            scrollbarColor: "#CBD5E1 transparent",
                        }}
                    >
                        <div className="mx-auto flex min-h-full w-full max-w-[430px] flex-col">
                            {/* Form and heading */}
                            <div className="my-auto w-full py-2">
                                <AuthFormHeader mode={mode} />

                                {children}
                            </div>

                            {/* Footer */}
                            <footer className="mt-8 shrink-0 border-t border-slate-100 py-5 text-center text-[11px] text-slate-400">
                                <p>
                                    © {new Date().getFullYear()} KARMASS.
                                    All rights reserved.
                                </p>
                            </footer>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}