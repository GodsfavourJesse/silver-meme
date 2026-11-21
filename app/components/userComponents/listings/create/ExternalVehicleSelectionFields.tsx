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
    years: boolean;
    makes: boolean;
    models: boolean;
    variants: boolean;
};

const initialLoading: LoadingState = {
    years: false,
    makes: false,
    models: false,
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

    const [variants, setVariants] = useState<
        ExternalVehicleOption[]
    >([]);

    const [year, setYear] = useState("");
    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [variant, setVariant] = useState("");

    const [manualVariant, setManualVariant] = useState(false);

    const [loading, setLoading] =
        useState<LoadingState>(initialLoading);

    const [error, setError] = useState<string | null>(null);

    const [variantError, setVariantError] =
        useState<string | null>(null);

    const requestIds = useRef({
        years: 0,
        makes: 0,
        models: 0,
        variants: 0,
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
     * Clear the internal KARMASS vehicle variant relation.
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
            requestIds.current.variants++;
        };
    }, []);

    /**
     * STEP 2
     *
     * Handle year selection.
     *
     * Changing the year invalidates all
     * dependent vehicle selections.
     */
    const handleYear = async (value: string) => {
        requestIds.current.makes++;
        requestIds.current.models++;
        requestIds.current.variants++;

        setYear(value);

        setMake("");
        setModel("");
        setVariant("");

        setMakes([]);
        setModels([]);
        setVariants([]);

        setManualVariant(false);

        setError(null);
        setVariantError(null);

        updateLoading("makes", false);
        updateLoading("models", false);
        updateLoading("variants", false);

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
        requestIds.current.models++;
        requestIds.current.variants++;

        setMake(value);

        setModel("");
        setVariant("");

        setModels([]);
        setVariants([]);

        setManualVariant(false);

        setError(null);
        setVariantError(null);

        updateLoading("models", false);
        updateLoading("variants", false);

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
     * Handle model selection and retrieve
     * available Auto.dev variants.
     */
    const handleModel = async (value: string) => {
        requestIds.current.variants++;

        setModel(value);
        setVariant("");

        setVariants([]);
        setManualVariant(false);

        setError(null);
        setVariantError(null);

        updateLoading("variants", false);

        clearSelection();

        updateDetails({
            makeName: make,
            modelName: value,
            year,
            generationName: "",
            variantName: "",
        });

        if (!value || !year || !make) return;

        const selectedYear = Number(year);

        const requestId = ++requestIds.current.variants;

        updateLoading("variants", true);

        try {
            const result =
                await getExternalVehicleVariants(
                    selectedYear,
                    make,
                    value
                );

            if (
                requestId !== requestIds.current.variants
            ) {
                return;
            }

            setVariants(result);

            if (result.length === 0) {
                setManualVariant(true);
                setVariantError(
                    "No matching variants were found. You can enter the variant manually."
                );
            }
        } catch (reason) {
            if (
                requestId !== requestIds.current.variants
            ) {
                return;
            }

            setManualVariant(true);

            setVariantError(
                reason instanceof Error
                    ? `Variant lookup failed: ${reason.message}`
                    : "Could not retrieve vehicle variants. You can enter the variant manually."
            );
        } finally {
            if (
                requestId === requestIds.current.variants
            ) {
                updateLoading("variants", false);
            }
        }
    };

    /**
     * STEP 5
     *
     * Handle selection from the variant dropdown.
     */
    const handleVariant = (value: string) => {
        setVariant(value);

        updateDetails({
            makeName: make,
            modelName: model,
            year,
            generationName: "",
            variantName: value,
        });

        clearSelection();
    };

    /**
     * STEP 6
     *
     * Handle manual variant entry.
     */
    const handleManualVariant = (value: string) => {
        setVariant(value);

        updateDetails({
            makeName: make,
            modelName: model,
            year,
            generationName: "",
            variantName: value.trim(),
        });

        clearSelection();
    };

    /**
     * Switch between available variants
     * and manual variant entry.
     */
    const switchVariantMode = (
        useManual: boolean
    ) => {
        setManualVariant(useManual);
        setVariant("");

        updateDetails({
            makeName: make,
            modelName: model,
            year,
            generationName: "",
            variantName: "",
        });

        clearSelection();
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
                    onChange={(value) =>
                        void handleModel(value)
                    }
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

                    {!manualVariant && variants.length > 0 ? (
                        <SelectField
                            label=""
                            value={variant}
                            options={variants}
                            placeholder="Select variant / trim"
                            loading={loading.variants}
                            disabled={disabled || !model || loading.variants}
                            onChange={handleVariant}
                        />
                    ) : (
                        <input
                            id="vehicle-variant"
                            type="text"
                            value={variant}
                            disabled={disabled || !model}
                            onChange={(event) =>
                                handleManualVariant(
                                    event.target.value
                                )
                            }
                            placeholder="e.g. LE, XLE, Limited, Sport"
                            maxLength={150}
                            className={inputClass}
                        />
                    )}

                    {variants.length > 0 && !loading.variants && (
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() =>
                                switchVariantMode(!manualVariant)
                            }
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                        >
                            {manualVariant
                                ? "Choose from available variants"
                                : "Can't find your variant? Enter manually"}
                        </button>
                    )}

                    {variantError && (
                        <p
                            role="status"
                            className="text-xs leading-5 text-amber-600"
                        >
                            {variantError}
                        </p>
                    )}

                    {loading.variants && (
                        <p className="flex items-center gap-1.5 text-xs text-slate-500">
                            <LoaderCircle
                                size={13}
                                className="animate-spin"
                            />
                            Finding available variants...
                        </p>
                    )}
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