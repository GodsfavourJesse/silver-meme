import Link from "next/link";
import { CarFront, FaceAngry, Mail, Table } from "lucide-react";
import { CurrentYear } from "@/app/components/auth/CurrentYear";

const footerLinks = [
    {
        heading: "Marketplace",
        links: [
            { label: "Browse vehicles", href: "/marketplace" },
            { label: "Sell your car", href: "/sell" },
            { label: "Find dealers", href: "/dealers" },
        ],
    },
    {
        heading: "Account",
        links: [
            { label: "Sign in", href: "/sign-in" },
            { label: "Create account", href: "/register" },
        ],
    },
    {
        heading: "Support",
        links: [
            { label: "Help centre", href: "/help" },
            { label: "Contact us", href: "/contact" },
        ],
    },
];

export function MarketplaceFooter() {
    return (
        <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2"
                        >
                            <span className="grid size-10 place-items-center rounded-xl bg-violet-700 text-white">
                                <CarFront size={22} />
                            </span>

                            <span className="text-lg font-extrabold tracking-[0.12em] text-slate-950">
                                KARMASS
                            </span>
                        </Link>

                        <p className="mt-4 max-w-sm text-sm leading-7 text-slate-500">
                            Discover vehicles, connect with sellers, and find
                            your next drive through a marketplace built for
                            Nigeria.
                        </p>

                        <div className="mt-5 flex items-center gap-3">
                            <a
                                href="https://www.facebook.com/"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Facebook"
                                className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
                            >
                                <FaceAngry size={18} />
                            </a>

                            <a
                                href="https://www.instagram.com/"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Instagram"
                                className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
                            >
                                <Table size={18} />
                            </a>

                            <a
                                href="mailto:support@karmass.com"
                                aria-label="Email KARMASS"
                                className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
                            >
                                <Mail size={18} />
                            </a>
                        </div>
                    </div>

                    {footerLinks.map((group) => (
                        <div key={group.heading}>
                            <h2 className="text-sm font-bold text-slate-950">
                                {group.heading}
                            </h2>

                            <ul className="mt-4 space-y-3">
                                {group.links.map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            className="text-sm text-slate-500 transition hover:text-violet-700"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        © <CurrentYear /> KARMASS. All rights
                        reserved.
                    </p>

                    <p>Built for better vehicle discovery in Nigeria.</p>
                </div>
            </div>
        </footer>
    );
}