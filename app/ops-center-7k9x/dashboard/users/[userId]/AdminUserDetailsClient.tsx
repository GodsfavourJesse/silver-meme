"use client";

import {
    useParams,
    useRouter,
} from "next/navigation";

import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock,
    CreditCard,
    Mail,
    Phone,
    ShieldCheck,
    Store,
    UserRound,
    AlertCircle,
    RefreshCw,
    FileText,
    Coins,
    TrendingUp,
    Wallet,
    BadgeCheck,
    CalendarClock,
    History,
} from "lucide-react";

import type {
    AdminUser,
} from "@/app/types/admin/admin-users.types";
import { useAdminUser } from "@/app/hooks/admin/admin-users/useAdminUser";
import AdminUserActions from "@/app/components/adminComponents/admin-users/AdminUserActions";
import { ADMIN_BASE_PATH } from "@/app/lib/admin/path";

// ============================================================
// HELPERS
// ============================================================

function formatDate(value: string | Date | null | undefined) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function fullName(user: AdminUser) {
    const name = [
        user.firstName,
        user.lastName,
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    return name || "Unnamed user";
}

function initials(user: AdminUser) {
    const first = user.firstName?.trim().charAt(0) ?? "";
    const last = user.lastName?.trim().charAt(0) ?? "";

    return `${first}${last}`.toUpperCase() || "U";
}

function roleLabel(role: string) {
    return role
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

// ============================================================
// REUSABLE COMPONENTS
// ============================================================

function SectionCard({
    title,
    description,
    icon,
    children,
}: {
    title: string;
    description?: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-start gap-3 border-b border-gray-100 px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                    {icon}
                </div>

                <div>
                    <h2 className="font-semibold text-gray-950">
                        {title}
                    </h2>

                    {description && (
                        <p className="mt-1 text-sm text-gray-500">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            <div className="p-5">
                {children}
            </div>
        </section>
    );
}

function DetailItem({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {label}
            </p>

            <div className="mt-2 break-words text-sm font-medium text-gray-800">
                {value || "—"}
            </div>
        </div>
    );
}

function StatusBadge({
    status,
}: {
    status: AdminUser["status"];
}) {
    const styles: Record<AdminUser["status"], string> = {
        ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        SUSPENDED: "bg-amber-50 text-amber-700 ring-amber-600/20",
        DELETED: "bg-red-50 text-red-700 ring-red-600/20",
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {status}
        </span>
    );
}

function RoleBadges({
    roles,
}: {
    roles: AdminUser["roles"];
}) {
    if (!roles.length) {
        return (
            <span className="text-sm text-gray-400">
                No roles assigned
            </span>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
                <span
                    key={role}
                    className="rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700"
                >
                    {roleLabel(role)}
                </span>
            ))}
        </div>
    );
}

function RelatedRecordsPlaceholder({
    title,
    description,
    icon,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm">
                {icon}
            </div>

            <div>
                <h3 className="text-sm font-semibold text-gray-800">
                    {title}
                </h3>

                <p className="mt-1 text-sm leading-5 text-gray-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

function formatNumber(value: number) {
    return value.toLocaleString("en-NG");
}

function CreditBalanceCard({
    title,
    description,
    total,
    used,
    remaining,
    accent = "blue",
}: {
    title: string;
    description: string;
    total: number;
    used: number;
    remaining: number;
    accent?: "blue" | "emerald" | "amber";
}) {
    const styles = {
        blue: {
            container: "border-blue-100 bg-blue-50/60",
            icon: "bg-blue-100 text-blue-700",
            label: "text-blue-700",
            progress: "bg-[#1491FF]",
        },
        emerald: {
            container: "border-emerald-100 bg-emerald-50/60",
            icon: "bg-emerald-100 text-emerald-700",
            label: "text-emerald-700",
            progress: "bg-emerald-500",
        },
        amber: {
            container: "border-amber-100 bg-amber-50/60",
            icon: "bg-amber-100 text-amber-700",
            label: "text-amber-700",
            progress: "bg-amber-500",
        },
    }[accent];

    const percentage =
        total > 0
            ? Math.min(100, Math.max(0, (used / total) * 100))
            : 0;

    return (
        <div className={`rounded-2xl border p-4 sm:p-5 ${styles.container}`}>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-gray-800">
                        {title}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                        {description}
                    </p>
                </div>

                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
                    <Coins className="h-5 w-5" />
                </div>
            </div>

            <div className="mt-5 flex items-end justify-between gap-3">
                <div>
                    <p className="text-3xl font-bold tracking-tight text-gray-950">
                        {formatNumber(remaining)}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                        Credits remaining
                    </p>
                </div>

                <p className={`text-sm font-semibold ${styles.label}`}>
                    {formatNumber(used)} / {formatNumber(total)} used
                </p>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/80">
                <div
                    className={`h-full rounded-full transition-all ${styles.progress}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>{percentage.toFixed(0)}% used</span>
                <span>{formatNumber(total)} allocated</span>
            </div>
        </div>
    );
}

function UserCreditsSection({
    credits,
}: {
    credits: NonNullable<
        import("@/app/types/admin/admin-users.types").AdminUserDetails["credits"]
    >;
}) {
    return (
        <SectionCard
            title="Listing credits"
            description="Credit allocation, usage and remaining balances for this account."
            icon={<Wallet className="h-5 w-5" />}
        >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <CreditBalanceCard
                    title="Free credits"
                    description="Credits provided through free registration."
                    total={credits.free.total}
                    used={credits.free.used}
                    remaining={credits.free.remaining}
                    accent="emerald"
                />

                <CreditBalanceCard
                    title="Subscription credits"
                    description="Credits allocated through purchased plans."
                    total={credits.subscribed.total}
                    used={credits.subscribed.used}
                    remaining={credits.subscribed.remaining}
                    accent="blue"
                />

                <CreditBalanceCard
                    title="Admin adjustments"
                    description="Credits manually granted by administrators."
                    total={credits.adjustment.total}
                    used={credits.adjustment.used}
                    remaining={credits.adjustment.remaining}
                    accent="amber"
                />
            </div>

            <div className="mt-5 rounded-2xl border border-[#D5EAFE] bg-[#F4F9FF] p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#1491FF]">
                            <TrendingUp className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-gray-800">
                                Total available credits
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                Combined balance across all credit sources.
                            </p>
                        </div>
                    </div>

                    <p className="text-3xl font-bold tracking-tight text-[#0877D9]">
                        {formatNumber(credits.totalRemaining)}
                    </p>
                </div>
            </div>

            <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-800">
                    Credit consumption policy
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                    Subscription credits are consumed first, followed by
                    free credits and then administrator adjustments.
                    Unused subscription credits remain available after
                    their subscription expires.
                </p>
            </div>
        </SectionCard>
    );
}

function SubscriptionHistorySection({
    subscriptions,
}: {
    subscriptions: import("@/app/types/admin/admin-users.types").AdminUserSubscription[];
}) {
    function getSubscriptionStatus(status: string) {
        switch (status) {
            case "ACTIVE":
                return "bg-emerald-50 text-emerald-700";

            case "PENDING":
                return "bg-amber-50 text-amber-700";

            case "EXPIRED":
                return "bg-gray-100 text-gray-600";

            case "CANCELLED":
                return "bg-red-50 text-red-700";

            default:
                return "bg-gray-100 text-gray-600";
        }
    }

    function formatMoney(
        amount: string | number,
        currency: string,
    ) {
        const numericAmount = Number(amount);

        if (!Number.isFinite(numericAmount)) {
            return `${currency} ${amount}`;
        }

        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
        }).format(numericAmount);
    }

    return (
        <SectionCard
            title="Subscription history"
            description="Plans purchased by this user, including their allocated credits and subscription periods."
            icon={<History className="h-5 w-5" />}
        >
            {subscriptions.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF5FF] text-[#1491FF]">
                        <CalendarClock className="h-6 w-6" />
                    </div>

                    <h3 className="mt-4 font-semibold text-gray-900">
                        No subscription history
                    </h3>

                    <p className="mt-1 max-w-sm text-sm leading-6 text-gray-500">
                        This user has not purchased a subscription plan yet.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {subscriptions.map((subscription) => (
                        <div
                            key={subscription.id}
                            className="rounded-2xl border border-gray-100 bg-white p-4 transition hover:border-[#C8E3FF] sm:p-5"
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-base font-semibold text-gray-950">
                                            {subscription.planName ?? "Subscription plan"}
                                        </h3>

                                        {subscription.planVersion !== null && (
                                            <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                                Version {subscription.planVersion}
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1 break-all text-xs text-gray-400">
                                        Subscription ID: {subscription.id}
                                    </p>
                                </div>

                                <span
                                    className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold ${getSubscriptionStatus(subscription.status)}`}
                                >
                                    {subscription.status}
                                </span>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <DetailItem
                                    label="Listing credits"
                                    value={
                                        <span className="inline-flex items-center gap-1.5 text-[#0877D9]">
                                            <BadgeCheck className="h-4 w-4" />
                                            {formatNumber(subscription.listingCredits)}
                                        </span>
                                    }
                                />

                                <DetailItem
                                    label="Plan duration"
                                    value={`${subscription.durationDays} days`}
                                />

                                <DetailItem
                                    label="Original price"
                                    value={formatMoney(
                                        subscription.originalPrice,
                                        subscription.currency,
                                    )}
                                />

                                <DetailItem
                                    label="Amount paid"
                                    value={formatMoney(
                                        subscription.effectivePrice,
                                        subscription.currency,
                                    )}
                                />
                            </div>

                            {Number(subscription.appliedDiscountPercent ?? 0) > 0 && (
                                <p className="mt-4 text-xs font-medium text-emerald-700">
                                    Discount applied: {subscription.appliedDiscountPercent}%
                                </p>
                            )}

                            <div className="mt-5 grid gap-4 border-t border-gray-100 pt-4 sm:grid-cols-3">
                                <DetailItem
                                    label="Start date"
                                    value={formatDate(subscription.startsAt)}
                                />

                                <DetailItem
                                    label="Expiry date"
                                    value={formatDate(subscription.expiresAt)}
                                />

                                <DetailItem
                                    label="Cancellation date"
                                    value={formatDate(subscription.cancelledAt)}
                                />
                            </div>

                            {subscription.cancellationReason && (
                                <div className="mt-4 rounded-xl bg-red-50 p-3">
                                    <p className="text-xs font-semibold text-red-700">
                                        Cancellation reason
                                    </p>

                                    <p className="mt-1 text-sm text-red-600">
                                        {subscription.cancellationReason}
                                    </p>
                                </div>
                            )}

                            <p className="mt-4 text-xs text-gray-400">
                                Purchased: {formatDate(subscription.createdAt)}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </SectionCard>
    );
}

// ============================================================
// PAGE
// ============================================================

export default function AdminUserDetailsPage() {
    const params = useParams<{ userId: string }>();
    const router = useRouter();

    const userId = params.userId;

    const userQuery = useAdminUser(userId);

    const user = userQuery.data;

    // --------------------------------------------------------
    // LOADING STATE
    // --------------------------------------------------------

    if (userQuery.isPending && !user) {
        return (
            <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
                <div className="mx-auto max-w-6xl">
                    <div className="h-10 w-40 animate-pulse rounded-xl bg-gray-200" />

                    <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 animate-pulse rounded-2xl bg-gray-100" />

                            <div className="flex-1 space-y-3">
                                <div className="h-5 w-48 animate-pulse rounded bg-gray-100" />

                                <div className="h-4 w-64 max-w-full animate-pulse rounded bg-gray-100" />
                            </div>
                        </div>

                        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-20 animate-pulse rounded-xl bg-gray-50"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // --------------------------------------------------------
    // ERROR STATE
    // --------------------------------------------------------

    if (userQuery.isError || !user) {
        return (
            <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
                <div className="mx-auto max-w-3xl">
                    <button
                        type="button"
                        onClick={() => router.push(`${ADMIN_BASE_PATH}/dashboard/users`)}
                        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-purple-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to users
                    </button>

                    <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                            <AlertCircle className="h-7 w-7" />
                        </div>

                        <h1 className="mt-4 text-xl font-bold text-gray-950">
                            Unable to load user
                        </h1>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                            We could not retrieve this user's details.
                            The account may not exist, or you may not have
                            permission to view it.
                        </p>

                        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => void userQuery.refetch()}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Try again
                            </button>

                            <button
                                type="button"
                                onClick={() => router.push("/admin/users")}
                                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                                Return to users
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // --------------------------------------------------------
    // USER DETAILS
    // --------------------------------------------------------

    return (
        <main className="min-h-screen bg-gray-50/70 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-6">

                {/* BACK NAVIGATION */}

                <button
                    type="button"
                    onClick={() => router.push("/ops-center-7k9x/dashboard/users")}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-purple-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to users
                </button>

                {/* PROFILE HEADER */}

                <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="h-2 bg-purple-600" />

                    <div className="p-5 sm:p-7">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-purple-100 text-xl font-bold text-purple-700 sm:h-20 sm:w-20">
                                    {user.avatarUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={user.avatarUrl}
                                            alt={fullName(user)}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        initials(user)
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="break-words text-xl font-bold tracking-tight text-gray-950 sm:text-2xl">
                                            {fullName(user)}
                                        </h1>

                                        {user.accountType === "DEALER" && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                                <Store className="h-3.5 w-3.5" />
                                                Dealer
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-2 break-all text-sm text-gray-500">
                                        {user.email}
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <StatusBadge status={user.status} />

                                        {user.emailVerified ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Email verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700">
                                                <Clock className="h-3.5 w-3.5" />
                                                Email unverified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 sm:min-w-44">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Account type
                                </p>

                                <p className="mt-2 text-sm font-semibold text-gray-900">
                                    {user.accountType === "DEALER"
                                        ? "Dealer account"
                                        : "User account"}
                                </p>

                                <p className="mt-1 break-all text-xs text-gray-500">
                                    ID: {user.id}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ACCOUNT INFORMATION */}

                <SectionCard
                    title="Account information"
                    description="Personal information and account registration details."
                    icon={<UserRound className="h-5 w-5" />}
                >
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <DetailItem
                            label="First name"
                            value={user.firstName}
                        />

                        <DetailItem
                            label="Last name"
                            value={user.lastName}
                        />

                        <DetailItem
                            label="Email address"
                            value={
                                <span className="inline-flex items-start gap-2">
                                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                                    <span>{user.email}</span>
                                </span>
                            }
                        />

                        <DetailItem
                            label="Phone number"
                            value={
                                user.phone ? (
                                    <span className="inline-flex items-center gap-2">
                                        <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                                        {user.phone}
                                    </span>
                                ) : (
                                    "Not provided"
                                )
                            }
                        />

                        <DetailItem
                            label="Registration date"
                            value={
                                <span className="inline-flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 shrink-0 text-gray-400" />
                                    {formatDate(user.createdAt)}
                                </span>
                            }
                        />

                        <DetailItem
                            label="Last account update"
                            value={formatDate(user.updatedAt)}
                        />
                    </div>
                </SectionCard>

                {/* LISTING CREDITS */}

                <UserCreditsSection credits={user.credits} />

                {/* SUBSCRIPTION HISTORY */}

                <SubscriptionHistorySection
                    subscriptions={user.related.recentSubscriptions}
                />

                {/* ROLES AND ACCESS */}

                <SectionCard
                    title="Roles and access"
                    description="Roles currently assigned to this account."
                    icon={<ShieldCheck className="h-5 w-5" />}
                >
                    <RoleBadges roles={user.roles} />

                    <div className="mt-5 rounded-xl border border-purple-100 bg-purple-50/60 p-4">
                        <p className="text-sm font-semibold text-purple-900">
                            Access control
                        </p>

                        <p className="mt-1 text-sm leading-6 text-purple-800/80">
                            Role changes should be restricted to authorized
                            administrators and validated by the backend.
                            The role badges above show the roles returned
                            by the server.
                        </p>
                    </div>
                </SectionCard>

                <SectionCard
                    title="Account administration"
                    description="Administrative actions available for this account."
                    icon={<ShieldCheck className="h-5 w-5" />}
                >
                    <AdminUserActions user={user} />
                </SectionCard>

                {/* RELATED RECORDS */}

                <SectionCard
                    title="Related records"
                    description="Other areas of the platform associated with this user."
                    icon={<FileText className="h-5 w-5" />}
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <RelatedRecordsPlaceholder
                            title="Listings"
                            description="Review listings associated with this account."
                            icon={<Store className="h-5 w-5" />}
                        />

                        <RelatedRecordsPlaceholder
                            title="Subscriptions"
                            description="Review the user's recent subscriptions."
                            icon={<FileText className="h-5 w-5" />}
                        />

                        <RelatedRecordsPlaceholder
                            title="Payments"
                            description="Review recent payment records associated with this account."
                            icon={<CreditCard className="h-5 w-5" />}
                        />

                        <RelatedRecordsPlaceholder
                            title="Dealer applications"
                            description="Review dealer application records when applicable."
                            icon={<ShieldCheck className="h-5 w-5" />}
                        />
                    </div>
                </SectionCard>

                {/* REFRESH STATUS */}

                {userQuery.isFetching && (
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Refreshing account details...
                    </div>
                )}

            </div>
        </main>
    );
}
