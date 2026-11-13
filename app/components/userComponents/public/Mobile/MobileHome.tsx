"use client";

import { useState, type FormEvent } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    ArrowRight,
    CarFront,
    Search,
    Sparkles,
    X,
    Zap,
} from "lucide-react";

import { useHomepageVehicles } from "@/app/hooks/user/homepage/useHomePageVehicles";

import HomeMobileNav from "./HomeMobileNav";
import { PublicAccountLink } from "@/app/components/auth/PublicAccountLink";

import { CurrentYear } from "@/app/utils/current-year";
import { FeaturedVehiclesSection } from "../../marketplace/shared/FeaturedVehiclesSection";
import { LatestVehiclesSection } from "../../marketplace/shared/LatestVehiclesSection";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type MobileHomeProps = {
    homepageVehicles: ReturnType<typeof useHomepageVehicles>;
};

const categories = [
    "All cars",
    "SUV",
    "Sedan",
    "Electric",
    "Luxury",
] as const;

type Category = (typeof categories)[number];

/*
|--------------------------------------------------------------------------
| CATEGORY URLS
|--------------------------------------------------------------------------
*/

function getCategoryUrl(category: Category): string {
    const params = new URLSearchParams();

    switch (category) {
        case "SUV":
            params.set("bodyStyle", "SUV");
            break;

        case "Sedan":
            params.set("bodyStyle", "SEDAN");
            break;

        case "Electric":
            params.set("fuelType", "ELECTRIC");
            break;

        case "Luxury":
            params.set("sort", "price_desc");
            break;

        default:
            return "/marketplace";
    }

    return `/marketplace?${params.toString()}`;
}

/*
|--------------------------------------------------------------------------
| MOBILE HOME
|--------------------------------------------------------------------------
*/

export function MobileHome({
    homepageVehicles,
}: MobileHomeProps) {
    const router = useRouter();

    const [query, setQuery] = useState("");
    const [category, setCategory] = useState<Category>("All cars");

    const {
        featuredVehicles,
        featuredLoading,
        featuredError,
        retryFeatured,

        latestVehicles,
        latestLoading,
        latestError,
        retryLatest,
    } = homepageVehicles;

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const searchTerm = query.trim();

        if (!searchTerm) {
            router.push("/marketplace");
            return;
        }

        const params = new URLSearchParams({
            q: searchTerm,
        });

        router.push(`/marketplace?${params.toString()}`);
    };

    /*
    |--------------------------------------------------------------------------
    | CATEGORY NAVIGATION
    |--------------------------------------------------------------------------
    */

    const handleCategoryChange = (item: Category) => {
        setCategory(item);
        router.push(getCategoryUrl(item));
    };

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <main className="min-h-dvh overflow-x-clip bg-[#F7F9FC] pb-32 text-[#172337] md:hidden">

            {/* HEADER */}
            <header className="sticky top-0 z-30 border-b border-white/15 bg-[#1491FF]">

                <div className="flex items-center justify-between gap-3 px-4 pb-3.5 pt-[max(12px,env(safe-area-inset-top))]">

                    {/* LOGO */}
                    <Link
                        href="/"
                        aria-label="KARMASS home"
                        className="group flex min-w-0 items-center gap-2.5"
                    >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white text-[17px] font-bold tracking-[-0.08em] text-[#1491FF] shadow-[0_5px_14px_rgba(0,65,130,0.16)] transition-transform group-hover:scale-[1.03]">
                            K.
                        </span>

                        <span className="min-w-0">
                            <span className="block text-[14px] font-extrabold leading-5 tracking-[0.13em] text-white">
                                KARMASS
                            </span>

                            <span className="mt-0.5 block text-[8px] font-semibold uppercase tracking-[0.16em] text-white/75">
                                Find your drive
                            </span>
                        </span>
                    </Link>

                    {/* SELL BUTTON */}
                    <PublicAccountLink
                        href="/register"
                        className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 text-[11px] font-bold text-[#0877D9] shadow-sm transition-colors hover:bg-[#EAF5FF] active:scale-[0.98]"
                    >
                        <CarFront size={15} />
                        Sell a car
                    </PublicAccountLink>

                </div>

                {/* SEARCH BAR */}
                <div className="px-4 pb-4">
                    <form
                        onSubmit={handleSearch}
                        className="flex min-h-[48px] items-center gap-2 rounded-xl border border-white/60 bg-white px-3 shadow-[0_5px_18px_rgba(0,65,130,0.12)] transition-all focus-within:ring-2 focus-within:ring-white/20"
                    >
                        <Search
                            size={18}
                            className="shrink-0 text-[#1491FF]"
                        />

                        <input
                            value={query}
                            onChange={(event) =>
                                setQuery(event.target.value)
                            }
                            placeholder="Search make, model or location"
                            aria-label="Search vehicles"
                            className="min-w-0 flex-1 bg-transparent py-2 text-[12px] text-[#243247] outline-none placeholder:text-[#9AA5B4]"
                        />

                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                aria-label="Clear search"
                                className="flex h-7 w-7 items-center justify-center rounded-full text-[#8491A3] transition hover:bg-gray-100"
                            >
                                <X size={15} />
                            </button>
                        )}

                        <button
                            type="submit"
                            aria-label="Search"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1491FF] text-white transition hover:bg-[#0877D9] active:scale-95"
                        >
                            <ArrowRight size={16} />
                        </button>
                    </form>
                </div>

            </header>

            {/* MAIN CONTENT */}
            <div className="mx-auto max-w-7xl">

                {/* CATEGORIES */}
                <section className="border-y border-[#EAEFF5] bg-white py-3.5">

                    <div className="mb-3 flex items-center justify-between px-4">
                        <h2 className="text-[12px] font-bold text-[#344256]">
                            Browse categories
                        </h2>
                    </div>

                    <div className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

                        {categories.map((item) => {
                            const active = category === item;

                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => handleCategoryChange(item)}
                                    aria-pressed={active}
                                    className={`inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3.5 text-[11px] font-semibold transition-all duration-200 active:scale-[0.97] ${
                                        active
                                            ? "border-[#1491FF] bg-[#1491FF] text-white shadow-sm shadow-blue-500/15"
                                            : "border-[#E5EAF1] bg-white text-[#64748B] hover:border-[#B9DEFF] hover:bg-[#F8FBFF]"
                                    }`}
                                >
                                    {item === "Electric" && (
                                        <Zap size={12} />
                                    )}

                                    {item}
                                </button>
                            );
                        })}

                    </div>

                </section>

                {/* FEATURED VEHICLES */}
                <FeaturedVehiclesSection
                    vehicles={featuredVehicles}
                    loading={featuredLoading}
                    error={featuredError}
                    onRetry={retryFeatured}
                    variant="mobile"
                />

                {/* LATEST VEHICLES */}
                <LatestVehiclesSection
                    vehicles={latestVehicles}
                    loading={latestLoading}
                    error={latestError}
                    onRetry={retryLatest}
                    variant="mobile"
                />

                {/* SELLER CTA */}
                <section className="mx-4 mb-7 overflow-hidden rounded-xl border border-[#DCEBFA] bg-[#EDF6FF] p-4">

                    <div className="flex items-center justify-between gap-3">

                        <div className="min-w-0">
                            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#0877D9]">
                                Selling your car?
                            </span>

                            <h2 className="mt-2 text-[16px] font-bold leading-5 tracking-tight text-[#172337]">
                                Find your next buyer.
                            </h2>

                            <p className="mt-1.5 max-w-[210px] text-[10px] leading-5 text-[#64748B]">
                                List your vehicle and connect with interested buyers.
                            </p>

                            <PublicAccountLink
                                href="/register"
                                className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0877D9] transition hover:gap-2.5"
                            >
                                Start selling
                                <ArrowRight size={13} />
                            </PublicAccountLink>
                        </div>

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-[#1491FF] shadow-sm">
                            <CarFront size={30} strokeWidth={1.5} />
                        </div>

                    </div>

                </section>

            </div>

            {/* FOOTER */}
            <footer className="border-t border-[#E8EDF4] bg-white px-4 pb-7 pt-5">

                <div className="flex items-center justify-between gap-3">

                    <div>
                        <p className="text-[11px] font-extrabold tracking-[0.13em] text-[#344256]">
                            KARMASS
                        </p>

                        <p className="mt-1 text-[10px] text-[#8491A3]">
                            Find your drive.
                        </p>
                    </div>

                    <Link
                        href="/marketplace"
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0877D9]"
                    >
                        Explore marketplace
                        <ArrowRight size={12} />
                    </Link>

                </div>

                <div className="mt-5 border-t border-[#F0F2F6] pt-4 text-[10px] text-[#9AA5B4]">
                    © <CurrentYear /> KARMASS. All rights reserved.
                </div>

            </footer>

            <HomeMobileNav />

        </main>
    );
}
