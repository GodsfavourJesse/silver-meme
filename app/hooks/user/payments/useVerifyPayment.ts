import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    verifySubscriptionPayment,
} from "@/app/services/user/payment/payment.service";

import type {
    FulfilledPaymentResult,
} from "@/app/types/user/subscription/subscription.types";

import {
    currentSubscriptionKeys,
} from "../subscriptions/useCurrentSubscription";

import {
    boostKeys,
} from "../boost/useBoost";

import {
    paymentHistoryKeys,
} from "./usePaymentHistory";

export function useVerifyPayment() {
    const queryClient = useQueryClient();

    return useMutation<
        FulfilledPaymentResult,
        Error,
        string
    >({
        mutationKey: ["payments", "verify"],

        mutationFn: verifySubscriptionPayment,

        retry: false,

        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: currentSubscriptionKeys.all,
                }),

                queryClient.invalidateQueries({
                    queryKey: boostKeys.all,
                }),

                queryClient.invalidateQueries({
                    queryKey: paymentHistoryKeys.all,
                }),
            ]);
        },
    });
}