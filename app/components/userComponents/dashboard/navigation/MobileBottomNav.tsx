"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "framer-motion";

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
    Rocket,
    Settings,
    ShieldCheck,
    Store,
    X,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { useAuth } from "@/app/hooks/user/auth/useAuth";
import { useDashboardLogout } from "@/app/hooks/user/auth/useDashboardLogout";
import MobileLogout from "./MobileLogout";

interface NavigationItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

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

const menuBackdropVariants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
    },
    exit: {
        opacity: 0,
    },
};

const menuVariants = {
    hidden: {
        opacity: 0,
        y: 24,
        scale: 0.96,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring" as const,
            stiffness: 340,
            damping: 28,
            staggerChildren: 0.035,
            delayChildren: 0.04,
        },
    },
    exit: {
        opacity: 0,
        y: 15,
        scale: 0.97,
        transition: {
            duration: 0.18,
            ease: "easeInOut" as const,
        },
    },
};

const menuItemVariants = {
    hidden: {
        opacity: 0,
        x: -10,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.2,
        },
    },
};

export default function MobileBottomNav() {
    const pathname = usePathname();

    const { user } = useAuth();

    const { handleLogout, isLoggingOut } = useDashboardLogout();

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const shouldReduceMotion = useReducedMotion();

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

            {
                          label: "Boost History",
                          href: "/dashboard/boost-history",
                          icon: Rocket,
                      },

            // Dealer-specific navigation.
            ...(isDealer
                ? [
                      {
                          label: "Dealership dashboard",
                          href: "/dashboard/dealer",
                          icon: Building2,
                      },
                    //   {
                    //       label: "Boost History",
                    //       href: "/dashboard/boost-history",
                    //       icon: Rocket,
                    //   },
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

    // Close the menu whenever the route changes.
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    // Handle Escape key.
    useEffect(() => {
        if (!isMenuOpen) return;

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

    // Prevent background scrolling while the menu is open.
    useEffect(() => {
        if (!isMenuOpen) return;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isMenuOpen]);

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <>
            {/* Menu backdrop */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            aria-hidden="true"
                            className="
                                fixed inset-0 z-[90]
                                bg-[#102A43]/15
                                backdrop-blur-[5px]
                                xl:hidden
                            "
                            variants={menuBackdropVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{
                                duration: shouldReduceMotion ? 0 : 0.25,
                            }}
                        />

                        <motion.button
                            type="button"
                            aria-label="Close navigation menu"
                            onClick={closeMenu}
                            className="
                                fixed inset-0 z-[91]
                                cursor-default xl:hidden
                            "
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                    </>
                )}
            </AnimatePresence>

            {/* Expandable menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.section
                        id="mobile-dashboard-menu"
                        aria-label="Additional dashboard pages"
                        aria-hidden={!isMenuOpen}
                        variants={menuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="
                            fixed inset-x-4 bottom-[112px] z-[95]
                            mx-auto max-w-[380px]
                            overflow-hidden rounded-[28px]
                            border border-white/80
                            bg-white/90
                            shadow-[0_20px_70px_rgba(20,80,140,0.16)]
                            backdrop-blur-2xl
                            xl:hidden
                        "
                    >
                        {/* Menu header */}
                        <div
                            className="
                                relative overflow-hidden
                                border-b border-[#E6F1FC]
                                px-5 pb-5 pt-5
                            "
                        >
                            <div
                                aria-hidden="true"
                                className="
                                    pointer-events-none absolute
                                    -right-8 -top-12
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
                                            bg-[#1491FF] text-white
                                            shadow-[0_7px_18px_rgba(20,145,255,0.24)]
                                        "
                                    >
                                        {isDealer ? (
                                            <Building2 size={21} />
                                        ) : (
                                            <LayoutGrid size={21} />
                                        )}
                                    </div>

                                    <div>
                                        <p
                                            className="
                                                text-[10px] font-bold
                                                uppercase tracking-[0.2em]
                                                text-[#1491FF]
                                            "
                                        >
                                            KARMASS
                                        </p>

                                        <h2
                                            className="
                                                mt-0.5 text-base
                                                font-semibold tracking-tight
                                                text-[#1E293B]
                                            "
                                        >
                                            {isDealer
                                                ? "Dealer account"
                                                : "Your account"}
                                        </h2>
                                    </div>
                                </div>

                                <motion.button
                                    type="button"
                                    onClick={closeMenu}
                                    aria-label="Close menu"
                                    whileTap={
                                        shouldReduceMotion
                                            ? undefined
                                            : { scale: 0.9 }
                                    }
                                    className="
                                        flex h-10 w-10 items-center
                                        justify-center rounded-full
                                        border border-[#E6EDF5]
                                        bg-white/90 text-[#64748B]
                                        transition-colors
                                        hover:bg-[#EAF5FF]
                                        hover:text-[#0877D9]
                                    "
                                >
                                    <X size={18} />
                                </motion.button>
                            </div>

                            <p
                                className="
                                    relative mt-4 text-xs
                                    leading-5 text-[#8491A3]
                                "
                            >
                                {isDealer
                                    ? "Manage your dealership and keep your vehicle business moving."
                                    : "Everything you need to manage your automotive experience."}
                            </p>
                        </div>

                        {/* Menu links */}
                        <nav className="max-h-[42vh] overflow-y-auto p-3">
                            {secondaryItems.map((item) => {
                                const Icon = item.icon;

                                const active = isRouteActive(
                                    pathname,
                                    item.href,
                                );

                                return (
                                    <motion.div
                                        key={item.href}
                                        variants={menuItemVariants}
                                    >
                                        <Link
                                            href={item.href}
                                            tabIndex={isMenuOpen ? 0 : -1}
                                            aria-current={
                                                active ? "page" : undefined
                                            }
                                            className={`
                                                group flex min-h-[50px]
                                                items-center gap-3
                                                rounded-2xl px-3.5 py-3
                                                transition-colors
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

                                            <span
                                                className="
                                                    min-w-0 flex-1
                                                    text-[13px] font-medium
                                                "
                                            >
                                                {item.label}
                                            </span>

                                            <ChevronRight
                                                size={16}
                                                className={`
                                                    transition-all
                                                    ${
                                                        active
                                                            ? "text-[#1491FF]"
                                                            : "text-[#A1ADBC] group-hover:translate-x-0.5 group-hover:text-[#1491FF]"
                                                    }
                                                `}
                                            />
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </nav>

                        {/* Shared logout component */}
                        <div className="border-t border-[#E6F1FC] px-3 pb-3 pt-3">
                            <MobileLogout
                                variant="menu"
                                onLogout={handleLogout}
                                isLoggingOut={isLoggingOut}
                            />

                            <p
                                className="
                                    mt-2 text-center text-[10px]
                                    font-medium tracking-wide
                                    text-[#94A3B8]
                                "
                            >
                                {isDealer
                                    ? "YOUR BUSINESS. YOUR KARMASS."
                                    : "YOUR JOURNEY. YOUR KARMASS."}
                            </p>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Floating navigation */}
            <nav
                aria-label="Mobile dashboard navigation"
                className="
                    pointer-events-none fixed inset-x-0 bottom-0
                    z-[100] px-4
                    pb-[max(12px,env(safe-area-inset-bottom))]
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
                    {/* Glass highlight */}
                    <div
                        aria-hidden="true"
                        className="
                            pointer-events-none absolute
                            inset-x-5 top-0 h-px
                            bg-gradient-to-r
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
                                    transition-colors
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
                                {active && (
                                    <motion.span
                                        layoutId="mobile-nav-active"
                                        className="
                                            absolute inset-0
                                            rounded-[21px]
                                            bg-[#1491FF]
                                            shadow-[0_5px_16px_rgba(20,145,255,0.28)]
                                        "
                                        transition={{
                                            type: "spring",
                                            stiffness: 380,
                                            damping: 30,
                                        }}
                                    />
                                )}

                                <motion.span
                                    whileTap={
                                        shouldReduceMotion
                                            ? undefined
                                            : { scale: 0.88 }
                                    }
                                    className="relative z-10"
                                >
                                    <Icon
                                        size={21}
                                        strokeWidth={active ? 2.2 : 1.8}
                                        aria-hidden="true"
                                    />
                                </motion.span>

                                <span
                                    className={`
                                        relative z-10 max-w-full
                                        truncate text-[10px]
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
                    <motion.button
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
                        whileTap={
                            shouldReduceMotion ? undefined : { scale: 0.94 }
                        }
                        className={`
                            group relative flex min-w-0 flex-1
                            flex-col items-center justify-center gap-1
                            rounded-[21px] px-1 py-2.5
                            transition-colors
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
                        <AnimatePresence mode="wait" initial={false}>
                            {isMenuOpen ? (
                                <motion.span
                                    key="close"
                                    initial={{ opacity: 0, rotate: -45 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: 45 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <X size={21} strokeWidth={2} />
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="more"
                                    initial={{ opacity: 0, rotate: 45 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: -45 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <LayoutGrid
                                        size={21}
                                        strokeWidth={
                                            isSecondaryActive ? 2.2 : 1.8
                                        }
                                    />
                                </motion.span>
                            )}
                        </AnimatePresence>

                        <span className="text-[10px] font-medium">
                            {isMenuOpen ? "Close" : "More"}
                        </span>
                    </motion.button>
                </div>
            </nav>
        </>
    );
}