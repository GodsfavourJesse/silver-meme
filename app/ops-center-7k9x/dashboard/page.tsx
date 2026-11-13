import { DashboardView } from "@/app/components/adminComponents/admin-dashboard/dashboard-view";

// The dashboard is gated by a live administrator session and loads private
// operational data at runtime, so it is not part of the static instant shell.
export const instant = false;

export default function AdminDashboardPage() {
    return <DashboardView />;
}
