"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";

import { useRouter } from "next/navigation";

import {
    Controller,
    useForm,
    type SubmitHandler,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "framer-motion";

import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    ChevronDown,
    LoaderCircle,
    MapPin,
    PackageCheck,
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
    getNigerianStates,
    getLgasByState,
} from "@/app/services/user/locations/location.service";

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
|--------------------------------------------------------------------------
| ANIMATION VARIANTS
|--------------------------------------------------------------------------
*/

const sectionVariants = {
    hidden: {
        opacity: 0,
        y: 16,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1] as const,
        },
    },
};

const overlayVariants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.2,
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.15,
        },
    },
};

const dialogVariants = {
    hidden: {
        opacity: 0,
        scale: 0.96,
        y: 12,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.25,
            ease: [0.22, 1, 0.36, 1] as const,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.98,
        y: 8,
        transition: {
            duration: 0.15,
        },
    },
};

const successVariants = {
    hidden: {
        opacity: 0,
        y: -8,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.25,
        },
    },
    exit: {
        opacity: 0,
        y: -6,
        transition: {
            duration: 0.15,
        },
    },
};

/*
|--------------------------------------------------------------------------
| PRICE FORMATTING
|--------------------------------------------------------------------------
*/

function formatPrice(value: string | number): string {
    const digits = String(value ?? "").replace(/\D/g, "");

    if (!digits) return "";

    return Number(digits).toLocaleString("en-NG");
}

/*
|--------------------------------------------------------------------------
| FIELD ERROR
|--------------------------------------------------------------------------
*/

function FormFieldError({
    message,
}: {
    message?: string;
}) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <AnimatePresence initial={false}>
            {message && (
                <motion.p
                    initial={
                        shouldReduceMotion
                            ? false
                            : { opacity: 0, y: -5 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.18 }}
                    className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500"
                >
                    <AlertCircle size={13} />
                    {message}
                </motion.p>
            )}
        </AnimatePresence>
    );
}

/*
|--------------------------------------------------------------------------
| SECTION HEADING
|--------------------------------------------------------------------------
*/

function SectionHeading({
    number,
    title,
    icon,
}: {
    number: string;
    title: string;
    icon: ReactNode;
}) {
    return (
        <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#0877D9]">
                {icon}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-wider text-[#1491FF]">
                        {number}
                    </span>

                    <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">
                        {title}
                    </h2>
                </div>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| FIELD LABEL
|--------------------------------------------------------------------------
*/

function FieldLabel({
    htmlFor,
    required = false,
    children,
}: {
    htmlFor: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <label
            htmlFor={htmlFor}
            className="mb-2 block text-[13px] font-medium text-slate-700"
        >
            {children}

            {required && (
                <span className="ml-1 text-[#1491FF]">*</span>
            )}
        </label>
    );
}

/*
|--------------------------------------------------------------------------
| INPUT CLASS
|--------------------------------------------------------------------------
*/

const inputClass = [
    "h-12 w-full rounded-xl border bg-white px-3.5",
    "text-[14px] text-slate-900 outline-none",
    "placeholder:text-slate-400",
    "transition-all duration-200 ease-out",
    "hover:border-slate-300",
    "focus:border-[#1491FF]",
    "focus:ring-[3px] focus:ring-[#1491FF]/10",
    "disabled:cursor-not-allowed",
    "disabled:bg-slate-50 disabled:opacity-60",
].join(" ");

/*
|--------------------------------------------------------------------------
| TEXT INPUT
|--------------------------------------------------------------------------
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
        <div className="min-w-0">
            <div className="flex items-center justify-between gap-2">
                <FieldLabel
                    htmlFor={name}
                    required={required}
                >
                    {label}
                </FieldLabel>

                {autoFilled && (
                    <span className="mb-2 inline-flex items-center gap-1 text-[10px] font-medium text-[#0877D9]">
                        <CheckCircle2 size={11} />
                        Auto-filled
                    </span>
                )}
            </div>

            <input
                id={name}
                name={name}
                type={type}
                inputMode={
                    type === "number" ? "decimal" : undefined
                }
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
                    inputClass,
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
|--------------------------------------------------------------------------
| TEXT AREA
|--------------------------------------------------------------------------
*/

function TextArea({
    label,
    name,
    value,
    onChange,
    placeholder,
    disabled = false,
    error,
    rows = 4,
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
                    "min-h-[110px] w-full resize-y rounded-xl",
                    "border bg-white px-3.5 py-3",
                    "text-[14px] leading-6 text-slate-900",
                    "outline-none placeholder:text-slate-400",
                    "transition-all duration-200",
                    "hover:border-slate-300",
                    "focus:border-[#1491FF]",
                    "focus:ring-[3px] focus:ring-[#1491FF]/10",
                    "disabled:cursor-not-allowed",
                    "disabled:bg-slate-50 disabled:opacity-60",
                    error
                        ? "border-red-400"
                        : "border-slate-200",
                ].join(" ")}
            />

            {maxLength !== undefined && (
                <p className="mt-1 text-right text-[11px] text-slate-400">
                    {value.length.toLocaleString()} /{" "}
                    {maxLength.toLocaleString()}
                </p>
            )}

            <FormFieldError message={error} />
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| SELECT FIELD
|--------------------------------------------------------------------------
*/

function SelectField({
    label,
    name,
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
    loading = false,
    error,
    required = false,
}: {
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    options: {
        label: string;
        value: string;
    }[];
    placeholder: string;
    disabled?: boolean;
    loading?: boolean;
    error?: string;
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

            <div className="relative">
                <select
                    id={name}
                    value={value}
                    disabled={disabled}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                    aria-invalid={Boolean(error)}
                    className={[
                        inputClass,
                        "appearance-none pr-10",
                        "disabled:cursor-not-allowed",
                        error
                            ? "border-red-400"
                            : "border-slate-200",
                    ].join(" ")}
                >
                    <option value="">
                        {placeholder}
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

                {loading ? (
                    <LoaderCircle
                        size={16}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-slate-400"
                    />
                ) : (
                    <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                )}
            </div>

            <FormFieldError message={error} />
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| CREDIT TYPE
|--------------------------------------------------------------------------
*/

type ListingCreditConsumption = NonNullable<
    NonNullable<
        Awaited<
            ReturnType<typeof createSellerListing>
        >["data"]
    >["creditConsumption"]
>;

/*
|--------------------------------------------------------------------------
| MAIN FORM
|--------------------------------------------------------------------------
*/

export default function CreateListingForm() {
    const router = useRouter();
    const shouldReduceMotion = useReducedMotion();

    const idempotencyKeyRef =
        useRef<string | null>(null);

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

    /*
    |--------------------------------------------------------------------------
    | LOCATION STATE
    |--------------------------------------------------------------------------
    */

    const [states, setStates] = useState<string[]>([]);
    const [lgas, setLgas] = useState<string[]>([]);

    const [statesLoading, setStatesLoading] = useState(true);
    const [lgasLoading, setLgasLoading] = useState(false);

    const [statesError, setStatesError] = useState<string | null>(null);
    const [lgasError, setLgasError] = useState<string | null>(null);

    const [statesRetry, setStatesRetry] = useState(0);
    const [lgasRetry, setLgasRetry] = useState(0);

    /*
    |--------------------------------------------------------------------------
    | FORM
    |--------------------------------------------------------------------------
    */

    const {
        register,
        control,
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
    |--------------------------------------------------------------------------
    | WATCHED FIELDS
    |--------------------------------------------------------------------------
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
    |--------------------------------------------------------------------------
    | LOAD STATES
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const controller = new AbortController();

        const loadStates = async () => {
            setStatesLoading(true);
            setStatesError(null);

            try {
                const result = await getNigerianStates(
                    controller.signal,
                );

                if (!controller.signal.aborted) {
                    setStates(result);
                }
            } catch (error) {
                if (
                    error instanceof Error &&
                    error.name === "AbortError"
                ) {
                    return;
                }

                if (!controller.signal.aborted) {
                    setStatesError(
                        error instanceof Error
                            ? error.message
                            : "Unable to load states.",
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setStatesLoading(false);
                }
            }
        };

        void loadStates();

        return () => controller.abort();
    }, [statesRetry]);

    /*
    |--------------------------------------------------------------------------
    | LOAD LGAS
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const controller = new AbortController();

        const loadLgas = async () => {
            if (!state.trim()) {
                setLgas([]);
                setLgasError(null);
                setLgasLoading(false);
                return;
            }

            setLgas([]);
            setLgasError(null);
            setLgasLoading(true);

            try {
                const result = await getLgasByState(
                    state,
                    controller.signal,
                );

                if (!controller.signal.aborted) {
                    setLgas(result);
                }
            } catch (error) {
                if (
                    error instanceof Error &&
                    error.name === "AbortError"
                ) {
                    return;
                }

                if (!controller.signal.aborted) {
                    setLgasError(
                        error instanceof Error
                            ? error.message
                            : "Unable to load LGAs.",
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLgasLoading(false);
                }
            }
        };

        void loadLgas();

        return () => controller.abort();
    }, [state, lgasRetry]);

    /*
    |--------------------------------------------------------------------------
    | FIELD UPDATES
    |--------------------------------------------------------------------------
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
        if (field === "title") {
            generatedTitleRef.current = null;
        }

        setValue(field, value, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const handleStateChange = (nextState: string) => {
        setField("state", nextState);
        setField("city", "");

        setLgasError(null);
    };

    const handleManualVehicleChange = useCallback(
        (
            field: keyof ManualVehicleValues,
            value: string,
        ) => {
            setValue(field, value, {
                shouldDirty: true,
                shouldValidate: true,
            });

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
    |--------------------------------------------------------------------------
    | VEHICLE TITLE AUTOFILL
    |--------------------------------------------------------------------------
    */

    const handleVehicleSelected = useCallback(
        (vehicleTitle: string | null) => {
            if (!vehicleTitle) {
                const previousGeneratedTitle =
                    generatedTitleRef.current;

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

            generatedTitleRef.current = vehicleTitle;

            setValue("title", vehicleTitle, {
                shouldDirty: true,
                shouldValidate: true,
            });
        },
        [setValue, title],
    );

    /*
    |--------------------------------------------------------------------------
    | ERROR AND MODAL HANDLERS
    |--------------------------------------------------------------------------
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
    |--------------------------------------------------------------------------
    | SUBMISSION
    |--------------------------------------------------------------------------
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

            if (
                consumption?.subscriptionCreditsExhausted
            ) {
                setPendingListingId(listingId);
                setCreditConsumption(consumption);
                return;
            }

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
    |--------------------------------------------------------------------------
    | SELECT OPTIONS
    |--------------------------------------------------------------------------
    */

    const stateOptions = states.map((item) => ({
        label: item,
        value: item,
    }));

    const lgaOptions = lgas.map((item) => ({
        label: item,
        value: item,
    }));

    /*
    |--------------------------------------------------------------------------
    | SECTION ANIMATION PROPS
    |--------------------------------------------------------------------------
    */

    const sectionAnimation = shouldReduceMotion
        ? {}
        : {
            variants: sectionVariants,
            initial: "hidden" as const,
            whileInView: "visible" as const,
            viewport: {
                once: true,
                amount: 0.08,
            },
        };

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <>
            {/* LOADING OVERLAY */}

            <AnimatePresence>
                {isCreatingDraft && (
                    <motion.div
                        key="listing-loading"
                        role="status"
                        aria-live="polite"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-5 backdrop-blur-[3px]"
                    >
                        <motion.div
                            variants={dialogVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="w-full max-w-[320px] rounded-2xl border border-slate-100 bg-white p-7 text-center shadow-2xl"
                        >
                            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF5FF]">
                                <LoaderCircle
                                    size={27}
                                    className="animate-spin text-[#1491FF]"
                                />
                            </div>

                            <h2 className="text-lg font-semibold text-slate-900">
                                Creating your listing
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Just a moment...
                            </p>

                            <div className="mt-6 h-1 overflow-hidden rounded-full bg-slate-100">
                                <motion.div
                                    className="h-full w-1/3 rounded-full bg-[#1491FF]"
                                    animate={
                                        shouldReduceMotion
                                            ? undefined
                                            : { x: ["-100%", "400%"] }
                                    }
                                    transition={{
                                        duration: 1.3,
                                        ease: "easeInOut",
                                        repeat: Infinity,
                                    }}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ERROR MODAL */}

            {submissionError && !isCreatingDraft && (
                <CreateListingErrorModal
                    error={submissionError}
                    onClose={closeErrorModal}
                    onViewPlans={goToSubscriptionPlans}
                />
            )}

            {/* SUBSCRIPTION MODAL */}

            {creditConsumption &&
                creditConsumption.subscriptionCreditsExhausted &&
                !isCreatingDraft && (
                    <SubscriptionCreditsExhaustedModal
                        creditConsumption={creditConsumption}
                        onClose={continueToListingEditor}
                        onViewPlans={buyAnotherSubscription}
                    />
                )}

            <div className="mx-auto w-full max-w-3xl pb-[calc(160px+env(safe-area-inset-bottom))] sm:pb-12">

                {/* HEADER */}

                <motion.header
                    initial={
                        shouldReduceMotion
                            ? false
                            : { opacity: 0, y: 12 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="mb-7"
                >
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="mb-5 inline-flex h-9 items-center gap-2 rounded-lg text-sm font-medium text-slate-500 transition-colors hover:text-[#0877D9]"
                    >
                        <ArrowLeft size={17} />
                        Back
                    </button>

                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <PackageCheck
                                    size={17}
                                    className="text-[#1491FF]"
                                />

                                <span className="text-xs font-semibold uppercase tracking-wider text-[#0877D9]">
                                    New listing
                                </span>
                            </div>

                            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                                Add your vehicle
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Enter the details to get started.
                            </p>
                        </div>

                        <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF5FF] text-[#1491FF] sm:flex">
                            <Tag size={22} />
                        </div>
                    </div>

                    {/* PROGRESS */}

                    <div className="mt-6">
                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                            <span>Vehicle details</span>
                            <span>4 sections</span>
                        </div>

                        <div className="mt-2 grid grid-cols-4 gap-1.5">
                            {[1, 2, 3, 4].map((step) => (
                                <motion.div
                                    key={step}
                                    initial={
                                        shouldReduceMotion
                                            ? false
                                            : { scaleX: 0 }
                                    }
                                    animate={{ scaleX: 1 }}
                                    transition={{
                                        duration: 0.35,
                                        delay: step * 0.07,
                                    }}
                                    className="h-1 origin-left rounded-full bg-[#1491FF]/80"
                                />
                            ))}
                        </div>
                    </div>
                </motion.header>

                {/* SUCCESS */}

                <AnimatePresence>
                    {isSuccess && (
                        <motion.div
                            key="listing-success"
                            role="status"
                            variants={successVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="mb-5 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
                        >
                            <CheckCircle2 size={17} />
                            Listing created successfully.
                        </motion.div>
                    )}
                </AnimatePresence>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="space-y-5"
                >

                    {/* SECTION 01: VEHICLE */}

                    <motion.section
                        {...sectionAnimation}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02] sm:p-6"
                    >
                        <SectionHeading
                            number="01"
                            title="Vehicle"
                            icon={<PackageCheck size={18} />}
                        />

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
                    </motion.section>

                    {/* SECTION 02: DETAILS */}

                    <motion.section
                        {...sectionAnimation}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02] sm:p-6"
                    >
                        <SectionHeading
                            number="02"
                            title="Listing details"
                            icon={<Tag size={18} />}
                        />

                        <div className="space-y-5">
                            <TextInput
                                label="Listing title"
                                name="title"
                                value={title}
                                onChange={(value) =>
                                    setField("title", value)
                                }
                                placeholder="e.g. 2020 Toyota Camry XLE"
                                disabled={isBusy}
                                error={errors.title?.message}
                                required
                                autoFilled={Boolean(
                                    generatedTitleRef.current &&
                                    title === generatedTitleRef.current,
                                )}
                            />

                            <TextArea
                                label="Description"
                                name="description"
                                value={description}
                                onChange={(value) =>
                                    setField("description", value)
                                }
                                placeholder="Describe the vehicle and its condition..."
                                disabled={isBusy}
                                error={errors.description?.message}
                                maxLength={10000}
                                rows={4}
                                required
                            />
                        </div>
                    </motion.section>

                    {/* SECTION 03: PRICING */}

                    <motion.section
                        {...sectionAnimation}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02] sm:p-6"
                    >
                        <SectionHeading
                            number="03"
                            title="Pricing & condition"
                            icon={<Tag size={18} />}
                        />

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                            {/* PRICE */}

                            <div>
                                <FieldLabel
                                    htmlFor="price"
                                    required
                                >
                                    Asking price
                                </FieldLabel>

                                <Controller
                                    name="price"
                                    control={control}
                                    render={({ field }) => (
                                        <div
                                            className={[
                                                "flex h-12 overflow-hidden rounded-xl",
                                                "border bg-white transition-all duration-200",
                                                "focus-within:border-[#1491FF]",
                                                "focus-within:ring-[3px]",
                                                "focus-within:ring-[#1491FF]/10",
                                                errors.price
                                                    ? "border-red-400"
                                                    : "border-slate-200",
                                            ].join(" ")}
                                        >
                                            <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-500">
                                                ₦
                                            </span>

                                            <input
                                                id="price"
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="e.g. 12,000,000"
                                                disabled={isBusy}
                                                value={formatPrice(
                                                    field.value ?? "",
                                                )}
                                                onChange={(event) => {
                                                    const rawValue =
                                                        event.target.value.replace(
                                                            /\D/g,
                                                            "",
                                                        );

                                                    field.onChange(rawValue);
                                                }}
                                                onBlur={field.onBlur}
                                                name={field.name}
                                                ref={field.ref}
                                                aria-invalid={Boolean(
                                                    errors.price,
                                                )}
                                                className="min-w-0 flex-1 bg-transparent px-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-60"
                                            />
                                        </div>
                                    )}
                                />

                                <FormFieldError
                                    message={errors.price?.message}
                                />
                            </div>

                            {/* CONDITION */}

                            <div>
                                <FieldLabel
                                    htmlFor="condition"
                                    required
                                >
                                    Condition
                                </FieldLabel>

                                <div className="relative">
                                    <select
                                        id="condition"
                                        disabled={isBusy}
                                        className={[
                                            inputClass,
                                            "appearance-none pr-10",
                                            errors.condition
                                                ? "border-red-400"
                                                : "border-slate-200",
                                        ].join(" ")}
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
                                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                </div>

                                <FormFieldError
                                    message={errors.condition?.message}
                                />
                            </div>

                            {/* MILEAGE */}

                            <div className="sm:col-span-2">
                                <TextInput
                                    label="Mileage (km)"
                                    name="mileage"
                                    value={mileage}
                                    onChange={(value) =>
                                        setField("mileage", value)
                                    }
                                    type="number"
                                    placeholder="e.g. 65000"
                                    min="0"
                                    disabled={isBusy}
                                    error={errors.mileage?.message}
                                />
                            </div>
                        </div>
                    </motion.section>

                    {/* SECTION 04: LOCATION */}

                    <motion.section
                        {...sectionAnimation}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02] sm:p-6"
                    >
                        <SectionHeading
                            number="04"
                            title="Location"
                            icon={<MapPin size={18} />}
                        />

                        <div className="space-y-5">

                            {/* COUNTRY */}

                            <div>
                                <FieldLabel htmlFor="country">
                                    Country
                                </FieldLabel>

                                <input
                                    id="country"
                                    value="Nigeria"
                                    readOnly
                                    className={[
                                        inputClass,
                                        "border-slate-200 bg-slate-50 text-slate-500",
                                    ].join(" ")}
                                    {...register("country")}
                                />
                            </div>

                            {/* STATE */}

                            <div>
                                <SelectField
                                    label="State"
                                    name="state"
                                    value={state}
                                    onChange={handleStateChange}
                                    options={stateOptions}
                                    placeholder={
                                        statesLoading
                                            ? "Loading states..."
                                            : "Select state"
                                    }
                                    disabled={
                                        isBusy ||
                                        statesLoading ||
                                        Boolean(statesError)
                                    }
                                    loading={statesLoading}
                                    error={errors.state?.message}
                                />

                                {statesError && (
                                    <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-red-50 px-3 py-2">
                                        <span className="text-xs text-red-600">
                                            {statesError}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setStatesRetry(
                                                    (previous) => previous + 1,
                                                )
                                            }
                                            disabled={isBusy}
                                            className="shrink-0 text-xs font-semibold text-red-600 hover:underline"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* LGA */}

                            <div>
                                <SelectField
                                    label="Local Government Area"
                                    name="city"
                                    value={city}
                                    onChange={(value) =>
                                        setField("city", value)
                                    }
                                    options={lgaOptions}
                                    placeholder={
                                        !state
                                            ? "Select a state first"
                                            : lgasLoading
                                                ? "Loading LGAs..."
                                                : lgasError
                                                    ? "Unable to load LGAs"
                                                    : "Select LGA"
                                    }
                                    disabled={
                                        isBusy ||
                                        !state ||
                                        lgasLoading ||
                                        Boolean(lgasError) ||
                                        lgas.length === 0
                                    }
                                    loading={lgasLoading}
                                    error={errors.city?.message}
                                />

                                {lgasError && (
                                    <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-red-50 px-3 py-2">
                                        <span className="text-xs text-red-600">
                                            {lgasError}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setLgasRetry(
                                                    (previous) => previous + 1,
                                                )
                                            }
                                            disabled={isBusy}
                                            className="shrink-0 text-xs font-semibold text-red-600 hover:underline"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.section>

                    {/* DESKTOP FORM ACTIONS */}

                    <div className="hidden items-center justify-between border-t border-slate-200 pt-5 sm:flex">
                        <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                                router.push("/dashboard/my-listings")
                            }
                            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <motion.button
                            type="submit"
                            disabled={isBusy}
                            whileHover={
                                shouldReduceMotion
                                    ? undefined
                                    : { y: -2 }
                            }
                            whileTap={
                                shouldReduceMotion
                                    ? undefined
                                    : { scale: 0.98 }
                            }
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-7 text-sm font-semibold text-white shadow-sm shadow-blue-900/10 transition-colors hover:bg-[#0877D9] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isBusy ? (
                                <>
                                    <LoaderCircle
                                        size={17}
                                        className="animate-spin"
                                    />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    Create draft
                                    <ArrowRight size={17} />
                                </>
                            )}
                        </motion.button>
                    </div>

                    {/* MOBILE STICKY ACTION BAR */}

                    <motion.div
                        initial={
                            shouldReduceMotion
                                ? false
                                : { opacity: 0, y: 16 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-40 border-t border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:hidden"
                    >
                        <motion.button
                            type="submit"
                            disabled={isBusy}
                            whileTap={
                                shouldReduceMotion
                                    ? undefined
                                    : { scale: 0.98 }
                            }
                            className="flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#1491FF] text-sm font-semibold text-white shadow-lg shadow-blue-900/10 transition-colors hover:bg-[#0877D9] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isBusy ? (
                                <>
                                    <LoaderCircle
                                        size={17}
                                        className="animate-spin"
                                    />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    Create draft
                                    <ArrowRight size={17} />
                                </>
                            )}
                        </motion.button>
                    </motion.div>

                    {isDirty && (
                        <p className="hidden text-center text-[11px] text-slate-400 sm:block">
                            Unsaved changes
                        </p>
                    )}
                </form>
            </div>
        </>
    );
}