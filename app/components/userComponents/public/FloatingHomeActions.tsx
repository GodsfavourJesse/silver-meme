"use client";

import Link from "next/link";
import { CarFront, Search } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { PublicAccountLink } from "@/app/components/auth/PublicAccountLink";

export function FloatingHomeActions() {
    const reduceMotion = useReducedMotion();

    return (
        <>
            <aside aria-label="Quick actions" className="fixed bottom-7 right-8 z-30 hidden md:block">
                <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/90 p-2.5 shadow-[0_12px_40px_rgba(7,70,130,0.22)] backdrop-blur-xl">
                <Link
                    href="/marketplace"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#D7E9FA] bg-white px-5 text-sm font-bold text-[#0B5CAD] transition hover:border-[#1491FF] hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                >
                    <Search size={17} aria-hidden="true" />
                    Buy
                </Link>

                <PublicAccountLink
                    href="/account"
                    authenticatedHref="/dashboard/my-listings"
                    aria-label="Sell a vehicle"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0877D9] via-[#1491FF] to-[#0877D9] px-5 text-sm font-bold text-white shadow-md shadow-blue-900/20 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                >
                    <CarFront size={18} aria-hidden="true" />
                    Sell
                </PublicAccountLink>
                </div>
            </aside>

            <aside aria-label="Quick actions" className="fixed bottom-[calc(92px+env(safe-area-inset-bottom))] right-4 z-30 flex flex-col gap-3 md:hidden">
                <motion.div
                    animate={reduceMotion ? undefined : { y: [0, -5, 0], boxShadow: ["0 7px 18px rgba(8,119,217,0.25)", "0 11px 25px rgba(20,145,255,0.42)", "0 7px 18px rgba(8,119,217,0.25)"] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                    whileTap={reduceMotion ? undefined : { scale: 0.93 }}
                    className="grid size-14 place-items-center rounded-full border border-white bg-white text-[#0877D9] ring-1 ring-[#1491FF]/25"
                >
                    <Link href="/marketplace" aria-label="Buy a vehicle" className="grid size-full place-items-center rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300">
                        <Search size={22} strokeWidth={2.2} aria-hidden="true" />
                        <span className="sr-only">Buy</span>
                    </Link>
                </motion.div>

                <motion.div
                    animate={reduceMotion ? undefined : { y: [0, -5, 0], boxShadow: ["0 7px 18px rgba(8,119,217,0.32)", "0 12px 28px rgba(20,145,255,0.55)", "0 7px 18px rgba(8,119,217,0.32)"] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.35 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.93 }}
                    className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-[#0877D9] via-[#1491FF] to-[#0877D9] text-white ring-1 ring-white/70"
                >
                    <PublicAccountLink href="/account" authenticatedHref="/dashboard/my-listings" aria-label="Sell a vehicle" className="grid size-full place-items-center rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300">
                        <CarFront size={23} strokeWidth={2.1} aria-hidden="true" />
                        <span className="sr-only">Sell</span>
                    </PublicAccountLink>
                </motion.div>
            </aside>
        </>
    );
}
