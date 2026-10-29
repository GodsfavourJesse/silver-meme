import Link from "next/link";

/**
 * Shows a "Sign in" link after messages that ask the visitor
 * to sign in first.
 */
export function SignInLink({ message }: { message: string }) {
    if (!message.includes("Sign in")) {
        return null;
    }

    return (
        <Link href="/sign-in" className="ml-1 font-bold underline">
            Sign in
        </Link>
    );
}