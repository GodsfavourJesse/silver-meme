"use client";

import Link from "next/link";

import {
    ArrowRight,
    ArrowUpRight,
    Bell,
    Bookmark,
    Building2,
    CarFront,
    ChevronRight,
    CircleHelp,
    CreditCard,
    LogOut,
    MessageCircle,
    Plus,
    Search,
    Settings2,
    ShieldCheck,
    Sparkles,
    Store,
    type LucideIcon,
} from "lucide-react";
import { CurrentYear } from "@/app/utils/current-year";

interface DashboardUser {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
}

interface DashboardMobileProps {
    user: DashboardUser;
    onLogout: () => void;
    isLoggingOut: boolean;
}

interface MobileAction {
    label: string;
    href: string;
    icon: LucideIcon;
    tone: string;
}

const BRAND = "#1491FF";
const BRAND_HOVER = "#0877D9";
const BRAND_LIGHT = "#EAF5FF";
const BRAND_BORDER = "#B9DEFF";

const mobileActions: MobileAction[] = [
    {
        label: "My listings",
        href: "/dashboard/my-listings",
        icon: CarFront,
        tone: "bg-[#EAF5FF] text-[#1491FF]",
    },
    {
        label: "Dealership",
        href: "/dashboard/dealer",
        icon: Building2,
        tone: "bg-[#EAF5FF] text-[#1491FF]",
    },
    {
        label: "Saved cars",
        href: "/saved-vehicles",
        icon: Bookmark,
        tone: "bg-[#EDF7FF] text-[#0877D9]",
    },
    {
        label: "Messages",
        href: "/dashboard/messages",
        icon: MessageCircle,
        tone: "bg-[#EAF5FF] text-[#0877D9]",
    },
    {
        label: "Subscriptions",
        href: "/subscriptions",
        icon: CreditCard,
        tone: "bg-[#EAF5FF] text-[#1491FF]",
    },
];

function MobileSectionHeading({
    title,
    subtitle,
    href,
    actionLabel,
}: {
    title: string;
    subtitle?: string;
    href?: string;
    actionLabel?: string;
}) {
    return (
        <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
                <h2 className="text-[17px] font-bold tracking-[-0.04em] text-[#1E293B]">
                    {title}
                </h2>

                {subtitle && (
                    <p className="mt-1 text-xs leading-5 text-[#8491A3]">
                        {subtitle}
                    </p>
                )}
            </div>

            {href && actionLabel && (
                <Link
                    href={href}
                    className="
                        inline-flex min-h-9 shrink-0
                        items-center gap-1 rounded-lg
                        px-2 text-[11px] font-semibold
                        text-[#1491FF] transition
                        hover:text-[#0877D9]
                        active:scale-[0.97]
                    "
                >
                    {actionLabel}
                    <ChevronRight size={14} />
                </Link>
            )}
        </div>
    );
}

function MobileHeader({
    user,
}: {
    user: DashboardUser;
}) {
    const firstName = user.firstName?.trim();
    const initial = firstName?.charAt(0).toUpperCase() || "K";

    return (
        <header
            className="
                flex items-center justify-between gap-3
                px-5 pb-5 pt-[max(16px,env(safe-area-inset-top))]
            "
        >
            {/* KARMASS brand */}
            <Link
                href="/dashboard"
                aria-label="KARMASS dashboard"
                className="group flex min-w-0 items-center gap-3"
            >
                {/* Minimalist monogram */}
                <span
                    className="
                        flex h-9 w-9 shrink-0 items-center
                        justify-center border border-[#E6EDF5]
                        bg-white text-[15px] font-semibold
                        tracking-[-0.08em] text-[#1491FF]
                        transition-colors duration-200
                        group-hover:border-[#1491FF]
                    "
                >
                    K.
                </span>

                {/* Wordmark and tagline */}
                <span className="min-w-0">
                    <span
                        className="
                            block text-[15px] font-semibold
                            leading-5 tracking-[0.16em]
                            text-[#20201F]
                        "
                    >
                        KARMASS
                    </span>

                    <span
                        className="
                            mt-0.5 block text-[8px] font-medium
                            uppercase tracking-[0.16em]
                            text-[#85838A]
                        "
                    >
                        Find your drive
                    </span>
                </span>
            </Link>

            {/* Header actions */}
            <div className="flex shrink-0 items-center gap-2">
                <Link
                    href="/dashboard/notifications"
                    aria-label="Notifications"
                    className="
                        flex h-9 w-9 items-center justify-center
                        border border-[#E6EDF5] bg-white
                        text-[#52505A]
                        transition-all duration-200
                        hover:border-[#1491FF]
                        hover:text-[#1491FF]
                        active:scale-95
                    "
                >
                    <Bell size={17} strokeWidth={1.7} />
                </Link>

                <Link
                    href="/dashoard/settings"
                    aria-label="Your account settings"
                    className="
                        flex h-9 w-9 items-center justify-center
                        border border-[#B9DEFF]
                        bg-[#EAF5FF]
                        text-[12px] font-semibold
                        text-[#1491FF]
                        transition-all duration-200
                        hover:border-[#1491FF]
                        active:scale-95
                    "
                >
                    {initial}
                </Link>
            </div>
        </header>
    );
}

function MobileWelcome({
    user,
}: {
    user: DashboardUser;
}) {
    const firstName = user.firstName?.trim();

    return (
        <section className="px-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.19em] text-[#0877D9]">
                YOUR PERSONAL GARAGE
            </p>

            <h1 className="mt-2 text-[27px] font-bold leading-[1.15] tracking-[-0.055em] text-[#1E293B]">
                Hello{firstName ? `, ${firstName}` : ""}{" "}
                <span aria-hidden="true">👋</span>
            </h1>

            <p className="mt-2 text-[13px] leading-6 text-[#8491A3]">
                Your automotive journey starts here.
            </p>
        </section>
    );
}

function MobileMarketplaceCard() {
    return (
        <section className="px-5">
            <div
                className="
                    relative isolate overflow-hidden
                    rounded-[26px]
                    bg-gradient-to-br
                    from-[#1491FF] via-[#087FE8] to-[#075BB5]
                    p-5 text-white
                    shadow-[0_14px_34px_rgba(20,145,255,0.20)]
                "
            >
                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none absolute -right-12 -top-14
                        -z-10 h-44 w-44 rounded-full
                        border border-white/[0.15]
                    "
                />

                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none absolute -right-2 -top-4
                        -z-10 h-28 w-28 rounded-full
                        border border-white/[0.15]
                    "
                />

                <div className="relative">
                    <span
                        className="
                            inline-flex items-center gap-1.5
                            rounded-full border border-white/20
                            bg-white/10 px-2.5 py-1.5
                            text-[9px] font-semibold uppercase
                            tracking-[0.12em] text-white/90
                        "
                    >
                        <Sparkles size={12} />
                        Discover your next drive
                    </span>

                    <h2 className="mt-4 max-w-[260px] text-[23px] font-semibold leading-[1.2] tracking-[-0.045em]">
                        Find a car that feels like yours.
                    </h2>

                    <p className="mt-2 max-w-[250px] text-xs leading-5 text-white/80">
                        Explore vehicles and connect with sellers
                        on KARMASS.
                    </p>

                    <Link
                        href="/marketplace"
                        className="
                            group mt-5 inline-flex min-h-11
                            items-center justify-center gap-2
                            rounded-xl bg-white px-4
                            text-xs font-bold text-[#0877D9]
                            transition
                            hover:bg-[#F0F8FF]
                            active:scale-[0.97]
                        "
                    >
                        <Search size={15} />
                        Explore marketplace

                        <ArrowRight
                            size={15}
                            className="transition-transform group-hover:translate-x-0.5"
                        />
                    </Link>
                </div>

                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none absolute bottom-5 right-4
                        hidden opacity-20 sm:block
                    "
                >
                    <CarFront size={86} strokeWidth={1} />
                </div>
            </div>
        </section>
    );
}

function MobileActionGrid() {
    return (
        <section className="px-5">
            <MobileSectionHeading
                title="Your shortcuts"
                subtitle="Everything you need, close at hand."
            />

            <div className="mt-4 grid grid-cols-2 gap-3">
                {mobileActions.map((action) => {
                    const Icon = action.icon;

                    return (
                        <Link
                            key={action.href}
                            href={action.href}
                            className="
                                group flex min-h-[112px]
                                flex-col justify-between
                                rounded-[21px]
                                border border-[#E6EDF5]
                                bg-white p-4
                                shadow-[0_3px_12px_rgba(30,41,59,0.025)]
                                transition-all duration-200
                                hover:border-[#B9DEFF]
                                hover:shadow-[0_8px_24px_rgba(20,145,255,0.07)]
                                active:scale-[0.97]
                            "
                        >
                            <div className="flex items-start justify-between gap-2">
                                <span
                                    className={`
                                        flex h-10 w-10 items-center
                                        justify-center rounded-[14px]
                                        ${action.tone}
                                    `}
                                >
                                    <Icon size={20} strokeWidth={1.8} />
                                </span>

                                <ArrowUpRight
                                    size={15}
                                    className="
                                        mt-1 text-[#A1ADBC]
                                        transition-colors
                                        group-hover:text-[#1491FF]
                                    "
                                />
                            </div>

                            <span className="mt-4 text-[12px] font-semibold text-[#334155] transition-colors group-hover:text-[#1491FF]">
                                {action.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

function MobileSellCard() {
    return (
        <section className="space-y-3 px-5">
            <div className="flex items-center gap-3.5 rounded-[22px] border border-[#D9ECFF] bg-gradient-to-r from-white to-[#EAF5FF] p-4">
                <div
                    className="
                        flex h-12 w-12 shrink-0 items-center
                        justify-center rounded-[16px]
                        bg-white text-[#1491FF]
                        shadow-sm ring-1 ring-[#B9DEFF]
                    "
                >
                    <Plus size={23} />
                </div>

                <div className="min-w-0 flex-1">
                    <h2 className="text-[13px] font-bold text-[#263449]">
                        Ready to sell?
                    </h2>

                    <p className="mt-1 text-[11px] leading-5 text-[#8491A3]">
                        Create and manage your vehicle listings.
                    </p>

                    <Link
                        href="/dashboard/my-listings"
                        className="
                            mt-2 inline-flex min-h-8
                            items-center gap-1
                            text-[11px] font-bold text-[#1491FF]
                            transition hover:text-[#0877D9]
                        "
                    >
                        Manage my listings
                        <ArrowRight size={13} />
                    </Link>
                </div>

                <CarFront
                    size={26}
                    className="shrink-0 text-[#79BFFF]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                />
            </div>

            <Link
                href="/dashboard/dealer"
                className="
                    group flex items-center gap-3.5
                    rounded-[22px] border border-[#E6EDF5]
                    bg-white p-4
                    transition-all duration-200
                    hover:border-[#B9DEFF]
                    hover:bg-[#FBFDFF]
                    active:scale-[0.98]
                "
            >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#EAF5FF] text-[#1491FF]">
                    <Building2 size={22} />
                </div>

                <div className="min-w-0 flex-1">
                    <h2 className="text-[13px] font-bold text-[#263449]">
                        Explore dealership
                    </h2>

                    <p className="mt-1 text-[11px] leading-5 text-[#8491A3]">
                        Apply for dealer access and grow your presence.
                    </p>
                </div>

                <ArrowUpRight
                    size={18}
                    className="
                        shrink-0 text-[#A1ADBC]
                        transition-all duration-200
                        group-hover:-translate-y-0.5
                        group-hover:translate-x-0.5
                        group-hover:text-[#1491FF]
                    "
                />
            </Link>
        </section>
    );
}

function MobileAccountLinks({
    onLogout,
    isLoggingOut,
}: {
    onLogout: () => void;
    isLoggingOut: boolean;
}) {
    const links = [
        {
            label: "Account settings",
            description: "Your profile and preferences",
            href: "/settings",
            icon: Settings2,
        },
        {
            label: "Become a dealer",
            description: "Explore dealer access",
            href: "/dealer-registration",
            icon: ShieldCheck,
        },
        {
            label: "Help & support",
            description: "We're here to help",
            href: "/support",
            icon: CircleHelp,
        },
        {
            label: "Browse marketplace",
            description: "Explore available vehicles",
            href: "/marketplace",
            icon: Store,
        },
    ];

    return (
        <section className="px-5">
            <MobileSectionHeading
                title="Your account"
                subtitle="Personal details and support."
            />

            <div className="mt-4 overflow-hidden rounded-[22px] border border-[#E6EDF5] bg-white">
                {links.map((item, index) => {
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                group flex min-h-[68px] items-center
                                gap-3 px-4 py-3
                                transition
                                active:bg-[#F0F8FF]
                                ${
                                    index !== links.length - 1
                                        ? "border-b border-[#EDF2F7]"
                                        : ""
                                }
                            `}
                        >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#EAF5FF] text-[#1491FF]">
                                <Icon size={18} strokeWidth={1.8} />
                            </span>

                            <span className="min-w-0 flex-1">
                                <span className="block text-xs font-semibold text-[#334155] transition-colors group-hover:text-[#1491FF]">
                                    {item.label}
                                </span>

                                <span className="mt-1 block text-[10px] leading-4 text-[#8995A6]">
                                    {item.description}
                                </span>
                            </span>

                            <ChevronRight
                                size={17}
                                className="
                                    shrink-0 text-[#A1ADBC]
                                    transition-colors
                                    group-hover:text-[#1491FF]
                                "
                            />
                        </Link>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={onLogout}
                disabled={isLoggingOut}
                className="
                    mt-4 flex min-h-12 w-full items-center
                    justify-center gap-2 rounded-[16px]
                    border border-[#F0DFE3] bg-white
                    text-xs font-semibold text-[#AD4559]
                    transition active:scale-[0.98]
                    disabled:cursor-not-allowed disabled:opacity-50
                "
            >
                <LogOut size={16} />
                {isLoggingOut ? "Signing out..." : "Sign out"}
            </button>
        </section>
    );
}

export default function DashboardMobile(
    props: DashboardMobileProps,
) {
    return (
        <div className="min-h-screen overflow-x-hidden bg-[#F7FAFE] text-[#263449]">
            <MobileHeader user={props.user} />

            <main className="space-y-7 pb-8">
                <MobileWelcome user={props.user} />

                <MobileMarketplaceCard />

                <MobileActionGrid />

                <MobileSellCard />

                <MobileAccountLinks
                    onLogout={props.onLogout}
                    isLoggingOut={props.isLoggingOut}
                />

                <footer className="px-5 pt-1 text-center">
                    <p className="text-[10px] font-medium tracking-wide text-[#9AA6B5]">
                        © <CurrentYear /> KARMASS
                    </p>

                    <p className="mt-1 text-[9px] text-[#A1ADBC]">
                        Discover. Connect. Drive.
                    </p>
                </footer>
            </main>
        </div>
    );
}