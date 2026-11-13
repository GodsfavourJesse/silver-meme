import { redirectToDashboardPaymentCallback } from "@/app/lib/user/payments/payment-callback-redirect";

export default function LegacyPaymentCallbackPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    return redirectToDashboardPaymentCallback(searchParams);
}
