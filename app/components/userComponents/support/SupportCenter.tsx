"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, Clock3, LifeBuoy, LockKeyhole, MessageCircle, Send, ShieldCheck } from "lucide-react";
import { useAuth } from "@/app/hooks/user/auth/useAuth";
import { createSupportRequest, getMySupportRequests, getSupportRequest, sendSupportMessage } from "@/app/services/user/support/support.service";
import type { SupportRequest, SupportRequestAccess } from "@/app/types/user/support.types";

const STORAGE_KEY = "karmass-support-access-v1";
const helpTopics = [
    { title: "Buying a vehicle", text: "Questions about contacting a seller, vehicle details, or arranging a viewing?" },
    { title: "Selling on KARMASS", text: "Get help with your listing, photos, review, or seller account." },
    { title: "Payments and plans", text: "Need help with a payment, subscription, listing credits, or a receipt?" },
];

function statusLabel(status: SupportRequest["status"]) {
    return status === "IN_PROGRESS" ? "Support replied" : status === "OPEN" ? "Waiting for support" : status;
}

export function SupportCenter({ compact = false }: { compact?: boolean }) {
    const { user } = useAuth();
    const [requests, setRequests] = useState<SupportRequest[]>([]);
    const [accesses, setAccesses] = useState<SupportRequestAccess[]>([]);
    const [replies, setReplies] = useState<Record<string, string>>({});
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(true);

    useEffect(() => {
        if (user) setForm((current) => ({ ...current, name: current.name || `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(), email: current.email || user.email || "" }));
    }, [user]);

    const refresh = useCallback(async (showLoader = false) => {
        if (showLoader) {
            setLoading(true);
        }

        const found: SupportRequest[] = [];

        try {
            const saved = typeof window !== "undefined"
                ? JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as SupportRequestAccess[]
                : [];

            setAccesses(saved);

            if (user) {
                found.push(...await getMySupportRequests());
            } else if (typeof window !== "undefined") {
                const loaded = await Promise.all(
                    saved.slice(0, 10).map((access) =>
                        getSupportRequest(access)
                            .then((result) => result.data.request)
                            .catch(() => null)
                    )
                );

                found.push(
                    ...loaded.filter(
                        (item): item is SupportRequest => item !== null
                    )
                );
            }

            setRequests(
                found.sort(
                    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
                )
            );

        } catch (reason) {
            if (showLoader) {
                setError(
                    reason instanceof Error
                        ? reason.message
                        : "Unable to load your support requests."
                );
            } else {
                console.error("Background support refresh failed:", reason);
            }
        } finally {
            if (showLoader) {
                setLoading(false);
            }
        }
    }, [user]);

    // Initial Loading
    useEffect(() => { 
        void refresh(true); 
    }, [refresh]);

    // Silent background refresh
    useEffect(() => {
        const timer = window.setInterval(() => { 
            void refresh(false); 
        }, 15000);
        return () => window.clearInterval(timer);
    }, [refresh]);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault(); 
        setError(""); 
        setNotice(""); 
        setSending(true);

        try {
            const access = await createSupportRequest(form);
            const previous = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            ) as SupportRequestAccess[];

            const nextAccesses = [
                access, ...previous.filter(
                    (entry) => entry.id !== access.id
                )
            ].slice(0, 10);

            localStorage.setItem(
                STORAGE_KEY, JSON.stringify(nextAccesses)
            );

            setAccesses(nextAccesses);

            setForm((current) => ({ 
                ...current, 
                subject: "", 
                message: "" 
            }));

            setShowForm(false);

            setNotice(
                `Request received. Reference: 
                    ${
                        access.id.slice(0, 8).toUpperCase()
                    }. Keep this browser to see support replies.
                `
            );

            await refresh(false);
        } catch (reason) { 
            setError(
                reason instanceof Error 
                    ? reason.message 
                    : "Unable to send your message. Please try again."
            ); 
        }
        finally { setSending(false); }
    }

    async function submitReply(requestId: string) {
        const access = accesses.find((entry) => entry.id === requestId);
        const message = replies[requestId]?.trim();
        if (!access || !message || replyingTo) return;
        setError(""); setReplyingTo(requestId);
        try { await sendSupportMessage(access, message); setReplies((current) => ({ ...current, [requestId]: "" })); await refresh(); }
        catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to send your reply."); }
        finally { setReplyingTo(null); }
    }

    return (
        <main className={`${compact ? "min-h-0 p-4 sm:p-6" : "min-h-dvh px-4 pb-28 pt-10 sm:px-8 sm:pb-14 sm:pt-14"} bg-[#F4F7FB] text-slate-900`}>
            <div className="mx-auto max-w-6xl">

                {!showForm && (
                    <button
                        type="button"
                        onClick={() => {
                            setShowForm(true);
                            setError("");
                            setNotice("");
                        }}
                        className="fixed right-5 top-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#0877D9] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_30px_rgba(8,119,217,0.3)] transition-all hover:-translate-y-0.5 hover:bg-[#076BC5] hover:shadow-xl"
                    >
                        <span className="text-lg leading-none">+</span>
                        New Support Request
                    </button>
                )}

                {!compact && <div className="mb-8 flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-[#E8F3FF] text-[#0877D9]"><LifeBuoy size={24}/></span><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#0877D9]">KARMASS care</p><h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">How can we help?</h1></div></div>}
                {!compact && <p className="mb-8 max-w-2xl text-sm leading-6 text-slate-600">Get help from our team with buying, selling, your account, or a payment. Send us a message and we’ll reply here.</p>}
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,.8fr)]">
                    {showForm && (
                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                            <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#0877D9]"><MessageCircle size={19}/></span><div><h2 className="text-lg font-bold">Send a message</h2><p className="mt-1 text-sm text-slate-500">Our team will follow up in this support thread.</p></div></div>
                            <form onSubmit={submit} className="mt-6 space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-700">Your name<input required minLength={2} maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#1491FF] focus:ring-4 focus:ring-blue-50" placeholder="Name"/></label><label className="text-xs font-semibold text-slate-700">Email address<input required type="email" maxLength={254} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#1491FF] focus:ring-4 focus:ring-blue-50" placeholder="you@example.com"/></label></div>
                                <label className="block text-xs font-semibold text-slate-700">What do you need help with?<input required minLength={5} maxLength={150} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#1491FF] focus:ring-4 focus:ring-blue-50" placeholder="e.g. Help with my vehicle listing"/></label>
                                <label className="block text-xs font-semibold text-slate-700">Message<textarea required minLength={10} maxLength={5000} rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm leading-6 outline-none focus:border-[#1491FF] focus:ring-4 focus:ring-blue-50" placeholder="Tell us a little more so we can help..."/></label>
                                {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}{notice && <p role="status" className="rounded-xl bg-emerald-50 px-3 py-2 text-sm leading-5 text-emerald-800">{notice}</p>}
                                <button disabled={sending} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0877D9] via-[#1491FF] to-[#0877D9] px-5 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition hover:brightness-95 disabled:opacity-60"><Send size={16}/>{sending ? "Sending..." : "Send to support"}</button>
                            </form>
                            <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400"><LockKeyhole size={12}/> Your details are only used to respond to your request.</p>
                        </section>
                    )}
                    <div className="space-y-6">
                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-base font-bold">Your support requests</h2><p className="mt-1 text-xs text-slate-500">Replies appear here automatically.</p></div><span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><ShieldCheck size={18}/></span></div>
                            {loading ? <p className="mt-5 text-sm text-slate-400">Loading your requests…</p> : requests.length === 0 ? <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">You don’t have any support conversations yet. Send us a message and we’ll take it from there.</p> : <div className="mt-4 space-y-3">{requests.map((request) => <article key={request.id} className="rounded-2xl border border-slate-100 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-bold">{request.subject}</p><p className="mt-1 text-[11px] text-slate-400">Ref. {request.id.slice(0, 8).toUpperCase()}</p></div><span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-[#0877D9]">{statusLabel(request.status)}</span></div><div className="mt-3 space-y-2">{request.messages.slice(-3).map((message, index) => <div key={`${request.id}-${index}`} className={`rounded-xl p-3 text-xs leading-5 ${message.author === "support" ? "bg-blue-50 text-slate-700" : "bg-slate-50 text-slate-600"}`}><p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{message.author === "support" ? "KARMASS support" : "You"}</p>{message.body}</div>)}</div>{accesses.some((entry) => entry.id === request.id) && request.status !== "CLOSED" && <div className="mt-3 flex items-end gap-2"><label className="sr-only" htmlFor={`reply-${request.id}`}>Reply to support</label><textarea id={`reply-${request.id}`} rows={2} maxLength={5000} value={replies[request.id] || ""} onChange={(event) => setReplies((current) => ({ ...current, [request.id]: event.target.value }))} placeholder="Reply to support…" className="min-h-10 min-w-0 flex-1 resize-y rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#1491FF] focus:ring-4 focus:ring-blue-50"/><button type="button" disabled={!replies[request.id]?.trim() || replyingTo === request.id} onClick={() => void submitReply(request.id)} aria-label="Send reply" className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#0877D9] text-white disabled:opacity-50"><Send size={15}/></button></div>}<p className="mt-3 flex items-center gap-1 text-[10px] text-slate-400"><Clock3 size={11}/>{new Date(request.updatedAt).toLocaleString()}</p></article>)}</div>}
                        </section>
                        {!compact && <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-base font-bold">Popular help topics</h2><div className="mt-3 divide-y divide-slate-100">{helpTopics.map((topic) => <div key={topic.title} className="py-3"><p className="text-sm font-semibold text-slate-800">{topic.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{topic.text}</p></div>)}</div></section>}
                    </div>
                </div>
                {!compact && <a href="mailto:support@karmass.com" className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0877D9]">Prefer email? Contact support@karmass.com <ArrowUpRight size={13}/></a>}
            </div>
        </main>
    );
}
