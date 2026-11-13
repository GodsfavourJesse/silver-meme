"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CarFront, ChevronRight, ShieldCheck } from "lucide-react";

import { useAdminSession } from "@/app/hooks/admin/use-admin-session";
import { ApiError } from "@/app/lib/api/api-error";
import { ADMIN_DASHBOARD_PATH, ADMIN_LOGIN_PATH } from "@/app/lib/admin/path";
import { initialsOf } from "@/app/lib/admin/format";
import { KarmassPageLoader } from "@/app/components/shared/KarmassPageLoader";
import { MobileAdminNavigation } from "./MobileAdminNavigation";
import { NotificationBell } from "./notification-bell";
import { UserMenu } from "./user-menu";
import { ADMIN_NAV_GROUPS, type AdminNavItem } from "./admin-nav";

function itemIsActive(pathname: string, item: AdminNavItem): boolean {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function getPageTitle(pathname: string): string {
    if (pathname.includes("/users/") && pathname !== `${ADMIN_DASHBOARD_PATH}/users`) return "User details";
    if (pathname.includes("/boosts/") && pathname !== `${ADMIN_DASHBOARD_PATH}/boosts`) return "Boost details";

    const matched = ADMIN_NAV_GROUPS.flatMap((group) => group.items)
        .sort((a, b) => b.href.length - a.href.length)
        .find((item) => itemIsActive(pathname, item));

    return matched?.label ?? "Administrator workspace";
}

function AdminSidebar({
    pathname,
    admin,
}: {
    pathname: string;
    admin: NonNullable<ReturnType<typeof useAdminSession>["data"]>;
}) {
    return (
        <aside className="sticky top-0 hidden h-dvh flex-col border-r border-slate-200/80 bg-white lg:flex">
            <Link
                href={ADMIN_DASHBOARD_PATH}
                className="flex h-[82px] shrink-0 items-center gap-3 border-b border-slate-100 px-6"
                aria-label="KARMASS administrator dashboard"
            >
                <span className="grid size-11 place-items-center rounded-2xl bg-[#0B4F86] text-white shadow-lg shadow-[#0B4F86]/15">
                    <CarFront size={23} strokeWidth={1.9} />
                </span>
                <span>
                    <span className="block text-[14px] font-extrabold tracking-[0.13em] text-slate-950">KARMASS</span>
                    <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-[0.17em] text-slate-400">Admin console</span>
                </span>
            </Link>

            <nav aria-label="Admin sidebar" className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
                {ADMIN_NAV_GROUPS.map((group) => (
                    <div key={group.title} className="mb-7 last:mb-0">
                        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                            {group.title}
                        </p>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const active = itemIsActive(pathname, item);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        aria-current={active ? "page" : undefined}
                                        className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] transition-colors ${
                                            active
                                                ? "bg-[#EAF4FC] font-semibold text-[#0B4F86]"
                                                : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                                        }`}
                                    >
                                        {active && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-[#0B4F86]" />}
                                        <Icon size={18} strokeWidth={active ? 2.3 : 1.9} className={active ? "text-[#0B4F86]" : "text-slate-400 transition-colors group-hover:text-slate-600"} />
                                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                                        {active && <ChevronRight size={15} className="text-[#0B4F86]/50" />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="shrink-0 border-t border-slate-100 p-4">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#0B4F86] text-xs font-bold text-white">
                        {initialsOf(admin.firstName, admin.lastName)}
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold text-slate-900">{[admin.firstName, admin.lastName].filter(Boolean).join(" ") || "Administrator"}</span>
                        <span className="mt-0.5 block truncate text-[10px] text-slate-500">{admin.email}</span>
                    </span>
                    <ShieldCheck size={16} className="shrink-0 text-emerald-600" aria-label="Verified administrator session" />
                </div>
            </div>
        </aside>
    );
}

export function AdminShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const session = useAdminSession();

    const isUnauthorized =
        session.error instanceof ApiError &&
        (session.error.status === 401 || session.error.status === 403);

    useEffect(() => {
        if (isUnauthorized) router.replace(ADMIN_LOGIN_PATH);
    }, [isUnauthorized, router]);

    if (session.isPending) {
        return <KarmassPageLoader message="Verifying administrator access..." />;
    }

    if (!session.data || session.isError) {
        return (
            <main className="flex min-h-dvh items-center justify-center bg-[#F4F7FB] px-5 py-10">
                <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_24px_70px_-42px_rgba(15,23,42,0.35)]">
                    <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
                        <ShieldCheck size={25} />
                    </span>
                    <h1 className="mt-5 text-xl font-bold tracking-tight text-slate-950">Unable to verify your session</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-500">We couldn&apos;t confirm administrator access. Check your connection and try again.</p>
                    <button
                        type="button"
                        onClick={() => void session.refetch()}
                        disabled={session.isFetching || isUnauthorized}
                        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0B4F86] px-6 text-sm font-semibold text-white transition hover:bg-[#083C67] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {session.isFetching ? "Verifying..." : "Try again"}
                    </button>
                </section>
            </main>
        );
    }

    const pageTitle = getPageTitle(pathname);

    return (
        <div className="min-h-dvh bg-[#F4F7FB] text-slate-900 lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
            <AdminSidebar pathname={pathname} admin={session.data} />

            <div className="flex min-w-0 flex-col">
                <header className="sticky top-0 z-30 flex h-[68px] shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-xl sm:px-6 lg:h-[76px] lg:px-9">
                    <div className="flex min-w-0 items-center gap-3">
                        <Link href={ADMIN_DASHBOARD_PATH} className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#0B4F86] text-white lg:hidden" aria-label="Admin dashboard">
                            <CarFront size={19} />
                        </Link>
                        <div className="min-w-0">
                            <div className="hidden items-center gap-2 text-[11px] font-medium text-slate-400 lg:flex">
                                <span>Workspace</span>
                                <span aria-hidden="true">/</span>
                                <span className="truncate text-slate-600">{pageTitle}</span>
                            </div>
                            <p className="truncate text-sm font-bold text-slate-900 lg:mt-1 lg:text-base">{pageTitle}</p>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                        <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-700 sm:inline-flex">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Secure session
                        </span>
                        <NotificationBell />
                        <UserMenu admin={session.data} />
                    </div>
                </header>

                <div className="min-w-0 flex-1 pb-24 lg:pb-0">
                    <div className="mx-auto w-full max-w-[1720px]">{children}</div>
                </div>
            </div>

            <MobileAdminNavigation />
        </div>
    );
}
