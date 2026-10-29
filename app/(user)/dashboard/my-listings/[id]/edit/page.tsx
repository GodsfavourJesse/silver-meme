import type { Metadata } from "next";

import ListingEditor from "@/app/components/userComponents/listings/edit/ListingEditor";

interface EditListingPageProps {
    params: Promise<{
        id: string;
    }>;
}

/**
 * Listing editing depends on runtime data and authentication.
 * Skip Instant Navigation validation for this route.
 */
export const instant = false;

export const metadata: Metadata = {
    title: "Manage Listing | KARMASS",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function EditListingPage({
    params,
}: EditListingPageProps) {
    const { id } = await params;

    return <ListingEditor listingId={id} />;
}