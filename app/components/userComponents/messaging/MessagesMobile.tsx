"use client";

import type { MessagesViewProps } from "./MessagesDesktop";
import { ArrowLeft, CheckCheck, MessageCircle, RefreshCw, Send, ShieldCheck } from "lucide-react";

function displayName(conversation: MessagesViewProps["conversations"][number], userId: string | null) {
    const person = conversation.participants.find((participant) => participant.userId !== userId) ?? conversation.participants[0];
    return [person?.firstName, person?.lastName].filter(Boolean).join(" ") || (conversation.type === "SUPPORT" ? "KARMASS Support" : "Conversation");
}

function shortTime(value?: string) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-NG", { hour: "2-digit", minute: "2-digit" }).format(date);
}

export function MessagesMobile(props: MessagesViewProps) {
    const {
        conversations, messages, selectedConversation, selectedConversationId,
        currentUserId, draft, setDraft, loadingConversations, loadingMessages,
        sending, totalUnread, peerLastReadAt, mobileConversationOpen,
        onRefresh, onSelect, onSend, onBrowse, onBack,
    } = props;
    const openChat = mobileConversationOpen && Boolean(selectedConversationId);

    return (
        <section className="flex h-[calc(100dvh-2rem)] min-h-[520px] flex-col bg-white lg:hidden">
            {!openChat ? (
                <>
                    <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-4">
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-950">Messages</h1>
                            <p className="mt-0.5 text-xs text-slate-500">{totalUnread ? `${totalUnread} unread` : "Your conversations"}</p>
                        </div>
                        <button type="button" onClick={onRefresh} disabled={loadingConversations} aria-label="Refresh messages" className="grid size-10 place-items-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-50">
                            <RefreshCw size={18} className={loadingConversations ? "animate-spin" : ""} />
                        </button>
                    </header>

                    <div className="min-h-0 flex-1 overflow-y-auto">
                        {loadingConversations && conversations.length === 0 ? (
                            <div className="space-y-1 p-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="flex animate-pulse gap-3 rounded-xl p-3"><div className="size-12 rounded-full bg-slate-100" /><div className="flex-1 space-y-2 py-1"><div className="h-3 w-1/3 rounded bg-slate-100" /><div className="h-3 w-4/5 rounded bg-slate-100" /></div></div>)}</div>
                        ) : conversations.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                                <MessageCircle className="text-slate-300" size={34} />
                                <h2 className="mt-4 text-base font-semibold text-slate-800">No conversations yet</h2>
                                <p className="mt-1 text-sm text-slate-500">Contact a seller from a vehicle listing to start a chat.</p>
                                <button type="button" onClick={onBrowse} className="mt-4 rounded-lg bg-[#0B5CAD] px-4 py-2.5 text-sm font-semibold text-white">Browse vehicles</button>
                            </div>
                        ) : conversations.map((conversation) => {
                            const name = displayName(conversation, currentUserId);
                            const person = conversation.participants.find((participant) => participant.userId !== currentUserId) ?? conversation.participants[0];
                            const unread = conversation.unreadCount > 0;
                            return (
                                <button key={conversation.id} type="button" onClick={() => onSelect(conversation.id)} className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition hover:bg-slate-50">
                                    {person?.avatarUrl ? <img src={person.avatarUrl} alt="" className="size-12 shrink-0 rounded-full object-cover" /> : <span className="grid size-12 shrink-0 place-items-center rounded-full bg-blue-50 text-sm font-bold text-[#0B5CAD]">{name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span>}
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-center justify-between gap-2">
                                            <span className={`truncate text-sm ${unread ? "font-bold text-slate-950" : "font-semibold text-slate-800"}`}>{name}</span>
                                            <span className="shrink-0 text-[10px] text-slate-400">{shortTime(conversation.lastMessage?.createdAt ?? conversation.updatedAt)}</span>
                                        </span>
                                        {conversation.listing && <span className="mt-0.5 block truncate text-[10px] font-semibold text-[#0B5CAD]">Vehicle · {conversation.listing.title}</span>}
                                        <span className={`mt-1 block truncate text-xs ${unread ? "font-medium text-slate-700" : "text-slate-500"}`}>{conversation.lastMessage?.body ?? "Start a conversation"}</span>
                                    </span>
                                    {unread && <span className="grid min-w-5 place-items-center rounded-full bg-[#0B5CAD] px-1.5 py-1 text-[10px] font-bold text-white">{conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}</span>}
                                </button>
                            );
                        })}
                    </div>
                </>
            ) : selectedConversation ? (
                <>
                    <header className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-3 py-2.5">
                        <button type="button" onClick={onBack} aria-label="Back to messages" className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-slate-100"><ArrowLeft size={20} /></button>
                        {(() => {
                            const person = selectedConversation.participants.find((participant) => participant.userId !== currentUserId) ?? selectedConversation.participants[0];
                            const name = displayName(selectedConversation, currentUserId);
                            return <>
                                {person?.avatarUrl ? <img src={person.avatarUrl} alt="" className="size-10 rounded-full object-cover" /> : <span className="grid size-10 place-items-center rounded-full bg-blue-50 text-xs font-bold text-[#0B5CAD]">{name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span>}
                                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-900">{name}</span><span className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">{selectedConversation.type === "SUPPORT" ? <><ShieldCheck size={11} className="text-emerald-600" /> KARMASS Support</> : "KARMASS messages"}</span></span>
                            </>;
                        })()}
                    </header>

                    {selectedConversation.listing && <a href={`/marketplace/${selectedConversation.listing.id}`} className="flex shrink-0 items-center gap-2.5 border-b border-slate-100 bg-slate-50 px-3 py-2.5">
                        {selectedConversation.listing.imageUrl ? <img src={selectedConversation.listing.imageUrl} alt="" className="h-11 w-14 rounded-md object-cover" /> : <span className="h-11 w-14 rounded-md bg-slate-200" />}
                        <span className="min-w-0 flex-1"><span className="block text-[9px] font-bold uppercase tracking-wide text-[#0B5CAD]">Vehicle in this chat</span><span className="block truncate text-xs font-semibold text-slate-800">{selectedConversation.listing.title}</span><span className="block truncate text-[10px] text-slate-500">{selectedConversation.listing.price} {selectedConversation.listing.currency} · {selectedConversation.listing.location || "Location unavailable"}</span></span>
                    </a>}

                    <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F8FA] px-3 py-4" aria-label="Conversation messages" aria-live="polite">
                        {loadingMessages ? <div className="space-y-3"><div className="h-12 w-3/4 animate-pulse rounded-2xl bg-white" /><div className="ml-auto h-12 w-2/3 animate-pulse rounded-2xl bg-blue-100" /></div> : messages.length === 0 ? <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">Send a message to start this conversation.</div> : <div className="mx-auto flex max-w-2xl flex-col gap-2.5">{messages.map((message) => {
                            const own = message.senderId === currentUserId;
                            const seen = Boolean(peerLastReadAt && Date.parse(peerLastReadAt) >= Date.parse(message.createdAt));
                            return <div key={message.id} className={`flex ${own ? "justify-end" : "justify-start"}`}><div className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 shadow-sm ${own ? "rounded-br-md bg-[#0B5CAD] text-white" : "rounded-bl-md bg-white text-slate-800"}`}><p className="whitespace-pre-wrap break-words text-[13px] leading-5">{message.body}</p><div className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${own ? "text-blue-100" : "text-slate-400"}`}><span>{shortTime(message.createdAt)}</span>{own && <CheckCheck size={12} aria-label={seen ? "Seen" : "Sent"} className={seen ? "text-sky-200" : "text-blue-200"} />}</div></div></div>;
                        })}</div>}
                    </div>

                    <form onSubmit={onSend} className="flex shrink-0 items-end gap-2 border-t border-slate-100 bg-white px-3 py-2.5" style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}>
                        <label htmlFor="mobile-message-draft" className="sr-only">Write a message</label>
                        <textarea id="mobile-message-draft" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} rows={1} maxLength={5000} placeholder="Message" disabled={sending} className="max-h-28 min-h-11 flex-1 resize-none rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0B5CAD] focus:bg-white" />
                        <button type="submit" disabled={sending || !draft.trim()} aria-label="Send message" className="grid size-11 shrink-0 place-items-center rounded-full bg-[#0B5CAD] text-white transition hover:bg-[#084A8A] disabled:bg-slate-200 disabled:text-slate-400"><Send size={17} /></button>
                    </form>
                </>
            ) : <div className="flex flex-1 items-center justify-center text-sm text-slate-500">Loading conversation…</div>}
        </section>
    );
}
