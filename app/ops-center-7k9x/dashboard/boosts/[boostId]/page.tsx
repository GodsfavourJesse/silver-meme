"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    CreditCard,
    ExternalLink,
    FileText,
    LoaderCircle,
    Mail,
    RefreshCw,
    Rocket,
    ShieldCheck,
    UserRound,
    X,
    XCircle,
    AlertCircle,
} from "lucide-react";

import { ADMIN_BASE_PATH } from "@/app/lib/admin/path";

import {
    useAdminBoostDetails,
    useApproveAdminBoost,
    useRejectAdminBoost,
} from "@/app/hooks/admin/admin-boost/useAdminBoosts";

import type {
    AdminBoostStatus,
} from "@/app/types/admin/admin-boosts/admin-boost.types";

const BOOSTS_PATH = `${ADMIN_BASE_PATH}/dashboard/boosts`;

const STATUS_STYLES: Record<AdminBoostStatus, string> = {
    PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
    AWAITING_APPROVAL: "bg-blue-50 text-[#0877D9] ring-blue-200",
    ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    REJECTED: "bg-red-50 text-red-700 ring-red-200",
    EXPIRED: "bg-slate-100 text-slate-600 ring-slate-200",
    CANCELLED: "bg-slate-100 text-slate-600 ring-slate-200",
};

function formatStatus(status: AdminBoostStatus) {
    return status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCurrency(amount: string | number, currency: string) {
    const value = Number(amount);

    if (!Number.isFinite(value)) {
        return `${currency} ${amount}`;
    }

    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
        }).format(value);
    } catch {
        return `${currency} ${value.toLocaleString()}`;
    }
}

function formatDate(value: string | null | undefined) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function StatusBadge({ status }: { status: AdminBoostStatus }) {
    return (
        <span
            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[status]}`}
        >
            {formatStatus(status)}
        </span>
    );
}

function DetailRow({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <span className="text-sm text-slate-500">{label}</span>
            <span className="break-all text-sm font-semibold text-slate-800 sm:text-right">
                {value}
            </span>
        </div>
    );
}

function SectionHeading({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof Rocket;
    title: string;
    description?: string;
}) {
    return (
        <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#1491FF]">
                <Icon size={19} />
            </div>

            <div>
                <h2 className="font-bold text-slate-900">{title}</h2>
                {description && (
                    <p className="mt-1 text-xs text-slate-500">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

function ReviewDialog({
    mode,
    loading,
    error,
    onClose,
    onSubmit,
}: {
    mode: "approve" | "reject";
    loading: boolean;
    error: string | null;
    onClose: () => void;
    onSubmit: (note: string) => void;
}) {
    const [note, setNote] = useState("");

    const isApprove = mode === "approve";
    const canSubmit = isApprove || note.trim().length > 0;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !loading) {
                    onClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="review-dialog-title"
                className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
                <div className="flex items-start justify-between border-b border-slate-100 p-5">
                    <div className="flex items-start gap-3">
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                isApprove
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-red-50 text-red-600"
                            }`}
                        >
                            {isApprove ? (
                                <CheckCircle2 size={21} />
                            ) : (
                                <XCircle size={21} />
                            )}
                        </div>

                        <div>
                            <h2
                                id="review-dialog-title"
                                className="font-bold text-slate-900"
                            >
                                {isApprove
                                    ? "Approve boost request"
                                    : "Reject boost request"}
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                {isApprove
                                    ? "This will activate the listing promotion."
                                    : "Provide a clear reason for rejecting this request."}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
                        aria-label="Close dialog"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4 p-5">
                    <div>
                        <label
                            htmlFor="review-note"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Review note{" "}
                            {!isApprove && (
                                <span className="text-red-500">*</span>
                            )}
                            {isApprove && (
                                <span className="font-normal text-slate-400">
                                    {" "} (optional)
                                </span>
                            )}
                        </label>

                        <textarea
                            id="review-note"
                            value={note}
                            onChange={(event) =>
                                setNote(event.target.value)
                            }
                            maxLength={2000}
                            rows={4}
                            placeholder={
                                isApprove
                                    ? "Add an internal review note..."
                                    : "Explain why this boost request is being rejected..."
                            }
                            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1491FF] focus:ring-4 focus:ring-[#1491FF]/10"
                        />

                        <p className="mt-1 text-right text-[11px] text-slate-400">
                            {note.length}/2000
                        </p>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div
                        className={`rounded-xl p-3 text-xs leading-5 ${
                            isApprove
                                ? "bg-emerald-50 text-emerald-800"
                                : "bg-amber-50 text-amber-800"
                        }`}
                    >
                        {isApprove
                            ? "Approval activates this boost. Its start and expiry dates will be determined by the backend."
                            : "Rejection cannot be treated as approval. The reason will be saved with the review record."}
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 p-5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onClose}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={loading || !canSubmit}
                        onClick={() => onSubmit(note.trim())}
                        className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            isApprove
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : "bg-red-600 hover:bg-red-700"
                        }`}
                    >
                        {loading && (
                            <LoaderCircle size={16} className="animate-spin" />
                        )}

                        {loading
                            ? "Processing..."
                            : isApprove
                                ? "Confirm approval"
                                : "Confirm rejection"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminBoostDetailsPage() {
    const params = useParams<{ boostId: string }>();
    const router = useRouter();

    const boostId = params.boostId;

    const detailsQuery = useAdminBoostDetails(boostId);

    const approveMutation = useApproveAdminBoost();
    const rejectMutation = useRejectAdminBoost();

    const [dialog, setDialog] = useState<"approve" | "reject" | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const boost = detailsQuery.data;

    const isReviewable =
        boost?.status === "AWAITING_APPROVAL";

    const paymentVerified = Boolean(boost?.paymentVerifiedAt);

    const listingApproved =
        boost?.listingStatus === "APPROVED";

    const canApprove =
        isReviewable &&
        paymentVerified &&
        listingApproved;

    const isMutating =
        approveMutation.isPending ||
        rejectMutation.isPending;

    async function handleApprove(note: string) {
        if (!boost) return;

        setActionError(null);

        try {
            await approveMutation.mutateAsync({
                boostId: boost.id,
                ...(note ? { reviewNote: note } : {}),
            });

            setDialog(null);
            await detailsQuery.refetch();
        } catch (error) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : "Unable to approve this boost request.",
            );
        }
    }

    async function handleReject(note: string) {
        if (!boost) return;

        setActionError(null);

        try {
            await rejectMutation.mutateAsync({
                boostId: boost.id,
                reviewNote: note,
            });

            setDialog(null);
            await detailsQuery.refetch();
        } catch (error) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : "Unable to reject this boost request.",
            );
        }
    }

    if (detailsQuery.isLoading) {
        return (
            <div className="min-h-screen bg-[#F7FAFE] px-4 py-8 sm:px-6">
                <div className="mx-auto max-w-6xl space-y-5">
                    <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
                    <div className="h-40 animate-pulse rounded-2xl bg-white" />
                    <div className="grid gap-5 lg:grid-cols-2">
                        <div className="h-72 animate-pulse rounded-2xl bg-white" />
                        <div className="h-72 animate-pulse rounded-2xl bg-white" />
                    </div>
                </div>
            </div>
        );
    }

    if (detailsQuery.isError || !boost) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-[#F7FAFE] px-4">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                        <AlertCircle size={26} />
                    </div>

                    <h1 className="mt-4 text-lg font-bold text-slate-900">
                        Unable to load boost request
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        This request may no longer exist, or there was a
                        problem retrieving its details.
                    </p>

                    <div className="mt-6 flex justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => detailsQuery.refetch()}
                            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1491FF] px-4 text-sm font-semibold text-white hover:bg-[#0877D9]"
                        >
                            <RefreshCw size={15} />
                            Retry
                        </button>

                        <Link
                            href={BOOSTS_PATH}
                            className="inline-flex h-10 items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            Back
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F7FAFE]">
            <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

                {/* Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={BOOSTS_PATH}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#1491FF]"
                    >
                        <ArrowLeft size={17} />
                        Back to boost requests
                    </Link>

                    <button
                        type="button"
                        onClick={() => detailsQuery.refetch()}
                        disabled={detailsQuery.isFetching}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-[#1491FF] hover:text-[#1491FF] disabled:opacity-50"
                    >
                        <RefreshCw
                            size={14}
                            className={
                                detailsQuery.isFetching
                                    ? "animate-spin"
                                    : ""
                            }
                        />
                        Refresh
                    </button>
                </div>

                {/* Main header */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EAF5FF] text-[#1491FF]">
                                <Rocket size={27} />
                            </div>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                                        Boost request
                                    </h1>

                                    <StatusBadge status={boost.status} />
                                </div>

                                <p className="mt-2 break-all text-xs text-slate-400">
                                    Request ID: {boost.id}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Submitted {formatDate(boost.createdAt)}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {canApprove && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActionError(null);
                                        setDialog("approve");
                                    }}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                >
                                    <CheckCircle2 size={17} />
                                    Approve boost
                                </button>
                            )}

                            {isReviewable && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActionError(null);
                                        setDialog("reject");
                                    }}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                    <XCircle size={17} />
                                    Reject
                                </button>
                            )}
                        </div>
                    </div>

                    {isReviewable && (
                        <div className="mt-6 rounded-xl border border-blue-100 bg-[#F0F7FF] p-4">
                            <div className="flex items-start gap-3">
                                <ShieldCheck
                                    size={19}
                                    className="mt-0.5 shrink-0 text-[#1491FF]"
                                />

                                <div>
                                    <p className="text-sm font-semibold text-[#075DAA]">
                                        Boost request awaiting review
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-blue-800/80">
                                        Confirm payment verification and
                                        listing approval before activating
                                        this promotion.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {actionError && (
                        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                            {actionError}
                        </div>
                    )}
                </section>

                {/* Eligibility */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <SectionHeading
                        icon={ShieldCheck}
                        title="Approval eligibility"
                        description="Review the required conditions before activating this boost."
                    />

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-4">
                            {paymentVerified ? (
                                <CheckCircle2
                                    size={20}
                                    className="shrink-0 text-emerald-600"
                                />
                            ) : (
                                <XCircle
                                    size={20}
                                    className="shrink-0 text-red-500"
                                />
                            )}

                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    Payment verification
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    {paymentVerified
                                        ? `Verified ${formatDate(boost.paymentVerifiedAt)}`
                                        : "Payment has not been verified"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-4">
                            {listingApproved ? (
                                <CheckCircle2
                                    size={20}
                                    className="shrink-0 text-emerald-600"
                                />
                            ) : (
                                <XCircle
                                    size={20}
                                    className="shrink-0 text-red-500"
                                />
                            )}

                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    Listing approval
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Listing status: {boost.listingStatus}
                                </p>
                            </div>
                        </div>
                    </div>

                    {isReviewable && !canApprove && (
                        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
                            Approval is currently unavailable because one
                            or more eligibility conditions have not been
                            met. The backend will perform the final checks.
                        </p>
                    )}
                </section>

                {/* Main details */}
                <div className="grid gap-6 lg:grid-cols-2">

                    {/* Listing */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <SectionHeading
                            icon={FileText}
                            title="Listing information"
                            description="The vehicle associated with this promotion."
                        />

                        <div className="space-y-1">
                            <DetailRow
                                label="Listing title"
                                value={boost.listingTitle}
                            />

                            <DetailRow
                                label="Listing ID"
                                value={boost.listingId}
                            />

                            <DetailRow
                                label="Listing status"
                                value={boost.listingStatus}
                            />

                            <DetailRow
                                label="Seller ID"
                                value={boost.sellerId}
                            />
                        </div>
                    </section>

                    {/* Seller */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <SectionHeading
                            icon={UserRound}
                            title="Seller information"
                            description="Account associated with this boost request."
                        />

                        <div className="space-y-1">
                            <DetailRow
                                label="Seller email"
                                value={
                                    <span className="inline-flex items-center gap-2">
                                        <Mail
                                            size={14}
                                            className="text-slate-400"
                                        />
                                        {boost.sellerEmail}
                                    </span>
                                }
                            />

                            <DetailRow
                                label="Seller ID"
                                value={boost.sellerId}
                            />

                            <DetailRow
                                label="Listing owner"
                                value="Verified against payment ownership by backend"
                            />
                        </div>
                    </section>

                    {/* Plan */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <SectionHeading
                            icon={Rocket}
                            title="Boost plan"
                            description="Selected promotion details."
                        />

                        <div className="mb-5 rounded-xl bg-[#F0F7FF] p-4">
                            <p className="text-xs font-medium text-[#0877D9]">
                                Promotion price
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                {formatCurrency(
                                    boost.price,
                                    boost.currency,
                                )}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <DetailRow
                                label="Plan ID"
                                value={boost.boostPlanId}
                            />

                            <DetailRow
                                label="Duration"
                                value={`${boost.durationDays} days`}
                            />

                            <DetailRow
                                label="Currency"
                                value={boost.currency}
                            />

                            <DetailRow
                                label="Start date"
                                value={formatDate(boost.startsAt)}
                            />

                            <DetailRow
                                label="Expiry date"
                                value={formatDate(boost.expiresAt)}
                            />
                        </div>
                    </section>

                    {/* Review history */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <SectionHeading
                            icon={Clock3}
                            title="Review information"
                            description="Administrative review record."
                        />

                        <div className="space-y-1">
                            <DetailRow
                                label="Reviewed by"
                                value={boost.reviewedBy ?? "Not reviewed"}
                            />

                            <DetailRow
                                label="Review date"
                                value={formatDate(boost.reviewedAt)}
                            />

                            <DetailRow
                                label="Review note"
                                value={
                                    boost.reviewNote || "No review note"
                                }
                            />

                            <DetailRow
                                label="Created"
                                value={formatDate(boost.createdAt)}
                            />
                        </div>
                    </section>
                </div>

                {/* Payments */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="p-5 sm:p-6">
                        <SectionHeading
                            icon={CreditCard}
                            title="Payment records"
                            description="Transactions associated with this boost request."
                        />
                    </div>

                    {!boost.payments?.length ? (
                        <div className="border-t border-slate-100 px-5 py-12 text-center">
                            <CreditCard
                                size={27}
                                className="mx-auto text-slate-300"
                            />

                            <p className="mt-3 text-sm font-semibold text-slate-700">
                                No payment records
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                No transactions are currently associated
                                with this boost.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px] text-left">
                                <thead className="bg-slate-50">
                                    <tr className="border-y border-slate-100">
                                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            Reference
                                        </th>

                                        <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            Amount
                                        </th>

                                        <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            Status
                                        </th>

                                        <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            Paid at
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {boost.payments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {payment.reference}
                                                </p>

                                                <p className="mt-1 text-[11px] text-slate-400">
                                                    {payment.id}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                                                {formatCurrency(
                                                    payment.amount,
                                                    payment.currency,
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                    {payment.status}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {formatDate(payment.paidAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Final status */}
                {!isReviewable && (
                    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                        <ShieldCheck
                            size={19}
                            className="mt-0.5 shrink-0 text-[#1491FF]"
                        />

                        <div>
                            <p className="text-sm font-semibold text-slate-800">
                                This request is no longer awaiting review.
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Its current status is {formatStatus(boost.status)}.
                                Approval and rejection actions are unavailable.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Review dialog */}
            {dialog && (
                <ReviewDialog
                    mode={dialog}
                    loading={isMutating}
                    error={actionError}
                    onClose={() => {
                        if (!isMutating) {
                            setDialog(null);
                            setActionError(null);
                        }
                    }}
                    onSubmit={
                        dialog === "approve"
                            ? handleApprove
                            : handleReject
                    }
                />
            )}
        </div>
    );
}