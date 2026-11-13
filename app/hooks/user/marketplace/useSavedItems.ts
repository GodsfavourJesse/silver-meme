"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createSavedSearch,
    deleteSavedSearch,
    getListingFavorites,
    getSavedSearches,
    removeListingFromFavorites,
    updateSavedSearch,
} from "@/app/services/user/marketplace/marketplace.service";
import { queryKeys } from "@/app/lib/query/query-keys";

export function useSavedSearches() {
    return useQuery({
        queryKey: queryKeys.savedItems.searches(),
        queryFn: ({ signal }) => getSavedSearches(signal),
    });
}

export function useListingFavorites(page = 1, limit = 24) {
    return useQuery({
        queryKey: queryKeys.savedItems.favorites(page, limit),
        queryFn: ({ signal }) => getListingFavorites({ page, limit }, signal),
    });
}

export function useSavedItemMutations() {
    const queryClient = useQueryClient();
    const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.savedItems.all });

    return {
        createSearch: useMutation({ mutationFn: createSavedSearch, onSuccess: refresh }),
        updateSearch: useMutation({ mutationFn: ({ id, name }: { id: string; name: string }) => updateSavedSearch(id, { name }), onSuccess: refresh }),
        deleteSearch: useMutation({ mutationFn: deleteSavedSearch, onSuccess: refresh }),
        removeFavorite: useMutation({ mutationFn: removeListingFromFavorites, onSuccess: refresh }),
    };
}
