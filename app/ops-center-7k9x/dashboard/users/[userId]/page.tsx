import { Suspense } from "react";

import AdminUserDetailsClient from "./AdminUserDetailsClient";

function UserDetailsLoading() {
    return (
        <main
            className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6"
            aria-busy="true"
            aria-live="polite"
        >
            <div className="mx-auto max-w-6xl">
                <div className="h-10 w-40 animate-pulse rounded-xl bg-gray-200" />

                <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6">
                    <div className="flex items-center gap-4">
                        <div className="h-20 w-20 animate-pulse rounded-2xl bg-gray-100" />

                        <div className="flex-1 space-y-3">
                            <div className="h-5 w-48 animate-pulse rounded bg-gray-100" />
                            <div className="h-4 w-64 max-w-full animate-pulse rounded bg-gray-100" />
                        </div>
                    </div>

                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-20 animate-pulse rounded-xl bg-gray-50"
                            />
                        ))}
                    </div>
                </div>

                <p className="mt-5 text-center text-sm text-gray-500">
                    Loading user details...
                </p>
            </div>
        </main>
    );
}

export default function AdminUserDetailsPage() {
    return (
        <Suspense fallback={<UserDetailsLoading />}>
            <AdminUserDetailsClient />
        </Suspense>
    );
}