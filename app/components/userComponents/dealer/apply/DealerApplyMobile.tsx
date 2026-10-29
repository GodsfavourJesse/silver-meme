"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    CheckCircle2,
    FileText,
    MapPin,
    ShieldCheck,
    LoaderCircle,
    CarFront,
} from "lucide-react";
import { toast } from "sonner";

import { dealerService } from "@/app/services/user/dealer/dealer.service";
import type { ApplyAsDealerInput } from "@/app/types/user/dealer/dealer.types";

const BRAND = "#1491FF";

const benefits = [
    {
        title: "Build buyer confidence",
        description:
            "Give potential buyers more confidence in your dealership.",
    },
    {
        title: "Showcase your inventory",
        description:
            "Present your vehicles to people actively looking to buy.",
    },
    {
        title: "Grow your business",
        description:
            "Make it easier for buyers to discover your dealership.",
    },
];

const steps = [
    "Business details",
    "Documents",
    "Verification",
];

function FormLabel({
    htmlFor,
    children,
    optional = false,
}: {
    htmlFor: string;
    children: React.ReactNode;
    optional?: boolean;
}) {
    return (
        <label
            htmlFor={htmlFor}
            className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"
        >
            {children}

            {optional ? (
                <span className="text-xs font-normal text-slate-400">
                    Optional
                </span>
            ) : (
                <span className="text-[#1491FF]">*</span>
            )}
        </label>
    );
}

function InputWrapper({
    children,
    multiline = false,
}: {
    children: React.ReactNode;
    multiline?: boolean;
}) {
    return (
        <div
            className={[
                "flex gap-3 rounded-xl border border-slate-200 bg-white px-3.5 transition-colors",
                "focus-within:border-[#1491FF] focus-within:ring-4 focus-within:ring-[#1491FF]/10",
                multiline ? "items-start" : "items-center",
            ].join(" ")}
        >
            {children}
        </div>
    );
}

export default function DealerApplyMobile() {
    const router = useRouter();
    const shouldReduceMotion = useReducedMotion();

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
                    "Your application was submitted, but no application ID was returned. Please contact support before submitting again.",
                );
                return;
            }

            setSubmitted(true);

            toast.success(
                "Dealer application submitted successfully!",
            );

            router.push(
                `/dashboard/dealer/documents?applicationId=${encodeURIComponent(application.id)}`,
            );
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to submit your dealer application. Please try again.";

            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const transition = shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.2 };

    return (
        <main className="min-h-screen bg-[#F8FAFC] pb-8 text-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white">
                <div className="mx-auto flex min-h-[68px] max-w-lg items-center gap-3 px-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        aria-label="Go back"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 active:scale-[0.97]"
                    >
                        <ArrowLeft size={19} />
                    </button>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <span
                                className="
                                    flex h-10 w-10 shrink-0
                                    items-center justify-center
                                    border border-[#E6EDF5] bg-white
                                    text-[16px] font-semibold
                                    tracking-[-0.08em]
                                    text-[#1491FF]
                                    transition-colors
                                    group-hover:border-[#1491FF]
                                "
                            >
                                K.
                            </span>

                            <span
                                className="text-[14px] font-bold tracking-[0.12em]"
                                style={{ color: BRAND }}
                            >
                                KARMASS
                            </span>
                        </div>

                        <h1 className="mt-0.5 truncate text-base font-bold text-slate-900">
                            Dealer application
                        </h1>
                    </div>

                    <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                        Step 1 of 3
                    </span>
                </div>
            </header>

            <div className="mx-auto max-w-lg px-4 pt-5">
                <AnimatePresence mode="wait">
                    {submitted ? (
                        <motion.section
                            key="success"
                            initial={
                                shouldReduceMotion
                                    ? false
                                    : { opacity: 0, y: 10 }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            transition={transition}
                            className="rounded-2xl border border-slate-200 bg-white p-5"
                        >
                            <div
                                className="flex h-12 w-12 items-center justify-center rounded-full"
                                style={{
                                    backgroundColor: "#1491FF14",
                                    color: BRAND,
                                }}
                            >
                                <CheckCircle2 size={27} />
                            </div>

                            <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-900">
                                Application submitted
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Your business information has been
                                received. The next step is to upload
                                the documents needed to verify your
                                dealership.
                            </p>

                            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-start gap-3">
                                    <FileText
                                        size={20}
                                        className="mt-0.5 shrink-0"
                                        style={{ color: BRAND }}
                                    />

                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Complete your documents
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Make sure your business
                                            details are accurate and
                                            your supporting documents
                                            are ready.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => router.push("/dealer")}
                                className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0876D1] active:scale-[0.99]"
                                style={{ backgroundColor: BRAND }}
                            >
                                Go to dealer dashboard
                                <ArrowRight size={17} />
                            </button>
                        </motion.section>
                    ) : (
                        <motion.div
                            key="form"
                            initial={
                                shouldReduceMotion
                                    ? false
                                    : { opacity: 0, y: 8 }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            exit={
                                shouldReduceMotion
                                    ? undefined
                                    : { opacity: 0 }
                            }
                            transition={transition}
                        >
                            {/* Introduction */}
                            <section className="mb-5">
                                <p
                                    className="text-xs font-semibold uppercase tracking-[0.12em]"
                                    style={{ color: BRAND }}
                                >
                                    Sell with KARMASS
                                </p>

                                <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-slate-900">
                                    Tell us about your business
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Apply to become a dealer and connect
                                    your dealership with people looking
                                    for their next car.
                                </p>
                            </section>

                            {/* Progress */}
                            <section
                                aria-label="Application progress"
                                className="mb-5 rounded-xl border border-slate-200 bg-white p-4"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold text-slate-800">
                                        Application progress
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        1 of 3 steps
                                    </p>
                                </div>

                                <div className="mt-3 grid grid-cols-3 gap-2">
                                    {steps.map((step, index) => {
                                        const isCurrent = index === 0;

                                        return (
                                            <div key={step}>
                                                <div
                                                    className={[
                                                        "h-1.5 rounded-full",
                                                        isCurrent
                                                            ? "bg-[#1491FF]"
                                                            : "bg-slate-100",
                                                    ].join(" ")}
                                                />

                                                <p
                                                    className={[
                                                        "mt-2 text-[10px] leading-4 sm:text-xs",
                                                        isCurrent
                                                            ? "font-semibold text-slate-800"
                                                            : "text-slate-400",
                                                    ].join(" ")}
                                                >
                                                    {step}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Application form */}
                            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                                <div className="mb-5">
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className="flex h-9 w-9 items-center justify-center rounded-lg"
                                            style={{
                                                backgroundColor: "#1491FF12",
                                                color: BRAND,
                                            }}
                                        >
                                            <Building2 size={19} />
                                        </div>

                                        <div>
                                            <h3 className="text-base font-bold text-slate-900">
                                                Business details
                                            </h3>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Enter your dealership information.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-5"
                                >
                                    {/* Business name */}
                                    <div>
                                        <FormLabel htmlFor="companyName">
                                            Business name
                                        </FormLabel>

                                        <InputWrapper>
                                            <Building2
                                                size={18}
                                                className="shrink-0 text-slate-400"
                                            />

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
                                                required
                                                autoComplete="organization"
                                                disabled={isSubmitting}
                                                className="h-12 w-full min-w-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                                            />
                                        </InputWrapper>

                                        <p className="mt-1.5 text-xs text-slate-400">
                                            Use the name buyers know your business by.
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

                                        <InputWrapper>
                                            <FileText
                                                size={18}
                                                className="shrink-0 text-slate-400"
                                            />

                                            <input
                                                id="registrationNumber"
                                                name="registrationNumber"
                                                type="text"
                                                value={form.registrationNumber}
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
                                    </div>

                                    {/* Business address */}
                                    <div>
                                        <FormLabel
                                            htmlFor="businessAddress"
                                            optional
                                        >
                                            Business address
                                        </FormLabel>

                                        <InputWrapper multiline>
                                            <MapPin
                                                size={18}
                                                className="mt-3 shrink-0 text-slate-400"
                                            />

                                            <textarea
                                                id="businessAddress"
                                                name="businessAddress"
                                                value={form.businessAddress}
                                                onChange={(event) =>
                                                    updateField(
                                                        "businessAddress",
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Street, city, state"
                                                maxLength={10000}
                                                rows={3}
                                                autoComplete="street-address"
                                                disabled={isSubmitting}
                                                className="w-full min-w-0 resize-y bg-transparent py-3 text-sm leading-5 text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                                            />
                                        </InputWrapper>
                                    </div>

                                    {/* Verification notice */}
                                    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                                        <ShieldCheck
                                            size={19}
                                            className="mt-0.5 shrink-0"
                                            style={{ color: BRAND }}
                                        />

                                        <div>
                                            <p className="text-xs font-semibold text-slate-800">
                                                Your information matters
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                Provide accurate details.
                                                You will be able to upload
                                                supporting documents in
                                                the next step.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0876D1] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                                        style={{ backgroundColor: BRAND }}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <LoaderCircle
                                                    size={18}
                                                    className="animate-spin"
                                                />
                                                Submitting application...
                                            </>
                                        ) : (
                                            <>
                                                Continue to documents
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>

                                    <p className="text-center text-xs leading-5 text-slate-400">
                                        You can provide your supporting
                                        documents after submitting these
                                        details.
                                    </p>
                                </form>
                            </section>

                            {/* Benefits */}
                            <section className="mt-7">
                                <h3 className="text-base font-bold text-slate-900">
                                    Why become a KARMASS dealer?
                                </h3>

                                <p className="mt-1 text-sm leading-5 text-slate-500">
                                    Build your presence and reach more car buyers.
                                </p>

                                <div className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-4">
                                    {benefits.map((benefit) => (
                                        <div
                                            key={benefit.title}
                                            className="py-4 first:pt-4 last:pb-4"
                                        >
                                            <p className="text-sm font-semibold text-slate-800">
                                                {benefit.title}
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                {benefit.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Support */}
                            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                                <p className="text-sm font-semibold text-slate-800">
                                    Need help with your application?
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Contact our support team if you have
                                    questions about dealer verification.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => router.push("/support")}
                                    className="mt-3 inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold transition hover:underline"
                                    style={{ color: BRAND }}
                                >
                                    Contact support
                                    <ArrowRight size={15} />
                                </button>
                            </div>

                            <p className="px-4 pb-3 pt-6 text-center text-[11px] leading-5 text-slate-400">
                                KARMASS · Helping buyers and dealers
                                connect.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}