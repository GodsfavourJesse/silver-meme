"use client";

import { motion } from "framer-motion";
import {
    Check,
    Clock3,
    Sparkles,
} from "lucide-react";

import type {
    BoostPlan,
} from "@/app/types/user/boost/boost.types";

import {
    formatBoostDuration,
    formatBoostPrice,
} from "@/app/lib/user/boost/boost.utils";

interface BoostPlanCardProps {
    plan: BoostPlan;
    selected: boolean;
    onSelect: (plan: BoostPlan) => void;
}

export default function BoostPlanCard({
    plan,
    selected,
    onSelect,
}: BoostPlanCardProps) {
    return (
        <motion.button
            type="button"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => onSelect(plan)}
            aria-pressed={selected}
            className={`
                relative w-full rounded-2xl border p-4 text-left
                transition-all duration-200
                focus:outline-none focus-visible:ring-4
                focus-visible:ring-[#1491FF]/15
                ${
                    selected
                        ? "border-[#1491FF] bg-[#F0F8FF] shadow-[0_8px_25px_rgba(20,145,255,0.10)]"
                        : "border-slate-200 bg-white hover:border-[#1491FF]/50 hover:bg-slate-50/70"
                }
            `}
        >
            {selected && (
                <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#1491FF] text-white">
                    <Check size={14} strokeWidth={3} />
                </span>
            )}

            <div className="flex items-start gap-3">
                <div
                    className={`
                        flex h-11 w-11 shrink-0 items-center justify-center
                        rounded-xl transition-colors
                        ${
                            selected
                                ? "bg-[#1491FF] text-white"
                                : "bg-[#EAF5FF] text-[#1491FF]"
                        }
                    `}
                >
                    <Sparkles size={21} />
                </div>

                <div className="min-w-0 flex-1 pr-7">
                    <h3 className="text-sm font-bold text-slate-900">
                        {formatBoostDuration(plan.durationDays)} Boost
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Give your vehicle more visibility on KARMASS.
                    </p>
                </div>
            </div>

            <div className="mt-5 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
                <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                        Duration
                    </p>

                    <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                        <Clock3 size={14} className="text-[#1491FF]" />
                        {formatBoostDuration(plan.durationDays)}
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                        Total price
                    </p>

                    <p className="mt-1 text-lg font-extrabold tracking-tight text-slate-950">
                        {formatBoostPrice(
                            plan.price,
                            plan.currency,
                        )}
                    </p>
                </div>
            </div>

            {selected && (
                <div className="mt-3 rounded-lg bg-[#1491FF]/8 px-3 py-2 text-center text-xs font-semibold text-[#0877D9]">
                    Selected plan
                </div>
            )}
        </motion.button>
    );
}