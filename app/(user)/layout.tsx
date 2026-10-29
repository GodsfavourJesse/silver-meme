import type { ReactNode } from "react";

import {
    AuthenticatedUserGuard,
} from "@/app/components/auth/AuthenticatedUserGuard";

import MobileBottomNav from "@/app/components/userComponents/dashboard/navigation/MobileBottomNav";

interface UserLayoutProps {
    children: ReactNode;
}

export default function UserLayout({
    children,
}: UserLayoutProps) {
    return (
        <AuthenticatedUserGuard>
            <div className="min-h-screen pb-28 md:pb-0">
                {children}
                <MobileBottomNav />
            </div>
        </AuthenticatedUserGuard>
    );
}