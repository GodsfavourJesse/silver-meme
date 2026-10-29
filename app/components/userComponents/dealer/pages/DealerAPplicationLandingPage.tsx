"use client";

import Link from "next/link";
import {
    motion,
    useReducedMotion,
    type Variants,
} from "framer-motion";

import {
    ArrowRight,
    ArrowUpRight,
    BadgeCheck,
    Building2,
    CarFront,
    CheckCircle2,
    ChevronRight,
    ClipboardCheck,
    FileCheck2,
    Handshake,
    Headset,
    KeyRound,
    ShieldCheck,
    Sparkles,
    Store,
    TrendingUp,
    Users,
    type LucideIcon,
} from "lucide-react";
import { CurrentYear } from "@/app/utils/current-year";

const BRAND = "#1491FF";
const BRAND_HOVER = "#0876D1";

interface DealerBenefit {
    icon: LucideIcon;
    title: string;
    description: string;
    number: string;
}

interface DealerStep {
    number: string;
    title: string;
    description: string;
    icon: LucideIcon;
}

const benefits: DealerBenefit[] = [
    {
        icon: Store,
        title: "Give your dealership a home",
        description:
            "Create a dedicated presence for your business and introduce your vehicle inventory to people searching for their next car.",
        number: "01",
    },
    {
        icon: Users,
        title: "Meet the right buyers",
        description:
            "Help potential buyers discover your dealership, explore your available vehicles, and learn more about your business.",
        number: "02",
    },
    {
        icon: ShieldCheck,
        title: "Build trust over time",
        description:
            "Submit the requested business documents and establish a more credible dealership presence on KARMASS.",
        number: "03",
    },
    {
        icon: TrendingUp,
        title: "Grow your presence",
        description:
            "Keep your business information organized, manage your vehicle listings, and build your marketplace presence at your own pace.",
        number: "04",
    },
];

const applicationSteps: DealerStep[] = [
    {
        number: "01",
        title: "Share your details",
        description:
            "Tell us about your dealership, business address, and the people behind your business.",
        icon: Building2,
    },
    {
        number: "02",
        title: "Upload your documents",
        description:
            "Provide the business documents requested as part of your application.",
        icon: FileCheck2,
    },
    {
        number: "03",
        title: "We review your application",
        description:
            "Your submitted information and documents can be reviewed by the appropriate team.",
        icon: ClipboardCheck,
    },
    {
        number: "04",
        title: "Get ready to list",
        description:
            "Once approved, continue setting up your dealership and managing your vehicle listings.",
        icon: CarFront,
    },
];

const trustFeatures = [
    {
        icon: ShieldCheck,
        title: "A professional presence",
        description:
            "Give buyers a clearer picture of your automotive business.",
    },
    {
        icon: FileCheck2,
        title: "Document-based review",
        description:
            "Submit the information needed to review your application.",
    },
    {
        icon: Headset,
        title: "Help along the way",
        description:
            "Reach out to support if you need assistance.",
    },
];

const containerVariants: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.09,
        },
    },
};

const fadeUpVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 18,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.48,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

/* =========================================================
   REUSABLE ANIMATED SECTION
========================================================= */

function AnimatedSection({
    children,
    className = "",
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.section
            initial={
                shouldReduceMotion
                    ? false
                    : {
                          opacity: 0,
                          y: 20,
                      }
            }
            whileInView={
                shouldReduceMotion
                    ? undefined
                    : {
                          opacity: 1,
                          y: 0,
                      }
            }
            viewport={{
                once: true,
                amount: 0.12,
            }}
            transition={{
                duration: shouldReduceMotion ? 0 : 0.5,
                delay: shouldReduceMotion ? 0 : delay,
                ease: [0.22, 1, 0.36, 1],
            }}
            className={className}
        >
            {children}
        </motion.section>
    );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
    eyebrow,
    title,
    description,
    centered = false,
}: {
    eyebrow: string;
    title: string;
    description: string;
    centered?: boolean;
}) {
    return (
        <div
            className={
                centered
                    ? "mx-auto max-w-2xl text-center"
                    : "max-w-2xl"
            }
        >
            <span
                className="
                    inline-flex items-center gap-2
                    text-[9px] font-bold uppercase
                    tracking-[0.16em] text-[#0876D1]
                    min-[375px]:text-[10px]
                    sm:tracking-[0.19em]
                "
            >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1491FF]" />
                {eyebrow}
            </span>

            <h2
                className="
                    mt-3 text-[25px] font-bold
                    leading-[1.16] tracking-[-0.045em]
                    text-[#172B45]
                    min-[375px]:text-[28px]
                    sm:mt-4 sm:text-3xl
                    lg:text-[38px]
                "
            >
                {title}
            </h2>

            <p
                className="
                    mt-3 text-[12px] leading-6
                    text-[#748399]
                    min-[375px]:text-[13px]
                    sm:mt-4 sm:text-sm sm:leading-7
                "
            >
                {description}
            </p>
        </div>
    );
}

/* =========================================================
   PRIMARY BUTTON
========================================================= */

function PrimaryButton({
    href,
    children,
    className = "",
}: {
    href: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <Link
            href={href}
            className={`
                group inline-flex min-h-12
                w-full items-center justify-center
                gap-2.5 rounded-2xl
                bg-white px-4 py-3
                text-center text-[12px] font-bold
                text-[#075EB8]
                shadow-[0_8px_22px_rgba(20,145,255,0.20)]
                transition-all duration-300
                hover:-translate-y-0.5
                hover:bg-[#0876D1]
                hover:shadow-[0_12px_28px_rgba(20,145,255,0.25)]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#1491FF]
                focus-visible:ring-offset-2
                active:translate-y-0
                sm:w-auto sm:px-5
                ${className}
            `}
        >
            <span>{children}</span>

            <ArrowRight
                size={16}
                className="
                    shrink-0 transition-transform duration-200
                    group-hover:translate-x-1
                "
            />
        </Link>
    );
}

/* =========================================================
   SECONDARY BUTTON
========================================================= */

function SecondaryButton({
    href,
    children,
    className = "",
}: {
    href: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <Link
            href={href}
            className={`
                inline-flex min-h-12 w-full
                items-center justify-center gap-2
                rounded-2xl border border-[#E0EAF5]
                bg-white px-4 py-3
                text-center text-[12px]
                font-semibold text-[#52647B]
                transition-all duration-200
                hover:border-[#B9DCFF]
                hover:bg-[#F3F9FF]
                hover:text-[#0876D1]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#1491FF]
                focus-visible:ring-offset-2
                sm:w-auto sm:px-5
                ${className}
            `}
        >
            {children}
        </Link>
    );
}

/* =========================================================
   HERO SECTION
========================================================= */

function DealerHero() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <section
            className="
                relative isolate overflow-hidden
                rounded-[26px]
                bg-gradient-to-br
                from-[#1491FF] via-[#087FE8] to-[#0754A8]
                text-white
                shadow-[0_20px_55px_rgba(20,104,190,0.16)]
                min-[375px]:rounded-[30px]
                sm:rounded-[34px]
            "
        >
            {/* Decorative background */}
            <div
                aria-hidden="true"
                className="
                    pointer-events-none absolute inset-0
                    overflow-hidden
                "
            >
                <div
                    className="
                        absolute -right-24 -top-32
                        h-[280px] w-[280px]
                        rounded-full border border-white/[0.13]
                        sm:h-[480px] sm:w-[480px]
                    "
                />

                <div
                    className="
                        absolute -right-10 -top-20
                        h-[200px] w-[200px]
                        rounded-full border border-white/[0.13]
                        sm:h-[360px] sm:w-[360px]
                    "
                />

                <div
                    className="
                        absolute -bottom-36 left-[30%]
                        h-72 w-72 rounded-full
                        bg-cyan-200/[0.12] blur-[90px]
                    "
                />

                <div
                    className="
                        absolute -bottom-24 -left-20
                        h-64 w-64 rounded-full
                        bg-blue-200/[0.12] blur-[80px]
                    "
                />

                <div className="absolute inset-0 opacity-[0.045]">
                    <div
                        className="
                            h-full w-full
                            bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)]
                            [background-size:24px_24px]
                        "
                    />
                </div>
            </div>

            <div
                className="
                    relative grid items-center gap-8
                    px-4 py-7
                    min-[375px]:px-5 min-[375px]:py-8
                    sm:gap-9 sm:px-8 sm:py-10
                    lg:grid-cols-[minmax(0,1fr)_300px]
                    lg:px-10 lg:py-12
                    xl:px-12 xl:py-14
                "
            >
                {/* Hero text */}
                <motion.div
                    initial={
                        shouldReduceMotion
                            ? false
                            : {
                                  opacity: 0,
                                  y: 18,
                              }
                    }
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: shouldReduceMotion ? 0 : 0.6,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    className="relative z-10 min-w-0"
                >
                    <span
                        className="
                            inline-flex max-w-full
                            items-center gap-2
                            rounded-full border border-white/20
                            bg-white/[0.11] px-3 py-2
                            text-[9px] font-bold uppercase
                            tracking-[0.12em] text-white/95
                            backdrop-blur-md
                            min-[375px]:tracking-[0.16em]
                            sm:text-[10px]
                        "
                    >
                        <Sparkles size={13} className="shrink-0" />
                        KARMASS Dealer Hub
                    </span>

                    <h1
                        className="
                            mt-5 text-[31px] font-bold
                            leading-[1.1] tracking-[-0.055em]
                            min-[375px]:text-[35px]
                            sm:mt-6 sm:max-w-2xl sm:text-4xl
                            lg:text-[48px]
                            xl:text-[54px]
                        "
                    >
                        Your dealership.
                        <br />

                        <span className="text-white/75">
                            A bigger opportunity.
                        </span>
                    </h1>

                    <p
                        className="
                            mt-4 max-w-xl
                            text-[12px] leading-6
                            text-white/80
                            min-[375px]:text-[13px]
                            sm:mt-5 sm:text-sm sm:leading-8
                        "
                    >
                        Bring your automotive business to KARMASS.
                        Showcase your vehicles, help buyers discover
                        your dealership, and build your presence in
                        a marketplace made for cars.
                    </p>

                    <div
                        className="
                            mt-6 flex flex-col gap-3
                            sm:mt-7 sm:flex-row sm:flex-wrap
                        "
                    >
                        <PrimaryButton
                            href="/dashboard/dealer/apply"
                            className="
                                border border-white/20
                                bg-white
                                shadow-none
                                hover:bg-[#F1F8FF]
                                sm:w-auto
                            "
                        >
                            Start dealer application
                        </PrimaryButton>

                        <SecondaryButton
                            href="/dashboard/my-listings"
                            className="
                                border-white/25
                                bg-white/[0.08]
                                text-white
                                hover:border-white/40
                                hover:bg-white/[0.15]
                                hover:text-white
                                sm:w-auto
                            "
                        >
                            <CarFront size={16} className="shrink-0" />
                            My listings
                        </SecondaryButton>

                        <SecondaryButton
                            href="/dashboard/dealer/applications"
                            className="
                                border-white/25
                                bg-white/[0.08]
                                text-white
                                hover:border-white/40
                                hover:bg-white/[0.15]
                                hover:text-white
                                sm:w-auto
                            "
                        >
                            <ClipboardCheck size={16} className="shrink-0" />
                            Application history
                        </SecondaryButton>
                    </div>

                    <div
                        className="
                            mt-6 flex flex-col gap-3
                            text-[10px] font-medium
                            text-white/80
                            min-[375px]:flex-row min-[375px]:flex-wrap
                            min-[375px]:gap-x-5
                            sm:mt-7 sm:text-[11px]
                        "
                    >
                        <span className="inline-flex items-center gap-2">
                            <CheckCircle2
                                size={15}
                                className="shrink-0 text-cyan-200"
                            />
                            Straightforward application
                        </span>

                        <span className="inline-flex items-center gap-2">
                            <CheckCircle2
                                size={15}
                                className="shrink-0 text-cyan-200"
                            />
                            Application tracking
                        </span>
                    </div>
                </motion.div>

                {/* Desktop hero visual */}
                <motion.div
                    initial={
                        shouldReduceMotion
                            ? false
                            : {
                                  opacity: 0,
                                  scale: 0.94,
                                  x: 12,
                              }
                    }
                    animate={{
                        opacity: 1,
                        scale: 1,
                        x: 0,
                    }}
                    transition={{
                        duration: shouldReduceMotion ? 0 : 0.7,
                        delay: shouldReduceMotion ? 0 : 0.1,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    className="
                        relative mx-auto hidden
                        h-[290px] w-full max-w-[300px]
                        items-center justify-center
                        lg:flex
                    "
                >
                    <motion.div
                        animate={
                            shouldReduceMotion
                                ? undefined
                                : {
                                      y: [0, -8, 0],
                                  }
                        }
                        transition={{
                            duration: 5,
                            repeat: shouldReduceMotion ? 0 : Infinity,
                            ease: "easeInOut",
                        }}
                        className="
                            relative flex h-[220px] w-[220px]
                            items-center justify-center
                            rounded-full border border-white/20
                            bg-white/[0.06]
                            shadow-[0_0_90px_rgba(255,255,255,0.08)]
                            backdrop-blur-sm
                        "
                    >
                        <div
                            className="
                                absolute inset-5 rounded-full
                                border border-dashed border-white/20
                            "
                        />

                        <div
                            className="
                                relative flex h-32 w-32
                                items-center justify-center
                                rounded-[32px] bg-white
                                text-[#1491FF]
                                shadow-[0_18px_45px_rgba(0,35,80,0.22)]
                            "
                        >
                            <Building2 size={57} strokeWidth={1.35} />
                        </div>

                        <div
                            className="
                                absolute -right-4 top-6
                                flex h-12 w-12 items-center
                                justify-center rounded-2xl
                                border border-white/20
                                bg-white/[0.12] text-white
                                backdrop-blur-xl
                            "
                        >
                            <BadgeCheck size={24} />
                        </div>

                        <div
                            className="
                                absolute -bottom-2 -left-5
                                flex h-12 w-12 items-center
                                justify-center rounded-2xl
                                border border-white/20
                                bg-white/[0.12] text-white
                                backdrop-blur-xl
                            "
                        >
                            <CarFront size={24} />
                        </div>
                    </motion.div>

                    <div
                        className="
                            absolute bottom-0 right-0
                            rounded-2xl border border-white/20
                            bg-white/[0.12] px-4 py-3
                            shadow-lg backdrop-blur-xl
                        "
                    >
                        <p
                            className="
                                text-[9px] font-semibold
                                uppercase tracking-[0.15em]
                                text-white/75
                            "
                        >
                            Your next chapter
                        </p>

                        <p className="mt-1 text-xs font-bold">
                            Starts here
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

/* =========================================================
   INTRODUCTION
========================================================= */

function DealerIntroduction() {
    return (
        <AnimatedSection
            className="
                grid gap-5
                lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)]
                lg:items-center lg:gap-8
                xl:gap-12
            "
        >
            <div>
                <SectionHeading
                    eyebrow="A PLACE FOR YOUR BUSINESS"
                    title="Take your dealership beyond the showroom."
                    description="
                        Your next customer could be searching online
                        right now. KARMASS gives your automotive business
                        a place to showcase its presence in a marketplace
                        focused on discovering and listing vehicles.
                    "
                />
            </div>

            <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25 }}
                className="
                    rounded-[23px] border border-[#E5EDF6]
                    bg-white p-5
                    shadow-[0_5px_20px_rgba(20,55,90,0.025)]
                    min-[375px]:rounded-[26px]
                    sm:p-6
                "
            >
                <div
                    className="
                        flex h-11 w-11 items-center
                        justify-center rounded-2xl
                        bg-[#EAF5FF] text-[#0876D1]
                    "
                >
                    <Handshake size={23} />
                </div>

                <h3
                    className="
                        mt-4 text-base font-bold
                        tracking-[-0.035em] text-[#172B45]
                    "
                >
                    Business starts with connection
                </h3>

                <p
                    className="
                        mt-2 text-[12px] leading-6
                        text-[#748399]
                        min-[375px]:text-[13px]
                    "
                >
                    Give potential buyers a chance to learn about
                    your dealership, browse your available vehicles,
                    and take the next step toward contacting you.
                </p>

                <Link
                    href="/marketplace"
                    className="
                        mt-4 inline-flex min-h-10
                        items-center gap-2
                        text-[11px] font-bold
                        text-[#0876D1] transition
                        hover:gap-3
                    "
                >
                    Explore the marketplace
                    <ArrowUpRight size={15} />
                </Link>
            </motion.div>
        </AnimatedSection>
    );
}

/* =========================================================
   DEALER BENEFITS
========================================================= */

function DealerBenefits() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <AnimatedSection>
            <SectionHeading
                eyebrow="WHY JOIN KARMASS"
                title="Make more room for your business to grow."
                description="
                    Build a dealership experience that brings your
                    business information, vehicle listings, and
                    potential buyers closer together.
                "
            />

            <motion.div
                variants={containerVariants}
                initial={shouldReduceMotion ? false : "hidden"}
                whileInView={shouldReduceMotion ? undefined : "visible"}
                viewport={{
                    once: true,
                    amount: 0.12,
                }}
                className="
                    mt-6 grid grid-cols-1 gap-3
                    min-[375px]:gap-4
                    sm:mt-7 sm:grid-cols-2
                    xl:grid-cols-4
                "
            >
                {benefits.map((benefit) => {
                    const Icon = benefit.icon;

                    return (
                        <motion.article
                            key={benefit.number}
                            variants={
                                shouldReduceMotion
                                    ? undefined
                                    : fadeUpVariants
                            }
                            whileHover={
                                shouldReduceMotion
                                    ? undefined
                                    : {
                                          y: -4,
                                      }
                            }
                            transition={{
                                duration: 0.22,
                            }}
                            className="
                                group relative overflow-hidden
                                rounded-[21px] border
                                border-[#E6EDF5] bg-white
                                p-4 transition-colors duration-300
                                hover:border-[#B9DCFF]
                                hover:shadow-[0_14px_35px_rgba(20,100,180,0.06)]
                                min-[375px]:rounded-[24px]
                                min-[375px]:p-5
                                sm:p-6
                            "
                        >
                            <div
                                className="
                                    flex items-center
                                    justify-between gap-3
                                "
                            >
                                <div
                                    className="
                                        flex h-11 w-11
                                        items-center justify-center
                                        rounded-[15px] bg-[#EAF5FF]
                                        text-[#0876D1]
                                        transition-transform duration-300
                                        group-hover:scale-105
                                    "
                                >
                                    <Icon size={22} strokeWidth={1.8} />
                                </div>

                                <span
                                    className="
                                        text-[10px] font-bold
                                        tracking-[0.15em] text-[#A3B3C6]
                                    "
                                >
                                    {benefit.number}
                                </span>
                            </div>

                            <h3
                                className="
                                    mt-5 text-[14px] font-bold
                                    leading-6 tracking-[-0.025em]
                                    text-[#172B45]
                                    transition-colors
                                    group-hover:text-[#0876D1]
                                    sm:mt-6 sm:text-[15px]
                                "
                            >
                                {benefit.title}
                            </h3>

                            <p
                                className="
                                    mt-2 text-[12px] leading-6
                                    text-[#748399]
                                "
                            >
                                {benefit.description}
                            </p>

                            <div
                                className="
                                    mt-5 h-1 w-8 rounded-full
                                    bg-[#D6EAFF]
                                    transition-all duration-300
                                    group-hover:w-14
                                    group-hover:bg-[#1491FF]
                                "
                            />
                        </motion.article>
                    );
                })}
            </motion.div>
        </AnimatedSection>
    );
}

/* =========================================================
   APPLICATION JOURNEY
========================================================= */

function ApplicationJourney() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <AnimatedSection
            className="
                relative overflow-hidden
                rounded-[24px] border border-[#E5EDF6]
                bg-white p-4
                min-[375px]:rounded-[28px]
                min-[375px]:p-5
                sm:p-8 lg:p-10
            "
        >
            <div
                aria-hidden="true"
                className="
                    pointer-events-none absolute
                    -right-20 -top-24
                    h-64 w-64 rounded-full
                    bg-[#1491FF]/[0.045] blur-3xl
                "
            />

            <div className="relative">
                <SectionHeading
                    eyebrow="YOUR APPLICATION JOURNEY"
                    title="Four steps to get started."
                    description="
                        We have kept the journey straightforward.
                        Start with your business information, submit
                        your documents, and follow your application
                        through the review process.
                    "
                />

                <div
                    className="
                        relative mt-7 grid grid-cols-1
                        gap-6 sm:mt-8 sm:grid-cols-2
                        sm:gap-7 xl:grid-cols-4 xl:gap-5
                    "
                >
                    <div
                        aria-hidden="true"
                        className="
                            absolute left-[8%] right-[8%] top-7
                            hidden h-px bg-[#D8EAFE]
                            xl:block
                        "
                    />

                    {applicationSteps.map((step, index) => {
                        const Icon = step.icon;

                        return (
                            <motion.div
                                key={step.number}
                                initial={
                                    shouldReduceMotion
                                        ? false
                                        : {
                                              opacity: 0,
                                              y: 16,
                                          }
                                }
                                whileInView={
                                    shouldReduceMotion
                                        ? undefined
                                        : {
                                              opacity: 1,
                                              y: 0,
                                          }
                                }
                                viewport={{
                                    once: true,
                                    amount: 0.2,
                                }}
                                transition={{
                                    duration: shouldReduceMotion ? 0 : 0.42,
                                    delay: shouldReduceMotion
                                        ? 0
                                        : index * 0.08,
                                }}
                                className="relative min-w-0"
                            >
                                <div
                                    className="
                                        relative z-10 flex
                                        items-center gap-3
                                        xl:flex-col xl:items-start
                                    "
                                >
                                    <div
                                        className="
                                            flex h-12 w-12 shrink-0
                                            items-center justify-center
                                            rounded-[16px] border
                                            border-[#D7E9FC]
                                            bg-[#F0F8FF]
                                            text-[#0876D1]
                                            sm:h-14 sm:w-14
                                            sm:rounded-[18px]
                                        "
                                    >
                                        <Icon
                                            size={23}
                                            strokeWidth={1.7}
                                        />
                                    </div>

                                    <span
                                        className="
                                            text-[10px] font-bold
                                            uppercase tracking-[0.16em]
                                            text-[#91A3B9]
                                        "
                                    >
                                        STEP {step.number}
                                    </span>
                                </div>

                                <h3
                                    className="
                                        mt-3 text-[13px] font-bold
                                        leading-5 text-[#172B45]
                                        sm:mt-4 sm:text-[14px]
                                    "
                                >
                                    {step.title}
                                </h3>

                                <p
                                    className="
                                        mt-2 text-[12px] leading-6
                                        text-[#748399]
                                    "
                                >
                                    {step.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

                <div
                    className="
                        mt-7 flex flex-col gap-4
                        border-t border-[#EDF2F8] pt-5
                        sm:mt-8 sm:flex-row
                        sm:items-center sm:justify-between
                        sm:pt-6
                    "
                >
                    <div>
                        <p className="text-sm font-bold text-[#172B45]">
                            Ready when you are.
                        </p>

                        <p
                            className="
                                mt-1 text-[11px] leading-5
                                text-[#8292A7]
                            "
                        >
                            Start your application whenever you are ready.
                        </p>
                    </div>

                    <PrimaryButton href="/dashboard/dealer">
                        Begin your application
                    </PrimaryButton>
                </div>
            </div>
        </AnimatedSection>
    );
}

/* =========================================================
   REQUIREMENTS
========================================================= */

function DealerRequirements() {
    const shouldReduceMotion = useReducedMotion();

    const requirements = [
        "Accurate business information",
        "A valid business address",
        "The documents requested during application",
        "Access to your account to track your application",
    ];

    return (
        <AnimatedSection>
            <div
                className="
                    grid items-center gap-6
                    sm:gap-8 lg:grid-cols-2 lg:gap-12
                "
            >
                <div className="min-w-0">
                    <SectionHeading
                        eyebrow="BEFORE YOU APPLY"
                        title="A little preparation goes a long way."
                        description="
                            Having your business information ready
                            can make the application process easier.
                            Take a moment to gather the details and
                            documents you may need.
                        "
                    />

                    <motion.ul
                        initial={shouldReduceMotion ? false : "hidden"}
                        whileInView={
                            shouldReduceMotion ? undefined : "visible"
                        }
                        variants={containerVariants}
                        viewport={{
                            once: true,
                            amount: 0.15,
                        }}
                        className="mt-5 space-y-3 sm:mt-6 sm:space-y-4"
                    >
                        {requirements.map((requirement) => (
                            <motion.li
                                key={requirement}
                                variants={
                                    shouldReduceMotion
                                        ? undefined
                                        : fadeUpVariants
                                }
                                className="flex items-start gap-3"
                            >
                                <span
                                    className="
                                        mt-0.5 flex h-5 w-5
                                        shrink-0 items-center justify-center
                                        rounded-full bg-[#E4F2FF]
                                        text-[#0876D1]
                                    "
                                >
                                    <CheckCircle2 size={13} />
                                </span>

                                <span
                                    className="
                                        text-[12px] leading-6
                                        text-[#62758D]
                                        sm:text-[13px]
                                    "
                                >
                                    {requirement}
                                </span>
                            </motion.li>
                        ))}
                    </motion.ul>

                    <div
                        className="
                            mt-6 flex flex-col gap-3
                            sm:mt-7 sm:flex-row sm:flex-wrap
                        "
                    >
                        <PrimaryButton href="/dealer-registration">
                            Apply as a dealer
                        </PrimaryButton>

                        <SecondaryButton href="/support">
                            <Headset size={15} className="shrink-0" />
                            Get assistance
                        </SecondaryButton>
                    </div>
                </div>

                <motion.div
                    initial={
                        shouldReduceMotion
                            ? false
                            : {
                                  opacity: 0,
                                  x: 16,
                              }
                    }
                    whileInView={
                        shouldReduceMotion
                            ? undefined
                            : {
                                  opacity: 1,
                                  x: 0,
                              }
                    }
                    viewport={{
                        once: true,
                        amount: 0.15,
                    }}
                    whileHover={
                        shouldReduceMotion
                            ? undefined
                            : {
                                  scale: 1.01,
                              }
                    }
                    transition={{
                        duration: shouldReduceMotion ? 0 : 0.45,
                    }}
                    className="
                        relative overflow-hidden
                        rounded-[24px]
                        bg-gradient-to-br
                        from-[#EAF5FF] via-[#F7FBFF] to-[#E2F1FF]
                        p-5
                        min-[375px]:rounded-[28px]
                        min-[375px]:p-6
                        sm:p-8
                    "
                >
                    <div
                        aria-hidden="true"
                        className="
                            absolute -right-12 -top-12
                            h-44 w-44 rounded-full
                            border border-[#1491FF]/[0.12]
                        "
                    />

                    <div
                        aria-hidden="true"
                        className="
                            absolute -right-3 -top-3
                            h-28 w-28 rounded-full
                            border border-[#1491FF]/[0.12]
                        "
                    />

                    <div className="relative">
                        <div
                            className="
                                flex h-12 w-12 items-center
                                justify-center rounded-[17px]
                                bg-white text-[#0876D1]
                                shadow-[0_8px_24px_rgba(20,100,180,0.08)]
                                sm:h-14 sm:w-14 sm:rounded-[19px]
                            "
                        >
                            <ShieldCheck size={27} />
                        </div>

                        <span
                            className="
                                mt-5 inline-flex items-center gap-2
                                text-[9px] font-bold uppercase
                                tracking-[0.15em] text-[#0876D1]
                                min-[375px]:text-[10px]
                                sm:mt-6 sm:tracking-[0.17em]
                            "
                        >
                            <Sparkles size={13} />
                            A thoughtful start
                        </span>

                        <h3
                            className="
                                mt-3 max-w-sm text-[23px]
                                font-bold leading-tight
                                tracking-[-0.045em] text-[#172B45]
                                min-[375px]:text-2xl sm:text-3xl
                            "
                        >
                            Put your business forward with confidence.
                        </h3>

                        <p
                            className="
                                mt-3 max-w-md text-[12px]
                                leading-6 text-[#6E8199]
                                sm:text-[13px] sm:leading-7
                            "
                        >
                            Take the first step toward establishing
                            your dealership on KARMASS. Submit your
                            information and follow your application
                            through the review process.
                        </p>

                        <div
                            className="
                                mt-5 flex items-center gap-3
                                rounded-2xl border border-white/90
                                bg-white/80 p-3
                                min-[375px]:p-4 sm:mt-6
                            "
                        >
                            <div
                                className="
                                    flex h-10 w-10 shrink-0
                                    items-center justify-center
                                    rounded-xl bg-[#E4F2FF]
                                    text-[#0876D1]
                                "
                            >
                                <KeyRound size={19} />
                            </div>

                            <div className="min-w-0">
                                <p
                                    className="
                                        text-[11px] font-bold
                                        text-[#172B45]
                                    "
                                >
                                    Your account, your journey
                                </p>

                                <p
                                    className="
                                        mt-1 text-[10px] leading-5
                                        text-[#8292A7]
                                    "
                                >
                                    Start at a pace that works for you.
                                </p>
                            </div>

                            <ChevronRight
                                size={17}
                                className="ml-auto shrink-0 text-[#9DAFC3]"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatedSection>
    );
}

/* =========================================================
   TRUST SECTION
========================================================= */

function DealerTrustSection() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <AnimatedSection>
            <div
                className="
                    rounded-[23px] border border-[#E5EDF6]
                    bg-white p-4
                    min-[375px]:rounded-[27px]
                    min-[375px]:p-5 sm:p-7
                "
            >
                <SectionHeading
                    eyebrow="THE KARMASS EXPERIENCE"
                    title="Designed around your next step."
                    description="
                        Start with the essentials and build your
                        dealership presence through the application
                        and vehicle listing experience.
                    "
                />

                <motion.div
                    initial={shouldReduceMotion ? false : "hidden"}
                    whileInView={
                        shouldReduceMotion ? undefined : "visible"
                    }
                    variants={containerVariants}
                    viewport={{
                        once: true,
                        amount: 0.15,
                    }}
                    className="
                        mt-6 grid grid-cols-1 gap-5
                        sm:mt-7 sm:grid-cols-3 sm:gap-6
                    "
                >
                    {trustFeatures.map((feature) => {
                        const Icon = feature.icon;

                        return (
                            <motion.div
                                key={feature.title}
                                variants={
                                    shouldReduceMotion
                                        ? undefined
                                        : fadeUpVariants
                                }
                                className="flex items-start gap-3"
                            >
                                <div
                                    className="
                                        flex h-10 w-10 shrink-0
                                        items-center justify-center
                                        rounded-[14px] bg-[#EAF5FF]
                                        text-[#0876D1]
                                    "
                                >
                                    <Icon size={19} />
                                </div>

                                <div className="min-w-0">
                                    <h3
                                        className="
                                            text-[12px] font-bold
                                            leading-5 text-[#172B45]
                                        "
                                    >
                                        {feature.title}
                                    </h3>

                                    <p
                                        className="
                                            mt-1.5 text-[11px]
                                            leading-5 text-[#8292A7]
                                        "
                                    >
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </AnimatedSection>
    );
}

/* =========================================================
   FINAL CALL TO ACTION
========================================================= */

function DealerFinalCTA() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <AnimatedSection>
            <div
                className="
                    relative isolate overflow-hidden
                    rounded-[24px]
                    bg-[#102B49]
                    px-4 py-7 text-white
                    min-[375px]:rounded-[28px]
                    min-[375px]:px-5 min-[375px]:py-8
                    sm:px-8 sm:py-10
                    lg:px-10 lg:py-12
                "
            >
                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none absolute
                        -right-20 -top-32 -z-10
                        h-80 w-80 rounded-full
                        bg-[#1491FF]/30 blur-[85px]
                    "
                />

                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none absolute
                        -bottom-24 left-1/4 -z-10
                        h-56 w-56 rounded-full
                        bg-sky-300/10 blur-[70px]
                    "
                />

                <div
                    className="
                        relative flex flex-col gap-6
                        lg:flex-row lg:items-center
                        lg:justify-between lg:gap-8
                    "
                >
                    <div className="max-w-2xl">
                        <span
                            className="
                                inline-flex items-center gap-2
                                text-[9px] font-bold uppercase
                                tracking-[0.15em] text-[#8BC9FF]
                                min-[375px]:text-[10px]
                                sm:tracking-[0.19em]
                            "
                        >
                            <Sparkles size={14} />
                            Your next chapter starts here
                        </span>

                        <h2
                            className="
                                mt-4 text-[25px] font-bold
                                leading-[1.15] tracking-[-0.05em]
                                min-[375px]:text-[28px]
                                sm:text-3xl lg:text-[38px]
                            "
                        >
                            Ready to bring your dealership to KARMASS?
                        </h2>

                        <p
                            className="
                                mt-3 max-w-xl text-[12px]
                                leading-6 text-white/70
                                sm:text-[13px] sm:leading-7
                            "
                        >
                            Tell us about your business, submit
                            your details, and take the next step
                            toward establishing your presence.
                        </p>
                    </div>

                    <motion.div
                        animate={
                            shouldReduceMotion
                                ? undefined
                                : {
                                      y: [0, -3, 0],
                                  }
                        }
                        transition={{
                            duration: 3.5,
                            repeat: shouldReduceMotion ? 0 : Infinity,
                            ease: "easeInOut",
                        }}
                        className="w-full shrink-0 sm:w-auto"
                    >
                        <PrimaryButton
                            href="/dashboard/dealer/apply"
                            className="
                                w-full border border-white/20
                                sm:w-auto
                            "
                        >
                            Start your application
                        </PrimaryButton>
                    </motion.div>
                </div>
            </div>
        </AnimatedSection>
    );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function DealerApplicationLandingPage() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <div
            className="
                min-h-screen overflow-x-clip
                bg-[#F6F9FD] text-[#172B45]
            "
        >
            {/* Ambient background */}
            <div
                aria-hidden="true"
                className="
                    pointer-events-none fixed inset-0
                    overflow-hidden
                "
            >
                <div
                    className="
                        absolute -right-40 -top-40
                        h-[440px] w-[440px]
                        rounded-full bg-[#1491FF]/[0.035]
                        blur-[110px]
                    "
                />

                <div
                    className="
                        absolute -left-40 top-[700px]
                        h-[400px] w-[400px]
                        rounded-full bg-sky-200/[0.12]
                        blur-[110px]
                    "
                />
            </div>

            <main
                className="
                    relative mx-auto w-full
                    max-w-[1500px]
                    px-3 pb-8 pt-4
                    min-[375px]:px-4
                    min-[375px]:pb-10 min-[375px]:pt-5
                    sm:px-6 sm:pb-12 sm:pt-7
                    lg:px-9 lg:pb-14
                    xl:px-12
                "
            >
                {/* Page header */}
                <motion.header
                    initial={
                        shouldReduceMotion
                            ? false
                            : {
                                  opacity: 0,
                                  y: -10,
                              }
                    }
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: shouldReduceMotion ? 0 : 0.42,
                    }}
                    className="
                        mb-5 flex items-center
                        justify-between gap-3
                        min-[375px]:mb-6
                        sm:mb-8 sm:gap-4
                    "
                >
                    <div className="min-w-0">
                        <div
                            className="
                                flex flex-wrap items-center
                                gap-1.5 text-[9px]
                                font-medium text-[#91A1B5]
                                min-[375px]:gap-2
                                min-[375px]:text-[10px]
                            "
                        >
                            <Link
                                href="/dashboard"
                                className="
                                    transition-colors
                                    hover:text-[#0876D1]
                                "
                            >
                                Dashboard
                            </Link>

                            <ChevronRight size={12} />

                            <span className="font-semibold text-[#0876D1]">
                                Dealership
                            </span>
                        </div>

                        <h2
                            className="
                                mt-2 text-[17px] font-bold
                                tracking-[-0.04em] text-[#172B45]
                                min-[375px]:text-lg sm:text-xl
                            "
                        >
                            Dealer Hub
                        </h2>
                    </div>

                    <Link
                        href="/support"
                        className="
                            inline-flex min-h-10 shrink-0
                            items-center gap-1.5 rounded-xl
                            border border-[#E0EAF5] bg-white
                            px-2.5 text-[10px] font-semibold
                            text-[#60748D] transition
                            hover:border-[#B9DCFF]
                            hover:text-[#0876D1]
                            min-[375px]:gap-2 min-[375px]:px-3
                            sm:px-4 sm:text-[11px]
                        "
                    >
                        <Headset size={15} className="shrink-0" />

                        <span className="hidden sm:inline">
                            Need help?
                        </span>

                        <span className="sm:hidden">
                            Help
                        </span>
                    </Link>
                </motion.header>

                {/* Page sections */}
                <div
                    className="
                        space-y-10
                        min-[375px]:space-y-12
                        sm:space-y-16
                        lg:space-y-20
                    "
                >
                    <DealerHero />

                    <DealerIntroduction />

                    <DealerBenefits />

                    <ApplicationJourney />

                    <DealerRequirements />

                    <DealerTrustSection />

                    <DealerFinalCTA />
                </div>

                {/* Footer */}
                <footer
                    className="
                        mt-8 flex flex-col gap-4
                        border-t border-[#E3EBF4]
                        pt-5
                        min-[375px]:mt-10
                        sm:mt-12 sm:flex-row
                        sm:items-center sm:justify-between
                    "
                >
                    <div>
                        <p
                            className="
                                text-[11px] font-bold
                                tracking-[-0.02em] text-[#526981]
                            "
                        >
                            KARMASS
                        </p>

                        <p
                            className="
                                mt-1 text-[10px]
                                leading-5 text-[#91A1B5]
                            "
                        >
                            Your automotive journey, thoughtfully connected.
                        </p>
                    </div>

                    <div
                        className="
                            flex flex-wrap items-center
                            gap-x-4 gap-y-3
                        "
                    >
                        <Link
                            href="/marketplace"
                            className="
                                text-[10px] font-medium
                                text-[#8292A7] transition
                                hover:text-[#0876D1]
                            "
                        >
                            Marketplace
                        </Link>

                        <Link
                            href="/support"
                            className="
                                text-[10px] font-medium
                                text-[#8292A7] transition
                                hover:text-[#0876D1]
                            "
                        >
                            Support
                        </Link>

                        <span
                            className="
                                text-[10px] text-[#91A1B5]
                            "
                        >
                            © <CurrentYear /> KARMASS
                        </span>
                    </div>
                </footer>
            </main>
        </div>
    );
}