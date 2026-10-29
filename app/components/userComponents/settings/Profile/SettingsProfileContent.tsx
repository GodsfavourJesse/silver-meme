"use client";

import {
    useEffect,
    useState,
    type FormEvent,
    type ReactNode,
} from "react";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Info,
    LoaderCircle,
    LockKeyhole,
    Mail,
    Phone,
    Save,
    ShieldCheck,
    Trash2,
    UserRound,
    X,
    Settings2,
    Eye,
    CircleHelp,
    LogOut,
} from "lucide-react";

import { queryKeys } from "@/app/lib/query/query-keys";

import { useUserProfile } from "@/app/hooks/user/profile/useUserProfile";
import { useUserPrivacySettings } from "@/app/hooks/user/profile/useUserPrivacySettings";
import { useUpdateUserProfile } from "@/app/hooks/user/profile/useUpdateUserProfile";
import { useUpdateUserPrivacySettings } from "@/app/hooks/user/profile/useUpdateUserPrivacySettings";
import { useDeleteUserAccount } from "@/app/hooks/user/profile/useDeleteUserAccount";

const BRAND = "#1491FF";

type Variant = "desktop" | "mobile";

type SectionId =
    | "profile"
    | "account"
    | "privacy"
    | "security";

interface Notice {
    type: "success" | "error";
    message: string;
}

interface PrivacyOption {
    key:
        | "showPhone"
        | "showEmail"
        | "allowDirectMessages"
        | "showOnlineStatus"
        | "allowMarketingEmails"
        | "allowMarketingSms";
    title: string;
    description: string;
}

const PRIVACY_OPTIONS: PrivacyOption[] = [
    {
        key: "showPhone",
        title: "Show my phone number",
        description:
            "Allow your phone number to appear publicly where supported.",
    },
    {
        key: "showEmail",
        title: "Show my email address",
        description:
            "Allow your email address to be displayed on supported profile areas.",
    },
    {
        key: "allowDirectMessages",
        title: "Allow direct messages",
        description:
            "Let other users contact you through available messaging features.",
    },
    {
        key: "showOnlineStatus",
        title: "Show online status",
        description:
            "Allow other users to see your online status where supported.",
    },
    {
        key: "allowMarketingEmails",
        title: "Marketing emails",
        description:
            "Receive product news, updates, and occasional offers from KARMASS.",
    },
    {
        key: "allowMarketingSms",
        title: "Marketing SMS",
        description:
            "Receive promotional text messages from KARMASS.",
    },
];

const SECTIONS: {
    id: SectionId;
    label: string;
    description: string;
    icon: typeof UserRound;
}[] = [
    {
        id: "profile",
        label: "Personal information",
        description: "Your name and contact details",
        icon: UserRound,
    },
    {
        id: "account",
        label: "Account information",
        description: "Your membership and account status",
        icon: ShieldCheck,
    },
    {
        id: "privacy",
        label: "Privacy preferences",
        description: "Choose what others can see",
        icon: Eye,
    },
    {
        id: "security",
        label: "Account security",
        description: "Account protection and deletion",
        icon: LockKeyhole,
    },
];

function getInitials(
    firstName?: string | null,
    lastName?: string | null,
): string {
    const first = firstName?.trim().charAt(0) ?? "";
    const last = lastName?.trim().charAt(0) ?? "";

    return `${first}${last}`.toUpperCase() || "K";
}

function getDisplayName(
    firstName?: string | null,
    lastName?: string | null,
): string {
    return [firstName?.trim(), lastName?.trim()]
        .filter(Boolean)
        .join(" ") || "KARMASS member";
}

function formatDate(value?: string | null): string {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

function getErrorMessage(
    error: unknown,
    fallback: string,
): string {
    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    return fallback;
}

function SectionHeading({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description: string;
}) {
    return (
        <div className="mb-6">
            <p
                className="text-[11px] font-bold uppercase tracking-[0.13em]"
                style={{ color: BRAND }}
            >
                {eyebrow}
            </p>

            <h2 className="mt-1.5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                {title}
            </h2>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                {description}
            </p>
        </div>
    );
}

function Panel({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={[
                "rounded-2xl border border-slate-200 bg-white",
                "p-4 sm:p-6",
                className,
            ].join(" ")}
        >
            {children}
        </section>
    );
}

function StatusMessage({
    notice,
    onDismiss,
}: {
    notice: Notice;
    onDismiss?: () => void;
}) {
    const success = notice.type === "success";

    return (
        <div
            role={success ? "status" : "alert"}
            className={[
                "flex items-start gap-3 rounded-xl border p-3.5",
                success
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-700",
            ].join(" ")}
        >
            {success ? (
                <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            ) : (
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
            )}

            <p className="min-w-0 flex-1 text-sm leading-5">
                {notice.message}
            </p>

            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label="Dismiss message"
                    className="rounded-lg p-1 transition hover:bg-black/5"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
}

function LoadingPanel({ message }: { message: string }) {
    return (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/70 px-5 py-8 text-center">
            <LoaderCircle
                size={24}
                className="animate-spin"
                style={{ color: BRAND }}
            />

            <p className="mt-3 text-sm font-semibold text-slate-800">
                {message}
            </p>

            <p className="mt-1 text-xs text-slate-500">
                This should only take a moment.
            </p>
        </div>
    );
}

function Toggle({
    checked,
    disabled,
    onChange,
    label,
}: {
    checked: boolean;
    disabled?: boolean;
    onChange: () => void;
    label: string;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={onChange}
            className={[
                "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full",
                "transition-colors duration-200 focus-visible:outline-none",
                "focus-visible:ring-4 focus-visible:ring-[#1491FF]/20",
                checked ? "bg-[#1491FF]" : "bg-slate-300",
                disabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer",
            ].join(" ")}
        >
            <motion.span
                initial={false}
                animate={{ x: checked ? 21 : 3 }}
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
                className="absolute h-[18px] w-[18px] rounded-full bg-white shadow-sm"
            />
        </button>
    );
}

function Field({
    id,
    label,
    icon: Icon,
    value,
    onChange,
    type = "text",
    placeholder,
    autoComplete,
    readOnly = false,
    help,
    required = false,
    disabled = false,
    maxLength,
}: {
    id: string;
    label: string;
    icon: typeof UserRound;
    value: string;
    onChange?: (value: string) => void;
    type?: string;
    placeholder?: string;
    autoComplete?: string;
    readOnly?: boolean;
    help?: string;
    required?: boolean;
    disabled?: boolean;
    maxLength?: number;
}) {
    return (
        <div className="min-w-0">
            <label
                htmlFor={id}
                className="mb-2 block text-sm font-semibold text-slate-800"
            >
                {label}
                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            <div
                className={[
                    "flex min-h-12 items-center gap-3 rounded-xl border px-3.5",
                    "transition focus-within:ring-4",
                    readOnly
                        ? "border-slate-200 bg-slate-50"
                        : "border-slate-200 bg-white focus-within:border-[#1491FF] focus-within:ring-[#1491FF]/10",
                ].join(" ")}
            >
                <Icon
                    size={17}
                    className="shrink-0 text-slate-400"
                />

                <input
                    id={id}
                    name={id}
                    type={type}
                    value={value}
                    onChange={(event) => onChange?.(event.target.value)}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    readOnly={readOnly}
                    required={required}
                    disabled={disabled}
                    maxLength={maxLength}
                    className="h-12 w-full min-w-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 read-only:cursor-not-allowed disabled:cursor-not-allowed"
                />
            </div>

            {help && (
                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    {help}
                </p>
            )}
        </div>
    );
}

function ProfileAvatar({
    initials,
    size = "large",
}: {
    initials: string;
    size?: "small" | "large";
}) {
    return (
        <div
            className={[
                "flex shrink-0 items-center justify-center rounded-2xl font-bold text-white",
                size === "large"
                    ? "h-16 w-16 text-lg"
                    : "h-12 w-12 text-sm",
            ].join(" ")}
            style={{ backgroundColor: BRAND }}
        >
            {initials}
        </div>
    );
}

export default function SettingsProfileContent({
    variant,
}: {
    variant: Variant;
}) {
    const isMobile = variant === "mobile";
    const router = useRouter();
    const queryClient = useQueryClient();
    const shouldReduceMotion = useReducedMotion();

    const profileQuery = useUserProfile();
    const privacyQuery = useUserPrivacySettings();

    const updateProfile = useUpdateUserProfile();
    const updatePrivacy = useUpdateUserPrivacySettings();
    const deleteAccount = useDeleteUserAccount();

    const user = profileQuery.data;
    const privacy = privacyQuery.data;

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");

    const [notice, setNotice] = useState<Notice | null>(null);
    const [privacyError, setPrivacyError] = useState("");

    const [activeSection, setActiveSection] =
        useState<SectionId>("profile");

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
        useState(false);

    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [deleteError, setDeleteError] = useState("");

    useEffect(() => {
        if (!user) return;

        setFirstName(user.firstName ?? "");
        setLastName(user.lastName ?? "");
        setPhone(user.phone ?? "");
    }, [
        user?.id,
        user?.firstName,
        user?.lastName,
        user?.phone,
    ]);

    useEffect(() => {
        if (!isMobile) return;

        const onHashChange = () => {
            const hash = window.location.hash.replace("#", "");

            if (
                hash === "account-information" ||
                hash === "privacy-settings" ||
                hash === "danger-zone"
            ) {
                setActiveSection(
                    hash === "account-information"
                        ? "account"
                        : hash === "privacy-settings"
                          ? "privacy"
                          : "security",
                );
            }
        };

        window.addEventListener("hashchange", onHashChange);

        return () => {
            window.removeEventListener("hashchange", onHashChange);
        };
    }, [isMobile]);

    const isProfileDirty = Boolean(
        user &&
            (
                firstName !== (user.firstName ?? "") ||
                lastName !== (user.lastName ?? "") ||
                phone !== (user.phone ?? "")
            ),
    );

    const displayName = getDisplayName(
        user?.firstName,
        user?.lastName,
    );

    const initials = getInitials(
        user?.firstName,
        user?.lastName,
    );

    const transition = shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.22, ease: "easeOut" as const };

    async function handleProfileSubmit(
        event: FormEvent<HTMLFormElement>,
    ): Promise<void> {
        event.preventDefault();

        if (!user || updateProfile.isPending) return;

        const normalizedFirstName = firstName.trim();
        const normalizedLastName = lastName.trim();
        const normalizedPhone = phone.trim();

        if (
            normalizedFirstName.length < 2 ||
            normalizedFirstName.length > 100
        ) {
            setNotice({
                type: "error",
                message: "First name must contain between 2 and 100 characters.",
            });
            return;
        }

        if (
            normalizedLastName.length < 2 ||
            normalizedLastName.length > 100
        ) {
            setNotice({
                type: "error",
                message: "Last name must contain between 2 and 100 characters.",
            });
            return;
        }

        if (
            normalizedPhone &&
            (
                normalizedPhone.length < 7 ||
                normalizedPhone.length > 30 ||
                !/^[+0-9().\-\s]+$/.test(normalizedPhone)
            )
        ) {
            setNotice({
                type: "error",
                message: "Enter a valid phone number.",
            });
            return;
        }

        setNotice(null);

        try {
            await updateProfile.mutateAsync({
                firstName: normalizedFirstName,
                lastName: normalizedLastName,
                phone: normalizedPhone || null,
            });

            setNotice({
                type: "success",
                message: "Your profile has been updated.",
            });

            await queryClient.invalidateQueries({
                queryKey: queryKeys.auth.currentUser(),
            });
        } catch (error: unknown) {
            setNotice({
                type: "error",
                message: getErrorMessage(
                    error,
                    "We couldn't update your profile. Please try again.",
                ),
            });
        }
    }

    async function handlePrivacyChange(
        key: keyof NonNullable<typeof privacy>,
        nextValue: boolean,
    ): Promise<void> {
        if (!privacy || updatePrivacy.isPending) return;

        setPrivacyError("");

        try {
            await updatePrivacy.mutateAsync({
                [key]: nextValue,
            });

            setNotice({
                type: "success",
                message: "Your privacy preferences have been saved.",
            });
        } catch (error: unknown) {
            setPrivacyError(
                getErrorMessage(
                    error,
                    "We couldn't save this setting. Please try again.",
                ),
            );
        }
    }

    async function handleDeleteAccount(): Promise<void> {
        if (
            deleteConfirmation.trim() !== "DELETE" ||
            deleteAccount.isPending
        ) {
            return;
        }

        setDeleteError("");

        try {
            await deleteAccount.mutateAsync();

            await queryClient.cancelQueries();
            queryClient.clear();

            router.replace("/login");
            router.refresh();
        } catch (error: unknown) {
            setDeleteError(
                getErrorMessage(
                    error,
                    "We couldn't delete your account. Please try again.",
                ),
            );
        }
    }

    function scrollToSection(
        section: SectionId,
    ) {
        setActiveSection(section);

        const id =
            section === "profile"
                ? "personal-information"
                : section === "account"
                  ? "account-information"
                  : section === "privacy"
                    ? "privacy-settings"
                    : "danger-zone";

        document.getElementById(id)?.scrollIntoView({
            behavior: shouldReduceMotion ? "auto" : "smooth",
            block: "start",
        });
    }

    const pageAnimation = {
        initial: shouldReduceMotion
            ? false
            : { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition,
    };

    const profileLoadFailed = profileQuery.isError && !user;
    const privacyLoadFailed = privacyQuery.isError && !privacy;

    return (
        <main className="min-h-screen bg-[#F5F8FC] text-slate-900">
            {/* Top bar */}
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        onClick={() => router.push("/dashboard")}
                        className="inline-flex h-10 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                        <ArrowLeft size={18} />
                        <span className={isMobile ? "hidden sm:inline" : ""}>
                            Dashboard
                        </span>
                    </button>

                    <div className="flex items-center gap-2">
                        <span
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                            style={{ backgroundColor: BRAND }}
                        >
                            <Settings2 size={17} />
                        </span>

                        <span className="text-sm font-bold tracking-tight text-slate-900">
                            Account settings
                        </span>
                    </div>

                    <div className="w-10" aria-hidden="true" />
                </div>
            </header>

            <div
                className={[
                    "mx-auto max-w-[1440px]",
                    isMobile
                        ? "px-4 pb-28 pt-5"
                        : "px-5 pb-12 pt-8 sm:px-8 lg:px-10",
                ].join(" ")}
            >
                {/* Page introduction */}
                <motion.div {...pageAnimation} className="mb-6 sm:mb-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p
                                className="text-xs font-bold uppercase tracking-[0.13em]"
                                style={{ color: BRAND }}
                            >
                                YOUR KARMASS ACCOUNT
                            </p>

                            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                                Profile & settings
                            </h1>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                Manage your personal details and decide how
                                you want to use KARMASS.
                            </p>
                        </div>

                        {user && !isMobile && (
                            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                <ProfileAvatar initials={initials} size="small" />

                                <div className="min-w-0">
                                    <p className="max-w-56 truncate text-sm font-semibold text-slate-900">
                                        {displayName}
                                    </p>

                                    <p className="max-w-56 truncate text-xs text-slate-500">
                                        {user.email || user.phone || "KARMASS member"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Mobile profile summary */}
                {isMobile && user && (
                    <motion.div
                        {...pageAnimation}
                        className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"
                    >
                        <ProfileAvatar initials={initials} />

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-base font-bold text-slate-900">
                                {displayName}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                                {user.email || user.phone || "KARMASS member"}
                            </p>

                            <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                                <CheckCircle2 size={13} />
                                Account settings
                            </span>
                        </div>

                        <button
                            type="button"
                            aria-label="Edit personal information"
                            onClick={() => scrollToSection("profile")}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1491FF]/10"
                            style={{ color: BRAND }}
                        >
                            <UserRound size={18} />
                        </button>
                    </motion.div>
                )}

                {/* Mobile section navigation */}
                {isMobile && (
                    <div className="-mx-4 mb-5 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <div className="flex w-max gap-2">
                            {SECTIONS.map((section) => {
                                const Icon = section.icon;
                                const active = activeSection === section.id;

                                return (
                                    <button
                                        key={section.id}
                                        type="button"
                                        onClick={() => scrollToSection(section.id)}
                                        className={[
                                            "inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold transition",
                                            active
                                                ? "border-[#1491FF] bg-[#1491FF] text-white"
                                                : "border-slate-200 bg-white text-slate-600",
                                        ].join(" ")}
                                    >
                                        <Icon size={14} />
                                        {section.label === "Personal information"
                                            ? "Personal"
                                            : section.label === "Account information"
                                              ? "Account"
                                              : section.label === "Privacy preferences"
                                                ? "Privacy"
                                                : "Security"}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {notice && (
                    <div className="mb-5">
                        <StatusMessage
                            notice={notice}
                            onDismiss={() => setNotice(null)}
                        />
                    </div>
                )}

                <div
                    className={[
                        "grid items-start gap-5 lg:gap-6",
                        isMobile
                            ? "grid-cols-1"
                            : "grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px]",
                    ].join(" ")}
                >
                    <div className="min-w-0 space-y-5 sm:space-y-6">
                        {/* Personal information */}
                        <motion.section
                            {...pageAnimation}
                            id="personal-information"
                            className="scroll-mt-24"
                        >
                            <Panel>
                                <SectionHeading
                                    eyebrow="Your details"
                                    title="Personal information"
                                    description="Keep your name and contact details up to date."
                                />

                                {profileQuery.isLoading ? (
                                    <LoadingPanel message="Loading your profile" />
                                ) : profileLoadFailed ? (
                                    <StatusMessage
                                        notice={{
                                            type: "error",
                                            message: "We couldn't load your profile. Please try again.",
                                        }}
                                    />
                                ) : user ? (
                                    <form
                                        id="profile-form"
                                        onSubmit={handleProfileSubmit}
                                        className="space-y-5"
                                    >
                                        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3.5">
                                            <ProfileAvatar initials={initials} size="small" />

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-slate-900">
                                                    {displayName}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    Personal account
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Field
                                                id="firstName"
                                                label="First name"
                                                icon={UserRound}
                                                value={firstName}
                                                onChange={(value) => {
                                                    setFirstName(value);
                                                    setNotice(null);
                                                }}
                                                autoComplete="given-name"
                                                required
                                                maxLength={100}
                                            />

                                            <Field
                                                id="lastName"
                                                label="Last name"
                                                icon={UserRound}
                                                value={lastName}
                                                onChange={(value) => {
                                                    setLastName(value);
                                                    setNotice(null);
                                                }}
                                                autoComplete="family-name"
                                                required
                                                maxLength={100}
                                            />

                                            <Field
                                                id="profileEmail"
                                                label="Email address"
                                                icon={Mail}
                                                value={user.email ?? ""}
                                                readOnly
                                                help="Email changes aren't available from this screen."
                                            />

                                            <Field
                                                id="profilePhone"
                                                label="Phone number"
                                                icon={Phone}
                                                value={phone}
                                                onChange={(value) => {
                                                    setPhone(value);
                                                    setNotice(null);
                                                }}
                                                type="tel"
                                                autoComplete="tel"
                                                placeholder="+234 800 000 0000"
                                                maxLength={30}
                                                help="Leave empty if you don't want a phone number saved."
                                            />
                                        </div>

                                        {!isMobile && (
                                            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                                <p className="text-xs text-slate-500">
                                                    Changes are saved to your account.
                                                </p>

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        !isProfileDirty ||
                                                        updateProfile.isPending
                                                    }
                                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0876D1] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1491FF]/20 disabled:cursor-not-allowed disabled:opacity-50"
                                                    style={{ backgroundColor: BRAND }}
                                                >
                                                    {updateProfile.isPending ? (
                                                        <LoaderCircle size={17} className="animate-spin" />
                                                    ) : (
                                                        <Save size={17} />
                                                    )}

                                                    {updateProfile.isPending
                                                        ? "Saving changes..."
                                                        : "Save changes"}
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                ) : null}
                            </Panel>
                        </motion.section>

                        {/* Account information */}
                        <motion.section
                            {...pageAnimation}
                            id="account-information"
                            className="scroll-mt-24"
                        >
                            <Panel>
                                <SectionHeading
                                    eyebrow="Account overview"
                                    title="Account information"
                                    description="Review the details associated with your KARMASS account."
                                />

                                {profileQuery.isLoading ? (
                                    <LoadingPanel message="Loading account information" />
                                ) : profileLoadFailed ? (
                                    <StatusMessage
                                        notice={{
                                            type: "error",
                                            message: "Account information is currently unavailable.",
                                        }}
                                    />
                                ) : user ? (
                                    <div className="divide-y divide-slate-100">
                                        <AccountRow
                                            icon={Mail}
                                            title="Email verification"
                                            description="Verification status of your email address"
                                            value={user.emailVerified ? "Verified" : "Not verified"}
                                            positive={Boolean(user.emailVerified)}
                                        />

                                        <AccountRow
                                            icon={ShieldCheck}
                                            title="Account type"
                                            description="Your account category"
                                            value={String(user.accountType)
                                                .replace(/[_-]+/g, " ")
                                                .toLowerCase()}
                                            blue
                                        />

                                        <AccountRow
                                            icon={CheckCircle2}
                                            title="Account status"
                                            description="Current account standing"
                                            value={String(user.status)
                                                .replace(/[_-]+/g, " ")
                                                .toLowerCase()}
                                            positive={String(user.status).toLowerCase() === "active"}
                                        />

                                        <AccountRow
                                            icon={Clock3}
                                            title="Member since"
                                            description="When you joined KARMASS"
                                            value={formatDate(user.createdAt)}
                                        />
                                    </div>
                                ) : null}
                            </Panel>
                        </motion.section>

                        {/* Privacy settings */}
                        <motion.section
                            {...pageAnimation}
                            id="privacy-settings"
                            className="scroll-mt-24"
                        >
                            <Panel>
                                <SectionHeading
                                    eyebrow="Your preferences"
                                    title="Privacy preferences"
                                    description="Choose how your information and communication preferences are handled."
                                />

                                {privacyError && (
                                    <div className="mb-4">
                                        <StatusMessage
                                            notice={{
                                                type: "error",
                                                message: privacyError,
                                            }}
                                        />
                                    </div>
                                )}

                                {privacyQuery.isLoading ? (
                                    <LoadingPanel message="Loading privacy settings" />
                                ) : privacyLoadFailed ? (
                                    <div className="space-y-4">
                                        <StatusMessage
                                            notice={{
                                                type: "error",
                                                message: "We couldn't load your privacy settings.",
                                            }}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => void privacyQuery.refetch()}
                                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50"
                                            style={{ color: BRAND }}
                                        >
                                            Try again
                                        </button>
                                    </div>
                                ) : privacy ? (
                                    <div className="divide-y divide-slate-100">
                                        {PRIVACY_OPTIONS.map((option) => {
                                            const isPhoneOption = option.key === "showPhone";
                                            const phoneToggleDisabled =
                                                isPhoneOption && !privacy.canShowPhone;

                                            return (
                                                <div
                                                    key={option.key}
                                                    className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                                                >
                                                    <div className="min-w-0 flex-1 pr-1">
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {option.title}
                                                        </p>

                                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                                            {option.description}
                                                        </p>

                                                        {isPhoneOption && !privacy.canShowPhone && (
                                                            <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-amber-700">
                                                                <Info size={14} className="mt-0.5 shrink-0" />
                                                                Dealer verification is required to display your phone number.
                                                            </p>
                                                        )}
                                                    </div>

                                                    <Toggle
                                                        label={option.title}
                                                        checked={Boolean(privacy[option.key])}
                                                        disabled={
                                                            updatePrivacy.isPending ||
                                                            phoneToggleDisabled
                                                        }
                                                        onChange={() => {
                                                            void handlePrivacyChange(
                                                                option.key,
                                                                !privacy[option.key],
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : null}

                                <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                                    <LockKeyhole
                                        size={17}
                                        className="mt-0.5 shrink-0"
                                        style={{ color: BRAND }}
                                    />

                                    <p className="text-xs leading-5 text-slate-500">
                                        Your preferences are saved to your account.
                                        Visibility may also depend on how each feature
                                        is supported across KARMASS.
                                    </p>
                                </div>
                            </Panel>
                        </motion.section>

                        {/* Security / account deletion */}
                        <motion.section
                            {...pageAnimation}
                            id="danger-zone"
                            className="scroll-mt-24 overflow-hidden rounded-2xl border border-red-200 bg-white"
                        >
                            <div className="flex items-start gap-3 border-b border-red-100 bg-red-50/70 p-4 sm:p-5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                                    <Trash2 size={19} />
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-red-800">
                                        Delete account
                                    </h2>

                                    <p className="mt-1 text-xs leading-5 text-red-700/80">
                                        This action affects your account access and listings.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                                <p className="max-w-2xl text-sm leading-6 text-slate-600">
                                    Your profile will be anonymized, active listings
                                    suspended, and your sessions revoked. This action
                                    cannot be undone through this page.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setDeleteConfirmation("");
                                        setDeleteError("");
                                        setIsDeleteDialogOpen(true);
                                    }}
                                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                    <Trash2 size={16} />
                                    Delete account
                                </button>
                            </div>
                        </motion.section>
                    </div>

                    {/* Desktop side panel */}
                    {!isMobile && (
                        <aside className="sticky top-24 hidden space-y-4 xl:block">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                <div
                                    className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                                    style={{ backgroundColor: BRAND }}
                                >
                                    <ShieldCheck size={21} />
                                </div>

                                <h2 className="mt-4 text-lg font-bold text-slate-900">
                                    Your account, your control.
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Keep your details accurate and choose the
                                    privacy settings that work for you.
                                </p>

                                <div className="mt-5 space-y-1">
                                    {SECTIONS.slice(0, 3).map((section) => {
                                        const Icon = section.icon;

                                        return (
                                            <a
                                                key={section.id}
                                                href={
                                                    section.id === "profile"
                                                        ? "#personal-information"
                                                        : section.id === "account"
                                                          ? "#account-information"
                                                          : "#privacy-settings"
                                                }
                                                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-[#1491FF]"
                                            >
                                                <Icon size={17} />
                                                <span className="flex-1">
                                                    {section.label}
                                                </span>
                                                <ChevronRight size={16} />
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex items-start gap-3">
                                    <LockKeyhole
                                        size={19}
                                        className="mt-0.5 shrink-0"
                                        style={{ color: BRAND }}
                                    />

                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900">
                                            Protect your account
                                        </h3>

                                        <p className="mt-1.5 text-xs leading-5 text-slate-500">
                                            Never share your password or verification
                                            codes with anyone.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex items-start gap-3">
                                    <CircleHelp
                                        size={19}
                                        className="mt-0.5 shrink-0"
                                        style={{ color: BRAND }}
                                    />

                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900">
                                            Need a hand?
                                        </h3>

                                        <p className="mt-1.5 text-xs leading-5 text-slate-500">
                                            Visit support if you need help with your
                                            account or preferences.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => router.push("/support")}
                                            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                                            style={{ color: BRAND }}
                                        >
                                            Contact support
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    )}
                </div>
            </div>

            {/* Mobile fixed save action */}
            {isMobile && (
                <AnimatePresence>
                    {isProfileDirty && (
                        <motion.div
                            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={transition}
                            className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md"
                        >
                            <button
                                type="submit"
                                form="profile-form"
                                disabled={updateProfile.isPending}
                                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0876D1] disabled:opacity-60"
                                style={{ backgroundColor: BRAND }}
                            >
                                {updateProfile.isPending ? (
                                    <LoaderCircle size={17} className="animate-spin" />
                                ) : (
                                    <Save size={17} />
                                )}

                                {updateProfile.isPending
                                    ? "Saving changes..."
                                    : "Save profile changes"}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Delete confirmation dialog */}
            <AnimatePresence>
                {isDeleteDialogOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-5"
                        onMouseDown={(event) => {
                            if (
                                event.target === event.currentTarget &&
                                !deleteAccount.isPending
                            ) {
                                setIsDeleteDialogOpen(false);
                            }
                        }}
                    >
                        <motion.section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="delete-dialog-title"
                            initial={
                                shouldReduceMotion
                                    ? false
                                    : { opacity: 0, y: 24 }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 24 }}
                            transition={transition}
                            className="w-full max-w-lg rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                                    <Trash2 size={21} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h2
                                        id="delete-dialog-title"
                                        className="text-lg font-bold text-slate-900"
                                    >
                                        Delete your account?
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Your profile will be anonymized, your
                                        active listings suspended, and your
                                        sessions revoked.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    aria-label="Close dialog"
                                    disabled={deleteAccount.isPending}
                                    onClick={() => setIsDeleteDialogOpen(false)}
                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3.5">
                                <p className="text-sm font-semibold text-red-800">
                                    This action cannot be undone through your account.
                                </p>

                                <p className="mt-1 text-xs leading-5 text-red-700">
                                    Some records may be retained where necessary
                                    for platform integrity and related obligations.
                                </p>
                            </div>

                            {deleteError && (
                                <div className="mt-4">
                                    <StatusMessage
                                        notice={{
                                            type: "error",
                                            message: deleteError,
                                        }}
                                    />
                                </div>
                            )}

                            <div className="mt-5">
                                <label
                                    htmlFor="deleteConfirmation"
                                    className="mb-2 block text-sm font-semibold text-slate-800"
                                >
                                    Type <span className="text-red-600">DELETE</span> to confirm
                                </label>

                                <input
                                    id="deleteConfirmation"
                                    type="text"
                                    autoComplete="off"
                                    spellCheck={false}
                                    value={deleteConfirmation}
                                    disabled={deleteAccount.isPending}
                                    onChange={(event) =>
                                        setDeleteConfirmation(event.target.value)
                                    }
                                    placeholder="Type DELETE"
                                    className="h-12 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100 disabled:bg-slate-50"
                                />
                            </div>

                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    disabled={deleteAccount.isPending}
                                    onClick={() => {
                                        setIsDeleteDialogOpen(false);
                                        setDeleteError("");
                                    }}
                                    className="min-h-11 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    disabled={
                                        deleteConfirmation.trim() !== "DELETE" ||
                                        deleteAccount.isPending
                                    }
                                    onClick={() => void handleDeleteAccount()}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {deleteAccount.isPending ? (
                                        <LoaderCircle size={17} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={16} />
                                    )}

                                    {deleteAccount.isPending
                                        ? "Deleting account..."
                                        : "Delete my account"}
                                </button>
                            </div>
                        </motion.section>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}

function AccountRow({
    icon: Icon,
    title,
    description,
    value,
    positive = false,
    blue = false,
}: {
    icon: typeof UserRound;
    title: string;
    description: string;
    value: string;
    positive?: boolean;
    blue?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
            <div className="flex min-w-0 items-center gap-3">
                <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                        backgroundColor: blue ? "#1491FF12" : "#F1F5F9",
                        color: blue ? BRAND : "#64748B",
                    }}
                >
                    <Icon size={18} />
                </div>

                <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                        {title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        {description}
                    </p>
                </div>
            </div>

            <span
                className={[
                    "max-w-[45%] shrink-0 rounded-full px-2.5 py-1.5 text-right text-xs font-semibold capitalize",
                    positive
                        ? "bg-emerald-50 text-emerald-700"
                        : blue
                          ? "bg-[#1491FF]/10 text-[#0876D1]"
                          : "bg-slate-100 text-slate-600",
                ].join(" ")}
            >
                {value}
            </span>
        </div>
    );
}