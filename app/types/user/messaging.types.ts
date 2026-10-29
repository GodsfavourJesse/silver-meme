export interface MessagingParticipant {
    userId: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    accountType: string;
}

export interface MessagingMessagePreview {
    id: string;
    senderId: string;
    body: string;
    createdAt: string;
}

export interface MessagingConversation {
    id: string;
    type: "BUYER_SELLER" | "SUPPORT";
    participants: MessagingParticipant[];
    lastMessage: MessagingMessagePreview | null;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface MessagingPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface MessagingConversationListResponse {
    success: boolean;
    data: {
        conversations: MessagingConversation[];
        pagination: MessagingPagination;
    };
    message?: string;
}

export interface MessagingMessage {
    id: string;
    conversationId: string;
    senderId: string;
    body: string;
    createdAt: string;
}

export interface MessagingMessageListResponse {
    success: boolean;
    data: {
        messages: MessagingMessage[];
        pagination: MessagingPagination;
    };
    message?: string;
}

export interface MessagingSendResponse {
    success: boolean;
    data: {
        message: MessagingMessage;
    };
    message?: string;
}

export interface MessagingReadResponse {
    success: boolean;
    data: {
        receipt: {
            conversationId: string;
            userId: string;
            lastReadAt: string | null;
        };
    };
    message?: string;
}

export interface MessagingActionResponse {
    success: boolean;
    message?: string;
}