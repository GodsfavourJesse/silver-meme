"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
    Home,
    Users,
    CarFront,
    Menu,
    X,
    Building2,
    CreditCard,
    ChevronRight,
    Rocket,
} from "lucide-react";

import { ADMIN_BASE_PATH } from "@/app/lib/admin/path";

const ADMIN_BASE = `${ADMIN_BASE_PATH}/dashboard`;

const primaryLinks = [
    {
        label: "Home",
        href: ADMIN_BASE,
        icon: Home,
        exact: true,
    },
    {
        label: "Users",
        href: `${ADMIN_BASE}/users`,
        icon: Users,
    },
    {
        label: "Listings",
        href: `${ADMIN_BASE}/listings`,
        icon: CarFront,
    },
];

const moreLinks = [
    {
        label: "Boost Management",
        href: `${ADMIN_BASE}/boosts`,
        icon: Rocket,
        description: "Manage promotions, requests and approvals",
    },
    {
        label: "Dealers",
        href: `${ADMIN_BASE}/dealers`,
        icon: Building2,
        description: "Manage dealer accounts",
    },
    {
        label: "Subscriptions",
        href: `${ADMIN_BASE}/subscriptions`,
        icon: CreditCard,
        description: "Manage plans and subscriptions",
    },
];

export function MobileAdminNavigation() {
    const pathname = usePathname();
    const router = useRouter();

    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!menuOpen) return;

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setMenuOpen(false);
            }
        }

        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    function navigate(href: string) {
        setMenuOpen(false);
        router.push(href);
    }

    function isActive(href: string, exact = false) {
        return exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
    }

    return (
        <>
            {/* Mobile Bottom Navigation */}
            <nav
                aria-label="Admin mobile navigation"
                className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(15,23,42,0.07)] backdrop-blur-xl md:hidden"
            >
                <div className="mx-auto grid h-[68px] max-w-lg grid-cols-4">
                    {primaryLinks.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href, item.exact);

                        return (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() => navigate(item.href)}
                                aria-current={active ? "page" : undefined}
                                className={`flex flex-col items-center justify-center gap-1 transition ${
                                    active
                                        ? "text-[#1491FF]"
                                        : "text-slate-500"
                                }`}
                            >
                                <Icon
                                    size={21}
                                    strokeWidth={active ? 2.5 : 2}
                                />

                                <span
                                    className={`text-[10px] ${
                                        active
                                            ? "font-bold"
                                            : "font-medium"
                                    }`}
                                >
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}

                    <button
                        type="button"
                        onClick={() => setMenuOpen(true)}
                        aria-expanded={menuOpen}
                        aria-haspopup="dialog"
                        className={`flex flex-col items-center justify-center gap-1 transition ${
                            menuOpen
                                ? "text-[#1491FF]"
                                : "text-slate-500"
                        }`}
                    >
                        <Menu size={22} strokeWidth={2.2} />

                        <span className="text-[10px] font-medium">
                            More
                        </span>
                    </button>
                </div>
            </nav>

            {/* More Menu Bottom Sheet */}
            {menuOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-end bg-slate-950/45 backdrop-blur-[2px] md:hidden"
                    onClick={() => setMenuOpen(false)}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="admin-mobile-menu-title"
                        onClick={(event) => event.stopPropagation()}
                        className="max-h-[85dvh] w-full overflow-hidden rounded-t-[28px] border-t border-white/70 bg-white shadow-2xl animate-in slide-in-from-bottom duration-300"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
                            <div>
                                <h2
                                    id="admin-mobile-menu-title"
                                    className="text-lg font-bold tracking-tight text-slate-900"
                                >
                                    Admin Menu
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    Manage your KARMASS platform
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setMenuOpen(false)}
                                aria-label="Close menu"
                                className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        {/* Links */}
                        <div className="overflow-y-auto overscroll-contain px-4 pb-8 pt-4">
                            <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                Management
                            </p>

                            <div className="space-y-1">
                                {moreLinks.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.href);

                                    return (
                                        <button
                                            key={item.label}
                                            type="button"
                                            onClick={() => navigate(item.href)}
                                            aria-current={active ? "page" : undefined}
                                            className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                                                active
                                                    ? "bg-[#EAF5FF] text-[#0877D9]"
                                                    : "text-slate-700 hover:bg-slate-50"
                                            }`}
                                        >
                                            <span
                                                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                                                    active
                                                        ? "bg-white text-[#1491FF]"
                                                        : "bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                <Icon size={19} />
                                            </span>

                                            <span className="min-w-0 flex-1">
                                                <span className="block text-sm font-semibold">
                                                    {item.label}
                                                </span>

                                                <span className="mt-0.5 block text-xs text-slate-400">
                                                    {item.description}
                                                </span>
                                            </span>

                                            <ChevronRight
                                                size={17}
                                                className="shrink-0 text-slate-400"
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}