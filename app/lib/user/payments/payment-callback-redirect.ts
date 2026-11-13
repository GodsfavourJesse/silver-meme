import { redirect } from "next/navigation";

type CallbackSearchParams = Promise<
    Record<string, string | string[] | undefined>
>;

export async function redirectToDashboardPaymentCallback(
    searchParams: CallbackSearchParams,
): Promise<never> {
    const values = await searchParams;
    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(values)) {
        if (Array.isArray(value)) {
            for (const item of value) query.append(key, item);
        } else if (value !== undefined) {
            query.set(key, value);
        }
    }

    const suffix = query.size ? `?${query.toString()}` : "";
    redirect(`/dashboard/payments/callback${suffix}`);
}
