import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CurrentYear } from "@/app/utils/current-year";

interface AuthRecoveryLayoutProps {
    children: ReactNode;
    eyebrow: string;
    title: string;
    description: string;
}

export function AuthRecoveryLayout({
    children,
    eyebrow,
    title,
    description,
}: AuthRecoveryLayoutProps) {
    return (
        <main className="flex min-h-screen flex-col bg-[#F7F6F2] px-5 py-6 sm:px-8">
            <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
                <Link
                    href="/"
                    aria-label="KARMASS home"
                    className="flex items-center gap-3"
                >
                    <span className="flex h-10 w-10 items-center justify-center border border-[#7008E7] text-lg font-semibold text-[#7008E7]">
                        K.
                    </span>

                    <span className="text-sm font-semibold tracking-[0.2em] text-[#292522]">
                        KARMASS
                    </span>
                </Link>

                <Link
                    href="/login"
                    className="text-sm font-medium text-[#7008E7] transition-colors hover:text-[#5B06BC]"
                >
                    Sign in
                </Link>
            </header>

            <section className="flex flex-1 items-center justify-center py-12">
                <div className="w-full max-w-[460px]">
                    <div className="border border-[#E9E5DE] bg-white px-6 py-9 shadow-[0_20px_60px_rgba(41,37,34,0.04)] sm:px-10 sm:py-11">
                        <div className="mb-8">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7008E7]">
                                {eyebrow}
                            </p>

                            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#292522]">
                                {title}
                            </h1>

                            <p className="mt-3 text-sm leading-6 text-[#858078]">
                                {description}
                            </p>
                        </div>

                        {children}

                        <div className="mt-8 border-t border-[#E9E5DE] pt-5">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-sm text-[#858078] transition-colors hover:text-[#7008E7]"
                            >
                                <ArrowLeft size={15} />
                                Back to sign in
                            </Link>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-xs text-[#96918B]">
                        &copy; <CurrentYear /> KARMASS. All rights reserved.
                    </p>
                </div>
            </section>
        </main>
    );
}