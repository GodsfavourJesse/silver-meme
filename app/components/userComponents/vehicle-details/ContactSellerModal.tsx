"use client";

import { motion, useReducedMotion } from "framer-motion";

import {
    CheckCircle2,
    LoaderCircle,
    MessageCircle,
    Send,
} from "lucide-react";

import type {
    ContactSellerState,
} from "@/app/hooks/user/vehicle/useContactSeller";

import {
    formatNaira,
} from "@/app/lib/user/vehicle/vehicle-details-format";

import { ModalShell } from "./ModalShell";
import { SignInLink } from "../Desktop/SignInLink";

interface ContactSellerModalProps {
    title: string;
    price: string | number;
    contact: ContactSellerState;
    onClose: () => void;
}

export function ContactSellerModal({
    title,
    price,
    contact,
    onClose,
}: ContactSellerModalProps) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <ModalShell
            titleId="contact-seller-title"
            eyebrow="Buyer enquiry"
            eyebrowClassName="text-[#1491FF]"
            title="Contact seller"
            description="Send the seller a message about this vehicle."
            closeLabel="Close contact form"
            onClose={onClose}
        >
            {/* Vehicle summary */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-[#1491FF]">
                        <MessageCircle size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-slate-500">
                            Your enquiry
                        </p>

                        <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-slate-900">
                            {title}
                        </p>

                        <p className="mt-1 text-sm font-bold text-[#1491FF]">
                            {formatNaira(price)}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={contact.submit} className="mt-5">
                {/* Message */}
                <div>
                    <div className="flex items-center justify-between gap-2">
                        <label
                            htmlFor="seller-message"
                            className="text-sm font-semibold text-slate-800"
                        >
                            Your message
                        </label>

                        <span className="text-[11px] text-slate-400">
                            Optional
                        </span>
                    </div>

                    <textarea
                        id="seller-message"
                        value={contact.message}
                        onChange={(event) =>
                            contact.setMessage(event.target.value)
                        }
                        maxLength={5000}
                        rows={5}
                        placeholder="Hello, I'm interested in this vehicle. Is it still available?"
                        className="mt-2 min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#1491FF] focus:ring-4 focus:ring-blue-50"
                    />

                    <p className="mt-1.5 text-right text-[11px] text-slate-400">
                        {contact.message.length.toLocaleString()}/5,000
                    </p>
                </div>

                {/* Error */}
                {contact.error && (
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
                        <p className="text-xs leading-5 text-red-700 sm:text-sm">
                            {contact.error}
                        </p>

                        <SignInLink message={contact.error} />
                    </motion.div>
                )}

                {/* Success */}
                {contact.success && (
                    <motion.div
                        initial={
                            shouldReduceMotion
                                ? false
                                : { opacity: 0, y: 8 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        role="status"
                        className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle2
                                size={18}
                                className="shrink-0 text-emerald-600"
                            />

                            <p className="text-sm font-semibold text-emerald-800">
                                Conversation started
                            </p>
                        </div>

                        <p className="mt-2 text-xs leading-5 text-emerald-700 sm:text-sm">
                            {contact.success}
                        </p>

                        <p className="mt-2 text-xs leading-5 text-emerald-700/80">
                            You can continue your discussion with the seller
                            through KARMASS messaging.
                        </p>
                    </motion.div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={contact.loading}
                    className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#087FE5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {contact.loading ? (
                        <>
                            <LoaderCircle
                                size={18}
                                className="animate-spin"
                            />
                            Opening conversation...
                        </>
                    ) : (
                        <>
                            <Send size={17} />
                            Start conversation
                        </>
                    )}
                </button>

                <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                    Your enquiry will be sent privately to the seller.
                </p>
            </form>
        </ModalShell>
    );
}