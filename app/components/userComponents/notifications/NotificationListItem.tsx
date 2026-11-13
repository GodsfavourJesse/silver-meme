"use client";

import Link from "next/link";
import { ArrowUpRight, Check, Circle } from "lucide-react";

import type { UserNotification } from "@/app/types/user/notifications/notification.types";
import {
    formatNotificationDate,
    getNotificationCategory,
    getNotificationHref,
} from "./notification.utils";

export function NotificationListItem({
    notification,
    onOpen,
}: {
    notification: UserNotification;
    onOpen?: () => void;
}) {
    const category = getNotificationCategory(notification.type);
    const Icon = category.icon;

    return (
        <Link
            href={getNotificationHref(notification)}
            onClick={onOpen}
            className={`group flex gap-3.5 px-4 py-4 transition hover:bg-[#F7FAFE] sm:px-5 ${
                notification.read ? "" : "bg-[#F7FBFF]/80"
            }`}
        >
            <span className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ${category.color}`}>
                <Icon size={18} aria-hidden="true" />
            </span>

            <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className={`text-sm leading-5 ${notification.read ? "font-semibold text-slate-800" : "font-bold text-slate-950"}`}>
                        {notification.title}
                    </span>
                    {!notification.read && (
                        <span className="size-1.5 rounded-full bg-[#0B5FA5]" aria-label="Unread" />
                    )}
                </span>
                <span className="mt-1 block line-clamp-2 text-xs leading-5 text-slate-600">
                    {notification.message}
                </span>
                <span className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-medium text-slate-400">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">{category.label}</span>
                    <time dateTime={notification.createdAt}>{formatNotificationDate(notification.createdAt)}</time>
                </span>
            </span>

            <span className="mt-2 flex shrink-0 items-center text-slate-300 transition group-hover:text-[#0B5FA5]" aria-hidden="true">
                {notification.read ? <ArrowUpRight size={16} /> : <Circle size={8} className="fill-current" />}
            </span>
        </Link>
    );
}
