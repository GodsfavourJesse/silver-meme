"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Clock,
    CreditCard,
    LoaderCircle,
    RefreshCw,
    ShieldCheck,
} from "lucide-react";
import { useVerifyPayment } from "@/app/hooks/user/payments/useVerifyPayment";
import { UserSubscription } from "@/app/types/user/subscription/subscription.types";

type VerificationStatus =
    | "verifying"
    | "success"
    | "failed";

function formatCurrency(
    amount: number | string,
    currency = "NGN",
) {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
}

function formatDate(value: string | null | undefined) {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

function PaymentVerificationContent() {
    const searchParams = useSearchParams();

    const reference =
        searchParams.get("reference") ||
        searchParams.get("trxref") ||
        "";

    const verifyPayment = useVerifyPayment();

    const [status, setStatus] =
        useState<VerificationStatus>("verifying");

    const [subscription, setSubscription] =
        useState<UserSubscription | null>(null);

    const [errorMessage, setErrorMessage] =
        useState("");

    const verificationStarted = useRef(false);

    const verify = async () => {
        if (!reference) {
            setStatus("failed");
            setErrorMessage(
                "The payment reference is missing. We couldn't identify this transaction.",
            );
            return;
        }

        setStatus("verifying");
        setErrorMessage("");

        try {
            const result = await verifyPayment.mutateAsync(reference);

            setSubscription(result.subscription ?? null);
            setStatus("success");
        } catch (error) {
            setStatus("failed");

            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "We couldn't verify your payment. Please try again.",
            );
        }
    };

    useEffect(() => {
        if (verificationStarted.current) return;

        verificationStarted.current = true;

        void verify();

        // Verification should run once for this payment reference.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reference]);

    return (
        <main className="flex min-h-[75vh] items-center justify-center px-4 py-12 sm:px-6">
            <section className="w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#1491FF]">
                            <ShieldCheck size={22} />
                        </div>

                        <div>
                            <h1 className="text-lg font-bold text-gray-950">
                                Payment verification
                            </h1>

                            <p className="mt-0.5 text-sm text-gray-500">
                                KARMASS subscription checkout
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-10 text-center sm:px-8">
                    {status === "verifying" && (
                        <>
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                                <LoaderCircle
                                    size={32}
                                    className="animate-spin text-[#1491FF]"
                                />
                            </div>

                            <h2 className="mt-6 text-xl font-bold text-gray-950">
                                Verifying your payment
                            </h2>

                            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                                Please wait while we confirm your
                                transaction with our payment provider.
                                Do not close this page.
                            </p>

                            <div className="mx-auto mt-7 flex max-w-sm items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-left">
                                <Clock
                                    size={19}
                                    className="shrink-0 text-[#1491FF]"
                                />

                                <p className="text-xs leading-5 text-gray-600">
                                    Payment verification usually takes
                                    a short time. Your subscription
                                    will only become active after
                                    successful confirmation.
                                </p>
                            </div>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                                <CheckCircle2
                                    size={34}
                                    className="text-emerald-600"
                                />
                            </div>

                            <h2 className="mt-6 text-xl font-bold text-gray-950">
                                Payment verified successfully
                            </h2>

                            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                                Your payment has been confirmed.
                                Your subscription information is
                                being refreshed.
                            </p>

                            {subscription && (
                                <div className="mt-7 rounded-xl border border-gray-200 bg-gray-50 p-5 text-left">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm text-gray-500">
                                            Subscription status
                                        </span>

                                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                            {subscription.status}
                                        </span>
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Amount
                                            </p>

                                            <p className="mt-1 font-semibold text-gray-900">
                                                {formatCurrency(
                                                    subscription.effectivePrice,
                                                    subscription.currency,
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Listing credits
                                            </p>

                                            <p className="mt-1 font-semibold text-gray-900">
                                                {subscription.listingCredits.toLocaleString("en-NG")}
                                            </p>
                                        </div>

                                        <div className="col-span-2">
                                            <p className="text-xs text-gray-400">
                                                Expiration date
                                            </p>

                                            <p className="mt-1 font-semibold text-gray-900">
                                                {formatDate(subscription.expiresAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Link
                                href="/dashboard/subscriptions"
                                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0877D9]"
                            >
                                View my subscription
                                <ArrowLeft
                                    size={17}
                                    className="rotate-180"
                                />
                            </Link>
                        </>
                    )}

                    {status === "failed" && (
                        <>
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                                <AlertCircle
                                    size={34}
                                    className="text-red-600"
                                />
                            </div>

                            <h2 className="mt-6 text-xl font-bold text-gray-950">
                                Payment verification unsuccessful
                            </h2>

                            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                                {errorMessage}
                            </p>

                            {reference && (
                                <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left">
                                    <p className="text-xs font-medium text-gray-400">
                                        Payment reference
                                    </p>

                                    <p className="mt-1 break-all font-mono text-xs text-gray-700">
                                        {reference}
                                    </p>
                                </div>
                            )}

                            <div className="mt-7 flex flex-col gap-3">
                                {reference && (
                                    <button
                                        type="button"
                                        onClick={() => void verify()}
                                        disabled={verifyPayment.isPending}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0877D9] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {verifyPayment.isPending ? (
                                            <LoaderCircle
                                                size={17}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <RefreshCw size={17} />
                                        )}

                                        Try verification again
                                    </button>
                                )}

                                <Link
                                    href="/dashboard/subscriptions"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                >
                                    <ArrowLeft size={17} />
                                    Back to subscription
                                </Link>
                            </div>

                            <p className="mt-6 text-xs leading-5 text-gray-400">
                                If you were charged but verification
                                continues to fail, please contact
                                KARMASS support with your payment
                                reference.
                            </p>
                        </>
                    )}

                    <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
                        <CreditCard size={14} />
                        Secure payment processing
                    </div>
                </div>
            </section>
        </main>
    );
}

function VerificationFallback() {
    return (
        <main className="flex min-h-[75vh] items-center justify-center px-4">
            <div className="text-center">
                <LoaderCircle
                    size={30}
                    className="mx-auto animate-spin text-[#1491FF]"
                />

                <p className="mt-4 text-sm text-gray-500">
                    Preparing payment verification...
                </p>
            </div>
        </main>
    );
}

export default function PaymentVerificationPage() {
    return (
        <Suspense fallback={<VerificationFallback />}>
            <PaymentVerificationContent />
        </Suspense>
    );
}