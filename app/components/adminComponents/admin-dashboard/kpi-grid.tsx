import {
    ArrowUpRight,
    Car,
    Crown,
    Rocket,
    Users,
    type LucideIcon,
} from "lucide-react";

import { formatNumber } from "@/app/lib/admin/format";
import type { AdminDashboardData } from "@/app/types/admin/admin-dashboard.types";

interface Kpi {
    label: string;
    value: number;
    detail: string;
    icon: LucideIcon;
}

export function KpiGrid({ data }: { data: AdminDashboardData }) {
    const kpis: Kpi[] = [
        {
            label: "Total users",
            value: data.users.total,
            detail: `${formatNumber(data.users.active)} active accounts`,
            icon: Users,
        },
        {
            label: "Approved listings",
            value: data.listings.approved,
            detail: `Of ${formatNumber(data.listings.total)} total listings`,
            icon: Car,
        },
        {
            label: "Active subscriptions",
            value: data.subscriptions.active,
            detail: "Currently running",
            icon: Crown,
        },
        {
            label: "Active boosts",
            value: data.boosts.active,
            detail: `${formatNumber(data.boosts.pendingApproval)} awaiting approval`,
            icon: Rocket,
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
            {kpis.map((kpi) => {
                const Icon = kpi.icon;

                return (
                    <article
                        key={kpi.label}
                        className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-200 hover:border-[#1491FF]/40 sm:p-5"
                    >
                        {/* Card heading */}
                        <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-medium leading-5 text-slate-500">
                                {kpi.label}
                            </p>

                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1491FF]/10 text-[#1491FF] transition-colors group-hover:bg-[#1491FF]/15">
                                <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                            </span>
                        </div>

                        {/* Main value */}
                        <div className="mt-5 flex items-end justify-between gap-2">
                            <p className="min-w-0 break-words text-3xl font-bold tracking-tight text-slate-900 tabular-nums sm:text-4xl">
                                {formatNumber(kpi.value)}
                            </p>

                            <ArrowUpRight
                                size={17}
                                className="mb-1 shrink-0 text-slate-300 transition-colors group-hover:text-[#1491FF]"
                                aria-hidden="true"
                            />
                        </div>

                        {/* Supporting information */}
                        <div className="mt-3 border-t border-slate-100 pt-3">
                            <p className="text-xs leading-5 text-slate-500">
                                {kpi.detail}
                            </p>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}