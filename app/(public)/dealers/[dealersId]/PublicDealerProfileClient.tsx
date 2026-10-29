"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import {
    Activity,
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    Building2,
    CalendarDays,
    CarFront,
    CheckCircle2,
    ChevronDown,
    Clock3,
    LoaderCircle,
    MapPin,
    MessageCircle,
    Phone,
    RefreshCw,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    Store,
    X,
} from "lucide-react";

import {
    useAuth,
} from "@/app/hooks/user/auth/useAuth";

import {
    usePublicDealerListings,
    usePublicDealerProfile,
} from "@/app/hooks/user/dealer/useDealer";

import {
    createMessagingConversation,
} from "@/app/services/user/messaging/messaging.service";

import type {
    DealerListing,
    PublicDealerProfile,
} from "@/app/types/user/dealer/dealer.types";
import ContactDealerModal from "@/app/components/userComponents/dealer/modal/ContactDealerModal";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface PublicDealerProfileClientProps {
    dealerId: string;
}

type SortOption = "newest" | "price-low" | "price-high";

type ContactModalMode = "guest" | "verification";

interface AuthUserContactFields {
    id?: string;
    userId?: string;
    isEmailVerified?: boolean;
    emailVerified?: boolean;
    emailVerifiedAt?: string | Date | null;
}

interface ListingsPayload {
    items?: DealerListing[];
    listings?: DealerListing[];
    data?: {
        items?: DealerListing[];
        listings?: DealerListing[];
        pagination?: {
            totalPages?: number;
            page?: number;
            limit?: number;
            total?: number;
        };
    };
    pagination?: {
        totalPages?: number;
        page?: number;
        limit?: number;
        total?: number;
    };
}

const PAGE_SIZE = 12;

/* -------------------------------------------------------------------------- */
/* Utilities                                                                  */
/* -------------------------------------------------------------------------- */

function formatDate(value?: string | Date | null): string {
    if (!value) return "Recently joined";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Recently joined";
    }

    return new Intl.DateTimeFormat("en-NG", {
        month: "short",
        year: "numeric",
    }).format(date);
}

function formatPrice(
    value: string | number | null | undefined,
    currency?: string | null,
): string {
    if (value === null || value === undefined || value === "") {
        return "Contact for price";
    }

    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return "Contact for price";
    }

    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: currency || "NGN",
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${currency || "NGN"} ${amount.toLocaleString("en-NG")}`;
    }
}

function formatNumber(value: number | string | null | undefined): string {
    const number = Number(value ?? 0);

    return Number.isFinite(number)
        ? new Intl.NumberFormat("en-NG").format(number)
        : "0";
}

function getInitials(value?: string | null): string {
    const words = value?.trim().split(/\s+/).filter(Boolean) ?? [];

    if (!words.length) return "KD";

    return words
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? "")
        .join("");
}

function getVehicleName(listing: DealerListing): string {
    const vehicle = listing as DealerListing & {
        vehicleMake?: { name?: string };
        vehicleModel?: { name?: string };
        vehicleGeneration?: { name?: string };
        vehicleVariant?: { name?: string };
    };

    return [
        vehicle.vehicleMake?.name,
        vehicle.vehicleModel?.name,
        vehicle.vehicleGeneration?.name,
        vehicle.vehicleVariant?.name,
    ]
        .filter(Boolean)
        .filter((value, index, array) => array.indexOf(value) === index)
        .join(" ") || listing.title || "Vehicle listing";
}

function getListingDate(
    listing: DealerListing,
): string | Date | null | undefined {
    const vehicle = listing as DealerListing & {
        publishedAt?: string | Date | null;
    };

    return vehicle.publishedAt || listing.createdAt;
}

function getListingLocation(listing: DealerListing): string {
    const vehicle = listing as DealerListing & {
        city?: string | null;
        state?: string | null;
        country?: string | null;
    };

    return [
        vehicle.city,
        vehicle.state,
        vehicle.country,
    ]
        .filter(Boolean)
        .join(", ");
}

function getConditionLabel(condition?: string | null): string {
    if (!condition) return "Vehicle";

    return condition
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function unwrapProfile(value: unknown): PublicDealerProfile | undefined {
    if (!value || typeof value !== "object") {
        return undefined;
    }

    const root = value as Record<string, unknown>;

    const isDealerProfile = (
        candidate: unknown,
    ): candidate is PublicDealerProfile => {
        if (!candidate || typeof candidate !== "object") {
            return false;
        }

        const profile = candidate as Record<string, unknown>;

        return (
            typeof profile.id === "string" &&
            (
                typeof profile.userId === "string" ||
                typeof profile.companyName === "string"
            )
        );
    };

    if (isDealerProfile(root)) {
        return root as unknown as PublicDealerProfile;
    }

    if (isDealerProfile(root.data)) {
        return root.data as PublicDealerProfile;
    }

    if (root.data && typeof root.data === "object") {
        const nested = root.data as Record<string, unknown>;

        if (isDealerProfile(nested.dealer)) {
            return nested.dealer as PublicDealerProfile;
        }

        if (isDealerProfile(nested.profile)) {
            return nested.profile as PublicDealerProfile;
        }
    }

    if (isDealerProfile(root.dealer)) {
        return root.dealer as PublicDealerProfile;
    }

    if (isDealerProfile(root.profile)) {
        return root.profile as PublicDealerProfile;
    }

    return undefined;
}

function unwrapListings(value: unknown): {
    items: DealerListing[];
    totalPages?: number;
    total?: number;
} {
    if (!value || typeof value !== "object") {
        return { items: [] };
    }

    const root = value as ListingsPayload;
    const nested = root.data;

    const items =
        root.items ??
        root.listings ??
        nested?.items ??
        nested?.listings ??
        [];

    const pagination =
        root.pagination ??
        nested?.pagination;

    return {
        items: Array.isArray(items) ? items : [],
        totalPages: pagination?.totalPages,
        total: pagination?.total,
    };
}

/* -------------------------------------------------------------------------- */
/* Animation styles                                                           */
/* -------------------------------------------------------------------------- */

function DealerAnimationStyles() {
    return (
        <style jsx global>{`
            :root {
                --karmass-brand: #1491FF;
                --karmass-brand-dark: #0877D9;
                --karmass-brand-deep: #0065C9;
                --karmass-brand-light: #EAF5FF;
                --karmass-brand-soft: #F4F9FF;
            }

            html {
                scroll-behavior: smooth;
                scroll-padding-top: 90px;
            }

            @keyframes karmassFadeUp {
                from {
                    opacity: 0;
                    transform: translate3d(0, 22px, 0);
                }

                to {
                    opacity: 1;
                    transform: translate3d(0, 0, 0);
                }
            }

            @keyframes karmassFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes karmassScaleIn {
                from {
                    opacity: 0;
                    transform: scale(0.94);
                }

                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            @keyframes karmassShimmer {
                from { background-position: 150% 0; }
                to { background-position: -150% 0; }
            }

            @keyframes karmassSlideUp {
                from {
                    opacity: 0;
                    transform: translate3d(0, 100%, 0);
                }

                to {
                    opacity: 1;
                    transform: translate3d(0, 0, 0);
                }
            }

            @keyframes karmassPulse {
                0%, 100% {
                    box-shadow: 0 0 0 0 rgba(20, 145, 255, 0.12);
                }

                50% {
                    box-shadow: 0 0 0 7px rgba(20, 145, 255, 0);
                }
            }

            .karmass-enter {
                animation: karmassFadeUp 600ms cubic-bezier(0.16, 1, 0.3, 1) both;
            }

            .karmass-enter-fade {
                animation: karmassFadeIn 450ms ease-out both;
            }

            .karmass-scale-in {
                animation: karmassScaleIn 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
            }

            .karmass-stagger-1 { animation-delay: 70ms; }
            .karmass-stagger-2 { animation-delay: 140ms; }
            .karmass-stagger-3 { animation-delay: 210ms; }
            .karmass-stagger-4 { animation-delay: 280ms; }

            .karmass-shimmer {
                background: linear-gradient(100deg, #edf5ff 25%, #f8fbff 40%, #edf5ff 55%);
                background-size: 200% 100%;
                animation: karmassShimmer 1.6s ease-in-out infinite;
            }

            .karmass-card {
                -webkit-tap-highlight-color: transparent;
                transform: translateZ(0);
                transition: transform 280ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 280ms ease, border-color 220ms ease;
            }

            .karmass-card:active { transform: scale(0.985); }

            .karmass-button {
                -webkit-tap-highlight-color: transparent;
                transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), background-color 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
            }

            .karmass-button:active { transform: scale(0.975); }

            .karmass-mobile-bar {
                padding-bottom: max(12px, env(safe-area-inset-bottom));
                animation: karmassSlideUp 550ms cubic-bezier(0.16, 1, 0.3, 1) both;
                will-change: transform;
            }

            .karmass-brand-glow {
                animation: karmassPulse 2.8s ease-in-out infinite;
            }

            .karmass-sort-menu {
                transform-origin: top right;
                animation: karmassScaleIn 180ms cubic-bezier(0.16, 1, 0.3, 1) both;
            }

            .karmass-listings-grid {
                content-visibility: auto;
                contain-intrinsic-size: auto 1000px;
            }

            .karmass-no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }

            .karmass-no-scrollbar::-webkit-scrollbar { display: none; }

            @media (hover: hover) and (pointer: fine) {
                .karmass-card:hover { transform: translateY(-5px); }
                .karmass-button:hover { transform: translateY(-1px); }
            }

            @media (max-width: 639px) {
                html { scroll-padding-top: 76px; }

                .karmass-mobile-content {
                    padding-bottom: calc(100px + env(safe-area-inset-bottom));
                }

                .karmass-card {
                    transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
                }

                .karmass-mobile-bar {
                    box-shadow: 0 -8px 30px rgba(15, 23, 42, 0.06), 0 -1px 0 rgba(15, 23, 42, 0.03);
                }
            }

            @media (prefers-reduced-motion: reduce) {
                html { scroll-behavior: auto; }

                .karmass-enter,
                .karmass-enter-fade,
                .karmass-scale-in,
                .karmass-shimmer,
                .karmass-mobile-bar,
                .karmass-brand-glow,
                .karmass-sort-menu {
                    animation: none !important;
                }

                .karmass-card,
                .karmass-button {
                    transition: none !important;
                }

                .karmass-card:hover,
                .karmass-card:active,
                .karmass-button:hover,
                .karmass-button:active {
                    transform: none !important;
                }
            }
        `}</style>
    );
}

/* -------------------------------------------------------------------------- */
/* Shared UI                                                                  */
/* -------------------------------------------------------------------------- */

function VerifiedBadge({
    compact = false,
}: {
    compact?: boolean;
}) {
    return (
        <span
            className={[
                "inline-flex shrink-0 items-center gap-1.5 rounded-full",
                "border border-emerald-100 bg-emerald-50 font-bold text-emerald-700",
                compact ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-[11px] sm:text-xs",
            ].join(" ")}
        >
            <BadgeCheck size={compact ? 12 : 14} strokeWidth={2.5} />
            Verified dealer
        </span>
    );
}

function DealerAvatar({
    name,
    imageUrl,
}: {
    name: string;
    imageUrl?: string | null;
}) {
    return (
        <div className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-[25px] border-4 border-white bg-gradient-to-br from-[#69B7FF] via-[#1491FF] to-[#0065C9] text-white shadow-xl shadow-blue-200/70 sm:h-24 sm:w-24 sm:rounded-[30px]">
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={`${name} profile`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                />
            ) : (
                <>
                    <Building2
                        size={40}
                        strokeWidth={1.3}
                        className="absolute opacity-20"
                    />
                    <span className="relative text-2xl font-black tracking-tight sm:text-3xl">
                        {getInitials(name)}
                    </span>
                </>
            )}
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <main className="min-h-screen bg-[#F5F9FF]">
            <DealerAnimationStyles />

            <div className="mx-auto max-w-6xl px-4 pb-12 pt-5 sm:px-6 sm:pt-8 lg:px-8">
                <div className="karmass-shimmer h-10 w-36 rounded-2xl" />

                <div className="mt-6 overflow-hidden rounded-[30px] border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
                    <div className="h-24 rounded-2xl bg-gradient-to-r from-blue-100 to-blue-50" />

                    <div className="-mt-8 flex items-center gap-4">
                        <div className="karmass-shimmer h-20 w-20 shrink-0 rounded-[25px] border-4 border-white" />

                        <div className="flex-1 space-y-3 pt-7">
                            <div className="karmass-shimmer h-5 w-2/3 rounded-lg" />
                            <div className="karmass-shimmer h-4 w-1/2 rounded-lg" />
                        </div>
                    </div>

                    <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="karmass-shimmer h-12 rounded-2xl" />
                        <div className="karmass-shimmer h-12 rounded-2xl" />
                    </div>
                </div>

                <div className="mt-9">
                    <div className="karmass-shimmer h-6 w-48 rounded-lg" />

                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="overflow-hidden rounded-[25px] border border-gray-100 bg-white"
                            >
                                <div className="karmass-shimmer h-44 sm:h-48" />
                                <div className="space-y-3 p-4">
                                    <div className="karmass-shimmer h-4 w-3/4 rounded" />
                                    <div className="karmass-shimmer h-5 w-1/2 rounded" />
                                    <div className="karmass-shimmer h-3 w-2/3 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}

function ListingCard({
    listing,
    index,
}: {
    listing: DealerListing;
    index: number;
}) {
    const title = getVehicleName(listing);
    const location = getListingLocation(listing);

    const vehicle = listing as DealerListing & {
        mileage?: number | string | null;
        imageUrl?: string | null;
        coverImage?: string | null;
        thumbnailUrl?: string | null;
    };

    const image =
        vehicle.coverImage ||
        vehicle.imageUrl ||
        vehicle.thumbnailUrl;

    return (
        <Link
            href={`/listings/${listing.id}`}
            className={[
                "karmass-card karmass-enter group block overflow-hidden",
                "rounded-[25px] border border-gray-100 bg-white shadow-sm",
                "hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50",
            ].join(" ")}
            style={{
                animationDelay: `${Math.min(index * 55, 330)}ms`,
            }}
        >
            <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-[#EAF5FF] via-[#F5FAFF] to-[#D9EDFF] sm:h-48">
                <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/70" />
                <div className="absolute -bottom-16 -left-8 h-36 w-36 rounded-full bg-blue-200/30" />

                {image ? (
                    <img
                        src={image}
                        alt={title}
                        loading="lazy"
                        className="relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="relative flex h-[86px] w-[86px] items-center justify-center rounded-[28px] border border-white/80 bg-white/80 text-[#1491FF] shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                        <CarFront size={45} strokeWidth={1.3} />
                    </div>
                )}

                <span className="absolute left-3 top-3 inline-flex items-center rounded-full border border-white/70 bg-white/95 px-2.5 py-1 text-[10px] font-bold text-gray-700 shadow-sm">
                    {getConditionLabel(listing.condition)}
                </span>

                <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow-md transition-colors group-hover:bg-[#1491FF] group-hover:text-white">
                    <ArrowRight size={16} />
                </span>
            </div>

            <div className="p-4">
                <p className="line-clamp-1 text-sm font-bold leading-5 text-gray-900 sm:text-[15px]">
                    {listing.title || title}
                </p>

                {listing.title && title !== listing.title && (
                    <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                        {title}
                    </p>
                )}

                <p className="mt-3 text-lg font-black tracking-tight text-[#1491FF]">
                    {formatPrice(listing.price, listing.currency)}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-gray-100 pt-3 text-[11px] font-medium text-gray-500">
                    {vehicle.mileage != null && (
                        <span className="inline-flex items-center gap-1">
                            <Activity size={12} />
                            {formatNumber(vehicle.mileage)} km
                        </span>
                    )}

                    {location && (
                        <span className="inline-flex min-w-0 items-center gap-1">
                            <MapPin size={12} className="shrink-0" />
                            <span className="line-clamp-1">{location}</span>
                        </span>
                    )}
                </div>

                <p className="mt-3 text-[10px] font-medium text-gray-400">
                    Listed {formatDate(getListingDate(listing))}
                </p>
            </div>
        </Link>
    );
}

function EmptyListings({
    searching,
    onClear,
}: {
    searching: boolean;
    onClear: () => void;
}) {
    return (
        <div className="karmass-enter rounded-[28px] border border-dashed border-gray-200 bg-white px-5 py-12 text-center sm:py-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-blue-50 text-[#1491FF]">
                <CarFront size={30} strokeWidth={1.5} />
            </div>

            <h3 className="mt-5 text-base font-bold text-gray-900">
                {searching ? "No matching vehicles" : "No vehicles listed yet"}
            </h3>

            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-gray-500">
                {searching
                    ? "Try another vehicle name or clear your search."
                    : "This dealer has no published vehicles available to browse right now."}
            </p>

            {searching ? (
                <button
                    type="button"
                    onClick={onClear}
                    className="karmass-button mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-5 py-3 text-sm font-bold text-[#0877D9] transition hover:bg-blue-100"
                >
                    <X size={15} />
                    Clear search
                </button>
            ) : (
                <Link
                    href="/marketplace"
                    className="karmass-button mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1491FF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0877D9] active:scale-[0.98]"
                >
                    Browse marketplace
                    <ArrowRight size={16} />
                </Link>
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function PublicDealerProfileClient({
    dealerId,
}: PublicDealerProfileClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const {
        user,
        isAuthenticated,
        isLoading: isAuthLoading,
    } = useAuth();

    const currentUser = user as (
        typeof user & AuthUserContactFields
    ) | null;

    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    const [contactModalMode, setContactModalMode] =
        useState<ContactModalMode>("guest");

    const [isStartingConversation, setIsStartingConversation] =
        useState(false);

    const autoContactStarted = useRef<string | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [showSort, setShowSort] = useState(false);
    const [page, setPage] = useState(1);
    const [loadedListings, setLoadedListings] = useState<DealerListing[]>([]);
    const [phoneRevealed, setPhoneRevealed] = useState(false);

    const profileQuery = usePublicDealerProfile(dealerId);

    const listingsQuery = usePublicDealerListings(
        dealerId,
        page,
        PAGE_SIZE,
    );

    const profile = useMemo(
        () => unwrapProfile(profileQuery.data),
        [profileQuery.data],
    );

    const listingResult = useMemo(
        () => unwrapListings(listingsQuery.data),
        [listingsQuery.data],
    );

    const currentPageListings = listingResult.items;

    const isEmailVerified =
        currentUser?.isEmailVerified === true ||
        currentUser?.emailVerified === true ||
        Boolean(currentUser?.emailVerifiedAt);

    const dealerUserId = profile?.userId;

    const returnToDealer = `/dealers/${encodeURIComponent(dealerId)}?contactDealer=1`;

    const loginHref = `/login?next=${encodeURIComponent(returnToDealer)}`;

    const registerHref = `/register?next=${encodeURIComponent(returnToDealer)}`;

    /* ---------------------------------------------------------------------- */
    /* Merge paginated listings                                               */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        if (!Array.isArray(currentPageListings)) return;

        setLoadedListings((previous) => {
            const byId = new Map<string, DealerListing>();

            if (page > 1) {
                previous.forEach((listing) => {
                    byId.set(listing.id, listing);
                });
            }

            currentPageListings.forEach((listing) => {
                byId.set(listing.id, listing);
            });

            return Array.from(byId.values());
        });
    }, [currentPageListings, page]);

    /* ---------------------------------------------------------------------- */
    /* Reset when dealer changes                                              */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        setLoadedListings([]);
        setPage(1);
        setSearchTerm("");
        setSortBy("newest");
        setPhoneRevealed(false);
        setShowSort(false);
        setIsContactModalOpen(false);
        setIsStartingConversation(false);
        autoContactStarted.current = null;
    }, [dealerId]);

    /* ---------------------------------------------------------------------- */
    /* Contact dealer                                                         */
    /* ---------------------------------------------------------------------- */

    const handleContactDealer = useCallback(async () => {
        if (isStartingConversation) return;

        // A known guest should immediately see the guest modal.
        if (!isAuthenticated || !currentUser) {
            setContactModalMode("guest");
            setIsContactModalOpen(true);
            return;
        }

        // Authenticated users should wait for their account data
        // to finish loading before continuing.
        if (isAuthLoading) return;

        if (!isEmailVerified) {
            setContactModalMode("verification");
            setIsContactModalOpen(true);
            return;
        }

        if (!dealerUserId) {
            toast.error(
                "We couldn't identify this dealer's messaging account. Please try again later.",
            );
            return;
        }

        const currentUserId =
            currentUser.id ?? currentUser.userId;

        if (
            currentUserId &&
            currentUserId === dealerUserId
        ) {
            toast.error(
                "You cannot start a conversation with your own account.",
            );
            return;
        }

        try {
            setIsStartingConversation(true);

            const response =
                await createMessagingConversation(dealerUserId);

            const conversationId =
                response?.data?.conversation?.id;

            if (!conversationId) {
                throw new Error(
                    "The conversation could not be opened. Please try again.",
                );
            }

            setIsContactModalOpen(false);

            router.push(
                `/dashboard/messages?conversationId=${encodeURIComponent(conversationId)}`,
            );
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "We couldn't start a conversation. Please try again.",
            );
        } finally {
            setIsStartingConversation(false);
        }
    }, [
        isStartingConversation,
        isAuthenticated,
        currentUser,
        isAuthLoading,
        isEmailVerified,
        dealerUserId,
        router,
    ]);

    /* ---------------------------------------------------------------------- */
    /* Continue contact flow after login or registration                      */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        const shouldContactDealer =
            searchParams.get("contactDealer") === "1";

        if (!shouldContactDealer || isAuthLoading || profileQuery.isPending) {
            return;
        }

        if (profileQuery.isError || !profile) {
            return;
        }

        const attemptKey = `${dealerId}:${currentUser?.id ?? currentUser?.userId ?? "guest"}`;

        if (autoContactStarted.current === attemptKey) {
            return;
        }

        autoContactStarted.current = attemptKey;

        void handleContactDealer();

        const cleanUrl = `/dealers/${encodeURIComponent(dealerId)}`;

        window.history.replaceState(window.history.state, "", cleanUrl);
    }, [
        searchParams,
        isAuthLoading,
        profileQuery.isPending,
        profileQuery.isError,
        profile,
        dealerId,
        currentUser,
        handleContactDealer,
    ]);

    /* ---------------------------------------------------------------------- */
    /* Search and sorting                                                     */
    /* ---------------------------------------------------------------------- */

    const sortedListings = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        const filtered = loadedListings.filter((listing) => {
            const vehicle = listing as DealerListing & {
                city?: string | null;
                state?: string | null;
                country?: string | null;
            };

            const searchableText = [
                listing.title,
                getVehicleName(listing),
                listing.condition,
                vehicle.city,
                vehicle.state,
                vehicle.country,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(normalizedSearch);
        });

        return [...filtered].sort((a, b) => {
            if (sortBy === "price-low") {
                return Number(a.price) - Number(b.price);
            }

            if (sortBy === "price-high") {
                return Number(b.price) - Number(a.price);
            }

            const dateA = new Date(getListingDate(a) ?? 0).getTime();
            const dateB = new Date(getListingDate(b) ?? 0).getTime();

            return dateB - dateA;
        });
    }, [loadedListings, searchTerm, sortBy]);

    /* ---------------------------------------------------------------------- */
    /* Pagination                                                             */
    /* ---------------------------------------------------------------------- */

    const hasMore = useMemo(() => {
        if (typeof listingResult.totalPages === "number") {
            return page < listingResult.totalPages;
        }

        return currentPageListings.length === PAGE_SIZE;
    }, [
        listingResult.totalPages,
        page,
        currentPageListings.length,
    ]);

    const loadMore = useCallback(() => {
        if (!listingsQuery.isFetching && hasMore) {
            setPage((previous) => previous + 1);
        }
    }, [listingsQuery.isFetching, hasMore]);

    /* ---------------------------------------------------------------------- */
    /* Dealer information                                                     */
    /* ---------------------------------------------------------------------- */

    const dealerName = profile?.companyName || "KARMASS dealer";

    const contactName = profile?.contactName?.trim() || "Dealer representative";

    const publicPhone =
        profile?.verified === true &&
        profile?.showPhone === true &&
        typeof profile?.phone === "string" &&
        profile.phone.trim().length > 0
            ? profile.phone.trim()
            : null;

    const canShowPhone = Boolean(publicPhone);

    /* ---------------------------------------------------------------------- */
    /* Profile loading                                                        */
    /* ---------------------------------------------------------------------- */

    if (profileQuery.isPending) {
        return <ProfileSkeleton />;
    }

    /* ---------------------------------------------------------------------- */
    /* Profile error                                                          */
    /* ---------------------------------------------------------------------- */

    if (profileQuery.isError || !profile) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F5F9FF] px-4 py-12">
                <DealerAnimationStyles />

                <div className="karmass-enter w-full max-w-md rounded-[28px] border border-gray-100 bg-white p-7 text-center shadow-sm sm:p-9">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-red-50 text-red-500">
                        <Store size={30} />
                    </div>

                    <h1 className="mt-5 text-xl font-black text-gray-900">
                        Dealer profile unavailable
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        We couldn&apos;t load this dealer profile. It may have
                        been removed, the link may be incorrect, or the
                        response format may differ from the expected format.
                    </p>

                    <div className="mt-6 flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={() => profileQuery.refetch()}
                            className="karmass-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0877D9] active:scale-[0.98]"
                        >
                            <RefreshCw size={16} />
                            Try again
                        </button>

                        <Link
                            href="/marketplace"
                            className="karmass-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                        >
                            Browse marketplace
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    {process.env.NODE_ENV === "development" && (
                        <p className="mt-5 break-all rounded-xl bg-gray-50 p-3 text-left text-[10px] text-gray-500">
                            Dealer ID: {dealerId}
                            <br />
                            {profileQuery.error instanceof Error
                                ? profileQuery.error.message
                                : "No dealer profile found in the API response."}
                        </p>
                    )}
                </div>
            </main>
        );
    }

    /* ---------------------------------------------------------------------- */
    /* Main page                                                              */
    /* ---------------------------------------------------------------------- */

    return (
        <main className="karmass-mobile-content min-h-screen bg-[#F5F9FF] pb-20 text-gray-900 sm:pb-0">
            <DealerAnimationStyles />

            {/* Sticky navigation */}

            <header className="sticky top-0 z-30 border-b border-gray-100/90 bg-white/90 backdrop-blur-xl">
                <div className="mx-auto flex h-[62px] max-w-6xl items-center justify-between px-4 sm:h-[72px] sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                if (window.history.length > 1) {
                                    router.back();
                                } else {
                                    router.push("/dealers");
                                }
                            }}
                            aria-label="Go back"
                            className="karmass-button flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-700 transition hover:border-blue-100 hover:bg-blue-50 hover:text-[#1491FF] active:scale-95"
                        >
                            <ArrowLeft size={19} />
                        </button>

                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1491FF]">
                                KARMASS
                            </p>

                            <p className="truncate text-sm font-bold text-gray-900">
                                Dealer profile
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/marketplace"
                        className="karmass-button inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-gray-50 px-3 text-xs font-bold text-gray-700 transition hover:bg-blue-50 hover:text-[#1491FF] sm:px-4 sm:text-sm"
                    >
                        <Search size={15} />
                        <span className="hidden sm:inline">Marketplace</span>
                        <span className="sm:hidden">Explore</span>
                    </Link>
                </div>
            </header>

            <div className="mx-auto max-w-6xl px-4 pb-8 pt-5 sm:px-6 sm:pt-8 lg:px-8">
                {/* Dealer hero */}

                <section className="karmass-enter relative overflow-hidden rounded-[29px] border border-white bg-white shadow-sm sm:rounded-[34px]">
                    <div className="relative h-36 overflow-hidden bg-gradient-to-r from-[#0065C9] via-[#1491FF] to-[#69B7FF] sm:h-48 lg:h-56">
                        {profile.coverPhotoUrl ? (
                            <img
                                src={profile.coverPhotoUrl}
                                alt={`${dealerName} cover`}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#0065C9] via-[#1491FF] to-[#69B7FF]" />

                                <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full border-[32px] border-white/10 sm:h-72 sm:w-72" />

                                <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full border-[24px] border-white/10" />

                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center text-white/80">
                                        <Store size={30} strokeWidth={1.2} className="mx-auto mb-2" />

                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] sm:text-xs">
                                            KARMASS Dealer
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />

                        <div className="absolute left-4 top-4 sm:left-7 sm:top-6">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-md sm:text-xs">
                                <ShieldCheck size={14} />
                                Dealer storefront
                            </span>
                        </div>

                        {profile.verified && (
                            <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white backdrop-blur-md sm:right-7 sm:top-6">
                                <BadgeCheck size={19} />
                            </div>
                        )}
                    </div>

                    <div className="relative px-4 pb-5 sm:px-8 sm:pb-8">
                        <div className="-mt-10 flex items-end gap-3 sm:-mt-12 sm:gap-5">
                            <DealerAvatar
                                name={dealerName}
                                imageUrl={profile.profilePictureUrl}
                            />

                            <div className="min-w-0 flex-1 pb-1">
                                {profile.verified ? (
                                    <VerifiedBadge compact />
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                                        <Clock3 size={12} />
                                        Verification pending
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mt-4">
                            <h1 className="break-words text-[22px] font-black leading-tight tracking-tight text-gray-950 sm:text-3xl">
                                {dealerName}
                            </h1>

                            {contactName !== "Dealer representative" && (
                                <p className="mt-1.5 text-xs font-medium text-gray-500 sm:text-sm">
                                    {contactName}
                                </p>
                            )}

                            {profile.bio?.trim() && (
                                <div className="mt-4 max-w-3xl">
                                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-600">
                                        {profile.bio.trim()}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-5 text-[11px] font-medium text-gray-500 sm:text-xs">
                            <span className="inline-flex items-center gap-1.5">
                                <CalendarDays size={14} />
                                Joined {formatDate(profile.createdAt)}
                            </span>

                            {profile.verified && profile.verifiedAt && (
                                <span className="inline-flex items-center gap-1.5 text-emerald-700">
                                    <CheckCircle2 size={14} />
                                    Verified {formatDate(profile.verifiedAt)}
                                </span>
                            )}
                        </div>

                        {/* Primary dealer actions */}

                        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <a
                                href="#dealer-listings"
                                className="karmass-button inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#1491FF] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition duration-200 hover:bg-[#0877D9] active:scale-[0.98]"
                            >
                                <CarFront size={18} />
                                Browse vehicles
                                <ArrowRight size={16} />
                            </a>

                            <button
                                type="button"
                                onClick={() => void handleContactDealer()}
                                disabled={isStartingConversation}
                                className="karmass-button inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white px-5 py-3 text-sm font-bold text-[#1491FF] transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.98]"
                            >
                                {isStartingConversation ? (
                                    <LoaderCircle size={17} className="animate-spin" />
                                ) : (
                                    <MessageCircle size={17} />
                                )}

                                {isStartingConversation
                                    ? "Opening chat..."
                                    : "Contact dealer"}
                            </button>

                            {canShowPhone && publicPhone ? (
                                phoneRevealed ? (
                                    <a
                                        href={`tel:${publicPhone}`}
                                        className="karmass-button inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 active:scale-[0.98]"
                                    >
                                        <Phone size={17} />
                                        <span className="break-all">{publicPhone}</span>
                                    </a>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setPhoneRevealed(true)}
                                        className="karmass-button inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#1491FF] active:scale-[0.98]"
                                    >
                                        <Phone size={17} />
                                        Show phone number
                                    </button>
                                )
                            ) : (
                                <Link
                                    href="/marketplace"
                                    className="karmass-button inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#1491FF] active:scale-[0.98]"
                                >
                                    <Store size={17} />
                                    Explore marketplace
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* Trust cards */}

                <section className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2">
                    <div className="karmass-card karmass-enter karmass-stagger-1 flex items-start gap-3 rounded-[22px] border border-gray-100 bg-white p-4 sm:p-5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                            <ShieldCheck size={21} />
                        </div>

                        <div>
                            <p className="text-sm font-bold text-gray-900">
                                {profile.verified
                                    ? "Verified business profile"
                                    : "Dealer profile"}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-gray-500">
                                {profile.verified
                                    ? "This dealer has a verified profile on KARMASS."
                                    : "Review vehicle information carefully before making a purchase."}
                            </p>
                        </div>
                    </div>

                    <div className="karmass-card karmass-enter karmass-stagger-2 flex items-start gap-3 rounded-[22px] border border-gray-100 bg-white p-4 sm:p-5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#1491FF]">
                            <Building2 size={21} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-900">
                                Dealer contact
                            </p>

                            <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                                {contactName}
                            </p>

                            {!canShowPhone || !publicPhone ? (
                                <p className="mt-1 text-[10px] font-medium text-gray-400">
                                    The dealer has not made a phone number publicly available.
                                </p>
                            ) : null}

                            {/* <button
                                type="button"
                                onClick={() => void handleContactDealer()}
                                disabled={isStartingConversation || isAuthLoading}
                                className="karmass-button mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#1491FF] hover:text-[#0877D9] disabled:opacity-60"
                            >
                                <MessageCircle size={13} />
                                Message this dealer
                            </button> */}
                        </div>
                    </div>
                </section>

                {/* Inventory */}

                <section
                    id="dealer-listings"
                    className="scroll-mt-24 pt-9 sm:pt-11"
                >
                    <div className="flex items-end justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1491FF]">
                                Dealer inventory
                            </p>

                            <h2 className="mt-1.5 text-xl font-black tracking-tight text-gray-950 sm:text-2xl">
                                Available vehicles
                            </h2>

                            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                Explore vehicles published by this dealer.
                            </p>
                        </div>

                        <div className="shrink-0 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2 text-center">
                            <p className="text-lg font-black leading-5 text-[#1491FF]">
                                {formatNumber(
                                    listingResult.total ?? loadedListings.length,
                                )}
                            </p>

                            <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-blue-600">
                                Vehicles
                            </p>
                        </div>
                    </div>

                    {/* Search and sorting */}

                    <div className="mt-5 flex gap-2">
                        <label className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-2xl border border-gray-200 bg-white px-4 transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100/70">
                            <Search size={17} className="shrink-0 text-gray-400" />

                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search this dealer's vehicles"
                                className="h-full min-w-0 flex-1 bg-transparent text-xs font-medium text-gray-900 outline-none placeholder:text-gray-400 sm:text-sm"
                            />

                            {searchTerm && (
                                <button
                                    type="button"
                                    aria-label="Clear search"
                                    onClick={() => setSearchTerm("")}
                                    className="karmass-button flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </label>

                        <div className="relative shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowSort((previous) => !previous)}
                                aria-expanded={showSort}
                                className="karmass-button flex h-12 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition hover:border-blue-200 hover:text-[#1491FF] sm:px-4 sm:text-sm"
                            >
                                <SlidersHorizontal size={16} />
                                <span className="hidden sm:inline">Sort</span>
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform duration-200 ${showSort ? "rotate-180" : ""}`}
                                />
                            </button>

                            {showSort && (
                                <>
                                    <button
                                        type="button"
                                        aria-label="Close sort options"
                                        className="fixed inset-0 z-20 cursor-default"
                                        onClick={() => setShowSort(false)}
                                    />

                                    <div className="karmass-sort-menu absolute right-0 top-14 z-30 w-48 overflow-hidden rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl shadow-gray-200/70">
                                        {(
                                            [
                                                ["newest", "Newest first"],
                                                ["price-low", "Price: low to high"],
                                                ["price-high", "Price: high to low"],
                                            ] as const
                                        ).map(([value, label]) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => {
                                                    setSortBy(value);
                                                    setShowSort(false);
                                                }}
                                                className={[
                                                    "karmass-button flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-xs font-semibold transition",
                                                    sortBy === value
                                                        ? "bg-blue-50 text-[#1491FF]"
                                                        : "text-gray-600 hover:bg-gray-50",
                                                ].join(" ")}
                                            >
                                                {label}
                                                {sortBy === value && <CheckCircle2 size={15} />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Loading skeletons */}

                    {listingsQuery.isPending && page === 1 && (
                        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="overflow-hidden rounded-[25px] border border-gray-100 bg-white"
                                >
                                    <div className="karmass-shimmer h-44 sm:h-48" />
                                    <div className="space-y-3 p-4">
                                        <div className="karmass-shimmer h-4 w-3/4 rounded" />
                                        <div className="karmass-shimmer h-5 w-1/2 rounded" />
                                        <div className="karmass-shimmer h-3 w-2/3 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Listing error */}

                    {listingsQuery.isError && loadedListings.length === 0 && (
                        <div className="karmass-enter mt-5 rounded-[25px] border border-red-100 bg-white p-6 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                                <RefreshCw size={21} />
                            </div>

                            <p className="mt-4 text-sm font-bold text-gray-900">
                                Could not load vehicles
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                Check your connection and try again.
                            </p>

                            <button
                                type="button"
                                onClick={() => listingsQuery.refetch()}
                                className="karmass-button mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1491FF] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#0877D9]"
                            >
                                <RefreshCw size={14} />
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Empty inventory */}

                    {!listingsQuery.isPending &&
                        !listingsQuery.isError &&
                        sortedListings.length === 0 && (
                            <div className="mt-5">
                                <EmptyListings
                                    searching={
                                        loadedListings.length > 0 ||
                                        Boolean(searchTerm)
                                    }
                                    onClear={() => setSearchTerm("")}
                                />
                            </div>
                        )}

                    {/* Vehicle cards */}

                    {sortedListings.length > 0 && (
                        <div className="karmass-listings-grid mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                            {sortedListings.map((listing, index) => (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}

                    {/* Load more */}

                    {hasMore &&
                        !searchTerm &&
                        !listingsQuery.isError && (
                            <div className="mt-7 flex justify-center">
                                <button
                                    type="button"
                                    disabled={listingsQuery.isFetching}
                                    onClick={loadMore}
                                    className="karmass-button inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white px-6 py-3 text-sm font-bold text-[#1491FF] shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
                                >
                                    {listingsQuery.isFetching ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" />
                                            Loading vehicles...
                                        </>
                                    ) : (
                                        <>
                                            Load more vehicles
                                            <ChevronDown size={16} />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                    {listingsQuery.isFetching &&
                        page > 1 &&
                        loadedListings.length > 0 && (
                            <div
                                className="mt-5 flex items-center justify-center gap-2 py-3 text-xs font-medium text-gray-500"
                                role="status"
                            >
                                <RefreshCw size={14} className="animate-spin text-[#1491FF]" />
                                Loading more vehicles...
                            </div>
                        )}
                </section>

                {/* Safety reminder */}

                <section className="karmass-enter mt-10 overflow-hidden rounded-[27px] bg-gray-950 p-5 text-white sm:mt-12 sm:p-7">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-blue-300">
                            <ShieldCheck size={24} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h2 className="text-base font-bold">
                                Shop with confidence
                            </h2>

                            <p className="mt-2 text-xs leading-6 text-gray-400 sm:text-sm">
                                Review each vehicle&apos;s description, condition,
                                price, and available details before arranging an
                                inspection or making a payment.
                            </p>

                            <Link
                                href="/marketplace"
                                className="karmass-button mt-4 inline-flex items-center gap-2 text-xs font-bold text-blue-300 transition hover:text-white sm:text-sm"
                            >
                                Explore more vehicles
                                <ArrowRight size={15} />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}

                <footer className="pb-5 pt-8 text-center">
                    <p className="text-[10px] font-medium tracking-wide text-gray-400">
                        KARMASS · Cars, made easier.
                    </p>
                </footer>
            </div>

            {/* Mobile sticky action bar */}

            <div className="karmass-mobile-bar fixed inset-x-0 bottom-0 z-30 border-t border-gray-100 bg-white/95 p-3 backdrop-blur-xl sm:hidden">
                <div className="mx-auto flex max-w-lg items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-gray-900">
                            {dealerName}
                        </p>

                        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-gray-500">
                            {profile.verified ? (
                                <>
                                    <BadgeCheck size={12} className="shrink-0 text-emerald-600" />
                                    <span className="truncate">Verified KARMASS dealer</span>
                                </>
                            ) : (
                                <>
                                    <Store size={12} className="shrink-0 text-[#1491FF]" />
                                    <span className="truncate">KARMASS dealer profile</span>
                                </>
                            )}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void handleContactDealer()}
                        disabled={isStartingConversation || isAuthLoading}
                        className="karmass-button inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-4 text-xs font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-[#0877D9] disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.97]"
                    >
                        {isStartingConversation ? (
                            <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                            <MessageCircle size={16} />
                        )}

                        {isStartingConversation ? "Opening..." : "Contact dealer"}
                    </button>
                </div>
            </div>

            {/* Contact dealer modal */}

            <ContactDealerModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                dealerName={dealerName}
                mode={contactModalMode}
                loginHref={loginHref}
                registerHref={registerHref}
            />
        </main>
    );
}