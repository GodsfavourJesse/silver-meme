import type { ReactNode } from "react";

interface PanelProps {
    title: string;
    eyebrow?: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}

export function Panel({
    title,
    eyebrow,
    action,
    children,
    className = "",
}: PanelProps) {
    return (
        <section
            className={[
                "min-w-0 rounded-2xl border border-slate-200",
                "bg-white p-4 shadow-sm sm:p-5",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <div className="mb-5 flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                    {eyebrow && (
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1491FF] sm:text-[11px]">
                            {eyebrow}
                        </p>
                    )}

                    <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                        {title}
                    </h2>
                </div>

                {action && (
                    <div className="flex shrink-0 items-center gap-2">
                        {action}
                    </div>
                )}
            </div>

            <div className="min-w-0">{children}</div>
        </section>
    );
}