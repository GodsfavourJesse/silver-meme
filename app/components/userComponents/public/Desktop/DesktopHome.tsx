"use client";

import { useState, type FormEvent, type ReactNode } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    ArrowDownRight,
    ArrowRight,
    BadgeCheck,
    CarFront,
    ChevronRight,
    CircleDot,
    MoveUpRight,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    Sparkles,
} from "lucide-react";

import { useHomepageVehicles } from "@/app/hooks/user/homepage/useHomePageVehicles";

import { DesktopNavbar } from "./DesktopNavbar";
import PublicFooter from "./PublicFooter";
import { FeaturedVehiclesSection } from "../../marketplace/shared/FeaturedVehiclesSection";
import { LatestVehiclesSection } from "../../marketplace/shared/LatestVehiclesSection";


// TYPES
type DesktopHomeProps = {
    homepageVehicles: ReturnType<typeof useHomepageVehicles>;
};

// BRAND
const BRAND_COLOR = "#1491FF";
const BRAND_HOVER = "#0877D9";
const BRAND_LIGHT = "#EAF5FF";

// CATEGORIES
const categories = [
    { label: "SUVs", query: "SUV" },
    { label: "Sedans", query: "SEDAN" },
    { label: "Luxury", query: "Luxury" },
    { label: "Electric", query: "ELECTRIC" },
    { label: "Pickup trucks", query: "TRUCK" },
] as const;

// HOW IT WORKS
const marketplaceSteps = [
    {
        number: "01",
        title: "Find your shortlist",
        description:
            "Explore cars that fit your lifestyle, priorities, and budget.",
        icon: Search,
    },
    {
        number: "02",
        title: "Make a closer comparison",
        description:
            "Look through the details and connect with the right seller.",
        icon: SlidersHorizontal,
    },
    {
        number: "03",
        title: "Get behind the wheel",
        description:
            "Take the next step toward a car that feels right for you.",
        icon: CarFront,
    },
];

// SECTION EYEBROW
function SectionEyebrow({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="flex items-center gap-3">
            <span
                className="h-px w-8"
                style={{ backgroundColor: BRAND_COLOR }}
            />

            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                {children}
            </span>
        </div>
    );
}

// CATEGORY URL
function getCategoryUrl(category: string): string {
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

// DESKTOP HOME
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

    // SEARCH
    function handleSubmitSearch(
        event: FormEvent<HTMLFormElement>,
    ) {
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
    }

    // CATEGORY NAVIGATION
    function handleCategorySearch(category: string) {
        router.push(getCategoryUrl(category));
    }

    // RENDER
    return (
        <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">

            {/* GLOBAL STYLES */}
            <style jsx global>{`
                @keyframes rise-in {
                    from {
                        opacity: 0;
                        transform: translateY(22px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slow-drift {
                    0%,
                    100% {
                        transform: translate3d(0, 0, 0);
                    }
                    50% {
                        transform: translate3d(0, -12px, 0);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    *,
                    *::before,
                    *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        scroll-behavior: auto !important;
                        transition-duration: 0.01ms !important;
                    }
                }

                html {
                    scroll-behavior: smooth;
                }

                ::selection {
                    background: #d6ebff;
                    color: #073b70;
                }
            `}</style>

            <DesktopNavbar />

            <main>

                {/* HERO */}
                <section className="relative isolate overflow-hidden bg-[#F7F9FC]">

                    <div
                        className="pointer-events-none absolute -right-48 -top-56 h-[650px] w-[650px] rounded-full blur-[100px]"
                        style={{
                            backgroundColor: "rgba(20,145,255,0.10)",
                        }}
                    />

                    <div className="pointer-events-none absolute -left-64 bottom-[-300px] h-[600px] w-[600px] rounded-full bg-blue-100/50 blur-[100px]" />

                    <div className="relative mx-auto max-w-[1500px] px-6 pb-16 pt-12 lg:px-16 lg:pb-24 lg:pt-16">

                        <div className="grid items-center gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-10">

                            {/* HERO CONTENT */}
                            <div className="relative z-10 motion-safe:animate-[rise-in_800ms_cubic-bezier(0.16,1,0.3,1)_both]">

                                <div className="flex items-center gap-3">
                                    <span
                                        className="h-[2px] w-8"
                                        style={{
                                            backgroundColor: BRAND_COLOR,
                                        }}
                                    />

                                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                                        The Nigerian car marketplace
                                    </p>
                                </div>

                                <h1 className="mt-7 max-w-[650px] text-[clamp(3.2rem,5.8vw,5.7rem)] font-semibold leading-[0.99] tracking-[-0.075em] text-slate-950">
                                    The right car.
                                    <br />

                                    <span className="relative inline-block">
                                        The{" "}
                                        <span
                                            className="relative z-10"
                                            style={{
                                                color: BRAND_COLOR,
                                            }}
                                        >
                                            right move.
                                        </span>

                                        <span
                                            className="absolute bottom-1 left-0 -z-0 h-[12%] w-full opacity-20"
                                            style={{
                                                backgroundColor: BRAND_COLOR,
                                            }}
                                        />
                                    </span>
                                </h1>

                                <p className="mt-7 max-w-[440px] text-[15px] leading-7 text-slate-600 sm:text-base sm:leading-8">
                                    Buying a car should feel exciting,
                                    not complicated. Explore vehicles,
                                    weigh your options, and find one
                                    that fits the way you live.
                                </p>

                                {/* SEARCH */}
                                <form
                                    onSubmit={handleSubmitSearch}
                                    className="group/search mt-9 flex max-w-[540px] items-center gap-2 rounded-[5px] border border-slate-200/90 bg-white p-2 shadow-[0_15px_45px_-30px_rgba(15,23,42,0.28)] transition-all duration-300 focus-within:border-blue-300 focus-within:shadow-[0_15px_45px_-25px_rgba(20,145,255,0.25)] focus-within:ring-4 focus-within:ring-blue-100/60"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center text-slate-400 transition-colors group-focus-within/search:text-blue-500">
                                        <Search
                                            size={20}
                                            strokeWidth={1.7}
                                        />
                                    </div>

                                    <input
                                        value={query}
                                        onChange={(event) =>
                                            setQuery(event.target.value)
                                        }
                                        placeholder="Try Toyota Camry, Lexus RX..."
                                        aria-label="Search vehicles"
                                        className="min-w-0 flex-1 bg-transparent py-3 text-[13px] text-slate-900 outline-none placeholder:text-slate-400 sm:text-sm"
                                    />

                                    <button
                                        type="submit"
                                        className="group/button inline-flex shrink-0 items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-white transition-all duration-300 hover:brightness-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 sm:px-5 sm:text-sm"
                                        style={{
                                            backgroundColor: BRAND_COLOR,
                                        }}
                                    >
                                        Find a car

                                        <ArrowRight
                                            size={15}
                                            className="transition-transform duration-300 group-hover/button:translate-x-1"
                                        />
                                    </button>
                                </form>

                                {/* CATEGORIES */}
                                <div className="mt-7">

                                    <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                        Start with a category
                                    </p>

                                    <div className="flex flex-wrap gap-2">

                                        {categories.map((category) => (
                                            <button
                                                key={category.label}
                                                type="button"
                                                onClick={() =>
                                                    handleCategorySearch(
                                                        category.query,
                                                    )
                                                }
                                                className="group/chip inline-flex items-center gap-2 border border-slate-200/90 bg-white/70 px-3.5 py-2.5 text-[11px] font-medium text-slate-600 backdrop-blur-sm transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                            >
                                                {category.label}

                                                <ArrowDownRight
                                                    size={12}
                                                    className="text-slate-300 transition-all duration-300 group-hover/chip:translate-x-0.5 group-hover/chip:translate-y-0.5 group-hover/chip:text-blue-500"
                                                />
                                            </button>
                                        ))}

                                    </div>
                                </div>

                                {/* TRUST ROW */}
                                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-200/80 pt-6">

                                    <div className="flex items-center gap-2">
                                        <ShieldCheck
                                            size={16}
                                            className="text-blue-600"
                                        />

                                        <span className="text-[11px] font-medium text-slate-600">
                                            Browse with confidence
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <BadgeCheck
                                            size={16}
                                            className="text-blue-600"
                                        />

                                        <span className="text-[11px] font-medium text-slate-600">
                                            Dealer profiles
                                        </span>
                                    </div>

                                </div>
                            </div>

                            {/* HERO IMAGE */}
                            <div className="relative min-w-0 motion-safe:animate-[fade-in_1.2s_ease-out_both]">

                                <div className="relative min-h-[430px] overflow-hidden rounded-[4px] bg-slate-200 sm:min-h-[550px] lg:min-h-[620px]">

                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1800&q=90"
                                        alt="Sports car on an open road"
                                        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[1600ms] ease-out hover:scale-[1.045]"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/5 to-slate-950/10" />

                                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/20 via-transparent to-transparent" />

                                    <div className="absolute left-5 top-5 flex items-center gap-3 rounded-[10px] border border-white/25 bg-slate-950/25 px-4 py-3 shadow-lg backdrop-blur-xl sm:left-7 sm:top-7">
                                        <span className="relative flex h-2 w-2">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-300 opacity-70" />

                                            <span
                                                className="relative inline-flex h-2 w-2 rounded-full"
                                                style={{
                                                    backgroundColor: BRAND_COLOR,
                                                }}
                                            />
                                        </span>

                                        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white sm:text-[10px]">
                                            A different way to find your car
                                        </span>
                                    </div>

                                    <div className="absolute right-5 top-6 text-right sm:right-7 sm:top-7">
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/65">
                                            Discover
                                        </p>

                                        <p className="mt-1 text-xs font-medium text-white">
                                            Your next chapter
                                        </p>
                                    </div>

                                    <div className="absolute bottom-5 left-5 right-5 rounded-[10px] border border-white/25 bg-slate-950/35 p-5 shadow-2xl backdrop-blur-xl sm:bottom-7 sm:left-7 sm:right-7 sm:p-7">

                                        <div className="flex items-end justify-between gap-5">

                                            <div className="max-w-md">
                                                <p className="text-[9px] font-bold uppercase tracking-[0.23em] text-blue-200">
                                                    Make the road yours
                                                </p>

                                                <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.045em] text-white sm:text-4xl">
                                                    Every great drive
                                                    starts somewhere.
                                                </h2>

                                                <p className="mt-3 max-w-sm text-xs leading-6 text-white/70 sm:text-sm">
                                                    Your next car is out there.
                                                    Let&apos;s help you find it.
                                                </p>
                                            </div>

                                            <Link
                                                href="#latest-vehicles"
                                                aria-label="Explore all vehicles"
                                                className="group/explore flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border border-white/30 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:border-blue-400 hover:bg-blue-500 sm:h-14 sm:w-14"
                                            >
                                                <MoveUpRight
                                                    size={22}
                                                    className="transition-transform duration-300 group-hover/explore:translate-x-0.5 group-hover/explore:-translate-y-0.5"
                                                />
                                            </Link>

                                        </div>
                                    </div>
                                </div>

                                <div className="pointer-events-none absolute -bottom-3 -right-3 -z-10 h-2/3 w-2/3 border border-blue-200/70" />

                                <div className="absolute -left-5 top-[35%] hidden rounded-[10px] border border-white/80 bg-white/70 px-4 py-3 shadow-[0_10px_35px_-15px_rgba(15,23,42,0.2)] backdrop-blur-xl motion-safe:animate-[slow-drift_6s_ease-in-out_infinite] xl:block">
                                    <div className="flex items-center gap-3">

                                        <div
                                            className="flex h-9 w-9 items-center justify-center"
                                            style={{
                                                backgroundColor: BRAND_LIGHT,
                                                color: BRAND_HOVER,
                                            }}
                                        >
                                            <CarFront size={18} />
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-bold text-slate-900">
                                                Your next car
                                            </p>

                                            <p className="mt-0.5 text-[9px] text-slate-500">
                                                Starts with a search
                                            </p>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* EDITORIAL STRIP */}
                        <div className="mt-12 grid grid-cols-1 border-y border-slate-200/80 sm:grid-cols-3">

                            <div className="flex items-center justify-between gap-4 py-5 sm:pr-8">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                        Explore
                                    </p>

                                    <p className="mt-1.5 text-sm font-semibold text-slate-800">
                                        Vehicles for different lifestyles
                                    </p>
                                </div>

                                <CircleDot
                                    size={17}
                                    className="shrink-0 text-blue-500"
                                />
                            </div>

                            <div className="flex items-center justify-between gap-4 border-slate-200/80 py-5 sm:border-l sm:px-8">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                        Compare
                                    </p>

                                    <p className="mt-1.5 text-sm font-semibold text-slate-800">
                                        Make an informed choice
                                    </p>
                                </div>

                                <SlidersHorizontal
                                    size={17}
                                    className="shrink-0 text-blue-500"
                                />
                            </div>

                            <div className="flex items-center justify-between gap-4 border-slate-200/80 py-5 sm:border-l sm:pl-8">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                        Connect
                                    </p>

                                    <p className="mt-1.5 text-sm font-semibold text-slate-800">
                                        Find the right seller
                                    </p>
                                </div>

                                <ArrowRight
                                    size={17}
                                    className="shrink-0 text-blue-500"
                                />
                            </div>

                        </div>

                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section className="border-b border-slate-200 bg-white">

                    <div className="mx-auto max-w-[1500px] px-6 py-16 lg:px-16 lg:py-20">

                        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">

                            <div>
                                <SectionEyebrow>
                                    Simple by design
                                </SectionEyebrow>

                                <h2 className="mt-5 max-w-sm text-3xl font-semibold leading-[1.12] tracking-[-0.055em] text-slate-950 sm:text-4xl">
                                    Less searching.
                                    <br />
                                    More certainty.
                                </h2>

                                <p className="mt-5 max-w-sm text-sm leading-7 text-slate-500">
                                    Finding a car doesn&apos;t need to
                                    be a project. We make it easier to
                                    move from browsing to your next drive.
                                </p>
                            </div>

                            <div className="grid gap-0 sm:grid-cols-3">

                                {marketplaceSteps.map((step, index) => {
                                    const StepIcon = step.icon;

                                    return (
                                        <div
                                            key={step.number}
                                            className={`group relative border-t border-slate-200 py-6 transition-colors duration-300 hover:border-blue-400 sm:px-5 sm:py-5 ${
                                                index === 0
                                                    ? "sm:pl-0"
                                                    : "sm:border-l sm:border-t-0"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className="text-xs font-bold tracking-[0.12em]"
                                                    style={{
                                                        color: BRAND_COLOR,
                                                    }}
                                                >
                                                    {step.number}
                                                </span>

                                                <StepIcon
                                                    size={19}
                                                    strokeWidth={1.5}
                                                    className="text-slate-400 transition-colors duration-300 group-hover:text-blue-500"
                                                />
                                            </div>

                                            <h3 className="mt-7 text-sm font-semibold text-slate-900">
                                                {step.title}
                                            </h3>

                                            <p className="mt-3 text-xs leading-6 text-slate-500">
                                                {step.description}
                                            </p>

                                            <div className="mt-5 h-px w-0 bg-blue-500 transition-all duration-500 group-hover:w-full" />
                                        </div>
                                    );
                                })}

                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURED VEHICLES */}
                <section
                    id="featured-vehicles"
                    className="relative overflow-hidden bg-[#F7F9FC]"
                >
                    <div className="pointer-events-none absolute -right-48 top-40 h-[500px] w-[500px] rounded-full bg-blue-100/50 blur-[110px]" />

                    <div className="relative mx-auto max-w-[1500px] px-6 py-16 lg:px-16 lg:py-20">

                        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

                            <div>
                                <SectionEyebrow>
                                    Selected for more visibility
                                </SectionEyebrow>

                                <div className="mt-5 flex items-center gap-3">
                                    <h2 className="text-3xl font-semibold leading-tight tracking-[-0.06em] text-slate-950 sm:text-5xl">
                                        Featured vehicles.
                                    </h2>

                                    <span className="hidden items-center gap-1.5 bg-blue-50 px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-blue-700 sm:inline-flex">
                                        <Sparkles size={12} />
                                        Promoted
                                    </span>
                                </div>

                                <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500">
                                    Discover vehicles currently receiving
                                    extra visibility from sellers on KARMASS.
                                </p>
                            </div>

                            <Link
                                href="/marketplace"
                                className="group inline-flex w-fit items-center gap-3 border-b border-slate-300 pb-2 text-xs font-semibold text-slate-800 transition-colors duration-300 hover:border-blue-500 hover:text-blue-700"
                            >
                                Explore all vehicles

                                <ArrowRight
                                    size={15}
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </Link>

                        </div>

                        <FeaturedVehiclesSection
                            vehicles={featuredVehicles}
                            loading={featuredLoading}
                            error={featuredError}
                            onRetry={retryFeatured}
                            variant="desktop"
                        />

                    </div>
                </section>

                {/* LATEST VEHICLES */}
                <section
                    id="latest-vehicles"
                    className="relative overflow-hidden bg-white"
                >

                    <div className="mx-auto max-w-[1500px] px-6 py-16 lg:px-16 lg:py-24">

                        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

                            <div>
                                <SectionEyebrow>
                                    The latest arrivals
                                </SectionEyebrow>

                                <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.06em] text-slate-950 sm:text-5xl">
                                    Fresh on KARMASS.
                                </h2>

                                <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500">
                                    Explore the newest vehicles added to
                                    KARMASS. Your next favourite might
                                    be right here.
                                </p>
                            </div>

                            <Link
                                href="/marketplace"
                                className="group inline-flex w-fit items-center gap-3 border-b border-slate-300 pb-2 text-xs font-semibold text-slate-800 transition-colors duration-300 hover:border-blue-500 hover:text-blue-700"
                            >
                                View marketplace

                                <ArrowRight
                                    size={15}
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
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

                {/* SELLER CTA */}
                <section className="bg-white px-6 pb-16 lg:px-16 lg:pb-24">

                    <div className="relative mx-auto max-w-[1500px] overflow-hidden bg-[#071B33]">

                        <div
                            className="pointer-events-none absolute -right-20 -top-48 h-[450px] w-[450px] rounded-full blur-[100px]"
                            style={{
                                backgroundColor: "rgba(20,145,255,0.25)",
                            }}
                        />

                        <div className="pointer-events-none absolute -bottom-40 left-[25%] h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[80px]" />

                        <div
                            className="pointer-events-none absolute inset-0 opacity-[0.07]"
                            style={{
                                backgroundImage:
                                    "linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)",
                                backgroundSize: "44px 44px",
                            }}
                        />

                        <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16 lg:p-14">

                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 border border-white/15 bg-white/[0.06] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.19em] text-blue-200 backdrop-blur-xl">
                                    <CarFront size={14} />
                                    For car owners and dealers
                                </div>

                                <h2 className="mt-6 text-3xl font-semibold leading-[1.08] tracking-[-0.06em] text-white sm:text-5xl">
                                    Your car has a buyer.
                                    <br />
                                    Let them find it.
                                </h2>

                                <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">
                                    Put your vehicle in front of people
                                    who are actively looking. Create a
                                    listing and take the first step
                                    toward your next sale.
                                </p>
                            </div>

                            <div className="flex flex-col items-start gap-4 lg:items-end">
                                <Link
                                    href="/sell"
                                    className="group inline-flex items-center gap-4 bg-[#1491FF] px-6 py-4 text-xs font-semibold text-white shadow-[0_10px_35px_-12px_rgba(20,145,255,0.65)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#0877D9] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/40"
                                >
                                    List your vehicle

                                    <span className="flex h-7 w-7 items-center justify-center border border-white/30 transition-transform duration-300 group-hover:translate-x-1">
                                        <ArrowRight size={15} />
                                    </span>
                                </Link>

                                <p className="text-[10px] text-slate-400">
                                    Start your next sale on KARMASS
                                </p>
                            </div>

                        </div>

                        <div className="relative flex items-center justify-between border-t border-white/10 px-7 py-4 sm:px-10 lg:px-14">

                            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                Make your next move
                            </p>

                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 text-[10px] font-medium text-blue-300 transition-colors hover:text-white"
                            >
                                Start here
                                <ChevronRight size={13} />
                            </Link>

                        </div>

                    </div>
                </section>

                {/* FINAL DISCOVERY STRIP */}
                <section className="border-t border-slate-200 bg-white">

                    <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-16">

                        <div className="flex items-center gap-3">
                            <div
                                className="flex h-10 w-10 items-center justify-center"
                                style={{
                                    backgroundColor: BRAND_LIGHT,
                                    color: BRAND_HOVER,
                                }}
                            >
                                <Search size={18} />
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-slate-900">
                                    Still deciding?
                                </p>

                                <p className="mt-1 text-[11px] text-slate-500">
                                    Browse the full collection at your own pace.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/marketplace"
                            className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-700 transition-colors hover:text-blue-700"
                        >
                            Explore the marketplace

                            <ArrowRight
                                size={15}
                                className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                        </Link>

                    </div>
                </section>

            </main>

            <PublicFooter />

        </div>
    );
}