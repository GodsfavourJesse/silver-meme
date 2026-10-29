"use client";

import { useState } from "react";

import {
    CheckCircle2,
    Clock,
    Store,
    UserRound,
    Users,
    XCircle,
    ShieldCheck,
} from "lucide-react";

import type { AdminUser, AdminUserSort, AdminUserStatusFilter, AdminUserTypeFilter } from "@/app/types/admin/admin-users.types";

// ============================================================
// TYPES
// ============================================================

export interface AdminUserStats {
    total: number;
    active: number;
    suspended: number;
    deleted: number;
    dealers: number;
    administrators: number;
}

// ============================================================
// HELPERS
// ============================================================

export function formatDate(value: string | Date) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

export function getFullName(user: AdminUser) {
    const name = [
        user.firstName,
        user.lastName,
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    return name || "Unnamed user";
}

export function getInitials(user: AdminUser) {
    const first = user.firstName?.trim().charAt(0) ?? "";
    const last = user.lastName?.trim().charAt(0) ?? "";

    const initials = `${first}${last}`.toUpperCase();

    return initials || user.email.charAt(0).toUpperCase() || "U";
}

export function getRoleLabel(role: string) {
    switch (role) {
        case "SUPER_ADMIN":
            return "Super Admin";

        case "ADMIN":
            return "Admin";

        case "SUPPORT":
            return "Support";

        case "CUSTOMER":
            return "Customer";

        default:
            return role.replaceAll("_", " ");
    }
}

export function getStatusClasses(status: AdminUser["status"]) {
    switch (status) {
        case "ACTIVE":
            return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";

        case "SUSPENDED":
            return "bg-amber-50 text-amber-700 ring-amber-600/20";

        case "DELETED":
            return "bg-red-50 text-red-700 ring-red-600/20";

        default:
            return "bg-gray-50 text-gray-600 ring-gray-500/20";
    }
}

// ============================================================
// USER AVATAR
// ============================================================

export function UserAvatar({
    user,
    size = "md",
}: {
    user: AdminUser;
    size?: "sm" | "md" | "lg";
}) {
    const [imageFailed, setImageFailed] = useState(false);

    const sizeClasses = {
        sm: "h-9 w-9 text-xs",
        md: "h-11 w-11 text-sm",
        lg: "h-12 w-12 text-sm",
    };

    return (
        <div
            className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-purple-100 font-bold text-purple-700 ring-1 ring-purple-100 ${sizeClasses[size]}`}
        >
            {user.avatarUrl && !imageFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={user.avatarUrl}
                    alt={getFullName(user)}
                    className="h-full w-full object-cover"
                    onError={() => setImageFailed(true)}
                />
            ) : (
                getInitials(user)
            )}
        </div>
    );
}

// ============================================================
// STATUS BADGE
// ============================================================

export function StatusBadge({
    status,
}: {
    status: AdminUser["status"];
}) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(status)}`}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />

            {status}
        </span>
    );
}

// ============================================================
// ROLE BADGES
// ============================================================

export function RoleBadges({
    roles,
}: {
    roles: AdminUser["roles"];
}) {
    if (!roles.length) {
        return (
            <span className="text-xs text-gray-400">
                No roles assigned
            </span>
        );
    }

    return (
        <div className="flex flex-wrap gap-1.5">
            {roles.map((role) => (
                <span
                    key={role}
                    className="inline-flex items-center rounded-lg bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700"
                >
                    {getRoleLabel(role)}
                </span>
            ))}
        </div>
    );
}

// ============================================================
// STATISTICS CARD
// ============================================================

export function StatCard({
    title,
    value,
    description,
    icon,
    iconClassName,
    loading,
}: {
    title: string;
    value: number | undefined;
    description: string;
    icon: React.ReactNode;
    iconClassName: string;
    loading?: boolean;
}) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-500">
                        {title}
                    </p>

                    {loading ? (
                        <div className="mt-3 h-8 w-20 animate-pulse rounded-lg bg-gray-100" />
                    ) : (
                        <p className="mt-2 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                            {(value ?? 0).toLocaleString("en-NG")}
                        </p>
                    )}
                </div>

                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
                >
                    {icon}
                </div>
            </div>

            <p className="mt-3 text-xs text-gray-500">
                {description}
            </p>
        </div>
    );
}

// ============================================================
// STATISTICS GRID
// ============================================================

export function UserStatistics({
    stats,
    loading,
    compact = false,
}: {
    stats?: AdminUserStats;
    loading: boolean;
    compact?: boolean;
}) {
    if (compact) {
        return (
            <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-purple-100 bg-purple-50 p-3">
                    <p className="text-xs font-medium text-purple-700">
                        Total
                    </p>

                    <p className="mt-1 text-xl font-bold text-gray-950">
                        {loading
                            ? "—"
                            : (stats?.total ?? 0).toLocaleString("en-NG")}
                    </p>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                    <p className="text-xs font-medium text-emerald-700">
                        Active
                    </p>

                    <p className="mt-1 text-xl font-bold text-gray-950">
                        {loading
                            ? "—"
                            : (stats?.active ?? 0).toLocaleString("en-NG")}
                    </p>
                </div>

                <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                    <p className="text-xs font-medium text-amber-700">
                        Suspended
                    </p>

                    <p className="mt-1 text-xl font-bold text-gray-950">
                        {loading
                            ? "—"
                            : (stats?.suspended ?? 0).toLocaleString("en-NG")}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
                title="Total users"
                value={stats?.total}
                description="All user accounts"
                icon={<Users className="h-5 w-5" />}
                iconClassName="bg-purple-50 text-purple-700"
                loading={loading}
            />

            <StatCard
                title="Active users"
                value={stats?.active}
                description="Accounts currently active"
                icon={<CheckCircle2 className="h-5 w-5" />}
                iconClassName="bg-emerald-50 text-emerald-700"
                loading={loading}
            />

            <StatCard
                title="Suspended users"
                value={stats?.suspended}
                description="Accounts with restricted access"
                icon={<Clock className="h-5 w-5" />}
                iconClassName="bg-amber-50 text-amber-700"
                loading={loading}
            />

            <StatCard
                title="Deleted users"
                value={stats?.deleted}
                description="Accounts marked as deleted"
                icon={<XCircle className="h-5 w-5" />}
                iconClassName="bg-red-50 text-red-700"
                loading={loading}
            />

            <StatCard
                title="Dealers"
                value={stats?.dealers}
                description="Dealer accounts"
                icon={<Store className="h-5 w-5" />}
                iconClassName="bg-blue-50 text-blue-700"
                loading={loading}
            />

            <StatCard
                title="Administrators"
                value={stats?.administrators}
                description="Accounts with administrative roles"
                icon={<ShieldCheck className="h-5 w-5" />}
                iconClassName="bg-indigo-50 text-indigo-700"
                loading={loading}
            />
        </div>
    );
}

// ============================================================
// EMPTY STATE
// ============================================================

export function EmptyState({
    hasFilters,
    onReset,
}: {
    hasFilters: boolean;
    onReset: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50">
                <Users className="h-7 w-7 text-purple-600" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-gray-900">
                {hasFilters ? "No matching users" : "No users found"}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                {hasFilters
                    ? "Try changing your search or filters."
                    : "Users will appear here when they are available in your system."}
            </p>

            {hasFilters && (
                <button
                    type="button"
                    onClick={onReset}
                    className="mt-4 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
                >
                    Clear filters
                </button>
            )}
        </div>
    );
}

// ============================================================
// FILTER CONTROLS
// ============================================================

export function UserFilterFields({
    type,
    status,
    sort,
    onTypeChange,
    onStatusChange,
    onSortChange,
    prefix = "users",
}: {
    type: string;
    status: string;
    sort: string;
    onTypeChange: (value: AdminUserTypeFilter) => void;
    onStatusChange: (value: AdminUserStatusFilter) => void;
    onSortChange: (value: AdminUserSort) => void;
    prefix?: string;
}) {
    const selectClassName =
        "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-700 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100";

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div>
                <label
                    htmlFor={`${prefix}-type`}
                    className="mb-1.5 block text-xs font-semibold text-gray-600"
                >
                    Account type
                </label>

                <select
                    id={`${prefix}-type`}
                    value={type}
                    onChange={(event) => onTypeChange(event.target.value as AdminUserTypeFilter)}
                    className={selectClassName}
                >
                    <option value="ALL">All account types</option>
                    <option value="USER">Regular users</option>
                    <option value="DEALER">Dealers</option>
                    <option value="ADMIN">Administrators</option>
                </select>
            </div>

            <div>
                <label
                    htmlFor={`${prefix}-status`}
                    className="mb-1.5 block text-xs font-semibold text-gray-600"
                >
                    Account status
                </label>

                <select
                    id={`${prefix}-status`}
                    value={status}
                    onChange={(event) => onStatusChange(event.target.value as AdminUserStatusFilter)}
                    className={selectClassName}
                >
                    <option value="ALL">All statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="DELETED">Deleted</option>
                </select>
            </div>

            <div>
                <label
                    htmlFor={`${prefix}-sort`}
                    className="mb-1.5 block text-xs font-semibold text-gray-600"
                >
                    Registration date
                </label>

                <select
                    id={`${prefix}-sort`}
                    value={sort}
                    onChange={(event) => onSortChange(event.target.value as AdminUserSort)}
                    className={selectClassName}
                >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                </select>
            </div>
        </div>
    );
}

// ============================================================
// ACCOUNT TYPE LABEL
// ============================================================

export function AccountTypeLabel({
    accountType,
}: {
    accountType: AdminUser["accountType"];
}) {
    return (
        <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
            {accountType === "DEALER" ? (
                <Store className="h-4 w-4 text-blue-600" />
            ) : (
                <UserRound className="h-4 w-4 text-gray-400" />
            )}

            {accountType === "DEALER" ? "Dealer" : "User"}
        </span>
    );
}