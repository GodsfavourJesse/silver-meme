import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    verifyBoostPayment,
} from "@/app/services/user/payment/payment.service";

import {
    boostKeys,
} from "@/app/hooks/user/boost/useBoost";

// ============================================
// VERIFY BOOST PAYMENT
// ============================================

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
                    queryKey: [
                        "payments",
                        "history",
                    ],
                }),
            ]);
        },
    });
}