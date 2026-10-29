"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    AnimatePresence,
    motion,
} from "framer-motion";

import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    Clock3,
    LoaderCircle,
    LockKeyhole,
    RotateCcw,
    ShieldCheck,
    X,
} from "lucide-react";

import { toast } from "sonner";

import { VehicleSilhouette } from "./vehicle-silhouette";

import { adminSecurityChallengeService } from "@/app/services/admin/admin-security-challenge.service";

import type {
    AdminSecurityChallengeQuestion,
    StartAdminSecurityChallengeResponse,
} from "@/app/types/admin/admin-security-challenge.types";

interface AdminSecurityChallengeModalProps {
    open: boolean;
    isCompleting?: boolean;
    onClose: () => void;
    onComplete: (challengeToken: string) => Promise<void>;
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return "Something went wrong. Please try again.";
}

function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds,
    ).padStart(2, "0")}`;
}

export function AdminSecurityChallengeModal({
    open,
    isCompleting = false,
    onClose,
    onComplete,
}: AdminSecurityChallengeModalProps) {
    const [challengeToken, setChallengeToken] =
        useState<string | null>(null);

    const [question, setQuestion] =
        useState<AdminSecurityChallengeQuestion | null>(null);

    const [expiresAt, setExpiresAt] =
        useState<string | null>(null);

    const [totalStages, setTotalStages] = useState(5);

    const [completedStages, setCompletedStages] =
        useState(0);

    const [selectedAnswer, setSelectedAnswer] =
        useState<string | null>(null);

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);

    const [isStarting, setIsStarting] = useState(false);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [remainingSeconds, setRemainingSeconds] =
        useState(0);

    const [hasExpired, setHasExpired] =
        useState(false);

    const busy = isStarting || isSubmitting || isCompleting;

    const resetChallenge = useCallback(() => {
        setChallengeToken(null);
        setQuestion(null);
        setExpiresAt(null);
        setTotalStages(5);
        setCompletedStages(0);
        setSelectedAnswer(null);
        setErrorMessage(null);
        setRemainingSeconds(0);
        setHasExpired(false);
    }, []);

    const startChallenge = useCallback(async () => {
        setIsStarting(true);
        setErrorMessage(null);
        setHasExpired(false);
        setSelectedAnswer(null);

        try {
            const result: StartAdminSecurityChallengeResponse =
                await adminSecurityChallengeService.start();

            setChallengeToken(result.challengeToken);
            setQuestion(result.question);
            setExpiresAt(result.expiresAt);
            setTotalStages(result.totalStages);
            setCompletedStages(0);
        } catch (error: unknown) {
            setErrorMessage(getErrorMessage(error));
        } finally {
            setIsStarting(false);
        }
    }, []);

    useEffect(() => {
        if (!open) {
            resetChallenge();
            return;
        }

        void startChallenge();
    }, [open, resetChallenge, startChallenge]);

    useEffect(() => {
        if (!open || !expiresAt) {
            return;
        }

        const updateCountdown = () => {
            const seconds = Math.max(
                0,
                Math.ceil(
                    (new Date(expiresAt).getTime() - Date.now()) /
                        1000,
                ),
            );

            setRemainingSeconds(seconds);

            if (seconds <= 0) {
                setHasExpired(true);
                setErrorMessage(
                    "Your security challenge has expired. Start a new one to continue.",
                );
            }
        };

        updateCountdown();

        const interval = window.setInterval(
            updateCountdown,
            1000,
        );

        return () => window.clearInterval(interval);
    }, [open, expiresAt]);

    const progress = useMemo(() => {
        return Math.min(
            100,
            (completedStages / Math.max(totalStages, 1)) * 100,
        );
    }, [completedStages, totalStages]);

    async function handleAnswerSubmit() {
        if (
            !challengeToken ||
            !question ||
            !selectedAnswer ||
            busy ||
            hasExpired
        ) {
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const result =
                await adminSecurityChallengeService.submitAnswer({
                    challengeToken,
                    answer: selectedAnswer,
                });

            setCompletedStages(result.completedStages);
            setSelectedAnswer(null);

            if (result.completed) {
                toast.success("Security check completed.");

                await onComplete(challengeToken);
                return;
            }

            if (result.nextQuestion) {
                setQuestion(result.nextQuestion);
            } else {
                setErrorMessage(
                    "The next question could not be loaded. Please restart the challenge.",
                );
            }
        } catch (error: unknown) {
            setErrorMessage(getErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    const canSubmit =
        Boolean(selectedAnswer) &&
        Boolean(challengeToken) &&
        !busy &&
        !hasExpired;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0B1220]/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !busy
                        ) {
                            onClose();
                        }
                    }}
                >
                    <motion.section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="admin-security-title"
                        className="relative max-h-[92dvh] w-full max-w-[520px] overflow-y-auto rounded-t-3xl border border-white/70 bg-white shadow-[0_25px_90px_-25px_rgba(15,23,42,0.45)] sm:rounded-3xl"
                        initial={{
                            opacity: 0,
                            y: 24,
                            scale: 0.98,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: 16,
                            scale: 0.99,
                        }}
                        transition={{
                            duration: 0.25,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#1491FF]">
                                    <ShieldCheck size={21} />
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-[#172033]">
                                        Security verification
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Administrator access
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                disabled={busy}
                                aria-label="Close security verification"
                                className="flex size-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <div className="px-5 py-6 sm:px-7 sm:py-7">
                            <div className="mb-6 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#1491FF]">
                                        Identity protection
                                    </p>

                                    <h2
                                        id="admin-security-title"
                                        className="mt-2 text-xl font-bold tracking-tight text-[#172033] sm:text-2xl"
                                    >
                                        Verify it&apos;s you
                                    </h2>

                                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                        Complete these short checks before
                                        entering the administrator portal.
                                    </p>
                                </div>

                                <div className="hidden size-[62px] shrink-0 items-center justify-center rounded-2xl border border-[#D8EAFE] bg-[#F4F9FF] sm:flex">
                                    <LockKeyhole
                                        size={28}
                                        className="text-[#1491FF]"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="mb-2 flex items-center justify-between text-xs">
                                    <span className="font-semibold text-slate-600">
                                        Verification progress
                                    </span>

                                    <span className="font-bold text-[#172033]">
                                        {Math.min(
                                            completedStages + 1,
                                            totalStages,
                                        )}{" "}
                                        of {totalStages}
                                    </span>
                                </div>

                                <div
                                    className="h-1.5 overflow-hidden rounded-full bg-slate-100"
                                    role="progressbar"
                                    aria-valuemin={0}
                                    aria-valuemax={totalStages}
                                    aria-valuenow={completedStages}
                                    aria-label="Security challenge progress"
                                >
                                    <motion.div
                                        className="h-full rounded-full bg-[#1491FF]"
                                        animate={{
                                            width: `${progress}%`,
                                        }}
                                        transition={{
                                            duration: 0.35,
                                            ease: "easeOut",
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                                <div className="flex items-center gap-2.5">
                                    <Clock3
                                        size={17}
                                        className={
                                            remainingSeconds <= 60
                                                ? "text-rose-500"
                                                : "text-slate-500"
                                        }
                                    />

                                    <span className="text-xs font-medium text-slate-600">
                                        Time remaining
                                    </span>
                                </div>

                                <span
                                    className={[
                                        "font-mono text-sm font-bold",
                                        remainingSeconds <= 60
                                            ? "text-rose-600"
                                            : "text-[#172033]",
                                    ].join(" ")}
                                >
                                    {formatTime(remainingSeconds)}
                                </span>
                            </div>

                            {isStarting ? (
                                <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                                    <LoaderCircle
                                        size={34}
                                        className="animate-spin text-[#1491FF]"
                                    />

                                    <p className="mt-4 text-sm font-semibold text-[#172033]">
                                        Preparing your security check
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        This should only take a moment.
                                    </p>
                                </div>
                            ) : errorMessage && !question ? (
                                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                                    <AlertCircle
                                        size={25}
                                        className="text-rose-600"
                                    />

                                    <p className="mt-3 text-sm font-semibold text-rose-900">
                                        We couldn&apos;t start verification
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-rose-700">
                                        {errorMessage}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => void startChallenge()}
                                        disabled={busy}
                                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1491FF] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0876D1] disabled:opacity-50"
                                    >
                                        <RotateCcw size={15} />
                                        Try again
                                    </button>
                                </div>
                            ) : hasExpired ? (
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                                    <Clock3
                                        size={25}
                                        className="text-amber-600"
                                    />

                                    <p className="mt-3 text-sm font-semibold text-amber-950">
                                        Your verification has expired
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-amber-800">
                                        For your security, start a new
                                        verification to continue signing in.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => void startChallenge()}
                                        disabled={busy}
                                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1491FF] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0876D1]"
                                    >
                                        <RotateCcw size={15} />
                                        Start again
                                    </button>
                                </div>
                            ) : question ? (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={question.stage}
                                        initial={{
                                            opacity: 0,
                                            x: 12,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            x: 0,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            x: -12,
                                        }}
                                        transition={{
                                            duration: 0.2,
                                        }}
                                    >
                                        <div className="mb-5">
                                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                Step {question.stage}
                                            </p>

                                            <h3 className="mt-2 text-lg font-bold text-[#172033]">
                                                {question.title}
                                            </h3>

                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                {question.instruction}
                                            </p>
                                        </div>

                                        {question.type ===
                                            "multiple-choice" &&
                                            question.options && (
                                                <div className="space-y-2.5">
                                                    {question.options.map(
                                                        (option, index) => {
                                                            const selected =
                                                                selectedAnswer ===
                                                                option.id;

                                                            return (
                                                                <button
                                                                    key={option.id}
                                                                    type="button"
                                                                    disabled={busy}
                                                                    onClick={() => {
                                                                        setSelectedAnswer(
                                                                            option.id,
                                                                        );
                                                                        setErrorMessage(
                                                                            null,
                                                                        );
                                                                    }}
                                                                    className={[
                                                                        "group flex w-full items-center gap-3",
                                                                        "rounded-xl border p-3.5 text-left",
                                                                        "transition duration-200",
                                                                        selected
                                                                            ? "border-[#1491FF] bg-[#EAF5FF] ring-2 ring-[#1491FF]/10"
                                                                            : "border-slate-200 bg-white hover:border-[#B9DEFF] hover:bg-slate-50",
                                                                    ].join(" ")}
                                                                >
                                                                    <span
                                                                        className={[
                                                                            "flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition",
                                                                            selected
                                                                                ? "bg-[#1491FF] text-white"
                                                                                : "bg-slate-100 text-slate-500 group-hover:bg-[#EAF5FF] group-hover:text-[#1491FF]",
                                                                        ].join(" ")}
                                                                    >
                                                                        {String.fromCharCode(
                                                                            65 + index,
                                                                        )}
                                                                    </span>

                                                                    <span
                                                                        className={[
                                                                            "flex-1 text-sm leading-5",
                                                                            selected
                                                                                ? "font-semibold text-[#1766A8]"
                                                                                : "font-medium text-slate-700",
                                                                        ].join(" ")}
                                                                    >
                                                                        {
                                                                            option.label
                                                                        }
                                                                    </span>

                                                                    {selected && (
                                                                        <CheckCircle2
                                                                            size={
                                                                                19
                                                                            }
                                                                            className="shrink-0 text-[#1491FF]"
                                                                        />
                                                                    )}
                                                                </button>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            )}

                                        {question.type ===
                                            "visual-match" &&
                                            question.referenceAsset &&
                                            question.imageOptions && (
                                                <div className="space-y-4">
                                                    <div className="rounded-2xl border border-[#D8EAFE] bg-[#F4F9FF] p-4">
                                                        <p className="text-xs font-semibold text-slate-600">
                                                            Reference vehicle
                                                        </p>

                                                        <VehicleSilhouette
                                                            assetId={
                                                                question.referenceAsset
                                                            }
                                                            className="mx-auto mt-2 h-24 w-full max-w-[260px]"
                                                        />
                                                    </div>

                                                    <p className="text-xs font-semibold text-slate-600">
                                                        Select the matching silhouette
                                                    </p>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        {question.imageOptions.map(
                                                            (assetId, index) => {
                                                                const selected =
                                                                    selectedAnswer ===
                                                                    assetId;

                                                                return (
                                                                    <button
                                                                        key={assetId}
                                                                        type="button"
                                                                        disabled={busy}
                                                                        aria-label={`Vehicle option ${index + 1}`}
                                                                        onClick={() => {
                                                                            setSelectedAnswer(
                                                                                assetId,
                                                                            );
                                                                            setErrorMessage(
                                                                                null,
                                                                            );
                                                                        }}
                                                                        className={[
                                                                            "relative rounded-xl border p-2.5 transition duration-200",
                                                                            selected
                                                                                ? "border-[#1491FF] bg-[#EAF5FF] ring-2 ring-[#1491FF]/10"
                                                                                : "border-slate-200 bg-white hover:border-[#B9DEFF] hover:bg-slate-50",
                                                                        ].join(" ")}
                                                                    >
                                                                        <span className="absolute left-2.5 top-2.5 text-[10px] font-bold text-slate-400">
                                                                            {String.fromCharCode(
                                                                                65 + index,
                                                                            )}
                                                                        </span>

                                                                        <VehicleSilhouette
                                                                            assetId={
                                                                                assetId
                                                                            }
                                                                            className="mt-3 h-20 w-full"
                                                                        />

                                                                        {selected && (
                                                                            <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-[#1491FF] text-white">
                                                                                <Check
                                                                                    size={
                                                                                        12
                                                                                    }
                                                                                />
                                                                            </span>
                                                                        )}
                                                                    </button>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                        {errorMessage && (
                                            <div
                                                role="alert"
                                                className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700"
                                            >
                                                <AlertCircle
                                                    size={17}
                                                    className="mt-0.5 shrink-0"
                                                />

                                                <p className="leading-5">
                                                    {errorMessage}
                                                </p>
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                void handleAnswerSubmit()
                                            }
                                            disabled={!canSubmit}
                                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-5 py-3.5 text-sm font-bold text-white shadow-sm shadow-blue-500/15 transition hover:bg-[#0876D1] focus:outline-none focus:ring-4 focus:ring-[#1491FF]/20 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isSubmitting ||
                                            isCompleting ? (
                                                <>
                                                    <LoaderCircle
                                                        size={17}
                                                        className="animate-spin"
                                                    />

                                                    {isCompleting
                                                        ? "Signing you in..."
                                                        : "Checking answer..."}
                                                </>
                                            ) : (
                                                <>
                                                    {completedStages + 1 ===
                                                    totalStages
                                                        ? "Complete verification"
                                                        : "Continue"}

                                                    <ArrowRight
                                                        size={17}
                                                    />
                                                </>
                                            )}
                                        </button>
                                    </motion.div>
                                </AnimatePresence>
                            ) : null}

                            <div className="mt-6 flex items-start gap-2.5 border-t border-slate-100 pt-4">
                                <ShieldCheck
                                    size={16}
                                    className="mt-0.5 shrink-0 text-[#1491FF]"
                                />

                                <p className="text-[11px] leading-5 text-slate-500">
                                    Your answers are verified by the
                                    KARMASS server. This additional check
                                    does not replace your administrator
                                    password or any required multi-factor
                                    authentication.
                                </p>
                            </div>
                        </div>
                    </motion.section>
                </motion.div>
            )}
        </AnimatePresence>
    );
}