"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, CarFront, ChevronLeft, ChevronRight, ExternalLink, Heart, MapPin, Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useListingFavorites, useSavedItemMutations, useSavedSearches } from "@/app/hooks/user/marketplace/useSavedItems";
import type { SavedSearchFilters } from "@/app/types/user/saved-items.types";

type SavedTab = "searches" | "favorites";

function formatPrice(value: string | number, currency: string) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "Price on request";
    try { return new Intl.NumberFormat("en-NG", { style: "currency", currency: currency || "NGN", maximumFractionDigits: 0 }).format(amount); }
    catch { return `${currency || "NGN"} ${amount.toLocaleString("en-NG")}`; }
}

function getSearchUrl(filters: SavedSearchFilters) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== "" && value !== false) params.set(key, String(value));
    }
    return params.size ? `/marketplace?${params.toString()}` : "/marketplace";
}

function describeFilters(filters: SavedSearchFilters) {
    const parts = [filters.q, filters.make, filters.model, filters.variant, filters.bodyStyle, filters.condition?.replaceAll("_", " "), filters.fuelType?.replaceAll("_", " "), filters.state, filters.city].filter(Boolean);
    const price = [filters.minPrice !== undefined ? `₦${filters.minPrice.toLocaleString("en-NG")}+` : "", filters.maxPrice !== undefined ? `up to ₦${filters.maxPrice.toLocaleString("en-NG")}` : ""].filter(Boolean).join(" ");
    if (price) parts.push(price);
    if (filters.minYear || filters.maxYear) parts.push([filters.minYear, filters.maxYear].filter(Boolean).join("–"));
    return parts.length ? parts : ["All marketplace vehicles"];
}

export function SavedItemsPageClient() {
    const [tab, setTab] = useState<SavedTab>("searches");
    const [favoritePage, setFavoritePage] = useState(1);
    const [editingId, setEditingId] = useState("");
    const [editingName, setEditingName] = useState("");
    const searchesQuery = useSavedSearches();
    const favoritesQuery = useListingFavorites(favoritePage);
    const { updateSearch, deleteSearch, removeFavorite } = useSavedItemMutations();
    const searches = searchesQuery.data?.data ?? [];
    const favorites = favoritesQuery.data?.data.items ?? [];

    async function deleteSearchById(id: string) {
        if (!window.confirm("Delete this saved search?")) return;
        try { await deleteSearch.mutateAsync(id); toast.success("Saved search deleted"); }
        catch (error) { toast.error(error instanceof Error ? error.message : "Unable to delete saved search."); }
    }

    async function removeFavoriteById(id: string) {
        if (!window.confirm("Remove this vehicle from your favorites?")) return;
        try { await removeFavorite.mutateAsync(id); toast.success("Vehicle removed from favorites"); }
        catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update favorites."); }
    }

    async function saveName(id: string) {
        const name = editingName.trim();
        if (!name) return;
        try { await updateSearch.mutateAsync({ id, name }); toast.success("Saved search renamed"); setEditingId(""); }
        catch (error) { toast.error(error instanceof Error ? error.message : "Unable to rename saved search."); }
    }

    const isLoading = tab === "searches" ? searchesQuery.isLoading : favoritesQuery.isLoading;
    const error = tab === "searches" ? searchesQuery.error : favoritesQuery.error;

    return <div className="min-h-screen bg-[#F4F7FB] text-slate-900">
        <main className="min-w-0 pb-0 xl:pb-10">
            <header className="border-b border-slate-200 bg-white px-4 py-5 sm:px-8 xl:px-10">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
                    <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0876D1]">Your garage</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Saved items</h1><p className="mt-1 text-sm text-slate-500">Pick up where you left off or revisit a search.</p></div>
                    <Link href="/marketplace" className="hidden items-center gap-2 rounded-lg bg-[#0876D1] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#075FA8] sm:inline-flex"><Search size={16} /> Browse cars</Link>
                </div>
            </header>
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8 xl:px-10">
                <div className="mb-6 inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm" role="tablist" aria-label="Saved items">
                    <button role="tab" aria-selected={tab === "searches"} onClick={() => setTab("searches")} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${tab === "searches" ? "bg-[#0876D1] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}><Bookmark size={16} /> Saved searches <span className={`rounded-full px-2 py-0.5 text-xs ${tab === "searches" ? "bg-white/20" : "bg-slate-100"}`}>{searches.length}</span></button>
                    <button role="tab" aria-selected={tab === "favorites"} onClick={() => setTab("favorites")} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${tab === "favorites" ? "bg-[#0876D1] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}><Heart size={16} /> Favorites <span className={`rounded-full px-2 py-0.5 text-xs ${tab === "favorites" ? "bg-white/20" : "bg-slate-100"}`}>{favoritesQuery.data?.data.pagination.total ?? favorites.length}</span></button>
                </div>

                {isLoading && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</div>}
                {!isLoading && error && <div role="alert" className="rounded-2xl border border-red-200 bg-white p-6 text-sm text-red-700">{error instanceof Error ? error.message : "Unable to load your saved items."}<button onClick={() => tab === "searches" ? void searchesQuery.refetch() : void favoritesQuery.refetch()} className="ml-3 font-semibold underline">Try again</button></div>}

                {!isLoading && !error && tab === "searches" && (searches.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{searches.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
                    <div className="flex items-start justify-between gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#0876D1]"><Bookmark size={19} /></span><div className="flex items-center gap-1"><button type="button" aria-label={`Rename ${item.name}`} onClick={() => { setEditingId(item.id); setEditingName(item.name); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Pencil size={16} /></button><button type="button" aria-label={`Delete ${item.name}`} onClick={() => void deleteSearchById(item.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button></div></div>
                    {editingId === item.id ? <div className="mt-4 flex gap-2"><input autoFocus maxLength={120} value={editingName} onChange={(event) => setEditingName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void saveName(item.id); if (event.key === "Escape") setEditingId(""); }} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" /><button type="button" onClick={() => void saveName(item.id)} disabled={updateSearch.isPending} className="rounded-lg bg-[#0876D1] px-3 text-xs font-semibold text-white">Save</button></div> : <h2 className="mt-4 truncate text-base font-bold text-slate-950">{item.name}</h2>}
                    <div className="mt-3 flex flex-wrap gap-1.5">{describeFilters(item.filters).slice(0, 5).map((part, index) => <span key={`${part}-${index}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">{part}</span>)}</div>
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-xs text-slate-400">Saved {new Date(item.createdAt).toLocaleDateString("en-NG")}</span><Link href={getSearchUrl(item.filters)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0876D1] hover:text-[#075FA8]">View results <ExternalLink size={14} /></Link></div>
                </article>)}</div> : <EmptySavedState icon="search" title="No saved searches yet" description="Search cars using the filters you care about, then save that search to find matching vehicles again." />)}

                {!isLoading && !error && tab === "favorites" && (favorites.length ? <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{favorites.map(({ listing, make, model, variant }) => {
                    const title = listing.title?.trim() || [make?.name, model?.name, variant?.year].filter(Boolean).join(" ") || "Vehicle listing";
                    return <article key={listing.id} className="flex min-h-52 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
                        <div className="flex items-start justify-between gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500"><CarFront size={20} /></span><button type="button" onClick={() => void removeFavoriteById(listing.id)} aria-label={`Remove ${title} from favorites`} className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50"><Heart size={18} fill="currentColor" /></button></div>
                        <Link href={`/marketplace/${listing.id}`} className="mt-4 line-clamp-2 text-base font-bold text-slate-950 hover:text-[#0876D1]">{title}</Link>
                        <p className="mt-2 text-lg font-extrabold tracking-tight text-slate-900">{formatPrice(listing.price, listing.currency)}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">{variant?.fuelType && <span>{variant.fuelType.replaceAll("_", " ")}</span>}{variant?.transmission && <span>· {variant.transmission}</span>}{listing.mileage != null && <span>· {listing.mileage.toLocaleString("en-NG")} km</span>}</div>
                        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4"><span className="flex min-w-0 items-center gap-1.5 truncate text-xs text-slate-500"><MapPin size={14} className="shrink-0 text-[#0876D1]" />{[listing.city, listing.state].filter(Boolean).join(", ") || "Location not specified"}</span><Link href={`/marketplace/${listing.id}`} className="shrink-0 text-sm font-semibold text-[#0876D1]">View car <ExternalLink size={13} className="ml-1 inline" /></Link></div>
                    </article>;
                })}</div>{(favoritesQuery.data?.data.pagination.totalPages ?? 0) > 1 && <div className="mt-6 flex items-center justify-center gap-3"><button type="button" disabled={!favoritesQuery.data?.data.pagination.hasPreviousPage} onClick={() => setFavoritePage((page) => Math.max(1, page - 1))} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"><ChevronLeft size={16} /> Previous</button><span className="text-sm text-slate-500">Page {favoritePage} of {favoritesQuery.data?.data.pagination.totalPages}</span><button type="button" disabled={!favoritesQuery.data?.data.pagination.hasNextPage} onClick={() => setFavoritePage((page) => page + 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40">Next <ChevronRight size={16} /></button></div>}</> : <EmptySavedState icon="heart" title="No favorite vehicles yet" description="Tap the heart on a vehicle you like and it will be waiting for you here." />)}
            </div>
        </main>
    </div>;
}

function EmptySavedState({ icon, title, description }: { icon: "search" | "heart"; title: string; description: string }) {
    const Icon = icon === "search" ? Search : Heart;
    return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50 text-[#0876D1]"><Icon size={25} /></span><h2 className="mt-4 text-lg font-bold text-slate-950">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p><Link href="/marketplace" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0876D1] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#075FA8]"><Search size={15} /> Explore vehicles</Link></div>;
}
