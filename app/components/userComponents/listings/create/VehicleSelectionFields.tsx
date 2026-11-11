"use client";

import { useState } from "react";
import { CarFront, Check, Pencil, AlertCircle } from "lucide-react";

import { ExternalVehicleSelectionFields } from "./ExternalVehicleSelectionFields";

import {
    VehicleManualEntryFields,
    type ManualVehicleValues,
} from "./VehicleManualEntryFields";

interface VehicleSelectionFieldsProps {
    value: string;
    onChange: (vehicleVariantId: string) => void;
    onVehicleSelected?: (title: string | null) => void;
    manualValue: ManualVehicleValues;
    onManualVehicleChange: (
        field: keyof ManualVehicleValues,
        value: string
    ) => void;
    onVehicleDetailsChange?: (
        details: Partial<ManualVehicleValues>
    ) => void;
    disabled?: boolean;
    error?: string;
}

type SelectionMode = "external" | "manual";

const MODES = [
    {
        id: "external" as const,
        title: "Vehicle catalogue",
        icon: CarFront,
    },
    {
        id: "manual" as const,
        title: "Manual entry",
        icon: Pencil,
    },
];

export function VehicleSelectionFields({
    value,
    onChange,
    onVehicleSelected,
    manualValue,
    onManualVehicleChange,
    onVehicleDetailsChange,
    disabled = false,
    error,
}: VehicleSelectionFieldsProps) {
    const [mode, setMode] = useState<SelectionMode>("external");

    const switchMode = (nextMode: SelectionMode) => {
        if (disabled || mode === nextMode) return;

        onChange("");
        onVehicleSelected?.(null);

        onVehicleDetailsChange?.({
            makeName: "",
            modelName: "",
            year: "",
            generationName: "",
            variantName: "",
        });

        setMode(nextMode);
    };

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
                <CarFront size={19} className="text-slate-600" />

                <h3 className="text-sm font-semibold text-slate-900">
                    Select your vehicle
                </h3>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2">
                {MODES.map((item) => {
                    const Icon = item.icon;
                    const active = mode === item.id;

                    return (
                        <button
                            key={item.id}
                            type="button"
                            disabled={disabled}
                            onClick={() => switchMode(item.id)}
                            aria-pressed={active}
                            className={`
                                flex min-h-11 items-center justify-center gap-2
                                rounded-lg border px-3 py-2.5
                                text-xs font-medium transition-colors
                                focus-visible:outline-none focus-visible:ring-2
                                focus-visible:ring-blue-500 focus-visible:ring-offset-2
                                disabled:cursor-not-allowed disabled:opacity-60
                                sm:text-sm
                                ${
                                    active
                                        ? "border-blue-600 bg-blue-50 text-blue-700"
                                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                }
                            `}
                        >
                            <Icon size={16} />

                            <span>{item.title}</span>

                            {active && (
                                <Check
                                    size={15}
                                    className="ml-auto shrink-0"
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {mode === "external" ? (
                <ExternalVehicleSelectionFields
                    key="external-provider-selector"
                    onChange={onChange}
                    onVehicleSelected={onVehicleSelected}
                    onVehicleDetailsChange={onVehicleDetailsChange}
                    disabled={disabled}
                />
            ) : (
                <VehicleManualEntryFields
                    value={manualValue}
                    onChange={onManualVehicleChange}
                    disabled={disabled}
                />
            )}

            {error && (
                <div
                    role="alert"
                    className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700"
                >
                    <AlertCircle
                        size={16}
                        className="mt-0.5 shrink-0"
                    />

                    <p>{error}</p>
                </div>
            )}
        </section>
    );
}