"use client";

import Image from "next/image";

import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "framer-motion";

import {
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";

import { useEffect } from "react";

import type {
    VehicleDetailsImage,
} from "@/app/types/user/vehicle-details.types";

interface VehicleImageViewerProps {
    images: VehicleDetailsImage[];
    activeIndex: number;
    onClose: () => void;
    onChange: (index: number) => void;
}

export function VehicleImageViewer({
    images,
    activeIndex,
    onClose,
    onChange,
}: VehicleImageViewerProps) {
    const image = images[activeIndex];
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        if (!image) return;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }

            if (event.key === "ArrowRight" && images.length > 1) {
                onChange((activeIndex + 1) % images.length);
            }

            if (event.key === "ArrowLeft" && images.length > 1) {
                onChange(
                    (activeIndex - 1 + images.length) % images.length,
                );
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [activeIndex, images.length, image, onChange, onClose]);

    if (!image) return null;

    const previousImage = () => {
        onChange((activeIndex - 1 + images.length) % images.length);
    };

    const nextImage = () => {
        onChange((activeIndex + 1) % images.length);
    };

    return (
        <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Vehicle image gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
                duration: shouldReduceMotion ? 0 : 0.2,
            }}
            className="fixed inset-0 z-[100] flex flex-col bg-[#080B10]"
        >
            {/* Header */}
            <div className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:h-16 sm:px-7">
                <div>
                    <p className="text-sm font-semibold text-white">
                        Vehicle photos
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                        {activeIndex + 1} of {images.length}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close image viewer"
                    className="flex size-10 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1491FF]"
                >
                    <X size={22} />
                </button>
            </div>

            {/* Main image */}
            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3 py-5 sm:px-12 sm:py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={image.id}
                        initial={
                            shouldReduceMotion
                                ? false
                                : { opacity: 0, scale: 0.985 }
                        }
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: shouldReduceMotion ? 0 : 0.2,
                        }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={image.detailUrl || image.url}
                            alt={`Vehicle photo ${activeIndex + 1}`}
                            fill
                            unoptimized
                            sizes="100vw"
                            className="object-contain"
                            priority
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Previous */}
                {images.length > 1 && (
                    <button
                        type="button"
                        onClick={previousImage}
                        aria-label="Previous image"
                        className="absolute left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-sm transition hover:bg-white/20 sm:left-6 sm:size-12"
                    >
                        <ChevronLeft size={23} />
                    </button>
                )}

                {/* Next */}
                {images.length > 1 && (
                    <button
                        type="button"
                        onClick={nextImage}
                        aria-label="Next image"
                        className="absolute right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-sm transition hover:bg-white/20 sm:right-6 sm:size-12"
                    >
                        <ChevronRight size={23} />
                    </button>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="relative z-20 shrink-0 border-t border-white/10 bg-[#080B10] px-3 py-3 sm:px-6">
                    <div className="mx-auto flex max-w-full gap-2 overflow-x-auto pb-1 sm:justify-center">
                        {images.map((item, index) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onChange(index)}
                                aria-label={`View image ${index + 1}`}
                                aria-current={
                                    index === activeIndex
                                        ? "true"
                                        : undefined
                                }
                                className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-14 sm:w-20 ${
                                    index === activeIndex
                                        ? "border-[#1491FF] opacity-100"
                                        : "border-transparent opacity-50 hover:opacity-100"
                                }`}
                            >
                                <Image
                                    src={item.thumbnailUrl || item.url}
                                    alt=""
                                    fill
                                    unoptimized
                                    sizes="80px"
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}