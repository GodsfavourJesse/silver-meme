"use client";

import {
    ChevronDown,
    LoaderCircle,
    CheckCircle2,
} from "lucide-react";

export interface VehicleSelectOption {
    id: string;
    label: string;
    description?: string;
}

interface VehicleCatalogSelectProps {
    id?: string;
    label: string;
    value: string;
    placeholder: string;
    options: VehicleSelectOption[];
    disabled?: boolean;
    loading?: boolean;
    error?: string | null;
    onChange: (value: string) => void;
}

export function VehicleCatalogSelect({
    id,
    label,
    value,
    placeholder,
    options,
    disabled = false,
    loading = false,
    error,
    onChange,
}: VehicleCatalogSelectProps) {
    const selectId =
        id ??
        label
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

    const errorId = `${selectId}-error`;
    const statusId = `${selectId}-status`;

    const isDisabled = disabled || loading;

    const hasSelectedOption = options.some(
        (option) => option.id === value,
    );

    const selectedOption = options.find(
        (option) => option.id === value,
    );

    const describedBy = [
        error ? errorId : null,
        !error && (loading || options.length === 0)
            ? statusId
            : null,
    ]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
        <div className="min-w-0 space-y-2">
            <label
                htmlFor={selectId}
                className="block text-sm font-medium text-[#393044]"
            >
                {label}
            </label>

            <div className="relative">
                <select
                    id={selectId}
                    value={value}
                    disabled={isDisabled}
                    aria-invalid={Boolean(error)}
                    aria-describedby={describedBy}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                    className={[
                        "h-12 w-full appearance-none rounded-xl border",
                        "bg-white px-4 pr-12 text-base",
                        "text-[#21172E] outline-none",
                        "transition-colors duration-150",
                        "focus:border-[#7008E7]",
                        "focus:ring-4 focus:ring-[#7008E7]/[0.08]",
                        "disabled:cursor-not-allowed",
                        "disabled:bg-[#F7F5FA]",
                        "disabled:text-[#9993A2]",
                        "disabled:opacity-100",
                        error
                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                            : "border-[#E5DFED]",
                    ].join(" ")}
                >
                    <option
                        value=""
                        className="bg-white text-[#8B8495]"
                    >
                        {placeholder}
                    </option>

                    {options.map((option) => (
                        <option
                            key={option.id}
                            value={option.id}
                            className="bg-white text-[#21172E]"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    {loading ? (
                        <LoaderCircle
                            size={18}
                            aria-hidden="true"
                            className="animate-spin text-[#7008E7]"
                        />
                    ) : hasSelectedOption ? (
                        <CheckCircle2
                            size={17}
                            aria-hidden="true"
                            className="text-emerald-600"
                        />
                    ) : (
                        <ChevronDown
                            size={18}
                            aria-hidden="true"
                            className="text-[#8B8495]"
                        />
                    )}
                </div>
            </div>

            {error && (
                <p
                    id={errorId}
                    role="alert"
                    className="flex items-start gap-1.5 text-xs leading-5 text-red-600"
                >
                    <span className="mt-0.5 shrink-0">
                        !
                    </span>

                    <span>{error}</span>
                </p>
            )}

            {!error && loading && (
                <p
                    id={statusId}
                    role="status"
                    className="flex items-center gap-1.5 text-xs leading-5 text-[#777080]"
                >
                    <LoaderCircle
                        size={13}
                        className="animate-spin text-[#7008E7]"
                    />

                    Loading available options...
                </p>
            )}

            {!error &&
                !loading &&
                options.length === 0 && (
                    <p
                        id={statusId}
                        className="text-xs leading-5 text-[#8B8495]"
                    >
                        {value
                            ? "The selected option is not in the available options."
                            : "No options available yet."}
                    </p>
                )}

            {!error &&
                !loading &&
                selectedOption?.description && (
                    <p className="text-xs leading-5 text-[#777080]">
                        {selectedOption.description}
                    </p>
                )}
        </div>
    );
}