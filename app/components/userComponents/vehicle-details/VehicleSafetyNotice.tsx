"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

const SAFETY_TIPS = [
    {
        title: "Inspect before you pay",
        description:
            "Arrange an in-person inspection. Verify the vehicle, ownership documents, and seller's identity before making a payment.",
    },
    {
        title: "Avoid advance payments",
        description:
            "Do not send deposits or make payments until you have independently verified the vehicle and seller.",
    },
    {
        title: "Get a mechanical inspection",
        description:
            "Ask a qualified mechanic to examine the vehicle before committing to the purchase.",
    },
    {
        title: "Understand verification",
        description:
            "A verified dealer badge does not guarantee vehicle condition, mechanical quality, or protection against fraud.",
    },
];

export function VehicleSafetyNotice() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.section
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
                duration: shouldReduceMotion ? 0 : 0.45,
                ease: "easeOut",
            }}
            className="mt-8 overflow-hidden rounded-2xl border border-amber-200/80 bg-[#FFFCF5] sm:mt-10"
        >
            <div className="border-b border-amber-100 px-4 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                        <AlertTriangle size={20} />
                    </span>

                    <div>
                        <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                            Stay safe when buying
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                            A few important things to remember before making a purchase.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-6 sm:px-6 sm:py-3">
                {SAFETY_TIPS.map((tip, index) => (
                    <motion.div
                        key={tip.title}
                        initial={
                            shouldReduceMotion
                                ? false
                                : { opacity: 0, y: 8 }
                        }
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                            duration: shouldReduceMotion ? 0 : 0.3,
                            delay: shouldReduceMotion
                                ? 0
                                : index * 0.06,
                        }}
                        className="flex items-start gap-3 border-b border-amber-100/80 px-4 py-4 last:border-0 sm:px-0"
                    >
                        <CheckCircle2
                            size={17}
                            className="mt-0.5 shrink-0 text-amber-700"
                        />

                        <div>
                            <h3 className="text-[13px] font-semibold text-slate-800 sm:text-sm">
                                {tip.title}
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-[13px] sm:leading-6">
                                {tip.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}