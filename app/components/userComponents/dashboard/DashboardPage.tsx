"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useQueryClient } from "@tanstack/react-query";

import {
    ArrowRight,
    ArrowUpRight,
    Bell,
    Bookmark,
    CarFront,
    Check,
    CheckCircle2,
    ChevronRight,
    CircleHelp,
    CircleUserRound,
    CreditCard,
    LogOut,
    MessageCircle,
    Plus,
    Search,
    Settings2,
    ShieldCheck,
    Sparkles,
    Store,
    UserRound,
    WalletCards,
    type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/app/hooks/user/auth/useAuth";

import { authService } from "@/app/services/user/auth/auth.service";

import { queryKeys } from "@/app/lib/query/query-keys";
import DashboardMobile from "./DashboardMobile";
import { CurrentYear } from "@/app/utils/current-year";

const BRAND = "#1491FF";
const BRAND_HOVER = "#0877D9";
const BRAND_LIGHT = "#EAF5FF";
const BRAND_BORDER = "#B9DEFF";

interface DashboardAction {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    shortLabel: string;
}

const primaryActions: DashboardAction[] = [
    {
        title: "My listings",
        shortLabel: "My listings",
        description: "Manage your vehicle advertisements.",
        href: "/dashboard/my-listings",
        icon: CarFront,
    },
    {
        title: "Saved vehicles",
        shortLabel: "Saved",
        description: "Return to vehicles you have bookmarked.",
        href: "/dashboard/saved-vehicles",
        icon: Bookmark,
    },
    {
        title: "Messages",
        shortLabel: "Messages",
        description: "Continue your buyer and seller conversations.",
        href: "/dashboard/messages",
        icon: MessageCircle,
    },
    {
        title: "Notifications",
        shortLabel: "Updates",
        description: "Review updates about your account.",
        href: "/dashboard/notifications",
        icon: Bell,
    },
];

const accountActions: DashboardAction[] = [
    {
        title: "Subscriptions",
        shortLabel: "Subscriptions",
        description: "Review your subscription and billing details.",
        href: "/dashboard/subscriptions",
        icon: CreditCard,
    },
    {
        title: "Account settings",
        shortLabel: "Settings",
        description: "Manage your personal information and preferences.",
        href: "/dashboard/settings",
        icon: Settings2,
    },
];

function isDealerAccount(accountType?: string | null): boolean {
    return accountType === "DEALER";
}

function getInitials(
    firstName?: string | null,
    lastName?: string | null,
): string {
    const first = firstName?.trim().charAt(0) ?? "";
    const last = lastName?.trim().charAt(0) ?? "";

    return `${first}${last}`.toUpperCase() || "K";


}

function getDisplayName(
    firstName?: string | null,
    lastName?: string | null,
): string {
    const first = firstName?.trim() ?? "";
    const last = lastName?.trim() ?? "";

    return [first, last].filter(Boolean).join(" ") || "KARMASS member";

}

function DashboardHeader() {
    const { user } = useAuth();

    const router = useRouter();
    const queryClient = useQueryClient();

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState("");

    async function handleLogout(): Promise<void> {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);
        setLogoutError("");

        try {
            await authService.logout();
        } catch {
            setLogoutError(
                "We couldn't confirm that your session was closed. Please sign in again.",
            );
        } finally {
            await queryClient.cancelQueries({
                queryKey: queryKeys.auth.all,
            });

            queryClient.removeQueries({
                queryKey: queryKeys.auth.all,
            });

            queryClient.clear();

            router.replace("/login");
            router.refresh();
        }
    }

    const firstName = user?.firstName?.trim();
    const initials = getInitials(user?.firstName, user?.lastName);

    return (
        <>
            {/* Desktop header */}
            <header className="hidden items-center justify-between gap-6 xl:flex">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.17em] text-slate-400">
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: BRAND }}
                        />
                        Your personal dashboard
                    </div>

                    <h1 className="mt-3 text-[34px] font-semibold tracking-[-0.055em] text-slate-900 2xl:text-[40px]">
                        Welcome back
                        {firstName ? (
                            <>
                                {", "}
                                <span style={{ color: BRAND }}>
                                    {firstName}
                                </span>
                            </>
                        ) : null}
                        .
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Everything you need for your automotive journey,
                        all in one place.
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    <Link
                        href="/notifications"
                        aria-label="View notifications"
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[#B9DEFF] hover:text-[#0877D9]"
                    >
                        <Bell size={19} strokeWidth={1.8} />
                    </Link>

                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white py-2 pl-2 pr-4 shadow-sm">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold"
                            style={{
                                backgroundColor: BRAND_LIGHT,
                                color: BRAND_HOVER,
                            }}
                        >
                            {initials}
                        </div>

                        <div className="min-w-0">
                            <p className="max-w-[180px] truncate text-sm font-semibold text-slate-800">
                                {getDisplayName(
                                    user?.firstName,
                                    user?.lastName,
                                )}
                            </p>

                            <p className="max-w-[180px] truncate text-xs text-slate-400">
                                {user?.email || "Your KARMASS account"}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-[#0877D9] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <LogOut size={16} />
                        {isLoggingOut ? "Signing out..." : "Sign out"}
                    </button>
                </div>
            </header>

            {/* Mobile and tablet app header */}
            <header className="xl:hidden">
                <div className="flex items-center justify-between gap-3">
                    <Link
                        href="/dashboard"
                        aria-label="KARMASS dashboard"
                        className="flex min-w-0 items-center gap-2.5"
                    >
                        <span
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] text-white shadow-[0_6px_18px_rgba(20,145,255,0.2)]"
                            style={{ backgroundColor: BRAND }}
                        >
                            <CarFront size={23} strokeWidth={1.9} />
                        </span>

                        <span className="min-w-0">
                            <span className="block text-[17px] font-extrabold tracking-[-0.06em] text-slate-900">
                                KAR
                                <span style={{ color: BRAND }}>MASS</span>
                            </span>

                            <span className="mt-0.5 block text-[10px] font-medium tracking-[0.11em] text-slate-400">
                                YOUR AUTOMOTIVE SPACE
                            </span>
                        </span>
                    </Link>

                    <div className="flex shrink-0 items-center gap-2">
                        <Link
                            href="/notifications"
                            aria-label="Notifications"
                            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[#B9DEFF] hover:text-[#0877D9]"
                        >
                            <Bell size={19} strokeWidth={1.8} />
                        </Link>

                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            aria-label="Sign out"
                            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:text-[#0877D9] disabled:opacity-50"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                <div className="mt-7 flex items-center gap-3">
                    <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] border text-sm font-bold"
                        style={{
                            borderColor: BRAND_BORDER,
                            background: `linear-gradient(135deg, ${BRAND_LIGHT}, #FFFFFF)`,
                            color: BRAND_HOVER,
                        }}
                    >
                        {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-400">
                            Welcome back,
                        </p>

                        <h1 className="mt-0.5 truncate text-[23px] font-bold tracking-[-0.055em] text-slate-900">
                            {firstName || "Driver"}
                            <span style={{ color: BRAND }}>.</span>
                        </h1>
                    </div>

                    <Link
                        href="/settings"
                        aria-label="Account settings"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200 transition hover:text-[#0877D9]"
                    >
                        <UserRound size={18} />
                    </Link>
                </div>
            </header>

            {logoutError && (
                <p
                    role="status"
                    className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800"
                >
                    {logoutError}
                </p>
            )}
        </>
    );

}

function DesktopWelcomeCard() {
    const { user } = useAuth();
    const isDealer = isDealerAccount(user?.accountType);

    return (
        <section
            className="relative isolate overflow-hidden rounded-[30px] border p-7 shadow-[0_8px_32px_rgba(20,70,110,0.035)] lg:p-9 2xl:p-11"
            style={{
                borderColor: BRAND_BORDER,
                background: `linear-gradient(135deg, #FFFFFF 0%, #F7FBFF 55%, ${BRAND_LIGHT} 100%)`,
            }}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-24 -z-10 h-80 w-80 rounded-full blur-[85px]"
                style={{ backgroundColor: `${BRAND}16` }}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 right-[25%] -z-10 h-52 w-52 rounded-full blur-[70px]"
                style={{ backgroundColor: `${BRAND}20` }}
            />

            <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_210px] 2xl:grid-cols-[minmax(0,1fr)_250px]">
                <div className="max-w-2xl">
                    <div
                        className="inline-flex items-center gap-2 rounded-full border bg-white/90 px-3 py-1.5 backdrop-blur"
                        style={{ borderColor: BRAND_BORDER }}
                    >
                        {isDealer ? (
                            <Store
                                size={14}
                                style={{ color: BRAND_HOVER }}
                            />
                        ) : (
                            <Sparkles
                                size={14}
                                style={{ color: BRAND_HOVER }}
                            />
                        )}

                        <span
                            className="text-[10px] font-bold uppercase tracking-[0.15em]"
                            style={{ color: BRAND_HOVER }}
                        >
                            {isDealer
                                ? "Welcome to your dealership"
                                : "Your journey, your way"}
                        </span>
                    </div>

                    <h2 className="mt-5 max-w-xl text-[30px] font-semibold leading-[1.17] tracking-[-0.055em] text-slate-900 lg:text-[36px] 2xl:text-[42px]">
                        {isDealer ? (
                            <>
                                Your dealership,
                                <br />
                                <span style={{ color: BRAND_HOVER }}>
                                    ready for business.
                                </span>
                            </>
                        ) : (
                            <>
                                Your next great drive starts{" "}
                                <span style={{ color: BRAND_HOVER }}>
                                    with a choice.
                                </span>
                            </>
                        )}
                    </h2>

                    <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 lg:text-[15px]">
                        {isDealer
                            ? "Manage your vehicle inventory, publish listings, and connect with potential buyers from your dealership dashboard."
                            : "Discover vehicles, save your favourites, and connect with people who share your passion for the road."}
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3">
                        <Link
                            href={
                                isDealer
                                    ? "/dashboard/dealer"
                                    : "/marketplace"
                            }
                            className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-2xl px-5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(20,145,255,0.2)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(20,145,255,0.26)] active:translate-y-0"
                            style={{ backgroundColor: BRAND }}
                            onMouseEnter={(event) => {
                                event.currentTarget.style.backgroundColor =
                                    BRAND_HOVER;
                            }}
                            onMouseLeave={(event) => {
                                event.currentTarget.style.backgroundColor =
                                    BRAND;
                            }}
                        >
                            {isDealer ? (
                                <Store size={17} />
                            ) : (
                                <Search size={17} />
                            )}

                            {isDealer
                                ? "Open dealership"
                                : "Explore marketplace"}

                            <ArrowUpRight
                                size={16}
                                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                        </Link>

                        <Link
                            href="/dashboard/my-listings"
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border bg-white/90 px-5 text-sm font-semibold text-slate-600 transition hover:bg-white"
                            style={{ borderColor: BRAND_BORDER }}
                        >
                            <Plus size={17} />
                            {isDealer ? "Manage listings" : "My listings"}
                        </Link>
                    </div>
                </div>

                <div
                    aria-hidden="true"
                    className="relative hidden h-[210px] items-center justify-center lg:flex"
                >
                    <div
                        className="absolute h-[200px] w-[200px] rounded-full border"
                        style={{ borderColor: `${BRAND}35` }}
                    />

                    <div
                        className="absolute h-[155px] w-[155px] rounded-full border"
                        style={{ borderColor: `${BRAND}35` }}
                    />

                    <div
                        className="absolute h-[110px] w-[110px] rounded-[35px] shadow-[0_18px_45px_rgba(20,145,255,0.25)] transition-transform duration-500 hover:scale-105"
                        style={{
                            background: `linear-gradient(135deg, ${BRAND}, ${BRAND_HOVER})`,
                        }}
                    >
                        <div className="flex h-full items-center justify-center text-white">
                            {isDealer ? (
                                <Store size={45} strokeWidth={1.4} />
                            ) : (
                                <CarFront size={49} strokeWidth={1.4} />
                            )}
                        </div>
                    </div>

                    <div className="absolute right-0 top-5 rounded-2xl border border-white/80 bg-white/90 px-3 py-2.5 shadow-[0_8px_25px_rgba(20,70,110,0.07)] backdrop-blur-xl">
                        <div className="flex items-center gap-2">
                            <span
                                className="flex h-7 w-7 items-center justify-center rounded-lg"
                                style={{
                                    backgroundColor: BRAND_LIGHT,
                                    color: BRAND_HOVER,
                                }}
                            >
                                <CheckCircle2 size={15} />
                            </span>

                            <span className="text-[10px] font-semibold text-slate-700">
                                {isDealer ? "Dealer account" : "Your account"}
                                <span className="mt-0.5 block text-slate-400">
                                    {isDealer
                                        ? "Dealer access enabled"
                                        : "All in one place"}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );

}

function MobileWelcomeCard() {
    return (
        <section
            className="relative isolate overflow-hidden rounded-[27px] p-5 text-white shadow-[0_14px_35px_rgba(20,145,255,0.22)] sm:p-7"
            style={{
            background: `linear-gradient(135deg, ${BRAND} 0%, #1685E8 48%, ${BRAND_HOVER} 100%)`,
            }}
        > 
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-20 -z-10 h-56 w-56 rounded-full border border-white/[0.16]"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-8 -top-12 -z-10 h-40 w-40 rounded-full border border-white/[0.16]"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-20 left-[40%] -z-10 h-44 w-44 rounded-full bg-white/[0.08] blur-3xl"
            />

            <div className="relative">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.12] px-3 py-1.5 backdrop-blur-sm">
                    <Sparkles size={13} />

                    <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-white/95">
                        Made for the journey
                    </span>
                </div>

                <h2 className="mt-4 max-w-[310px] text-[27px] font-semibold leading-[1.16] tracking-[-0.05em] sm:text-[32px]">
                    Find your next
                    <br />
                    <span className="text-white/75">favourite drive.</span>
                </h2>

                <p className="mt-3 max-w-[300px] text-[12px] leading-6 text-white/80 sm:text-sm">
                    Explore vehicles and keep your automotive world organised.
                </p>

                <Link
                    href="/marketplace"
                    className="group mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-bold shadow-sm transition hover:bg-blue-50 active:scale-[0.98]"
                    style={{ color: BRAND_HOVER }}
                >
                    Explore marketplace
                    <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-0.5"
                    />
                </Link>
            </div>

            <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-4 right-4 flex h-[86px] w-[86px] items-center justify-center rounded-[26px] border border-white/20 bg-white/[0.12] text-white/90 backdrop-blur-sm sm:bottom-6 sm:right-6 sm:h-[100px] sm:w-[100px]"
            >
                <CarFront size={43} strokeWidth={1.3} />
            </div>
        </section>
    );

}

function SectionHeading({
    eyebrow,
    title,
    description,
}: {
    eyebrow?: string;
    title: string;
    description?: string;
}) {
    return ( 
        <div className="min-w-0">
            {eyebrow && (
                <p
                    className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.17em]"
                style={{ color: BRAND_HOVER }}
                >
                    {eyebrow} 
                </p>
            )}

            <h2 className="text-[19px] font-semibold tracking-[-0.04em] text-slate-900 sm:text-[21px]">
                {title}
            </h2>

            {description && (
                <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                    {description}
                </p>
            )}
        </div>
    );
}

function DesktopActionCard({
    action,
}: {
    action: DashboardAction;
}) {
    const Icon = action.icon;

    return (
        <Link
            href={action.href}
            className="group flex min-h-[164px] flex-col rounded-[23px] border border-slate-200 bg-white p-5 shadow-[0_3px_12px_rgba(20,70,110,0.02)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(20,70,110,0.08)] active:translate-y-0"
            onMouseEnter={(event) => {
                event.currentTarget.style.borderColor = BRAND_BORDER;
            }}
            onMouseLeave={(event) => {
                event.currentTarget.style.borderColor = "#e2e8f0";
            }}
        >
            <div className="flex items-start justify-between gap-3">
                <span
                    className="flex h-12 w-12 items-center justify-center rounded-[16px] transition duration-200 group-hover:scale-105 group-hover:text-white sm:h-12 sm:w-12"
                    style={{
                        backgroundColor: BRAND_LIGHT,
                        color: BRAND_HOVER,
                    }}
                    onMouseEnter={(event) => {
                        event.currentTarget.style.backgroundColor = BRAND;
                    }}
                    onMouseLeave={(event) => {
                        event.currentTarget.style.backgroundColor =
                            BRAND_LIGHT;
                    }}
                >
                    <Icon size={21} strokeWidth={1.8} />
                </span>

                <span
                    className="flex h-8 w-8 items-center justify-center rounded-full transition"
                    style={{ color: "#94a3b8" }}
                >
                    <ArrowUpRight size={17} />
                </span>
            </div>

            <div className="mt-auto pt-5">
                <h3 className="text-sm font-semibold text-slate-800 transition-colors group-hover:text-[#0877D9]">
                    {action.title}
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    {action.description}
                </p>
            </div>
        </Link>
    );

}

function MobileActionGrid() {   
    return ( 
        <section> 
            <div className="mb-4 flex items-end justify-between gap-3"> 
                <SectionHeading
                    title="Your shortcuts"
                    description="Everything you need, one tap away."
                />

                <Link
                    href="/settings"
                    className="mb-0.5 inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#0877D9]"
                >
                    More
                    <ChevronRight size={14} />
                </Link>
            </div>

            <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
                {primaryActions.map((action) => {
                    const Icon = action.icon;

                    return (
                        <Link
                            key={action.href}
                            href={action.href}
                            className="group flex min-w-0 flex-col items-center justify-start rounded-[19px] border border-slate-200 bg-white px-1.5 py-4 text-center shadow-[0_3px_12px_rgba(20,70,110,0.02)] transition hover:border-[#B9DEFF] hover:bg-[#F7FBFF] active:scale-[0.97] sm:rounded-[22px] sm:py-5"
                        >
                            <span
                                className="flex h-11 w-11 items-center justify-center rounded-[15px] transition group-hover:text-white sm:h-12 sm:w-12"
                                style={{
                                    backgroundColor: BRAND_LIGHT,
                                    color: BRAND_HOVER,
                                }}
                            >
                                <Icon size={20} strokeWidth={1.8} />
                            </span>

                            <span className="mt-2.5 w-full break-words text-[10px] font-semibold leading-4 text-slate-600 sm:text-xs">
                                {action.shortLabel}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );

}

function DesktopAccountCard() {
    return ( 
        <section className="rounded-[24px] border border-slate-200 bg-white p-5"> 
            <div className="flex items-start gap-3">
                <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px]"
                    style={{
                        backgroundColor: BRAND_LIGHT,
                        color: BRAND_HOVER,
                    }}
                > 
                    <ShieldCheck size={21} strokeWidth={1.8} /> 
                </span>


                <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-slate-800">
                        Account overview
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Your account tools are ready when you need them.
                    </p>
                </div>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-3.5 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={17} />
                </span>

                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-emerald-800">
                        Signed in
                    </p>

                    <p className="mt-0.5 text-[10px] leading-4 text-emerald-700/70">
                        Your dashboard is available.
                    </p>
                </div>

                <Check size={16} className="text-emerald-700" />
            </div>

            <Link
                href="/settings"
                className="mt-4 flex min-h-11 items-center justify-between rounded-xl px-2 text-xs font-semibold text-slate-500 transition hover:text-[#0877D9]"
            >
                Manage account
                <ChevronRight size={16} />
            </Link>
        </section>
    );
}

function MobileAccountCard() {
    return ( 
        <section className="rounded-[22px] border border-slate-200 bg-white p-4 sm:p-5"> 
            <div className="flex items-center gap-3">
                <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px]"
                    style={{
                        backgroundColor: BRAND_LIGHT,
                        color: BRAND_HOVER,
                    }}
                > 
                    <ShieldCheck size={20} /> 
                </span>

                <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-slate-800">
                        Account status
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                        You are signed in to KARMASS.
                    </p>
                </div>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check size={17} />
                </span>
            </div>

            <Link
                href="/settings"
                className="mt-4 flex min-h-11 items-center justify-between rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-[#B9DEFF] hover:text-[#0877D9]"
            >
                Manage account settings
                <ChevronRight size={16} />
            </Link>
        </section>
    );
}

function DesktopHelpfulLinks() {
    const links = [
        {
            title: "Explore marketplace",
            href: "/marketplace",
            icon: Store,
        },
        {
            title: "Manage your listings",
            href: "/dashboard/my-listings",
            icon: CarFront,
        },
        {
            title: "Subscriptions and billing",
            href: "/subscriptions",
            icon: WalletCards,
        },
        {
            title: "Help and support",
            href: "/support",
            icon: CircleHelp,
        },
    ];

    return (
        <section className="rounded-[24px] border border-slate-200 bg-white p-5">
            <SectionHeading
                title="Useful links"
                description="Quick access to your account tools."
            />

            <div className="mt-4 space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="group flex min-h-[47px] items-center gap-3 rounded-xl px-2 transition hover:bg-[#F3F9FF]"
                        >
                            <span
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition group-hover:text-white"
                                style={{
                                    backgroundColor: BRAND_LIGHT,
                                    color: BRAND_HOVER,
                                }}
                            >
                                <Icon size={16} />
                            </span>

                            <span className="min-w-0 flex-1 text-xs font-medium text-slate-500 transition group-hover:text-[#0877D9]">
                                {link.title}
                            </span>

                            <ChevronRight
                                size={15}
                                className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#0877D9]"
                            />
                        </Link>
                    );
                })}
            </div>
        </section>
    );

}

function DealerCallout() {
    const { user } = useAuth();
    const isDealer = isDealerAccount(user?.accountType);

    return (
        <section
            className="relative isolate overflow-hidden rounded-[24px] border p-5"
            style={{
                borderColor: BRAND_BORDER,
                background: `linear-gradient(135deg, ${BRAND_LIGHT}, #FFFFFF 60%, #F3F9FF)`,
            }}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-8 -top-8 -z-10 h-32 w-32 rounded-full blur-2xl"
                style={{ backgroundColor: `${BRAND}16` }}
            />

            <span
                className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white shadow-sm ring-1"
                style={{
                    color: BRAND_HOVER,
                    ["--tw-ring-color" as string]: BRAND_BORDER,
                }}
            >
                {isDealer ? <ShieldCheck size={19} /> : <Store size={19} />}
            </span>

            <h3 className="mt-4 text-sm font-semibold text-slate-800">
                {isDealer ? "Your dealership" : "Ready to become a dealer?"}
            </h3>

            <p className="mt-2 text-xs leading-6 text-slate-500">
                {isDealer
                    ? "Your dealer account is approved. Open your dealership to manage your vehicle inventory and business tools."
                    : "Apply for dealer access to unlock dealership features and manage your vehicle listings."}
            </p>

            <Link
                href={
                    isDealer
                        ? "/dashboard/dealer"
                        : "/dealer-registration"
                }
                className="group mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-white shadow-[0_5px_14px_rgba(20,145,255,0.18)] transition hover:shadow-[0_7px_20px_rgba(20,145,255,0.24)] active:scale-[0.98]"
                style={{ backgroundColor: BRAND }}
                onMouseEnter={(event) => {
                    event.currentTarget.style.backgroundColor = BRAND_HOVER;
                }}
                onMouseLeave={(event) => {
                    event.currentTarget.style.backgroundColor = BRAND;
                }}
            >
                {isDealer ? "Open dealership" : "Become a dealer"}

                <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                />
            </Link>
        </section>
    );

}

function MobileAccountLinks() {
    const links = [
        {
            title: "Subscriptions",
            description: "Plans and billing",
            href: "/subscriptions",
            icon: CreditCard,
        },
        {
            title: "Account settings",
            description: "Your personal details",
            href: "/settings",
            icon: Settings2,
        },
        {
            title: "Help and support",
            description: "We're here to help",
            href: "/support",
            icon: CircleHelp,
        },
    ];

    return (
        <section>
            <SectionHeading
                title="Account & support"
                description="Keep your account organised."
            />

            <div className="mt-3 overflow-hidden rounded-[22px] border border-slate-200 bg-white px-3">
                {links.map((link, index) => {
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`group flex min-h-[69px] items-center gap-3 px-1 transition hover:bg-[#F7FBFF] ${
                                index !== links.length - 1
                                    ? "border-b border-slate-100"
                                    : ""
                            }`}
                        >
                            <span
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px]"
                                style={{
                                    backgroundColor: BRAND_LIGHT,
                                    color: BRAND_HOVER,
                                }}
                            >
                                <Icon size={18} />
                            </span>

                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold text-slate-700">
                                    {link.title}
                                </span>

                                <span className="mt-1 block text-xs text-slate-400">
                                    {link.description}
                                </span>
                            </span>

                            <ChevronRight
                                size={17}
                                className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#0877D9]"
                            />
                        </Link>
                    );
                })}
            </div>
        </section>
    );

}

function DashboardFooter() {
    return ( 
        <footer className="mt-10 border-t border-slate-200 pb-3 pt-5"> 
            <div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left"> 
                <p className="text-[11px] text-slate-400">
                    © <CurrentYear /> KARMASS. All rights reserved. 
                </p>
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                    Discover. Connect. Drive.
                </p>
            </div>
        </footer>
    );

}

function DashboardSkeleton() {
    return ( 
        <div
            className="min-h-screen bg-[#F7FBFF] px-4 py-6 sm:px-8 sm:py-8"
            aria-live="polite"
            aria-busy="true"
        > 
            <div className="mx-auto max-w-[1440px]"> 
                <div className="flex items-center justify-between"> 
                    <div className="h-11 w-36 animate-pulse rounded-2xl bg-[#DDEEFF]" /> 
                    <div className="h-10 w-10 animate-pulse rounded-xl bg-[#EAF5FF]" /> 
                </div>

                <div className="mt-8 h-7 w-48 animate-pulse rounded-lg bg-[#DDEEFF]" />

                <div className="mt-3 h-4 w-64 max-w-full animate-pulse rounded-full bg-[#EAF5FF]" />

                <div className="mt-7 h-[245px] animate-pulse rounded-[27px] bg-[#EAF5FF] sm:h-[280px] xl:mt-10 xl:h-[300px]" />

                <div className="mt-8 grid grid-cols-4 gap-2.5 sm:gap-4 xl:grid-cols-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-[100px] animate-pulse rounded-[19px] bg-[#EAF5FF] xl:h-[160px]"
                        />
                    ))}
                </div>

                <div className="mt-8 h-28 animate-pulse rounded-[22px] bg-[#EAF5FF]" />
            </div>
        </div>
    );

}

function SignInPrompt() {
    return ( 
        <div className="flex min-h-[70vh] items-center justify-center bg-[#F7FBFF] px-5 py-10"> 
            <section className="w-full max-w-sm rounded-[28px] border border-slate-200 bg-white p-7 text-center shadow-[0_8px_35px_rgba(20,70,110,0.05)]">
                <div
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{
                        backgroundColor: BRAND_LIGHT,
                        color: BRAND_HOVER,
                    }}
                > 
                    <CircleUserRound size={26} /> 
                </div>

                <h1 className="mt-5 text-xl font-semibold tracking-tight text-slate-900">
                    Sign in to continue
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Sign in to access your KARMASS dashboard and manage your
                    account.
                </p>

                <Link
                    href="/login"
                    className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition hover:bg-[#0877D9]"
                    style={{ backgroundColor: BRAND }}
                >
                    Go to sign in
                    <ArrowRight size={16} />
                </Link>
            </section>
        </div>
    );

}

function DashboardDesktop() {
    return ( 
        <div className="hidden min-h-screen bg-[#F7FAFE] text-slate-800 xl:block"> 
            <div className="mx-auto max-w-[1440px] px-8 py-8 2xl:px-12"> 
                <DashboardHeader />
                <main className="mt-9 space-y-9">
                    <DesktopWelcomeCard />

                    <div className="grid grid-cols-1 items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="min-w-0 space-y-8">
                            <section>
                                <SectionHeading
                                    eyebrow="Quick access"
                                    title="Your shortcuts"
                                    description="Everything you need to manage your automotive journey."
                                />

                                <div className="mt-5 grid grid-cols-2 gap-4 2xl:grid-cols-4">
                                    {primaryActions.map((action) => (
                                        <DesktopActionCard
                                            key={action.href}
                                            action={action}
                                        />
                                    ))}
                                </div>
                            </section>

                            <section>
                                <SectionHeading
                                    eyebrow="Your account"
                                    title="Account tools"
                                    description="Manage your profile, plans, and preferences."
                                />

                                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {accountActions.map((action) => (
                                        <DesktopActionCard
                                            key={action.href}
                                            action={action}
                                        />
                                    ))}
                                </div>
                            </section>
                        </div>

                        <aside className="space-y-5">
                            <DesktopAccountCard />
                            <DealerCallout />
                            <DesktopHelpfulLinks />
                        </aside>
                    </div>
                </main>

                <DashboardFooter />
            </div>
        </div>
    );


}

export default function DashboardPage() {
const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    async function handleLogout(): Promise<void> {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);

        try {
            await authService.logout();
        } catch {
            // Continue clearing local authentication state even if
            // the logout request fails.
        } finally {
            await queryClient.cancelQueries({
                queryKey: queryKeys.auth.all,
            });

            queryClient.removeQueries({
                queryKey: queryKeys.auth.all,
            });

            queryClient.clear();

            router.replace("/login");
            router.refresh();
        }
    }

    const dashboardUser = {
        firstName: user?.firstName ?? null,
        lastName: user?.lastName ?? null,
        email: user?.email ?? null,
        accountType: user?.accountType ?? null,
    };

    if (!user) {
        return <SignInPrompt />;
    }

    return (
        <>
            <DashboardDesktop />

            <div className="xl:hidden">
                <DashboardMobile
                    user={dashboardUser}
                    onLogout={handleLogout}
                    isLoggingOut={isLoggingOut}
                />
            </div>
        </>
    );

}