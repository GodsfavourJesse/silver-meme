import { apiRequest, adminFetch } from "@/app/lib/api/api-client";
import type { SupportRequest, SupportRequestAccess } from "@/app/types/user/support.types";

const ROOT = "/messaging/public-support";

export async function createSupportRequest(input: { name: string; email: string; subject: string; message: string }) {
    const response = await apiRequest<{ success: boolean; data: SupportRequestAccess; message?: string }>(ROOT, { method: "POST", body: input });
    if (!response.success) throw new Error(response.message || "Could not send your message.");
    return response.data;
}

export async function getSupportRequest(access: SupportRequestAccess) {
    return apiRequest<{ success: boolean; data: { request: SupportRequest } }>(`${ROOT}/${encodeURIComponent(access.id)}`, { method: "GET", headers: { "X-Support-Access-Token": access.accessToken }, cache: "no-store" });
}

export async function sendSupportMessage(access: SupportRequestAccess, message: string) {
    return apiRequest<{ success: boolean; data: { request: SupportRequest } }>(`${ROOT}/${encodeURIComponent(access.id)}/messages`, { method: "POST", headers: { "X-Support-Access-Token": access.accessToken }, body: { message } });
}

export async function getMySupportRequests() {
    const response = await apiRequest<{ success: boolean; data: { requests: SupportRequest[] } }>("/messaging/my-public-support", { method: "GET", cache: "no-store" });
    return response.data.requests;
}

export async function getAdminSupportRequests() {
    const response = await adminFetch<{ requests: SupportRequest[] }>("/messaging/public-requests");
    return response.data.requests;
}

export async function replyToSupportRequest(id: string, message: string) {
    return adminFetch<{ request: Pick<SupportRequest, "id" | "status" | "messages" | "updatedAt"> }>(`/messaging/public-requests/${encodeURIComponent(id)}/replies`, { method: "POST", body: { message } });
}
