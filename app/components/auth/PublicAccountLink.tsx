"use client";

import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/app/hooks/user/auth/useAuth";

interface PublicAccountLinkProps {
    href: "/login" | "/register";
    className?: string;
    children: ReactNode;
    onClick?: () => void;
    "aria-label"?: string;
    "aria-current"?: "page" | undefined;
}

/** Checks the current cookie session before choosing the account destination. */
export function PublicAccountLink({
    href,
    className,
    children,
    onClick,
    "aria-label": ariaLabel,
    "aria-current": ariaCurrent,
}: PublicAccountLinkProps) {
    const router = useRouter();
    const { refetch } = useAuth();
    const [checkingSession, setCheckingSession] = useState(false);

    async function handleClick(event: MouseEvent<HTMLAnchorElement>) {
        onClick?.();

        // Preserve normal browser behavior for opening a new tab/window.
        if (
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
        ) {
            return;
        }

        event.preventDefault();
        setCheckingSession(true);

        try {
            const session = await refetch();
            router.push(session.data ? "/dashboard" : href);
        } catch {
            router.push(href);
        } finally {
            setCheckingSession(false);
        }
    }

    return (
        <Link
            href={href}
            onClick={handleClick}
            aria-label={ariaLabel}
            aria-current={ariaCurrent}
            aria-busy={checkingSession || undefined}
            className={className}
        >
            {children}
        </Link>
    );
}
