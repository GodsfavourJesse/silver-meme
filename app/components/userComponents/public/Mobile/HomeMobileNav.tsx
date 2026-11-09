"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    Home,
    Compass,
    // Store,
    UserRound,
} from "lucide-react";

const NAV_ITEMS = [
    {
        label: "Home",
        href: "/",
        icon: Home,
    },
    {
        label: "Explore",
        href: "/marketplace",
        icon: Compass,
    },
    // {
    //     label: "Dealers",
    //     href: "/dealers",
    //     icon: Store,
    // },
    {
        label: "Account",
        href: "/register",
        icon: UserRound,
    },
] as const;

export default function HomeMobileNav() {
    const pathname = usePathname();

    function isActive(href: string): boolean {
        if (href === "/") {
            return pathname === "/";
        }

        if (href === "/register") {
            return (
                pathname === "/register" ||
                pathname === "/login" ||
                pathname.startsWith("/dashboard")
            );
        }

        return (
            pathname === href ||
            pathname.startsWith(`${href}/`)
        );
    }

    return (
        <nav
            aria-label="Main navigation"
            className="
                fixed bottom-[max(12px,env(safe-area-inset-bottom))]
                left-1/2 z-40
                w-[90%] max-w-[480px]
                -translate-x-1/2
                rounded-[22px]
                border border-white/15
                bg-gradient-to-r from-[#0877D9] via-[#1491FF] to-[#0877D9]
                p-2
                shadow-[0_10px_35px_rgba(0,101,201,0.28)]
                md:hidden
            "
        >
            <div
                className="
                    grid w-full
                    grid-flow-col
                    auto-cols-fr
                    gap-1
                "
            >
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            className={`
                                group relative flex min-w-0
                                flex-col items-center justify-center
                                gap-1.5 rounded-[16px]
                                px-2 py-3
                                transition-all duration-200
                                active:scale-[0.97]
                                ${
                                    active
                                        ? "bg-white text-[#0877D9] shadow-[0_3px_12px_rgba(0,50,110,0.14)]"
                                        : "text-white/85 hover:bg-white/10 hover:text-white"
                                }
                            `}
                        >
                            <Icon
                                size={22}
                                strokeWidth={active ? 2.3 : 1.8}
                                className="
                                    shrink-0
                                    transition-transform duration-200
                                    group-hover:-translate-y-0.5
                                "
                            />

                            <span
                                className={`
                                    whitespace-nowrap text-[11px]
                                    tracking-wide
                                    ${
                                        active
                                            ? "font-bold"
                                            : "font-medium"
                                    }
                                `}
                            >
                                {item.label}
                            </span>

                            {active && (
                                <span
                                    aria-hidden="true"
                                    className="
                                        absolute -bottom-0.5
                                        h-1 w-6 rounded-full
                                        bg-[#1491FF]
                                    "
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}