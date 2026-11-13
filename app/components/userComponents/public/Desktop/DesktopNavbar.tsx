"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";
import { PublicAccountLink } from "@/app/components/auth/PublicAccountLink";

const navigationLinks = [
    { label: "Buy a car", href: "/marketplace" },
    { label: "Sell a car", href: "/login" },
    { label: "Dealers", href: "/dealers" },
];

export function DesktopNavbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 border-b border-[#0876D1] bg-gradient-to-br from-[#087FE8] via-[#0877D9] to-[#064C9B]">
            <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
                <Link
                    href="/"
                    aria-label="KARMASS home"
                    className="group flex min-w-0 items-center gap-2.5"
                >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[16px] font-semibold tracking-[-0.08em] text-[#1491FF] transition-colors group-hover:bg-blue-50">
                        K.
                    </span>
                    <span className="min-w-0">
                        <span className="block text-[15px] font-semibold leading-5 tracking-[0.15em] text-white">
                            KARMASS
                        </span>
                        <span className="mt-0.5 block text-[8px] font-medium uppercase tracking-[0.17em] text-white/80">
                            Find your drive
                        </span>
                    </span>
                </Link>

                <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
                    {navigationLinks.map((item) =>
                        item.href === "/login" ? (
                            <PublicAccountLink
                                key={item.label}
                                href="/login"
                                className="text-sm font-medium text-white/90 transition-colors hover:text-white"
                            >
                                {item.label}
                            </PublicAccountLink>
                        ) : (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="text-sm font-medium text-white/90 transition-colors hover:text-white"
                            >
                                {item.label}
                            </Link>
                        ),
                    )}
                </nav>

                <div className="hidden items-center gap-3 md:flex">
                    <PublicAccountLink
                        href="/login"
                        className="rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                    >
                        Log in
                    </PublicAccountLink>
                    <PublicAccountLink
                        href="/register"
                        className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0876D1] shadow-sm transition-all hover:bg-blue-50 active:scale-[0.98]"
                    >
                        Create account
                    </PublicAccountLink>
                </div>

                <button
                    type="button"
                    aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={mobileMenuOpen}
                    onClick={() => setMobileMenuOpen((current) => !current)}
                    className="grid size-11 place-items-center rounded-xl border border-white/40 text-white transition-colors hover:bg-white/10 md:hidden"
                >
                    <Menu size={22} aria-hidden="true" />
                </button>
            </div>

            {mobileMenuOpen && (
                <nav aria-label="Mobile navigation" className="border-t border-white/20 bg-[#1491FF] px-5 py-4 md:hidden">
                    <div className="mx-auto flex max-w-[1440px] flex-col gap-1">
                        {navigationLinks.map((item) =>
                            item.href === "/login" ? (
                                <PublicAccountLink
                                    key={item.label}
                                    href="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="rounded-xl px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                                >
                                    {item.label}
                                </PublicAccountLink>
                            ) : (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="rounded-xl px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                                >
                                    {item.label}
                                </Link>
                            ),
                        )}
                        <PublicAccountLink
                            href="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="rounded-xl px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                        >
                            Log in
                        </PublicAccountLink>
                        <PublicAccountLink
                            href="/register"
                            onClick={() => setMobileMenuOpen(false)}
                            className="mt-2 rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-[#0876D1] transition-colors hover:bg-blue-50"
                        >
                            Create account
                        </PublicAccountLink>
                    </div>
                </nav>
            )}
        </header>
    );
}
