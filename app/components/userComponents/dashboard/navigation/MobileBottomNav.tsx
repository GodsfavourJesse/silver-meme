"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    Bell,
    Bookmark,
    Building2,
    CarFront,
    ChevronRight,
    CircleHelp,
    CreditCard,
    House,
    LayoutGrid,
    MessageCircle,
    Settings,
    ShieldCheck,
    Store,
    X,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { useAuth } from "@/app/hooks/user/auth/useAuth";

interface NavigationItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

const BRAND = "#1491FF";
const BRAND_HOVER = "#0877D9";
const BRAND_LIGHT = "#EAF5FF";
const BRAND_BORDER = "#B9DEFF";

const primaryItems: NavigationItem[] = [
    {
        label: "Home",
        href: "/dashboard",
        icon: House,
    },
    {
        label: "Messages",
        href: "/dashboard/messages",
        icon: MessageCircle,
    },
    {
        label: "My listings",
        href: "/dashboard/my-listings",
        icon: CarFront,
    },
];

function isRouteActive(pathname: string, href: string): boolean {
    if (href === "/dashboard") {
        return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MobileBottomNav() {
    const pathname = usePathname();

    const { user } = useAuth();

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isDealer = user?.accountType === "DEALER";

    const secondaryItems = useMemo<NavigationItem[]>(
        () => [
            {
                label: "Saved vehicles",
                href: "/dashboard/saved-vehicles",
                icon: Bookmark,
            },
            {
                label: "Notifications",
                href: "/dashboard/notifications",
                icon: Bell,
            },
            {
                label: "Subscriptions",
                href: "/dashboard/subscriptions",
                icon: CreditCard,
            },
            ...(isDealer
                ? [
                      {
                          label: "Dealership dashboard",
                          href: "/dashboard/dealer",
                          icon: Building2,
                      },
                  ]
                : [
                      {
                          label: "Become a verified dealer",
                          href: "/dashboard/dealer",
                          icon: ShieldCheck,
                      },
                  ]),
            {
                label: "Account settings",
                href: "/dashboard/settings",
                icon: Settings,
            },
            {
                label: "Browse marketplace",
                href: "/marketplace",
                icon: Store,
            },
            {
                label: "Help & support",
                href: "/support",
                icon: CircleHelp,
            },
        ],
        [isDealer],
    );

    const isSecondaryActive = secondaryItems.some((item) =>
        isRouteActive(pathname, item.href),
    );

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!isMenuOpen) {
            return;
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsMenuOpen(false);
            }
        }

        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isMenuOpen]);

    return (
        <>
            {/* Backdrop */}
            <div
                aria-hidden="true"
                className={`
                    fixed inset-0 z-[90] bg-[#102A43]/15
                    backdrop-blur-[5px]
                    transition-opacity duration-300
                    xl:hidden
                    ${
                        isMenuOpen
                            ? "pointer-events-auto opacity-100"
                            : "pointer-events-none opacity-0"
                    }
                `}
            />

            <button
                type="button"
                aria-label="Close navigation menu"
                tabIndex={isMenuOpen ? 0 : -1}
                onClick={() => setIsMenuOpen(false)}
                className={`
                    fixed inset-0 z-[91] cursor-default xl:hidden
                    ${
                        isMenuOpen
                            ? "pointer-events-auto"
                            : "pointer-events-none"
                    }
                `}
            />

            {/* Expandable menu */}
            <section
                id="mobile-dashboard-menu"
                aria-label="Additional dashboard pages"
                aria-hidden={!isMenuOpen}
                className={`
                    fixed inset-x-4 bottom-[112px] z-[95]
                    mx-auto max-w-[380px]
                    overflow-hidden rounded-[28px]
                    border border-white/80
                    bg-white/90
                    shadow-[0_20px_70px_rgba(20,80,140,0.16)]
                    backdrop-blur-2xl
                    transition-all duration-300
                    ease-[cubic-bezier(0.22,1,0.36,1)]
                    xl:hidden
                    ${
                        isMenuOpen
                            ? "translate-y-0 scale-100 opacity-100"
                            : "pointer-events-none translate-y-4 scale-[0.97] opacity-0"
                    }
                `}
            >
                {/* Menu header */}
                <div className="relative overflow-hidden border-b border-[#E6F1FC] px-5 pb-5 pt-5">
                    <div
                        aria-hidden="true"
                        className="
                            pointer-events-none absolute -right-8 -top-12
                            h-32 w-32 rounded-full
                            bg-[#1491FF]/[0.10] blur-2xl
                        "
                    />

                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="
                                    flex h-11 w-11 items-center
                                    justify-center rounded-2xl
                                    text-white
                                    shadow-[0_7px_18px_rgba(20,145,255,0.24)]
                                "
                                style={{ backgroundColor: BRAND }}
                            >
                                {isDealer ? (
                                    <Building2 size={21} />
                                ) : (
                                    <LayoutGrid size={21} />
                                )}
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1491FF]">
                                    KARMASS
                                </p>

                                <h2 className="mt-0.5 text-base font-semibold tracking-tight text-[#1E293B]">
                                    {isDealer
                                        ? "Dealer account"
                                        : "Your account"}
                                </h2>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(false)}
                            aria-label="Close menu"
                            className="
                                flex h-10 w-10 items-center justify-center
                                rounded-full border border-[#E6EDF5]
                                bg-white/90 text-[#64748B]
                                transition-all duration-200
                                hover:bg-[#EAF5FF] hover:text-[#0877D9]
                                active:scale-95
                            "
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <p className="relative mt-4 text-xs leading-5 text-[#8491A3]">
                        {isDealer
                            ? "Manage your dealership and keep your vehicle business moving."
                            : "Everything you need to manage your automotive experience."}
                    </p>
                </div>

                {/* Menu links */}
                <nav className="max-h-[48vh] overflow-y-auto p-3">
                    {secondaryItems.map((item) => {
                        const Icon = item.icon;

                        const active = isRouteActive(
                            pathname,
                            item.href,
                        );

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                tabIndex={isMenuOpen ? 0 : -1}
                                aria-current={active ? "page" : undefined}
                                className={`
                                    group flex min-h-[50px]
                                    items-center gap-3 rounded-2xl
                                    px-3.5 py-3
                                    transition-all duration-200
                                    ${
                                        active
                                            ? "bg-[#EAF5FF] text-[#0877D9]"
                                            : "text-[#64748B] hover:bg-[#F5FAFF] hover:text-[#0877D9]"
                                    }
                                `}
                            >
                                <span
                                    className={`
                                        flex h-9 w-9 shrink-0
                                        items-center justify-center
                                        rounded-xl transition-colors
                                        ${
                                            active
                                                ? "bg-white text-[#1491FF] shadow-sm"
                                                : "bg-[#F0F7FF] text-[#849AB2] group-hover:bg-white group-hover:text-[#1491FF]"
                                        }
                                    `}
                                >
                                    <Icon size={18} />
                                </span>

                                <span className="min-w-0 flex-1 text-[13px] font-medium">
                                    {item.label}
                                </span>

                                <ChevronRight
                                    size={16}
                                    className={`
                                        transition-transform duration-200
                                        ${
                                            active
                                                ? "text-[#1491FF]"
                                                : "text-[#A1ADBC] group-hover:translate-x-0.5 group-hover:text-[#1491FF]"
                                        }
                                    `}
                                />
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t border-[#E6F1FC] px-5 py-3">
                    <p className="text-center text-[10px] font-medium tracking-wide text-[#94A3B8]">
                        {isDealer
                            ? "YOUR BUSINESS. YOUR KARMASS."
                            : "YOUR JOURNEY. YOUR KARMASS."}
                    </p>
                </div>
            </section>

            {/* Floating navigation */}
            <nav
                aria-label="Mobile dashboard navigation"
                className="
                    pointer-events-none fixed inset-x-0 bottom-0 z-[100]
                    px-4 pb-[max(12px,env(safe-area-inset-bottom))]
                    pt-3 xl:hidden
                "
            >
                <div
                    className="
                        pointer-events-auto relative isolate
                        mx-auto flex w-full max-w-[380px]
                        items-center justify-around gap-1
                        rounded-[28px]
                        border border-white/80
                        bg-white/75 px-2 py-2
                        shadow-[0_8px_35px_rgba(20,80,140,0.12),0_2px_8px_rgba(20,80,140,0.04)]
                        backdrop-blur-2xl
                        supports-[backdrop-filter]:bg-white/65
                    "
                >
                    {/* Subtle glass highlight */}
                    <div
                        aria-hidden="true"
                        className="
                            pointer-events-none absolute inset-x-5 top-0
                            h-px bg-gradient-to-r
                            from-transparent via-white to-transparent
                        "
                    />

                    {primaryItems.map((item) => {
                        const Icon = item.icon;

                        const active = isRouteActive(
                            pathname,
                            item.href,
                        );

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? "page" : undefined}
                                className={`
                                    group relative flex min-w-0
                                    flex-1 flex-col items-center
                                    justify-center gap-1
                                    rounded-[21px] px-1 py-2.5
                                    transition-all duration-300
                                    active:scale-[0.96]
                                    focus-visible:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-[#1491FF]
                                    focus-visible:ring-offset-2
                                    ${
                                        active
                                            ? "bg-[#1491FF] text-white shadow-[0_5px_16px_rgba(20,145,255,0.28)]"
                                            : "text-[#8491A3] hover:bg-[#EAF5FF] hover:text-[#0877D9]"
                                    }
                                `}
                            >
                                <Icon
                                    size={21}
                                    strokeWidth={active ? 2.2 : 1.8}
                                    className="
                                        transition-transform duration-300
                                        group-hover:-translate-y-0.5
                                    "
                                    aria-hidden="true"
                                />

                                <span
                                    className={`
                                        max-w-full truncate text-[10px]
                                        ${
                                            active
                                                ? "font-semibold"
                                                : "font-medium"
                                        }
                                    `}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}

                    {/* More menu */}
                    <button
                        type="button"
                        onClick={() =>
                            setIsMenuOpen((previous) => !previous)
                        }
                        aria-label={
                            isMenuOpen
                                ? "Close additional navigation"
                                : "Open additional navigation"
                        }
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-dashboard-menu"
                        className={`
                            group relative flex min-w-0 flex-1
                            flex-col items-center justify-center gap-1
                            rounded-[21px] px-1 py-2.5
                            transition-all duration-300
                            active:scale-[0.96]
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-[#1491FF]
                            focus-visible:ring-offset-2
                            ${
                                isMenuOpen || isSecondaryActive
                                    ? "bg-[#EAF5FF] text-[#0877D9]"
                                    : "text-[#8491A3] hover:bg-[#EAF5FF] hover:text-[#0877D9]"
                            }
                        `}
                    >
                        {isMenuOpen ? (
                            <X
                                size={21}
                                strokeWidth={2}
                                className="transition-transform duration-300"
                                aria-hidden="true"
                            />
                        ) : (
                            <LayoutGrid
                                size={21}
                                strokeWidth={isSecondaryActive ? 2.2 : 1.8}
                                className="transition-transform duration-300 group-hover:-translate-y-0.5"
                                aria-hidden="true"
                            />
                        )}

                        <span className="text-[10px] font-medium">
                            {isMenuOpen ? "Close" : "More"}
                        </span>
                    </button>
                </div>
            </nav>
        </>
    );
}