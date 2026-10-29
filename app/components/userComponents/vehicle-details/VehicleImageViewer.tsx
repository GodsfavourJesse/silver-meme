"use client";

import Image from "next/image";

import {
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";

import {
    useEffect,
} from "react";

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

    useEffect(() => {
        if (!image) {
            return;
        }

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow = "hidden";

        function handleKeyDown(
            event: KeyboardEvent,
        ) {
            if (event.key === "Escape") {
                onClose();
            }

            if (
                event.key === "ArrowRight"
                && images.length > 1
            ) {
                onChange(
                    (activeIndex + 1) % images.length,
                );
            }

            if (
                event.key === "ArrowLeft"
                && images.length > 1
            ) {
                onChange(
                    (
                        activeIndex - 1 + images.length
                    ) % images.length,
                );
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            document.body.style.overflow =
                previousOverflow;

            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [
        activeIndex,
        images,
        image,
        onChange,
        onClose,
    ]);

    if (!image) {
        return null;
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Vehicle image gallery"
            className="fixed inset-0 z-[100] flex flex-col bg-black"
        >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4 text-white sm:px-8">
                <p className="text-sm font-medium">
                    Image {activeIndex + 1} of {images.length}
                </p>

                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close image viewer"
                    className="grid size-11 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
                >
                    <X size={22} />
                </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 sm:p-10">
                <Image
                    key={image.id}
                    src={image.detailUrl || image.url}
                    alt={`Vehicle photo ${activeIndex + 1}`}
                    fill
                    unoptimized
                    sizes="100vw"
                    className="object-contain"
                    priority
                />

                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() =>
                                onChange(
                                    (
                                        activeIndex
                                        - 1
                                        + images.length
                                    ) % images.length,
                                )
                            }
                            aria-label="Previous image"
                            className="absolute left-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 sm:left-8"
                        >
                            <ChevronLeft size={25} />
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                onChange(
                                    (
                                        activeIndex + 1
                                    ) % images.length,
                                )
                            }
                            aria-label="Next image"
                            className="absolute right-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 sm:right-8"
                        >
                            <ChevronRight size={25} />
                        </button>
                    </>
                )}
            </div>

            {images.length > 1 && (
                <div className="flex shrink-0 gap-2 overflow-x-auto border-t border-white/10 px-4 py-3 sm:justify-center sm:px-8">
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
                            className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                                index === activeIndex
                                    ? "border-white"
                                    : "border-transparent opacity-60 hover:opacity-100"
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
            )}
        </div>
    );
}