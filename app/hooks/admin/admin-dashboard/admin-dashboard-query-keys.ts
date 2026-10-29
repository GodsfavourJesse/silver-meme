export const adminDashboardKeys = {
    summary: () => ["admin", "dashboard", "summary"] as const,

    health: () => ["admin", "dashboard", "health"] as const,

    recentUsers: () => ["admin", "dashboard", "recent-users"] as const,

    notifications: () => ["admin", "notifications"] as const,
    
    session: () => ["admin", "session"] as const,
};