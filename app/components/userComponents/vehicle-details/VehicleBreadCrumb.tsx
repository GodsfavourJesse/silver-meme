"use client";

import Link from "next/link";

import { motion, useReducedMotion } from "framer-motion";

import {
    ChevronRight,
    Home,
} from "lucide-react";

export function VehicleBreadcrumb({ title }: { title: string }) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.nav
            aria-label="Breadcrumb"
            initial={
                shouldReduceMotion
                    ? false
                    : { opacity: 0, y: -5 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: shouldReduceMotion ? 0 : 0.25,
            }}
            className="flex min-w-0 items-center gap-2 py-4 text-xs sm:py-5 sm:text-sm"
        >
            <Link
                href="/marketplace"
                className="inline-flex shrink-0 items-center gap-2 font-medium text-slate-500 transition-colors hover:text-[#1491FF]"
            >
                <Home size={15} />
                <span>Marketplace</span>
            </Link>

            <ChevronRight
                size={14}
                className="shrink-0 text-slate-300"
            />

            <span
                aria-current="page"
                className="min-w-0 truncate font-medium text-slate-800"
            >
                {title}
            </span>
        </motion.nav>
    );
}