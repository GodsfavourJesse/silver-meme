"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

interface ModalShellProps {
    titleId: string;
    eyebrow: string;
    eyebrowClassName: string;
    title: string;
    description: string;
    closeLabel: string;
    onClose: () => void;
    children: ReactNode;
}

export function ModalShell({
    titleId,
    eyebrow,
    eyebrowClassName,
    title,
    description,
    closeLabel,
    onClose,
    children,
}: ModalShellProps) {
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    const transition = {
        duration: shouldReduceMotion ? 0 : 0.25,
        ease: [0.22, 1, 0.36, 1] as const,
    };

    return (
        <motion.div
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
                duration: shouldReduceMotion ? 0 : 0.2,
            }}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
            className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-[3px] sm:items-center sm:p-5"
        >
            <motion.section
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={`${titleId}-description`}
                initial={
                    shouldReduceMotion
                        ? false
                        : { opacity: 0, y: 35, scale: 0.99 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                    shouldReduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: 20, scale: 0.99 }
                }
                transition={transition}
                onMouseDown={(event) => event.stopPropagation()}
                className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[24px] border border-slate-200/80 bg-white shadow-2xl sm:max-h-[min(85dvh,760px)] sm:rounded-2xl"
            >
                {/* Mobile sheet handle */}
                <div className="flex justify-center pt-3 sm:hidden">
                    <span className="h-1 w-10 rounded-full bg-slate-200" />
                </div>

                {/* Header */}
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">
                    <div className="min-w-0">
                        <p
                            className={`text-[11px] font-bold uppercase tracking-wider ${eyebrowClassName}`}
                        >
                            {eyebrow}
                        </p>

                        <h2
                            id={titleId}
                            className="mt-1.5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
                        >
                            {title}
                        </h2>

                        <p
                            id={`${titleId}-description`}
                            className="mt-1.5 max-w-sm text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6"
                        >
                            {description}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={closeLabel}
                        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-5 sm:px-6 sm:pb-6">
                    {children}
                </div>
            </motion.section>
        </motion.div>
    );
}