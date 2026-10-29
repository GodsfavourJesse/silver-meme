import type { Metadata } from "next";

import DashboardPage from "@/app/components/userComponents/dashboard/DashboardPage";

/**
 * The dashboard depends on client-side authentication
 * and React Query state.
 *
 * Allow this route to opt out of instant-navigation
 * validation while retaining the rest of the app's
 * Cache Components and partial-prefetching behavior.
 */
export const instant = false;

export const metadata: Metadata = {
    title: "My Dashboard | KARMASS",
    description:
        "Your personal KARMASS dashboard for managing vehicle listings, saved vehicles, messages, and your automotive account.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function UserDashboardRoute() {
    return <DashboardPage />;
}