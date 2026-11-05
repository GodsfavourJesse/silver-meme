"use client";

import { useEffect, useState } from "react";

import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "framer-motion";

import {
    CarFront,
    ChevronRight,
    LogOut,
    LoaderCircle,
    X,
} from "lucide-react";

interface MobileLogoutProps {
    onLogout: () => void | Promise<void>;
    isLoggingOut: boolean;
    variant?: "button" | "menu";
}

export default function MobileLogout({
    onLogout,
    isLoggingOut,
    variant = "button",
}: MobileLogoutProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const shouldReduceMotion = useReducedMotion();

    function closeDialog() {
        if (!isLoggingOut) {
            setIsDialogOpen(false);
        }
    }

    async function confirmLogout() {
        if (isLoggingOut) return;

        setIsDialogOpen(false);

        await onLogout();
    }

    // Handle Escape key.
    useEffect(() => {
        if (!isDialogOpen || isLoggingOut) return;

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsDialogOpen(false);
            }
        }

        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isDialogOpen, isLoggingOut]);

    const tapAnimation = shouldReduceMotion
        ? undefined
        : { scale: 0.97 };

    return (
        <>
            {/* Logout trigger */}
            {variant === "menu" ? (
                <motion.button
                    type="button"
                    onClick={() => setIsDialogOpen(true)}
                    disabled={isLoggingOut}
                    whileTap={tapAnimation}
                    className="group flex min-h-[50px] w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-[#DC5555] transition-colors hover:bg-[#FFF3F3] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF0F0] text-[#DC5555] transition-colors group-hover:bg-white">
                        <LogOut size={18} />
                    </span>

                    <span className="flex-1 text-[13px] font-semibold">
                        Sign out
                    </span>

                    <ChevronRight
                        size={16}
                        className="text-[#E6A0A0] transition-transform group-hover:translate-x-0.5"
                    />
                </motion.button>
            ) : (
                <motion.button
                    type="button"
                    onClick={() => setIsDialogOpen(true)}
                    disabled={isLoggingOut}
                    whileTap={tapAnimation}
                    className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-[16px] border border-rose-100 bg-white text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <LogOut size={16} />
                    Sign out
                </motion.button>
            )}

            {/* Confirmation dialog */}
            <AnimatePresence>
                {isDialogOpen && !isLoggingOut && (
                    <motion.div
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-[#102A43]/35 px-5 py-6 backdrop-blur-[6px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: shouldReduceMotion ? 0 : 0.2,
                        }}
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                closeDialog();
                            }
                        }}
                    >
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="mobile-logout-title"
                            aria-describedby="mobile-logout-description"
                            initial={
                                shouldReduceMotion
                                    ? false
                                    : {
                                          opacity: 0,
                                          scale: 0.92,
                                          y: 20,
                                      }
                            }
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.95,
                                y: 12,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 350,
                                damping: 28,
                            }}
                            className="w-full max-w-[360px] overflow-hidden rounded-[28px] border border-white/80 bg-white p-6 shadow-[0_25px_80px_rgba(15,45,80,0.22)]"
                        >
                            {/* Close button */}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    aria-label="Close dialog"
                                    onClick={closeDialog}
                                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X size={17} />
                                </button>
                            </div>

                            {/* Icon */}
                            <motion.div
                                initial={
                                    shouldReduceMotion
                                        ? false
                                        : { scale: 0.7, rotate: -12 }
                                }
                                animate={{
                                    scale: 1,
                                    rotate: 0,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 15,
                                }}
                                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF1F1] text-[#E05252]"
                            >
                                <LogOut size={25} />
                            </motion.div>

                            {/* Content */}
                            <div className="mt-5 text-center">
                                <h2
                                    id="mobile-logout-title"
                                    className="text-lg font-bold tracking-tight text-[#1E293B]"
                                >
                                    Sign out of KARMASS?
                                </h2>

                                <p
                                    id="mobile-logout-description"
                                    className="mt-2 text-sm leading-6 text-[#8491A3]"
                                >
                                    Are you sure you want to sign out?
                                    You will need to log in again to
                                    access your account.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="mt-7 grid grid-cols-2 gap-3">
                                <motion.button
                                    type="button"
                                    onClick={closeDialog}
                                    whileTap={tapAnimation}
                                    className="flex h-12 items-center justify-center rounded-2xl border border-[#E6EDF5] bg-white text-sm font-semibold text-[#64748B] transition-colors hover:bg-[#F5F9FD]"
                                >
                                    Cancel
                                </motion.button>

                                <motion.button
                                    type="button"
                                    onClick={confirmLogout}
                                    whileTap={tapAnimation}
                                    className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#E05252] text-sm font-semibold text-white shadow-[0_5px_15px_rgba(224,82,82,0.2)] transition-colors hover:bg-[#CC4141]"
                                >
                                    <LogOut size={16} />
                                    Sign out
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* KARMASS loading overlay */}
            <AnimatePresence>
                {isLoggingOut && (
                    <motion.div
                        role="status"
                        aria-live="polite"
                        aria-busy="true"
                        className="fixed inset-0 z-[300] flex items-center justify-center bg-white/95 px-6 backdrop-blur-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: shouldReduceMotion ? 0 : 0.2,
                        }}
                    >
                        <motion.div
                            initial={
                                shouldReduceMotion
                                    ? false
                                    : {
                                          opacity: 0,
                                          scale: 0.9,
                                          y: 20,
                                      }
                            }
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            className="w-full max-w-[280px] text-center"
                        >
                            {/* Brand icon */}
                            <motion.div
                                animate={
                                    shouldReduceMotion
                                        ? undefined
                                        : { y: [0, -6, 0] }
                                }
                                transition={{
                                    duration: 1.8,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#1491FF] text-white shadow-[0_10px_30px_rgba(20,145,255,0.25)]"
                            >
                                <CarFront
                                    size={32}
                                    strokeWidth={2}
                                />
                            </motion.div>

                            <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#1491FF]">
                                KARMASS
                            </p>

                            <h2 className="mt-2 text-lg font-bold tracking-tight text-[#1E293B]">
                                Signing you out
                            </h2>

                            <p className="mt-2 text-sm text-[#8491A3]">
                                Securely ending your session...
                            </p>

                            {/* Animated progress */}
                            <div className="mt-7 h-1.5 w-full overflow-hidden rounded-full bg-[#EAF5FF]">
                                <motion.div
                                    className="h-full w-1/2 rounded-full bg-[#1491FF]"
                                    animate={
                                        shouldReduceMotion
                                            ? undefined
                                            : { x: ["-110%", "220%"] }
                                    }
                                    transition={{
                                        duration: 1.2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                />
                            </div>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-[#94A3B8]">
                                <LoaderCircle
                                    size={14}
                                    className="animate-spin text-[#1491FF]"
                                />
                                Please wait
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}