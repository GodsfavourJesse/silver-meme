export function VehicleDetailsSkeleton() {
    return (
        <main className="min-h-screen bg-[#F7F9FC]">
            <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
                <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />

                <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)] lg:gap-8">
                    {/* Gallery */}
                    <div className="min-w-0">
                        <div className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-200 sm:rounded-3xl" />

                        <div className="mt-3 flex gap-2 overflow-hidden">
                            {Array.from({ length: 5 }, (_, index) => (
                                <div
                                    key={index}
                                    className="h-16 w-20 shrink-0 animate-pulse rounded-lg bg-slate-200 sm:h-20 sm:w-24"
                                />
                            ))}
                        </div>

                        {/* Specifications */}
                        <div className="mt-8 hidden md:block">
                            <div className="h-6 w-44 animate-pulse rounded bg-slate-200" />

                            <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-3">
                                {Array.from({ length: 6 }, (_, index) => (
                                    <div
                                        key={index}
                                        className="h-16 animate-pulse rounded-xl border border-slate-100 bg-white"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="min-w-0 space-y-5">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />

                            <div className="mt-4 h-7 w-4/5 animate-pulse rounded bg-slate-200" />

                            <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-slate-200" />

                            <div className="mt-6 h-9 w-3/5 animate-pulse rounded bg-slate-200" />

                            <div className="mt-6 border-t border-slate-100 pt-4">
                                <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
                                <div className="mt-3 h-12 animate-pulse rounded-lg bg-slate-100" />
                            </div>

                            <div className="mt-5 h-12 animate-pulse rounded-lg bg-slate-200" />
                        </div>

                        {/* Seller card */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="flex items-center gap-3">
                                <div className="size-12 animate-pulse rounded-full bg-slate-200" />

                                <div className="flex-1">
                                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                                    <div className="mt-2 h-3 w-24 animate-pulse rounded bg-slate-100" />
                                </div>
                            </div>

                            <div className="mt-5 h-10 animate-pulse rounded-lg bg-slate-100" />
                        </div>
                    </div>
                </div>

                {/* Mobile specifications */}
                <div className="mt-6 md:hidden">
                    <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        {Array.from({ length: 6 }, (_, index) => (
                            <div
                                key={index}
                                className="h-16 animate-pulse rounded-xl border border-slate-100 bg-white"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}