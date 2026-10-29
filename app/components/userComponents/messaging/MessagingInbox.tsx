"use client";

import {
    type FormEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { ApiError } from "@/app/lib/api/api-error";
import { getSafeReturnTo } from "@/app/lib/user/auth/safe-redirect";
import { useAuth } from "@/app/hooks/user/auth/useAuth";

import {
    getMessagingConversations,
    getConversationMessages,
    markConversationAsRead,
    sendConversationMessage,
} from "@/app/services/user/messaging/messaging.service";

import type {
    MessagingConversation,
    MessagingMessage,
} from "@/app/types/user/messaging.types";

import { MessagesDesktop } from "./MessagesDesktop";
import { MessagesMobile } from "./MessagesMobile";

const MAX_MESSAGE_LENGTH = 5000;

function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        switch (error.status) {
            case 401:
                return "Your session has expired. Please sign in again.";

            case 403:
                return "You do not have permission to access this conversation.";

            case 404:
                return "This conversation could not be found.";

            case 429:
                return "You're sending requests too quickly. Please try again shortly.";

            default:
                if (error.status >= 500) {
                    return "The messaging service is temporarily unavailable.";
                }
        }
    }

    return error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
}

function isAuthenticationError(error: unknown): boolean {
    return error instanceof ApiError && error.status === 401;
}

function getConversationReturnPath(
    conversationId: string | null,
): string {
    if (!conversationId) {
        return "/dashboard/messages";
    }

    const params = new URLSearchParams();
    params.set("conversationId", conversationId);

    return `/dashboard/messages?${params.toString()}`;
}

export function MessagesInbox() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { user } = useAuth();

    const currentUserId = user?.id ?? null;

    const requestedConversationId =
        searchParams.get("conversationId");

    const [conversations, setConversations] =
        useState<MessagingConversation[]>([]);

    const [messages, setMessages] =
        useState<MessagingMessage[]>([]);

    const [selectedConversationId, setSelectedConversationId] =
        useState<string | null>(requestedConversationId);

    const [draft, setDraft] = useState("");

    const [loadingConversations, setLoadingConversations] =
        useState(true);

    const [loadingMessages, setLoadingMessages] =
        useState(false);

    const [sending, setSending] = useState(false);

    const [mobileConversationOpen, setMobileConversationOpen] =
        useState(Boolean(requestedConversationId));

    const messagesRequestId = useRef(0);
    const redirectingToLogin = useRef(false);

    const selectedConversation = useMemo(
        () =>
            conversations.find(
                (conversation) =>
                    conversation.id === selectedConversationId,
            ) ?? null,
        [conversations, selectedConversationId],
    );

    const totalUnread = useMemo(
        () =>
            conversations.reduce(
                (total, conversation) =>
                    total + Math.max(0, conversation.unreadCount),
                0,
            ),
        [conversations],
    );

    /*
     * AUTHENTICATION
     */

    const redirectToLogin = useCallback(
        (conversationId: string | null) => {
            if (redirectingToLogin.current) {
                return;
            }

            redirectingToLogin.current = true;

            const returnTo = getSafeReturnTo(
                getConversationReturnPath(conversationId),
            );

            router.replace(
                `/login?next=${encodeURIComponent(returnTo)}`,
            );
        },
        [router],
    );

    /*
     * LOAD CONVERSATIONS
     *
     * Returns true when loading succeeds.
     * Errors are shown through toast notifications.
     */

    const loadConversations = useCallback(
        async (
            preferredId?: string | null,
        ): Promise<boolean> => {
            setLoadingConversations(true);

            try {
                const response = await getMessagingConversations({
                    page: 1,
                    limit: 50,
                });

                const items = response.data.conversations;

                setConversations(items);

                const preferred =
                    preferredId ?? requestedConversationId;

                if (
                    preferred &&
                    items.some(
                        (conversation) =>
                            conversation.id === preferred,
                    )
                ) {
                    setSelectedConversationId(preferred);
                } else {
                    setSelectedConversationId((current) => {
                        if (
                            current &&
                            items.some(
                                (conversation) =>
                                    conversation.id === current,
                            )
                        ) {
                            return current;
                        }

                        return items[0]?.id ?? null;
                    });
                }

                return true;
            } catch (error) {
                if (isAuthenticationError(error)) {
                    redirectToLogin(
                        selectedConversationId ??
                        requestedConversationId,
                    );

                    return false;
                }

                toast.error(getErrorMessage(error));

                return false;
            } finally {
                setLoadingConversations(false);
            }
        },
        [
            redirectToLogin,
            requestedConversationId,
            selectedConversationId,
        ],
    );

    useEffect(() => {
        void loadConversations(requestedConversationId);
    }, [loadConversations, requestedConversationId]);

    /*
     * KEEP THE URL AND SELECTED CONVERSATION IN SYNC
     */

    useEffect(() => {
        if (!requestedConversationId) {
            return;
        }

        setSelectedConversationId(requestedConversationId);
        setMobileConversationOpen(true);
    }, [requestedConversationId]);

    /*
     * LOAD MESSAGES FOR THE SELECTED CONVERSATION
     */

    useEffect(() => {
        const selectedId = selectedConversationId;
        const requestId = ++messagesRequestId.current;

        let cancelled = false;

        if (!selectedId) {
            setMessages([]);
            setLoadingMessages(false);
            return;
        }

        // TypeScript now knows selectedId is a string.
        const conversationId: string = selectedId;

        async function loadMessages() {
            setLoadingMessages(true);
            setMessages([]);

            try {
                const response = await getConversationMessages(
                    conversationId,
                    {
                        page: 1,
                        limit: 100,
                    },
                );

                if (
                    cancelled ||
                    requestId !== messagesRequestId.current
                ) {
                    return;
                }

                setMessages(response.data.messages);

                try {
                    await markConversationAsRead(conversationId);

                    if (
                        !cancelled &&
                        requestId === messagesRequestId.current
                    ) {
                        setConversations((current) =>
                            current.map((conversation) =>
                                conversation.id === conversationId
                                    ? {
                                        ...conversation,
                                        unreadCount: 0,
                                    }
                                    : conversation,
                            ),
                        );
                    }
                } catch (error) {
                    if (isAuthenticationError(error)) {
                        redirectToLogin(conversationId);
                    }

                    // The messages are already loaded.
                    // Don't interrupt the user if marking as read fails.
                }
            } catch (error) {
                if (
                    cancelled ||
                    requestId !== messagesRequestId.current
                ) {
                    return;
                }

                if (isAuthenticationError(error)) {
                    redirectToLogin(conversationId);
                    return;
                }

                toast.error(getErrorMessage(error));
            } finally {
                if (
                    !cancelled &&
                    requestId === messagesRequestId.current
                ) {
                    setLoadingMessages(false);
                }
            }
        }

        void loadMessages();

        return () => {
            cancelled = true;
        };
    }, [redirectToLogin, selectedConversationId]);


    /*
     * REFRESH CONVERSATIONS
     */

    const handleRefresh = useCallback(async () => {
        const succeeded = await loadConversations(
            selectedConversationId,
        );

        if (succeeded) {
            toast.success("Conversations refreshed.");
        }
    }, [loadConversations, selectedConversationId]);

    /*
     * SELECT A CONVERSATION
     */

    const handleSelectConversation = useCallback(
        (conversationId: string) => {
            setSelectedConversationId(conversationId);
            setMobileConversationOpen(true);
            setDraft("");

            const params = new URLSearchParams(
                searchParams.toString(),
            );

            params.set("conversationId", conversationId);

            router.replace(`/dashboard/messages?${params.toString()}`, {
                scroll: false,
            });
        },
        [router, searchParams],
    );

    /*
     * MOBILE BACK BUTTON
     */

    const handleMobileBack = useCallback(() => {
        setMobileConversationOpen(false);

        const params = new URLSearchParams(
            searchParams.toString(),
        );

        params.delete("conversationId");

        const query = params.toString();

        router.replace(
            query ? `/dashboard/messages?${query}` : "/dashboard/messages",
            { scroll: false },
        );
    }, [router, searchParams]);

    /*
     * SEND A MESSAGE
     */

    const handleSendMessage = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            if (
                !selectedConversationId ||
                !draft.trim() ||
                sending
            ) {
                return;
            }

            const body = draft.trim();

            if (body.length > MAX_MESSAGE_LENGTH) {
                toast.error(
                    "Messages cannot exceed 5,000 characters.",
                );

                return;
            }

            setSending(true);

            try {
                const response = await sendConversationMessage(
                    selectedConversationId,
                    body,
                );

                const sentMessage = response.data.message;

                setMessages((current) => {
                    if (
                        current.some(
                            (message) =>
                                message.id === sentMessage.id,
                        )
                    ) {
                        return current;
                    }

                    return [...current, sentMessage];
                });

                setDraft("");

                setConversations((current) =>
                    current.map((conversation) =>
                        conversation.id === selectedConversationId
                            ? {
                                ...conversation,
                                lastMessage: {
                                    id: sentMessage.id,
                                    senderId: sentMessage.senderId,
                                    body: sentMessage.body,
                                    createdAt: sentMessage.createdAt,
                                },
                                updatedAt: sentMessage.createdAt,
                            }
                            : conversation,
                    ),
                );

                toast.success("Message sent successfully.");

                // Refresh conversation previews without displaying
                // an additional success toast.
                void loadConversations(selectedConversationId);
            } catch (error) {
                if (isAuthenticationError(error)) {
                    redirectToLogin(selectedConversationId);
                    return;
                }

                toast.error(getErrorMessage(error));
            } finally {
                setSending(false);
            }
        },
        [
            draft,
            loadConversations,
            redirectToLogin,
            selectedConversationId,
            sending,
        ],
    );

    const handleBack = useCallback(() => {
        setMobileConversationOpen(false);

        const params = new URLSearchParams(searchParams.toString());
        params.delete("conversationId");

        const queryString = params.toString();
        const nextUrl = queryString
            ? `/dashboard/messages?${queryString}`
            : "/dashboard/messages";

        router.replace(nextUrl, { scroll: false });
    }, [router, searchParams]);


    /*
     * RENDER
     */

    return (
        <main className="min-h-[100dvh] bg-slate-50 text-slate-900">
            {/* Page background and responsive spacing */}
            <div className="mx-auto min-h-[100dvh] w-full max-w-[1800px] px-3 py-4 sm:px-5 sm:py-6 lg:px-7 lg:py-7 xl:px-9">
                {/* Desktop messaging */}
                <section
                    aria-label="Messages inbox"
                    className="hidden min-h-[calc(100dvh-3.5rem)] overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_45px_rgba(15,23,42,0.06)] lg:block"
                >
                    <MessagesDesktop
                        conversations={conversations}
                        messages={messages}
                        selectedConversation={selectedConversation}
                        selectedConversationId={selectedConversationId}
                        currentUserId={currentUserId}
                        draft={draft}
                        setDraft={setDraft}
                        loadingConversations={loadingConversations}
                        loadingMessages={loadingMessages}
                        sending={sending}
                        totalUnread={totalUnread}
                        mobileConversationOpen={mobileConversationOpen}
                        onBack={handleBack}
                        onRefresh={handleRefresh}
                        onSelect={handleSelectConversation}
                        onSend={handleSendMessage}
                        onBrowse={() => router.push("/marketplace")}
                    />
                </section>

                {/* Mobile messaging */}
                <section
                    aria-label="Messages inbox"
                    className="min-h-[calc(100dvh-2rem)] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:min-h-[calc(100dvh-3rem)] sm:rounded-3xl lg:hidden"
                >
                    <MessagesMobile
                        conversations={conversations}
                        messages={messages}
                        selectedConversation={selectedConversation}
                        selectedConversationId={selectedConversationId}
                        currentUserId={currentUserId}
                        draft={draft}
                        setDraft={setDraft}
                        loadingConversations={loadingConversations}
                        loadingMessages={loadingMessages}
                        sending={sending}
                        totalUnread={totalUnread}
                        mobileConversationOpen={mobileConversationOpen}
                        onRefresh={handleRefresh}
                        onSelect={handleSelectConversation}
                        onSend={handleSendMessage}
                        onBrowse={() => router.push("/marketplace")}
                        onBack={handleMobileBack}
                    />
                </section>
            </div>
        </main>
    );
}