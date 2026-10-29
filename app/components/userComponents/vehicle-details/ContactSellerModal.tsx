import { ContactSellerState } from "@/app/hooks/user/vehicle/useContactSeller";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { formatNaira } from "@/app/lib/user/vehicle/vehicle-details-format";
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
    return (
        <ModalShell
            titleId="contact-seller-title"
            eyebrow="Buyer enquiry"
            eyebrowClassName="text-violet-700"
            title="Contact seller"
            description="Start a private KARMASS conversation about this vehicle."
            closeLabel="Close contact form"
            onClose={onClose}
        >
            <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Enquiry about</p>

                <p className="mt-1 font-semibold text-slate-950">{title}</p>

                <p className="mt-1 text-sm font-bold text-violet-800">
                    {formatNaira(price)}
                </p>
            </div>

            <form onSubmit={contact.submit} className="mt-5">
                <label
                    htmlFor="seller-message"
                    className="block text-sm font-semibold text-slate-800"
                >
                    Message the seller
                    <span className="ml-1 font-normal text-slate-400">
                        (optional)
                    </span>
                </label>

                <textarea
                    id="seller-message"
                    value={contact.message}
                    onChange={(event) => contact.setMessage(event.target.value)}
                    maxLength={5000}
                    rows={5}
                    placeholder="Hello, I am interested in this vehicle. Is it still available?"
                    className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                    {contact.message.length}/5000
                </p>

                {contact.error && (
                    <p
                        role="alert"
                        className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800"
                    >
                        {contact.error}

                        <SignInLink message={contact.error} />
                    </p>
                )}

                {contact.success && (
                    <div
                        role="status"
                        className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                    >
                        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                            <CheckCircle2 size={17} />
                            Conversation started
                        </p>

                        <p className="mt-2 text-sm leading-6 text-emerald-800">
                            {contact.success}
                        </p>

                        <p className="mt-2 text-xs leading-5 text-emerald-700">
                            The conversation has been created through KARMASS
                            messaging. Your account&apos;s messaging interface
                            can be used to continue the discussion.
                        </p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={contact.loading}
                    className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {contact.loading ? (
                        <LoaderCircle size={18} className="animate-spin" />
                    ) : (
                        <Send size={17} />
                    )}

                    {contact.loading
                        ? "Opening conversation..."
                        : "Start conversation"}
                </button>
            </form>
        </ModalShell>
    );
}