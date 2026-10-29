interface AuthFormHeaderProps {
    mode: "register" | "login";
}

export function AuthFormHeader({
    mode,
}: AuthFormHeaderProps) {
    const isRegister = mode === "register";

    return (
        <header className="mb-9">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#6941C6]">
                {isRegister
                    ? "Become part of KARMASS"
                    : "Your KARMASS account"}
            </p>

            <h2 className="text-3xl font-medium tracking-[-0.055em] text-[#20211E] sm:text-4xl">
                {isRegister
                    ? "Create your account."
                    : "Welcome back."}
            </h2>

            <p className="mt-3 max-w-[390px] text-sm leading-6 text-[#777870]">
                {isRegister
                    ? "A better way to discover, buy, and connect around cars begins with you."
                    : "Sign in to access your account and continue your automotive journey."}
            </p>
        </header>
    );
}