import Link from "next/link";

import { ArrowLeft, ChevronRight } from "lucide-react";

export function VehicleBreadcrumb({ title }: { title: string }) {
    return (
        <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 overflow-hidden py-5 text-xs text-slate-500 sm:py-7 sm:text-sm"
        >
            <Link
                href="/marketplace"
                className="inline-flex shrink-0 items-center gap-2 font-medium transition hover:text-violet-700"
            >
                <ArrowLeft size={15} />
                Marketplace
            </Link>

            <ChevronRight size={14} className="shrink-0" />

            <span className="truncate text-slate-800">{title}</span>
        </nav>
    );
}