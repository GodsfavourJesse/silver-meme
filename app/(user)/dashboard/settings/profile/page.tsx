"use client";

import SettingsProfileDesktop from "@/app/components/userComponents/settings/Profile/SettingsProfileDesktop";
import SettingsProfileMobile from "@/app/components/userComponents/settings/Profile/SettingsProfileMobile";

export default function SettingsProfilePage() {
    return (
        <>
            {/* Desktop layout */}
            <div className="hidden md:block">
                <SettingsProfileDesktop />
            </div>

            {/* Mobile app-style layout */}
            <div className="md:hidden">
                <SettingsProfileMobile />
            </div>
        </>
    );
}