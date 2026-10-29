import MobileRecentlyDeletedListings from "@/app/components/userComponents/listings/helpers/MobileRecentlyDeletedListings";
import type { Metadata } from "next";


export const metadata: Metadata = {
    title: "Recently Deleted | KARMASS",
    description:
        "Review and restore your recently deleted KARMASS vehicle listings.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function RecentlyDeletedListingsPage() {
    return (
        <MobileRecentlyDeletedListings />
    );
}