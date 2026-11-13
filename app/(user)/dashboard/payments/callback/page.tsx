import { Suspense } from "react";
import PaymentCallbackClient from "@/app/components/userComponents/payments/PaymentCallbackClient";

function PaymentCallbackLoading() {
    return (
        <main className="flex min-h-[70dvh] items-center justify-center bg-[#F4F9FF] px-5 py-12">
            <div className="flex flex-col items-center text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-[#EAF5FF]">
                    <div className="size-8 animate-spin rounded-full border-[3px] border-[#1491FF]/20 border-t-[#1491FF]" />
                </div>
                <h1 className="mt-6 text-lg font-bold text-slate-900">Loading payment details</h1>
                <p className="mt-2 text-sm text-slate-500">Please wait while we prepare your payment confirmation.</p>
            </div>
        </main>
    );
}

export const instant = false;

export default function DashboardPaymentCallbackPage() {
    return (
        <Suspense fallback={<PaymentCallbackLoading />}>
            <PaymentCallbackClient />
        </Suspense>
    );
}
