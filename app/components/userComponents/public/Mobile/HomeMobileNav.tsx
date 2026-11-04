"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    Home,
    MessageCircle,
    UserRound,
} from "lucide-react";

const NAV_ITEMS = [
    {
        label: "Home",
        href: "/",
        icon: Home,
    },
    {
        label: "Dealers",
        href: "/dealers",
        icon: MessageCircle,
    },
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

        return (
            pathname === href ||
            pathname.startsWith(`${href}/`)
        );
    }

    return (
        <nav
            aria-label="Main navigation"
            className="
                fixed inset-x-3 bottom-3 z-40
                overflow-hidden
                rounded-[22px]
                border border-white/15
                bg-gradient-to-r from-[#0877D9] via-[#1491FF] to-[#0877D9]
                p-2
                pb-[max(8px,env(safe-area-inset-bottom))]
                shadow-[0_10px_35px_rgba(0,101,201,0.28)]
                md:hidden
            "
        >
            <div className="grid grid-cols-3 gap-1">

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
                                gap-1.5 rounded-[15px]
                                px-2 py-2.5
                                transition-all duration-200
                                active:scale-[0.96]
                                ${
                                    active
                                        ? "bg-white text-[#0877D9] shadow-[0_3px_12px_rgba(0,50,110,0.14)]"
                                        : "text-white/85 hover:bg-white/10 hover:text-white"
                                }
                            `}
                        >
                            <Icon
                                size={20}
                                strokeWidth={active ? 2.3 : 1.8}
                                className="transition-transform duration-200 group-hover:-translate-y-0.5"
                            />

                            <span
                                className={`
                                    truncate text-[10px]
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
                                    className="absolute -bottom-0.5 h-1 w-5 rounded-full bg-[#1491FF]"
                                />
                            )}
                        </Link>
                    );
                })}

            </div>
        </nav>
    );
}