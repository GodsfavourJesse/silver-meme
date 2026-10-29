"use client";

import { useState } from "react";
import type { FormEvent, ReactNode, ElementType } from "react";
import { useRouter } from "next/navigation";
import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    Check,
    CheckCircle2,
    FileText,
    MapPin,
    ShieldCheck,
    LoaderCircle,
    ClipboardCheck,
    ChevronRight,
    CarFront,
} from "lucide-react";
import { toast } from "sonner";

import { dealerService } from "@/app/services/user/dealer/dealer.service";
import type { ApplyAsDealerInput } from "@/app/types/user/dealer/dealer.types";
import { CurrentYear } from "@/app/utils/current-year";

const BRAND = "#1491FF";

const steps = [
    {
        number: "01",
        title: "Business details",
        description: "Tell us about your dealership.",
        icon: Building2,
    },
    {
        number: "02",
        title: "Documents",
        description: "Upload the required documents.",
        icon: FileText,
    },
    {
        number: "03",
        title: "Review",
        description: "We'll review your application.",
        icon: ClipboardCheck,
    },
];

const benefits = [
    {
        title: "A profile for your dealership",
        description:
            "Give buyers a place to learn about your business and explore your vehicles.",
    },
    {
        title: "More ways to get discovered",
        description:
            "List your inventory on a marketplace built specifically for cars.",
    },
    {
        title: "A straightforward process",
        description:
            "Submit your details, upload your documents, and follow your application through verification.",
    },
];

function FormLabel({
    htmlFor,
    children,
    optional = false,
}: {
    htmlFor: string;
    children: ReactNode;
    optional?: boolean;
}) {
    return (
        <label
            htmlFor={htmlFor}
            className="mb-2 block text-[13px] font-semibold text-slate-800"
        >
            {children}

            {optional ? (
                <span className="ml-2 font-normal text-slate-400">
                    Optional
                </span>
            ) : (
                <span className="ml-1 text-red-500">*</span>
            )}
        </label>
    );
}

function InputWrapper({
    icon: Icon,
    children,
}: {
    icon: ElementType;
    children: ReactNode;
}) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 transition-colors duration-150 hover:border-slate-300 focus-within:border-[#1491FF] focus-within:ring-4 focus-within:ring-[#1491FF]/10 sm:px-4">
            <Icon
                size={18}
                strokeWidth={1.8}
                className="shrink-0 text-slate-400"
            />
            {children}
        </div>
    );
}

function PrimaryButton({
    children,
    onClick,
    type = "button",
    disabled = false,
    className = "",
}: {
    children: ReactNode;
    onClick?: () => void;
    type?: "button" | "submit";
    disabled?: boolean;
    className?: string;
}) {
    const reduceMotion = useReducedMotion();

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            whileHover={
                reduceMotion || disabled ? undefined : { y: -1 }
            }
            whileTap={
                reduceMotion || disabled ? undefined : { scale: 0.99 }
            }
            transition={{ duration: 0.15 }}
            className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0876D1] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1491FF]/20 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        >
            {children}
        </motion.button>
    );
}

export default function DealerApplyDesktop() {
    const router = useRouter();
    const reduceMotion = useReducedMotion();

    const [form, setForm] = useState<ApplyAsDealerInput>({
        companyName: "",
        registrationNumber: "",
        businessAddress: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const updateField = (
        field: keyof ApplyAsDealerInput,
        value: string,
    ) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        event.preventDefault();

        if (isSubmitting) return;

        const companyName = form.companyName.trim();

        if (!companyName) {
            toast.error("Please enter your business name.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await dealerService.applyAsDealer({
                ...form,
                companyName,
                registrationNumber: (
                    form.registrationNumber ?? ""
                ).trim(),
                businessAddress: (
                    form.businessAddress ?? ""
                ).trim(),
            });

            const application = response.data.application;

            if (!application?.id) {
                toast.error(
                    "Your application was submitted, but we couldn't retrieve its reference. Please contact support before submitting again.",
                );
                return;
            }

            setSubmitted(true);

            toast.success("Your dealer application has been submitted.");

            router.push(
                `/dashboard/dealer/documents?applicationId=${encodeURIComponent(application.id)}`,
            );
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "We couldn't submit your application. Please try again.";

            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const enterAnimation = reduceMotion
        ? {}
        : {
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.3, ease: "easeOut" as const },
          };

    return (
        <main className="min-h-screen bg-[#F7F8FA] text-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-[72px] sm:px-6 lg:px-8">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex min-h-10 items-center gap-2 rounded-lg pr-3 text-sm font-medium text-slate-600 transition hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1491FF]/30"
                    >
                        <ArrowLeft size={17} />
                        <span>Back</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/dealer")}
                        aria-label="Go to dealer dashboard"
                        className="flex items-center gap-2.5"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1491FF] text-white">
                            <CarFront size={21} />
                        </span>

                        <span className="text-[17px] font-extrabold tracking-tight text-slate-950">
                            KARMASS
                        </span>
                    </button>

                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 sm:gap-2 sm:text-sm">
                        <ShieldCheck
                            size={17}
                            className="text-[#1491FF]"
                        />
                        <span className="hidden sm:inline">
                            Dealer registration
                        </span>
                        <span className="sm:hidden">Secure</span>
                    </div>
                </div>
            </header>

            {/* Page */}
            <div className="mx-auto max-w-7xl px-4 pb-10 pt-7 sm:px-6 sm:pb-14 sm:pt-10 lg:px-8 lg:pt-12">
                {/* Introduction */}
                <motion.section {...enterAnimation} className="mb-8 sm:mb-10">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#0876D1]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#1491FF]" />
                        DEALER REGISTRATION
                    </div>

                    <h1 className="mt-3 max-w-3xl text-[30px] font-bold leading-[1.18] tracking-tight text-slate-950 sm:text-4xl lg:text-[42px]">
                        Register your dealership
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                        Selling cars on KARMASS starts here. Add your
                        business details below, then upload the documents
                        needed to complete your dealer application.
                    </p>
                </motion.section>

                {/* Main layout */}
                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_350px]">
                    {/* Application form */}
                    <motion.section
                        {...(reduceMotion
                            ? {}
                            : {
                                  initial: { opacity: 0, y: 12 },
                                  animate: { opacity: 1, y: 0 },
                                  transition: {
                                      duration: 0.35,
                                      delay: 0.05,
                                  },
                              })}
                        className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                        <div className="border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1491FF]/10 text-[#1491FF]">
                                    <Building2 size={21} />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-lg font-bold tracking-tight text-slate-950">
                                        Business details
                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Enter the information associated with
                                        your dealership.
                                    </p>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="mt-6">
                                <div className="flex items-center">
                                    {steps.map((step, index) => (
                                        <div
                                            key={step.number}
                                            className="flex flex-1 items-center last:flex-none"
                                        >
                                            <div
                                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                                    index === 0
                                                        ? "bg-[#1491FF] text-white"
                                                        : "border border-slate-200 bg-white text-slate-400"
                                                }`}
                                            >
                                                {index === 0 ? (
                                                    <Check size={14} />
                                                ) : (
                                                    step.number
                                                )}
                                            </div>

                                            {index < steps.length - 1 && (
                                                <div className="mx-2 h-px flex-1 bg-slate-200 sm:mx-3" />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-2.5 grid grid-cols-3 gap-2">
                                    {steps.map((step, index) => (
                                        <div key={step.number}>
                                            <p
                                                className={`text-[11px] font-semibold sm:text-xs ${
                                                    index === 0
                                                        ? "text-[#0876D1]"
                                                        : "text-slate-500"
                                                }`}
                                            >
                                                {step.title}
                                            </p>

                                            <p className="mt-1 hidden text-[11px] leading-5 text-slate-400 sm:block">
                                                {step.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-5 sm:p-7">
                            <AnimatePresence mode="wait" initial={false}>
                                {submitted ? (
                                    <motion.div
                                        key="success"
                                        initial={
                                            reduceMotion
                                                ? false
                                                : { opacity: 0, y: 8 }
                                        }
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={
                                            reduceMotion
                                                ? undefined
                                                : { opacity: 0 }
                                        }
                                        transition={{ duration: 0.25 }}
                                        className="py-5"
                                    >
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                            <CheckCircle2 size={30} />
                                        </div>

                                        <div className="mt-5 text-center">
                                            <h3 className="text-xl font-bold tracking-tight text-slate-950">
                                                Your application is submitted
                                            </h3>

                                            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-600">
                                                Thanks for providing your
                                                business details. The next
                                                step is to upload the
                                                documents required for
                                                verification.
                                            </p>
                                        </div>

                                        <div className="mx-auto mt-6 max-w-md rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <div className="flex items-start gap-3">
                                                <FileText
                                                    size={19}
                                                    className="mt-0.5 shrink-0 text-[#1491FF]"
                                                />

                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        Continue with your
                                                        documents
                                                    </p>

                                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                                        Follow the instructions
                                                        on the next page to
                                                        provide the required
                                                        documents.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <PrimaryButton
                                            onClick={() =>
                                                router.push("/dealer")
                                            }
                                            className="mt-6 w-full"
                                        >
                                            Go to dealer dashboard
                                            <ArrowRight size={17} />
                                        </PrimaryButton>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        initial={
                                            reduceMotion
                                                ? false
                                                : { opacity: 0, y: 6 }
                                        }
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={
                                            reduceMotion
                                                ? undefined
                                                : { opacity: 0, y: -4 }
                                        }
                                        transition={{ duration: 0.2 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-5"
                                    >
                                        {/* Business name */}
                                        <div>
                                            <FormLabel htmlFor="companyName">
                                                Business name
                                            </FormLabel>

                                            <InputWrapper icon={Building2}>
                                                <input
                                                    id="companyName"
                                                    name="companyName"
                                                    type="text"
                                                    value={form.companyName}
                                                    onChange={(event) =>
                                                        updateField(
                                                            "companyName",
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="e.g. Prestige Motors"
                                                    maxLength={200}
                                                    autoComplete="organization"
                                                    required
                                                    disabled={isSubmitting}
                                                    className="h-12 w-full min-w-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                                                />
                                            </InputWrapper>

                                            <p className="mt-2 text-xs leading-5 text-slate-500">
                                                Use the name your customers
                                                know your business by.
                                            </p>
                                        </div>

                                        {/* Registration number */}
                                        <div>
                                            <FormLabel
                                                htmlFor="registrationNumber"
                                                optional
                                            >
                                                Business registration number
                                            </FormLabel>

                                            <InputWrapper icon={FileText}>
                                                <input
                                                    id="registrationNumber"
                                                    name="registrationNumber"
                                                    type="text"
                                                    value={
                                                        form.registrationNumber ??
                                                        ""
                                                    }
                                                    onChange={(event) =>
                                                        updateField(
                                                            "registrationNumber",
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="e.g. RC123456"
                                                    maxLength={100}
                                                    autoComplete="off"
                                                    disabled={isSubmitting}
                                                    className="h-12 w-full min-w-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                                                />
                                            </InputWrapper>

                                            <p className="mt-2 text-xs leading-5 text-slate-500">
                                                If your business is registered,
                                                enter its registration number.
                                            </p>
                                        </div>

                                        {/* Address */}
                                        <div>
                                            <FormLabel
                                                htmlFor="businessAddress"
                                                optional
                                            >
                                                Business address
                                            </FormLabel>

                                            <InputWrapper icon={MapPin}>
                                                <textarea
                                                    id="businessAddress"
                                                    name="businessAddress"
                                                    value={
                                                        form.businessAddress ??
                                                        ""
                                                    }
                                                    onChange={(event) =>
                                                        updateField(
                                                            "businessAddress",
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Street address, city, state"
                                                    maxLength={10000}
                                                    rows={4}
                                                    autoComplete="street-address"
                                                    disabled={isSubmitting}
                                                    className="min-h-[112px] w-full min-w-0 resize-y bg-transparent py-3.5 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                                                />
                                            </InputWrapper>

                                            <p className="mt-2 text-xs leading-5 text-slate-500">
                                                Add your business location if
                                                you have a physical dealership.
                                            </p>
                                        </div>

                                        {/* Notice */}
                                        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4">
                                            <ShieldCheck
                                                size={19}
                                                className="mt-0.5 shrink-0 text-[#1491FF]"
                                            />

                                            <div>
                                                <p className="text-xs font-semibold text-slate-800">
                                                    Before you continue
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                                    Check that your details are
                                                    correct. You can provide
                                                    your verification documents
                                                    in the next step.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Submit */}
                                        <PrimaryButton
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <LoaderCircle
                                                        size={17}
                                                        className="animate-spin"
                                                    />
                                                    Submitting application...
                                                </>
                                            ) : (
                                                <>
                                                    Continue to documents
                                                    <ArrowRight size={17} />
                                                </>
                                            )}
                                        </PrimaryButton>

                                        <p className="text-center text-[11px] leading-5 text-slate-400">
                                            Fields marked with{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>{" "}
                                            are required.
                                        </p>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.section>

                    {/* Supporting information */}
                    <aside className="space-y-5">
                        {/* Process */}
                        <motion.section
                            {...(reduceMotion
                                ? {}
                                : {
                                      initial: { opacity: 0, y: 10 },
                                      animate: { opacity: 1, y: 0 },
                                      transition: {
                                          duration: 0.3,
                                          delay: 0.1,
                                      },
                                  })}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                        >
                            <h2 className="text-base font-bold tracking-tight text-slate-950">
                                What happens next?
                            </h2>

                            <p className="mt-1.5 text-sm leading-6 text-slate-500">
                                Here&apos;s what to expect after you start.
                            </p>

                            <div className="mt-5 divide-y divide-slate-100">
                                {steps.map((step) => {
                                    const Icon = step.icon;

                                    return (
                                        <div
                                            key={step.number}
                                            className="flex items-start gap-3.5 py-4 first:pt-0 last:pb-0"
                                        >
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1491FF]/10 text-[#1491FF]">
                                                <Icon size={18} />
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {step.title}
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.section>

                        {/* Benefits */}
                        <motion.section
                            {...(reduceMotion
                                ? {}
                                : {
                                      initial: { opacity: 0, y: 10 },
                                      animate: { opacity: 1, y: 0 },
                                      transition: {
                                          duration: 0.3,
                                          delay: 0.16,
                                      },
                                  })}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                        >
                            <h2 className="text-base font-bold tracking-tight text-slate-950">
                                Why sell on KARMASS?
                            </h2>

                            <p className="mt-1.5 text-sm leading-6 text-slate-500">
                                The tools to present your dealership and
                                inventory in one place.
                            </p>

                            <div className="mt-5 space-y-5">
                                {benefits.map((benefit, index) => (
                                    <motion.div
                                        key={benefit.title}
                                        initial={
                                            reduceMotion
                                                ? false
                                                : { opacity: 0, y: 6 }
                                        }
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.25,
                                            delay: reduceMotion
                                                ? 0
                                                : 0.2 + index * 0.07,
                                        }}
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <CheckCircle2
                                                size={17}
                                                className="mt-0.5 shrink-0 text-[#1491FF]"
                                            />

                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {benefit.title}
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                                    {benefit.description}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>

                        {/* Support */}
                        <motion.section
                            {...(reduceMotion
                                ? {}
                                : {
                                      initial: { opacity: 0 },
                                      animate: { opacity: 1 },
                                      transition: {
                                          duration: 0.3,
                                          delay: 0.2,
                                      },
                                  })}
                            className="rounded-2xl border border-[#1491FF]/15 bg-[#1491FF]/[0.045] p-5"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#1491FF] ring-1 ring-[#1491FF]/10">
                                    <ShieldCheck size={18} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Have a question?
                                    </h2>

                                    <p className="mt-1 text-xs leading-5 text-slate-600">
                                        If you need help with your dealer
                                        application, get in touch with our
                                        support team.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.push("/support")
                                        }
                                        className="mt-3 inline-flex min-h-8 items-center gap-1.5 text-xs font-semibold text-[#0876D1] transition hover:text-[#1491FF]"
                                    >
                                        Contact support
                                        <ChevronRight size={15} />
                                    </button>
                                </div>
                            </div>
                        </motion.section>
                    </aside>
                </div>

                {/* Footer */}
                <footer className="mt-8 border-t border-slate-200 pt-5 sm:mt-10 sm:pt-6">
                    <div className="flex flex-col gap-2 text-center text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:text-left">
                        <p>
                            © <CurrentYear /> KARMASS. All rights
                            reserved.
                        </p>

                        <p className="inline-flex items-center justify-center gap-1.5">
                            <ShieldCheck
                                size={14}
                                className="text-[#1491FF]"
                            />
                            Dealer registration
                        </p>
                    </div>
                </footer>
            </div>
        </main>
    );
}