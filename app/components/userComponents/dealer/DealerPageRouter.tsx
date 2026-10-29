"use client";

import { useEffect, useState } from "react";

import {
    AlertCircle,
    LoaderCircle,
    RefreshCw,
    ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/app/hooks/user/auth/useAuth";

import {
    usePublicDealerProfile,
} from "@/app/hooks/user/dealer/useDealer";

import VerifiedDealerProfile from "./pages/VerifiedDealerProfile";
import DealerApplicationLandingPage from "./pages/DealerAPplicationLandingPage";

export default function DealerPageRouter() {
    const {
        user,
        isLoading: isAuthLoading,
        isError: isAuthError,
        refetch: refetchAuth,
    } = useAuth();

    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

    // Refresh the authenticated user when this page mounts.
    // This helps detect dealer approval performed in another session.
    useEffect(() => {
        let active = true;

        async function refreshAuthenticatedUser() {
            try {
                await refetchAuth();
            } finally {
                if (active) {
                    setHasCheckedAuth(true);
                }
            }
        }

        void refreshAuthenticatedUser();

        return () => {
            active = false;
        };
    }, [refetchAuth]);

    const isDealer = user?.accountType === "DEALER";

    const {
        data,
        isPending: isProfilePending,
        isError: isProfileError,
        refetch: refetchProfile,
        isFetching: isProfileFetching,
    } = usePublicDealerProfile(
        isDealer ? user?.id : undefined,
    );

    // Wait until the authentication check has completed.
    if (isAuthLoading || !hasCheckedAuth) {
        return (
            <main className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-4 py-12">
                <div className="text-center">
                    <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[#7008E7]" />

                    <p className="mt-4 text-sm font-medium text-slate-600">
                        Checking your dealership status...
                    </p>
                </div>
            </main>
        );
    }

    if (isAuthError) {
        return (
            <main className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-4 py-12">
                <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm">
                    <AlertCircle className="mx-auto h-10 w-10 text-red-500" />

                    <h1 className="mt-4 text-xl font-bold text-slate-900">
                        Unable to check your account
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        We couldn't verify your current account status.
                        Please try again.
                    </p>

                    <button
                        type="button"
                        onClick={() => {
                            setHasCheckedAuth(false);
                            void refetchAuth();
                            setHasCheckedAuth(true);
                        }}
                        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#7008E7] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5D06C2]"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Check again
                    </button>
                </section>
            </main>
        );
    }

    // Ordinary users see the dealer application page.
    if (!isDealer) {
        return <DealerApplicationLandingPage />;
    }

    // Dealer profile is still loading.
    if (isProfilePending) {
        return (
            <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
                <div className="mx-auto max-w-5xl">
                    <div className="animate-pulse rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
                        <div className="h-4 w-32 rounded bg-slate-200" />

                        <div className="mt-5 h-8 w-64 max-w-full rounded-lg bg-slate-200" />

                        <div className="mt-3 h-4 w-full max-w-md rounded bg-slate-100" />

                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                            <div className="h-28 rounded-2xl bg-slate-100" />
                            <div className="h-28 rounded-2xl bg-slate-100" />
                        </div>
                    </div>

                    <div className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-500">
                        <LoaderCircle className="h-4 w-4 animate-spin text-[#7008E7]" />
                        Loading your dealership profile...
                    </div>
                </div>
            </main>
        );
    }

    // Profile API failure.
    if (isProfileError || !data?.data?.dealer) {
        return (
            <main className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-4 py-12">
                <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                        <AlertCircle className="h-7 w-7 text-red-600" />
                    </div>

                    <h1 className="mt-5 text-xl font-bold text-slate-900">
                        Unable to load your dealership
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Your account is recognized as a dealer, but we
                        couldn't retrieve your dealership profile.
                        Please try again.
                    </p>

                    <button
                        type="button"
                        onClick={() => void refetchProfile()}
                        disabled={isProfileFetching}
                        className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#7008E7] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5D06C2] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                isProfileFetching ? "animate-spin" : ""
                            }`}
                        />

                        {isProfileFetching ? "Retrying..." : "Try again"}
                    </button>
                </section>
            </main>
        );
    }

    const dealer = data.data.dealer;

    if (!dealer.verified) {
        return (
            <main className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-4 py-12">
                <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
                        <ShieldCheck className="h-7 w-7 text-amber-600" />
                    </div>

                    <h1 className="mt-5 text-xl font-bold text-slate-900">
                        Verification pending
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Your dealership profile has not yet been confirmed
                        as verified. Please contact support if you believe
                        this is an error.
                    </p>
                </section>
            </main>
        );
    }

    // Use the prop name declared by your actual profile component.
    return <VerifiedDealerProfile profile={dealer} />;
}