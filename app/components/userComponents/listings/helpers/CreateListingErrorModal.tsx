"use client";

import { useEffect, useRef } from "react";

import { AlertCircle, ArrowRight, X } from "lucide-react";

import {
    isSubscriptionError,
    type FormError,
} from "./create-listing.helpers";

interface CreateListingErrorModalProps {
    error: FormError;
    onClose: () => void;
    onViewPlans: () => void;
}

export function CreateListingErrorModal({
    error,
    onClose,
    onViewPlans,
}: CreateListingErrorModalProps) {
    const primaryButtonRef = useRef<HTMLButtonElement>(null);
    const needsSubscription = isSubscriptionError(error);

    // Focus the main action, close on Escape, and lock page scroll while open.
    useEffect(() => {
        primaryButtonRef.current?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    return (
        <div
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
        >
            <section
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="create-listing-error-title"
                aria-describedby="create-listing-error-message"
                className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                    <X size={18} />
                </button>

                <div
                    className={`flex size-12 items-center justify-center rounded-2xl ${
                        needsSubscription
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-600"
                    }`}
                >
                    <AlertCircle size={24} />
                </div>

                <h2
                    id="create-listing-error-title"
                    className="mt-5 text-lg font-semibold text-slate-900"
                >
                    {needsSubscription
                        ? "Your listing credits or subscription need attention"
                        : "We couldn't create your listing"}
                </h2>

                <p
                    id="create-listing-error-message"
                    className="mt-2 text-sm leading-6 text-slate-600"
                >
                    {error.message}
                </p>

                {needsSubscription && (
                    <p className="mt-3 text-xs leading-5 text-slate-500">
                        Your listing details have not been submitted. You can
                        review the plans and return to create your listing once
                        your account has access.
                    </p>
                )}

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    {needsSubscription ? (
                        <>
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                            >
                                Close
                            </button>

                            <button
                                ref={primaryButtonRef}
                                type="button"
                                onClick={onViewPlans}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#7008E7] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#5f06c7]"
                            >
                                View subscription plans
                                <ArrowRight size={16} />
                            </button>
                        </>
                    ) : (
                        <button
                            ref={primaryButtonRef}
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#7008E7] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#5f06c7]"
                        >
                            Try again
                        </button>
                    )}
                </div>
            </section>
        </div>
    );
}