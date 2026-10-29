import type { ReactNode } from "react";

import {
    CarFront,
    Fuel,
    Gauge,
    Settings2,
    Users,
    Zap,
} from "lucide-react";
import type { VehicleDetailsResponse } from "@/app/types/user/vehicle-details.types";
import { formatEnum, formatNumber } from "@/app/lib/user/vehicle/vehicle-details-format";

interface SpecificationItem {
    label: string;
    value: string | null;
    icon: ReactNode;
}

function buildSpecifications(
    details: VehicleDetailsResponse,
): SpecificationItem[] {
    const { listing, variant } = details;

    return [
        {
            label: "Mileage",
            value:
                listing.mileage !== null
                    ? `${formatNumber(listing.mileage)} km`
                    : null,
            icon: <Gauge size={18} />,
        },
        {
            label: "Engine",
            value:
                variant.engineName ||
                (variant.engineDisplacementCc
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
            value: variant.doors !== null ? String(variant.doors) : null,
            icon: <CarFront size={18} />,
        },
        {
            label: "Seats",
            value: variant.seats !== null ? String(variant.seats) : null,
            icon: <Users size={18} />,
        },
        {
            label: "Cylinders",
            value:
                variant.cylinders !== null ? String(variant.cylinders) : null,
            icon: <Settings2 size={18} />,
        },
        {
            label: "Horsepower",
            value:
                variant.horsepower !== null ? `${variant.horsepower} hp` : null,
            icon: <Zap size={18} />,
        },
    ];
}

function VehicleSpecification({ icon, label, value }: SpecificationItem) {
    if (!value) {
        return null;
    }

    return (
        <div className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-100 bg-white p-3.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                {icon}
            </span>

            <div className="min-w-0">
                <p className="text-xs text-slate-500">{label}</p>

                <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                    {value}
                </p>
            </div>
        </div>
    );
}

interface VehicleSpecificationsProps {
    details: VehicleDetailsResponse;
    /** "desktop" sits in the left column, "mobile" in the side column. */
    variant: "desktop" | "mobile";
}

export function VehicleSpecifications({
    details,
    variant,
}: VehicleSpecificationsProps) {
    const specifications = buildSpecifications(details);

    if (variant === "mobile") {
        return (
            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 sm:rounded-3xl sm:p-6 md:hidden">
                <h2 className="text-lg font-bold text-slate-950">
                    Specifications
                </h2>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    {specifications.map((item) => (
                        <VehicleSpecification key={item.label} {...item} />
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="mt-8 hidden md:block">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
                        Vehicle information
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-slate-950">
                        Specifications
                    </h2>
                </div>

                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                    Verified listing details
                </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {specifications.map((item) => (
                    <VehicleSpecification key={item.label} {...item} />
                ))}
            </div>
        </section>
    );
}