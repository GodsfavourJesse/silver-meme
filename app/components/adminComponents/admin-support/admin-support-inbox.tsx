"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { LifeBuoy, Mail, MessageCircle, RefreshCw, Send, ShieldCheck } from "lucide-react";
import { getAdminSupportRequests, replyToSupportRequest } from "@/app/services/user/support/support.service";
import type { SupportRequest } from "@/app/types/user/support.types";

export function AdminSupportInbox() {
    const [requests, setRequests] = useState<SupportRequest[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [reply, setReply] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const selected = requests.find((item) => item.id === selectedId) ?? null;

    const refresh = useCallback(async () => {
        try {
            const items = await getAdminSupportRequests();
            setRequests(items);
            setSelectedId((current) => current ?? items[0]?.id ?? null);
        } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load support inbox."); }
    }, []);
    useEffect(() => { void refresh(); const interval = window.setInterval(() => void refresh(), 20000); return () => window.clearInterval(interval); }, [refresh]);

    async function sendReply(event: FormEvent<HTMLFormElement>) {
        event.preventDefault(); if (!selected || !reply.trim()) return;
        setBusy(true); setError("");
        try { await replyToSupportRequest(selected.id, reply); setReply(""); await refresh(); }
        catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to send your reply."); }
        finally { setBusy(false); }
    }

    return <main className="min-h-[calc(100dvh-76px)] bg-[#F4F7FB] p-4 sm:p-7 lg:p-9">
        <div className="mx-auto max-w-[1500px]">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#0B4F86]">Customer care</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Support inbox</h1><p className="mt-2 text-sm text-slate-500">Review customer questions and reply in their support thread.</p></div><button onClick={() => void refresh()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw size={14}/>Refresh</button></div>
            {error && <p role="alert" className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <div className="grid min-h-[650px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[360px_minmax(0,1fr)]">
                <aside className="border-b border-slate-200 lg:border-b-0 lg:border-r"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><p className="text-sm font-bold text-slate-900">Requests</p><p className="mt-0.5 text-xs text-slate-400">{requests.length} recent</p></div><span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-[#0B4F86]"><LifeBuoy size={18}/></span></div><div className="max-h-[360px] overflow-y-auto lg:max-h-[calc(100dvh-255px)]">{requests.map((item) => <button key={item.id} onClick={() => setSelectedId(item.id)} className={`w-full border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 ${selectedId === item.id ? "bg-blue-50/70" : ""}`}><div className="flex items-start justify-between gap-2"><span className="line-clamp-1 text-sm font-bold text-slate-900">{item.subject}</span><span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-700">{item.status.replace("_", " ")}</span></div><p className="mt-1 text-xs text-slate-500">{item.name} · {item.email}</p><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{item.messages.at(-1)?.body}</p><p className="mt-2 text-[10px] text-slate-400">{new Date(item.updatedAt).toLocaleString()}</p></button>)}{requests.length === 0 && <div className="p-6 text-center text-sm text-slate-500">No requests yet.</div>}</div></aside>
                <section className="flex min-h-[520px] flex-col">{selected ? <><header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-7"><div className="min-w-0"><h2 className="truncate font-bold text-slate-900">{selected.subject}</h2><p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500"><span>{selected.name}</span><span aria-hidden="true">·</span><a className="inline-flex items-center gap-1 text-[#0B4F86] hover:underline" href={`mailto:${selected.email}`}><Mail size={12}/>{selected.email}</a></p></div><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700"><ShieldCheck size={13}/>Private support thread</span></header><div className="flex-1 space-y-4 overflow-y-auto bg-[#F8FAFC] p-5 sm:p-7">{selected.messages.map((message, index) => <div key={`${selected.id}-${index}`} className={`flex ${message.author === "support" ? "justify-end" : "justify-start"}`}><article className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${message.author === "support" ? "rounded-br-md bg-[#0B4F86] text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800"}`}><p className={`mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide ${message.author === "support" ? "text-blue-100" : "text-slate-400"}`}>{message.author === "support" ? <><ShieldCheck size={12}/>KARMASS support</> : <><MessageCircle size={12}/>{selected.name}</>}</p><p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p><p className={`mt-2 text-right text-[10px] ${message.author === "support" ? "text-blue-100/70" : "text-slate-400"}`}>{new Date(message.createdAt).toLocaleString()}</p></article></div>)}</div><form onSubmit={sendReply} className="border-t border-slate-200 p-4 sm:p-5"><label className="sr-only" htmlFor="support-reply">Write a reply</label><div className="flex items-end gap-3"><textarea id="support-reply" rows={3} maxLength={5000} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write a helpful reply…" className="min-h-12 flex-1 resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0B4F86] focus:ring-4 focus:ring-blue-50"/><button disabled={!reply.trim() || busy} className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-[#0B4F86] px-4 text-sm font-bold text-white transition hover:bg-[#083C67] disabled:opacity-50"><Send size={15}/><span className="hidden sm:inline">{busy ? "Sending…" : "Send reply"}</span></button></div><p className="mt-2 text-[10px] text-slate-400">Replies appear in the customer’s support page automatically.</p></form></> : <div className="flex flex-1 flex-col items-center justify-center p-8 text-center"><span className="grid size-14 place-items-center rounded-2xl bg-blue-50 text-[#0B4F86]"><MessageCircle size={24}/></span><h2 className="mt-4 text-base font-bold">Choose a support request</h2><p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">Select a conversation to read the request and send a reply.</p></div>}</section>
            </div>
        </div>
    </main>;
}
