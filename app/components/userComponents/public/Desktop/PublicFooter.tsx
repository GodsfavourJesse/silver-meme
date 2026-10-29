"use client";

import Link from "next/link";
import {
    ArrowUpRight,
    // Facebook,
    // Instagram,
    // Linkedin,
    Mail,
    MapPin,
    MoveUpRight,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { CurrentYear } from "@/app/utils/current-year";

const BRAND = "#1491FF";

const footerLinks = [
    {
        heading: "Marketplace",
        links: [
            { label: "Browse vehicles", href: "/marketplace" },
            { label: "Sell your car", href: "/sell" },
            { label: "Find dealers", href: "/dealers" },
        ],
    },
    {
        heading: "Your account",
        links: [
            { label: "Sign in", href: "/sign-in" },
            { label: "Create account", href: "/register" },
        ],
    },
    {
        heading: "Help & support",
        links: [
            { label: "Help centre", href: "/help" },
            { label: "Contact us", href: "/contact" },
        ],
    },
];

const socialLinks = [
    {
        label: "Facebook",
        href: "https://www.facebook.com/",
        // icon: Facebook,
    },
    {
        label: "Instagram",
        href: "https://www.instagram.com/",
        // icon: Instagram,
    },
    {
        label: "LinkedIn",
        href: "https://www.linkedin.com/",
        // icon: Linkedin,
    },
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 14,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.45,
            ease: "easeOut" as const,
        },
    },
};

export function PublicFooter() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <footer className="relative overflow-hidden border-t border-slate-200 bg-white">
            <motion.div
                initial={
                    shouldReduceMotion
                        ? false
                        : { opacity: 0, y: 18 }
                }
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.08 }}
                transition={{
                    duration: shouldReduceMotion ? 0 : 0.5,
                    ease: "easeOut",
                }}
            >
                <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
                    {/* Main footer */}
                    <motion.div
                        variants={containerVariants}
                        initial={shouldReduceMotion ? false : "hidden"}
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.08 }}
                        className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1fr] lg:gap-12 lg:py-16"
                    >
                        {/* Brand */}
                        <motion.div
                            variants={itemVariants}
                            className="sm:col-span-2 lg:col-span-1"
                        >
                            <Link
                                href="/"
                                aria-label="KARMASS home"
                                className="group flex min-w-0 items-center gap-2.5"
                            >
                                <span
                                    className="
                                        flex h-10 w-10 shrink-0
                                        items-center justify-center
                                        border border-[#E6EDF5] bg-white
                                        text-[16px] font-semibold
                                        tracking-[-0.08em]
                                        text-[#1491FF]
                                        transition-colors
                                        group-hover:border-[#1491FF]
                                    "
                                >
                                    K.
                                </span>

                                <span className="min-w-0">
                                    <span className="block text-[15px] font-semibold leading-5 tracking-[0.15em] text-[#20201F]">
                                        KARMASS
                                    </span>

                                    <span className="mt-0.5 block text-[8px] font-medium uppercase tracking-[0.17em] text-[#8491A3]">
                                        Find your drive
                                    </span>
                                </span>
                            </Link>

                            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-500">
                                Find your next car with confidence.
                                Explore vehicles, connect with dealers,
                                and make your next move with KARMASS.
                            </p>

                            <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                                <MapPin
                                    size={16}
                                    className="shrink-0"
                                    style={{ color: BRAND }}
                                />
                                <span>Connecting car buyers across Nigeria</span>
                            </div>

                            {/* Social links */}
                            <div className="mt-6 flex items-center gap-2.5">
                                {socialLinks.map((social) => {
                                    // const Icon = social.icon;

                                    return (
                                        <a
                                            key={social.label}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={social.label}
                                            className="group flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-all duration-200 hover:border-[#1491FF] hover:bg-[#1491FF]/5 hover:text-[#1491FF]"
                                        >
                                            {/* <Icon
                                                size={17}
                                                strokeWidth={1.8}
                                                className="transition-transform duration-200 group-hover:scale-110"
                                            /> */}
                                        </a>
                                    );
                                })}

                                <a
                                    href="mailto:support@karmass.com"
                                    aria-label="Email KARMASS support"
                                    className="group flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-all duration-200 hover:border-[#1491FF] hover:bg-[#1491FF]/5 hover:text-[#1491FF]"
                                >
                                    <Mail
                                        size={17}
                                        strokeWidth={1.8}
                                        className="transition-transform duration-200 group-hover:scale-110"
                                    />
                                </a>
                            </div>
                        </motion.div>

                        {/* Link groups */}
                        {footerLinks.map((group) => (
                            <motion.div
                                key={group.heading}
                                variants={itemVariants}
                            >
                                <h2 className="text-sm font-bold text-slate-900">
                                    {group.heading}
                                </h2>

                                <div
                                    className="mt-3 h-0.5 w-8 rounded-full"
                                    style={{ backgroundColor: BRAND }}
                                />

                                <ul className="mt-5 space-y-3.5">
                                    {group.links.map((item) => (
                                        <li key={item.label}>
                                            <Link
                                                href={item.href}
                                                className="group inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors duration-200 hover:text-[#1491FF]"
                                            >
                                                <span>{item.label}</span>

                                                <MoveUpRight
                                                    size={13}
                                                    className="translate-y-0.5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0 group-hover:opacity-100"
                                                />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Bottom bar */}
                    <div className="border-t border-slate-200 py-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs leading-5 text-slate-500">
                                © <CurrentYear /> KARMASS. All rights
                                reserved.
                            </p>

                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span
                                    className="size-1.5 rounded-full"
                                    style={{ backgroundColor: BRAND }}
                                />

                                <span>
                                    A better way to find your next car.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </footer>
    );
}

export default PublicFooter;