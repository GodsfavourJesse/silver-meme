"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle, RadioTower } from "lucide-react";
import {
    getExternalVehicleMakes,
    getExternalVehicleModels,
    getExternalVehicleVariants,
    getExternalVehicleYears,
    type ExternalVehicleOption,
} from "@/app/services/user/listings/external-vehicle-catalog.service";
import type { ManualVehicleValues } from "./VehicleManualEntryFields";

interface Props {
    onChange: (vehicleVariantId: string) => void;
    onVehicleSelected?: (title: string | null) => void;
    onVehicleDetailsChange?: (details: Partial<ManualVehicleValues>) => void;
    disabled?: boolean;
}

const selectClass = "h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#1491FF] focus:ring-4 focus:ring-[#1491FF]/10 disabled:cursor-not-allowed disabled:bg-slate-50";

export function ExternalVehicleSelectionFields({ onChange, onVehicleSelected, onVehicleDetailsChange, disabled = false }: Props) {
    const [makes, setMakes] = useState<ExternalVehicleOption[]>([]);
    const [models, setModels] = useState<ExternalVehicleOption[]>([]);
    const [years, setYears] = useState<ExternalVehicleOption[]>([]);
    const [variants, setVariants] = useState<ExternalVehicleOption[]>([]);
    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [year, setYear] = useState("");
    const [variant, setVariant] = useState("");
    const [loading, setLoading] = useState({ makes: false, models: false, years: false, variants: false });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        setLoading((current) => ({ ...current, makes: true }));
        Promise.allSettled([
            getExternalVehicleMakes("carsxe"),
            getExternalVehicleMakes("vehiclesdb"),
        ])
            .then((results) => {
                if (!active) return;
                const successful = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
                const unique = new Map<string, ExternalVehicleOption>();
                for (const item of successful) {
                    const key = item.value.trim().toLocaleLowerCase();
                    const existing = unique.get(key);
                    if (!existing || item.source === "carsxe") unique.set(key, item);
                }
                const items = [...unique.values()].sort((a, b) => a.label.localeCompare(b.label));
                setMakes(items);
                if (items.length === 0) {
                    const firstFailure = results.find((result) => result.status === "rejected");
                    setError(firstFailure?.status === "rejected" && firstFailure.reason instanceof Error ? firstFailure.reason.message : "No vehicle makes were returned by the connected providers.");
                }
            })
            .finally(() => { if (active) setLoading((current) => ({ ...current, makes: false })); });
        return () => { active = false; };
    }, []);

    const updateDetails = (next: { make?: string; model?: string; year?: string; variant?: string }) => {
        const nextMake = next.make ?? make;
        const nextModel = next.model ?? model;
        const nextYear = next.year ?? year;
        const nextVariant = next.variant ?? variant;
        onVehicleDetailsChange?.({
            makeName: nextMake,
            modelName: nextModel,
            year: nextYear,
            generationName: "",
            variantName: nextVariant,
        });
        onChange("");
        onVehicleSelected?.(nextMake && nextModel && nextYear ? `${nextYear} ${nextMake} ${nextModel}${nextVariant ? ` ${nextVariant}` : ""}` : null);
    };

    const handleMake = async (value: string) => {
        setMake(value); setModel(""); setYear(""); setVariant("");
        const selectedMake = makes.find((item) => item.value === value);
        const provider = selectedMake?.source ?? "carsxe";
        setModels([]); setYears([]); setVariants([]); setError(null);
        updateDetails({ make: value, model: "", year: "", variant: "" });
        if (!value) return;
        setLoading((current) => ({ ...current, models: true }));
        try { setModels(await getExternalVehicleModels(value, provider)); }
        catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load vehicle models."); }
        finally { setLoading((current) => ({ ...current, models: false })); }
    };

    const handleModel = async (value: string) => {
        setModel(value); setYear(""); setVariant(""); setYears([]); setVariants([]); setError(null);
        updateDetails({ model: value, year: "", variant: "" });
        if (!value) return;
        setLoading((current) => ({ ...current, years: true }));
        try { setYears(await getExternalVehicleYears(make, value)); }
        catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load model years."); }
        finally { setLoading((current) => ({ ...current, years: false })); }
    };

    const handleYear = async (value: string) => {
        setYear(value); setVariant(""); setVariants([]); setError(null);
        updateDetails({ year: value, variant: "" });
        if (!value) return;
        setLoading((current) => ({ ...current, variants: true }));
        try { setVariants(await getExternalVehicleVariants(make, model, Number(value))); }
        catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load vehicle variants."); }
        finally { setLoading((current) => ({ ...current, variants: false })); }
    };

    const handleVariant = (value: string) => {
        setVariant(value);
        updateDetails({ variant: value });
    };

    // const busy = Object.values(loading).some(Boolean);

    return (
        <section className="space-y-5">
            {/* <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600"><RadioTower size={19} /></div>
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900">Live vehicle catalogue</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-600">Vehicle makes and models are combined from CarsXE and VehiclesDB. Years and variants are retrieved from CarsXE. Your API keys stay securely on the KARMASS backend.</p>
                </div>
                {busy && <LoaderCircle className="ml-auto mt-1 animate-spin text-emerald-600" size={18} />}
            </div> */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-700">Make
                    <select className={selectClass} value={make} disabled={disabled || loading.makes} onChange={(event) => void handleMake(event.target.value)}>
                        <option value="">{loading.makes ? "Loading makes…" : "Select make"}</option>
                        {makes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">Model
                    <select className={selectClass} value={model} disabled={disabled || !make || loading.models} onChange={(event) => void handleModel(event.target.value)}>
                        <option value="">{loading.models ? "Loading models…" : "Select model"}</option>
                        {models.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">Model year
                    <select className={selectClass} value={year} disabled={disabled || !model || loading.years} onChange={(event) => void handleYear(event.target.value)}>
                        <option value="">{loading.years ? "Loading years…" : "Select year"}</option>
                        {years.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">Variant / trim <span className="font-normal text-slate-400">(optional)</span>
                    <select className={selectClass} value={variant} disabled={disabled || !year || loading.variants} onChange={(event) => handleVariant(event.target.value)}>
                        <option value="">{loading.variants ? "Loading variants…" : "Select variant (optional)"}</option>
                        {variants.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                </label>
            </div>

            {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"><AlertCircle size={16} className="mt-0.5 shrink-0" /> <span>{error}</span></div>}
            {make && model && year && <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-sm text-emerald-800"><CheckCircle2 size={17} /> <span className="font-medium">{year} {make} {model}{variant ? ` · ${variant}` : ""}</span></div>}
            <p className="text-xs leading-5 text-slate-500">The selected make, model, year and variant are saved with your listing.</p>
        </section>
    );
}
