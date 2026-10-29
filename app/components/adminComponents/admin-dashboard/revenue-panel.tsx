import {
    ArrowDownRight,
    ArrowUpRight,
    CreditCard,
    Wallet,
    type LucideIcon,
} from "lucide-react";

import { formatMoney, formatNumber } from "@/app/lib/admin/format";
import type {
    AdminDashboardData,
    CurrencyAmount,
} from "@/app/types/admin/admin-dashboard.types";
import { Panel } from "./panel";


function AmountList({
    amounts,
    compact = false,
}: {
    amounts: CurrencyAmount[];
    compact?: boolean;
}) {
    if (amounts.length === 0) {
        return (
            <div className="flex min-h-14 items-center">
                <p className="text-sm text-slate-400">
                    No payment revenue recorded yet
                </p>
            </div>
        );
    }

    return (
        <ul className="space-y-2">
            {amounts.map((entry) => (
                <li
                    key={entry.currency}
                    className={[
                        "break-words font-bold tracking-tight text-slate-900 tabular-nums",
                        compact
                            ? "text-lg sm:text-xl"
                            : "text-2xl sm:text-3xl",
                    ].join(" ")}
                >
                    {formatMoney(entry.amount, entry.currency)}
                </li>
            ))}
        </ul>
    );
}

interface PaymentMetricProps {
    label: string;
    value: number;
    icon: LucideIcon;
    variant: "success" | "danger";
}

function PaymentMetric({
    label,
    value,
    icon: Icon,
    variant,
}: PaymentMetricProps) {
    const isSuccess = variant === "success";

    return (
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium leading-5 text-slate-500 sm:text-sm">
                    {label}
                </p>

                <span
                    className={[
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        isSuccess
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600",
                    ].join(" ")}
                >
                    <Icon size={16} strokeWidth={2} aria-hidden="true" />
                </span>
            </div>

            <p
                className={[
                    "mt-3 break-words text-2xl font-bold tracking-tight tabular-nums sm:text-3xl",
                    isSuccess ? "text-slate-900" : "text-slate-900",
                ].join(" ")}
            >
                {formatNumber(value)}
            </p>

            <div className="mt-2 flex items-center gap-1.5">
                <span
                    className={[
                        "h-1.5 w-1.5 rounded-full",
                        isSuccess ? "bg-emerald-500" : "bg-red-500",
                    ].join(" ")}
                    aria-hidden="true"
                />

                <span className="text-[11px] text-slate-500 sm:text-xs">
                    {isSuccess ? "Completed successfully" : "Unsuccessful"}
                </span>
            </div>
        </div>
    );
}

export function RevenuePanel({
    data,
}: {
    data: AdminDashboardData;
}) {
    const { revenue, payments } = data;

    return (
        <Panel title="Revenue overview" eyebrow="Financial performance">
            <div className="space-y-5 sm:space-y-6">
                {/* Revenue summary */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    {/* Monthly revenue */}
                    <div className="min-w-0 rounded-xl border border-[#1491FF]/20 bg-[#1491FF]/[0.04] p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    This month
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Gross successful payments
                                </p>
                            </div>

                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1491FF]/10 text-[#1491FF]">
                                <Wallet
                                    size={19}
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />
                            </span>
                        </div>

                        <div className="mt-5">
                            <AmountList
                                amounts={
                                    revenue.grossSuccessfulPaymentsThisMonthByCurrency
                                }
                            />
                        </div>

                        <div className="mt-4 flex items-center gap-1.5 border-t border-[#1491FF]/10 pt-3">
                            <ArrowUpRight
                                size={14}
                                className="shrink-0 text-[#1491FF]"
                                aria-hidden="true"
                            />

                            <span className="text-xs font-medium text-slate-600">
                                Current month
                            </span>
                        </div>
                    </div>

                    {/* Lifetime revenue */}
                    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    All time
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Gross successful payments
                                </p>
                            </div>

                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                <CreditCard
                                    size={19}
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />
                            </span>
                        </div>

                        <div className="mt-5">
                            <AmountList
                                amounts={
                                    revenue.grossSuccessfulPaymentsByCurrency
                                }
                            />
                        </div>

                        <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3">
                            <ArrowDownRight
                                size={14}
                                className="shrink-0 text-slate-400"
                                aria-hidden="true"
                            />

                            <span className="text-xs font-medium text-slate-500">
                                Lifetime total
                            </span>
                        </div>
                    </div>
                </div>

                {/* Payment statistics */}
                <div>
                    <div className="mb-3">
                        <h3 className="text-sm font-semibold text-slate-800">
                            Payment activity
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                            Overview of successful and failed payments
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <PaymentMetric
                            label="Successful payments"
                            value={revenue.successfulPaymentCount}
                            icon={ArrowUpRight}
                            variant="success"
                        />

                        <PaymentMetric
                            label="Failed payments"
                            value={payments.failed}
                            icon={ArrowDownRight}
                            variant="danger"
                        />
                    </div>
                </div>

                {/* Revenue information */}
                {revenue.note && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 sm:px-4">
                        <p className="text-xs font-semibold text-slate-700">
                            Revenue information
                        </p>

                        <p className="mt-1.5 text-xs leading-5 text-slate-500 sm:text-sm">
                            {revenue.note}
                        </p>
                    </div>
                )}
            </div>
        </Panel>
    );
}