"use client";

import { useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    LoaderCircle,
    X,
    XCircle,
} from "lucide-react";
import { AdminImageReviewDecision, AdminImageReviewDecisionPayload } from "@/app/types/admin/adminImageReview.types";

interface Props {
    open: boolean;
    decision: AdminImageReviewDecision | null;
    loading?: boolean;
    onClose: () => void;
    onSubmit: (payload: AdminImageReviewDecisionPayload) => void;
}

const DECISION_CONFIG = {
    APPROVED: {
        title: "Approve image",
        description: "This image will be marked as passed.",
        icon: CheckCircle2,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        button: "bg-emerald-600 hover:bg-emerald-700",
        label: "Approve image",
    },
    REJECTED: {
        title: "Reject image",
        description: "This image will be marked as failed.",
        icon: XCircle,
        color: "text-red-600",
        bg: "bg-red-50",
        button: "bg-red-600 hover:bg-red-700",
        label: "Reject image",
    },
    NEEDS_REVIEW: {
        title: "Request further review",
        description: "This image will remain in the review queue.",
        icon: AlertTriangle,
        color: "text-amber-600",
        bg: "bg-amber-50",
        button: "bg-amber-600 hover:bg-amber-700",
        label: "Request review",
    },
};

export function ImageReviewDecisionModal({
    open,
    decision,
    loading = false,
    onClose,
    onSubmit,
}: Props) {
    const [reason, setReason] = useState("");
    const [notes, setNotes] = useState("");

    if (!open || !decision) return null;

    const config = DECISION_CONFIG[decision];
    const Icon = config.icon;

    const handleSubmit = () => {
        if (decision === "REJECTED" && !reason.trim()) return;

        onSubmit({
            decision,
            reason: reason.trim() || undefined,
            notes: notes.trim() || undefined,
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
                            <Icon className={`h-5 w-5 ${config.color}`} />
                        </div>

                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                {config.title}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                {config.description}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Reason {decision === "REJECTED" && <span className="text-red-500">*</span>}
                        </label>

                        <textarea
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            rows={3}
                            maxLength={2000}
                            placeholder={
                                decision === "REJECTED"
                                    ? "Explain why this image is being rejected..."
                                    : "Add a reason (optional)..."
                            }
                            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1491FF] focus:bg-white focus:ring-4 focus:ring-[#1491FF]/10"
                        />

                        {decision === "REJECTED" && !reason.trim() && (
                            <p className="mt-1.5 text-xs text-red-500">
                                A rejection reason is required.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Internal notes
                        </label>

                        <textarea
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            rows={3}
                            maxLength={5000}
                            placeholder="Additional notes for the review record..."
                            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1491FF] focus:bg-white focus:ring-4 focus:ring-[#1491FF]/10"
                        />
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 p-5 sm:flex-row sm:justify-end sm:p-6">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={
                            loading ||
                            (decision === "REJECTED" && !reason.trim())
                        }
                        className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${config.button}`}
                    >
                        {loading ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                            <Icon className="h-4 w-4" />
                        )}

                        {loading ? "Submitting..." : config.label}
                    </button>
                </div>
            </div>
        </div>
    );
}