"use client";

import {
    useEffect,
    useRef,
} from "react";

import Link from "next/link";

import {
    ArrowRight,
    CheckCircle2,
    LockKeyhole,
    Mail,
    MessageCircle,
    ShieldCheck,
    UserRound,
    X,
} from "lucide-react";

interface ContactDealerModalProps {
    isOpen: boolean;
    onClose: () => void;
    dealerName: string;
    loginHref: string;
    registerHref: string;
    mode: "guest" | "verification";
}

export default function ContactDealerModal({
    isOpen,
    onClose,
    dealerName,
    loginHref,
    registerHref,
    mode,
}: ContactDealerModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        dialogRef.current?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;

            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const isGuest = mode === "guest";

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="contact-dealer-title"
                aria-describedby="contact-dealer-description"
                tabIndex={-1}
                className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[30px] bg-white p-5 shadow-2xl outline-none animate-in slide-in-from-bottom-5 duration-300 sm:rounded-[30px] sm:p-7"
            >
                {/* Mobile drag indicator */}

                <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-gray-200 sm:hidden" />

                {/* Close */}

                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close contact dealer dialog"
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 sm:right-5 sm:top-5"
                >
                    <X size={18} />
                </button>

                {/* Icon */}

                <div className="flex h-[62px] w-[62px] items-center justify-center rounded-[22px] bg-[#EAF5FF] text-[#1491FF]">
                    {isGuest ? (
                        <MessageCircle
                            size={29}
                            strokeWidth={1.8}
                        />
                    ) : (
                        <Mail
                            size={29}
                            strokeWidth={1.8}
                        />
                    )}
                </div>

                {/* Heading */}

                <div className="mt-5 pr-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1491FF]">
                        KARMASS MESSAGING
                    </p>

                    <h2
                        id="contact-dealer-title"
                        className="mt-2 text-2xl font-black tracking-tight text-gray-950"
                    >
                        {isGuest
                            ? "Contact this dealer"
                            : "Verify your email"}
                    </h2>

                    <p
                        id="contact-dealer-description"
                        className="mt-2 text-sm leading-6 text-gray-500"
                    >
                        {isGuest ? (
                            <>
                                Sign in or create a KARMASS account to
                                message{" "}
                                <span className="font-bold text-gray-800">
                                    {dealerName}
                                </span>{" "}
                                directly and discuss their available vehicles.
                            </>
                        ) : (
                            <>
                                Your account needs a verified email address
                                before you can start a conversation with{" "}
                                <span className="font-bold text-gray-800">
                                    {dealerName}
                                </span>
                                .
                            </>
                        )}
                    </p>
                </div>

                {/* Benefits */}

                <div className="mt-6 space-y-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#1491FF] shadow-sm">
                            <ShieldCheck size={16} />
                        </div>

                        <div>
                            <p className="text-xs font-bold text-gray-900">
                                Contact dealers securely
                            </p>

                            <p className="mt-1 text-[11px] leading-5 text-gray-500">
                                Keep your vehicle enquiries and replies
                                inside KARMASS.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#1491FF] shadow-sm">
                            {isGuest ? (
                                <UserRound size={16} />
                            ) : (
                                <CheckCircle2 size={16} />
                            )}
                        </div>

                        <div>
                            <p className="text-xs font-bold text-gray-900">
                                {isGuest
                                    ? "Your account, your conversations"
                                    : "Protect your account"}
                            </p>

                            <p className="mt-1 text-[11px] leading-5 text-gray-500">
                                {isGuest
                                    ? "Return to this dealer after signing in to continue."
                                    : "Email verification helps keep your account secure."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}

                {isGuest ? (
                    <div className="mt-6 space-y-3">
                        <Link
                            href={loginHref}
                            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#1491FF] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200/60 transition hover:bg-[#0877D9] active:scale-[0.98]"
                        >
                            Sign in to contact dealer
                            <ArrowRight size={17} />
                        </Link>

                        <Link
                            href={registerHref}
                            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-800 transition hover:border-blue-200 hover:bg-blue-50 active:scale-[0.98]"
                        >
                            <UserRound size={17} />
                            Create an account
                        </Link>
                    </div>
                ) : (
                    <div className="mt-6">
                        <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3 text-amber-800">
                            <LockKeyhole
                                size={16}
                                className="mt-0.5 shrink-0"
                            />

                            <p className="text-xs leading-5">
                                Verify your email using the verification
                                process available in your account.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-4 flex min-h-[50px] w-full items-center justify-center rounded-2xl bg-[#1491FF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0877D9]"
                        >
                            Close
                        </button>
                    </div>
                )}

                <p className="mt-5 text-center text-[10px] leading-5 text-gray-400">
                    KARMASS · Cars, made easier.
                </p>
            </div>
        </div>
    );
}