"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";

type MarketplaceSearchProps = {
    initialQuery?: string;
    variant?: "home" | "compact";
    placeholder?: string;
};

export function MarketplaceSearch({
    initialQuery = "",
    variant = "home",
    placeholder = "Search Toyota, Lexus, Mercedes...",
}: MarketplaceSearchProps) {
    const router = useRouter();
    const [query, setQuery] = useState(initialQuery);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const params = new URLSearchParams();
        const searchTerm = query.trim();

        if (searchTerm) {
            params.set("q", searchTerm);
        }

        const destination = params.size
            ? `/marketplace?${params.toString()}`
            : "/marketplace";

        router.push(destination);
    }

    const isCompact = variant === "compact";

    return (
        <form
            onSubmit={handleSubmit}
            role="search"
            className={[
                "flex w-full items-center gap-2 border border-slate-200 bg-white p-1.5",
                "shadow-[0_12px_35px_-20px_rgba(15,23,42,0.25)]",
                "transition-all duration-200",
                "focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100/60",
                isCompact
                    ? "min-h-12 rounded-xl"
                    : "min-h-[58px] max-w-[560px] rounded-2xl sm:min-h-[64px]",
            ].join(" ")}
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-400 sm:h-12 sm:w-12">
                <Search size={20} strokeWidth={1.8} />
            </div>

            <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={placeholder}
                aria-label="Search vehicles"
                className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-slate-900 outline-none placeholder:text-slate-400 sm:text-sm"
            />

            <button
                type="submit"
                className={[
                    "inline-flex shrink-0 items-center justify-center gap-2",
                    "bg-[#1491FF] font-semibold text-white",
                    "transition-colors hover:bg-[#0877D9]",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200",
                    isCompact
                        ? "h-10 rounded-lg px-3 text-[11px] sm:px-4 sm:text-xs"
                        : "h-11 rounded-xl px-4 text-xs sm:h-12 sm:px-6 sm:text-sm",
                ].join(" ")}
            >
                <span>Search</span>

                {!isCompact && (
                    <ArrowRight size={15} />
                )}
            </button>
        </form>
    );
}