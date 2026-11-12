"use client";

import { useState, type FormEvent } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowRight, Search } from "lucide-react";

import { useHomepageVehicles } from "@/app/hooks/user/homepage/useHomePageVehicles";

import { DesktopNavbar } from "./DesktopNavbar";
import PublicFooter from "./PublicFooter";
import { FeaturedVehiclesSection } from "../../marketplace/shared/FeaturedVehiclesSection";
import { LatestVehiclesSection } from "../../marketplace/shared/LatestVehiclesSection";

type DesktopHomeProps = {
    homepageVehicles: ReturnType<typeof useHomepageVehicles>;
};

const categories = [
    { label: "All cars", query: "ALL" },
    { label: "SUV", query: "SUV" },
    { label: "Sedan", query: "SEDAN" },
    { label: "Electric", query: "ELECTRIC" },
    { label: "Luxury", query: "Luxury" },
    { label: "Pickup trucks", query: "TRUCK" },
] as const;

function getCategoryUrl(category: (typeof categories)[number]["query"]): string {
    const params = new URLSearchParams();

    switch (category) {
        case "SUV":
            params.set("bodyStyle", "SUV");
            break;
        case "SEDAN":
            params.set("bodyStyle", "SEDAN");
            break;
        case "ELECTRIC":
            params.set("fuelType", "ELECTRIC");
            break;
        case "Luxury":
            params.set("sort", "price_desc");
            break;
        case "TRUCK":
            params.set("q", "pickup truck");
            break;
        default:
            return "/marketplace";
    }

    return `/marketplace?${params.toString()}`;
}

export function DesktopHome({
    homepageVehicles,
}: DesktopHomeProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");

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

    function handleSubmitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const searchTerm = query.trim();

        if (!searchTerm) {
            router.push("/marketplace");
            return;
        }

        const params = new URLSearchParams({ q: searchTerm });
        router.push(`/marketplace?${params.toString()}`);
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
            <DesktopNavbar />

            <main>
                <section className="border-b border-[#0876D1] bg-[#1491FF]">
                    <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-16 lg:py-24">
                        <div className="mx-auto max-w-4xl text-center">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
                                Find your next car
                            </p>
                            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.055em] text-white sm:text-5xl lg:text-6xl">
                                The right car starts here.
                            </h1>
                            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/90">
                                Search by make, model or location.
                            </p>

                            <form
                                onSubmit={handleSubmitSearch}
                                role="search"
                                className="mx-auto mt-8 flex max-w-3xl items-center rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition focus-within:border-white focus-within:ring-4 focus-within:ring-white/30"
                            >
                                <Search
                                    aria-hidden="true"
                                    size={20}
                                    className="ml-3 shrink-0 text-slate-400"
                                />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Try Toyota Camry, Lexus RX, Lagos..."
                                    aria-label="Search by make, model or location"
                                    className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                />
                                <button
                                    type="submit"
                                    className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#075FA8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#064F8C] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
                                >
                                    Search
                                    <ArrowRight size={16} aria-hidden="true" />
                                </button>
                            </form>

                            <nav aria-label="Browse vehicle categories" className="mt-6">
                                <ul className="flex flex-wrap items-center justify-center gap-2">
                                    {categories.map((category) => (
                                        <li key={category.query}>
                                            <button
                                                type="button"
                                                onClick={() => router.push(getCategoryUrl(category.query))}
                                                className="rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-white hover:bg-white hover:text-[#0876D1] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
                                            >
                                                {category.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>
                    </div>
                </section>

                <section
                    id="featured-vehicles"
                    aria-labelledby="featured-heading"
                    className="bg-slate-50"
                >
                    <FeaturedVehiclesSection
                        vehicles={featuredVehicles}
                        loading={featuredLoading}
                        error={featuredError}
                        onRetry={retryFeatured}
                        variant="desktop"
                    />
                </section>

                <section
                    id="latest-vehicles"
                    aria-labelledby="latest-heading"
                    className="bg-white"
                >
                    <div className="mx-auto max-w-[1440px] px-6 py-14 lg:py-16">
                        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    Recently listed
                                </p>
                                <h2
                                    id="latest-heading"
                                    className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-slate-950"
                                >
                                    Latest vehicles
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Browse the newest listings on KARMASS.
                                </p>
                            </div>
                            <Link
                                href="/marketplace"
                                className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
                            >
                                View marketplace <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                        </div>

                        <LatestVehiclesSection
                            vehicles={latestVehicles}
                            loading={latestLoading}
                            error={latestError}
                            onRetry={retryLatest}
                            variant="desktop"
                        />
                    </div>
                </section>

                <section className="border-y border-slate-200 bg-slate-50">
                    <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-16">
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                                Selling your car?
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Create a listing and connect with interested buyers.
                            </p>
                        </div>
                        <Link
                            href="/register"
                            className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#075FA8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#064F8C] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
                        >
                            List your vehicle <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}