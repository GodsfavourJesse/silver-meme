import type { ReactNode } from "react";

import { X } from "lucide-react";

interface ModalShellProps {
    titleId: string;
    eyebrow: string;
    eyebrowClassName: string;
    title: string;
    description: string;
    closeLabel: string;
    onClose: () => void;
    children: ReactNode;
}

/**
 * Shared dialog chrome: backdrop, bottom sheet on mobile,
 * centered card on larger screens, and the header with close button.
 */
export function ModalShell({
    titleId,
    eyebrow,
    eyebrowClassName,
    title,
    description,
    closeLabel,
    onClose,
    children,
}: ModalShellProps) {
    return (
        <div
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
            className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p
                            className={`text-xs font-bold uppercase tracking-[0.16em] ${eyebrowClassName}`}
                        >
                            {eyebrow}
                        </p>

                        <h2
                            id={titleId}
                            className="mt-2 text-xl font-extrabold text-slate-950"
                        >
                            {title}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            {description}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={closeLabel}
                        className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                        <X size={19} />
                    </button>
                </div>

                {children}
            </section>
        </div>
    );
}