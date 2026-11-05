"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CarFront, ShieldCheck } from "lucide-react";

interface KarmassLoadingOverlayProps {
    open: boolean;
    message?: string;
    detail?: string;
}

/** Full-screen branded feedback for important actions such as authentication. */
export function KarmassLoadingOverlay({
    open,
    message = "Getting things ready for you",
    detail = "Please keep this window open.",
}: KarmassLoadingOverlayProps) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="karmass-loading-overlay"
                    role="status"
                    aria-live="polite"
                    aria-label={`KARMASS: ${message}`}
                    aria-busy="true"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="fixed inset-0 z-[200] flex min-h-[100svh] items-center justify-center bg-white/95 px-6 py-10 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.985 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.99 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="flex w-full max-w-[340px] flex-col items-center text-center"
                    >
                        <div className="mb-5 grid size-[58px] place-items-center rounded-[19px] bg-[#1491FF] text-white shadow-[0_10px_28px_rgba(20,145,255,0.22)]">
                            <CarFront size={31} strokeWidth={2} aria-hidden="true" />
                        </div>

                        <p className="text-[25px] font-extrabold tracking-[0.17em] text-[#10243A]">
                            KAR<span className="text-[#1491FF]">MASS</span>
                        </p>

                        <p className="mt-3 text-[14px] font-semibold text-[#243B53]">
                            {message}
                        </p>
                        <p className="mt-1.5 text-[12px] leading-5 text-[#8292A6]">
                            {detail}
                        </p>

                        <div
                            aria-hidden="true"
                            className="karmass-loader-track mt-8 h-[4px] w-full overflow-hidden rounded-full bg-[#E3F0FC]"
                        >
                            <span className="karmass-loader-bar block h-full w-[38%] rounded-full bg-[#1491FF]" />
                        </div>

                        <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.13em] text-[#91A0B2]">
                            <ShieldCheck size={12} className="text-[#1491FF]" aria-hidden="true" />
                            SECURE EXPERIENCE
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
