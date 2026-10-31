import Link from "next/link";

interface SignInLinkProps {
    message: string;
}

/**
 * Displays a sign-in link when authentication is required.
 */
export function SignInLink({ message }: SignInLinkProps) {
    if (!message.toLowerCase().includes("sign in")) {
        return null;
    }

    return (
        <Link
            href="/login"
            className="ml-1 inline-flex items-center font-semibold text-[#1491FF] underline decoration-[#1491FF]/40 underline-offset-4 transition-colors hover:text-[#0875D1] hover:decoration-[#0875D1] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1491FF]/40"
        >
            Sign in
        </Link>
    );
}