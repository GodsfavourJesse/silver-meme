"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

export function VehicleDetailsPage({
    listingId,
}: VehicleDetailsPageProps) {
    const router = useRouter();

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

    /*
     * Do not render listing-dependent content until the request
     * has finished. This also prevents actions from receiving an
     * invalid listing ID while details are loading.
     */
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

    /*
     * Contact submission belongs to the contact hook/modal.
     *
     * The existing contact API already returns a conversation ID.
     * Once the contact flow has successfully created or retrieved
     * that conversation, the user should be taken to the inbox.
     *
     * Do not call contactMarketplaceSeller() here during rendering.
     */
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

    return (
        <main className="min-h-screen bg-slate-50 pb-24 md:pb-12">
            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
                <VehicleBreadcrumb title={title} />

                <div className="grid min-w-0 gap-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.8fr)] lg:gap-10">
                    <div className="min-w-0">
                        <VehicleImageGallery
                            images={details.images}
                            title={title}
                            isBoosted={details.isBoosted}
                        />

                        <VehicleSpecifications
                            details={details}
                            variant="desktop"
                        />

                        <VehicleDescription
                            description={details.listing.description}
                            variant="desktop"
                        />
                    </div>

                    <aside className="min-w-0">
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

                        <VehicleSellerCard details={details} />

                        <VehicleSpecifications
                            details={details}
                            variant="mobile"
                        />

                        <VehicleDescription
                            description={details.listing.description}
                            variant="mobile"
                        />

                        <button
                            type="button"
                            onClick={openReport}
                            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-medium text-slate-500 transition hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                        >
                            <ShieldAlert size={17} aria-hidden="true" />
                            Report this listing
                        </button>
                    </aside>
                </div>

                <VehicleSafetyNotice />

                <SimilarVehicles vehicles={similarVehicles} />
            </div>

            <VehicleMobileActionBar
                favorite={actions.favorite}
                favoriteLoading={actions.favoriteLoading}
                onFavorite={() => void actions.toggleFavorite()}
                onContact={openContact}
            />

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
        </main>
    );
}