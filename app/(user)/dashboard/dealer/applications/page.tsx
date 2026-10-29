"use client";

import { useMemo, useState } from "react";
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileText,
    RefreshCw,
    ShieldCheck,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import type {
    DealerApplication,
    DealerApplicationStatus,
} from "@/app/types/user/dealer/dealer-application.types";
import { useMyDealerApplications } from "@/app/hooks/user/dealer/useDealerApplications";

type FilterStatus = "ALL" | DealerApplicationStatus;

const BRAND = "#7008E7";

const STATUS_CONFIG: Record<
    DealerApplicationStatus,
    {
        label: string;
        className: string;
        icon: typeof Clock3;
    }
> = {
    PENDING: {
        label: "Pending review",
        className: "border-amber-200 bg-amber-50 text-amber-700",
        icon: Clock3,
    },
    APPROVED: {
        label: "Approved",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
        icon: CheckCircle2,
    },
    REJECTED: {
        label: "Rejected",
        className: "border-red-200 bg-red-50 text-red-700",
        icon: XCircle,
    },
};

function formatDate(value: string | null | undefined): string {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

function StatusBadge({
    status,
}: {
    status: DealerApplicationStatus;
}) {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${config.className}`}
        >
            <Icon size={14} />
            {config.label}
        </span>
    );
}

function ApplicationCard({
    application,
}: {
    application: DealerApplication;
}) {
    const isRejected = application.status === "REJECTED";
    const isApproved = application.status === "APPROVED";
    const isPending = application.status === "PENDING";

    return (
        <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
            <div className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                        <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
                            style={{ backgroundColor: BRAND }}
                        >
                            <Building2 size={23} />
                        </div>

                        <div className="min-w-0">
                            <h2 className="break-words text-base font-bold text-gray-900 sm:text-lg">
                                {application.companyName}
                            </h2>

                            <p className="mt-1 text-xs text-gray-500">
                                Application ID:{" "}
                                <span className="font-mono">
                                    {application.id}
                                </span>
                            </p>

                            <div className="mt-3">
                                <StatusBadge status={application.status} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-gray-50 p-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <CalendarDays size={15} />
                            Date submitted
                        </div>

                        <p className="mt-1.5 text-sm font-semibold text-gray-900">
                            {formatDate(application.submittedAt)}
                        </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <ShieldCheck size={15} />
                            Date reviewed
                        </div>

                        <p className="mt-1.5 text-sm font-semibold text-gray-900">
                            {formatDate(application.reviewedAt)}
                        </p>
                    </div>
                </div>

                {isPending && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <Clock3
                            size={19}
                            className="mt-0.5 shrink-0 text-amber-600"
                        />

                        <div>
                            <p className="text-sm font-semibold text-amber-900">
                                Application under review
                            </p>

                            <p className="mt-1 text-sm leading-6 text-amber-800">
                                Your application is awaiting a decision.
                                You can check back here for updates.
                            </p>
                        </div>
                    </div>
                )}

                {isApproved && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <CheckCircle2
                            size={19}
                            className="mt-0.5 shrink-0 text-emerald-600"
                        />

                        <div>
                            <p className="text-sm font-semibold text-emerald-900">
                                Congratulations! Your application was approved.
                            </p>

                            <p className="mt-1 text-sm leading-6 text-emerald-800">
                                Your dealer application has been accepted.
                                You can now access the features available to
                                your verified dealer account.
                            </p>
                        </div>
                    </div>
                )}

                {isRejected && (
                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle
                                size={19}
                                className="mt-0.5 shrink-0 text-red-600"
                            />

                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-red-900">
                                    Reason for rejection
                                </p>

                                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-red-800">
                                    {application.rejectionReason?.trim() ||
                                        "No rejection reason was provided. Please contact support for clarification."}
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/dashboard/dealer/apply"
                            className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                            style={{ backgroundColor: BRAND }}
                        >
                            <RefreshCw size={15} />
                            Submit a new application
                        </Link>
                    </div>
                )}
            </div>
        </article>
    );
}

export default function DealerApplicationsPage() {
    const [filter, setFilter] = useState<FilterStatus>("ALL");

    const {
        data: applications = [],
        isPending,
        isError,
        refetch,
        isFetching,
    } = useMyDealerApplications();

    const counts = useMemo(
        () => ({
            ALL: applications.length,
            PENDING: applications.filter(
                (item) => item.status === "PENDING",
            ).length,
            APPROVED: applications.filter(
                (item) => item.status === "APPROVED",
            ).length,
            REJECTED: applications.filter(
                (item) => item.status === "REJECTED",
            ).length,
        }),
        [applications],
    );

    const filteredApplications = useMemo(
        () =>
            filter === "ALL"
                ? applications
                : applications.filter(
                      (item) => item.status === filter,
                  ),
        [applications, filter],
    );

    const filters: {
        label: string;
        value: FilterStatus;
    }[] = [
        { label: "All applications", value: "ALL" },
        { label: "Pending", value: "PENDING" },
        { label: "Approved", value: "APPROVED" },
        { label: "Rejected", value: "REJECTED" },
    ];

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-10">
            <div className="mx-auto max-w-5xl">
                <Link
                    href="/dashboard/dealer"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-950"
                >
                    <ArrowLeft size={17} />
                    Back to dealer dashboard
                </Link>

                <header className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div
                                className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl text-white"
                                style={{ backgroundColor: BRAND }}
                            >
                                <FileText size={22} />
                            </div>

                            <h1 className="text-2xl font-extrabold tracking-tight text-gray-950 sm:text-3xl">
                                Application history
                            </h1>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                                Track your dealer applications, review
                                decisions, and any feedback from the KARMASS
                                verification team.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => void refetch()}
                            disabled={isFetching}
                            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 sm:self-center"
                        >
                            <RefreshCw
                                size={16}
                                className={
                                    isFetching ? "animate-spin" : ""
                                }
                            />
                            Refresh
                        </button>
                    </div>

                    {!isPending && !isError && (
                        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {[
                                {
                                    label: "Total",
                                    value: counts.ALL,
                                    color: "text-gray-950",
                                },
                                {
                                    label: "Pending",
                                    value: counts.PENDING,
                                    color: "text-amber-700",
                                },
                                {
                                    label: "Approved",
                                    value: counts.APPROVED,
                                    color: "text-emerald-700",
                                },
                                {
                                    label: "Rejected",
                                    value: counts.REJECTED,
                                    color: "text-red-700",
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                                >
                                    <p className="text-xs font-medium text-gray-500">
                                        {item.label}
                                    </p>

                                    <p
                                        className={`mt-1 text-2xl font-extrabold ${item.color}`}
                                    >
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </header>

                <section className="mt-6">
                    <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
                        {filters.map((item) => {
                            const active = filter === item.value;

                            return (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => setFilter(item.value)}
                                    className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                                        active
                                            ? "border-purple-200 bg-purple-50 text-purple-800"
                                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                    }`}
                                    style={
                                        active
                                            ? {
                                                  borderColor: `${BRAND}35`,
                                                  backgroundColor: `${BRAND}0D`,
                                                  color: BRAND,
                                              }
                                            : undefined
                                    }
                                >
                                    {item.label}

                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs ${
                                            active
                                                ? "bg-white"
                                                : "bg-gray-100"
                                        }`}
                                    >
                                        {counts[item.value]}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {isPending ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6"
                                >
                                    <div className="h-5 w-48 rounded bg-gray-200" />
                                    <div className="mt-4 h-4 w-32 rounded bg-gray-100" />
                                    <div className="mt-6 h-20 rounded-xl bg-gray-100" />
                                </div>
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
                            <AlertCircle
                                size={32}
                                className="mx-auto text-red-500"
                            />

                            <h2 className="mt-3 text-lg font-bold text-gray-900">
                                Unable to load your applications
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                Check your connection and try again.
                            </p>

                            <button
                                type="button"
                                onClick={() => void refetch()}
                                className="mt-5 rounded-xl px-5 py-3 text-sm font-semibold text-white"
                                style={{ backgroundColor: BRAND }}
                            >
                                Try again
                            </button>
                        </div>
                    ) : filteredApplications.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-14 text-center">
                            <div
                                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                                style={{
                                    backgroundColor: `${BRAND}12`,
                                    color: BRAND,
                                }}
                            >
                                <FileText size={25} />
                            </div>

                            <h2 className="mt-4 text-lg font-bold text-gray-900">
                                {filter === "ALL"
                                    ? "No applications yet"
                                    : `No ${filter.toLowerCase()} applications`}
                            </h2>

                            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                                {filter === "ALL"
                                    ? "Your dealer applications will appear here after you submit one."
                                    : "There are currently no applications in this category."}
                            </p>

                            {filter === "ALL" && (
                                <Link
                                    href="/dealer/apply"
                                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white"
                                    style={{ backgroundColor: BRAND }}
                                >
                                    Apply to become a dealer
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredApplications.map((application) => (
                                <ApplicationCard
                                    key={application.id}
                                    application={application}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}