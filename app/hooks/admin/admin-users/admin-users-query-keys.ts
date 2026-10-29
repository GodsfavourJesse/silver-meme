import type {
    AdminUsersQuery,
} from "@/app/types/admin/admin-users.types";

export const adminUsersQueryKeys = {
    all: ["admin", "users"] as const,

    lists: () =>
        [...adminUsersQueryKeys.all, "list"] as const,

    list: (query: AdminUsersQuery) =>
        [...adminUsersQueryKeys.lists(), query] as const,

    stats: () =>
        [...adminUsersQueryKeys.all, "stats"] as const,

    details: () =>
        [...adminUsersQueryKeys.all, "detail"] as const,

    detail: (userId: string) =>
        [...adminUsersQueryKeys.details(), userId] as const,
};