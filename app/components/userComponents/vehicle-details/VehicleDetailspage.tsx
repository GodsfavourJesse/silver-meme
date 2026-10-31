"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ShieldAlert } from "lucide-react";

import { ContactSellerModal } from "./ContactSellerModal";
import { ReportListingModal } from "./ReportListingModal";
import { SimilarVehicles } from "./SimilarVehicles";
import { VehicleDescription } from "./VehicleDescription";
import { VehicleDetailsError } from "./VehicleDetailsError";
import { VehicleDetailsSkeleton } from "./VehicleDetailsSkeleton";
import { VehicleImageGallery } from "./VehicleImageGallery";
import { VehicleMobileActionBar } from "./VehicleMobileActionBar";
import { VehicleSafetyNotice } from "./VehicleSafetyNotice";
import { VehicleSellerCard } from "./VehicleSellerCard";
import { VehicleSpecifications } from "./VehicleSpecifications";
import { VehicleSummaryCard } from "./VehicleSummaryCard";
import { VehicleBreadcrumb } from "./VehicleBreadCrumb";

import { useVehicleDetails } from "@/app/hooks/user/vehicle/useVehicleDetails";
import { useVehicleActions } from "@/app/hooks/user/vehicle/useVehicleActions";
import { useContactSeller } from "@/app/hooks/user/vehicle/useContactSeller";
import { useReportListing } from "@/app/hooks/user/vehicle/useReportListing";

import { getVehicleTitle } from "@/app/lib/user/vehicle/vehicle-details-format";

interface VehicleDetailsPageProps {
    listingId: string;
}

const pageVariants = {
    hidden: {
        opacity: 0,
        y: 12,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1] as const,
            staggerChildren: 0.09,
        },
    },
};

const sectionVariants = {
    hidden: {
        opacity: 0,
        y: 16,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1] as const,
        },
    },
};

export function VehicleDetailsPage({
    listingId,
}: VehicleDetailsPageProps) {
    const router = useRouter();
    const shouldReduceMotion = useReducedMotion();

    const {
        details,
        similarVehicles,
        loading,
        pageError,
        reload,
    } = useVehicleDetails(listingId);

    const title = useMemo(
        () => (details ? getVehicleTitle(details) : ""),
        [details],
    );

    const currentListingId = details?.listing.id ?? null;

    const actions = useVehicleActions({
        listingId: currentListingId,
        title,
    });

    const contact = useContactSeller(currentListingId);
    const report = useReportListing(currentListingId);

    const [contactOpen, setContactOpen] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);

    function openContact() {
        contact.clearStatus();
        setContactOpen(true);
    }

    function closeContact() {
        setContactOpen(false);
    }

    function openReport() {
        report.clearStatus();
        setReportOpen(true);
    }

    function closeReport() {
        setReportOpen(false);
    }

    if (loading) {
        return <VehicleDetailsSkeleton />;
    }

    if (pageError || !details) {
        return (
            <VehicleDetailsError
                message={pageError}
                onRetry={() => void reload()}
            />
        );
    }

    function openConversation(conversationId: string) {
        if (!conversationId.trim()) {
            return;
        }

        setContactOpen(false);

        router.push(
            `/messages?conversationId=${encodeURIComponent(
                conversationId,
            )}`,
        );
    }

    const motionProps = shouldReduceMotion
        ? {}
        : {
              variants: pageVariants,
              initial: "hidden" as const,
              animate: "visible" as const,
          };

    const sectionMotionProps = shouldReduceMotion
        ? {}
        : {
              variants: sectionVariants,
          };

    return (
        <main className="min-h-screen bg-[#F7F9FC] pb-28 md:pb-12">
            {/* Subtle page background */}
            <div className="pointer-events-none fixed inset-x-0 top-0 -z-0 h-[420px] bg-gradient-to-b from-blue-50/70 via-white/50 to-transparent" />

            <div className="relative mx-auto w-full max-w-[1440px] px-4 pb-8 pt-4 sm:px-6 sm:pt-6 lg:px-10 lg:pt-8">
                {/* Breadcrumb */}
                <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="mb-5 sm:mb-7"
                >
                    <VehicleBreadcrumb title={title} />
                </motion.div>

                {/* Main content */}
                <motion.div
                    {...motionProps}
                    className="grid min-w-0 grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1.55fr)_minmax(350px,0.85fr)] lg:gap-9 xl:gap-11"
                >
                    {/* Left column */}
                    <div className="min-w-0 space-y-7 sm:space-y-9">
                        {/* Vehicle gallery */}
                        <motion.section
                            {...sectionMotionProps}
                            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_3px_18px_rgba(15,23,42,0.035)] sm:rounded-3xl"
                        >
                            <VehicleImageGallery
                                images={details.images}
                                title={title}
                                isBoosted={details.isBoosted}
                            />
                        </motion.section>

                        {/* Desktop specifications */}
                        <motion.section
                            {...sectionMotionProps}
                            className="hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_3px_18px_rgba(15,23,42,0.025)] sm:rounded-3xl sm:p-6 lg:block"
                        >
                            <VehicleSpecifications
                                details={details}
                                variant="desktop"
                            />
                        </motion.section>

                        {/* Desktop description */}
                        <motion.section
                            {...sectionMotionProps}
                            className="hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_3px_18px_rgba(15,23,42,0.025)] sm:rounded-3xl sm:p-6 lg:block"
                        >
                            <VehicleDescription
                                description={details.listing.description}
                                variant="desktop"
                            />
                        </motion.section>
                    </div>

                    {/* Right column */}
                    <aside className="min-w-0 space-y-5 lg:sticky lg:top-6">
                        {/* Vehicle summary */}
                        <motion.section
                            {...sectionMotionProps}
                            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_22px_rgba(15,23,42,0.045)] sm:rounded-3xl"
                        >
                            <VehicleSummaryCard
                                details={details}
                                title={title}
                                favorite={actions.favorite}
                                favoriteLoading={actions.favoriteLoading}
                                actionError={actions.actionError}
                                shareMessage={actions.shareMessage}
                                onFavorite={() =>
                                    void actions.toggleFavorite()
                                }
                                onShare={() => void actions.share()}
                                onContact={openContact}
                            />
                        </motion.section>

                        {/* Seller information */}
                        <motion.section
                            {...sectionMotionProps}
                            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_3px_18px_rgba(15,23,42,0.035)] sm:rounded-3xl"
                        >
                            <VehicleSellerCard details={details} />
                        </motion.section>

                        {/* Mobile specifications */}
                        <motion.section
                            {...sectionMotionProps}
                            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_3px_18px_rgba(15,23,42,0.025)] sm:rounded-3xl sm:p-6 lg:hidden"
                        >
                            <VehicleSpecifications
                                details={details}
                                variant="mobile"
                            />
                        </motion.section>

                        {/* Mobile description */}
                        <motion.section
                            {...sectionMotionProps}
                            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_3px_18px_rgba(15,23,42,0.025)] sm:rounded-3xl sm:p-6 lg:hidden"
                        >
                            <VehicleDescription
                                description={details.listing.description}
                                variant="mobile"
                            />
                        </motion.section>

                        {/* Report listing */}
                        <motion.div
                            {...sectionMotionProps}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white px-4 py-3 sm:rounded-2xl"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                    <ShieldAlert size={17} />
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-slate-700">
                                        Something not right?
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-slate-500">
                                        Help us keep KARMASS safe.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={openReport}
                                className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                            >
                                Report listing
                            </button>
                        </motion.div>
                    </aside>
                </motion.div>

                {/* Safety information */}
                <motion.section
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.4 }}
                    className="mt-8 sm:mt-10"
                >
                    <VehicleSafetyNotice />
                </motion.section>

                {/* Similar vehicles */}
                {similarVehicles.length > 0 && (
                    <motion.section
                        initial={
                            shouldReduceMotion
                                ? false
                                : { opacity: 0, y: 18 }
                        }
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.45 }}
                        className="mt-10 sm:mt-14"
                    >
                        <SimilarVehicles vehicles={similarVehicles} />
                    </motion.section>
                )}
            </div>

            {/* Mobile sticky action bar */}
            <VehicleMobileActionBar
                favorite={actions.favorite}
                favoriteLoading={actions.favoriteLoading}
                onFavorite={() => void actions.toggleFavorite()}
                onContact={openContact}
            />

            {/* Modals */}
            <AnimatePresence>
                {contactOpen && (
                    <ContactSellerModal
                        title={title}
                        price={details.listing.price}
                        contact={contact}
                        onClose={closeContact}
                    />
                )}

                {reportOpen && (
                    <ReportListingModal
                        report={report}
                        onClose={closeReport}
                    />
                )}
            </AnimatePresence>
        </main>
    );
}