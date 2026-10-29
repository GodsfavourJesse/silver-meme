"use client";

import { useCallback, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { useForm, type SubmitHandler } from "react-hook-form";

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
} from "@/app/lib/user/listing/listing-form.schema";

import { createSellerListing } from "@/app/services/user/listings/listing.service";

import { VehicleSelectionFields } from "./VehicleSelectionFields";

import { CreateListingErrorModal } from "../helpers/CreateListingErrorModal";

import {
    buildCreateListingPayload,
    DEFAULT_VALUES,
    getErrorMessage,
    type FormError,
} from "../helpers/create-listing.helpers";

// Small form building blocks

function FormFieldError({ message }: { message?: string }) {
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
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="mb-6 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#7008E7]/20 bg-[#7008E7]/[0.06] text-[#7008E7]">
                    {icon}
                </div>

                <div>
                    <h2 className="text-base font-semibold text-slate-900">
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
            {required && <span className="ml-1 text-[#7008E7]">*</span>}
        </label>
    );
}

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
}) {
    return (
        <div>
            <FieldLabel htmlFor={name} required={required}>
                {label}
            </FieldLabel>

            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                min={min}
                max={max}
                required={required}
                aria-invalid={Boolean(error)}
                className={[
                    "h-12 w-full rounded-xl border",
                    "bg-white px-4 text-sm text-slate-900",
                    "outline-none transition-colors",
                    "placeholder:text-slate-400",
                    "focus:border-[#7008E7]/60",
                    "focus:ring-2 focus:ring-[#7008E7]/10",
                    "disabled:opacity-50",
                    error ? "border-red-400/50" : "border-slate-200",
                ].join(" ")}
            />

            <FormFieldError message={error} />
        </div>
    );
}

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
            <FieldLabel htmlFor={name} required={required}>
                {label}
            </FieldLabel>

            <textarea
                id={name}
                name={name}
                value={value}
                onChange={(event) => onChange(event.target.value)}
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
                    "placeholder:text-slate-400",
                    "focus:border-[#7008E7]/60",
                    "focus:ring-2 focus:ring-[#7008E7]/10",
                    "disabled:opacity-50",
                    error ? "border-red-400/50" : "border-slate-200",
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

/* -------------------------------------------------------------------------- */
/*  Main form                                                                 */
/* -------------------------------------------------------------------------- */

export default function CreateListingForm() {
    const router = useRouter();

    const idempotencyKeyRef = useRef<string | null>(null);

    const [submissionError, setSubmissionError] = useState<FormError | null>(
        null,
    );
    const [isCreatingDraft, setIsCreatingDraft] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<ListingFormSchemaValues>({
        resolver: zodResolver(listingFormSchema),
        defaultValues: DEFAULT_VALUES,
        mode: "onBlur",
    });

    const vehicleVariantId = watch("vehicleVariantId");
    const title = watch("title");
    const description = watch("description");
    const mileage = watch("mileage");
    const state = watch("state");
    const city = watch("city");

    const isBusy = isSubmitting || isCreatingDraft;

    /** Updates a text field and re-validates it. */
    const setField = (
        field: "title" | "description" | "mileage" | "state" | "city",
        value: string,
    ) =>
        setValue(field, value, {
            shouldDirty: true,
            shouldValidate: true,
        });

    const closeErrorModal = useCallback(() => setSubmissionError(null), []);

    const goToSubscriptionPlans = useCallback(() => {
        setSubmissionError(null);
        router.push("/dashboard/subscriptions");
    }, [router]);

    const onSubmit: SubmitHandler<ListingFormSchemaValues> = async (values) => {
        setSubmissionError(null);
        setIsSuccess(false);
        setIsCreatingDraft(true);

        try {
            /*
             * The listing service must generate and send
             * an Idempotency-Key for this creation attempt,
             * and attach the required CSRF token.
             */
            if (!idempotencyKeyRef.current) {
                idempotencyKeyRef.current = crypto.randomUUID();
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

            setIsSuccess(true);

            router.push(`/dashboard/my-listings/${encodeURIComponent(listingId)}/edit`);
            router.refresh();
        } catch (error) {
            setSubmissionError(getErrorMessage(error));
        } finally {
            // Always dismiss the loading overlay, including HTTP 402 responses.
            setIsCreatingDraft(false);
        }
    };

    return (
        <>
            {/* Full-screen draft creation feedback */}
            {isCreatingDraft && (
                <div
                    role="status"
                    aria-live="polite"
                    aria-label="Creating your vehicle listing draft"
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-6 backdrop-blur-md"
                >
                    <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-2xl sm:p-10">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#7008E7]/20 bg-[#7008E7]/[0.06]">
                            <LoaderCircle
                                size={32}
                                strokeWidth={2}
                                className="animate-spin text-[#7008E7]"
                            />
                        </div>

                        <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                            Creating draft...
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-slate-500">
                            We're saving your vehicle listing. Please wait while
                            we prepare your draft.
                        </p>

                        <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#7008E7]" />
                        </div>

                        <p className="mt-4 text-xs text-slate-400">
                            Please don't close or refresh this page.
                        </p>
                    </div>
                </div>
            )}

            {/* Error modal: appears as soon as the loading overlay closes */}
            {submissionError && !isCreatingDraft && (
                <CreateListingErrorModal
                    error={submissionError}
                    onClose={closeErrorModal}
                    onViewPlans={goToSubscriptionPlans}
                />
            )}

            <div className="mx-auto w-full max-w-5xl pb-12">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>

                <div className="mb-8">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#7008E7]/20 bg-[#7008E7]/[0.06] px-3 py-1.5 text-xs font-medium text-[#7008E7]">
                        <PackageCheck size={14} />
                        Create a vehicle listing
                    </div>

                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                        List your vehicle
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Provide accurate vehicle details to help buyers find your
                        listing. You can review the information before submitting
                        it for approval.
                    </p>
                </div>

                {isSuccess && (
                    <div
                        role="status"
                        className="mb-6 flex items-center gap-3 rounded-xl border border-[#7008E7]/20 bg-[#7008E7]/[0.05] p-4"
                    >
                        <CheckCircle2
                            size={19}
                            className="shrink-0 text-[#7008E7]"
                        />
                        <p className="text-sm text-slate-700">
                            Listing created successfully. Opening your listing
                            editor...
                        </p>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="space-y-5"
                >
                    {/* ------------------ Vehicle identification ------------------ */}
                    <FormSection
                        icon={<PackageCheck size={19} />}
                        title="Vehicle identification"
                        description="Choose the exact vehicle variant from the KARMASS catalog."
                    >
                        <VehicleSelectionFields
                            value={vehicleVariantId}
                            onChange={(nextValue) =>
                                setValue("vehicleVariantId", nextValue, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                })
                            }
                            disabled={isBusy}
                            error={errors.vehicleVariantId?.message}
                        />
                    </FormSection>

                    {/* -------------------- Listing information -------------------- */}
                    <FormSection
                        icon={<Tag size={19} />}
                        title="Listing information"
                        description="Give buyers a clear description of your vehicle."
                    >
                        <div className="space-y-5">
                            <div>
                                <TextInput
                                    label="Listing title"
                                    name="title"
                                    value={title}
                                    onChange={(value) => setField("title", value)}
                                    placeholder="e.g. Clean 2020 Toyota Camry XLE"
                                    disabled={isBusy}
                                    error={errors.title?.message}
                                    required
                                />

                                <p className="mt-2 text-xs leading-5 text-slate-400">
                                    Include the vehicle name, year, and a useful
                                    distinguishing detail.
                                </p>
                            </div>

                            <TextArea
                                label="Description"
                                name="description"
                                value={description}
                                onChange={(value) =>
                                    setField("description", value)
                                }
                                placeholder="Describe the vehicle's condition, maintenance history, features, and any important details buyers should know."
                                disabled={isBusy}
                                error={errors.description?.message}
                                maxLength={10000}
                                rows={7}
                                required
                            />
                        </div>
                    </FormSection>

                    {/* ---------------------- Price & condition --------------------- */}
                    <FormSection
                        icon={<Tag size={19} />}
                        title="Price and condition"
                        description="Set your asking price and describe the vehicle's condition."
                    >
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <FieldLabel htmlFor="price" required>
                                    Asking price
                                </FieldLabel>

                                <div className="flex h-12 overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-[#7008E7]/60 focus-within:ring-2 focus-within:ring-[#7008E7]/10">
                                    <span className="flex items-center border-r border-slate-200 px-4 text-sm font-medium text-slate-500">
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
                                        aria-invalid={Boolean(errors.price)}
                                        className="min-w-0 flex-1 bg-transparent px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                        {...register("price")}
                                    />
                                </div>

                                <FormFieldError message={errors.price?.message} />

                                <p className="mt-2 text-xs text-slate-400">
                                    Prices are displayed in Nigerian naira.
                                </p>
                            </div>

                            <div>
                                <FieldLabel htmlFor="condition" required>
                                    Vehicle condition
                                </FieldLabel>

                                <div className="relative">
                                    <select
                                        id="condition"
                                        disabled={isBusy}
                                        className="scheme-light h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-800 outline-none transition-colors focus:border-[#7008E7]/60 focus:ring-2 focus:ring-[#7008E7]/10"
                                        {...register("condition")}
                                    >
                                        <option
                                            className="bg-white text-slate-800"
                                            value="USED"
                                        >
                                            Used
                                        </option>
                                        <option
                                            className="bg-white text-slate-800"
                                            value="NEW"
                                        >
                                            Brand new
                                        </option>
                                    </select>

                                    <ChevronDown
                                        size={16}
                                        aria-hidden="true"
                                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                </div>

                                <FormFieldError
                                    message={errors.condition?.message}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <TextInput
                                    label="Mileage (km)"
                                    name="mileage"
                                    value={mileage}
                                    onChange={(value) => setField("mileage", value)}
                                    type="number"
                                    placeholder="e.g. 65000"
                                    min="0"
                                    disabled={isBusy}
                                    error={errors.mileage?.message}
                                />

                                <p className="mt-2 text-xs text-slate-400">
                                    Leave blank if the mileage is unknown or not
                                    applicable.
                                </p>
                            </div>
                        </div>
                    </FormSection>

                    {/* ------------------------- Location -------------------------- */}
                    <FormSection
                        icon={<MapPin size={19} />}
                        title="Vehicle location"
                        description="Tell buyers where the vehicle is located."
                    >
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <FieldLabel htmlFor="country">Country</FieldLabel>

                                <input
                                    id="country"
                                    value="Nigeria"
                                    readOnly
                                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600 outline-none"
                                    {...register("country")}
                                />
                            </div>

                            <TextInput
                                label="State"
                                name="state"
                                value={state}
                                onChange={(value) => setField("state", value)}
                                placeholder="e.g. Lagos"
                                disabled={isBusy}
                                error={errors.state?.message}
                            />

                            <div className="sm:col-span-2">
                                <TextInput
                                    label="City"
                                    name="city"
                                    value={city}
                                    onChange={(value) => setField("city", value)}
                                    placeholder="e.g. Ikeja"
                                    disabled={isBusy}
                                    error={errors.city?.message}
                                />
                            </div>
                        </div>
                    </FormSection>

                    {/* ------------------------ Review note ------------------------ */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                            <ShieldCheck
                                size={19}
                                className="mt-0.5 shrink-0 text-[#7008E7]"
                            />

                            <div>
                                <p className="text-sm font-medium text-slate-900">
                                    Listing review
                                </p>
                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    Your listing will be created as a draft. You
                                    can add photos and submit it for review
                                    afterward.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* -------------------------- Actions -------------------------- */}
                    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs leading-5 text-slate-500">
                            Fields marked with{" "}
                            <span className="text-[#7008E7]">*</span> are
                            required.
                        </p>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                disabled={isBusy}
                                onClick={() =>
                                    router.push("/dashboard/my-listings")
                                }
                                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isBusy}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#7008E7] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#5f06c7] disabled:cursor-not-allowed disabled:opacity-60"
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