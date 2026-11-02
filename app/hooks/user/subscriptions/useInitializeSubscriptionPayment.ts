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

        onSuccess: (result) => {
            // Payment initialization is successful.
            // The user-facing component handles the Paystack redirect.
            if (!result.authorizationUrl) {
                console.warn(
                    "Payment initialized without an authorization URL.",
                );
            }
        },
    });
}