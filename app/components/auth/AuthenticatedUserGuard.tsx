"use client";

import {
    Suspense,
    useCallback,
    useEffect,
    useRef,
    type ReactNode,
} from "react";

import {
    usePathname,
    useRouter,
} from "next/navigation";

import {
    useAuth,
} from "@/app/hooks/user/auth/useAuth";

import {
    getSafeReturnTo,
} from "@/app/lib/user/auth/safe-redirect";

interface AuthenticatedUserGuardProps {
    children: ReactNode;
}

function AuthLoadingScreen() {
    return (
        <main
            className="flex min-h-screen items-center justify-center bg-[#faf8ff] px-6"
            aria-live="polite"
            aria-busy="true"
        >
            <div className="flex flex-col items-center gap-4">
                <div
                    className="h-10 w-10 animate-spin rounded-full border-2 border-[#7008E7]/10 border-t-[#7008E7]"
                    aria-hidden="true"
                />

                <p className="text-sm font-medium text-gray-600">
                    Checking your session...
                </p>
            </div>
        </main>
    );
}

function AuthErrorScreen({
    onRetry,
    isRetrying,
}: {
    onRetry: () => void;
    isRetrying: boolean;
}) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#faf8ff] px-6">
            <section
                className="w-full max-w-md rounded-2xl border border-[#7008E7]/10 bg-white p-8 text-center shadow-xl shadow-[#7008E7]/[0.04]"
                aria-labelledby="auth-error-title"
            >
                <div
                    className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-lg font-semibold text-red-600"
                    aria-hidden="true"
                >
                    !
                </div>

                <h1
                    id="auth-error-title"
                    className="text-xl font-semibold tracking-tight text-gray-900"
                >
                    Unable to verify your session
                </h1>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                    We couldn't connect to KARMASS to verify
                    your account. Check your internet connection
                    and try again.
                </p>

                <button
                    type="button"
                    onClick={onRetry}
                    disabled={isRetrying}
                    className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#7008E7] px-6 text-sm font-semibold text-white shadow-lg shadow-[#7008E7]/20 transition hover:bg-[#5D07C2] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7008E7]/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isRetrying
                        ? "Checking..."
                        : "Try again"}
                </button>
            </section>
        </main>
    );
}

/**
 * The pathname-dependent logic lives inside this component
 * so it can be isolated behind a Suspense boundary.
 */
function AuthenticatedUserGuardContent({
    children,
}: AuthenticatedUserGuardProps) {
    const router = useRouter();
    const pathname = usePathname();

    const {
        user,
        isAuthenticated,
        isLoading,
        isError,
        refetch,
    } = useAuth();

    const redirectStarted = useRef(false);

    const redirectToLogin = useCallback(() => {
        if (redirectStarted.current) {
            return;
        }

        redirectStarted.current = true;

        const browserSearch =
            typeof window !== "undefined"
                ? window.location.search
                : "";

        const currentPath = pathname
            ? `${pathname}${browserSearch}`
            : "/dashboard";

        const returnTo = getSafeReturnTo(currentPath);

        const params = new URLSearchParams();

        params.set("returnTo", returnTo);

        router.replace(`/login?${params.toString()}`);
    }, [
        pathname,
        router,
    ]);

    useEffect(() => {
        if (
            isLoading ||
            isError ||
            isAuthenticated
        ) {
            return;
        }

        redirectToLogin();
    }, [
        isAuthenticated,
        isError,
        isLoading,
        redirectToLogin,
    ]);

    if (isLoading) {
        return <AuthLoadingScreen />;
    }

    if (isError) {
        return (
            <AuthErrorScreen
                onRetry={() => {
                    redirectStarted.current = false;
                    void refetch();
                }}
                isRetrying={isLoading}
            />
        );
    }

    if (!isAuthenticated || !user) {
        return <AuthLoadingScreen />;
    }

    return <>{children}</>;
}

export function AuthenticatedUserGuard({
    children,
}: AuthenticatedUserGuardProps) {
    return (
        <Suspense fallback={<AuthLoadingScreen />}>
            <AuthenticatedUserGuardContent>
                {children}
            </AuthenticatedUserGuardContent>
        </Suspense>
    );
}