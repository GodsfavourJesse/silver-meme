import type { Metadata } from "next";
import { SupportCenter } from "@/app/components/userComponents/support/SupportCenter";

export const metadata: Metadata = { title: "Help & Support | KARMASS", description: "Contact KARMASS support and track replies to your request." };
export const instant = false;

export default function SupportPage() { return <SupportCenter/>; }
