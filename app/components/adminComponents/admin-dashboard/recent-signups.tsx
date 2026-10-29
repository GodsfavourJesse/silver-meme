"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
    ArrowRight,
    Clock3,
    Users,
} from "lucide-react";

import { useAdminRecentUsers } from "@/app/hooks/admin/use-admin-recent-users";
import { fullName, initialsOf, timeAgo } from "@/app/lib/admin/format";
import { ADMIN_BASE_PATH } from "@/app/lib/admin/path";

import { Panel } from "./panel";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function SignupSkeleton() {
    return (
        <div className="space-y-2" aria-label="Loading recent sign-ups">
            {[0, 1, 2, 3].map((index) => (
                <div
                    key={index}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
                >
                    <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-100" />

                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-3.5 w-28 max-w-full animate-pulse rounded bg-slate-100" />
                        <div className="h-3 w-36 max-w-full animate-pulse rounded bg-slate-100" />
                    </div>

                    <div className="h-3 w-12 animate-pulse rounded bg-slate-100" />
                </div>
            ))}
        </div>
    );
}

export function RecentSignups() {
    const { data, isPending, isError } = useAdminRecentUsers();

    const recentUsers = useMemo(() => {
        if (!data) return [];

        return [...data].sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        );
    }, [data]);

    return (
        <Panel
            title="Recent sign-ups"
            eyebrow="Community"
            action={
                <Link
                    href={`${ADMIN_BASE_PATH}/dashboard/users`}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[#1491FF] transition-colors hover:bg-[#1491FF]/[0.07] hover:text-[#0876D1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1491FF] focus-visible:ring-offset-2"
                >
                    View all
                    <ArrowRight size={14} aria-hidden="true" />
                </Link>
            }
        >
            {isPending ? (
                <SignupSkeleton />
            ) : isError ? (
                <div
                    role="alert"
                    className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50/50 px-4 py-8 text-center"
                >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <Users size={18} aria-hidden="true" />
                    </span>

                    <p className="mt-3 text-sm font-semibold text-slate-800">
                        Unable to load recent sign-ups
                    </p>

                    <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                        We couldn't retrieve the latest registered users. Please
                        try refreshing the dashboard.
                    </p>
                </div>
            ) : recentUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 px-4 py-9 text-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <Users size={20} aria-hidden="true" />
                    </span>

                    <p className="mt-3 text-sm font-semibold text-slate-800">
                        No sign-ups yet
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        New registrations will appear here.
                    </p>
                </div>
            ) : (
                <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-xs text-slate-500">
                            Latest registered members
                        </p>

                        <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                            {recentUsers.length}{" "}
                            {recentUsers.length === 1 ? "member" : "members"}
                        </span>
                    </div>

                    <ul className="divide-y divide-slate-100">
                        {recentUsers.map((user) => {
                            const createdAt = new Date(user.createdAt).getTime();

                            const isNew =
                                Number.isFinite(createdAt) &&
                                Date.now() - createdAt >= 0 &&
                                Date.now() - createdAt < DAY_IN_MS;

                            const name =
                                fullName(user.firstName, user.lastName).trim() ||
                                "Unnamed user";

                            return (
                                <li key={user.id}>
                                    <Link
                                        href={`${ADMIN_BASE_PATH}/dashboard/users/${user.id}`}
                                        className="group -mx-1 flex min-w-0 items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1491FF]"
                                    >
                                        {/* Avatar */}
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#1491FF]/10 bg-[#1491FF]/[0.08] text-xs font-bold text-[#0876D1]">
                                            {initialsOf(
                                                user.firstName,
                                                user.lastName,
                                            )}
                                        </span>

                                        {/* User details */}
                                        <span className="min-w-0 flex-1">
                                            <span className="flex min-w-0 items-center gap-2">
                                                <span className="truncate text-sm font-semibold text-slate-800 transition-colors group-hover:text-[#0876D1]">
                                                    {name}
                                                </span>

                                                {isNew && (
                                                    <span className="shrink-0 rounded-md bg-[#1491FF]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#0876D1]">
                                                        New
                                                    </span>
                                                )}
                                            </span>

                                            <span className="mt-1 block truncate text-xs text-slate-500">
                                                {user.email || "No email provided"}
                                            </span>

                                            <span className="mt-1.5 inline-flex max-w-full items-center rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium capitalize text-slate-500">
                                                <span className="truncate">
                                                    {user.accountType}
                                                </span>
                                            </span>
                                        </span>

                                        {/* Registration time */}
                                        <span className="flex shrink-0 flex-col items-end gap-1 self-center">
                                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 sm:text-xs">
                                                <Clock3
                                                    size={11}
                                                    aria-hidden="true"
                                                />
                                                {timeAgo(user.createdAt)}
                                            </span>

                                            <ArrowRight
                                                size={14}
                                                className="text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-[#1491FF]"
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    <Link
                        href={`${ADMIN_BASE_PATH}/dashboard/users`}
                        className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-[#1491FF]/40 hover:bg-[#1491FF]/[0.04] hover:text-[#0876D1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1491FF] focus-visible:ring-offset-2"
                    >
                        Manage all users
                        <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                </div>
            )}
        </Panel>
    );
}