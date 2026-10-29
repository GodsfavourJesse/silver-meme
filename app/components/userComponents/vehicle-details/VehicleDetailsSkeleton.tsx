export function VehicleDetailsSkeleton() {
    return (
        <main className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-[1440px] animate-pulse px-4 py-8 sm:px-6 lg:px-10">
                <div className="h-4 w-40 rounded bg-slate-200" />

                <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.8fr)]">
                    <div>
                        <div className="aspect-[4/3] rounded-3xl bg-slate-200" />

                        <div className="mt-4 flex gap-3">
                            {Array.from({ length: 4 }, (_, index) => (
                                <div
                                    key={index}
                                    className="h-20 w-24 rounded-xl bg-slate-200"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="h-8 w-4/5 rounded bg-slate-200" />
                        <div className="h-5 w-2/5 rounded bg-slate-200" />
                        <div className="h-12 w-3/5 rounded bg-slate-200" />
                        <div className="h-48 rounded-2xl bg-slate-200" />
                        <div className="h-20 rounded-2xl bg-slate-200" />
                    </div>
                </div>
            </div>
        </main>
    );
}