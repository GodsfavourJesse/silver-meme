"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, X } from "lucide-react";

import {
    ADMIN_MOBILE_PRIMARY,
    ADMIN_NAV_GROUPS,
    type AdminNavItem,
} from "./admin-nav";

function isActive(pathname: string, item: AdminNavItem): boolean {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function MobileAdminNavigation() {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    const moreGroups = ADMIN_NAV_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter(
            (item) => !ADMIN_MOBILE_PRIMARY.some((primary) => primary.href === item.href),
        ),
    })).filter((group) => group.items.length > 0);
    const moreActive = moreGroups.some((group) =>
        group.items.some((item) => isActive(pathname, item)),
    );

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!menuOpen) return;

        const previousOverflow = document.body.style.overflow;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setMenuOpen(false);
        };

        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [menuOpen]);

    return (
        <>
            <nav
                aria-label="Administrator navigation"
                className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_36px_rgba(15,23,42,0.10)] backdrop-blur-xl lg:hidden"
            >
                <div className="mx-auto grid h-[68px] max-w-xl grid-cols-5 px-1">
                    {ADMIN_MOBILE_PRIMARY.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(pathname, item);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? "page" : undefined}
                                className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${
                                    active ? "text-[#0B4F86]" : "text-slate-500 hover:text-slate-900"
                                }`}
                            >
                                <span className={`grid size-8 place-items-center rounded-xl transition-colors ${active ? "bg-[#EAF4FC]" : ""}`}>
                                    <Icon size={19} strokeWidth={active ? 2.5 : 2} />
                                </span>
                                <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>
                                    {item.shortLabel || item.label}
                                </span>
                                {active && <span aria-hidden="true" className="absolute top-0 h-[3px] w-7 rounded-b-full bg-[#0B4F86]" />}
                            </Link>
                        );
                    })}

                    <button
                        type="button"
                        onClick={() => setMenuOpen(true)}
                        aria-label="Open more administrator pages"
                        aria-expanded={menuOpen}
                        aria-haspopup="dialog"
                        className={`flex flex-col items-center justify-center gap-1 transition-colors ${menuOpen || moreActive ? "text-[#0B4F86]" : "text-slate-500 hover:text-slate-900"}`}
                    >
                        <span className={`grid size-8 place-items-center rounded-xl ${menuOpen || moreActive ? "bg-[#EAF4FC]" : ""}`}>
                            <Menu size={20} strokeWidth={2.2} />
                        </span>
                        <span className={`text-[10px] ${moreActive ? "font-bold" : "font-medium"}`}>More</span>
                    </button>
                </div>
            </nav>

            {menuOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-end bg-slate-950/45 backdrop-blur-sm lg:hidden"
                    onClick={() => setMenuOpen(false)}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="admin-menu-title"
                        onClick={(event) => event.stopPropagation()}
                        className="max-h-[84dvh] w-full overflow-hidden rounded-t-[28px] border-t border-white/70 bg-white shadow-2xl animate-in slide-in-from-bottom duration-300"
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0B4F86]">KARMASS Admin</p>
                                <h2 id="admin-menu-title" className="mt-1 text-lg font-bold tracking-tight text-slate-950">
                                    Management pages
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMenuOpen(false)}
                                aria-label="Close administrator menu"
                                className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <div className="max-h-[calc(84dvh-82px)] overflow-y-auto overscroll-contain px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4">
                            {moreGroups.map((group) => (
                                <div key={group.title} className="mb-5 last:mb-0">
                                    <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                        {group.title}
                                    </p>
                                    <div className="space-y-1">
                                        {group.items.map((item) => {
                                            const Icon = item.icon;
                                            const active = isActive(pathname, item);
                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    aria-current={active ? "page" : undefined}
                                                    onClick={() => setMenuOpen(false)}
                                                    className={`flex items-center gap-3 rounded-2xl p-3 transition ${active ? "bg-[#EAF4FC] text-[#0B4F86]" : "text-slate-700 hover:bg-slate-50"}`}
                                                >
                                                    <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${active ? "bg-white text-[#0B4F86]" : "bg-slate-100 text-slate-600"}`}>
                                                        <Icon size={19} />
                                                    </span>
                                                    <span className="min-w-0 flex-1 text-sm font-semibold">{item.label}</span>
                                                    <ChevronRight size={17} className="shrink-0 text-slate-400" />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}
