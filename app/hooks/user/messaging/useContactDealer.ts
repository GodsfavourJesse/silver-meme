"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/app/hooks/user/auth/useAuth";
import { queryKeys } from "@/app/lib/query/query-keys";
import { createMessagingConversation } from "@/app/services/user/messaging/messaging.service";

interface UseContactDealerOptions {
    dealerUserId: string;
}

export function useContactDealer({
    dealerUserId,
}: UseContactDealerOptions) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const {
        user,
        isAuthenticated,
        isLoading,
    } = useAuth();

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isContacting, setIsContacting] = useState(false);

    const [showVerificationPrompt, setShowVerificationPrompt] =
        useState(false);

    const contactDealer = useCallback(async () => {
        // Wait until the authentication check has completed.
        if (isLoading) {
            return;
        }

        // Guests must log in or register first.
        if (!isAuthenticated || !user) {
            setShowLoginModal(true);
            return;
        }

        // Require email verification before messaging.
        if (!user.emailVerified) {
            setShowVerificationPrompt(true);
            return;
        }

        if (!dealerUserId) {
            toast.error("Unable to identify this dealer.");
            return;
        }

        setIsContacting(true);

        try {
            const response =
                await createMessagingConversation(dealerUserId);

            const conversationId = response.data?.conversation?.id;

            if (!response.success || !conversationId) {
                throw new Error(
                    response.message ||
                        "Unable to open a conversation with this dealer.",
                );
            }

            // Navigate to your existing messaging interface.
            // Replace this path if your inbox uses a different route.
            router.push(
                `/messages?conversationId=${encodeURIComponent(conversationId)}`,
            );
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to contact this dealer. Please try again.",
            );
        } finally {
            setIsContacting(false);
        }
    }, [
        dealerUserId,
        isAuthenticated,
        isLoading,
        router,
        user,
    ]);

    const closeLoginModal = useCallback(() => {
        setShowLoginModal(false);
    }, []);

    const closeVerificationPrompt = useCallback(() => {
        setShowVerificationPrompt(false);
    }, []);

    const goToLogin = useCallback(() => {
        const returnTo =
            typeof window !== "undefined"
                ? window.location.pathname + window.location.search
                : "/dealers";

        router.push(
            `/login?returnTo=${encodeURIComponent(returnTo)}`,
        );
    }, [router]);

    const goToRegister = useCallback(() => {
        const returnTo =
            typeof window !== "undefined"
                ? window.location.pathname + window.location.search
                : "/dealers";

        router.push(
            `/register?returnTo=${encodeURIComponent(returnTo)}`,
        );
    }, [router]);

    const goToEmailVerification = useCallback(() => {
        if (!user?.email) {
            return;
        }

        // Adjust this URL to match your existing verification page.
        router.push(
            `/verify-email?email=${encodeURIComponent(user.email)}`,
        );
    }, [router, user]);

    return {
        contactDealer,

        isLoading,
        isAuthenticated,
        isContacting,

        showLoginModal,
        closeLoginModal,

        showVerificationPrompt,
        closeVerificationPrompt,

        goToLogin,
        goToRegister,
        goToEmailVerification,
    };
}