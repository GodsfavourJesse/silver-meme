"use client";

import { useEffect } from "react";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Bell, RotateCw } from "lucide-react";

import {
    useMarkNotificationRead,
    useNotification,
} from "@/app/hooks/user/notifications/useNotifications";
import {
    formatNotificationDate,
    getNotificationCategory,
    getNotificationRelatedHref,
} from "./notification.utils";

export function NotificationDetailClient({ notificationId }: { notificationId: string }) {
    const notificationQuery = useNotification(notificationId);
    const markRead = useMarkNotificationRead();
    const notification = notificationQuery.data;

    useEffect(() => {
        if (notification && !notification.read) {
            markRead.mutate(notification.id);
        }
    }, [markRead.mutate, notification?.id, notification?.read]);

    if (notificationQuery.isPending) {
        return (
            <main className="min-h-screen bg-[#F6F9FC] px-4 py-8 sm:px-6">
                <div className="mx-auto max-w-3xl animate-pulse rounded-2xl border border-slate-200 bg-white p-6 sm:p-9">
                    <div className="h-3 w-24 rounded bg-slate-100" />
                    <div className="mt-5 h-8 w-2/3 rounded bg-slate-100" />
                    <div className="mt-5 h-4 w-full rounded bg-slate-50" />
                    <div className="mt-2 h-4 w-4/5 rounded bg-slate-50" />
                </div>
            </main>
        );
    }

    if (notificationQuery.isError || !notification) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F6F9FC] px-4 py-10">
                <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
                    <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#EAF5FF] text-[#0B5FA5]"><Bell size={22} /></span>
                    <h1 className="mt-4 text-lg font-bold text-slate-900">Notification not found</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        This update may have been removed or is no longer available in your account.
                    </p>
                    {notificationQuery.isError && (
                        <button type="button" onClick={() => void notificationQuery.refetch()} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#0B5FA5]"><RotateCw size={14} /> Try again</button>
                    )}
                    <Link href="/dashboard/notifications" className="mt-6 inline-flex min-h-10 items-center justify-center rounded-xl bg-[#0B5FA5] px-4 text-xs font-bold text-white hover:bg-[#084A80]">
                        Back to notifications
                    </Link>
                </section>
            </main>
        );
    }

    const category = getNotificationCategory(notification.type);
    const Icon = category.icon;
    const relatedHref = getNotificationRelatedHref(notification);

    return (
        <main className="min-h-screen bg-[#F6F9FC] px-4 py-5 sm:px-6 sm:py-9">
            <div className="mx-auto max-w-3xl">
                <Link href="/dashboard/notifications" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#0B5FA5]">
                    <ArrowLeft size={15} /> All notifications
                </Link>

                <article className="mt-5 overflow-hidden rounded-2xl border border-[#DCE8F4] bg-white shadow-[0_12px_36px_rgba(24,58,92,0.045)]">
                    <div className="border-b border-slate-100 px-5 py-6 sm:px-8">
                        <div className="flex items-start gap-4">
                            <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${category.color}`}><Icon size={22} /></span>
                            <div className="min-w-0 flex-1">
                                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">{category.label}</span>
                                <h1 className="mt-3 text-xl font-bold leading-7 tracking-tight text-slate-950 sm:text-2xl">{notification.title}</h1>
                                <time dateTime={notification.createdAt} className="mt-2 block text-xs text-slate-400">{formatNotificationDate(notification.createdAt)}</time>
                            </div>
                        </div>
                    </div>

                    <div className="px-5 py-6 sm:px-8 sm:py-8">
                        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">{notification.message}</p>

                        {relatedHref && (
                            <Link href={relatedHref} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0B5FA5] px-4 text-xs font-bold text-white transition hover:bg-[#084A80]">
                                Open related page <ArrowUpRight size={15} />
                            </Link>
                        )}
                    </div>
                </article>

                {markRead.isError && (
                    <p role="alert" className="mt-3 text-xs text-red-600">
                        {markRead.error instanceof Error ? markRead.error.message : "Unable to update notification status."}
                    </p>
                )}
            </div>
        </main>
    );
}
