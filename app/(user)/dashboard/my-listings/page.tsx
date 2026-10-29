import type { Metadata } from "next";

import MyListingsDashboard from
    "@/app/components/userComponents/listings/dashboard/MyListingsDashboard";
import MobileMyListingsDashboard from "@/app/components/userComponents/listings/dashboard/MobileMyListingsDashboard";

export const metadata: Metadata = {
    title: "My Listings | KARMASS",
    description:
        "Manage your KARMASS vehicle listings, track review status, and update your marketplace vehicles.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function MyListingsPage() {
    return (
        <>
            <div className="hidden lg:block">

                <MyListingsDashboard />
            </div>

            <MobileMyListingsDashboard />
        
        </>
    );
}