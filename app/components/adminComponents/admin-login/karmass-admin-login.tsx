import { ShieldCheck } from "lucide-react";

interface KarmassAdminLogoProps {
    compact?: boolean;
    light?: boolean;
}

export function KarmassAdminLogo({
    compact = false,
    light = false,
}: KarmassAdminLogoProps) {
    return (
        <div
            className="inline-flex items-center gap-3"
            aria-label="KARMASS — Find your drive"
        >
            <div
                className={[
                    "flex size-12 shrink-0 items-center justify-center",
                    "rounded-xl border",
                    light
                        ? "border-white/25 bg-white text-[#1491FF]"
                        : "border-[#B9DEFF] bg-white text-[#1491FF]",
                ].join(" ")}
            >
                <span className="text-[27px] font-extrabold leading-none tracking-[-0.1em]">
                    K<span className="text-[#172033]">.</span>
                </span>
            </div>

            <div className="min-w-0">
                <p
                    className={[
                        "text-[21px] font-extrabold leading-none",
                        "tracking-[-0.065em]",
                        light ? "text-white" : "text-[#172033]",
                    ].join(" ")}
                >
                    KAR<span className="text-[#1491FF]">MASS</span>
                </p>

                {!compact && (
                    <p
                        className={[
                            "mt-1.5 text-[10px] font-medium",
                            "tracking-[0.14em]",
                            light
                                ? "text-white/70"
                                : "text-[#64748B]",
                        ].join(" ")}
                    >
                        FIND YOUR DRIVE
                    </p>
                )}
            </div>
        </div>
    );
}

export function KarmassAdminBrandLabel() {
    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-[#B9DEFF] bg-[#EAF5FF] px-3 py-1.5">
            <ShieldCheck
                size={14}
                strokeWidth={2}
                className="text-[#1491FF]"
            />

            <span className="text-[11px] font-semibold text-[#1766A8]">
                KARMASS Administration
            </span>
        </div>
    );
}