"use client";

import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    CreditCard,
    Mail,
    ShieldCheck,
    UserRound,
    X,
    XCircle,
} from "lucide-react";

import type { AdminSubscription } from "@/app/types/admin/admin-subscription.types";

import AdminSubscriptionHistoryTimeline from "./AdminSubscriptionHistoryTimeline";

interface AdminSubscriptionDetailsDrawerProps {
    subscription: AdminSubscription | null;
    onClose: () => void;
}

function formatDate(value: string | null): string {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function formatMoney(
    amount: string | number | null | undefined,
    currency = "NGN",
): string {
    if (amount === null || amount === undefined || amount === "") {
        return "—";
    }

    const value = Number(amount);

    if (!Number.isFinite(value)) {
        return String(amount);
    }

    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
        }).format(value);
    } catch {
        return `${currency} ${value.toLocaleString("en-NG")}`;
    }
}

function formatStatus(status: string): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
}

function getAccountTypeLabel(accountType: string): string {
    switch (accountType.toUpperCase()) {
        case "USER":
            return "Normal user";
        case "DEALER":
            return "Dealer";
        default:
            return formatStatus(accountType);
    }
}

function getStatusAppearance(status: string) {
    switch (status) {
        case "ACTIVE":
            return {
                label: "Active",
                icon: CheckCircle2,
                className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
            };

        case "PENDING":
            return {
                label: "Pending",
                icon: Clock3,
                className: "bg-amber-50 text-amber-700 ring-amber-200",
            };

        case "EXPIRED":
            return {
                label: "Expired",
                icon: XCircle,
                className: "bg-slate-100 text-slate-600 ring-slate-200",
            };

        case "CANCELLED":
            return {
                label: "Cancelled",
                icon: XCircle,
                className: "bg-red-50 text-red-700 ring-red-200",
            };

        default:
            return {
                label: formatStatus(status),
                icon: ShieldCheck,
                className: "bg-slate-100 text-slate-600 ring-slate-200",
            };
    }
}

function DetailItem({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">
                {label}
            </p>

            <div className="mt-1 break-words text-sm font-semibold text-slate-800">
                {value}
            </div>
        </div>
    );
}

function SectionHeading({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ElementType;
    title: string;
    description?: string;
}) {
    return (
        <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <Icon className="h-5 w-5 text-[#1491FF]" />
            </div>

            <div>
                <h3 className="font-semibold text-slate-900">
                    {title}
                </h3>

                {description && (
                    <p className="mt-0.5 text-xs text-slate-500">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

export default function AdminSubscriptionDetailsDrawer({
    subscription,
    onClose,
}: AdminSubscriptionDetailsDrawerProps) {
    if (!subscription) return null;

    const status = getStatusAppearance(subscription.status);
    const StatusIcon = status.icon;
    const accountTypeLabel = getAccountTypeLabel(
        subscription.user.accountType,
    );
    const originalPrice = Number(subscription.originalPrice);
    const effectivePrice = Number(subscription.effectivePrice);
    const appliedDiscountAmount = Number.isFinite(originalPrice - effectivePrice)
        ? Math.max(0, originalPrice - effectivePrice)
        : 0;

    const customerName = [
        subscription.user.firstName,
        subscription.user.lastName,
    ]
        .filter(Boolean)
        .join(" ") || "Unnamed customer";

    return (
        <div
            className="fixed inset-0 z-[100] flex justify-end"
            role="dialog"
            aria-modal="true"
            aria-label="Subscription details"
        >
            {/* Backdrop */}
            <button
                type="button"
                aria-label="Close subscription details"
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
            />

            {/* Drawer */}
            <div className="relative flex h-full w-full max-w-2xl flex-col bg-[#F8FAFC] shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-5 sm:px-7">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                                <CreditCard className="h-5 w-5 text-[#1491FF]" />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Subscription details
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    Review subscription information and activity.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        aria-label="Close drawer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-7">
                    {/* Subscription overview */}
                    <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
                        <div className="bg-gradient-to-br from-[#1491FF] to-[#0877D9] p-5 text-white sm:p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-xs font-medium text-blue-100">
                                        Subscription plan
                                    </p>

                                    <h3 className="mt-1 text-2xl font-bold">
                                        {subscription.plan.name}
                                    </h3>

                                    <p className="mt-2 text-xs text-blue-100">
                                        Subscription ID
                                    </p>

                                    <p className="mt-1 break-all font-mono text-xs text-white/90">
                                        {subscription.id}
                                    </p>
                                </div>

                                <span
                                    className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${status.className}`}
                                >
                                    <StatusIcon className="h-3.5 w-3.5" />
                                    {status.label}
                                </span>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/20 pt-5">
                                <div>
                                    <p className="text-xs text-blue-100">
                                        Amount paid
                                    </p>

                                    <p className="mt-1 text-xl font-bold">
                                        {formatMoney(
                                            subscription.effectivePrice,
                                            subscription.currency,
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-blue-100">
                                        Listing credits
                                    </p>

                                    <p className="mt-1 text-xl font-bold">
                                        {subscription.listingCredits}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 p-5 sm:grid-cols-3">
                            <DetailItem
                                label="Duration"
                                value={`${subscription.durationDays} days`}
                            />

                            <DetailItem
                                label="Currency"
                                value={subscription.currency}
                            />

                            <DetailItem
                                label="Normal-user discount rate"
                                value={`${Number(subscription.normalUserDiscountPercent).toLocaleString("en-NG")}%`}
                            />

                            <DetailItem
                                label="Dealer discount rate"
                                value={`${Number(subscription.dealerDiscountPercent).toLocaleString("en-NG")}%`}
                            />

                            <DetailItem
                                label="Discount applied"
                                value={`${Number(subscription.appliedDiscountPercent).toLocaleString("en-NG")}% (${accountTypeLabel})`}
                            />
                        </div>
                    </section>

                    {/* Customer information */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <SectionHeading
                            icon={UserRound}
                            title="Customer information"
                            description="Account associated with this subscription."
                        />

                        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#0877D9]">
                                <UserRound className="h-6 w-6" />
                            </div>

                            <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900">
                                    {customerName}
                                </p>

                                <span className={`mt-1 inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold ${subscription.user.accountType.toUpperCase() === "DEALER" ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"}`}>
                                    {accountTypeLabel} account
                                </span>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <DetailItem
                                label="Customer ID"
                                value={subscription.user.id}
                            />

                            <DetailItem
                                label="Account status"
                                value={subscription.user.status}
                            />

                            <div className="sm:col-span-2">
                                <DetailItem
                                    label="Email address"
                                    value={
                                        <span className="inline-flex items-center gap-2">
                                            <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                                            {subscription.user.email || "No email provided"}
                                        </span>
                                    }
                                />
                            </div>
                        </div>
                    </section>

                    {/* Pricing breakdown */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <SectionHeading
                            icon={CreditCard}
                            title="Pricing breakdown"
                            description="Price configuration captured when the subscription was created."
                        />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-slate-500">
                                    Original price
                                </span>

                                <span className="text-sm font-semibold text-slate-800">
                                    {formatMoney(
                                        subscription.originalPrice,
                                        subscription.currency,
                                    )}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-slate-500">
                                    Normal-user discount rate (configured)
                                </span>
                                <span className="text-sm font-semibold text-slate-700">
                                    {Number(subscription.normalUserDiscountPercent).toLocaleString("en-NG")}%
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-slate-500">
                                    Dealer discount rate (configured)
                                </span>
                                <span className="text-sm font-semibold text-slate-700">
                                    {Number(subscription.dealerDiscountPercent).toLocaleString("en-NG")}%
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-slate-500">
                                    Discount applied ({accountTypeLabel})
                                </span>
                                <span className="text-sm font-semibold text-emerald-600">
                                    {Number(subscription.appliedDiscountPercent).toLocaleString("en-NG")}% · -{formatMoney(
                                        appliedDiscountAmount,
                                        subscription.currency,
                                    )}
                                </span>
                            </div>

                            <div className="border-t border-dashed border-slate-200 pt-4">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm font-semibold text-slate-700">
                                        Effective price
                                    </span>

                                    <span className="text-xl font-bold text-[#0877D9]">
                                        {formatMoney(
                                            subscription.effectivePrice,
                                            subscription.currency,
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Subscription dates */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <SectionHeading
                            icon={CalendarDays}
                            title="Subscription dates"
                            description="Important subscription lifecycle dates."
                        />

                        <div className="grid gap-5 sm:grid-cols-2">
                            <DetailItem
                                label="Created at"
                                value={formatDate(subscription.createdAt)}
                            />

                            <DetailItem
                                label="Last updated"
                                value={formatDate(subscription.updatedAt)}
                            />

                            <DetailItem
                                label="Start date"
                                value={formatDate(subscription.startsAt)}
                            />

                            <DetailItem
                                label="Expiry date"
                                value={formatDate(subscription.expiresAt)}
                            />

                            <DetailItem
                                label="Cancellation date"
                                value={formatDate(subscription.cancelledAt)}
                            />
                        </div>
                    </section>

                    {/* Cancellation information */}
                    {(subscription.cancellationReason ||
                        subscription.previousSubscriptionId) && (
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <SectionHeading
                                icon={XCircle}
                                title="Additional information"
                            />

                            {subscription.cancellationReason && (
                                <div className="rounded-xl border border-red-100 bg-red-50/70 p-4">
                                    <p className="text-xs font-semibold text-red-700">
                                        Cancellation reason
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-red-800">
                                        {subscription.cancellationReason}
                                    </p>
                                </div>
                            )}

                            {subscription.previousSubscriptionId && (
                                <div className="mt-4">
                                    <DetailItem
                                        label="Previous subscription ID"
                                        value={subscription.previousSubscriptionId}
                                    />
                                </div>
                            )}
                        </section>
                    )}

                    {/* Subscription history */}
                    <AdminSubscriptionHistoryTimeline
                        subscriptionId={subscription.id}
                    />
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-400">
                            Subscription records are displayed for administrative review.
                        </p>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl bg-[#1491FF] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0877D9] focus:outline-none focus:ring-4 focus:ring-blue-100"
                        >
                            Close details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
