import type { Metadata } from "next";
import { AdminSupportInbox } from "@/app/components/adminComponents/admin-support/admin-support-inbox";

export const metadata: Metadata = { title: "Support inbox" };
export const instant = false;

export default function AdminSupportPage() { return <AdminSupportInbox/>; }
