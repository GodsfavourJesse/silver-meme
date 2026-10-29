import { apiRequest } from "@/app/lib/api/api-client";

import type {
    MessagingActionResponse,
    MessagingConversationListResponse,
    MessagingMessageListResponse,
    MessagingReadResponse,
    MessagingSendResponse,
} from "@/app/types/user/messaging.types";
import { getUserCsrfToken } from "../auth/csrf.service";

const MESSAGING_ENDPOINT = "/messaging";

function getConversationEndpoint(
    conversationId: string,
): string {
    const id = conversationId.trim();

    if (!id) {
        throw new Error(
            "A conversation ID is required.",
        );
    }

    return (
        `${MESSAGING_ENDPOINT}/conversations/` +
        encodeURIComponent(id)
    );
}

export async function getMessagingConversations(
    options: {
        page?: number;
        limit?: number;
    } = {},
): Promise<MessagingConversationListResponse> {
    const params = new URLSearchParams({
        page: String(options.page ?? 1),
        limit: String(options.limit ?? 20),
    });

    return apiRequest<MessagingConversationListResponse>(
        `${MESSAGING_ENDPOINT}/conversations?${params.toString()}`,
        {
            method: "GET",
        },
    );
}

export async function getConversationMessages(
    conversationId: string,
    options: {
        page?: number;
        limit?: number;
    } = {},
): Promise<MessagingMessageListResponse> {
    const params = new URLSearchParams({
        page: String(options.page ?? 1),
        limit: String(options.limit ?? 50),
    });

    return apiRequest<MessagingMessageListResponse>(
        `${getConversationEndpoint(conversationId)}/messages?${params.toString()}`,
        {
            method: "GET",
        },
    );
}

export async function sendConversationMessage(
    conversationId: string,
    body: string,
): Promise<MessagingSendResponse> {
    const trimmedBody = body.trim();

    if (!trimmedBody) {
        throw new Error(
            "Please enter a message.",
        );
    }

    if (trimmedBody.length > 5000) {
        throw new Error(
            "Messages cannot exceed 5,000 characters.",
        );
    }

    const csrfToken = await getUserCsrfToken();

    return apiRequest<MessagingSendResponse>(
        `${getConversationEndpoint(conversationId)}/messages`,
        {
            method: "POST",
            csrfToken,
            body: {
                body: trimmedBody,
            },
        },
    );
}

export async function markConversationAsRead(
    conversationId: string,
): Promise<MessagingReadResponse> {
    const csrfToken = await getUserCsrfToken();

    return apiRequest<MessagingReadResponse>(
        `${getConversationEndpoint(conversationId)}/read`,
        {
            method: "POST",
            csrfToken,
            body: {},
        },
    );
}

export async function createMessagingConversation(
    otherUserId: string,
): Promise<MessagingActionResponse & {
    data: {
        conversation: {
            id: string;
        };
    };
}> {
    const csrfToken = await getUserCsrfToken();

    return apiRequest(
        `${MESSAGING_ENDPOINT}/conversations`,
        {
            method: "POST",
            csrfToken,
            body: {
                otherUserId,
            },
        },
    );
}