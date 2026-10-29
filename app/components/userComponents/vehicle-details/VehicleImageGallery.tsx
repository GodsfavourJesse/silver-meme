"use client";

import Image from "next/image";

import {
    CarFront,
    Expand,
    Images,
} from "lucide-react";

import {
    useState,
} from "react";

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
                size={64}
                strokeWidth={1.2}
            />

            <p className="mt-4 text-sm font-semibold text-slate-600">
                Vehicle images unavailable
            </p>

            <p className="mt-1 text-xs text-slate-500">
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
    const [activeIndex, setActiveIndex] =
        useState(0);

    const [viewerOpen, setViewerOpen] =
        useState(false);

    const activeImage = images[activeIndex];

    return (
        <>
            <section
                aria-label="Vehicle photos"
                className="min-w-0"
            >
                <div className="relative overflow-hidden rounded-2xl bg-slate-100 sm:rounded-3xl">
                    <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
                        {activeImage ? (
                            <button
                                type="button"
                                onClick={() =>
                                    setViewerOpen(true)
                                }
                                aria-label="Open fullscreen vehicle image"
                                className="absolute inset-0 block h-full w-full cursor-zoom-in"
                            >
                                <Image
                                    src={
                                        activeImage.detailUrl
                                        || activeImage.url
                                    }
                                    alt={title}
                                    fill
                                    unoptimized
                                    sizes="(max-width: 768px) 100vw, 70vw"
                                    priority
                                    className="object-cover transition duration-500 hover:scale-[1.015]"
                                />
                            </button>
                        ) : (
                            <EmptyVehicleImage />
                        )}

                        {isBoosted && (
                            <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-amber-400 px-3 py-2 text-xs font-bold text-slate-950 shadow-sm">
                                <span
                                    aria-hidden="true"
                                    className="size-2 rounded-full bg-slate-950"
                                />
                                Featured listing
                            </span>
                        )}

                        {images.length > 0 && (
                            <button
                                type="button"
                                onClick={() =>
                                    setViewerOpen(true)
                                }
                                className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 rounded-xl bg-black/70 px-3.5 py-2.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/85"
                            >
                                <Expand size={15} />
                                View fullscreen
                            </button>
                        )}
                    </div>
                </div>

                {images.length > 1 && (
                    <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                        {images.map((image, index) => (
                            <button
                                key={image.id}
                                type="button"
                                onClick={() =>
                                    setActiveIndex(index)
                                }
                                aria-label={`View vehicle image ${index + 1}`}
                                aria-current={
                                    index === activeIndex
                                        ? "true"
                                        : undefined
                                }
                                className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-24 sm:w-32 ${
                                    index === activeIndex
                                        ? "border-violet-700 ring-2 ring-violet-100"
                                        : "border-transparent opacity-75 hover:opacity-100"
                                }`}
                            >
                                <Image
                                    src={
                                        image.thumbnailUrl
                                        || image.url
                                    }
                                    alt={`${title}, photo ${index + 1}`}
                                    fill
                                    unoptimized
                                    sizes="128px"
                                    className="object-cover"
                                />
                            </button>
                        ))}

                        <div className="flex min-w-20 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-3 text-xs font-medium text-slate-500">
                            <Images
                                size={15}
                                className="mr-1.5"
                            />
                            {images.length} photos
                        </div>
                    </div>
                )}
            </section>

            {viewerOpen && images.length > 0 && (
                <VehicleImageViewer
                    images={images}
                    activeIndex={activeIndex}
                    onChange={setActiveIndex}
                    onClose={() =>
                        setViewerOpen(false)
                    }
                />
            )}
        </>
    );
}