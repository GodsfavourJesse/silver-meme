import { LoaderCircle, ShieldAlert } from "lucide-react";
import type { VehicleReportReason } from "@/app/types/user/vehicle-details.types";

import { ModalShell } from "./ModalShell";
import { ReportListingState } from "@/app/hooks/user/vehicle/useReportListing";
import { SignInLink } from "../Desktop/SignInLink";

const REPORT_REASONS: {
    value: VehicleReportReason;
    label: string;
}[] = [
    {
        value: "SCAM_OR_FRAUD",
        label: "Suspected scam or fraud",
    },
    {
        value: "WRONG_VEHICLE_INFORMATION",
        label: "Incorrect vehicle information",
    },
    {
        value: "DUPLICATE_LISTING",
        label: "Duplicate listing",
    },
    {
        value: "ALREADY_SOLD",
        label: "Vehicle has already been sold",
    },
    {
        value: "INAPPROPRIATE_CONTENT",
        label: "Inappropriate content",
    },
    {
        value: "MISLEADING_PRICE",
        label: "Misleading price",
    },
    {
        value: "OTHER",
        label: "Other",
    },
];

interface ReportListingModalProps {
    report: ReportListingState;
    onClose: () => void;
}

export function ReportListingModal({
    report,
    onClose,
}: ReportListingModalProps) {
    return (
        <ModalShell
            titleId="report-listing-title"
            eyebrow="Marketplace safety"
            eyebrowClassName="text-red-700"
            title="Report this listing"
            description="Tell us what appears suspicious or inaccurate."
            closeLabel="Close report form"
            onClose={onClose}
        >
            <form onSubmit={report.submit} className="mt-5">
                <label
                    htmlFor="report-reason"
                    className="block text-sm font-semibold text-slate-800"
                >
                    Reason for report
                </label>

                <select
                    id="report-reason"
                    value={report.reason}
                    onChange={(event) =>
                        report.setReason(
                            event.target.value as VehicleReportReason,
                        )
                    }
                    className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                >
                    {REPORT_REASONS.map((reason) => (
                        <option key={reason.value} value={reason.value}>
                            {reason.label}
                        </option>
                    ))}
                </select>

                <label
                    htmlFor="report-details"
                    className="mt-5 block text-sm font-semibold text-slate-800"
                >
                    Additional details
                    <span className="ml-1 font-normal text-slate-400">
                        (optional)
                    </span>
                </label>

                <textarea
                    id="report-details"
                    value={report.details}
                    onChange={(event) => report.setDetails(event.target.value)}
                    maxLength={2000}
                    rows={4}
                    placeholder="Provide details that may help our review team."
                    className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />

                {report.error && (
                    <p
                        role="alert"
                        className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800"
                    >
                        {report.error}

                        <SignInLink message={report.error} />
                    </p>
                )}

                {report.success && (
                    <p
                        role="status"
                        className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-800"
                    >
                        {report.success}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={report.loading}
                    className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {report.loading ? (
                        <LoaderCircle size={18} className="animate-spin" />
                    ) : (
                        <ShieldAlert size={17} />
                    )}

                    {report.loading ? "Submitting report..." : "Submit report"}
                </button>
            </form>
        </ModalShell>
    );
}