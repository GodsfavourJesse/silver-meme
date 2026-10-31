"use client";

import { motion, useReducedMotion } from "framer-motion";

interface VehicleDescriptionProps {
    description: string | null | undefined;
    variant: "desktop" | "mobile";
}

const FALLBACK =
    "The seller has not provided a description for this vehicle.";

export function VehicleDescription({
    description,
    variant,
}: VehicleDescriptionProps) {
    const shouldReduceMotion = useReducedMotion();
    const text = description?.trim() || FALLBACK;

    const isMobile = variant === "mobile";

    return (
        <motion.section
            initial={
                shouldReduceMotion
                    ? false
                    : { opacity: 0, y: 12 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
                duration: shouldReduceMotion ? 0 : 0.35,
                ease: "easeOut",
            }}
            className={
                isMobile
                    ? "mt-5 rounded-2xl border border-slate-200 bg-white p-4 md:hidden"
                    : "mt-8 hidden md:block"
            }
        >
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                    About this vehicle
                </h2>
            </div>

            <div
                className={
                    isMobile
                        ? "mt-3"
                        : "mt-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
                }
            >
                <p
                    className={`whitespace-pre-line break-words text-sm leading-7 ${
                        description?.trim()
                            ? "text-slate-600"
                            : "text-slate-400"
                    }`}
                >
                    {text}
                </p>
            </div>
        </motion.section>
    );
}