"use client";

import { useEffect, useState } from "react";

import { ArrowRight, Check, CheckCircle2, Circle, ShieldCheck } from "lucide-react";

/*
 * ============================================================
 * TYPES AND CONSTANTS
 * ============================================================
 */

type ListingPageLoaderProps = {
    variant?: "dashboard" | "process" | "inline";
    title?: string;
    description?: string;
    step?: number;
    steps?: string[];
    progress?: number;
    fullScreen?: boolean;
};

const DEFAULT_STEPS = [
    "Saving vehicle details",
    "Checking vehicle photos",
    "Preparing your listing",
    "Submitting for review",
];

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

/*
 * ============================================================
 * FULL SCREEN LOADER
 * ============================================================
 */

function FullScreenLoader({
    title = "Getting your listings ready",
    description = "We're loading your vehicle listings. This should only take a moment.",
    progress,
}: {
    title?: string;
    description?: string;
    progress?: number;
}) {
    const [displayProgress, setDisplayProgress] = useState(8);

    useEffect(() => {
        if (typeof progress === "number") {
            setDisplayProgress(clamp(progress, 0, 100));
            return;
        }

        // Indeterminate loading: show activity without pretending
        // that the request has a known completion percentage.
        const interval = window.setInterval(() => {
            setDisplayProgress((current) => {
                if (current >= 90) return 90;
                return Math.min(current + Math.random() * 5, 90);
            });
        }, 450);

        return () => window.clearInterval(interval);
    }, [progress]);

    return (
        <main
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="fixed inset-0 z-[100] flex min-h-[100dvh] items-center justify-center overflow-y-auto bg-white px-5 py-10"
        >
            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center text-center">
                    <div className="relative flex size-[76px] items-center justify-center rounded-[26px] bg-[#1491FF]/[0.08] ring-1 ring-[#1491FF]/10">
                        <div className="absolute inset-2 animate-pulse rounded-[20px] bg-[#1491FF]/[0.06]" />

                        <div className="relative flex size-12 items-center justify-center rounded-2xl bg-[#1491FF] text-white shadow-lg shadow-[#1491FF]/25">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                                className="size-7"
                            >
                                <path
                                    d="M3 13.5 5.2 7.8A2.8 2.8 0 0 1 7.8 6h8.4a2.8 2.8 0 0 1 2.6 1.8l2.2 5.7"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M3 13.5h18v4a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 17.5v-4Z"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M6.5 15.8h.01M17.5 15.8h.01"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                    </div>

                    <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.2em] text-[#0876D1]">
                        KARMASS
                    </p>

                    <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                        {title}
                    </h1>

                    <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">{description}</p>
                </div>

                <div className="mt-9">
                    <div className="mb-2.5 flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-slate-500">
                            {typeof progress === "number" ? "Progress" : "Please wait"}
                        </span>

                        {typeof progress === "number" && (
                            <span className="text-xs font-semibold tabular-nums text-[#0876D1]">
                                {Math.round(displayProgress)}%
                            </span>
                        )}
                    </div>

                    <div
                        className="h-1.5 overflow-hidden rounded-full bg-slate-100"
                        role="progressbar"
                        aria-label="Loading progress"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={
                            typeof progress === "number" ? Math.round(displayProgress) : undefined
                        }
                    >
                        <div
                            className={`h-full rounded-full bg-[#1491FF] ${
                                typeof progress === "number"
                                    ? "transition-[width] duration-500 ease-out"
                                    : "animate-[listing-progress_1.8s_ease-in-out_infinite]"
                            }`}
                            style={
                                typeof progress === "number"
                                    ? { width: `${displayProgress}%` }
                                    : undefined
                            }
                        />
                    </div>
                </div>

                <div className="mt-7 flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#1491FF]" />

                    <div>
                        <p className="text-xs font-semibold text-slate-800">
                            Your listings, handled carefully
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                            You can continue as soon as everything is ready.
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-center text-[11px] text-slate-400">
                    A better way to find your next car.
                </p>
            </div>

            <style jsx>{`
                @keyframes listing-progress {
                    0% {
                        width: 8%;
                        transform: translateX(-100%);
                    }
                    50% {
                        width: 70%;
                    }
                    100% {
                        width: 35%;
                        transform: translateX(250%);
                    }
                }
            `}</style>
        </main>
    );
}

/*
 * ============================================================
 * PROCESS LOADER
 * ============================================================
 */

function ProcessLoader({
    title = "Getting your listing ready",
    description = "Please wait while we complete this step.",
    step = 1,
    steps = DEFAULT_STEPS,
    fullScreen = false,
    progress,
}: ListingPageLoaderProps) {
    const safeSteps = steps.length > 0 ? steps : DEFAULT_STEPS;
    const currentStep = clamp(step, 1, safeSteps.length);

    const content = (
        <section
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
            <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#1491FF]/10 text-[#0876D1]">
                    <div className="size-5 animate-spin rounded-full border-2 border-[#1491FF]/20 border-t-[#1491FF]" />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0876D1]">
                        KARMASS
                    </p>

                    <h2 className="mt-1 text-base font-semibold text-slate-900">{title}</h2>
                </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500">{description}</p>

            <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                    className="h-full rounded-full bg-[#1491FF] transition-[width] duration-500"
                    style={{
                        width: `${
                            typeof progress === "number"
                                ? clamp(progress, 0, 100)
                                : (currentStep / safeSteps.length) * 100
                        }%`,
                    }}
                />
            </div>

            <div className="mt-6 space-y-4">
                {safeSteps.map((label, index) => {
                    const completed = index + 1 < currentStep;
                    const active = index + 1 === currentStep;

                    return (
                        <div key={label} className="flex items-center gap-3">
                            <div
                                className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${
                                    completed
                                        ? "bg-emerald-50 text-emerald-600"
                                        : active
                                          ? "bg-[#1491FF]/10 text-[#0876D1]"
                                          : "bg-slate-50 text-slate-400"
                                }`}
                            >
                                {completed ? (
                                    <Check size={16} />
                                ) : active ? (
                                    <div className="size-4 animate-spin rounded-full border-2 border-[#1491FF]/20 border-t-[#1491FF]" />
                                ) : (
                                    <Circle size={15} />
                                )}
                            </div>

                            <span
                                className={`text-sm ${
                                    active
                                        ? "font-semibold text-slate-900"
                                        : completed
                                          ? "text-slate-500"
                                          : "text-slate-400"
                                }`}
                            >
                                {label}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#1491FF]" />

                <p className="text-xs leading-5 text-slate-500">
                    Your listing won't be ready for review until the required checks are complete.
                </p>
            </div>
        </section>
    );

    if (!fullScreen) return content;

    return (
        <main className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 py-8">
            {content}
        </main>
    );
}

/*
 * ============================================================
 * INLINE LOADER
 * ============================================================
 */

function InlineLoader({ title = "Please wait", description }: ListingPageLoaderProps) {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="flex items-center gap-3 rounded-2xl border border-[#1491FF]/15 bg-[#1491FF]/[0.04] p-4"
        >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#1491FF]/10">
                <div className="size-5 animate-spin rounded-full border-2 border-[#1491FF]/20 border-t-[#1491FF]" />
            </div>

            <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{title}</p>

                {description && (
                    <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
                )}
            </div>
        </div>
    );
}

/*
 * ============================================================
 * LISTING PAGE LOADER
 * ============================================================
 */

export default function ListingPageLoader({
    variant = "dashboard",
    ...props
}: ListingPageLoaderProps) {
    if (variant === "process") {
        return <ProcessLoader {...props} />;
    }

    if (variant === "inline") {
        return <InlineLoader {...props} />;
    }

    return <FullScreenLoader {...props} />;
}