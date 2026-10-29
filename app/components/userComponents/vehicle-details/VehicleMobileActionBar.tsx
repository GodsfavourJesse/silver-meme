import { Heart, MessageCircle } from "lucide-react";

interface VehicleMobileActionBarProps {
    favorite: boolean;
    favoriteLoading: boolean;
    onFavorite: () => void;
    onContact: () => void;
}

/**
 * Fixed mobile contact action.
 * Desktop uses the contact button in the listing summary.
 */
export function VehicleMobileActionBar({
    favorite,
    favoriteLoading,
    onFavorite,
    onContact,
}: VehicleMobileActionBarProps) {
    return (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur md:hidden">
            <div className="mx-auto flex max-w-[1440px] gap-3">
                <button
                    type="button"
                    onClick={onFavorite}
                    disabled={favoriteLoading}
                    aria-label={
                        favorite
                            ? "Remove from favourites"
                            : "Save to favourites"
                    }
                    className={`grid size-12 shrink-0 place-items-center rounded-xl border ${
                        favorite
                            ? "border-rose-200 bg-rose-50 text-rose-700"
                            : "border-slate-200 bg-white text-slate-700"
                    }`}
                >
                    <Heart size={20} fill={favorite ? "currentColor" : "none"} />
                </button>

                <button
                    type="button"
                    onClick={onContact}
                    className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 text-sm font-bold text-white"
                >
                    <MessageCircle size={18} />
                    Contact seller
                </button>
            </div>
        </div>
    );
}