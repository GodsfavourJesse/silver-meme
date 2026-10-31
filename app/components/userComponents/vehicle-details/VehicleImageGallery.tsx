"use client";

import Image from "next/image";
import {
    useState,
} from "react";

import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "framer-motion";

import {
    CarFront,
    Expand,
    Images,
} from "lucide-react";

import type {
    VehicleDetailsImage,
} from "@/app/types/user/vehicle-details.types";

import {
    VehicleImageViewer,
} from "./VehicleImageViewer";

interface VehicleImageGalleryProps {
    images: VehicleDetailsImage[];
    title: string;
    isBoosted: boolean;
}

function EmptyVehicleImage() {
    return (
        <div className="flex h-full min-h-64 flex-col items-center justify-center bg-slate-100 text-slate-400">
            <CarFront
                size={58}
                strokeWidth={1.2}
            />

            <p className="mt-4 text-sm font-semibold text-slate-600">
                Vehicle images unavailable
            </p>

            <p className="mt-1 px-4 text-center text-xs text-slate-500">
                The seller has not provided a displayable image.
            </p>
        </div>
    );
}

export function VehicleImageGallery({
    images,
    title,
    isBoosted,
}: VehicleImageGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [viewerOpen, setViewerOpen] = useState(false);

    const shouldReduceMotion = useReducedMotion();

    const activeImage = images[activeIndex];

    const imageTransition = shouldReduceMotion
        ? { duration: 0 }
        : {
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1] as const,
          };

    return (
        <>
            <section
                aria-label="Vehicle photos"
                className="min-w-0"
            >
                {/* Main image */}
                <div className="relative overflow-hidden bg-slate-100">
                    <div className="relative aspect-[4/3] w-full bg-slate-100 sm:aspect-[16/10] lg:aspect-[16/11]">

                        <AnimatePresence mode="wait" initial={false}>
                            {activeImage ? (
                                <motion.button
                                    key={activeImage.id}
                                    type="button"
                                    onClick={() => setViewerOpen(true)}
                                    aria-label="Open fullscreen vehicle image"
                                    initial={
                                        shouldReduceMotion
                                            ? false
                                            : { opacity: 0 }
                                    }
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={imageTransition}
                                    className="absolute inset-0 z-0 block h-full w-full cursor-zoom-in"
                                >
                                    <Image
                                        src={
                                            activeImage.detailUrl ||
                                            activeImage.url
                                        }
                                        alt={`${title} - vehicle photo ${activeIndex + 1}`}
                                        fill
                                        unoptimized
                                        sizes="(max-width: 768px) 100vw, 70vw"
                                        priority={activeIndex === 0}
                                        className="object-cover"
                                    />
                                </motion.button>
                            ) : (
                                <motion.div
                                    key="empty-image"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0"
                                >
                                    <EmptyVehicleImage />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Image gradient for overlay contrast */}
                        {activeImage && (
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-24 bg-gradient-to-t from-black/30 to-transparent" />
                        )}

                        {/* Featured badge */}
                        {isBoosted && (
                            <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-3 py-2 text-[11px] font-bold text-slate-950 shadow-sm sm:left-5 sm:top-5">
                                <span className="size-1.5 rounded-full bg-slate-950" />
                                Featured listing
                            </div>
                        )}

                        {/* Image count */}
                        {images.length > 0 && (
                            <div className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-lg bg-black/55 px-3 py-2 text-[11px] font-semibold text-white backdrop-blur-md sm:bottom-5 sm:left-5">
                                <Images size={14} />
                                {activeIndex + 1} / {images.length}
                            </div>
                        )}

                        {/* Fullscreen button */}
                        {images.length > 0 && (
                            <motion.button
                                type="button"
                                whileTap={
                                    shouldReduceMotion
                                        ? undefined
                                        : { scale: 0.96 }
                                }
                                onClick={() => setViewerOpen(true)}
                                className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2.5 text-[11px] font-semibold text-slate-800 shadow-sm backdrop-blur transition hover:bg-white sm:bottom-5 sm:right-5 sm:px-4"
                            >
                                <Expand size={14} />
                                View photos
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Thumbnail navigation */}
                {images.length > 1 && (
                    <div className="border-t border-slate-100 bg-white px-3 py-3 sm:px-4 sm:py-4">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-[11px] font-semibold text-slate-500">
                                Photos
                                <span className="ml-1 text-slate-400">
                                    ({images.length})
                                </span>
                            </p>

                            <p className="text-[10px] font-medium text-slate-400">
                                Select to view
                            </p>
                        </div>

                        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
                            {images.map((image, index) => {
                                const isActive = index === activeIndex;

                                return (
                                    <motion.button
                                        key={image.id}
                                        type="button"
                                        onClick={() => setActiveIndex(index)}
                                        whileTap={
                                            shouldReduceMotion
                                                ? undefined
                                                : { scale: 0.96 }
                                        }
                                        aria-label={`View vehicle image ${index + 1}`}
                                        aria-current={
                                            isActive ? "true" : undefined
                                        }
                                        className={`relative h-[66px] w-[84px] shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 sm:h-[76px] sm:w-[104px] ${
                                            isActive
                                                ? "border-[#1491FF] ring-2 ring-blue-50"
                                                : "border-transparent opacity-70 hover:border-slate-300 hover:opacity-100"
                                        }`}
                                    >
                                        <Image
                                            src={
                                                image.thumbnailUrl ||
                                                image.url
                                            }
                                            alt={`${title}, photo ${index + 1}`}
                                            fill
                                            unoptimized
                                            sizes="104px"
                                            className="object-cover"
                                        />

                                        {!isActive && (
                                            <span className="absolute inset-0 bg-black/10 transition hover:bg-transparent" />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </section>

            {/* Fullscreen viewer */}
            <AnimatePresence>
                {viewerOpen && images.length > 0 && (
                    <VehicleImageViewer
                        images={images}
                        activeIndex={activeIndex}
                        onChange={setActiveIndex}
                        onClose={() => setViewerOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}