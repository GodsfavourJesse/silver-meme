"use client";

import { motion, useReducedMotion } from "framer-motion";

import {
    Heart,
    LoaderCircle,
    MessageCircle,
} from "lucide-react";

interface VehicleMobileActionBarProps {
    favorite: boolean;
    favoriteLoading: boolean;
    onFavorite: () => void;
    onContact: () => void;
}

export function VehicleMobileActionBar({
    favorite,
    favoriteLoading,
    onFavorite,
    onContact,
}: VehicleMobileActionBarProps) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.div
            initial={
                shouldReduceMotion
                    ? false
                    : { opacity: 0, y: 24 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: shouldReduceMotion ? 0 : 0.3,
                ease: "easeOut",
            }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 md:hidden"
        >
            <div className="mx-auto flex max-w-xl items-center gap-3">
                <motion.button
                    type="button"
                    onClick={onFavorite}
                    disabled={favoriteLoading}
                    aria-label={
                        favorite
                            ? "Remove from favourites"
                            : "Save to favourites"
                    }
                    aria-pressed={favorite}
                    whileTap={
                        shouldReduceMotion
                            ? undefined
                            : { scale: 0.94 }
                    }
                    className={`flex size-12 shrink-0 items-center justify-center rounded-xl border transition-colors disabled:opacity-60 ${
                        favorite
                            ? "border-rose-200 bg-rose-50 text-rose-600"
                            : "border-slate-200 bg-white text-slate-700"
                    }`}
                >
                    {favoriteLoading ? (
                        <LoaderCircle
                            size={20}
                            className="animate-spin"
                        />
                    ) : (
                        <Heart
                            size={20}
                            fill={favorite ? "currentColor" : "none"}
                        />
                    )}
                </motion.button>

                <motion.button
                    type="button"
                    onClick={onContact}
                    whileTap={
                        shouldReduceMotion
                            ? undefined
                            : { scale: 0.98 }
                    }
                    className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#087FE5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                >
                    <MessageCircle size={18} />
                    Contact seller
                </motion.button>
            </div>
        </motion.div>
    );
}