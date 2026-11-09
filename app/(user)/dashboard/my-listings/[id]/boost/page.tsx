"use client";

import {
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import Link from "next/link";

import {
    useParams,
    useRouter,
    useSearchParams,
} from "next/navigation";

import {
    useQuery,
} from "@tanstack/react-query";

import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "framer-motion";

import {
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    CalendarDays,
    CarFront,
    Check,
    CheckCircle2,
    Clock3,
    CreditCard,
    ExternalLink,
    Info,
    LoaderCircle,
    MapPin,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    XCircle,
} from "lucide-react";

import {
    getSellerListingDetail,
} from "@/app/services/user/listings/listing.service";

import {
    useBoostPlans,
    useBoostHistory,
    useCreateListingBoost,
} from "@/app/hooks/user/boost/useBoost";

import {
    useInitializeBoostPayment,
} from "@/app/hooks/user/boost/useInitializeBoostPayment";


import type {
    BoostHistoryItem,
    BoostPlan,
    BoostStatus,
} from "@/app/types/user/boost/boost.types";

import type {
    ListingImageRecord,
} from "@/app/types/user/listings/listing-image.types";

import { useVerifyBoostPayment } from "@/app/hooks/user/boost/useVerifyBoostpayment";
import BoostPlanCard from "@/app/components/userComponents/boost/BoostPlanCard";
import BoostPaymentSummary from "@/app/components/userComponents/boost/BoostPaymentSummary";


// HELPERS
function formatListingPrice(
    price: string | number,
    currency: string,
): string {
    const amount = Number(price);

    if (!Number.isFinite(amount)) {
        return `${currency} ${price}`;
    }

    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: currency || "NGN",
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${currency} ${amount.toLocaleString()}`;
    }
}

function formatListingLocation(
    city?: string | null,
    state?: string | null,
): string {
    return [city, state]
        .filter(Boolean)
        .join(", ") || "Location not specified";
}

function getListingImage(
    images: ListingImageRecord[],
): string | null {
    const firstImage = images?.[0] as
        | {
            url?: string;
            thumbnailUrl?: string;
            detailUrl?: string;
        }
        | undefined;

    return (
        firstImage?.thumbnailUrl ||
        firstImage?.url ||
        firstImage?.detailUrl ||
        null
    );
}

function getBoostStatusDetails(status: BoostStatus) {
    switch (status) {
        case "PENDING":
            return {
                title: "Payment pending",
                description:
                    "Your boost request has been created. Complete payment to submit it for approval.",
                color: "amber",
                icon: Clock3,
            };

        case "AWAITING_APPROVAL":
            return {
                title: "Awaiting approval",
                description:
                    "Your payment has been verified. Your vehicle boost will become active after administrative approval.",
                color: "blue",
                icon: Clock3,
            };

        case "ACTIVE":
            return {
                title: "Your boost is active",
                description:
                    "Your vehicle is currently receiving boosted visibility on KARMASS.",
                color: "green",
                icon: CheckCircle2,
            };

        case "REJECTED":
            return {
                title: "Boost rejected",
                description:
                    "Your previous boost request was rejected. You can select another plan.",
                color: "red",
                icon: XCircle,
            };

        case "EXPIRED":
            return {
                title: "Boost expired",
                description:
                    "Your previous promotion period has ended. You can boost this vehicle again.",
                color: "slate",
                icon: Clock3,
            };

        case "CANCELLED":
            return {
                title: "Boost cancelled",
                description:
                    "Your previous boost request was cancelled.",
                color: "slate",
                icon: XCircle,
            };
    }
}

// PAGE
export default function BoostListingPage() {
    return (
        <Suspense
            fallback={
                <BoostPageLoading />
            }
        >
            <BoostListingContent />
        </Suspense>
    );
}

// MAIN CONTENT
function BoostListingContent() {
    const params = useParams<{ id: string }>();

    const router = useRouter();

    const searchParams = useSearchParams();

    const shouldReduceMotion = useReducedMotion();

    const listingId = params.id;

    const paymentReference =
        searchParams.get("reference") ||
        searchParams.get("trxref");

    const verificationAttemptRef = useRef<string | null>(null);

    const [selectedPlanId, setSelectedPlanId] = useState("");

    const [actionError, setActionError] = useState<string | null>(
        null,
    );

    const [paymentVerified, setPaymentVerified] = useState(false);

    const [verificationError, setVerificationError] = useState<
        string | null
    >(null);

    // ========================================
    // LISTING
    // ========================================

    const listingQuery = useQuery({
        queryKey: [
            "seller-listing-detail",
            listingId,
        ],

        queryFn: async () => {
            const response =
                await getSellerListingDetail(listingId);

            if (
                !response.success ||
                !response.data?.listing
            ) {
                throw new Error(
                    response.message ||
                    "Unable to retrieve this vehicle listing.",
                );
            }

            return response.data;
        },

        enabled: Boolean(listingId),

        staleTime: 60 * 1000,

        retry: 1,
    });

    const listing = listingQuery.data?.listing;

    const vehicleImage = listingQuery.data
        ? getListingImage(listingQuery.data.images)
        : null;

    const vehicleName = [
        listingQuery.data?.vehicleMake?.name,
        listingQuery.data?.vehicleModel?.name,
        listingQuery.data?.vehicleGeneration?.name,
        listingQuery.data?.vehicleVariant?.name,
    ]
        .filter(Boolean)
        .join(" ");

    // ========================================
    // BOOST PLANS
    // ========================================

    const plansQuery = useBoostPlans(
        Boolean(listingId),
    );

    const plans = useMemo(
        () =>
            (plansQuery.data ?? []).filter(
                (plan) => Boolean(plan.active),
            ),
        [plansQuery.data],
    );

    // ========================================
    // BOOST HISTORY
    // ========================================

    const historyQuery = useBoostHistory({
        page: 1,
        limit: 100,
        enabled: Boolean(listingId),
    });

    const listingBoosts = useMemo(
        () =>
            (historyQuery.data?.items ?? [])
                .filter(
                    (item) => item.listingId === listingId,
                )
                .sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                ),
        [
            historyQuery.data?.items,
            listingId,
        ],
    );

    const currentBoost = listingBoosts.find(
        (boost) =>
            boost.status === "PENDING" ||
            boost.status === "AWAITING_APPROVAL" ||
            boost.status === "ACTIVE",
    );

    // ========================================
    // MUTATIONS
    // ========================================

    const createBoost = useCreateListingBoost();

    const initializePayment = useInitializeBoostPayment();

    const verifyPayment = useVerifyBoostPayment();

    // ========================================
    // SELECTED PLAN
    // ========================================

    const selectedPlan = useMemo(
        () =>
            plans.find(
                (plan) => plan.id === selectedPlanId,
            ) ?? null,
        [
            plans,
            selectedPlanId,
        ],
    );

    const existingBoostPlan = useMemo(
        () =>
            currentBoost
                ? plans.find(
                    (plan) =>
                        plan.id === currentBoost.boostPlanId,
                ) ?? null
                : null,
        [
            currentBoost,
            plans,
        ],
    );

    // Select the first available plan by default.
    useEffect(() => {
        if (
            plans.length > 0 &&
            !selectedPlanId
        ) {
            setSelectedPlanId(plans[0].id);
        }
    }, [
        plans,
        selectedPlanId,
    ]);

    // Keep the selected plan aligned with an existing pending boost.
    useEffect(() => {
        if (
            currentBoost?.status === "PENDING"
        ) {
            setSelectedPlanId(currentBoost.boostPlanId);
        }
    }, [currentBoost]);

    // ========================================
    // PAYMENT VERIFICATION
    // ========================================

    const handleVerifyPayment = useCallback(
        async (reference: string) => {
            if (!reference.trim()) {
                return;
            }

            setVerificationError(null);

            try {
                await verifyPayment.mutateAsync(reference);

                setPaymentVerified(true);

                setActionError(null);

                await Promise.all([
                    listingQuery.refetch(),
                    historyQuery.refetch(),
                ]);
            } catch (error) {
                setVerificationError(
                    error instanceof Error
                        ? error.message
                        : "We could not verify your payment. Please try again.",
                );

                verificationAttemptRef.current = null;
            }
        },
        [
            verifyPayment,
            listingQuery,
            historyQuery,
        ],
    );

    useEffect(() => {
        if (!paymentReference) {
            return;
        }

        if (
            verificationAttemptRef.current === paymentReference
        ) {
            return;
        }

        verificationAttemptRef.current = paymentReference;

        void handleVerifyPayment(paymentReference);
    }, [
        paymentReference,
        handleVerifyPayment,
    ]);

    // ========================================
    // INITIALIZE PAYMENT
    // ========================================

    const handleContinueToPayment = async () => {
        if (!listing) {
            return;
        }

        const hasPendingBoost =
            currentBoost?.status === "PENDING";

        // A plan is only required when creating a new boost.
        // An existing pending boost already has its plan snapshot.
        if (!hasPendingBoost && !selectedPlan) {
            setActionError(
                "Please select a boost plan before continuing.",
            );

            return;
        }

        if (listing.status !== "APPROVED") {
            setActionError(
                "Only approved vehicle listings can be boosted.",
            );

            return;
        }

        if (
            currentBoost?.status === "ACTIVE" ||
            currentBoost?.status === "AWAITING_APPROVAL"
        ) {
            return;
        }

        setActionError(null);

        try {
            let boostId: string;

            if (hasPendingBoost && currentBoost) {
                // Preserve and reuse the existing pending boost.
                boostId = currentBoost.id;
            } else {
                if (!selectedPlan) {
                    throw new Error(
                        "Please select a boost plan.",
                    );
                }

                const boost = await createBoost.mutateAsync({
                    listingId,
                    boostPlanId: selectedPlan.id,
                });

                boostId = boost.id;
            }

            const payment =
                await initializePayment.mutateAsync(boostId);

            if (payment.status === "SUCCESS") {
                setPaymentVerified(true);

                await Promise.all([
                    listingQuery.refetch(),
                    historyQuery.refetch(),
                ]);

                return;
            }

            if (
                payment.status === "FAILED" ||
                payment.status === "ABANDONED"
            ) {
                throw new Error(
                    "The previous payment attempt has ended. Please retry payment.",
                );
            }

            if (!payment.authorizationUrl) {
                throw new Error(
                    "Your existing payment session is being recovered. Please try again shortly. Do not create another boost request.",
                );
            }

            window.location.assign(
                payment.authorizationUrl,
            );
        } catch (error) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : "Unable to initialize payment. Please try again.",
            );
        }
    };

    // ========================================
    // STATES
    // ========================================

    const isProcessing =
        createBoost.isPending ||
        initializePayment.isPending;

    const isListingApproved =
        listing?.status === "APPROVED";

    const hasReservedBoost =
        currentBoost?.status === "ACTIVE" ||
        currentBoost?.status === "AWAITING_APPROVAL";

    const canContinue =
        Boolean(
            listing &&
            selectedPlan &&
            isListingApproved &&
            !hasReservedBoost &&
            !isProcessing &&
            !paymentVerified,
        );

    const isLoading =
        listingQuery.isLoading ||
        plansQuery.isLoading ||
        historyQuery.isLoading;

    // ========================================
    // LOADING
    // ========================================

    if (isLoading) {
        return <BoostPageLoading />;
    }

    // ========================================
    // LISTING ERROR
    // ========================================

    if (
        listingQuery.isError ||
        !listing
    ) {
        return (
            <main className="min-h-screen bg-[#F7FAFD] px-4 py-12">
                <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                        <XCircle size={26} />
                    </div>

                    <h1 className="mt-5 text-xl font-bold text-slate-900">
                        Listing unavailable
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        {listingQuery.error instanceof Error
                            ? listingQuery.error.message
                            : "We couldn't load this vehicle listing."}
                    </p>

                    <Link
                        href="/dashboard/my-listings"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1491FF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0877D9]"
                    >
                        <ArrowLeft size={16} />
                        Back to my listings
                    </Link>
                </div>
            </main>
        );
    }

    // ========================================
    // PAYMENT VERIFICATION SCREEN
    // ========================================

    if (
        paymentReference &&
        !paymentVerified &&
        !verificationError
    ) {
        return (
            <main className="min-h-screen bg-[#F7FAFD] px-4 py-16">
                <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF5FF] text-[#1491FF]">
                        <LoaderCircle
                            size={30}
                            className="animate-spin"
                        />
                    </div>

                    <h1 className="mt-5 text-xl font-bold text-slate-900">
                        Verifying your payment
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Please wait while KARMASS confirms your boost payment.
                        Do not close this page.
                    </p>
                </div>
            </main>
        );
    }

    // ========================================
    // PAYMENT VERIFICATION ERROR
    // ========================================

    if (
        paymentReference &&
        verificationError
    ) {
        return (
            <main className="min-h-screen bg-[#F7FAFD] px-4 py-16">
                <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <XCircle size={30} />
                    </div>

                    <h1 className="mt-5 text-xl font-bold text-slate-900">
                        Payment verification unsuccessful
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        {verificationError}
                    </p>

                    <button
                        type="button"
                        disabled={verifyPayment.isPending}
                        onClick={() => {
                            void handleVerifyPayment(
                                paymentReference,
                            );
                        }}
                        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0877D9] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {verifyPayment.isPending ? (
                            <LoaderCircle
                                size={16}
                                className="animate-spin"
                            />
                        ) : (
                            <RefreshCw size={16} />
                        )}

                        Retry verification
                    </button>
                </div>
            </main>
        );
    }

    // ========================================
    // SUCCESSFUL PAYMENT SCREEN
    // ========================================

    if (paymentVerified) {
        return (
            <PaymentSuccessScreen
                listingTitle={listing.title}
                listingId={listing.id}
            />
        );
    }

    // ========================================
    // MAIN PAGE
    // ========================================

    return (
        <main className="min-h-screen bg-[#F7FAFD] pb-28">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

                {/* HEADER */}

                <div className="mb-7">
                    <Link
                        href="/dashboard/my-listings"
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#1491FF]"
                    >
                        <ArrowLeft size={16} />
                        Back to my listings
                    </Link>

                    <div className="mt-6">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF5FF] px-3 py-1.5 text-xs font-semibold text-[#0877D9]">
                            <Sparkles size={14} />
                            Vehicle promotion
                        </div>

                        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            Boost your listing
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                            Give your vehicle more visibility and reach
                            potential buyers on KARMASS.
                        </p>
                    </div>
                </div>

                {/* EXISTING BOOST STATUS */}

                {currentBoost && (
                    <ExistingBoostNotice
                        boost={currentBoost}
                        plan={existingBoostPlan}
                        listingId={listingId}
                        onResumePayment={
                            currentBoost.status === "PENDING"
                                ? handleContinueToPayment
                                : undefined
                        }
                        isProcessing={isProcessing}
                    />
                )}

                {/* LISTING NOT APPROVED */}

                {!isListingApproved && (
                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <Info
                            size={19}
                            className="mt-0.5 shrink-0 text-amber-600"
                        />

                        <div>
                            <p className="text-sm font-bold text-amber-900">
                                Your listing is not eligible for boosting yet.
                            </p>

                            <p className="mt-1 text-sm leading-5 text-amber-800">
                                Your vehicle must be approved before
                                you can purchase a boost.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid gap-7 lg:grid-cols-[1fr_360px] lg:items-start">

                    {/* LEFT COLUMN */}

                    <div className="space-y-7">

                        {/* VEHICLE PREVIEW */}

                        <section>
                            <div className="mb-3">
                                <h2 className="text-base font-bold text-slate-900">
                                    Vehicle being promoted
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Your boost will apply to this individual listing.
                                </p>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                <div className="flex flex-col sm:flex-row">
                                    <div className="relative h-48 shrink-0 bg-[#EAF5FF] sm:h-40 sm:w-52">
                                        {vehicleImage ? (
                                            <div
                                                role="img"
                                                aria-label={listing.title}
                                                className="h-full w-full bg-cover bg-center"
                                                style={{
                                                    backgroundImage: `url("${vehicleImage.replace(/["\\]/g, "")}")`,
                                                }}
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-[#1491FF]">
                                                <CarFront size={48} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex min-w-0 flex-1 flex-col justify-center p-4 sm:p-5">
                                        <div className="flex items-center gap-2">
                                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                                                {listing.status}
                                            </span>

                                            <span className="text-xs text-slate-400">
                                                Vehicle listing
                                            </span>
                                        </div>

                                        <h3 className="mt-3 text-base font-bold text-slate-900 sm:text-lg">
                                            {listing.title}
                                        </h3>

                                        {vehicleName && (
                                            <p className="mt-1 text-xs text-slate-500">
                                                {vehicleName}
                                            </p>
                                        )}

                                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                                            <span className="text-lg font-extrabold text-[#0877D9]">
                                                {formatListingPrice(
                                                    listing.price,
                                                    listing.currency,
                                                )}
                                            </span>

                                            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                                <MapPin size={13} />

                                                {formatListingLocation(
                                                    listing.city,
                                                    listing.state,
                                                )}
                                            </span>
                                        </div>

                                        <Link
                                            href={`/marketplace/${encodeURIComponent(listing.id)}`}
                                            target="_blank"
                                            className="mt-3 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-[#1491FF] hover:text-[#0877D9]"
                                        >
                                            View listing
                                            <ExternalLink size={13} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* BOOST PLANS */}

                        <section>
                            <div className="mb-4">
                                <h2 className="text-base font-bold text-slate-900">
                                    Choose your boost plan
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Select how long you want your vehicle promoted.
                                </p>
                            </div>

                            {plansQuery.isError ? (
                                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                                    <p className="text-sm font-semibold text-red-700">
                                        Unable to load boost plans.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => plansQuery.refetch()}
                                        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-700"
                                    >
                                        <RefreshCw size={14} />
                                        Try again
                                    </button>
                                </div>
                            ) : plans.length === 0 ? (
                                <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center">
                                    <Sparkles
                                        size={28}
                                        className="mx-auto text-[#1491FF]"
                                    />

                                    <p className="mt-3 text-sm font-bold text-slate-800">
                                        No boost plans available
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Please check back later.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {plans.map((plan) => (
                                        <BoostPlanCard
                                            key={plan.id}
                                            plan={plan}
                                            selected={
                                                selectedPlanId === plan.id
                                            }
                                            onSelect={(selected) => {
                                                setSelectedPlanId(
                                                    selected.id,
                                                );

                                                setActionError(null);
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* HOW IT WORKS */}

                        <section className="rounded-2xl border border-slate-200 bg-white p-5">
                            <h3 className="text-sm font-bold text-slate-900">
                                What happens next?
                            </h3>

                            <div className="mt-5 space-y-5">
                                <BoostStep
                                    number="01"
                                    title="Choose a plan"
                                    description="Select the promotion duration that works for you."
                                />

                                <BoostStep
                                    number="02"
                                    title="Complete payment"
                                    description="Pay securely through our payment provider."
                                />

                                <BoostStep
                                    number="03"
                                    title="Admin approval"
                                    description="Your payment is verified and your boost is reviewed before activation."
                                    last
                                />
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN */}

                    <aside className="space-y-4 lg:sticky lg:top-6">
                        {selectedPlan ? (
                            <BoostPaymentSummary
                                listingTitle={listing.title}
                                plan={selectedPlan}
                                vehicleImageUrl={vehicleImage}
                            />
                        ) : (
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                                <CreditCard
                                    size={26}
                                    className="mx-auto text-[#1491FF]"
                                />

                                <p className="mt-3 text-sm font-semibold text-slate-800">
                                    Select a boost plan
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Your payment summary will appear here.
                                </p>
                            </div>
                        )}

                        {/* ACTION */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            {actionError && (
                                <div className="mb-3 rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-700">
                                    {actionError}
                                </div>
                            )}

                            <button
                                type="button"
                                disabled={!canContinue}
                                onClick={handleContinueToPayment}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0877D9] hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                            >
                                {isProcessing ? (
                                    <>
                                        <LoaderCircle
                                            size={17}
                                            className="animate-spin"
                                        />

                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Continue to payment
                                        <ArrowRight size={17} />
                                    </>
                                )}
                            </button>

                            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                                <ShieldCheck
                                    size={14}
                                    className="text-emerald-500"
                                />

                                Secure payment processing
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}

// EXISTING BOOST NOTICE
function ExistingBoostNotice({
    boost,
    plan,
    onResumePayment,
    isProcessing,
}: {
    boost: BoostHistoryItem;
    plan: BoostPlan | null;
    listingId: string;
    onResumePayment?: () => void;
    isProcessing: boolean;
}) {
    const details = getBoostStatusDetails(boost.status);

    const colorStyles: Record<
        string,
        string
    > = {
        amber: "border-amber-200 bg-amber-50 text-amber-900",
        blue: "border-blue-200 bg-blue-50 text-blue-900",
        green: "border-emerald-200 bg-emerald-50 text-emerald-900",
        red: "border-red-200 bg-red-50 text-red-900",
        slate: "border-slate-200 bg-slate-50 text-slate-800",
    };

    const iconStyles: Record<
        string,
        string
    > = {
        amber: "text-amber-600",
        blue: "text-[#1491FF]",
        green: "text-emerald-600",
        red: "text-red-600",
        slate: "text-slate-500",
    };

    const Icon = details.icon;

    return (
        <div
            className={`mb-6 rounded-2xl border p-4 sm:p-5 ${colorStyles[details.color]}`}
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <Icon
                        size={22}
                        className={`mt-0.5 shrink-0 ${iconStyles[details.color]}`}
                    />

                    <div>
                        <h3 className="text-sm font-bold">
                            {details.title}
                        </h3>

                        <p className="mt-1 max-w-xl text-xs leading-5 opacity-80">
                            {details.description}
                        </p>

                        {plan && (
                            <p className="mt-2 text-xs font-semibold">
                                {plan.durationDays} day boost
                            </p>
                        )}
                    </div>
                </div>

                {onResumePayment && (
                    <button
                        type="button"
                        onClick={onResumePayment}
                        disabled={isProcessing}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#0877D9] disabled:opacity-60"
                    >
                        {isProcessing ? (
                            <LoaderCircle
                                size={15}
                                className="animate-spin"
                            />
                        ) : (
                            <CreditCard size={15} />
                        )}

                        Complete payment
                    </button>
                )}
            </div>

            {boost.status === "ACTIVE" && boost.expiresAt && (
                <div className="mt-4 flex items-center gap-2 border-t border-emerald-200/70 pt-3 text-xs font-medium">
                    <CalendarDays size={14} />

                    Expires on{" "}
                    {new Date(
                        boost.expiresAt,
                    ).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
                </div>
            )}

            {boost.status === "REJECTED" && boost.reviewNote && (
                <div className="mt-3 rounded-xl bg-white/70 p-3 text-xs leading-5">
                    <strong>Review note:</strong>{" "}
                    {boost.reviewNote}
                </div>
            )}
        </div>
    );
}

// BOOST STEP
function BoostStep({
    number,
    title,
    description,
    last = false,
}: {
    number: string;
    title: string;
    description: string;
    last?: boolean;
}) {
    return (
        <div className="relative flex gap-3">
            {!last && (
                <div className="absolute bottom-[-20px] left-[15px] top-9 w-px bg-slate-200" />
            )}

            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF5FF] text-[10px] font-extrabold text-[#0877D9]">
                {number}
            </div>

            <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">
                    {title}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

// PAYMENT SUCCESS
function PaymentSuccessScreen({
    listingTitle,
    listingId,
}: {
    listingTitle: string;
    listingId: string;
}) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#F7FAFD] px-4 py-12">
            <motion.div
                initial={{
                    opacity: 0,
                    y: 12,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.35,
                }}
                className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-9"
            >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={34} />
                </div>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    <BadgeCheck size={14} />
                    Payment verified
                </div>

                <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950">
                    Payment received!
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                    Your payment for{" "}
                    <strong className="text-slate-800">
                        {listingTitle}
                    </strong>{" "}
                    was successfully verified.
                </p>

                <div className="mt-7 rounded-2xl border border-blue-100 bg-[#F4F9FF] p-4 text-left">
                    <div className="flex items-start gap-3">
                        <Clock3
                            size={20}
                            className="mt-0.5 shrink-0 text-[#1491FF]"
                        />

                        <div>
                            <p className="text-sm font-bold text-slate-900">
                                Awaiting admin approval
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Your boost will become active once the
                                KARMASS team approves it. You can track
                                its status from your listings dashboard.
                            </p>
                        </div>
                    </div>
                </div>

                <Link
                    href="/dashboard/my-listings"
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#0877D9]"
                >
                    Return to my listings
                    <ArrowRight size={17} />
                </Link>

                <Link
                    href={`/dashboard/my-listings/${encodeURIComponent(listingId)}`}
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-[#1491FF]"
                >
                    View vehicle details
                </Link>
            </motion.div>
        </main>
    );
}

// LOADING
function BoostPageLoading() {
    return (
        <main className="min-h-screen bg-[#F7FAFD] px-4 py-8">
            <div className="mx-auto max-w-6xl animate-pulse space-y-7">
                <div className="h-4 w-36 rounded bg-slate-200" />

                <div className="space-y-3">
                    <div className="h-8 w-64 rounded-lg bg-slate-200" />
                    <div className="h-4 w-96 max-w-full rounded bg-slate-200" />
                </div>

                <div className="grid gap-7 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-7">
                        <div className="h-44 rounded-2xl bg-white" />
                        <div className="h-64 rounded-2xl bg-white" />
                        <div className="h-48 rounded-2xl bg-white" />
                    </div>

                    <div className="h-96 rounded-2xl bg-white" />
                </div>
            </div>
        </main>
    );
}