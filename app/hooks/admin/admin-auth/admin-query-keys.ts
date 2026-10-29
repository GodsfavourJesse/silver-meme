export const adminQueryKeys = {
    all: ["admin"] as const,

    auth: {
        all: ["admin", "auth"] as const,

        me: () => ["admin", "auth", "me"] as const,

        csrfToken: () => ["admin", "auth", "csrf-token"] as const,
    },

    dashboard: {
        all: ["admin", "dashboard"] as const,
    },
};