"use client";

import { motion, useReducedMotion } from "framer-motion";

import {
    AlertCircle,
    LoaderCircle,
    ShieldAlert,
} from "lucide-react";

import type {
    VehicleReportReason,
} from "@/app/types/user/vehicle-details.types";

import type {
    ReportListingState,
} from "@/app/hooks/user/vehicle/useReportListing";

import { ModalShell } from "./ModalShell";
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
    const shouldReduceMotion = useReducedMotion();

    return (
        <ModalShell
            titleId="report-listing-title"
            eyebrow="Marketplace safety"
            eyebrowClassName="text-red-600"
            title="Report this listing"
            description="Help us keep KARMASS safe by telling us what is wrong with this listing."
            closeLabel="Close report form"
            onClose={onClose}
        >
            {/* Information notice */}
            <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/70 p-3.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                    <ShieldAlert size={19} />
                </div>

                <div>
                    <p className="text-xs font-semibold text-red-900">
                        Your report will be reviewed
                    </p>

                    <p className="mt-1 text-xs leading-5 text-red-700/90">
                        Please provide accurate information. Reports are
                        reviewed by the KARMASS team.
                    </p>
                </div>
            </div>

            <form onSubmit={report.submit} className="mt-5">
                {/* Report reason */}
                <div>
                    <label
                        htmlFor="report-reason"
                        className="block text-sm font-semibold text-slate-800"
                    >
                        What is wrong with this listing?
                    </label>

                    <select
                        id="report-reason"
                        value={report.reason}
                        onChange={(event) =>
                            report.setReason(
                                event.target.value as VehicleReportReason,
                            )
                        }
                        className="mt-2 min-h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition hover:border-slate-300 focus:border-[#1491FF] focus:ring-4 focus:ring-blue-50"
                    >
                        {REPORT_REASONS.map((reason) => (
                            <option
                                key={reason.value}
                                value={reason.value}
                            >
                                {reason.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Additional details */}
                <div className="mt-5">
                    <div className="flex items-center justify-between gap-2">
                        <label
                            htmlFor="report-details"
                            className="text-sm font-semibold text-slate-800"
                        >
                            Additional information
                        </label>

                        <span className="text-[11px] text-slate-400">
                            Optional
                        </span>
                    </div>

                    <textarea
                        id="report-details"
                        value={report.details}
                        onChange={(event) =>
                            report.setDetails(event.target.value)
                        }
                        maxLength={2000}
                        rows={4}
                        placeholder="Tell us more about the issue. Include any details that could help our review team."
                        className="mt-2 min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#1491FF] focus:ring-4 focus:ring-blue-50"
                    />

                    <p className="mt-1.5 text-right text-[11px] text-slate-400">
                        {report.details.length.toLocaleString()}/2,000
                    </p>
                </div>

                {/* Error */}
                {report.error && (
                    <motion.div
                        initial={
                            shouldReduceMotion
                                ? false
                                : { opacity: 0, y: 6 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        role="alert"
                        className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3"
                    >
                        <div className="flex items-start gap-2">
                            <AlertCircle
                                size={16}
                                className="mt-0.5 shrink-0 text-red-600"
                            />

                            <p className="text-xs leading-5 text-red-700 sm:text-sm">
                                {report.error}
                            </p>
                        </div>

                        <SignInLink message={report.error} />
                    </motion.div>
                )}

                {/* Success */}
                {report.success && (
                    <motion.div
                        initial={
                            shouldReduceMotion
                                ? false
                                : { opacity: 0, y: 6 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        role="status"
                        className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5"
                    >
                        <p className="text-sm font-semibold text-emerald-800">
                            Report submitted
                        </p>

                        <p className="mt-1 text-xs leading-5 text-emerald-700">
                            {report.success}
                        </p>
                    </motion.div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={report.loading}
                    className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {report.loading ? (
                        <>
                            <LoaderCircle
                                size={18}
                                className="animate-spin"
                            />
                            Submitting report...
                        </>
                    ) : (
                        <>
                            <ShieldAlert size={17} />
                            Submit report
                        </>
                    )}
                </button>

                <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                    Reports are handled confidentially by our review team.
                </p>
            </form>
        </ModalShell>
    );
}