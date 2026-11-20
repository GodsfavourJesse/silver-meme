"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";

import {
    getExternalVehicleMakes,
    getExternalVehicleModels,
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
    years: boolean;
    makes: boolean;
    models: boolean;
};

const initialLoading: LoadingState = {
    years: false,
    makes: false,
    models: false,
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

const inputClass = `
    h-11 w-full rounded-lg border border-slate-200
    bg-white px-3 text-sm text-slate-800 outline-none
    transition-colors duration-150
    placeholder:text-slate-400
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
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
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
    const [years, setYears] = useState<
        ExternalVehicleOption[]
    >([]);

    const [makes, setMakes] = useState<
        ExternalVehicleOption[]
    >([]);

    const [models, setModels] = useState<
        ExternalVehicleOption[]
    >([]);

    const [year, setYear] = useState("");
    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [variant, setVariant] = useState("");

    const [loading, setLoading] =
        useState<LoadingState>(initialLoading);

    const [error, setError] = useState<string | null>(null);

    const requestIds = useRef({
        years: 0,
        makes: 0,
        models: 0,
    });

    /**
     * Update individual loading states.
     */
    const updateLoading = (
        field: keyof LoadingState,
        value: boolean
    ) => {
        setLoading((current) => ({
            ...current,
            [field]: value,
        }));
    };

    /**
     * Clear the internal vehicle variant relation.
     *
     * Auto.dev values are external catalogue values,
     * not KARMASS database UUIDs.
     */
    const clearSelection = () => {
        onChange("");
    };

    /**
     * Synchronize selected vehicle information
     * with the parent listing form.
     */
    const updateDetails = (
        details: Partial<ManualVehicleValues>
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

    /**
     * STEP 1
     *
     * Load available vehicle years when
     * the component mounts.
     */
    useEffect(() => {
        let active = true;

        const loadYears = async () => {
            updateLoading("years", true);

            try {
                const result =
                    await getExternalVehicleYears();

                if (!active) return;

                setYears(result);

                if (result.length === 0) {
                    setError(
                        "Vehicle model years are currently unavailable."
                    );
                }
            } catch (reason) {
                if (!active) return;

                setError(
                    reason instanceof Error
                        ? reason.message
                        : "Could not load vehicle years."
                );
            } finally {
                if (active) {
                    updateLoading("years", false);
                }
            }
        };

        void loadYears();

        return () => {
            active = false;

            requestIds.current.years++;
            requestIds.current.makes++;
            requestIds.current.models++;
        };
    }, []);

    /**
     * STEP 2
     *
     * Handle year selection.
     *
     * Changing the year invalidates
     * make, model and variant selections.
     */
    const handleYear = async (value: string) => {
        // Invalidate pending requests.
        requestIds.current.makes++;
        requestIds.current.models++;

        setYear(value);

        setMake("");
        setModel("");
        setVariant("");

        setMakes([]);
        setModels([]);

        setError(null);

        updateLoading("makes", false);
        updateLoading("models", false);

        clearSelection();

        updateDetails({
            makeName: "",
            modelName: "",
            year: value,
            generationName: "",
            variantName: "",
        });

        if (!value) return;

        const selectedYear = Number(value);

        if (
            !Number.isInteger(selectedYear) ||
            selectedYear < 1886 ||
            selectedYear > 2100
        ) {
            setError("Please select a valid vehicle year.");
            return;
        }

        const requestId = ++requestIds.current.makes;

        updateLoading("makes", true);

        try {
            const result =
                await getExternalVehicleMakes(selectedYear);

            if (
                requestId !== requestIds.current.makes
            ) {
                return;
            }

            setMakes(result);

            if (result.length === 0) {
                setError(
                    "No vehicle makes were found for this year."
                );
            }
        } catch (reason) {
            if (
                requestId !== requestIds.current.makes
            ) {
                return;
            }

            setError(
                reason instanceof Error
                    ? reason.message
                    : "Could not load vehicle makes."
            );
        } finally {
            if (
                requestId === requestIds.current.makes
            ) {
                updateLoading("makes", false);
            }
        }
    };

    /**
     * STEP 3
     *
     * Handle make selection.
     *
     * Changing the make invalidates
     * model and variant selections.
     */
    const handleMake = async (value: string) => {
        // Invalidate pending model requests.
        requestIds.current.models++;

        setMake(value);

        setModel("");
        setVariant("");

        setModels([]);

        setError(null);

        updateLoading("models", false);

        clearSelection();

        updateDetails({
            makeName: value,
            modelName: "",
            year,
            generationName: "",
            variantName: "",
        });

        if (!value || !year) return;

        const selectedYear = Number(year);

        const requestId = ++requestIds.current.models;

        updateLoading("models", true);

        try {
            const result =
                await getExternalVehicleModels(
                    selectedYear,
                    value
                );

            if (
                requestId !== requestIds.current.models
            ) {
                return;
            }

            setModels(result);

            if (result.length === 0) {
                setError(
                    "No models were found for this make and year."
                );
            }
        } catch (reason) {
            if (
                requestId !== requestIds.current.models
            ) {
                return;
            }

            setError(
                reason instanceof Error
                    ? reason.message
                    : "Could not load vehicle models."
            );
        } finally {
            if (
                requestId === requestIds.current.models
            ) {
                updateLoading("models", false);
            }
        }
    };

    /**
     * STEP 4
     *
     * Handle model selection.
     *
     * Auto.dev does not provide the general
     * year/make/model-to-trim dropdown we need.
     * Variant / Trim is therefore entered manually.
     */
    const handleModel = (value: string) => {
        setModel(value);
        setVariant("");

        setError(null);

        clearSelection();

        updateDetails({
            makeName: make,
            modelName: value,
            year,
            generationName: "",
            variantName: "",
        });
    };

    /**
     * STEP 5
     *
     * Handle manual variant / trim input.
     */
    const handleVariant = (value: string) => {
        setVariant(value);

        updateDetails({
            makeName: make,
            modelName: model,
            year,
            generationName: "",
            variantName: value.trim(),
        });

        // External catalogue values are not KARMASS UUIDs.
        onChange("");
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* YEAR */}
                <SelectField
                    label="Year"
                    value={year}
                    options={years}
                    placeholder="Select year"
                    loading={loading.years}
                    disabled={disabled}
                    onChange={(value) =>
                        void handleYear(value)
                    }
                />

                {/* MAKE */}
                <SelectField
                    label="Make"
                    value={make}
                    options={makes}
                    placeholder="Select make"
                    loading={loading.makes}
                    disabled={disabled || !year}
                    onChange={(value) =>
                        void handleMake(value)
                    }
                />

                {/* MODEL */}
                <SelectField
                    label="Model"
                    value={model}
                    options={models}
                    placeholder="Select model"
                    loading={loading.models}
                    disabled={disabled || !make}
                    onChange={handleModel}
                />

                {/* VARIANT / TRIM */}
                <div className="min-w-0 space-y-1.5">
                    <label
                        htmlFor="vehicle-variant"
                        className="flex items-center gap-1 text-xs font-medium text-slate-700 sm:text-sm"
                    >
                        Variant / Trim

                        <span className="font-normal text-slate-400">
                            (Optional)
                        </span>
                    </label>

                    <input
                        id="vehicle-variant"
                        type="text"
                        value={variant}
                        disabled={disabled || !model}
                        onChange={(event) =>
                            handleVariant(event.target.value)
                        }
                        placeholder="e.g. LE, XLE, Limited, Sport"
                        maxLength={100}
                        className={inputClass}
                    />
                </div>
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