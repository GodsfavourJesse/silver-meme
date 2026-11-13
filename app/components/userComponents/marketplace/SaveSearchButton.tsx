"use client";

import { useMemo, useState, type FormEvent } from "react";
import { BookmarkPlus, X } from "lucide-react";
import { toast } from "sonner";
import { useSavedItemMutations } from "@/app/hooks/user/marketplace/useSavedItems";
import type { MarketplaceFilterState, SortOption } from "@/app/lib/user/marketplace/marketplace-search";
import type { SavedSearchFilters } from "@/app/types/user/saved-items.types";

interface SaveSearchButtonProps {
    query: string;
    filters: MarketplaceFilterState;
    sort: SortOption;
    compact?: boolean;
}

function numeric(value: string): number | undefined {
    if (!value.trim()) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

function makeFilters(query: string, filters: MarketplaceFilterState, sort: SortOption): SavedSearchFilters {
    return {
        ...(query.trim() ? { q: query.trim() } : {}),
        ...(filters.make.trim() ? { make: filters.make.trim() } : {}),
        ...(filters.model.trim() ? { model: filters.model.trim() } : {}),
        ...(filters.variant.trim() ? { variant: filters.variant.trim() } : {}),
        ...(numeric(filters.minPrice) !== undefined ? { minPrice: numeric(filters.minPrice) } : {}),
        ...(numeric(filters.maxPrice) !== undefined ? { maxPrice: numeric(filters.maxPrice) } : {}),
        ...(numeric(filters.minMileage) !== undefined ? { minMileage: numeric(filters.minMileage) } : {}),
        ...(numeric(filters.maxMileage) !== undefined ? { maxMileage: numeric(filters.maxMileage) } : {}),
        ...(numeric(filters.minYear) !== undefined ? { minYear: numeric(filters.minYear) } : {}),
        ...(numeric(filters.maxYear) !== undefined ? { maxYear: numeric(filters.maxYear) } : {}),
        ...(filters.condition ? { condition: filters.condition } : {}),
        ...(filters.fuelType ? { fuelType: filters.fuelType } : {}),
        ...(filters.transmission ? { transmission: filters.transmission } : {}),
        ...(filters.bodyStyle ? { bodyStyle: filters.bodyStyle } : {}),
        ...(filters.state.trim() ? { state: filters.state.trim() } : {}),
        ...(filters.city.trim() ? { city: filters.city.trim() } : {}),
        ...(filters.dealerOnly ? { dealerOnly: true } : {}),
        ...(filters.verifiedDealerOnly ? { verifiedDealerOnly: true } : {}),
        sort,
    };
}

export function SaveSearchButton({ query, filters, sort, compact = false }: SaveSearchButtonProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const { createSearch } = useSavedItemMutations();
    const savedFilters = useMemo(() => makeFilters(query, filters, sort), [query, filters, sort]);
    const suggestedName = query.trim() || [filters.make, filters.model, filters.bodyStyle, filters.state].filter(Boolean).join(" ") || "My car search";

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        createSearch.mutate({ name: trimmed, filters: savedFilters }, {
            onSuccess: () => {
                toast.success("Search saved");
                setOpen(false);
                setName("");
            },
            onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to save this search."),
        });
    }

    return <>
        <button type="button" aria-label="Save this search" onClick={() => { setName(suggestedName); setOpen(true); }} className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 ${compact ? "h-9 px-2.5 text-[11px]" : "h-9 px-3 text-xs"}`}>
            <BookmarkPlus size={compact ? 15 : 16} aria-hidden="true" />
            {compact ? "Save" : "Save search"}
        </button>
        {open && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
            <section role="dialog" aria-modal="true" aria-labelledby="save-search-title" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div><h2 id="save-search-title" className="text-lg font-bold text-slate-950">Save this search</h2><p className="mt-1 text-sm text-slate-500">Keep these filters handy for your next visit.</p></div>
                    <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
                </div>
                <form onSubmit={submit} className="mt-5">
                    <label htmlFor="saved-search-name" className="text-sm font-semibold text-slate-700">Search name</label>
                    <input id="saved-search-name" autoFocus maxLength={120} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. SUVs in Lagos" className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                    <div className="mt-5 flex justify-end gap-2">
                        <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
                        <button type="submit" disabled={!name.trim() || createSearch.isPending} className="rounded-lg bg-[#0876D1] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#075FA8] disabled:cursor-not-allowed disabled:opacity-60">{createSearch.isPending ? "Saving…" : "Save search"}</button>
                    </div>
                </form>
            </section>
        </div>}
    </>;
}
