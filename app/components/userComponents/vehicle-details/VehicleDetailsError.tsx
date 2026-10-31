"use client";

import Link from "next/link";

import { motion, useReducedMotion } from "framer-motion";

import {
    ArrowLeft,
    ArrowRight,
    CircleAlert,
    RefreshCw,
} from "lucide-react";

interface VehicleDetailsErrorProps {
    message: string;
    onRetry: () => void;
}

export function VehicleDetailsError({
    message,
    onRetry,
}: VehicleDetailsErrorProps) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <main className="flex min-h-[75vh] items-center justify-center bg-[#F7F9FC] px-4 py-12">
            <motion.div
                initial={
                    shouldReduceMotion
                        ? false
                        : { opacity: 0, y: 16 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: shouldReduceMotion ? 0 : 0.35,
                    ease: "easeOut",
                }}
                className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-9"
            >
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <CircleAlert size={26} />
                </div>

                <h1 className="mt-5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    Vehicle unavailable
                </h1>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    {message ||
                        "We couldn't load this vehicle. It may have been removed, sold, or is temporarily unavailable."}
                </p>

                <div className="mt-7 flex flex-col gap-3">
                    <motion.button
                        type="button"
                        onClick={onRetry}
                        whileTap={
                            shouldReduceMotion
                                ? undefined
                                : { scale: 0.98 }
                        }
                        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1491FF] px-5 text-sm font-semibold text-white transition hover:bg-[#087FE5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                    >
                        <RefreshCw size={17} />
                        Try again
                    </motion.button>

                    <Link
                        href="/marketplace"
                        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        <ArrowLeft size={16} />
                        Back to marketplace
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}