"use client";

import {
    useCallback,
    useEffect,
    useState,
    type FormEvent,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    ArrowDownRight,
    ArrowRight,
    Bell,
    CheckCircle2,
    ChevronRight,
    CarFront,
    Gauge,
    MapPin,
    Search,
    SlidersHorizontal,
    Sparkles,
    Zap,
} from "lucide-react";

import {
    searchMarketplace,
} from "@/app/services/user/marketplace/marketplace.service";

import type {
    MarketplaceSearchParams,
    MarketplaceSearchResult,
} from "@/app/types/user/marketplace.types";

import HomeMobileNav from "./HomeMobileNav";

/*
|--------------------------------------------------------------------------
| BRAND
|--------------------------------------------------------------------------
*/

const BRAND = "#1491FF";
const BRAND_HOVER = "#0877D9";
const BRAND_LIGHT = "#EAF5FF";
const BRAND_BORDER = "#B9DEFF";

/*
|--------------------------------------------------------------------------
| CATEGORIES
|--------------------------------------------------------------------------
*/

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
| HELPERS
|--------------------------------------------------------------------------
*/

function formatPrice(
    price: string | number,
    currency: string,
): string {
    const numericPrice =
        typeof price === "number"
            ? price
            : Number(price);

    if (!Number.isFinite(numericPrice)) {
        return "Price on request";
    }

    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(numericPrice);
    } catch {
        return `${currency} ${numericPrice.toLocaleString("en-NG")}`;
    }
}

function formatMileage(
    mileage: number | null,
): string {
    if (mileage === null || mileage === undefined) {
        return "";
    }

    return `${new Intl.NumberFormat("en-NG").format(mileage)} km`;
}

function getVehicleTitle(
    result: MarketplaceSearchResult,
): string {
    const title = result.listing.title?.trim();

    if (title) {
        return title;
    }

    return [
        result.make?.name,
        result.model?.name,
        result.variant?.name,
    ]
        .filter(Boolean)
        .join(" ") || "Vehicle listing";
}

function getVehicleYear(
    result: MarketplaceSearchResult,
): string | null {
    const year = result.variant?.year;

    return year ? String(year) : null;
}

function getVehicleDetails(
    result: MarketplaceSearchResult,
): string[] {
    const details: string[] = [];

    const year = getVehicleYear(result);
    const mileage = formatMileage(result.listing.mileage);
    const transmission = result.variant?.transmission;

    if (year) {
        details.push(year);
    }

    if (mileage) {
        details.push(mileage);
    }

    if (transmission) {
        details.push(transmission);
    }

    return details;
}

function getVehicleLocation(
    result: MarketplaceSearchResult,
): string {
    return [
        result.listing.city,
        result.listing.state,
    ]
        .filter(Boolean)
        .join(", ") || "Location not specified";
}

function getCategoryFilters(
    category: Category,
): Partial<MarketplaceSearchParams> {
    switch (category) {
        case "SUV":
            return {
                bodyStyle: "SUV",
            };

        case "Sedan":
            return {
                bodyStyle: "SEDAN",
            };

        case "Electric":
            return {
                fuelType: "ELECTRIC",
            };

        case "Luxury":
            return {
                sort: "price_desc",
            };

        default:
            return {};
    }
}

/*
|--------------------------------------------------------------------------
| VEHICLE IMAGE FALLBACK
|--------------------------------------------------------------------------
|
| The supplied marketplace result type does not establish the
| actual listing image field. This component provides a polished
| fallback without guessing the backend schema.
|
*/

function ListingImagePlaceholder() {
    return (
        <div
            aria-label="Vehicle image unavailable"
            className="
                relative flex h-full w-full
                items-center justify-center overflow-hidden
                bg-gradient-to-br from-[#F5F9FF]
                via-[#EAF3FF] to-[#DCEBFC]
            "
        >
            <div
                aria-hidden="true"
                className="
                    absolute -right-8 -top-10
                    h-36 w-36 rounded-full
                    border border-white/80
                "
            />

            <div
                aria-hidden="true"
                className="
                    absolute -bottom-16 -left-8
                    h-40 w-40 rounded-full
                    border border-white/80
                "
            />

            <div className="relative flex flex-col items-center">
                <div
                    className="
                        flex h-16 w-16 items-center
                        justify-center rounded-[22px]
                        border border-white/80
                        bg-white/70 text-[#1491FF]
                        shadow-[0_8px_24px_rgba(20,145,255,0.08)]
                    "
                >
                    <CarFront
                        size={34}
                        strokeWidth={1.35}
                    />
                </div>

                <span
                    className="
                        mt-3 text-[9px] font-bold
                        uppercase tracking-[0.2em]
                        text-[#7192B8]
                    "
                >
                    KARMASS
                </span>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| SKELETON
|--------------------------------------------------------------------------
*/

function ListingSkeleton() {
    return (
        <article
            aria-hidden="true"
            className="
                overflow-hidden rounded-[22px]
                border border-[#E8EDF4] bg-white
            "
        >
            <div className="h-48 animate-pulse bg-[#EEF2F7]" />

            <div className="space-y-4 p-4">
                <div className="h-4 w-3/5 animate-pulse rounded-full bg-[#E8EDF4]" />

                <div className="h-3 w-2/5 animate-pulse rounded-full bg-[#F0F3F7]" />

                <div className="h-5 w-2/5 animate-pulse rounded-full bg-[#E8EDF4]" />

                <div className="h-px bg-[#EEF2F7]" />

                <div className="h-3 w-1/2 animate-pulse rounded-full bg-[#F0F3F7]" />
            </div>
        </article>
    );
}

/*
|--------------------------------------------------------------------------
| SECTION HEADING
|--------------------------------------------------------------------------
*/

function SectionHeading({
    eyebrow,
    title,
    description,
    action,
}: {
    eyebrow?: string;
    title: string;
    description?: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
                {eyebrow && (
                    <p
                        className="
                            text-[9px] font-bold uppercase
                            tracking-[0.18em]
                        "
                        style={{ color: BRAND_HOVER }}
                    >
                        {eyebrow}
                    </p>
                )}

                <h2
                    className="
                        mt-1.5 text-[22px] font-bold
                        leading-tight tracking-[-0.055em]
                        text-[#172337]
                    "
                >
                    {title}
                </h2>

                {description && (
                    <p className="mt-1.5 text-[12px] leading-5 text-[#8491A3]">
                        {description}
                    </p>
                )}
            </div>

            {action}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| VEHICLE CARD
|--------------------------------------------------------------------------
*/

function FeaturedCarCard({
    result,
}: {
    result: MarketplaceSearchResult;
}) {
    const listing = result.listing;

    const title = getVehicleTitle(result);
    const details = getVehicleDetails(result);
    const location = getVehicleLocation(result);

    const listingHref =
        `/marketplace?q=${encodeURIComponent(title)}`;

    return (
        <article
            className="
                group overflow-hidden rounded-[22px]
                border border-[#E6ECF3] bg-white
                transition-all duration-300
                hover:border-[#C8E2FF]
                hover:shadow-[0_12px_35px_rgba(15,45,85,0.07)]
            "
        >
            {/* Image */}
            <Link
                href={listingHref}
                aria-label={`View ${title}`}
                className="relative block h-[205px] overflow-hidden bg-[#F1F5F9]"
            >
                <ListingImagePlaceholder />

                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3.5">
                    {result.boostPriority > 0 ? (
                        <span
                            className="
                                inline-flex items-center gap-1.5
                                rounded-full border border-white/70
                                bg-white/95 px-3 py-1.5
                                text-[10px] font-bold
                                text-[#24354B] shadow-sm
                            "
                        >
                            <Sparkles
                                size={12}
                                style={{ color: BRAND }}
                            />

                            Featured
                        </span>
                    ) : (
                        <span
                            className="
                                inline-flex items-center gap-1.5
                                rounded-full border border-white/70
                                bg-white/95 px-3 py-1.5
                                text-[10px] font-semibold
                                text-[#344256] shadow-sm
                            "
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                            Available
                        </span>
                    )}

                    <span
                        className="
                            flex h-9 w-9 items-center
                            justify-center rounded-full
                            border border-white/80 bg-white/95
                            text-[#64748B] shadow-sm
                            transition-colors hover:text-[#1491FF]
                        "
                        aria-hidden="true"
                    >
                        <ArrowDownRight size={17} />
                    </span>
                </div>
            </Link>

            {/* Details */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <Link
                            href={listingHref}
                            className="
                                line-clamp-2 text-[15px]
                                font-bold leading-6
                                tracking-[-0.025em]
                                text-[#172337]
                                transition-colors
                                hover:text-[#0877D9]
                            "
                        >
                            {title}
                        </Link>

                        {details.length > 0 && (
                            <p className="mt-1.5 text-[11px] leading-5 text-[#8491A3]">
                                {details.join(" · ")}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#8491A3]">
                        Asking price
                    </p>

                    <p className="mt-1 text-[19px] font-bold tracking-[-0.045em] text-[#172337]">
                        {formatPrice(
                            listing.price,
                            listing.currency,
                        )}
                    </p>
                </div>

                <div className="my-4 h-px bg-[#EEF2F7]" />

                <div className="flex items-center justify-between gap-3">
                    <p className="flex min-w-0 items-center gap-1.5 text-[11px] text-[#8491A3]">
                        <MapPin
                            size={14}
                            className="shrink-0"
                            style={{ color: BRAND }}
                        />

                        <span className="truncate">
                            {location}
                        </span>
                    </p>

                    <Link
                        href={listingHref}
                        aria-label={`Explore ${title}`}
                        className="
                            inline-flex shrink-0
                            items-center gap-1
                            text-[11px] font-bold
                            text-[#0877D9]
                        "
                    >
                        View

                        <ChevronRight size={14} />
                    </Link>
                </div>
            </div>
        </article>
    );
}

/*
|--------------------------------------------------------------------------
| HOME PAGE
|--------------------------------------------------------------------------
*/

export function MobileHome() {
    const router = useRouter();

    const [query, setQuery] = useState("");
    const [category, setCategory] =
        useState<Category>("All cars");

    const [cars, setCars] =
        useState<MarketplaceSearchResult[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    /*
    |--------------------------------------------------------------------------
    | LOAD FEATURED VEHICLES
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let isActive = true;

        async function loadFeaturedCars() {
            setIsLoading(true);
            setError(null);

            try {
                const filters: MarketplaceSearchParams = {
                    page: 1,
                    limit: 6,
                    sort:
                        category === "Luxury"
                            ? "price_desc"
                            : "newest",
                    ...getCategoryFilters(category),
                };

                const response =
                    await searchMarketplace(filters);

                if (!isActive) {
                    return;
                }

                setCars(response.data.listings);
            } catch {
                if (!isActive) {
                    return;
                }

                setCars([]);

                setError(
                    "We couldn't load vehicles right now. Please try again.",
                );
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        }

        void loadFeaturedCars();

        return () => {
            isActive = false;
        };
    }, [category, retryCount]);

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    const handleSearch = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            const trimmedQuery = query.trim();

            const destination = trimmedQuery
                ? `/marketplace?q=${encodeURIComponent(trimmedQuery)}`
                : "/marketplace";

            router.push(destination);
        },
        [query, router],
    );

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <main className="min-h-dvh overflow-x-hidden bg-[#F7F9FC] pb-28 text-[#172337] md:hidden">
            {/* ====================================================
                HEADER
            ==================================================== */}
            <header className="border-b border-[#EDF1F6] bg-white">
                <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-[max(16px,env(safe-area-inset-top))]">
                    <Link
                        href="/"
                        aria-label="KARMASS home"
                        className="group flex min-w-0 items-center gap-2.5"
                    >
                        <span
                            className="
                                flex h-10 w-10 shrink-0
                                items-center justify-center
                                border border-[#E6EDF5] bg-white
                                text-[16px] font-semibold
                                tracking-[-0.08em]
                                text-[#1491FF]
                                transition-colors
                                group-hover:border-[#1491FF]
                            "
                        >
                            K.
                        </span>

                        <span className="min-w-0">
                            <span className="block text-[15px] font-semibold leading-5 tracking-[0.15em] text-[#20201F]">
                                KARMASS
                            </span>

                            <span className="mt-0.5 block text-[8px] font-medium uppercase tracking-[0.17em] text-[#8491A3]">
                                Find your drive
                            </span>
                        </span>
                    </Link>
                </div>
            </header>

            {/* ====================================================
                HERO
            ==================================================== */}
            <section className="px-4 pt-5">
                <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#168FFF] via-[#087FE8] to-[#0866C7] px-5 pb-5 pt-6 text-white shadow-[0_16px_36px_rgba(20,145,255,0.16)]">
                    {/* Decorative background elements */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/15"
                    />

                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-6 top-4 h-36 w-36 rounded-full border border-white/10"
                    />

                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-12 right-0 h-40 w-40 rounded-full bg-white/[0.06] blur-2xl"
                    />

                    <div className="relative">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                            <Sparkles size={13} />

                            <span className="text-[9px] font-bold uppercase tracking-[0.16em]">
                                Your next drive starts here
                            </span>
                        </div>

                        <h1 className="mt-6 max-w-[310px] text-[37px] font-semibold leading-[1.07] tracking-[-0.065em]">
                            The right car.
                            <br />

                            <span className="text-white/75">
                                The right move.
                            </span>
                        </h1>

                        <p className="mt-3 max-w-[285px] text-[12px] leading-[1.9] text-white/85">
                            Discover vehicles from sellers across
                            Nigeria and find the one that fits your
                            lifestyle.
                        </p>

                        <div className="mt-5 flex flex-wrap items-center gap-2.5">
                            <Link
                                href="/marketplace"
                                className="
                                    inline-flex min-h-11
                                    items-center justify-center gap-2
                                    rounded-xl bg-white px-4
                                    text-[12px] font-bold
                                    text-[#0877D9]
                                    shadow-sm transition
                                    hover:bg-[#F1F7FF]
                                    active:scale-[0.98]
                                "
                            >
                                Explore vehicles

                                <ArrowRight size={15} />
                            </Link>

                            <Link
                                href="/login"
                                className="
                                    inline-flex min-h-11
                                    items-center justify-center
                                    rounded-xl border border-white/30
                                    bg-white/10 px-4
                                    text-[12px] font-semibold text-white
                                    transition hover:bg-white/15
                                    active:scale-[0.98]
                                "
                            >
                                Sell your car
                            </Link>
                        </div>
                    </div>

                    {/* Hero visual */}
                    <div className="relative mt-6 overflow-hidden rounded-[20px] border border-white/15 bg-white/[0.09] px-4 py-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-white/65">
                                    Your journey
                                </p>

                                <p className="mt-1 text-[13px] font-semibold">
                                    Starts with the right choice.
                                </p>
                            </div>

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                                <CarFront
                                    size={26}
                                    strokeWidth={1.5}
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                            <span className="h-1 flex-1 rounded-full bg-white/90" />
                            <span className="h-1 flex-1 rounded-full bg-white/35" />
                            <span className="h-1 flex-1 rounded-full bg-white/20" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ====================================================
                SEARCH
            ==================================================== */}
            <section className="px-4 pt-5">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-[13px] font-bold text-[#243247]">
                        Find your next car
                    </h2>

                    <span className="text-[10px] text-[#8491A3]">
                        Search marketplace
                    </span>
                </div>

                <form
                    onSubmit={handleSearch}
                    className="
                        flex min-h-[58px] items-center gap-3
                        rounded-2xl border border-[#E3EAF3]
                        bg-white p-2 pl-4
                        shadow-[0_3px_12px_rgba(15,23,42,0.025)]
                        transition-all
                        focus-within:border-[#B9DEFF]
                        focus-within:ring-4
                        focus-within:ring-[#1491FF]/[0.06]
                    "
                >
                    <Search
                        size={19}
                        className="shrink-0 text-[#8491A3]"
                    />

                    <input
                        value={query}
                        onChange={(event) =>
                            setQuery(event.target.value)
                        }
                        placeholder="Make, model or keyword"
                        aria-label="Search vehicles"
                        className="
                            min-w-0 flex-1 bg-transparent
                            py-2 text-[12px] text-[#243247]
                            outline-none
                            placeholder:text-[#9AA5B4]
                        "
                    />

                    <button
                        type="submit"
                        aria-label="Search vehicles"
                        className="
                            flex h-10 w-10 shrink-0
                            items-center justify-center
                            rounded-xl text-white
                            transition-all hover:brightness-95
                            active:scale-95
                        "
                        style={{ backgroundColor: BRAND }}
                    >
                        <SlidersHorizontal size={17} />
                    </button>
                </form>

                <div className="mt-3 flex items-center gap-2 px-1">
                    <CheckCircle2
                        size={13}
                        className="shrink-0 text-emerald-600"
                    />

                    <p className="text-[10px] leading-5 text-[#8491A3]">
                        Browse listings and compare vehicles in one place.
                    </p>
                </div>
            </section>

            {/* ====================================================
                CATEGORIES
            ==================================================== */}
            <section className="pt-6">
                <div className="px-4">
                    <SectionHeading
                        title="Browse by category"
                        description="Start with the kind of car you want."
                    />
                </div>

                <div
                    aria-label="Vehicle categories"
                    className="
                        mt-4 flex gap-2 overflow-x-auto
                        px-4 pb-2
                        [scrollbar-width:none]
                        [&::-webkit-scrollbar]:hidden
                    "
                >
                    {categories.map((item) => {
                        const active = category === item;

                        return (
                            <button
                                key={item}
                                type="button"
                                onClick={() => setCategory(item)}
                                aria-pressed={active}
                                className={`
                                    inline-flex min-h-10 shrink-0
                                    items-center justify-center gap-1.5
                                    rounded-xl border px-4
                                    text-[11px] font-semibold
                                    transition-all duration-200
                                    active:scale-[0.97]
                                    ${
                                        active
                                            ? "border-[#1491FF] bg-[#1491FF] text-white shadow-[0_4px_12px_rgba(20,145,255,0.16)]"
                                            : "border-[#E4EAF2] bg-white text-[#64748B] hover:border-[#B9DEFF] hover:bg-[#F8FBFF]"
                                    }
                                `}
                            >
                                {item === "Electric" && (
                                    <Zap size={13} />
                                )}

                                {item}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* ====================================================
                FEATURED VEHICLES
            ==================================================== */}
            <section className="mt-7 px-4">
                <SectionHeading
                    eyebrow="Discover your next drive"
                    title="Featured vehicles"
                    description="Explore vehicles worth a closer look."
                    action={
                        <Link
                            href="/marketplace"
                            className="
                                mb-0.5 inline-flex shrink-0
                                items-center gap-1
                                text-[11px] font-bold
                                text-[#0877D9]
                            "
                        >
                            View all

                            <ChevronRight size={15} />
                        </Link>
                    }
                />

                <div className="mt-5">
                    {isLoading ? (
                        <div
                            aria-label="Loading vehicles"
                            className="space-y-4"
                        >
                            {Array.from({ length: 3 }).map(
                                (_, index) => (
                                    <ListingSkeleton key={index} />
                                ),
                            )}
                        </div>
                    ) : error ? (
                        <div
                            role="alert"
                            className="
                                rounded-[22px] border
                                border-[#E6ECF3] bg-white p-5
                            "
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF5FF] text-[#1491FF]">
                                <CarFront size={23} />
                            </div>

                            <h3 className="mt-4 text-[14px] font-bold text-[#172337]">
                                Vehicles are temporarily unavailable
                            </h3>

                            <p className="mt-2 text-[12px] leading-6 text-[#8491A3]">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    setRetryCount((count) => count + 1)
                                }
                                className="
                                    mt-4 inline-flex min-h-10
                                    items-center justify-center gap-2
                                    rounded-xl px-4
                                    text-[12px] font-bold text-white
                                    transition hover:brightness-95
                                    active:scale-[0.98]
                                "
                                style={{
                                    backgroundColor: BRAND,
                                }}
                            >
                                Try again

                                <ArrowRight size={14} />
                            </button>
                        </div>
                    ) : cars.length === 0 ? (
                        <div className="rounded-[22px] border border-[#E6ECF3] bg-white px-5 py-8 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF5FF] text-[#1491FF]">
                                <CarFront size={27} />
                            </div>

                            <h3 className="mt-4 text-[14px] font-bold text-[#172337]">
                                No vehicles found yet
                            </h3>

                            <p className="mx-auto mt-2 max-w-[260px] text-[12px] leading-6 text-[#8491A3]">
                                There are no vehicles in this category
                                right now. Explore all available listings
                                or try another category.
                            </p>

                            <button
                                type="button"
                                onClick={() => setCategory("All cars")}
                                className="
                                    mt-4 min-h-10 rounded-xl
                                    border border-[#B9DEFF]
                                    bg-[#EAF5FF] px-4
                                    text-[12px] font-bold
                                    text-[#0877D9]
                                    transition hover:bg-[#DFF0FF]
                                "
                            >
                                View all cars
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cars.map((result) => (
                                <FeaturedCarCard
                                    key={result.listing.id}
                                    result={result}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {!isLoading && !error && cars.length > 0 && (
                    <Link
                        href="/marketplace"
                        className="
                            mt-5 flex min-h-12 w-full
                            items-center justify-center gap-2
                            rounded-xl border border-[#B9DEFF]
                            bg-white text-[12px] font-bold
                            text-[#0877D9]
                            transition hover:bg-[#F3F9FF]
                            active:scale-[0.99]
                        "
                    >
                        Explore all vehicles

                        <ArrowRight size={15} />
                    </Link>
                )}
            </section>

            {/* ====================================================
                SELLER CTA
            ==================================================== */}
            <section className="mx-4 mt-8">
                <div className="relative overflow-hidden rounded-[26px] border border-[#DCEBFA] bg-[#EAF5FF] p-5">
                    <div
                        aria-hidden="true"
                        className="
                            pointer-events-none absolute
                            -right-10 -top-12 h-40 w-40
                            rounded-full border border-[#B9DEFF]/70
                        "
                    />

                    <div className="relative">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#CFE5FC] bg-white/80 px-3 py-1.5">
                            <CarFront
                                size={13}
                                className="text-[#1491FF]"
                            />

                            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#0877D9]">
                                For car owners
                            </span>
                        </div>

                        <h2 className="mt-4 max-w-[270px] text-[24px] font-bold leading-[1.15] tracking-[-0.055em] text-[#172337]">
                            Ready to find your car a new owner?
                        </h2>

                        <p className="mt-2 max-w-[290px] text-[12px] leading-6 text-[#64748B]">
                            Create a listing and connect with people
                            searching for their next vehicle.
                        </p>

                        <Link
                            href="/sell"
                            className="
                                mt-5 inline-flex min-h-11
                                items-center justify-center gap-2
                                rounded-xl bg-[#1491FF] px-4
                                text-[12px] font-bold text-white
                                shadow-[0_5px_14px_rgba(20,145,255,0.17)]
                                transition hover:bg-[#0877D9]
                                active:scale-[0.98]
                            "
                        >
                            List your vehicle

                            <ArrowRight size={15} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ====================================================
                TRUST NOTE
            ==================================================== */}
            <section className="px-5 pb-5 pt-7">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E6EDF5] bg-white text-[#1491FF]">
                        <CheckCircle2
                            size={19}
                            strokeWidth={1.8}
                        />
                    </div>

                    <div>
                        <h3 className="text-[12px] font-bold text-[#344256]">
                            Make informed vehicle decisions
                        </h3>

                        <p className="mt-1 text-[11px] leading-5 text-[#8491A3]">
                            Review listing details, ask sellers questions,
                            and inspect vehicles before making payment.
                        </p>
                    </div>
                </div>
            </section>

            {/* ====================================================
                FOOTER
            ==================================================== */}
            <footer className="border-t border-[#E8EDF4] px-5 pb-6 pt-5">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-[11px] font-bold tracking-[0.14em] text-[#344256]">
                            KARMASS
                        </p>

                        <p className="mt-1 text-[10px] text-[#8491A3]">
                            Find your drive.
                        </p>
                    </div>

                    <Link
                        href="/marketplace"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0877D9]"
                    >
                        Explore marketplace

                        <ArrowRight size={13} />
                    </Link>
                </div>

                <p className="mt-5 text-[10px] text-[#9AA5B4]">
                    © {new Date().getFullYear()} KARMASS. All rights reserved.
                </p>
            </footer>

            {/* ====================================================
                MOBILE NAVIGATION
            ==================================================== */}
            <HomeMobileNav />
        </main>
    );
}