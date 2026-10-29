"use client";

import Link from "next/link";
import { CarFront, Menu } from "lucide-react";
import { useState } from "react";

const navigationLinks = [
    { label: "Buy a car", href: "/marketplace" },
    { label: "Sell a car", href: "/login" },
    { label: "Dealers", href: "/dealers" },
];

export function DesktopNavbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
            <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
                {/* Brand */}
                <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-[max(16px,env(safe-area-inset-top))]">
                    <Link
                        href="/"
                        aria-label="KARMASS home"
                        className="group flex min-w-0 items-center gap-2.5"
                    >
                        <span
                            className="
                                flex h-10 w-10 shrink-0
                                items-center justify-center
                                border border-[#E6EDF5] bg-white
                                text-[16px] font-semibold
                                tracking-[-0.08em]
                                text-[#1491FF]
                                transition-colors
                                group-hover:border-[#1491FF]
                            "
                        >
                            K.
                        </span>

                        <span className="min-w-0">
                            <span className="block text-[15px] font-semibold leading-5 tracking-[0.15em] text-[#20201F]">
                                KARMASS
                            </span>

                            <span className="mt-0.5 block text-[8px] font-medium uppercase tracking-[0.17em] text-[#8491A3]">
                                Find your drive
                            </span>
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-8 md:flex">
                    {navigationLinks.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-[#1491FF]"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden items-center gap-3 md:flex">
                    <Link
                        href="/login"
                        className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-blue-50 hover:text-[#1491FF]"
                    >
                        Log in
                    </Link>

                    <Link
                        href="/register"
                        className="rounded-xl bg-[#1491FF] px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-all duration-200 hover:bg-[#0876D1] hover:shadow-md active:scale-[0.98]"
                    >
                        Create account
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    type="button"
                    aria-label={
                        mobileMenuOpen
                            ? "Close navigation menu"
                            : "Open navigation menu"
                    }
                    aria-expanded={mobileMenuOpen}
                    onClick={() =>
                        setMobileMenuOpen((current) => !current)
                    }
                    className="grid size-11 place-items-center rounded-xl border border-slate-200 text-slate-800 transition-colors duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-[#1491FF] md:hidden"
                >
                    <Menu size={22} />
                </button>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <nav className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">
                    <div className="mx-auto flex max-w-[1440px] flex-col gap-1">
                        {navigationLinks.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-blue-50 hover:text-[#1491FF]"
                            >
                                {item.label}
                            </Link>
                        ))}

                        <Link
                            href="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-blue-50 hover:text-[#1491FF]"
                        >
                            Log in
                        </Link>

                        <Link
                            href="/register"
                            onClick={() => setMobileMenuOpen(false)}
                            className="mt-2 rounded-xl bg-[#1491FF] px-4 py-3 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0876D1] active:scale-[0.98]"
                        >
                            Create account
                        </Link>
                    </div>
                </nav>
            )}
        </header>
    );
}