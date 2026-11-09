"use client";

import {
    CarFront,
    Info,
} from "lucide-react";

import type {
    ChangeEvent,
} from "react";

export interface ManualVehicleValues {
    makeName: string;
    modelName: string;
    year: string;
    generationName: string;
    variantName: string;
}

interface VehicleManualEntryFieldsProps {
    value: ManualVehicleValues;
    onChange: (
        field: keyof ManualVehicleValues,
        value: string,
    ) => void;
    disabled?: boolean;
    errors?: Partial<
        Record<keyof ManualVehicleValues, string>
    >;
}

const inputClassName = [
    "h-12 w-full rounded-xl border border-slate-200",
    "bg-white px-4 text-sm text-slate-900",
    "outline-none transition-all",
    "placeholder:text-slate-400",
    "focus:border-[#1491FF]",
    "focus:ring-4 focus:ring-[#1491FF]/10",
    "disabled:cursor-not-allowed disabled:bg-slate-50",
    "disabled:opacity-60",
].join(" ");

export function VehicleManualEntryFields({
    value,
    onChange,
    disabled = false,
    errors = {},
}: VehicleManualEntryFieldsProps) {
    const handleChange =
        (
            field: keyof ManualVehicleValues,
        ) =>
        (
            event: ChangeEvent<HTMLInputElement>,
        ) => {
            onChange(field, event.target.value);
        };

    return (
        <section className="space-y-5">
            <div className="flex items-start gap-3 rounded-xl border border-[#1491FF]/15 bg-[#F4F9FF] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#1491FF]">
                    <CarFront size={20} />
                </div>

                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900">
                        Enter vehicle details manually
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-600">
                        Use this option if you cannot find
                        your vehicle in our catalogue.
                        Generation and variant are optional.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* MAKE */}

                <div className="space-y-2">
                    <label
                        htmlFor="manual-make-name"
                        className="block text-sm font-medium text-slate-700"
                    >
                        Vehicle make
                        <span className="ml-1 text-[#1491FF]">
                            *
                        </span>
                    </label>

                    <input
                        id="manual-make-name"
                        type="text"
                        value={value.makeName}
                        onChange={handleChange("makeName")}
                        placeholder="e.g. Toyota"
                        maxLength={100}
                        disabled={disabled}
                        aria-invalid={Boolean(errors.makeName)}
                        className={inputClassName}
                    />

                    {errors.makeName && (
                        <p className="text-xs text-red-600">
                            {errors.makeName}
                        </p>
                    )}
                </div>

                {/* MODEL */}

                <div className="space-y-2">
                    <label
                        htmlFor="manual-model-name"
                        className="block text-sm font-medium text-slate-700"
                    >
                        Vehicle model
                        <span className="ml-1 text-[#1491FF]">
                            *
                        </span>
                    </label>

                    <input
                        id="manual-model-name"
                        type="text"
                        value={value.modelName}
                        onChange={handleChange("modelName")}
                        placeholder="e.g. Camry"
                        maxLength={100}
                        disabled={disabled}
                        aria-invalid={Boolean(errors.modelName)}
                        className={inputClassName}
                    />

                    {errors.modelName && (
                        <p className="text-xs text-red-600">
                            {errors.modelName}
                        </p>
                    )}
                </div>

                {/* YEAR */}

                <div className="space-y-2">
                    <label
                        htmlFor="manual-vehicle-year"
                        className="block text-sm font-medium text-slate-700"
                    >
                        Model year
                        <span className="ml-1 text-[#1491FF]">
                            *
                        </span>
                    </label>

                    <input
                        id="manual-vehicle-year"
                        type="number"
                        inputMode="numeric"
                        min={1900}
                        max={new Date().getFullYear() + 1}
                        value={value.year}
                        onChange={handleChange("year")}
                        placeholder="e.g. 2018"
                        disabled={disabled}
                        aria-invalid={Boolean(errors.year)}
                        className={inputClassName}
                    />

                    {errors.year && (
                        <p className="text-xs text-red-600">
                            {errors.year}
                        </p>
                    )}
                </div>

                {/* GENERATION */}

                <div className="space-y-2">
                    <label
                        htmlFor="manual-generation-name"
                        className="block text-sm font-medium text-slate-700"
                    >
                        Generation
                        <span className="ml-1 text-xs font-normal text-slate-400">
                            Optional
                        </span>
                    </label>

                    <input
                        id="manual-generation-name"
                        type="text"
                        value={value.generationName}
                        onChange={handleChange("generationName")}
                        placeholder="e.g. XV50"
                        maxLength={150}
                        disabled={disabled}
                        className={inputClassName}
                    />
                </div>

                {/* VARIANT */}

                <div className="space-y-2 sm:col-span-2">
                    <label
                        htmlFor="manual-variant-name"
                        className="block text-sm font-medium text-slate-700"
                    >
                        Vehicle variant
                        <span className="ml-1 text-xs font-normal text-slate-400">
                            Optional
                        </span>
                    </label>

                    <input
                        id="manual-variant-name"
                        type="text"
                        value={value.variantName}
                        onChange={handleChange("variantName")}
                        placeholder="e.g. 2.5L XLE Automatic"
                        maxLength={150}
                        disabled={disabled}
                        className={inputClassName}
                    />
                </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3">
                <Info
                    size={15}
                    className="mt-0.5 shrink-0 text-slate-400"
                />

                <p className="text-xs leading-5 text-slate-500">
                    Make, model and year are required.
                    You can provide the remaining vehicle
                    specifications separately.
                </p>
            </div>
        </section>
    );
}