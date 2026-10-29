import { formatNumber } from "@/app/lib/admin/format";
import type { AdminDashboardData } from "@/app/types/admin/admin-dashboard.types";
import { Panel } from "./panel";

const RADIUS = 48;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const SEGMENT_COLORS = {
    active: "#1491FF",
    suspended: "#F59E0B",
    other: "#CBD5E1",
} as const;

export function UserBreakdown({
    data,
}: {
    data: AdminDashboardData;
}) {
    const { total, active, suspended } = data.users;

    // Prevent invalid values from affecting the chart.
    const safeTotal = Math.max(total, 0);
    const safeActive = Math.min(Math.max(active, 0), safeTotal);
    const safeSuspended = Math.min(
        Math.max(suspended, 0),
        Math.max(safeTotal - safeActive, 0),
    );

    const other = Math.max(
        safeTotal - safeActive - safeSuspended,
        0,
    );

    const segments = [
        {
            label: "Active",
            value: safeActive,
            color: SEGMENT_COLORS.active,
            percentage:
                safeTotal > 0 ? (safeActive / safeTotal) * 100 : 0,
        },
        {
            label: "Suspended",
            value: safeSuspended,
            color: SEGMENT_COLORS.suspended,
            percentage:
                safeTotal > 0 ? (safeSuspended / safeTotal) * 100 : 0,
        },
        {
            label: "Other",
            value: other,
            color: SEGMENT_COLORS.other,
            percentage:
                safeTotal > 0 ? (other / safeTotal) * 100 : 0,
        },
    ];

    let offset = 0;

    return (
        <Panel title="Community" eyebrow="User accounts">
            <div className="space-y-5">
                {/* Chart and account summary */}
                <div className="flex items-center gap-5 sm:gap-6">
                    <div className="relative h-32 w-32 shrink-0 sm:h-36 sm:w-36">
                        <svg
                            viewBox="0 0 112 112"
                            className="h-full w-full -rotate-90"
                            role="img"
                            aria-label={`User account distribution: ${formatNumber(safeActive)} active, ${formatNumber(safeSuspended)} suspended, and ${formatNumber(other)} other.`}
                        >
                            {/* Background ring */}
                            <circle
                                cx="56"
                                cy="56"
                                r={RADIUS}
                                fill="none"
                                stroke="#E2E8F0"
                                strokeWidth="10"
                            />

                            {/* Distribution segments */}
                            {safeTotal > 0 &&
                                segments.map((segment) => {
                                    const length =
                                        (segment.value / safeTotal) *
                                        CIRCUMFERENCE;

                                    const circle = (
                                        <circle
                                            key={segment.label}
                                            cx="56"
                                            cy="56"
                                            r={RADIUS}
                                            fill="none"
                                            stroke={segment.color}
                                            strokeWidth="10"
                                            strokeLinecap="butt"
                                            strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                                            strokeDashoffset={-offset}
                                        />
                                    );

                                    offset += length;

                                    return circle;
                                })}
                        </svg>

                        {/* Total users */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                {formatNumber(safeTotal)}
                            </span>

                            <span className="mt-0.5 text-[11px] font-medium text-slate-500">
                                Total users
                            </span>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-500">
                            Active accounts
                        </p>

                        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            {formatNumber(safeActive)}
                        </p>

                        <div className="mt-3 flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full transition-[width] duration-500"
                                    style={{
                                        width: `${segments[0].percentage}%`,
                                        backgroundColor:
                                            SEGMENT_COLORS.active,
                                    }}
                                />
                            </div>

                            <span className="shrink-0 text-xs font-semibold text-slate-600">
                                {segments[0].percentage.toFixed(1)}%
                            </span>
                        </div>

                        <p className="mt-2 text-xs leading-5 text-slate-500">
                            {safeTotal > 0
                                ? `${formatNumber(safeTotal - safeActive)} accounts are not currently active.`
                                : "No user accounts to display yet."}
                        </p>
                    </div>
                </div>

                {/* Breakdown */}
                <div className="border-t border-slate-100 pt-4">
                    <ul className="space-y-4">
                        {segments.map((segment) => (
                            <li
                                key={segment.label}
                                className="flex items-center gap-3"
                            >
                                <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                    style={{
                                        backgroundColor: segment.color,
                                    }}
                                    aria-hidden="true"
                                />

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm font-medium text-slate-600">
                                            {segment.label}
                                        </span>

                                        <span className="text-sm font-semibold tabular-nums text-slate-900">
                                            {formatNumber(segment.value)}
                                        </span>
                                    </div>

                                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full transition-[width] duration-500"
                                            style={{
                                                width: `${segment.percentage}%`,
                                                backgroundColor:
                                                    segment.color,
                                            }}
                                        />
                                    </div>
                                </div>

                                <span className="w-12 shrink-0 text-right text-xs tabular-nums text-slate-500">
                                    {segment.percentage.toFixed(1)}%
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </Panel>
    );
}