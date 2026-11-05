import { Suspense } from "react";
import PaymentCallbackClient from "./payment-callback-client";

function CallbackLoading() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#F4F9FF] px-5">
            <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF5FF]">
                    <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#1491FF]/20 border-t-[#1491FF]" />
                </div>

                <h1 className="mt-6 text-lg font-bold text-slate-900">
                    Loading payment details
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Please wait while we prepare your payment confirmation.
                </p>
            </div>
        </main>
    );
}

export default function PaymentCallbackPage() {
    return (
        <Suspense fallback={<CallbackLoading />}>
            <PaymentCallbackClient />
        </Suspense>
    );
}