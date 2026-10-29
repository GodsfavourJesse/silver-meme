"use client";

import {
    motion,
    useReducedMotion,
    AnimatePresence,
} from "framer-motion";

import type { ReactNode } from "react";

export function useRegistrationMotion() {
    const shouldReduceMotion = useReducedMotion();

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: shouldReduceMotion ? 0 : 0.09,
                delayChildren: shouldReduceMotion ? 0 : 0.08,
            },
        },
    };

    const itemVariants = {
        hidden: {
            opacity: shouldReduceMotion ? 1 : 0,
            y: shouldReduceMotion ? 0 : 18,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: shouldReduceMotion ? 0 : 0.45,
                ease: [0.22, 1, 0.36, 1] as const,
            },
        },
    };

    return {
        shouldReduceMotion,
        containerVariants,
        itemVariants,
    };
}

export function AnimatedSection({
    children,
    className = "",
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.div
            initial={
                shouldReduceMotion
                    ? false
                    : { opacity: 0, y: 18 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: shouldReduceMotion ? 0 : 0.45,
                delay: shouldReduceMotion ? 0 : delay,
                ease: [0.22, 1, 0.36, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedError({
    children,
}: {
    children: ReactNode;
}) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <AnimatePresence initial={false}>
            {children && (
                <motion.div
                    initial={
                        shouldReduceMotion
                            ? false
                            : { opacity: 0, height: 0, y: -5 }
                    }
                    animate={{
                        opacity: 1,
                        height: "auto",
                        y: 0,
                    }}
                    exit={{
                        opacity: 0,
                        height: 0,
                        y: -5,
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}