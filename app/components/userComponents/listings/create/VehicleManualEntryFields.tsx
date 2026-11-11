"use client";

import type { ChangeEvent } from "react";

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
        value: string
    ) => void;
    disabled?: boolean;
    errors?: Partial<
        Record<keyof ManualVehicleValues, string>
    >;
}

const inputClassName = `
    h-11 w-full rounded-lg border border-slate-200
    bg-white px-3.5 text-sm text-slate-800
    outline-none transition duration-150
    placeholder:text-slate-400
    hover:border-slate-300
    focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10
    disabled:cursor-not-allowed disabled:bg-slate-50
    disabled:opacity-60
`;

export function VehicleManualEntryFields({
    value,
    onChange,
    disabled = false,
    errors = {},
}: VehicleManualEntryFieldsProps) {
    const handleChange =
        (field: keyof ManualVehicleValues) =>
        (event: ChangeEvent<HTMLInputElement>) => {
            onChange(field, event.target.value);
        };

    const fields = [
        {
            name: "makeName" as const,
            label: "Make",
            placeholder: "e.g. Toyota",
            required: true,
            maxLength: 100,
            type: "text",
        },
        {
            name: "modelName" as const,
            label: "Model",
            placeholder: "e.g. Camry",
            required: true,
            maxLength: 100,
            type: "text",
        },
        {
            name: "year" as const,
            label: "Year",
            placeholder: "e.g. 2018",
            required: true,
            maxLength: undefined,
            type: "number",
        },
        {
            name: "generationName" as const,
            label: "Generation",
            placeholder: "e.g. XV50",
            required: false,
            maxLength: 150,
            type: "text",
        },
        {
            name: "variantName" as const,
            label: "Variant / Trim",
            placeholder: "e.g. 2.5L XLE Automatic",
            required: false,
            maxLength: 150,
            type: "text",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field) => (
                <div
                    key={field.name}
                    className={
                        field.name === "variantName"
                            ? "sm:col-span-2"
                            : ""
                    }
                >
                    <label
                        htmlFor={`manual-${field.name}`}
                        className="mb-1.5 block text-xs font-medium text-slate-700 sm:text-sm"
                    >
                        {field.label}

                        {field.required ? (
                            <span className="ml-1 text-red-500">*</span>
                        ) : (
                            <span className="ml-1 font-normal text-slate-400">
                                (Optional)
                            </span>
                        )}
                    </label>

                    <input
                        id={`manual-${field.name}`}
                        type={field.type}
                        inputMode={
                            field.type === "number"
                                ? "numeric"
                                : undefined
                        }
                        min={
                            field.name === "year"
                                ? 1900
                                : undefined
                        }
                        max={
                            field.name === "year"
                                ? new Date().getFullYear() + 1
                                : undefined
                        }
                        value={value[field.name]}
                        onChange={handleChange(field.name)}
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                        disabled={disabled}
                        aria-invalid={Boolean(errors[field.name])}
                        aria-describedby={
                            errors[field.name]
                                ? `error-${field.name}`
                                : undefined
                        }
                        className={`
                            ${inputClassName}
                            ${
                                errors[field.name]
                                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                                    : ""
                            }
                        `}
                    />

                    {errors[field.name] && (
                        <p
                            id={`error-${field.name}`}
                            className="mt-1 text-xs text-red-600"
                        >
                            {errors[field.name]}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}