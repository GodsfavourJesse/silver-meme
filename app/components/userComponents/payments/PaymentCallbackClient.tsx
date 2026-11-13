"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    LoaderCircle,
    RefreshCw,
    ShieldCheck,
    XCircle,
} from "lucide-react";
import { useVerifyPayment } from "@/app/hooks/user/payments/useVerifyPayment";
import type { FulfilledPaymentResult } from "@/app/types/user/subscription/subscription.types";

type PaymentVerificationData = FulfilledPaymentResult;

type VerificationState =
    | "verifying"
    | "success"
    | "pending"
    | "failed";

type VerificationResult = {
    state: VerificationState;
    message: string;
    reference: string;
    data?: PaymentVerificationData;
};

function formatCurrency(amount: string | number, currency: string) {
    const value = Number(amount);
    if (!Number.isFinite(value)) return "the confirmed amount";
    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: currency || "NGN",
            maximumFractionDigits: 2,
        }).format(value);
    } catch {
        return `${currency || "NGN"} ${value.toLocaleString("en-NG")}`;
    }
}

export default function PaymentCallbackClient() {
    const searchParams = useSearchParams();

    const reference =
        searchParams.get("reference") ??
        searchParams.get("trxref") ??
        "";

    const [result, setResult] = useState<VerificationResult>({
        state: "verifying",
        message: "We are securely verifying your payment.",
        reference,
    });

    const [retryCount, setRetryCount] = useState(0);

    const { mutateAsync: runVerification } = useVerifyPayment();

    useEffect(() => {
        if (!reference) {
            setResult({
                state: "failed",
                message:
                    "We could not find a payment reference in the callback URL.",
                reference: "",
            });

            return;
        }

        let cancelled = false;

        async function verifyPayment() {
            setResult({
                state: "verifying",
                message: "We are securely verifying your payment.",
                reference,
            });

            try {
                const data = await runVerification(reference);

                if (cancelled) return;

                const paymentStatus =
                    data?.payment?.status?.toUpperCase();

                const verified = paymentStatus === "SUCCESS";

                if (!verified) {
                    setResult({
                        state: "pending",
                        message: "Your payment is being processed. Please check again shortly.",
                        reference,
                        data,
                    });

                    return;
                }

                if (data.payment.purpose === "BOOST") {
                    setResult({
                        state: "success",
                        message:
                            "Your payment has been verified successfully. Your vehicle boost is awaiting administrator approval.",
                        reference,
                        data,
                    });

                    return;
                }

                setResult({
                    state: "success",
                    message: "Your subscription payment is confirmed. Your plan and listing credits are ready to use.",
                    reference,
                    data,
                });
            } catch (error) {
                if (cancelled) return;

                const message = error instanceof Error
                    ? error.message
                    : "We could not reach the payment verification service.";

                setResult({
                    state: "pending",
                    message:
                        `${message} Your payment has not been confirmed yet. ` +
                        "Please retry verification shortly. Do not make another payment.",
                    reference,
                });
            }
        }

        void verifyPayment();

        return () => {
            cancelled = true;
        };
    }, [reference, retryCount, runVerification]);

    function retryVerification() {
        setRetryCount((count) => count + 1);
    }

    const isVerifying = result.state === "verifying";
    const isSuccessful = result.state === "success";
    const isPending = result.state === "pending";
    const isFailed = result.state === "failed";

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F4F9FF] px-4 py-12">

            {/* Background decoration */}
            <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#1491FF]/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-[#1491FF]/10 blur-3xl" />

            <div className="relative w-full max-w-lg">

                {/* Brand */}
                <Link
                    href="/"
                    className="mb-8 flex items-center justify-center gap-2"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1491FF] text-white shadow-lg shadow-[#1491FF]/20">
                        <ShieldCheck size={23} />
                    </div>

                    <span className="text-2xl font-black tracking-tight text-slate-900">
                        KARMASS
                    </span>
                </Link>

                {/* Main card */}
                <div className="overflow-hidden rounded-[28px] border border-[#DCEBFA] bg-white shadow-[0_24px_80px_rgba(15,75,130,0.09)]">

                    {/* Status header */}
                    <div className="px-7 pb-8 pt-10 text-center sm:px-10">

                        <div
                            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl ${
                                isVerifying
                                    ? "bg-[#EAF5FF] text-[#1491FF]"
                                    : isSuccessful
                                        ? "bg-emerald-50 text-emerald-600"
                                        : isPending
                                            ? "bg-amber-50 text-amber-600"
                                            : "bg-rose-50 text-rose-600"
                            }`}
                        >
                            {isVerifying && (
                                <LoaderCircle
                                    size={38}
                                    className="animate-spin"
                                />
                            )}

                            {isSuccessful && (
                                <CheckCircle2 size={40} />
                            )}

                            {isPending && (
                                <Clock3 size={40} />
                            )}

                            {isFailed && (
                                <XCircle size={40} />
                            )}
                        </div>

                        <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-[#1491FF]">
                            Payment confirmation
                        </p>

                        <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                            {isVerifying && "Verifying your payment"}

                            {isSuccessful && "Payment successful!"}

                            {isPending && "Payment processing"}

                            {isFailed && "Verification unsuccessful"}
                        </h1>

                        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                            {result.message}
                        </p>
                    </div>

                    {/* Payment information */}
                    <div className="mx-7 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 sm:mx-10">

                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-medium text-slate-500">
                                Transaction reference
                            </span>

                            <span className="text-xs font-bold text-slate-800">
                                {reference ? "Received" : "Unavailable"}
                            </span>
                        </div>

                        <div className="mt-3 break-all rounded-xl bg-white px-4 py-3 font-mono text-xs leading-5 text-slate-600">
                            {reference || "No transaction reference"}
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-4">
                            <span className="text-sm font-medium text-slate-500">
                                Verification status
                            </span>

                            <span
                                className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                                    isVerifying
                                        ? "bg-blue-50 text-blue-700"
                                        : isSuccessful
                                            ? "bg-emerald-50 text-emerald-700"
                                            : isPending
                                                ? "bg-amber-50 text-amber-700"
                                                : "bg-rose-50 text-rose-700"
                                }`}
                            >
                                {isVerifying && "VERIFYING"}
                                {isSuccessful && "VERIFIED"}
                                {isPending && "PROCESSING"}
                                {isFailed && "UNVERIFIED"}
                            </span>
                        </div>
                    </div>

                    {/* Successful payment information */}
                    {isSuccessful && (
                        <div className="mx-7 mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 sm:mx-10">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 text-emerald-600">
                                    <CheckCircle2 size={20} />
                                </div>

                                <div>
                                    <h2 className="text-sm font-bold text-emerald-900">
                                        Payment confirmed
                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-emerald-800">
                                        {result.data?.payment.purpose === "BOOST"
                                            ? "Your payment has been received. Your vehicle boost is awaiting administrator approval."
                                            : result.data?.subscription
                                                ? <>Your subscription is active. A {Number(result.data.subscription.appliedDiscountPercent)}% discount was applied, and your total is {formatCurrency(result.data.subscription.effectivePrice, result.data.subscription.currency)}.</>
                                                : "Your subscription has been activated and its listing credits are available in your dashboard."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pending information */}
                    {isPending && (
                        <div className="mx-7 mt-5 rounded-2xl border border-amber-100 bg-amber-50/70 p-5 sm:mx-10">
                            <div className="flex items-start gap-3">
                                <Clock3
                                    size={20}
                                    className="mt-0.5 shrink-0 text-amber-600"
                                />

                                <div>
                                    <h2 className="text-sm font-bold text-amber-900">
                                        Confirmation is taking longer
                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-amber-800">
                                        Your transaction has not yet been confirmed by our server. Please retry verification shortly. Do not make another payment just because this page is still processing.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Failed information */}
                    {isFailed && (
                        <div className="mx-7 mt-5 rounded-2xl border border-rose-100 bg-rose-50/70 p-5 sm:mx-10">
                            <div className="flex items-start gap-3">
                                <XCircle
                                    size={20}
                                    className="mt-0.5 shrink-0 text-rose-600"
                                />

                                <div>
                                    <h2 className="text-sm font-bold text-rose-900">
                                        We couldn't confirm your payment
                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-rose-800">
                                        {result.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3 px-7 pb-9 pt-7 sm:px-10">

                        {(isPending || isFailed) && (
                            <button
                                type="button"
                                onClick={retryVerification}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[#1491FF]/20 transition hover:bg-[#0877D9] active:scale-[0.99]"
                            >
                                <RefreshCw size={17} />
                                Try verification again
                            </button>
                        )}

                        {isSuccessful && (
                            <Link
                                href={result.data?.payment.purpose === "BOOST" ? "/dashboard/my-listings" : "/dashboard/subscriptions"}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[#1491FF]/20 transition hover:bg-[#0877D9]"
                            >
                                Continue to dashboard
                                <ArrowLeft
                                    size={17}
                                    className="rotate-180"
                                />
                            </Link>
                        )}

                        {isVerifying && (
                            <div className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-[#1491FF]">
                                <LoaderCircle
                                    size={17}
                                    className="animate-spin"
                                />
                                Please don't close this page...
                            </div>
                        )}

                        <Link
                            href="/marketplace"
                            className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-600 transition hover:border-[#1491FF]/40 hover:bg-[#F4F9FF] hover:text-[#1491FF]"
                        >
                            Return to marketplace
                        </Link>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs leading-5 text-slate-400">
                    Your transaction is securely verified by KARMASS.
                    <br />
                    Please keep your transaction reference for support purposes.
                </p>
            </div>
        </main>
    );
}
