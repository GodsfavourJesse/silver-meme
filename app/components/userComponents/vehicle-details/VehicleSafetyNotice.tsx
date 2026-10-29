import { AlertTriangle } from "lucide-react";

export function VehicleSafetyNotice() {
    return (
        <section className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:mt-14 sm:rounded-3xl sm:p-7">
            <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-900">
                    <AlertTriangle size={22} />
                </span>

                <div>
                    <h2 className="text-base font-bold text-amber-950 sm:text-lg">
                        Buy safely on KARMASS
                    </h2>

                    <div className="mt-3 grid gap-3 text-sm leading-6 text-amber-950/85 md:grid-cols-2">
                        <p>
                            <strong>Inspect before you pay.</strong> Arrange an
                            in-person inspection and independently verify the
                            vehicle, ownership documents, and identity of the
                            seller.
                        </p>

                        <p>
                            <strong>Do not send money before verification.</strong>{" "}
                            Avoid advance payments or deposits until you have
                            verified the seller and vehicle through a process
                            you trust.
                        </p>

                        <p>
                            <strong>
                                Arrange an independent mechanical inspection.
                            </strong>{" "}
                            Have a qualified mechanic examine the vehicle before
                            you commit to a purchase.
                        </p>

                        <p>
                            <strong>KARMASS verification has limits.</strong> A
                            verified dealer badge is not an independent
                            mechanical inspection, proof of vehicle condition,
                            or a guarantee against fraud.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}