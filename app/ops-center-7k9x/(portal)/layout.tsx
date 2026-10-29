import { AdminShell } from "@/app/components/adminComponents/admin-shell";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Administration | KARMASS",
    robots: {
        index: false,
        follow: false,
    },
};

export default function PortalLayout({ children }: { children: ReactNode }) {
    return <AdminShell>{children}</AdminShell>;
}