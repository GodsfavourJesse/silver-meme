import { ScrollText, ShieldCheck, UsersRound } from "lucide-react";

import { KarmassAdminLogo } from "./karmass-admin-logo";
import { CurrentYear } from "./current-year";

const FEATURES = [
    {
        icon: ShieldCheck,
        title: "Secure access",
        description: "Sessions are verified by the KARMASS backend.",
    },
    {
        icon: UsersRound,
        title: "Role-based permissions",
        description: "Every administrator sees only what their role allows.",
    },
    {
        icon: ScrollText,
        title: "Full activity auditing",
        description: "Sensitive actions are recorded for accountability.",
    },
] as const;

export function LoginBrandPanel() {
    return (
        <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-kar-border bg-kar-surface p-12 lg:flex">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_15%_10%,rgba(107,63,217,0.38),transparent),radial-gradient(50%_40%_at_90%_95%,rgba(169,140,255,0.16),transparent)]" />

            <div className="pointer-events-none absolute -right-28 -top-28 h-96 w-96 rounded-full border border-kar-accent/10" />

            <div className="pointer-events-none absolute -bottom-44 -left-24 h-[30rem] w-[30rem] rounded-full border border-kar-accent/10" />

            <div className="relative z-10">
                <KarmassAdminLogo />
            </div>

            <div className="relative z-10 max-w-xl">
                <p className="mb-5 text-sm font-medium uppercase tracking-[0.25em] text-kar-accent">
                    Administrator workspace
                </p>

                <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight">
                    Manage the marketplace.
                    <span className="mt-2 block text-kar-accent">
                        Protect the community.
                    </span>
                </h1>

                <p className="mt-6 max-w-lg text-base leading-8 text-kar-muted">
                    Manage vehicle listings, verify dealers, review boost
                    requests, support users, and keep KARMASS running smoothly.
                </p>

                <ul className="mt-10 space-y-5">
                    {FEATURES.map(({ icon: Icon, title, description }) => (
                        <li key={title} className="flex items-start gap-4">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-kar-border bg-kar-surface-raised text-kar-accent">
                                <Icon size={20} />
                            </span>

                            <span>
                                <span className="block text-sm font-medium">
                                    {title}
                                </span>

                                <span className="mt-0.5 block text-sm text-kar-muted">
                                    {description}
                                </span>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <p className="relative z-10 text-sm text-kar-muted/70">
                © <CurrentYear /> KARMASS. Administrator access is
                restricted to authorized personnel.
            </p>
        </section>
    );
}