import type { Metadata } from "next";

import { NotificationDetailClient } from "@/app/components/userComponents/notifications/NotificationDetailClient";

export const instant = false;

export const metadata: Metadata = {
    title: "Notification | KARMASS",
    robots: { index: false, follow: false },
};

export default async function NotificationDetailPage({
    params,
}: {
    params: Promise<{ notificationId: string }>;
}) {
    const { notificationId } = await params;
    return <NotificationDetailClient notificationId={notificationId} />;
}
