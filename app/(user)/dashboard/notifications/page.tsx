import type { Metadata } from "next";

import { NotificationsPageClient } from "@/app/components/userComponents/notifications/NotificationsPageClient";

export const instant = false;

export const metadata: Metadata = {
    title: "Notifications | KARMASS",
    description: "View your KARMASS account and vehicle listing updates.",
    robots: { index: false, follow: false },
};

export default function NotificationsPage() {
    return <NotificationsPageClient />;
}
