"use client";

import { motion, useReducedMotion } from "framer-motion";

import {
    CarFront,
    Fuel,
    Gauge,
    Settings2,
    Users,
} from "lucide-react";

import type { ReactNode } from "react";

import type { VehicleDetailsResponse } from "@/app/types/user/vehicle-details.types";

import {
    formatEnum,
    formatNumber,
} from "@/app/lib/user/vehicle/vehicle-details-format";

interface SpecificationItem {
    label: string;
    value: string;
    icon: ReactNode;
}

function buildSpecifications(
    details: VehicleDetailsResponse,
): SpecificationItem[] {
    const { listing, variant } = details;

    const specifications: Array<SpecificationItem | null> = [
        listing.mileage != null
            ? {
                  label: "Mileage",
                  value: `${formatNumber(listing.mileage)} km`,
                  icon: <Gauge size={18} />,
              }
            : null,

        variant?.engineName ||
        variant?.engineDisplacementCc != null
            ? {
                  label: "Engine",
                  value:
                      variant.engineName ||
                      `${variant.engineDisplacementCc?.toLocaleString("en-NG")} cc`,
                  icon: <Settings2 size={18} />,
              }
            : null,

        formatEnum(variant?.fuelType)
            ? {
                  label: "Fuel type",
                  value: formatEnum(variant?.fuelType)!,
                  icon: <Fuel size={18} />,
              }
            : null,

        formatEnum(variant?.transmission)
            ? {
                  label: "Transmission",
                  value: formatEnum(variant?.transmission)!,
                  icon: <Settings2 size={18} />,
              }
            : null,

        formatEnum(variant?.driveType)
            ? {
                  label: "Drive type",
                  value: formatEnum(variant?.driveType)!,
                  icon: <CarFront size={18} />,
              }
            : null,

        formatEnum(variant?.bodyStyle)
            ? {
                  label: "Body style",
                  value: formatEnum(variant?.bodyStyle)!,
                  icon: <CarFront size={18} />,
              }
            : null,

        variant?.seats != null
            ? {
                  label: "Seats",
                  value: String(variant.seats),
                  icon: <Users size={18} />,
              }
            : null,
    ];

    return specifications.filter(
        (item): item is SpecificationItem => item !== null,
    );
}

interface VehicleSpecificationsProps {
    details: VehicleDetailsResponse;
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

            <div
                className={`mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 ${
                    isMobile ? "" : "xl:grid-cols-3"
                }`}
            >
                {specifications.map((item, index) => (
                    <motion.div
                        key={item.label}
                        initial={
                            shouldReduceMotion
                                ? false
                                : { opacity: 0, y: 10 }
                        }
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{
                            duration: shouldReduceMotion ? 0 : 0.3,
                            delay: shouldReduceMotion
                                ? 0
                                : Math.min(index * 0.04, 0.2),
                            ease: "easeOut",
                        }}
                        className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 transition-colors hover:border-blue-100 hover:bg-blue-50/30"
                    >
                        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-[#1491FF]">
                            {item.icon}
                        </span>

                        <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-500">
                                {item.label}
                            </p>

                            <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                                {item.value}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}