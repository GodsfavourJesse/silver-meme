import type { Metadata } from "next";
import { SavedItemsPageClient } from "@/app/components/userComponents/saved-items/SavedItemsPageClient";

export const instant = false;
export const metadata: Metadata = {
    title: "Saved searches & favorites | KARMASS",
    description: "Manage your saved car searches and favorite vehicles.",
    robots: { index: false, follow: false },
};

export default function SavedSearchesPage() {
    return <SavedItemsPageClient />;
}
