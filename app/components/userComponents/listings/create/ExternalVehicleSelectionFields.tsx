"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";

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
    onVehicleDetailsChange?: (
        details: Partial<ManualVehicleValues>
    ) => void;
    disabled?: boolean;
}

type LoadingState = {
    makes: boolean;
    models: boolean;
    years: boolean;
    variants: boolean;
};

const initialLoading: LoadingState = {
    makes: false,
    models: false,
    years: false,
    variants: false,
};

const selectClass = `
    h-11 w-full appearance-none rounded-lg border border-slate-200
    bg-white px-3 text-sm text-slate-800 outline-none
    transition-colors duration-150
    hover:border-slate-300
    focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10
    disabled:cursor-not-allowed disabled:bg-slate-50
    disabled:text-slate-400
`;

interface SelectFieldProps {
    label: string;
    value: string;
    options: ExternalVehicleOption[];
    placeholder: string;
    loading?: boolean;
    disabled?: boolean;
    optional?: boolean;
    onChange: (value: string) => void;
}

function SelectField({
    label,
    value,
    options,
    placeholder,
    loading = false,
    disabled = false,
    optional = false,
    onChange,
}: SelectFieldProps) {
    return (
        <div className="min-w-0 space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-medium text-slate-700 sm:text-sm">
                {label}

                {optional && (
                    <span className="font-normal text-slate-400">
                        (Optional)
                    </span>
                )}
            </label>

            <div className="relative">
                <select
                    value={value}
                    disabled={disabled || loading}
                    onChange={(event) => onChange(event.target.value)}
                    className={`${selectClass} ${
                        loading ? "pr-9" : ""
                    }`}
                >
                    <option value="">
                        {loading ? "Loading..." : placeholder}
                    </option>

                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                {loading && (
                    <LoaderCircle
                        size={15}
                        className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-600"
                    />
                )}
            </div>
        </div>
    );
}

export function ExternalVehicleSelectionFields({
    onChange,
    onVehicleSelected,
    onVehicleDetailsChange,
    disabled = false,
}: Props) {
    const [makes, setMakes] = useState<ExternalVehicleOption[]>([]);
    const [models, setModels] = useState<ExternalVehicleOption[]>([]);
    const [years, setYears] = useState<ExternalVehicleOption[]>([]);
    const [variants, setVariants] = useState<ExternalVehicleOption[]>([]);

    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [year, setYear] = useState("");
    const [variant, setVariant] = useState("");

    const [loading, setLoading] =
        useState<LoadingState>(initialLoading);

    const [error, setError] = useState<string | null>(null);

    const requestIds = useRef({
        models: 0,
        years: 0,
        variants: 0,
    });

    const updateLoading = (
        field: keyof LoadingState,
        value: boolean
    ) => {
        setLoading((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const clearSelection = () => {
        onChange("");
    };

    const updateDetails = (
        details: ManualVehicleValues
    ) => {
        onVehicleDetailsChange?.(details);

        const title =
            details.makeName &&
            details.modelName &&
            details.year
                ? `${details.year} ${details.makeName} ${details.modelName}${
                      details.variantName
                          ? ` ${details.variantName}`
                          : ""
                  }`
                : null;

        onVehicleSelected?.(title);
    };

    useEffect(() => {
        let active = true;

        const loadMakes = async () => {
            updateLoading("makes", true);

            try {
                const results = await Promise.allSettled([
                    getExternalVehicleMakes("carsxe"),
                    getExternalVehicleMakes("vehiclesdb"),
                ]);

                if (!active) return;

                const unique = new Map<
                    string,
                    ExternalVehicleOption
                >();

                for (const result of results) {
                    if (result.status !== "fulfilled") continue;

                    for (const item of result.value) {
                        const key = item.value.trim().toLowerCase();
                        const existing = unique.get(key);

                        if (
                            !existing ||
                            item.source === "carsxe"
                        ) {
                            unique.set(key, item);
                        }
                    }
                }

                const items = [...unique.values()].sort(
                    (a, b) => a.label.localeCompare(b.label)
                );

                setMakes(items);

                if (items.length === 0) {
                    setError("Vehicle makes are currently unavailable.");
                }
            } catch {
                if (active) {
                    setError("Could not load vehicle makes.");
                }
            } finally {
                if (active) {
                    updateLoading("makes", false);
                }
            }
        };

        void loadMakes();

        return () => {
            active = false;
        };
    }, []);

    const handleMake = async (value: string) => {
        requestIds.current.models++;
        requestIds.current.years++;
        requestIds.current.variants++;

        setMake(value);
        setModel("");
        setYear("");
        setVariant("");

        setModels([]);
        setYears([]);
        setVariants([]);

        setError(null);

        updateLoading("models", false);
        updateLoading("years", false);
        updateLoading("variants", false);

        clearSelection();

        updateDetails({
            makeName: value,
            modelName: "",
            year: "",
            generationName: "",
            variantName: "",
        });

        if (!value) return;

        const selectedMake = makes.find(
            (item) => item.value === value
        );

        const provider = selectedMake?.source ?? "carsxe";
        const requestId = ++requestIds.current.models;

        updateLoading("models", true);

        try {
            const result = await getExternalVehicleModels(
                value,
                provider
            );

            if (requestId !== requestIds.current.models) return;

            setModels(result);

            if (result.length === 0) {
                setError("No models found for this make.");
            }
        } catch (reason) {
            if (requestId !== requestIds.current.models) return;

            setError(
                reason instanceof Error
                    ? reason.message
                    : "Could not load models."
            );
        } finally {
            if (requestId === requestIds.current.models) {
                updateLoading("models", false);
            }
        }
    };

    const handleModel = async (value: string) => {
        requestIds.current.years++;
        requestIds.current.variants++;

        setModel(value);
        setYear("");
        setVariant("");

        setYears([]);
        setVariants([]);

        setError(null);

        updateLoading("years", false);
        updateLoading("variants", false);

        clearSelection();

        updateDetails({
            makeName: make,
            modelName: value,
            year: "",
            generationName: "",
            variantName: "",
        });

        if (!value) return;

        const requestId = ++requestIds.current.years;

        updateLoading("years", true);

        try {
            const result = await getExternalVehicleYears(
                make,
                value
            );

            if (requestId !== requestIds.current.years) return;

            setYears(result);

            if (result.length === 0) {
                setError("No model years found.");
            }
        } catch (reason) {
            if (requestId !== requestIds.current.years) return;

            setError(
                reason instanceof Error
                    ? reason.message
                    : "Could not load model years."
            );
        } finally {
            if (requestId === requestIds.current.years) {
                updateLoading("years", false);
            }
        }
    };

    const handleYear = async (value: string) => {
        requestIds.current.variants++;

        setYear(value);
        setVariant("");
        setVariants([]);
        setError(null);

        updateLoading("variants", false);

        clearSelection();

        updateDetails({
            makeName: make,
            modelName: model,
            year: value,
            generationName: "",
            variantName: "",
        });

        if (!value) return;

        const requestId = ++requestIds.current.variants;

        updateLoading("variants", true);

        try {
            const result = await getExternalVehicleVariants(
                make,
                model,
                Number(value)
            );

            if (requestId !== requestIds.current.variants) return;

            setVariants(result);
        } catch (reason) {
            if (requestId !== requestIds.current.variants) return;

            setError(
                reason instanceof Error
                    ? reason.message
                    : "Could not load variants."
            );
        } finally {
            if (requestId === requestIds.current.variants) {
                updateLoading("variants", false);
            }
        }
    };

    const handleVariant = (value: string) => {
        const selectedVariant = variants.find(
            (item) => item.value === value
        );

        setVariant(value);

        const variantLabel = selectedVariant?.label ?? "";

        // External provider values are display values, not KARMASS UUIDs.
        // Store the selected vehicle identity first, then clear the internal
        // catalogue relation so form validation sees a consistent snapshot.
        updateDetails({
            makeName: make,
            modelName: model,
            year,
            generationName: "",
            variantName: variantLabel,
        });

        onChange("");
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectField
                    label="Make"
                    value={make}
                    options={makes}
                    placeholder="Select make"
                    loading={loading.makes}
                    disabled={disabled}
                    onChange={(value) => void handleMake(value)}
                />

                <SelectField
                    label="Model"
                    value={model}
                    options={models}
                    placeholder="Select model"
                    loading={loading.models}
                    disabled={disabled || !make}
                    onChange={(value) => void handleModel(value)}
                />

                <SelectField
                    label="Year"
                    value={year}
                    options={years}
                    placeholder="Select year"
                    loading={loading.years}
                    disabled={disabled || !model}
                    onChange={(value) => void handleYear(value)}
                />

                <SelectField
                    label="Variant / Trim"
                    value={variant}
                    options={variants}
                    placeholder="Select variant"
                    loading={loading.variants}
                    disabled={disabled || !year}
                    optional
                    onChange={handleVariant}
                />
            </div>

            {error && (
                <p
                    role="alert"
                    className="text-xs leading-5 text-red-600"
                >
                    {error}
                </p>
            )}
        </div>
    );
}