import { AdminListingsView } from "@/app/components/adminComponents/admin-listings/admin-listings-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Listing Review | KARMASS Admin",
    robots: { index: false, follow: false },
};

export default function AdminListingsPage() {
    return <AdminListingsView />;
}
