import Link from "next/link";

import { ArrowRight, CircleHelp, RefreshCw } from "lucide-react";

interface VehicleDetailsErrorProps {
    message: string;
    onRetry: () => void;
}

export function VehicleDetailsError({
    message,
    onRetry,
}: VehicleDetailsErrorProps) {
    return (
        <main className="min-h-screen bg-slate-50 px-4 py-16">
            <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
                <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                    <CircleHelp size={32} />
                </span>

                <h1 className="mt-5 text-2xl font-bold text-slate-950">
                    Vehicle unavailable
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                    {message ||
                        "This vehicle could not be found. It may have expired or been removed from the marketplace."}
                </p>

                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={onRetry}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                    >
                        <RefreshCw size={16} />
                        Try again
                    </button>

                    <Link
                        href="/marketplace"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
                    >
                        Browse vehicles
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </main>
    );
}