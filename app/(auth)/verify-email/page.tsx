import { Suspense } from "react";

import { AuthExperience } from "@/app/components/auth/AuthExperience";
import { VerifyEmailForm } from "@/app/components/auth/VerifyEmailForm";

function VerifyEmailLoading() {
    return (
        <div className="flex min-h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7008E7]/20 border-t-[#7008E7]" />

                <p className="text-sm text-[#858078]">
                    Preparing email verification...
                </p>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <AuthExperience mode="register">
            <Suspense fallback={<VerifyEmailLoading />}>
                <VerifyEmailForm />
            </Suspense>
        </AuthExperience>
    );
}