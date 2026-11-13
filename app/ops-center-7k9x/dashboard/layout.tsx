import type { ReactNode } from "react";
import type { Metadata } from "next";

import { AdminShell } from "@/app/components/adminComponents/admin-shell";

export const metadata: Metadata = {
    title: {
        default: "Admin console | KARMASS",
        template: "%s | KARMASS Admin",
    },
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdminDashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    return <AdminShell>{children}</AdminShell>;
}
