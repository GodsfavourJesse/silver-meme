export interface SupportThreadMessage {
    author: "customer" | "support";
    body: string;
    createdAt: string;
}

export interface SupportRequest {
    id: string;
    name: string;
    email: string;
    subject: string;
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    messages: SupportThreadMessage[];
    createdAt: string;
    updatedAt: string;
}

export interface SupportRequestAccess {
    id: string;
    accessToken: string;
}
