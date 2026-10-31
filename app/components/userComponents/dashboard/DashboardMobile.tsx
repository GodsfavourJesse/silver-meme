"use client";

import Link from "next/link";

import {
    ArrowRight,
    ArrowUpRight,
    Bell,
    Bookmark,
    Building2,
    CarFront,
    CheckCircle2,
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
    TrendingUp,
    type LucideIcon,
} from "lucide-react";

import { CurrentYear } from "@/app/utils/current-year";

interface DashboardUser {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    accountType?: string | null;
}

interface DashboardMobileProps {
    user: DashboardUser;
    onLogout: () => void;
    isLoggingOut: boolean;
}

interface MobileAction {
    label: string;
    description: string;
    href: string;
    icon: LucideIcon;
}

const BRAND = "#1491FF";
const BRAND_HOVER = "#0877D9";
const BRAND_LIGHT = "#EAF5FF";
const BRAND_BORDER = "#B9DEFF";

function isDealerAccount(accountType?: string | null): boolean {
    return accountType === "DEALER";
}

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
                <h2 className="text-[17px] font-bold tracking-[-0.04em] text-slate-900">
                    {title}
                </h2>

                {subtitle && (
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        {subtitle}
                    </p>
                )}
            </div>

            {href && actionLabel && (
                <Link
                    href={href}
                    className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold text-[#1491FF] transition hover:text-[#0877D9] active:scale-[0.97]"
                >
                    {actionLabel}
                    <ChevronRight size={14} />
                </Link>
            )}
        </div>
    );
}

/* =========================================================
   HEADER
========================================================= */

function MobileHeader({
    user,
    isDealer,
}: {
    user: DashboardUser;
    isDealer: boolean;
}) {
    const firstName = user.firstName?.trim();
    const initials = [
        user.firstName?.trim().charAt(0),
        user.lastName?.trim().charAt(0),
    ]
        .filter(Boolean)
        .join("")
        .toUpperCase() || "K";

    return (
        <header className="flex items-center justify-between gap-3 px-5 pb-5 pt-[max(16px,env(safe-area-inset-top))]">
            <Link
                href="/dashboard"
                aria-label="KARMASS dashboard"
                className="group flex min-w-0 items-center gap-3"
            >
                <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] text-white shadow-[0_5px_14px_rgba(20,145,255,0.2)]"
                    style={{ backgroundColor: BRAND }}
                >
                    {isDealer ? (
                        <Building2 size={21} />
                    ) : (
                        <CarFront size={22} />
                    )}
                </span>

                <span className="min-w-0">
                    <span className="block text-[15px] font-extrabold tracking-[0.08em] text-slate-900">
                        KAR
                        <span style={{ color: BRAND }}>MASS</span>
                    </span>

                    <span className="mt-0.5 block text-[8px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        {isDealer
                            ? "Your dealership space"
                            : "Your automotive space"}
                    </span>
                </span>
            </Link>

            <div className="flex shrink-0 items-center gap-2">
                <Link
                    href="/dashboard/notifications"
                    aria-label="Notifications"
                    className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-[#B9DEFF] hover:text-[#1491FF] active:scale-95"
                >
                    <Bell size={18} strokeWidth={1.8} />
                </Link>

                <Link
                    href="/dashboard/settings"
                    aria-label="Account settings"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#B9DEFF] bg-[#EAF5FF] text-[12px] font-bold text-[#0877D9] transition active:scale-95"
                >
                    {initials}
                </Link>
            </div>
        </header>
    );
}

/* =========================================================
   WELCOME
========================================================= */

function MobileWelcome({
    user,
    isDealer,
}: {
    user: DashboardUser;
    isDealer: boolean;
}) {
    const firstName = user.firstName?.trim();

    return (
        <section className="px-5">
            <div className="flex items-center gap-2">
                <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: BRAND }}
                />

                <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#0877D9]">
                    {isDealer
                        ? "DEALERSHIP OVERVIEW"
                        : "YOUR PERSONAL GARAGE"}
                </p>
            </div>

            <h1 className="mt-2 text-[27px] font-bold leading-[1.15] tracking-[-0.055em] text-slate-900">
                {isDealer ? "Welcome back" : "Hello"}
                {firstName ? `, ${firstName}` : ""}

                <span style={{ color: BRAND }}>.</span>
            </h1>

            <p className="mt-2 max-w-[330px] text-[12px] leading-6 text-slate-500">
                {isDealer
                    ? "Your dealership, your inventory, and your business tools. Everything starts here."
                    : "Discover vehicles, connect with sellers, and make your next automotive move."}
            </p>

            {isDealer && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5">
                    <CheckCircle2
                        size={13}
                        className="text-emerald-600"
                    />

                    <span className="text-[10px] font-semibold text-emerald-700">
                        Dealer account
                    </span>
                </div>
            )}
        </section>
    );
}

/* =========================================================
   USER HERO
========================================================= */

function UserMarketplaceCard() {
    return (
        <section className="px-5">
            <div className="relative isolate overflow-hidden rounded-[25px] bg-gradient-to-br from-[#1491FF] via-[#087FE8] to-[#075BB5] p-5 text-white shadow-[0_14px_34px_rgba(20,145,255,0.20)]">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-12 -top-14 -z-10 h-48 w-48 rounded-full border border-white/[0.15]"
                />

                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-3 -top-5 -z-10 h-32 w-32 rounded-full border border-white/[0.15]"
                />

                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-20 left-[35%] -z-10 h-40 w-40 rounded-full bg-white/[0.08] blur-3xl"
                />

                <div className="relative">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/90">
                        <Sparkles size={12} />
                        Discover your next drive
                    </span>

                    <h2 className="mt-4 max-w-[255px] text-[24px] font-bold leading-[1.2] tracking-[-0.05em]">
                        Find a car that feels like yours.
                    </h2>

                    <p className="mt-2 max-w-[245px] text-[11px] leading-5 text-white/80">
                        Explore vehicles and connect with trusted sellers
                        on KARMASS.
                    </p>

                    <Link
                        href="/marketplace"
                        className="group mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-[#0877D9] shadow-sm transition hover:bg-blue-50 active:scale-[0.97]"
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
                    className="pointer-events-none absolute bottom-5 right-4 hidden opacity-20 sm:block"
                >
                    <CarFront size={90} strokeWidth={1} />
                </div>
            </div>
        </section>
    );
}

/* =========================================================
   DEALER HERO
========================================================= */

function DealerWelcomeCard() {
    return (
        <section className="px-5">
            <div className="relative isolate overflow-hidden rounded-[25px] bg-gradient-to-br from-[#087FE8] via-[#0877D9] to-[#064C9B] p-5 text-white shadow-[0_14px_34px_rgba(20,145,255,0.20)]">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-14 -top-16 -z-10 h-52 w-52 rounded-full border border-white/[0.14]"
                />

                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-4 -top-5 -z-10 h-36 w-36 rounded-full border border-white/[0.14]"
                />

                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-20 left-[35%] -z-10 h-44 w-44 rounded-full bg-white/[0.08] blur-3xl"
                />

                <div className="relative">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/90">
                        <Building2 size={12} />
                        Your business starts here
                    </span>

                    <h2 className="mt-4 max-w-[270px] text-[25px] font-bold leading-[1.18] tracking-[-0.05em]">
                        Your dealership.
                        <br />
                        Your next big sale.
                    </h2>

                    <p className="mt-2 max-w-[255px] text-[11px] leading-5 text-white/80">
                        Showcase your inventory, manage your listings,
                        and connect with buyers.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2.5">
                        <Link
                            href="/dashboard/dealer"
                            className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-[#0877D9] transition hover:bg-blue-50 active:scale-[0.97]"
                        >
                            <Store size={15} />
                            Open dealership

                            <ArrowUpRight
                                size={15}
                                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                        </Link>

                        <Link
                            href="/dashboard/my-listings"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-3.5 text-xs font-semibold text-white transition hover:bg-white/20 active:scale-[0.97]"
                        >
                            <CarFront size={15} />
                            Inventory
                        </Link>
                    </div>
                </div>

                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-5 right-4 hidden opacity-20 sm:block"
                >
                    <Building2 size={90} strokeWidth={1} />
                </div>
            </div>
        </section>
    );
}

/* =========================================================
   QUICK ACTIONS
========================================================= */

function MobileActionGrid({
    isDealer,
}: {
    isDealer: boolean;
}) {
    const actions: MobileAction[] = isDealer
        ? [
              {
                  label: "My inventory",
                  description: "Manage vehicle listings",
                  href: "/dashboard/my-listings",
                  icon: CarFront,
              },
              {
                  label: "Dealership",
                  description: "Business overview",
                  href: "/dashboard/dealer",
                  icon: Building2,
              },
              {
                  label: "Messages",
                  description: "Talk to potential buyers",
                  href: "/dashboard/messages",
                  icon: MessageCircle,
              },
              {
                  label: "Notifications",
                  description: "Stay up to date",
                  href: "/dashboard/notifications",
                  icon: Bell,
              },
              {
                  label: "Subscriptions",
                  description: "Plans and billing",
                  href: "/subscriptions",
                  icon: CreditCard,
              },
              {
                  label: "Marketplace",
                  description: "Explore other vehicles",
                  href: "/marketplace",
                  icon: Search,
              },
          ]
        : [
              {
                  label: "Explore cars",
                  description: "Find your next vehicle",
                  href: "/marketplace",
                  icon: Search,
              },
              {
                  label: "Saved cars",
                  description: "Your favourite vehicles",
                  href: "/saved-vehicles",
                  icon: Bookmark,
              },
              {
                  label: "Messages",
                  description: "Your conversations",
                  href: "/dashboard/messages",
                  icon: MessageCircle,
              },
              {
                  label: "My listings",
                  description: "Manage your advertisements",
                  href: "/dashboard/my-listings",
                  icon: CarFront,
              },
              {
                  label: "Subscriptions",
                  description: "Plans and billing",
                  href: "/subscriptions",
                  icon: CreditCard,
              },
              {
                  label: "Notifications",
                  description: "Your latest updates",
                  href: "/dashboard/notifications",
                  icon: Bell,
              },
          ];

    return (
        <section className="px-5">
            <MobileSectionHeading
                title={isDealer ? "Business shortcuts" : "Your shortcuts"}
                subtitle={
                    isDealer
                        ? "Everything you need to run your dealership."
                        : "Everything you need, close at hand."
                }
                href={
                    isDealer
                        ? "/dashboard/dealer"
                        : "/marketplace"
                }
                actionLabel={isDealer ? "Dealership" : "Explore"}
            />

            <div className="mt-4 grid grid-cols-2 gap-3">
                {actions.map((action) => {
                    const Icon = action.icon;

                    return (
                        <Link
                            key={action.href + action.label}
                            href={action.href}
                            className="group flex min-h-[116px] flex-col justify-between rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-[0_3px_12px_rgba(30,41,59,0.025)] transition-all duration-200 hover:border-[#B9DEFF] hover:shadow-[0_8px_24px_rgba(20,145,255,0.07)] active:scale-[0.97]"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <span
                                    className="flex h-10 w-10 items-center justify-center rounded-[14px]"
                                    style={{
                                        backgroundColor: BRAND_LIGHT,
                                        color: BRAND_HOVER,
                                    }}
                                >
                                    <Icon
                                        size={20}
                                        strokeWidth={1.8}
                                    />
                                </span>

                                <ArrowUpRight
                                    size={15}
                                    className="mt-1 text-slate-300 transition-colors group-hover:text-[#1491FF]"
                                />
                            </div>

                            <div className="mt-4">
                                <span className="block text-[12px] font-bold text-slate-700 transition-colors group-hover:text-[#1491FF]">
                                    {action.label}
                                </span>

                                <span className="mt-1 block text-[10px] leading-4 text-slate-400">
                                    {action.description}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

/* =========================================================
   USER SELL / DEALER INVENTORY CALLOUT
========================================================= */

function UserSellCard() {
    return (
        <section className="space-y-3 px-5">
            <div className="relative flex items-center gap-3.5 overflow-hidden rounded-[22px] border border-[#D9ECFF] bg-gradient-to-r from-white to-[#EAF5FF] p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-white text-[#1491FF] shadow-sm ring-1 ring-[#B9DEFF]">
                    <Plus size={23} />
                </div>

                <div className="min-w-0 flex-1">
                    <h2 className="text-[13px] font-bold text-slate-800">
                        Have a car to sell?
                    </h2>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        Reach buyers by listing your vehicle.
                    </p>

                    <Link
                        href="/dashboard/my-listings"
                        className="mt-2 inline-flex min-h-8 items-center gap-1 text-[11px] font-bold text-[#1491FF] transition hover:text-[#0877D9]"
                    >
                        Create a listing
                        <ArrowRight size={13} />
                    </Link>
                </div>

                <CarFront
                    size={27}
                    className="shrink-0 text-[#79BFFF]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                />
            </div>

            <Link
                href="/dealer-registration"
                className="group flex items-center gap-3.5 rounded-[22px] border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-[#B9DEFF] hover:bg-[#FBFDFF] active:scale-[0.98]"
            >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#EAF5FF] text-[#1491FF]">
                    <Building2 size={22} />
                </div>

                <div className="min-w-0 flex-1">
                    <h2 className="text-[13px] font-bold text-slate-800">
                        Grow your business
                    </h2>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        Become a KARMASS dealer and reach more buyers.
                    </p>
                </div>

                <ArrowUpRight
                    size={18}
                    className="shrink-0 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#1491FF]"
                />
            </Link>
        </section>
    );
}

function DealerInventoryCard() {
    return (
        <section className="px-5">
            <div className="relative overflow-hidden rounded-[22px] border border-[#B9DEFF] bg-gradient-to-br from-[#EAF5FF] via-white to-[#F5FAFF] p-4">
                <div className="flex items-start gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-white text-[#0877D9] shadow-sm ring-1 ring-[#B9DEFF]">
                        <CarFront size={23} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-[13px] font-bold text-slate-800">
                                Keep your inventory moving
                            </h2>

                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-blue-700">
                                Dealer tools
                            </span>
                        </div>

                        <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
                            Review your listings, update vehicle details,
                            and keep your dealership active.
                        </p>

                        <Link
                            href="/dashboard/my-listings"
                            className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-xl bg-[#1491FF] px-3.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-[#0877D9] active:scale-[0.97]"
                        >
                            Manage inventory
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* =========================================================
   ACCOUNT LINKS
========================================================= */

function MobileAccountLinks({
    isDealer,
    onLogout,
    isLoggingOut,
}: {
    isDealer: boolean;
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
            label: "Subscriptions",
            description: "Your plans and billing",
            href: "/subscriptions",
            icon: CreditCard,
        },
        {
            label: "Help & support",
            description: "We're here to help",
            href: "/support",
            icon: CircleHelp,
        },
        ...(isDealer
            ? [
                  {
                      label: "Browse marketplace",
                      description: "Explore available vehicles",
                      href: "/marketplace",
                      icon: Store,
                  },
              ]
            : [
                  {
                      label: "Become a dealer",
                      description: "Explore dealer access",
                      href: "/dealer-registration",
                      icon: ShieldCheck,
                  },
              ]),
    ];

    return (
        <section className="px-5">
            <MobileSectionHeading
                title="Account & support"
                subtitle="Your personal details and account tools."
            />

            <div className="mt-4 overflow-hidden rounded-[22px] border border-slate-200 bg-white">
                {links.map((item, index) => {
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`group flex min-h-[68px] items-center gap-3 px-4 py-3 transition active:bg-[#F0F8FF] ${
                                index !== links.length - 1
                                    ? "border-b border-slate-100"
                                    : ""
                            }`}
                        >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#EAF5FF] text-[#1491FF]">
                                <Icon size={18} strokeWidth={1.8} />
                            </span>

                            <span className="min-w-0 flex-1">
                                <span className="block text-xs font-semibold text-slate-700 transition-colors group-hover:text-[#1491FF]">
                                    {item.label}
                                </span>

                                <span className="mt-1 block text-[10px] leading-4 text-slate-400">
                                    {item.description}
                                </span>
                            </span>

                            <ChevronRight
                                size={17}
                                className="shrink-0 text-slate-300 transition-colors group-hover:text-[#1491FF]"
                            />
                        </Link>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={onLogout}
                disabled={isLoggingOut}
                className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-[16px] border border-rose-100 bg-white text-xs font-semibold text-rose-600 transition hover:bg-rose-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
                <LogOut size={16} />
                {isLoggingOut ? "Signing out..." : "Sign out"}
            </button>
        </section>
    );
}

/* =========================================================
   FOOTER
========================================================= */

function MobileFooter() {
    return (
        <footer className="px-5 pt-1 text-center">
            <div className="mx-auto mb-3 h-px w-12 bg-slate-200" />

            <p className="text-[10px] font-medium tracking-wide text-slate-400">
                © <CurrentYear /> KARMASS. All rights reserved.
            </p>

            <p className="mt-1 text-[9px] text-slate-400">
                Discover. Connect. Drive.
            </p>
        </footer>
    );
}

/* =========================================================
   MAIN MOBILE DASHBOARD
========================================================= */

export default function DashboardMobile(
    props: DashboardMobileProps,
) {
    const isDealer = isDealerAccount(
        props.user.accountType,
    );

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#F7FAFE] text-slate-800">
            <MobileHeader
                user={props.user}
                isDealer={isDealer}
            />

            <main className="space-y-7 pb-8">
                <MobileWelcome
                    user={props.user}
                    isDealer={isDealer}
                />

                {isDealer ? (
                    <DealerWelcomeCard />
                ) : (
                    <UserMarketplaceCard />
                )}

                <MobileActionGrid
                    isDealer={isDealer}
                />

                {isDealer ? (
                    <DealerInventoryCard />
                ) : (
                    <UserSellCard />
                )}

                <MobileAccountLinks
                    isDealer={isDealer}
                    onLogout={props.onLogout}
                    isLoggingOut={props.isLoggingOut}
                />

                <MobileFooter />
            </main>
        </div>
    );
}