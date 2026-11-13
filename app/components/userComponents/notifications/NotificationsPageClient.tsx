"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import {
    AlertCircle,
    ArrowLeft,
    Bell,
    CheckCheck,
    ChevronDown,
    Inbox,
    Loader2,
    RefreshCw,
    SlidersHorizontal,
    X,
} from "lucide-react";

import {
    getNotificationPages,
    useMarkAllNotificationsRead,
    useMarkNotificationRead,
    useNotifications,
    useUnreadNotificationCount,
} from "@/app/hooks/user/notifications/useNotifications";
import { NotificationListItem } from "./NotificationListItem";
import { NotificationPreferencesCard } from "./NotificationPreferencesCard";
import { PushNotificationCard } from "./PushNotificationCard";

type Filter = "all" | "unread";

const FILTERS: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
];

export function NotificationsPageClient() {
    const [filter, setFilter] = useState<Filter>("all");
    const [settingsOpen, setSettingsOpen] = useState(false);

    const notificationsQuery = useNotifications();
    const unreadQuery = useUnreadNotificationCount();
    const markAll = useMarkAllNotificationsRead();
    const markRead = useMarkNotificationRead();

    const notifications = getNotificationPages(notificationsQuery.data);
    const unreadCount =
        unreadQuery.data ?? notificationsQuery.data?.pages[0]?.data.unreadCount ?? 0;

    const visibleNotifications = useMemo(
        () =>
            filter === "unread"
                ? notifications.filter((notification) => !notification.read)
                : notifications,
        [filter, notifications],
    );

    // Close the settings sheet with Escape and lock page scroll while it is open (mobile only UX).
    useEffect(() => {
        if (!settingsOpen) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setSettingsOpen(false);
        };
        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [settingsOpen]);

    const handleMarkAll = () => {
        void markAll.mutateAsync().catch(() => undefined);
    };

    return (
        <main className="min-h-screen bg-[#F2F5F9] pb-[calc(2.5rem+env(safe-area-inset-bottom))] text-slate-900">
            {/* App bar */}
            <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
                <div className="mx-auto flex h-14 max-w-5xl items-center gap-1 px-2 sm:px-6">
                    <Link
                        href="/dashboard"
                        aria-label="Back to dashboard"
                        className="flex size-10 items-center justify-center rounded-full text-slate-700 transition active:scale-95 active:bg-slate-100 sm:hover:bg-slate-100"
                    >
                        <ArrowLeft size={20} />
                    </Link>

                    <h1 className="flex-1 truncate px-1 text-[17px] font-bold tracking-tight text-slate-950">
                        Notifications
                    </h1>

                    <button
                        type="button"
                        onClick={handleMarkAll}
                        disabled={unreadCount === 0 || markAll.isPending}
                        aria-label="Mark all notifications as read"
                        className="flex size-10 items-center justify-center rounded-full text-[#0B5FA5] transition active:scale-95 active:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:active:bg-transparent sm:hover:bg-blue-50"
                    >
                        {markAll.isPending ? (
                            <Loader2 size={19} className="animate-spin" />
                        ) : (
                            <CheckCheck size={20} />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setSettingsOpen(true)}
                        aria-label="Notification settings"
                        aria-haspopup="dialog"
                        className="flex size-10 items-center justify-center rounded-full text-slate-700 transition active:scale-95 active:bg-slate-100 lg:hidden"
                    >
                        <SlidersHorizontal size={19} />
                    </button>
                </div>

                {/* Segmented filter */}
                <div className="mx-auto max-w-5xl px-4 pb-3 sm:px-6">
                    <div
                        role="tablist"
                        aria-label="Filter notifications"
                        className="grid grid-cols-2 gap-1 rounded-xl bg-slate-200/60 p-1 sm:inline-grid sm:w-64"
                    >
                        {FILTERS.map(({ value, label }) => {
                            const active = filter === value;
                            return (
                                <button
                                    key={value}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() => setFilter(value)}
                                    className={`flex h-8 items-center justify-center gap-1.5 rounded-lg text-[13px] font-semibold transition ${
                                        active
                                            ? "bg-white text-slate-950 shadow-sm"
                                            : "text-slate-500 active:text-slate-800"
                                    }`}
                                >
                                    {label}
                                    {value === "unread" && unreadCount > 0 && (
                                        <span
                                            className={`min-w-5 rounded-full px-1.5 text-[11px] font-bold leading-5 ${
                                                active ? "bg-[#0B5FA5] text-white" : "bg-slate-300 text-slate-700"
                                            }`}
                                        >
                                            {unreadCount > 99 ? "99+" : unreadCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-5xl px-0 sm:px-6">
                {/* Summary */}
                <section className="flex items-center gap-3 px-4 pb-3 pt-5 sm:px-0">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0B5FA5] to-[#064C9B] text-white shadow-[0_8px_20px_rgba(11,95,165,0.28)]">
                        <Bell size={20} />
                    </span>
                    <div className="min-w-0">
                        <p className="text-base font-bold tracking-tight text-slate-950">
                            {unreadCount === 0
                                ? "You're all caught up"
                                : `${unreadCount} new ${unreadCount === 1 ? "update" : "updates"}`}
                        </p>
                        <p className="text-[13px] leading-5 text-slate-500">
                            Listings, messages, subscriptions and account activity.
                        </p>
                    </div>
                </section>

                {markAll.isError && (
                    <div
                        role="alert"
                        className="mx-4 mb-3 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-[13px] text-red-700 sm:mx-0"
                    >
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>
                            {markAll.error instanceof Error
                                ? markAll.error.message
                                : "Couldn't mark notifications as read. Try again."}
                        </span>
                    </div>
                )}

                <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                    {/* Notification list */}
                    <section
                        aria-label="Notification list"
                        className="min-w-0 overflow-hidden border-y border-slate-200/80 bg-white sm:rounded-2xl sm:border sm:shadow-[0_10px_30px_rgba(24,58,92,0.05)]"
                    >
                        {notificationsQuery.isPending ? (
                            <div className="divide-y divide-slate-100" aria-label="Loading notifications" aria-busy="true">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div key={index} className="flex gap-3.5 px-4 py-4 sm:px-5">
                                        <div className="size-11 shrink-0 animate-pulse rounded-2xl bg-slate-100" />
                                        <div className="flex-1 space-y-2.5 py-1">
                                            <div className="h-3 w-2/5 animate-pulse rounded bg-slate-100" />
                                            <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
                                            <div className="h-2.5 w-1/4 animate-pulse rounded bg-slate-50" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : notificationsQuery.isError ? (
                            <div className="px-6 py-16 text-center">
                                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                                    <AlertCircle size={24} />
                                </span>
                                <h2 className="mt-4 text-[15px] font-bold text-slate-900">
                                    Couldn’t load notifications
                                </h2>
                                <p className="mx-auto mt-1 max-w-xs text-[13px] leading-5 text-slate-500">
                                    {notificationsQuery.error instanceof Error
                                        ? notificationsQuery.error.message
                                        : "Check your connection and try again."}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => void notificationsQuery.refetch()}
                                    className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B5FA5] px-5 text-[13px] font-bold text-white transition active:scale-[0.98] active:bg-[#084A80]"
                                >
                                    <RefreshCw size={15} />
                                    Try again
                                </button>
                            </div>
                        ) : visibleNotifications.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#EAF5FF] text-[#0B5FA5]">
                                    <Inbox size={24} />
                                </span>
                                <h2 className="mt-4 text-[15px] font-bold text-slate-900">
                                    {filter === "unread" ? "No unread updates" : "No notifications yet"}
                                </h2>
                                <p className="mx-auto mt-1 max-w-xs text-[13px] leading-5 text-slate-500">
                                    {filter === "unread"
                                        ? notificationsQuery.hasNextPage
                                            ? "Older unread items may be further back. Load more to keep looking."
                                            : "Everything here has been read."
                                        : "When something needs your attention, it will show up here."}
                                </p>
                                {filter === "unread" && notificationsQuery.hasNextPage && (
                                    <button
                                        type="button"
                                        onClick={() => void notificationsQuery.fetchNextPage()}
                                        disabled={notificationsQuery.isFetchingNextPage}
                                        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B5FA5] px-5 text-[13px] font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
                                    >
                                        {notificationsQuery.isFetchingNextPage && (
                                            <Loader2 size={15} className="animate-spin" />
                                        )}
                                        Load older notifications
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {visibleNotifications.map((notification) => (
                                    <NotificationListItem
                                        key={notification.id}
                                        notification={notification}
                                        onOpen={() => {
                                            if (!notification.read) {
                                                markRead.mutate(notification.id);
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {notificationsQuery.hasNextPage && visibleNotifications.length > 0 && (
                            <div className="border-t border-slate-100 p-3">
                                <button
                                    type="button"
                                    onClick={() => void notificationsQuery.fetchNextPage()}
                                    disabled={notificationsQuery.isFetchingNextPage}
                                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[13px] font-bold text-[#0B5FA5] transition active:bg-blue-50 disabled:opacity-60 sm:hover:bg-blue-50"
                                >
                                    {notificationsQuery.isFetchingNextPage ? (
                                        <>
                                            <Loader2 size={15} className="animate-spin" />
                                            Loading…
                                        </>
                                    ) : (
                                        <>
                                            Load more
                                            <ChevronDown size={15} />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {markRead.isError && (
                            <p
                                role="alert"
                                className="flex items-start gap-2 border-t border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-700 sm:px-5"
                            >
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                {markRead.error instanceof Error
                                    ? markRead.error.message
                                    : "Couldn't mark this notification as read."}
                            </p>
                        )}
                    </section>

                    {/* Mobile: bottom sheet backdrop */}
                    <div
                        aria-hidden="true"
                        onClick={() => setSettingsOpen(false)}
                        className={`fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden ${
                            settingsOpen ? "opacity-100" : "pointer-events-none opacity-0"
                        }`}
                    />

                    {/* Settings: bottom sheet on mobile, sidebar on desktop */}
                    <aside
                        role={settingsOpen ? "dialog" : undefined}
                        aria-modal={settingsOpen ? true : undefined}
                        aria-label="Notification settings"
                        className={`fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto overscroll-contain rounded-t-3xl bg-[#F2F5F9] px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_40px_rgba(15,23,42,0.18)] transition-transform duration-300 ease-out lg:static lg:z-auto lg:max-h-none lg:translate-y-0 lg:overflow-visible lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none ${
                            settingsOpen ? "translate-y-0" : "max-lg:invisible translate-y-full"
                        }`}
                    >
                        {/* Sheet handle + header (mobile only) */}
                        <div className="sticky top-0 z-10 -mx-4 mb-3 bg-[#F2F5F9] px-4 pb-2 lg:hidden">
                            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-300" />
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-bold tracking-tight text-slate-950">
                                    Notification settings
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setSettingsOpen(false)}
                                    aria-label="Close settings"
                                    className="flex size-9 items-center justify-center rounded-full bg-slate-200/70 text-slate-600 transition active:scale-95"
                                >
                                    <X size={17} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <PushNotificationCard />
                            <NotificationPreferencesCard />
                            <p className="px-1 text-[11px] leading-5 text-slate-400">
                                Push alerts are sent to this browser or the installed KARMASS app. You can change
                                permissions at any time in your device settings.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}