export const queryKeys = {
    auth: {
        all: ["auth"] as const,

        currentUser: () =>
            [...queryKeys.auth.all, "current-user"] as const,
    },

    profile: {
        all: ["profile"] as const,

        details: () =>
            [...queryKeys.profile.all, "details"] as const,

        privacy: () =>
            [...queryKeys.profile.all, "privacy"] as const,
    },

    dealer: {
        analytics: () =>
            ["dealer", "analytics"] as const,

        documents: (applicationId: string) =>
            ["dealer", "documents", applicationId] as const,

        publicProfile: (dealerId: string) =>
            ["dealer", "public-profile", dealerId] as const,

        publicListings: (
            dealerId: string,
            page: number,
            limit: number,
        ) =>
            [
                "dealer",
                "public-listings",
                dealerId,
                page,
                limit,
            ] as const,

        publicDirectory: (
            search: string,
            page: number,
            limit: number,
        ) =>
            [
                "dealer",
                "public-directory",
                search,
                page,
                limit,
            ] as const,
    },
} as const;