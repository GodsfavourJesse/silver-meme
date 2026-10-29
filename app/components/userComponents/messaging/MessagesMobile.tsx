"use client";

import {
    ArrowLeft,
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

import type { MessagesViewProps } from "./MessagesDesktop";
import { useRouter } from "next/navigation";
import Link from "next/link";

const BRAND = "#1491FF";
const BRAND_HOVER = "#0877D9";
const BRAND_LIGHT = "#EAF5FF";
const BRAND_BORDER = "#B9DEFF";

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
    const participant = getOtherParticipant(conversation, currentUserId);

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
}: {
    participant: MessagingParticipant | null;
    name: string;
}) {
    if (participant?.avatarUrl) {
        return (
            <img
                src={participant.avatarUrl}
                alt=""
                className="h-12 w-12 shrink-0 rounded-[17px] border border-slate-100 object-cover"
                referrerPolicy="no-referrer"
            />
        );
    }

    return (
        <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] border border-[#D7EBFF] bg-[#EAF5FF] text-sm font-bold"
            style={{ color: BRAND }}
        >
            {getInitials(name)}
        </span>
    );
}

/*
 * ============================================================
 * MESSAGES (MOBILE)
 * ============================================================
 */

export function MessagesMobile({
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
    mobileConversationOpen,
    onRefresh,
    onSelect,
    onSend,
    onBrowse,
    onBack,
}: MessagesViewProps) {
    const router = useRouter();

    const otherParticipant = selectedConversation
        ? getOtherParticipant(selectedConversation, currentUserId)
        : null;

    const selectedName = selectedConversation
        ? getConversationName(selectedConversation, currentUserId)
        : "";

    // Keep the existing JSX below.

    /*
     * The parent controls whether the inbox or conversation
     * is visible. Do not manipulate browser history here.
     */
    const showConversation =
        mobileConversationOpen && Boolean(selectedConversationId);

    return (
        <div className="lg:hidden">
            {!showConversation ? (
                /*
                 * ====================================================
                 * CONVERSATION INBOX
                 * ====================================================
                 */
                <section className="min-h-[calc(100dvh-5rem)] bg-white">
                    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-5 pb-5 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur-xl">
                        <div className="flex items-center justify-between gap-3">
                            {/* Back button + KARMASS brand */}
                            <div className="flex min-w-0 items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    aria-label="Go back to previous page"
                                    className="
                                        flex h-9 w-9 shrink-0 items-center justify-center
                                        border border-[#E6EDF5] bg-white
                                        text-slate-600
                                        transition-all duration-200
                                        hover:border-[#B9DEFF] hover:text-[#1491FF]
                                        active:scale-95
                                    "
                                >
                                    <ArrowLeft size={19} strokeWidth={1.8} />
                                </button>

                                <Link
                                    href="/dashboard"
                                    aria-label="KARMASS dashboard"
                                    className="group flex min-w-0 items-center gap-2.5"
                                >
                                    {/* New minimalist brand monogram */}
                                    <span
                                        className="
                                            flex h-9 w-9 shrink-0 items-center justify-center
                                            border border-[#E6EDF5] bg-white
                                            text-[15px] font-semibold tracking-[-0.08em]
                                            text-[#1491FF]
                                            transition-colors duration-200
                                            group-hover:border-[#1491FF]
                                        "
                                    >
                                        K.
                                    </span>

                                    {/* Wordmark + tagline */}
                                    <span className="min-w-0">
                                        <span
                                            className="
                                                block text-[14px] font-semibold leading-5
                                                tracking-[0.14em] text-[#20201F]
                                            "
                                        >
                                            KARMASS
                                        </span>

                                        <span
                                            className="
                                                mt-0.5 block text-[8px] font-medium
                                                uppercase tracking-[0.14em] text-[#85838A]
                                            "
                                        >
                                            Find your drive
                                        </span>
                                    </span>
                                </Link>
                            </div>

                            {/* Refresh conversations */}
                            <button
                                type="button"
                                onClick={onRefresh}
                                disabled={loadingConversations}
                                aria-label="Refresh conversations"
                                className="
                                    flex h-10 w-10 shrink-0 items-center justify-center
                                    border border-[#E6EDF5] bg-white text-slate-600
                                    transition-all duration-200
                                    hover:border-[#B9DEFF] hover:bg-[#F5FAFF]
                                    hover:text-[#1491FF]
                                    active:scale-95
                                    disabled:cursor-not-allowed disabled:opacity-50
                                "
                            >
                                <RefreshCw
                                    size={17}
                                    className={loadingConversations ? "animate-spin" : ""}
                                />
                            </button>
                        </div>

                        <div className="mt-5">
                            <h1 className="text-[25px] font-semibold tracking-[-0.05em] text-slate-950">
                                Messages
                            </h1>

                            <p className="mt-1.5 text-[12px] leading-5 text-slate-500">
                                Stay connected with sellers and support.
                            </p>
                        </div>

                        {totalUnread > 0 && (
                            <div
                                className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold"
                                style={{
                                    backgroundColor: BRAND_LIGHT,
                                    color: BRAND_HOVER,
                                }}
                            >
                                <span
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ backgroundColor: BRAND }}
                                />

                                {totalUnread} unread{" "}
                                {totalUnread === 1 ? "message" : "messages"}
                            </div>
                        )}
                    </header>

                    <div className="px-4 pb-8 pt-3">
                        {loadingConversations &&
                        conversations.length === 0 ? (
                            /*
                             * Loading skeleton
                             */
                            <div className="space-y-2">
                                {Array.from({ length: 6 }).map(
                                    (_, index) => (
                                        <div
                                            key={index}
                                            className="flex animate-pulse gap-3 rounded-2xl p-3"
                                        >
                                            <div className="h-12 w-12 rounded-[17px] bg-slate-100" />

                                            <div className="flex-1 space-y-2 pt-1">
                                                <div className="h-3 w-28 rounded-full bg-slate-100" />

                                                <div className="h-3 w-full rounded-full bg-slate-100" />

                                                <div className="h-2.5 w-16 rounded-full bg-slate-100" />
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        ) : conversations.length === 0 ? (
                            /*
                             * Empty state
                             */
                            <div className="flex min-h-[55dvh] flex-col items-center justify-center px-6 text-center">
                                <div
                                    className="flex h-[68px] w-[68px] items-center justify-center rounded-[24px] border border-[#D7EBFF]"
                                    style={{
                                        backgroundColor: BRAND_LIGHT,
                                        color: BRAND,
                                    }}
                                >
                                    <MessageCircle
                                        size={28}
                                        strokeWidth={1.6}
                                    />
                                </div>

                                <h2 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">
                                    Nothing here yet
                                </h2>

                                <p className="mt-2 max-w-[270px] text-sm leading-6 text-slate-500">
                                    When you contact a seller or our support
                                    team, your conversations will appear here.
                                </p>

                                <button
                                    type="button"
                                    onClick={onBrowse}
                                    className="mt-6 h-12 rounded-2xl px-5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98]"
                                    style={{ backgroundColor: BRAND }}
                                    onMouseEnter={(event) => {
                                        event.currentTarget.style.backgroundColor =
                                            BRAND_HOVER;
                                    }}
                                    onMouseLeave={(event) => {
                                        event.currentTarget.style.backgroundColor =
                                            BRAND;
                                    }}
                                >
                                    Explore vehicles
                                </button>
                            </div>
                        ) : (
                            /*
                             * Conversation list
                             */
                            <div className="space-y-1">
                                {conversations.map((conversation) => {
                                    const name = getConversationName(
                                        conversation,
                                        currentUserId,
                                    );

                                    const participant = getOtherParticipant(
                                        conversation,
                                        currentUserId,
                                    );

                                    const unread =
                                        conversation.unreadCount > 0;

                                    return (
                                        <button
                                            key={conversation.id}
                                            type="button"
                                            onClick={() =>
                                                onSelect(conversation.id)
                                            }
                                            className="flex w-full items-center gap-3 rounded-[20px] px-2.5 py-4 text-left transition hover:bg-slate-50 active:bg-slate-100"
                                        >
                                            <span className="relative shrink-0">
                                                <Avatar
                                                    participant={participant}
                                                    name={name}
                                                />

                                                {conversation.type ===
                                                    "SUPPORT" && (
                                                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-100 text-emerald-700">
                                                        <ShieldCheck
                                                            size={11}
                                                        />
                                                    </span>
                                                )}
                                            </span>

                                            <span className="min-w-0 flex-1 border-b border-slate-100 pb-4">
                                                <span className="flex items-center justify-between gap-3">
                                                    <span
                                                        className={[
                                                            "truncate text-[14px]",
                                                            unread
                                                                ? "font-bold text-slate-950"
                                                                : "font-semibold text-slate-800",
                                                        ].join(" ")}
                                                    >
                                                        {name}
                                                    </span>

                                                    <span className="shrink-0 text-[10px] text-slate-400">
                                                        {formatDate(
                                                            conversation.updatedAt,
                                                        )}
                                                    </span>
                                                </span>

                                                <span
                                                    className={[
                                                        "mt-1.5 block truncate text-[12px] leading-5",
                                                        unread
                                                            ? "font-medium text-slate-700"
                                                            : "text-slate-500",
                                                    ].join(" ")}
                                                >
                                                    {conversation.lastMessage
                                                        ?.body ??
                                                        "Start a conversation"}
                                                </span>

                                                <span className="mt-2 flex items-center justify-between">
                                                    <span
                                                        className={[
                                                            "text-[10px] font-medium",
                                                            conversation.type ===
                                                            "SUPPORT"
                                                                ? "text-emerald-700"
                                                                : "text-slate-400",
                                                        ].join(" ")}
                                                    >
                                                        {conversation.type ===
                                                        "SUPPORT"
                                                            ? "KARMASS Support"
                                                            : "Marketplace"}
                                                    </span>

                                                    {unread && (
                                                        <span
                                                            className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold text-white"
                                                            style={{
                                                                backgroundColor:
                                                                    BRAND,
                                                            }}
                                                        >
                                                            {conversation.unreadCount >
                                                            99
                                                                ? "99+"
                                                                : conversation.unreadCount}
                                                        </span>
                                                    )}
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {conversations.length > 0 && (
                            <div className="mt-6 flex items-start gap-2 rounded-2xl bg-slate-50 px-3.5 py-3.5">
                                <ShieldCheck
                                    size={16}
                                    className="mt-0.5 shrink-0 text-emerald-600"
                                />

                                <p className="text-[11px] leading-5 text-slate-500">
                                    Keep your conversations on KARMASS and
                                    verify vehicle details before sending
                                    payment.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            ) : (
                /*
                 * ====================================================
                 * SELECTED CONVERSATION
                 * ====================================================
                 */
                <section className="flex h-[calc(100dvh-4.5rem)] min-h-[450px] flex-col overflow-hidden bg-white">
                    {selectedConversation && (
                        <>
                            <header className="z-20 flex shrink-0 items-center gap-3 border-b border-slate-100 bg-white px-3.5 py-3">
                                <button
                                    type="button"
                                    onClick={onBack}
                                    aria-label="Back to conversations"
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-50 active:bg-slate-100"
                                >
                                    <ArrowLeft size={21} />
                                </button>

                                <Avatar
                                    participant={otherParticipant}
                                    name={selectedName}
                                />

                                <div className="min-w-0 flex-1">
                                    <h2 className="truncate text-[14px] font-semibold text-slate-950">
                                        {selectedName}
                                    </h2>

                                    <p className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                                        {selectedConversation.type ===
                                        "SUPPORT" ? (
                                            <>
                                                <ShieldCheck
                                                    size={12}
                                                    className="text-emerald-600"
                                                />

                                                KARMASS Support
                                            </>
                                        ) : (
                                            <>
                                                <span
                                                    className="h-1.5 w-1.5 rounded-full"
                                                    style={{
                                                        backgroundColor: BRAND,
                                                    }}
                                                />

                                                Marketplace conversation
                                            </>
                                        )}
                                    </p>
                                </div>
                            </header>

                            {/* Messages */}
                            <div
                                className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#FCFDFF] px-3.5 py-5"
                                aria-label="Conversation messages"
                                aria-live="polite"
                            >
                                <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-end">
                                    {loadingMessages ? (
                                        <div className="space-y-4 py-8">
                                            <div className="h-14 w-3/4 animate-pulse rounded-2xl bg-slate-100" />

                                            <div
                                                className="ml-auto h-14 w-2/3 animate-pulse rounded-2xl"
                                                style={{
                                                    backgroundColor:
                                                        BRAND_LIGHT,
                                                }}
                                            />

                                            <div className="h-20 w-4/5 animate-pulse rounded-2xl bg-slate-100" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                                            <div
                                                className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D7EBFF] shadow-sm"
                                                style={{
                                                    backgroundColor: BRAND_LIGHT,
                                                    color: BRAND,
                                                }}
                                            >
                                                <MessageCircle size={24} />
                                            </div>

                                            <h3 className="mt-4 text-sm font-semibold text-slate-900">
                                                Start the conversation
                                            </h3>

                                            <p className="mt-1 max-w-[240px] text-xs leading-5 text-slate-500">
                                                Send a message to get the
                                                conversation going.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {messages.map((message) => {
                                                const own =
                                                    currentUserId !== null &&
                                                    message.senderId ===
                                                        currentUserId;

                                                return (
                                                    <article
                                                        key={message.id}
                                                        className={`flex ${
                                                            own
                                                                ? "justify-end"
                                                                : "justify-start"
                                                        }`}
                                                    >
                                                        <div className="max-w-[86%]">
                                                            <div
                                                                className={[
                                                                    "rounded-[19px] px-3.5 py-3",
                                                                    own
                                                                        ? "rounded-br-md text-white"
                                                                        : "rounded-bl-md border border-slate-100 bg-white text-slate-800 shadow-[0_2px_8px_rgba(15,23,42,0.025)]",
                                                                ].join(" ")}
                                                                style={
                                                                    own
                                                                        ? {
                                                                              backgroundColor:
                                                                                  BRAND,
                                                                          }
                                                                        : undefined
                                                                }
                                                            >
                                                                <p className="whitespace-pre-wrap break-words text-[13px] leading-[1.75]">
                                                                    {message.body}
                                                                </p>
                                                            </div>

                                                            <div
                                                                className={`mt-1 flex items-center gap-1.5 px-1 text-[10px] text-slate-400 ${
                                                                    own
                                                                        ? "justify-end"
                                                                        : ""
                                                                }`}
                                                            >
                                                                <span>
                                                                    {formatMessageTime(
                                                                        message.createdAt,
                                                                    )}
                                                                </span>

                                                                {own && (
                                                                    <CheckCheck
                                                                        size={12}
                                                                        style={{
                                                                            color: BRAND,
                                                                        }}
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
                            <div
                                className="shrink-0 border-t border-slate-100 bg-white px-3 py-3"
                                style={{
                                    paddingBottom:
                                        "max(12px, env(safe-area-inset-bottom))",
                                }}
                            >
                                <form onSubmit={onSend}>
                                    <div
                                        className="flex items-end gap-2 rounded-[22px] border bg-white p-1.5 transition focus-within:ring-4"
                                        style={{
                                            borderColor: draft.trim()
                                                ? BRAND_BORDER
                                                : "#E2E8F0",
                                        }}
                                    >
                                        <label
                                            htmlFor="mobile-message-draft"
                                            className="sr-only"
                                        >
                                            Write a message
                                        </label>

                                        <textarea
                                            id="mobile-message-draft"
                                            value={draft}
                                            onChange={(event) =>
                                                setDraft(event.target.value)
                                            }
                                            onKeyDown={(event) => {
                                                if (
                                                    event.key === "Enter" &&
                                                    !event.shiftKey &&
                                                    !event.nativeEvent
                                                        .isComposing
                                                ) {
                                                    event.preventDefault();

                                                    event.currentTarget.form?.requestSubmit();
                                                }
                                            }}
                                            rows={1}
                                            maxLength={5000}
                                            placeholder="Write a message..."
                                            disabled={sending}
                                            className="max-h-32 min-h-[42px] flex-1 resize-none bg-transparent px-2.5 py-2.5 text-[13px] leading-5 text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                                        />

                                        <button
                                            type="submit"
                                            disabled={
                                                sending ||
                                                !draft.trim() ||
                                                draft.trim().length > 5000
                                            }
                                            aria-label="Send message"
                                            className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] text-white shadow-sm transition hover:brightness-95 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                                            style={{
                                                backgroundColor:
                                                    sending || !draft.trim()
                                                        ? undefined
                                                        : BRAND,
                                            }}
                                        >
                                            <Send size={17} />
                                        </button>
                                    </div>

                                    <p className="mt-2 px-2 text-[10px] text-slate-400">
                                        Keep your conversations safe on KARMASS.
                                    </p>
                                </form>
                            </div>
                        </>
                    )}
                </section>
            )}
        </div>
    );
}