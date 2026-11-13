import {
    Bell,
    CarFront,
    CreditCard,
    MessageCircle,
    Rocket,
    ShieldCheck,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import type { NotificationType, UserNotification } from "@/app/types/user/notifications/notification.types";

export function getNotificationCategory(type: NotificationType): {
    label: string;
    icon: LucideIcon;
    color: string;
} {
    if (type.startsWith("MESSAGE_")) {
        return { label: "Message", icon: MessageCircle, color: "bg-violet-50 text-violet-700 ring-violet-100" };
    }
    if (type.startsWith("LISTING_")) {
        return { label: "Listing", icon: CarFront, color: "bg-blue-50 text-blue-700 ring-blue-100" };
    }
    if (type.startsWith("BOOST_")) {
        return { label: "Boost", icon: Rocket, color: "bg-amber-50 text-amber-700 ring-amber-100" };
    }
    if (type.startsWith("SUBSCRIPTION_")) {
        return { label: "Subscription", icon: CreditCard, color: "bg-emerald-50 text-emerald-700 ring-emerald-100" };
    }
    if (type.startsWith("DEALER_")) {
        return { label: "Dealer update", icon: ShieldCheck, color: "bg-cyan-50 text-cyan-700 ring-cyan-100" };
    }
    return { label: "KARMASS update", icon: Bell, color: "bg-slate-100 text-slate-600 ring-slate-200" };
}

export function getNotificationRelatedHref(
    notification: UserNotification,
): string | null {
    const raw = notification.data?.url;
    if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) {
        return null;
    }
    if (raw === "/notifications" || raw === "/dashboard/notifications") {
        return null;
    }
    return raw;
}

export function getNotificationHref(notification: UserNotification): string {
    return getNotificationRelatedHref(notification) ??
        `/dashboard/notifications/${encodeURIComponent(notification.id)}`;
}

export function formatNotificationDate(value: string): string {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "";

    return new Intl.DateTimeFormat("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Lagos",
    }).format(date);
}
