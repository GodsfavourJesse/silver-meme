"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    AlertTriangle,
    CheckCircle2,
    LoaderCircle,
    Mail,
    ShieldCheck,
    ShieldOff,
    Trash2,
    UserCog,
    X,
} from "lucide-react";


import type {
    AdminUser,
    AdminUserRole,
} from "@/app/types/admin/admin-users.types";
import { useAdminUserActions } from "@/app/hooks/admin/admin-users/useAdminUserActions";

// ============================================================
// TYPES
// ============================================================

type ActionDialog =
    | "suspend"
    | "unsuspend"
    | "delete"
    | "roles"
    | "email"
    | null;

interface AdminUserActionsProps {
    user: AdminUser;
}

const AVAILABLE_ROLES: {
    value: AdminUserRole;
    label: string;
    description: string;
}[] = [
    {
        value: "CUSTOMER",
        label: "Customer",
        description: "Standard customer role.",
    },
    {
        value: "SUPPORT",
        label: "Support",
        description: "Support-related administrative access.",
    },
    {
        value: "ADMIN",
        label: "Administrator",
        description: "Administrative access as defined by backend permissions.",
    },
    {
        value: "SUPER_ADMIN",
        label: "Super administrator",
        description: "Elevated administrative access.",
    },
];

// ============================================================
// HELPERS
// ============================================================

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return "The operation could not be completed. Please try again.";
}

function getDisplayName(user: AdminUser): string {
    const name = [
        user.firstName,
        user.lastName,
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    return name || user.email;
}

// ============================================================
// SHARED DIALOG
// ============================================================

function ActionDialogShell({
    title,
    description,
    children,
    onClose,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
    onClose: () => void;
}) {
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-gray-950/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-user-action-title"
                className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl"
            >
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5 sm:p-6">
                    <div>
                        <h2
                            id="admin-user-action-title"
                            className="text-lg font-bold text-gray-950"
                        >
                            {title}
                        </h2>

                        <p className="mt-1 text-sm leading-6 text-gray-500">
                            {description}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close dialog"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-5 sm:p-6">
                    {children}
                </div>
            </section>
        </div>
    );
}

// ============================================================
// COMPONENT
// ============================================================

export default function AdminUserActions({
    user,
}: AdminUserActionsProps) {
    const {
        suspend,
        unsuspend,
        deleteUser,
        updateRoles,
        sendEmail,
    } = useAdminUserActions();

    const [dialog, setDialog] = useState<ActionDialog>(null);

    const [reason, setReason] = useState("");

    const [selectedRoles, setSelectedRoles] = useState<AdminUserRole[]>(
        user.roles,
    );

    const [emailSubject, setEmailSubject] = useState("");

    const [emailMessage, setEmailMessage] = useState("");

    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const isWorking =
        suspend.isPending ||
        unsuspend.isPending ||
        deleteUser.isPending ||
        updateRoles.isPending ||
        sendEmail.isPending;

    const closeDialog = () => {
        if (isWorking) return;

        setDialog(null);
        setReason("");
    };

    const openDialog = (nextDialog: ActionDialog) => {
        setFeedback(null);

        if (nextDialog === "roles") {
            setSelectedRoles(user.roles);
        }

        setDialog(nextDialog);
    };

    // --------------------------------------------------------
    // SUSPEND
    // --------------------------------------------------------

    async function handleSuspend() {
        const trimmedReason = reason.trim();

        if (trimmedReason.length < 3) {
            setFeedback({
                type: "error",
                message: "Enter a reason of at least 3 characters.",
            });

            return;
        }

        setFeedback(null);

        try {
            await suspend.mutateAsync({
                userId: user.id,
                input: {
                    reason: trimmedReason,
                },
            });

            setDialog(null);
            setReason("");

            setFeedback({
                type: "success",
                message: "The account has been suspended.",
            });
        } catch (error) {
            setFeedback({
                type: "error",
                message: getErrorMessage(error),
            });
        }
    }

    // --------------------------------------------------------
    // UNSUSPEND
    // --------------------------------------------------------

    async function handleUnsuspend() {
        setFeedback(null);

        try {
            await unsuspend.mutateAsync({
                userId: user.id,
                input: reason.trim()
                    ? { reason: reason.trim() }
                    : {},
            });

            setDialog(null);
            setReason("");

            setFeedback({
                type: "success",
                message: "The account has been restored.",
            });
        } catch (error) {
            setFeedback({
                type: "error",
                message: getErrorMessage(error),
            });
        }
    }

    // --------------------------------------------------------
    // DELETE
    // --------------------------------------------------------

    async function handleDelete() {
        const trimmedReason = reason.trim();

        if (trimmedReason.length < 3) {
            setFeedback({
                type: "error",
                message: "Enter a reason of at least 3 characters.",
            });

            return;
        }

        setFeedback(null);

        try {
            await deleteUser.mutateAsync({
                userId: user.id,
                input: {
                    reason: trimmedReason,
                },
            });

            setDialog(null);
            setReason("");

            setFeedback({
                type: "success",
                message: "The account has been marked as deleted.",
            });
        } catch (error) {
            setFeedback({
                type: "error",
                message: getErrorMessage(error),
            });
        }
    }

    // --------------------------------------------------------
    // ROLE MANAGEMENT
    // --------------------------------------------------------

    function toggleRole(role: AdminUserRole) {
        setSelectedRoles((previous) => {
            if (previous.includes(role)) {
                return previous.filter((item) => item !== role);
            }

            if (previous.length >= 4) {
                return previous;
            }

            return [...previous, role];
        });
    }

    async function handleUpdateRoles() {
        if (selectedRoles.length < 1) {
            setFeedback({
                type: "error",
                message: "At least one role must be selected.",
            });

            return;
        }

        setFeedback(null);

        try {
            await updateRoles.mutateAsync({
                userId: user.id,
                input: {
                    roles: selectedRoles,
                },
            });

            setDialog(null);

            setFeedback({
                type: "success",
                message: "User roles have been updated.",
            });
        } catch (error) {
            setFeedback({
                type: "error",
                message: getErrorMessage(error),
            });
        }
    }

    // --------------------------------------------------------
    // EMAIL
    // --------------------------------------------------------

    async function handleSendEmail() {
        const subject = emailSubject.trim();
        const message = emailMessage.trim();

        if (!subject || !message) {
            setFeedback({
                type: "error",
                message: "Enter both an email subject and message.",
            });

            return;
        }

        setFeedback(null);

        try {
            await sendEmail.mutateAsync({
                userId: user.id,
                input: {
                    subject,
                    message,
                },
            });

            setDialog(null);
            setEmailSubject("");
            setEmailMessage("");

            setFeedback({
                type: "success",
                message: "The email request completed successfully.",
            });
        } catch (error) {
            setFeedback({
                type: "error",
                message: getErrorMessage(error),
            });
        }
    }

    // --------------------------------------------------------
    // RENDER
    // --------------------------------------------------------

    return (
        <div className="space-y-5">

            {/* ACTIONS HEADER */}

            <div>
                <h2 className="text-lg font-bold text-gray-950">
                    Account actions
                </h2>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                    Manage this account and its access to the platform.
                </p>
            </div>

            {/* FEEDBACK */}

            {feedback && (
                <div
                    role="status"
                    className={`flex items-start gap-3 rounded-xl border p-4 ${
                        feedback.type === "success"
                            ? "border-emerald-100 bg-emerald-50 text-emerald-800"
                            : "border-red-100 bg-red-50 text-red-800"
                    }`}
                >
                    {feedback.type === "success" ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                    ) : (
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                    )}

                    <p className="text-sm leading-6">
                        {feedback.message}
                    </p>

                    <button
                        type="button"
                        onClick={() => setFeedback(null)}
                        aria-label="Dismiss notification"
                        className="ml-auto rounded-lg p-1 opacity-70 hover:opacity-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* ACTION BUTTONS */}

            <div className="grid gap-3 sm:grid-cols-2">

                <button
                    type="button"
                    onClick={() => openDialog("email")}
                    disabled={isWorking || user.status === "DELETED"}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-purple-200 hover:bg-purple-50/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                        <Mail className="h-5 w-5" />
                    </span>

                    <span>
                        <span className="block text-sm font-semibold text-gray-900">
                            Send email
                        </span>

                        <span className="mt-1 block text-xs text-gray-500">
                            Contact this user
                        </span>
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => openDialog("roles")}
                    disabled={isWorking || user.status === "DELETED"}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-purple-200 hover:bg-purple-50/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                        <UserCog className="h-5 w-5" />
                    </span>

                    <span>
                        <span className="block text-sm font-semibold text-gray-900">
                            Manage roles
                        </span>

                        <span className="mt-1 block text-xs text-gray-500">
                            Update account permissions
                        </span>
                    </span>
                </button>

                {user.status === "ACTIVE" && (
                    <button
                        type="button"
                        onClick={() => openDialog("suspend")}
                        disabled={isWorking}
                        className="flex items-center gap-3 rounded-xl border border-amber-200 bg-white p-4 text-left transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                            <ShieldOff className="h-5 w-5" />
                        </span>

                        <span>
                            <span className="block text-sm font-semibold text-gray-900">
                                Suspend account
                            </span>

                            <span className="mt-1 block text-xs text-gray-500">
                                Restrict account access
                            </span>
                        </span>
                    </button>
                )}

                {user.status === "SUSPENDED" && (
                    <button
                        type="button"
                        onClick={() => openDialog("unsuspend")}
                        disabled={isWorking}
                        className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-white p-4 text-left transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                            <ShieldCheck className="h-5 w-5" />
                        </span>

                        <span>
                            <span className="block text-sm font-semibold text-gray-900">
                                Unsuspend account
                            </span>

                            <span className="mt-1 block text-xs text-gray-500">
                                Restore account access
                            </span>
                        </span>
                    </button>
                )}

                {user.status !== "DELETED" && (
                    <button
                        type="button"
                        onClick={() => openDialog("delete")}
                        disabled={isWorking}
                        className="flex items-center gap-3 rounded-xl border border-red-200 bg-white p-4 text-left transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700">
                            <Trash2 className="h-5 w-5" />
                        </span>

                        <span>
                            <span className="block text-sm font-semibold text-red-700">
                                Delete account
                            </span>

                            <span className="mt-1 block text-xs text-gray-500">
                                Mark this account as deleted
                            </span>
                        </span>
                    </button>
                )}
            </div>

            {user.status === "DELETED" && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-800">
                        This account has been deleted.
                    </p>

                    <p className="mt-1 text-sm leading-6 text-red-700">
                        Account modification actions are unavailable for this
                        account in the current interface.
                    </p>
                </div>
            )}

            {/* =================================================
                SUSPEND DIALOG
            ================================================= */}

            {dialog === "suspend" && (
                <ActionDialogShell
                    title="Suspend account"
                    description={`Suspend ${getDisplayName(user)}?`}
                    onClose={closeDialog}
                >
                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                        <p className="text-sm leading-6 text-amber-900">
                            Suspending this account may restrict the user's
                            access according to your backend's account-status
                            rules.
                        </p>
                    </div>

                    <label
                        htmlFor="suspend-reason"
                        className="mt-5 block text-sm font-semibold text-gray-700"
                    >
                        Reason <span className="text-red-500">*</span>
                    </label>

                    <textarea
                        id="suspend-reason"
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        maxLength={1000}
                        rows={4}
                        placeholder="Explain why this account is being suspended..."
                        className="mt-2 w-full resize-y rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />

                    <p className="mt-1 text-right text-xs text-gray-400">
                        {reason.length}/1000
                    </p>

                    <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={closeDialog}
                            disabled={isWorking}
                            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleSuspend}
                            disabled={isWorking || reason.trim().length < 3}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {suspend.isPending && (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            )}

                            Confirm suspension
                        </button>
                    </div>
                </ActionDialogShell>
            )}

            {/* =================================================
                UNSUSPEND DIALOG
            ================================================= */}

            {dialog === "unsuspend" && (
                <ActionDialogShell
                    title="Restore account"
                    description={`Restore access for ${getDisplayName(user)}?`}
                    onClose={closeDialog}
                >
                    <p className="text-sm leading-6 text-gray-600">
                        This will request that the backend restore the
                        account's status. You may optionally provide a reason
                        for the administrative record.
                    </p>

                    <label
                        htmlFor="unsuspend-reason"
                        className="mt-5 block text-sm font-semibold text-gray-700"
                    >
                        Reason <span className="text-gray-400">(optional)</span>
                    </label>

                    <textarea
                        id="unsuspend-reason"
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        maxLength={1000}
                        rows={3}
                        placeholder="Optional explanation..."
                        className="mt-2 w-full resize-y rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />

                    <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={closeDialog}
                            disabled={isWorking}
                            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleUnsuspend}
                            disabled={isWorking}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {unsuspend.isPending && (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            )}

                            Restore account
                        </button>
                    </div>
                </ActionDialogShell>
            )}

            {/* =================================================
                DELETE DIALOG
            ================================================= */}

            {dialog === "delete" && (
                <ActionDialogShell
                    title="Delete account"
                    description={`Delete ${getDisplayName(user)}?`}
                    onClose={closeDialog}
                >
                    <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                            <div>
                                <p className="text-sm font-semibold text-red-900">
                                    This action requires careful consideration.
                                </p>

                                <p className="mt-1 text-sm leading-6 text-red-800">
                                    The backend determines whether deletion is
                                    reversible and what happens to associated
                                    records. Confirm that this action is
                                    appropriate before proceeding.
                                </p>
                            </div>
                        </div>
                    </div>

                    <label
                        htmlFor="delete-reason"
                        className="mt-5 block text-sm font-semibold text-gray-700"
                    >
                        Reason <span className="text-red-500">*</span>
                    </label>

                    <textarea
                        id="delete-reason"
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        maxLength={1000}
                        rows={3}
                        placeholder="Explain why this account is being deleted..."
                        className="mt-2 w-full resize-y rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />

                    <p className="mt-1 text-right text-xs text-gray-400">
                        {reason.length}/1000
                    </p>

                    <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={closeDialog}
                            disabled={isWorking}
                            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isWorking || reason.trim().length < 3}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {deleteUser.isPending && (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            )}

                            Confirm deletion
                        </button>
                    </div>
                </ActionDialogShell>
            )}

            {/* =================================================
                ROLE MANAGEMENT DIALOG
            ================================================= */}

            {dialog === "roles" && (
                <ActionDialogShell
                    title="Manage user roles"
                    description={`Update the roles assigned to ${getDisplayName(user)}.`}
                    onClose={closeDialog}
                >
                    <div className="space-y-3">
                        {AVAILABLE_ROLES.map((role) => {
                            const checked = selectedRoles.includes(role.value);

                            return (
                                <label
                                    key={role.value}
                                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                                        checked
                                            ? "border-purple-300 bg-purple-50/60"
                                            : "border-gray-200 hover:bg-gray-50"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleRole(role.value)}
                                        className="mt-1 h-4 w-4 accent-purple-600"
                                    />

                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-semibold text-gray-900">
                                            {role.label}
                                        </span>

                                        <span className="mt-1 block text-xs leading-5 text-gray-500">
                                            {role.description}
                                        </span>
                                    </span>
                                </label>
                            );
                        })}
                    </div>

                    <p className="mt-3 text-xs text-gray-500">
                        Select between 1 and 4 roles. Elevated roles must
                        still be authorized by your backend.
                    </p>

                    <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={closeDialog}
                            disabled={isWorking}
                            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleUpdateRoles}
                            disabled={
                                isWorking ||
                                selectedRoles.length === 0 ||
                                (
                                    selectedRoles.length === user.roles.length &&
                                    selectedRoles.every((role) =>
                                        user.roles.includes(role),
                                    )
                                )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {updateRoles.isPending && (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            )}

                            Save roles
                        </button>
                    </div>
                </ActionDialogShell>
            )}

            {/* =================================================
                EMAIL DIALOG
            ================================================= */}

            {dialog === "email" && (
                <ActionDialogShell
                    title="Send email"
                    description={`Compose a message to ${getDisplayName(user)}.`}
                    onClose={closeDialog}
                >
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Recipient
                        </p>

                        <p className="mt-1 break-all text-sm font-semibold text-gray-800">
                            {user.email}
                        </p>
                    </div>

                    <label
                        htmlFor="email-subject"
                        className="mt-5 block text-sm font-semibold text-gray-700"
                    >
                        Subject
                    </label>

                    <input
                        id="email-subject"
                        type="text"
                        value={emailSubject}
                        onChange={(event) => setEmailSubject(event.target.value)}
                        maxLength={200}
                        placeholder="Enter email subject"
                        className="mt-2 w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />

                    <label
                        htmlFor="email-message"
                        className="mt-4 block text-sm font-semibold text-gray-700"
                    >
                        Message
                    </label>

                    <textarea
                        id="email-message"
                        value={emailMessage}
                        onChange={(event) => setEmailMessage(event.target.value)}
                        maxLength={10000}
                        rows={6}
                        placeholder="Write your message..."
                        className="mt-2 w-full resize-y rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />

                    <p className="mt-1 text-right text-xs text-gray-400">
                        {emailMessage.length}/10000
                    </p>

                    <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={closeDialog}
                            disabled={isWorking}
                            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleSendEmail}
                            disabled={
                                isWorking ||
                                !emailSubject.trim() ||
                                !emailMessage.trim()
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {sendEmail.isPending ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                                <Mail className="h-4 w-4" />
                            )}

                            Send email
                        </button>
                    </div>
                </ActionDialogShell>
            )}
        </div>
    );
}