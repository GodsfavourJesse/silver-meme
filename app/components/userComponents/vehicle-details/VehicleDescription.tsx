interface VehicleDescriptionProps {
    description: string | null | undefined;
    variant: "desktop" | "mobile";
}

const FALLBACK = "The seller has not provided a description for this vehicle.";

export function VehicleDescription({
    description,
    variant,
}: VehicleDescriptionProps) {
    const text = description?.trim() || FALLBACK;

    if (variant === "mobile") {
        return (
            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 sm:rounded-3xl sm:p-6 md:hidden">
                <h2 className="text-lg font-bold text-slate-950">
                    About this vehicle
                </h2>

                <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-slate-600">
                    {text}
                </p>
            </section>
        );
    }

    return (
        <section className="mt-8 hidden md:block">
            <h2 className="text-xl font-bold text-slate-950">
                About this vehicle
            </h2>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <p className="whitespace-pre-line break-words text-sm leading-7 text-slate-600">
                    {text}
                </p>
            </div>
        </section>
    );
}