"use client";

import { useEffect, useState } from "react";
import {
    X,
    LoaderCircle,
    Save,
    Plus,
    Info,
} from "lucide-react";

import type {
    AdminSubscriptionPlan,
    CreateAdminSubscriptionPlanPayload,
    UpdateAdminSubscriptionPlanPayload,
} from "@/app/types/admin/admin-subscription.types";

interface AdminSubscriptionPlanFormProps {
    plan?: AdminSubscriptionPlan | null;
    isSubmitting: boolean;
    onClose: () => void;
    onSubmit: (
        payload:
            | CreateAdminSubscriptionPlanPayload
            | UpdateAdminSubscriptionPlanPayload,
    ) => void;
}

interface FormState {
    name: string;
    description: string;
    price: string;
    currency: string;
    durationDays: string;
    listingCredits: string;
    dealerDiscountPercent: string;
    active: boolean;
}

const INITIAL_FORM: FormState = {
    name: "",
    description: "",
    price: "",
    currency: "NGN",
    durationDays: "30",
    listingCredits: "5",
    dealerDiscountPercent: "0",
    active: true,
};

function getPlanFormValues(
    plan?: AdminSubscriptionPlan | null,
): FormState {
    const version = plan?.latestVersion;

    if (!plan) return INITIAL_FORM;

    return {
        name: plan.name,
        description: plan.description ?? "",
        price: String(version?.price ?? ""),
        currency: version?.currency ?? "NGN",
        durationDays: String(version?.durationDays ?? 30),
        listingCredits: String(version?.listingCredits ?? 5),
        dealerDiscountPercent: String(
            version?.dealerDiscountPercent ?? 0,
        ),
        active: plan.active,
    };
}

function FormField({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
                {label}
            </label>

            {children}

            {hint && (
                <p className="text-xs leading-5 text-gray-500">
                    {hint}
                </p>
            )}
        </div>
    );
}

const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#1491FF] focus:ring-4 focus:ring-blue-50";

export default function AdminSubscriptionPlanForm({
    plan,
    isSubmitting,
    onClose,
    onSubmit,
}: AdminSubscriptionPlanFormProps) {
    const isEditing = Boolean(plan);

    const [form, setForm] = useState<FormState>(
        () => getPlanFormValues(plan),
    );

    const [formError, setFormError] = useState("");

    useEffect(() => {
        setForm(getPlanFormValues(plan));
        setFormError("");
    }, [plan]);

    function updateField<K extends keyof FormState>(
        field: K,
        value: FormState[K],
    ) {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();
        setFormError("");

        const price = Number(form.price);
        const durationDays = Number(form.durationDays);
        const listingCredits = Number(form.listingCredits);
        const dealerDiscountPercent = Number(
            form.dealerDiscountPercent,
        );

        if (!form.name.trim()) {
            setFormError("Enter a subscription plan name.");
            return;
        }

        if (
            !Number.isFinite(price) ||
            price < 0
        ) {
            setFormError("Enter a valid plan price.");
            return;
        }

        if (
            !Number.isInteger(durationDays) ||
            durationDays < 1
        ) {
            setFormError(
                "Duration must be at least one day.",
            );
            return;
        }

        if (
            !Number.isInteger(listingCredits) ||
            listingCredits < 1
        ) {
            setFormError(
                "Listing credits must be at least one.",
            );
            return;
        }

        if (
            !Number.isFinite(dealerDiscountPercent) ||
            dealerDiscountPercent < 0 ||
            dealerDiscountPercent > 100
        ) {
            setFormError(
                "Dealer discount must be between 0 and 100.",
            );
            return;
        }

        if (isEditing) {
            const payload: UpdateAdminSubscriptionPlanPayload = {
                name: form.name.trim(),
                description: form.description.trim() || null,
                price,
                currency: form.currency,
                durationDays,
                listingCredits,
                dealerDiscountPercent,
                active: form.active,
            };

            onSubmit(payload);
            return;
        }

        const payload: CreateAdminSubscriptionPlanPayload = {
            name: form.name.trim(),
            description: form.description.trim() || null,
            price,
            currency: form.currency,
            durationDays,
            listingCredits,
            dealerDiscountPercent,
        };

        onSubmit(payload);
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-gray-950/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !isSubmitting) {
                    onClose();
                }
            }}
        >
            <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                    <div>
                        <h2 className="text-lg font-bold text-gray-950">
                            {isEditing
                                ? "Edit subscription plan"
                                : "Create subscription plan"}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {isEditing
                                ? "Update the plan configuration."
                                : "Configure a new subscription offering."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                        aria-label="Close form"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="min-h-0 space-y-6 overflow-y-auto p-6"
                >
                    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                        <div className="flex items-start gap-3">
                            <Info
                                size={18}
                                className="mt-0.5 shrink-0 text-[#1491FF]"
                            />

                            <p className="text-xs leading-5 text-blue-800">
                                Plan configuration changes create a new
                                immutable version. Existing subscriptions
                                retain the pricing and benefits of the
                                version they purchased.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <FormField label="Plan name">
                                <input
                                    value={form.name}
                                    onChange={(event) =>
                                        updateField(
                                            "name",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="e.g. Professional"
                                    className={inputClass}
                                    maxLength={100}
                                    required
                                />
                            </FormField>
                        </div>

                        <div className="sm:col-span-2">
                            <FormField label="Description">
                                <textarea
                                    value={form.description}
                                    onChange={(event) =>
                                        updateField(
                                            "description",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Describe what this plan offers..."
                                    rows={3}
                                    maxLength={1000}
                                    className={`${inputClass} resize-none`}
                                />
                            </FormField>
                        </div>

                        <FormField
                            label="Subscription price"
                            hint="The amount customers pay for this plan."
                        >
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.price}
                                onChange={(event) =>
                                    updateField(
                                        "price",
                                        event.target.value,
                                    )
                                }
                                placeholder="0.00"
                                className={inputClass}
                                required
                            />
                        </FormField>

                        <FormField label="Currency">
                            <select
                                value={form.currency}
                                onChange={(event) =>
                                    updateField(
                                        "currency",
                                        event.target.value,
                                    )
                                }
                                className={inputClass}
                            >
                                <option value="NGN">
                                    NGN — Nigerian Naira
                                </option>
                                <option value="USD">
                                    USD — US Dollar
                                </option>
                            </select>
                        </FormField>

                        <FormField
                            label="Duration"
                            hint="Number of days the subscription remains valid."
                        >
                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={form.durationDays}
                                onChange={(event) =>
                                    updateField(
                                        "durationDays",
                                        event.target.value,
                                    )
                                }
                                className={inputClass}
                                required
                            />
                        </FormField>

                        <FormField
                            label="Listing credits"
                            hint="Credits granted when the subscription activates."
                        >
                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={form.listingCredits}
                                onChange={(event) =>
                                    updateField(
                                        "listingCredits",
                                        event.target.value,
                                    )
                                }
                                className={inputClass}
                                required
                            />
                        </FormField>

                        <div className="sm:col-span-2">
                            <FormField
                                label="Dealer discount (%)"
                                hint="Discount available to eligible verified dealers."
                            >
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={form.dealerDiscountPercent}
                                    onChange={(event) =>
                                        updateField(
                                            "dealerDiscountPercent",
                                            event.target.value,
                                        )
                                    }
                                    className={inputClass}
                                />
                            </FormField>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    Plan availability
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    Control whether customers can purchase this plan.
                                </p>
                            </div>

                            <button
                                type="button"
                                role="switch"
                                aria-checked={form.active}
                                onClick={() =>
                                    updateField(
                                        "active",
                                        !form.active,
                                    )
                                }
                                className={`relative h-6 w-11 rounded-full transition ${
                                    form.active
                                        ? "bg-[#1491FF]"
                                        : "bg-gray-300"
                                }`}
                            >
                                <span
                                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                                        form.active
                                            ? "left-6"
                                            : "left-1"
                                    }`}
                                />
                            </button>
                        </div>
                    )}

                    {formError && (
                        <div
                            role="alert"
                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                            {formError}
                        </div>
                    )}

                    <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0877D9] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? (
                                <LoaderCircle
                                    size={17}
                                    className="animate-spin"
                                />
                            ) : isEditing ? (
                                <Save size={17} />
                            ) : (
                                <Plus size={17} />
                            )}

                            {isSubmitting
                                ? "Saving..."
                                : isEditing
                                    ? "Save changes"
                                    : "Create plan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}