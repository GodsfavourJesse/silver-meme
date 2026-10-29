"use client";

import {
    Activity,
    CheckCircle2,
    CircleAlert,
    Clock3,
    Cpu,
    Database,
    RefreshCw,
    Server,
} from "lucide-react";

import { useAdminSystemHealth } from "@/app/hooks/admin/use-admin-system-health";
import {
    formatMegabytes,
    formatUptime,
    timeAgo,
} from "@/app/lib/admin/format";

import { Panel } from "./panel";

function HealthIndicator({
    healthy,
    label,
}: {
    healthy: boolean;
    label: string;
}) {
    return (
        <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                healthy
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
            }`}
        >
            <span
                className={`relative flex size-2 shrink-0 rounded-full ${
                    healthy ? "bg-emerald-500" : "bg-red-500"
                }`}
            >
                {healthy && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-50" />
                )}
            </span>

            {label}
        </div>
    );
}

function MetricRow({
    icon: Icon,
    label,
    value,
    healthy,
}: {
    icon: typeof Database;
    label: string;
    value: string;
    healthy?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
                    <Icon className="size-4" strokeWidth={1.8} />
                </div>

                <span className="truncate text-sm text-slate-500">
                    {label}
                </span>
            </div>

            <span
                className={`shrink-0 text-right text-sm font-semibold ${
                    healthy === undefined
                        ? "text-slate-800"
                        : healthy
                          ? "text-emerald-700"
                          : "text-red-600"
                }`}
            >
                {value}
            </span>
        </div>
    );
}

function HealthSkeleton() {
    return (
        <div className="animate-pulse space-y-5">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="size-12 rounded-xl bg-slate-200" />

                <div className="flex-1 space-y-2">
                    <div className="h-3 w-28 rounded bg-slate-200" />
                    <div className="h-3 w-40 max-w-full rounded bg-slate-200" />
                </div>
            </div>

            {[1, 2, 3, 4].map((item) => (
                <div
                    key={item}
                    className="flex items-center justify-between gap-4"
                >
                    <div className="h-4 w-24 rounded bg-slate-100" />
                    <div className="h-4 w-20 rounded bg-slate-200" />
                </div>
            ))}

            <div className="h-20 rounded-2xl bg-slate-100" />
        </div>
    );
}

export function SystemHealthCard() {
    const { data, isPending, isError, refetch, isFetching } =
        useAdminSystemHealth();

    const healthy = data?.status === "healthy";
    const databaseHealthy = data?.database.status === "healthy";

    const heapUsedBytes = data?.runtime.memory.heapUsedBytes ?? 0;
    const heapTotalBytes = data?.runtime.memory.heapTotalBytes ?? 0;

    const heapPercent =
        heapTotalBytes > 0
            ? Math.min(100, Math.max(0, (heapUsedBytes / heapTotalBytes) * 100))
            : 0;

    const memoryColor =
        heapPercent >= 90
            ? "bg-red-500"
            : heapPercent >= 75
              ? "bg-amber-500"
              : "bg-[#1491FF]";

    return (
        <Panel
            title="System health"
            eyebrow="INFRASTRUCTURE"
            className="h-full"
            action={
                <button
                    type="button"
                    onClick={() => void refetch()}
                    disabled={isFetching}
                    aria-label="Refresh system health"
                    title="Refresh system health"
                    className="inline-flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-[#B9DEFF] hover:bg-[#EAF5FF] hover:text-[#1491FF] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw
                        className={`size-4 ${isFetching ? "animate-spin" : ""}`}
                    />
                </button>
            }
        >
            {isPending ? (
                <HealthSkeleton />
            ) : isError ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/70 px-5 py-10 text-center">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm ring-1 ring-red-100">
                        <CircleAlert className="size-6" />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-slate-800">
                        Unable to load system health
                    </h3>

                    <p className="mt-1.5 max-w-xs text-sm leading-6 text-slate-500">
                        We couldn't retrieve the latest server information.
                        Check your connection and try again.
                    </p>

                    <button
                        type="button"
                        onClick={() => void refetch()}
                        disabled={isFetching}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1491FF] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0876D1] disabled:opacity-60"
                    >
                        <RefreshCw
                            className={`size-4 ${isFetching ? "animate-spin" : ""}`}
                        />
                        Try again
                    </button>
                </div>
            ) : data ? (
                <div className="space-y-5">
                    {/* Overall status */}
                    <div className="relative overflow-hidden rounded-2xl border border-[#B9DEFF] bg-gradient-to-br from-[#EAF5FF] via-white to-white p-4 sm:p-5">
                        <div className="absolute -right-8 -top-10 size-32 rounded-full bg-[#1491FF]/[0.07] blur-2xl" />

                        <div className="relative flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-start gap-3">
                                <div
                                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                                        healthy
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-red-100 text-red-600"
                                    }`}
                                >
                                    {healthy ? (
                                        <CheckCircle2 className="size-5" />
                                    ) : (
                                        <CircleAlert className="size-5" />
                                    )}
                                </div>

                                <div className="min-w-0 pt-0.5">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500">
                                        Platform status
                                    </p>

                                    <h3 className="mt-1 text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                                        {healthy
                                            ? "Everything looks good"
                                            : "Attention may be needed"}
                                    </h3>

                                    <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                                        {healthy
                                            ? "Your server is reporting normal operation."
                                            : "One or more system checks may need attention."}
                                    </p>
                                </div>
                            </div>

                            <div className="hidden shrink-0 sm:block">
                                <HealthIndicator
                                    healthy={healthy}
                                    label={healthy ? "Operational" : "Degraded"}
                                />
                            </div>
                        </div>

                        <div className="relative mt-4 flex items-center justify-between border-t border-[#B9DEFF]/80 pt-3">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Activity className="size-3.5 text-[#1491FF]" />
                                Live health check
                            </div>

                            <div className="sm:hidden">
                                <HealthIndicator
                                    healthy={healthy}
                                    label={healthy ? "Operational" : "Degraded"}
                                />
                            </div>

                            <span className="hidden text-xs font-medium text-slate-500 sm:inline">
                                {data.environment}
                            </span>
                        </div>
                    </div>

                    {/* Server information */}
                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <Server className="size-4 text-[#1491FF]" />

                            <h3 className="text-sm font-semibold text-slate-800">
                                Server overview
                            </h3>
                        </div>

                        <div className="divide-y divide-slate-100">
                            <MetricRow
                                icon={Database}
                                label="Database"
                                value={
                                    databaseHealthy
                                        ? "Connected"
                                        : "Unavailable"
                                }
                                healthy={databaseHealthy}
                            />

                            <MetricRow
                                icon={Clock3}
                                label="Server uptime"
                                value={formatUptime(data.uptimeSeconds)}
                            />

                            <MetricRow
                                icon={Cpu}
                                label="Node.js version"
                                value={data.runtime.nodeVersion}
                            />
                        </div>
                    </div>

                    {/* Memory usage */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    Memory usage
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Node.js heap utilization
                                </p>
                            </div>

                            <span
                                className={`rounded-lg px-2.5 py-1 text-sm font-bold ${
                                    heapPercent >= 90
                                        ? "bg-red-50 text-red-700"
                                        : heapPercent >= 75
                                          ? "bg-amber-50 text-amber-700"
                                          : "bg-[#EAF5FF] text-[#0876D1]"
                                }`}
                            >
                                {heapPercent.toFixed(1)}%
                            </span>
                        </div>

                        <div
                            className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200"
                            role="progressbar"
                            aria-label="Node.js heap memory usage"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Number(heapPercent.toFixed(1))}
                        >
                            <div
                                className={`h-full rounded-full transition-[width] duration-700 ease-out ${memoryColor}`}
                                style={{ width: `${heapPercent}%` }}
                            />
                        </div>

                        <div className="mt-2.5 flex items-center justify-between gap-3 text-xs">
                            <span className="text-slate-500">
                                {formatMegabytes(heapUsedBytes)} used
                            </span>

                            <span className="text-right font-medium text-slate-600">
                                {formatMegabytes(heapTotalBytes)} allocated
                            </span>
                        </div>

                        {heapPercent >= 90 && (
                            <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-red-600">
                                <CircleAlert className="mt-0.5 size-3.5 shrink-0" />
                                Heap usage is high. Consider reviewing server
                                memory consumption.
                            </p>
                        )}
                    </div>

                    {/* Last checked */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                        <span className="text-xs text-slate-400">
                            Last checked {timeAgo(data.checkedAt)}
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Monitoring active
                        </span>
                    </div>
                </div>
            ) : null}
        </Panel>
    );
}