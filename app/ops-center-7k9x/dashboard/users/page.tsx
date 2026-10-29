"use client";

import {
    useMemo,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import type {
    AdminUser,
    AdminUserSort,
    AdminUserStats,
    AdminUserStatusFilter,
    AdminUserTypeFilter,
    AdminUsersQuery,
} from "@/app/types/admin/admin-users.types";

import { useAdminUsers } from "@/app/hooks/admin/admin-users/useAdminUsers";
import { useAdminUserStats } from "@/app/hooks/admin/admin-users/useAdminUserStats";
import AdminUsersDesktop from "@/app/components/adminComponents/admin-users/AdminUsersDesktop";
import AdminUsersMobile from "@/app/components/adminComponents/admin-users/AdminUsersMobile";


// CONSTANTS
const PAGE_SIZE = 20;

// MAIN PAGE
export default function AdminUsersPage() {
    const router = useRouter();

    const [searchInput, setSearchInput] = useState("");

    const [filters, setFilters] = useState<AdminUsersQuery>({
        type: "ALL",
        status: "ALL",
        page: 1,
        limit: PAGE_SIZE,
        sort: "newest",
    });

    // QUERIES
     const query = useMemo<AdminUsersQuery>(
        () => ({
            ...filters,
            search: filters.search || undefined,
        }),
        [filters],
    );

    const usersQuery = useAdminUsers(query);
    const statsQuery = useAdminUserStats();

    const users: AdminUser[] = usersQuery.data?.items ?? [];

    const pagination = usersQuery.data?.pagination;

    const stats = statsQuery.data as AdminUserStats | undefined;

    const isInitialLoading =
        usersQuery.isPending && !usersQuery.data;

    const isInitialStatsLoading =
        statsQuery.isPending && !statsQuery.data;

    const hasFilters =
        Boolean(filters.search) ||
        filters.type !== "ALL" ||
        filters.status !== "ALL" ||
        filters.sort !== "newest";


    // NAVIGATION
    /**
     * Actual details route:
     *
     * /ops-center-7k9x/dashboard/users/[userId]
     */
    function openUserDetails(userId: string) {
        router.push(
            `/ops-center-7k9x/dashboard/users/${encodeURIComponent(userId)}`,
        );
    }

    // FILTER HANDLERS
    function updateFilter<K extends keyof AdminUsersQuery>(
        key: K,
        value: AdminUsersQuery[K],
    ) {
        setFilters((previous) => ({
            ...previous,
            [key]: value,
            page: 1,
        }));
    }

    function submitSearch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setFilters((previous) => ({
            ...previous,
            search: searchInput.trim() || undefined,
            page: 1,
        }));
    }

    function clearFilters() {
        setSearchInput("");

        setFilters({
            type: "ALL",
            status: "ALL",
            page: 1,
            limit: PAGE_SIZE,
            sort: "newest",
        });
    }

    // ========================================================
    // REFRESH
    // ========================================================

    function refreshData() {
        void usersQuery.refetch();
        void statsQuery.refetch();
    }

    // ========================================================
    // PAGINATION
    // ========================================================

    function changePage(page: number) {
        if (
            page < 1 ||
            page > (pagination?.totalPages ?? 1)
        ) {
            return;
        }

        updateFilter("page", page);
    }

    // ========================================================
    // SHARED PROPS
    // ========================================================

    const sharedProps = {
        users,
        filters,

        searchInput,
        setSearchInput,

        updateFilter: <
            K extends keyof AdminUsersQuery,
        >(
            key: K,
            value: AdminUsersQuery[K],
        ) => updateFilter(key, value),

        submitSearch,
        clearFilters,
        openUserDetails,
        refreshData,
        changePage,

        pagination,
        stats,

        isInitialLoading,
        isInitialStatsLoading,

        isFetching: usersQuery.isFetching,
        isStatsFetching: statsQuery.isFetching,

        isError: usersQuery.isError && !usersQuery.data,
        isStatsError: statsQuery.isError && !statsQuery.data,

        retryUsers: () => {
            void usersQuery.refetch();
        },

        retryStats: () => {
            void statsQuery.refetch();
        },

        hasFilters,
        hasData: users.length > 0,
    };

    // ========================================================
    // RESPONSIVE VIEWS
    // ========================================================

    return (
        <>
            <AdminUsersDesktop {...sharedProps} />

            <AdminUsersMobile {...sharedProps} />
        </>
    );
}