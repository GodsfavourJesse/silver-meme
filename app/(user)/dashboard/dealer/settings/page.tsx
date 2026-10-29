"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import { useMyDealerProfile } from "@/app/hooks/user/dealer/useDealerProfile";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import DealerProfileSettingsSkeleton from "@/app/components/userComponents/dealer/settings/DealerProfileSettingsSkeleton";
import DealerProfileSettingsMobile from "@/app/components/userComponents/dealer/settings/DealerProfileSettingsMobile";
import DealerProfileSettingsDesktop from "@/app/components/userComponents/dealer/settings/DealerProfileSettingsDesktop";

export default function DealerProfileSettingsPage() {
    const {
        data,
        isLoading,
        isError,
        refetch,
        isFetching,
    } = useMyDealerProfile();

    const { isMobile, isReady } = useIsMobile();

    const profile = data?.data?.profile;

    if (isLoading || !isReady) {
        return <DealerProfileSettingsSkeleton />;
    }

    if (isError || !profile) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F8F7FC] px-4 py-10">
                <section className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-8">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                        <AlertCircle size={28} />
                    </div>

                    <h1 className="text-lg font-bold text-gray-900 sm:text-xl">
                        Unable to load your profile
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        We couldn't retrieve your dealer profile. Please check
                        your connection and try again.
                    </p>

                    <button
                        type="button"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#7008E7] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5E06C5] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            size={16}
                            className={isFetching ? "animate-spin" : ""}
                        />
                        {isFetching ? "Retrying..." : "Try again"}
                    </button>
                </section>
            </main>
        );
    }

    return isMobile ? (
        <DealerProfileSettingsMobile profile={profile} />
    ) : (
        <DealerProfileSettingsDesktop profile={profile} />
    );
}