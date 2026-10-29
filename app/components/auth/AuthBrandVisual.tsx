import Link from "next/link";
import { ArrowUpRight, MoveRight, ShieldCheck } from "lucide-react";

interface AuthBrandVisualProps {
    mode: "register" | "login";
}

export function AuthBrandVisual({
    mode,
}: AuthBrandVisualProps) {
    const isRegister = mode === "register";

    const headline = isRegister
        ? "The right car changes everything."
        : "Your next chapter starts here.";

    const description = isRegister
        ? "From your first car to your next upgrade, find vehicles worth getting excited about and connect with sellers who can help you make the right move."
        : "The search, the shortlist, the car you've been thinking about. Pick up where you left off and get one step closer to driving it home.";

    return (
        <section className="relative hidden h-screen w-full flex-col overflow-hidden bg-[#071321] text-white lg:flex [@supports(height:100dvh)]:h-[100dvh]">
            {/* ================================================== */}
            {/* BACKGROUND PHOTOGRAPHY */}
            {/* ================================================== */}

            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[12000ms] ease-out hover:scale-[1.03]"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2200&q=90')",
                }}
                aria-hidden="true"
            />

            {/* Dark cinematic overlay */}
            <div
                className="absolute inset-0 bg-gradient-to-b from-[#06111F]/75 via-[#06111F]/15 to-[#06111F]/95"
                aria-hidden="true"
            />

            {/* Left-side readability overlay */}
            <div
                className="absolute inset-0 bg-gradient-to-r from-[#06111F]/70 via-[#06111F]/20 to-transparent"
                aria-hidden="true"
            />

            {/* KARMASS blue ambient lighting */}
            <div
                className="pointer-events-none absolute -left-40 top-[24%] size-[440px] rounded-full bg-[#1491FF]/15 blur-[120px]"
                aria-hidden="true"
            />

            <div
                className="pointer-events-none absolute -right-32 top-[10%] size-[300px] rounded-full bg-[#1491FF]/10 blur-[100px]"
                aria-hidden="true"
            />

            {/* Subtle editorial grid */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.055]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
                    backgroundSize: "72px 72px",
                }}
                aria-hidden="true"
            />

            {/* ================================================== */}
            {/* TOP BRAND HEADER */}
            {/* ================================================== */}

            <header className="relative z-10 flex shrink-0 items-center justify-between px-10 pt-8 xl:px-14 xl:pt-10 2xl:px-16">
                <Link
                    href="/"
                    aria-label="KARMASS home"
                    className="group inline-flex items-center gap-3.5"
                >
                    <span className="relative flex size-11 items-center justify-center overflow-hidden rounded-xl border border-white/25 bg-white/[0.08] text-base font-bold tracking-[-0.08em] text-white shadow-lg shadow-black/10 backdrop-blur-md transition-all duration-300 group-hover:border-[#1491FF]/70 group-hover:bg-[#1491FF]/15">
                        <span className="relative z-10">K.</span>
                    </span>

                    <span>
                        <span className="block text-[17px] font-bold tracking-[0.2em] text-white">
                            KARMASS
                        </span>

                        <span className="mt-0.5 block text-[9px] font-medium uppercase tracking-[0.2em] text-white/50">
                            Find your kind of drive
                        </span>
                    </span>
                </Link>

                <div className="flex items-center gap-2.5 rounded-full border border-white/15 bg-black/20 px-3.5 py-2 backdrop-blur-md">
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#1491FF] opacity-40" />

                        <span className="relative inline-flex size-2 rounded-full bg-[#1491FF]" />
                    </span>

                    <span className="text-[10px] font-medium tracking-wide text-white/80">
                        Made for the way you move
                    </span>
                </div>
            </header>

            {/* ================================================== */}
            {/* MAIN EDITORIAL CONTENT */}
            {/* ================================================== */}

            <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-end px-10 pb-8 pt-10 xl:px-14 xl:pb-10 2xl:px-16 2xl:pb-12">
                {/* Eyebrow */}
                <div className="mb-6 flex items-center gap-3">
                    <span className="h-px w-9 bg-[#1491FF]" />

                    <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8CCBFF]">
                        {isRegister
                            ? "A better way to find your next car"
                            : "Welcome back to KARMASS"}
                    </span>
                </div>

                {/* Headline */}
                <h1 className="max-w-[650px] text-[clamp(2.8rem,4.5vw,5.1rem)] font-semibold leading-[0.99] tracking-[-0.065em] text-white">
                    {isRegister ? (
                        <>
                            The right car
                            <br />
                            changes{" "}
                            <span className="text-[#69B9FF]">
                                everything.
                            </span>
                        </>
                    ) : (
                        <>
                            Your next
                            <br />
                            chapter{" "}
                            <span className="text-[#69B9FF]">
                                starts here.
                            </span>
                        </>
                    )}
                </h1>

                {/* Description */}
                <p className="mt-6 max-w-[460px] text-[13px] leading-7 text-white/70 xl:text-sm xl:leading-7">
                    {description}
                </p>

                {/* Trust indicators */}
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <div className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.07]">
                            <ShieldCheck
                                size={15}
                                className="text-[#69B9FF]"
                                aria-hidden="true"
                            />
                        </span>

                        <span className="text-[11px] font-medium text-white/80">
                            Shop with confidence
                        </span>
                    </div>

                    <span className="hidden h-5 w-px bg-white/15 sm:block" />

                    <div className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.07]">
                            <MoveRight
                                size={15}
                                className="text-[#69B9FF]"
                                aria-hidden="true"
                            />
                        </span>

                        <span className="text-[11px] font-medium text-white/80">
                            Your journey, your choice
                        </span>
                    </div>
                </div>

                {/* Bottom editorial divider */}
                <div className="mt-10 flex items-center justify-between border-t border-white/15 pt-5">
                    <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/45">
                            More than finding a car
                        </p>

                        <p className="mt-1.5 text-xs font-medium text-white/85">
                            Find the one that feels right.
                        </p>
                    </div>

                    <Link
                        href={isRegister ? "/login" : "/register"}
                        className="group flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/[0.06] text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-[#1491FF] hover:bg-[#1491FF] hover:text-white"
                        aria-label={
                            isRegister
                                ? "Already a member? Sign in"
                                : "Create a KARMASS account"
                        }
                    >
                        <ArrowUpRight
                            size={17}
                            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            aria-hidden="true"
                        />
                    </Link>
                </div>
            </div>

            {/* Bottom-right accent */}
            <div
                className="pointer-events-none absolute bottom-0 right-0 h-1 w-1/3 bg-gradient-to-l from-[#1491FF]/80 to-transparent"
                aria-hidden="true"
            />
        </section>
    );
}