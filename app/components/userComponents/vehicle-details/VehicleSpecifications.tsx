"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
    CarFront,
    Fuel,
    Gauge,
    Settings2,
    Users,
    Zap,
} from "lucide-react";

import type { VehicleDetailsResponse } from "@/app/types/user/vehicle-details.types";

import {
    formatEnum,
    formatNumber,
} from "@/app/lib/user/vehicle/vehicle-details-format";

interface SpecificationItem {
    label: string;
    value: string | null;
    icon: ReactNode;
}

function buildSpecifications(
    details: VehicleDetailsResponse,
): SpecificationItem[] {
    const { listing, variant } = details;

    const specifications: SpecificationItem[] = [
        {
            label: "Mileage",
            value:
                listing.mileage != null
                    ? `${formatNumber(listing.mileage)} km`
                    : null,
            icon: <Gauge size={18} />,
        },
        {
            label: "Engine",
            value:
                variant.engineName ||
                (variant.engineDisplacementCc != null
                    ? `${variant.engineDisplacementCc.toLocaleString("en-NG")} cc`
                    : null),
            icon: <Settings2 size={18} />,
        },
        {
            label: "Fuel type",
            value: formatEnum(variant.fuelType),
            icon: <Fuel size={18} />,
        },
        {
            label: "Transmission",
            value: formatEnum(variant.transmission),
            icon: <Settings2 size={18} />,
        },
        {
            label: "Drive type",
            value: formatEnum(variant.driveType),
            icon: <CarFront size={18} />,
        },
        {
            label: "Body style",
            value: formatEnum(variant.bodyStyle),
            icon: <CarFront size={18} />,
        },
        {
            label: "Doors",
            value: variant.doors != null ? String(variant.doors) : null,
            icon: <CarFront size={18} />,
        },
        {
            label: "Seats",
            value: variant.seats != null ? String(variant.seats) : null,
            icon: <Users size={18} />,
        },
        {
            label: "Cylinders",
            value:
                variant.cylinders != null
                    ? String(variant.cylinders)
                    : null,
            icon: <Settings2 size={18} />,
        },
        {
            label: "Horsepower",
            value:
                variant.horsepower != null
                    ? `${variant.horsepower} hp`
                    : null,
            icon: <Zap size={18} />,
        },
    ];

    return specifications.filter(
        (item) => item.value !== null && item.value !== "",
    );
}

interface VehicleSpecificationProps extends SpecificationItem {
    index: number;
    reduceMotion: boolean;
}

function VehicleSpecification({
    icon,
    label,
    value,
    index,
    reduceMotion,
}: VehicleSpecificationProps) {
    return (
        <motion.div
            initial={
                reduceMotion
                    ? false
                    : { opacity: 0, y: 12 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
                duration: reduceMotion ? 0 : 0.35,
                delay: reduceMotion ? 0 : Math.min(index * 0.045, 0.3),
                ease: "easeOut",
            }}
            className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 transition-colors duration-200 hover:border-blue-100 hover:bg-blue-50/30 sm:p-3.5"
        >
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-[#1491FF]">
                {icon}
            </span>

            <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 sm:text-xs">
                    {label}
                </p>

                <p className="mt-1 break-words text-[13px] font-semibold leading-5 text-slate-900 sm:text-sm">
                    {value}
                </p>
            </div>
        </motion.div>
    );
}

interface VehicleSpecificationsProps {
    details: VehicleDetailsResponse;
    /** Desktop appears in the main column; mobile appears in the side column. */
    variant: "desktop" | "mobile";
}

export function VehicleSpecifications({
    details,
    variant,
}: VehicleSpecificationsProps) {
    const specifications = buildSpecifications(details);
    const shouldReduceMotion = useReducedMotion();

    if (specifications.length === 0) {
        return null;
    }

    const isMobile = variant === "mobile";

    return (
        <section
            className={
                isMobile
                    ? "mt-5 rounded-2xl border border-slate-200 bg-white p-4 md:hidden"
                    : "mt-8 hidden md:block"
            }
        >
            {/* Section heading */}
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                        Specifications
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                        Key details about this vehicle
                    </p>
                </div>

                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1491FF]">
                    <CarFront size={19} />
                </span>
            </div>

            {/* Specifications grid */}
            <div
                className={`mt-4 grid grid-cols-1 gap-2.5 sm:gap-3 ${
                    isMobile ? "" : "xl:grid-cols-3"
                }`}
            >
                {specifications.map((item, index) => (
                    <VehicleSpecification
                        key={item.label}
                        {...item}
                        index={index}
                        reduceMotion={Boolean(shouldReduceMotion)}
                    />
                ))}
            </div>
        </section>
    );
}