"use client";

import type { FormEvent } from "react";
import {
    ArrowUpRight,
    CheckCheck,
    MessageCircle,
    RefreshCw,
    Send,
    ShieldCheck,
} from "lucide-react";

import type {
    MessagingConversation,
    MessagingMessage,
    MessagingParticipant,
} from "@/app/types/user/messaging.types";

const BRAND = "#1491FF";
const BRAND_HOVER = "#0877D9";
const BRAND_LIGHT = "#EAF5FF";
const BRAND_BORDER = "#B9DEFF";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

export interface MessagesViewProps {
    conversations: MessagingConversation[];
    messages: MessagingMessage[];
    selectedConversation: MessagingConversation | null;
    selectedConversationId: string | null;
    currentUserId: string | null;
    draft: string;
    setDraft: (value: string) => void;
    loadingConversations: boolean;
    loadingMessages: boolean;
    sending: boolean;
    totalUnread: number;

    onRefresh: () => void;
    onSelect: (conversationId: string) => void;
    onSend: (event: FormEvent<HTMLFormElement>) => void;
    onBrowse: () => void;

    mobileConversationOpen: boolean;
    onBack: () => void;
}

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function getOtherParticipant(
    conversation: MessagingConversation,
    currentUserId: string | null,
): MessagingParticipant | null {
    if (!currentUserId) {
        return conversation.participants[0] ?? null;
    }

    return (
        conversation.participants.find(
            (participant) => participant.userId !== currentUserId,
        ) ?? null
    );
}

function getConversationName(
    conversation: MessagingConversation,
    currentUserId: string | null,
): string {
    const participant = getOtherParticipant(
        conversation,
        currentUserId,
    );

    if (!participant) {
        return conversation.type === "SUPPORT"
            ? "KARMASS Support"
            : "Conversation";
    }

    const name = [
        participant.firstName,
        participant.lastName,
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    return (
        name ||
        (conversation.type === "SUPPORT"
            ? "KARMASS Support"
            : "KARMASS User")
    );
}

function getInitials(name: string): string {
    return (
        name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "K"
    );
}

function formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const now = new Date();

    const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    return new Intl.DateTimeFormat("en-NG", {
        ...(isToday
            ? { hour: "2-digit", minute: "2-digit" }
            : { day: "numeric", month: "short" }),
    }).format(date);
}

function formatMessageTime(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

/*
 * ============================================================
 * AVATAR
 * ============================================================
 */

function Avatar({
    participant,
    name,
    size = "md",
}: {
    participant: MessagingParticipant | null;
    name: string;
    size?: "sm" | "md" | "lg";
}) {
    const dimensions = {
        sm: "h-9 w-9 rounded-xl",
        md: "h-11 w-11 rounded-[15px]",
        lg: "h-12 w-12 rounded-2xl",
    }[size];

    if (participant?.avatarUrl) {
        return (
            <img
                src={participant.avatarUrl}
                alt=""
                className={`${dimensions} shrink-0 border border-slate-100 object-cover`}
                referrerPolicy="no-referrer"
            />
        );
    }

    return (
        <span
            className={`${dimensions} flex shrink-0 items-center justify-center border border-[#D7EBFF] bg-[#EAF5FF] text-sm font-bold`}
            style={{ color: BRAND }}
            aria-hidden="true"
        >
            {getInitials(name)}
        </span>
    );
}

/*
 * ============================================================
 * EMPTY CHAT
 * ============================================================
 */

function EmptyChat({ onBrowse }: { onBrowse: () => void }) {
    return (
        <div className="flex h-full min-h-[460px] flex-col items-center justify-center px-8 text-center">
            <div
                className="flex h-[72px] w-[72px] items-center justify-center rounded-[25px] border border-[#D7EBFF] bg-[#EAF5FF]"
                style={{ color: BRAND }}
            >
                <MessageCircle size={30} strokeWidth={1.7} />
            </div>

            <h3 className="mt-6 text-lg font-bold tracking-tight text-slate-900">
                Your conversations, in one place
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Choose a conversation to continue chatting, or find a
                vehicle and connect with its seller.
            </p>

            <button
                type="button"
                onClick={onBrowse}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-lg shadow-blue-200/60 transition hover:-translate-y-0.5 active:translate-y-0"
                style={{ backgroundColor: BRAND }}
                onMouseEnter={(event) => {
                    event.currentTarget.style.backgroundColor = BRAND_HOVER;
                }}
                onMouseLeave={(event) => {
                    event.currentTarget.style.backgroundColor = BRAND;
                }}
            >
                Explore vehicles
                <ArrowUpRight size={16} />
            </button>
        </div>
    );
}

/*
 * ============================================================
 * MESSAGES DESKTOP
 * ============================================================
 */

export function MessagesDesktop({
    conversations,
    messages,
    selectedConversation,
    selectedConversationId,
    currentUserId,
    draft,
    setDraft,
    loadingConversations,
    loadingMessages,
    sending,
    totalUnread,
    onRefresh,
    onSelect,
    onSend,
    onBrowse,
}: MessagesViewProps) {
    const otherParticipant = selectedConversation
        ? getOtherParticipant(selectedConversation, currentUserId)
        : null;

    const selectedName = selectedConversation
        ? getConversationName(selectedConversation, currentUserId)
        : "";

    return (
        <div className="hidden lg:block p-6">
            {/* Page heading */}
            <div className="mb-7 flex items-end justify-between gap-6">
                <div>
                    <p
                        className="mb-2 text-xs font-bold uppercase tracking-[0.2em]"
                        style={{ color: BRAND }}
                    >
                        KARMASS / Inbox
                    </p>

                    <h1 className="text-[34px] font-bold tracking-[-0.045em] text-slate-950">
                        Messages
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Your conversations with sellers and our support team.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={loadingConversations}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-[#B9DEFF] hover:bg-[#F5FAFF] hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw
                        size={15}
                        className={
                            loadingConversations ? "animate-spin" : ""
                        }
                    />
                    Refresh
                </button>
            </div>

            {/* Main inbox */}
            <section className="grid h-[min(760px,calc(100dvh-210px))] min-h-[570px] grid-cols-[340px_minmax(0,1fr)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_12px_50px_rgba(15,23,42,0.045)]">
                {/* Conversation sidebar */}
                <aside className="flex min-h-0 flex-col border-r border-slate-100 bg-white">
                    <div className="border-b border-slate-100 px-5 py-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900">
                                    All conversations
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    {conversations.length} conversations
                                </p>
                            </div>

                            {totalUnread > 0 && (
                                <span
                                    className="rounded-lg px-2.5 py-1.5 text-xs font-bold"
                                    style={{
                                        backgroundColor: BRAND_LIGHT,
                                        color: BRAND_HOVER,
                                    }}
                                >
                                    {totalUnread} unread
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
                        {loadingConversations && conversations.length === 0 ? (
                            <div className="space-y-3 p-2">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="flex animate-pulse gap-3 p-3"
                                    >
                                        <div className="h-11 w-11 rounded-[15px] bg-slate-100" />

                                        <div className="flex-1 space-y-2 pt-1">
                                            <div className="h-3 w-28 rounded bg-slate-100" />
                                            <div className="h-3 w-full rounded bg-slate-100" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                                    style={{
                                        backgroundColor: BRAND_LIGHT,
                                        color: BRAND,
                                    }}
                                >
                                    <MessageCircle size={25} />
                                </div>

                                <p className="mt-4 text-sm font-bold text-slate-800">
                                    No messages yet
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Contact a seller from a vehicle listing
                                    to get started.
                                </p>

                                <button
                                    type="button"
                                    onClick={onBrowse}
                                    className="mt-4 text-sm font-bold transition hover:underline"
                                    style={{ color: BRAND }}
                                >
                                    Browse vehicles
                                </button>
                            </div>
                        ) : (
                            conversations.map((conversation) => {
                                const name = getConversationName(
                                    conversation,
                                    currentUserId,
                                );

                                const participant = getOtherParticipant(
                                    conversation,
                                    currentUserId,
                                );

                                const active =
                                    conversation.id === selectedConversationId;

                                const unread = conversation.unreadCount > 0;

                                return (
                                    <button
                                        key={conversation.id}
                                        type="button"
                                        onClick={() => onSelect(conversation.id)}
                                        aria-current={active ? "true" : undefined}
                                        className={[
                                            "mb-1 flex w-full items-start gap-3 rounded-[17px] border p-3.5 text-left transition duration-200",
                                            active
                                                ? "border-[#B9DEFF] bg-[#F0F8FF] shadow-sm"
                                                : "border-transparent hover:border-slate-100 hover:bg-slate-50",
                                        ].join(" ")}
                                    >
                                        <Avatar
                                            participant={participant}
                                            name={name}
                                        />

                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-center justify-between gap-2">
                                                <span
                                                    className={[
                                                        "truncate text-[13px]",
                                                        unread
                                                            ? "font-bold text-slate-950"
                                                            : "font-semibold text-slate-800",
                                                    ].join(" ")}
                                                >
                                                    {name}
                                                </span>

                                                <span className="shrink-0 text-[10px] text-slate-400">
                                                    {formatDate(conversation.updatedAt)}
                                                </span>
                                            </span>

                                            <span
                                                className={[
                                                    "mt-1.5 block truncate text-xs leading-5",
                                                    unread
                                                        ? "font-medium text-slate-700"
                                                        : "text-slate-500",
                                                ].join(" ")}
                                            >
                                                {conversation.lastMessage?.body ??
                                                    "Start a conversation"}
                                            </span>

                                            <span className="mt-2.5 flex items-center justify-between">
                                                <span
                                                    className={[
                                                        "text-[10px] font-semibold",
                                                        conversation.type === "SUPPORT"
                                                            ? "text-emerald-700"
                                                            : "text-slate-400",
                                                    ].join(" ")}
                                                >
                                                    {conversation.type === "SUPPORT"
                                                        ? "KARMASS Support"
                                                        : "Marketplace"}
                                                </span>

                                                {unread && (
                                                    <span
                                                        className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white"
                                                        style={{ backgroundColor: BRAND }}
                                                    >
                                                        {conversation.unreadCount > 99
                                                            ? "99+"
                                                            : conversation.unreadCount}
                                                    </span>
                                                )}
                                            </span>
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-3.5">
                        <ShieldCheck
                            size={15}
                            className="shrink-0 text-emerald-600"
                        />

                        <p className="text-[11px] text-slate-500">
                            Keep transactions and conversations safe.
                        </p>
                    </div>
                </aside>

                {/* Active conversation */}
                <section className="flex min-h-0 min-w-0 flex-col bg-white">
                    {!selectedConversation ? (
                        <EmptyChat onBrowse={onBrowse} />
                    ) : (
                        <>
                            {/* Conversation header */}
                            <header className="flex items-center gap-3 border-b border-slate-100 bg-white px-6 py-4">
                                <Avatar
                                    participant={otherParticipant}
                                    name={selectedName}
                                    size="lg"
                                />

                                <div className="min-w-0 flex-1">
                                    <h2 className="truncate text-sm font-bold text-slate-950">
                                        {selectedName}
                                    </h2>

                                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                        {selectedConversation.type === "SUPPORT" ? (
                                            <>
                                                <ShieldCheck
                                                    size={13}
                                                    className="text-emerald-600"
                                                />
                                                KARMASS Support
                                            </>
                                        ) : (
                                            <>
                                                <span
                                                    className="h-1.5 w-1.5 rounded-full"
                                                    style={{ backgroundColor: BRAND }}
                                                />
                                                Marketplace conversation
                                            </>
                                        )}
                                    </p>
                                </div>

                                {selectedConversation.type === "SUPPORT" && (
                                    <span className="rounded-lg bg-emerald-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                                        Verified support
                                    </span>
                                )}
                            </header>

                            {/* Messages */}
                            <div
                                className="min-h-0 flex-1 overflow-y-auto bg-[#FCFDFF] px-7 py-6"
                                aria-label="Conversation messages"
                                aria-live="polite"
                            >
                                <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-end">
                                    {loadingMessages ? (
                                        <div className="space-y-5 py-10">
                                            <div className="h-14 w-2/3 animate-pulse rounded-2xl bg-slate-100" />

                                            <div
                                                className="ml-auto h-14 w-1/2 animate-pulse rounded-2xl"
                                                style={{ backgroundColor: BRAND_LIGHT }}
                                            />

                                            <div className="h-20 w-3/4 animate-pulse rounded-2xl bg-slate-100" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="py-14 text-center">
                                            <div
                                                className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl"
                                                style={{
                                                    backgroundColor: BRAND_LIGHT,
                                                    color: BRAND,
                                                }}
                                            >
                                                <MessageCircle size={22} />
                                            </div>

                                            <p className="mt-4 text-sm font-bold text-slate-800">
                                                Start the conversation
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Send a message to get things moving.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-5">
                                            {messages.map((message) => {
                                                const own =
                                                    currentUserId !== null &&
                                                    message.senderId === currentUserId;

                                                return (
                                                    <article
                                                        key={message.id}
                                                        className={`flex ${
                                                            own
                                                                ? "justify-end"
                                                                : "justify-start"
                                                        }`}
                                                    >
                                                        <div className="max-w-[72%]">
                                                            <div
                                                                className={[
                                                                    "rounded-[20px] px-4 py-3.5 shadow-sm",
                                                                    own
                                                                        ? "rounded-br-md text-white"
                                                                        : "rounded-bl-md border border-slate-100 bg-white text-slate-800",
                                                                ].join(" ")}
                                                                style={
                                                                    own
                                                                        ? { backgroundColor: BRAND }
                                                                        : undefined
                                                                }
                                                            >
                                                                <p className="whitespace-pre-wrap break-words text-[13px] leading-6">
                                                                    {message.body}
                                                                </p>
                                                            </div>

                                                            <div
                                                                className={`mt-1.5 flex items-center gap-1.5 px-1 text-[10px] text-slate-400 ${
                                                                    own ? "justify-end" : ""
                                                                }`}
                                                            >
                                                                <span>
                                                                    {formatMessageTime(message.createdAt)}
                                                                </span>

                                                                {own && (
                                                                    <CheckCheck
                                                                        size={13}
                                                                        style={{ color: BRAND }}
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </article>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Message composer */}
                            <div className="border-t border-slate-100 bg-white p-5">
                                <form
                                    onSubmit={onSend}
                                    className="mx-auto max-w-3xl"
                                >
                                    <div
                                        className="rounded-[18px] border bg-white transition focus-within:ring-4 focus-within:ring-blue-50"
                                        style={{
                                            borderColor: draft.trim()
                                                ? BRAND_BORDER
                                                : "#E2E8F0",
                                            boxShadow: "none",
                                        }}
                                    >
                                        <label
                                            htmlFor="desktop-message-draft"
                                            className="sr-only"
                                        >
                                            Write a message
                                        </label>

                                        <textarea
                                            id="desktop-message-draft"
                                            value={draft}
                                            onChange={(event) =>
                                                setDraft(event.target.value)
                                            }
                                            onKeyDown={(event) => {
                                                if (
                                                    event.key === "Enter" &&
                                                    !event.shiftKey &&
                                                    !event.nativeEvent.isComposing
                                                ) {
                                                    event.preventDefault();
                                                    event.currentTarget.form?.requestSubmit();
                                                }
                                            }}
                                            rows={2}
                                            maxLength={5000}
                                            placeholder="Write a message..."
                                            disabled={sending}
                                            className="max-h-36 min-h-[58px] w-full resize-y bg-transparent px-4 pt-4 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                                        />

                                        <div className="flex items-center justify-between gap-3 px-3 pb-3">
                                            <span className="pl-1 text-[10px] text-slate-400">
                                                Enter to send · Shift + Enter for a new line
                                            </span>

                                            <button
                                                type="submit"
                                                disabled={
                                                    sending ||
                                                    !draft.trim() ||
                                                    draft.trim().length > 5000
                                                }
                                                className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:brightness-95 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                                                style={{
                                                    backgroundColor:
                                                        sending || !draft.trim()
                                                            ? undefined
                                                            : BRAND,
                                                }}
                                            >
                                                <Send size={15} />
                                                {sending ? "Sending..." : "Send"}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </>
                    )}
                </section>
            </section>

            {/* Safety notice */}
            <div className="mt-4 flex items-center gap-2 px-1 text-xs leading-5 text-slate-500">
                <ShieldCheck
                    size={15}
                    className="shrink-0 text-emerald-600"
                />

                Verify the vehicle and seller independently before making payment.
            </div>
        </div>
    );
}