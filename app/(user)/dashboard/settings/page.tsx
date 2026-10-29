import type { Metadata } from "next";
import SettingsClient from "../../../components/userComponents/settings/SettingsClient";

export const instant = false;

export const metadata: Metadata = {
    title: "Settings | KARMASS",
    description:
        "Manage your KARMASS account security, notifications, privacy, and preferences.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function SettingsPage() {
    return <SettingsClient />;
}