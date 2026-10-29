"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    ArrowUpRight,
    Bell,
    Bookmark,
    Building2,
    CarFront,
    ChevronRight,
    CircleHelp,
    CreditCard,
    LayoutDashboard,
    MessageCircle,
    Settings2,
    ShieldCheck,
    Store,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { useAuth } from "@/app/hooks/user/auth/useAuth";

interface NavigationItem {
    label: string;
    href: string;
    icon: LucideIcon;
    badge?: string;
}

interface NavigationGroup {
    label: string;
    items: NavigationItem[];
}

const BRAND = "#1491FF";
const BRAND_HOVER = "#0877D9";
const BRAND_LIGHT = "#EAF5FF";
const BRAND_BORDER = "#B9DEFF";

function isActiveRoute(pathname: string, href: string): boolean {
    if (href === "/dashboard") {
        return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);

}

export default function DashboardSidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    const isDealer = user?.accountType === "DEALER";

    const navigationGroups: NavigationGroup[] = [
        {
            label: "OVERVIEW",
            items: [
                {
                    label: "Dashboard",
                    href: "/dashboard",
                    icon: LayoutDashboard,
                },
                {
                    label: "Messages",
                    href: "/dashboard/messages",
                    icon: MessageCircle,
                },
                {
                    label: "Notifications",
                    href: "/notifications",
                    icon: Bell,
                },
            ],
        },
        {
            label: isDealer ? "DEALERSHIP & GARAGE" : "MY GARAGE",
            items: [
                ...(isDealer
                    ? [
                        {
                            label: "Dealership",
                            href: "/dashboard/dealer",
                            icon: Building2,
                        },
                    ]
                    : []),
                {
                    label: "My listings",
                    href: "/dashboard/my-listings",
                    icon: CarFront,
                },
                {
                    label: "Saved vehicles",
                    href: "/saved-vehicles",
                    icon: Bookmark,
                },
                {
                    label: "Marketplace",
                    href: "/marketplace",
                    icon: Store,
                },
            ],
        },
        {
            label: "ACCOUNT",
            items: [
                {
                    label: "Subscriptions",
                    href: "/subscriptions",
                    icon: CreditCard,
                },
                ...(isDealer
                    ? []
                    : [
                        {
                            label: "Become a dealer",
                            href: "/dealer-registration",
                            icon: ShieldCheck,
                        },
                    ]),
                {
                    label: "Settings",
                    href: "/settings",
                    icon: Settings2,
                },
            ],
        },
    ];

    return (
        <aside
            className="
                sticky top-0 hidden h-screen w-[272px] shrink-0
                flex-col border-r border-slate-100
                bg-white xl:flex
            "
        >
            {/* Brand */}
            <div className="px-7 pb-8 pt-8">
                <Link
                    href="/dashboard"
                    aria-label="KARMASS dashboard home"
                    className="group inline-flex items-center gap-3"
                >
                    <span
                        className="
                            flex h-11 w-11 items-center justify-center
                            rounded-2xl text-white
                            shadow-[0_8px_20px_rgba(20,145,255,0.22)]
                            transition-transform duration-300
                            group-hover:scale-[1.04]
                        "
                        style={{ backgroundColor: BRAND }}
                    >
                        <CarFront size={24} strokeWidth={1.9} />
                    </span>

                    <span className="flex flex-col">
                        <span className="text-[21px] font-extrabold tracking-[-0.07em] text-slate-900">
                            KARMASS
                        </span>

                        <span className="-mt-0.5 text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                            Automotive lifestyle
                        </span>
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav
                aria-label="Dashboard navigation"
                className="flex-1 space-y-8 overflow-y-auto px-4 pb-6"
            >
                {navigationGroups.map((group) => (
                    <section key={group.label}>
                        <h2 className="mb-3 px-3 text-[10px] font-bold tracking-[0.19em] text-slate-400">
                            {group.label}
                        </h2>

                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const Icon = item.icon;

                                const active = isActiveRoute(
                                    pathname,
                                    item.href,
                                );

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        aria-current={
                                            active ? "page" : undefined
                                        }
                                        className={`
                                            group relative flex min-h-[46px]
                                            items-center gap-3 rounded-xl
                                            px-3.5 py-3
                                            transition-all duration-200
                                            ${
                                                active
                                                    ? "bg-[#1491FF]/[0.09] text-[#0877D9]"
                                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                            }
                                        `}
                                    >
                                        {active && (
                                            <span
                                                aria-hidden="true"
                                                className="
                                                    absolute bottom-2 left-0 top-2
                                                    w-[3px] rounded-r-full
                                                    bg-[#1491FF]
                                                "
                                            />
                                        )}

                                        <Icon
                                            size={19}
                                            strokeWidth={active ? 2.2 : 1.8}
                                            className={`
                                                shrink-0 transition-transform
                                                duration-200
                                                ${
                                                    active
                                                        ? ""
                                                        : "group-hover:scale-105"
                                                }
                                            `}
                                            aria-hidden="true"
                                        />

                                        <span
                                            className={`
                                                min-w-0 flex-1 text-[13px]
                                                ${
                                                    active
                                                        ? "font-semibold"
                                                        : "font-medium"
                                                }
                                            `}
                                        >
                                            {item.label}
                                        </span>

                                        {active && (
                                            <ChevronRight
                                                size={15}
                                                className="text-[#1491FF]/70"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </nav>

            {/* Dealer card */}
            <div className="px-4 pb-4">
                <div
                    className="
                        relative overflow-hidden rounded-2xl
                        border border-[#B9DEFF]
                        bg-gradient-to-br from-[#EAF5FF]
                        via-white to-[#F3F9FF] p-4
                    "
                >
                    <div
                        aria-hidden="true"
                        className="
                            pointer-events-none absolute -right-8 -top-10
                            h-28 w-28 rounded-full
                            bg-[#1491FF]/[0.09] blur-2xl
                        "
                    />

                    <div className="relative">
                        <div
                            className="
                                mb-3 flex h-9 w-9 items-center justify-center
                                rounded-xl bg-white text-[#0877D9]
                                shadow-sm ring-1 ring-[#B9DEFF]
                            "
                        >
                            {isDealer ? (
                                <Building2 size={19} />
                            ) : (
                                <ShieldCheck size={19} />
                            )}
                        </div>

                        <h3 className="text-sm font-semibold text-slate-900">
                            {isDealer
                                ? "Your dealership"
                                : "Become a verified dealer"}
                        </h3>

                        <p className="mt-1.5 text-xs leading-5 text-slate-500">
                            {isDealer
                                ? "Your dealer account is active. Access your dealership and manage your vehicle business."
                                : "Apply for dealer access to unlock dealership features and build trust with automotive buyers."}
                        </p>

                        <Link
                            href={
                                isDealer
                                    ? "/dashboard/dealer"
                                    : "/dealer-registration"
                            }
                            className="
                                mt-4 inline-flex min-h-10 w-full
                                items-center justify-center gap-2
                                rounded-xl bg-[#1491FF] px-3
                                text-xs font-semibold text-white
                                shadow-[0_5px_14px_rgba(20,145,255,0.18)]
                                transition-all duration-200
                                hover:bg-[#0877D9]
                                hover:shadow-[0_7px_20px_rgba(20,145,255,0.24)]
                                active:scale-[0.98]
                            "
                        >
                            {isDealer
                                ? "Open dealership"
                                : "Apply for dealer access"}

                            <ArrowUpRight size={15} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Help */}
            <div className="border-t border-slate-100 px-4 py-3">
                <Link
                    href="/support"
                    className="
                        flex min-h-11 items-center gap-3 rounded-xl
                        px-3 text-sm font-medium text-slate-500
                        transition-colors hover:bg-[#EAF5FF]
                        hover:text-[#0877D9]
                    "
                >
                    <CircleHelp size={18} />

                    <span className="flex-1">Help & support</span>

                    <ChevronRight size={15} />
                </Link>
            </div>
        </aside>
    );

}
