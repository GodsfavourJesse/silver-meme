import { verifySubscriptionPayment } from "@/app/services/user/payment/payment.service";
import { FulfilledPaymentResult } from "@/app/types/user/subscription/subscription.types";
import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { currentSubscriptionKeys } from "../subscriptions/useCurrentSubscription";

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
                    queryKey: ["payments", "history"],
                }),
            ]);
        },
    });
}