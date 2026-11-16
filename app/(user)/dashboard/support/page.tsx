import type { Metadata } from "next";
import { SupportCenter } from "@/app/components/userComponents/support/SupportCenter";

export const metadata: Metadata = { title: "Help & Support | KARMASS" };
export const instant = false;

export default function DashboardSupportPage() { return <SupportCenter/>; }
