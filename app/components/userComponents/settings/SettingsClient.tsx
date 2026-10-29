"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  ChevronRight,
  CircleHelp,
  FileText,
  Globe,
  KeyRound,
  LockKeyhole,
  LogOut,
  MonitorSmartphone,
  Palette,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";

type SettingsSection =
  | "security"
  | "notifications"
  | "privacy"
  | "preferences"
  | "support"
  | "legal";

type SettingItem = {
  title: string;
  description: string;
  icon: typeof UserRound;
  section?: SettingsSection;
  href?: string;
  badge?: string;
};

const SETTINGS_GROUPS: {
  title: string;
  items: SettingItem[];
}[] = [
  {
    title: "ACCOUNT",
    items: [
      {
        title: "Profile",
        description: "Your name, contact details and personal information",
        icon: UserRound,
        href: "/dashboard/settings/profile",
      },
      {
        title: "Security",
        description: "Password, login activity and account protection",
        icon: ShieldCheck,
        section: "security",
      },
      {
        title: "Notifications",
        description: "Choose what you want to hear about",
        icon: Bell,
        section: "notifications",
      },
      {
        title: "Privacy",
        description: "Manage your visibility and contact preferences",
        icon: LockKeyhole,
        section: "privacy",
      },
    ],
  },
  {
    title: "PREFERENCES",
    items: [
      {
        title: "Language & Region",
        description: "Language, currency and regional preferences",
        icon: Globe,
        section: "preferences",
      },
      {
        title: "Appearance",
        description: "Customize how KARMASS looks on your device",
        icon: Palette,
        section: "preferences",
      },
    ],
  },
  {
    title: "SUPPORT & INFORMATION",
    items: [
      {
        title: "Help & Support",
        description: "Get help with your account or a marketplace issue",
        icon: CircleHelp,
        section: "support",
      },
      {
        title: "Legal & Policies",
        description: "Terms, privacy policy and other legal information",
        icon: FileText,
        section: "legal",
      },
    ],
  },
];

const SECTION_TITLES: Record<SettingsSection, string> = {
  security: "Security",
  notifications: "Notifications",
  privacy: "Privacy",
  preferences: "Preferences",
  support: "Help & Support",
  legal: "Legal & Policies",
};

function SettingRow({
  item,
  onSelect,
}: {
  item: SettingItem;
  onSelect: (item: SettingItem) => void;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group flex w-full items-center gap-3.5 px-4 py-4 text-left transition hover:bg-slate-50 sm:px-5"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:text-[#1491FF]">
        <Icon size={19} strokeWidth={1.8} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-900">
          {item.title}
        </span>
        <span className="mt-1 block text-xs leading-5 text-slate-500 sm:text-[13px]">
          {item.description}
        </span>
      </span>

      {item.badge && (
        <span className="hidden rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-[#0876D1] sm:inline-flex">
          {item.badge}
        </span>
      )}

      <ChevronRight
        size={18}
        className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#1491FF]"
      />
    </button>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1491FF] focus-visible:ring-offset-2 ${
        checked ? "bg-[#1491FF]" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function PreferenceRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-4 sm:px-5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-[13px]">
          {description}
        </p>
      </div>

      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection | null>(null);

  // These preferences are local UI state only.
  // Connect them to your settings API before treating them as saved.
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    marketplaceUpdates: true,
    securityAlerts: true,
    promotionalMessages: false,
    showOnlineStatus: true,
    allowMessages: true,
  });

  const updatePreference = (
    key: keyof typeof preferences,
    value: boolean,
  ) => {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSelect = (item: SettingItem) => {
    if (item.href) {
      window.location.href = item.href;
      return;
    }

    if (item.section) {
      setActiveSection(item.section);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F9FC] text-slate-900">
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-12 pt-5 sm:px-6 sm:pt-8 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-2 text-xs text-slate-500">
          <Link
            href="/dashboard"
            className="transition hover:text-[#1491FF]"
          >
            Dashboard
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-slate-900">Settings</span>
        </div>

        {/* Page heading */}
        <header className="mb-7 flex items-start justify-between gap-4 sm:mb-9">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <SlidersHorizontal size={19} className="text-[#1491FF]" />
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0876D1]">
                Your account
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Settings
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Manage your account, preferences and how you use KARMASS.
            </p>
          </div>

          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-[#1491FF] sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2.5"
          >
            <ArrowLeft size={17} />
            <span className="hidden text-sm font-medium sm:inline">
              Dashboard
            </span>
          </Link>
        </header>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8">
          {/* Main settings */}
          <section className="min-w-0 space-y-6">
            {SETTINGS_GROUPS.map((group) => (
              <div key={group.title}>
                <h2 className="mb-3 px-1 text-[11px] font-bold tracking-[0.14em] text-slate-500">
                  {group.title}
                </h2>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
                  {group.items.map((item, index) => (
                    <div key={item.title}>
                      {index > 0 && (
                        <div className="ml-[68px] border-t border-slate-100 sm:ml-[76px]" />
                      )}

                      <SettingRow item={item} onSelect={handleSelect} />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Account actions */}
            <div>
              <h2 className="mb-3 px-1 text-[11px] font-bold tracking-[0.14em] text-slate-500">
                ACCOUNT ACTIONS
              </h2>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <Link
                  href="/logout"
                  className="group flex items-center gap-3.5 px-4 py-4 transition hover:bg-slate-50 sm:px-5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 group-hover:text-[#1491FF]">
                    <LogOut size={19} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      Sign out
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      Sign out of your current account
                    </span>
                  </span>
                  <ArrowRight
                    size={17}
                    className="text-slate-400 group-hover:text-[#1491FF]"
                  />
                </Link>
              </div>
            </div>
          </section>

          {/* Right column */}
          <aside className="space-y-5">
            {/* Security card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#1491FF]">
                    <ShieldCheck size={22} />
                  </div>
                  <h2 className="mt-4 text-base font-bold">
                    Keep your account safe
                  </h2>
                </div>
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Use a strong password and keep your account details up to date.
              </p>

              <button
                type="button"
                onClick={() => setActiveSection("security")}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0876D1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1491FF] focus-visible:ring-offset-2"
              >
                Review security
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Help card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <CircleHelp size={22} />
              </div>

              <h2 className="mt-4 text-base font-bold">
                Need a hand?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                If something is not working as expected, our support team can
                help you find the right solution.
              </p>

              <button
                type="button"
                onClick={() => setActiveSection("support")}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0876D1] transition hover:text-[#055DAA]"
              >
                Visit help & support
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Brand footer */}
            <div className="px-1 pt-1">
              <p className="text-xs leading-5 text-slate-400">
                KARMASS
                <span className="mx-2">·</span>
                Your car marketplace
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Need assistance? We&apos;re here to help.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Settings detail modal */}
      {activeSection && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setActiveSection(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-modal-title"
            className="max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
          >
            <header className="sticky top-0 flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Account settings
                </p>
                <h2
                  id="settings-modal-title"
                  className="mt-1 text-lg font-bold"
                >
                  {SECTION_TITLES[activeSection]}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setActiveSection(null)}
                aria-label="Close settings"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </header>

            <div className="space-y-5 p-5">
              {activeSection === "security" && (
                <>
                  <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                    <KeyRound
                      size={20}
                      className="mt-0.5 shrink-0 text-[#1491FF]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Password & login
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Protect your account with a strong password. Password
                        changes should be completed through the account security
                        flow.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold">
                      Two-step verification
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Additional login verification is not configured in this
                      page yet.
                    </p>
                  </div>

                  <p className="text-xs leading-5 text-slate-400">
                    Connect these actions to your authentication API before
                    enabling password changes or session management.
                  </p>
                </>
              )}

              {activeSection === "notifications" && (
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                  <PreferenceRow
                    title="Email notifications"
                    description="Receive important account messages by email."
                    checked={preferences.emailNotifications}
                    onChange={(value) =>
                      updatePreference("emailNotifications", value)
                    }
                  />
                  <PreferenceRow
                    title="Marketplace updates"
                    description="Get updates about your listings and activity."
                    checked={preferences.marketplaceUpdates}
                    onChange={(value) =>
                      updatePreference("marketplaceUpdates", value)
                    }
                  />
                  <PreferenceRow
                    title="Security alerts"
                    description="Be informed about important security events."
                    checked={preferences.securityAlerts}
                    onChange={(value) =>
                      updatePreference("securityAlerts", value)
                    }
                  />
                  <PreferenceRow
                    title="Promotional messages"
                    description="Hear about offers and marketplace news."
                    checked={preferences.promotionalMessages}
                    onChange={(value) =>
                      updatePreference("promotionalMessages", value)
                    }
                  />
                </div>
              )}

              {activeSection === "privacy" && (
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                  <PreferenceRow
                    title="Show online status"
                    description="Let other users know when you're active."
                    checked={preferences.showOnlineStatus}
                    onChange={(value) =>
                      updatePreference("showOnlineStatus", value)
                    }
                  />
                  <PreferenceRow
                    title="Allow messages"
                    description="Allow other marketplace users to contact you."
                    checked={preferences.allowMessages}
                    onChange={(value) =>
                      updatePreference("allowMessages", value)
                    }
                  />
                  <p className="p-4 text-xs leading-5 text-slate-400">
                    These controls are currently local UI preferences. Connect
                    them to your privacy API to enforce and persist the choices.
                  </p>
                </div>
              )}

              {activeSection === "preferences" && (
                <>
                  <div>
                    <label
                      htmlFor="settings-language"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Language
                    </label>
                    <select
                      id="settings-language"
                      defaultValue="en"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#1491FF] focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="settings-currency"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Display currency
                    </label>
                    <select
                      id="settings-currency"
                      defaultValue="NGN"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#1491FF] focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="NGN">Nigerian Naira (₦ NGN)</option>
                    </select>
                    <p className="mt-2 text-xs text-slate-400">
                      Currency options can be expanded when the marketplace
                      supports additional regions.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                    <MonitorSmartphone
                      size={19}
                      className="mt-0.5 shrink-0 text-slate-500"
                    />
                    <div>
                      <p className="text-sm font-semibold">Appearance</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        KARMASS follows its current site appearance. A theme
                        selector can be added when theme support is available.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {activeSection === "support" && (
                <>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <CircleHelp size={20} className="text-[#1491FF]" />
                    <p className="mt-3 text-sm font-semibold">
                      How can we help?
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      For account, listing or marketplace issues, visit the
                      support area in your dashboard.
                    </p>
                    <Link
                      href="/dashboard/support"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0876D1]"
                    >
                      Open support
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </>
              )}

              {activeSection === "legal" && (
                <div className="space-y-3">
                  <Link
                    href="/privacy"
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 text-sm font-medium transition hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    Privacy Policy
                    <ChevronRight size={17} className="text-slate-400" />
                  </Link>
                  <Link
                    href="/terms"
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 text-sm font-medium transition hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    Terms of Service
                    <ChevronRight size={17} className="text-slate-400" />
                  </Link>
                </div>
              )}
            </div>

            <footer className="border-t border-slate-100 bg-slate-50/70 px-5 py-4">
              <button
                type="button"
                onClick={() => setActiveSection(null)}
                className="w-full rounded-xl bg-[#1491FF] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0876D1]"
              >
                Done
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}