import {
    CheckCircle2,
    Clock3,
    ShieldAlert,
    XCircle,
    type LucideIcon,
} from "lucide-react";

import { formatNumber } from "@/app/lib/admin/format";
import type { AdminDashboardData } from "@/app/types/admin/admin-dashboard.types";

import { Panel } from "./panel";

interface ListingSegment {
    label: string;
    value: number;
    color: string;
    background: string;
    icon: LucideIcon;
}

export function ListingPipeline({
    data,
}: {
    data: AdminDashboardData;
}) {
    const { listings } = data;

    const segments: ListingSegment[] = [
        {
            label: "Approved",
            value: listings.approved,
            color: "#1491FF",
            background: "bg-[#1491FF]",
            icon: CheckCircle2,
        },
        {
            label: "Pending review",
            value: listings.pending,
            color: "#D97706",
            background: "bg-amber-500",
            icon: Clock3,
        },
        {
            label: "Rejected",
            value: listings.rejected,
            color: "#DC2626",
            background: "bg-red-500",
            icon: XCircle,
        },
        {
            label: "Suspended",
            value: listings.suspended,
            color: "#64748B",
            background: "bg-slate-500",
            icon: ShieldAlert,
        },
    ];

    const total = Math.max(listings.total, 0);

    const counted = segments.reduce(
        (sum, segment) => sum + Math.max(segment.value, 0),
        0,
    );

    const denominator = counted > 0 ? counted : 1;

    return (
        <Panel title="Listing pipeline" eyebrow="Marketplace overview">
            <div className="space-y-5">
                {/* Summary */}
                <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-500">
                            Total vehicle listings
                        </p>

                        <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 tabular-nums sm:text-4xl">
                            {formatNumber(total)}
                        </p>
                    </div>

                    <div className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                            Statuses tracked
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-slate-800">
                            {segments.length}
                        </p>
                    </div>
                </div>

                {/* Distribution bar */}
                <div>
                    <div
                        role="img"
                        aria-label={segments
                            .map(
                                (segment) =>
                                    `${segment.label}: ${formatNumber(segment.value)}`,
                            )
                            .join(", ")}
                        className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
                    >
                        {counted > 0 &&
                            segments.map((segment) => {
                                const value = Math.max(segment.value, 0);

                                if (value === 0) return null;

                                return (
                                    <div
                                        key={segment.label}
                                        className={`${segment.background} transition-[width] duration-500`}
                                        style={{
                                            width: `${(value / denominator) * 100}%`,
                                        }}
                                    />
                                );
                            })}
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
                        <span>Listing status distribution</span>

                        <span className="tabular-nums">
                            {formatNumber(counted)} categorized
                        </span>
                    </div>
                </div>

                {/* Status cards */}
                <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                    {segments.map((segment) => {
                        const Icon = segment.icon;
                        const value = Math.max(segment.value, 0);
                        const percentage =
                            counted > 0 ? (value / denominator) * 100 : 0;

                        return (
                            <li
                                key={segment.label}
                                className="min-w-0 rounded-xl border border-slate-200 bg-white p-3.5 transition-colors hover:border-slate-300 sm:p-4"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <span
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                                            style={{
                                                backgroundColor: `${segment.color}14`,
                                                color: segment.color,
                                            }}
                                        >
                                            <Icon
                                                size={17}
                                                strokeWidth={1.9}
                                                aria-hidden="true"
                                            />
                                        </span>

                                        <span className="truncate text-sm font-medium text-slate-600">
                                            {segment.label}
                                        </span>
                                    </div>

                                    <span className="shrink-0 text-lg font-bold text-slate-900 tabular-nums">
                                        {formatNumber(value)}
                                    </span>
                                </div>

                                <div className="mt-3 flex items-center gap-3">
                                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full transition-[width] duration-500"
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: segment.color,
                                            }}
                                        />
                                    </div>

                                    <span className="w-11 shrink-0 text-right text-xs font-medium tabular-nums text-slate-500">
                                        {percentage.toFixed(1)}%
                                    </span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </Panel>
    );
}