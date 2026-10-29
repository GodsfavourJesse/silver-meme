export function DashboardSkeleton() {
    return (
        <div
            aria-busy="true"
            aria-label="Loading dashboard"
            className="space-y-6"
        >
            {/* Main Dashboard Sections */}
            <div className="grid gap-5 xl:grid-cols-5">
                {/* Primary Content */}
                <div className="relative overflow-hidden rounded-2xl border border-[#1491FF]/10 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-kar-surface xl:col-span-3">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="h-5 w-40 animate-pulse rounded-md bg-[#1491FF]/10" />
                            <div className="h-3 w-56 max-w-full animate-pulse rounded-md bg-slate-100 dark:bg-white/5" />
                        </div>

                        <div className="h-9 w-24 animate-pulse rounded-xl bg-[#1491FF]/10" />
                    </div>

                    {/* Chart Skeleton */}
                    <div className="relative flex h-64 items-end justify-between gap-3 overflow-hidden rounded-xl bg-slate-50/80 px-4 pt-6 dark:bg-white/[0.02] sm:gap-5">
                        {/* Horizontal Grid Lines */}
                        <div className="absolute inset-x-4 top-1/4 border-t border-dashed border-slate-200 dark:border-white/5" />
                        <div className="absolute inset-x-4 top-2/4 border-t border-dashed border-slate-200 dark:border-white/5" />
                        <div className="absolute inset-x-4 top-3/4 border-t border-dashed border-slate-200 dark:border-white/5" />

                        {[35, 55, 42, 75, 60, 90, 68, 48, 80, 58, 72, 45].map(
                            (height, index) => (
                                <div
                                    key={index}
                                    style={{ height: `${height}%` }}
                                    className="relative z-10 w-full max-w-10 animate-pulse rounded-t-lg bg-gradient-to-t from-[#1491FF]/15 to-[#1491FF]/40"
                                />
                            ),
                        )}
                    </div>

                    {/* Chart Legend */}
                    <div className="mt-5 flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#1491FF]/40" />
                            <div className="h-3 w-20 animate-pulse rounded-md bg-slate-100 dark:bg-white/5" />
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
                            <div className="h-3 w-16 animate-pulse rounded-md bg-slate-100 dark:bg-white/5" />
                        </div>
                    </div>
                </div>

                {/* Secondary Content */}
                <div className="rounded-2xl border border-[#1491FF]/10 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-kar-surface xl:col-span-2">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="h-5 w-36 animate-pulse rounded-md bg-[#1491FF]/10" />
                            <div className="h-3 w-44 max-w-full animate-pulse rounded-md bg-slate-100 dark:bg-white/5" />
                        </div>

                        <div className="h-9 w-9 animate-pulse rounded-xl bg-[#1491FF]/10" />
                    </div>

                    {/* Activity List */}
                    <div className="space-y-5">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3"
                            >
                                <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-[#1491FF]/10" />

                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className="h-3.5 w-3/4 animate-pulse rounded-md bg-slate-100 dark:bg-white/5" />
                                    <div className="h-3 w-1/2 animate-pulse rounded-md bg-slate-100 dark:bg-white/5" />
                                </div>

                                <div className="h-4 w-14 shrink-0 animate-pulse rounded-md bg-[#1491FF]/10" />
                            </div>
                        ))}
                    </div>

                    {/* Footer Placeholder */}
                    <div className="mt-6 border-t border-slate-100 pt-4 dark:border-white/5">
                        <div className="h-9 w-full animate-pulse rounded-xl bg-[#1491FF]/5" />
                    </div>
                </div>
            </div>

            {/* Dashboard Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[0, 1, 2, 3].map((index) => (
                    <div
                        key={index}
                        className="group relative overflow-hidden rounded-2xl border border-[#1491FF]/10 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-kar-surface"
                    >
                        {/* Decorative Brand Accent */}
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1491FF]/20 via-[#1491FF]/60 to-[#1491FF]/20" />

                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1 space-y-3">
                                <div className="h-3.5 w-28 max-w-full animate-pulse rounded-md bg-slate-100 dark:bg-white/5" />

                                <div className="h-8 w-36 max-w-full animate-pulse rounded-lg bg-[#1491FF]/10" />

                                <div className="flex items-center gap-2">
                                    <div className="h-5 w-14 animate-pulse rounded-md bg-[#1491FF]/10" />
                                    <div className="h-3 w-20 animate-pulse rounded-md bg-slate-100 dark:bg-white/5" />
                                </div>
                            </div>

                            <div className="flex h-12 w-12 shrink-0 animate-pulse items-center justify-center rounded-2xl border border-[#1491FF]/10 bg-[#1491FF]/5">
                                <div className="h-5 w-5 rounded-md bg-[#1491FF]/20" />
                            </div>
                        </div>

                        {/* Bottom Placeholder */}
                        <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                            <div
                                style={{
                                    width: `${35 + index * 15}%`,
                                }}
                                className="h-full animate-pulse rounded-full bg-[#1491FF]/30"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
