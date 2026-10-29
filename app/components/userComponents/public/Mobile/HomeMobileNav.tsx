"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    CarFront,
    Heart,
    Home,
    MessageCircle,
    Search,
    UserRound,
} from "lucide-react";

const BRAND = "#1491FF";

const NAV_ITEMS = [
    {
        label: "Home",
        href: "/",
        icon: Home,
    },
    {
        label: "Explore",
        href: "/marketplace",
        icon: Search,
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

        return pathname === href || pathname.startsWith(`${href}/`);
    }

    return (
        <nav
            aria-label="Main navigation"
            className="
                fixed inset-x-3 bottom-3 z-40
                rounded-[22px] border border-[#E6EDF5]
                bg-white/95 p-2
                shadow-[0_8px_32px_rgba(15,23,42,0.10)]
                backdrop-blur-2xl
                pb-[max(8px,env(safe-area-inset-bottom))]
                md:hidden
            "
        >
            <div className="grid grid-cols-4">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            className={`
                                group flex min-w-0 flex-col
                                items-center justify-center gap-1.5
                                rounded-[15px] px-1 py-2.5
                                transition-all duration-200
                                active:scale-95
                                ${
                                    active
                                        ? "bg-[#EAF5FF] text-[#0877D9]"
                                        : "text-[#8491A3] hover:bg-slate-50 hover:text-slate-700"
                                }
                            `}
                        >
                            <Icon
                                size={19}
                                strokeWidth={active ? 2.2 : 1.7}
                            />

                            <span
                                className={`
                                    truncate text-[9px]
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
                                    className="absolute"
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}