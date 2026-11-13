import type { ReactNode } from "react";

import {
    AuthenticatedUserGuard,
} from "@/app/components/auth/AuthenticatedUserGuard";

import MobileBottomNav from "@/app/components/userComponents/dashboard/navigation/MobileBottomNav";
import DashboardSidebar from "@/app/components/userComponents/dashboard/navigation/DashboardSidebar";

interface UserLayoutProps {
    children: ReactNode;
}

export default function UserLayout({
    children,
}: UserLayoutProps) {
    return (
        <AuthenticatedUserGuard>
            <div className="min-h-screen xl:flex">
                <DashboardSidebar />
                <div className="min-h-screen min-w-0 flex-1 pb-28 xl:pb-0">
                    {children}
                    <MobileBottomNav />
                </div>
            </div>
        </AuthenticatedUserGuard>
    );
}
