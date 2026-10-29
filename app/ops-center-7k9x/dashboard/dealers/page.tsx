"use client";

import {
    useMemo,
    useState,
} from "react";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    AnimatePresence,
    motion,
} from "framer-motion";

import {
    AlertCircle,
    ArrowRight,
    Building2,
    Check,
    CheckCircle2,
    ChevronDown,
    Clock3,
    FileCheck2,
    FileText,
    LoaderCircle,
    Mail,
    RefreshCw,
    Search,
    ShieldCheck,
    ShieldX,
    Users,
    X,
} from "lucide-react";

import { toast } from "sonner";

import {
    adminDealerService,
} from "../../../services/admin/admin-dealer.service";

import {
    useAdminCsrfToken,
} from "@/app/hooks/admin/admin-auth/use-admin-csrf-token";

import type {
    DealerApplication,
    DealerApplicationRow,
    DealerApplicationStatus,
    DealerDocument,
    DealerReviewDecision,
    NormalizedDealerApplicationRow,
    ReviewDealerPayload,
} from "@/app/types/admin/admin-dealers.types";

import AdminDealerDocumentPreviewModal from "@/app/components/adminComponents/admin-dealers/AdminDealerDocumentPreviewModal";

/* =========================================================
   CONSTANTS
========================================================= */

const BRAND = "#7008E7";

type StatusFilter = "ALL" | DealerApplicationStatus;

type ReviewTarget =
    | {
          type: "APPLICATION";
          id: string;
          decision: DealerReviewDecision;
          companyName: string;
      }
    | {
          type: "DOCUMENT";
          id: string;
          decision: DealerReviewDecision;
          documentType: string;
      };

const APPLICATIONS_QUERY_KEY = [
    "admin",
    "dealers",
    "applications",
] as const;

const STATISTICS_QUERY_KEY = [
    "admin",
    "dealers",
    "applications",
    "statistics",
] as const;

const FILTERS: {
    label: string;
    value: StatusFilter;
}[] = [
    { label: "All applications", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
];

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value?: string | null): string {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function formatStatus(status: string): string {
    return status
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (character) =>
            character.toUpperCase(),
        );
}

function applicantName(
    row:
        | Pick<DealerApplicationRow, "user">
        | Pick<NormalizedDealerApplicationRow, "user">,
): string {
    const name = [
        row.user.firstName,
        row.user.lastName,
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    return name || "Unnamed applicant";
}

function getInitials(name: string): string {
    return (
        name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join("") || "D"
    );
}

/**
 * The backend may return one row for each document when
 * applications and documents are joined.
 *
 * This function groups the rows into one application and
 * collects its unique documents in a typed array.
 */
function normalizeApplications(
    rows: DealerApplicationRow[],
): NormalizedDealerApplicationRow[] {
    const applications = new Map<
        string,
        NormalizedDealerApplicationRow
    >();

    for (const row of rows) {
        const applicationId = row.application.id;

        let normalized = applications.get(applicationId);

        if (!normalized) {
            normalized = {
                application: row.application,
                user: row.user,
                documents: [],
            };

            applications.set(applicationId, normalized);
        }

        const documents: DealerDocument[] = row.documents ?? [];

        for (const document of documents) {
            const alreadyExists = normalized.documents.some(
                (existingDocument) =>
                    existingDocument.id === document.id,
            );

            if (!alreadyExists) {
                normalized.documents.push(document);
            }
        }
    }

    return Array.from(applications.values());
}

function getApplicationDocumentsStatus(
    documents: DealerDocument[],
): "NONE" | "PENDING" | "APPROVED" | "REJECTED" {
    if (documents.length === 0) {
        return "NONE";
    }

    if (
        documents.some(
            (document) =>
                document.status === "REJECTED",
        )
    ) {
        return "REJECTED";
    }

    if (
        documents.every(
            (document) =>
                document.status === "APPROVED",
        )
    ) {
        return "APPROVED";
    }

    return "PENDING";
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
    status,
}: {
    status: string;
}) {
    const styles: Record<string, string> = {
        PENDING:
            "border-amber-200 bg-amber-50 text-amber-700",
        APPROVED:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
        REJECTED:
            "border-rose-200 bg-rose-50 text-rose-700",
        NONE:
            "border-slate-200 bg-slate-50 text-slate-500",
    };

    const icons: Record<string, typeof Clock3> = {
        PENDING: Clock3,
        APPROVED: CheckCircle2,
        REJECTED: ShieldX,
        NONE: AlertCircle,
    };

    const Icon = icons[status] ?? AlertCircle;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                styles[status] ?? styles.NONE
            }`}
        >
            <Icon size={13} />
            {formatStatus(status)}
        </span>
    );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
    title,
    value,
    description,
    icon: Icon,
    iconClass,
    delay = 0,
}: {
    title: string;
    value: number;
    description: string;
    icon: typeof Users;
    iconClass: string;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.35,
                delay,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                        {value.toLocaleString("en-NG")}
                    </p>
                </div>

                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${iconClass}`}
                >
                    <Icon size={21} />
                </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500 sm:mt-4">
                {description}
            </p>
        </motion.div>
    );
}

/* =========================================================
   REVIEW MODAL
========================================================= */

function ReviewModal({
    target,
    isPending,
    onClose,
    onSubmit,
}: {
    target: ReviewTarget | null;
    isPending: boolean;
    onClose: () => void;
    onSubmit: (
        target: ReviewTarget,
        reason: string,
    ) => Promise<void>;
}) {
    const [reason, setReason] = useState("");
    const [reasonError, setReasonError] = useState("");

    if (!target) return null;

    const isRejection = target.decision === "REJECTED";
    const isApplication = target.type === "APPLICATION";

    const title = isRejection
        ? isApplication
            ? "Reject dealer application"
            : "Reject verification document"
        : isApplication
          ? "Approve dealer application"
          : "Approve verification document";

    const subject = isApplication
        ? target.companyName
        : formatStatus(target.documentType);

    async function handleSubmit() {
        /*
         * Capture the target before awaiting.
         * This preserves the non-null ReviewTarget type.
         */
        const currentTarget = target;

        if (!currentTarget) return;

        const currentIsRejection =
            currentTarget.decision === "REJECTED";

        if (
            currentIsRejection &&
            !reason.trim()
        ) {
            setReasonError(
                "Please provide a reason for rejection.",
            );
            return;
        }

        if (reason.trim().length > 1000) {
            setReasonError(
                "The reason cannot exceed 1000 characters.",
            );
            return;
        }

        setReasonError("");

        try {
            await onSubmit(
                currentTarget,
                reason.trim(),
            );
        } catch {
            // The mutation displays the error through toast.
            // Keep the modal open so the admin can retry.
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"
                onMouseDown={(event) => {
                    if (
                        event.target === event.currentTarget &&
                        !isPending
                    ) {
                        onClose();
                    }
                }}
            >
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 25,
                        scale: 0.98,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                    }}
                    exit={{
                        opacity: 0,
                        y: 15,
                        scale: 0.98,
                    }}
                    transition={{ duration: 0.22 }}
                    className="max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-7"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                                isRejection
                                    ? "bg-rose-50 text-rose-600"
                                    : "bg-purple-50 text-purple-700"
                            }`}
                        >
                            {isRejection ? (
                                <ShieldX size={24} />
                            ) : (
                                <ShieldCheck size={24} />
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            aria-label="Close dialog"
                            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-slate-950">
                        {title}
                    </h2>

                    <p className="mt-2 break-words text-sm leading-6 text-slate-500">
                        {isRejection
                            ? `You are about to reject "${subject}". The reason will be recorded with the review.`
                            : `You are about to approve "${subject}". Please ensure all review requirements have been satisfied.`}
                    </p>

                    {isRejection && (
                        <div className="mt-6">
                            <label
                                htmlFor="dealer-rejection-reason"
                                className="mb-2 block text-sm font-semibold text-slate-800"
                            >
                                Reason for rejection
                                <span className="ml-1 text-rose-500">
                                    *
                                </span>
                            </label>

                            <textarea
                                id="dealer-rejection-reason"
                                value={reason}
                                onChange={(event) => {
                                    setReason(event.target.value);
                                    setReasonError("");
                                }}
                                rows={4}
                                maxLength={1000}
                                placeholder="Explain why this application or document cannot be approved..."
                                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                            />

                            <div className="mt-1 flex items-center justify-between gap-3">
                                <p className="text-xs text-rose-600">
                                    {reasonError}
                                </p>

                                <span className="shrink-0 text-xs text-slate-400">
                                    {reason.length}/1000
                                </span>
                            </div>
                        </div>
                    )}

                    {!isRejection && (
                        <div className="mt-6 rounded-xl border border-purple-100 bg-purple-50/70 p-4">
                            <div className="flex gap-3">
                                <CheckCircle2
                                    size={20}
                                    className="mt-0.5 shrink-0 text-purple-700"
                                />

                                <p className="text-sm leading-6 text-purple-950">
                                    {isApplication
                                        ? "The backend must verify that all submitted documents have been approved before granting dealer status."
                                        : "The document will be marked as approved and its review recorded."}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isPending}
                            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                isRejection
                                    ? "bg-rose-600 hover:bg-rose-700"
                                    : "bg-[#7008E7] hover:bg-[#5B06BF]"
                            }`}
                        >
                            {isPending ? (
                                <LoaderCircle
                                    size={17}
                                    className="animate-spin"
                                />
                            ) : isRejection ? (
                                <X size={17} />
                            ) : (
                                <Check size={17} />
                            )}

                            {isPending
                                ? "Processing..."
                                : isRejection
                                  ? "Confirm rejection"
                                  : "Confirm approval"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

/* =========================================================
   DOCUMENT CARD
========================================================= */

function DocumentCard({
    document,
    applicationStatus,
    onReview,
    onPreview,
    isPending,
}: {
    document: DealerDocument;
    applicationStatus: DealerApplicationStatus;
    onReview: (
        document: DealerDocument,
        decision: DealerReviewDecision,
    ) => void;
    onPreview: (document: DealerDocument) => void;
    isPending: boolean;
}) {
    const canReview =
        document.status === "PENDING" &&
        applicationStatus === "PENDING";

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <FileText size={19} />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold text-slate-900">
                        {formatStatus(document.documentType)}
                    </p>

                    <div className="mt-2">
                        <StatusBadge status={document.status} />
                    </div>

                    {document.rejectionReason && (
                        <div className="mt-3 rounded-lg bg-rose-50 p-3">
                            <p className="text-xs font-semibold text-rose-700">
                                Rejection reason
                            </p>

                            <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-rose-700">
                                {document.rejectionReason}
                            </p>
                        </div>
                    )}

                    {document.reviewedAt && (
                        <p className="mt-2 text-xs text-slate-400">
                            Reviewed {formatDate(document.reviewedAt)}
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={() => onPreview(document)}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#7008E7]/20 bg-purple-50 px-3 py-2 text-xs font-semibold text-[#7008E7] transition hover:bg-purple-100"
                    >
                        <FileText size={14} />
                        View document
                    </button>
                </div>

                {canReview && (
                    <div className="flex shrink-0 flex-col gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                onReview(document, "APPROVED")
                            }
                            disabled={isPending}
                            title="Approve document"
                            aria-label="Approve document"
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                        >
                            <Check size={17} />
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                onReview(document, "REJECTED")
                            }
                            disabled={isPending}
                            title="Reject document"
                            aria-label="Reject document"
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

/* =========================================================
   APPLICATION DETAILS DRAWER
========================================================= */

function ApplicationDetails({
    row,
    onClose,
    onReviewDocument,
    onPreviewDocument,
    onReviewApplication,
    isPending,
}: {
    row: NormalizedDealerApplicationRow;
    onClose: () => void;
    onReviewDocument: (
        document: DealerDocument,
        decision: DealerReviewDecision,
    ) => void;
    onPreviewDocument: (document: DealerDocument) => void;
    onReviewApplication: (
        application: DealerApplication,
        decision: DealerReviewDecision,
    ) => void;
    isPending: boolean;
}) {
    const application = row.application;
    const documents = row.documents;
    const applicant = applicantName(row);

    const documentStatus =
        getApplicationDocumentsStatus(documents);

    const canApproveApplication =
        application.status === "PENDING" &&
        documents.length > 0 &&
        documents.every(
            (document) => document.status === "APPROVED",
        );

    const hasPendingDocuments = documents.some(
        (document) => document.status === "PENDING",
    );

    const hasRejectedDocuments = documents.some(
        (document) => document.status === "REJECTED",
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex justify-end bg-slate-950/45 backdrop-blur-[2px]"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !isPending
                ) {
                    onClose();
                }
            }}
        >
            <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{
                    type: "spring",
                    damping: 28,
                    stiffness: 260,
                }}
                className="flex h-full w-full max-w-2xl flex-col bg-slate-50 shadow-2xl"
            >
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-purple-700">
                            Dealer review
                        </p>

                        <h2 className="mt-1 text-lg font-bold text-slate-950">
                            Application details
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        aria-label="Close application details"
                        className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                    >
                        <X size={21} />
                    </button>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-7">
                    {/* Company information */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
                                <Building2 size={26} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h3 className="break-words text-lg font-bold text-slate-950">
                                    {application.companyName}
                                </h3>

                                <p className="mt-1 break-all text-xs text-slate-400">
                                    Application ID: {application.id}
                                </p>

                                <div className="mt-3">
                                    <StatusBadge status={application.status} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                            <div>
                                <p className="text-xs font-medium text-slate-400">
                                    Submitted
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {formatDate(application.createdAt)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-slate-400">
                                    Documents
                                </p>

                                <div className="mt-1">
                                    <StatusBadge status={documentStatus} />
                                </div>
                            </div>

                            {application.reviewedAt && (
                                <div>
                                    <p className="text-xs font-medium text-slate-400">
                                        Reviewed
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                        {formatDate(application.reviewedAt)}
                                    </p>
                                </div>
                            )}
                        </div>

                        {application.reviewedByUserId && (
                            <p className="mt-3 break-all text-xs text-slate-400">
                                Reviewed by: {application.reviewedByUserId}
                            </p>
                        )}

                        {application.rejectionReason && (
                            <div className="mt-5 rounded-xl border border-rose-100 bg-rose-50 p-4">
                                <p className="text-sm font-semibold text-rose-700">
                                    Application rejection reason
                                </p>

                                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-rose-700">
                                    {application.rejectionReason}
                                </p>
                            </div>
                        )}
                    </section>

                    {/* Applicant information */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-5">
                        <h3 className="text-sm font-bold text-slate-950">
                            Applicant information
                        </h3>

                        <div className="mt-4 flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-800">
                                {getInitials(applicant)}
                            </div>

                            <div className="min-w-0">
                                <p className="break-words text-sm font-semibold text-slate-900">
                                    {applicant}
                                </p>

                                <p className="mt-1 break-all text-sm text-slate-500">
                                    {row.user.email || "No email provided"}
                                </p>
                            </div>
                        </div>

                        {row.user.email && (
                            <a
                                href={`mailto:${row.user.email}`}
                                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-purple-700 hover:text-purple-900"
                            >
                                <Mail size={16} />
                                Contact applicant
                                <ArrowRight size={15} />
                            </a>
                        )}
                    </section>

                    {/* Verification documents */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-slate-950">
                                    Verification documents
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Review each document before approving the application.
                                </p>
                            </div>

                            <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                                {documents.length}
                            </span>
                        </div>

                        {documents.length === 0 ? (
                            <div className="mt-5 rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center">
                                <FileText
                                    size={28}
                                    className="mx-auto text-slate-300"
                                />

                                <p className="mt-3 text-sm font-semibold text-slate-700">
                                    No documents submitted
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    The applicant must submit at least one document.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {documents.map((document) => (
                                    <DocumentCard
                                        key={document.id}
                                        document={document}
                                        applicationStatus={application.status}
                                        onReview={onReviewDocument}
                                        onPreview={onPreviewDocument}
                                        isPending={isPending}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Final application review */}
                    {application.status === "PENDING" && (
                        <section className="rounded-2xl border border-purple-100 bg-purple-50/60 p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-purple-700 shadow-sm">
                                    <ShieldCheck size={21} />
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-slate-950">
                                        Final application review
                                    </h3>

                                    <p className="mt-1 text-xs leading-5 text-slate-600">
                                        Every submitted verification document must be approved before the application can be approved.
                                    </p>
                                </div>
                            </div>

                            {hasPendingDocuments && (
                                <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                                    <Clock3
                                        size={16}
                                        className="mt-0.5 shrink-0"
                                    />

                                    Review all pending documents before approving this application.
                                </div>
                            )}

                            {hasRejectedDocuments && (
                                <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-700">
                                    <AlertCircle
                                        size={16}
                                        className="mt-0.5 shrink-0"
                                    />

                                    One or more documents have been rejected. Resolve the document issue before approving the application.
                                </div>
                            )}

                            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        onReviewApplication(
                                            application,
                                            "REJECTED",
                                        )
                                    }
                                    disabled={isPending}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                                >
                                    <X size={17} />
                                    Reject application
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        onReviewApplication(
                                            application,
                                            "APPROVED",
                                        )
                                    }
                                    disabled={
                                        isPending ||
                                        !canApproveApplication
                                    }
                                    title={
                                        !canApproveApplication
                                            ? "Approve all documents before approving the application"
                                            : "Approve dealer application"
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7008E7] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5B06BF] disabled:cursor-not-allowed disabled:bg-slate-300"
                                >
                                    <CheckCircle2 size={17} />
                                    Approve dealer
                                </button>
                            </div>
                        </section>
                    )}

                    {/* Already reviewed */}
                    {application.status !== "PENDING" && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="flex items-center gap-3">
                                <CheckCircle2
                                    size={20}
                                    className="text-slate-500"
                                />

                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        Application already reviewed
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        This application is{" "}
                                        {application.status.toLowerCase()}.
                                        The review actions are no longer available.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.aside>
        </motion.div>
    );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AdminDealersPage() {
    const queryClient = useQueryClient();
    const csrfQuery = useAdminCsrfToken();

    // Pending is the default filter.
    const [filter, setFilter] =
        useState<StatusFilter>("PENDING");

    const [search, setSearch] = useState("");

    const [selectedApplicationId, setSelectedApplicationId] =
        useState<string | null>(null);

    const [reviewTarget, setReviewTarget] =
        useState<ReviewTarget | null>(null);

    const [previewDocument, setPreviewDocument] =
        useState<{
            id: string;
            label: string;
        } | null>(null);

    const [mobileFilterOpen, setMobileFilterOpen] =
        useState(false);

    /* ---------------------------------------------------------
       FILTERED APPLICATIONS QUERY
    --------------------------------------------------------- */

    const applicationsQuery = useQuery({
        queryKey: [
            ...APPLICATIONS_QUERY_KEY,
            filter,
        ],

        queryFn: async () => {
            const response =
                await adminDealerService.getApplications(
                    filter === "ALL" ? undefined : filter,
                );

            return normalizeApplications(
                response.data.applications,
            );
        },
    });

    const applications =
        applicationsQuery.data ?? [];

    /* ---------------------------------------------------------
       ALL APPLICATIONS QUERY FOR STATISTICS

       This query deliberately has a separate key from the
       filtered query.
    --------------------------------------------------------- */

    const allApplicationsQuery = useQuery({
        queryKey: STATISTICS_QUERY_KEY,

        queryFn: async () => {
            const response =
                await adminDealerService.getApplications();

            return normalizeApplications(
                response.data.applications,
            );
        },
    });

    const allApplications =
        allApplicationsQuery.data ?? [];

    const stats = useMemo(
        () => ({
            total: allApplications.length,

            pending: allApplications.filter(
                (row) =>
                    row.application.status === "PENDING",
            ).length,

            approved: allApplications.filter(
                (row) =>
                    row.application.status === "APPROVED",
            ).length,

            rejected: allApplications.filter(
                (row) =>
                    row.application.status === "REJECTED",
            ).length,
        }),
        [allApplications],
    );

    /* ---------------------------------------------------------
       APPLICATION REVIEW MUTATION
    --------------------------------------------------------- */

    const reviewApplicationMutation = useMutation({
        mutationFn: async ({
            applicationId,
            payload,
        }: {
            applicationId: string;
            payload: ReviewDealerPayload;
        }) => {
            let csrfToken = csrfQuery.data?.csrfToken;

            if (!csrfToken) {
                const refreshed =
                    await csrfQuery.refetch();

                csrfToken =
                    refreshed.data?.csrfToken;
            }

            if (!csrfToken) {
                throw new Error(
                    "Unable to verify this action. Refresh the page and try again.",
                );
            }

            return adminDealerService.reviewApplication(
                applicationId,
                payload,
                csrfToken,
            );
        },

        onSuccess: async (_, variables) => {
            toast.success(
                variables.payload.decision === "APPROVED"
                    ? "Dealer application approved successfully."
                    : "Dealer application rejected successfully.",
            );

            setReviewTarget(null);
            setSelectedApplicationId(null);

            await queryClient.invalidateQueries({
                queryKey: APPLICATIONS_QUERY_KEY,
            });
        },

        onError: (error) => {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to review dealer application.",
            );
        },
    });

    /* ---------------------------------------------------------
       DOCUMENT REVIEW MUTATION
    --------------------------------------------------------- */

    const reviewDocumentMutation = useMutation({
        mutationFn: async ({
            documentId,
            payload,
        }: {
            documentId: string;
            payload: ReviewDealerPayload;
        }) => {
            let csrfToken = csrfQuery.data?.csrfToken;

            if (!csrfToken) {
                const refreshed =
                    await csrfQuery.refetch();

                csrfToken =
                    refreshed.data?.csrfToken;
            }

            if (!csrfToken) {
                throw new Error(
                    "Unable to verify this action. Refresh the page and try again.",
                );
            }

            return adminDealerService.reviewDocument(
                documentId,
                payload,
                csrfToken,
            );
        },

        onSuccess: async (_, variables) => {
            toast.success(
                variables.payload.decision === "APPROVED"
                    ? "Verification document approved."
                    : "Verification document rejected.",
            );

            setReviewTarget(null);

            await queryClient.invalidateQueries({
                queryKey: APPLICATIONS_QUERY_KEY,
            });
        },

        onError: (error) => {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to review verification document.",
            );
        },
    });

    const isPending =
        reviewApplicationMutation.isPending ||
        reviewDocumentMutation.isPending;

    /* ---------------------------------------------------------
       SELECTED APPLICATION

       Use allApplications so the details remain available
       even if the active status filter changes.
    --------------------------------------------------------- */

    const selectedApplication =
        allApplications.find(
            (row) =>
                row.application.id ===
                selectedApplicationId,
        ) ?? null;

    /* ---------------------------------------------------------
       SEARCH
    --------------------------------------------------------- */

    const normalizedSearch = search
        .trim()
        .toLowerCase();

    const filteredApplications = useMemo(() => {
        if (!normalizedSearch) {
            return applications;
        }

        return applications.filter((row) => {
            const searchable = [
                row.application.companyName,
                row.application.id,
                row.application.status,
                applicantName(row),
                row.user.email ?? "",
            ]
                .join(" ")
                .toLowerCase();

            return searchable.includes(normalizedSearch);
        });
    }, [applications, normalizedSearch]);

    /* ---------------------------------------------------------
       ACTION HANDLERS
    --------------------------------------------------------- */

    function openApplicationReview(
        application: DealerApplication,
        decision: DealerReviewDecision,
    ) {
        setReviewTarget({
            type: "APPLICATION",
            id: application.id,
            decision,
            companyName: application.companyName,
        });
    }

    function openDocumentPreview(
        document: DealerDocument,
    ) {
        setPreviewDocument({
            id: document.id,
            label: formatStatus(document.documentType),
        });
    }

    function openDocumentReview(
        document: DealerDocument,
        decision: DealerReviewDecision,
    ) {
        setReviewTarget({
            type: "DOCUMENT",
            id: document.id,
            decision,
            documentType: document.documentType,
        });
    }

    async function submitReview(
        target: ReviewTarget,
        reason: string,
    ) {
        const payload: ReviewDealerPayload = {
            decision: target.decision,

            ...(target.decision === "REJECTED"
                ? {
                      rejectionReason: reason,
                  }
                : {}),
        };

        if (target.type === "APPLICATION") {
            await reviewApplicationMutation.mutateAsync({
                applicationId: target.id,
                payload,
            });

            return;
        }

        await reviewDocumentMutation.mutateAsync({
            documentId: target.id,
            payload,
        });
    }

    async function refreshApplications() {
        await Promise.all([
            applicationsQuery.refetch(),
            allApplicationsQuery.refetch(),
        ]);
    }

    /* ---------------------------------------------------------
       RENDER
    --------------------------------------------------------- */

    return (
        <div className="min-h-screen bg-slate-50 pb-10">
            {/* Page header */}
            <div className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center"
                    >
                        <div className="flex items-start gap-4">
                            <div
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg sm:h-14 sm:w-14"
                                style={{
                                    background: `linear-gradient(135deg, ${BRAND}, #9B55F5)`,
                                }}
                            >
                                <Building2 size={26} />
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                                        Dealer management
                                    </h1>

                                    <span className="rounded-full border border-purple-100 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                                        Administration
                                    </span>
                                </div>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                    Review dealer applications, verify submitted documents, and manage dealer approvals.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={refreshApplications}
                            disabled={
                                applicationsQuery.isFetching ||
                                allApplicationsQuery.isFetching
                            }
                            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-purple-200 hover:text-purple-700 disabled:opacity-50 lg:self-center"
                        >
                            <RefreshCw
                                size={17}
                                className={
                                    applicationsQuery.isFetching ||
                                    allApplicationsQuery.isFetching
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            Refresh applications
                        </button>
                    </motion.div>
                </div>
            </div>

            <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                {/* Statistics */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
                    <StatCard
                        title="Total applications"
                        value={stats.total}
                        description="All dealer applications across every status."
                        icon={Users}
                        iconClass="bg-purple-50 text-purple-700"
                    />

                    <StatCard
                        title="Pending review"
                        value={stats.pending}
                        description="Applications awaiting an administrative decision."
                        icon={Clock3}
                        iconClass="bg-amber-50 text-amber-700"
                        delay={0.05}
                    />

                    <StatCard
                        title="Approved dealers"
                        value={stats.approved}
                        description="Applications approved by an administrator."
                        icon={ShieldCheck}
                        iconClass="bg-emerald-50 text-emerald-700"
                        delay={0.1}
                    />

                    <StatCard
                        title="Rejected applications"
                        value={stats.rejected}
                        description="Applications that were not approved."
                        icon={ShieldX}
                        iconClass="bg-rose-50 text-rose-700"
                        delay={0.15}
                    />
                </div>

                {/* Main panel */}
                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.4,
                        delay: 0.1,
                    }}
                    className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                    {/* Panel heading */}
                    <div className="border-b border-slate-100 p-4 sm:p-6">
                        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                            <div>
                                <h2 className="text-lg font-bold text-slate-950">
                                    Dealer applications
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Search applicants and manage their verification status.
                                </p>
                            </div>

                            <div className="relative w-full lg:max-w-sm">
                                <Search
                                    size={18}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search company, applicant or email..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-100"
                                />
                            </div>
                        </div>

                        {/* Desktop filters */}
                        <div className="mt-5 hidden flex-wrap gap-2 sm:flex">
                            {FILTERS.map((item) => {
                                const active =
                                    filter === item.value;

                                const count =
                                    item.value === "PENDING"
                                        ? stats.pending
                                        : item.value === "APPROVED"
                                          ? stats.approved
                                          : item.value === "REJECTED"
                                            ? stats.rejected
                                            : stats.total;

                                return (
                                    <button
                                        key={item.value}
                                        type="button"
                                        onClick={() =>
                                            setFilter(item.value)
                                        }
                                        className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                            active
                                                ? "bg-[#7008E7] text-white shadow-sm"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                    >
                                        {item.label}

                                        <span
                                            className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                                                active
                                                    ? "bg-white/20 text-white"
                                                    : "bg-white text-slate-600"
                                            }`}
                                        >
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Mobile filter */}
                        <div className="relative mt-4 sm:hidden">
                            <button
                                type="button"
                                onClick={() =>
                                    setMobileFilterOpen(
                                        (current) => !current,
                                    )
                                }
                                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                            >
                                {
                                    FILTERS.find(
                                        (item) =>
                                            item.value === filter,
                                    )?.label
                                }

                                <ChevronDown
                                    size={18}
                                    className={`transition-transform ${
                                        mobileFilterOpen
                                            ? "rotate-180"
                                            : ""
                                    }`}
                                />
                            </button>

                            <AnimatePresence>
                                {mobileFilterOpen && (
                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            y: -5,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            y: -5,
                                        }}
                                        className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                                    >
                                        {FILTERS.map((item) => {
                                            const count =
                                                item.value === "PENDING"
                                                    ? stats.pending
                                                    : item.value === "APPROVED"
                                                      ? stats.approved
                                                      : item.value === "REJECTED"
                                                        ? stats.rejected
                                                        : stats.total;

                                            return (
                                                <button
                                                    key={item.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setFilter(item.value);
                                                        setMobileFilterOpen(false);
                                                    }}
                                                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${
                                                        filter === item.value
                                                            ? "bg-purple-50 font-semibold text-purple-700"
                                                            : "text-slate-600 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    {item.label}

                                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                                        {count}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Query error */}
                    {applicationsQuery.isError && (
                        <div className="m-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 sm:m-6">
                            <AlertCircle
                                size={20}
                                className="mt-0.5 shrink-0 text-rose-600"
                            />

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-rose-800">
                                    Unable to load dealer applications
                                </p>

                                <p className="mt-1 break-words text-xs leading-5 text-rose-700">
                                    {applicationsQuery.error instanceof Error
                                        ? applicationsQuery.error.message
                                        : "Something went wrong while retrieving applications."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    applicationsQuery.refetch()
                                }
                                className="shrink-0 text-sm font-semibold text-rose-700 hover:text-rose-900"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Loading skeletons */}
                    {applicationsQuery.isPending && (
                        <div className="space-y-3 p-4 sm:p-6">
                            {Array.from({ length: 5 }).map(
                                (_, index) => (
                                    <div
                                        key={index}
                                        className="animate-pulse rounded-xl border border-slate-100 p-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-11 w-11 rounded-xl bg-slate-100" />

                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 w-40 rounded bg-slate-100" />
                                                <div className="h-3 w-56 max-w-full rounded bg-slate-100" />
                                            </div>

                                            <div className="h-8 w-24 rounded-lg bg-slate-100" />
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    )}

                    {/* Application list */}
                    {!applicationsQuery.isPending &&
                        !applicationsQuery.isError && (
                            <>
                                {filteredApplications.length === 0 ? (
                                    <div className="px-5 py-16 text-center sm:px-8">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
                                            <Building2 size={28} />
                                        </div>

                                        <h3 className="mt-5 text-base font-bold text-slate-900">
                                            {normalizedSearch
                                                ? "No matching applications"
                                                : filter === "PENDING"
                                                  ? "No pending applications"
                                                  : filter === "APPROVED"
                                                    ? "No approved applications"
                                                    : filter === "REJECTED"
                                                      ? "No rejected applications"
                                                      : "No dealer applications found"}
                                        </h3>

                                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                            {normalizedSearch
                                                ? "Try another company name, applicant name, or email address."
                                                : "Applications will appear here when users submit their dealer registration."}
                                        </p>

                                        {normalizedSearch && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSearch("")
                                                }
                                                className="mt-4 text-sm font-semibold text-purple-700 hover:text-purple-900"
                                            >
                                                Clear search
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {/* Desktop table */}
                                        <div className="hidden overflow-x-auto md:block">
                                            <table className="w-full min-w-[850px] text-left">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                            Applicant / company
                                                        </th>

                                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                            Documents
                                                        </th>

                                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                            Submitted
                                                        </th>

                                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                            Application status
                                                        </th>

                                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                            Action
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody className="divide-y divide-slate-100">
                                                    {filteredApplications.map(
                                                        (row, index) => {
                                                            const documents =
                                                                row.documents;

                                                            const documentStatus =
                                                                getApplicationDocumentsStatus(
                                                                    documents,
                                                                );

                                                            const name =
                                                                applicantName(row);

                                                            return (
                                                                <motion.tr
                                                                    key={row.application.id}
                                                                    initial={{
                                                                        opacity: 0,
                                                                        y: 7,
                                                                    }}
                                                                    animate={{
                                                                        opacity: 1,
                                                                        y: 0,
                                                                    }}
                                                                    transition={{
                                                                        duration: 0.22,
                                                                        delay: Math.min(
                                                                            index * 0.025,
                                                                            0.25,
                                                                        ),
                                                                    }}
                                                                    className="transition hover:bg-purple-50/30"
                                                                >
                                                                    <td className="px-6 py-5">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-sm font-bold text-purple-800">
                                                                                {getInitials(name)}
                                                                            </div>

                                                                            <div className="min-w-0">
                                                                                <p className="max-w-[250px] truncate text-sm font-semibold text-slate-900">
                                                                                    {row.application.companyName}
                                                                                </p>

                                                                                <p className="mt-1 max-w-[250px] truncate text-xs text-slate-500">
                                                                                    {name}
                                                                                </p>

                                                                                <p className="mt-1 max-w-[250px] truncate text-xs text-slate-400">
                                                                                    {row.user.email || "No email provided"}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </td>

                                                                    <td className="px-6 py-5">
                                                                        <div className="flex flex-col items-start gap-2">
                                                                            <span className="text-sm font-semibold text-slate-800">
                                                                                {documents.length} document{documents.length !== 1 ? "s" : ""}
                                                                            </span>

                                                                            <StatusBadge status={documentStatus} />
                                                                        </div>
                                                                    </td>

                                                                    <td className="whitespace-nowrap px-6 py-5 text-sm text-slate-500">
                                                                        {formatDate(row.application.createdAt)}
                                                                    </td>

                                                                    <td className="px-6 py-5">
                                                                        <StatusBadge status={row.application.status} />
                                                                    </td>

                                                                    <td className="px-6 py-5 text-right">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setSelectedApplicationId(
                                                                                    row.application.id,
                                                                                )
                                                                            }
                                                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                                                                        >
                                                                            Review
                                                                            <ArrowRight size={15} />
                                                                        </button>
                                                                    </td>
                                                                </motion.tr>
                                                            );
                                                        },
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile cards */}
                                        <div className="space-y-3 p-4 md:hidden">
                                            {filteredApplications.map(
                                                (row, index) => {
                                                    const documents =
                                                        row.documents;

                                                    const documentStatus =
                                                        getApplicationDocumentsStatus(
                                                            documents,
                                                        );

                                                    const name =
                                                        applicantName(row);

                                                    return (
                                                        <motion.article
                                                            key={row.application.id}
                                                            initial={{
                                                                opacity: 0,
                                                                y: 12,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            transition={{
                                                                duration: 0.25,
                                                                delay: Math.min(
                                                                    index * 0.04,
                                                                    0.2,
                                                                ),
                                                            }}
                                                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-sm font-bold text-purple-800">
                                                                    {getInitials(name)}
                                                                </div>

                                                                <div className="min-w-0 flex-1">
                                                                    <h3 className="break-words text-sm font-bold text-slate-900">
                                                                        {row.application.companyName}
                                                                    </h3>

                                                                    <p className="mt-1 text-xs text-slate-500">
                                                                        {name}
                                                                    </p>

                                                                    <p className="mt-1 break-all text-xs text-slate-400">
                                                                        {row.user.email || "No email provided"}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                                                <StatusBadge status={row.application.status} />
                                                                <StatusBadge status={documentStatus} />
                                                            </div>

                                                            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                                                                <div className="min-w-0">
                                                                    <p className="text-xs text-slate-400">
                                                                        Submitted
                                                                    </p>

                                                                    <p className="mt-1 text-xs font-medium text-slate-700">
                                                                        {formatDate(row.application.createdAt)}
                                                                    </p>

                                                                    <p className="mt-1 text-xs text-slate-500">
                                                                        {documents.length} document{documents.length !== 1 ? "s" : ""}
                                                                    </p>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setSelectedApplicationId(
                                                                            row.application.id,
                                                                        )
                                                                    }
                                                                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#7008E7] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#5B06BF]"
                                                                >
                                                                    Review
                                                                    <ArrowRight size={15} />
                                                                </button>
                                                            </div>
                                                        </motion.article>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                    {/* Footer */}
                    {!applicationsQuery.isPending &&
                        !applicationsQuery.isError &&
                        filteredApplications.length > 0 && (
                            <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <p className="text-xs text-slate-500">
                                    Showing{" "}
                                    <span className="font-semibold text-slate-800">
                                        {filteredApplications.length}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-semibold text-slate-800">
                                        {applications.length}
                                    </span>{" "}
                                    applications in this result.
                                </p>

                                <p className="flex items-center gap-1.5 text-xs text-slate-400">
                                    <ShieldCheck
                                        size={14}
                                        className="text-purple-600"
                                    />
                                    Administrative review
                                </p>
                            </div>
                        )}
                </motion.section>

                {/* Review guidance */}
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-purple-100 bg-purple-50/60 p-4 sm:p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-purple-700 shadow-sm">
                        <FileCheck2 size={21} />
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            Review process
                        </h3>

                        <p className="mt-1 text-xs leading-6 text-slate-600 sm:text-sm">
                            Review each verification document first.
                            An application can only be approved after
                            all submitted documents are approved.
                            Rejections require a reason, and the backend
                            should record the reviewer and review timestamp.
                        </p>
                    </div>
                </div>
            </div>

            {/* Application details drawer */}
            <AnimatePresence>
                {selectedApplication && (
                    <ApplicationDetails
                        key={selectedApplication.application.id}
                        row={selectedApplication}
                        onClose={() =>
                            setSelectedApplicationId(null)
                        }
                        onReviewDocument={openDocumentReview}
                        onPreviewDocument={openDocumentPreview}
                        onReviewApplication={openApplicationReview}
                        isPending={isPending}
                    />
                )}
            </AnimatePresence>

            {/* Confirmation modal */}
            <ReviewModal
                key={
                    reviewTarget
                        ? `${reviewTarget.type}-${reviewTarget.id}-${reviewTarget.decision}`
                        : "dealer-review-modal-closed"
                }
                target={reviewTarget}
                isPending={isPending}
                onClose={() => {
                    if (!isPending) {
                        setReviewTarget(null);
                    }
                }}
                onSubmit={submitReview}
            />

            {/* Document preview modal */}
            <AdminDealerDocumentPreviewModal
                documentId={previewDocument?.id ?? null}
                documentLabel={previewDocument?.label}
                onClose={() => setPreviewDocument(null)}
            />
        </div>
    );
}