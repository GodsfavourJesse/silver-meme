import { initializeSubscriptionPayment } from "@/app/services/user/payment/payment.service";
import { SubscriptionPaymentResult } from "@/app/types/user/subscription/subscription.types";
import { useMutation } from "@tanstack/react-query";

export function useInitializeSubscriptionPayment() {
    return useMutation<
        SubscriptionPaymentResult,
        Error,
        string
    >({
        mutationKey: [
            "payments",
            "initialize-subscription",
        ],

        mutationFn: initializeSubscriptionPayment,

        // Payment initialization is handled by the calling component.
        // No payment or account details are written to the browser console.
    });
}