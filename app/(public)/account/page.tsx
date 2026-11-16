import Link from "next/link";
import { ArrowLeft, ArrowRight, CarFront, Check, LogIn, ShieldCheck, UserRoundPlus } from "lucide-react";
import { PublicAccountLink } from "@/app/components/auth/PublicAccountLink";

export const metadata = {
    title: "Your KARMASS account",
    description: "Sign in or create an account to continue with KARMASS.",
};

export default function AccountChoicePage() {
    return (
        <main className="relative flex min-h-[calc(100svh-88px)] items-center justify-center overflow-hidden bg-[#F4F7FB] px-4 py-12 sm:px-6 sm:py-16">
            <Link href="/" className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur transition hover:border-[#0877D9]/30 hover:text-[#0877D9] sm:left-6 sm:top-6">
                <ArrowLeft size={15} />
                Back to home
            </Link>

            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-28 -top-40 size-[28rem] rounded-full bg-blue-200/35 blur-3xl" />
                <div className="absolute -bottom-48 -right-28 size-[34rem] rounded-full bg-sky-200/40 blur-3xl" />
            </div>

            <section className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_30px_100px_rgba(15,42,75,0.12)] sm:rounded-[32px]">
                <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
                    <div className="relative flex min-h-[250px] flex-col justify-between overflow-hidden bg-gradient-to-r from-[#0877D9] via-[#1491FF] to-[#0877D9] p-7 text-white sm:min-h-[300px] sm:p-10 lg:min-h-[560px] lg:p-12">
                        <div aria-hidden="true" className="absolute -right-16 -top-16 size-72 rounded-full border border-white/10" />
                        <div aria-hidden="true" className="absolute -bottom-36 -left-20 size-80 rounded-full border border-white/10" />

                        <Link href="/" className="relative inline-flex w-fit items-center gap-3" aria-label="KARMASS home">
                            <span className="grid size-11 place-items-center rounded-2xl bg-white text-base font-black tracking-[-0.08em] text-[#0B5CAD] shadow-lg shadow-black/10">K.</span>
                            <span className="text-sm font-bold tracking-[0.2em]">KARMASS</span>
                        </Link>

                        <div className="relative mt-10 max-w-md lg:mt-0">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-blue-100">
                                <CarFront size={14} /> Your next drive starts here
                            </span>
                            <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl lg:text-[42px]">
                                Find your way back to the road.
                            </h1>
                            <p className="mt-3 max-w-sm text-sm leading-6 text-blue-100/80">
                                Sign in to continue, or create an account to discover vehicles and connect with sellers.
                            </p>
                        </div>

                        <p className="relative mt-8 text-xs text-blue-100/60 lg:mt-0">A better way to find your next car.</p>
                    </div>

                    <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
                        <div className="max-w-md">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0B5CAD]">Welcome to KARMASS</p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">How would you like to continue?</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-500">Choose an option. It only takes a moment.</p>

                            <div className="mt-8 space-y-3">
                                <PublicAccountLink href="/login" className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#0B5CAD]/40 hover:bg-blue-50/50 hover:shadow-md sm:p-5">
                                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#0B5CAD] transition group-hover:bg-[#0B5CAD] group-hover:text-white"><LogIn size={21} /></span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-bold text-slate-900">Log in</span>
                                        <span className="mt-1 block text-xs leading-5 text-slate-500">Continue with your existing account</span>
                                    </span>
                                    <ArrowRight size={18} className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#0B5CAD]" />
                                </PublicAccountLink>

                                <Link href="/register" className="group flex items-center gap-4 rounded-2xl border border-[#0877D9] bg-gradient-to-r from-[#0877D9] via-[#1491FF] to-[#0877D9] p-4 text-white shadow-lg shadow-blue-900/15 transition hover:brightness-95 sm:p-5">
                                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/10 text-white"><UserRoundPlus size={21} /></span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-bold">Create an account</span>
                                        <span className="mt-1 block text-xs leading-5 text-blue-100">Join KARMASS and start exploring</span>
                                    </span>
                                    <ArrowRight size={18} className="shrink-0 transition group-hover:translate-x-1" />
                                </Link>
                            </div>

                            <div className="mt-7 flex items-center gap-2.5 border-t border-slate-100 pt-5 text-xs text-slate-500">
                                <ShieldCheck size={16} className="shrink-0 text-emerald-600" />
                                <span>Your account helps keep your conversations and saved vehicles in one place.</span>
                            </div>

                            <Link href="/marketplace" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-[#0B5CAD]">
                                <Check size={14} /> Browse the marketplace without an account
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
