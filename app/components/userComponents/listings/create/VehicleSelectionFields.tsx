"use client";

import { useState } from "react";
import { AlertCircle, CarFront, Pencil } from "lucide-react";
import { ExternalVehicleSelectionFields } from "./ExternalVehicleSelectionFields";
import { VehicleManualEntryFields, type ManualVehicleValues } from "./VehicleManualEntryFields";

interface VehicleSelectionFieldsProps {
    value: string;
    onChange: (vehicleVariantId: string) => void;
    onVehicleSelected?: (title: string | null) => void;
    manualValue: ManualVehicleValues;
    onManualVehicleChange: (field: keyof ManualVehicleValues, value: string) => void;
    onVehicleDetailsChange?: (details: Partial<ManualVehicleValues>) => void;
    disabled?: boolean;
    error?: string;
}

const tabClass = (active: boolean) =>
    `flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition sm:text-sm ${active ? "bg-white text-[#0877D9] shadow-sm" : "text-slate-500 hover:text-slate-800"}`;

export function VehicleSelectionFields({
    onChange,
    onVehicleSelected,
    manualValue,
    onManualVehicleChange,
    onVehicleDetailsChange,
    disabled = false,
    error,
}: VehicleSelectionFieldsProps) {
    const [mode, setMode] = useState<"external" | "manual">("external");

    const switchMode = (nextMode: "external" | "manual") => {
        if (disabled || mode === nextMode) return;
        onChange("");
        onVehicleSelected?.(null);
        onVehicleDetailsChange?.({ makeName: "", modelName: "", year: "", generationName: "", variantName: "" });
        setMode(nextMode);
    };

    return (
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02] sm:p-5">
            {/* <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF5FF]">
                    <CarFront size={21} strokeWidth={1.8} className="text-[#1491FF]" />
                </div>
                <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold tracking-tight text-slate-900">Vehicle details</h2>
                    <p className="mt-1 max-w-lg text-sm leading-5 text-slate-500">Select your vehicle using live automotive data. Manual entry is available only when a provider does not return your vehicle.</p>
                </div>
            </div> */}

            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                <button type="button" disabled={disabled} onClick={() => switchMode("external")} className={tabClass(mode === "external")}><CarFront size={16} /> Vehicle Cataloge</button>
                <button type="button" disabled={disabled} onClick={() => switchMode("manual")} className={tabClass(mode === "manual")}><Pencil size={15} /> Manual</button>
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

            {error && <p role="alert" className="flex items-center gap-2 text-sm text-red-600"><AlertCircle size={16} />{error}</p>}
        </section>
    );
}
