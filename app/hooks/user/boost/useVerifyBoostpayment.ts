import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    verifyBoostPayment,
} from "@/app/services/user/payment/payment.service";

import {
    boostKeys,
} from "./useBoost";

import {
    paymentHistoryKeys,
} from "../payments/usePaymentHistory";

export function useVerifyBoostPayment() {
    const queryClient = useQueryClient();

    return useMutation<
        unknown,
        Error,
        string
    >({
        mutationKey: [
            "payments",
            "verify-boost",
        ],

        mutationFn: verifyBoostPayment,

        retry: false,

        onSuccess: async () => {
            await Promise.all([
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