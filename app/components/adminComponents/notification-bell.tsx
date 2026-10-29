"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";

import { Bell, CheckCheck, Info, UserPlus } from "lucide-react";

import {
    useAdminNotifications,
    useMarkAllNotificationsRead,
    useMarkNotificationRead,
} from "@/app/hooks/admin/use-admin-notifications";
import { timeAgo } from "@/app/lib/admin/format";
import type { AdminNotification } from "@/app/types/admin/admin-dashboard.types";
import { ADMIN_BASE_PATH } from "@/app/lib/admin/path";

function isNewUserEvent(notification: AdminNotification): boolean {
    return notification.data?.event === "USER_REGISTERED";
}

function getTargetHref(notification: AdminNotification): string | null {
    const userId = notification.data?.registeredUserId;

    return typeof userId === "string"
        ? `${ADMIN_BASE_PATH}/users/${userId}`
        : null;
}

export function NotificationBell() {
    const containerRef = useRef<HTMLDivElement>(null);

    const [open, setOpen] = useState(false);

    const { data } = useAdminNotifications();
    const markRead = useMarkNotificationRead();
    const markAllRead = useMarkAllNotificationsRead();

    const unreadCount = data?.unreadCount ?? 0;
    const notifications = data?.notifications ?? [];

    useEffect(() => {
        function handlePointerDown(event: MouseEvent): void {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handlePointerDown);

        return () =>
            document.removeEventListener("mousedown", handlePointerDown);
    }, []);

    function handleOpenNotification(notification: AdminNotification): void {
        if (!notification.read) {
            markRead.mutate(notification.id);
        }

        setOpen(false);
    }

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                aria-label={`Notifications, ${unreadCount} unread`}
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => setOpen((current) => !current)}
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-kar-border bg-kar-surface text-kar-muted transition hover:border-kar-accent/50 hover:text-kar-text"
            >
                <Bell size={19} />

                {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-kar-royal px-1.5 text-[10px] font-bold text-white ring-2 ring-kar-bg">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                ) : null}
            </button>

            {open ? (
                <div
                    role="dialog"
                    aria-label="Notifications"
                    className="absolute right-0 z-30 mt-3 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-kar-border bg-kar-surface shadow-2xl shadow-black/50"
                >
                    <div className="flex items-center justify-between border-b border-kar-border px-4 py-3">
                        <p className="text-sm font-semibold">Notifications</p>

                        <button
                            type="button"
                            onClick={() => markAllRead.mutate()}
                            disabled={unreadCount === 0 || markAllRead.isPending}
                            className="flex items-center gap-1.5 text-xs text-kar-accent transition hover:text-kar-text disabled:opacity-40"
                        >
                            <CheckCheck size={14} />
                            Mark all read
                        </button>
                    </div>

                    <ul className="max-h-[26rem] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <li className="px-4 py-10 text-center text-sm text-kar-muted">
                                You are all caught up.
                            </li>
                        ) : (
                            notifications.map((notification) => {
                                const href = getTargetHref(notification);
                                const Icon = isNewUserEvent(notification)
                                    ? UserPlus
                                    : Info;

                                const content = (
                                    <div className="flex gap-3">
                                        <span
                                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                                notification.read
                                                    ? "bg-kar-surface-raised text-kar-muted"
                                                    : "bg-kar-royal/20 text-kar-accent"
                                            }`}
                                        >
                                            <Icon size={16} />
                                        </span>

                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-medium">
                                                {notification.title}
                                            </span>

                                            <span className="mt-0.5 block text-xs leading-5 text-kar-muted">
                                                {notification.message}
                                            </span>

                                            <span className="mt-1 block text-[11px] text-kar-muted/70">
                                                {timeAgo(notification.createdAt)}
                                            </span>
                                        </span>

                                        {!notification.read ? (
                                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-kar-accent" />
                                        ) : null}
                                    </div>
                                );

                                const itemClass =
                                    "block w-full border-b border-kar-border/60 px-4 py-3 text-left transition last:border-b-0 hover:bg-kar-surface-raised";

                                return (
                                    <li key={notification.id}>
                                        {href ? (
                                            <Link
                                                href={href}
                                                onClick={() =>
                                                    handleOpenNotification(
                                                        notification,
                                                    )
                                                }
                                                className={itemClass}
                                            >
                                                {content}
                                            </Link>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleOpenNotification(
                                                        notification,
                                                    )
                                                }
                                                className={itemClass}
                                            >
                                                {content}
                                            </button>
                                        )}
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>
            ) : null}
        </div>
    );
}