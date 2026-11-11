import { useMutation } from "@tanstack/react-query";

import {
    initializeBoostPayment,
} from "@/app/services/user/payment/payment.service";

import type {
    BoostPaymentResult,
} from "@/app/types/user/boost/boost.types";

// ============================================
// INITIALIZE BOOST PAYMENT
// ============================================

export function useInitializeBoostPayment() {
    return useMutation<
        BoostPaymentResult,
        Error,
        string
    >({
        mutationKey: [
            "payments",
            "initialize-boost",
        ],

        mutationFn: initializeBoostPayment,

        retry: false,

        // The calling component handles the payment redirect.
        // Do not expose payment response details in the browser console.
    });
}