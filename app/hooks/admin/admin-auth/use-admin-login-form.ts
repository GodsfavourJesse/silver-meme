import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { useAdminLogin } from "@/app/hooks/admin/admin-auth/use-admin-login";
import { adminQueryKeys } from "@/app/hooks/admin/admin-auth/admin-query-keys";
import { getAdminLoginErrorMessage } from "@/app/components/adminComponents/get-admin-login-error-message";

const ADMIN_DASHBOARD_PATH = "/ops-center-7k9x/dashboard";

export function useAdminLoginForm() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const loginMutation = useAdminLogin();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [challengeOpen, setChallengeOpen] = useState(false);

    const isSubmitting = loginMutation.isPending;

    function updateEmail(value: string): void {
        setEmail(value);
        setFormError(null);
    }

    function updatePassword(value: string): void {
        setPassword(value);
        setFormError(null);
    }

    function closeChallenge(): void {
        if (!isSubmitting) setChallengeOpen(false);
    }

    async function handleChallengeComplete(challengeToken: string): Promise<void> {
        setFormError(null);
        try {
            await loginMutation.mutateAsync({
                email: email.trim().toLowerCase(),
                password,
                challengeToken,
            });

            setChallengeOpen(false);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: adminQueryKeys.auth.me() }),
                queryClient.invalidateQueries({ queryKey: adminQueryKeys.auth.csrfToken() }),
            ]);
            router.replace(ADMIN_DASHBOARD_PATH);
        } catch (error: unknown) {
            setChallengeOpen(false);
            setFormError(getAdminLoginErrorMessage(error));
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        if (isSubmitting || challengeOpen) return;
        setFormError(null);

        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail || !password) {
            setFormError("Enter your administrator email and password.");
            return;
        }
        setEmail(normalizedEmail);
        setChallengeOpen(true);
    }

    return {
        email,
        password,
        formError,
        isSubmitting,
        challengeOpen,
        updateEmail,
        updatePassword,
        handleSubmit,
        closeChallenge,
        handleChallengeComplete,
    };
}
