"use client";

import {
    useCallback,
    useRef,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import {
    useForm,
    type SubmitHandler,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    ChevronDown,
    LoaderCircle,
    MapPin,
    PackageCheck,
    ShieldCheck,
    Tag,
} from "lucide-react";

import {
    listingFormSchema,
    type ListingFormSchemaValues,
} from "@/app/schema/listing/listing-form.schema";

import {
    createSellerListing,
} from "@/app/services/user/listings/listing.service";

import {
    VehicleSelectionFields,
} from "./VehicleSelectionFields";

import type {
    ManualVehicleValues,
} from "./VehicleManualEntryFields";

import {
    CreateListingErrorModal,
} from "../helpers/CreateListingErrorModal";

import {
    SubscriptionCreditsExhaustedModal,
} from "../helpers/SubscriptionCreditsExhaustedModal";

import {
    buildCreateListingPayload,
    DEFAULT_VALUES,
    getErrorMessage,
    type FormError,
} from "../helpers/create-listing.helpers";

/*
 * =========================================================
 * BRAND
 * =========================================================
 */

/*
 * =========================================================
 * FORM FIELD ERROR
 * =========================================================
 */

function FormFieldError({
    message,
}: {
    message?: string;
}) {
    if (!message) {
        return null;
    }

    return (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle size={13} />
            {message}
        </p>
    );
}

/*
 * =========================================================
 * FORM SECTION
 * =========================================================
 */

function FormSection({
    icon,
    title,
    description,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6">
            <div className="mb-6 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#1491FF]">
                    {icon}
                </div>

                <div className="min-w-0">
                    <h2 className="text-base font-semibold tracking-tight text-slate-900">
                        {title}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        {description}
                    </p>
                </div>
            </div>

            {children}
        </section>
    );
}

/*
 * =========================================================
 * FIELD LABEL
 * =========================================================
 */

function FieldLabel({
    htmlFor,
    required = false,
    children,
}: {
    htmlFor: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <label
            htmlFor={htmlFor}
            className="mb-2 block text-sm font-medium text-slate-700"
        >
            {children}

            {required && (
                <span className="ml-1 text-[#1491FF]">
                    *
                </span>
            )}
        </label>
    );
}

/*
 * =========================================================
 * TEXT INPUT
 * =========================================================
 */

function TextInput({
    label,
    name,
    value,
    onChange,
    placeholder,
    type = "text",
    disabled = false,
    error,
    min,
    max,
    required = false,
    autoFilled = false,
}: {
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
    error?: string;
    min?: string;
    max?: string;
    required?: boolean;
    autoFilled?: boolean;
}) {
    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <FieldLabel
                    htmlFor={name}
                    required={required}
                >
                    {label}
                </FieldLabel>

                {autoFilled && (
                    <span className="mb-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#0877D9]">
                        <CheckCircle2 size={12} />
                        Filled from vehicle selection
                    </span>
                )}
            </div>

            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                placeholder={placeholder}
                disabled={disabled}
                min={min}
                max={max}
                required={required}
                aria-invalid={Boolean(error)}
                className={[
                    "h-12 w-full rounded-xl border",
                    "bg-white px-4 text-sm text-slate-900",
                    "outline-none transition-all duration-200",
                    "placeholder:text-slate-400",
                    "hover:border-slate-300",
                    "focus:border-[#1491FF]",
                    "focus:ring-4 focus:ring-[#1491FF]/10",
                    "disabled:cursor-not-allowed",
                    "disabled:bg-slate-50 disabled:opacity-60",
                    error
                        ? "border-red-400"
                        : "border-slate-200",
                ].join(" ")}
            />

            <FormFieldError message={error} />
        </div>
    );
}

/*
 * =========================================================
 * TEXT AREA
 * =========================================================
 */

function TextArea({
    label,
    name,
    value,
    onChange,
    placeholder,
    disabled = false,
    error,
    rows = 5,
    maxLength,
    required = false,
}: {
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    rows?: number;
    maxLength?: number;
    required?: boolean;
}) {
    return (
        <div>
            <FieldLabel
                htmlFor={name}
                required={required}
            >
                {label}
            </FieldLabel>

            <textarea
                id={name}
                name={name}
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                maxLength={maxLength}
                required={required}
                aria-invalid={Boolean(error)}
                className={[
                    "w-full resize-y rounded-xl border",
                    "bg-white px-4 py-3 text-sm",
                    "leading-6 text-slate-900 outline-none",
                    "transition-all duration-200",
                    "placeholder:text-slate-400",
                    "hover:border-slate-300",
                    "focus:border-[#1491FF]",
                    "focus:ring-4 focus:ring-[#1491FF]/10",
                    "disabled:cursor-not-allowed",
                    "disabled:bg-slate-50 disabled:opacity-60",
                    error
                        ? "border-red-400"
                        : "border-slate-200",
                ].join(" ")}
            />

            {maxLength !== undefined && (
                <p className="mt-1 text-right text-xs text-slate-400">
                    {value.length.toLocaleString()} /{" "}
                    {maxLength.toLocaleString()}
                </p>
            )}

            <FormFieldError message={error} />
        </div>
    );
}

type ListingCreditConsumption = NonNullable<
    NonNullable<
        Awaited<
            ReturnType<typeof createSellerListing>
        >["data"]
    >["creditConsumption"]
>;

/*
 * =========================================================
 * MAIN FORM
 * =========================================================
 */

export default function CreateListingForm() {
    const router = useRouter();

    const idempotencyKeyRef =
        useRef<string | null>(null);

    /*
     * Tracks the title automatically generated from
     * a selected catalog vehicle.
     *
     * This lets us clear an old generated title without
     * accidentally removing text the seller has edited.
     */
    const generatedTitleRef =
        useRef<string | null>(null);

    const [
        submissionError,
        setSubmissionError,
    ] = useState<FormError | null>(null);

    const [
        isCreatingDraft,
        setIsCreatingDraft,
    ] = useState(false);

    const [isSuccess, setIsSuccess] = useState(false);

    const [
        creditConsumption,
        setCreditConsumption,
    ] = useState<ListingCreditConsumption | null>(null);

    const [
        pendingListingId,
        setPendingListingId,
    ] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: {
            errors,
            isSubmitting,
            isDirty,
        },
    } = useForm<ListingFormSchemaValues>({
        resolver: zodResolver(listingFormSchema),
        defaultValues: DEFAULT_VALUES,
        mode: "onBlur",
    });

    /*
     * =========================================================
     * WATCHED FIELDS
     * =========================================================
     */

    const vehicleVariantId =
        watch("vehicleVariantId");

    const manualVehicle: ManualVehicleValues = {
        makeName: watch("makeName"),
        modelName: watch("modelName"),
        year: watch("year"),
        generationName: watch("generationName"),
        variantName: watch("variantName"),
    };

    const title = watch("title");
    const description = watch("description");
    const mileage = watch("mileage");
    const state = watch("state");
    const city = watch("city");

    const isBusy =
        isSubmitting || isCreatingDraft;

    /*
     * =========================================================
     * FIELD UPDATES
     * =========================================================
     */

    const setField = (
        field:
            | "title"
            | "description"
            | "mileage"
            | "state"
            | "city"
            | keyof ManualVehicleValues,
        value: string,
    ) => {
        /*
         * Once the seller edits the title manually,
         * stop treating it as an automatically generated title.
         */
        if (field === "title") {
            generatedTitleRef.current = null;
        }

        setValue(field, value, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const handleManualVehicleChange = useCallback(
        (field: keyof ManualVehicleValues, value: string) => {
            setValue(field, value, {
                shouldDirty: true,
                shouldValidate: true,
            });

            // Manual edits invalidate any previously selected catalogue ID.
            if (vehicleVariantId) {
                setValue("vehicleVariantId", "", {
                    shouldDirty: true,
                    shouldValidate: true,
                });
            }
        },
        [setValue, vehicleVariantId],
    );

    const handleVehicleDetailsChange = useCallback(
        (details: Partial<ManualVehicleValues>) => {
            for (const [field, value] of Object.entries(details) as [
                keyof ManualVehicleValues,
                string
            ][]) {
                setValue(field, value, {
                    shouldDirty: true,
                    shouldValidate: true,
                });
            }
        },
        [setValue],
    );

    /*
     * =========================================================
     * VEHICLE TITLE AUTOFILL
     * =========================================================
     */

    const handleVehicleSelected = useCallback(
        (vehicleTitle: string | null) => {
            /*
             * A search selection has been cleared or changed.
             */
            if (!vehicleTitle) {
                const previousGeneratedTitle =
                    generatedTitleRef.current;

                /*
                 * Only clear the title if the seller
                 * hasn't manually changed it.
                 */
                if (
                    previousGeneratedTitle &&
                    title === previousGeneratedTitle
                ) {
                    setValue("title", "", {
                        shouldDirty: true,
                        shouldValidate: true,
                    });
                }

                generatedTitleRef.current = null;

                return;
            }

            /*
             * Remember the generated title so we can
             * safely clear it later if necessary.
             */
            generatedTitleRef.current = vehicleTitle;

            setValue("title", vehicleTitle, {
                shouldDirty: true,
                shouldValidate: true,
            });
        },
        [setValue, title],
    );

    /*
     * =========================================================
     * ERROR HANDLING
     * =========================================================
     */

    const closeErrorModal = useCallback(() => {
        setSubmissionError(null);
    }, []);

    const goToSubscriptionPlans = useCallback(() => {
        setSubmissionError(null);

        router.push("/dashboard/subscriptions");
    }, [router]);

    const continueToListingEditor = useCallback(() => {
        if (!pendingListingId) {
            setCreditConsumption(null);
            return;
        }

        const listingId = pendingListingId;

        setCreditConsumption(null);
        setPendingListingId(null);

        router.push(
            `/dashboard/my-listings/${encodeURIComponent(listingId)}/edit`,
        );

        router.refresh();
    }, [pendingListingId, router]);

    const buyAnotherSubscription = useCallback(() => {
        setCreditConsumption(null);
        setPendingListingId(null);

        router.push("/dashboard/subscriptions");
    }, [router]);

    /*
     * =========================================================
     * SUBMIT
     * =========================================================
     */

    const onSubmit: SubmitHandler<
        ListingFormSchemaValues
    > = async (values) => {
        setSubmissionError(null);
        setCreditConsumption(null);
        setPendingListingId(null);
        setIsSuccess(false);
        setIsCreatingDraft(true);

        try {
            if (!idempotencyKeyRef.current) {
                idempotencyKeyRef.current =
                    crypto.randomUUID();
            }

            const response = await createSellerListing(
                buildCreateListingPayload(values),
                idempotencyKeyRef.current,
            );

            const listingId = response.data?.listing?.id;

            if (!listingId) {
                throw new Error(
                    "The listing was created, but the server did not return its ID. Check My Listings before trying again.",
                );
            }

            const consumption =
                response.data?.creditConsumption;

            setIsSuccess(true);

            /*
            * The user's final subscription credit
            * was consumed.
            *
            * Show the modal before navigating to
            * the listing editor.
            */
            if (
                consumption?.subscriptionCreditsExhausted
            ) {
                setPendingListingId(listingId);
                setCreditConsumption(consumption);

                return;
            }

            /*
            * Normal successful listing creation.
            */
            router.push(
                `/dashboard/my-listings/${encodeURIComponent(listingId)}/edit`,
            );

            router.refresh();
        } catch (error) {
            setSubmissionError(
                getErrorMessage(error),
            );
        } finally {
            setIsCreatingDraft(false);
        }
    };

    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    return (
        <>
            {/* DRAFT CREATION OVERLAY */}

            {isCreatingDraft && (
                <div
                    role="status"
                    aria-live="polite"
                    aria-label="Creating your vehicle listing draft"
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-6 backdrop-blur-sm"
                >
                    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xl sm:p-10">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF5FF]">
                            <LoaderCircle
                                size={30}
                                strokeWidth={2}
                                className="animate-spin text-[#1491FF]"
                            />
                        </div>

                        <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                            Creating your draft
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-slate-500">
                            We're saving your vehicle
                            information and preparing your
                            listing.
                        </p>

                        <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#1491FF]" />
                        </div>

                        <p className="mt-4 text-xs text-slate-400">
                            Please don't close or refresh
                            this page.
                        </p>
                    </div>
                </div>
            )}

            {/* ERROR MODAL */}

            {submissionError && !isCreatingDraft && (
                <CreateListingErrorModal
                    error={submissionError}
                    onClose={closeErrorModal}
                    onViewPlans={goToSubscriptionPlans}
                />
            )}

            {/* SUBSCRIPTION CREDIT EXHAUSTION MODAL */}

            {creditConsumption &&
                creditConsumption.subscriptionCreditsExhausted &&
                !isCreatingDraft && (
                    <SubscriptionCreditsExhaustedModal
                        creditConsumption={creditConsumption}
                        onClose={continueToListingEditor}
                        onViewPlans={buyAnotherSubscription}
                    />
                )}

            <div className="mx-auto w-full max-w-5xl pb-12">

                {/* BACK BUTTON */}

                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-[#0877D9]"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>

                {/* PAGE HEADER */}

                <div className="mb-8">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1491FF]/20 bg-[#EAF5FF] px-3 py-1.5 text-xs font-semibold text-[#0877D9]">
                        <PackageCheck size={14} />
                        Create a vehicle listing
                    </div>

                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                        List your vehicle
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Provide accurate vehicle details
                        to help buyers find your listing.
                        You can add photos and review
                        everything before submitting it
                        for approval.
                    </p>
                </div>

                {/* SUCCESS MESSAGE */}

                {isSuccess && (
                    <div
                        role="status"
                        className="mb-6 flex items-center gap-3 rounded-xl border border-[#1491FF]/20 bg-[#F4F9FF] p-4"
                    >
                        <CheckCircle2
                            size={19}
                            className="shrink-0 text-[#1491FF]"
                        />

                        <p className="text-sm text-slate-700">
                            Listing created successfully.
                            Opening your listing editor...
                        </p>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="space-y-5"
                >

                    {/* VEHICLE IDENTIFICATION */}

                    <FormSection
                        icon={<PackageCheck size={19} />}
                        title="Vehicle identification"
                        description="Select your vehicle from the KARMASS catalog or enter its details manually."
                    >
                        <VehicleSelectionFields
                            value={vehicleVariantId}
                            onChange={(nextValue) =>
                                setValue(
                                    "vehicleVariantId",
                                    nextValue,
                                    {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                    },
                                )
                            }
                            onVehicleSelected={
                                handleVehicleSelected
                            }
                            manualValue={manualVehicle}
                            onManualVehicleChange={
                                handleManualVehicleChange
                            }
                            onVehicleDetailsChange={
                                handleVehicleDetailsChange
                            }
                            disabled={isBusy}
                            error={
                                errors.vehicleVariantId?.message
                            }
                        />
                    </FormSection>

                    {/* LISTING INFORMATION */}

                    <FormSection
                        icon={<Tag size={19} />}
                        title="Listing information"
                        description="Give buyers a clear and useful description of your vehicle."
                    >
                        <div className="space-y-5">

                            {/* LISTING TITLE */}

                            <div>
                                <TextInput
                                    label="Listing title"
                                    name="title"
                                    value={title}
                                    onChange={(value) =>
                                        setField(
                                            "title",
                                            value,
                                        )
                                    }
                                    placeholder="e.g. Clean 2020 Toyota Camry XLE"
                                    disabled={isBusy}
                                    error={errors.title?.message}
                                    required
                                    autoFilled={Boolean(
                                        generatedTitleRef.current &&
                                        title === generatedTitleRef.current,
                                    )}
                                />

                                <p className="mt-2 text-xs leading-5 text-slate-400">
                                    Your selected vehicle name
                                    is filled in automatically.
                                    You can edit it to highlight
                                    important details.
                                </p>
                            </div>

                            {/* DESCRIPTION */}

                            <TextArea
                                label="Description"
                                name="description"
                                value={description}
                                onChange={(value) =>
                                    setField(
                                        "description",
                                        value,
                                    )
                                }
                                placeholder="Describe the vehicle's condition, maintenance history, features, and any important details buyers should know."
                                disabled={isBusy}
                                error={
                                    errors.description?.message
                                }
                                maxLength={10000}
                                rows={7}
                                required
                            />
                        </div>
                    </FormSection>

                    {/* PRICE AND CONDITION */}

                    <FormSection
                        icon={<Tag size={19} />}
                        title="Price and condition"
                        description="Set your asking price and describe the vehicle's condition."
                    >
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                            {/* PRICE */}

                            <div>
                                <FieldLabel
                                    htmlFor="price"
                                    required
                                >
                                    Asking price
                                </FieldLabel>

                                <div className="flex h-12 overflow-hidden rounded-xl border border-slate-200 bg-white transition-all focus-within:border-[#1491FF] focus-within:ring-4 focus-within:ring-[#1491FF]/10">
                                    <span className="flex items-center border-r border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-500">
                                        ₦
                                    </span>

                                    <input
                                        id="price"
                                        type="number"
                                        inputMode="decimal"
                                        min="0.01"
                                        step="0.01"
                                        placeholder="0.00"
                                        disabled={isBusy}
                                        aria-invalid={Boolean(
                                            errors.price,
                                        )}
                                        className="min-w-0 flex-1 bg-transparent px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-60"
                                        {...register("price")}
                                    />
                                </div>

                                <FormFieldError
                                    message={errors.price?.message}
                                />

                                <p className="mt-2 text-xs text-slate-400">
                                    Prices are displayed in
                                    Nigerian naira.
                                </p>
                            </div>

                            {/* CONDITION */}

                            <div>
                                <FieldLabel
                                    htmlFor="condition"
                                    required
                                >
                                    Vehicle condition
                                </FieldLabel>

                                <div className="relative">
                                    <select
                                        id="condition"
                                        disabled={isBusy}
                                        className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-800 outline-none transition-all hover:border-slate-300 focus:border-[#1491FF] focus:ring-4 focus:ring-[#1491FF]/10 disabled:opacity-60"
                                        {...register("condition")}
                                    >
                                        <option value="BRAND_NEW">
                                            Brand New
                                        </option>

                                        <option value="FOREIGN_USED">
                                            Foreign Used
                                        </option>

                                        <option value="NIGERIAN_USED">
                                            Nigerian Used
                                        </option>
                                    </select>

                                    <ChevronDown
                                        size={16}
                                        aria-hidden="true"
                                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                </div>

                                <FormFieldError
                                    message={
                                        errors.condition?.message
                                    }
                                />
                            </div>

                            {/* MILEAGE */}

                            <div className="sm:col-span-2">
                                <TextInput
                                    label="Mileage (km)"
                                    name="mileage"
                                    value={mileage}
                                    onChange={(value) =>
                                        setField(
                                            "mileage",
                                            value,
                                        )
                                    }
                                    type="number"
                                    placeholder="e.g. 65000"
                                    min="0"
                                    disabled={isBusy}
                                    error={
                                        errors.mileage?.message
                                    }
                                />

                                <p className="mt-2 text-xs text-slate-400">
                                    Leave blank if the mileage
                                    is unknown or not applicable.
                                </p>
                            </div>
                        </div>
                    </FormSection>

                    {/* LOCATION */}

                    <FormSection
                        icon={<MapPin size={19} />}
                        title="Vehicle location"
                        description="Tell buyers where the vehicle is located."
                    >
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                            {/* COUNTRY */}

                            <div>
                                <FieldLabel htmlFor="country">
                                    Country
                                </FieldLabel>

                                <input
                                    id="country"
                                    value="Nigeria"
                                    readOnly
                                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600 outline-none"
                                    {...register("country")}
                                />
                            </div>

                            {/* STATE */}

                            <TextInput
                                label="State"
                                name="state"
                                value={state}
                                onChange={(value) =>
                                    setField("state", value)
                                }
                                placeholder="e.g. Lagos"
                                disabled={isBusy}
                                error={errors.state?.message}
                            />

                            {/* CITY */}

                            <div className="sm:col-span-2">
                                <TextInput
                                    label="City"
                                    name="city"
                                    value={city}
                                    onChange={(value) =>
                                        setField("city", value)
                                    }
                                    placeholder="e.g. Ikeja"
                                    disabled={isBusy}
                                    error={errors.city?.message}
                                />
                            </div>
                        </div>
                    </FormSection>

                    {/* LISTING REVIEW */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02] sm:p-5">
                        <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF5FF] text-[#1491FF]">
                                <ShieldCheck size={19} />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-slate-900">
                                    Listing review
                                </p>

                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    Your listing will first be
                                    created as a draft. You can
                                    add photos and submit it
                                    for review afterward.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ACTIONS */}

                    <div className="flex flex-col-reverse gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">

                        <p className="text-xs leading-5 text-slate-500">
                            Fields marked with{" "}
                            <span className="font-semibold text-[#1491FF]">
                                *
                            </span>{" "}
                            are required.
                        </p>

                        <div className="flex flex-col gap-3 sm:flex-row">

                            <button
                                type="button"
                                disabled={isBusy}
                                onClick={() =>
                                    router.push(
                                        "/dashboard/my-listings",
                                    )
                                }
                                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isBusy}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-6 text-sm font-semibold text-white shadow-sm shadow-blue-900/10 transition-all hover:bg-[#0877D9] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isBusy ? (
                                    <>
                                        <LoaderCircle
                                            size={17}
                                            className="animate-spin"
                                        />

                                        Creating listing...
                                    </>
                                ) : (
                                    <>
                                        Create draft

                                        <ArrowRight size={17} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {isDirty && (
                        <p className="text-center text-xs text-slate-400">
                            Your changes have not been saved yet.
                        </p>
                    )}
                </form>
            </div>
        </>
    );
}