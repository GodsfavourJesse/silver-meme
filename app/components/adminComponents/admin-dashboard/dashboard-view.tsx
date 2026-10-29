"use client";

import { useEffect, useState } from "react";

import {
    Activity,
    ArrowUpRight,
    Clock3,
    LogOut,
    RefreshCw,
    ShieldCheck,
    TriangleAlert,
    X,
} from "lucide-react";

import { useAdminSession } from "@/app/hooks/admin/use-admin-session";
import { useAdminDashboard } from "@/app/hooks/admin/admin-dashboard/use-admin-dashboard";
import { useAdminLogout } from "@/app/hooks/admin/admin-auth/use-admin-logout";

import { ApiError } from "@/app/lib/api/api-error";
import { timeAgo } from "@/app/lib/admin/format";

import { UserBreakdown } from "./user-breakdown";
import { AdminAuthGuard } from "../admin-auth-guard";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { AttentionQueue } from "./attention-queue";
import { SystemHealthCard } from "./system-health-card";
import { KpiGrid } from "./kpi-grid";
import { ListingPipeline } from "./listing-pipeline";
import { RevenuePanel } from "./revenue-panel";
import { RecentSignups } from "./recent-signups";
import { CurrentYear } from "@/app/utils/current-year";

function getGreeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";

    return "Good evening";
}

function StatusDot({
    color = "bg-emerald-500",
    pulse = false,
}: {
    color?: string;
    pulse?: boolean;
}) {
    return (
        <span
            className={`relative inline-flex size-2 shrink-0 rounded-full ${color}`}
            aria-hidden="true"
        >
            {pulse && (
                <span
                    className={`absolute inset-0 animate-ping rounded-full ${color} opacity-40`}
                />
            )}
        </span>
    );
}

function DashboardBadge({
    children,
    tone = "neutral",
}: {
    children: React.ReactNode;
    tone?: "neutral" | "success" | "brand";
}) {
    const tones = {
        neutral: "border-slate-200 bg-white text-slate-600",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700",
        brand: "border-[#D7EAFE] bg-[#F0F7FF] text-[#0876D1]",
    };

    return (
        <span
            className={`inline-flex min-h-8 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium ${tones[tone]}`}
        >
            {children}
        </span>
    );
}

export function DashboardView() {
    const session = useAdminSession();
    const dashboard = useAdminDashboard();
    const logout = useAdminLogout();

    const firstName = session.data?.firstName;

    const [greeting, setGreeting] = useState("Welcome");
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => {
        setGreeting(getGreeting());
    }, []);

    useEffect(() => {
        if (!showLogoutModal) return;

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape" && !logout.isPending) {
                setShowLogoutModal(false);
            }
        }

        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, [showLogoutModal, logout.isPending]);

    useEffect(() => {
        if (!showLogoutModal) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [showLogoutModal]);

    function handleLogout() {
        logout.mutate();
    }

    return (
        <AdminAuthGuard>
            <main className="min-w-0 space-y-6 p-6 md:10 sm:space-y-7">
                {/* Dashboard header */}
                <header className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="relative p-5 sm:p-7 lg:p-8">
                        {/* Top navigation row */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#D7EAFE] bg-[#F0F7FF] text-[#1491FF]">
                                    <Activity size={19} strokeWidth={2} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900">
                                        KARMASS Admin
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Platform overview
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <DashboardBadge tone="success">
                                    <StatusDot pulse />
                                    <span>Admin session active</span>
                                </DashboardBadge>

                                <button
                                    type="button"
                                    onClick={() => setShowLogoutModal(true)}
                                    aria-label="Log out of administrator account"
                                    className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 sm:px-3.5 sm:text-sm"
                                >
                                    <LogOut size={15} />
                                    <span className="hidden sm:inline">
                                        Log out
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Greeting and dashboard actions */}
                        <div className="mt-8 flex flex-col justify-between gap-6 lg:mt-10 lg:flex-row lg:items-end">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0876D1]">
                                    Dashboard overview
                                </p>

                                <h1 className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-[34px]">
                                    {greeting}
                                    {firstName ? `, ${firstName}` : ""}.
                                </h1>

                                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                                    Here&apos;s what&apos;s happening across
                                    KARMASS. Keep track of vehicle listings,
                                    users, revenue, and the activity that needs
                                    your attention.
                                </p>

                                <div className="mt-5 flex flex-wrap items-center gap-2">
                                    <DashboardBadge tone="brand">
                                        <ShieldCheck size={14} />
                                        Secure administration
                                    </DashboardBadge>

                                    <DashboardBadge>
                                        <Clock3 size={14} />
                                        <span>
                                            {dashboard.data
                                                ? `Updated ${timeAgo(
                                                      dashboard.data.generatedAt,
                                                  )}`
                                                : "Awaiting dashboard data"}
                                        </span>
                                    </DashboardBadge>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:shrink-0">
                                <div className="flex min-h-[46px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 sm:px-4">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
                                        <Clock3 size={17} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                            Last synchronized
                                        </p>

                                        <p className="mt-0.5 text-sm font-semibold text-slate-800">
                                            {dashboard.data
                                                ? timeAgo(
                                                      dashboard.data.generatedAt,
                                                  )
                                                : "Waiting for data"}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => void dashboard.refetch()}
                                    disabled={dashboard.isFetching}
                                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0876D1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1491FF]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <RefreshCw
                                        size={16}
                                        className={
                                            dashboard.isFetching
                                                ? "animate-spin"
                                                : ""
                                        }
                                    />

                                    {dashboard.isFetching
                                        ? "Refreshing..."
                                        : "Refresh dashboard"}
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Loading state */}
                {dashboard.isPending && (
                    <div className="animate-in fade-in duration-300">
                        <DashboardSkeleton />
                    </div>
                )}

                {/* Error state */}
                {dashboard.isError && (
                    <section
                        role="alert"
                        className="rounded-2xl border border-red-200 bg-white p-5 sm:p-6"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600">
                                <TriangleAlert size={21} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
                                    We couldn&apos;t load the dashboard
                                </h2>

                                <p className="mt-1.5 break-words text-sm leading-6 text-slate-500">
                                    {dashboard.error instanceof ApiError
                                        ? dashboard.error.message
                                        : "Something went wrong while retrieving the dashboard data. Please try again."}
                                </p>

                                {dashboard.error instanceof ApiError &&
                                dashboard.error.requestId ? (
                                    <p className="mt-2 break-all text-xs text-slate-400">
                                        Reference ID:{" "}
                                        {dashboard.error.requestId}
                                    </p>
                                ) : null}

                                <button
                                    type="button"
                                    onClick={() => void dashboard.refetch()}
                                    disabled={dashboard.isFetching}
                                    className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-[#B9DEFF] hover:bg-[#F0F7FF] hover:text-[#0876D1] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <RefreshCw
                                        size={15}
                                        className={
                                            dashboard.isFetching
                                                ? "animate-spin"
                                                : ""
                                        }
                                    />

                                    {dashboard.isFetching
                                        ? "Retrying..."
                                        : "Try again"}
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* Dashboard content */}
                {dashboard.data && (
                    <div className="space-y-6 sm:space-y-7">
                        {/* Attention and system health */}
                        <section className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-5 lg:gap-6">
                            <div className="min-w-0 lg:col-span-3">
                                <AttentionQueue data={dashboard.data} />
                            </div>

                            <div className="min-w-0 lg:col-span-2">
                                <SystemHealthCard />
                            </div>
                        </section>

                        {/* KPI cards */}
                        <section className="min-w-0">
                            <KpiGrid data={dashboard.data} />
                        </section>

                        {/* Listings, revenue and users */}
                        <section className="grid min-w-0 grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-5">
                            <div className="min-w-0 space-y-5 sm:space-y-6 lg:col-span-3">
                                <ListingPipeline data={dashboard.data} />

                                <RevenuePanel data={dashboard.data} />
                            </div>

                            <div className="min-w-0 space-y-5 sm:space-y-6 lg:col-span-2">
                                <UserBreakdown data={dashboard.data} />

                                <RecentSignups />
                            </div>
                        </section>

                        {/* Dashboard footer */}
                        <footer className="flex flex-col gap-3 border-t border-slate-200 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                            <p>
                                © <CurrentYear /> KARMASS
                                Administration
                            </p>

                            <div className="flex flex-wrap items-center gap-2">
                                <StatusDot />

                                <span>Dashboard connected</span>

                                {dashboard.data.generatedAt && (
                                    <>
                                        <span
                                            aria-hidden="true"
                                            className="text-slate-300"
                                        >
                                            ·
                                        </span>

                                        <span>
                                            Synced{" "}
                                            {timeAgo(
                                                dashboard.data.generatedAt,
                                            )}
                                        </span>
                                    </>
                                )}
                            </div>
                        </footer>
                    </div>
                )}

                {/* Logout confirmation */}
                {showLogoutModal && (
                    <div
                        className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
                        onMouseDown={(event) => {
                            if (
                                event.target === event.currentTarget &&
                                !logout.isPending
                            ) {
                                setShowLogoutModal(false);
                            }
                        }}
                    >
                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="admin-logout-title"
                            aria-describedby="admin-logout-description"
                            className="w-full max-w-md animate-in fade-in slide-in-from-bottom-3 duration-200 rounded-t-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:slide-in-from-bottom-0 sm:rounded-2xl sm:p-6"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex size-11 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600">
                                    <LogOut size={20} />
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowLogoutModal(false)
                                    }
                                    disabled={logout.isPending}
                                    aria-label="Close logout confirmation"
                                    className="flex size-9 items-center justify-center rounded-lg border border-transparent text-slate-400 transition-colors hover:border-slate-200 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <h2
                                id="admin-logout-title"
                                className="mt-5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
                            >
                                Log out of KARMASS?
                            </h2>

                            <p
                                id="admin-logout-description"
                                className="mt-2 text-sm leading-6 text-slate-500"
                            >
                                You&apos;ll need to sign in again to access
                                the administration dashboard. Are you sure
                                you want to continue?
                            </p>

                            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowLogoutModal(false)
                                    }
                                    disabled={logout.isPending}
                                    className="order-2 min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:order-1"
                                >
                                    Stay logged in
                                </button>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    disabled={logout.isPending}
                                    className="order-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:order-2"
                                >
                                    {logout.isPending ? (
                                        <>
                                            <RefreshCw
                                                size={15}
                                                className="animate-spin"
                                            />
                                            Logging out...
                                        </>
                                    ) : (
                                        <>
                                            <LogOut size={15} />
                                            Log out
                                        </>
                                    )}
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </AdminAuthGuard>
    );
}