"use client";

import { useState } from "react";
import { LifeBuoy, X } from "lucide-react";
import { SupportCenter } from "./SupportCenter";

export function PublicSupportWidget() {
    const [open, setOpen] = useState(false);
    return <>
        <button type="button" onClick={() => setOpen(true)} aria-label="Chat with KARMASS support" className="fixed bottom-7 left-7 z-40 hidden items-center gap-2 rounded-full bg-gradient-to-r from-[#0877D9] via-[#1491FF] to-[#0877D9] px-5 py-3.5 text-sm font-bold text-white shadow-[0_12px_40px_rgba(8,119,217,.35)] transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 md:inline-flex"><LifeBuoy size={19}/>Need help?</button>
        {open && <div className="fixed inset-0 z-[100] hidden items-center justify-center bg-slate-950/45 p-6 backdrop-blur-sm md:flex" role="dialog" aria-modal="true" aria-label="KARMASS support"><div className="relative max-h-[90vh] w-full max-w-5xl overflow-auto rounded-3xl bg-[#F4F7FB] shadow-2xl"><button type="button" onClick={() => setOpen(false)} aria-label="Close support" className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"><X size={19}/></button><SupportCenter compact/></div></div>}
    </>;
}
